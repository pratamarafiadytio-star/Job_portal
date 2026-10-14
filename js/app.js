// ==============================================================
// KerjaHub - Public Job Seeker Portal JavaScript
// High Interactivity, Live Filtering & Cloud/Local Resilience
// Professional Corporate Presentation (No Emojis & Clean Icons)
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

// Default fallback jobs
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
    views_count: 184,
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
    views_count: 340,
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
    description: 'Creative Sparks mencari Digital Marketing Specialist yang kreatif dan analitis untuk memimpin kampanye multi-channel, paid ads (Meta & TikTok), serta konten promosi.',
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
      'Suasana kerja agensi yang terstruktur dan dinamis',
      'Tunjangan kuota internet & transportasi',
      'Bonus performa pencapaian target kampanye'
    ],
    contact_type: 'link',
    contact_value: 'https://creativesparks.io/apply',
    deadline: '2026-11-15',
    status: 'active',
    is_featured: false,
    views_count: 112,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Junior Graphic Designer & Content Creator',
    company_name: 'Nusantara Media Kreatif',
    category: 'Design & Kreatif',
    job_type: 'Full Time',
    location: 'Yogyakarta / Hybrid',
    salary_display: 'Rp 5.500.000 - Rp 8.000.000 / bln',
    experience_level: 'Fresh Graduate',
    poster_image: './uploads/sample_uiux.jpg',
    description: 'Membuka kesempatan bagi talenta muda kreatif dan Fresh Graduate untuk memproduksi materi promosi visual, flyer poster digital, serta konten sosial media.',
    requirements: [
      'Lulusan D3/S1 Desain Komunikasi Visual atau jurusan relevan (Fresh Graduate dipersilakan melamar)',
      'Menguasai Adobe Illustrator, Photoshop, dan Canva Pro',
      'Memiliki pemahaman visual branding yang solid dan up-to-date',
      'Mampu bekerja sama dalam tim dan terbuka terhadap masukan desain'
    ],
    responsibilities: [
      'Merancang flyer poster promosi, banner, dan materi sosial media harian',
      'Mengedit video pendek kreatif untuk Instagram Reels dan TikTok',
      'Menjaga konsistensi visual branding perusahaan'
    ],
    benefits: [
      'Mentorship intensif langsung dari Senior Art Director',
      'Suasana kerja profesional dan kondusif untuk fresh graduate',
      'Kompensasi lembur & uang makan',
      'BPJS Ketenagakerjaan & Kesehatan'
    ],
    contact_type: 'whatsapp',
    contact_value: '081987654321',
    deadline: '2026-12-10',
    status: 'active',
    is_featured: true,
    views_count: 96,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'AI Prompt Engineer & Data Specialist',
    company_name: 'Nusantara AI Labs',
    category: 'Data & AI',
    job_type: 'Remote',
    location: 'Remote (Seluruh Indonesia)',
    salary_display: 'Rp 16.000.000 - Rp 24.000.000 / bln',
    experience_level: '1-3 Tahun',
    poster_image: './uploads/sample_fullstack.jpg',
    description: 'Bergabung dengan tim AI terdepan untuk mengembangkan pipeline LLM, fine-tuning model generatif, prompt engineering, dan validasi data cerdas.',
    requirements: [
      'Pemahaman konsep dasar Machine Learning, LLM, dan Prompt Engineering',
      'Kemampuan analisis data dengan Python (Pandas, NumPy)',
      'Teliti dan kritis dalam mengevaluasi respons model AI',
      'Bisa bekerja secara mandiri dan disiplin dalam lingkungan 100% remote'
    ],
    responsibilities: [
      'Merancang dan menyempurnakan prompt sistem LLM untuk use case bisnis',
      'Melakukan evaluasi benchmark output AI dan kurasi dataset',
      'Berkolaborasi dengan tim data engineer untuk integrasi API AI'
    ],
    benefits: [
      '100% Kerja dari Rumah (Remote) dari mana saja di Indonesia',
      'Tunjangan internet bulanan & laptop stipend',
      'Akses penuh ke akun AI berbayar dan GPU compute resources',
      'Asuransi rawat inap & jalan'
    ],
    contact_type: 'email',
    contact_value: 'recruitment@nusantara-ai.id',
    deadline: '2026-11-20',
    status: 'active',
    is_featured: false,
    views_count: 145,
    created_at: new Date().toISOString()
  }
];

// Active State
let rawAllJobs = [];
let filteredJobs = [];
let activeFilters = {
  search: '',
  category: 'Semua',
  job_type: 'Semua',
  location: 'Semua',
  experience: 'Semua',
  has_salary: false,
  tab: 'all',
  sort: 'newest'
};

let searchDebounceTimer = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  setupCustomDropdowns();
  setupModalDismiss('job-detail-modal');
  setupModalDismiss('poster-lightbox');
  setupCvMatcher();
  loadJobs();
});

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('kerjahub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('kerjahub_theme', next);
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

// Setup Event Listeners
function setupEventListeners() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Search Input & Clear button
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');
  const searchBtn = document.getElementById('search-btn');
  const searchCategory = document.getElementById('search-category');
  const searchLocation = document.getElementById('search-location');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = val.trim() ? 'block' : 'none';
      }
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        activeFilters.search = val.trim();
        applyFiltersAndRender();
      }, 250);
    });

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchDebounceTimer);
        activeFilters.search = searchInput.value.trim();
        applyFiltersAndRender();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearSearchBtn.style.display = 'none';
      activeFilters.search = '';
      applyFiltersAndRender();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (searchInput) activeFilters.search = searchInput.value.trim();
      if (searchCategory) activeFilters.category = searchCategory.value;
      if (searchLocation) activeFilters.location = searchLocation.value;
      syncSidebarInputs();
      applyFiltersAndRender();
    });
  }

  if (searchCategory) {
    searchCategory.addEventListener('change', (e) => {
      activeFilters.category = e.target.value;
      syncSidebarInputs();
      applyFiltersAndRender();
    });
  }

  if (searchLocation) {
    searchLocation.addEventListener('change', (e) => {
      activeFilters.location = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Trending Chips Click
  document.querySelectorAll('.chip-keyword').forEach(chip => {
    chip.addEventListener('click', () => {
      const kw = chip.dataset.keyword || '';
      if (searchInput) {
        searchInput.value = kw;
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
      }
      activeFilters.search = kw;
      document.querySelectorAll('.chip-keyword').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFiltersAndRender();
      document.getElementById('lowongan')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Tab Buttons
  document.querySelectorAll('.job-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.job-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.tab = btn.dataset.tab || 'all';
      applyFiltersAndRender();
    });
  });

  // Sidebar Radios
  document.querySelectorAll('input[name="filter_category"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.category = e.target.value;
      if (searchCategory) searchCategory.value = e.target.value;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll('input[name="filter_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.job_type = e.target.value;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll('input[name="filter_experience"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.experience = e.target.value;
      applyFiltersAndRender();
    });
  });

  const salaryCheckbox = document.getElementById('filter_has_salary');
  if (salaryCheckbox) {
    salaryCheckbox.addEventListener('change', (e) => {
      activeFilters.has_salary = e.target.checked;
      applyFiltersAndRender();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('btn-reset-filter');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }

  const clearChipsBtn = document.getElementById('btn-clear-all-chips');
  if (clearChipsBtn) {
    clearChipsBtn.addEventListener('click', resetAllFilters);
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeFilters.sort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Grid / List View Toggle
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

// Setup Custom Interactive Dropdowns
function setupCustomDropdowns() {
  const dropdowns = document.querySelectorAll('.custom-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.dropdown-selected-text');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other dropdowns
        dropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });
    }

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.dataset.value;
        const textSpan = item.querySelector('.dropdown-item-left span') || item.querySelector('span');
        const text = textSpan ? textSpan.textContent.trim() : val;

        // Mark active item
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update display text and hidden input
        if (selectedText) selectedText.textContent = text;
        if (hiddenInput) hiddenInput.value = val;

        dropdown.classList.remove('open');

        // Trigger filter actions based on dropdown id
        if (dropdown.id === 'dropdown-category') {
          activeFilters.category = val;
          syncSidebarInputs();
          applyFiltersAndRender();
        } else if (dropdown.id === 'dropdown-location') {
          activeFilters.location = val;
          applyFiltersAndRender();
        } else if (dropdown.id === 'dropdown-sort') {
          activeFilters.sort = val;
          applyFiltersAndRender();
        }
      });
    });
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('open'));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });
}

function syncSidebarInputs() {
  const catRadio = document.querySelector(`input[name="filter_category"][value="${activeFilters.category}"]`);
  if (catRadio) catRadio.checked = true;

  // Sync custom category dropdown
  const catDropdown = document.getElementById('dropdown-category');
  if (catDropdown) {
    const items = catDropdown.querySelectorAll('.dropdown-item');
    items.forEach(i => {
      if (i.dataset.value === activeFilters.category) {
        i.classList.add('active');
        const textSpan = i.querySelector('.dropdown-item-left span') || i.querySelector('span');
        const selectedText = catDropdown.querySelector('.dropdown-selected-text');
        if (selectedText && textSpan) selectedText.textContent = textSpan.textContent.trim();
      } else {
        i.classList.remove('active');
      }
    });
  }
}

function resetAllFilters() {
  activeFilters = {
    search: '',
    category: 'Semua',
    job_type: 'Semua',
    location: 'Semua',
    experience: 'Semua',
    has_salary: false,
    tab: 'all',
    sort: 'newest'
  };

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const clearSearchBtn = document.getElementById('btn-clear-search');
  if (clearSearchBtn) clearSearchBtn.style.display = 'none';

  // Reset custom category dropdown
  const catDropdown = document.getElementById('dropdown-category');
  if (catDropdown) {
    catDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    catDropdown.querySelector('.dropdown-item[data-value="Semua"]')?.classList.add('active');
    const catText = catDropdown.querySelector('.dropdown-selected-text');
    if (catText) catText.textContent = 'Semua Kategori';
    const catInput = document.getElementById('search-category');
    if (catInput) catInput.value = 'Semua';
  }

  // Reset custom location dropdown
  const locDropdown = document.getElementById('dropdown-location');
  if (locDropdown) {
    locDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    locDropdown.querySelector('.dropdown-item[data-value="Semua"]')?.classList.add('active');
    const locText = locDropdown.querySelector('.dropdown-selected-text');
    if (locText) locText.textContent = 'Semua Lokasi';
    const locInput = document.getElementById('search-location');
    if (locInput) locInput.value = 'Semua';
  }

  // Reset custom sort dropdown
  const sortDropdown = document.getElementById('dropdown-sort');
  if (sortDropdown) {
    sortDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    sortDropdown.querySelector('.dropdown-item[data-value="newest"]')?.classList.add('active');
    const sortText = sortDropdown.querySelector('.dropdown-selected-text');
    if (sortText) sortText.textContent = 'Terbaru Ditambahkan';
    const sortInput = document.getElementById('sort-select');
    if (sortInput) sortInput.value = 'newest';
  }

  const allCatRadio = document.querySelector('input[name="filter_category"][value="Semua"]');
  if (allCatRadio) allCatRadio.checked = true;

  const allTypeRadio = document.querySelector('input[name="filter_type"][value="Semua"]');
  if (allTypeRadio) allTypeRadio.checked = true;

  const allExpRadio = document.querySelector('input[name="filter_experience"][value="Semua"]');
  if (allExpRadio) allExpRadio.checked = true;

  const salaryCheckbox = document.getElementById('filter_has_salary');
  if (salaryCheckbox) salaryCheckbox.checked = false;

  document.querySelectorAll('.job-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.job-tab-btn[data-tab="all"]')?.classList.add('active');

  document.querySelectorAll('.chip-keyword').forEach(c => c.classList.remove('active'));

  applyFiltersAndRender();
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

// Load Jobs: Multi-layer fetching (Supabase -> Server API -> Fallback DEFAULT_JOBS)
async function loadJobs() {
  const container = document.getElementById('jobs-container');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary);"></i>
        <p style="margin-top: 14px; color: var(--text-muted); font-weight: 500;">Memuat info lowongan & poster resmi...</p>
      </div>
    `;
  }

  let jobs = null;

  // 1. Try Supabase Cloud Client (fetch both active and expired/closed so locked jobs stay visible)
  if (sbClient) {
    try {
      const { data, error } = await sbClient.from('jobs').select('*').in('status', ['active', 'expired', 'closed']);
      if (!error && Array.isArray(data) && data.length > 0) {
        jobs = data;
      }
    } catch (e) {}
  }

  // 2. Try Local Express Server API
  if (!jobs) {
    try {
      const res = await fetch('./api/jobs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          jobs = json.data;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to DEFAULT_JOBS
  if (!jobs || jobs.length === 0) {
    jobs = DEFAULT_JOBS;
  }

  rawAllJobs = jobs;
  updateTabCounters();
  applyFiltersAndRender();

  // Check URL query param ?job=:id for deep linking
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const targetJobId = urlParams.get('job');
    if (targetJobId) {
      setTimeout(() => {
        openJobDetail(targetJobId);
      }, 500);
    }
  } catch (e) {}
}

// Calculate Tab Counters
function updateTabCounters() {
  const allActive = rawAllJobs.filter(j => j.status === 'active' || j.status === 'expired' || j.status === 'closed');
  const featured = allActive.filter(j => j.is_featured === 1 || j.is_featured === true || j.is_featured === '1');
  const remote = allActive.filter(j => (j.job_type && j.job_type.toLowerCase().includes('remote')) || (j.location && j.location.toLowerCase().includes('remote')));
  const freshgrad = allActive.filter(j => (j.experience_level && j.experience_level.toLowerCase().includes('fresh')) || (j.description && j.description.toLowerCase().includes('fresh graduate')));

  document.getElementById('tab-count-all') && (document.getElementById('tab-count-all').textContent = allActive.length);
  document.getElementById('tab-count-featured') && (document.getElementById('tab-count-featured').textContent = featured.length);
  document.getElementById('tab-count-remote') && (document.getElementById('tab-count-remote').textContent = remote.length);
  document.getElementById('tab-count-freshgrad') && (document.getElementById('tab-count-freshgrad').textContent = freshgrad.length);
}

// Apply Filters and Render
function applyFiltersAndRender() {
  // Keep active and expired/closed jobs visible in the feed (only exclude deleted/archived)
  let list = rawAllJobs.filter(j => j.status !== 'deleted' && j.status !== 'archived');

  // Filter Tab
  if (activeFilters.tab === 'featured') {
    list = list.filter(j => j.is_featured === 1 || j.is_featured === true || j.is_featured === '1');
  } else if (activeFilters.tab === 'remote') {
    list = list.filter(j => (j.job_type && j.job_type.toLowerCase().includes('remote')) || (j.location && j.location.toLowerCase().includes('remote')));
  } else if (activeFilters.tab === 'freshgrad') {
    list = list.filter(j => (j.experience_level && j.experience_level.toLowerCase().includes('fresh')) || (j.description && j.description.toLowerCase().includes('fresh graduate')));
  }

  // Filter Kategori
  if (activeFilters.category && activeFilters.category !== 'Semua') {
    list = list.filter(j => j.category === activeFilters.category);
  }

  // Filter Tipe Pekerjaan
  if (activeFilters.job_type && activeFilters.job_type !== 'Semua') {
    list = list.filter(j => j.job_type === activeFilters.job_type);
  }

  // Filter Lokasi
  if (activeFilters.location && activeFilters.location !== 'Semua') {
    const loc = activeFilters.location.toLowerCase();
    list = list.filter(j => j.location && j.location.toLowerCase().includes(loc));
  }

  // Filter Pengalaman
  if (activeFilters.experience && activeFilters.experience !== 'Semua') {
    const exp = activeFilters.experience.toLowerCase();
    list = list.filter(j => j.experience_level && j.experience_level.toLowerCase().includes(exp));
  }

  // Filter Gaji
  if (activeFilters.has_salary) {
    list = list.filter(j => j.salary_display && j.salary_display.toLowerCase().includes('rp'));
  }

  // Filter Search
  if (activeFilters.search) {
    const s = activeFilters.search.toLowerCase();
    list = list.filter(j => {
      const titleMatch = j.title && j.title.toLowerCase().includes(s);
      const companyMatch = j.company_name && j.company_name.toLowerCase().includes(s);
      const descMatch = j.description && j.description.toLowerCase().includes(s);
      const catMatch = j.category && j.category.toLowerCase().includes(s);
      const locMatch = j.location && j.location.toLowerCase().includes(s);
      return titleMatch || companyMatch || descMatch || catMatch || locMatch;
    });
  }

  // Sorting
  if (window.activeCvKeywords && window.activeCvKeywords.length > 0) {
    // CV matching active: sort by match score descending
    list.sort((a, b) => {
      const scoreA = a._matchScore || 0;
      const scoreB = b._matchScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return Number(b.id) - Number(a.id);
    });
  } else if (activeFilters.sort === 'views') {
    list.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  } else if (activeFilters.sort === 'featured') {
    list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  } else {
    // Newest
    list.sort((a, b) => {
      if ((b.is_featured ? 1 : 0) !== (a.is_featured ? 1 : 0)) {
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
      return Number(b.id) - Number(a.id);
    });
  }

  filteredJobs = list;
  renderActiveFilterChips();
  renderJobs(filteredJobs);
  updateCountDisplay(filteredJobs.length);
  updateTabCounters();
}

function updateCountDisplay(count) {
  const countEl = document.getElementById('results-count-num');
  if (countEl) countEl.textContent = count;
}

// Active Filter Chips Bar
function renderActiveFilterChips() {
  const bar = document.getElementById('active-filters-bar');
  const chipsContainer = document.getElementById('active-filter-chips');
  if (!bar || !chipsContainer) return;

  const chips = [];

  if (activeFilters.tab !== 'all') {
    const tabLabels = {
      featured: 'Rekomendasi Unggulan',
      remote: 'Remote (WFH)',
      freshgrad: 'Fresh Graduate'
    };
    chips.push({
      label: `Tab: ${tabLabels[activeFilters.tab] || activeFilters.tab}`,
      action: () => {
        activeFilters.tab = 'all';
        document.querySelectorAll('.job-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.job-tab-btn[data-tab="all"]')?.classList.add('active');
      }
    });
  }

  if (activeFilters.search) {
    chips.push({
      label: `Kata Kunci: "${activeFilters.search}"`,
      action: () => {
        activeFilters.search = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        document.querySelectorAll('.chip-keyword').forEach(c => c.classList.remove('active'));
      }
    });
  }

  if (activeFilters.category !== 'Semua') {
    chips.push({
      label: `Kategori: ${activeFilters.category}`,
      action: () => {
        activeFilters.category = 'Semua';
        const sc = document.getElementById('search-category');
        if (sc) sc.value = 'Semua';
        const allCatRadio = document.querySelector('input[name="filter_category"][value="Semua"]');
        if (allCatRadio) allCatRadio.checked = true;
        const catDropdown = document.getElementById('dropdown-category');
        if (catDropdown) {
          catDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
          catDropdown.querySelector('.dropdown-item[data-value="Semua"]')?.classList.add('active');
          const catText = catDropdown.querySelector('.dropdown-selected-text');
          if (catText) catText.textContent = 'Semua Kategori';
        }
      }
    });
  }

  if (activeFilters.job_type !== 'Semua') {
    chips.push({
      label: `Tipe: ${activeFilters.job_type}`,
      action: () => {
        activeFilters.job_type = 'Semua';
        const allTypeRadio = document.querySelector('input[name="filter_type"][value="Semua"]');
        if (allTypeRadio) allTypeRadio.checked = true;
      }
    });
  }

  if (activeFilters.location !== 'Semua') {
    chips.push({
      label: `Lokasi: ${activeFilters.location}`,
      action: () => {
        activeFilters.location = 'Semua';
        const sl = document.getElementById('search-location');
        if (sl) sl.value = 'Semua';
        const locDropdown = document.getElementById('dropdown-location');
        if (locDropdown) {
          locDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
          locDropdown.querySelector('.dropdown-item[data-value="Semua"]')?.classList.add('active');
          const locText = locDropdown.querySelector('.dropdown-selected-text');
          if (locText) locText.textContent = 'Semua Lokasi';
        }
      }
    });
  }

  if (activeFilters.experience !== 'Semua') {
    chips.push({
      label: `Level: ${activeFilters.experience}`,
      action: () => {
        activeFilters.experience = 'Semua';
        const allExpRadio = document.querySelector('input[name="filter_experience"][value="Semua"]');
        if (allExpRadio) allExpRadio.checked = true;
      }
    });
  }

  if (activeFilters.has_salary) {
    chips.push({
      label: `Dengan Info Gaji`,
      action: () => {
        activeFilters.has_salary = false;
        const cb = document.getElementById('filter_has_salary');
        if (cb) cb.checked = false;
      }
    });
  }

  if (chips.length > 0) {
    bar.style.display = 'flex';
    chipsContainer.innerHTML = chips.map((c, idx) => `
      <div class="filter-chip-item">
        <span>${escapeHtml(c.label)}</span>
        <button type="button" onclick="removeFilterChip(${idx})" title="Hapus filter"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join('');
    window._chipActions = chips.map(c => c.action);
  } else {
    bar.style.display = 'none';
    chipsContainer.innerHTML = '';
    window._chipActions = [];
  }
}

window.removeFilterChip = function(idx) {
  if (window._chipActions && window._chipActions[idx]) {
    window._chipActions[idx]();
    applyFiltersAndRender();
  }
};

// Render Job Cards
function renderJobs(jobs) {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  if (jobs.length === 0) {
    showEmptyState();
    return;
  }

  container.innerHTML = jobs.map(job => {
    const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
    let posterSrc = job.poster_image ? job.poster_image : defaultPoster;
    if (posterSrc.startsWith('/uploads/')) {
      posterSrc = '.' + posterSrc;
    }

    const isLocked = (job.status === 'expired' || job.status === 'closed');
    const initial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C';
    const timeAgo = formatTimeAgo(job.created_at);
    const urgencyBadge = calculateUrgencyBadge(job.deadline);

    // Dynamic skill pills from category & job
    const skillTags = generateSkillPills(job);
    const safeTitle = (job.title || '').replace(/'/g, "\\'");

    return `
      <div class="job-card ${isLocked ? 'job-card-locked' : ''}" data-id="${job.id}">

        <!-- Poster Design Preview with Lightbox trigger -->
        <div class="job-poster-preview" onclick="${isLocked ? `showLockedNotice('${safeTitle}')` : `openLightbox('${posterSrc}', '${safeTitle}')`}">
          <img src="${posterSrc}" alt="${escapeHtml(job.title)}" loading="lazy" onerror="this.src='${defaultPoster}'">
          ${isLocked ? '<div class="badge-locked-overlay"><i class="fa-solid fa-lock"></i> TELAH DITUTUP (EXPIRED)</div>' : ''}
          ${job.is_featured && !isLocked ? '<div class="badge-featured"><i class="fa-solid fa-star"></i> Unggulan</div>' : ''}
          <div class="badge-category">${escapeHtml(job.category)}</div>
          <div class="poster-overlay">
            <span class="poster-badge-btn"><i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-expand'}"></i> ${isLocked ? 'Lowongan Telah Kedaluwarsa' : 'Buka Poster Penuh'}</span>
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

          <h3 class="job-title" onclick="${isLocked ? `showLockedNotice('${safeTitle}')` : `openJobDetail(${job.id})`}" title="${isLocked ? 'Lowongan telah ditutup (Expired)' : 'Klik untuk rincian lengkap'}">${escapeHtml(job.title)}</h3>

          <div class="job-badges">
            <span class="pill pill-type"><i class="fa-regular fa-clock"></i> ${escapeHtml(job.job_type)}</span>
            ${job.salary_display ? `<span class="pill pill-salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</span>` : ''}
            ${isLocked ? '<span class="pill pill-expired"><i class="fa-solid fa-ban"></i> Lowongan Berakhir / Terkunci</span>' : urgencyBadge}
          </div>

          <!-- CV Match Score Badge (if active) -->
          ${job._matchScore ? `
            <div style="margin-top: 6px;">
              <span class="cv-match-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Kecocokan CV: ${job._matchScore}%</span>
              ${job._matchedSkills && job._matchedSkills.length > 0 ? `
                <div class="matched-skills-chips">
                  <span class="matched-skills-label">Skill Terdeteksi:</span>
                  ${job._matchedSkills.map(s => `<span class="matched-skill-tag"><i class="fa-solid fa-check"></i> ${escapeHtml(s)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Skill Chips -->
          <div class="card-skills-list">
            ${skillTags.map(tag => `<span class="skill-tag-pill" onclick="searchBySkill(event, '${escapeHtml(tag)}')">#${escapeHtml(tag)}</span>`).join('')}
          </div>

          <p class="job-excerpt">${escapeHtml(job.description)}</p>

          <div class="job-card-footer">
            <span class="posted-time"><i class="fa-regular fa-calendar"></i> ${timeAgo}</span>
            <div class="card-actions" style="width: ${isLocked ? '100%' : 'auto'};">
              ${isLocked ? `
                <button type="button" class="btn-locked-disabled" onclick="showLockedNotice('${safeTitle}')" title="Lowongan sudah kedaluwarsa">
                  <i class="fa-solid fa-lock"></i> Lowongan Telah Ditutup (Expired)
                </button>
              ` : `
                <button type="button" class="btn btn-outline btn-sm" onclick="openJobDetail(${job.id})">
                  <i class="fa-regular fa-eye"></i> Detail
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="openJobDetail(${job.id})">
                  <i class="fa-solid fa-paper-plane"></i> Hubungi
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Generate skill pills based on job properties
function generateSkillPills(job) {
  const pills = [];
  if (job.category) {
    if (job.category.includes('Teknologi')) pills.push('Tech', 'Development');
    else if (job.category.includes('Design')) pills.push('Design', 'Creative');
    else if (job.category.includes('Marketing')) pills.push('Marketing', 'Campaign');
    else if (job.category.includes('AI')) pills.push('AI', 'Data');
  }
  if (job.job_type && job.job_type.includes('Remote')) pills.push('WFH');
  if (job.experience_level && job.experience_level.includes('Fresh')) pills.push('FreshGraduate');
  return pills.slice(0, 3);
}

// Urgency badge calculation
function calculateUrgencyBadge(deadlineStr) {
  if (!deadlineStr) return '<span class="pill pill-urgency"><i class="fa-solid fa-circle-check"></i> Terbuka</span>';
  try {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return '<span class="pill" style="background: rgba(239, 68, 68, 0.12); color: #ef4444;"><i class="fa-solid fa-clock-rotate-left"></i> Segera Berakhir</span>';
    } else if (diffDays <= 7) {
      return `<span class="pill pill-urgency"><i class="fa-solid fa-hourglass-half"></i> Sisa ${diffDays} Hari</span>`;
    } else {
      return `<span class="pill pill-urgency"><i class="fa-regular fa-calendar-check"></i> Sisa ${diffDays} Hari</span>`;
    }
  } catch (e) {
    return '';
  }
}

// Quick Search by Skill Tag
window.searchBySkill = function(event, skill) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = skill;
    const clearBtn = document.getElementById('btn-clear-search');
    if (clearBtn) clearBtn.style.display = 'block';
  }
  activeFilters.search = skill;
  applyFiltersAndRender();
  document.getElementById('lowongan')?.scrollIntoView({ behavior: 'smooth' });
};

// Empty State Display
function showEmptyState() {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-magnifying-glass" style="color: var(--primary);"></i>
      </div>
      <h3 class="empty-title">Tidak Ada Lowongan yang Sesuai</h3>
      <p class="empty-desc">
        Coba gunakan kata kunci pencarian yang berbeda atau reset filter untuk melihat semua poster rekrutmen resmi yang tersedia.
      </p>
      <button class="btn btn-primary" onclick="resetAllFilters()">
        <i class="fa-solid fa-rotate-left"></i> Tampilkan Semua Lowongan
      </button>
    </div>
  `;
}

// Lightbox modal for posters
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
  const job = rawAllJobs.find(j => Number(j.id) === Number(jobId));
  if (!job) return;

  // Strict check: if job is locked / expired, visitor CANNOT open detail modal
  if (job.status === 'expired' || job.status === 'closed') {
    showLockedNotice(job.title);
    return;
  }

  const modal = document.getElementById('job-detail-modal');
  const content = document.getElementById('job-detail-content');
  if (!modal || !content) return;

  // Increment views count in Supabase Cloud
  if (sbClient) {
    sbClient.from('jobs').update({ views_count: (job.views_count || 0) + 1 }).eq('id', job.id).then();
  }

  const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
  let posterSrc = job.poster_image ? job.poster_image : defaultPoster;
  if (posterSrc.startsWith('/uploads/')) {
    posterSrc = '.' + posterSrc;
  }

  const contacts = extractJobContacts(job);
  const contactBtnHtml = renderContactButton(job);

  const reqs = Array.isArray(job.requirements) ? job.requirements : (typeof job.requirements === 'string' ? JSON.parse(job.requirements || '[]') : []);
  const resps = Array.isArray(job.responsibilities) ? job.responsibilities : (typeof job.responsibilities === 'string' ? JSON.parse(job.responsibilities || '[]') : []);
  const bens = Array.isArray(job.benefits) ? job.benefits : (typeof job.benefits === 'string' ? JSON.parse(job.benefits || '[]') : []);

  // Pre-formatted intro template for job seekers
  const waTemplate = `Halo Bapak/Ibu HRD ${job.company_name},\n\nPerkenalkan saya [Nama Anda]. Saya melihat poster informasi lowongan pekerjaan untuk posisi ${job.title} yang dipublikasikan melalui KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja untuk posisi tersebut. Bersama pesan ini, saya siap melampirkan berkas CV dan Portofolio terbaru saya.\n\nMohon informasi mengenai proses seleksi selanjutnya. Terima kasih atas perhatian dan kesempatannya.`;

  const safeTitle = (job.title || '').replace(/'/g, "\\'");
  const safeCompany = (job.company_name || '').replace(/'/g, "\\'");

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
          
          <!-- Keterangan -->
          <div class="detail-section">
            <h4><i class="fa-solid fa-file-lines"></i> Keterangan & Deskripsi Posisi</h4>
            <p style="white-space: pre-line; line-height: 1.7;">${escapeHtml(job.description)}</p>
          </div>

          <!-- Tanggung Jawab -->
          ${resps.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-list-check"></i> Tanggung Jawab Pekerjaan</h4>
              <ul class="detail-list">
                ${resps.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Interactive Kualifikasi Checklist (Dynamic Match Meter) -->
          ${reqs.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-user-check"></i> Kualifikasi & Persyaratan</h4>
              <div class="interactive-check-box">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">
                    <i class="fa-solid fa-calculator"></i> Evaluasi Kesesuaian Profil Anda:
                  </span>
                  <span id="match-score-text" style="font-size: 0.82rem; font-weight: 800; color: var(--primary);">
                    0 / ${reqs.length} Kualifikasi Terpenuhi (0%)
                  </span>
                </div>
                <div class="check-meter-bar">
                  <div class="check-meter-fill" id="match-score-fill" style="width: 0%;"></div>
                </div>
                <div style="margin-top: 10px;">
                  ${reqs.map((req, i) => `
                    <label class="check-list-item" id="check-item-${i}">
                      <input type="checkbox" onchange="updateMatchScore(${reqs.length})">
                      <span>${escapeHtml(req)}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Benefit -->
          ${bens.length > 0 ? `
            <div class="detail-section">
              <h4><i class="fa-solid fa-gift"></i> Benefit & Fasilitas</h4>
              <div class="benefits-pills">
                ${bens.map(b => `<div class="benefit-tag"><i class="fa-solid fa-check-circle"></i> ${escapeHtml(b)}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Template Pesan Lamaran ke HRD -->
          <div class="chat-template-card">
            <div class="chat-template-header">
              <span style="font-size: 0.84rem; font-weight: 800; color: var(--text-main);">
                <i class="fa-solid fa-comment-dots" style="color: var(--primary);"></i> Template Pesan Perkenalan ke HRD:
              </span>
              <button type="button" class="btn-copy-template" onclick="copyApplicationTemplate('${safeTitle}', '${safeCompany}')">
                <i class="fa-regular fa-copy"></i> Salin Pesan
              </button>
            </div>
            <div class="chat-template-text" id="wa-template-box">${escapeHtml(waTemplate)}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 6px;">
              * Salin pesan di atas dan ganti <code>[Nama Anda]</code> sebelum mengirim ke kontak perekrut.
            </div>
          </div>

        </div>

        <!-- Sidebar Info -->
        <div class="detail-sidebar">
          
          <!-- Primary CTA Buttons (WhatsApp / Email / Website Multi-Channel) -->
          ${contactBtnHtml}

          <!-- Poster Showcase -->
          <div class="poster-showcase-box">
            <p style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
              <i class="fa-solid fa-file-image"></i> POSTER REKRUTMEN RESMI
            </p>
            <img src="${posterSrc}" alt="Poster Lowongan" onclick="openLightbox('${posterSrc}', '${safeTitle}')">
            <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="btn btn-outline btn-sm" onclick="openLightbox('${posterSrc}', '${safeTitle}')">
                <i class="fa-solid fa-expand"></i> Perbesar
              </button>
              <a href="${posterSrc}" target="_blank" download class="btn btn-outline btn-sm">
                <i class="fa-solid fa-download"></i> Unduh Poster
              </a>
            </div>
          </div>

          <!-- Ringkasan Kartu -->
          <div class="sidebar-card">
            <div class="sidebar-card-title">Ringkasan Lowongan</div>
            
            <div class="info-item">
              <i class="fa-solid fa-money-bill-wave"></i>
              <div>
                <div class="info-label">Gaji Ditawarkan</div>
                <div class="info-val" style="color: var(--success); font-weight: 700;">${escapeHtml(job.salary_display || 'Kompetitif')}</div>
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
                <div class="info-label">Tingkat Pengalaman</div>
                <div class="info-val">${escapeHtml(job.experience_level || 'Semua Tingkat')}</div>
              </div>
            </div>

            <div class="info-item">
              <i class="fa-solid fa-calendar-xmark"></i>
              <div>
                <div class="info-label">Batas Waktu Rekrutmen</div>
                <div class="info-val">${escapeHtml(job.deadline || 'Terbuka Selama Lowongan Aktif')}</div>
              </div>
            </div>

            ${contacts.whatsapp ? `
              <div class="info-item">
                <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i>
                <div>
                  <div class="info-label">WhatsApp Perekrut</div>
                  <div class="info-val">
                    <a href="javascript:void(0)" onclick="triggerWhatsAppChat('${contacts.whatsapp}', '${safeCompany}', '${safeTitle}')" style="color: #16a34a; font-weight: 700;">
                      ${escapeHtml(contacts.whatsapp)}
                    </a>
                  </div>
                </div>
              </div>
            ` : ''}

            ${contacts.email ? `
              <div class="info-item">
                <i class="fa-solid fa-envelope" style="color: var(--primary);"></i>
                <div>
                  <div class="info-label">Email Rekrutmen</div>
                  <div class="info-val" style="word-break: break-all;">
                    <a href="mailto:${contacts.email}" style="color: var(--primary); font-weight: 600;">${escapeHtml(contacts.email)}</a>
                  </div>
                </div>
              </div>
            ` : ''}

            ${contacts.website_url ? `
              <div class="info-item">
                <i class="fa-solid fa-globe" style="color: #0284c7;"></i>
                <div>
                  <div class="info-label">Tautan / Web Resmi</div>
                  <div class="info-val" style="word-break: break-all;">
                    <a href="${contacts.website_url.startsWith('http') ? contacts.website_url : 'https://' + contacts.website_url}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600;">
                      ${escapeHtml(contacts.website_url)}
                    </a>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Bagikan Lowongan -->
          <div class="sidebar-card" style="text-align: center;">
            <div class="sidebar-card-title" style="margin-bottom: 10px;">
              <i class="fa-solid fa-share-nodes"></i> Bagikan Info Lowongan
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button type="button" class="btn btn-sm" style="background: #25d366; color: white; border: none; font-weight: 700;" onclick="shareWhatsApp('${safeTitle}', '${safeCompany}')">
                <i class="fa-brands fa-whatsapp"></i> Bagikan via WhatsApp
              </button>
              <button type="button" class="btn btn-outline btn-sm" onclick="copyJobLink(${job.id})">
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

// Notice for Locked / Expired Jobs
window.showLockedNotice = function(jobTitle) {
  showToast('error', `Lowongan untuk posisi "${jobTitle || 'Pekerjaan ini'}" telah berakhir dan dikunci oleh pihak rekruter. Anda tidak dapat membuka detail atau mengajukan lamaran baru.`);
};

// Interactive Checklist Match Score
window.updateMatchScore = function(totalReqs) {
  if (totalReqs <= 0) return;
  const checked = document.querySelectorAll('.check-list-item input[type="checkbox"]:checked').length;
  const pct = Math.round((checked / totalReqs) * 100);

  const fillEl = document.getElementById('match-score-fill');
  const textEl = document.getElementById('match-score-text');

  if (fillEl) fillEl.style.width = pct + '%';
  if (textEl) {
    textEl.textContent = `${checked} / ${totalReqs} Kualifikasi Terpenuhi (${pct}%)`;
    if (pct >= 80) textEl.style.color = 'var(--success)';
    else if (pct >= 50) textEl.style.color = 'var(--primary)';
    else textEl.style.color = '#f59e0b';
  }

  // Strike-through checked items
  document.querySelectorAll('.check-list-item').forEach(item => {
    const cb = item.querySelector('input[type="checkbox"]');
    if (cb && cb.checked) {
      item.classList.add('checked');
    } else {
      item.classList.remove('checked');
    }
  });
};

// Copy Application Template
window.copyApplicationTemplate = function(title, company) {
  const box = document.getElementById('wa-template-box');
  const text = box ? box.textContent : `Halo HRD ${company}, saya tertarik melamar posisi ${title} di KerjaHub.`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('success', 'Template pesan lamaran berhasil disalin ke clipboard.');
  });
};

// Universal Contact Extractor for Job Objects
function extractJobContacts(job) {
  let wa = job.whatsapp || '';
  let email = job.email || '';
  let website = job.website_url || '';

  if (job.contact_value) {
    const raw = String(job.contact_value).trim();
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.whatsapp && !wa) wa = parsed.whatsapp;
        if (parsed.email && !email) email = parsed.email;
        if (parsed.website_url && !website) website = parsed.website_url;
      } catch (e) {}
    } else {
      const type = job.contact_type || '';
      if (type === 'whatsapp' && !wa) wa = raw;
      else if (type === 'email' && !email) email = raw;
      else if ((type === 'link' || type === 'website') && !website) website = raw;
      else {
        if (raw.includes('@') && !email) email = raw;
        else if (raw.match(/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i) && !website) website = raw;
        else if (raw.match(/^[0-9+ -]{7,20}$/) && !wa) wa = raw;
      }
    }
  }

  return {
    whatsapp: (wa || '').trim(),
    email: (email || '').trim(),
    website_url: (website || '').trim()
  };
}

// Render Multi-Channel Contact Buttons
function renderContactButton(job) {
  const contacts = extractJobContacts(job);
  const buttons = [];

  const safeTitle = (job.title || '').replace(/'/g, "\\'");
  const safeCompany = (job.company_name || '').replace(/'/g, "\\'");

  // 1. WhatsApp Button (Direct Web & Mobile trigger)
  if (contacts.whatsapp) {
    buttons.push(`
      <div style="width: 100%;">
        <button type="button" class="btn-wa-direct" onclick="triggerWhatsAppChat('${contacts.whatsapp}', '${safeCompany}', '${safeTitle}')" title="Hubungi langsung via WhatsApp Web atau Aplikasi">
          <i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i> Hubungi Rekruter via WhatsApp
        </button>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 0.76rem; color: var(--text-muted); padding: 0 4px;">
          <span>No. WA: <strong>${escapeHtml(contacts.whatsapp)}</strong></span>
          <a href="javascript:void(0)" onclick="copyToClipboard('${contacts.whatsapp}', 'Nomor WhatsApp berhasil disalin ke clipboard')" style="color: var(--primary); text-decoration: underline; font-weight: 600;">Salin Nomor</a>
        </div>
      </div>
    `);
  }

  // 2. Email Button
  if (contacts.email) {
    const mailSubject = encodeURIComponent(`Lamaran Pekerjaan: ${job.title} - [Nama Pelamar]`);
    const mailBody = encodeURIComponent(`Halo Tim Rekrutmen ${job.company_name},\n\nSaya melihat informasi poster lowongan posisi ${job.title} yang dipublikasikan melalui KerjaHub dan bermaksud mengajukan lamaran kerja.\n\nBersama email ini saya lampirkan dokumen CV dan Portofolio terbaru saya.\n\nTerima kasih.\n\nSalam hormat,\n[Nama Pelamar]`);
    buttons.push(`
      <a href="mailto:${contacts.email}?subject=${mailSubject}&body=${mailBody}" class="btn-email-direct" title="Kirim lamaran kerja via Email">
        <i class="fa-solid fa-envelope"></i> Kirim Lamaran via Email (${escapeHtml(contacts.email)})
      </a>
    `);
  }

  // 3. Website / Portal Button
  if (contacts.website_url) {
    const webUrl = contacts.website_url.startsWith('http') ? contacts.website_url : `https://${contacts.website_url}`;
    buttons.push(`
      <a href="${webUrl}" target="_blank" rel="noopener noreferrer" class="btn-web-direct" title="Buka tautan formulir pendaftaran resmi">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Tautan Pendaftaran Resmi
      </a>
    `);
  }

  if (buttons.length > 0) {
    return `<div class="modal-contact-channels">${buttons.join('')}</div>`;
  }

  return `
    <button type="button" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;" onclick="copyJobLink(${job.id})">
      <i class="fa-solid fa-share-nodes"></i> Bagikan Lowongan Ini
    </button>
  `;
}

// Reliable WhatsApp Chat Launcher
window.triggerWhatsAppChat = function(phone, companyName, jobTitle) {
  if (!phone) {
    showToast('error', 'Nomor WhatsApp perekrut tidak tersedia.');
    return;
  }

  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  } else if (!clean.startsWith('62') && clean.length <= 11) {
    clean = '62' + clean;
  }

  const textMsg = encodeURIComponent(
    `Halo Bapak/Ibu HRD ${companyName || 'Perusahaan'},\n\nPerkenalkan saya [Nama Anda]. Saya melihat poster informasi lowongan untuk posisi ${jobTitle || 'Pekerjaan'} yang dipublikasikan melalui KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja untuk posisi tersebut dan siap melampirkan berkas CV serta Portofolio terbaru saya. Mohon informasi mengenai tahapan seleksi selanjutnya.\n\nTerima kasih.`
  );

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const waUrl = isMobile
    ? `https://api.whatsapp.com/send?phone=${clean}&text=${textMsg}`
    : `https://web.whatsapp.com/send?phone=${clean}&text=${textMsg}`;

  const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // Popup was blocked or desktop protocol, fallback
    window.location.href = `https://wa.me/${clean}?text=${textMsg}`;
  }
};

// Clipboard Helper
window.copyToClipboard = function(text, successMsg) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('info', successMsg || 'Berhasil disalin ke clipboard.');
  }).catch(() => {
    showToast('info', text);
  });
};

// Sharing helpers
function shareWhatsApp(title, company) {
  const url = window.location.href;
  const text = encodeURIComponent(`*INFORMASI LOWONGAN KERJA RESMI*\n\nPosisi: *${title}*\nPerusahaan: *${company || '-'}*\n\nLihat poster dan kontak perekrut resmi di:\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function copyJobLink(id) {
  const url = window.location.origin + window.location.pathname + `?job=${id}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('info', 'Tautan info lowongan berhasil disalin ke clipboard.');
  });
}

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

// ==============================================================
// SMART AI CV MATCHER IMPLEMENTATION
// ==============================================================
window.activeCvKeywords = null;

const SKILL_KEYWORDS_DICT = [
  'react', 'vue', 'angular', 'node', 'nodejs', 'express', 'javascript', 'typescript', 'php', 'laravel', 
  'python', 'django', 'fastapi', 'java', 'spring', 'kotlin', 'flutter', 'android', 'ios', 'swift',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 
  'redis', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'github', 'api', 'rest api', 'graphql',
  'ui', 'ux', 'ui/ux', 'figma', 'adobe', 'photoshop', 'illustrator', 'canva', 'prototyping', 'design system',
  'marketing', 'digital marketing', 'social media', 'content creator', 'copywriter', 'copywriting', 'seo', 'sem',
  'meta ads', 'facebook ads', 'instagram ads', 'tiktok ads', 'google ads', 'sales', 'business development',
  'data', 'data analyst', 'data science', 'machine learning', 'deep learning', 'ai', 'prompt engineering', 'llm',
  'excel', 'powerbi', 'tableau', 'accounting', 'finance', 'administrasi', 'customer service', 'support', 'hr', 'hrd'
];

function setupCvMatcher() {
  const dropzone = document.getElementById('cv-dropzone');
  const fileInput = document.getElementById('cv-file-input');
  const browseBtn = document.getElementById('btn-browse-cv');
  const pasteInput = document.getElementById('cv-paste-input');
  const analyzeBtn = document.getElementById('btn-analyze-cv');
  const resetCvBtn = document.getElementById('btn-reset-cv');

  if (browseBtn && fileInput) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = 'rgba(99, 102, 241, 0.12)';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
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
        showToast('error', 'Silakan tempel ringkasan CV / resume atau unggah file dokumen Anda terlebih dahulu.');
        return;
      }
      runCvAnalysis(text, 'Teks Input Resume');
    });
  }

  if (resetCvBtn) {
    resetCvBtn.addEventListener('click', () => {
      resetCvMatcher();
    });
  }
}

async function handleCvFileUpload(file) {
  const titleEl = document.getElementById('cv-drop-title');
  const subtitleEl = document.getElementById('cv-drop-subtitle');
  if (titleEl) titleEl.textContent = `Memproses: ${file.name}...`;
  if (subtitleEl) subtitleEl.textContent = 'Mengekstrak teks & menganalisis keahlian dengan AI...';

  try {
    let text = '';
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      if (window.pdfjsLib) {
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
    } else if (ext === 'txt') {
      text = await file.text();
    } else {
      try {
        text = await file.text();
      } catch (e) {
        text = file.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
      }
    }

    if (!text || text.trim().length < 20) {
      text = file.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
    }

    if (titleEl) titleEl.textContent = `Dokumen: ${file.name}`;
    if (subtitleEl) subtitleEl.textContent = 'Analisis selesai! Lowongan telah diurutkan berdasarkan relevansi.';
    const pasteInput = document.getElementById('cv-paste-input');
    if (pasteInput && text.length > 30) {
      pasteInput.value = text.slice(0, 300) + '...';
    }

    runCvAnalysis(text, file.name);
  } catch (err) {
    console.error('CV File Read Error:', err);
    if (titleEl) titleEl.textContent = 'Gagal membaca isi dokumen otomatis';
    if (subtitleEl) subtitleEl.textContent = 'Silakan coba tempel (paste) teks CV Anda pada kolom di bawah.';
    showToast('error', 'Gagal memindai berkas otomatis. Silakan tempel teks CV Anda pada kolom teks di bawah.');
  }
}

function runCvAnalysis(rawText, sourceName) {
  const lower = (rawText || '').toLowerCase();
  
  // Detect candidate skills
  const candidateSkills = [];
  SKILL_KEYWORDS_DICT.forEach(skill => {
    const regex = new RegExp(`(^|[^a-z0-9])${skill.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      candidateSkills.push(skill);
    }
  });

  // Calculate score for each job
  let matchCount = 0;
  rawAllJobs.forEach(job => {
    const jobText = [
      job.title,
      job.category,
      job.job_type,
      job.location,
      job.description,
      Array.isArray(job.requirements) ? job.requirements.join(' ') : job.requirements,
      Array.isArray(job.responsibilities) ? job.responsibilities.join(' ') : job.responsibilities
    ].join(' ').toLowerCase();

    const matchedForThisJob = [];
    candidateSkills.forEach(skill => {
      const reg = new RegExp(`(^|[^a-z0-9])${skill.replace(/[+*?^$.()|[\]{}\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
      if (reg.test(jobText)) {
        matchedForThisJob.push(skill);
      }
    });

    let score = 30; // base score
    if (matchedForThisJob.length > 0) {
      score += Math.min(matchedForThisJob.length * 14, 52);
    }

    // Role / Title match bonus
    const titleWords = (job.title || '').toLowerCase().split(/[\s/&-]+/);
    const hasTitleWord = titleWords.some(w => w.length > 3 && lower.includes(w));
    if (hasTitleWord) score += 18;

    // Category match
    if (job.category && lower.includes(job.category.toLowerCase().split('&')[0].trim())) {
      score += 10;
    }

    score = Math.min(score, 98);
    job._matchScore = matchedForThisJob.length > 0 || hasTitleWord ? score : (score > 35 ? 35 : 0);
    job._matchedSkills = matchedForThisJob.slice(0, 5);

    if (job._matchScore >= 40) matchCount++;
  });

  window.activeCvKeywords = candidateSkills;

  // Show Match Status Bar
  const statusBar = document.getElementById('cv-match-status-bar');
  const statusTitle = document.getElementById('cv-match-title');
  const statusSubtitle = document.getElementById('cv-match-subtitle');
  if (statusBar) {
    statusBar.style.display = 'flex';
    if (statusTitle) statusTitle.textContent = `Analisis CV Selesai (${candidateSkills.length} Keahlian Terdeteksi)`;
    if (statusSubtitle) {
      statusSubtitle.textContent = `Menemukan ${matchCount} lowongan relevan dengan profil Anda dari ${sourceName || 'dokumen'}. Diurutkan dari yang paling cocok.`;
    }
  }

  showToast('success', `CV berhasil dianalisis! Menampilkan lowongan teratas yang paling sesuai.`);
  applyFiltersAndRender();

  // Scroll to lowongan
  const lowonganSec = document.getElementById('lowongan');
  if (lowonganSec) {
    lowonganSec.scrollIntoView({ behavior: 'smooth' });
  }
}

function resetCvMatcher() {
  window.activeCvKeywords = null;
  rawAllJobs.forEach(j => {
    delete j._matchScore;
    delete j._matchedSkills;
  });

  const statusBar = document.getElementById('cv-match-status-bar');
  if (statusBar) statusBar.style.display = 'none';

  const titleEl = document.getElementById('cv-drop-title');
  const subtitleEl = document.getElementById('cv-drop-subtitle');
  if (titleEl) titleEl.textContent = 'Pilih Berkas CV Anda (PDF, DOCX, TXT)';
  if (subtitleEl) subtitleEl.textContent = 'Klik di sini untuk menjelajah dokumen atau seret & lepas berkas langsung ke area ini';

  const pasteInput = document.getElementById('cv-paste-input');
  if (pasteInput) pasteInput.value = '';

  const fileInput = document.getElementById('cv-file-input');
  if (fileInput) fileInput.value = '';

  showToast('info', 'Filter CV telah direset. Menampilkan urutan default.');
  applyFiltersAndRender();
}
