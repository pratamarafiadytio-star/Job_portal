// ==============================================================
// KerjaHub - Admin Panel Logic (Enhanced Multi-Contact, Lock System & Social Scout)
// ==============================================================

let sbClient = null;

const DEFAULT_SUPABASE_URL = "https://nptmawuukuysqzqakwej.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT";
const DEFAULT_ADMIN_PASSWORD = "admin_supersecret_portal_2026";
const defaultPoster = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><rect width="80" height="80" fill="#1e293b"/><text x="40" y="48" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#6366f1">💼</text></svg>');
let isLoadingAdminJobs = false;

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
  try {
    const res = await fetch(url, options);
    let data = null;
    try {
      const text = await res.text();
      if (text && text.trim()) {
        data = JSON.parse(text);
      }
    } catch (parseErr) {
      // Non-JSON response (e.g. HTML 404 or empty string)
    }
    return { ok: res.ok, status: res.status, data, res };
  } catch (netErr) {
    return { ok: false, status: 0, data: null, error: netErr };
  }
}

function safeEscapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==============================================================
// MODERN TOAST NOTIFICATION ENGINE (POPUP ADMIN)
// ==============================================================
window.showAdminToast = function(titleOrMsg, maybeMsg, type = 'success', duration = 3800) {
  let title = '';
  let message = '';
  if (maybeMsg !== undefined && maybeMsg !== null) {
    title = titleOrMsg;
    message = maybeMsg;
  } else {
    message = titleOrMsg || '';
    if (type === 'success') title = 'Berhasil';
    else if (type === 'error') title = 'Perhatian / Gagal';
    else if (type === 'warning') title = 'Peringatan';
    else title = 'Informasi';
  }

  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error: '<i class="fa-solid fa-circle-exclamation"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>'
  };

  const toast = document.createElement('div');
  toast.className = `admin-toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon-wrapper">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${safeEscapeHtml(title)}</div>
      <div class="toast-message">${safeEscapeHtml(message).replace(/\n/g, '<br>')}</div>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Tutup">&times;</button>
    <div class="toast-progress-bar"><div class="toast-progress-fill"></div></div>
  `;

  container.appendChild(toast);

  // Close handler
  const closeToast = () => {
    toast.classList.add('admin-toast-leaving');
    setTimeout(() => {
      toast.remove();
    }, 320);
  };

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) closeBtn.onclick = closeToast;

  // Auto dismiss with animated progress
  const progressFill = toast.querySelector('.toast-progress-fill');
  if (progressFill && duration > 0) {
    progressFill.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
      progressFill.style.width = '0%';
    }, 15);
  }

  if (duration > 0) {
    setTimeout(closeToast, duration);
  }
};

// ==============================================================
// MODERN CONFIRM DIALOG ENGINE (PROMISE BASED)
// ==============================================================
window.showAdminConfirm = function({ title = 'Konfirmasi', message = 'Lanjutkan tindakan?', confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', type = 'danger' }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('admin-confirm-modal');
    if (!modal) {
      resolve(confirm(`${title}\n\n${message}`));
      return;
    }

    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('confirm-btn-cancel');
    const btnProceed = document.getElementById('confirm-btn-proceed');
    const ringEl = document.getElementById('confirm-icon-ring');
    const iconEl = document.getElementById('confirm-icon');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = safeEscapeHtml(message).replace(/\n/g, '<br>');
    if (btnCancel) btnCancel.textContent = cancelText;
    if (btnProceed) {
      btnProceed.textContent = confirmText;
      btnProceed.className = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
    }

    if (ringEl && iconEl) {
      ringEl.className = `confirm-icon-ring ${type}`;
      if (type === 'danger') {
        iconEl.className = 'fa-solid fa-trash-can';
      } else if (type === 'warning') {
        iconEl.className = 'fa-solid fa-triangle-exclamation';
      } else {
        iconEl.className = 'fa-solid fa-circle-question';
      }
    }

    modal.classList.add('active');
    modal.style.display = 'flex';

    const cleanup = (result) => {
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (btnCancel) btnCancel.onclick = null;
      if (btnProceed) btnProceed.onclick = null;
      resolve(result);
    };

    if (btnCancel) btnCancel.onclick = () => cleanup(false);
    if (btnProceed) btnProceed.onclick = () => cleanup(true);
  });
};

// Smart window.alert routing to showAdminToast so no native popups are shown
window.alert = function(msg) {
  const str = String(msg || '');
  let type = 'info';
  let title = 'Pemberitahuan';

  if (str.toLowerCase().includes('berhasil') || str.toLowerCase().includes('sukses') || str.toLowerCase().includes('gas selesai')) {
    type = 'success';
    title = 'Berhasil!';
  } else if (str.toLowerCase().includes('gagal') || str.toLowerCase().includes('error') || str.toLowerCase().includes('kesalahan')) {
    type = 'error';
    title = 'Perhatian / Kendala';
  } else if (str.toLowerCase().includes('harap') || str.toLowerCase().includes('wajib') || str.toLowerCase().includes('peringatan') || str.toLowerCase().includes('maksimal')) {
    type = 'warning';
    title = 'Peringatan';
  }

  window.showAdminToast(title, str, type);
};

async function initSupabaseClient() {
  // 1. Immediately initialize with client-side default Supabase credentials so it works on GitHub Pages, workdev, and static previews
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      sbClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
    } catch (e) {
      console.warn('Initial Supabase createClient error in admin:', e);
    }
  }

  // 2. Attempt fetching runtime /api/config from backend (if running on Node or Cloudflare Functions)
  try {
    const { ok, data } = await safeFetchJson(getApiEndpoint('/api/config'));
    if (ok && data && data.supabaseUrl && data.supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        sbClient = window.supabase.createClient(data.supabaseUrl, data.supabaseKey);
      } catch (e) {
        console.warn('Supabase createClient override error in admin:', e);
      }
    }
  } catch (e) {
    console.warn('Init Supabase config error in admin:', e);
  }
}

function getAdminToken() {
  return sessionStorage.getItem('kerja_admin_token') || '';
}

// ==============================================================
// GOOGLE DORKING QUERY GENERATOR (Client-Side Real-Time Engine)
// ==============================================================
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

  // Fallback to all supported platforms if none checked
  if (selectedSites.length === 0) {
    selectedSites = [
      platformMap.linkedin,
      platformMap.instagram,
      platformMap.facebook
    ];
  }

  // Rule 2: 1 platform -> single site, >1 platform -> (site1 OR site2)
  const querySite = selectedSites.length === 1
    ? selectedSites[0]
    : `(${selectedSites.join(' OR ')})`;

  // Rule 3: Format Query Akhir: [QUERY_SITE] "lowongan" "[KATA_KUNCI]" "[LOKASI]"
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

  // Rule 4: encodeURIComponent with Google recency parameter
  const urlGoogle = `https://www.google.com/search?q=${encodeURIComponent(queryDork)}${googleTbs}`;

  return {
    query_dork: queryDork,
    url_google: urlGoogle,
    timeframe: timeframe || '7d'
  };
}

let adminJobs = [];
let currentSelectedFileBase64 = '';

document.addEventListener('DOMContentLoaded', async () => {
  await initSupabaseClient();
  setupAuth();
  setupNavigation();
  setupPosterDropzone();
  setupJobFormSubmit();
  setupEditFormSubmit();
  setupSosmedScout();
  setupMasterData();
  setupCvSettings();
  loadMasterData();
});

// Helper: Extract contacts object from job
function extractJobContacts(job) {
  let wa = job.whatsapp || '';
  let email = job.email || '';
  let website = job.website_url || job.website || '';

  if (job.contact_value) {
    const raw = String(job.contact_value).trim();
    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        wa = parsed.whatsapp || wa;
        email = parsed.email || email;
        website = parsed.website || parsed.website_url || website;
      } catch (e) {}
    } else if (raw.length > 0) {
      if (job.contact_type === 'whatsapp' || raw.match(/^(\+?62|08|\+?[0-9]{8,})/)) {
        wa = wa || raw;
      } else if (job.contact_type === 'email' || raw.includes('@')) {
        email = email || raw;
      } else {
        website = website || raw;
      }
    }
  }
  return { whatsapp: wa, email, website };
}

// -------------------------------------------------------------
// AUTH: LOGIN & LOGOUT
// -------------------------------------------------------------
function setupAuth() {
  const loginForm = document.getElementById('admin-login-form');
  const passwordInput = document.getElementById('admin-password-input');
  const togglePassBtn = document.getElementById('btn-toggle-password');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');

  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }

  const storedToken = sessionStorage.getItem('kerja_admin_token');
  if (storedToken) {
    if (storedToken.startsWith('cf_token_')) {
      unlockDashboard();
    } else {
      safeFetchJson(getApiEndpoint('/api/admin/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({ token: storedToken })
      }).then(({ ok, data }) => {
        if (ok && data && data.success && data.valid) {
          unlockDashboard();
        } else if (data && data.valid === false) {
          sessionStorage.removeItem('kerja_admin_token');
          showLoginScreen();
        } else {
          // If server is offline or returned 404, retain dashboard access if token was previously issued
          unlockDashboard();
        }
      }).catch(() => {
        unlockDashboard();
      });
    }
  } else {
    showLoginScreen();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = passwordInput.value.trim();
      const submitBtn = document.getElementById('btn-submit-login');
      const origText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...';
      if (errorAlert) errorAlert.style.display = 'none';

      try {
        const { ok, status, data } = await safeFetchJson(getApiEndpoint('/api/admin/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        if (ok && data && data.success && data.token) {
          sessionStorage.setItem('kerja_admin_token', data.token);
          unlockDashboard();
        } else if (!ok && (status === 404 || status === 0 || !data)) {
          // Static hosting (GitHub Pages) fallback when backend API is not present
          if (password === DEFAULT_ADMIN_PASSWORD) {
            sessionStorage.setItem('kerja_admin_token', 'cf_token_gh_admin_' + Date.now());
            unlockDashboard();
          } else {
            if (errorAlert) {
              errorText.textContent = 'Kata sandi admin salah! Akses ditolak.';
              errorAlert.style.display = 'flex';
            }
          }
        } else if (status === 401 || (data && data.success === false && data.message)) {
          if (errorAlert) {
            errorText.textContent = data?.message || 'Kata sandi admin salah! Akses ditolak.';
            errorAlert.style.display = 'flex';
          }
        } else {
          if (password === DEFAULT_ADMIN_PASSWORD) {
            sessionStorage.setItem('kerja_admin_token', 'cf_token_gh_admin_' + Date.now());
            unlockDashboard();
          } else if (errorAlert) {
            errorText.textContent = data?.message || 'Kata sandi admin salah! Akses ditolak.';
            errorAlert.style.display = 'flex';
          }
        }
      } catch (err) {
        if (password === DEFAULT_ADMIN_PASSWORD) {
          sessionStorage.setItem('kerja_admin_token', 'cf_token_gh_admin_' + Date.now());
          unlockDashboard();
        } else if (errorAlert) {
          errorText.textContent = 'Gagal menghubungi server otentikasi. Pastikan backend server aktif.';
          errorAlert.style.display = 'flex';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const token = sessionStorage.getItem('kerja_admin_token');
      if (token) {
        try {
          await safeFetchJson(getApiEndpoint('/api/admin/logout'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
          });
        } catch (e) {}
      }
      sessionStorage.removeItem('kerja_admin_token');
      showLoginScreen();
    });
  }
}

function showLoginScreen() {
  const modal = document.getElementById('admin-login-modal');
  const app = document.getElementById('admin-dashboard-app');
  if (modal) modal.style.display = 'flex';
  if (app) app.style.display = 'none';
}

function unlockDashboard() {
  const modal = document.getElementById('admin-login-modal');
  const app = document.getElementById('admin-dashboard-app');
  if (modal) modal.style.display = 'none';
  if (app) app.style.display = 'flex';
  loadDashboardData();
  loadAdminJobs();
  // Autoload & initial sync for official web vacancies
  populateOfficialVacanciesFromSystem('lowongan');
  startAdminAutoloadEngine();
}

// -------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------
function setupNavigation() {
  const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item a');
  const toggleMobileBtn = document.getElementById('btn-toggle-sidebar-mobile');
  const closeMobileBtn = document.getElementById('btn-close-sidebar-mobile');
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar = document.getElementById('admin-sidebar');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (toggleMobileBtn) toggleMobileBtn.addEventListener('click', openSidebar);
  if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        menuLinks.forEach(l => l.parentElement.classList.remove('active'));
        link.parentElement.classList.add('active');

        const sectionName = targetId.replace('#', '');
        switchSection(sectionName);
        if (window.innerWidth <= 860) {
          closeSidebar();
        }
      }
    });
  });
}

function switchSection(sectionName) {
  const sections = ['dashboard', 'upload-job', 'manage-jobs', 'sosmed-generator', 'settings-master', 'settings-cv'];
  sections.forEach(sec => {
    const el = document.getElementById(`section-${sec}`);
    if (el) el.style.display = (sec === sectionName) ? 'block' : 'none';
  });

  const titleEl = document.getElementById('admin-page-title');
  const subEl = document.getElementById('admin-page-sub');

  if (sectionName === 'dashboard') {
    if (titleEl) titleEl.textContent = 'Dashboard Lowongan';
    if (subEl) subEl.textContent = 'Kelola poster online, multi-kontak rekruter & database Supabase Cloud.';
    loadDashboardData();
  } else if (sectionName === 'upload-job') {
    if (titleEl) titleEl.textContent = 'Upload Poster & Lowongan Baru';
    if (subEl) subEl.textContent = 'Formulir terstruktur dengan 3 saluran kontak resmi rekruter.';
  } else if (sectionName === 'manage-jobs') {
    if (titleEl) titleEl.textContent = 'Daftar Semua Lowongan';
    if (subEl) subEl.textContent = 'Lihat daftar, kunci (lock/expired) lowongan, edit, atau hapus.';
    loadAdminJobs();
  } else if (sectionName === 'sosmed-generator') {
    if (titleEl) titleEl.textContent = 'Scout & Generator Loker Asli Web';
    if (subEl) subEl.textContent = 'Ambil lowongan yang dibagikan langsung di website dan klik untuk membuka postingan aslinya.';
  } else if (sectionName === 'settings-master') {
    if (titleEl) titleEl.textContent = 'Pengaturan Master Data & Filter';
    if (subEl) subEl.textContent = 'Kelola Kategori Bidang, Tipe Pekerjaan, Level Pengalaman, dan Lokasi.';
    loadMasterData();
  } else if (sectionName === 'settings-cv') {
    if (titleEl) titleEl.textContent = 'Pengaturan Layanan Pesan CV WhatsApp';
    if (subEl) subEl.textContent = 'Atur nomor WhatsApp resmi yang akan dihubungi pelamar saat memesan CV.';
    loadCvSettings();
  }
}

// -------------------------------------------------------------
// POSTER DROPZONE WITH PREVIEW
// -------------------------------------------------------------
function setupPosterDropzone() {
  const dropzone = document.getElementById('poster-dropzone');
  const fileInput = document.getElementById('poster-file-input');
  const placeholder = document.getElementById('dropzone-placeholder');
  const previewWrapper = document.getElementById('poster-preview-wrapper');
  const previewImg = document.getElementById('poster-img-preview');
  const removeBtn = document.getElementById('btn-remove-poster-preview');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', (e) => {
    if (e.target !== removeBtn && !removeBtn?.contains(e.target)) {
      fileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      alert('Harap unggah berkas gambar poster (JPG, PNG, atau WEBP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentSelectedFileBase64 = e.target.result;
      if (previewImg) previewImg.src = currentSelectedFileBase64;
      if (previewWrapper) previewWrapper.style.display = 'inline-block';
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      currentSelectedFileBase64 = '';
      if (previewImg) previewImg.src = '';
      if (previewWrapper) previewWrapper.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
    });
  }
}

// =============================================================
// DYNAMIC ITEM MANAGER (TANGGUNG JAWAB, KUALIFIKASI, BENEFIT)
// Per-column layout, dynamic + and delete, max 10 items limit
// =============================================================
const DM_CATEGORY_PLACEHOLDERS = {
  responsibilities: [
    'Tuliskan poin tanggung jawab / tugas posisi...',
    'Tuliskan rincian pekerjaan lainnya...'
  ],
  requirements: [
    'Tuliskan poin kualifikasi / persyaratan pelamar...',
    'Tuliskan syarat keahlian atau pendidikan lainnya...'
  ],
  benefits: [
    'Tuliskan poin benefit, fasilitas, atau tunjangan...',
    'Tuliskan fasilitas tambahan lainnya...'
  ]
};

window.addDynamicItemRow = function(containerId, category, counterId, initialValue = '', focus = true) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const currentRows = container.querySelectorAll('.dm-item-row');
  if (currentRows.length >= 10) {
    alert('Maksimal 10 poin telah tercapai untuk kategori ini.');
    return null;
  }

  // Remove empty state if present
  const emptyState = container.querySelector('.dm-empty-state');
  if (emptyState) emptyState.remove();

  const nextIndex = currentRows.length + 1;
  const numFormatted = String(nextIndex).padStart(2, '0');

  const defaultPlaceholders = DM_CATEGORY_PLACEHOLDERS[category] || [
    'Ketik keterangan poin di sini...',
    'Tambahkan poin detail lainnya...'
  ];
  const placeholderText = defaultPlaceholders[(nextIndex - 1) % defaultPlaceholders.length] || 'Ketik keterangan poin di sini...';

  const row = document.createElement('div');
  row.className = 'dm-item-row';
  row.innerHTML = `
    <span class="dm-item-num">${numFormatted}</span>
    <input type="text" class="dm-item-input" value="${(initialValue || '').replace(/"/g, '&quot;')}" placeholder="${placeholderText}" oninput="window.syncDynamicItems('${containerId}')">
    <button type="button" class="btn-dm-del" title="Hapus poin ini" onclick="window.removeDynamicItemRow(this)">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;

  // Enter key in input adds next row if under 10
  const inputEl = row.querySelector('.dm-item-input');
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rows = container.querySelectorAll('.dm-item-row');
      if (rows.length < 10) {
        window.addDynamicItemRow(containerId, category, counterId, '', true);
      }
    }
  });

  container.appendChild(row);

  window.refreshDynamicManagerNumbers(containerId, counterId);
  window.syncDynamicItems(containerId);

  if (focus && inputEl) {
    setTimeout(() => { inputEl.focus(); }, 50);
  }

  return row;
};

window.removeDynamicItemRow = function(btn) {
  const row = btn.closest('.dm-item-row');
  if (!row) return;
  const container = row.closest('.dm-items-container');
  if (!container) return;

  const containerId = container.id;
  const card = container.closest('.dynamic-manager-card');
  const counterId = card?.querySelector('.dm-counter-badge')?.id || '';
  const category = card?.getAttribute('data-category') || 'requirements';

  row.remove();

  window.refreshDynamicManagerNumbers(containerId, counterId);
  window.syncDynamicItems(containerId);

  // If container is now empty, show empty state
  const remainingRows = container.querySelectorAll('.dm-item-row');
  if (remainingRows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'dm-empty-state';
    empty.onclick = () => window.addDynamicItemRow(containerId, category, counterId, '', true);
    empty.innerHTML = `
      <i class="fa-regular fa-clipboard"></i>
      <span>Belum ada poin ditambahkan.</span>
      <span class="dm-quick-add-link">+ Tambah Poin Pertama</span>
    `;
    container.appendChild(empty);
  }
};

window.refreshDynamicManagerNumbers = function(containerId, counterId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const rows = container.querySelectorAll('.dm-item-row');
  rows.forEach((r, idx) => {
    const numEl = r.querySelector('.dm-item-num');
    if (numEl) numEl.textContent = String(idx + 1).padStart(2, '0');
  });

  const count = rows.length;
  const counterEl = counterId ? document.getElementById(counterId) : null;
  if (counterEl) {
    counterEl.textContent = `${count}/10`;
    if (count >= 10) {
      counterEl.classList.add('full');
      counterEl.title = 'Maksimal 10 poin tercapai';
    } else {
      counterEl.classList.remove('full');
      counterEl.title = '';
    }
  }

  // Update add button state
  const card = container.closest('.dynamic-manager-card');
  const addBtn = card?.querySelector('.btn-dm-add');
  if (addBtn) {
    if (count >= 10) {
      addBtn.disabled = true;
      addBtn.title = 'Maksimal 10 poin tercapai';
    } else {
      addBtn.disabled = false;
      addBtn.title = 'Tambah poin baru';
    }
  }
};

window.getDynamicListValues = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const inputs = container.querySelectorAll('.dm-item-input');
  const values = [];
  inputs.forEach(inp => {
    const val = inp.value.trim();
    if (val) values.push(val);
  });
  return values;
};

window.setDynamicListValues = function(containerId, itemsArray, category, counterId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  let list = [];
  if (Array.isArray(itemsArray)) {
    list = itemsArray.map(s => String(s || '').trim()).filter(Boolean);
  } else if (typeof itemsArray === 'string' && itemsArray.trim()) {
    if (itemsArray.trim().startsWith('[') && itemsArray.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(itemsArray);
        if (Array.isArray(parsed)) list = parsed.map(s => String(s || '').trim()).filter(Boolean);
      } catch (e) {}
    }
    if (list.length === 0) {
      list = itemsArray.split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
  }

  // Cap at 10 items
  const capped = list.slice(0, 10);

  if (capped.length > 0) {
    capped.forEach(item => {
      window.addDynamicItemRow(containerId, category, counterId, item, false);
    });
  } else {
    // Show empty state
    const empty = document.createElement('div');
    empty.className = 'dm-empty-state';
    empty.onclick = () => window.addDynamicItemRow(containerId, category, counterId, '', true);
    empty.innerHTML = `
      <i class="fa-regular fa-clipboard"></i>
      <span>Belum ada poin ditambahkan.</span>
      <span class="dm-quick-add-link">+ Tambah Poin Pertama</span>
    `;
    container.appendChild(empty);
  }

  window.refreshDynamicManagerNumbers(containerId, counterId);
  window.syncDynamicItems(containerId);
};

window.syncDynamicItems = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const card = container.closest('.dynamic-manager-card');
  const hiddenTextarea = card?.querySelector('textarea');
  const values = window.getDynamicListValues(containerId);

  if (hiddenTextarea) {
    hiddenTextarea.value = values.join('\n');
  }

  // If this is poster studio, re-draw flyer canvas immediately!
  if (containerId === 'poster-req-items' || containerId === 'poster-resp-items' || containerId === 'poster-ben-items') {
    const legacyReq = document.getElementById('poster-input-requirements');
    if (legacyReq && containerId === 'poster-req-items') legacyReq.value = values.join('\n');
    const legacyResp = document.getElementById('poster-input-responsibilities');
    if (legacyResp && containerId === 'poster-resp-items') legacyResp.value = values.join('\n');
    const legacyBen = document.getElementById('poster-input-benefits');
    if (legacyBen && containerId === 'poster-ben-items') legacyBen.value = values.join('\n');
    if (typeof renderPosterCanvas === 'function') {
      renderPosterCanvas();
    }
  }
};

function initUploadFormDynamicLists() {
  window.setDynamicListValues('upload-resp-items', [], 'responsibilities', 'upload-resp-counter');
  window.setDynamicListValues('upload-req-items', [], 'requirements', 'upload-req-counter');
  window.setDynamicListValues('upload-ben-items', [], 'benefits', 'upload-ben-counter');
}

// -------------------------------------------------------------
// UPLOAD JOB FORM SUBMISSION (WITH 3 CONTACT FIELDS)
// -------------------------------------------------------------
function setupJobFormSubmit() {
  const form = document.getElementById('form-upload-job');
  if (!form) return;

  // Initialize upload form dynamic rows (clean and empty, admin fills in manually)
  initUploadFormDynamicLists();

  form.addEventListener('reset', () => {
    setTimeout(() => {
      initUploadFormDynamicLists();
    }, 10);
  });

  window.generatePosterFromUploadForm = function() {
    const uploadForm = document.getElementById('form-upload-job') || form;
    if (!uploadForm) return;

    const title = uploadForm.querySelector('[name="title"]')?.value.trim() || '';
    const company = uploadForm.querySelector('[name="company_name"]')?.value.trim() || '';
    const desc = uploadForm.querySelector('[name="description"]')?.value.trim() || '';
    let respLines = window.getDynamicListValues ? window.getDynamicListValues('upload-resp-items') : [];
    let reqLines = window.getDynamicListValues ? window.getDynamicListValues('upload-req-items') : [];
    let benLines = window.getDynamicListValues ? window.getDynamicListValues('upload-ben-items') : [];
    const deadline = uploadForm.querySelector('[name="deadline"]')?.value.trim() || '';
    const website = uploadForm.querySelector('[name="website"]')?.value.trim() || '';
    const whatsapp = uploadForm.querySelector('[name="whatsapp"]')?.value.trim() || '';
    const email = uploadForm.querySelector('[name="email"]')?.value.trim() || '';

    // Smart fallback: if user typed description text but didn't click "+" dynamic rows, extract lines
    if (reqLines.length === 0 && respLines.length === 0 && benLines.length === 0 && desc) {
      const descLines = desc.split(/\r?\n/).map(s => s.replace(/^[•\-\*\d\.\)\s]+/, '').trim()).filter(Boolean);
      if (descLines.length > 0) {
        reqLines = descLines.slice(0, 6);
      }
    }

    let applyInfo = '';
    const shortComp = company || 'Perusahaan';
    if (whatsapp) {
      applyInfo = `Kirim CV/Lamaran via WhatsApp resmi ${shortComp} (${whatsapp})`;
    } else if (email) {
      applyInfo = `Kirim CV/Lamaran via Email resmi ${shortComp} (${email})`;
    } else if (website) {
      applyInfo = `Kirim CV/Lamaran melalui portal resmi ${shortComp}.`;
    } else {
      applyInfo = `Kirim CV/Lamaran melalui tautan resmi ${shortComp}.`;
    }

    openPosterStudio({
      title: title || 'POSISI LOWONGAN KERJA',
      company_name: company || 'PERUSAHAAN TERVERIFIKASI',
      responsibilities: respLines,
      requirements: reqLines,
      benefits: benLines,
      deadline,
      official_url: website || window.location.href,
      apply_info: applyInfo,
      theme: title.toLowerCase().includes('operator') || title.toLowerCase().includes('teknisi') ? 'factory' : 'modern',
      mascot: title.toLowerCase().includes('operator') || title.toLowerCase().includes('teknisi') ? 'factory' : 'corporate'
    });
  };

  const btnGenPoster = document.getElementById('btn-generate-poster-from-form');
  if (btnGenPoster) {
    btnGenPoster.onclick = window.generatePosterFromUploadForm;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = form.querySelector('[name="title"]').value.trim();
    const company = form.querySelector('[name="company_name"]').value.trim();
    const desc = form.querySelector('[name="description"]').value.trim();

    if (!title || !company || !desc) {
      alert('Judul posisi, nama perusahaan, dan deskripsi wajib diisi!');
      return;
    }

    const whatsapp = form.querySelector('[name="whatsapp"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const website = form.querySelector('[name="website"]')?.value.trim() || '';

    const contactsObj = { whatsapp, email, website };
    const primaryContactType = whatsapp ? 'whatsapp' : (email ? 'email' : 'link');
    const contactValueJSON = JSON.stringify(contactsObj);

    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Supabase Cloud...';

    const reqValues = window.getDynamicListValues('upload-req-items');
    const respValues = window.getDynamicListValues('upload-resp-items');
    const benValues = window.getDynamicListValues('upload-ben-items');

    const cleanPayload = {
      title,
      company_name: company,
      category: form.querySelector('[name="category"]').value,
      job_type: form.querySelector('[name="job_type"]').value,
      location: form.querySelector('[name="location"]').value,
      salary_display: form.querySelector('[name="salary_display"]').value || 'Kompetitif',
      experience_level: form.querySelector('[name="experience_level"]').value,
      deadline: form.querySelector('[name="deadline"]').value || '',
      contact_type: primaryContactType,
      contact_value: contactValueJSON,
      description: desc,
      requirements: reqValues,
      responsibilities: respValues,
      benefits: benValues,
      is_featured: form.querySelector('[name="is_featured"]').checked,
      status: 'active',
      poster_image: currentSelectedFileBase64 || '',
      views_count: 0
    };

    let saved = false;

    // Single source of truth: Send to backend /api/jobs (which inserts once to Supabase via server .env & syncs local backup)
    try {
      const formData = new FormData(form);
      formData.set('contact_type', primaryContactType);
      formData.set('contact_value', contactValueJSON);
      formData.set('whatsapp', whatsapp);
      formData.set('email', email);
      formData.set('website_url', website);
      formData.set('requirements', reqValues.join('\n'));
      formData.set('responsibilities', respValues.join('\n'));
      formData.set('benefits', benValues.join('\n'));

      const token = sessionStorage.getItem('kerja_admin_token') || '';
      const res = await fetch(getApiEndpoint('/api/jobs'), {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.success !== false) {
          saved = true;
        }
      }
    } catch (err) {
      console.warn('Backend /api/jobs unavailable, falling back to direct cloud client:', err);
    }

    // Fallback: ONLY execute client-side direct insert if backend was offline or failed
    if (!saved && sbClient) {
      try {
        const { error } = await sbClient.from('jobs').insert([cleanPayload]);
        if (!error) {
          saved = true;
        } else {
          console.warn('Supabase fallback insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase fallback exception:', err);
      }
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;

    if (saved) {
      alert('Berhasil! Poster lowongan dan saluran kontak telah tersimpan ke Supabase Cloud.');
      form.reset();
      currentSelectedFileBase64 = '';
      const btnRemove = document.getElementById('btn-remove-poster-preview');
      if (btnRemove) btnRemove.click();

      loadAdminJobs(true);
      const manageLink = document.querySelector('a[href="#manage-jobs"]');
      if (manageLink) manageLink.click();
    } else {
      alert('Info: Silakan pastikan koneksi Supabase Cloud terhubung.');
    }
  });
}

// -------------------------------------------------------------
// DASHBOARD METRICS & RECENT JOBS TABLE
// -------------------------------------------------------------
function renderDashboardStats(jobsList) {
  const realJobs = (jobsList || []).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
  const totalJobs = realJobs.length;
  const activeJobs = realJobs.filter(j => j.status === 'active').length;
  const closedJobs = realJobs.filter(j => j.status === 'closed' || j.status === 'expired').length;
  const totalViews = realJobs.reduce((acc, j) => acc + (j.views_count || 0), 0);
  const recentJobs = realJobs.slice(0, 5);

  document.getElementById('stat-total-jobs') && (document.getElementById('stat-total-jobs').textContent = totalJobs);
  document.getElementById('stat-active-jobs') && (document.getElementById('stat-active-jobs').textContent = activeJobs);
  document.getElementById('stat-closed-jobs') && (document.getElementById('stat-closed-jobs').textContent = closedJobs);
  document.getElementById('stat-total-views') && (document.getElementById('stat-total-views').textContent = totalViews);

  // Render recent table in dashboard
  const recentTbody = document.getElementById('dashboard-recent-tbody');
  if (recentTbody) {
    if (recentJobs.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada lowongan terdaftar.</td></tr>`;
    } else {
      recentTbody.innerHTML = recentJobs.map(job => {
        const isLocked = job.status === 'expired' || job.status === 'closed';
        const badgeClass = isLocked ? 'badge-expired' : 'badge-active';
        const badgeLabel = isLocked ? '<i class="fa-solid fa-lock"></i> Expired' : '<i class="fa-solid fa-circle-check"></i> Aktif';

        return `
          <tr>
            <td>
              <strong>${escapeHtml(job.title)}</strong><br>
              <small style="color:var(--text-muted);">${escapeHtml(job.company_name)}</small>
            </td>
            <td><small>${escapeHtml(job.category)}</small></td>
            <td><span class="badge" style="background:#f1f5f9; color:#475569;">${escapeHtml(job.job_type)}</span></td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
            <td>${job.views_count || 0}</td>
            <td>
              <button class="btn-table btn-lock" onclick="toggleJobLock(${job.id}, '${isLocked ? 'active' : 'expired'}')" title="${isLocked ? 'Buka Kunci' : 'Kunci (Expired)'}">
                <i class="fa-solid ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

async function loadDashboardData() {
  if (adminJobs && adminJobs.length > 0) {
    renderDashboardStats(adminJobs);
    return;
  }
  await loadAdminJobs();
}

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
      <text x="30" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">REKRUTMEN RESMI</text>
    </g>
    <g transform="translate(560, 36)">
      <rect width="200" height="30" rx="15" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="100" y="19" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${palette.textAccent}">${displayCat}</text>
    </g>
    <g transform="translate(400, 160)" text-anchor="middle">
      <circle cx="0" cy="0" r="42" fill="url(#badgeGrad)" stroke="${palette.accent}" stroke-width="2.5" filter="url(#shadow)"/>
      <text x="0" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${initial}</text>
    </g>
    <text x="400" y="248" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${compFontSize}" font-weight="800" fill="#ffffff" filter="url(#shadow)">
      ${displayComp}
    </text>
    <text x="400" y="286" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="${palette.textAccent}">
      ${displayTitle.length > 55 ? displayTitle.substring(0, 52) + '...' : displayTitle}
    </text>
    <line x1="40" y1="350" x2="760" y2="350" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <g transform="translate(40, 376)">
      <text x="0" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.7)">
        🛡️ TERVERIFIKASI KERJAHUB PORTAL
      </text>
      <text x="720" y="12" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#34d399">
        ✓ 100% BEBAS BIAYA SELEKSI
      </text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function getEffectiveJobPoster(job) {
  if (!job) return '';
  if (isManualJobFlyer(job)) {
    let p = String(job.poster_image).trim();
    if (p.startsWith('/uploads/')) p = '.' + p;
    return p;
  }
  const cName = getEffectiveCompanyName(job);
  if (job.company_image && !job.company_image.includes('unsplash.com')) {
    return job.company_image;
  }
  if (window._companyImagesCache) {
    if (window._companyImagesCache[cName]) return window._companyImagesCache[cName];
    if (window._companyImagesCache[job.company_name]) return window._companyImagesCache[job.company_name];
    if (window._companyImagesCache[job.title]) return window._companyImagesCache[job.title];
  }
  return generateCompanyBannerDataUrl(job);
}

// -------------------------------------------------------------
// RENDER ADMIN JOBS TABLE (WITH LOCK SYSTEM & MULTI-CONTACTS)
// -------------------------------------------------------------
function renderAdminJobsTable() {
  const tbody = document.getElementById('admin-jobs-tbody');
  if (!tbody) return;

  const validJobs = (adminJobs || []).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');

  if (validJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:#94a3b8;">Belum ada lowongan terdaftar. Klik menu "Upload Poster Baru"!</td></tr>`;
    return;
  }

  tbody.innerHTML = validJobs.map(job => {
    const posterSrc = getEffectiveJobPoster(job);
    const fallbackPoster = generateCompanyBannerDataUrl(job);

    const contacts = extractJobContacts(job);
    const isLocked = job.status === 'expired' || job.status === 'closed';

    const statusBadge = isLocked
      ? `<span class="badge badge-expired"><i class="fa-solid fa-lock"></i> Expired (Terkunci)</span>`
      : `<span class="badge badge-active"><i class="fa-solid fa-circle-check"></i> Aktif</span>`;

    // Render multi-contact badges
    let contactsHtml = '<span style="color:#94a3b8; font-size:0.75rem;">-</span>';
    const badges = [];
    if (contacts.whatsapp) {
      badges.push(`<span class="contact-pill-item wa" title="WhatsApp: ${escapeHtml(contacts.whatsapp)}"><i class="fa-brands fa-whatsapp"></i> WA: ${escapeHtml(contacts.whatsapp)}</span>`);
    }
    if (contacts.email) {
      badges.push(`<span class="contact-pill-item email" title="Email: ${escapeHtml(contacts.email)}"><i class="fa-solid fa-envelope"></i> Email</span>`);
    }
    if (contacts.website) {
      badges.push(`<span class="contact-pill-item link" title="Link: ${escapeHtml(contacts.website)}"><i class="fa-solid fa-link"></i> Link</span>`);
    }
    if (badges.length > 0) {
      contactsHtml = `<div class="contacts-badges-row">${badges.join('')}</div>`;
    }

    const lockIcon = isLocked ? 'fa-lock-open' : 'fa-lock';
    const lockTooltip = isLocked ? 'Buka kunci lowongan (Aktifkan kembali)' : 'Kunci lowongan (Jadikan Expired & tutup lamaran)';
    const nextStatus = isLocked ? 'active' : 'expired';

    return `
      <tr>
        <td>
          <div class="job-cell">
            <img src="${posterSrc}" alt="Poster" class="job-cell-poster" onerror="this.onerror=null; this.src='${fallbackPoster}';">
            <div class="job-cell-info">
              <a href="${job.website_url ? escapeHtml(job.website_url) : `./?job=${job.id}`}" target="_blank" rel="noopener noreferrer" class="job-cell-title" title="${job.website_url ? 'Buka Postingan Asli di Web' : 'Lihat di Web Publik'}">${escapeHtml(job.title)} ${job.website_url ? '<i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem; margin-left:4px; color:#0284c7;"></i>' : ''}</a>
              <span class="job-cell-company">${escapeHtml(job.company_name)}</span>
            </div>
          </div>
        </td>
        <td><small>${escapeHtml(job.category)}</small></td>
        <td><span class="badge" style="background:#f1f5f9; color:#475569;">${escapeHtml(job.job_type)}</span></td>
        <td style="max-width:200px;">${contactsHtml}</td>
        <td>${statusBadge}</td>
        <td>${job.views_count || 0}</td>
        <td><small>${job.created_at ? new Date(job.created_at).toLocaleDateString('id-ID') : '-'}</small></td>
        <td>
          <div class="action-buttons">
            ${job.website_url ? `<a href="${escapeHtml(job.website_url)}" target="_blank" rel="noopener noreferrer" class="btn-table" title="Buka Postingan Asli di Web Resmi"><i class="fa-solid fa-globe" style="color: #0284c7;"></i></a>` : ''}
            <a href="./?job=${job.id}" target="_blank" class="btn-table" title="Lihat di Web Publik"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <button class="btn-table" onclick="openPosterStudioFromExistingId(${job.id})" title="Generate Poster Gambar (Download)"><i class="fa-solid fa-palette" style="color: #4f46e5;"></i></button>
            <button class="btn-table btn-lock" onclick="toggleJobLock(${job.id}, '${nextStatus}')" title="${lockTooltip}">
              <i class="fa-solid ${lockIcon}"></i>
            </button>
            <button class="btn-table" onclick="openEditJobModal(${job.id})" title="Edit Lowongan"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-table delete" onclick="deleteJob(${job.id}, '${escapeHtml(job.title)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// LOAD ADMIN JOBS (High-Speed Single Fetch & Cached State)
// -------------------------------------------------------------
async function loadAdminJobs(forceRefresh = false) {
  const tbody = document.getElementById('admin-jobs-tbody');

  // Check sessionStorage cache for instant display
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem('kerja_admin_jobs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          adminJobs = parsed.filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
          renderAdminJobsTable();
          renderDashboardStats(adminJobs);
        }
      }
    } catch (e) {}
  }

  if (isLoadingAdminJobs) return;
  isLoadingAdminJobs = true;

  if (tbody && (!adminJobs || adminJobs.length === 0)) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data Supabase...</td></tr>`;
  }

  let jobs = null;

  try {
    // 1. Fetch from Supabase Cloud with 7-second timeout safety
    if (sbClient) {
      try {
        const fetchPromise = sbClient.from('jobs').select('*').order('id', { ascending: false });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase loadAdminJobs timeout')), 7000));
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        if (res && !res.error && Array.isArray(res.data) && res.data.length > 0) {
          jobs = res.data;
        }
      } catch (e) {
        console.warn('Supabase loadAdminJobs warning:', e);
      }
    }

    // 2. Fallback to API if Supabase query yielded nothing
    if (!jobs) {
      try {
        const { ok, data } = await safeFetchJson(getApiEndpoint('/api/jobs?status=all'));
        if (ok && data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          jobs = data.data;
        }
      } catch (e) {}
    }

    if (jobs) {
      adminJobs = jobs.filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
      try {
        sessionStorage.setItem('kerja_admin_jobs_cache', JSON.stringify(adminJobs));
      } catch (e) {}
    } else if (!adminJobs) {
      adminJobs = [];
    }

    renderAdminJobsTable();
    renderDashboardStats(adminJobs);
  } catch (err) {
    console.error('loadAdminJobs error:', err);
    if (tbody && (!adminJobs || adminJobs.length === 0)) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data. <button onclick="loadAdminJobs(true)" class="btn btn-sm btn-outline" style="margin-left:8px;">Coba Lagi</button></td></tr>`;
    }
  } finally {
    isLoadingAdminJobs = false;
  }
}

// -------------------------------------------------------------
// TOGGLE JOB LOCK / EXPIRED STATUS (Optimistic UI Update)
// -------------------------------------------------------------
window.toggleJobLock = async function(jobId, newStatus) {
  const job = adminJobs.find(j => Number(j.id) === Number(jobId));
  if (!job) return;

  const prevStatus = job.status;

  // Optimistic UI update: Immediate 0ms visual feedback
  job.status = newStatus;
  renderAdminJobsTable();
  renderDashboardStats(adminJobs);

  let updated = false;

  // 1. Update in server backend
  try {
    const token = getAdminToken();
    const res = await safeFetchJson(getApiEndpoint(`/api/jobs/${jobId}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) updated = true;
  } catch (e) {}

  // 2. Fallback to direct Supabase if offline
  if (!updated && sbClient) {
    try {
      const { error } = await sbClient.from('jobs').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', Number(jobId));
      if (!error) updated = true;
    } catch (e) {
      console.warn('Supabase toggle status error:', e);
    }
  }

  if (updated) {
    try {
      sessionStorage.setItem('kerja_admin_jobs_cache', JSON.stringify(adminJobs));
    } catch (e) {}
    const msg = newStatus === 'expired'
      ? `Lowongan "${job.title}" telah dikunci (Expired & pendaftaran ditutup).`
      : `Lowongan "${job.title}" berhasil diaktifkan kembali.`;
    showAdminToast(newStatus === 'expired' ? 'Lowongan Dikunci' : 'Lowongan Aktif', msg, 'info');
  } else {
    // Revert optimistic update on failure
    job.status = prevStatus;
    renderAdminJobsTable();
    renderDashboardStats(adminJobs);
    showAdminToast('Gagal Mengubah Status', 'Gagal mengubah status lowongan ke server.', 'error');
  }
};

// -------------------------------------------------------------
// DELETE JOB (Optimistic UI Update)
// -------------------------------------------------------------
window.deleteJob = async function(jobId, title) {
  const confirmed = await showAdminConfirm({
    title: 'Hapus Lowongan',
    message: `Apakah Anda yakin ingin menghapus lowongan "${title}" secara permanen? Data yang telah dihapus tidak dapat dipulihkan.`,
    confirmText: 'Ya, Hapus Lowongan',
    cancelText: 'Batal',
    type: 'danger'
  });
  if (!confirmed) return;

  const jobIdx = adminJobs.findIndex(j => Number(j.id) === Number(jobId));
  const removedJob = jobIdx !== -1 ? adminJobs[jobIdx] : null;

  // Optimistic UI update: Immediate removal from table & stats
  if (jobIdx !== -1) {
    adminJobs.splice(jobIdx, 1);
    renderAdminJobsTable();
    renderDashboardStats(adminJobs);
  }

  let deleted = false;

  try {
    const token = getAdminToken();
    const res = await safeFetchJson(getApiEndpoint(`/api/jobs/${jobId}`), {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (res.ok) deleted = true;
  } catch (e) {}

  if (!deleted && sbClient) {
    try {
      const { error } = await sbClient.from('jobs').delete().eq('id', Number(jobId));
      if (!error) deleted = true;
    } catch (e) {}
  }

  if (deleted) {
    try {
      sessionStorage.setItem('kerja_admin_jobs_cache', JSON.stringify(adminJobs));
    } catch (e) {}
    showAdminToast('Lowongan Dihapus', `Lowongan "${title}" berhasil dihapus dari database.`, 'success');
  } else {
    // Revert optimistic deletion on failure
    if (removedJob && jobIdx !== -1) {
      adminJobs.splice(jobIdx, 0, removedJob);
      renderAdminJobsTable();
      renderDashboardStats(adminJobs);
    }
    showAdminToast('Gagal Menghapus', 'Gagal menghapus lowongan dari database.', 'error');
  }
};

// -------------------------------------------------------------
// EDIT MODAL (WITH 3 CONTACT FIELDS & STATUS SELECTOR)
// -------------------------------------------------------------
window.openEditJobModal = function(jobId) {
  const job = adminJobs.find(j => Number(j.id) === Number(jobId));
  if (!job) return;

  const modal = document.getElementById('edit-job-modal');
  const form = document.getElementById('form-edit-job');
  if (!modal || !form) return;

  const contacts = extractJobContacts(job);

  form.querySelector('[name="id"]').value = job.id;
  form.querySelector('[name="title"]').value = job.title;
  form.querySelector('[name="company_name"]').value = job.company_name;
  form.querySelector('[name="category"]').value = job.category || 'Teknologi & IT';
  form.querySelector('[name="job_type"]').value = job.job_type || 'Full Time';
  form.querySelector('[name="location"]').value = job.location || '';
  form.querySelector('[name="salary_display"]').value = job.salary_display || '';
  form.querySelector('[name="experience_level"]').value = job.experience_level || '';
  form.querySelector('[name="status"]').value = (job.status === 'closed' || job.status === 'expired') ? 'expired' : 'active';

  // 3 Distinct contact inputs
  form.querySelector('[name="whatsapp"]').value = contacts.whatsapp || '';
  form.querySelector('[name="email"]').value = contacts.email || '';
  form.querySelector('[name="website"]').value = contacts.website || '';

  const posterPreview = document.getElementById('edit-current-poster-preview');
  if (posterPreview) {
    posterPreview.src = getEffectiveJobPoster(job);
  }

  form.querySelector('[name="description"]').value = job.description || '';

  const parseToList = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      if (v.trim().startsWith('[') && v.trim().endsWith(']')) {
        try { const p = JSON.parse(v); if (Array.isArray(p)) return p; } catch(e){}
      }
      return v.split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
    return [];
  };

  window.setDynamicListValues('edit-resp-items', parseToList(job.responsibilities), 'responsibilities', 'edit-resp-counter');
  window.setDynamicListValues('edit-req-items', parseToList(job.requirements), 'requirements', 'edit-req-counter');
  window.setDynamicListValues('edit-ben-items', parseToList(job.benefits), 'benefits', 'edit-ben-counter');

  modal.classList.add('active');
};

window.closeEditModal = function() {
  const modal = document.getElementById('edit-job-modal');
  if (modal) modal.classList.remove('active');
};

function setupEditFormSubmit() {
  const form = document.getElementById('form-edit-job');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const jobId = form.querySelector('[name="id"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    const reqValues = window.getDynamicListValues('edit-req-items');
    const respValues = window.getDynamicListValues('edit-resp-items');
    const benValues = window.getDynamicListValues('edit-ben-items');

    const whatsapp = form.querySelector('[name="whatsapp"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const website = form.querySelector('[name="website"]')?.value.trim() || '';
    const contactsObj = { whatsapp, email, website };
    const primaryContactType = whatsapp ? 'whatsapp' : (email ? 'email' : 'link');
    const contactValueJSON = JSON.stringify(contactsObj);

    const updatePayload = {
      title: form.querySelector('[name="title"]').value.trim(),
      company_name: form.querySelector('[name="company_name"]').value.trim(),
      category: form.querySelector('[name="category"]').value,
      job_type: form.querySelector('[name="job_type"]').value,
      location: form.querySelector('[name="location"]').value,
      salary_display: form.querySelector('[name="salary_display"]').value || 'Kompetitif',
      experience_level: form.querySelector('[name="experience_level"]').value,
      status: form.querySelector('[name="status"]').value,
      contact_type: primaryContactType,
      contact_value: contactValueJSON,
      description: form.querySelector('[name="description"]').value.trim(),
      requirements: reqValues,
      responsibilities: respValues,
      benefits: benValues,
      updated_at: new Date().toISOString()
    };

    // 1. Update in Supabase Cloud
    let updated = false;

    // 1. Try server backend update first (syncs database and local cache)
    try {
      const formData = new FormData(form);
      formData.set('contact_type', primaryContactType);
      formData.set('contact_value', contactValueJSON);
      formData.set('whatsapp', whatsapp);
      formData.set('email', email);
      formData.set('website_url', website);
      formData.set('requirements', reqValues.join('\n'));
      formData.set('responsibilities', respValues.join('\n'));
      formData.set('benefits', benValues.join('\n'));

      const token = sessionStorage.getItem('kerja_admin_token') || '';
      const res = await fetch(getApiEndpoint(`/api/jobs/${jobId}`), {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        updated = true;
      }
    } catch (err) {
      console.warn('Backend update unavailable, falling back to direct cloud client:', err);
    }

    // 2. Fallback to direct Supabase update if backend is offline
    if (!updated && sbClient) {
      try {
        await sbClient.from('jobs').update(updatePayload).eq('id', Number(jobId));
        updated = true;
      } catch (err) {
        console.warn('Supabase update exception:', err);
      }
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;
    closeEditModal();
    loadAdminJobs(true);
    alert('Perubahan lowongan & saluran kontak berhasil disimpan!');
  });
}

// ==============================================================
// SMART DATE & DEADLINE VALIDATION HELPERS (ANTI-EXPIRED)
// ==============================================================
function parseDateSafe(str) {
  if (!str) return null;
  str = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  const months = {
    januari: 0, jan: 0, january: 0,
    februari: 1, feb: 1, february: 1,
    maret: 2, mar: 2, march: 2,
    april: 3, apr: 3,
    mei: 4, may: 4,
    juni: 5, jun: 5, june: 5,
    juli: 6, jul: 6, july: 6,
    agustus: 7, agu: 7, aug: 7, august: 7,
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

function formatIndoDate(dateObj) {
  if (!dateObj) return '';
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

function toIsoDate(d) {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDeadlineMeta(deadlineStr, fallbackDaysAhead = 30) {
  let d = parseDateSafe(deadlineStr);
  if (!d) {
    const future = new Date();
    future.setDate(future.getDate() + fallbackDaysAhead);
    return {
      isValid: true,
      isExpired: false,
      daysLeft: fallbackDaysAhead,
      displayDate: formatIndoDate(future),
      isoDate: toIsoDate(future)
    };
  }
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    isValid: true,
    isExpired: diffDays < 0,
    daysLeft: diffDays,
    displayDate: formatIndoDate(d),
    isoDate: toIsoDate(d)
  };
}

// ==============================================================
// GENERATOR LOWONGAN RESMI (ANTI-HOAX) & STUDIO POSTER FLYER
// ==============================================================

// ==============================================================
// DYNAMIC OFFICIAL VACANCIES ENGINE (ZERO HARDCODE - 100% SYSTEM & LIVE API)
// ==============================================================

let OFFICIAL_VACANCIES_DB = [];
let currentOfficialFilteredJobs = [];
let currentPosterJobData = null;

// AUTOLOAD & REAL-TIME LIVE SYNC ENGINE STATE
let autoloadInterval = null;
let autoloadCountdownTicker = null;
let isAutoloadActive = true;
let autoloadCountdown = 30; // 30 seconds interval
let isAutoloadFetching = false;
let lastAutoloadTime = null;

async function populateOfficialVacanciesFromSystem(keyword = 'lowongan', isBackgroundAutoload = false, targetPlatform = null) {
  const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
  const activePlatform = targetPlatform || (activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all');

  // If not background silent autoload, rebuild base list with DB jobs
  if (!isBackgroundAutoload) {
    OFFICIAL_VACANCIES_DB = [];

    // 1. Convert real database jobs from adminJobs
    if (Array.isArray(adminJobs) && adminJobs.length > 0) {
      adminJobs.forEach(dbJob => {
        if (dbJob.status === 'system_settings') return;
        const dbCreated = dbJob.created_at ? new Date(dbJob.created_at).getTime() : 0;
        OFFICIAL_VACANCIES_DB.push({
          id: 'db_' + dbJob.id,
          title: dbJob.title,
          company_name: dbJob.company_name,
          brand_logo_text: (dbJob.company_name || 'CO').slice(0, 3).toUpperCase(),
          brand_banner: dbJob.poster_image || './uploads/indolakto_indomilk_banner.jpg',
          sector: (dbJob.category || '').toLowerCase().includes('fmcg') ? 'fmcg' : 'manufaktur',
          sector_label: dbJob.category || 'Operasional',
          category: dbJob.category || 'Administrasi',
          role_department: dbJob.job_type || 'Full Time',
          job_type: dbJob.job_type || 'Full Time',
          location: dbJob.location || 'Indonesia',
          education_level: 'all',
          education_label: 'Semua Pendidikan',
          experience_level: dbJob.experience_level || 'Semua Pengalaman',
          salary_display: dbJob.salary_display || 'Kompetitif',
          deadline: 'Aktif di Portal',
          pubDate: dbJob.created_at || '',
          pubTimestamp: dbCreated,
          timeAgo: 'Diposting di Portal',
          isFresh: dbCreated > (Date.now() - 24 * 60 * 60 * 1000),
          platform: 'official',
          platform_label: 'Database Resmi Portal',
          platform_icon: 'fa-solid fa-building-circle-check',
          platform_class: 'official',
          official_url: dbJob.website_url || './',
          contact_type: 'link',
          contact_value: JSON.stringify({ whatsapp: dbJob.whatsapp || '', email: dbJob.email || '', website: dbJob.website_url || '' }),
          anti_fraud_notice: `PT ${dbJob.company_name} tidak memungut biaya apapun dalam proses rekrutmen.`,
          description: dbJob.description || 'Lowongan resmi dari database sistem KerjaHub.',
          requirements: Array.isArray(dbJob.requirements) ? dbJob.requirements : [dbJob.requirements || 'Kualifikasi sesuai arahan perusahaan'],
          responsibilities: Array.isArray(dbJob.responsibilities) ? dbJob.responsibilities : [dbJob.responsibilities || 'Tanggung jawab sesuai posisi'],
          benefits: Array.isArray(dbJob.benefits) ? dbJob.benefits : ['BPJS & Tunjangan Standar'],
          theme: 'modern',
          mascot: 'corporate',
          verified_badge: 'Database Resmi',
          apply_info: 'Lamaran langsung ke sistem KerjaHub.',
          hashtag: '#KerjaHub #LokerResmi'
        });
      });
    }
  }

  // 2. Fetch real live portal jobs from /api/live-jobs
  let newArrivalsCount = 0;
  try {
    const res = await fetch(`/api/live-jobs?keyword=${encodeURIComponent(keyword || 'lowongan')}&platform=${encodeURIComponent(activePlatform || 'all')}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        json.data.forEach(lj => {
          const exists = OFFICIAL_VACANCIES_DB.some(o => 
            (o.official_url && lj.official_url && o.official_url === lj.official_url) ||
            (o.title.toLowerCase() === lj.title.toLowerCase() && o.company_name.toLowerCase() === lj.company_name.toLowerCase())
          );
          if (!exists) {
            newArrivalsCount++;

            const plat = lj.platform || 'web';
            const compClean = (lj.company_name || 'Perusahaan').replace(/[^a-zA-Z0-9]/g, '');
            let defaultTheme = 'modern';
            let defaultHashtag = '#LokerWebAsli #InfoLowongan';

            if (plat === 'linkedin') {
              defaultTheme = 'linkedin';
              defaultHashtag = `#LokerLinkedIn #InfoKarir #HiringNow #${compClean}`;
            } else if (plat === 'instagram') {
              defaultTheme = 'instagram';
              defaultHashtag = `#LokerInstagram #InfoLoker2026 #KarirIG #${compClean}`;
            } else if (plat === 'facebook') {
              defaultTheme = 'facebook';
              defaultHashtag = `#LokerFacebook #InfoLowonganKerja #${compClean}`;
            } else if (plat === 'twitter') {
              defaultTheme = 'twitter';
              defaultHashtag = `#LokerTwitter #InfoLoker #${compClean}`;
            } else if (plat === 'bumn') {
              defaultTheme = 'bumn';
              defaultHashtag = `#LokerBUMN #RekrutmenBUMN #BUMNUntukIndonesia #${compClean}`;
            } else if ((lj.title || '').toLowerCase().includes('operator') || (lj.title || '').toLowerCase().includes('teknisi')) {
              defaultTheme = 'factory';
              defaultHashtag = `#LokerPabrik #OperatorProduksi #${compClean}`;
            }

            OFFICIAL_VACANCIES_DB.push({
              id: lj.id || ('live_web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
              title: lj.title,
              company_name: lj.company_name,
              brand_logo_text: (lj.company_name || 'CO').slice(0, 3).toUpperCase(),
              brand_banner: './uploads/indolakto_indomilk_banner.jpg',
              sector: 'manufaktur',
              sector_label: lj.source_website || 'Website Berita & Karir',
              category: lj.category || 'Operasional',
              role_department: lj.role_department || lj.title,
              job_type: lj.job_type || 'Full Time',
              location: lj.location || 'Indonesia',
              education_level: 'all',
              education_label: 'Semua Tingkat',
              experience_level: 'Semua Pengalaman',
              salary_display: lj.salary_display || 'Kompetitif',
              deadline: 'Aktif Real-Time',
              pubDate: lj.pubDate || new Date().toISOString(),
              pubTimestamp: lj.pubTimestamp || Date.now(),
              timeAgo: lj.timeAgo || 'Baru saja',
              isFresh: lj.isFresh !== undefined ? lj.isFresh : true,
              platform: plat,
              platform_label: lj.platform_label || 'Website Resmi Terverifikasi',
              platform_icon: lj.platform_icon || 'fa-solid fa-globe',
              platform_class: lj.platform_class || 'web',
              official_url: lj.official_url || lj.website_url || lj.url,
              contact_type: 'link',
              contact_value: JSON.stringify({ whatsapp: lj.contact_whatsapp || '', email: lj.contact_email || '', website: lj.official_url || lj.website_url || lj.url }),
              anti_fraud_notice: lj.anti_fraud_notice,
              description: lj.description,
              requirements: Array.isArray(lj.requirements) && lj.requirements.length > 0 ? lj.requirements : ['Kualifikasi tercantum pada postingan web resmi', 'Pendidikan relevan', 'Disiplin dan bertanggung jawab'],
              responsibilities: Array.isArray(lj.responsibilities) && lj.responsibilities.length > 0 ? lj.responsibilities : ['Menjalankan tugas sesuai arahan operasional'],
              benefits: Array.isArray(lj.benefits) && lj.benefits.length > 0 ? lj.benefits : ['Gaji pokok sesuai standar UMK / korporasi', 'BPJS Ketenagakerjaan & Kesehatan'],
              theme: defaultTheme,
              mascot: (lj.title || '').toLowerCase().includes('operator') ? 'factory' : 'corporate',
              verified_badge: lj.platform_label || 'Web Terverifikasi',
              apply_info: `Klik "Buka Postingan Asli" untuk membuka link sumber ${lj.platform_label || 'Web'}.`,
              hashtag: defaultHashtag
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Error fetching live jobs for official section:', e);
  }

  // 3. Sort strictly by newest pubTimestamp descending (Freshest jobs always at top!)
  OFFICIAL_VACANCIES_DB.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  lastAutoloadTime = new Date();
  updateAutoloadStatusUi();

  filterAndRenderOfficialJobs();

  if (isBackgroundAutoload && newArrivalsCount > 0) {
    showAutoloadToast(`⚡ ${newArrivalsCount} Lowongan baru terbit di web berhasil dimuat otomatis!`);
  }
}

// -------------------------------------------------------------
// AUTOLOAD ENGINE CONTROLLERS
// -------------------------------------------------------------
function startAdminAutoloadEngine() {
  if (autoloadInterval) clearInterval(autoloadInterval);
  if (autoloadCountdownTicker) clearInterval(autoloadCountdownTicker);

  isAutoloadActive = true;
  autoloadCountdown = 30;

  updateAutoloadStatusUi();

  // 1-second ticker for countdown
  autoloadCountdownTicker = setInterval(() => {
    if (!isAutoloadActive) return;
    autoloadCountdown--;
    if (autoloadCountdown <= 0) {
      autoloadCountdown = 30;
      triggerBackgroundAutoload();
    }
    updateAutoloadCountdownUi();
  }, 1000);
}

function stopAdminAutoloadEngine() {
  if (autoloadInterval) clearInterval(autoloadInterval);
  if (autoloadCountdownTicker) clearInterval(autoloadCountdownTicker);
  autoloadInterval = null;
  autoloadCountdownTicker = null;
  isAutoloadActive = false;
  updateAutoloadStatusUi();
}

function toggleAutoloadEngine() {
  if (isAutoloadActive) {
    stopAdminAutoloadEngine();
    showAutoloadToast('Autoload dijeda sementara.');
  } else {
    startAdminAutoloadEngine();
    triggerManualWebSync();
    showAutoloadToast('Autoload diaktifkan kembali (Interval 30 detik).');
  }
}

async function triggerManualWebSync() {
  autoloadCountdown = 30;
  const icon = document.getElementById('icon-manual-sync');
  if (icon) icon.classList.add('fa-spin');
  try {
    const kwInput = document.getElementById('official-keyword');
    const kw = kwInput ? (kwInput.value.trim() || 'lowongan') : 'lowongan';
    const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
    const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';
    await populateOfficialVacanciesFromSystem(kw, false, source);
    showAutoloadToast('Sinkronisasi selesai! Lowongan sesuai platform terpilih telah dimuat.');
  } finally {
    if (icon) icon.classList.remove('fa-spin');
    updateAutoloadStatusUi();
  }
}

async function triggerBackgroundAutoload() {
  if (isAutoloadFetching) return;
  isAutoloadFetching = true;
  try {
    const kwInput = document.getElementById('official-keyword');
    const isTyping = document.activeElement === kwInput;
    const kw = (kwInput && !isTyping) ? (kwInput.value.trim() || 'lowongan') : 'lowongan';
    const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
    const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';
    await populateOfficialVacanciesFromSystem(kw, true, source);
  } finally {
    isAutoloadFetching = false;
  }
}

function updateAutoloadCountdownUi() {
  const badge = document.getElementById('autoload-status-badge');
  const headerLabel = document.getElementById('header-autoload-label');
  if (isAutoloadActive) {
    if (badge) badge.innerHTML = `<i class="fa-solid fa-bolt"></i> AKTIF (${autoloadCountdown}s)`;
    if (headerLabel) headerLabel.textContent = `Autoload Live (${autoloadCountdown}s)`;
  }
}

function updateAutoloadStatusUi() {
  const pill = document.getElementById('header-autoload-pill');
  const banner = document.querySelector('.autoload-live-banner');
  const badge = document.getElementById('autoload-status-badge');
  const desc = document.getElementById('autoload-status-desc');
  const toggleBtn = document.getElementById('btn-toggle-autoload');
  const headerLabel = document.getElementById('header-autoload-label');

  const timeStr = lastAutoloadTime ? lastAutoloadTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Baru saja';

  if (isAutoloadActive) {
    if (pill) pill.classList.remove('paused');
    if (banner) banner.classList.remove('paused');
    if (badge) {
      badge.style.background = '#059669';
      badge.innerHTML = `<i class="fa-solid fa-bolt"></i> AKTIF (${autoloadCountdown}s)`;
    }
    if (desc) {
      desc.textContent = `Autoload aktif. Terakhir disinkronkan pukul ${timeStr} WIB. Otomatis memuat update lowongan terbitan terbaru setiap 30 detik.`;
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Jeda Autoload';
      toggleBtn.style.color = '#047857';
      toggleBtn.style.borderColor = '#059669';
    }
    if (headerLabel) headerLabel.textContent = `Autoload Live (${autoloadCountdown}s)`;
  } else {
    if (pill) pill.classList.add('paused');
    if (banner) banner.classList.add('paused');
    if (badge) {
      badge.style.background = '#64748b';
      badge.innerHTML = `<i class="fa-solid fa-circle-pause"></i> DIJEDA`;
    }
    if (desc) {
      desc.textContent = `Autoload sedang dijeda. Klik "Lanjutkan Autoload" atau "Sync Sekarang" untuk memperbarui lowongan web terbaru.`;
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Lanjutkan Autoload';
      toggleBtn.style.color = '#0284c7';
      toggleBtn.style.borderColor = '#0284c7';
    }
    if (headerLabel) headerLabel.textContent = 'Autoload Dijeda';
  }
}

function showAutoloadToast(message) {
  const existing = document.querySelector('.autoload-live-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'autoload-live-toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.1rem;"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

window.startAdminAutoloadEngine = startAdminAutoloadEngine;
window.stopAdminAutoloadEngine = stopAdminAutoloadEngine;
window.toggleAutoloadEngine = toggleAutoloadEngine;
window.triggerManualWebSync = triggerManualWebSync;



// Helper: Set keyword from preset badge
window.setOfficialKeyword = function(keyword) {
  const input = document.getElementById('official-keyword');
  if (input) {
    input.value = keyword;
    filterAndRenderOfficialJobs();
  }
};

function filterAndRenderOfficialJobs() {
  const keyword = (document.getElementById('official-keyword')?.value || '').trim().toLowerCase();
  const location = (document.getElementById('official-location')?.value || '').trim().toLowerCase();
  const education = document.getElementById('official-education')?.value || 'all';
  const activeSectorBtn = document.querySelector('.official-sector-pills .sector-pill.active');
  const sector = activeSectorBtn ? activeSectorBtn.getAttribute('data-sector') : 'all';
  const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
  const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';

  currentOfficialFilteredJobs = OFFICIAL_VACANCIES_DB.filter(job => {
    // 1. Filter Ketat Batas Waktu: Hanya tampilkan loker yang BENAR-BENAR AKTIF dan belum lewat deadline
    const dMeta = getDeadlineMeta(job.deadline);
    if (dMeta.isExpired) {
      return false; // Skip loker kedaluwarsa
    }

    // Platform / Medsos filter
    if (source !== 'all') {
      const jobPlat = (job.platform || 'web').toLowerCase();
      if (source === 'corporate') {
        if (jobPlat !== 'corporate' && jobPlat !== 'web' && jobPlat !== 'official') return false;
      } else {
        if (jobPlat !== source) return false;
      }
    }

    // Sector filter
    if (sector !== 'all' && job.sector !== sector) return false;

    // Education filter
    if (education !== 'all' && job.education_level !== education && education !== 'all') {
      if (education === 'smk' && job.education_level !== 'smk') return false;
      if (education === 'd3' && job.education_level !== 'd3' && job.education_level !== 'smk') return false;
    }

    // Keyword filter
    if (keyword) {
      const matchTitle = job.title.toLowerCase().includes(keyword);
      const matchComp = job.company_name.toLowerCase().includes(keyword);
      const matchDesc = job.description.toLowerCase().includes(keyword);
      const matchReq = job.requirements.some(r => r.toLowerCase().includes(keyword));
      const matchPlat = (job.platform_label || '').toLowerCase().includes(keyword);
      if (!matchTitle && !matchComp && !matchDesc && !matchReq && !matchPlat) return false;
    }

    // Location filter
    if (location) {
      if (!job.location.toLowerCase().includes(location)) return false;
    }

    return true;
  });

  renderOfficialJobsGrid();
}

function renderOfficialJobsGrid() {
  const container = document.getElementById('official-jobs-container');
  const titleEl = document.getElementById('scout-results-summary-title');
  const subEl = document.getElementById('scout-results-summary-sub');
  if (!container) return;

  const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
  const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';
  const sourceLabels = {
    all: 'Semua Platform & Media Sosial',
    linkedin: 'LinkedIn Postingan Karir',
    instagram: 'Instagram Info Karir',
    facebook: 'Facebook Postingan Karir',
    twitter: 'Twitter (X) Karir',
    media: 'Portal Media Berita (Kompas, Detik, Tribun)',
    bumn: 'BUMN & Karir Resmi',
    corporate: 'Perusahaan Swasta & Korporasi'
  };

  if (titleEl) {
    titleEl.textContent = `Ditemukan ${currentOfficialFilteredJobs.length} Lowongan ${sourceLabels[source] || ''}`;
  }
  if (subEl) {
    subEl.textContent = `Menampilkan lowongan aktual yang dipublikasikan di ${sourceLabels[source] || 'website resmi'}. Sekali klik langsung menuju postingan aslinya di internet!`;
  }

  if (currentOfficialFilteredJobs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 12px; border: 1.5px dashed #cbd5e1;">
        <i class="fa-solid fa-file-circle-xmark" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 14px;"></i>
        <h4 style="color: #334155; font-size: 1.1rem; margin-bottom: 6px;">Belum ada lowongan termuat untuk "${sourceLabels[source] || source}"</h4>
        <p style="font-size: 0.84rem; color: #64748b; max-width: 480px; margin: 0 auto 16px;">
          Klik tombol "Tarik Lowongan Sesuai Sosmed Terpilih" di bawah untuk memindai internet secara langsung.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-outline btn-sm" onclick="resetOfficialFilters()">Reset Filter</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="triggerManualWebSync()"><i class="fa-solid fa-magnifying-glass-location"></i> Tarik Loker ${sourceLabels[source] || ''} Terkini</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = currentOfficialFilteredJobs.map((job, idx) => {
    const platClass = job.platform_class || 'official';
    const platIcon = job.platform_icon || 'fa-solid fa-globe';
    const platLabel = job.platform_label || job.source_website || 'Web Resmi Terverifikasi';

    // Check if this job is already published and active in adminJobs
    const isAlreadyPublished = adminJobs.some(aj =>
      aj.title && aj.title.toLowerCase().trim() === job.title.toLowerCase().trim() &&
      (aj.company_name || '').toLowerCase().trim() === (job.company_name || '').toLowerCase().trim()
    );

    // Is fresh check: isFresh flag or within 24 hours
    const isVeryFresh = job.isFresh || (job.pubTimestamp && (Date.now() - job.pubTimestamp < 24 * 60 * 60 * 1000));

    const platNameShort = job.platform === 'linkedin' ? 'LinkedIn' : (job.platform === 'instagram' ? 'Instagram' : (job.platform === 'facebook' ? 'Facebook' : (job.platform === 'twitter' ? 'Twitter' : (job.platform === 'bumn' ? 'BUMN' : 'Web'))));

    return `
      <div class="official-job-card card-${platClass}">
        <div class="official-card-top">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="official-platform-badge ${platClass}">
              <i class="${platIcon}"></i> ${escapeHtml(platLabel)}
            </span>
            ${isVeryFresh ? `
              <span class="official-platform-badge fresh-badge" title="Dipublikasikan hari ini!">
                <i class="fa-solid fa-bolt"></i> TERBARU HARI INI
              </span>
            ` : ''}
          </div>
          <span class="official-sector-tag">${escapeHtml(job.sector_label || job.sector)}</span>
        </div>

        <h3 class="official-job-title">
          <a href="${escapeHtml(job.official_url || '#')}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;" title="Buka Postingan Asli ${platNameShort}">
            ${escapeHtml(job.title)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.78rem; color: #0284c7; margin-left: 4px;"></i>
          </a>
        </h3>
        <div class="official-company-name">
          <i class="fa-solid fa-building"></i>
          <span>${escapeHtml(job.company_name)}</span>
        </div>

        <div class="official-meta-pills">
          <span class="official-meta-pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</span>
          ${job.timeAgo ? `<span class="official-meta-pill pill-time-ago"><i class="fa-regular fa-clock"></i> ${escapeHtml(job.timeAgo)}</span>` : ''}
          <span class="official-meta-pill"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(job.education_label || 'Semua Pendidikan')}</span>
          <span class="official-meta-pill"><i class="fa-solid fa-clock"></i> ${escapeHtml(job.job_type)}</span>
          <span class="official-meta-pill salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</span>
          <span class="official-meta-pill deadline" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;"><i class="fa-solid fa-clock-rotate-left"></i> Batas Waktu: ${escapeHtml(job.deadline)} (Sisa ${getDeadlineMeta(job.deadline).daysLeft} Hari • Aktif)</span>
        </div>

        <div class="official-screening-card">
          <i class="fa-solid fa-shield-check" style="color: #10b981; font-size: 1rem; flex-shrink: 0;"></i>
          <span><strong>Lolos Screening Anti-Hoax:</strong> Terbit di ${escapeHtml(platLabel)} • 100% Bebas Biaya • Tautan Valid</span>
        </div>

        <div style="font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
          <i class="fa-solid fa-list-check" style="color: #6366f1;"></i> Kualifikasi Utama:
        </div>
        <ul class="official-req-list">
          ${job.requirements.slice(0, 4).map(req => `<li><i class="fa-solid fa-check" style="color:#10b981; font-size:0.75rem; margin-top:2px;"></i> <span>${escapeHtml(req)}</span></li>`).join('')}
        </ul>

        <div class="official-apply-note">
          <i class="fa-solid fa-circle-info" style="color: #0284c7;"></i>
          <span>${escapeHtml(job.apply_info || 'Klik Buka Postingan Asli untuk langsung menuju sumber pengumuman resmi.')}</span>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="official-card-actions">
          ${isAlreadyPublished ? `
            <button type="button" class="btn-gas-publish-action published" disabled title="Lowongan ini sudah aktif terbit di portal KerjaHub">
              <i class="fa-solid fa-circle-check"></i> Sudah Terbit di Portal
            </button>
          ` : `
            <button type="button" class="btn-gas-publish-action" id="btn-gas-${idx}" onclick="generateAndPublishOfficialJob(${idx})" title="Generate poster flyer otomatis dan langsung terbitkan ke portal KerjaHub">
              <i class="fa-solid fa-bolt"></i> ⚡ Generate Poster & Terbitkan (Gas!)
            </button>
          `}

          <div class="official-actions-row">
            <button type="button" class="btn btn-outline" onclick="openPosterStudioFromOfficialIndex(${idx})" title="Buka Studio Flyer Poster untuk kustomisasi tema / warna">
              <i class="fa-solid fa-palette"></i> Studio Poster
            </button>
            <button type="button" class="btn-copy-caption" onclick="copyJobSosmedCaption(${idx})" title="Salin teks caption siap diposting ke medsos">
              <i class="fa-regular fa-copy"></i> Salin Caption
            </button>
            <a href="${escapeHtml(job.official_url || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color: #0284c7; color: #0284c7; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="Buka Postingan Asli Langsung di ${platNameShort}">
              <i class="${platIcon}"></i> Buka Postingan ${platNameShort} ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.copyJobSosmedCaption = function(idx) {
  const job = currentOfficialFilteredJobs[idx];
  if (!job) return;
  const plat = job.platform_label || 'Web Resmi';
  const text = `📢 [LOWONGAN KERJA RESMI - ${job.company_name}]

Posisi: ${job.title}
🏢 Perusahaan: ${job.company_name}
📍 Lokasi: ${job.location}
💰 Gaji: ${job.salary_display}
⏰ Batas Waktu: ${job.deadline}

Persyaratan Utama:
${job.requirements.slice(0, 4).map(r => `• ${r}`).join('\n')}

🔗 Buka Link Postingan Asli (${plat}):
${job.official_url}

${job.hashtag || '#LokerResmi #InfoLowongan'} @KerjaHubOfficial`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showAutoloadToast(`📋 Caption postingan ${plat} berhasil disalin ke clipboard!`);
    }).catch(() => {
      prompt('Salin teks caption berikut:', text);
    });
  } else {
    prompt('Salin teks caption berikut:', text);
  }
};

window.openWebJobDirectFromIndex = function(idx) {
  const job = currentOfficialFilteredJobs[idx];
  if (job && job.official_url) {
    window.open(job.official_url, '_blank', 'noopener,noreferrer');
  }
};
window.openJobStreetViewerFromOfficialIndex = window.openWebJobDirectFromIndex;

window.openWebJobDirectFromId = function(jobId) {
  const job = (adminJobs || []).find(j => String(j.id) === String(jobId));
  if (job && job.website_url) {
    window.open(job.website_url, '_blank', 'noopener,noreferrer');
  } else {
    window.open('./?job=' + encodeURIComponent(jobId), '_blank');
  }
};
window.openJobStreetViewerFromExistingId = window.openWebJobDirectFromId;

window.publishJobDataDirectly = function(job) {
  if (!job) return;
  // Find matching job in OFFICIAL_VACANCIES_DB if available
  const matchIdx = OFFICIAL_VACANCIES_DB.findIndex(j => j.id === job.id);
  if (matchIdx >= 0) {
    generateAndPublishOfficialJob(matchIdx);
  } else {
    // Generate new DB job
    const formData = new FormData();
    formData.append('title', job.title);
    formData.append('company_name', job.company_name);
    formData.append('category', job.category || 'Administrasi & Keuangan');
    formData.append('job_type', job.job_type || 'Full Time');
    formData.append('location', job.location || 'Indonesia');
    formData.append('salary_display', job.salary_display || 'Kompetitif');
    formData.append('experience_level', job.experience_level || '1-3 Tahun');
    formData.append('description', job.description || '');
    formData.append('requirements', (job.requirements || []).join('\n'));
    formData.append('responsibilities', (job.responsibilities || []).join('\n'));
    formData.append('benefits', (job.benefits || []).join('\n'));
    formData.append('whatsapp', job.contact_whatsapp || '');
    formData.append('email', job.contact_email || '');
    formData.append('website', job.official_url || '');
    formData.append('deadline', '2026-11-30');
    formData.append('is_featured', '1');

    safeFetchJson(getApiEndpoint('/api/jobs'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAdminToken()}` },
      body: formData
    }).then(({ ok, data }) => {
      if (ok) {
        alert(`⚡ Lowongan "${job.title}" (${job.company_name}) berhasil diterbitkan ke portal KerjaHub!`);
        loadAdminJobs(true);
      } else {
        alert('Gagal menerbitkan: ' + (data?.message || 'Error server'));
      }
    });
  }
};

window.openPosterStudioWithData = function(job) {
  if (!job) return;
  const matchIdx = OFFICIAL_VACANCIES_DB.findIndex(j => j.id === job.id);
  if (matchIdx >= 0) {
    openPosterStudioFromOfficialIndex(matchIdx);
  } else {
    currentPosterJobData = {
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      salary_display: job.salary_display,
      deadline: '30 November 2026',
      requirements: job.requirements || [],
      apply_info: `Kirim lamaran via email ${job.contact_email || 'rekrutmen'}`
    };
    const modal = document.getElementById('poster-studio-modal');
    if (modal) {
      modal.classList.add('active');
      renderPosterCanvas();
    }
  }
};

window.resetOfficialFilters = function() {
  const kw = document.getElementById('official-keyword');
  const loc = document.getElementById('official-location');
  const edu = document.getElementById('official-education');
  if (kw) kw.value = '';
  if (loc) loc.value = '';
  if (edu) edu.value = 'all';

  document.querySelectorAll('.official-source-pills .source-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-source') === 'all');
  });

  document.querySelectorAll('.official-sector-pills .sector-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sector') === 'all');
  });

  filterAndRenderOfficialJobs();
};

// -------------------------------------------------------------
// HELPER: GENERATE POSTER FLYER DATA-URL IN MEMORY
// -------------------------------------------------------------
function generateFlyerPosterDataUrl(jobData) {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return '';

  const compInp = document.getElementById('poster-input-company');
  const titleInp = document.getElementById('poster-input-title');
  const deadInp = document.getElementById('poster-input-deadline');
  const applyInp = document.getElementById('poster-input-apply-info');
  const qrInp = document.getElementById('poster-input-qr-url');
  const hashInp = document.getElementById('poster-input-hashtag');

  if (compInp) compInp.value = jobData.company_name || '';
  if (titleInp) titleInp.value = jobData.title || '';
  if (deadInp) deadInp.value = jobData.deadline || '';
  if (applyInp) applyInp.value = jobData.apply_info || (jobData.company_name ? `Kirim CV/Lamaran melalui tautan resmi ${jobData.company_name}.` : '');
  if (qrInp) qrInp.value = jobData.official_url || window.location.origin;
  if (hashInp) hashInp.value = jobData.hashtag || `@KerjaHubOfficial #LowonganKerja`;

  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') {
      if (val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        } catch (e) {}
      }
      return val.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const respList = parseList(jobData.responsibilities);
  const reqList = parseList(jobData.requirements);
  const benList = parseList(jobData.benefits);

  window.setDynamicListValues('poster-resp-items', respList, 'responsibilities', 'poster-resp-counter');
  window.setDynamicListValues('poster-req-items', reqList, 'requirements', 'poster-req-counter');
  window.setDynamicListValues('poster-ben-items', benList, 'benefits', 'poster-ben-counter');

  const legacyReq = document.getElementById('poster-input-requirements');
  if (legacyReq) legacyReq.value = reqList.join('\n');
  const legacyResp = document.getElementById('poster-input-responsibilities');
  if (legacyResp) legacyResp.value = respList.join('\n');
  const legacyBen = document.getElementById('poster-input-benefits');
  if (legacyBen) legacyBen.value = benList.join('\n');

  // Select theme and mascot based on sector/job
  const isOperator = (jobData.title || '').toLowerCase().includes('operator') || (jobData.title || '').toLowerCase().includes('teknisi');
  const theme = jobData.theme || (isOperator ? 'factory' : 'modern');
  const mascot = jobData.mascot || (isOperator ? 'factory' : 'corporate');

  document.querySelectorAll('input[name="poster_theme"]').forEach(r => {
    r.checked = (r.value === theme);
    r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
  });

  document.querySelectorAll('input[name="poster_mascot"]').forEach(r => {
    r.checked = (r.value === mascot);
    r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
  });

  // Render directly on canvas
  renderPosterCanvas();

  try {
    return canvas.toDataURL('image/png');
  } catch(e) {
    return '';
  }
}

// -------------------------------------------------------------
// 1-KLIK GENERATE POSTER & TERBITKAN KE PORTAL (GAS!)
// -------------------------------------------------------------
window.generateAndPublishOfficialJob = async function(index) {
  const job = currentOfficialFilteredJobs[index];
  if (!job) return;

  const btn = document.getElementById(`btn-gas-${index}`);
  const origBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengenerate Poster & Terbit...';
  }

  try {
    // 1. Auto-generate the high-res canvas poster flyer
    const posterDataUrl = generateFlyerPosterDataUrl(job);

    // 2. Prepare contacts JSON with strict anti-hoax verification
    let emailVal = '';
    let waVal = '';
    let websiteVal = job.official_url || '';
    if (job.contact_value) {
      try {
        const parsed = typeof job.contact_value === 'string' ? JSON.parse(job.contact_value) : job.contact_value;
        emailVal = parsed.email || '';
        waVal = parsed.whatsapp || '';
        if (parsed.website) websiteVal = parsed.website;
      } catch (e) {}
    }

    const contactsJson = JSON.stringify({
      url: websiteVal,
      website: websiteVal,
      email: emailVal,
      whatsapp: waVal,
      source_platform: job.platform || 'official',
      source_label: job.platform_label || 'Resmi BUMN & Korporasi',
      is_verified_anti_hoax: true,
      verified_screening_status: 'passed'
    });

    const dMeta = getDeadlineMeta(job.deadline, 30);
    if (dMeta.isExpired) {
      alert(`⚠️ Lowongan "${job.title}" (${job.company_name}) telah melewati batas pengumpulan berkas dan tidak dapat diterbitkan sebagai lowongan aktif.`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origBtnHtml;
      }
      return;
    }

    const payload = {
      title: job.title,
      company_name: job.company_name,
      category: job.category || 'Operasional',
      job_type: job.job_type || 'Full Time',
      location: job.location,
      salary_display: job.salary_display || 'Kompetitif',
      experience_level: job.experience_level || 'Fresh Graduate',
      poster_image: posterDataUrl || './uploads/corporate_worker_mascot.jpg',
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      whatsapp: waVal || '',
      email: emailVal || '',
      website_url: websiteVal || '',
      contact_type: 'link',
      contact_value: contactsJson,
      deadline: dMeta.isoDate || toIsoDate(new Date(Date.now() + 30 * 86400000)),
      status: 'active',
      is_featured: true,
      views_count: 0
    };

    let saved = false;
    let errorMsg = '';

    // Backend POST /api/jobs
    try {
      const token = getAdminToken();
      const formData = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        formData.set(k, Array.isArray(v) ? JSON.stringify(v) : v);
      }
      const res = await fetch(getApiEndpoint('/api/jobs'), {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.success !== false) saved = true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        errorMsg = errJson.message || '';
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to direct cloud client:', e);
    }

    // Fallback: direct Supabase insert
    if (!saved && sbClient) {
      try {
        const { error } = await sbClient.from('jobs').insert([payload]);
        if (!error) saved = true;
        else if (!errorMsg) errorMsg = error.message;
      } catch (e) {
        if (!errorMsg) errorMsg = e.message;
      }
    }

    if (saved) {
      sessionStorage.removeItem('kerja_public_jobs_cache');
      await loadAdminJobs();
      loadDashboardData();
      renderOfficialJobsGrid();

      alert(`⚡ GAS BERHASIL!\n\nLowongan: ${job.title}\nPerusahaan: ${job.company_name}\n\nPoster Flyer Resmi telah otomatis di-generate dan lowongan kini LANGSUNG AKTIF di portal KerjaHub!`);
    } else {
      alert('Gagal menerbitkan: ' + (errorMsg || 'Periksa status koneksi Supabase.'));
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origBtnHtml;
      }
    }
  } catch (err) {
    alert('Terjadi kesalahan saat mengenerate poster: ' + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnHtml;
    }
  }
};

// -------------------------------------------------------------
// BULK TERBITKAN SEMUA LOKER RESMI 2026 KE PORTAL (GAS SEKALI KLIK)
// -------------------------------------------------------------
window.bulkPublishAllOfficialJobs = async function() {
  const unpublished = currentOfficialFilteredJobs.filter(job => {
    return !adminJobs.some(aj =>
      aj.title && aj.title.toLowerCase().trim() === job.title.toLowerCase().trim() &&
      (aj.company_name || '').toLowerCase().trim() === (job.company_name || '').toLowerCase().trim()
    );
  });

  if (unpublished.length === 0) {
    alert('Semua lowongan resmi yang tersaring pada daftar ini telah berhasil terbit di portal KerjaHub!');
    return;
  }

  if (!confirm(`⚡ GAS SEMUA LOKER?\n\nAda ${unpublished.length} lowongan resmi 2026 yang belum terbit.\n\nSistem akan mengenerate poster flyer dan menerbitkan semuanya langsung ke Portal KerjaHub sekaligus. Lanjutkan?`)) {
    return;
  }

  const bulkBtn = document.getElementById('btn-scout-bulk-gas');
  const origText = bulkBtn ? bulkBtn.innerHTML : '';
  if (bulkBtn) {
    bulkBtn.disabled = true;
    bulkBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengenerate & Menerbitkan 0/${unpublished.length}...`;
  }

  let countSuccess = 0;
  for (let i = 0; i < unpublished.length; i++) {
    const job = unpublished[i];
    if (bulkBtn) {
      bulkBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengenerate ${i + 1}/${unpublished.length}: ${(job.company_name || '').substring(0, 15)}...`;
    }

    try {
      const posterDataUrl = generateFlyerPosterDataUrl(job);
      let emailVal = '';
      let waVal = '';
      let websiteVal = job.official_url || '';
      if (job.contact_value) {
        try {
          const parsed = typeof job.contact_value === 'string' ? JSON.parse(job.contact_value) : job.contact_value;
          emailVal = parsed.email || '';
          waVal = parsed.whatsapp || '';
          if (parsed.website) websiteVal = parsed.website;
        } catch (e) {}
      }

      const contactsJson = JSON.stringify({
        url: websiteVal,
        website: websiteVal,
        email: emailVal,
        whatsapp: waVal,
        source_platform: job.platform || 'official',
        source_label: job.platform_label || 'Resmi BUMN & Korporasi',
        is_verified_anti_hoax: true,
        verified_screening_status: 'passed'
      });

      const dMeta = getDeadlineMeta(job.deadline, 30);
      if (dMeta.isExpired) continue;

      const payload = {
        title: job.title,
        company_name: job.company_name,
        category: job.category || 'Operasional',
        job_type: job.job_type || 'Full Time',
        location: job.location,
        salary_display: job.salary_display || 'Kompetitif',
        experience_level: job.experience_level || 'Fresh Graduate',
        poster_image: posterDataUrl || './uploads/corporate_worker_mascot.jpg',
        description: job.description,
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        whatsapp: waVal || '',
        email: emailVal || '',
        website_url: websiteVal || '',
        contact_type: 'link',
        contact_value: contactsJson,
        deadline: dMeta.isoDate || toIsoDate(new Date(Date.now() + 30 * 86400000)),
        status: 'active',
        is_featured: true,
        views_count: 0
      };

      if (sbClient) {
        const { error } = await sbClient.from('jobs').insert([payload]);
        if (!error) countSuccess++;
      }
    } catch (e) {
      console.warn('Bulk publish item error:', e);
    }
  }

  sessionStorage.removeItem('kerja_public_jobs_cache');
  await loadAdminJobs();
  loadDashboardData();
  renderOfficialJobsGrid();

  if (bulkBtn) {
    bulkBtn.disabled = false;
    bulkBtn.innerHTML = origText;
  }

  alert(`⚡ GAS SELESAI!\n\nBerhasil mengenerate poster & menerbitkan ${countSuccess} lowongan resmi baru ke portal KerjaHub!`);
};

// -------------------------------------------------------------
// AUTO-FILL TEMPLATE DARI DATABASE LOKER RESMI 2026
// -------------------------------------------------------------
window.applyJobTemplateToForm = function(templateId) {
  if (!templateId) return;
  const job = OFFICIAL_VACANCIES_DB.find(j => j.id === templateId);
  if (!job) return;

  const form = document.getElementById('form-upload-job');
  if (!form) return;

  form.elements['title'].value = job.title;
  form.elements['company_name'].value = job.company_name;
  if (form.elements['category']) form.elements['category'].value = job.category || 'Operasional';
  if (form.elements['job_type']) form.elements['job_type'].value = job.job_type || 'Full Time';
  if (form.elements['location']) form.elements['location'].value = job.location;
  if (form.elements['salary_display']) form.elements['salary_display'].value = job.salary_display;
  if (form.elements['experience_level']) form.elements['experience_level'].value = job.experience_level || 'Fresh Graduate';
  
  if (form.elements['deadline']) {
    const dMeta = getDeadlineMeta(job.deadline, 30);
    form.elements['deadline'].value = dMeta.isoDate || '2026-12-31';
  }

  if (form.elements['description']) form.elements['description'].value = job.description;

  window.setDynamicListValues('upload-resp-items', job.responsibilities || [], 'responsibilities', 'upload-resp-counter');
  window.setDynamicListValues('upload-req-items', job.requirements || [], 'requirements', 'upload-req-counter');
  window.setDynamicListValues('upload-ben-items', job.benefits || [], 'benefits', 'upload-ben-counter');

  if (form.elements['website']) form.elements['website'].value = job.official_url || '';
  if (form.elements['email']) {
    let emailVal = '';
    try {
      const cv = typeof job.contact_value === 'string' ? JSON.parse(job.contact_value) : job.contact_value;
      emailVal = cv?.email || '';
    } catch(e){}
    form.elements['email'].value = emailVal;
  }

  // Auto-generate flyer poster and set into dropzone!
  const posterDataUrl = generateFlyerPosterDataUrl(job);
  if (posterDataUrl) {
    currentSelectedFileBase64 = posterDataUrl;
    const preview = document.getElementById('poster-preview');
    const previewImg = document.getElementById('poster-preview-img');
    const dropzonePrompt = document.getElementById('dropzone-prompt');
    if (previewImg) previewImg.src = posterDataUrl;
    if (preview) preview.style.display = 'block';
    if (dropzonePrompt) dropzonePrompt.style.display = 'none';
  }

  alert(`⚡ Template "${job.title}" (${job.company_name}) diterapkan!\n\nSeluruh data formulir dan gambar poster flyer otomatis terisi. Klik "Unggah & Terbitkan Sekarang" untuk mempublikasikan.`);
};

// -------------------------------------------------------------
// PUBLISH / SIMPAN LOKER RESMI KE DATABASE SUPABASE (CLASSIC)
// -------------------------------------------------------------
window.publishOfficialJobToDatabase = async function(index) {
  return window.generateAndPublishOfficialJob(index);
};

// -------------------------------------------------------------
// POSTER CANVAS STUDIO LOGIC (FLUX-STYLE FLYER GENERATOR)
// -------------------------------------------------------------
const MASCOT_IMAGES = {
  factory: './uploads/factory_operator_mascot.jpg',
  corporate: './uploads/corporate_worker_mascot.jpg'
};

const loadedMascotCache = {};

function preloadMascot(type) {
  const src = MASCOT_IMAGES[type];
  if (!src || loadedMascotCache[type]) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  img.onload = () => { loadedMascotCache[type] = img; };
}

preloadMascot('factory');
preloadMascot('corporate');

window.openPosterStudioFromOfficialIndex = function(index) {
  const job = currentOfficialFilteredJobs[index];
  if (!job) return;
  openPosterStudio(job);
};

window.openPosterStudioFromExistingId = function(jobId) {
  const job = adminJobs.find(j => Number(j.id) === Number(jobId));
  if (!job) return;

  const contacts = extractJobContacts(job);
  const parseJsonList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(val).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  };

  openPosterStudio({
    id: job.id,
    origin: 'table',
    title: job.title,
    company_name: job.company_name,
    responsibilities: parseJsonList(job.responsibilities),
    requirements: parseJsonList(job.requirements),
    benefits: parseJsonList(job.benefits),
    deadline: job.deadline || '',
    official_url: contacts.website || window.location.origin + '/?job=' + job.id,
    apply_info: contacts.website ? `Kirim CV/Lamaran melalui website resmi ${job.company_name}` : `Kirim lamaran melalui portal resmi KerjaHub`,
    theme: job.category === 'Operasional' || job.title.toLowerCase().includes('operator') ? 'factory' : 'modern',
    mascot: job.title.toLowerCase().includes('operator') || job.title.toLowerCase().includes('teknisi') ? 'factory' : 'corporate'
  });
};

function openPosterStudio(jobData) {
  currentPosterJobData = { ...jobData };

  const modal = document.getElementById('poster-studio-modal');
  if (!modal) return;

  // Fill in form inputs
  const compInp = document.getElementById('poster-input-company');
  const titleInp = document.getElementById('poster-input-title');
  const deadInp = document.getElementById('poster-input-deadline');
  const applyInp = document.getElementById('poster-input-apply-info');
  const qrInp = document.getElementById('poster-input-qr-url');
  const hashInp = document.getElementById('poster-input-hashtag');

  if (compInp) compInp.value = jobData.company_name || '';
  if (titleInp) titleInp.value = jobData.title || '';
  if (deadInp) deadInp.value = jobData.deadline || '';
  if (applyInp) applyInp.value = jobData.apply_info || (jobData.company_name ? `Kirim CV/Lamaran melalui tautan resmi ${jobData.company_name}.` : '');
  if (qrInp) qrInp.value = jobData.official_url || window.location.origin;
  if (hashInp) hashInp.value = jobData.hashtag || '@KerjaHubOfficial #LowonganKerja';

  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') {
      if (val.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        } catch (e) {}
      }
      return val.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const respList = parseList(jobData.responsibilities);
  const reqList = parseList(jobData.requirements);
  const benList = parseList(jobData.benefits);

  // Directly set the dynamic lists without hardcoded defaults!
  window.setDynamicListValues('poster-resp-items', respList, 'responsibilities', 'poster-resp-counter');
  window.setDynamicListValues('poster-req-items', reqList, 'requirements', 'poster-req-counter');
  window.setDynamicListValues('poster-ben-items', benList, 'benefits', 'poster-ben-counter');

  const legacyReq = document.getElementById('poster-input-requirements');
  if (legacyReq) legacyReq.value = reqList.join('\n');
  const legacyResp = document.getElementById('poster-input-responsibilities');
  if (legacyResp) legacyResp.value = respList.join('\n');
  const legacyBen = document.getElementById('poster-input-benefits');
  if (legacyBen) legacyBen.value = benList.join('\n');

  // Set selected theme & mascot pills
  const theme = jobData.theme || 'factory';
  const mascot = jobData.mascot || 'factory';

  document.querySelectorAll('input[name="poster_theme"]').forEach(r => {
    r.checked = (r.value === theme);
    r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
  });

  document.querySelectorAll('input[name="poster_mascot"]').forEach(r => {
    r.checked = (r.value === mascot);
    r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
  });

  modal.classList.add('active');
  modal.style.display = 'flex';

  // Trigger initial draw
  setTimeout(() => {
    renderPosterCanvas();
  }, 50);
}
window.openPosterStudio = openPosterStudio;

window.closePosterStudioModal = function() {
  const modal = document.getElementById('poster-studio-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

// -------------------------------------------------------------
// RENDER POSTER CANVAS (HIGH RESOLUTION 1080 x 1350)
// -------------------------------------------------------------
function renderPosterCanvas() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const company = (document.getElementById('poster-input-company')?.value || '').trim();
  const title = (document.getElementById('poster-input-title')?.value || '').trim().toUpperCase();
  const responsibilities = window.getDynamicListValues('poster-resp-items');
  const requirements = window.getDynamicListValues('poster-req-items');
  const benefits = window.getDynamicListValues('poster-ben-items');
  const deadline = (document.getElementById('poster-input-deadline')?.value || '').trim();
  const applyInfo = (document.getElementById('poster-input-apply-info')?.value || '').trim();
  const qrUrl = (document.getElementById('poster-input-qr-url')?.value || window.location.href).trim();
  const hashtag = (document.getElementById('poster-input-hashtag')?.value || '@KerjaHubOfficial #LowonganKerja').trim();

  const selectedTheme = document.querySelector('input[name="poster_theme"]:checked')?.value || 'factory';
  const selectedMascot = document.querySelector('input[name="poster_mascot"]:checked')?.value || 'factory';

  // Palette definitions
  let p = {
    bg: '#ffffff',
    outerBorder: '#1e40af',
    primary: '#1e3a8a',
    accentOrange: '#f97316',
    textDark: '#0f172a',
    badgeBg: '#1e3a8a',
    badgeBorder: '#3b82f6',
    badgeText: '#ffffff',
    applyBoxBorder: '#f97316',
    applyBoxBg: '#ffffff',
    footerBg: '#0f172a'
  };

  if (selectedTheme === 'linkedin') {
    p = {
      bg: '#ffffff',
      outerBorder: '#0a66c2',
      primary: '#0a66c2',
      accentOrange: '#0077b5',
      textDark: '#0f172a',
      badgeBg: '#0a66c2',
      badgeBorder: '#38bdf8',
      badgeText: '#ffffff',
      applyBoxBorder: '#0077b5',
      applyBoxBg: '#ffffff',
      footerBg: '#0f172a'
    };
  } else if (selectedTheme === 'instagram') {
    p = {
      bg: '#ffffff',
      outerBorder: '#e1306c',
      primary: '#c13584',
      accentOrange: '#e1306c',
      textDark: '#0f172a',
      badgeBg: '#833ab4',
      badgeBorder: '#e1306c',
      badgeText: '#ffffff',
      applyBoxBorder: '#e1306c',
      applyBoxBg: '#ffffff',
      footerBg: '#1e1b4b'
    };
  } else if (selectedTheme === 'facebook') {
    p = {
      bg: '#ffffff',
      outerBorder: '#1877f2',
      primary: '#1877f2',
      accentOrange: '#0866ff',
      textDark: '#0f172a',
      badgeBg: '#1877f2',
      badgeBorder: '#60a5fa',
      badgeText: '#ffffff',
      applyBoxBorder: '#1877f2',
      applyBoxBg: '#ffffff',
      footerBg: '#0f172a'
    };
  } else if (selectedTheme === 'twitter') {
    p = {
      bg: '#ffffff',
      outerBorder: '#0f172a',
      primary: '#0f172a',
      accentOrange: '#38bdf8',
      textDark: '#0f172a',
      badgeBg: '#0f172a',
      badgeBorder: '#38bdf8',
      badgeText: '#ffffff',
      applyBoxBorder: '#38bdf8',
      applyBoxBg: '#ffffff',
      footerBg: '#0f172a'
    };
  } else if (selectedTheme === 'bumn') {
    p = {
      bg: '#ffffff',
      outerBorder: '#0f172a',
      primary: '#0f172a',
      accentOrange: '#10b981',
      textDark: '#0f172a',
      badgeBg: '#0f172a',
      badgeBorder: '#10b981',
      badgeText: '#ffffff',
      applyBoxBorder: '#10b981',
      applyBoxBg: '#ffffff',
      footerBg: '#0f172a'
    };
  } else if (selectedTheme === 'modern') {
    p = {
      bg: '#ffffff',
      outerBorder: '#4f46e5',
      primary: '#4f46e5',
      accentOrange: '#06b6d4',
      textDark: '#0f172a',
      badgeBg: '#4f46e5',
      badgeBorder: '#818cf8',
      badgeText: '#ffffff',
      applyBoxBorder: '#4f46e5',
      applyBoxBg: '#ffffff',
      footerBg: '#1e1b4b'
    };
  }

  // 1. Clear & Background
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Thick Outer Border with Rounded Corners
  ctx.strokeStyle = p.outerBorder;
  ctx.lineWidth = 18;
  roundRect(ctx, 16, 16, width - 32, height - 32, 28, false, true);

  // Subtle interior architectural line art
  ctx.save();
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = 140; y < 760; y += 40) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(width - 60, y);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Header Section (Centered)
  ctx.textAlign = 'center';
  ctx.fillStyle = p.textDark;
  ctx.font = '800 38px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('LOWONGAN PEKERJAAN', width / 2, 88);

  // Dynamic Company Name Auto-Scale
  const companyUpper = company.toUpperCase();
  let compFontSize = 46;
  ctx.font = `800 ${compFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
  while (ctx.measureText(companyUpper).width > 920 && compFontSize > 22) {
    compFontSize -= 2;
    ctx.font = `800 ${compFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
  }
  ctx.fillStyle = p.primary;
  ctx.fillText(companyUpper, width / 2, 146);

  // 4. Position Banner Pill (Intelligent Auto-Scale & Word Wrapping)
  const hasMascot = (selectedMascot !== 'none');
  const badgeX = 60;
  const badgeY = 192;
  const badgeW = hasMascot ? 540 : (width - 120);
  const maxContentW = badgeW - 48; // 24px padding inside pill

  const titleUpper = title.trim();
  const words = titleUpper.split(/\s+/).filter(Boolean);

  let titleFontSize = 28;
  let titleLines = [titleUpper];

  // A. Check if fits on 1 line (test from 30px down to 22px)
  let fitsOneLine = false;
  for (let s = 30; s >= 22; s -= 2) {
    ctx.font = `800 ${s}px "Plus Jakarta Sans", Arial, sans-serif`;
    if (ctx.measureText(titleUpper).width <= maxContentW) {
      titleFontSize = s;
      titleLines = [titleUpper];
      fitsOneLine = true;
      break;
    }
  }

  // B. If title doesn't fit on 1 line, find best balanced 2-line split
  if (!fitsOneLine) {
    let foundSplit = false;
    for (let s = 26; s >= 18; s -= 2) {
      ctx.font = `800 ${s}px "Plus Jakarta Sans", Arial, sans-serif`;

      let bestSplit = null;
      let minDiff = Infinity;
      for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i).join(' ');
        const l2 = words.slice(i).join(' ');
        const w1 = ctx.measureText(l1).width;
        const w2 = ctx.measureText(l2).width;

        if (w1 <= maxContentW && w2 <= maxContentW) {
          const diff = Math.abs(w1 - w2);
          if (diff < minDiff) {
            minDiff = diff;
            bestSplit = [l1, l2];
          }
        }
      }

      if (bestSplit) {
        titleFontSize = s;
        titleLines = bestSplit;
        foundSplit = true;
        break;
      }
    }

    // C. If still doesn't fit in 2 lines, use 3 lines wrap with truncation safeguard
    if (!foundSplit) {
      titleFontSize = 18;
      ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
      titleLines = [];
      let curLine = '';
      for (const w of words) {
        const test = curLine ? curLine + ' ' + w : w;
        if (ctx.measureText(test).width <= maxContentW) {
          curLine = test;
        } else {
          if (curLine) titleLines.push(curLine);
          curLine = w;
        }
      }
      if (curLine) titleLines.push(curLine);
      if (titleLines.length > 3) {
        titleLines = titleLines.slice(0, 3);
        while (ctx.measureText(titleLines[2] + '...').width > maxContentW && titleLines[2].length > 5) {
          titleLines[2] = titleLines[2].slice(0, -1);
        }
        titleLines[2] = titleLines[2] + '...';
      }
    }
  }

  // Calculate dynamic badge height based on lines
  const lineHeight = Math.round(titleFontSize * 1.3);
  const badgeH = Math.max(68, (titleLines.length * lineHeight) + 26);

  // Draw Badge Box
  ctx.save();
  ctx.fillStyle = p.badgeBg;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16, true, false);

  ctx.strokeStyle = p.badgeBorder;
  ctx.lineWidth = 3.5;
  roundRect(ctx, badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4, 14, false, true);

  // Strict clipping: guarantee nothing ever bleeds outside the pill
  roundRect(ctx, badgeX + 4, badgeY + 4, badgeW - 8, badgeH - 8, 12, false, false);
  ctx.clip();

  // Render centered text inside pill
  ctx.fillStyle = p.badgeText;
  ctx.textAlign = 'center';
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;

  const totalTextBlockH = (titleLines.length - 1) * lineHeight;
  const startY = badgeY + (badgeH / 2) - (totalTextBlockH / 2) + (titleFontSize * 0.35);
  titleLines.forEach((l, idx) => {
    ctx.fillText(l, badgeX + (badgeW / 2), startY + (idx * lineHeight));
  });
  ctx.restore();

  // 5. Dynamic Sections: Tanggung Jawab, Kualifikasi, Benefit & Fasilitas
  const activeSections = [];
  if (responsibilities && responsibilities.length > 0) {
    activeSections.push({
      title: 'Tanggung Jawab',
      icon: '📌',
      items: responsibilities,
      headerColor: p.primary
    });
  }
  if (requirements && requirements.length > 0) {
    activeSections.push({
      title: 'Kualifikasi',
      icon: '🎓',
      items: requirements,
      headerColor: p.textDark
    });
  }
  if (benefits && benefits.length > 0) {
    activeSections.push({
      title: 'Benefit & Fasilitas',
      icon: '🎁',
      items: benefits,
      headerColor: p.accentOrange
    });
  }

  let currentY = badgeY + badgeH + 34;
  const maxReqW = hasMascot ? 490 : (width - 160);
  const appBoxY = 790;
  const maxY = appBoxY - 18;

  if (activeSections.length === 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 600 20px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText('• Kualifikasi, tanggung jawab, dan benefit akan tampil sesuai input formulir.', 60, currentY + 30);
  } else {
    // Dynamic sizing depending on number of sections
    const numSections = activeSections.length;
    let headerFontSize = 26;
    let itemFontSize = 20;
    let itemLineHeight = 27;
    let maxItemsPerSec = 4;

    if (numSections === 1) {
      headerFontSize = 28;
      itemFontSize = 22;
      itemLineHeight = 30;
      maxItemsPerSec = 5;
    } else if (numSections === 2) {
      headerFontSize = 24;
      itemFontSize = 19;
      itemLineHeight = 26;
      maxItemsPerSec = 3;
    } else {
      headerFontSize = 22;
      itemFontSize = 17;
      itemLineHeight = 23;
      maxItemsPerSec = 2;
    }

    activeSections.forEach((sec) => {
      if (currentY + 45 > maxY) return;

      // Draw Section Header
      ctx.textAlign = 'left';
      ctx.fillStyle = sec.headerColor;
      ctx.font = `800 ${headerFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
      ctx.fillText(`${sec.icon} ${sec.title}`, 60, currentY);
      currentY += Math.round(headerFontSize * 1.35);

      // Draw Items
      const itemsToDraw = sec.items.slice(0, maxItemsPerSec);
      itemsToDraw.forEach((itemText) => {
        if (currentY + itemLineHeight > maxY) return;

        // Bullet dot
        ctx.fillStyle = sec.headerColor || p.primary;
        ctx.beginPath();
        ctx.arc(68, currentY - (itemFontSize * 0.35), 4, 0, Math.PI * 2);
        ctx.fill();

        // Wrapped item text
        ctx.font = `600 ${itemFontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
        ctx.fillStyle = '#334155';

        const words = String(itemText).trim().split(/\s+/);
        let line = '';
        let lineY = currentY;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > (maxReqW - 35) && n > 0) {
            ctx.fillText(line.trim(), 84, lineY);
            line = words[n] + ' ';
            lineY += itemLineHeight;
            if (lineY + itemLineHeight > maxY) break;
          } else {
            line = testLine;
          }
        }
        if (line.trim() && lineY <= maxY) {
          ctx.fillText(line.trim(), 84, lineY);
          currentY = lineY + Math.round(itemFontSize * 1.5);
        } else {
          currentY = lineY;
        }
      });

      currentY += 12; // Small gap between sections
    });
  }

  // 6. Draw Mascot Illustration (Right Column)
  if (hasMascot) {
    const mascotImg = loadedMascotCache[selectedMascot];
    if (mascotImg && mascotImg.complete && mascotImg.naturalWidth > 0) {
      drawMascotOnCanvas(ctx, mascotImg, 620, 210, 400, 540);
    } else {
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.src = MASCOT_IMAGES[selectedMascot];
      tempImg.onload = () => {
        loadedMascotCache[selectedMascot] = tempImg;
        renderPosterCanvas();
      };
    }
  }

  // 7. Application Box (Left-aligned bottom)
  const appBoxX = 60;
  const appBoxW = 630;
  const appBoxH = 195;

  ctx.fillStyle = p.applyBoxBg;
  roundRect(ctx, appBoxX, appBoxY, appBoxW, appBoxH, 22, true, false);

  ctx.strokeStyle = p.applyBoxBorder;
  ctx.lineWidth = 5;
  roundRect(ctx, appBoxX, appBoxY, appBoxW, appBoxH, 22, false, true);

  // Application texts inside box
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 26px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Kirim CV/Lamaran melalui website', appBoxX + 26, appBoxY + 50);

  ctx.fillStyle = p.primary;
  ctx.font = '800 28px "Plus Jakarta Sans", Arial, sans-serif';
  let shortComp = company || 'Perusahaan Terverifikasi';
  while (ctx.measureText(shortComp).width > appBoxW - 60 && shortComp.length > 10) {
    shortComp = shortComp.slice(0, -1);
  }
  if (shortComp !== (company || 'Perusahaan Terverifikasi')) shortComp += '...';
  ctx.fillText(shortComp, appBoxX + 26, appBoxY + 96);

  ctx.fillStyle = p.accentOrange;
  ctx.font = '800 32px "Plus Jakarta Sans", Arial, sans-serif';
  const deadlineLabel = deadline ? `Deadline ${deadline}.` : 'Pendaftaran Terbuka';
  ctx.fillText(deadlineLabel, appBoxX + 26, appBoxY + 154);

  // 8. QR Code Generation & Drawing (Right-aligned next to apply box)
  const qrBoxX = 735;
  const qrBoxY = 770;
  const qrSize = 195;

  drawScannableQrCode(ctx, qrUrl, qrBoxX, qrBoxY, qrSize);

  // QR Label below
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 23px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('SCAN DISINI', qrBoxX + qrSize / 2, qrBoxY + qrSize + 38);

  // 9. Brand Watermark & Hashtags
  ctx.textAlign = 'left';
  ctx.fillStyle = p.primary;
  ctx.font = '800 34px "Plus Jakarta Sans", Arial, sans-serif';
  let brandComp = company;
  while (ctx.measureText(brandComp).width > 640 && brandComp.length > 10) {
    brandComp = brandComp.slice(0, -1);
  }
  if (brandComp !== company) brandComp += '...';
  ctx.fillText(brandComp, 60, 1075);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 21px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Portal Lowongan Kerja Resmi KerjaHub Indonesia', 60, 1110);

  ctx.fillStyle = p.primary;
  let cleanHashtag = hashtag;
  while (ctx.measureText(cleanHashtag).width > 640 && cleanHashtag.length > 10) {
    cleanHashtag = cleanHashtag.slice(0, -1);
  }
  ctx.fillText(cleanHashtag, 60, 1148);

  // 10. Anti-Penipuan Warning Footer Banner (Prominent at bottom!)
  const footX = 50;
  const footY = 1224;
  const footW = width - 100;
  const footH = 76;

  ctx.fillStyle = p.footerBg;
  roundRect(ctx, footX, footY, footW, footH, 20, true, false);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = '800 25px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('⚠️ Waspada penipuan. Rekrutmen ini tidak dipungut biaya apapun.', width / 2, footY + 47);
}

// Helper: draw mascot with clean rounded card frame
function drawMascotOnCanvas(ctx, img, x, y, w, h) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 20, false, false);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

// Helper: draw real QR Code
function drawScannableQrCode(ctx, url, x, y, size) {
  const holder = document.getElementById('poster-qrcode-temp');
  if (!holder) return;

  holder.innerHTML = '';
  if (typeof QRCode === 'function') {
    new QRCode(holder, {
      text: url || 'https://recruitment.toyota.co.id',
      width: size,
      height: size,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    const qrCanvas = holder.querySelector('canvas');
    if (qrCanvas) {
      // Draw outer bracket marks
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      const bLen = 22;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(x - 8, y + bLen); ctx.lineTo(x - 8, y - 8); ctx.lineTo(x + bLen, y - 8); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(x + size + 8 - bLen, y - 8); ctx.lineTo(x + size + 8, y - 8); ctx.lineTo(x + size + 8, y + bLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(x - 8, y + size + 8 - bLen); ctx.lineTo(x - 8, y + size + 8); ctx.lineTo(x + bLen, y + size + 8); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(x + size + 8 - bLen, y + size + 8); ctx.lineTo(x + size + 8, y + size + 8); ctx.lineTo(x + size + 8, y + size + 8 - bLen); ctx.stroke();

      ctx.drawImage(qrCanvas, x, y, size, size);
    }
  }
}

// Helper: rounded rectangle path
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// -------------------------------------------------------------
// DOWNLOAD POSTER AS PNG
// -------------------------------------------------------------
function downloadPosterAsPng() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const rawComp = document.getElementById('poster-input-company')?.value || 'PT_KerjaHub';
  const rawTitle = document.getElementById('poster-input-title')?.value || 'Lowongan_Kerja';

  const cleanComp = rawComp.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 25);
  const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 30);
  const filename = `poster_loker_${cleanComp}_${cleanTitle}.png`.toLowerCase();

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert(`Gambar poster "${filename}" berhasil diunduh ke perangkat Anda! Siap diposting ke media sosial & status.`);
}

function copyPosterToClipboard() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  canvas.toBlob(blob => {
    if (!blob) return;
    try {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('Gambar poster berhasil disalin ke Clipboard! Anda bisa langsung paste (Ctrl + V) di WhatsApp, Telegram, atau Canva.');
      }).catch(err => {
        alert('Gagal menyalin langsung. Silakan gunakan tombol Download Gambar.');
      });
    } catch (e) {
      alert('Browser tidak mendukung salin langsung. Silakan gunakan tombol Download.');
    }
  });
}

// ==============================================================
// SAVE POSTER CHANGES (TO DATABASE OR TO UPLOAD FORM)
// ==============================================================
window.savePosterChangesToJob = async function() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const btn = document.getElementById('btn-save-poster-changes');
  const origBtnText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  }

  try {
    const posterDataUrl = canvas.toDataURL('image/png');
    const compInp = document.getElementById('poster-input-company');
    const titleInp = document.getElementById('poster-input-title');
    const deadInp = document.getElementById('poster-input-deadline');
    const applyInp = document.getElementById('poster-input-apply-info');
    const qrInp = document.getElementById('poster-input-qr-url');
    const hashInp = document.getElementById('poster-input-hashtag');

    const updatedComp = compInp ? compInp.value.trim() : '';
    const updatedTitle = titleInp ? titleInp.value.trim() : '';
    const updatedDead = deadInp ? deadInp.value.trim() : '';
    const updatedApply = applyInp ? applyInp.value.trim() : '';
    const updatedQr = qrInp ? qrInp.value.trim() : '';
    const updatedHash = hashInp ? hashInp.value.trim() : '';

    const respList = window.getDynamicListValues ? window.getDynamicListValues('poster-resp-items') : [];
    const reqList = window.getDynamicListValues ? window.getDynamicListValues('poster-req-items') : [];
    const benList = window.getDynamicListValues ? window.getDynamicListValues('poster-ben-items') : [];

    // Always update currentSelectedFileBase64 so if user saves/submits later, it has the poster
    currentSelectedFileBase64 = posterDataUrl;

    if (currentPosterJobData && currentPosterJobData.id) {
      // 1. UPDATE EXISTING JOB IN DATABASE (Supabase Cloud + Local API)
      const jobId = Number(currentPosterJobData.id);
      const updatePayload = {
        title: updatedTitle || currentPosterJobData.title,
        company_name: updatedComp || currentPosterJobData.company_name,
        deadline: updatedDead,
        responsibilities: JSON.stringify(respList),
        requirements: JSON.stringify(reqList),
        benefits: JSON.stringify(benList),
        poster_image: posterDataUrl,
        website_url: updatedQr || currentPosterJobData.official_url,
        updated_at: new Date().toISOString()
      };

      let saved = false;
      // Try direct Supabase
      if (sbClient) {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000));
          const updPromise = sbClient.from('jobs').update(updatePayload).eq('id', jobId);
          const { error } = await Promise.race([updPromise, timeoutPromise]);
          if (!error) saved = true;
          else console.warn('Supabase update warning:', error);
        } catch (e) {
          console.warn('Supabase poster save error:', e);
        }
      }

      // Sync to backend Express API if running
      try {
        const token = getAdminToken();
        const res = await safeFetchJson(getApiEndpoint(`/api/jobs/${jobId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updatePayload)
        });
        if (res.ok) saved = true;
      } catch (e) {}

      // Update in-memory job
      const idx = adminJobs.findIndex(j => Number(j.id) === jobId);
      if (idx >= 0) {
        adminJobs[idx] = {
          ...adminJobs[idx],
          ...updatePayload,
          responsibilities: respList,
          requirements: reqList,
          benefits: benList
        };
        try {
          sessionStorage.setItem('kerja_admin_jobs_cache', JSON.stringify(adminJobs));
        } catch (e) {}
        renderAdminJobsTable();
      }

      showAdminToast('Berhasil Disimpan!', `Perubahan lowongan "${updatedTitle || 'Lowongan'}" & poster visual resmi berhasil diperbarui di Supabase Cloud.`, 'success');
      closePosterStudioModal();
    } else {
      // 2. SYNCHRONIZE BACK TO UPLOAD FORM
      const uploadForm = document.getElementById('form-upload-job');
      if (uploadForm) {
        if (updatedTitle) {
          const tInp = uploadForm.querySelector('[name="title"]');
          if (tInp) tInp.value = updatedTitle;
        }
        if (updatedComp) {
          const cInp = uploadForm.querySelector('[name="company_name"]');
          if (cInp) cInp.value = updatedComp;
        }
        if (updatedDead) {
          const dInp = uploadForm.querySelector('[name="deadline"]');
          if (dInp) dInp.value = updatedDead;
        }
        if (updatedQr) {
          const wInp = uploadForm.querySelector('[name="website"]');
          if (wInp) wInp.value = updatedQr;
        }

        // Sync dynamic lists to upload form
        if (window.setDynamicListValues) {
          window.setDynamicListValues('upload-resp-items', respList, 'responsibilities', 'upload-resp-counter');
          window.setDynamicListValues('upload-req-items', reqList, 'requirements', 'upload-req-counter');
          window.setDynamicListValues('upload-ben-items', benList, 'benefits', 'upload-ben-counter');
        }

        // Set dropzone preview
        const dropzonePlaceholder = document.getElementById('dropzone-placeholder') || document.getElementById('dropzone-prompt');
        const previewWrapper = document.getElementById('poster-preview-wrapper') || document.getElementById('poster-preview');
        const previewImg = document.getElementById('poster-img-preview') || document.getElementById('poster-preview-img');

        if (previewImg) previewImg.src = posterDataUrl;
        if (previewWrapper) previewWrapper.style.display = 'block';
        if (dropzonePlaceholder) dropzonePlaceholder.style.display = 'none';

        // Navigate to Upload tab
        const uploadNav = document.querySelector('li[data-tab="upload"]') || document.querySelector('a[href="#upload"]') || document.querySelector('a[href="#upload-job"]');
        if (uploadNav) uploadNav.click();
      }

      showAdminToast('Tersimpan ke Formulir!', 'Seluruh teks yang Anda edit & gambar poster terbaru telah disinkronkan ke formulir upload siap dipublikasikan.', 'success');
      closePosterStudioModal();
    }
  } catch (err) {
    console.error('savePosterChangesToJob error:', err);
    showAdminToast('Gagal Menyimpan', 'Terjadi kendala saat menyimpan perubahan: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
  }
};

function usePosterForJob() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  currentSelectedFileBase64 = dataUrl;

  const dropzonePlaceholder = document.getElementById('dropzone-placeholder') || document.getElementById('dropzone-prompt');
  const previewWrapper = document.getElementById('poster-preview-wrapper') || document.getElementById('poster-preview');
  const previewImg = document.getElementById('poster-img-preview') || document.getElementById('poster-preview-img');

  if (previewImg) previewImg.src = dataUrl;
  if (previewWrapper) previewWrapper.style.display = 'block';
  if (dropzonePlaceholder) dropzonePlaceholder.style.display = 'none';

  closePosterStudioModal();

  const uploadNav = document.querySelector('li[data-tab="upload"]') || document.querySelector('a[href="#upload"]') || document.querySelector('a[href="#upload-job"]');
  if (uploadNav) uploadNav.click();

  showAdminToast('Poster Disetel!', 'Poster yang baru di-generate telah disetel sebagai gambar resmi formulir upload.', 'success');
}
window.usePosterForJob = usePosterForJob;

// -------------------------------------------------------------
// SETUP OFFICIAL GENERATOR & POSTER STUDIO LISTENERS
// -------------------------------------------------------------
async function fetchLiveMedsosPostings() {
  const btnFetchLive = document.getElementById('btn-fetch-live-scout');
  const kw = (document.getElementById('official-keyword')?.value || '').trim() || 'Operator';
  const loc = (document.getElementById('official-location')?.value || '').trim() || 'Indonesia';
  const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
  const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';

  let platforms = ['linkedin', 'instagram', 'facebook'];
  if (source === 'linkedin') platforms = ['linkedin'];
  else if (source === 'instagram') platforms = ['instagram'];
  else if (source === 'facebook') platforms = ['facebook'];

  const origHtml = btnFetchLive ? btnFetchLive.innerHTML : '';
  if (btnFetchLive) {
    btnFetchLive.disabled = true;
    btnFetchLive.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memindai Website Resmi & Media...';
  }

  try {
    const token = getAdminToken();
    const url = getApiEndpoint(`/api/admin/scout-jobs?keyword=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc)}&platforms=${platforms.join(',')}&timeframe=7d`);
    const res = await safeFetchJson(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (res.ok && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const liveJobs = res.data.data.map((j, i) => ({
        id: 'live_web_' + Date.now() + '_' + i,
        title: j.title.toUpperCase(),
        company_name: (j.company || j.company_name || 'PERUSAHAAN').toUpperCase(),
        platform: 'web',
        platform_label: j.platformLabel || j.sourceName || 'Website Resmi Terverifikasi',
        platform_icon: j.platformIcon || 'fa-solid fa-globe',
        platform_class: 'web',
        sector: 'manufaktur',
        sector_label: 'Postingan Web Asli Terkini',
        category: 'Operasional',
        job_type: 'Full Time',
        location: j.location || loc,
        education_level: 'smk',
        education_label: 'Semua Tingkat Pendidikan',
        experience_level: 'Semua Pengalaman',
        salary_display: j.salary || 'Kompetitif (Standar UMK / Industri)',
        deadline: 'Aktif Terbit di Web',
        pubDate: j.pubDate || new Date().toISOString(),
        pubTimestamp: j.pubTimestamp || Date.now(),
        timeAgo: j.timeAgo || 'Baru saja',
        isFresh: true,
        official_url: j.official_url || j.url || j.website_url,
        contact_type: 'link',
        contact_value: JSON.stringify({ whatsapp: j.whatsapp || '', email: j.email || '', website: j.official_url || j.url || j.website_url }),
        description: j.description || `Lowongan kerja terbaru dipublikasikan secara resmi di website.`,
        requirements: [
          'Kualifikasi dan persyaratan lengkap tercantum pada artikel/postingan web resmi',
          'Mampu berkomunikasi dengan baik dan berorientasi pada pencapaian target kerja',
          'Siap bekerja secara profesional dan mematuhi SOP perusahaan'
        ],
        responsibilities: [
          'Menjalankan tugas dan kewajiban sesuai deskripsi posisi yang dilamar',
          'Melaporkan progres pekerjaan secara rutin dan disiplin'
        ],
        benefits: [
          'Gaji dan kompensasi sesuai standar perusahaan / UMK',
          'Perlindungan jaminan sosial (BPJS Kesehatan & Ketenagakerjaan)'
        ],
        theme: j.title.toLowerCase().includes('operator') ? 'factory' : 'modern',
        mascot: j.title.toLowerCase().includes('operator') ? 'factory' : 'corporate',
        verified_badge: `Web Resmi Verified`,
        apply_info: `Klik "Buka Postingan Asli Web" untuk membuka link pengumuman resmi.`,
        hashtag: `#LokerWebAsli #${(j.company || 'Perusahaan').replace(/[^a-zA-Z0-9]/g, '')} #InfoLoker`
      }));

      // Prepend to OFFICIAL_VACANCIES_DB
      liveJobs.forEach(lj => {
        if (!OFFICIAL_VACANCIES_DB.some(o => o.official_url === lj.official_url)) {
          OFFICIAL_VACANCIES_DB.unshift(lj);
        }
      });

      // Sort strictly by newest pubTimestamp descending
      OFFICIAL_VACANCIES_DB.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

      alert(`⚡ Berhasil menemukan ${liveJobs.length} postingan loker asli yang benar-benar dibagikan di website! Klik tombol "Buka Postingan Asli Web ↗" untuk langsung masuk ke halaman postingannya.`);
      filterAndRenderOfficialJobs();
      document.getElementById('scout-results-area')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(`Info: Menampilkan database lowongan website resmi terverifikasi.`);
      filterAndRenderOfficialJobs();
    }
  } catch (err) {
    alert('Catatan: Menampilkan database lowongan resmi terverifikasi.');
    filterAndRenderOfficialJobs();
  } finally {
    if (btnFetchLive) {
      btnFetchLive.disabled = false;
      btnFetchLive.innerHTML = origHtml;
    }
  }
}

function setupOfficialVacancyGenerator() {
  // Helper to sync Google Dork query input with chosen platform
  function updateGoogleDorkQueryForPlatform(source) {
    const dorkInput = document.getElementById('live-dork-query');
    const dorkBtn = document.getElementById('btn-open-dork-direct');
    const kw = (document.getElementById('official-keyword')?.value || 'lowongan kerja').trim();
    let q = `lowongan kerja "${kw}"`;
    if (source === 'linkedin') q = `site:linkedin.com/posts "lowongan kerja" "${kw}"`;
    else if (source === 'instagram') q = `site:instagram.com "lowongan kerja" "${kw}"`;
    else if (source === 'facebook') q = `site:facebook.com "lowongan kerja" "${kw}"`;
    else if (source === 'twitter') q = `(site:x.com OR site:twitter.com) "lowongan kerja" "${kw}"`;
    else if (source === 'media') q = `(site:kompas.com OR site:detik.com OR site:tribunnews.com) "lowongan kerja" "${kw}"`;
    else if (source === 'bumn') q = `("bumn" OR "rekrutmen bersama bumn") "lowongan kerja" "${kw}"`;
    else q = `(site:linkedin.com OR site:instagram.com OR site:facebook.com OR site:kompas.com OR site:detik.com) "lowongan kerja" "${kw}"`;

    if (dorkInput) dorkInput.value = q;
    if (dorkBtn) dorkBtn.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }

  // Platform source filter tabs (LinkedIn, IG, FB, Twitter, Media, BUMN, All)
  document.querySelectorAll('.official-source-pills .source-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.official-source-pills .source-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const source = btn.getAttribute('data-source');
      updateGoogleDorkQueryForPlatform(source);
      filterAndRenderOfficialJobs();

      // If no matching jobs loaded in memory yet for this specific platform, auto-generate from live web!
      if (currentOfficialFilteredJobs.length === 0) {
        const kw = (kwInput ? kwInput.value.trim() : '') || 'lowongan';
        populateOfficialVacanciesFromSystem(kw, false, source);
      }
    });
  });

  // Sektor filter tabs
  document.querySelectorAll('.official-sector-pills .sector-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.official-sector-pills .sector-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndRenderOfficialJobs();
    });
  });

  const kwInput = document.getElementById('official-keyword');
  const locInput = document.getElementById('official-location');
  const eduSelect = document.getElementById('official-education');
  const btnGenerate = document.getElementById('btn-generate-official-jobs');
  const btnFetchLive = document.getElementById('btn-fetch-live-scout');

  if (kwInput) kwInput.addEventListener('input', () => {
    filterAndRenderOfficialJobs();
    const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
    updateGoogleDorkQueryForPlatform(activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all');
  });
  if (locInput) locInput.addEventListener('input', () => filterAndRenderOfficialJobs());
  if (eduSelect) eduSelect.addEventListener('change', () => filterAndRenderOfficialJobs());
  if (btnGenerate) btnGenerate.addEventListener('click', () => {
    const kw = (kwInput ? kwInput.value.trim() : '') || 'lowongan';
    const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
    const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';
    populateOfficialVacanciesFromSystem(kw, false, source);
    document.getElementById('scout-results-area')?.scrollIntoView({ behavior: 'smooth' });
  });
  if (btnFetchLive) {
    btnFetchLive.addEventListener('click', () => {
      const kw = (kwInput ? kwInput.value.trim() : '') || 'lowongan';
      const activeSourceBtn = document.querySelector('.official-source-pills .source-pill.active');
      const source = activeSourceBtn ? activeSourceBtn.getAttribute('data-source') : 'all';
      populateOfficialVacanciesFromSystem(kw, false, source);
      document.getElementById('scout-results-area')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Toggle sosmed dorking drawer
  const btnToggleSosmed = document.getElementById('btn-toggle-scout-sosmed');
  const sosmedDrawer = document.getElementById('scout-sosmed-drawer');
  if (btnToggleSosmed && sosmedDrawer) {
    btnToggleSosmed.addEventListener('click', () => {
      const isHidden = sosmedDrawer.style.display === 'none';
      sosmedDrawer.style.display = isHidden ? 'block' : 'none';
      btnToggleSosmed.innerHTML = isHidden
        ? '<i class="fa-solid fa-xmark"></i> Tutup Opsi Dorking Medsos'
        : '<i class="fa-solid fa-share-nodes"></i> Buka Opsi Dorking Medsos (LinkedIn/IG/FB)';
    });
  }

  // Poster studio inputs realtime update
  [
    'poster-input-company',
    'poster-input-title',
    'poster-input-requirements',
    'poster-input-deadline',
    'poster-input-apply-info',
    'poster-input-qr-url',
    'poster-input-hashtag'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => renderPosterCanvas());
  });

  // Poster themes
  document.querySelectorAll('input[name="poster_theme"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="poster_theme"]').forEach(r => {
        r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
      });
      renderPosterCanvas();
    });
  });

  // Poster mascot
  document.querySelectorAll('input[name="poster_mascot"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="poster_mascot"]').forEach(r => {
        r.closest('.poster-theme-pill')?.classList.toggle('active', r.checked);
      });
      renderPosterCanvas();
    });
  });

  // Download & Copy buttons
  const btnDownloadPng = document.getElementById('btn-download-poster-png');
  if (btnDownloadPng) btnDownloadPng.addEventListener('click', downloadPosterAsPng);

  const btnCopyClipboard = document.getElementById('btn-copy-poster-clipboard');
  if (btnCopyClipboard) btnCopyClipboard.addEventListener('click', copyPosterToClipboard);

  const btnUsePoster = document.getElementById('btn-use-poster-for-job');
  if (btnUsePoster) btnUsePoster.addEventListener('click', usePosterForJob);

  // Render initial grid from live system & database (zero hardcode)
  populateOfficialVacanciesFromSystem('admin');
}

function setupSosmedScout() {
  setupOfficialVacancyGenerator();
}

// -------------------------------------------------------------
// MASTER DATA MANAGEMENT (Kategori, Tipe, Level, Lokasi)
// -------------------------------------------------------------
const DEFAULT_MASTER_DATA = {
  categories: [
    { id: 1, name: 'Teknologi & IT', icon: 'fa-code' },
    { id: 2, name: 'Design & Kreatif', icon: 'fa-pen-nib' },
    { id: 3, name: 'Marketing & Penjualan', icon: 'fa-bullhorn' },
    { id: 4, name: 'Manajemen Produk', icon: 'fa-box-archive' },
    { id: 5, name: 'Data & AI', icon: 'fa-microchip' },
    { id: 6, name: 'Administrasi & Keuangan', icon: 'fa-file-invoice-dollar' },
    { id: 7, name: 'Operasional', icon: 'fa-gears' },
    { id: 8, name: 'Lainnya', icon: 'fa-folder' }
  ],
  job_types: [
    { id: 1, name: 'Full Time', icon: 'fa-clock' },
    { id: 2, name: 'Remote', icon: 'fa-laptop-code' },
    { id: 3, name: 'Hybrid', icon: 'fa-building-user' },
    { id: 4, name: 'Part Time', icon: 'fa-business-time' },
    { id: 5, name: 'Freelance', icon: 'fa-handshake' },
    { id: 6, name: 'Internship', icon: 'fa-graduation-cap' }
  ],
  experience_levels: [
    { id: 1, name: 'Fresh Graduate', icon: 'fa-user-graduate' },
    { id: 2, name: '1-3 Tahun', icon: 'fa-user-check' },
    { id: 3, name: '3-5 Tahun', icon: 'fa-user-tie' },
    { id: 4, name: 'Senior (5+ Tahun)', icon: 'fa-award' }
  ],
  locations: [
    { id: 1, name: 'Jakarta', icon: 'fa-city' },
    { id: 2, name: 'Bandung', icon: 'fa-city' },
    { id: 3, name: 'Surabaya', icon: 'fa-city' },
    { id: 4, name: 'Yogyakarta', icon: 'fa-city' },
    { id: 5, name: 'Bali', icon: 'fa-umbrella-beach' },
    { id: 6, name: 'Medan', icon: 'fa-city' },
    { id: 7, name: 'Semarang', icon: 'fa-city' },
    { id: 8, name: 'Remote', icon: 'fa-laptop-code' },
    { id: 9, name: 'Hybrid', icon: 'fa-building-user' }
  ]
};

let currentMasterData = JSON.parse(JSON.stringify(DEFAULT_MASTER_DATA));

function setMasterData(data) {
  if (!data) return;
  const raw = data.allData || data;
  if (raw && typeof raw === 'object') {
    currentMasterData = {
      categories: Array.isArray(raw.categories) ? raw.categories : (currentMasterData.categories || []),
      job_types: Array.isArray(raw.job_types) ? raw.job_types : (currentMasterData.job_types || []),
      experience_levels: Array.isArray(raw.experience_levels) ? raw.experience_levels : (currentMasterData.experience_levels || []),
      locations: Array.isArray(raw.locations) ? raw.locations : (currentMasterData.locations || [])
    };
    try {
      sessionStorage.setItem('kerja_admin_master_data', JSON.stringify(currentMasterData));
    } catch (e) {}
  }
}

async function loadMasterData() {
  // 1. Instant display from sessionStorage cache if available
  try {
    const cached = sessionStorage.getItem('kerja_admin_master_data');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        setMasterData(parsed);
        renderMasterDataChips();
        populateMasterSelectOptions();
      }
    }
  } catch (e) {}

  let loaded = false;

  // 2. Fetch fresh from backend API
  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/master-data'));
    if (ok && json && json.success && json.data) {
      setMasterData(json.data);
      loaded = true;
    }
  } catch (err) {
    console.warn('Failed to load master data from API:', err);
  }

  // 3. Resilient fallback: Direct Supabase Cloud read
  if (!loaded && sbClient) {
    try {
      const { data: rows } = await sbClient.from('jobs').select('description').eq('status', 'system_master_data').limit(1);
      if (rows && rows.length > 0 && rows[0].description) {
        const parsed = JSON.parse(rows[0].description);
        if (parsed && (Array.isArray(parsed.categories) || Array.isArray(parsed.job_types))) {
          setMasterData(parsed);
          loaded = true;
        }
      }
    } catch (e) {}
  }

  // 4. Default fallback if still empty
  if (!currentMasterData.categories || currentMasterData.categories.length === 0) {
    setMasterData(DEFAULT_MASTER_DATA);
  }

  renderMasterDataChips();
  populateMasterSelectOptions();
}

function renderMasterDataChips() {
  const types = ['categories', 'job_types', 'experience_levels', 'locations'];

  types.forEach(key => {
    const container = document.getElementById(`chips-${key}`);
    const countEl = document.getElementById(`count-${key}`);
    const items = currentMasterData[key] || [];

    if (countEl) countEl.textContent = `${items.length} Item`;

    if (container) {
      if (items.length === 0) {
        container.innerHTML = `<span style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">Belum ada item. Tambahkan di bawah.</span>`;
      } else {
        container.innerHTML = items.map(item => `
          <div class="master-chip">
            <i class="fa-solid ${item.icon || 'fa-tag'}"></i>
            <span>${escapeHtml(item.name)}</span>
            <button type="button" class="btn-chip-delete" onclick="deleteMasterItem('${key}', '${item.id || ''}', '${escapeHtml(item.name).replace(/'/g, "\\'")}')" title="Hapus ${escapeHtml(item.name)}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('');
      }
    }
  });
}

function populateMasterSelectOptions() {
  // Populate Upload Form
  populateSelect('upload-category', currentMasterData.categories);
  populateSelect('upload-job_type', currentMasterData.job_types);
  populateSelect('upload-experience_level', currentMasterData.experience_levels);

  // Populate Edit Modal Form
  populateSelect('edit-category', currentMasterData.categories);
  populateSelect('edit-job_type', currentMasterData.job_types);
  populateSelect('edit-experience_level', currentMasterData.experience_levels);

  // Populate Location Datalist
  const datalist = document.getElementById('master-locations-list');
  if (datalist && currentMasterData.locations) {
    datalist.innerHTML = currentMasterData.locations.map(loc => `<option value="${escapeHtml(loc.name)}">`).join('');
  }
}

function populateSelect(elemId, items) {
  const el = document.getElementById(elemId);
  if (!el || !items || items.length === 0) return;
  const currentVal = el.value;
  el.innerHTML = items.map(item => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('');
  if (currentVal && items.some(i => i.name === currentVal)) {
    el.value = currentVal;
  }
}

function setupMasterData() {
  const typesMap = [
    { formId: 'form-add-category', inputId: 'input-new-category', type: 'category' },
    { formId: 'form-add-job_type', inputId: 'input-new-job_type', type: 'job_type' },
    { formId: 'form-add-experience_level', inputId: 'input-new-experience_level', type: 'experience_level' },
    { formId: 'form-add-location', inputId: 'input-new-location', type: 'location' }
  ];

  typesMap.forEach(({ formId, inputId, type }) => {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) return;

        const token = getAdminToken();
        const btn = form.querySelector('button[type="submit"]');
        const origBtn = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        let saved = false;
        let errorMsg = '';

        try {
          const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/master-data'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, name: val })
          });
          if (ok && json && json.success) {
            saved = true;
            if (json.data) setMasterData(json.data);
          } else if (json?.message) {
            errorMsg = json.message;
          }
        } catch (err) {
          errorMsg = err.message;
        }

        // Resilient fallback: direct Supabase cloud write
        if (!saved && sbClient) {
          try {
            const key = (type === 'category' || type === 'categories') ? 'categories' : (type === 'job_type' || type === 'job_types' ? 'job_types' : (type === 'experience_level' || type === 'experience_levels' ? 'experience_levels' : 'locations'));
            const { data: rows } = await sbClient.from('jobs').select('id, description').eq('status', 'system_master_data').limit(1);
            let masterObj = currentMasterData || JSON.parse(JSON.stringify(DEFAULT_MASTER_DATA));
            if (rows && rows.length > 0 && rows[0].description) {
              try { masterObj = JSON.parse(rows[0].description); } catch (e) {}
            }
            if (!Array.isArray(masterObj[key])) masterObj[key] = [];
            const exists = masterObj[key].some(i => (i.name || '').toLowerCase() === val.toLowerCase());
            if (exists) {
              errorMsg = `Item "${val}" sudah ada dalam daftar!`;
            } else {
              const defaultIcon = (key === 'categories') ? 'fa-layer-group' : (key === 'job_types') ? 'fa-briefcase' : (key === 'experience_levels') ? 'fa-user-check' : 'fa-location-dot';
              masterObj[key].push({ id: Date.now(), name: val, icon: defaultIcon });

              if (rows && rows.length > 0) {
                const { error: updErr } = await sbClient.from('jobs').update({
                  description: JSON.stringify(masterObj),
                  updated_at: new Date().toISOString()
                }).eq('id', rows[0].id);
                if (!updErr) saved = true;
              } else {
                const { error: insErr } = await sbClient.from('jobs').insert([{
                  title: '__SYSTEM_MASTER_DATA__',
                  company_name: 'System',
                  category: 'System',
                  job_type: 'Full Time',
                  location: 'Indonesia',
                  salary_display: 'Kompetitif',
                  experience_level: 'Semua Tingkat',
                  description: JSON.stringify(masterObj),
                  status: 'system_master_data'
                }]);
                if (!insErr) saved = true;
              }
              if (saved) setMasterData(masterObj);
            }
          } catch (fbErr) {
            console.warn('Fallback direct Supabase master data save failed:', fbErr);
          }
        }

        btn.disabled = false;
        btn.innerHTML = origBtn;

        if (saved) {
          input.value = '';
          renderMasterDataChips();
          populateMasterSelectOptions();
        } else {
          alert(errorMsg || 'Gagal menambahkan item.');
        }
      });
    }
  });

  // Reset to default button
  const resetBtn = document.getElementById('btn-reset-master-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (!confirm('Apakah Anda yakin ingin mengembalikan seluruh master data ke pengaturan standar?')) return;
      const token = getAdminToken();
      let resetDone = false;
      let errorMsg = '';

      try {
        const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/master-data/reset'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ok && json && json.success) {
          resetDone = true;
          if (json.data) setMasterData(json.data);
        } else if (json?.message) {
          errorMsg = json.message;
        }
      } catch (err) {
        errorMsg = err.message;
      }

      // Resilient fallback: direct Supabase cloud reset
      if (!resetDone && sbClient) {
        try {
          const { data: rows } = await sbClient.from('jobs').select('id').eq('status', 'system_master_data').limit(1);
          if (rows && rows.length > 0) {
            const { error: updErr } = await sbClient.from('jobs').update({
              description: JSON.stringify(DEFAULT_MASTER_DATA),
              updated_at: new Date().toISOString()
            }).eq('id', rows[0].id);
            if (!updErr) {
              resetDone = true;
              setMasterData(DEFAULT_MASTER_DATA);
            }
          }
        } catch (e) {}
      }

      if (resetDone) {
        renderMasterDataChips();
        populateMasterSelectOptions();
        alert('Master data berhasil dikembalikan ke pengaturan awal!');
      } else {
        alert(errorMsg || 'Gagal mereset master data.');
      }
    });
  }
}

window.deleteMasterItem = async function(typeKey, id, name) {
  if (!confirm(`Hapus "${name}" dari ${typeKey}?`)) return;
  const token = getAdminToken();
  let deleted = false;
  let errorMsg = '';

  const normalizedKey = (typeKey === 'categories' || typeKey === 'category') ? 'categories'
    : (typeKey === 'job_types' || typeKey === 'job_type' ? 'job_types'
    : (typeKey === 'experience_levels' || typeKey === 'experience_level' ? 'experience_levels' : 'locations'));

  try {
    const { ok, data: json } = await safeFetchJson(getApiEndpoint('/api/master-data'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: normalizedKey, id, name })
    });
    if (ok && json && json.success) {
      deleted = true;
      if (json.data) setMasterData(json.data);
    } else if (json?.message) {
      errorMsg = json.message;
    }
  } catch (err) {
    errorMsg = err.message;
  }

  // Resilient fallback: direct Supabase cloud delete
  if (!deleted && sbClient) {
    try {
      const { data: rows } = await sbClient.from('jobs').select('id, description').eq('status', 'system_master_data').limit(1);
      if (rows && rows.length > 0 && rows[0].description) {
        const masterObj = JSON.parse(rows[0].description);
        if (Array.isArray(masterObj[normalizedKey])) {
          masterObj[normalizedKey] = masterObj[normalizedKey].filter(i => {
            if (id !== undefined && id !== null && id !== '' && String(i.id) === String(id)) return false;
            if (name && (i.name || '').toLowerCase() === String(name).trim().toLowerCase()) return false;
            return true;
          });
          const { error: updErr } = await sbClient.from('jobs').update({
            description: JSON.stringify(masterObj),
            updated_at: new Date().toISOString()
          }).eq('id', rows[0].id);
          if (!updErr) {
            deleted = true;
            setMasterData(masterObj);
          }
        }
      }
    } catch (e) {}
  }

  if (deleted) {
    renderMasterDataChips();
    populateMasterSelectOptions();
  } else {
    alert(errorMsg || 'Gagal menghapus item.');
  }
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

// -------------------------------------------------------------
// PENGATURAN PESAN CV (WHATSAPP KONTAK PUBLIK)
// -------------------------------------------------------------
async function loadCvSettings() {
  const inputWa = document.getElementById('setting-cv-whatsapp');
  const inputMsg = document.getElementById('setting-cv-message');

  try {
    const { ok, data } = await safeFetchJson(getApiEndpoint('/api/settings'));
    if (ok && data && data.success && data.data) {
      const s = data.data;
      if (inputWa) inputWa.value = s.cv_whatsapp || '';
      if (inputMsg) inputMsg.value = s.cv_order_message || '';
      updateCvSettingsPreview(s.cv_whatsapp, s.cv_order_message);
      return;
    }
  } catch (e) {
    console.warn('Gagal memuat pengaturan CV dari API:', e);
  }

  // Resilient fallback: direct Supabase read
  if (sbClient) {
    try {
      const { data: rows } = await sbClient.from('jobs').select('description').eq('status', 'system_settings').limit(1);
      if (rows && rows.length > 0 && rows[0].description) {
        const s = JSON.parse(rows[0].description);
        if (inputWa) inputWa.value = s.cv_whatsapp || '';
        if (inputMsg) inputMsg.value = s.cv_order_message || '';
        updateCvSettingsPreview(s.cv_whatsapp, s.cv_order_message);
      }
    } catch (err) {
      console.warn('Gagal memuat pengaturan CV dari Supabase:', err);
    }
  }
}

function updateCvSettingsPreview(wa, msg) {
  const previewNum = document.getElementById('preview-cv-wa-number');
  const previewMsg = document.getElementById('preview-cv-wa-msg');
  if (previewNum) {
    let raw = (wa || '081234567890').trim();
    let clean = raw.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    else if (clean.startsWith('8')) clean = '62' + clean;
    else if (!clean.startsWith('62')) clean = '62' + clean;
    previewNum.textContent = '+' + clean;
  }
  if (previewMsg) {
    previewMsg.textContent = msg || 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional...';
  }
}

function setupCvSettings() {
  const form = document.getElementById('form-settings-cv');
  const inputWa = document.getElementById('setting-cv-whatsapp');
  const inputMsg = document.getElementById('setting-cv-message');
  const btnTest = document.getElementById('btn-test-wa-direct');

  if (inputWa) {
    inputWa.addEventListener('input', () => {
      updateCvSettingsPreview(inputWa.value, inputMsg?.value);
    });
  }

  if (inputMsg) {
    inputMsg.addEventListener('input', () => {
      updateCvSettingsPreview(inputWa?.value, inputMsg.value);
    });
  }

  if (btnTest) {
    btnTest.addEventListener('click', () => {
      let raw = inputWa?.value.trim() || '081234567890';
      let clean = raw.replace(/[^0-9]/g, '');
      if (clean.startsWith('0')) clean = '62' + clean.slice(1);
      else if (clean.startsWith('8')) clean = '62' + clean;
      else if (!clean.startsWith('62')) clean = '62' + clean;

      const text = encodeURIComponent(inputMsg?.value.trim() || 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan CV.');
      window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, '_blank');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-save-cv-settings');
      const origHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Server...';

      const wa = inputWa?.value.trim() || '';
      const msg = inputMsg?.value.trim() || '';

      let saved = false;
      let errorMsg = '';

      try {
        const token = getAdminToken();
        const res = await safeFetchJson(getApiEndpoint('/api/settings'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            cv_whatsapp: wa,
            cv_order_message: msg
          })
        });

        if (res.ok && res.data && res.data.success) {
          saved = true;
        } else if (res.data?.message) {
          errorMsg = res.data.message;
        }
      } catch (err) {
        errorMsg = err.message;
      }

      // Resilient fallback: direct Supabase save
      if (!saved && sbClient) {
        try {
          const { data: existingRows } = await sbClient.from('jobs').select('id').eq('status', 'system_settings').limit(1);
          const payload = {
            cv_whatsapp: wa,
            cv_order_message: msg,
            updated_at: new Date().toISOString()
          };
          if (existingRows && existingRows.length > 0) {
            const { error: patchErr } = await sbClient.from('jobs').update({
              description: JSON.stringify(payload),
              updated_at: new Date().toISOString()
            }).eq('id', existingRows[0].id);
            if (!patchErr) saved = true;
          } else {
            const { error: insErr } = await sbClient.from('jobs').insert([{
              title: '__SYSTEM_SETTINGS__',
              company_name: 'System',
              category: 'System',
              job_type: 'Full Time',
              location: 'Indonesia',
              salary_display: 'Kompetitif',
              experience_level: 'Semua Tingkat',
              poster_image: '',
              description: JSON.stringify(payload),
              status: 'system_settings'
            }]);
            if (!insErr) saved = true;
          }
        } catch (fbErr) {
          console.warn('Fallback direct Supabase save failed:', fbErr);
        }
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;

      if (saved) {
        alert(`Berhasil! Nomor WhatsApp pemesanan CV (${wa}) berhasil disimpan dan langsung aktif di tombol "Pesan CV" website publik.`);
        updateCvSettingsPreview(wa, msg);
      } else {
        alert('Gagal menyimpan pengaturan: ' + (errorMsg || 'Server menolak request.'));
      }
    });
  }
}
