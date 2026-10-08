// ==============================================================
// KerjaHub - Public Portal JavaScript (Focus: Job Sharing & Posters)
// ==============================================================

let currentJobs = [];
let activeFilters = {
  search: '',
  category: 'Semua',
  job_type: 'Semua',
  location: 'Semua',
  sort: 'newest'
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadJobs();
});

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('kerja_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('kerja_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  }
}

// Event Listeners
function setupEventListeners() {
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Search input & button
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchCategory = document.getElementById('search-category');
  const searchLocation = document.getElementById('search-location');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      activeFilters.search = searchInput ? searchInput.value.trim() : '';
      if (searchCategory) activeFilters.category = searchCategory.value;
      if (searchLocation) activeFilters.location = searchLocation.value;
      loadJobs();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        activeFilters.search = searchInput.value.trim();
        loadJobs();
      }
    });
  }

  // Quick category tags
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.category = btn.dataset.category || 'Semua';
      if (searchCategory) searchCategory.value = activeFilters.category;
      loadJobs();
    });
  });

  // Sidebar filters (Radio buttons)
  document.querySelectorAll('input[name="filter_category"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.category = e.target.value;
      if (searchCategory) searchCategory.value = e.target.value;
      loadJobs();
    });
  });

  document.querySelectorAll('input[name="filter_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.job_type = e.target.value;
      loadJobs();
    });
  });

  // Reset filter button
  const resetBtn = document.getElementById('btn-reset-filter');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeFilters = {
        search: '',
        category: 'Semua',
        job_type: 'Semua',
        location: 'Semua',
        sort: 'newest'
      };
      if (searchInput) searchInput.value = '';
      if (searchCategory) searchCategory.value = 'Semua';
      if (searchLocation) searchLocation.value = 'Semua';
      const allCatRadio = document.querySelector('input[name="filter_category"][value="Semua"]');
      if (allCatRadio) allCatRadio.checked = true;
      const allTypeRadio = document.querySelector('input[name="filter_type"][value="Semua"]');
      if (allTypeRadio) allTypeRadio.checked = true;
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      loadJobs();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeFilters.sort = e.target.value;
      loadJobs();
    });
  }

  // Grid/List toggle
  const btnGrid = document.getElementById('view-grid-btn');
  const btnList = document.getElementById('view-list-btn');
  const jobsGrid = document.getElementById('jobs-container');

  if (btnGrid && btnList && jobsGrid) {
    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      jobsGrid.classList.remove('list-view');
    });

    btnList.addEventListener('click', () => {
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      jobsGrid.classList.add('list-view');
    });
  }

  // Modal Closers
  setupModalDismiss('job-detail-modal');
  setupModalDismiss('poster-lightbox');
}

function setupModalDismiss(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal-close-btn') || e.target.classList.contains('lightbox-close-btn')) {
      modal.classList.remove('active');
    }
  });
}

// Load Jobs from API
async function loadJobs() {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary);"></i>
      <p style="margin-top: 14px; color: var(--text-muted); font-weight: 500;">Memuat poster lowongan...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.category && activeFilters.category !== 'Semua') params.append('category', activeFilters.category);
    if (activeFilters.job_type && activeFilters.job_type !== 'Semua') params.append('job_type', activeFilters.job_type);
    if (activeFilters.location && activeFilters.location !== 'Semua') params.append('location', activeFilters.location);
    if (activeFilters.sort) params.append('sort', activeFilters.sort);

    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      currentJobs = data.data;
      renderJobs(currentJobs);
      updateCountDisplay(currentJobs.length);
    } else {
      showEmptyState(data.message || 'Gagal memuat lowongan.');
    }
  } catch (err) {
    console.error(err);
    showEmptyState('Terjadi kesalahan koneksi saat memuat data lowongan.');
  }
}

function updateCountDisplay(count) {
  const countEl = document.getElementById('results-count-num');
  if (countEl) countEl.textContent = count;
}

// Render Job Cards
function renderJobs(jobs) {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  if (jobs.length === 0) {
    showEmptyState('Belum ada info lowongan yang sesuai kriteria pencarian ini.');
    return;
  }

  container.innerHTML = jobs.map(job => {
    const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
    const posterSrc = job.poster_image ? job.poster_image : defaultPoster;
    const initial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C';
    const timeAgo = formatTimeAgo(job.created_at);

    return `
      <div class="job-card" data-id="${job.id}">
        <!-- Poster Design Preview -->
        <div class="job-poster-preview" onclick="openLightbox('${posterSrc}', '${escapeHtml(job.title)}')">
          <img src="${posterSrc}" alt="${escapeHtml(job.title)}" loading="lazy" onerror="this.src='${defaultPoster}'">
          ${job.is_featured ? '<div class="badge-featured"><i class="fa-solid fa-star"></i> Unggulan</div>' : ''}
          <div class="badge-category">${escapeHtml(job.category)}</div>
          <div class="poster-overlay">
            <span class="poster-badge-btn"><i class="fa-solid fa-expand"></i> Buka Poster Penuh</span>
          </div>
        </div>

        <div class="job-card-body">
          <div class="company-row">
            <div class="company-avatar">${initial}</div>
            <div class="company-meta">
              <div class="company-name">${escapeHtml(job.company_name)}</div>
              <div class="job-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</div>
            </div>
          </div>

          <h3 class="job-title" onclick="openJobDetail(${job.id})">${escapeHtml(job.title)}</h3>

          <div class="job-badges">
            <span class="pill pill-type"><i class="fa-regular fa-clock"></i> ${escapeHtml(job.job_type)}</span>
            ${job.experience_level ? `<span class="pill pill-exp"><i class="fa-solid fa-briefcase"></i> ${escapeHtml(job.experience_level)}</span>` : ''}
            ${job.salary_display ? `<span class="pill pill-salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</span>` : ''}
          </div>

          <p class="job-excerpt">${escapeHtml(job.description)}</p>

          <div class="job-card-footer">
            <span class="posted-time"><i class="fa-regular fa-calendar"></i> ${timeAgo}</span>
            <div class="card-actions">
              <button class="btn btn-outline btn-sm" onclick="openJobDetail(${job.id})">
                <i class="fa-regular fa-eye"></i> Info Lengkap
              </button>
              <button class="btn btn-primary btn-sm" onclick="directContact(${job.id})">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Hubungi
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showEmptyState(msg) {
  const container = document.getElementById('jobs-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
      <h3 class="empty-title">Tidak Ada Lowongan</h3>
      <p class="empty-desc">${escapeHtml(msg)}</p>
      <button class="btn btn-primary" onclick="document.getElementById('btn-reset-filter').click()">
        <i class="fa-solid fa-rotate-left"></i> Reset Filter
      </button>
    </div>
  `;
}

// Lightbox for Poster Image
function openLightbox(imgSrc, title) {
  const lb = document.getElementById('poster-lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbTitle = document.getElementById('lightbox-title');
  const lbDownload = document.getElementById('lightbox-download');

  if (lb && lbImg) {
    lbImg.src = imgSrc;
    if (lbTitle) lbTitle.textContent = title || 'Poster Lowongan';
    if (lbDownload) lbDownload.href = imgSrc;
    lb.classList.add('active');
  }
}

// Open Job Detail Modal
async function openJobDetail(jobId) {
  const modal = document.getElementById('job-detail-modal');
  const content = document.getElementById('job-detail-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="padding: 60px; text-align: center;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary);"></i>
      <p style="margin-top: 14px; color: var(--text-muted);">Memuat informasi poster & lowongan...</p>
    </div>
  `;
  modal.classList.add('active');

  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const result = await res.json();
    if (!result.success || !result.data) {
      content.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--danger);">Gagal memuat lowongan: ${result.message}</div>`;
      return;
    }

    const job = result.data;
    const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
    const posterSrc = job.poster_image ? job.poster_image : defaultPoster;

    // Build contact button
    const contactBtnHtml = renderContactButton(job);

    content.innerHTML = `
      <!-- Banner / Poster Highlight -->
      <div class="modal-hero-banner">
        <img src="${posterSrc}" alt="${escapeHtml(job.title)}" onerror="this.src='${defaultPoster}'">
        <div class="modal-banner-overlay">
          <div class="modal-header-info">
            <h2>${escapeHtml(job.title)}</h2>
            <div class="modal-header-meta">
              <span><i class="fa-solid fa-building"></i> ${escapeHtml(job.company_name)}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</span>
              <span><i class="fa-solid fa-tag"></i> ${escapeHtml(job.category)}</span>
              <span><i class="fa-regular fa-eye"></i> Dilihat ${job.views_count}x</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="detail-grid-layout">
          <!-- Main Description Column -->
          <div class="detail-main">
            <!-- Job Description -->
            <div class="detail-section">
              <h4><i class="fa-solid fa-file-lines"></i> Keterangan / Deskripsi Posisi</h4>
              <p style="white-space: pre-line;">${escapeHtml(job.description)}</p>
            </div>

            <!-- Responsibilities -->
            ${job.responsibilities && job.responsibilities.length > 0 ? `
              <div class="detail-section">
                <h4><i class="fa-solid fa-list-check"></i> Tanggung Jawab Utama</h4>
                <ul class="detail-list">
                  ${job.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- Requirements -->
            ${job.requirements && job.requirements.length > 0 ? `
              <div class="detail-section">
                <h4><i class="fa-solid fa-user-check"></i> Kualifikasi & Persyaratan</h4>
                <ul class="detail-list">
                  ${job.requirements.map(req => `<li>${escapeHtml(req)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- Benefits -->
            ${job.benefits && job.benefits.length > 0 ? `
              <div class="detail-section">
                <h4><i class="fa-solid fa-gift"></i> Benefit & Fasilitas</h4>
                <div class="benefits-pills">
                  ${job.benefits.map(b => `<div class="benefit-tag"><i class="fa-solid fa-check-circle"></i> ${escapeHtml(b)}</div>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Sidebar Column -->
          <div class="detail-sidebar">
            <!-- Direct Apply / Contact Button -->
            ${contactBtnHtml}

            <!-- Poster Showcase Box -->
            <div class="poster-showcase-box">
              <p style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
                <i class="fa-solid fa-image"></i> POSTER REKRUTMEN RESMI
              </p>
              <img src="${posterSrc}" alt="Poster Lowongan" onclick="openLightbox('${posterSrc}', '${escapeHtml(job.title)}')">
              <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
                <button class="btn btn-outline btn-sm" onclick="openLightbox('${posterSrc}', '${escapeHtml(job.title)}')">
                  <i class="fa-solid fa-expand"></i> Perbesar
                </button>
                <a href="${posterSrc}" target="_blank" download class="btn btn-outline btn-sm">
                  <i class="fa-solid fa-download"></i> Simpan
                </a>
              </div>
            </div>

            <!-- Job Overview Card -->
            <div class="sidebar-card">
              <div class="sidebar-card-title">Ringkasan Lowongan</div>
              
              <div class="info-item">
                <i class="fa-solid fa-money-bill-wave"></i>
                <div>
                  <div class="info-label">Gaji Ditawarkan</div>
                  <div class="info-val" style="color: var(--success);">${escapeHtml(job.salary_display || 'Kompetitif')}</div>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-regular fa-clock"></i>
                <div>
                  <div class="info-label">Tipe Pekerjaan</div>
                  <div class="info-val">${escapeHtml(job.job_type)}</div>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-briefcase"></i>
                <div>
                  <div class="info-label">Pengalaman</div>
                  <div class="info-val">${escapeHtml(job.experience_level || 'Semua Tingkat')}</div>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-calendar-xmark"></i>
                <div>
                  <div class="info-label">Batas Waktu</div>
                  <div class="info-val">${escapeHtml(job.deadline || 'Terbuka Selama Aktif')}</div>
                </div>
              </div>

              ${job.contact_value ? `
                <div class="info-item">
                  <i class="fa-solid fa-address-book"></i>
                  <div>
                    <div class="info-label">Kontak / Tautan Resmi</div>
                    <div class="info-val" style="word-break: break-all;">${escapeHtml(job.contact_value)}</div>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Share Buttons (CORE FOCUS: SHARING) -->
            <div class="sidebar-card" style="text-align: center;">
              <div class="sidebar-card-title" style="margin-bottom: 10px;">
                <i class="fa-solid fa-share-nodes"></i> Bagikan Info Lowongan Ini
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-sm" style="background: #25d366; color: white; border: none; font-weight: 700;" onclick="shareWhatsApp('${escapeHtml(job.title)}', '${escapeHtml(job.company_name)}')">
                  <i class="fa-brands fa-whatsapp"></i> Bagikan ke WhatsApp
                </button>
                <button class="btn btn-outline btn-sm" onclick="copyJobLink(${job.id})">
                  <i class="fa-solid fa-link"></i> Salin Tautan Lowongan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    content.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--danger);">Gagal mengambil rincian lowongan.</div>`;
  }
}

// Render Contact / Direct Apply CTA Button
function renderContactButton(job) {
  const type = job.contact_type || 'whatsapp';
  const val = job.contact_value || '';

  if (type === 'whatsapp' || (!type && val.match(/^(\+?62|08)/))) {
    const cleanPhone = val.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const textMsg = encodeURIComponent(`Halo, saya tertarik dengan info lowongan ${job.title} di ${job.company_name} yang dibagikan melalui KerjaHub.`);
    const waUrl = val ? `https://wa.me/${waPhone}?text=${textMsg}` : '#';

    return `
      <a href="${waUrl}" target="_blank" class="btn" style="width: 100%; padding: 14px; font-size: 1rem; background: #25d366; color: white; font-weight: 700; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);">
        <i class="fa-brands fa-whatsapp" style="font-size: 1.2rem;"></i> Hubungi via WhatsApp
      </a>
    `;
  } else if (type === 'email' || (val && val.includes('@'))) {
    const mailUrl = `mailto:${val}?subject=${encodeURIComponent('Pertanyaan Lowongan: ' + job.title)}&body=${encodeURIComponent('Halo HRD ' + job.company_name + ',\n\nSaya melihat poster lowongan ' + job.title + ' di KerjaHub.')}`;
    return `
      <a href="${mailUrl}" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;">
        <i class="fa-solid fa-envelope"></i> Kirim Email ke Perekrut
      </a>
    `;
  } else if (val) {
    const url = val.startsWith('http') ? val : `https://${val}`;
    return `
      <a href="${url}" target="_blank" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Tautan Pendaftaran Resmi
      </a>
    `;
  }

  return `
    <button class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;" onclick="copyJobLink(${job.id})">
      <i class="fa-solid fa-share-nodes"></i> Bagikan Lowongan Ini
    </button>
  `;
}

// Direct contact helper from card
function directContact(jobId) {
  const job = currentJobs.find(j => j.id === jobId);
  if (job) {
    openJobDetail(jobId);
  }
}

// Sharing helpers
function shareWhatsApp(title, company) {
  const url = window.location.origin + '/?job=' + encodeURIComponent(title);
  const text = encodeURIComponent(`📢 *INFO LOWONGAN KERJA*\n\nPosisi: *${title}*\nPerusahaan: *${company || '-'}*\n\nLihat poster dan rincian lengkapnya di:\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function copyJobLink(id) {
  const url = `${window.location.origin}/?job=${id}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('info', 'Tautan info lowongan berhasil disalin ke clipboard!');
  });
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Baru saja';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Baru saja';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin} menit lalu`;
  const diffInHour = Math.floor(diffInMin / 60);
  if (diffInHour < 24) return `${diffInHour} jam lalu`;
  const diffInDays = Math.floor(diffInHour / 24);
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 30) return `${diffInDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="font-size: 1.2rem;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
