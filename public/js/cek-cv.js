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
  'kurir', 'security', 'satpam'
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

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('kerjahub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('kerjahub_theme', next);
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

function getApiEndpoint(endpoint) {
  if (!endpoint) return '';
  const clean = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const pathname = window.location.pathname;
  if (pathname.includes('/job_portal/')) {
    return `/job_portal${clean}`;
  }
  return clean;
}

async function safeFetchJson(url, options = {}) {
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

// Load Jobs and Settings from API (with Supabase fallback)
async function loadAllJobs() {
  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/jobs'));
    if (ok && json && json.success && Array.isArray(json.data)) {
      allJobs = json.data.filter(j => j.status === 'active' || !j.status);
    }
  } catch (err) {
    console.warn('API jobs fetch warning, checking direct cloud config:', err);
  }

  // Load config & settings
  try {
    const { ok, data: cfg } = await safeFetchJson(getApiEndpoint('/api/config'));
    if (ok && cfg) {
      if (cfg.cv_whatsapp) {
        window.siteSettings.cv_whatsapp = cfg.cv_whatsapp;
      }
      if (cfg.cv_order_message) {
        window.siteSettings.cv_order_message = cfg.cv_order_message;
      }

      // Fallback jobs from Supabase if API returned empty
      if (allJobs.length === 0 && cfg.supabaseUrl && cfg.supabaseKey && window.supabase) {
        const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
        const { data, error } = await sb.from('jobs').select('*').in('status', ['active']);
        if (!error && Array.isArray(data)) {
          allJobs = data;
        }
      }
    }
  } catch (e) {
    console.warn('Supabase fallback load warning:', e);
  }
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
    analyzeBtn.addEventListener('click', () => {
      const text = pasteInput ? pasteInput.value.trim() : '';
      if (!text) {
        showToast('error', 'Silakan unggah dokumen CV atau tempel teks keahlian Anda.');
        return;
      }
      runCvAnalysis(text, 'Teks Input Pengalaman');
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

    runCvAnalysis(text, file.name);
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
function runCvAnalysis(rawText, sourceName) {
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
  if (countEl) {
    countEl.textContent = `Menemukan ${jobs.length} lowongan yang benar-benar cocok dengan kualifikasi CV Anda.`;
  }

  container.innerHTML = jobs.map(job => {
    let badgeClass = 'match-high';
    let badgeLabel = 'Sangat Cocok';
    if (job.matchScore < 60) {
      badgeClass = 'match-mod';
      badgeLabel = 'Cukup Relevan';
    } else if (job.matchScore < 80) {
      badgeClass = 'match-mid';
      badgeLabel = 'Cocok';
    }

    const contacts = extractJobContacts(job);
    const posterImg = job.poster_image ? (job.poster_image.startsWith('/uploads/') ? '.' + job.poster_image : job.poster_image) : '';
    const skillsToDisplay = (job.matchedSkills && job.matchedSkills.length > 0)
      ? job.matchedSkills
      : (job.matchedTitleWords || []);

    return `
      <div class="job-card" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span class="match-percent-badge ${badgeClass}">
            <i class="fa-solid fa-bolt"></i> ${job.matchScore}% ${badgeLabel}
          </span>
          <span class="job-type-pill">${escapeHtml(job.job_type || 'Full Time')}</span>
        </div>

        <div class="job-card-header">
          ${posterImg ? `
            <div class="job-thumbnail" onclick="openLightbox('${posterImg}')" title="Klik untuk memperbesar poster">
              <img src="${posterImg}" alt="Poster ${escapeHtml(job.title)}" loading="lazy">
              <span class="poster-zoom-badge"><i class="fa-solid fa-expand"></i></span>
            </div>
          ` : `
            <div class="job-thumbnail-placeholder">
              <i class="fa-solid fa-briefcase"></i>
            </div>
          `}
          <div class="job-title-box">
            <span class="badge" style="margin-bottom: 4px;">${escapeHtml(job.category || 'Lowongan')}</span>
            <h3 class="job-title" onclick="openJobDetailModal(${job.id})">${escapeHtml(job.title)}</h3>
            <div class="job-company"><i class="fa-solid fa-building"></i> ${escapeHtml(job.company_name)}</div>
          </div>
        </div>

        <div class="job-meta-row">
          <div class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location || 'Indonesia')}</div>
          <div class="job-meta-item"><i class="fa-solid fa-user-graduate"></i> ${escapeHtml(job.experience_level || 'Semua Pengalaman')}</div>
          ${job.salary_display ? `<div class="job-meta-item salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</div>` : ''}
        </div>

        ${skillsToDisplay.length > 0 ? `
          <div style="margin: 10px 0 14px; font-size: 0.78rem; color: var(--text-muted);">
            <strong style="color: var(--primary);"><i class="fa-solid fa-circle-check"></i> Kualifikasi Cocok:</strong>
            ${skillsToDisplay.slice(0, 5).map(s => `
              <span style="background: rgba(99,102,241,0.1); color: var(--primary); font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-left: 4px; display: inline-block; margin-top: 2px;">
                ${escapeHtml(s)}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <p class="job-snippet">${escapeHtml(job.description ? job.description.slice(0, 140) + '...' : '')}</p>

        <div class="job-card-actions" style="margin-top: 14px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="openJobDetailModal(${job.id})" style="flex: 1;">
            <i class="fa-solid fa-eye"></i> Rincian Lowongan
          </button>
          ${contacts.whatsapp ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="triggerWhatsAppChat('${contacts.whatsapp}', '${escapeHtml(job.company_name).replace(/'/g, "\\'")}', '${escapeHtml(job.title).replace(/'/g, "\\'")}')" style="background: #25d366; border-color: #25d366; color: white;">
              <i class="fa-brands fa-whatsapp"></i> Hubungi WA
            </button>
          ` : ''}
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

// Helpers
function extractJobContacts(job) {
  let wa = job.whatsapp || '';
  let email = job.email || '';
  let website = job.website_url || '';

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

  return { whatsapp: wa, email, website_url: website };
}

window.openJobDetailModal = function(id) {
  const job = allJobs.find(j => j.id == id);
  if (!job) return;

  const modal = document.getElementById('job-detail-modal');
  const catEl = document.getElementById('modal-category');
  const titleEl = document.getElementById('modal-title');
  const compEl = document.getElementById('modal-company');
  const contentEl = document.getElementById('modal-content');

  if (catEl) catEl.textContent = job.category;
  if (titleEl) titleEl.textContent = job.title;
  if (compEl) compEl.innerHTML = `<i class="fa-solid fa-building"></i> ${escapeHtml(job.company_name)}`;

  const contacts = extractJobContacts(job);
  const posterImg = job.poster_image ? (job.poster_image.startsWith('/uploads/') ? '.' + job.poster_image : job.poster_image) : '';

  const parseList = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.startsWith('[') ? JSON.parse(val || '[]') : [val || '']);
  const reqs = parseList(job.requirements);
  const resps = parseList(job.responsibilities);
  const benefits = parseList(job.benefits);

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="modal-detail-layout">
        <div class="detail-main-content">
          ${posterImg ? `
            <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); cursor: pointer;" onclick="openLightbox('${posterImg}')">
              <img src="${posterImg}" alt="Poster" style="width: 100%; display: block;">
            </div>
          ` : ''}

          <div class="detail-section">
            <h4 class="detail-section-title"><i class="fa-solid fa-align-left"></i> Gambaran Pekerjaan</h4>
            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); white-space: pre-line;">${escapeHtml(job.description)}</p>
          </div>

          ${reqs.length > 0 ? `
            <div class="detail-section">
              <h4 class="detail-section-title"><i class="fa-solid fa-list-check"></i> Kualifikasi & Persyaratan</h4>
              <ul class="detail-bullet-list">
                ${reqs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${resps.length > 0 ? `
            <div class="detail-section">
              <h4 class="detail-section-title"><i class="fa-solid fa-briefcase"></i> Tanggung Jawab Utama</h4>
              <ul class="detail-bullet-list">
                ${resps.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${benefits.length > 0 ? `
            <div class="detail-section">
              <h4 class="detail-section-title"><i class="fa-solid fa-gift"></i> Benefit & Keuntungan</h4>
              <ul class="detail-bullet-list">
                ${benefits.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="detail-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-card-title"><i class="fa-solid fa-address-book"></i> Hubungi Rekruter Resmi</div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
              ${contacts.whatsapp ? `
                <button type="button" class="btn btn-primary" onclick="triggerWhatsAppChat('${contacts.whatsapp}', '${escapeHtml(job.company_name).replace(/'/g, "\\'")}', '${escapeHtml(job.title).replace(/'/g, "\\'")}')" style="background: #25d366; border-color: #25d366;">
                  <i class="fa-brands fa-whatsapp"></i> Chat WhatsApp (${escapeHtml(contacts.whatsapp)})
                </button>
              ` : ''}
              ${contacts.email ? `
                <a href="mailto:${contacts.email}?subject=Lamaran Pekerjaan: ${encodeURIComponent(job.title)}" class="btn btn-outline" style="text-align: center;">
                  <i class="fa-solid fa-envelope"></i> Kirim Email
                </a>
              ` : ''}
              ${contacts.website_url ? `
                <a href="${contacts.website_url.startsWith('http') ? contacts.website_url : 'https://' + contacts.website_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align: center;">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Portal Resmi
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
};

window.closeJobDetailModal = function() {
  const modal = document.getElementById('job-detail-modal');
  if (modal) modal.classList.remove('active');
};

window.openLightbox = function(src) {
  const lb = document.getElementById('poster-lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) {
    img.src = src;
    lb.classList.add('active');
  }
};

window.closeLightbox = function() {
  const lb = document.getElementById('poster-lightbox');
  if (lb) lb.classList.remove('active');
};

window.triggerWhatsAppChat = function(phone, comp, title) {
  if (!phone) return;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  else if (clean.startsWith('8')) clean = '62' + clean;
  else if (!clean.startsWith('62')) clean = '62' + clean;

  const msg = encodeURIComponent(`Halo Bapak/Ibu HRD ${comp},\n\nPerkenalkan saya [Nama Pelamar]. Saya melihat lowongan untuk posisi ${title} di KerjaHub dan bermaksud mengajukan lamaran kerja serta melampirkan berkas CV saya.\n\nTerima kasih.`);
  window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${msg}`, '_blank');
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
  t.innerHTML = `<span>${escapeHtml(msg)}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
