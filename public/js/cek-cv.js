// ==============================================================
// CEK-CV.JS - Dedicated AI Resume Analyzer & Job Matcher
// ==============================================================

let allJobs = [];
let analyzedSkills = [];

const SKILL_KEYWORDS_DICT = [
  'react', 'reactjs', 'vue', 'vuejs', 'angular', 'node', 'nodejs', 'express', 'javascript', 'typescript', 'php', 'laravel', 
  'python', 'django', 'fastapi', 'java', 'spring', 'kotlin', 'flutter', 'android', 'ios', 'swift',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 
  'redis', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'github', 'api', 'rest api', 'graphql',
  'ui', 'ux', 'ui/ux', 'figma', 'adobe', 'photoshop', 'illustrator', 'canva', 'prototyping', 'design system',
  'marketing', 'digital marketing', 'social media', 'content creator', 'copywriter', 'copywriting', 'seo', 'sem',
  'meta ads', 'facebook ads', 'instagram ads', 'tiktok ads', 'google ads', 'sales', 'business development',
  'data', 'data analyst', 'data science', 'machine learning', 'deep learning', 'ai', 'prompt engineering', 'llm',
  'excel', 'powerbi', 'tableau', 'accounting', 'finance', 'administrasi', 'customer service', 'support', 'hr', 'hrd'
];

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

// Load Jobs from API
async function loadAllJobs() {
  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/jobs'));
    if (ok && json && json.success && Array.isArray(json.data)) {
      allJobs = json.data;
    }
  } catch (err) {
    console.warn('Failed to load jobs for CV check:', err);
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

// Handle File Upload
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
      const maxPages = Math.min(pdf.numPages, 5);
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

    if (!text || text.trim().length < 20) {
      text = file.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
    }

    if (titleEl) titleEl.textContent = `Dokumen: ${file.name}`;
    if (subtitleEl) subtitleEl.textContent = 'Analisis selesai! Rekomendasi lowongan ditampilkan di bawah.';

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

// Run CV Analysis
function runCvAnalysis(rawText, sourceName) {
  const lower = (rawText || '').toLowerCase();

  // Detect candidate skills
  const candidateSkills = [];
  SKILL_KEYWORDS_DICT.forEach(skill => {
    const regex = new RegExp(`(^|[^a-z0-9])${skill.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      if (!candidateSkills.includes(skill)) candidateSkills.push(skill);
    }
  });

  analyzedSkills = candidateSkills;

  // Show Skills Bar
  const skillsBar = document.getElementById('skills-detected-bar');
  const skillsWrap = document.getElementById('skills-pills-wrap');
  const skillsCount = document.getElementById('skills-count-text');

  if (skillsBar && skillsWrap) {
    skillsBar.style.display = 'block';
    if (skillsCount) skillsCount.textContent = `${candidateSkills.length} Keahlian Teridentifikasi`;

    if (candidateSkills.length > 0) {
      skillsWrap.innerHTML = candidateSkills.map(s => `
        <span class="skill-chip"><i class="fa-solid fa-check"></i> ${s.toUpperCase()}</span>
      `).join('');
    } else {
      skillsWrap.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Tidak ada kata kunci teknis standar yang terdeteksi, namun kecocokan dihitung dari judul dan ringkasan.</span>`;
    }
  }

  // Score each job
  const scoredJobs = allJobs.map(job => {
    const jobText = [
      job.title,
      job.category,
      job.job_type,
      job.location,
      job.description,
      Array.isArray(job.requirements) ? job.requirements.join(' ') : job.requirements,
      Array.isArray(job.responsibilities) ? job.responsibilities.join(' ') : job.responsibilities
    ].join(' ').toLowerCase();

    const matchedSkills = [];
    candidateSkills.forEach(s => {
      const reg = new RegExp(`(^|[^a-z0-9])${s.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
      if (reg.test(jobText)) {
        matchedSkills.push(s);
      }
    });

    let score = 35;
    if (matchedSkills.length > 0) {
      score += Math.min(matchedSkills.length * 15, 50);
    }

    const titleWords = (job.title || '').toLowerCase().split(/[\s/&-]+/);
    const hasTitleWord = titleWords.some(w => w.length > 3 && lower.includes(w));
    if (hasTitleWord) score += 14;

    score = Math.min(score, 98);

    return {
      ...job,
      matchScore: score,
      matchedSkills
    };
  });

  // Sort descending by match score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Show status bar
  const statusBar = document.getElementById('cv-match-status-bar');
  if (statusBar) statusBar.style.display = 'flex';

  renderMatchedJobs(scoredJobs);

  // Scroll to results
  document.getElementById('matched-jobs-container')?.scrollIntoView({ behavior: 'smooth' });
}

// Render Matched Jobs
function renderMatchedJobs(jobs) {
  const container = document.getElementById('matched-jobs-container');
  const countEl = document.getElementById('matched-results-count');

  if (!container) return;

  if (countEl) {
    countEl.textContent = `Menemukan ${jobs.length} lowongan, diurutkan dari persentase kecocokan tertinggi.`;
  }

  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-surface); border-radius: var(--radius-md);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="color: var(--text-main);">Belum ada lowongan yang sesuai</h3>
        <p style="color: var(--text-muted);">Coba tambahkan lebih banyak keahlian pada ringkasan CV Anda.</p>
      </div>
    `;
    return;
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

    return `
      <div class="job-card" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span class="match-percent-badge ${badgeClass}">
            <i class="fa-solid fa-bolt"></i> ${job.matchScore}% ${badgeLabel}
          </span>
          <span class="job-type-pill">${escapeHtml(job.job_type)}</span>
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
            <span class="badge" style="margin-bottom: 4px;">${escapeHtml(job.category)}</span>
            <h3 class="job-title" onclick="openJobDetailModal(${job.id})">${escapeHtml(job.title)}</h3>
            <div class="job-company"><i class="fa-solid fa-building"></i> ${escapeHtml(job.company_name)}</div>
          </div>
        </div>

        <div class="job-meta-row">
          <div class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</div>
          <div class="job-meta-item"><i class="fa-solid fa-user-graduate"></i> ${escapeHtml(job.experience_level || 'Semua Pengalaman')}</div>
          ${job.salary_display ? `<div class="job-meta-item salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</div>` : ''}
        </div>

        ${job.matchedSkills && job.matchedSkills.length > 0 ? `
          <div style="margin: 10px 0 14px; font-size: 0.76rem; color: var(--text-muted);">
            <strong style="color: var(--primary);"><i class="fa-solid fa-circle-check"></i> Skill Cocok:</strong>
            ${job.matchedSkills.slice(0, 5).map(s => `<span style="background: rgba(99,102,241,0.1); color: var(--primary); font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-left: 4px;">${s}</span>`).join('')}
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

  const parseList = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.startsWith('[') ? JSON.parse(val) : []);
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
