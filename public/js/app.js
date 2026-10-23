// ==============================================================
// KerjaHub - Public Job Seeker Portal JavaScript
// High Interactivity, Live Filtering & Cloud/Local Resilience
// Professional Corporate Presentation (No Emojis & Clean Icons)
// ==============================================================

let sbClient = null;
let currentSupabaseUrl = '';
let currentSupabaseKey = '';

// SAFE STORAGE HELPER (Anti Tracking Prevention block & Private Browsing safe)
const _appMemoryStore = { local: {}, session: {} };
function safeLocalGet(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return _appMemoryStore.local[key] || null;
}
function safeLocalSet(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (e) {}
  _appMemoryStore.local[key] = String(value);
}
function safeSessionGet(key) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch (e) {}
  return _appMemoryStore.session[key] || null;
}
function safeSessionSet(key, value) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
      return;
    }
  } catch (e) {}
  _appMemoryStore.session[key] = String(value);
}
function safeSessionRemove(key) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
      return;
    }
  } catch (e) {}
  delete _appMemoryStore.session[key];
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
      if (text && text.trim()) {
        data = JSON.parse(text);
      }
    } catch (parseErr) {}
    return { ok: res.ok, status: res.status, data, res };
  } catch (netErr) {
    return { ok: false, status: 0, data: null, error: netErr };
  }
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

  // 1. Detect Real Company Name if currently placeholder / social media
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

  // 2. Extract Clean Title ONLY if messy
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
      cleanTitle = 'Program Rekrutmen Perbankan ' + cleanTitle;
    }
  }

  // Clean trailing punctuation & spaces
  cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
  comp = comp.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();

  // 3. Extract Metadata: Status & Education
  let statusVal = copy.job_type || '';
  let eduVal = copy.experience_level || '';
  for (const text of searchTexts) {
    const sm = text.match(/(?:🕒|🕐|Status\s*:?)\s*([A-Za-z\s]+?)(?=\s*(?:🎓|Jenjang|Pendidikan|PT |CV |membuka|$))/i);
    if (sm && sm[1]) statusVal = sm[1].trim();

    const em = text.match(/(?:🎓|Jenjang\s*Pendidikan\s*:?|Pendidikan\s*:?)\s*([^🏢📢💼🕒🕐\n\r]+?)(?=\s*(?:PT |CV |membuka|Status|$))/i);
    if (em && em[1]) {
      eduVal = em[1].replace(/^(?:Jenjang\s*Pendidikan|Pendidikan)\s*:?\s*/i, '').trim();
    }
  }

  // 4. Clean Description Narrative
  let cleanDesc = desc;
  if (!cleanDesc || cleanDesc.includes('📢') || cleanDesc.includes('🏢') || cleanDesc.includes('💼') || cleanDesc.includes('🎓') || cleanDesc.includes('🕐')) {
    cleanDesc = comp + ' membuka kesempatan berkarir untuk posisi ' + cleanTitle + '.';
    if (eduVal) cleanDesc += ' Terbuka bagi pelamar dengan kualifikasi jenjang pendidikan ' + eduVal + '.';
    if (statusVal) cleanDesc += ' Status hubungan kerja: ' + statusVal + '.';
    cleanDesc += ' Seluruh tahapan pendaftaran dan verifikasi berkas dilakukan secara resmi tanpa dipungut biaya apapun.';
  }

  // 5. Clean Responsibilities
  let resps = Array.isArray(copy.responsibilities) ? [...copy.responsibilities] : (typeof copy.responsibilities === 'string' && copy.responsibilities.startsWith('[') ? JSON.parse(copy.responsibilities || '[]') : []);
  resps = resps.map(r => {
    let cleanR = String(r || '');
    if (/Menjalankan tugas utama posisi/i.test(cleanR)) {
      cleanR = 'Menjalankan tugas dan tanggung jawab utama posisi ' + cleanTitle + '.';
    }
    cleanR = cleanR.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleanR = cleanR.replace(/\s+/g, ' ').trim();
    return cleanR;
  }).filter(r => r.length > 5);

  if ((resps.length <= 2 || isMessyTitle) && resps.length < 4) {
    if (/administrasi|admin/i.test(cleanTitle) && !resps.some(r => r.includes('administrasi dokumen'))) {
      resps.unshift('Mengelola tata kelola administrasi dokumen, pengarsipan berkas, dan pencatatan operasional unit.');
    }
    if (/finance|keuangan|accounting|akuntansi/i.test(cleanTitle) && !resps.some(r => r.includes('keuangan'))) {
      resps.push('Mendukung proses rekonsiliasi data transaksi dan penyusunan berkas administrasi fungsi keuangan.');
    }
    if (resps.length < 2) {
      resps.push(`Menjaga profesionalisme, integritas, dan disiplin kerja di lingkungan ${comp}.`);
      resps.push('Berkoordinasi secara aktif dengan tim kerja demi kelancaran pencapaian target operasional.');
    }
  }

  // 6. Clean Requirements
  let reqs = Array.isArray(copy.requirements) ? [...copy.requirements] : (typeof copy.requirements === 'string' && copy.requirements.startsWith('[') ? JSON.parse(copy.requirements || '[]') : []);
  reqs = reqs.map(r => {
    let cleanReq = String(r || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (/pendidikan sesuai kualifikasi/i.test(cleanReq) && eduVal) {
      cleanReq = `Kualifikasi jenjang pendidikan: ${eduVal}.`;
    }
    return cleanReq;
  }).filter(r => r.length > 5);

  copy.title = cleanTitle || rawTitle;
  copy.company_name = comp;
  copy.description = cleanDesc;
  copy.responsibilities = resps;
  copy.requirements = reqs;
  copy._clean_status = statusVal;
  copy._clean_education = eduVal;

  return copy;
};

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

window.resetCategoryFilter = function() {
  activeFilters.category = 'Semua';
  const sc = document.getElementById('search-category');
  if (sc) sc.value = 'Semua';
  const catDropdown = document.getElementById('dropdown-category');
  if (catDropdown) {
    catDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    catDropdown.querySelector('.dropdown-item[data-value="Semua"]')?.classList.add('active');
    const catText = catDropdown.querySelector('.dropdown-selected-text');
    if (catText) catText.textContent = 'Semua Kategori';
  }
  const allCatRadio = document.querySelector('input[name="filter_category"][value="Semua"]');
  if (allCatRadio) allCatRadio.checked = true;
  applyFiltersAndRender();
};

window.filterByPlatform = function(plat) {
  activeFilters.platform = plat;
  const radio = document.querySelector(`input[name="filter_platform"][value="${plat}"]`);
  if (radio) radio.checked = true;
  document.querySelectorAll('.chip-plat').forEach(c => {
    c.classList.toggle('active', c.dataset.platform === plat);
  });
  applyFiltersAndRender();
  document.getElementById('lowongan')?.scrollIntoView({ behavior: 'smooth' });
};

let isLoadingPublicJobs = false;

async function initSupabaseClient() {
  const memoryStore = {};
  const clientOptions = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (k) => memoryStore[k] || null,
        setItem: (k, v) => { memoryStore[k] = String(v); },
        removeItem: (k) => { delete memoryStore[k]; }
      }
    }
  };

  // 1. Immediately initialize with client-side default Supabase credentials so it works on GitHub Pages, workdev, and static previews
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (!sbClient) {
      try {
        sbClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, clientOptions);
        currentSupabaseUrl = DEFAULT_SUPABASE_URL;
        currentSupabaseKey = DEFAULT_SUPABASE_KEY;
      } catch (e) {
        console.warn('Initial Supabase createClient error:', e);
      }
    }
  }

  // 2. Fetch runtime /api/config and settings in background without blocking initial rendering
  (async () => {
    try {
      const { ok, data } = await safeFetchJson(getApiEndpoint('/api/config'));
      if (ok && data) {
        if (data.supabaseUrl && data.supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
          if (data.supabaseUrl !== currentSupabaseUrl || data.supabaseKey !== currentSupabaseKey) {
            try {
              sbClient = window.supabase.createClient(data.supabaseUrl, data.supabaseKey, clientOptions);
              currentSupabaseUrl = data.supabaseUrl;
              currentSupabaseKey = data.supabaseKey;
            } catch (e) {
              console.warn('Supabase createClient error:', e);
            }
          }
        }
        if (data.cv_whatsapp) {
          window.siteSettings.cv_whatsapp = data.cv_whatsapp;
        }
        if (data.cv_order_message) {
          window.siteSettings.cv_order_message = data.cv_order_message;
        }
      }
    } catch (e) {
      // offline/static preview
    }

    // 3. Resilient fallback for site settings directly from Supabase if needed
    if (sbClient && window.siteSettings && (!window.siteSettings.cv_whatsapp || window.siteSettings.cv_whatsapp === '081234567890')) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
        const fetchPromise = sbClient.from('jobs').select('description').eq('status', 'system_settings').limit(1);
        const { data: stRows } = await Promise.race([fetchPromise, timeoutPromise]);
        if (stRows && stRows.length > 0 && stRows[0].description) {
          const parsed = JSON.parse(stRows[0].description);
          if (parsed.cv_whatsapp) window.siteSettings.cv_whatsapp = parsed.cv_whatsapp;
          if (parsed.cv_order_message) window.siteSettings.cv_order_message = parsed.cv_order_message;
        }
      } catch (e) {}
    }
  })();
}

// Active State
let rawAllJobs = [];
let filteredJobs = [];
let activeFilters = {
  search: '',
  category: 'Semua',
  job_type: 'Semua',
  location: 'Semua',
  experience: 'Semua',
  platform: 'Semua',
  has_salary: false,
  anti_hoax: false,
  tab: 'all',
  sort: 'newest'
};

let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await initSupabaseClient();
  loadCompanyImagesCache();
  setupEventListeners();
  setupCustomDropdowns();
  setupModalDismiss('job-detail-modal');
  setupModalDismiss('poster-lightbox');
  setupCvMatcher();
  loadMasterDataFilters();
  loadJobs();
});

const STATIC_COMPANY_IMAGES = {
  "PT Kobe Boga Utama": "https://goletskerja.com/wp-content/uploads/2024/06/logo-2024-06-15T101948.321.jpg",
  "PT Patra Drilling Contractor": "https://www.tender-indonesia.com/newsrectory/files/Logo_111.68.127.98ea5bb3cc200030c4e01ae3eaee70f1fb1234567890.png",
  "PT Bank Central Asia Tbk (BCA)": "https://static.vecteezy.com/system/resources/previews/024/701/610/large_2x/yogyakarta-indonesia-march-20-2023-bank-bca-exterior-building-bank-central-asia-tbk-is-the-largest-private-bank-in-indonesia-bca-kcp-ahmad-dahlan-free-photo.JPG",
  "Trinova Tech Solutions": "https://trinovatechsolutions.in/logo.png",
  "PT Indolakto - Indofood CBP (INDOMILK)": "./uploads/indolakto_indomilk_banner.jpg",
  "PT Indofood CBP Sukses Makmur Tbk": "https://lokermedan.net/wp-content/uploads/2022/05/PT-Indofood-CBP-Sukses-Makmur-Tbk.jpg",
  "PT TOYOTA MOTOR MANUFACTURING INDONESIA (TMMIN)": "https://images.cakeresume.com/images/e7290147-dc27-4025-81e5-1f1cfa4e5431.jpg",
  "PT Kalbe Farma Tbk": "https://cdn1-production-images-kly.akamaized.net/UiFATqcym61jnHSQIM2axtwK_oc=/1280x720/smart/filters:quality(75):strip_icc():format(webp)/kly-media-production/medias/3526828/original/027148900_1627708283-kalbe_farma_31_juli_2021Kalbe_Farma_31_juli_2021.jpg",
  "PT Mayora Indah Tbk": "https://i0.wp.com/sutomotower.com/wp-content/uploads/2022/09/gedung-kantor-pt-mayora.webp",
  "PT Kereta Api Indonesia (Persero)": "https://seeklogo.com/images/P/pt-kai-kereta-api-indonesia-2020-logo-C71614B016-seeklogo.com.png",
  "PT Bank Rakyat Indonesia (Persero) Tbk": "https://as1.ftcdn.net/v2/jpg/07/23/52/60/1000_F_723526051_FC7ZRZ9ayH8E0pRgLxBFSXV8H8xSi9PH.jpg",
  "PT Telkom Indonesia (Persero) Tbk": "https://cdn.antaranews.com/cache/1200x800/2022/03/30/logo-telkom.jpg",
  "PT Astra Honda Motor": "https://4.bp.blogspot.com/-yW5YMuFn9fY/WikUNZdotsI/AAAAAAAACtc/vSNgqAtcHiQ6hhgmf0JI7GuhZ3jLtxMGQCLcBGAs/s1600/PT_ASTRA_HONDA_MOTOR_-_panoramio.jpg",
  "Tech Innovations Lab": "https://images.glints.com/unsafe/1200x0/glints-dashboard.oss-ap-southeast-1.aliyuncs.com/company-logo/8c2bfa786d8397948713242d400800d4.jpeg",
  "Synergy Tech Global": "https://www.sinergiteknoglobal.co.id/img/gallerypage/peresmian-gedung/peresmian-gedung-001.JPG",
  "PT Yamaha Indonesia Motor Mfg": "https://global.yamaha-motor.com/about/group/asia_oceania/img/pic_004.jpg",
  "PT Krakatau Blue Water": "https://static.wikia.nocookie.net/logopedia/images/9/9f/Krakatau_Blue_Water.png",
  "PT Sumco Indonesia": "https://wlkp-assets.kemnaker.go.id/companies/95cde64d-dcfa-40f7-b85f-0ef7383e02fa/62a15a7ee1312.JPG",
  "PT Shopee International Indonesia": "https://www.shutterstock.com/shutterstock/photos/2279767699/display_1500/stock-photo-surakarta-indonesia-march-shopee-logo-on-office-building-at-surakarta-shopee-2279767699.jpg",
  "PT Indofood Sukses Makmur Tbk": "./uploads/indolakto_indomilk_banner.jpg",
  "Creative Sparks Agency": "./uploads/corporate_worker_mascot.jpg"
};

window._companyImagesCache = { ...STATIC_COMPANY_IMAGES };

async function loadCompanyImagesCache() {
  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/company-images'));
    if (ok && json && json.success && json.data) {
      window._companyImagesCache = { ...window._companyImagesCache, ...json.data };
      if (rawAllJobs && rawAllJobs.length > 0) {
        applyFiltersAndRender();
      }
    }
  } catch (e) {}
}

// Theme handling
function initTheme() {
  const savedTheme = safeLocalGet('kerjahub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  safeLocalSet('kerjahub_theme', next);
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
      if (chip.id === 'btn-search-all-cat') {
        window.resetCategoryFilter();
        return;
      }
      if (chip.classList.contains('chip-plat')) {
        const plat = chip.dataset.platform || 'Semua';
        window.filterByPlatform(plat);
        return;
      }
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

  // Sidebar Platform Radios (Medsos & Resmi)
  document.querySelectorAll('input[name="filter_platform"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeFilters.platform = e.target.value;
      document.querySelectorAll('.chip-plat').forEach(c => {
        c.classList.toggle('active', c.dataset.platform === e.target.value);
      });
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

  const antiHoaxCheckbox = document.getElementById('filter_anti_hoax');
  if (antiHoaxCheckbox) {
    antiHoaxCheckbox.addEventListener('change', (e) => {
      activeFilters.anti_hoax = e.target.checked;
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

  // Mobile Filter Drawer Toggle & Apply
  const mobileFilterToggleBtn = document.getElementById('btn-toggle-filter-mobile');
  const filterSidebar = document.getElementById('filter-sidebar');
  const mobileApplyBtn = document.getElementById('btn-apply-filter-mobile');

  if (mobileFilterToggleBtn && filterSidebar) {
    mobileFilterToggleBtn.addEventListener('click', () => {
      filterSidebar.classList.toggle('open-mobile');
      mobileFilterToggleBtn.classList.toggle('active');
    });
  }

  if (mobileApplyBtn && filterSidebar) {
    mobileApplyBtn.addEventListener('click', () => {
      filterSidebar.classList.remove('open-mobile');
      if (mobileFilterToggleBtn) mobileFilterToggleBtn.classList.remove('active');
      const lowonganSec = document.getElementById('lowongan');
      if (lowonganSec) lowonganSec.scrollIntoView({ behavior: 'smooth' });
    });
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
    const menu = dropdown.querySelector('.dropdown-menu');
    const selectedText = dropdown.querySelector('.dropdown-selected-text');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    if (trigger && !trigger._bound) {
      trigger._bound = true;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });
    }

    if (menu && !menu._bound) {
      menu._bound = true;
      menu.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        e.stopPropagation();

        const val = item.dataset.value;
        const textSpan = item.querySelector('.dropdown-item-left span') || item.querySelector('span');
        const text = textSpan ? textSpan.textContent.trim() : val;

        menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (selectedText) selectedText.textContent = text;
        if (hiddenInput) hiddenInput.value = val;

        dropdown.classList.remove('open');

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
    }
  });

  if (!window._dropdownGlobalBound) {
    window._dropdownGlobalBound = true;
    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
      }
    });
  }
}

// Render Master Data to Filter DOM Elements
function renderMasterDataToDOM(data) {
  if (!data) return;

  // 1. Category Dropdown Menu (#dropdown-category-menu)
  const catMenu = document.getElementById('dropdown-category-menu');
  if (catMenu && Array.isArray(data.categories)) {
    let catHtml = `
      <div class="dropdown-item ${activeFilters.category === 'Semua' ? 'active' : ''}" data-value="Semua">
        <div class="dropdown-item-left"><i class="fa-solid fa-layer-group"></i><span>Semua Kategori</span></div>
        <i class="fa-solid fa-check dropdown-check"></i>
      </div>
    `;
    data.categories.forEach(c => {
      catHtml += `
        <div class="dropdown-item ${activeFilters.category === c.name ? 'active' : ''}" data-value="${escapeHtml(c.name)}">
          <div class="dropdown-item-left"><i class="fa-solid ${c.icon || 'fa-tag'}"></i><span>${escapeHtml(c.name)}</span></div>
          <i class="fa-solid fa-check dropdown-check"></i>
        </div>
      `;
    });
    catMenu.innerHTML = catHtml;
  }

  // 2. Location Dropdown Menu (#dropdown-location-menu)
  const locMenu = document.getElementById('dropdown-location-menu');
  if (locMenu && Array.isArray(data.locations)) {
    let locHtml = `
      <div class="dropdown-item ${activeFilters.location === 'Semua' ? 'active' : ''}" data-value="Semua">
        <div class="dropdown-item-left"><i class="fa-solid fa-globe"></i><span>Semua Lokasi</span></div>
        <i class="fa-solid fa-check dropdown-check"></i>
      </div>
    `;
    data.locations.forEach(l => {
      locHtml += `
        <div class="dropdown-item ${activeFilters.location === l.name ? 'active' : ''}" data-value="${escapeHtml(l.name)}">
          <div class="dropdown-item-left"><i class="fa-solid ${l.icon || 'fa-location-dot'}"></i><span>${escapeHtml(l.name)}</span></div>
          <i class="fa-solid fa-check dropdown-check"></i>
        </div>
      `;
    });
    locMenu.innerHTML = locHtml;
  }

  // 3. Sidebar Categories Filter (#sidebar-filter-categories)
  const sideCat = document.getElementById('sidebar-filter-categories');
  if (sideCat && Array.isArray(data.categories)) {
    let sideCatHtml = `
      <label class="filter-checkbox">
        <input type="radio" name="filter_category" value="Semua" ${activeFilters.category === 'Semua' ? 'checked' : ''}>
        <span>Semua Kategori</span>
      </label>
    `;
    data.categories.forEach(c => {
      sideCatHtml += `
        <label class="filter-checkbox">
          <input type="radio" name="filter_category" value="${escapeHtml(c.name)}" ${activeFilters.category === c.name ? 'checked' : ''}>
          <span>${escapeHtml(c.name)}</span>
        </label>
      `;
    });
    sideCat.innerHTML = sideCatHtml;
  }

  // 4. Sidebar Job Types Filter (#sidebar-filter-job-types)
  const sideTypes = document.getElementById('sidebar-filter-job-types');
  if (sideTypes && Array.isArray(data.job_types)) {
    let sideTypesHtml = `
      <label class="filter-checkbox">
        <input type="radio" name="filter_type" value="Semua" ${activeFilters.job_type === 'Semua' ? 'checked' : ''}>
        <span>Semua Tipe</span>
      </label>
    `;
    data.job_types.forEach(t => {
      sideTypesHtml += `
        <label class="filter-checkbox">
          <input type="radio" name="filter_type" value="${escapeHtml(t.name)}" ${activeFilters.job_type === t.name ? 'checked' : ''}>
          <span>${escapeHtml(t.name)}</span>
        </label>
      `;
    });
    sideTypes.innerHTML = sideTypesHtml;
  }

  // 5. Sidebar Experience Levels Filter (#sidebar-filter-experience-levels)
  const sideExp = document.getElementById('sidebar-filter-experience-levels');
  if (sideExp && Array.isArray(data.experience_levels)) {
    let sideExpHtml = `
      <label class="filter-checkbox">
        <input type="radio" name="filter_experience" value="Semua" ${activeFilters.experience === 'Semua' ? 'checked' : ''}>
        <span>Semua Level</span>
      </label>
    `;
    data.experience_levels.forEach(e => {
      sideExpHtml += `
        <label class="filter-checkbox">
          <input type="radio" name="filter_experience" value="${escapeHtml(e.name)}" ${activeFilters.experience === e.name ? 'checked' : ''}>
          <span>${escapeHtml(e.name)}</span>
        </label>
      `;
    });
    sideExp.innerHTML = sideExpHtml;
  }

  setupCustomDropdowns();
  setupDynamicFilterListeners();
}

// Dynamically Load Master Data into Filters
async function loadMasterDataFilters() {
  // Check client-side cache for instant display
  try {
    const cached = safeSessionGet('kerja_master_data_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        renderMasterDataToDOM(parsed);
      }
    }
  } catch (e) {}

  let data = null;

  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/master-data'));
    if (ok && json && json.success && json.data) {
      data = json.data.allData || json.data;
    }
  } catch (err) {}

  // Resilient fallback to direct Supabase if API is unavailable
  if (!data && sbClient) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      const fetchPromise = sbClient.from('jobs').select('description').eq('status', 'system_master_data').limit(1);
      const { data: rows } = await Promise.race([fetchPromise, timeoutPromise]);
      if (rows && rows.length > 0 && rows[0].description) {
        const parsed = JSON.parse(rows[0].description);
        if (parsed && Array.isArray(parsed.categories)) {
          data = parsed;
        }
      }
    } catch (e) {}
  }

  if (data) {
    try {
      safeSessionSet('kerja_master_data_cache', JSON.stringify(data));
    } catch (e) {}
    renderMasterDataToDOM(data);
  }
}

function setupDynamicFilterListeners() {
  document.querySelectorAll('input[name="filter_category"]').forEach(r => {
    r.onchange = (e) => {
      activeFilters.category = e.target.value;
      syncSidebarInputs();
      applyFiltersAndRender();
    };
  });

  document.querySelectorAll('input[name="filter_type"]').forEach(r => {
    r.onchange = (e) => {
      activeFilters.job_type = e.target.value;
      applyFiltersAndRender();
    };
  });

  document.querySelectorAll('input[name="filter_experience"]').forEach(r => {
    r.onchange = (e) => {
      activeFilters.experience = e.target.value;
      applyFiltersAndRender();
    };
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

// Load Jobs: Multi-layer fetching with Stale-While-Revalidate Caching for 0ms Instant Display
async function loadJobs() {
  if (isLoadingPublicJobs) return;
  isLoadingPublicJobs = true;

  try {
    const container = document.getElementById('jobs-container');

    // 1. Instant display from sessionStorage cache if available (0ms perceived load time)
    let hadCached = false;
    try {
      const cached = safeSessionGet('kerja_public_jobs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawAllJobs = parsed.map(window.cleanJobData).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
          updateTabCounters();
          applyFiltersAndRender();
          hadCached = true;
        }
      }
    } catch (e) {}

    if (!hadCached && container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary);"></i>
          <p style="margin-top: 14px; color: var(--text-muted); font-weight: 500;">Memuat info lowongan & poster resmi...</p>
        </div>
      `;
    }

    let jobs = null;

    // 2. Fetch fresh data from Supabase Cloud Client (fetch active, expired, and closed) with 7s timeout safety
    if (sbClient) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase loadJobs timeout')), 7000));
        const fetchPromise = sbClient
          .from('jobs')
          .select('*')
          .neq('status', 'system_master_data')
          .neq('status', 'system_settings')
          .order('is_featured', { ascending: false })
          .order('id', { ascending: false });

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
        if (!error && Array.isArray(data) && data.length > 0) {
          jobs = data.map(window.cleanJobData).filter(j => j.status !== 'system_master_data' && j.status !== 'system_settings');
        } else if (error) {
          console.warn('Supabase query error in loadJobs:', error.message);
        }
      } catch (e) {
        console.warn('Supabase query exception in loadJobs:', e);
      }
    }

    // 3. Fallback to Local Express Server API
    if (!jobs) {
      try {
        const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/jobs'));
        if (ok && json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          jobs = json.data.map(window.cleanJobData);
        }
      } catch (e) {}
    }

    // 4. Default to empty array if no jobs fetched
    if (!jobs) {
      jobs = [];
    }

    if (jobs) {
      rawAllJobs = jobs.map(window.cleanJobData).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
      try {
        safeSessionSet('kerja_public_jobs_cache', JSON.stringify(rawAllJobs));
      } catch (e) {}
      updateTabCounters();
      applyFiltersAndRender();
    }

    // Deep linking check ?job=:id
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetJobId = urlParams.get('job');
      if (targetJobId) {
        setTimeout(() => {
          openJobDetail(targetJobId);
        }, 500);
      }
    } catch (e) {}
  } finally {
    isLoadingPublicJobs = false;
  }
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

  // Filter Anti-Hoax Terverifikasi
  if (activeFilters.anti_hoax) {
    list = list.filter(j => {
      const cv = String(j.contact_value || '').toLowerCase();
      const comp = String(j.company_name || '').toLowerCase();
      return cv.includes('is_verified_anti_hoax') || j.is_official || comp.includes('pt') || comp.includes('tbk') || comp.includes('persero') || comp.includes('bank') || comp.includes('astra') || comp.includes('telkom');
    });
  }

  // Filter Platform Sumber (LinkedIn, Instagram, Facebook, Resmi)
  if (activeFilters.platform && activeFilters.platform !== 'Semua') {
    const p = activeFilters.platform.toLowerCase();
    list = list.filter(j => {
      const sp = (j.source_platform || '').toLowerCase();
      const comp = (j.company_name || '').toLowerCase();
      const web = (j.website_url || j.contact_value || '').toLowerCase();
      if (p === 'linkedin') return sp === 'linkedin' || comp.includes('linkedin') || web.includes('linkedin');
      if (p === 'instagram') return sp === 'instagram' || comp.includes('instagram') || web.includes('instagram');
      if (p === 'facebook') return sp === 'facebook' || comp.includes('facebook') || web.includes('facebook');
      if (p === 'official') return sp === 'official' || (!sp.includes('linkedin') && !sp.includes('instagram') && !sp.includes('facebook') && !web.includes('linkedin') && !web.includes('instagram') && !web.includes('facebook'));
      return true;
    });
  }

  // Filter Search (Comprehensive Multi-Field & Smart Out-of-Category Matching)
  window.isSearchingOutOfCategory = false;
  if (activeFilters.search) {
    const s = activeFilters.search.toLowerCase();
    const matchFunction = (j) => {
      const parseList = (val) => Array.isArray(val) ? val.join(' ') : (typeof val === 'string' && val.startsWith('[') ? JSON.parse(val || '[]').join(' ') : String(val || ''));
      const reqsText = parseList(j.requirements);
      const respsText = parseList(j.responsibilities);
      const benefitsText = parseList(j.benefits);

      const titleMatch = j.title && j.title.toLowerCase().includes(s);
      const companyMatch = j.company_name && j.company_name.toLowerCase().includes(s);
      const descMatch = j.description && j.description.toLowerCase().includes(s);
      const catMatch = j.category && j.category.toLowerCase().includes(s);
      const locMatch = j.location && j.location.toLowerCase().includes(s);
      const reqMatch = reqsText.toLowerCase().includes(s);
      const respMatch = respsText.toLowerCase().includes(s);
      const benMatch = benefitsText.toLowerCase().includes(s);
      const salMatch = j.salary_display && j.salary_display.toLowerCase().includes(s);
      const expMatch = j.experience_level && j.experience_level.toLowerCase().includes(s);

      return titleMatch || companyMatch || descMatch || catMatch || locMatch || reqMatch || respMatch || benMatch || salMatch || expMatch;
    };

    const inCategoryList = list.filter(matchFunction);

    // If zero matches inside currently selected category, but matches exist when searching across all categories:
    if (inCategoryList.length === 0 && activeFilters.category && activeFilters.category !== 'Semua') {
      const allCategoryMatches = rawAllJobs
        .filter(j => j.status !== 'deleted' && j.status !== 'archived')
        .filter(matchFunction);

      if (allCategoryMatches.length > 0) {
        list = allCategoryMatches;
        window.isSearchingOutOfCategory = true;
      } else {
        list = [];
      }
    } else {
      list = inCategoryList;
    }
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

  if (activeFilters.platform && activeFilters.platform !== 'Semua') {
    const platLabels = {
      linkedin: 'LinkedIn Recruiter',
      instagram: 'Instagram Karir',
      facebook: 'Facebook Jobs',
      official: 'Resmi BUMN & Korporasi'
    };
    chips.push({
      label: `Sumber: ${platLabels[activeFilters.platform] || activeFilters.platform}`,
      action: () => {
        activeFilters.platform = 'Semua';
        const radio = document.querySelector('input[name="filter_platform"][value="Semua"]');
        if (radio) radio.checked = true;
        document.querySelectorAll('.chip-plat').forEach(c => c.classList.remove('active'));
      }
    });
  }

  const mftBadge = document.getElementById('mft-active-badge');

  if (chips.length > 0) {
    bar.style.display = 'flex';
    chipsContainer.innerHTML = chips.map((c, idx) => `
      <div class="filter-chip-item">
        <span>${escapeHtml(c.label)}</span>
        <button type="button" onclick="removeFilterChip(${idx})" title="Hapus filter"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join('');
    window._chipActions = chips.map(c => c.action);
    if (mftBadge) {
      mftBadge.textContent = `${chips.length} Aktif`;
      mftBadge.style.color = 'var(--primary)';
    }
  } else {
    bar.style.display = 'none';
    chipsContainer.innerHTML = '';
    window._chipActions = [];
    if (mftBadge) {
      mftBadge.textContent = 'Semua';
      mftBadge.style.color = 'var(--text-muted)';
    }
  }
}

window.removeFilterChip = function(idx) {
  if (window._chipActions && window._chipActions[idx]) {
    window._chipActions[idx]();
    applyFiltersAndRender();
  }
};

// -------------------------------------------------------------
// DYNAMIC CORPORATE COMPANY BANNER GENERATOR
// Automatically generates sleek corporate banners featuring the Company Name
// Only uploaded manual flyers take precedence from actual files!
// -------------------------------------------------------------
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
  { bg1: '#022c22', bg2: '#064e3b', bg3: '#065f46', accent: '#10b981', textAccent: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
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
        🛡️ TERVERIFIKASI KERJAHUB PORTAL
      </text>
      <text x="720" y="12" text-anchor="end" font-family="system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="12" font-weight="600" fill="#34d399">
        ✓ 100% BEBAS BIAYA SELEKSI
      </text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

window.handlePublicPosterError = function(imgEl, jobId) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const job = (rawAllJobs || []).find(j => Number(j.id) === Number(jobId)) || (window.rawAllJobs || []).find(j => Number(j.id) === Number(jobId));
  imgEl.src = generateCompanyBannerDataUrl(job || { company_name: 'KerjaHub', title: 'Lowongan Kerja' });
};

function getEffectiveJobPoster(job) {
  if (!job) return '';
  // 1. Manual flyer upload takes highest priority if present
  if (isManualJobFlyer(job)) {
    let p = String(job.poster_image).trim();
    if (p.startsWith('/uploads/')) p = '.' + p;
    return p;
  }
  // 2. Real company photo/logo (headquarters building / official logo)
  const cName = getEffectiveCompanyName(job);
  if (job.company_image && !job.company_image.includes('unsplash.com')) {
    return job.company_image;
  }
  if (window._companyImagesCache) {
    if (window._companyImagesCache[cName]) return window._companyImagesCache[cName];
    if (window._companyImagesCache[job.company_name]) return window._companyImagesCache[job.company_name];
    if (window._companyImagesCache[job.title]) return window._companyImagesCache[job.title];
  }
  // 3. Dynamic corporate SVG branded banner with Company Name
  return generateCompanyBannerDataUrl(job);
}

function openJobPosterById(jobId) {
  const job = (rawAllJobs || []).find(j => Number(j.id) === Number(jobId)) || (window.rawAllJobs || []).find(j => Number(j.id) === Number(jobId));
  if (!job) return;
  const posterSrc = getEffectiveJobPoster(job);
  openLightbox(posterSrc, job.title);
}

window.getEffectiveJobPoster = getEffectiveJobPoster;
window.generateCompanyBannerDataUrl = generateCompanyBannerDataUrl;
window.openJobPosterById = openJobPosterById;
window.isManualJobFlyer = isManualJobFlyer;

// Render Job Cards
function renderJobs(jobs) {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  if (jobs.length === 0) {
    showEmptyState();
    return;
  }

  const cardsHtml = jobs.map(job => {
    const posterSrc = getEffectiveJobPoster(job);

    const dObj = parseDateSafe(job.deadline);
    const isPassedDeadline = dObj ? (dObj.getTime() < Date.now()) : false;
    const isLocked = (job.status === 'expired' || job.status === 'closed' || isPassedDeadline);
    const initial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C';
    const timeAgo = formatTimeAgo(job.created_at);
    const urgencyBadge = calculateUrgencyBadge(job.deadline);

    // Clean official verified pill for users
    const platformPill = '<span class="pill pill-platform pill-official"><i class="fa-solid fa-circle-check"></i> Rekrutmen Resmi</span>';

    // Dynamic skill pills from category & job
    const skillTags = generateSkillPills(job);
    const safeTitle = (job.title || '').replace(/'/g, "\\'");

    return `
      <div class="job-card ${isLocked ? 'job-card-locked' : ''}" data-id="${job.id}">

        <!-- Poster Design Preview with Lightbox trigger -->
        <div class="job-poster-preview" onclick="${isLocked ? `showLockedNotice('${safeTitle}')` : `openJobPosterById(${job.id})`}">
          <img src="${posterSrc}" alt="${escapeHtml(job.title)}" loading="lazy" onerror="window.handlePublicPosterError && window.handlePublicPosterError(this, ${job.id});">
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
            ${platformPill}
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
                <button type="button" class="btn btn-outline btn-sm" onclick="openJobDetail(${job.id})" title="Lihat kualifikasi & deskripsi lengkap">
                  <i class="fa-regular fa-eye"></i> Detail
                </button>
                <button type="button" class="btn btn-primary btn-sm btn-apply-direct" onclick="directApplyJob(${job.id}, event)" title="Buka langsung tautan pendaftaran resmi ${escapeHtml(job.company_name)}">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Lamar Langsung
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const noticeHtml = window.isSearchingOutOfCategory ? `
    <div class="search-out-of-category-notice" style="grid-column: 1 / -1;">
      <span class="search-out-of-cat-text">
        <i class="fa-solid fa-arrows-to-dot" style="color: var(--primary); font-size: 1.15rem;"></i>
        Menampilkan <strong>${jobs.length} lowongan</strong> untuk kata kunci <em>"${escapeHtml(activeFilters.search)}"</em> di <strong>Semua Kategori</strong> (karena tidak ada hasil di kategori <em>${escapeHtml(activeFilters.category)}</em>).
      </span>
      <button type="button" class="btn-clear-category-chip" onclick="resetCategoryFilter()">
        <i class="fa-solid fa-layer-group"></i> Ubah ke Semua Kategori
      </button>
    </div>
  ` : '';

  container.innerHTML = noticeHtml + cardsHtml;
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

// Smart Date Parser (handles ISO YYYY-MM-DD and Indonesian Date Formats)
function parseDateSafe(str) {
  if (!str) return null;
  if (typeof str !== 'string') {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day, 23, 59, 59);
  }
  const months = {
    januari: 0, jan: 0, january: 0,
    februari: 1, feb: 1, february: 1,
    maret: 2, mar: 2, march: 2,
    april: 3, apr: 3,
    mei: 4, may: 4,
    juni: 5, jun: 5, june: 5,
    juli: 6, jul: 6, july: 6,
    agustus: 7, agu: 7, ags: 7, august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    oktober: 9, okt: 9, oct: 9, october: 9,
    november: 10, nov: 10,
    desember: 11, des: 11, dec: 11, december: 11
  };
  const m = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monStr = m[2].toLowerCase();
    const year = parseInt(m[3], 10);
    if (months[monStr] !== undefined) {
      return new Date(year, months[monStr], day, 23, 59, 59);
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Urgency badge calculation
function calculateUrgencyBadge(deadlineStr) {
  if (!deadlineStr) return '<span class="pill pill-urgency"><i class="fa-solid fa-circle-check"></i> Terbuka</span>';
  try {
    const deadline = parseDateSafe(deadlineStr);
    if (!deadline) return '<span class="pill pill-urgency"><i class="fa-solid fa-circle-check"></i> Terbuka</span>';
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return '<span class="pill pill-expired" style="background: rgba(239, 68, 68, 0.12); color: #ef4444;"><i class="fa-solid fa-ban"></i> Batas Waktu Terlewat</span>';
    } else if (diffDays <= 7) {
      return `<span class="pill pill-urgency" style="background: rgba(245, 158, 11, 0.12); color: #d97706;"><i class="fa-solid fa-hourglass-half"></i> Sisa ${diffDays} Hari</span>`;
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
  const rawJob = rawAllJobs.find(j => Number(j.id) === Number(jobId));
  if (!rawJob) return;

  const job = typeof window.cleanJobData === 'function' ? window.cleanJobData(rawJob) : rawJob;

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

  const posterSrc = getEffectiveJobPoster(job);

  const contacts = extractJobContacts(job);
  const contactBtnHtml = renderContactButton(job);

  const reqs = Array.isArray(job.requirements) ? job.requirements : (typeof job.requirements === 'string' && job.requirements.startsWith('[') ? JSON.parse(job.requirements || '[]') : []);
  const resps = Array.isArray(job.responsibilities) ? job.responsibilities : (typeof job.responsibilities === 'string' && job.responsibilities.startsWith('[') ? JSON.parse(job.responsibilities || '[]') : []);
  const bens = Array.isArray(job.benefits) ? job.benefits : (typeof job.benefits === 'string' && job.benefits.startsWith('[') ? JSON.parse(job.benefits || '[]') : []);

  // Pre-formatted intro template for job seekers
  const waTemplate = `Halo Bapak/Ibu HRD ${job.company_name},\n\nPerkenalkan saya [Nama Anda]. Saya melihat poster informasi lowongan pekerjaan untuk posisi ${job.title} yang dipublikasikan melalui KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja untuk posisi tersebut. Bersama pesan ini, saya siap melampirkan berkas CV dan Portofolio terbaru saya.\n\nMohon informasi mengenai proses seleksi selanjutnya. Terima kasih atas perhatian dan kesempatannya.`;

  const safeTitle = (job.title || '').replace(/'/g, "\\'");
  const safeCompany = (job.company_name || '').replace(/'/g, "\\'");

  content.innerHTML = `
    <!-- Banner / Poster Highlight -->
    <div class="modal-hero-banner">
      <img src="${posterSrc}" alt="${escapeHtml(job.title)}" onerror="window.handlePublicPosterError && window.handlePublicPosterError(this, ${job.id});">
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
          
          <!-- Keterangan & Deskripsi Posisi -->
          <div class="detail-section">
            <h4><i class="fa-solid fa-file-lines"></i> Keterangan & Deskripsi Posisi</h4>
            <div class="desc-meta-chips">
              <div class="desc-meta-chip">
                <i class="fa-solid fa-briefcase"></i>
                <span><strong>Status:</strong> ${escapeHtml(job._clean_status || job.job_type || 'Full time')}</span>
              </div>
              <div class="desc-meta-chip">
                <i class="fa-solid fa-graduation-cap"></i>
                <span><strong>Pendidikan:</strong> ${escapeHtml(job._clean_education || job.experience_level || 'Sesuai Kualifikasi')}</span>
              </div>
              <div class="desc-meta-chip">
                <i class="fa-solid fa-location-dot"></i>
                <span><strong>Penempatan:</strong> ${escapeHtml(job.location || 'Indonesia')}</span>
              </div>
            </div>
            <div class="desc-body-box">
              <p class="desc-body-text">${escapeHtml(job.description)}</p>
            </div>
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
              <i class="fa-solid fa-file-image"></i> ${isManualJobFlyer(job) ? 'POSTER REKRUTMEN RESMI' : 'FOTO & LOGO RESMI PERUSAHAAN'}
            </p>
            <img src="${posterSrc}" alt="Foto Lowongan" onclick="openJobPosterById(${job.id})" onerror="window.handlePublicPosterError && window.handlePublicPosterError(this, ${job.id});">
            <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="btn btn-outline btn-sm" onclick="openJobPosterById(${job.id})">
                <i class="fa-solid fa-expand"></i> Perbesar
              </button>
              <a href="${posterSrc}" target="_blank" download class="btn btn-outline btn-sm">
                <i class="fa-solid fa-download"></i> Unduh Foto
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
                <i class="fa-solid fa-envelope" style="color: #ea4335;"></i>
                <div>
                  <div class="info-label">Email Rekrutmen</div>
                  <div class="info-val" style="word-break: break-all;">
                    <a href="javascript:void(0)" onclick="triggerEmailApplication('${contacts.email}', '${safeCompany}', '${safeTitle}')" style="color: #ea4335; font-weight: 700; text-decoration: underline;" title="Klik untuk membuka langsung di Gmail Web">
                      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.72rem; margin-right: 4px;"></i>${escapeHtml(contacts.email)}
                    </a>
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

// Universal Contact & Direct Apply Extractor
function extractJobContacts(job) {
  if (!job) return { whatsapp: '', email: '', website_url: '', direct_apply_url: '', direct_type: 'none' };

  let wa = (job.whatsapp || '').trim();
  let email = (job.email || '').trim();
  let website = (job.website_url || job.official_url || job.url || job.website || '').trim();

  // Helper to parse JSON safely
  function parseJsonSafely(val) {
    if (!val) return null;
    if (typeof val === 'object') return val;
    const str = String(val).trim();
    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // 1. If website_url itself is a JSON string, unpack it
  const parsedWeb = parseJsonSafely(website);
  if (parsedWeb) {
    if (parsedWeb.url || parsedWeb.website || parsedWeb.website_url || parsedWeb.link) {
      website = (parsedWeb.url || parsedWeb.website || parsedWeb.website_url || parsedWeb.link).trim();
    }
    if (parsedWeb.whatsapp && !wa) wa = parsedWeb.whatsapp.trim();
    if (parsedWeb.email && !email) email = parsedWeb.email.trim();
  }

  // 2. Parse contact_value
  if (job.contact_value) {
    const parsedContact = parseJsonSafely(job.contact_value);
    if (parsedContact) {
      if ((parsedContact.url || parsedContact.website || parsedContact.website_url || parsedContact.link) && (!website || website.startsWith('{'))) {
        website = (parsedContact.url || parsedContact.website || parsedContact.website_url || parsedContact.link).trim();
      }
      if (parsedContact.whatsapp && !wa) wa = parsedContact.whatsapp.trim();
      if (parsedContact.email && !email) email = parsedContact.email.trim();
    } else {
      const raw = String(job.contact_value).trim();
      const type = job.contact_type || '';
      if (type === 'whatsapp' && !wa) wa = raw;
      else if (type === 'email' && !email) email = raw;
      else if ((type === 'link' || type === 'website') && (!website || website.startsWith('{'))) website = raw;
      else {
        if (raw.includes('@') && !email) email = raw;
        else if (raw.match(/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i) && (!website || website.startsWith('{'))) website = raw;
        else if (raw.match(/^[0-9+ -]{7,20}$/) && !wa) wa = raw;
      }
    }
  }

  // Clean raw JSON string remnants if any still linger in website
  if (website.startsWith('{') && website.includes('http')) {
    const m = website.match(/https?:\/\/[^"\s\\}]+/);
    if (m) website = m[0];
  }

  // If website contains an unresolvable Google News / Bing tracking link or is missing, resolve to direct genuine career portal
  const isGenericNewsUrl = !website || website.startsWith('{') || website.includes('news.google.com') || website.includes('bing.com/news');
  const comp = (job.company_name || '').toLowerCase();
  const title = (job.title || '').toLowerCase();

  if (isGenericNewsUrl) {
    if (comp.includes('patra drilling') || comp.includes('pdc') || title.includes('patra drilling')) {
      website = 'https://karir.pertamina-pdc.com';
    } else if (comp.includes('bukajobs') || (job.source_platform || '').includes('bukajobs') || (job.source_label || '').includes('bukajobs')) {
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

  // Ensure website has proper protocol
  if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
    website = `https://${website}`;
  }

  // Determine direct apply URL
  let directApplyUrl = '';
  let directType = 'none';

  if (website) {
    directApplyUrl = website;
    directType = 'website';
  } else if (wa) {
    directApplyUrl = wa;
    directType = 'whatsapp';
  } else if (email) {
    directApplyUrl = email;
    directType = 'email';
  }

  return {
    whatsapp: wa,
    email: email,
    website_url: website,
    direct_apply_url: directApplyUrl,
    direct_type: directType
  };
}

// 1-Click Direct Apply Launcher (Bypass modal for immediate application)
window.directApplyJob = function(jobId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const job = (rawAllJobs || []).find(j => String(j.id) === String(jobId));
  if (!job) {
    showToast('error', 'Data lowongan tidak ditemukan.');
    return;
  }

  const dObj = parseDateSafe(job.deadline);
  const isPassed = dObj ? (dObj.getTime() < Date.now()) : false;
  if (job.status === 'expired' || job.status === 'closed' || isPassed) {
    showLockedNotice(job.title || 'Lowongan');
    return;
  }

  const contacts = extractJobContacts(job);
  const comp = job.company_name || 'Perusahaan';
  const title = job.title || 'Posisi Lowongan';

  // Increment view count in background
  if (sbClient && job.id) {
    sbClient.from('jobs').update({ views_count: (job.views_count || 0) + 1 }).eq('id', job.id).then();
  }

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

  // Fallback to detail modal if no contact channel found
  openJobDetail(jobId);
};

// Render Multi-Channel Contact Buttons
function renderContactButton(job) {
  const dObj = parseDateSafe(job.deadline);
  const isPassed = dObj ? (dObj.getTime() < Date.now()) : false;
  if (job.status === 'expired' || job.status === 'closed' || isPassed) {
    return `
      <div class="locked-contact-card" style="padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; text-align: center; margin-bottom: 12px;">
        <i class="fa-solid fa-lock" style="font-size: 1.5rem; color: #ef4444; margin-bottom: 8px;"></i>
        <div style="font-weight: 700; color: #991b1b; font-size: 0.95rem;">Pendaftaran Lowongan Telah Ditutup</div>
        <div style="font-size: 0.8rem; color: #b91c1c; margin-top: 4px;">Batas pengumpulan berkas lamaran telah berakhir pada ${escapeHtml(job.deadline || 'periode sebelumnya')}. Silakan cek lowongan aktif lainnya.</div>
      </div>
    `;
  }

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

  // 2. Email Button (Direct into Home Email / Webmail Gmail + Quick Providers)
  if (contacts.email) {
    buttons.push(`
      <div class="contact-channel-item">
        <button type="button" class="btn-email-direct" onclick="triggerEmailApplication('${contacts.email}', '${safeCompany}', '${safeTitle}')" title="Klik untuk langsung membuka Gmail Web & mengisi draf lamaran">
          <i class="fa-solid fa-envelope" style="font-size: 1.15rem;"></i> Kirim Lamaran via Email (${escapeHtml(contacts.email)})
        </button>
        <div class="email-providers-quick-row">
          <span class="ep-label"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.68rem;"></i> Buka di:</span>
          <button type="button" class="ep-pill ep-gmail" onclick="openWebmail('gmail', '${contacts.email}', '${safeCompany}', '${safeTitle}')" title="Buka Gmail Web">
            <i class="fa-brands fa-google" style="color: #ea4335;"></i> Gmail
          </button>
          <button type="button" class="ep-pill ep-outlook" onclick="openWebmail('outlook', '${contacts.email}', '${safeCompany}', '${safeTitle}')" title="Buka Outlook / Hotmail Web">
            <i class="fa-brands fa-microsoft" style="color: #0078d4;"></i> Outlook
          </button>
          <button type="button" class="ep-pill ep-yahoo" onclick="openWebmail('yahoo', '${contacts.email}', '${safeCompany}', '${safeTitle}')" title="Buka Yahoo Mail">
            <i class="fa-brands fa-yahoo" style="color: #6001d2;"></i> Yahoo
          </button>
          <button type="button" class="ep-pill ep-client" onclick="openWebmail('mailto', '${contacts.email}', '${safeCompany}', '${safeTitle}')" title="Buka Aplikasi Email Bawaan PC/HP">
            <i class="fa-solid fa-laptop"></i> App
          </button>
          <button type="button" class="ep-pill ep-copy" onclick="copyToClipboard('${contacts.email}', 'Alamat email rekruter berhasil disalin ke clipboard')" title="Salin Alamat Email">
            <i class="fa-regular fa-copy"></i> Salin
          </button>
        </div>
      </div>
    `);
  }

  // 3. Website / Portal / Medsos Direct Link Button (Prominent & High-Trust)
  if (contacts.website_url) {
    const webUrl = contacts.website_url.startsWith('http') ? contacts.website_url : `https://${contacts.website_url}`;
    const sp = (job.source_platform || '').toLowerCase();
    const compLower = (job.company_name || '').toLowerCase();
    let btnClass = 'btn-web-direct';
    let btnIcon = 'fa-solid fa-arrow-up-right-from-square';
    let btnText = 'Lamar di Website Resmi Perusahaan';

    if (webUrl.includes('bukajobs.com') || sp === 'bukajobs') {
      btnClass = 'btn-web-direct btn-bukajobs-direct';
      btnIcon = 'fa-solid fa-arrow-up-right-from-square';
      btnText = 'Lamar Langsung di Bukajobs';
    } else if (webUrl.includes('pertamina-pdc.com') || compLower.includes('patra drilling') || compLower.includes('pdc')) {
      btnClass = 'btn-web-direct btn-pertamina-direct';
      btnIcon = 'fa-solid fa-arrow-up-right-from-square';
      btnText = 'Lamar di Portal Rekrutmen PDC';
    } else if (webUrl.includes('karir.bca.co.id') || compLower.includes('bca')) {
      btnClass = 'btn-web-direct btn-bca-direct';
      btnIcon = 'fa-solid fa-arrow-up-right-from-square';
      btnText = 'Lamar di Portal Karir BCA';
    } else if (webUrl.includes('linkedin.com') || sp === 'linkedin') {
      btnClass = 'btn-web-direct btn-linkedin-direct';
      btnIcon = 'fa-brands fa-linkedin';
      btnText = 'Buka Lowongan Resmi di LinkedIn';
    } else if (webUrl.includes('instagram.com') || sp === 'instagram') {
      btnClass = 'btn-web-direct btn-instagram-direct';
      btnIcon = 'fa-brands fa-instagram';
      btnText = 'Buka Lowongan Resmi di Instagram';
    } else if (webUrl.includes('facebook.com') || sp === 'facebook') {
      btnClass = 'btn-web-direct btn-facebook-direct';
      btnIcon = 'fa-brands fa-facebook';
      btnText = 'Buka Lowongan Resmi di Facebook';
    }

    buttons.push(`
      <div style="width: 100%;">
        <a href="${webUrl}" target="_blank" rel="noopener noreferrer" class="${btnClass}" title="${btnText} (${escapeHtml(job.company_name)})">
          <i class="${btnIcon}"></i> ${btnText}
        </a>
        <div style="margin-top: 6px; font-size: 0.74rem; color: #047857; text-align: center; display: flex; align-items: center; justify-content: center; gap: 5px;">
          <i class="fa-solid fa-shield-check"></i> Tautan Resmi & Langsung ke Portal Rekrutmen Terverifikasi
        </div>
      </div>
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

  const waUrl = `https://api.whatsapp.com/send?phone=${clean}&text=${textMsg}`;
  const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // Popup was blocked or desktop protocol, fallback
    window.location.href = `https://wa.me/${clean}?text=${textMsg}`;
  }
};

// Direct Webmail Home Launcher (Gmail, Outlook, Yahoo, Mailto)
window.openWebmail = function(provider, email, companyName, jobTitle) {
  if (!email) {
    showToast('error', 'Alamat email rekruter tidak tersedia.');
    return;
  }

  const subject = `Lamaran Pekerjaan: ${jobTitle || 'Posisi'} - [Nama Anda]`;
  const body = `Halo Tim HRD / Rekrutmen ${companyName || 'Perusahaan'},\n\nPerkenalkan saya [Nama Anda]. Saya melihat informasi poster lowongan pekerjaan untuk posisi ${jobTitle || 'Pekerjaan'} yang dipublikasikan melalui portal KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja untuk posisi tersebut. Bersama email ini saya melampirkan berkas Curriculum Vitae (CV) dan Portofolio terbaru saya untuk dijadikan bahan pertimbangan.\n\nBesar harapan saya untuk dapat mengikuti tahapan proses seleksi selanjutnya. Terima kasih atas waktu dan kesempatan yang diberikan.\n\nSalam hormat,\n[Nama Anda]\n[Nomor WhatsApp / Kontak]`;

  const encEmail = encodeURIComponent(email);
  const encSub = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);

  let targetUrl = '';
  let providerName = '';

  if (provider === 'gmail') {
    // Gmail Web Compose Deep Link (Direct into Home Email)
    targetUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encEmail}&su=${encSub}&body=${encBody}`;
    providerName = 'Gmail Web';
  } else if (provider === 'outlook') {
    // Outlook / Hotmail Web Compose Deep Link
    targetUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encEmail}&subject=${encSub}&body=${encBody}`;
    providerName = 'Outlook / Hotmail Web';
  } else if (provider === 'yahoo') {
    // Yahoo Mail Web Compose Deep Link
    targetUrl = `https://compose.mail.yahoo.com/?to=${encEmail}&subj=${encSub}&body=${encBody}`;
    providerName = 'Yahoo Mail Web';
  } else if (provider === 'mailto') {
    // Native Mailto client
    window.location.href = `mailto:${encEmail}?subject=${encSub}&body=${encBody}`;
    showToast('info', 'Membuka aplikasi email bawaan perangkat Anda...');
    return;
  }

  if (targetUrl) {
    const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = targetUrl;
    }
    showToast('success', `Membuka ${providerName} untuk lamaran ke ${email}...`);
  }
};

window.triggerEmailApplication = function(email, companyName, jobTitle) {
  // Langsung buka Gmail Web Compose ("masuk ke home email gitu gas")
  window.openWebmail('gmail', email, companyName, jobTitle);
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
        if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
        }
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

    // STRICT SCORING: Only score jobs with genuine skill or role title match
    const titleWords = (job.title || '').toLowerCase().split(/[\s/&-]+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));
    const hasTitleWord = titleWords.some(w => lower.includes(w));

    if (matchedForThisJob.length === 0 && !hasTitleWord) {
      job._matchScore = 0;
      job._matchedSkills = [];
      return;
    }

    let score = 0;
    if (matchedForThisJob.length > 0) {
      score += Math.min(matchedForThisJob.length * 18, 55);
    }
    if (hasTitleWord) {
      score += 30;
    }
    if (job.category && lower.includes(job.category.toLowerCase().split('&')[0].trim())) {
      score += 10;
    }

    score = Math.min(Math.max(score, 45), 98);
    job._matchScore = score;
    job._matchedSkills = matchedForThisJob.slice(0, 5);

    if (job._matchScore >= 45) matchCount++;
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
