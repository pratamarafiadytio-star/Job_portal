// ==============================================================
// CEK-CV.JS - Accurate AI Resume Analyzer & Strict Job Matcher
// High Accuracy: Only displays vacancies with verified keyword/skill overlap
// Zero Fallback: If no vacancies match CV qualifications, shows ZERO jobs
// ==============================================================

let allJobs = [];
let analyzedSkills = [];

// Curated Multilingual Skill & Role Dictionary across Industries
const SKILL_KEYWORDS_DICT = [
  // Teknologi, Software & IT
  'react', 'reactjs', 'vue', 'vuejs', 'angular', 'node', 'nodejs', 'express', 'javascript', 'typescript', 'php', 'laravel', 
  'python', 'django', 'fastapi', 'java', 'spring', 'kotlin', 'flutter', 'android', 'ios', 'swift',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 
  'redis', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'github', 'api', 'rest api', 'graphql',
  'ui', 'ux', 'ui/ux', 'figma', 'canva', 'prototyping', 'design system', 'data analyst', 'data science', 
  'machine learning', 'deep learning', 'ai', 'prompt engineering', 'llm', 'devops', 'linux',

  // Manufaktur, Pabrik, Otomotif & Operasional
  'operator', 'operator produksi', 'assembly', 'perakitan', 'teknisi', 'teknisi mesin', 'teknisi listrik', 
  'mekanik', 'maintenance', 'kelistrikan', 'mesin industri', 'manufaktur', 'pabrik', 'quality control', 
  'qc', 'qa', 'quality assurance', 'k3', 'keselamatan kerja', 'hse', 'forklift', 'packing', 'pengemasan', 
  'gudang', 'warehouse', 'logistik', 'inventory', 'plc', 'cnc', 'mesin bubut', 'las', 'welding', 
  'otomotif', 'sparepart', '5s', 'kaizen', 'shift', 'smk teknik',

  // Administrasi, Perkantoran & Kesekretariatan
  'administrasi', 'staf admin', 'data entry', 'microsoft office', 'excel', 'ms excel', 'spreadsheet', 
  'word', 'powerpoint', 'filing', 'pengarsipan', 'korespondensi', 'rekap data', 'rekapitulasi', 'sekretaris',

  // Akuntansi, Pajak & Keuangan
  'akuntansi', 'accounting', 'finance', 'pajak', 'perpajakan', 'tax', 'brevet', 'brevet ab', 'jurnal umum', 
  'pembukuan', 'cash flow', 'laporan keuangan', 'invoicing', 'faktur', 'audit', 'sap', 'accurate', 'myob', 
  'perbankan', 'teller', 'bank',

  // Pemasaran, Penjualan, Konten & Kreatif
  'marketing', 'sales', 'digital marketing', 'seo', 'sem', 'social media', 'sosmed', 'copywriter', 
  'copywriting', 'content creator', 'photoshop', 'illustrator', 'adobe', 'coreldraw', 'desain grafis', 
  'video editing', 'premiere', 'capcut', 'reels', 'tiktok ads', 'meta ads', 'facebook ads', 'google ads', 
  'telemarketing', 'negosiasi', 'b2b', 'b2c',

  // Layanan, Retail, Hospitality & Operasional Lapangan
  'customer service', 'cs', 'frontliner', 'call center', 'layanan pelanggan', 'barista', 'kasir', 
  'waiter', 'waitress', 'pramuniaga', 'kitchen', 'resepsionis', 'driver', 'sim a', 'sim b', 'sim c', 
  'kurir', 'security', 'satpam',

  // Transportasi, BUMN, Logistik & Layanan Stasiun / Penumpang
  'staf layanan penumpang', 'boarding gate', 'verifikasi tiket', 'asistensi penumpang', 'staf stasiun', 
  'transportasi', 'perkeretaapian', 'kai', 'bumn', 'ground staff', 'ticketing', 'pramugara', 'pramugari',
  'dispatcher', 'pengatur perjalanan', 'supply chain', 'purchasing', 'procurement', 'hrd', 'recruitment', 'general affairs'
];

// Education Keywords
const EDU_KEYWORDS = ['sma', 'smk', 'd3', 'd4', 's1', 's2', 'diploma', 'sarjana', 'fresh graduate'];

// Indonesian & English Stopwords for Filtering
const STOPWORDS = new Set([
  'dan', 'yang', 'untuk', 'dengan', 'saya', 'di', 'ke', 'dari', 'ini', 'itu', 'pada', 'oleh', 
  'serta', 'karena', 'adalah', 'sebagai', 'bahwa', 'tentang', 'telah', 'kami', 'anda', 'akan', 
  'bisa', 'dapat', 'tahun', 'bulan', 'hari', 'kerja', 'bekerja', 'memiliki', 'mampu', 'baik', 
  'pt', 'tbk', 'cv', 'lulusan', 'pendidikan', 'pengalaman', 'bidang', 'posisi', 'perusahaan', 
  'the', 'and', 'with', 'for', 'from', 'in', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'have', 
  'has', 'year', 'years', 'skills', 'skill', 'resume', 'curriculum', 'vitae', 'indonesia'
]);

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupCvMatcher();
  loadAllJobs();
});

// Safe storage helper
function safeLocalGet(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
  } catch (e) {}
  return null;
}
function safeLocalSet(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
  } catch (e) {}
}

// Theme handling
function initTheme() {
  const savedTheme = safeLocalGet('kerjahub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      safeLocalSet('kerjahub_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  }
}

const DEFAULT_SUPABASE_URL = "https://nptmawuukuysqzqakwej.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT";

function getApiEndpoint(endpoint) {
  if (!endpoint) return '';
  const clean = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.includes('/job_portal/')) {
    return `/Job_portal${clean}`;
  }
  return clean;
}

async function safeFetchJson(url, options = {}) {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) {
      return { ok: false, status: 0, data: null, error: new Error('Static/offline environment') };
    }
  }
  try {
    const res = await fetch(url, options);
    let data = null;
    try {
      const text = await res.text();
      if (text && text.trim()) data = JSON.parse(text);
    } catch (e) {}
    return { ok: res.ok, status: res.status, data, res };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err };
  }
}

// Site Settings (WhatsApp CV Order, etc.)
window.siteSettings = {
  cv_whatsapp: '081234567890',
  cv_order_message: 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS agar lolos seleksi kerja. Mohon informasi tarif dan prosedurnya. Terima kasih.'
};

window.openCvOrderWhatsApp = function() {
  const settings = window.siteSettings || {};
  let phone = (settings.cv_whatsapp || '081234567890').trim();
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  else if (clean.startsWith('8')) clean = '62' + clean;
  else if (!clean.startsWith('62')) clean = '62' + clean;

  const msg = settings.cv_order_message || 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS agar lolos seleksi kerja. Mohon informasi tarif dan prosedurnya. Terima kasih.';
  window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(msg)}`, '_blank');
};

// Load Jobs and Settings directly from Supabase with API fallback
let cekCvSbClient = null;
const cekCvMemoryStore = {};
async function loadAllJobs() {
  if (window.supabase && typeof window.supabase.createClient === 'function' && !cekCvSbClient) {
    try {
      cekCvSbClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: {
            getItem: (k) => cekCvMemoryStore[k] || null,
            setItem: (k, v) => { cekCvMemoryStore[k] = String(v); },
            removeItem: (k) => { delete cekCvMemoryStore[k]; }
          }
        }
      });
    } catch (e) {
      console.warn('Initial Supabase client error in cek-cv:', e);
    }
  }
  const sb = cekCvSbClient;

  // 1. Direct Supabase Query (works instantly on GitHub Pages, workdev, and local)
  if (sb) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000));
      const fetchPromise = sb.from('jobs').select('*').in('status', ['active']);
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      if (!error && Array.isArray(data) && data.length > 0) {
        const normalizer = typeof window.cleanJobData === 'function' ? window.cleanJobData : (j => j);
        allJobs = data.map(normalizer).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
      }
    } catch (e) {
      console.warn('Direct Supabase jobs fetch failed in cek-cv:', e);
    }

    try {
      const { data: stData } = await sb.from('jobs').select('description').eq('status', 'system_settings').limit(1);
      if (stData && stData.length > 0 && stData[0].description) {
        try {
          const s = JSON.parse(stData[0].description);
          if (s.cv_whatsapp) window.siteSettings.cv_whatsapp = s.cv_whatsapp;
          if (s.cv_order_message) window.siteSettings.cv_order_message = s.cv_order_message;
        } catch (err) {}
      }
    } catch (e) {}
  }

  // 2. Fallback to API if allJobs still empty
  if (allJobs.length === 0) {
    try {
      const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/jobs'));
      if (ok && json && json.success && Array.isArray(json.data)) {
        const normalizer = typeof window.cleanJobData === 'function' ? window.cleanJobData : (j => j);
        allJobs = json.data.map(normalizer).filter(j => j.status === 'active' || !j.status);
      }
    } catch (err) {
      console.warn('API jobs fetch warning in cek-cv:', err);
    }
  }

  // 3. Runtime settings override from /api/config if available
  try {
    const { ok, data: cfg } = await safeFetchJson(getApiEndpoint('/api/config'));
    if (ok && cfg) {
      if (cfg.cv_whatsapp) {
        window.siteSettings.cv_whatsapp = cfg.cv_whatsapp;
      }
      if (cfg.cv_order_message) {
        window.siteSettings.cv_order_message = cfg.cv_order_message;
      }
    }
  } catch (e) {}
}

// Setup CV Matcher Listeners
function setupCvMatcher() {
  const dropzone = document.getElementById('cv-dropzone');
  const fileInput = document.getElementById('cv-file-input');
  const browseBtn = document.getElementById('btn-browse-cv');
  const pasteInput = document.getElementById('cv-paste-input');
  const analyzeBtn = document.getElementById('btn-analyze-cv');
  const resetBtn = document.getElementById('btn-reset-cv');

  if (browseBtn && fileInput) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = 'rgba(99, 102, 241, 0.12)';
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleCvFileUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleCvFileUpload(e.target.files[0]);
      }
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      const text = pasteInput ? pasteInput.value.trim() : '';
      if (!text) {
        showToast('error', 'Silakan unggah dokumen CV atau tempel teks keahlian Anda.');
        return;
      }
      await runCvAnalysis(text, 'Teks Input Pengalaman');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetCvMatcher);
  }
}

// Handle File Upload (PDF, DOCX, TXT)
async function handleCvFileUpload(file) {
  const titleEl = document.getElementById('cv-drop-title');
  const subtitleEl = document.getElementById('cv-drop-subtitle');
  if (titleEl) titleEl.textContent = `Memproses: ${file.name}...`;
  if (subtitleEl) subtitleEl.textContent = 'Mengekstrak teks & menganalisis keahlian dengan AI...';

  try {
    let text = '';
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf' && window.pdfjsLib) {
      if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 6);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      text = fullText;
    } else {
      text = await file.text();
    }

    if (!text || text.trim().length < 15) {
      text = file.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
    }

    if (titleEl) titleEl.textContent = `Dokumen: ${file.name}`;
    if (subtitleEl) subtitleEl.textContent = 'Analisis selesai! Rekomendasi akurat ditampilkan di bawah.';

    const pasteInput = document.getElementById('cv-paste-input');
    if (pasteInput && text.length > 30) {
      pasteInput.value = text.slice(0, 300) + '...';
    }

    await runCvAnalysis(text, file.name);
  } catch (err) {
    console.error('File parsing error:', err);
    if (titleEl) titleEl.textContent = 'Gagal membaca berkas otomatis';
    if (subtitleEl) subtitleEl.textContent = 'Silakan coba tempel teks keahlian langsung ke kolom teks.';
    showToast('error', 'Gagal memproses berkas otomatis. Silakan tempel teks CV Anda langsung ke kotak teks.');
  }
}

// -------------------------------------------------------------
// STRICT & ACCURATE CV MATCHING ENGINE
// -------------------------------------------------------------
function extractCvKeywords(rawText) {
  const lower = (rawText || '').toLowerCase();

  // 1. Match dictionary skills with word boundaries
  const detectedSkills = [];
  SKILL_KEYWORDS_DICT.forEach(skill => {
    const escaped = skill.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      if (!detectedSkills.includes(skill)) detectedSkills.push(skill);
    }
  });

  // 2. Extract education mentions
  const detectedEdu = [];
  EDU_KEYWORDS.forEach(edu => {
    const regex = new RegExp(`(^|[^a-z0-9])${edu}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      detectedEdu.push(edu);
    }
  });

  // 3. Extract meaningful raw tokens (>= 4 chars, not stopwords)
  const tokens = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w));

  const uniqueTokens = Array.from(new Set(tokens));

  return {
    rawText: lower,
    detectedSkills,
    detectedEdu,
    uniqueTokens
  };
}

// Run CV Analysis
async function runCvAnalysis(rawText, sourceName) {
  // Always fetch latest jobs from database to ensure high accuracy with all posted vacancies
  await loadAllJobs();

  const cvData = extractCvKeywords(rawText);
  analyzedSkills = cvData.detectedSkills;

  // Show Detected Skills Bar
  const skillsBar = document.getElementById('skills-detected-bar');
  const skillsWrap = document.getElementById('skills-pills-wrap');
  const skillsCount = document.getElementById('skills-count-text');

  if (skillsBar && skillsWrap) {
    skillsBar.style.display = 'block';
    if (skillsCount) {
      skillsCount.textContent = `${cvData.detectedSkills.length} Keahlian Teridentifikasi`;
    }

    if (cvData.detectedSkills.length > 0) {
      skillsWrap.innerHTML = cvData.detectedSkills.map(s => `
        <span class="skill-chip"><i class="fa-solid fa-check"></i> ${s.toUpperCase()}</span>
      `).join('');
    } else {
      skillsWrap.innerHTML = `
        <span style="font-size: 0.82rem; color: var(--text-muted); font-style: italic;">
          Tidak ada kata kunci teknis standar terdeteksi. Sistem menggunakan pencocokan kata kunci profil & posisi langsung.
        </span>
      `;
    }
  }

  // STRICT SCORING: Evaluate only active jobs against the CV keywords
  const activeJobsList = allJobs.filter(j => j.status === 'active' || !j.status);
  const matchedJobs = [];

  for (const job of activeJobsList) {
    const titleLower = (job.title || '').toLowerCase();
    const catLower = (job.category || '').toLowerCase();
    const descLower = (job.description || '').toLowerCase();
    const parseList = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.startsWith('[') ? JSON.parse(val || '[]') : [val || '']);
    const reqsText = parseList(job.requirements).join(' ').toLowerCase();
    const respsText = parseList(job.responsibilities).join(' ').toLowerCase();

    const jobFullText = [titleLower, catLower, descLower, reqsText, respsText].join(' ');

    // 1. Check which detected candidate skills actually exist in this job
    const matchedSkills = [];
    cvData.detectedSkills.forEach(s => {
      const escaped = s.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&');
      const reg = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
      if (reg.test(jobFullText)) {
        matchedSkills.push(s);
      }
    });

    // 2. Check title / role overlap
    const titleWords = titleLower.split(/[\s/&\-]+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));
    const matchedTitleWords = titleWords.filter(w => cvData.rawText.includes(w));
    const hasRoleMatch = matchedTitleWords.length > 0;

    // 3. Check requirement token overlap
    const matchedReqTokens = cvData.uniqueTokens.filter(t => reqsText.includes(t) || titleLower.includes(t));

    // STRICT FILTER: If ZERO skills match and NO role/title words match, it is NOT A MATCH!
    if (matchedSkills.length === 0 && !hasRoleMatch && matchedReqTokens.length === 0) {
      continue; // Strictly omit job - zero match!
    }

    // Calculate score starting from 0 (NO arbitrary default base!)
    let score = 0;

    // Skill match points
    if (matchedSkills.length > 0) {
      score += Math.min(matchedSkills.length * 20, 55);
    }

    // Role / Title match points
    if (hasRoleMatch) {
      score += Math.min(matchedTitleWords.length * 20, 30);
    }

    // Specific requirements overlap
    if (matchedReqTokens.length > 0) {
      score += Math.min(matchedReqTokens.length * 6, 18);
    }

    // Category relevance
    const catWords = catLower.split(/[\s/&\-]+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));
    if (catWords.some(w => cvData.rawText.includes(w))) {
      score += 8;
    }

    // Education match
    if (cvData.detectedEdu.some(e => reqsText.includes(e))) {
      score += 7;
    }

    // STRICT THRESHOLD: Must have at least 40% match AND verified matches
    if (score < 40) {
      continue; // Drop jobs with weak or incidental matches
    }

    score = Math.min(Math.max(score, 45), 98);

    matchedJobs.push({
      ...job,
      matchScore: score,
      matchedSkills,
      matchedTitleWords
    });
  }

  // Sort descending by match score
  matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Update Status Bar
  const statusBar = document.getElementById('cv-match-status-bar');
  const statusTitle = document.getElementById('cv-match-title');
  const statusSub = document.getElementById('cv-match-subtitle');

  if (statusBar) {
    statusBar.style.display = 'flex';
    if (matchedJobs.length > 0) {
      statusBar.style.background = 'rgba(16, 185, 129, 0.1)';
      statusBar.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      if (statusTitle) {
        statusTitle.textContent = `Analisis Selesai: Menemukan ${matchedJobs.length} Lowongan yang Sangat Cocok!`;
        statusTitle.style.color = '#059669';
      }
      if (statusSub) {
        statusSub.textContent = 'Semua lowongan di bawah telah disaring akurat berdasarkan keahlian dan kualifikasi pada CV Anda.';
      }
    } else {
      statusBar.style.background = 'rgba(239, 68, 68, 0.08)';
      statusBar.style.borderColor = 'rgba(239, 68, 68, 0.25)';
      if (statusTitle) {
        statusTitle.textContent = 'Analisis Selesai: 0 Lowongan Relevan';
        statusTitle.style.color = '#dc2626';
      }
      if (statusSub) {
        statusSub.textContent = 'Tidak ditemukan lowongan aktif di database yang memenuhi kualifikasi CV ini.';
      }
    }
  }

  renderMatchedJobs(matchedJobs);

  // Smooth scroll to results
  document.getElementById('matched-jobs-container')?.scrollIntoView({ behavior: 'smooth' });
}

// Render Matched Jobs (Strict Zero-Match Handling)
function renderMatchedJobs(jobs) {
  const container = document.getElementById('matched-jobs-container');
  const countEl = document.getElementById('matched-results-count');

  if (!container) return;

  // ZERO MATCH STATE: If no jobs match, display clean zero-match state - NO unrelated jobs!
  if (!jobs || jobs.length === 0) {
    if (countEl) {
      countEl.textContent = '0 lowongan cocok ditemukan (Penyaringan Ketat & Akurat)';
    }

    container.innerHTML = `
      <div class="cv-zero-matches" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--bg-surface); border: 1.5px dashed var(--border-color); border-radius: var(--radius-lg); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 16px;">
          <i class="fa-solid fa-file-circle-xmark"></i>
        </div>
        <h3 style="color: var(--text-main); font-size: 1.3rem; font-weight: 800; margin-bottom: 8px;">
          Tidak Ada Lowongan yang Cocok dengan Kualifikasi CV Anda
        </h3>
        <p style="color: var(--text-muted); max-width: 540px; margin: 0 auto 18px; font-size: 0.92rem; line-height: 1.6;">
          Sistem kami menyaring secara akurat berdasarkan kata kunci keahlian, posisi kerja, dan persyaratan lowongan. Saat ini belum ditemukan lowongan aktif di database yang membutuhkan spesifikasi keahlian yang tercantum pada dokumen ini.
        </p>

        <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 16px 20px; max-width: 520px; margin: 0 auto 24px; text-align: left; font-size: 0.85rem; color: var(--text-muted);">
          <strong style="color: var(--primary); display: block; margin-bottom: 6px;">
            <i class="fa-solid fa-lightbulb"></i> Tips Agar Hasil Lebih Akurat:
          </strong>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Cantumkan nama posisi target yang jelas (misal: <em>Operator Produksi, Frontend Developer, Staf Akuntansi, Admin</em>).</li>
            <li>Sertakan nama alat kerja, software, mesin, atau bahasa pemrograman (misal: <em>Excel, K3, Figma, React, Mesin CNC, SAP</em>).</li>
            <li>Tuliskan riwayat pendidikan (SMA/SMK/D3/S1) dan jurusan secara lengkap.</li>
          </ul>
        </div>

        <div style="display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('cv-paste-input').focus()">
            <i class="fa-solid fa-pen-to-square"></i> Perbarui Teks CV
          </button>
          <a href="./#lowongan" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-briefcase"></i> Lihat Semua Lowongan di Portal
          </a>
        </div>
      </div>
    `;
    return;
  }

  // MATCHED JOBS FOUND
  // MATCHED JOBS FOUND
  if (countEl) {
    countEl.textContent = `Menemukan ${jobs.length} rekomendasi lowongan resmi yang paling cocok dengan kualifikasi CV Anda.`;
  }

  container.innerHTML = jobs.map(rawJob => {
    const job = typeof window.cleanJobData === 'function' ? window.cleanJobData(rawJob) : rawJob;
    const coverSrc = getEffectiveJobCover(job);
    const initial = job.company_name ? job.company_name.replace(/^(PT|CV)\s+/i, '').trim().charAt(0).toUpperCase() || 'C' : 'C';
    const timeAgo = formatTimeAgo(job.created_at);

    let badgeLabel = 'Sangat Cocok';
    let grad = 'linear-gradient(135deg, #10b981, #059669)';
    if (job.matchScore < 60) {
      badgeLabel = 'Cukup Relevan';
      grad = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else if (job.matchScore < 80) {
      badgeLabel = 'Cocok';
      grad = 'linear-gradient(135deg, #6366f1, #4f46e5)';
    }

    const skillsToDisplay = (job.matchedSkills && job.matchedSkills.length > 0)
      ? job.matchedSkills
      : (job.matchedTitleWords || []);

    const safeTitle = (job.title || '').replace(/'/g, "\\'");

    return `
      <div class="job-card" data-id="${job.id}">
        <!-- Foto Sampul Kartu / Poster Preview with Lightbox trigger -->
        <div class="job-poster-preview" onclick="openJobDetailModal(${job.id})" title="Klik untuk melihat postingan lengkap: ${escapeHtml(job.title)}">
          <img src="${coverSrc}" alt="${escapeHtml(job.title)}" loading="lazy" onerror="window.handlePublicPosterError && window.handlePublicPosterError(this, ${job.id});">
          <div class="badge-featured" style="background: ${grad};" title="Persentase kesesuaian AI">
            <i class="fa-solid fa-bolt"></i> ${job.matchScore}% ${badgeLabel}
          </div>
          <div class="badge-category">${escapeHtml(job.category || 'Lowongan Resmi')}</div>
          <div class="poster-overlay">
            <span class="poster-badge-btn"><i class="fa-solid fa-file-lines"></i> Lihat Postingan</span>
          </div>
        </div>

        <div class="job-card-body">
          <div class="company-row">
            <div class="company-avatar">${initial}</div>
            <div class="company-meta">
              <div class="company-name" title="${escapeHtml(job.company_name)}">${escapeHtml(job.company_name)}</div>
              <div class="job-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location || 'Indonesia')}</div>
            </div>
          </div>

          <h3 class="job-title" onclick="openJobDetailModal(${job.id})" title="Klik untuk melihat postingan lengkap">${escapeHtml(job.title)}</h3>

          <div class="job-badges">
            <span class="pill pill-platform pill-official"><i class="fa-solid fa-circle-check"></i> Rekrutmen Resmi</span>
            <span class="pill pill-type"><i class="fa-regular fa-clock"></i> ${escapeHtml(job.job_type || 'Full Time')}</span>
            ${job.salary_display ? `<span class="pill pill-salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</span>` : ''}
          </div>

          <!-- CV Match Score & Detected Skills -->
          <div style="margin-top: 4px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span class="cv-match-badge" style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.76rem; font-weight: 700; color: #047857; background: rgba(16, 185, 129, 0.12); padding: 3px 10px; border-radius: 999px;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Kecocokan Profil: ${job.matchScore}%
              </span>
            </div>
            ${skillsToDisplay && skillsToDisplay.length > 0 ? `
              <div class="matched-skills-chips" style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Skill Terdeteksi:</span>
                ${skillsToDisplay.slice(0, 5).map(s => `
                  <span class="matched-skill-tag" style="background: rgba(99, 102, 241, 0.1); color: var(--primary); font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 3px;">
                    <i class="fa-solid fa-check" style="font-size: 0.65rem;"></i> ${escapeHtml(s)}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <p class="job-excerpt">${escapeHtml(job.description ? job.description.slice(0, 140) + '...' : '')}</p>

          <div class="job-card-footer" style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span class="posted-time" style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${timeAgo}</span>
            <div class="card-actions" style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-outline btn-sm" onclick="openJobDetailModal(${job.id})" title="Lihat postingan lowongan lengkap">
                <i class="fa-solid fa-file-lines"></i> Lihat Postingan
              </button>
              <button type="button" class="btn btn-primary btn-sm btn-apply-direct" onclick="directApplyFromCekCv(${job.id}, event)" title="Lamar sekarang langsung ke lowongan ini">
                <i class="fa-solid fa-paper-plane"></i> Lamar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Reset Matcher
function resetCvMatcher() {
  const pasteInput = document.getElementById('cv-paste-input');
  const fileInput = document.getElementById('cv-file-input');
  const dropTitle = document.getElementById('cv-drop-title');
  const dropSubtitle = document.getElementById('cv-drop-subtitle');
  const statusBar = document.getElementById('cv-match-status-bar');
  const skillsBar = document.getElementById('skills-detected-bar');

  if (pasteInput) pasteInput.value = '';
  if (fileInput) fileInput.value = '';
  if (dropTitle) dropTitle.textContent = 'Pilih Berkas CV Anda (PDF, DOCX, TXT)';
  if (dropSubtitle) dropSubtitle.textContent = 'Klik di sini untuk menjelajah dokumen atau seret & lepas berkas langsung ke area ini';
  if (statusBar) statusBar.style.display = 'none';
  if (skillsBar) skillsBar.style.display = 'none';

  const countEl = document.getElementById('matched-results-count');
  if (countEl) {
    countEl.textContent = 'Menampilkan lowongan resmi terurut berdasarkan kecocokan profil.';
  }

  const container = document.getElementById('matched-jobs-container');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
        <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.4rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="color: var(--text-main); margin-bottom: 6px;">Silakan Unggah CV Anda di Atas</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 460px; margin: 0 auto;">
          Sistem kami akan segera memproses dokumen Anda dan menampilkan rekomendasi pekerjaan dengan persentase kecocokan tertinggi.
        </p>
      </div>
    `;
  }
}

// Helpers: Universal Contact Extractor
function extractJobContacts(job) {
  let wa = (job.whatsapp || '').trim();
  let email = (job.email || '').trim();
  let website = (job.website_url || job.official_url || job.url || job.website || '').trim();

  if (job.contact_value) {
    const raw = String(job.contact_value).trim();
    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        wa = parsed.whatsapp || wa;
        email = parsed.email || email;
        website = parsed.website || parsed.website_url || website;
      } catch (e) {}
    } else {
      if (raw.match(/^(\+?62|08)/)) wa = wa || raw;
      else if (raw.includes('@')) email = email || raw;
      else website = website || raw;
    }
  }

  // Intercept Google News links or missing links and route to genuine portal
  const isGenericNewsUrl = !website || website.startsWith('{') || website.includes('news.google.com') || website.includes('bing.com/news');
  const comp = (job.company_name || '').toLowerCase();
  const title = (job.title || '').toLowerCase();

  if (isGenericNewsUrl) {
    if (comp.includes('patra drilling') || comp.includes('pdc') || title.includes('patra drilling')) {
      website = 'https://karir.pertamina-pdc.com';
    } else if (comp.includes('bukajobs') || (job.source_platform || '').includes('bukajobs')) {
      website = 'https://bukajobs.com';
    } else if (comp.includes('bca') || comp.includes('central asia')) {
      website = 'https://karir.bca.co.id';
    } else if (comp.includes('toyota') || comp.includes('tmmin')) {
      website = 'https://recruitment.toyota.co.id';
    } else if (comp.includes('astra honda') || comp.includes('ahm')) {
      website = 'https://recruitment.astra-honda.com';
    } else if (comp.includes('telkom')) {
      website = 'https://careers.telkom.co.id';
    } else if (comp.includes('bri') || comp.includes('rakyat indonesia')) {
      website = 'https://e-recruitment.bri.co.id';
    } else if (comp.includes('mayora')) {
      website = 'https://mayorakarir.com';
    } else if (comp.includes('kai') || comp.includes('kereta api')) {
      website = 'https://recruitment.kai.id';
    } else if (comp.includes('kalbe')) {
      website = 'https://careers.kalbe.co.id';
    } else if (comp.includes('yamaha')) {
      website = 'https://www.yamaha-motor.co.id/career';
    } else if (comp.includes('indofood') || comp.includes('indolakto')) {
      website = 'https://careers.indofood.com';
    } else if (comp.includes('shopee')) {
      website = 'https://careers.shopee.co.id';
    } else if (comp.includes('krakatau')) {
      website = 'https://krakatausteel.com/career';
    } else if (comp.includes('bumn')) {
      website = 'https://rekrutmenbersama.fhcibumn.id';
    }
  }

  if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
    website = `https://${website}`;
  }

  return { whatsapp: wa, email, website_url: website };
}

// Open Full Job Post Detail Modal
window.openJobDetailModal = function(id) {
  const rawJob = allJobs.find(j => String(j.id) === String(id));
  if (!rawJob) return;
  const job = typeof window.cleanJobData === 'function' ? window.cleanJobData(rawJob) : rawJob;

  const modal = document.getElementById('job-detail-modal');
  const content = document.getElementById('job-detail-content');
  if (!modal || !content) return;

  const heroCoverSrc = getEffectiveJobCover(job);
  const contacts = extractJobContacts(job);
  const safeTitle = (job.title || '').replace(/'/g, "\\'");
  const safeCompany = (job.company_name || '').replace(/'/g, "\\'");

  const parseList = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.startsWith('[') ? JSON.parse(val || '[]') : [val || '']);
  const reqs = parseList(job.requirements).filter(r => r && String(r).trim());
  const resps = parseList(job.responsibilities).filter(r => r && String(r).trim());
  const benefits = parseList(job.benefits).filter(b => b && String(b).trim());

  // Clean candidate application message template without KerjaHub
  const waTemplate = `Halo Bapak/Ibu HRD ${job.company_name},\n\nPerkenalkan saya [Nama Anda]. Saya bermaksud mengajukan lamaran kerja untuk posisi ${job.title}.\n\nBersama pesan ini, saya siap melampirkan berkas CV dan Portofolio terbaru saya sebagai bahan pertimbangan.\n\nMohon informasi mengenai tahapan proses seleksi selanjutnya. Terima kasih banyak atas perhatian dan kesempatannya.`;

  content.innerHTML = `
    <!-- Header Banner Sampul Lowongan (16:9 Landscape Corporate Cover) -->
    <div class="modal-hero-banner" id="hero-banner-${job.id}">
      <img src="${heroCoverSrc}" alt="${escapeHtml(job.title)}" onerror="window.handlePublicPosterError && window.handlePublicPosterError(this, ${job.id});">
      <div class="modal-banner-overlay">
        <div class="modal-header-info">
          <h2>${escapeHtml(job.title)}</h2>
          <div class="modal-header-meta">
            <span><i class="fa-solid fa-building"></i> ${escapeHtml(job.company_name)}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location || 'Indonesia')}</span>
            <span><i class="fa-solid fa-tag"></i> ${escapeHtml(job.category || 'Lowongan')}</span>
            <span><i class="fa-regular fa-clock"></i> ${escapeHtml(job.job_type || 'Full Time')}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="detail-grid-layout">
        <div class="detail-main">
          
          <!-- Keterangan & Deskripsi Posisi -->
          <div class="detail-section">
            <h4><i class="fa-solid fa-file-lines"></i> Keterangan & Deskripsi Posisi</h4>
            <div class="desc-meta-chips">
              <div class="desc-meta-chip">
                <i class="fa-solid fa-briefcase"></i>
                <span><strong>Status:</strong> ${escapeHtml(job.job_type || 'Full Time')}</span>
              </div>
              <div class="desc-meta-chip">
                <i class="fa-solid fa-graduation-cap"></i>
                <span><strong>Pendidikan:</strong> ${escapeHtml(job.experience_level || 'Sesuai Kualifikasi')}</span>
              </div>
              <div class="desc-meta-chip">
                <i class="fa-solid fa-location-dot"></i>
                <span><strong>Penempatan:</strong> ${escapeHtml(job.location || 'Indonesia')}</span>
              </div>
            </div>
            <div class="desc-body-box">
              <p class="desc-body-text" style="white-space: pre-line;">${escapeHtml(job.description)}</p>
            </div>
          </div>

          <!-- Tanggung Jawab -->
          ${resps.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-list-check"></i> Tanggung Jawab Pekerjaan</h4>
              <ul class="detail-list" style="padding-left: 20px; line-height: 1.7; color: var(--text-muted);">
                ${resps.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Kualifikasi & Persyaratan -->
          ${reqs.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-user-check"></i> Kualifikasi & Persyaratan</h4>
              <ul class="detail-list" style="padding-left: 20px; line-height: 1.7; color: var(--text-muted);">
                ${reqs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Benefit -->
          ${benefits.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-gift"></i> Benefit & Keuntungan</h4>
              <div class="benefits-pills" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${benefits.map(b => `<div class="benefit-tag" style="background: rgba(16, 185, 129, 0.1); color: #059669; font-size: 0.82rem; font-weight: 700; padding: 4px 12px; border-radius: 20px;"><i class="fa-solid fa-check-circle"></i> ${escapeHtml(b)}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Template Pesan Lamaran ke HRD -->
          <div class="chat-template-card" style="background: var(--bg-surface-alt); border: 1px dashed var(--border-color); border-radius: 12px; padding: 18px;">
            <div class="chat-template-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.84rem; font-weight: 800; color: var(--text-main);">
                <i class="fa-solid fa-comment-dots" style="color: var(--primary);"></i> Template Pesan Pengajuan Lamaran:
              </span>
              <button type="button" class="btn btn-outline btn-sm" onclick="copyApplicationTemplate('${safeTitle}', '${safeCompany}')">
                <i class="fa-regular fa-copy"></i> Salin Pesan
              </button>
            </div>
            <div class="chat-template-text" id="wa-template-box" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-size: 0.85rem; line-height: 1.6; color: var(--text-main); white-space: pre-wrap;">${escapeHtml(waTemplate)}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 6px;">
              * Salin pesan di atas dan ganti <code>[Nama Anda]</code> sebelum mengirim ke kontak perekrut resmi.
            </div>
          </div>

        </div>

        <!-- Sidebar Info -->
        <div class="detail-sidebar" style="display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Primary Application Action Channels -->
          <div class="sidebar-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 20px;">
            <div class="sidebar-card-title" style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 12px;">
              <i class="fa-solid fa-paper-plane" style="color: var(--primary);"></i> Lamar Posisi Ini
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${contacts.website_url ? `
                <a href="${contacts.website_url.startsWith('http') ? contacts.website_url : 'https://' + contacts.website_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; text-decoration: none;">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Lamar di Portal Resmi
                </a>
              ` : ''}
              ${contacts.whatsapp ? `
                <button type="button" class="btn btn-primary" onclick="triggerWhatsAppChat('${contacts.whatsapp}', '${safeCompany}', '${safeTitle}')" style="background: #25d366; border-color: #25d366; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px;">
                  <i class="fa-brands fa-whatsapp"></i> Chat WhatsApp HRD
                </button>
              ` : ''}
              ${contacts.email ? `
                <button type="button" class="btn btn-outline" onclick="triggerEmailApplication('${contacts.email}', '${safeCompany}', '${safeTitle}')" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px;">
                  <i class="fa-solid fa-envelope"></i> Kirim Lamaran via Email
                </button>
              ` : ''}
              ${!contacts.website_url && !contacts.whatsapp && !contacts.email ? `
                <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 10px;">
                  Kontak langsung belum disertakan. Silakan cek informasi pada deskripsi postingan di atas.
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Ringkasan Lowongan -->
          <div class="sidebar-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 20px;">
            <div class="sidebar-card-title" style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 14px;">Ringkasan Lowongan</div>
            
            <div style="margin-bottom: 12px; font-size: 0.88rem;">
              <span style="color: var(--text-muted); display: block; font-size: 0.76rem;">Gaji Ditawarkan</span>
              <strong style="color: #059669; font-size: 1rem;">${escapeHtml(job.salary_display || 'Kompetitif')}</strong>
            </div>

            <div style="margin-bottom: 12px; font-size: 0.88rem;">
              <span style="color: var(--text-muted); display: block; font-size: 0.76rem;">Tipe Pekerjaan</span>
              <strong style="color: var(--text-main);">${escapeHtml(job.job_type || 'Full Time')}</strong>
            </div>

            <div style="margin-bottom: 12px; font-size: 0.88rem;">
              <span style="color: var(--text-muted); display: block; font-size: 0.76rem;">Lokasi Penempatan</span>
              <strong style="color: var(--text-main);">${escapeHtml(job.location || 'Indonesia')}</strong>
            </div>

            <div style="font-size: 0.88rem;">
              <span style="color: var(--text-muted); display: block; font-size: 0.76rem;">Pendidikan Minimal</span>
              <strong style="color: var(--text-main);">${escapeHtml(job.experience_level || 'Sesuai Kualifikasi')}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeJobDetailModal = function() {
  const modal = document.getElementById('job-detail-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

// Direct Apply from Card
window.directApplyFromCekCv = function(jobId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const rawJob = allJobs.find(j => String(j.id) === String(jobId));
  if (!rawJob) {
    showToast('error', 'Data lowongan tidak ditemukan.');
    return;
  }
  const job = typeof window.cleanJobData === 'function' ? window.cleanJobData(rawJob) : rawJob;
  const contacts = extractJobContacts(job);
  const comp = job.company_name || 'Perusahaan';
  const title = job.title || 'Posisi';

  if (contacts.website_url) {
    showToast('info', `Membuka portal pendaftaran resmi ${comp}...`);
    window.open(contacts.website_url, '_blank', 'noopener,noreferrer');
    return;
  }
  if (contacts.whatsapp) {
    showToast('info', `Menghubungkan langsung ke WhatsApp HRD ${comp}...`);
    triggerWhatsAppChat(contacts.whatsapp, comp, title);
    return;
  }
  if (contacts.email) {
    showToast('info', `Membuka draf lamaran email HRD ${comp}...`);
    triggerEmailApplication(contacts.email, comp, title);
    return;
  }
  openJobDetailModal(jobId);
};

// Lightbox
window.openLightbox = function(src, title) {
  const lb = document.getElementById('poster-lightbox');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const dl = document.getElementById('lightbox-download');
  if (lb && img) {
    img.src = src;
    if (titleEl && title) titleEl.textContent = title;
    if (dl) dl.href = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const lb = document.getElementById('poster-lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
};

// WhatsApp Launcher with Clean Candidate Template (Without KerjaHub)
window.triggerWhatsAppChat = function(phone, comp, title) {
  if (!phone) return;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  else if (clean.startsWith('8')) clean = '62' + clean;
  else if (!clean.startsWith('62')) clean = '62' + clean;

  const msg = encodeURIComponent(`Halo Bapak/Ibu HRD ${comp || 'Perusahaan'},\n\nPerkenalkan saya [Nama Anda]. Saya bermaksud mengajukan lamaran kerja untuk posisi ${title || 'Pekerjaan'}.\n\nBersama pesan ini, saya siap melampirkan berkas CV dan Portofolio terbaru saya sebagai bahan pertimbangan.\n\nMohon informasi mengenai tahapan proses seleksi selanjutnya. Terima kasih banyak atas perhatian dan kesempatannya.`);
  window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${msg}`, '_blank');
};

// Email Launcher with Clean Candidate Template (Without KerjaHub)
window.openWebmail = function(provider, email, companyName, jobTitle) {
  if (!email) {
    showToast('error', 'Alamat email rekruter tidak tersedia.');
    return;
  }
  const subject = `Lamaran Pekerjaan: ${jobTitle || 'Posisi'} - [Nama Anda]`;
  const body = `Halo Tim HRD / Rekrutmen ${companyName || 'Perusahaan'},\n\nPerkenalkan saya [Nama Anda]. Saya bermaksud mengajukan lamaran kerja untuk posisi ${jobTitle || 'Pekerjaan'}.\n\nBersama email ini saya melampirkan berkas Curriculum Vitae (CV) dan Portofolio terbaru saya untuk dijadikan bahan pertimbangan.\n\nBesar harapan saya untuk dapat mengikuti tahapan proses seleksi selanjutnya. Terima kasih banyak atas waktu dan kesempatan yang diberikan.\n\nSalam hormat,\n[Nama Anda]\n[Nomor WhatsApp / Kontak]`;

  const encEmail = encodeURIComponent(email);
  const encSub = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);

  if (provider === 'gmail') {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encEmail}&su=${encSub}&body=${encBody}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = `mailto:${encEmail}?subject=${encSub}&body=${encBody}`;
  }
};

window.triggerEmailApplication = function(email, companyName, jobTitle) {
  window.openWebmail('gmail', email, companyName, jobTitle);
};

window.copyApplicationTemplate = function(title, company) {
  const box = document.getElementById('wa-template-box');
  const text = box ? box.textContent : `Halo HRD ${company}, saya bermaksud mengajukan lamaran kerja untuk posisi ${title}. Bersama pesan ini saya siap melampirkan berkas CV saya. Terima kasih.`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('success', 'Template pesan lamaran berhasil disalin ke clipboard.');
  });
};

// Dynamic Cover & Banner Generator
function hashStr(str) {
  let hash = 0;
  if (!str) return 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const corporateBannerPalettes = [
  { bg1: '#0f172a', bg2: '#1e1b4b', bg3: '#312e81', accent: '#6366f1', textAccent: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  { bg1: '#022c22', bg2: '#064e3b', bg3: '#065f46', accent: '#10b981', textAccent: '#6ee7b7', border: 'rgba(160,185,129,0.3)' },
  { bg1: '#082f49', bg2: '#0c4a6e', bg3: '#075985', accent: '#0284c7', textAccent: '#7dd3fc', border: 'rgba(2,132,199,0.3)' },
  { bg1: '#1e1035', bg2: '#2e1065', bg3: '#581c87', accent: '#a855f7', textAccent: '#d8b4fe', border: 'rgba(168,85,247,0.3)' },
  { bg1: '#1c1917', bg2: '#292524', bg3: '#44403c', accent: '#f59e0b', textAccent: '#fde68a', border: 'rgba(245,158,11,0.3)' },
  { bg1: '#090d16', bg2: '#1e293b', bg3: '#334155', accent: '#38bdf8', textAccent: '#bae6fd', border: 'rgba(56,189,248,0.3)' }
];

function escapeSvgText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getEffectiveCompanyName(job) {
  if (!job) return 'Perusahaan Terverifikasi';
  const comp = (job.company_name || '').trim();
  const title = (job.title || '').trim();
  const isGeneric = /^(bukajobs|linkedin|instagram|facebook|portal|web|loker|official|resmi)/i.test(comp);
  const ptMatch = title.match(/(?:(?:Lowongan|Rekrutmen|Karir|Loker)\s+(?:di\s+|pada\s+)?)?((?:PT|CV|Bank|Yayasan|RSUD|RS)\s+[^–\-|:]+)/i);
  if (ptMatch && ptMatch[1] && (isGeneric || comp.length < 5)) {
    return ptMatch[1].trim();
  }
  if (/^(PT|CV|Bank|Yayasan)\s+/i.test(title) && isGeneric) {
    return title;
  }
  return comp || title || 'Perusahaan Terverifikasi';
}

function isManualJobFlyer(job) {
  if (!job || !job.poster_image) return false;
  const p = String(job.poster_image).trim();
  if (!p) return false;
  if (p.includes('unsplash.com')) return false;
  if (p.includes('placeholder')) return false;
  if (p.includes('sample_')) return false;
  if (p.includes('corporate_worker_mascot') || p.includes('factory_operator_mascot')) {
    return false;
  }
  if (p.startsWith('/uploads/') || p.startsWith('./uploads/') || p.startsWith('uploads/') || p.startsWith('data:image/')) {
    return true;
  }
  if (p.startsWith('http://') || p.startsWith('https://')) {
    return true;
  }
  return false;
}

function generateCompanyBannerDataUrl(job) {
  const compName = getEffectiveCompanyName(job);
  const title = (job.title || '').trim();
  const cat = (job.category || 'Lowongan Resmi').toUpperCase();
  const initial = compName ? compName.replace(/^(PT|CV)\s+/i, '').trim().charAt(0).toUpperCase() || 'C' : 'C';

  const hash = hashStr(compName);
  const palette = corporateBannerPalettes[hash % corporateBannerPalettes.length];

  const displayComp = escapeSvgText(compName);
  const displayTitle = escapeSvgText(title);
  const displayCat = escapeSvgText(cat);

  let compFontSize = 32;
  if (displayComp.length > 35) compFontSize = 22;
  else if (displayComp.length > 25) compFontSize = 26;
  else if (displayComp.length > 18) compFontSize = 29;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}"/>
        <stop offset="50%" stop-color="${palette.bg2}"/>
        <stop offset="100%" stop-color="${palette.bg3}"/>
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
      </linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/>
      </filter>
    </defs>
    <rect width="800" height="420" fill="url(#bgGrad)"/>
    <rect width="800" height="420" fill="url(#grid)"/>
    <circle cx="720" cy="80" r="140" fill="${palette.accent}" opacity="0.18"/>
    <circle cx="80" cy="340" r="160" fill="${palette.textAccent}" opacity="0.12"/>
    <g transform="translate(40, 36)">
      <rect width="170" height="30" rx="15" fill="rgba(255,255,255,0.12)" stroke="${palette.border}" stroke-width="1"/>
      <circle cx="16" cy="15" r="4.5" fill="#10b981"/>
      <text x="30" y="19" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">REKRUTMEN RESMI</text>
    </g>
    <g transform="translate(560, 36)">
      <rect width="200" height="30" rx="15" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="100" y="19" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11" font-weight="700" fill="${palette.textAccent}">${displayCat}</text>
    </g>
    <g transform="translate(400, 160)" text-anchor="middle">
      <circle cx="0" cy="0" r="42" fill="url(#badgeGrad)" stroke="${palette.accent}" stroke-width="2.5" filter="url(#shadow)"/>
      <text x="0" y="12" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${initial}</text>
    </g>
    <text x="400" y="248" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="${compFontSize}" font-weight="800" fill="#ffffff" filter="url(#shadow)">
      ${displayComp}
    </text>
    <text x="400" y="286" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="15" font-weight="600" fill="${palette.textAccent}">
      ${displayTitle.length > 55 ? displayTitle.substring(0, 52) + '...' : displayTitle}
    </text>
    <line x1="40" y1="350" x2="760" y2="350" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <g transform="translate(40, 376)">
      <text x="0" y="12" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.7)">
        🛡️ TERVERIFIKASI RESMI
      </text>
      <text x="720" y="12" text-anchor="end" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="12" font-weight="600" fill="#34d399">
        ✓ 100% BEBAS BIAYA SELEKSI
      </text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function getEffectiveJobCover(job) {
  if (!job) return '';
  let cover = job.cover_image;
  if (!cover && job.contact_value) {
    try {
      const cv = typeof job.contact_value === 'string' ? JSON.parse(job.contact_value) : job.contact_value;
      if (cv && cv.cover_image) cover = cv.cover_image;
    } catch (e) {}
  }
  if (cover && typeof cover === 'string' && cover.trim()) {
    let p = cover.trim();
    if (p.startsWith('/uploads/')) p = '.' + p;
    return p;
  }
  if (job.company_image && !job.company_image.includes('unsplash.com')) {
    return job.company_image;
  }
  if (isManualJobFlyer(job)) {
    let p = String(job.poster_image).trim();
    if (p.startsWith('/uploads/')) p = '.' + p;
    return p;
  }
  return generateCompanyBannerDataUrl(job);
}

window.handlePublicPosterError = function(imgEl, jobId) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const job = (allJobs || []).find(j => Number(j.id) === Number(jobId));
  imgEl.src = generateCompanyBannerDataUrl(job || { company_name: 'Perusahaan', title: 'Lowongan Kerja' });
};

function formatTimeAgo(dateString) {
  if (!dateString) return 'Baru saja';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Baru saja';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin} mnt lalu`;
  const diffInHour = Math.floor(diffInSec / 60);
  if (diffInHour < 24) return `${diffInHour} jam lalu`;
  const diffInDays = Math.floor(diffInHour / 24);
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 30) return `${diffInDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Global Normalizer: Cleans social media copy, emoji spam, extracts real company and structured metadata
window.cleanJobData = function(job) {
  if (!job) return job;
  const copy = { ...job };

  let rawTitle = (copy.title || '').trim();
  let comp = (copy.company_name || '').trim();
  let desc = (copy.description || '').trim();

  const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(rawTitle + ' ' + comp);
  const isMessyTitle = hasEmoji || /^(untuk\s+|lowongan\s+bumn|loker\s+terbaru)/i.test(rawTitle) || rawTitle.includes('🏢') || rawTitle.includes('💼') || rawTitle.endsWith('..');
  const isGenericComp = /^(instagram|facebook|twitter|linkedin|web|portal|loker|google|bing|website)$/i.test(comp);

  const searchTexts = [desc, rawTitle];

  if (isGenericComp || comp.length < 5 || comp.includes('🏢')) {
    for (const text of searchTexts) {
      const ptMatch = text.match(/(?:🏢\s*)?((?:PT|CV|Bank|Yayasan|RSUD|RS|Universitas|Politeknik)\s+[^💼📢🕒🕐🎓\n\r,]+?)(?=\s+(?:membuka|buka|posisi|career|recruitment|💼|📢|🕒|🕐|🎓|$))/i);
      if (ptMatch && ptMatch[1]) {
        const extractedComp = ptMatch[1].replace(/^[🏢\s]+/, '').replace(/[\.\s]+$/, '').trim();
        if (extractedComp.length > 3) {
          comp = extractedComp;
          break;
        }
      }
    }
  }

  let cleanTitle = rawTitle;
  if (isMessyTitle) {
    let candidateTitle = '';
    for (const text of searchTexts) {
      const posMatch = text.match(/(?:💼\s*Posisi:?|Posisi\s*:?)\s*([^🕒🕐🎓📢🏢\n\r]+?)(?=\s*(?:🕒|🕐|🎓|📢|🏢|Status:|Jenjang:|Pendidikan:|PT |CV |membuka|$))/i);
      if (posMatch && posMatch[1]) {
        const cand = posMatch[1].replace(/[\.\s]+$/, '').trim();
        if (!cand.endsWith('..') && cand.length > candidateTitle.length && !cand.toLowerCase().includes('informasi dipublikasikan')) {
          candidateTitle = cand;
        }
      }
    }

    if (candidateTitle) {
      cleanTitle = candidateTitle;
    } else {
      cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');
      cleanTitle = cleanTitle.replace(/\b(LOWONGAN\s+(?:BUMN\s+)?(?:TERBARU\s+)?|LOKER\s+TERBARU\s+|WE ARE HIRING\s+|DIBUTUHKAN\s+SEGERA\s+)\b/gi, ' ');
      if (comp && cleanTitle.includes(comp)) {
        cleanTitle = cleanTitle.replace(comp, ' ');
      }
      cleanTitle = cleanTitle.replace(/\s+-\s+[^-]+$/, '').trim();
      cleanTitle = cleanTitle.replace(/\s+/g, ' ').replace(/[\.\s]+$/, '').trim();
    }

    if (/^untuk\s+/i.test(cleanTitle)) {
      cleanTitle = 'Program Rekrutmen ' + cleanTitle;
    }
  }

  cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
  comp = comp.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();

  copy.title = cleanTitle || copy.title;
  copy.company_name = comp || copy.company_name;

  return copy;
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(type, msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';
  t.innerHTML = `
    <i class="fa-solid ${icon}" style="font-size: 1.2rem;"></i>
    <span>${escapeHtml(msg)}</span>
  `;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}
