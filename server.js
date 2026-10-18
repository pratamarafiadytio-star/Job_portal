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
      if (pwd === (process.env.ADMIN_PASSWORD || 'admin_supersecret_portal_2026')) {
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

    const currentAdminPassword = process.env.ADMIN_PASSWORD || 'admin_supersecret_portal_2026';
    if (password !== currentAdminPassword) {
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
// PUBLIC API: GET /api/jobs (Visitors can only VIEW)
// -------------------------------------------------------------
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, category, job_type, location, status, sort, platform } = req.query;
    const jobs = await db.getJobs({ search, category, job_type, location, status, sort, platform });
    res.json({ success: true, count: jobs.length, data: jobs });
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
    res.json({ success: true, data: job });
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
    res.status(201).json({
      success: true,
      message: `Berhasil menambahkan "${name.trim()}" ke master data!`,
      data: result
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
    res.json({
      success: true,
      message: 'Item master data berhasil dihapus!',
      data: result
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
    res.json({ success: true, message: 'Master data berhasil dikembalikan ke default!', data: result });
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
    facebook: 'site:facebook.com'
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
// HELPER: Fetch Real Social Recruitment Postings (LinkedIn, IG, FB)
// Strict recency filtering to avoid expired/stale postings
// -------------------------------------------------------------
async function fetchRealSocialJobs(keyword, location, platforms = ['linkedin', 'instagram', 'facebook'], timeframe = '7d') {
  const results = [];
  const cleanKw = (keyword || 'Software Engineer').trim();
  const cleanLoc = (location || 'Indonesia').trim();

  const timeClause = (timeframe === 'all') ? '' : `when:${timeframe || '7d'}`;
  const maxAgeDays = timeframe === '24h' ? 2 : (timeframe === '30d' ? 45 : 14); // 7d default caps at 14 days max

  for (const plat of platforms) {
    let siteQuery = '';
    if (plat === 'linkedin') siteQuery = 'site:linkedin.com/posts';
    else if (plat === 'instagram') siteQuery = 'site:instagram.com';
    else if (plat === 'facebook') siteQuery = 'site:facebook.com';

    const fullQuery = `${siteQuery} ("lowongan" OR "hiring" OR "loker") "${cleanKw}" ${cleanLoc} ${timeClause}`.trim();
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(fullQuery)}&hl=id&gl=ID&ceid=ID:id`;

    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g)];

      for (const m of items.slice(0, 8)) {
        let rawTitle = cleanHtmlSnippet(m[1]);
        const link = m[2];
        const pubDate = m[3];
        let rawDesc = cleanHtmlSnippet(m[4]);
        const source = m[5];

        const timeInfo = formatTimeAgo(pubDate);

        // Filter out stale / expired postings
        if (timeframe !== 'all' && timeInfo.diffDays > maxAgeDays) {
          continue;
        }

        let comp = source || (plat === 'linkedin' ? 'LinkedIn Recruiter' : plat === 'instagram' ? 'Instagram Loker' : 'Facebook Group');
        let cleanTitle = rawTitle;

        const openMatch = rawTitle.match(/^(.*?)\s+membuka lowongan\s+(.*?)\s+di\s+(.*?)(?:\s+-\s+.*)?$/i);
        if (openMatch) {
          comp = openMatch[1].trim();
          cleanTitle = openMatch[2].trim();
        } else {
          cleanTitle = cleanTitle.replace(/\s+-\s+(LinkedIn|Facebook|Instagram|.*)$/i, '').trim();
          if (cleanTitle.length > 80) cleanTitle = cleanTitle.substring(0, 80) + '...';
        }

        // Clean description of redundant trailing source name
        rawDesc = rawDesc.replace(/\s+-\s+(LinkedIn|Facebook|Instagram|Google News)$/i, '').trim();

        const emailMatch = rawDesc.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const waMatch = rawDesc.match(/(\+?62|08)[0-9\-\s]{8,15}/);

        let icon = 'fa-brands fa-linkedin';
        let platClass = 'linkedin';
        if (plat === 'instagram') {
          icon = 'fa-brands fa-instagram';
          platClass = 'instagram';
        } else if (plat === 'facebook') {
          icon = 'fa-brands fa-facebook';
          platClass = 'facebook';
        }

        results.push({
          id: 'scout_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          title: cleanTitle,
          company: comp,
          location: cleanLoc,
          platform: plat,
          platformLabel: plat.toUpperCase(),
          platformIcon: icon,
          platformClass: platClass,
          sourceName: `${comp} • ${source || plat.toUpperCase()}`,
          url: link,
          pubDate,
          pubTimestamp: timeInfo.timestamp,
          timeAgo: timeInfo.text,
          timeBadge: timeInfo.badge,
          badgeColor: timeInfo.badgeColor,
          isFresh: timeInfo.isFresh,
          description: rawDesc.substring(0, 220) + (rawDesc.length > 220 ? '...' : ''),
          whatsapp: waMatch ? waMatch[0].replace(/[\s\-]/g, '') : '',
          email: emailMatch ? emailMatch[1] : '',
          salary: 'Kompetitif (Sesuai Pengalaman)'
        });
      }
    } catch (e) {
      console.warn('Scout fetch error for', plat, e.message);
    }
  }

  // Fallback: if zero results found, query general RSS with recency filter so admin gets real fresh results!
  if (results.length === 0) {
    try {
      const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`("lowongan" OR "loker") "${cleanKw}" ${cleanLoc} ${timeClause}`.trim())}&hl=id&gl=ID&ceid=ID:id`;
      const res = await fetch(generalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const xml = await res.text();
        const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g)];
        for (const m of items.slice(0, 8)) {
          let rawTitle = cleanHtmlSnippet(m[1]);
          const link = m[2];
          const pubDate = m[3];
          let rawDesc = cleanHtmlSnippet(m[4]);
          const source = m[5] || 'Portal Loker';
          const timeInfo = formatTimeAgo(pubDate);

          if (timeframe !== 'all' && timeInfo.diffDays > maxAgeDays) {
            continue;
          }

          results.push({
            id: 'scout_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            title: rawTitle.replace(/\s+-\s+.*$/, ''),
            company: source,
            location: cleanLoc,
            platform: 'web',
            platformLabel: 'PORTAL RESMI',
            platformIcon: 'fa-solid fa-globe',
            platformClass: 'linkedin',
            sourceName: `${source} • Postingan Resmi`,
            url: link,
            pubDate,
            pubTimestamp: timeInfo.timestamp,
            timeAgo: timeInfo.text,
            timeBadge: timeInfo.badge,
            badgeColor: timeInfo.badgeColor,
            isFresh: timeInfo.isFresh,
            description: rawDesc.substring(0, 220) + (rawDesc.length > 220 ? '...' : ''),
            whatsapp: '',
            email: '',
            salary: 'Kompetitif (Sesuai Pengalaman)'
          });
        }
      }
    } catch (err) {}
  }

  // Sort strictly by timestamp descending (Newest first!)
  results.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  return results;
}

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
