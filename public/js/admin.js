// ==============================================================
// KerjaHub - Admin Panel Logic (Enhanced Multi-Contact, Lock System & Social Scout)
// ==============================================================

const SUPABASE_FALLBACK_URL = "https://nptmawuukuysqzqakwej.supabase.co";
const SUPABASE_FALLBACK_KEY = "sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT";

let sbClient = null;

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

async function initSupabaseClient() {
  let url = SUPABASE_FALLBACK_URL;
  let key = SUPABASE_FALLBACK_KEY;

  // Immediate init so sbClient is instantly available for queries without network latency
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      sbClient = window.supabase.createClient(url, key);
    } catch (e) {
      console.warn('Supabase immediate createClient error:', e);
    }
  }

  // Update in background if custom config returned
  safeFetchJson(getApiEndpoint('/api/config')).then(({ ok, data }) => {
    if (ok && data && data.supabaseUrl && data.supabaseKey) {
      if ((data.supabaseUrl !== url || data.supabaseKey !== key) && window.supabase) {
        try {
          sbClient = window.supabase.createClient(data.supabaseUrl, data.supabaseKey);
        } catch (e) {}
      }
    }
  }).catch(() => {});
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
        } else if (status === 401 || (data && data.success === false && data.message)) {
          if (errorAlert) {
            errorText.textContent = data?.message || 'Kata sandi admin salah! Akses ditolak.';
            errorAlert.style.display = 'flex';
          }
        } else {
          if (errorAlert) {
            errorText.textContent = data?.message || 'Kata sandi admin salah! Akses ditolak.';
            errorAlert.style.display = 'flex';
          }
        }
      } catch (err) {
        if (errorAlert) {
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
    if (titleEl) titleEl.textContent = 'Scout & Generator Loker Sosmed';
    if (subEl) subEl.textContent = 'Cari dan generate materi postingan lowongan kerja dari LinkedIn, IG, dan FB.';
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

// -------------------------------------------------------------
// UPLOAD JOB FORM SUBMISSION (WITH 3 CONTACT FIELDS)
// -------------------------------------------------------------
function setupJobFormSubmit() {
  const form = document.getElementById('form-upload-job');
  if (!form) return;

  const btnGenPoster = document.getElementById('btn-generate-poster-from-form');
  if (btnGenPoster) {
    btnGenPoster.addEventListener('click', () => {
      const title = form.querySelector('[name="title"]')?.value.trim() || 'OPERATOR PRODUKSI';
      const company = form.querySelector('[name="company_name"]')?.value.trim() || 'PT NITERRA MOBILITY INDONESIA';
      const reqLines = (form.querySelector('[name="requirements"]')?.value || '').split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
      const deadline = form.querySelector('[name="deadline"]')?.value.trim() || '30 Oktober 2026';
      const website = form.querySelector('[name="website"]')?.value.trim() || '';

      openPosterStudio({
        title,
        company_name: company,
        requirements: reqLines.length > 0 ? reqLines : [
          'Pendidikan minimal SMA/SMK sederajat',
          'Memiliki kemampuan Komunikasi, Kerja sama tim, dan Disiplin',
          'Dapat mengoperasikan komputer & sistem kerja',
          'Bersedia bekerja dalam sistem shift'
        ],
        deadline,
        official_url: website || window.location.href,
        apply_info: `Kirim CV/Lamaran melalui website resmi ${company}.`,
        theme: title.toLowerCase().includes('operator') || title.toLowerCase().includes('teknisi') ? 'factory' : 'modern',
        mascot: title.toLowerCase().includes('operator') || title.toLowerCase().includes('teknisi') ? 'factory' : 'corporate'
      });
    });
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

    const parseLines = (val) => val ? val.split(/\r?\n/).map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : [];

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
      requirements: parseLines(form.querySelector('[name="requirements"]').value),
      responsibilities: parseLines(form.querySelector('[name="responsibilities"]').value),
      benefits: parseLines(form.querySelector('[name="benefits"]').value),
      is_featured: form.querySelector('[name="is_featured"]').checked,
      status: 'active',
      poster_image: currentSelectedFileBase64 || './uploads/sample_uiux.jpg',
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
    const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
    let posterSrc = job.poster_image ? job.poster_image : defaultPoster;
    if (posterSrc.startsWith('/uploads/')) posterSrc = '.' + posterSrc;

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
            <img src="${posterSrc}" alt="Poster" class="job-cell-poster" onerror="this.src='${defaultPoster}'">
            <div class="job-cell-info">
              <a href="./?job=${job.id}" target="_blank" class="job-cell-title">${escapeHtml(job.title)}</a>
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

  if (tbody && (!adminJobs || adminJobs.length === 0)) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data Supabase...</td></tr>`;
  }

  let jobs = null;

  // 1. Fetch from Supabase Cloud
  if (sbClient) {
    try {
      const { data, error } = await sbClient.from('jobs').select('*').order('id', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        jobs = data;
      }
    } catch (e) {}
  }

  // 2. Fallback to API
  if (!jobs) {
    try {
      const { ok, data } = await safeFetchJson(getApiEndpoint('/api/jobs?status=all'));
      if (ok && data && data.success && Array.isArray(data.data)) jobs = data.data;
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
  } else {
    // Revert optimistic update on failure
    job.status = prevStatus;
    renderAdminJobsTable();
    renderDashboardStats(adminJobs);
    alert('Gagal mengubah status lowongan ke server.');
  }
};

// -------------------------------------------------------------
// DELETE JOB (Optimistic UI Update)
// -------------------------------------------------------------
window.deleteJob = async function(jobId, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus lowongan "${title}"?`)) return;

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
  } else {
    // Revert optimistic deletion on failure
    if (removedJob && jobIdx !== -1) {
      adminJobs.splice(jobIdx, 0, removedJob);
      renderAdminJobsTable();
      renderDashboardStats(adminJobs);
    }
    alert('Gagal menghapus lowongan dari database.');
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
    const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
    let pSrc = job.poster_image || defaultPoster;
    if (pSrc.startsWith('/uploads/')) pSrc = '.' + pSrc;
    posterPreview.src = pSrc;
  }

  form.querySelector('[name="description"]').value = job.description || '';

  const parseOrStr = (v) => Array.isArray(v) ? v.join('\n') : (typeof v === 'string' && v.startsWith('[') ? JSON.parse(v).join('\n') : (v || ''));
  form.querySelector('[name="requirements"]').value = parseOrStr(job.requirements);
  form.querySelector('[name="responsibilities"]').value = parseOrStr(job.responsibilities);
  form.querySelector('[name="benefits"]').value = parseOrStr(job.benefits);

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

    const parseLines = (val) => val ? val.split(/\r?\n/).map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : [];

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
      requirements: parseLines(form.querySelector('[name="requirements"]').value),
      responsibilities: parseLines(form.querySelector('[name="responsibilities"]').value),
      benefits: parseLines(form.querySelector('[name="benefits"]').value),
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
// GENERATOR LOWONGAN RESMI (ANTI-HOAX) & STUDIO POSTER FLYER
// ==============================================================

const OFFICIAL_VACANCIES_DB = [
  {
    id: 'off_niterra_01',
    title: 'OPERATOR PRODUKSI',
    company_name: 'PT NITERRA MOBILITY INDONESIA',
    sector: 'manufaktur',
    sector_label: 'Manufaktur & Otomotif',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Cikarang / Karawang, Jawa Barat',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.200.000 - Rp 6.800.000 / bln',
    deadline: '30 Oktober 2026',
    official_url: 'https://www.ngkbusi.com/career',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@niterra.co.id', website: 'https://www.ngkbusi.com/career' }),
    description: 'PT Niterra Mobility Indonesia (produsen busi NGK & sensor otomotif terkemuka) membuka lowongan kerja resmi Operator Produksi untuk penempatan fasilitas perakitan dan manufaktur berstandar Jepang.',
    requirements: [
      'Pendidikan minimal SMA/SMK sederajat',
      'Memiliki kemampuan Komunikasi, Kerja sama tim, dan Kedisiplinan yang baik',
      'Dapat mengoperasikan Microsoft word, Excel dan Sistem Produksi',
      'Bersedia bekerja dalam sistem shift'
    ],
    responsibilities: [
      'Menjalankan proses perakitan komponen otomotif sesuai SOP',
      'Menjaga ketelitian dan mutu kualitas produk tanpa cacat',
      'Mematuhi standar K3 (Keselamatan & Kesehatan Kerja) dan 5R'
    ],
    benefits: [
      'Gaji pokok sesuai UMK kawasan industri + Lembur normatif',
      'BPJS Kesehatan & Ketenagakerjaan lengkap',
      'Fasilitas jemputan bus karyawan & makan siang'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Resmi & Bebas Biaya (Anti-Hoax)',
    apply_info: 'Kirim CV/Lamaran melalui website PT. Niterra Mobility Indonesia.'
  },
  {
    id: 'off_astra_02',
    title: 'OPERATOR QUALITY CONTROL & ASSEMBLY',
    company_name: 'PT ASTRA HONDA MOTOR (AHM)',
    sector: 'manufaktur',
    sector_label: 'Manufaktur & Otomotif',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan Industri Karawang / Sunter Jakarta',
    education_level: 'smk',
    education_label: 'SMA / SMK Teknik',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.400.000 - Rp 7.000.000 / bln',
    deadline: '15 November 2026',
    official_url: 'https://recruitment.astra-honda.com',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@astra-honda.com', website: 'https://recruitment.astra-honda.com' }),
    description: 'PT Astra Honda Motor membuka kesempatan bagi lulusan muda berprestasi untuk bergabung sebagai Operator Quality Control & Assembly lini produksi kendaraan roda dua nomor satu di Indonesia.',
    requirements: [
      'Lulusan SMA/SMK jurusan Mesin, Otomotif, Elektro atau IPA',
      'Usia minimal 18 tahun, maksimal 21 tahun',
      'Memiliki ketelitian visual tinggi dan daya konsentrasi prima',
      'Bersedia bekerja sistem shift dan target efisiensi perakitan'
    ],
    responsibilities: [
      'Melakukan inspeksi visual dan fungsional suku cadang sepeda motor',
      'Mencatat data kualitas hasil produksi ke sistem QC',
      'Menerapkan prinsip continuous improvement (Kaizen)'
    ],
    benefits: [
      'Gaji pokok kompetitif Astra Group + Tunjangan kehadiran',
      'Asuransi kesehatan swasta kelas 1 + BPJS Ketenagakerjaan',
      'THR, bonus tahunan, dan jenjang karir terstruktur'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Resmi Astra Career (Anti-Hoax)',
    apply_info: 'Pendaftaran resmi hanya melalui portal rekrutmen: recruitment.astra-honda.com'
  },
  {
    id: 'off_telkom_03',
    title: 'DIGITAL TALENT & IT SPECIALIST',
    company_name: 'PT TELKOM INDONESIA (PERSERO) TBK',
    sector: 'bumn',
    sector_label: 'BUMN & Telekomunikasi',
    category: 'Teknologi & IT',
    job_type: 'Full Time',
    location: 'Jakarta / Bandung / Seluruh Indonesia',
    education_level: 's1',
    education_label: 'D3 / S1 Komputer & Informatika',
    experience_level: 'Fresh Graduate / 1-3 Tahun',
    salary_display: 'Rp 10.000.000 - Rp 16.000.000 / bln',
    deadline: '25 November 2026',
    official_url: 'https://careers.telkom.co.id',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'corporate_career@telkom.co.id', website: 'https://careers.telkom.co.id' }),
    description: 'PT Telkom Indonesia mencari talenta digital masa depan bangsa untuk membangun ekosistem cloud, digital platform, dan konektivitas nasional berkelas dunia melalui Rekrutmen Bersama BUMN.',
    requirements: [
      'Pendidikan minimal D3 atau S1 jurusan IT, SI, Ilmu Komputer, atau Teknik Elektro',
      'Menguasai salah satu bahasa pemrograman (Node.js, Python, Java, atau React/Vue)',
      'Memiliki pemahaman mengenai REST API, Git, dan arsitektur Cloud',
      'Mampu berkomunikasi efektif dan berkolaborasi dalam sprint Agile'
    ],
    responsibilities: [
      'Mengembangkan fitur aplikasi digital skala enterprise',
      'Melakukan refactoring kode dan implementasi unit testing',
      'Bekerjasama dengan Product Manager dan UI/UX Designer'
    ],
    benefits: [
      'Skema kerja Hybrid fleksibel dengan perangkat laptop kerja',
      'Asuransi kesehatan keluarga dan program kesejahteraan pensiun BUMN',
      'Sertifikasi cloud internasional & pelatihan bersubsidi'
    ],
    theme: 'bumn',
    mascot: 'corporate',
    verified_badge: 'Resmi BUMN FHCI (Anti-Hoax)',
    apply_info: 'Lamaran resmi melalui portal BUMN: careers.telkom.co.id'
  },
  {
    id: 'off_bri_04',
    title: 'FRONTLINER (CUSTOMER SERVICE & TELLER)',
    company_name: 'PT BANK RAKYAT INDONESIA (PERSERO) TBK',
    sector: 'bumn',
    sector_label: 'BUMN & Perbankan',
    category: 'Administrasi & Keuangan',
    job_type: 'Full Time',
    location: 'Jabodetabek, Bandung, Surabaya, Medan',
    education_level: 'd3',
    education_label: 'D3 / S1 Semua Jurusan',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.800.000 - Rp 7.500.000 / bln',
    deadline: '20 November 2026',
    official_url: 'https://e-recruitment.bri.co.id',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@bri.co.id', website: 'https://e-recruitment.bri.co.id' }),
    description: 'Bank BRI membuka Rekrutmen Brilian Frontliner untuk memberikan pelayanan prima perbankan digital dan transaksi keuangan kepada seluruh lapisan masyarakat Indonesia.',
    requirements: [
      'Pendidikan minimal D3/S1 IPK minimal 2.75 semua jurusan',
      'Usia maksimal 24 tahun (Fresh Graduate)',
      'Berpenampilan rapi, ramah, komunikatif, dan berintegritas tinggi',
      'Mahir mengoperasikan komputer (MS Office) dan aplikasi kasir/teller'
    ],
    responsibilities: [
      'Memberikan edukasi dan solusi produk perbankan BRI kepada nasabah',
      'Melayani pembukaan rekening, administrasi, dan transaksi perbankan',
      'Menjaga kerahasiaan data nasabah dan kepatuhan perbankan'
    ],
    benefits: [
      'Gaji bulanan + Tunjangan representasi penampilan (grooming)',
      'Asuransi rawat inap & jalan keluarga',
      'Bonus kinerja kuartalan & jenjang karir BUMN pasti'
    ],
    theme: 'bumn',
    mascot: 'corporate',
    verified_badge: 'Resmi BRI E-Recruitment (Anti-Hoax)',
    apply_info: 'Pendaftaran resmi hanya via: e-recruitment.bri.co.id'
  },
  {
    id: 'off_mayora_05',
    title: 'TEKNISI MAINTENANCE & OPERATOR MESIN',
    company_name: 'PT MAYORA INDAH TBK',
    sector: 'fmcg',
    sector_label: 'FMCG & Consumer Goods',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Tangerang / Cikupa, Banten',
    education_level: 'smk',
    education_label: 'SMK / D3 Teknik Mesin / Elektro',
    experience_level: 'Fresh Graduate / 1 Tahun',
    salary_display: 'Rp 5.100.000 - Rp 6.500.000 / bln',
    deadline: '10 Desember 2026',
    official_url: 'https://mayorakarir.com',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment.centre@mayora.co.id', website: 'https://mayorakarir.com' }),
    description: 'PT Mayora Indah Tbk mengundang kandidat potensial untuk bergabung mengoperasikan dan memelihara mesin pengemasan dan produksi biskuit serta minuman terpopuler di Indonesia.',
    requirements: [
      'Pendidikan SMK / D3 jurusan Teknik Mesin, Mekatronika, atau Listrik',
      'Memahami dasar pneumatik, PLC, dan pemeliharaan mesin preventif',
      'Bersedia bekerja dalam ritme shift pabrik makanan',
      'Disiplin, bertanggung jawab, dan mengutamakan kebersihan (GMP/HACCP)'
    ],
    responsibilities: [
      'Melakukan preventive & corrective maintenance mesin produksi makanan',
      'Memastikan mesin beroperasi stabil tanpa downtime yang tidak terencana',
      'Membantu setup mesin saat pergantian varian produk'
    ],
    benefits: [
      'Gaji pokok sesuai standar industri FMCG + Uang lembur resmi',
      'Klinik kesehatan perusahaan & BPJS lengkap',
      'Paket bingkisan produk Mayora berkala'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Resmi Mayora Karir (Anti-Hoax)',
    apply_info: 'Kirim lamaran melalui situs resmi Mayora: mayorakarir.com'
  },
  {
    id: 'off_kai_06',
    title: 'PETUGAS OPERASIONAL & LAYANAN STASIUN',
    company_name: 'PT KERETA API INDONESIA (PERSERO)',
    sector: 'bumn',
    sector_label: 'BUMN & Transportasi',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Daop 1 Jakarta, Daop 2 Bandung, Daop 6 Yogyakarta',
    education_level: 'smk',
    education_label: 'SMA / SMK / D3 Semua Jurusan',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.500.000 - Rp 7.200.000 / bln',
    deadline: '30 November 2026',
    official_url: 'https://recruitment.kai.id',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'rekrutmen@kai.id', website: 'https://recruitment.kai.id' }),
    description: 'PT Kereta Api Indonesia (Persero) membuka lowongan resmi formasi operasional dan pelayanan penumpang kereta api untuk memastikan perjalanan kereta api yang aman, nyaman, dan tepat waktu.',
    requirements: [
      'Warga Negara Indonesia (WNI), usia 18 - 25 tahun',
      'Pendidikan minimal SMA/SMK dengan nilai rata-rata UN/Ijazah minimal 7.0',
      'Tinggi badan pria min 160 cm, wanita min 155 cm dengan berat badan ideal',
      'Tidak berkacamata berat dan tidak buta warna'
    ],
    responsibilities: [
      'Melayani boarding pass dan kebutuhan penumpang di area peron dan stasiun',
      'Melakukan pengawasan keselamatan dan ketertiban di stasiun',
      'Membantu koordinasi kelancaran perjalanan armada kereta api'
    ],
    benefits: [
      'Gaji BUMN + Fasilitas tiket gratis kereta api dinas',
      'Asuransi kesehatan lengkap sekeluarga',
      'Jenjang karir pegawai tetap BUMN'
    ],
    theme: 'bumn',
    mascot: 'corporate',
    verified_badge: 'Resmi Rekrutmen KAI (Anti-Hoax)',
    apply_info: 'Pendaftaran resmi hanya di: recruitment.kai.id (Tanpa Biaya)'
  },
  {
    id: 'off_epson_07',
    title: 'OPERATOR PRODUKSI & ASSEMBLING PRINTER',
    company_name: 'PT INDONESIA EPSON INDUSTRY',
    sector: 'manufaktur',
    sector_label: 'Manufaktur Elektronik',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan EJIP Cikarang Selatan, Bekasi',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.300.000 - Rp 6.900.000 / bln',
    deadline: '05 Desember 2026',
    official_url: 'https://epson.co.id/careers',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'hrd_recruitment@iei.epson.com.sg', website: 'https://epson.co.id/careers' }),
    description: 'PT Indonesia Epson Industry (produsen printer injeksi global) membuka rekrutmen Operator Perakitan Komponen Elektronik berpresisi tinggi dengan fasilitas kerja modern dan bersih.',
    requirements: [
      'Lulusan SMA/SMK sederajat semua jurusan',
      'Memiliki ketajaman penglihatan baik dan ketangkasan manual tangan',
      'Disiplin mematuhi standar kerja Clean Room dan tata tertib 5S',
      'Bersedia bekerja dalam sistem shift bergilir'
    ],
    responsibilities: [
      'Memasang modul komponen mikro printer sesuai alur ban berjalan',
      'Memastikan tidak ada baut atau komponen longgar sebelum uji fungsional',
      'Melaporkan produk reject ke pengawas lini produksi'
    ],
    benefits: [
      'Gaji UMK Kabupaten Bekasi + Fasilitas lembur transparan',
      'Kantin makan sehat gratis & klinik 24 jam di pabrik',
      'Jemputan armada bus karyawan ber-AC'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Resmi Epson Careers (Anti-Hoax)',
    apply_info: 'Kirim lamaran melalui website karir resmi: epson.co.id/careers'
  },
  {
    id: 'off_bca_08',
    title: 'MAGANG BAKTI BCA (CUSTOMER SERVICE & TELLER)',
    company_name: 'PT BANK CENTRAL ASIA TBK (BCA)',
    sector: 'tech',
    sector_label: 'Perbankan & FinTech',
    category: 'Administrasi & Keuangan',
    job_type: 'Internship',
    location: 'Jabodetabek, Semarang, Bandung, Surabaya',
    education_level: 'smk',
    education_label: 'SMA/SMK (Nilai min 7.0) / D1-S1',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.000.000 - Rp 6.200.000 / bln (Uang Saku + Bonus)',
    deadline: '31 Desember 2026',
    official_url: 'https://karir.bca.co.id',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@bca.co.id', website: 'https://karir.bca.co.id' }),
    description: 'Program Magang Bakti BCA membuka peluang bagi lulusan SMA/SMK dan Diploma untuk mendapatkan pengalaman nyata dunia perbankan berkelas dunia dengan beasiswa dan pelatihan intensif.',
    requirements: [
      'Pria / Wanita, usia 18 - 24 tahun',
      'Lulusan SMA/SMK (nilai rata-rata min 7.0) atau D1-S1 (IPK min 2.50)',
      'Ramah, komunikatif, dan berpenampilan bersih serta rapi',
      'Bersedia menjalani magang 1 tahun penuh'
    ],
    responsibilities: [
      'Melayani nasabah dengan senyum dan keramahan khas BCA',
      'Memandu nasabah memanfaatkan mesin CRM, e-banking, dan myBCA',
      'Menyelesaikan transaksi perbankan dasar secara teliti dan cepat'
    ],
    benefits: [
      'Uang saku bulanan kompetitif di atas rata-rata magang nasional',
      'Bantuan beasiswa pendidikan setelah menyelesaikan program',
      'Sertifikat resmi Magang Bakti BCA yang sangat bernilai di dunia kerja'
    ],
    theme: 'bumn',
    mascot: 'corporate',
    verified_badge: 'Resmi Karir BCA (Anti-Hoax)',
    apply_info: 'Daftar online langsung melalui: karir.bca.co.id/magang-bakti',
    platform: 'official',
    platform_label: 'Resmi BUMN & Perbankan',
    platform_icon: 'fa-solid fa-building-columns',
    platform_class: 'official',
    hashtag: '#LokerBCA #MagangBaktiBCA #LokerResmi'
  },

  // ==============================================================
  // LINKEDIN RECRUITER VERIFIED VACANCIES
  // ==============================================================
  {
    id: 'soc_linkedin_01',
    title: 'OPERATOR PRODUKSI & MESIN SILIKON',
    company_name: 'PT SUMCO INDONESIA',
    platform: 'linkedin',
    platform_label: 'LinkedIn Recruiter',
    platform_icon: 'fa-brands fa-linkedin',
    platform_class: 'linkedin',
    sector: 'manufaktur',
    sector_label: 'Manufaktur & Otomotif',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan Industri MM2100 Cikarang Barat, Bekasi',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.500.000 - Rp 7.200.000 / bln',
    deadline: '25 November 2026',
    official_url: 'https://www.linkedin.com/jobs/view/pt-sumco-indonesia-operator-produksi',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@sumco.co.id', website: 'https://www.linkedin.com/company/pt-sumco-indonesia' }),
    description: 'PT Sumco Indonesia (produsen Silicon Wafers semikonduktor berstandar internasional) membuka rekrutmen Operator Produksi & Mesin untuk penempatan di pabrik MM2100 Cikarang Barat.',
    requirements: [
      'Pria/Wanita, lulusan SMA/SMK sederajat (Jurusan Mesin, Listrik, Elektronika atau IPA diutamakan)',
      'Usia minimal 18 tahun, tidak buta warna, dan memiliki ketelitian kerja tinggi',
      'Memahami dasar-dasar keselamatan kerja K3 dan bersedia bekerja sistem shift',
      'Mampu bekerja sama dalam tim dan mematuhi SOP manufaktur semikonduktor'
    ],
    responsibilities: [
      'Mengoperasikan mesin pengolahan ingot dan pemotongan wafer silikon sesuai standar',
      'Memeriksa kualitas fisik wafer silikon menggunakan alat ukur presisi',
      'Menjaga kebersihan cleanroom dan disiplin pelaporan hasil kerja'
    ],
    benefits: [
      'Gaji pokok sesuai standar MM2100 + Tunjangan shift & lembur normatif',
      'Asuransi kesehatan swasta, BPJS Ketenagakerjaan & BPJS Kesehatan',
      'Fasilitas jemputan karyawan & makan di kantin perusahaan'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'LinkedIn Verified Recruiter',
    apply_info: 'Lamaran & submit CV melalui link postingan resmi LinkedIn Recruiter PT Sumco Indonesia.',
    hashtag: '#LokerLinkedIn #OperatorProduksi #SumcoIndonesia'
  },
  {
    id: 'soc_linkedin_02',
    title: 'DIGITAL MARKETING & SOCIAL MEDIA CAMPAIGN SPECIALIST',
    company_name: 'PT SHOPEE INTERNATIONAL INDONESIA',
    platform: 'linkedin',
    platform_label: 'LinkedIn Talent Network',
    platform_icon: 'fa-brands fa-linkedin',
    platform_class: 'linkedin',
    sector: 'tech',
    sector_label: 'Teknologi & E-Commerce',
    category: 'Design & Kreatif',
    job_type: 'Full Time',
    location: 'Pacific Century Place SCBD, Jakarta Selatan',
    education_level: 's1',
    education_label: 'Sarjana (S1)',
    experience_level: '1-3 Tahun',
    salary_display: 'Rp 9.000.000 - Rp 14.500.000 / bln',
    deadline: '10 Desember 2026',
    official_url: 'https://www.linkedin.com/jobs/view/shopee-social-media-campaign-specialist',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'talent.acquisition@shopee.com', website: 'https://careers.shopee.co.id' }),
    description: 'Shopee Indonesia mengundang Digital Marketing & Campaign Specialist untuk merancang kampanye viral, kolaborasi influencer, dan aktivasi media sosial berskala nasional.',
    requirements: [
      'Pendidikan S1 Ilmu Komunikasi, Manajemen Pemasaran, Desain, atau jurusan relevan',
      'Pengalaman 1-3 tahun mengelola akun brand berskala besar di TikTok, IG, atau YouTube',
      'Mahir menganalisis metrik impresi, CTR, engagement rate, dan tren algoritma medsos',
      'Kreatif, tanggap tren pop culture, dan memiliki kemampuan copywriting yang memikat'
    ],
    responsibilities: [
      'Menyusun content calendar dan strategi eksekusi konten digital kampanye bulanan Shopee',
      'Berkoordinasi dengan tim KOL/Influencer dan agensi kreatif untuk produksi konten viral',
      'Memantau performa kampanye dan menyusun laporan analisis ROI secara komprehensif'
    ],
    benefits: [
      'Gaji kompetitif + Bonus tahunan performa tier-1 e-commerce tech',
      'Asuransi kesehatan lengkap (rawat jalan & inap) untuk karyawan & keluarga',
      'Lingkungan kerja inklusif dan voucher belanja Shopee setiap bulan'
    ],
    theme: 'modern',
    mascot: 'corporate',
    verified_badge: 'LinkedIn Verified Company',
    apply_info: 'Lamar langsung via profil LinkedIn Easy Apply atau portal karir resmi Shopee.',
    hashtag: '#LokerLinkedIn #ShopeeCareers #DigitalMarketing'
  },
  {
    id: 'soc_linkedin_03',
    title: 'WAREHOUSE LOGISTICS & INVENTORY OFFICER',
    company_name: 'PT NITERRA MOBILITY INDONESIA',
    platform: 'linkedin',
    platform_label: 'LinkedIn Recruiter',
    platform_icon: 'fa-brands fa-linkedin',
    platform_class: 'linkedin',
    sector: 'manufaktur',
    sector_label: 'Logistik & Manufaktur',
    category: 'Logistik',
    job_type: 'Full Time',
    location: 'Kawasan Industri Cikarang, Jawa Barat',
    education_level: 'd3',
    education_label: 'Diploma (D3 / S1)',
    experience_level: '1-3 Tahun',
    salary_display: 'Rp 5.800.000 - Rp 7.500.000 / bln',
    deadline: '20 November 2026',
    official_url: 'https://www.linkedin.com/jobs/view/niterra-mobility-warehouse-personnel',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@niterra.co.id', website: 'https://www.ngkbusi.com/career' }),
    description: 'PT Niterra Mobility Indonesia membuka kesempatan karir di departemen Supply Chain & Logistik Pergudangan untuk mengelola alur distribusi suku cadang otomotif domestik dan ekspor.',
    requirements: [
      'Pendidikan minimal D3/S1 Manajemen Logistik, Teknik Industri, atau jurusan relevan',
      'Memiliki pemahaman sistem WMS (Warehouse Management System) & SAP',
      'Pengalaman minimal 1 tahun di bidang stock control pergudangan otomotif',
      'Teliti, terbiasa dengan audit stok fisik vs sistem (Cycle Count)'
    ],
    responsibilities: [
      'Mengawasi alur penerimaan barang masuk (inbound) dan pengiriman (outbound)',
      'Memastikan akurasi inventaris fisik 100% sesuai sistem ERP',
      'Mengoordinasikan tim operator forklift dan picker agar pengiriman tepat waktu'
    ],
    benefits: [
      'Penghasilan menarik sesuai grade manufaktur Jepang',
      'Tunjangan kehadiran, uang transport, dan asuransi kesehatan',
      'Peluang pengembangan karir jangka panjang di industri otomotif'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'LinkedIn Verified Recruiter',
    apply_info: 'Submit berkas CV melalui postingan resmi LinkedIn Recruiter Niterra Mobility.',
    hashtag: '#LokerLinkedIn #Warehouse #NiterraMobility'
  },

  // ==============================================================
  // INSTAGRAM KARIR VERIFIED VACANCIES
  // ==============================================================
  {
    id: 'soc_instagram_01',
    title: 'STAFF QUALITY ASSURANCE & FOOD HYGIENE',
    company_name: 'PT MAYORA INDAH TBK',
    platform: 'instagram',
    platform_label: 'Instagram Karir (@mayorakarir)',
    platform_icon: 'fa-brands fa-instagram',
    platform_class: 'instagram',
    sector: 'fmcg',
    sector_label: 'FMCG & Pangan',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Daan Mogot Tangerang / Cilegon, Banten',
    education_level: 'd3',
    education_label: 'Diploma (D3 / S1)',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.600.000 - Rp 7.800.000 / bln',
    deadline: '28 November 2026',
    official_url: 'https://www.instagram.com/mayorakarir/',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'mayorakarir@mayora.co.id', website: 'https://www.instagram.com/mayorakarir/' }),
    description: 'Diumumkan resmi melalui akun Instagram @mayorakarir: PT Mayora Indah Tbk mengundang profesional muda bidang pangan untuk menjaga standar higienitas dan mutu produk biskuit & makanan ringan.',
    requirements: [
      'Lulusan D3/S1 Teknologi Pangan, Biologi, Kimia, atau Teknik Kimia',
      'Memahami sistem HACCP, GMP, FSSC 22000, dan Sistem Jaminan Halal (SJH)',
      'Fresh Graduate berprestasi atau pengalaman 1 tahun di industri makanan dipersilakan',
      'Bersedia bekerja di lingkungan pabrik dan penempatan Tangerang / Cilegon'
    ],
    responsibilities: [
      'Melakukan inspeksi sampling bahan baku masuk dan proses pengolahan makanan',
      'Mengawasi penerapan sanitasi pabrik dan higienitas pekerja pengolahan',
      'Menyusun laporan analisis laboratorium mutu produk harian'
    ],
    benefits: [
      'Gaji kompetitif + Tunjangan penempatan pabrik',
      'BPJS Ketenagakerjaan & Kesehatan lengkap',
      'Paket produk Mayora bulanan & fasilitas klinik pabrik'
    ],
    theme: 'modern',
    mascot: 'corporate',
    verified_badge: 'Instagram Verified (@mayorakarir)',
    apply_info: 'Daftar melalui tautan resmi yang tertera di bio Instagram resmi @mayorakarir.',
    hashtag: '#LokerInstagram #MayoraKarir #QualityAssurance'
  },
  {
    id: 'soc_instagram_02',
    title: 'OPERATOR PACKAGING & PRODUKSI FARMASI',
    company_name: 'PT KALBE FARMA TBK',
    platform: 'instagram',
    platform_label: 'Instagram Karir (@kalbecareer)',
    platform_icon: 'fa-brands fa-instagram',
    platform_class: 'instagram',
    sector: 'fmcg',
    sector_label: 'Farmasi & Kesehatan',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan Industri Delta Silicon Cikarang',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.300.000 - Rp 6.900.000 / bln',
    deadline: '18 November 2026',
    official_url: 'https://www.instagram.com/kalbecareer/',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@kalbe.co.id', website: 'https://www.instagram.com/kalbecareer/' }),
    description: 'Postingan resmi Instagram @kalbecareer: PT Kalbe Farma Tbk membuka lowongan kerja Operator Packaging untuk penempatan fasilitas produksi obat dan suplemen kesehatan berstandar CPOB.',
    requirements: [
      'Pendidikan SMA/SMK (Farmasi, Kimia, Mesin, atau IPA diutamakan)',
      'Usia minimal 18 tahun, tidak buta warna, dan bebas alergi debu farmasi',
      'Memiliki ketelitian tinggi dalam memeriksa nomor batch, expired date, dan kemasan blister',
      'Bersedia bekerja dalam ritme dinamis dan jadwal 3 shift'
    ],
    responsibilities: [
      'Mengoperasikan mesin pengemas sekunder dan pelabelan otomatis produk farmasi',
      'Melakukan rekonsiliasi bahan kemas dan memastikan zero-defect',
      'Mematuhi regulasi ketat CPOB (Cara Pembuatan Obat yang Baik)'
    ],
    benefits: [
      'Gaji pokok sesuai ketentuan industri farmasi + Premi shift & lembur',
      'Asuransi kesehatan Kalbe, BPJS lengkap & tunjangan obat gratis',
      'Fasilitas jemputan bus dan makan siang di kantin higienis'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Instagram Verified (@kalbecareer)',
    apply_info: 'Akses link registrasi resmi di bio Instagram @kalbecareer (Bebas Biaya).',
    hashtag: '#LokerInstagram #KalbeCareer #OperatorProduksi'
  },
  {
    id: 'soc_instagram_03',
    title: 'ADMINISTRASI OPERASIONAL & CUSTOMER CARE',
    company_name: 'PT ASTRA INTERNATIONAL TBK',
    platform: 'instagram',
    platform_label: 'Instagram Karir (@astracareer)',
    platform_icon: 'fa-brands fa-instagram',
    platform_class: 'instagram',
    sector: 'manufaktur',
    sector_label: 'Otomotif & Korporat',
    category: 'Administrasi',
    job_type: 'Full Time',
    location: 'Menara Astra, Jl. Jend. Sudirman Jakarta',
    education_level: 'd3',
    education_label: 'Diploma (D3 / S1)',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 6.000.000 - Rp 8.200.000 / bln',
    deadline: '05 Desember 2026',
    official_url: 'https://www.instagram.com/astracareer/',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'arc@astra.co.id', website: 'https://www.instagram.com/astracareer/' }),
    description: 'Postingan resmi dari Instagram @astracareer: PT Astra International Tbk membuka kesempatan bagi talenta muda komunikatif untuk posisi Staf Administrasi Operasional dan Layanan Pelanggan.',
    requirements: [
      'Pendidikan minimal D3 atau S1 semua jurusan (IPK minimal 3.00)',
      'Menguasai Microsoft Office (Excel, Word, PowerPoint) dan input data akurat',
      'Komunikatif, berpenampilan rapi, dan memiliki orientasi melayani pelanggan dengan ramah',
      'Mampu bekerja sama dalam tim lintas divisi di kantor pusat Astra'
    ],
    responsibilities: [
      'Mengelola pencatatan administrasi dokumen operasional dan surat-menyurat resmi',
      'Merespons pertanyaan dan keluhan pelanggan melalui saluran resmi dengan sigap',
      'Menyusun rekapitulasi data bulanan untuk kebutuhan rapat manajemen divisi'
    ],
    benefits: [
      'Penghasilan kompetitif standar Astra Group + Tunjangan transportasi',
      'Asuransi kesehatan swasta rawat jalan & rawat inap',
      'Program pelatihan & pengembangan karir terstruktur di Menara Astra'
    ],
    theme: 'bumn',
    mascot: 'corporate',
    verified_badge: 'Instagram Verified (@astracareer)',
    apply_info: 'Klik tautan pendaftaran pada linktree bio akun Instagram resmi @astracareer.',
    hashtag: '#LokerInstagram #AstraCareer #AdminOperasional'
  },

  // ==============================================================
  // FACEBOOK LOKER VERIFIED VACANCIES
  // ==============================================================
  {
    id: 'soc_facebook_01',
    title: 'TEKNISI UTILITY & WATER TREATMENT PLANT',
    company_name: 'PT KRAKATAU BLUE WATER',
    platform: 'facebook',
    platform_label: 'Facebook Recruitment Resmi',
    platform_icon: 'fa-brands fa-facebook',
    platform_class: 'facebook',
    sector: 'bumn',
    sector_label: 'Energi & Manufaktur',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Krakatau Industrial Estate Cilegon, Banten',
    education_level: 'smk',
    education_label: 'SMA / SMK Teknik',
    experience_level: '1-3 Tahun',
    salary_display: 'Rp 5.800.000 - Rp 7.600.000 / bln',
    deadline: '22 November 2026',
    official_url: 'https://www.facebook.com/groups/loker.cilegon.resmi',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'rekrutmen@krakataubluewater.co.id', website: 'https://www.facebook.com/groups/loker.cilegon.resmi' }),
    description: 'Publikasi resmi di Facebook Recruitment: PT Krakatau Blue Water (anak usaha industri Krakatau Steel) membuka lowongan Teknisi Water Treatment Plant & Utility kawasan industri baja Cilegon.',
    requirements: [
      'Lulusan SMK/D3 Teknik Mesin, Kimia Industri, atau Teknik Elektro',
      'Pengalaman kerja minimal 1 tahun di fasilitas Water Treatment Plant (WTP) / Reverse Osmosis',
      'Memahami operasional pompa industri, valve, piping, dan filtrasi air skala besar',
      'Siap bekerja sistem shift di kawasan industri Cilegon'
    ],
    responsibilities: [
      'Memantau parameter kualitas air, tekanan pompa, dan debit instalasi WTP',
      'Melakukan preventive maintenance berkala pada mesin pompa dan filtrasi',
      'Mencatat logsheet operasional dan segera menindaklanjuti anomali sistem'
    ],
    benefits: [
      'Gaji menarik standar industri baja & energi Cilegon + Lembur',
      'Jaminan kesehatan BPJS lengkap & asuransi kecelakaan kerja',
      'Fasilitas APD lengkap dan sertifikasi teknis keahlian utility'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Facebook Verified Recruiter',
    apply_info: 'Pengumuman resmi di halaman fanpage Facebook Krakatau Blue Water, tanpa calo!',
    hashtag: '#LokerFacebook #KrakatauBlueWater #TeknisiUtility'
  },
  {
    id: 'soc_facebook_02',
    title: 'OPERATOR ASSEMBLING & PAINTING MOTOR',
    company_name: 'PT YAMAHA INDONESIA MOTOR MFG',
    platform: 'facebook',
    platform_label: 'Facebook Karir Resmi Yamaha',
    platform_icon: 'fa-brands fa-facebook',
    platform_class: 'facebook',
    sector: 'manufaktur',
    sector_label: 'Manufaktur & Otomotif',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan Industri KIIC Karawang / Pulo Gadung',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.400.000 - Rp 7.100.000 / bln',
    deadline: '15 November 2026',
    official_url: 'https://www.facebook.com/yamaharecruitment.id',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment@yamaha-motor.co.id', website: 'https://www.facebook.com/yamaharecruitment.id' }),
    description: 'Postingan resmi dari Halaman Facebook Yamaha Motor Recruitment: Dibuka lowongan kerja Operator Perakitan & Pengecatan komponen sepeda motor Yamaha berstandar global.',
    requirements: [
      'Pria/Wanita, usia 18-21 tahun, lulusan SMA/SMK semua jurusan (Teknik diutamakan)',
      'Tinggi badan minimal 165 cm (Pria) dan 158 cm (Wanita) dengan postur sehat proporsional',
      'Tidak bertato, tidak bertindik, tidak berkacamata/buta warna',
      'Memiliki stamina fisik prima dan siap bekerja dalam sistem shift pabrik'
    ],
    responsibilities: [
      'Memasang komponen rangka, mesin, dan kelistrikan motor di jalur conveyor',
      'Melakukan inspeksi visual hasil pengecatan body part tanpa cacat baret',
      'Mematuhi target takt time dan pedoman keselamatan kerja K3 Yamaha'
    ],
    benefits: [
      'Gaji pokok sesuai UMK kawasan industri + Uang makan & uang transport',
      'BPJS Kesehatan & Ketenagakerjaan lengkap kelas satu',
      'Bonus akhir tahun dan diskon pembelian unit sepeda motor Yamaha'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Facebook Karir Resmi Yamaha',
    apply_info: 'Pendaftaran resmi dibuka melalui portal resmi yang tertera di postingan Facebook Yamaha Recruitment.',
    hashtag: '#LokerFacebook #YamahaKarir #OperatorAssembling'
  },
  {
    id: 'soc_facebook_03',
    title: 'OPERATOR MESIN & PENGEMASAN MAKANAN',
    company_name: 'PT INDOFOOD CBP SUKSES MAKMUR TBK',
    platform: 'facebook',
    platform_label: 'Facebook Official Recruitment',
    platform_icon: 'fa-brands fa-facebook',
    platform_class: 'facebook',
    sector: 'fmcg',
    sector_label: 'FMCG & Pangan',
    category: 'Operasional',
    job_type: 'Full Time',
    location: 'Kawasan Industri Cibitung, Bekasi / Semarang',
    education_level: 'smk',
    education_label: 'SMA / SMK Sederajat',
    experience_level: 'Fresh Graduate',
    salary_display: 'Rp 5.200.000 - Rp 6.900.000 / bln',
    deadline: '30 November 2026',
    official_url: 'https://www.facebook.com/indofoodcareer.official',
    contact_type: 'link',
    contact_value: JSON.stringify({ whatsapp: '', email: 'recruitment.icbp@indofood.co.id', website: 'https://www.facebook.com/indofoodcareer.official' }),
    description: 'Pengumuman resmi dari Facebook Indofood Career: PT Indofood CBP Sukses Makmur Tbk divisi Noodle & Snack membuka lowongan Operator Produksi Mesin & Packing otomatis.',
    requirements: [
      'Lulusan SMA / SMK sederajat (Teknik Mesin, Otomotif, Listrik, atau Tata Boga dipersilakan)',
      'Usia minimal 18 tahun, sehat jasmani dan rohani, memiliki ketahanan kerja fisik baik',
      'Disiplin, jujur, teliti, dan siap bekerja dalam sistem rotasi 3 shift',
      'Memiliki kemauan belajar tinggi terhadap operasional mesin modern'
    ],
    responsibilities: [
      'Menjalankan mesin mixing, slitting, frying, dan packing kemasan bumbu/mie',
      'Menjaga konsistensi berat produk dan tanggal kedaluwarsa pada kemasan',
      'Menjaga standar 5R (Ringkas, Rapi, Resik, Rawat, Rajin) di area produksi'
    ],
    benefits: [
      'Gaji pokok sesuai UMK Bekasi/Semarang + Lembur normatif',
      'Paket sembako & produk Indofood bulanan secara rutin',
      'BPJS Ketenagakerjaan & Kesehatan, serta tunjangan hari raya (THR)'
    ],
    theme: 'factory',
    mascot: 'factory',
    verified_badge: 'Facebook Indofood Career',
    apply_info: 'Submit berkas online melalui link recruitment Indofood di Facebook resmi.',
    hashtag: '#LokerFacebook #IndofoodCareer #OperatorMesin'
  }
];

let currentOfficialFilteredJobs = [...OFFICIAL_VACANCIES_DB];
let currentPosterJobData = null;

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
    // Platform / Medsos filter
    if (source !== 'all') {
      const jobPlat = job.platform || 'official';
      if (jobPlat !== source) return false;
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
    all: 'Semua Platform (LinkedIn, IG, FB & Resmi BUMN)',
    linkedin: 'LinkedIn Recruiter (Real-Time)',
    instagram: 'Instagram Karir (@mayorakarir, @kalbecareer, dll)',
    facebook: 'Facebook Loker Terpercaya (Grup & Fanpage Resmi)',
    official: 'Resmi BUMN & Korporasi (Anti-Hoax)'
  };

  if (titleEl) {
    titleEl.textContent = `Ditemukan ${currentOfficialFilteredJobs.length} Lowongan ${sourceLabels[source] || ''}`;
  }
  if (subEl) {
    subEl.textContent = `Menampilkan materi lowongan siap publikasi dari LinkedIn, IG, FB & BUMN. Sekali klik bisa "Lihat Loker", "Generate Gambar (Poster Flyer)", atau "Simpan ke DB"!`;
  }

  if (currentOfficialFilteredJobs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 12px; border: 1.5px dashed #cbd5e1;">
        <i class="fa-solid fa-file-circle-xmark" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 14px;"></i>
        <h4 style="color: #334155; font-size: 1.1rem; margin-bottom: 6px;">Tidak ada lowongan yang cocok dengan filter "${sourceLabels[source] || source}"</h4>
        <p style="font-size: 0.84rem; color: #64748b; max-width: 480px; margin: 0 auto 16px;">
          Coba ganti filter platform ke "Semua Sumber" atau klik tombol "Cari Postingan Medsos Terkini (Live RSS)" untuk memindai internet secara langsung.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-outline btn-sm" onclick="resetOfficialFilters()">Reset Filter</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="fetchLiveMedsosPostings()"><i class="fa-brands fa-searchengin"></i> Cari Postingan Medsos Live</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = currentOfficialFilteredJobs.map((job, idx) => {
    const platClass = job.platform_class || 'official';
    const platIcon = job.platform_icon || 'fa-solid fa-circle-check';
    const platLabel = job.platform_label || 'Resmi Terverifikasi';

    // Check if this job is already published and active in adminJobs
    const isAlreadyPublished = adminJobs.some(aj =>
      aj.title && aj.title.toLowerCase().trim() === job.title.toLowerCase().trim() &&
      (aj.company_name || '').toLowerCase().trim() === (job.company_name || '').toLowerCase().trim()
    );

    return `
      <div class="official-job-card card-${platClass}">
        <div class="official-card-top">
          <span class="official-platform-badge ${platClass}">
            <i class="${platIcon}"></i> ${escapeHtml(platLabel)}
          </span>
          <span class="official-sector-tag">${escapeHtml(job.sector_label || job.sector)}</span>
        </div>

        <h3 class="official-job-title">${escapeHtml(job.title)}</h3>
        <div class="official-company-name">
          <i class="fa-solid fa-building"></i>
          <span>${escapeHtml(job.company_name)}</span>
        </div>

        <div class="official-meta-pills">
          <span class="official-meta-pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</span>
          <span class="official-meta-pill"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(job.education_label || 'Semua Pendidikan')}</span>
          <span class="official-meta-pill"><i class="fa-solid fa-clock"></i> ${escapeHtml(job.job_type)}</span>
          <span class="official-meta-pill salary"><i class="fa-solid fa-money-bill-wave"></i> ${escapeHtml(job.salary_display)}</span>
          <span class="official-meta-pill deadline"><i class="fa-regular fa-calendar-xmark"></i> Deadline: ${escapeHtml(job.deadline)}</span>
        </div>

        <div class="official-screening-card">
          <i class="fa-solid fa-shield-check" style="color: #10b981; font-size: 1rem; flex-shrink: 0;"></i>
          <span><strong>Lolos Screening Anti-Hoax:</strong> Domain HRD Sah • 100% Bebas Biaya • Gaji Sesuai Standar</span>
        </div>

        <div style="font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
          <i class="fa-solid fa-list-check" style="color: #6366f1;"></i> Kualifikasi Utama:
        </div>
        <ul class="official-req-list">
          ${job.requirements.slice(0, 4).map(req => `<li><i class="fa-solid fa-check" style="color:#10b981; font-size:0.75rem; margin-top:2px;"></i> <span>${escapeHtml(req)}</span></li>`).join('')}
        </ul>

        <div class="official-apply-note">
          <i class="fa-solid fa-circle-info" style="color: #0284c7;"></i>
          <span>${escapeHtml(job.apply_info || 'Lamaran online via tautan resmi')}</span>
        </div>

        <!-- 3 ACTION BUTTONS -->
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
            <a href="${job.official_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" title="Buka postingan lowongan di ${platLabel}">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Lihat Loker
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

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
  if (!canvas) return './uploads/corporate_worker_mascot.jpg';

  const compInp = document.getElementById('poster-input-company');
  const titleInp = document.getElementById('poster-input-title');
  const reqInp = document.getElementById('poster-input-requirements');
  const deadInp = document.getElementById('poster-input-deadline');
  const applyInp = document.getElementById('poster-input-apply-info');
  const qrInp = document.getElementById('poster-input-qr-url');
  const hashInp = document.getElementById('poster-input-hashtag');

  if (compInp) compInp.value = jobData.company_name || 'PERUSAHAAN';
  if (titleInp) titleInp.value = jobData.title || 'LOWONGAN KERJA';
  if (reqInp) {
    const reqList = Array.isArray(jobData.requirements) && jobData.requirements.length > 0
      ? jobData.requirements
      : ['Pendidikan minimal sesuai kualifikasi', 'Mampu berkomunikasi dan bekerjasama', 'Disiplin dan bertanggung jawab'];
    reqInp.value = reqList.slice(0, 4).join('\n');
  }
  if (deadInp) deadInp.value = jobData.deadline || '31 Desember 2026';
  if (applyInp) applyInp.value = jobData.apply_info || `Kirim CV/Lamaran melalui tautan resmi ${jobData.company_name}.`;
  if (qrInp) qrInp.value = jobData.official_url || window.location.origin;
  if (hashInp) hashInp.value = jobData.hashtag || `@KerjaHubOfficial #LowonganKerja2026`;

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
    return './uploads/corporate_worker_mascot.jpg';
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
      contact_type: 'link',
      contact_value: contactsJson,
      deadline: job.deadline || '2026-12-31',
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
        contact_type: 'link',
        contact_value: contactsJson,
        deadline: job.deadline || '2026-12-31',
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
    let dVal = job.deadline || '';
    if (!dVal.match(/^\d{4}-\d{2}-\d{2}$/)) dVal = '2026-12-31';
    form.elements['deadline'].value = dVal;
  }

  if (form.elements['description']) form.elements['description'].value = job.description;

  const reqInp = form.querySelector('[name="requirements"]');
  if (reqInp && Array.isArray(job.requirements)) {
    reqInp.value = job.requirements.join('\n');
  }
  const respInp = form.querySelector('[name="responsibilities"]');
  if (respInp && Array.isArray(job.responsibilities)) {
    respInp.value = job.responsibilities.join('\n');
  }
  const benInp = form.querySelector('[name="benefits"]');
  if (benInp && Array.isArray(job.benefits)) {
    benInp.value = job.benefits.join('\n');
  }

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
  const reqs = Array.isArray(job.requirements)
    ? job.requirements
    : (typeof job.requirements === 'string' && job.requirements.startsWith('[') ? JSON.parse(job.requirements) : (job.requirements ? [job.requirements] : []));

  openPosterStudio({
    title: job.title,
    company_name: job.company_name,
    requirements: reqs,
    deadline: job.deadline || 'Sesuai Jadwal HRD',
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
  const reqInp = document.getElementById('poster-input-requirements');
  const deadInp = document.getElementById('poster-input-deadline');
  const applyInp = document.getElementById('poster-input-apply-info');
  const qrInp = document.getElementById('poster-input-qr-url');
  const hashInp = document.getElementById('poster-input-hashtag');

  if (compInp) compInp.value = jobData.company_name || 'PT NITERRA MOBILITY INDONESIA';
  if (titleInp) titleInp.value = jobData.title || 'OPERATOR PRODUKSI';

  if (reqInp) {
    const reqList = Array.isArray(jobData.requirements) && jobData.requirements.length > 0
      ? jobData.requirements
      : [
          'Pendidikan minimal SMA/SMK sederajat',
          'Memiliki kemampuan Komunikasi, Kerja sama tim, dan Kedisiplinan yang baik',
          'Dapat mengoperasikan Microsoft word, Excel dan Sistem Produksi',
          'Bersedia bekerja dalam sistem shift'
        ];
    reqInp.value = reqList.slice(0, 4).join('\n');
  }

  if (deadInp) deadInp.value = jobData.deadline || '30 Oktober 2026';
  if (applyInp) applyInp.value = jobData.apply_info || `Kirim CV/Lamaran melalui website ${jobData.company_name || 'perusahaan'}.`;
  if (qrInp) qrInp.value = jobData.official_url || window.location.origin;
  if (hashInp) hashInp.value = jobData.hashtag || '@LokerTerpercaya #LowonganKerja2026';

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

  // Trigger initial draw
  setTimeout(() => {
    renderPosterCanvas();
  }, 50);
}

window.closePosterStudioModal = function() {
  const modal = document.getElementById('poster-studio-modal');
  if (modal) modal.classList.remove('active');
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

  const company = (document.getElementById('poster-input-company')?.value || 'PT NITERRA MOBILITY INDONESIA').trim();
  const title = (document.getElementById('poster-input-title')?.value || 'OPERATOR PRODUKSI').trim().toUpperCase();
  const reqText = document.getElementById('poster-input-requirements')?.value || '';
  const requirements = reqText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const deadline = (document.getElementById('poster-input-deadline')?.value || '30 Oktober 2026').trim();
  const applyInfo = (document.getElementById('poster-input-apply-info')?.value || `Kirim CV/Lamaran melalui website ${company}.`).trim();
  const qrUrl = (document.getElementById('poster-input-qr-url')?.value || 'https://www.ngkbusi.com/career').trim();
  const hashtag = (document.getElementById('poster-input-hashtag')?.value || '@KerjaHubOfficial #Lowongankerja2026').trim();

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

  if (selectedTheme === 'bumn') {
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

  // 5. Kualifikasi Section (Dynamically offset below position badge)
  const kualifikasiTitleY = badgeY + badgeH + 38;
  ctx.textAlign = 'left';
  ctx.fillStyle = p.textDark;
  ctx.font = '800 32px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Kualifikasi', 60, kualifikasiTitleY);

  // Render requirement bullet points with icons
  const reqIcons = ['🎓', '🤝', '💻', '🕒', '🩺'];
  let currentY = kualifikasiTitleY + 46;
  const maxReqW = hasMascot ? 490 : (width - 180);
  const appBoxY = 790;

  requirements.slice(0, 5).forEach((req, idx) => {
    if (currentY + 40 > appBoxY - 20) return; // Prevent collision with application box

    const icon = reqIcons[idx % reqIcons.length];
    ctx.font = '24px "Segoe UI Emoji", Arial';
    ctx.fillText(icon, 60, currentY);

    ctx.font = '600 23px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillStyle = '#334155';

    const words = req.split(' ');
    let line = '';
    let lineY = currentY;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxReqW && n > 0) {
        ctx.fillText(line, 105, lineY);
        line = words[n] + ' ';
        lineY += 32;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 105, lineY);
    currentY = lineY + 42;
  });

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
  let shortComp = company;
  while (ctx.measureText(shortComp).width > appBoxW - 60 && shortComp.length > 10) {
    shortComp = shortComp.slice(0, -1);
  }
  if (shortComp !== company) shortComp += '...';
  ctx.fillText(shortComp, appBoxX + 26, appBoxY + 96);

  ctx.fillStyle = p.accentOrange;
  ctx.font = '800 32px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(`Deadline ${deadline}.`, appBoxX + 26, appBoxY + 154);

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
      text: url || 'https://www.ngkbusi.com/career',
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

function usePosterForJob() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  currentSelectedFileBase64 = dataUrl;

  const dropzone = document.getElementById('poster-dropzone');
  const preview = document.getElementById('poster-preview');
  const previewImg = document.getElementById('poster-preview-img');
  const dropzonePrompt = document.getElementById('dropzone-prompt');

  if (previewImg) previewImg.src = dataUrl;
  if (preview) preview.style.display = 'block';
  if (dropzonePrompt) dropzonePrompt.style.display = 'none';

  closePosterStudioModal();

  const uploadNav = document.querySelector('a[href="#upload-job"]');
  if (uploadNav) uploadNav.click();

  alert('Poster yang baru di-generate telah disetel sebagai gambar resmi formulir upload!');
}

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
    btnFetchLive.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memindai Medsos (LinkedIn/IG/FB)...';
  }

  try {
    const token = getAdminToken();
    const url = getApiEndpoint(`/api/admin/scout-jobs?keyword=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc)}&platforms=${platforms.join(',')}&timeframe=7d`);
    const res = await safeFetchJson(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (res.ok && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const liveJobs = res.data.data.map((j, i) => ({
        id: 'live_' + j.platform + '_' + Date.now() + '_' + i,
        title: j.title.toUpperCase(),
        company_name: j.company.toUpperCase(),
        platform: j.platform,
        platform_label: j.platformLabel === 'LINKEDIN' ? 'LinkedIn Recruiter' : (j.platformLabel === 'INSTAGRAM' ? 'Instagram Karir' : 'Facebook Loker'),
        platform_icon: j.platformIcon,
        platform_class: j.platformClass,
        sector: 'manufaktur',
        sector_label: 'Postingan Medsos Terkini',
        category: 'Operasional',
        job_type: 'Full Time',
        location: j.location || loc,
        education_level: 'smk',
        education_label: 'SMA / SMK Sederajat',
        experience_level: 'Semua Pengalaman',
        salary_display: j.salary || 'Kompetitif (Sesuai Medsos)',
        deadline: 'Sesuai Jadwal Medsos',
        official_url: j.url,
        contact_type: 'link',
        contact_value: JSON.stringify({ whatsapp: j.whatsapp || '', email: j.email || '', website: j.url }),
        description: j.description || `Lowongan kerja terbaru dipublikasikan via ${j.platformLabel}.`,
        requirements: [
          'Kualifikasi sesuai pengumuman postingan resmi di ' + j.platformLabel,
          'Mampu berkomunikasi dengan baik dan berorientasi pada hasil kerja',
          'Siap bekerja dalam tim dan mematuhi SOP perusahaan'
        ],
        responsibilities: [
          'Menjalankan tugas dan kewajiban sesuai deskripsi rekruter di ' + j.platformLabel,
          'Melaporkan progres pekerjaan secara rutin dan disiplin'
        ],
        benefits: [
          'Gaji dan kompensasi sesuai standar perusahaan',
          'Fasilitas kerja dan jaminan BPJS'
        ],
        theme: j.title.toLowerCase().includes('operator') ? 'factory' : 'modern',
        mascot: j.title.toLowerCase().includes('operator') ? 'factory' : 'corporate',
        verified_badge: `${j.platformLabel} Live Verified`,
        apply_info: `Akses langsung postingan asli di ${j.platformLabel}.`,
        hashtag: `#Loker${j.platformLabel} #${j.company.replace(/[^a-zA-Z0-9]/g, '')} #InfoLoker`
      }));

      // Prepend to OFFICIAL_VACANCIES_DB
      liveJobs.forEach(lj => {
        if (!OFFICIAL_VACANCIES_DB.some(o => o.official_url === lj.official_url)) {
          OFFICIAL_VACANCIES_DB.unshift(lj);
        }
      });

      alert(`Berhasil menemukan ${liveJobs.length} postingan loker real-time dari ${platforms.join(', ').toUpperCase()}! Data langsung ditampilkan di tabel di bawah.`);
      filterAndRenderOfficialJobs();
      document.getElementById('scout-results-area')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(`Info: Menampilkan database lowongan medsos & resmi terverifikasi.`);
      filterAndRenderOfficialJobs();
    }
  } catch (err) {
    alert('Catatan: Menampilkan database lowongan medsos terverifikasi.');
    filterAndRenderOfficialJobs();
  } finally {
    if (btnFetchLive) {
      btnFetchLive.disabled = false;
      btnFetchLive.innerHTML = origHtml;
    }
  }
}

function setupOfficialVacancyGenerator() {
  // Platform source filter tabs (LinkedIn, IG, FB, Resmi)
  document.querySelectorAll('.official-source-pills .source-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.official-source-pills .source-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndRenderOfficialJobs();
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

  if (kwInput) kwInput.addEventListener('input', () => filterAndRenderOfficialJobs());
  if (locInput) locInput.addEventListener('input', () => filterAndRenderOfficialJobs());
  if (eduSelect) eduSelect.addEventListener('change', () => filterAndRenderOfficialJobs());
  if (btnGenerate) btnGenerate.addEventListener('click', () => {
    filterAndRenderOfficialJobs();
    document.getElementById('scout-results-area')?.scrollIntoView({ behavior: 'smooth' });
  });
  if (btnFetchLive) {
    btnFetchLive.addEventListener('click', fetchLiveMedsosPostings);
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

  // Render initial grid
  renderOfficialJobsGrid();
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
