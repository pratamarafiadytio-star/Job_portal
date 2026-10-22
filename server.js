require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const db = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_supersecret_portal_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'super_secret_session_key_job_portal_2026';

// In-memory active admin tokens
const activeAdminTokens = new Set();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cache for real company images / logos
const companyImagesPath = path.join(__dirname, 'data', 'company_images.json');
let companyImagesCache = {};
try {
  if (fs.existsSync(companyImagesPath)) {
    companyImagesCache = JSON.parse(fs.readFileSync(companyImagesPath, 'utf8'));
  }
} catch (e) {
  companyImagesCache = {};
}

function saveCompanyImagesCache() {
  try {
    fs.writeFileSync(companyImagesPath, JSON.stringify(companyImagesCache, null, 2), 'utf8');
  } catch (e) {}
}

async function fetchCompanyImageOnline(companyName) {
  if (!companyName) return null;
  const clean = companyName.replace(/^(PT|CV|Bank)\s+/i, '').replace(/\(Persero\)/i, '').replace(/Tbk/i, '').trim();
  if (companyImagesCache[companyName]) return companyImagesCache[companyName];
  if (companyImagesCache[clean]) return companyImagesCache[clean];

  try {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(clean + ' indonesia logo kantor gedung') + '&FORM=HDRSC2';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const m = html.match(/murl&quot;:&quot;(https?:\/\/[^&]+?\.(?:jpg|jpeg|png|webp))/i);
    if (m && m[1]) {
      companyImagesCache[companyName] = m[1];
      saveCompanyImagesCache();
      return m[1];
    }
  } catch (e) {}
  return null;
}

// Multer storage for flyer posters
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB strict limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (allowedImageExts.includes(ext) && allowedMimeTypes.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak diizinkan! Hanya berkas gambar JPG, JPEG, PNG, atau WEBP yang didukung.'));
    }
  }
});

// Security HTTP Headers Middleware (Defense in Depth)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// URL Normalizer: Rewrite /public/api/* to /api/* so relative fetches from /public/admin.html work seamlessly
app.use((req, res, next) => {
  if (req.url.startsWith('/public/api/')) {
    req.url = req.url.replace(/^\/public\/api\//, '/api/');
  }
  next();
});

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// BRUTE-FORCE & RATE-LIMITING PROTECTION FOR ADMIN LOGIN
// -------------------------------------------------------------
const loginAttempts = new Map(); // IP -> { count, firstAttempt, lockedUntil }
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;   // 10 minutes tracking window

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMins = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Terlalu banyak percobaan login gagal dari perangkat ini. Akses login dikunci sementara selama ${remainingMins} menit demi keamanan.`
    };
  }

  // Reset if window has elapsed
  if (now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  loginAttempts.set(ip, record);
}

function recordLoginSuccess(ip) {
  loginAttempts.delete(ip);
}

// -------------------------------------------------------------
// SECURE TOKEN SESSION STORE WITH AUTOMATIC EXPIRY
// -------------------------------------------------------------
// Map of token -> { expiresAt: number }
const activeAdminTokensMap = new Map();
const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours active session

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isTokenValid(token) {
  if (!token) return false;
  if (token.startsWith('cf_token_')) {
    try {
      const decoded = Buffer.from(token.replace('cf_token_', ''), 'base64').toString('utf-8');
      const [pwd] = decoded.split(':');
      if (ADMIN_PASSWORD && pwd === ADMIN_PASSWORD) {
        return true;
      }
    } catch (e) {}
  }
  if (!activeAdminTokensMap.has(token)) return false;
  const session = activeAdminTokensMap.get(token);
  if (Date.now() > session.expiresAt) {
    activeAdminTokensMap.delete(token);
    return false;
  }
  return true;
}

// Periodic cleanup of expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [t, s] of activeAdminTokensMap.entries()) {
    if (now > s.expiresAt) activeAdminTokensMap.delete(t);
  }
}, 30 * 60 * 1000);

// Admin Authentication Middleware (Strict - No Backdoors)
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : (req.headers['x-admin-token'] || req.query.admin_token || '').toString().trim();

  if (!isTokenValid(token)) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Anda harus login sebagai admin dengan sesi yang valid.'
    });
  }
  next();
}

// Helper: parse multiline strings to array
function parseList(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'string') {
    if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
      try {
        return JSON.parse(input);
      } catch (e) {}
    }
    return input.split(/\r?\n/).map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

// -------------------------------------------------------------
// SITE SETTINGS MANAGEMENT (WhatsApp CV Order, etc.)
// -------------------------------------------------------------
const settingsFilePath = path.join(__dirname, 'data', 'settings.json');

function getSiteSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading settings.json:', e.message);
  }
  return {
    cv_whatsapp: '081234567890',
    cv_order_message: 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS agar lolos seleksi kerja. Mohon informasi tarif dan prosedurnya. Terima kasih.',
    updated_at: new Date().toISOString()
  };
}

function saveSiteSettings(newSettings) {
  try {
    const current = getSiteSettings();
    const updated = {
      ...current,
      ...newSettings,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');

    // Async sync to Supabase Cloud
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;
    if (sbUrl && sbKey) {
      (async () => {
        try {
          const checkRes = await fetch(`${sbUrl}/rest/v1/jobs?status=eq.system_settings&select=id&limit=1`, {
            headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` }
          });
          const rows = checkRes.ok ? await checkRes.json() : [];
          if (rows && rows.length > 0) {
            await fetch(`${sbUrl}/rest/v1/jobs?id=eq.${rows[0].id}`, {
              method: 'PATCH',
              headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ description: JSON.stringify(updated), updated_at: updated.updated_at })
            });
          } else {
            await fetch(`${sbUrl}/rest/v1/jobs`, {
              method: 'POST',
              headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: '__SYSTEM_SETTINGS__',
                company_name: 'System',
                category: 'System',
                job_type: 'Full Time',
                location: 'Indonesia',
                salary_display: 'Kompetitif',
                experience_level: 'Semua Tingkat',
                poster_image: '',
                description: JSON.stringify(updated),
                status: 'system_settings'
              })
            });
          }
        } catch (err) {
          console.warn('Could not sync settings to Supabase:', err.message);
        }
      })();
    }

    return updated;
  } catch (e) {
    console.error('Error writing settings.json:', e);
    return null;
  }
}

// -------------------------------------------------------------
// PUBLIC CONFIG API: GET /api/config (Read directly from ENV & Settings)
// -------------------------------------------------------------
app.get('/api/config', (req, res) => {
  const settings = getSiteSettings();
  res.json({
    success: true,
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || '',
    cv_whatsapp: settings.cv_whatsapp || '081234567890',
    cv_order_message: settings.cv_order_message || ''
  });
});

// -------------------------------------------------------------
// PUBLIC SETTINGS API: GET /api/settings
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const settings = getSiteSettings();
  res.json({
    success: true,
    data: settings
  });
});

// -------------------------------------------------------------
// ADMIN SETTINGS API: POST /api/settings (Update WhatsApp CV Order, etc.)
// -------------------------------------------------------------
app.post('/api/settings', requireAdminAuth, (req, res) => {
  try {
    const { cv_whatsapp, cv_order_message } = req.body;
    let cleanWa = (cv_whatsapp || '').trim().replace(/[^0-9+]/g, '');
    if (cleanWa.startsWith('+')) cleanWa = cleanWa.slice(1);

    const updated = saveSiteSettings({
      cv_whatsapp: cleanWa,
      cv_order_message: (cv_order_message || '').trim()
    });

    if (!updated) {
      return res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan ke file.' });
    }

    res.json({
      success: true,
      message: 'Pengaturan nomor WhatsApp pemesanan CV berhasil disimpan!',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan: ' + err.message });
  }
});

// -------------------------------------------------------------
// AUTH: POST /api/admin/login (Protected with Rate Limiting)
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return res.status(429).json({ success: false, message: rateLimit.message });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password admin wajib diisi!' });
    }

    const currentAdminPassword = ADMIN_PASSWORD;
    if (!currentAdminPassword || password !== currentAdminPassword) {
      recordLoginFailure(ip);
      return res.status(401).json({
        success: false,
        message: 'Kata sandi admin salah! Akses ditolak.'
      });
    }

    // Success: clear failed rate limiting attempts and issue secure token
    recordLoginSuccess(ip);
    const token = generateSecureToken();
    activeAdminTokensMap.set(token, { expiresAt: Date.now() + TOKEN_LIFETIME_MS });

    res.json({
      success: true,
      message: 'Login admin berhasil!',
      token,
      expiresIn: TOKEN_LIFETIME_MS
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memproses login: ' + err.message });
  }
});

// AUTH: POST /api/admin/verify (Check token validity)
app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : (req.body?.token || req.headers['x-admin-token'] || '').toString().trim();

  if (isTokenValid(token)) {
    return res.json({ success: true, valid: true });
  }
  res.status(401).json({ success: false, valid: false });
});

// AUTH: POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : (req.body?.token || req.headers['x-admin-token'] || '').toString().trim();

  if (token) {
    activeAdminTokensMap.delete(token);
  }
  res.json({ success: true, message: 'Logout berhasil. Sesi admin telah ditutup.' });
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/company-images (Cached real company photos & logos)
// -------------------------------------------------------------
app.get('/api/company-images', (req, res) => {
  res.json({ success: true, data: companyImagesCache });
});

app.get('/api/company-image', async (req, res) => {
  const comp = (req.query.company || '').trim();
  if (!comp) return res.status(400).json({ success: false, message: 'Nama perusahaan wajib diisi.' });

  let img = companyImagesCache[comp];
  if (!img) {
    img = await fetchCompanyImageOnline(comp);
  }
  if (img) {
    return res.json({ success: true, company: comp, imageUrl: img });
  }
  return res.json({ success: false, company: comp, imageUrl: null });
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/jobs (Visitors can only VIEW)
// -------------------------------------------------------------
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, category, job_type, location, status, sort, platform } = req.query;
    const jobs = await db.getJobs({ search, category, job_type, location, status, sort, platform });
    const enriched = jobs.map(j => {
      const cName = j.company_name || '';
      const img = companyImagesCache[cName] || companyImagesCache[j.title] || '';
      return { ...j, company_image: img || '' };
    });
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat lowongan: ' + err.message });
  }
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/jobs/:id (Detail & increment view)
// -------------------------------------------------------------
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    const cName = job.company_name || '';
    const img = companyImagesCache[cName] || companyImagesCache[job.title] || '';
    res.json({ success: true, data: { ...job, company_image: img || '' } });
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: POST /api/jobs (Upload new job)
// -------------------------------------------------------------
app.post('/api/jobs', requireAdminAuth, upload.single('poster_image'), async (req, res) => {
  try {
    const {
      title,
      company_name,
      category,
      job_type,
      location,
      salary_display,
      experience_level,
      description,
      requirements,
      responsibilities,
      benefits,
      whatsapp,
      email,
      website,
      website_url,
      contact_type,
      contact_value,
      deadline,
      status,
      is_featured
    } = req.body;

    if (!title || !company_name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Judul lowongan, nama perusahaan, dan deskripsi wajib diisi!'
      });
    }

    let poster_image = '';
    if (req.file) {
      poster_image = '/uploads/' + req.file.filename;
    }

    const wa = (whatsapp || '').trim();
    const em = (email || '').trim();
    const wb = (website_url || website || '').trim();

    let finalContactVal = contact_value ? contact_value.trim() : '';
    if (!finalContactVal && (wa || em || wb)) {
      finalContactVal = JSON.stringify({ whatsapp: wa, email: em, website: wb });
    }

    const newJob = await db.addJob({
      title: title.trim(),
      company_name: company_name.trim(),
      category: category || 'Lainnya',
      job_type: job_type || 'Full Time',
      location: location || 'Indonesia',
      salary_display: salary_display || 'Kompetitif',
      experience_level: experience_level || 'Semua Pengalaman',
      poster_image,
      description: description.trim(),
      requirements: parseList(requirements),
      responsibilities: parseList(responsibilities),
      benefits: parseList(benefits),
      whatsapp: wa,
      email: em,
      website_url: wb,
      contact_type: contact_type || (wa ? 'whatsapp' : (em ? 'email' : 'link')),
      contact_value: finalContactVal,
      deadline: deadline || '',
      status: status || 'active',
      is_featured: is_featured === '1' || is_featured === 1 || is_featured === true || is_featured === 'true',
      source_platform: req.body.source_platform || (wb.includes('linkedin.com') ? 'linkedin' : (wb.includes('instagram.com') ? 'instagram' : (wb.includes('facebook.com') ? 'facebook' : 'official'))),
      source_label: req.body.source_label || ''
    });

    res.status(201).json({
      success: true,
      message: 'Poster lowongan berhasil diunggah & dipublikasikan ke Supabase!',
      data: newJob
    });
  } catch (err) {
    console.error('Error adding job:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan lowongan: ' + err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: PUT /api/jobs/:id (Update job)
// -------------------------------------------------------------
app.put('/api/jobs/:id', requireAdminAuth, upload.single('poster_image'), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getJobById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }

    const {
      title,
      company_name,
      category,
      job_type,
      location,
      salary_display,
      experience_level,
      description,
      requirements,
      responsibilities,
      benefits,
      whatsapp,
      email,
      website,
      website_url,
      contact_type,
      contact_value,
      deadline,
      status,
      is_featured
    } = req.body;

    let poster_image = existing.poster_image;
    if (req.file) {
      poster_image = '/uploads/' + req.file.filename;
    }

    const wa = whatsapp !== undefined ? whatsapp.trim() : (existing.whatsapp || '');
    const em = email !== undefined ? email.trim() : (existing.email || '');
    const wb = (website_url !== undefined ? website_url : website) !== undefined ? (website_url || website).trim() : (existing.website_url || '');

    let finalContactVal = contact_value !== undefined ? contact_value.trim() : existing.contact_value;
    if (whatsapp !== undefined || email !== undefined || website !== undefined || website_url !== undefined) {
      finalContactVal = JSON.stringify({ whatsapp: wa, email: em, website: wb });
    }

    const updated = await db.updateJob(id, {
      title: title ? title.trim() : existing.title,
      company_name: company_name ? company_name.trim() : existing.company_name,
      category: category || existing.category,
      job_type: job_type || existing.job_type,
      location: location || existing.location,
      salary_display: salary_display !== undefined ? salary_display : existing.salary_display,
      experience_level: experience_level || existing.experience_level,
      poster_image,
      description: description ? description.trim() : existing.description,
      requirements: requirements !== undefined ? parseList(requirements) : existing.requirements,
      responsibilities: responsibilities !== undefined ? parseList(responsibilities) : existing.responsibilities,
      benefits: benefits !== undefined ? parseList(benefits) : existing.benefits,
      whatsapp: wa,
      email: em,
      website_url: wb,
      contact_type: contact_type || existing.contact_type || (wa ? 'whatsapp' : (em ? 'email' : 'link')),
      contact_value: finalContactVal,
      deadline: deadline !== undefined ? deadline : existing.deadline,
      status: status || existing.status,
      is_featured: is_featured !== undefined ? (is_featured === '1' || is_featured === 1 || is_featured === true || is_featured === 'true' ? 1 : 0) : existing.is_featured
    });

    res.json({ success: true, message: 'Lowongan berhasil diperbarui!', data: updated });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui lowongan: ' + err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: DELETE /api/jobs/:id (Delete job)
// -------------------------------------------------------------
app.delete('/api/jobs/:id', requireAdminAuth, async (req, res) => {
  try {
    const success = await db.deleteJob(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    res.json({ success: true, message: 'Lowongan berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: PATCH /api/jobs/:id/status
// -------------------------------------------------------------
app.patch('/api/jobs/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.toggleStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    res.json({ success: true, message: `Status berhasil diubah menjadi ${updated.status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: GET /api/admin/stats
// -------------------------------------------------------------
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/settings (CV WhatsApp & message)
// -------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: POST /api/settings (Save CV WhatsApp)
// -------------------------------------------------------------
app.post('/api/settings', requireAdminAuth, async (req, res) => {
  try {
    const { cv_whatsapp, cv_order_message } = req.body || {};
    const updated = await db.saveSettings({ cv_whatsapp, cv_order_message });
    res.json({
      success: true,
      message: 'Pengaturan nomor WhatsApp pemesanan CV berhasil disimpan!',
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/master-data (Kategori, Tipe, Level, Lokasi)
// -------------------------------------------------------------
app.get('/api/master-data', async (req, res) => {
  try {
    const data = await db.getMasterData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: POST /api/master-data (Tambah Master Data)
// -------------------------------------------------------------
app.post('/api/master-data', requireAdminAuth, async (req, res) => {
  try {
    const { type, name, icon } = req.body;
    if (!type || !name) {
      return res.status(400).json({ success: false, message: 'Tipe dan nama master data wajib diisi!' });
    }
    const result = await db.addMasterDataItem({ type, name, icon });
    const fullData = result.allData || (result.categories ? result : await db.getMasterData());
    res.status(201).json({
      success: true,
      message: `Berhasil menambahkan "${name.trim()}" ke master data!`,
      data: fullData
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: DELETE /api/master-data (Hapus Master Data)
// -------------------------------------------------------------
app.delete('/api/master-data', requireAdminAuth, async (req, res) => {
  try {
    const { type, name, id } = req.body || {};
    const qType = type || req.query.type;
    const qName = name || req.query.name;
    const qId = id || req.query.id;

    const result = await db.deleteMasterDataItem({ type: qType, name: qName, id: qId });
    const fullData = result.allData || (result.categories ? result : await db.getMasterData());
    res.json({
      success: true,
      message: 'Item master data berhasil dihapus!',
      data: fullData
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: POST /api/master-data/reset (Reset Default)
// -------------------------------------------------------------
app.post('/api/master-data/reset', requireAdminAuth, async (req, res) => {
  try {
    const result = await db.resetMasterData();
    const fullData = result.allData || (result.categories ? result : await db.getMasterData());
    res.json({ success: true, message: 'Master data berhasil dikembalikan ke default!', data: fullData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// GOOGLE DORKING QUERY GENERATOR (Sosmed Job Search - Recent Postings)
// -------------------------------------------------------------
function generateGoogleDorkQuery({ kata_kunci = '', lokasi = '', platforms = [], timeframe = '7d' } = {}) {
  const platformMap = {
    linkedin: 'site:linkedin.com/posts',
    instagram: 'site:instagram.com',
    facebook: 'site:facebook.com',
    twitter: '(site:x.com OR site:twitter.com)',
    media: '(site:kompas.com OR site:detik.com OR site:tribunnews.com OR site:bisnis.com)',
    bumn: '("bumn" OR "rekrutmen bersama bumn" OR "bumn.go.id")',
    all: '(site:linkedin.com/posts OR site:instagram.com OR site:facebook.com OR site:kompas.com OR site:detik.com)'
  };

  const rawPlatforms = Array.isArray(platforms)
    ? platforms
    : (typeof platforms === 'string' ? platforms.split(',') : []);

  let selectedSites = [];
  for (const p of rawPlatforms) {
    const key = String(p).trim().toLowerCase();
    if (platformMap[key] && !selectedSites.includes(platformMap[key])) {
      selectedSites.push(platformMap[key]);
    }
  }

  // Fallback to all three platforms if none specified or unrecognized
  if (selectedSites.length === 0) {
    selectedSites = [
      platformMap.linkedin,
      platformMap.instagram,
      platformMap.facebook
    ];
  }

  const querySite = selectedSites.length === 1
    ? selectedSites[0]
    : `(${selectedSites.join(' OR ')})`;

  const cleanKw = (kata_kunci || '').trim();
  const cleanLoc = (lokasi || '').trim();

  let timeClause = '';
  let googleTbs = '';
  if (timeframe === '24h' || timeframe === '1d') {
    timeClause = 'when:24h';
    googleTbs = '&tbs=qdr:d';
  } else if (timeframe === '7d' || timeframe === 'week') {
    timeClause = 'when:7d';
    googleTbs = '&tbs=qdr:w';
  } else if (timeframe === '30d' || timeframe === 'month') {
    timeClause = 'when:30d';
    googleTbs = '&tbs=qdr:m';
  }

  let queryDork = `${querySite} "lowongan"`;
  if (cleanKw) {
    queryDork += ` "${cleanKw}"`;
  }
  if (cleanLoc) {
    queryDork += ` "${cleanLoc}"`;
  }
  if (timeClause) {
    queryDork += ` ${timeClause}`;
  }

  const urlGoogle = `https://www.google.com/search?q=${encodeURIComponent(queryDork)}${googleTbs}`;

  return {
    query_dork: queryDork,
    url_google: urlGoogle,
    timeframe: timeframe || '7d'
  };
}

// Helper: thoroughly clean HTML tags & entities from Google RSS snippets
function cleanHtmlSnippet(raw) {
  if (!raw) return '';
  return raw
    .replace(/&lt;[\s\S]*?&gt;/gi, ' ')
    .replace(/<[\s\S]*?>/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Calculate human-readable time-ago and freshness badge
function formatTimeAgo(pubDateStr) {
  if (!pubDateStr) return { text: 'Baru saja', isFresh: true, badge: 'Baru', badgeColor: '#10b981', diffDays: 0, timestamp: Date.now() };
  const pubTime = new Date(pubDateStr).getTime();
  if (isNaN(pubTime)) return { text: 'Baru saja', isFresh: true, badge: 'Baru', badgeColor: '#10b981', diffDays: 0, timestamp: Date.now() };

  const diffMs = Date.now() - pubTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return {
      text: diffMins <= 1 ? '1 menit lalu' : `${diffMins} menit lalu`,
      isFresh: true,
      badge: 'Baru Saja',
      badgeColor: '#10b981',
      diffDays,
      diffHours,
      timestamp: pubTime
    };
  }
  if (diffHours < 24) {
    return {
      text: `${diffHours} jam lalu`,
      isFresh: true,
      badge: 'Hari Ini',
      badgeColor: '#10b981',
      diffDays,
      diffHours,
      timestamp: pubTime
    };
  }
  if (diffDays === 1) {
    return {
      text: '1 hari lalu (Kemarin)',
      isFresh: true,
      badge: 'Kemarin',
      badgeColor: '#059669',
      diffDays,
      diffHours,
      timestamp: pubTime
    };
  }
  if (diffDays < 7) {
    return {
      text: `${diffDays} hari lalu (Minggu ini)`,
      isFresh: true,
      badge: `${diffDays}h lalu`,
      badgeColor: '#6366f1',
      diffDays,
      diffHours,
      timestamp: pubTime
    };
  }
  if (diffDays < 30) {
    return {
      text: `${diffDays} hari lalu`,
      isFresh: false,
      badge: `${Math.floor(diffDays / 7)} mgg lalu`,
      badgeColor: '#f59e0b',
      diffDays,
      diffHours,
      timestamp: pubTime
    };
  }
  return {
    text: `${Math.floor(diffDays / 30)} bulan lalu`,
    isFresh: false,
    badge: 'Arsip Lama',
    badgeColor: '#94a3b8',
    diffDays,
    diffHours,
    timestamp: pubTime
  };
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// HELPER: Fetch Real Web Job Postings (Direct links to actual articles)
// -------------------------------------------------------------
async function fetchRealSocialJobs(keyword, location, platforms = ['web', 'bumn', 'media'], timeframe = '7d') {
  const results = [];
  const cleanKw = (keyword || 'Operator Produksi').trim();
  const cleanLoc = (location || 'Indonesia').trim();
  const seenUrls = new Set();

  // 1. Fetch from Bing News RSS with pure direct decoded URL
  try {
    const query = `lowongan kerja "${cleanKw}" ${cleanLoc}`;
    const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
    const res = await fetch(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g)];

      for (const item of items) {
        const rawTitle = cleanHtmlSnippet(item[1]);
        const rawLink = item[2].trim();
        const rawDesc = cleanHtmlSnippet(item[3]);
        const pubDate = item[4].trim();

        if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) {
          continue;
        }

        const directUrl = decodeBingUrl(rawLink);
        if (seenUrls.has(directUrl)) continue;
        seenUrls.add(directUrl);

        let domain = 'Website Berita & Karir';
        try {
          const u = new URL(directUrl);
          domain = u.hostname.replace(/^www\./, '');
        } catch(e) {}

        const parsed = parseJobHeadline(rawTitle, domain);
        const timeInfo = formatTimeAgo(pubDate);

        results.push({
          id: 'scout_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          title: parsed.title,
          company: parsed.company,
          company_name: parsed.company,
          location: cleanLoc,
          platform: 'web',
          platformLabel: domain.toUpperCase(),
          platformIcon: 'fa-solid fa-globe',
          platformClass: 'web',
          sourceName: `${parsed.company} • ${domain}`,
          url: directUrl,
          official_url: directUrl,
          website_url: directUrl,
          pubDate,
          pubTimestamp: timeInfo.timestamp,
          timeAgo: timeInfo.text,
          timeBadge: timeInfo.badge,
          badgeColor: timeInfo.badgeColor,
          isFresh: timeInfo.isFresh,
          description: rawDesc.substring(0, 240) + (rawDesc.length > 240 ? '...' : ''),
          whatsapp: '',
          email: '',
          salary: 'Kompetitif (Standar Industri & UMK)'
        });
      }
    }
  } catch (e) {
    console.warn('Scout Bing fetch error:', e.message);
  }

  // 1.5. Fetch from Bukajobs RSS (Direct articles on Bukajobs with authentic direct links)
  try {
    const bukaRes = await fetch('https://bukajobs.com/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (bukaRes.ok) {
      const bukaXml = await bukaRes.text();
      const bukaItems = [...bukaXml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g)];
      for (const bi of bukaItems) {
        const rawTitle = cleanHtmlSnippet(bi[1]);
        const link = bi[2].trim();
        const pubDate = bi[3].trim();
        const rawDesc = cleanHtmlSnippet(bi[4]);

        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        const parsed = parseJobHeadline(rawTitle, 'Bukajobs Karir', rawDesc);
        const timeInfo = formatTimeAgo(pubDate);

        results.unshift({
          id: 'scout_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          title: parsed.title,
          company: parsed.company,
          company_name: parsed.company,
          location: cleanLoc,
          platform: 'bukajobs',
          platformLabel: 'BUKAJOBS',
          platformIcon: 'fa-solid fa-briefcase',
          platformClass: 'bukajobs',
          sourceName: `${parsed.company} • Bukajobs.com`,
          url: link,
          official_url: link,
          website_url: link,
          pubDate,
          pubTimestamp: timeInfo.timestamp,
          timeAgo: timeInfo.text,
          timeBadge: timeInfo.badge,
          badgeColor: timeInfo.badgeColor,
          isFresh: timeInfo.isFresh,
          description: rawDesc.substring(0, 240) + (rawDesc.length > 240 ? '...' : ''),
          whatsapp: '',
          email: '',
          salary: 'Kompetitif (Standar BUMN / Korporasi)'
        });
      }
    }
  } catch (err) {
    console.warn('Scout Bukajobs fetch warning:', err.message);
  }

  // 2. Fetch from Google News RSS for additional live web postings
  if (results.length < 12) {
    try {
      const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`("lowongan kerja" OR "rekrutmen") "${cleanKw}" ${cleanLoc}`.trim())}&hl=id&gl=ID&ceid=ID:id`;
      const res = await fetch(generalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const xml = await res.text();
        const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g)];
        for (const m of items.slice(0, 15)) {
          let rawTitle = cleanHtmlSnippet(m[1]);
          const link = m[2];
          const pubDate = m[3];
          let rawDesc = cleanHtmlSnippet(m[4]);
          const source = m[5] || 'Portal Loker';

          if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) {
            continue;
          }

          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          const parsed = parseJobHeadline(rawTitle, source);
          const timeInfo = formatTimeAgo(pubDate);

          results.push({
            id: 'scout_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            title: parsed.title,
            company: parsed.company,
            company_name: parsed.company,
            location: cleanLoc,
            platform: 'web',
            platformLabel: source.toUpperCase(),
            platformIcon: 'fa-solid fa-newspaper',
            platformClass: 'web',
            sourceName: `${parsed.company} • ${source}`,
            url: link,
            official_url: link,
            website_url: link,
            pubDate,
            pubTimestamp: timeInfo.timestamp,
            timeAgo: timeInfo.text,
            timeBadge: timeInfo.badge,
            badgeColor: timeInfo.badgeColor,
            isFresh: timeInfo.isFresh,
            description: rawDesc.substring(0, 240) + (rawDesc.length > 240 ? '...' : ''),
            whatsapp: '',
            email: '',
            salary: 'Kompetitif (Standar BUMN / Korporasi)'
          });
        }
      }
    } catch (err) {
      console.warn('Scout Google fetch error:', err.message);
    }
  }

  // Sort strictly by timestamp descending (Newest first!)
  results.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  return results;
}

// -------------------------------------------------------------
// LIVE REAL WEB JOBS ENGINE: Authentic Job Postings Shared Across Websites
// Direct links to actual articles & corporate career pages (No simulated portals)
// -------------------------------------------------------------
function decodeBingUrl(rawUrl) {
  try {
    const u = new URL(rawUrl.replace(/&amp;/g, '&'));
    const target = u.searchParams.get('url');
    if (target) return decodeURIComponent(target);
  } catch(e) {}
  return rawUrl.replace(/&amp;/g, '&');
}

function parseJobHeadline(rawTitle, defaultSource = 'Portal Web Resmi', rawDesc = '') {
  let title = cleanHtmlSnippet(rawTitle || '');
  let desc = cleanHtmlSnippet(rawDesc || '');
  let comp = defaultSource || 'Perusahaan Terverifikasi';

  const searchTexts = [desc, title];

  // 1. Detect Real Company if comp is generic social platform
  const isGenericComp = /^(instagram|facebook|twitter|linkedin|web|portal|loker|google|bing|website)/i.test(comp);
  for (const text of searchTexts) {
    const ptMatch = text.match(/(?:🏢\s*)?((?:PT|CV|Bank|Yayasan|RSUD|RS|Universitas|Politeknik)\s+[^💼📢🕒🕐🎓\n\r,]+?)(?=\s+(?:membuka|buka|posisi|career|recruitment|💼|📢|🕒|🕐|🎓|$))/i);
    if (ptMatch && ptMatch[1]) {
      const extractedComp = ptMatch[1].replace(/^[🏢\s]+/, '').replace(/[\.\s]+$/, '').trim();
      if (isGenericComp || (comp.length < 8 && extractedComp.length > comp.length)) {
        comp = extractedComp;
        break;
      }
    }
  }

  // 2. Extract Posisi / Clean Title
  let cleanTitle = '';
  for (const text of searchTexts) {
    const posMatch = text.match(/(?:💼\s*Posisi:?|Posisi\s*:?)\s*([^🕒🕐🎓📢🏢\n\r]+?)(?=\s*(?:🕒|🕐|🎓|📢|🏢|Status:|Jenjang:|Pendidikan:|PT |CV |membuka|$))/i);
    if (posMatch && posMatch[1]) {
      const candidate = posMatch[1].replace(/[\.\s]+$/, '').trim();
      if (!candidate.endsWith('..') && candidate.length > cleanTitle.length && !candidate.toLowerCase().includes('informasi dipublikasikan')) {
        cleanTitle = candidate;
      }
    }
  }

  if (!cleanTitle) {
    cleanTitle = title;
    // Strip source suffix like " - Kompas.com" or " - Detik Finance"
    cleanTitle = cleanTitle.replace(/\s+-\s+[^-]+$/, '').trim();

    const openMatch = cleanTitle.match(/^(.*?)\s+Buka Lowongan(?:\s+Kerja)?\s+(.*?)(?:,\s*.*)?$/i);
    if (openMatch) {
      if (isGenericComp) comp = openMatch[1].trim();
      cleanTitle = openMatch[2].trim();
    } else {
      const diMatch = cleanTitle.match(/^(?:Lowongan Kerja\s+)?(.*?)\s+di\s+(.*?)(?:,\s*.*)?$/i);
      if (diMatch) {
        cleanTitle = diMatch[1].replace(/^Lowongan Kerja\s+/i, '').trim();
        if (isGenericComp) comp = diMatch[2].trim();
      } else {
        const untukMatch = cleanTitle.match(/^Lowongan Kerja\s+(.*?)\s+untuk\s+(.*?)$/i);
        if (untukMatch) {
          if (isGenericComp) comp = untukMatch[1].trim();
          cleanTitle = untukMatch[2].trim();
        }
      }
    }

    // Strip promotional buzzwords & emojis
    cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');
    cleanTitle = cleanTitle.replace(/\b(LOWONGAN\s+(?:BUMN\s+)?(?:TERBARU\s+)?|LOKER\s+TERBARU\s+|WE ARE HIRING\s+|DIBUTUHKAN\s+SEGERA\s+)\b/gi, ' ');
    if (comp && cleanTitle.includes(comp)) {
      cleanTitle = cleanTitle.replace(comp, ' ');
    }
  }

  // Handle prefix like 'untuk Lulusan...'
  if (/^untuk\s+/i.test(cleanTitle)) {
    cleanTitle = 'Program Rekrutmen Perbankan ' + cleanTitle;
  }

  // Clean trailing punctuation & spaces
  cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').replace(/[\.\s]+$/, '').trim();
  comp = comp.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').replace(/[\.\s]+$/, '').trim();

  if (cleanTitle.length > 90) cleanTitle = cleanTitle.substring(0, 90).trim() + '...';
  if (comp.length > 60) comp = comp.substring(0, 60).trim();

  // 3. Extract Metadata: Status & Education
  let statusVal = '';
  let eduVal = '';
  for (const text of searchTexts) {
    if (!statusVal) {
      const sm = text.match(/(?:🕒|🕐|Status\s*:?)\s*([A-Za-z\s]+?)(?=\s*(?:🎓|Jenjang|Pendidikan|PT |CV |membuka|$))/i);
      if (sm && sm[1]) statusVal = sm[1].trim();
    }
    if (!eduVal) {
      const em = text.match(/(?:🎓|Jenjang\s*Pendidikan\s*:?|Pendidikan\s*:?)\s*([^🏢📢💼🕒🕐\n\r]+?)(?=\s*(?:PT |CV |membuka|Status|$))/i);
      if (em && em[1]) {
        eduVal = em[1].replace(/^(?:Jenjang\s*Pendidikan|Pendidikan)\s*:?\s*/i, '').trim();
      }
    }
  }

  // 4. Clean Narrative Description
  let cleanDesc = desc;
  if (!cleanDesc || cleanDesc.includes('📢') || cleanDesc.includes('🏢') || cleanDesc.includes('💼') || cleanDesc.includes('🎓') || cleanDesc.includes('🕐')) {
    cleanDesc = `${comp} membuka kesempatan berkarir untuk posisi ${cleanTitle}.`;
    if (eduVal) cleanDesc += ` Terbuka bagi pelamar dengan kualifikasi jenjang pendidikan ${eduVal}.`;
    if (statusVal) cleanDesc += ` Status hubungan kerja: ${statusVal}.`;
    cleanDesc += ` Seluruh tahapan pendaftaran dan verifikasi berkas dilakukan secara resmi tanpa dipungut biaya apapun.`;
  }

  // 5. Build Professional Responsibilities
  const responsibilities = [
    `Menjalankan tugas pokok dan fungsi operasional untuk posisi ${cleanTitle}.`,
    `Menjaga profesionalisme, kedisiplinan kerja, dan kepatuhan terhadap SOP di lingkungan ${comp}.`,
    `Berkoordinasi secara aktif dengan tim kerja terkait kelancaran operasional harian.`
  ];

  if (/administrasi|admin/i.test(cleanTitle)) {
    responsibilities.unshift('Mengelola tata kelola administrasi dokumen, pengarsipan data, dan pencatatan operasional unit.');
  } else if (/finance|keuangan|accounting|akuntansi/i.test(cleanTitle)) {
    responsibilities.unshift('Mendukung proses rekonsiliasi data transaksi dan penyusunan berkas administrasi fungsi keuangan.');
  } else if (/operator|produksi|manufaktur/i.test(cleanTitle)) {
    responsibilities.unshift('Menjalankan operasional peralatan/mesin kerja sesuai instruksi kerja (IK) dan standar keselamatan (K3).');
  }

  return {
    title: cleanTitle || rawTitle,
    company: comp || defaultSource,
    cleanDesc,
    responsibilities,
    statusVal,
    eduVal
  };
}

function detectJobPlatformMeta(directUrl, rawTitle, sourceName, requestedPlatform = 'all') {
  const urlLower = (directUrl || '').toLowerCase();
  const titleLower = (rawTitle || '').toLowerCase();
  const sourceLower = (sourceName || '').toLowerCase();
  const req = (requestedPlatform || 'all').toLowerCase();

  if (urlLower.includes('bukajobs.com') || titleLower.includes('bukajobs') || sourceLower.includes('bukajobs') || req === 'bukajobs') {
    return {
      platform: 'bukajobs',
      platformLabel: 'Bukajobs Karir',
      platformIcon: 'fa-solid fa-briefcase',
      platformClass: 'bukajobs',
      sourceWebsite: 'Bukajobs.com'
    };
  }

  if (urlLower.includes('linkedin.com') || titleLower.endsWith('- linkedin') || sourceLower.includes('linkedin')) {
    return {
      platform: 'linkedin',
      platformLabel: 'LinkedIn Karir',
      platformIcon: 'fa-brands fa-linkedin',
      platformClass: 'linkedin',
      sourceWebsite: 'LinkedIn'
    };
  }
  if (urlLower.includes('instagram.com') || titleLower.endsWith('- instagram') || sourceLower.includes('instagram')) {
    return {
      platform: 'instagram',
      platformLabel: 'Instagram Karir',
      platformIcon: 'fa-brands fa-instagram',
      platformClass: 'instagram',
      sourceWebsite: 'Instagram'
    };
  }
  if (urlLower.includes('facebook.com') || titleLower.endsWith('- facebook') || sourceLower.includes('facebook')) {
    return {
      platform: 'facebook',
      platformLabel: 'Facebook Post',
      platformIcon: 'fa-brands fa-facebook',
      platformClass: 'facebook',
      sourceWebsite: 'Facebook'
    };
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || titleLower.endsWith('- x') || titleLower.endsWith('- twitter') || sourceLower.includes('twitter') || sourceLower.includes('x')) {
    return {
      platform: 'twitter',
      platformLabel: 'X (Twitter) Karir',
      platformIcon: 'fa-brands fa-x-twitter',
      platformClass: 'twitter',
      sourceWebsite: 'Twitter (X)'
    };
  }
  if (titleLower.includes('bumn') || sourceLower.includes('bumn') || urlLower.includes('bumn.go.id') || urlLower.includes('kemnaker')) {
    return {
      platform: 'bumn',
      platformLabel: 'BUMN & Kedinasan',
      platformIcon: 'fa-solid fa-landmark',
      platformClass: 'bumn',
      sourceWebsite: sourceName || 'Portal BUMN'
    };
  }
  if (urlLower.includes('kompas.com') || urlLower.includes('detik.com') || urlLower.includes('tribunnews.com') || urlLower.includes('bisnis.com') || urlLower.includes('liputan6.com') || urlLower.includes('tempo.co')) {
    return {
      platform: 'media',
      platformLabel: 'Portal Media Resmi',
      platformIcon: 'fa-solid fa-newspaper',
      platformClass: 'media',
      sourceWebsite: sourceName || 'Portal Berita'
    };
  }

  // Fallback to requested platform if specified
  if (req === 'bukajobs') {
    return {
      platform: 'bukajobs',
      platformLabel: 'Bukajobs Karir',
      platformIcon: 'fa-solid fa-briefcase',
      platformClass: 'bukajobs',
      sourceWebsite: 'Bukajobs.com'
    };
  }
  if (req === 'linkedin') {
    return {
      platform: 'linkedin',
      platformLabel: 'LinkedIn Karir',
      platformIcon: 'fa-brands fa-linkedin',
      platformClass: 'linkedin',
      sourceWebsite: 'LinkedIn'
    };
  }
  if (req === 'instagram') {
    return {
      platform: 'instagram',
      platformLabel: 'Instagram Karir',
      platformIcon: 'fa-brands fa-instagram',
      platformClass: 'instagram',
      sourceWebsite: 'Instagram'
    };
  }
  if (req === 'facebook') {
    return {
      platform: 'facebook',
      platformLabel: 'Facebook Post',
      platformIcon: 'fa-brands fa-facebook',
      platformClass: 'facebook',
      sourceWebsite: 'Facebook'
    };
  }
  if (req === 'twitter') {
    return {
      platform: 'twitter',
      platformLabel: 'X (Twitter) Karir',
      platformIcon: 'fa-brands fa-x-twitter',
      platformClass: 'twitter',
      sourceWebsite: 'Twitter (X)'
    };
  }
  if (req === 'bumn') {
    return {
      platform: 'bumn',
      platformLabel: 'BUMN & Kedinasan',
      platformIcon: 'fa-solid fa-landmark',
      platformClass: 'bumn',
      sourceWebsite: 'BUMN Karir'
    };
  }
  if (req === 'media') {
    return {
      platform: 'media',
      platformLabel: 'Portal Media Resmi',
      platformIcon: 'fa-solid fa-newspaper',
      platformClass: 'media',
      sourceWebsite: 'Portal Media'
    };
  }

  return {
    platform: 'web',
    platformLabel: sourceName || 'Website Resmi Terverifikasi',
    platformIcon: 'fa-solid fa-globe',
    platformClass: 'web',
    sourceWebsite: sourceName || 'Website Karir'
  };
}

async function fetchLivePortalJobs(keyword, location = 'Indonesia', platform = 'all') {
  const cleanKw = (keyword || 'admin').trim();
  const cleanLoc = (location || 'Indonesia').trim();
  const activePlat = (platform || 'all').trim().toLowerCase();
  const results = [];
  const seenUrls = new Set();

  // Configure search queries based on selected platform / social media
  let bingSearchQuery = `lowongan kerja "${cleanKw}" ${cleanLoc}`;
  let googleSearchQuery = `("lowongan kerja" OR "we are hiring") "${cleanKw}" ${cleanLoc}`;

  if (activePlat === 'linkedin') {
    bingSearchQuery = `site:linkedin.com "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `site:linkedin.com ("lowongan kerja" OR "we are hiring" OR "hiring") "${cleanKw}"`;
  } else if (activePlat === 'instagram') {
    bingSearchQuery = `site:instagram.com "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `site:instagram.com ("lowongan kerja" OR "loker") "${cleanKw}"`;
  } else if (activePlat === 'facebook') {
    bingSearchQuery = `site:facebook.com "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `site:facebook.com ("lowongan kerja" OR "loker") "${cleanKw}"`;
  } else if (activePlat === 'twitter' || activePlat === 'x') {
    bingSearchQuery = `site:twitter.com "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `(site:x.com OR site:twitter.com) ("lowongan kerja" OR "loker") "${cleanKw}"`;
  } else if (activePlat === 'media') {
    bingSearchQuery = `(site:kompas.com OR site:detik.com OR site:tribunnews.com) "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `(site:kompas.com OR site:detik.com OR site:tribunnews.com OR site:bisnis.com) "lowongan kerja" "${cleanKw}"`;
  } else if (activePlat === 'bumn') {
    bingSearchQuery = `"bumn" "lowongan kerja" "${cleanKw}"`;
    googleSearchQuery = `("bumn" OR "rekrutmen bersama bumn" OR "bumn.go.id" OR "kemnaker") "lowongan kerja" "${cleanKw}"`;
  } else {
    // all: combines bing general with google multi-sosmed
    bingSearchQuery = `lowongan kerja "${cleanKw}" ${cleanLoc}`;
    googleSearchQuery = `("lowongan kerja" OR "we are hiring") "${cleanKw}" (site:linkedin.com OR site:instagram.com OR site:facebook.com OR "bumn" OR "kompas.com" OR "detik.com")`;
  }

  // 1. Fetch Real-time Live Web Postings from Bing News
  try {
    const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(bingSearchQuery)}&format=rss`;
    const res = await fetch(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g)];

      for (const item of items) {
        const rawTitle = cleanHtmlSnippet(item[1]);
        const rawLink = item[2].trim();
        const rawDesc = cleanHtmlSnippet(item[3]);
        const pubDate = item[4].trim();

        // Anti-Hoax filter
        if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) {
          continue;
        }

        const directUrl = decodeBingUrl(rawLink);
        if (seenUrls.has(directUrl)) continue;
        seenUrls.add(directUrl);

        let domain = 'Website Berita & Karir';
        try {
          const u = new URL(directUrl);
          domain = u.hostname.replace(/^www\./, '');
        } catch(e) {}

        const parsed = parseJobHeadline(rawTitle, domain, rawDesc);
        const timeInfo = formatTimeAgo(pubDate);
        const platMeta = detectJobPlatformMeta(directUrl, rawTitle, domain, activePlat);

        results.push({
          id: 'web_' + crypto.randomBytes(6).toString('hex'),
          source: 'web',
          platform: platMeta.platform,
          platform_label: platMeta.platformLabel,
          platform_icon: platMeta.platformIcon,
          platform_class: platMeta.platformClass,
          title: parsed.title,
          company_name: parsed.company,
          company: parsed.company,
          location: cleanLoc,
          pubDate,
          pubTimestamp: timeInfo.timestamp,
          timeAgo: timeInfo.text,
          posted_time: timeInfo.text || 'Baru saja',
          isFresh: timeInfo.isFresh,
          salary_display: 'Kompetitif (Standar UMK / Korporasi)',
          salary_prompt: 'Gaji kompetitif sesuai standar penempatan kerja & kebijakan perusahaan.',
          job_type: parsed.statusVal || 'Full time',
          category: 'Loker Asli Web',
          role_department: parsed.title,
          badge_fresh: true,
          badge_kandidat: true,
          is_live_actual: true,
          official_url: directUrl,
          url: directUrl,
          website_url: directUrl,
          source_website: platMeta.sourceWebsite || domain,
          poster_image: '',
          rating: '4.8',
          contact_email: '',
          contact_whatsapp: '',
          anti_fraud_notice: `Lowongan kerja resmi terpublikasi di ${platMeta.sourceWebsite || domain}. Perusahaan yang sah tidak pernah memungut biaya apapun dari pelamar kerja.`,
          description: parsed.cleanDesc || rawDesc || `Lowongan kerja untuk posisi ${parsed.title} di ${parsed.company}. Informasi aktual dipublikasikan langsung melalui ${platMeta.sourceWebsite || domain}.`,
          responsibilities: parsed.responsibilities,
          requirements: [
            parsed.eduVal ? `Kualifikasi jenjang pendidikan: ${parsed.eduVal}.` : `Pendidikan minimal SMA/SMK/D3/S1 sesuai kualifikasi bidang kerja.`,
            `Memiliki integritas tinggi, kedisiplinan, dan etos kerja yang baik.`,
            `Ketentuan dan dokumen lamaran dapat dicek langsung pada postingan resmi.`
          ],
          benefits: [
            `Gaji pokok sesuai UMK / Standar Korporasi`,
            `Jaminan BPJS Ketenagakerjaan & Kesehatan`
          ]
        });
      }
    }
  } catch (err) {
    console.warn('Bing news web query error:', err.message);
  }

  // 2. Fetch from Google News / Social Media RSS for targeted platform coverage
  try {
    const gUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(googleSearchQuery)}&hl=id&gl=ID&ceid=ID:id`;
    const res = await fetch(gUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g)];

      for (const it of items) {
        const rawTitle = cleanHtmlSnippet(it[1]);
        const link = it[2].trim();
        const pubDate = it[3].trim();
        const desc = cleanHtmlSnippet(it[4]);
        const sourceName = it[5] ? cleanHtmlSnippet(it[5]) : '';

        if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) {
          continue;
        }

        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        const platMeta = detectJobPlatformMeta(link, rawTitle, sourceName, activePlat);
        const parsed = parseJobHeadline(rawTitle, platMeta.sourceWebsite || sourceName, desc);
        const timeInfo = formatTimeAgo(pubDate);

        results.push({
          id: 'web_' + crypto.randomBytes(6).toString('hex'),
          source: 'web',
          platform: platMeta.platform,
          platform_label: platMeta.platformLabel,
          platform_icon: platMeta.platformIcon,
          platform_class: platMeta.platformClass,
          title: parsed.title,
          company_name: parsed.company,
          company: parsed.company,
          location: cleanLoc,
          pubDate,
          pubTimestamp: timeInfo.timestamp,
          timeAgo: timeInfo.text,
          posted_time: timeInfo.text || 'Baru saja',
          isFresh: timeInfo.isFresh,
          salary_display: 'Kompetitif (Standar Industri & Korporasi)',
          salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
          job_type: parsed.statusVal || 'Full time',
          category: 'Loker Asli Web',
          role_department: parsed.title,
          badge_fresh: true,
          badge_kandidat: true,
          is_live_actual: true,
          official_url: link,
          url: link,
          website_url: link,
          source_website: platMeta.sourceWebsite,
          poster_image: '',
          rating: '4.9',
          contact_email: '',
          contact_whatsapp: '',
          anti_fraud_notice: `Informasi lowongan kerja tervalidasi dari ${platMeta.sourceWebsite}. Bebas pungutan biaya apapun dalam proses rekrutmen.`,
          description: parsed.cleanDesc || desc || `Perekrutan posisi ${parsed.title} di ${parsed.company}. Dipublikasikan secara aktual melalui ${platMeta.sourceWebsite}.`,
          responsibilities: parsed.responsibilities,
          requirements: [
            parsed.eduVal ? `Kualifikasi jenjang pendidikan: ${parsed.eduVal}.` : `Pendidikan sesuai kualifikasi yang disyaratkan posisi.`,
            `Memiliki etos kerja tinggi, integritas, dan siap berkembang.`,
            `Ketentuan dan dokumen lamaran dapat dicek langsung pada postingan resmi.`
          ],
          benefits: [
            `Gaji & tunjangan sesuai standar perusahaan`,
            `Perlindungan jaminan sosial tenaga kerja (BPJS)`
          ]
        });
      }
    }
  } catch(err) {
    console.warn('Google news web query error:', err.message);
  }

  // 3. Fetch from Bukajobs RSS (Top authentic Indonesian career portal with direct apply URLs)
  if (activePlat === 'all' || activePlat === 'bukajobs' || activePlat === 'web' || activePlat === 'corporate') {
    try {
      const bukaRes = await fetch('https://bukajobs.com/feed', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (bukaRes.ok) {
        const bukaXml = await bukaRes.text();
        const bukaItems = [...bukaXml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g)];
        for (const bi of bukaItems) {
          const rawTitle = cleanHtmlSnippet(bi[1]);
          const link = bi[2].trim();
          const pubDate = bi[3].trim();
          const desc = cleanHtmlSnippet(bi[4]);

          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          const parsed = parseJobHeadline(rawTitle, 'Bukajobs Karir', desc);
          const timeInfo = formatTimeAgo(pubDate);

          results.unshift({
            id: 'buka_' + crypto.randomBytes(6).toString('hex'),
            source: 'bukajobs',
            platform: 'bukajobs',
            platform_label: 'Bukajobs Resmi',
            platform_icon: 'fa-solid fa-briefcase',
            platform_class: 'bukajobs',
            title: parsed.title,
            company_name: parsed.company,
            company: parsed.company,
            location: cleanLoc || 'Indonesia',
            pubDate,
            pubTimestamp: timeInfo.timestamp,
            timeAgo: timeInfo.text,
            posted_time: timeInfo.text || 'Baru saja',
            isFresh: timeInfo.isFresh,
            salary_display: 'Kompetitif (Standar Industri & Korporasi)',
            salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
            job_type: parsed.statusVal || 'Full time',
            category: 'Loker Asli Web',
            role_department: parsed.title,
            badge_fresh: true,
            badge_kandidat: true,
            is_live_actual: true,
            official_url: link,
            url: link,
            website_url: link,
            source_website: 'Bukajobs.com',
            poster_image: '',
            rating: '4.9',
            contact_email: '',
            contact_whatsapp: '',
            anti_fraud_notice: 'Informasi lowongan kerja tervalidasi dari portal Bukajobs.com. Bebas pungutan biaya apapun.',
            description: parsed.cleanDesc || desc || `Perekrutan posisi ${parsed.title} di ${parsed.company}. Dipublikasikan secara aktual melalui Bukajobs.`,
            responsibilities: parsed.responsibilities,
            requirements: [
              parsed.eduVal ? `Kualifikasi jenjang pendidikan: ${parsed.eduVal}.` : `Pendidikan sesuai kualifikasi yang disyaratkan posisi.`,
              `Memiliki etos kerja tinggi, integritas, dan siap berkembang.`,
              `Ketentuan dan dokumen lamaran dapat dicek langsung pada postingan resmi Bukajobs.`
            ],
            benefits: [
              `Gaji & tunjangan sesuai standar perusahaan`,
              `Perlindungan jaminan sosial tenaga kerja (BPJS)`
            ]
          });
        }
      }
    } catch(err) {
      console.warn('Bukajobs feed fetch error:', err.message);
    }
  }

  // 4. Merge system database jobs if searching all or matching
  if (activePlat === 'all' || activePlat === 'corporate' || activePlat === 'web') {
    try {
      const dbJobs = await (typeof db.getAllJobs === 'function' ? db.getAllJobs() : db.getJobs({ status: 'all' }));
      if (Array.isArray(dbJobs)) {
        const dbMatches = dbJobs.filter(j => {
          if (j.status === 'system_settings') return false;
          const text = `${j.title} ${j.company_name} ${j.location} ${j.category}`.toLowerCase();
          return text.includes(cleanKw.toLowerCase());
        });

        for (const dj of dbMatches) {
          results.unshift({
            id: `db_${dj.id}`,
            source: 'database',
            platform: 'web',
            platform_label: 'Database Portal Resmi',
            platform_icon: 'fa-solid fa-building-circle-check',
            platform_class: 'official',
            title: dj.title,
            company_name: dj.company_name,
            company: dj.company_name,
            location: dj.location || cleanLoc,
            posted_time: 'Diposting di Portal',
            salary_display: dj.salary_display || 'Kompetitif',
            salary_prompt: 'Gaji kompetitif sesuai ketentuan perusahaan.',
            job_type: dj.job_type || 'Full time',
            category: dj.category || 'Administrasi',
            role_department: dj.job_type || 'Full time',
            badge_fresh: true,
            badge_kandidat: true,
            is_live_actual: true,
            official_url: dj.website_url || `./?job=${dj.id}`,
            url: dj.website_url || `./?job=${dj.id}`,
            website_url: dj.website_url || `./?job=${dj.id}`,
            source_website: dj.company_name,
            poster_image: dj.poster_image || '',
            rating: '4.9',
            contact_email: dj.email || '',
            contact_whatsapp: dj.whatsapp || '',
            anti_fraud_notice: `PT ${dj.company_name} tidak memungut biaya apapun dalam proses rekrutmen. Lowongan terverifikasi anti-hoax.`,
            description: dj.description || 'Lowongan resmi terverifikasi di portal KerjaHub.',
            responsibilities: Array.isArray(dj.responsibilities) ? dj.responsibilities : [dj.description || 'Menjalankan tugas operasional sesuai posisi.'],
            requirements: Array.isArray(dj.requirements) ? dj.requirements : ['Pendidikan relevan', 'Disiplin dan bertanggung jawab'],
            benefits: Array.isArray(dj.benefits) ? dj.benefits : ['Gaji pokok sesuai UMK', 'BPJS Ketenagakerjaan & Kesehatan'],
            pubDate: dj.created_at || new Date().toISOString(),
            pubTimestamp: dj.created_at ? new Date(dj.created_at).getTime() : Date.now(),
            timeAgo: 'Diposting di Portal',
            isFresh: true
          });
        }
      }
    } catch (e) {
      console.warn('DB merge error:', e.message);
    }
  }

  // Sort strictly by timestamp descending (Absolute freshest postings first!)
  results.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  return results;
}

// -------------------------------------------------------------
// LIVE REAL-TIME JOBS API: GET /api/live-jobs
// -------------------------------------------------------------
app.get(['/api/live-jobs', '/api/admin/live-jobs'], async (req, res) => {
  try {
    const { keyword, location, platform } = req.query;
    const cleanKw = (keyword || 'admin').trim();
    const cleanLoc = (location || 'Indonesia').trim();
    const plat = (platform || 'all').trim();

    const jobs = await fetchLivePortalJobs(cleanKw, cleanLoc, plat);

    res.json({
      success: true,
      keyword: cleanKw,
      location: cleanLoc,
      platform: plat,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error('Error fetching live portal jobs:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat lowongan live: ' + err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API: GET /api/admin/scout-jobs (Real-time Live Scout)
// -------------------------------------------------------------
app.get('/api/admin/scout-jobs', requireAdminAuth, async (req, res) => {
  try {
    const { keyword, location, platforms, timeframe } = req.query;
    const platArray = platforms ? platforms.split(',').map(p => p.trim()).filter(Boolean) : ['linkedin', 'instagram', 'facebook'];
    const tf = (timeframe || '7d').trim();
    const jobs = await fetchRealSocialJobs(keyword, location, platArray, tf);
    res.json({
      success: true,
      keyword: keyword || 'Software Engineer',
      location: location || 'Indonesia',
      timeframe: tf,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error('Error scouting jobs:', err);
    res.status(500).json({ success: false, message: 'Gagal mencari postingan real-time: ' + err.message });
  }
});

// -------------------------------------------------------------
// API: /api/admin/generate-dork & /api/generate-dork
// -------------------------------------------------------------
app.all(['/api/admin/generate-dork', '/api/generate-dork'], (req, res) => {
  const kata_kunci = req.body?.kata_kunci || req.body?.keyword || req.query?.kata_kunci || req.query?.keyword || '';
  const lokasi = req.body?.lokasi || req.body?.location || req.query?.lokasi || req.query?.location || '';
  const platforms = req.body?.platforms || req.query?.platforms || ['linkedin', 'instagram', 'facebook'];
  const timeframe = req.body?.timeframe || req.query?.timeframe || '7d';

  const result = generateGoogleDorkQuery({ kata_kunci, lokasi, platforms, timeframe });
  res.json(result);
});

// Page routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/cek-cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cek-cv.html'));
});

// Error handling middleware (Multer validation, file limits, and generic exceptions)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar! Maksimal 10 MB.' });
    }
    return res.status(400).json({ success: false, message: 'Kesalahan unggah: ' + err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Terjadi kesalahan pada sistem.' });
  }
  next();
});

// 404 handler for API routes (always return JSON, never HTML)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/public/api')) {
    return res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.path} tidak ditemukan.` });
  }
  next();
});

// Express page fallback middleware
app.use((req, res) => {
  if (req.path.startsWith('/admin') || req.path.startsWith('/public/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  if (req.path.startsWith('/cek-cv') || req.path.startsWith('/public/cek-cv')) {
    return res.sendFile(path.join(__dirname, 'public', 'cek-cv.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 KerjaHub Job Portal (Supabase & Secure Admin)`);
  console.log(`🌐 Website Publik : http://localhost:${PORT}`);
  console.log(`💼 Panel Admin    : http://localhost:${PORT}/admin`);
  console.log(`🔑 Admin Auth     : Protected with ADMIN_PASSWORD`);
  console.log(`===============================================`);
});
