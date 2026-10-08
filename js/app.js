// ==============================================================
// KerjaHub - Public Portal JavaScript (Supabase Cloud & Static Ready)
// ==============================================================

const SUPABASE_URL = 'https://nptmawuukuysqzqakwej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT';
let sbClient = null;

if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.warn('Supabase client init error:', e);
  }
}

// Fallback initial jobs with posters (used if Supabase is offline or table empty)
const DEFAULT_JOBS = [
  {
    id: 1,
    title: 'Senior UI/UX Designer',
    company_name: 'Synergy Tech Global',
    category: 'Design & Kreatif',
    job_type: 'Remote',
    location: 'Jakarta / Remote',
    salary_display: 'Rp 15.000.000 - Rp 25.000.000 / bln',
    experience_level: 'Senior (5+ Tahun)',
    poster_image: './uploads/sample_uiux.jpg',
    description: 'Synergy Tech sedang mencari Senior UI/UX Designer untuk memimpin strategi desain produk digital generasi berikutnya. Anda akan merancang antarmuka elegan, prototipe interaktif, dan berkolaborasi erat dengan tim engineering.',
    requirements: [
      'Pengalaman minimal 5 tahun di bidang UI/UX Design untuk platform web & mobile',
      'Portofolio kuat yang menunjukkan proses design thinking dan UI visual modern',
      'Mahir menggunakan Figma, Design Systems, dan interactive prototyping',
      'Pemahaman kuat mengenai usability testing dan user journey mapping',
      'Kemampuan komunikasi dan kepemimpinan yang baik'
    ],
    responsibilities: [
      'Memimpin dan merumuskan arah desain UI/UX produk utama',
      'Membuat wireframe, interactive high-fidelity prototype di Figma',
      'Mengembangkan dan memelihara Design System bersama tim front-end',
      'Melakukan riset dan wawancara pengguna untuk validasi fitur baru'
    ],
    benefits: [
      'Kerja 100% Remote dengan jam fleksibel',
      'Asuransi Kesehatan Swasta Kelas 1 & BPJS',
      'Tunjangan perangkat MacBook Pro & monitor 4K',
      'Budget pembelajaran & sertifikasi tahunan'
    ],
    contact_type: 'whatsapp',
    contact_value: '081234567890',
    deadline: '2026-11-30',
    status: 'active',
    is_featured: true,
    views_count: 142,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Full Stack Web Developer (Node.js & React)',
    company_name: 'Tech Innovations Lab',
    category: 'Teknologi & IT',
    job_type: 'Hybrid',
    location: 'Jakarta Selatan (SCBD)',
    salary_display: 'Rp 18.000.000 - Rp 28.000.000 / bln',
    experience_level: '3-5 Tahun',
    poster_image: './uploads/sample_fullstack.jpg',
    description: 'Kami mengundang Full Stack Developer berbakat untuk membangun arsitektur sistem enterprise yang cepat, terukur, dan aman. Mengembangkan REST API modern dan antarmuka responsif.',
    requirements: [
      'Pengalaman kerja minimal 3 tahun menggunakan Node.js dan React / Next.js',
      'Fasih bekerja dengan database relasional dan konsep RESTful API modern',
      'Pemahaman solid mengenai Clean Architecture dan version control (Git)',
      'Berpengalaman dengan cloud deployment dan containerization (Docker)'
    ],
    responsibilities: [
      'Merancang arsitektur backend scalable dan antarmuka web modern',
      'Mengoptimasi performa dan keamanan aplikasi web',
      'Bekerjasama dalam tim sprint agile mingguan'
    ],
    benefits: [
      'Sistem kerja Hybrid fleksibel (2 hari kantor, 3 hari WFH)',
      'Gaji kompetitif + THR + Bonus kuartalan',
      'Makan siang gratis & snack bar sepuasnya di kantor SCBD',
      'Asuransi kesehatan lengkap termasuk keluarga'
    ],
    contact_type: 'email',
    contact_value: 'careers@techinnovations.com',
    deadline: '2026-11-25',
    status: 'active',
    is_featured: true,
    views_count: 298,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Digital Marketing & Social Media Strategist',
    company_name: 'Creative Sparks Agency',
    category: 'Marketing & Penjualan',
    job_type: 'Full Time',
    location: 'Bandung, Jawa Barat',
    salary_display: 'Rp 9.000.000 - Rp 14.000.000 / bln',
    experience_level: '1-3 Tahun',
    poster_image: './uploads/sample_marketing.jpg',
    description: 'Creative Sparks mencari Digital Marketing Specialist yang kreatif dan analitis untuk memimpin kampanye multi-channel, paid ads (Meta & TikTok), serta konten viral.',
    requirements: [
      'Pengalaman minimal 2 tahun dalam digital marketing dan social media ads',
      'Terbukti sukses mengelola Meta Ads (Facebook/Instagram) dan TikTok Ads',
      'Kreatif dalam menyusun copywriting iklan yang engaging',
      'Menguasai tren media sosial terkini (Reels, TikTok, Shorts)'
    ],
    responsibilities: [
      'Merencanakan dan mengeksekusi kampanye pemasaran digital bulanan',
      'Mengoptimalkan performa iklan berbayar (paid ads) untuk ROI maksimal',
      'Membuat strategi konten bersama tim kreatif desain grafis'
    ],
    benefits: [
      'Suasana kerja agensi yang seru, dinamis, tanpa birokrasi kaku',
      'Tunjangan kuota internet & transportasi',
      'Bonus performa pencapaian target campaign'
    ],
    contact_type: 'link',
    contact_value: 'https://creativesparks.io/apply',
    deadline: '2026-11-15',
    status: 'active',
    is_featured: false,
    views_count: 89,
    created_at: new Date().toISOString()
  }
];

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
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

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

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.category = btn.dataset.category || 'Semua';
      if (searchCategory) searchCategory.value = activeFilters.category;
      loadJobs();
    });
  });

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

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeFilters.sort = e.target.value;
      loadJobs();
    });
  }

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

// Load Jobs: First tries Supabase Cloud, falls back to server API or DEFAULT_JOBS
async function loadJobs() {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary);"></i>
      <p style="margin-top: 14px; color: var(--text-muted); font-weight: 500;">Memuat poster lowongan...</p>
    </div>
  `;

  let jobs = null;

  // 1. Try Supabase Cloud Client directly (works on GitHub Pages!)
  if (sbClient) {
    try {
      let q = sbClient.from('jobs').select('*');
      q = q.eq('status', 'active');

      if (activeFilters.category && activeFilters.category !== 'Semua') {
        q = q.eq('category', activeFilters.category);
      }
      if (activeFilters.job_type && activeFilters.job_type !== 'Semua') {
        q = q.eq('job_type', activeFilters.job_type);
      }
      if (activeFilters.location && activeFilters.location !== 'Semua') {
        q = q.ilike('location', `%${activeFilters.location}%`);
      }
      if (activeFilters.search) {
        const s = `%${activeFilters.search}%`;
        q = q.or(`title.ilike.${s},company_name.ilike.${s},description.ilike.${s},location.ilike.${s}`);
      }
      if (activeFilters.sort === 'views') {
        q = q.order('views_count', { ascending: false });
      } else {
        q = q.order('is_featured', { ascending: false }).order('id', { ascending: false });
      }

      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        jobs = data;
      }
    } catch (e) {
      console.warn('Supabase browser fetch exception:', e);
    }
  }

  // 2. Try Local Server API if Supabase didn't yield results
  if (!jobs) {
    try {
      const params = new URLSearchParams();
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.category && activeFilters.category !== 'Semua') params.append('category', activeFilters.category);
      if (activeFilters.job_type && activeFilters.job_type !== 'Semua') params.append('job_type', activeFilters.job_type);
      if (activeFilters.location && activeFilters.location !== 'Semua') params.append('location', activeFilters.location);
      if (activeFilters.sort) params.append('sort', activeFilters.sort);

      const res = await fetch(`./api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          jobs = data.data;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to DEFAULT_JOBS filter in memory (Guarantees zero broken state on GitHub Pages!)
  if (!jobs) {
    jobs = filterLocalJobs(DEFAULT_JOBS);
  }

  currentJobs = jobs;
  renderJobs(currentJobs);
  updateCountDisplay(currentJobs.length);
}

function filterLocalJobs(rawList) {
  let list = [...rawList].filter(j => j.status === 'active');

  if (activeFilters.category && activeFilters.category !== 'Semua') {
    list = list.filter(j => j.category === activeFilters.category);
  }
  if (activeFilters.job_type && activeFilters.job_type !== 'Semua') {
    list = list.filter(j => j.job_type === activeFilters.job_type);
  }
  if (activeFilters.location && activeFilters.location !== 'Semua') {
    const loc = activeFilters.location.toLowerCase();
    list = list.filter(j => j.location && j.location.toLowerCase().includes(loc));
  }
  if (activeFilters.search) {
    const s = activeFilters.search.toLowerCase();
    list = list.filter(j =>
      (j.title && j.title.toLowerCase().includes(s)) ||
      (j.company_name && j.company_name.toLowerCase().includes(s)) ||
      (j.description && j.description.toLowerCase().includes(s))
    );
  }
  return list;
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
    let posterSrc = job.poster_image ? job.poster_image : defaultPoster;
    // Fix absolute /uploads/ to relative ./uploads/ for GitHub Pages subpath
    if (posterSrc.startsWith('/uploads/')) {
      posterSrc = '.' + posterSrc;
    }

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
              <button class="btn btn-primary btn-sm" onclick="openJobDetail(${job.id})">
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

// Lightbox
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

// Open Detail Modal
function openJobDetail(jobId) {
  const job = currentJobs.find(j => j.id == jobId);
  if (!job) return;

  const modal = document.getElementById('job-detail-modal');
  const content = document.getElementById('job-detail-content');
  if (!modal || !content) return;

  // Increment views count in Supabase if online
  if (sbClient) {
    sbClient.from('jobs').update({ views_count: (job.views_count || 0) + 1 }).eq('id', job.id).then();
  }

  const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
  let posterSrc = job.poster_image ? job.poster_image : defaultPoster;
  if (posterSrc.startsWith('/uploads/')) {
    posterSrc = '.' + posterSrc;
  }

  const contactBtnHtml = renderContactButton(job);

  const reqs = Array.isArray(job.requirements) ? job.requirements : (typeof job.requirements === 'string' ? JSON.parse(job.requirements || '[]') : []);
  const resps = Array.isArray(job.responsibilities) ? job.responsibilities : (typeof job.responsibilities === 'string' ? JSON.parse(job.responsibilities || '[]') : []);
  const bens = Array.isArray(job.benefits) ? job.benefits : (typeof job.benefits === 'string' ? JSON.parse(job.benefits || '[]') : []);

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
            <span><i class="fa-regular fa-eye"></i> Dilihat ${(job.views_count || 0) + 1}x</span>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="detail-grid-layout">
        <div class="detail-main">
          <div class="detail-section">
            <h4><i class="fa-solid fa-file-lines"></i> Keterangan / Deskripsi Posisi</h4>
            <p style="white-space: pre-line;">${escapeHtml(job.description)}</p>
          </div>

          ${resps.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-list-check"></i> Tanggung Jawab Utama</h4>
              <ul class="detail-list">
                ${resps.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${reqs.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-user-check"></i> Kualifikasi & Persyaratan</h4>
              <ul class="detail-list">
                ${reqs.map(req => `<li>${escapeHtml(req)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${bens.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-gift"></i> Benefit & Fasilitas</h4>
              <div class="benefits-pills">
                ${bens.map(b => `<div class="benefit-tag"><i class="fa-solid fa-check-circle"></i> ${escapeHtml(b)}</div>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="detail-sidebar">
          ${contactBtnHtml}

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

  modal.classList.add('active');
}

// Render Contact CTA Button
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

// Sharing helpers
function shareWhatsApp(title, company) {
  const url = window.location.href;
  const text = encodeURIComponent(`📢 *INFO LOWONGAN KERJA*\n\nPosisi: *${title}*\nPerusahaan: *${company || '-'}*\n\nLihat poster dan rincian lengkapnya di:\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function copyJobLink(id) {
  const url = window.location.origin + window.location.pathname + `?job=${id}`;
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
