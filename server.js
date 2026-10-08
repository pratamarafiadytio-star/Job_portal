require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const db = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin#secret_portal_2026!';
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

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file gambar tidak didukung! Gunakan JPG, PNG, atau WEBP.'));
    }
  }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Admin Authentication Middleware (Secures write operations and admin endpoints)
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] || req.query.admin_token);

  if (!token || !activeAdminTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Anda harus login sebagai admin untuk melakukan tindakan ini.'
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
// AUTH: POST /api/admin/login (Secure Admin Gatekeeper)
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password admin wajib diisi!' });
    }

    if (password !== ADMIN_PASSWORD) {
      // Artificial delay to prevent timing attacks / brute force
      return setTimeout(() => {
        res.status(401).json({ success: false, message: 'Password admin salah!' });
      }, 500);
    }

    // Generate secure session token
    const token = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update('admin_' + Date.now() + '_' + Math.random())
      .digest('hex');

    activeAdminTokens.add(token);

    res.json({
      success: true,
      message: 'Login admin berhasil!',
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memproses login: ' + err.message });
  }
});

// AUTH: POST /api/admin/verify (Check token validity)
app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  if (token && activeAdminTokens.has(token)) {
    return res.json({ success: true, valid: true });
  }
  res.json({ success: false, valid: false });
});

// AUTH: POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const { token } = req.body;
  if (token) {
    activeAdminTokens.delete(token);
  }
  res.json({ success: true, message: 'Berhasil logout' });
});

// -------------------------------------------------------------
// PUBLIC API: GET /api/jobs (Visitors can only VIEW)
// -------------------------------------------------------------
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, category, job_type, location, status, sort } = req.query;
    const jobs = await db.getJobs({ search, category, job_type, location, status, sort });
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
      contact_type: contact_type || 'whatsapp',
      contact_value: contact_value ? contact_value.trim() : '',
      deadline: deadline || '',
      status: status || 'active',
      is_featured: is_featured === '1' || is_featured === 1 || is_featured === true || is_featured === 'true'
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
      contact_type: contact_type || existing.contact_type,
      contact_value: contact_value !== undefined ? contact_value.trim() : existing.contact_value,
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

// Page routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Express 5 fallback middleware
app.use((req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
