// ==============================================================
// KerjaHub - Admin Panel Logic (Enhanced Multi-Contact, Lock System & Social Scout)
// ==============================================================

let sbClient = null;

async function initSupabaseClient() {
  try {
    const res = await fetch('./api/config');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.supabaseUrl && cfg.supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
        sbClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
      }
    }
  } catch (err) {
    console.warn('Config fetch error:', err);
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
    fetch('./api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storedToken}`
      },
      body: JSON.stringify({ token: storedToken })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.valid) {
          unlockDashboard();
        } else {
          sessionStorage.removeItem('kerja_admin_token');
          showLoginScreen();
        }
      })
      .catch(() => {
        unlockDashboard();
      });
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
        const res = await fetch('./api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const result = await res.json();
        if (res.ok && result.success && result.token) {
          sessionStorage.setItem('kerja_admin_token', result.token);
          unlockDashboard();
        } else {
          if (errorAlert) {
            errorText.textContent = result.message || 'Kata sandi admin salah! Silakan coba lagi.';
            errorAlert.style.display = 'flex';
          }
        }
      } catch (err) {
        if (errorAlert) {
          errorText.textContent = 'Gagal menghubungi server: ' + err.message;
          errorAlert.style.display = 'flex';
        }
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const token = sessionStorage.getItem('kerja_admin_token');
      if (token) {
        try {
          await fetch('./api/admin/logout', {
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
  const sections = ['dashboard', 'upload-job', 'manage-jobs', 'sosmed-generator', 'settings-master'];
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

    const jobPayload = {
      title,
      company_name: company,
      category: form.querySelector('[name="category"]').value,
      job_type: form.querySelector('[name="job_type"]').value,
      location: form.querySelector('[name="location"]').value,
      salary_display: form.querySelector('[name="salary_display"]').value || 'Kompetitif',
      experience_level: form.querySelector('[name="experience_level"]').value,
      deadline: form.querySelector('[name="deadline"]').value || '',
      whatsapp,
      email,
      website_url: website,
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

    // 1. Save directly to Supabase Cloud
    if (sbClient) {
      try {
        const { error } = await sbClient.from('jobs').insert([jobPayload]);
        if (!error) {
          saved = true;
        } else {
          console.warn('Supabase insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase exception:', err);
      }
    }

    // 2. Also send to local backend server if running
    try {
      const formData = new FormData(form);
      formData.set('contact_type', primaryContactType);
      formData.set('contact_value', contactValueJSON);
      formData.set('whatsapp', whatsapp);
      formData.set('email', email);
      formData.set('website_url', website);

      const token = sessionStorage.getItem('kerja_admin_token') || '';
      await fetch('./api/jobs', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      saved = true;
    } catch (err) {}

    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;

    if (saved) {
      alert('Berhasil! Poster lowongan dan saluran kontak telah tersimpan ke Supabase Cloud.');
      form.reset();
      currentSelectedFileBase64 = '';
      const btnRemove = document.getElementById('btn-remove-poster-preview');
      if (btnRemove) btnRemove.click();

      loadAdminJobs();
      loadDashboardData();
      const manageLink = document.querySelector('a[href="#manage-jobs"]');
      if (manageLink) manageLink.click();
    } else {
      alert('Info: Silakan pastikan koneksi Supabase Cloud terhubung.');
    }
  });
}

// -------------------------------------------------------------
// DASHBOARD METRICS
// -------------------------------------------------------------
async function loadDashboardData() {
  let stats = null;

  if (sbClient) {
    try {
      const { data, error } = await sbClient.from('jobs').select('*');
      if (!error && Array.isArray(data)) {
        stats = {
          totalJobs: data.length,
          activeJobs: data.filter(j => j.status === 'active').length,
          closedJobs: data.filter(j => j.status === 'closed' || j.status === 'expired').length,
          totalViews: data.reduce((a, b) => a + (b.views_count || 0), 0),
          recentJobs: data.slice(0, 5)
        };
      }
    } catch (e) {}
  }

  if (!stats) {
    try {
      const token = getAdminToken();
      const res = await fetch('./api/admin/stats', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const r = await res.json();
        if (r.success) stats = r.data;
      }
    } catch (e) {}
  }

  if (!stats) {
    stats = {
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
      totalViews: 0,
      recentJobs: []
    };
  }

  document.getElementById('stat-total-jobs') && (document.getElementById('stat-total-jobs').textContent = stats.totalJobs || 0);
  document.getElementById('stat-active-jobs') && (document.getElementById('stat-active-jobs').textContent = stats.activeJobs || 0);
  document.getElementById('stat-closed-jobs') && (document.getElementById('stat-closed-jobs').textContent = stats.closedJobs || 0);
  document.getElementById('stat-total-views') && (document.getElementById('stat-total-views').textContent = stats.totalViews || 0);

  // Render recent table in dashboard
  const recentTbody = document.getElementById('dashboard-recent-tbody');
  if (recentTbody && Array.isArray(stats.recentJobs)) {
    if (stats.recentJobs.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada lowongan terdaftar.</td></tr>`;
    } else {
      recentTbody.innerHTML = stats.recentJobs.map(job => {
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

// -------------------------------------------------------------
// LOAD ADMIN JOBS TABLE (WITH LOCK SYSTEM & MULTI-CONTACTS)
// -------------------------------------------------------------
async function loadAdminJobs() {
  const tbody = document.getElementById('admin-jobs-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data Supabase...</td></tr>`;

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
      const res = await fetch('./api/jobs?status=all');
      if (res.ok) {
        const r = await res.json();
        if (r.success && Array.isArray(r.data)) jobs = r.data;
      }
    } catch (e) {}
  }

  adminJobs = jobs || [];

  if (adminJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:#94a3b8;">Belum ada lowongan terdaftar. Klik menu "Upload Poster Baru"!</td></tr>`;
    return;
  }

  tbody.innerHTML = adminJobs.map(job => {
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
// TOGGLE JOB LOCK / EXPIRED STATUS
// -------------------------------------------------------------
window.toggleJobLock = async function(jobId, newStatus) {
  const isLocking = newStatus === 'expired' || newStatus === 'closed';
  const actionName = isLocking ? 'mengunci lowongan menjadi Expired' : 'membuka kunci lowongan menjadi Aktif';

  // 1. Update in Supabase Cloud
  if (sbClient) {
    try {
      await sbClient.from('jobs').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', jobId);
    } catch (e) {
      console.warn('Supabase toggle status error:', e);
    }
  }

  // 2. Update in server backend
  try {
    const token = sessionStorage.getItem('kerja_admin_token') || '';
    await fetch(`./api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {}

  loadAdminJobs();
  loadDashboardData();
};

// -------------------------------------------------------------
// DELETE JOB
// -------------------------------------------------------------
window.deleteJob = async function(jobId, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus lowongan "${title}"?`)) return;

  if (sbClient) {
    try {
      await sbClient.from('jobs').delete().eq('id', jobId);
    } catch (e) {}
  }

  try {
    const token = sessionStorage.getItem('kerja_admin_token') || '';
    await fetch(`./api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  } catch (e) {}

  loadAdminJobs();
  loadDashboardData();
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
      whatsapp,
      email,
      website_url: website,
      contact_type: primaryContactType,
      contact_value: contactValueJSON,
      description: form.querySelector('[name="description"]').value.trim(),
      requirements: parseLines(form.querySelector('[name="requirements"]').value),
      responsibilities: parseLines(form.querySelector('[name="responsibilities"]').value),
      benefits: parseLines(form.querySelector('[name="benefits"]').value),
      updated_at: new Date().toISOString()
    };

    // 1. Update in Supabase Cloud
    if (sbClient) {
      try {
        await sbClient.from('jobs').update(updatePayload).eq('id', jobId);
      } catch (err) {
        console.warn('Supabase update exception:', err);
      }
    }

    // 2. Also update in server backend
    try {
      const formData = new FormData(form);
      formData.set('contact_type', primaryContactType);
      formData.set('contact_value', contactValueJSON);
      formData.set('whatsapp', whatsapp);
      formData.set('email', email);
      formData.set('website_url', website);

      const token = sessionStorage.getItem('kerja_admin_token') || '';
      await fetch(`./api/jobs/${jobId}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
    } catch (err) {}

    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;
    closeEditModal();
    loadAdminJobs();
    loadDashboardData();
    alert('Perubahan lowongan & saluran kontak berhasil disimpan!');
  });
}

// -------------------------------------------------------------
// SCOUT LOKER SOSMED (LINKEDIN, INSTAGRAM, FACEBOOK GENERATOR)
// -------------------------------------------------------------
function setupSosmedScout() {
  const btnRun = document.getElementById('btn-run-scout');
  const btnToggleAll = document.getElementById('btn-toggle-all-platforms');
  const checkLi = document.getElementById('check-scout-linkedin');
  const checkIg = document.getElementById('check-scout-instagram');
  const checkFb = document.getElementById('check-scout-facebook');
  const pillLi = document.getElementById('pill-linkedin');
  const pillIg = document.getElementById('pill-instagram');
  const pillFb = document.getElementById('pill-facebook');
  const btnOpenAll = document.getElementById('btn-open-all-links');

  // Scout & Google Dork Elements
  const inputKw = document.getElementById('scout-keyword');
  const inputLoc = document.getElementById('scout-location');
  const liveDorkQuery = document.getElementById('live-dork-query');
  const btnOpenDork = document.getElementById('btn-open-dork-direct');
  const btnCopyDork = document.getElementById('btn-copy-dork');

  function getSelectedPlatforms() {
    const plats = [];
    if (checkLi && checkLi.checked) plats.push('linkedin');
    if (checkIg && checkIg.checked) plats.push('instagram');
    if (checkFb && checkFb.checked) plats.push('facebook');
    return plats;
  }

  function getSelectedTimeframe() {
    const checkedRadio = document.querySelector('input[name="scout_timeframe"]:checked');
    return checkedRadio ? checkedRadio.value : '7d';
  }

  function refreshLiveDork() {
    const kw = (inputKw?.value || '').trim();
    const loc = (inputLoc?.value || '').trim();
    const plats = getSelectedPlatforms();
    const tf = getSelectedTimeframe();

    const dork = generateGoogleDorkQuery({
      kata_kunci: kw,
      lokasi: loc,
      platforms: plats,
      timeframe: tf
    });

    if (liveDorkQuery) liveDorkQuery.value = dork.query_dork;
    if (btnOpenDork) btnOpenDork.href = dork.url_google;
    return dork;
  }

  // Toggle active class on label clicks & refresh live dork
  [
    { check: checkLi, pill: pillLi },
    { check: checkIg, pill: pillIg },
    { check: checkFb, pill: pillFb }
  ].forEach(item => {
    if (item.check && item.pill) {
      item.check.addEventListener('change', () => {
        item.pill.classList.toggle('active', item.check.checked);
        refreshLiveDork();
      });
    }
  });

  // Timeframe radio change listeners
  const timeframeRadios = document.querySelectorAll('input[name="scout_timeframe"]');
  timeframeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.timeframe-pill').forEach(pill => {
        pill.classList.remove('active');
        pill.style.borderColor = '#cbd5e1';
        pill.style.background = '#ffffff';
        pill.style.color = '#475569';
      });
      const activePill = document.getElementById(`pill-time-${radio.value}`);
      if (activePill) {
        activePill.classList.add('active');
        activePill.style.borderColor = '#6366f1';
        activePill.style.background = '#eef2ff';
        activePill.style.color = '#4338ca';
      }
      refreshLiveDork();
    });
  });

  // Live input typing listeners
  if (inputKw) inputKw.addEventListener('input', refreshLiveDork);
  if (inputLoc) inputLoc.addEventListener('input', refreshLiveDork);

  // Copy query to clipboard button
  if (btnCopyDork) {
    btnCopyDork.addEventListener('click', async () => {
      const q = liveDorkQuery?.value || '';
      if (!q) return;
      try {
        await navigator.clipboard.writeText(q);
        const orig = btnCopyDork.innerHTML;
        btnCopyDork.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i> Tersalin!';
        setTimeout(() => {
          btnCopyDork.innerHTML = orig;
        }, 2000);
      } catch (e) {
        if (liveDorkQuery) {
          liveDorkQuery.select();
          document.execCommand('copy');
          alert('Query Google Dork berhasil disalin!');
        }
      }
    });
  }

  // Toggle Select All
  if (btnToggleAll) {
    btnToggleAll.addEventListener('click', () => {
      const allChecked = checkLi.checked && checkIg.checked && checkFb.checked;
      const targetState = !allChecked;

      checkLi.checked = targetState;
      checkIg.checked = targetState;
      checkFb.checked = targetState;

      pillLi.classList.toggle('active', targetState);
      pillIg.classList.toggle('active', targetState);
      pillFb.classList.toggle('active', targetState);

      refreshLiveDork();
    });
  }

  // Initialize live dork on page load
  refreshLiveDork();

  // Run Scout Generator
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const keyword = (inputKw?.value || '').trim() || 'Software Engineer';
      const location = (inputLoc?.value || '').trim() || 'Indonesia';
      const platforms = getSelectedPlatforms();
      const timeframe = getSelectedTimeframe();

      if (platforms.length === 0) {
        alert('Harap pilih minimal satu media sosial (LinkedIn, Instagram, atau Facebook)!');
        return;
      }

      runSosmedScoutGenerator(keyword, location, platforms, timeframe);
    });
  }

  // Open All Links in new tabs
  if (btnOpenAll) {
    btnOpenAll.addEventListener('click', () => {
      const links = document.querySelectorAll('#scout-deep-links-container a');
      if (links.length === 0) return;
      links.forEach(a => {
        window.open(a.href, '_blank');
      });
    });
  }
}

async function runSosmedScoutGenerator(keyword, location, platforms, timeframe = '7d') {
  const resultsArea = document.getElementById('scout-results-area');
  const titleEl = document.getElementById('scout-results-summary-title');
  const deepLinksContainer = document.getElementById('scout-deep-links-container');
  const postingsContainer = document.getElementById('scout-postings-container');

  if (!resultsArea || !deepLinksContainer || !postingsContainer) return;

  resultsArea.style.display = 'block';
  const tfLabel = timeframe === '24h' ? '24 Jam Terakhir' : (timeframe === '30d' ? '30 Hari Terakhir' : '7 Hari Terakhir');
  if (titleEl) titleEl.textContent = `Mencari Postingan Terbaru (${tfLabel}): "${keyword}" di ${location}...`;

  // Deep search shortcut links
  const encKw = encodeURIComponent(keyword);
  const encLoc = encodeURIComponent(location);
  const cleanTag = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');

  const deepLinks = [];
  if (platforms.includes('linkedin')) {
    deepLinks.push({
      platform: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      color: '#0a66c2',
      label: 'LinkedIn Jobs Search (Terbaru)',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encKw}&location=${encLoc}&f_TPR=r604800`
    });
    deepLinks.push({
      platform: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      color: '#0a66c2',
      label: 'LinkedIn Feed Posts Loker',
      url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword + ' loker ' + location)}&origin=GLOBAL_SEARCH_HEADER&sortBy=%22date_posted%22&datePosted=%22past-week%22`
    });
  }

  if (platforms.includes('instagram')) {
    deepLinks.push({
      platform: 'Instagram',
      icon: 'fa-brands fa-instagram',
      color: '#e1306c',
      label: `Instagram Hashtag #${cleanTag}`,
      url: `https://www.instagram.com/explore/tags/loker${cleanTag}/`
    });
    deepLinks.push({
      platform: 'Instagram',
      icon: 'fa-brands fa-instagram',
      color: '#e1306c',
      label: 'Instagram Explore Loker',
      url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent('loker ' + keyword)}`
    });
  }

  if (platforms.includes('facebook')) {
    deepLinks.push({
      platform: 'Facebook',
      icon: 'fa-brands fa-facebook',
      color: '#1877f2',
      label: 'Facebook Group Loker',
      url: `https://www.facebook.com/search/groups/?q=${encodeURIComponent('lowongan kerja ' + keyword + ' ' + location)}`
    });
    deepLinks.push({
      platform: 'Facebook',
      icon: 'fa-brands fa-facebook',
      color: '#1877f2',
      label: 'Facebook Postingan Loker Terbaru',
      url: `https://www.facebook.com/search/posts/?q=${encodeURIComponent('loker ' + keyword + ' ' + location + ' terbaru')}`
    });
  }

  const dorkObj = generateGoogleDorkQuery({ kata_kunci: keyword, lokasi: location, platforms, timeframe });
  deepLinks.push({
    platform: 'Multi-Sosmed',
    icon: 'fa-brands fa-google',
    color: '#4f46e5',
    label: `Google Dork (${platforms.map(p => p.toUpperCase()).join(' & ')}) • ${tfLabel}`,
    url: dorkObj.url_google
  });

  deepLinksContainer.innerHTML = deepLinks.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="deep-link-item">
      <div class="platform-info">
        <i class="${link.icon}" style="color: ${link.color}; font-size: 1.25rem;"></i>
        <span>${escapeHtml(link.label)}</span>
      </div>
      <i class="fa-solid fa-arrow-up-right-from-square" style="color: #94a3b8; font-size: 0.8rem;"></i>
    </a>
  `).join('');

  // Show loading state
  postingsContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.2rem; color: #6366f1; margin-bottom: 14px;"></i>
      <h4 style="font-family: var(--font-heading); color: #1e293b; margin-bottom: 6px;">Memindai Postingan Terbaru & Menyingkirkan Lowongan Kedaluwarsa...</h4>
      <p style="font-size: 0.84rem; color: #64748b;">Memfilter postingan aktif (${tfLabel}) di LinkedIn, Instagram, dan Facebook untuk "${escapeHtml(keyword)}" di ${escapeHtml(location)}.</p>
    </div>
  `;
  resultsArea.scrollIntoView({ behavior: 'smooth' });

  // Call real-time scout API
  try {
    const token = getAdminToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`./api/admin/scout-jobs?keyword=${encKw}&location=${encLoc}&platforms=${platforms.join(',')}&timeframe=${encodeURIComponent(timeframe)}`, { headers });
    const json = await res.json();

    if (!json.success || !json.data || json.data.length === 0) {
      if (titleEl) titleEl.textContent = `Belum Menemukan Postingan Baru (${tfLabel}) untuk "${keyword}"`;
      postingsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 2rem; color: #94a3b8; margin-bottom: 12px;"></i>
          <h4 style="color: #334155; margin-bottom: 6px;">Tidak ada postingan baru pada rentang ${tfLabel}</h4>
          <p style="font-size: 0.84rem; color: #64748b; max-width: 520px; margin: 0 auto 16px;">
            Sistem otomatis menolak postingan lama yang sudah kedaluwarsa. Coba ganti rentang waktu ke "30 Hari Terakhir" atau klik salah satu tautan pencarian langsung di atas.
          </p>
        </div>
      `;
      return;
    }

    const realPosts = json.data;
    window._scoutPostings = realPosts;

    if (titleEl) titleEl.textContent = `Ditemukan ${realPosts.length} Postingan Terbaru (${tfLabel}) untuk "${keyword}" di ${location}`;

    postingsContainer.innerHTML = realPosts.map((post, idx) => `
      <div class="scout-card">
        <div class="scout-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span class="platform-badge ${post.platformClass}">
            <i class="${post.platformIcon}"></i> ${post.platformLabel}
          </span>
          <span style="font-size: 0.73rem; background: ${post.badgeColor || '#6366f1'}15; color: ${post.badgeColor || '#4338ca'}; border: 1px solid ${post.badgeColor || '#6366f1'}35; font-weight: 700; padding: 3px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-regular fa-clock"></i> ${escapeHtml(post.timeAgo || 'Baru Saja')}
          </span>
        </div>

        <div class="scout-card-title">${escapeHtml(post.title)}</div>
        <div class="scout-card-source"><i class="fa-solid fa-building"></i> ${escapeHtml(post.sourceName || post.company)}</div>

        <p class="scout-card-snippet">${escapeHtml(post.description)}</p>

        <div style="font-size: 0.76rem; color: #059669; font-weight: 700; margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
          <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(post.location)}</span>
          ${post.whatsapp ? `<span style="color: #25d366;"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(post.whatsapp)}</span>` : ''}
          ${post.email ? `<span style="color: #3b82f6;"><i class="fa-solid fa-envelope"></i> ${escapeHtml(post.email)}</span>` : ''}
        </div>

        <div class="scout-card-actions">
          <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex: 1.2;" title="Buka tautan postingan asli di media sosial">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Postingan Asli
          </a>
          <button type="button" class="btn btn-primary btn-sm" onclick="applyScoutDraftToUploadForm(${idx})" style="flex: 1.1;" title="Isi form upload dengan rincian ini">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Jadikan Draft
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Scout fetch error:', err);
    postingsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; color: #9f1239;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.8rem; margin-bottom: 10px;"></i>
        <p style="font-weight: 700;">Gagal memuat postingan real-time (${escapeHtml(err.message)})</p>
        <p style="font-size: 0.8rem;">Gunakan tautan pencarian langsung di atas untuk membuka media sosial secara instan.</p>
      </div>
    `;
  }
}

// Helper: category guesser
function getCategoryForKeyword(kw) {
  const k = kw.toLowerCase();
  if (k.includes('design') || k.includes('ui') || k.includes('ux') || k.includes('grafis') || k.includes('illustrator')) return 'Design & Kreatif';
  if (k.includes('dev') || k.includes('react') || k.includes('node') || k.includes('web') || k.includes('program') || k.includes('tech')) return 'Teknologi & IT';
  if (k.includes('market') || k.includes('sales') || k.includes('seo') || k.includes('ads') || k.includes('sosmed')) return 'Marketing & Penjualan';
  if (k.includes('data') || k.includes('ai') || k.includes('machine') || k.includes('python')) return 'Data & AI';
  if (k.includes('admin') || k.includes('keuangan') || k.includes('finance') || k.includes('accounting')) return 'Administrasi & Keuangan';
  if (k.includes('product') || k.includes('pm') || k.includes('scrum')) return 'Manajemen Produk';
  return 'Lainnya';
}

// 1-Click apply generated post to upload form
window.applyScoutDraftToUploadForm = function(postIndex) {
  if (!window._scoutPostings || !window._scoutPostings[postIndex]) return;
  const post = window._scoutPostings[postIndex];

  const uploadForm = document.getElementById('form-upload-job');
  if (!uploadForm) return;

  uploadForm.querySelector('[name="title"]').value = post.title || '';
  uploadForm.querySelector('[name="company_name"]').value = post.company || '';
  uploadForm.querySelector('[name="location"]').value = post.location || '';
  uploadForm.querySelector('[name="description"]').value = post.description || '';

  if (post.whatsapp && uploadForm.querySelector('[name="whatsapp"]')) {
    uploadForm.querySelector('[name="whatsapp"]').value = post.whatsapp;
  }
  if (post.email && uploadForm.querySelector('[name="email"]')) {
    uploadForm.querySelector('[name="email"]').value = post.email;
  }
  if (post.url && uploadForm.querySelector('[name="website"]')) {
    uploadForm.querySelector('[name="website"]').value = post.url;
  }

  // Set category if matches
  const catSelect = uploadForm.querySelector('[name="category"]');
  if (catSelect) {
    const guessedCat = getCategoryForKeyword(post.title || '');
    for (let opt of catSelect.options) {
      if (opt.value === guessedCat || opt.text === guessedCat) {
        catSelect.value = opt.value;
        break;
      }
    }
  }

  // Switch to upload tab
  const uploadNav = document.querySelector('a[href="#upload-job"]');
  if (uploadNav) uploadNav.click();

  alert(`Draf lowongan untuk "${post.title}" berhasil disiapkan di formulir upload! Silakan lampirkan flyer poster dan klik Publikasikan.`);
};

// -------------------------------------------------------------
// MASTER DATA MANAGEMENT (Kategori, Tipe, Level, Lokasi)
// -------------------------------------------------------------
let currentMasterData = {
  categories: [],
  job_types: [],
  experience_levels: [],
  locations: []
};

async function loadMasterData() {
  try {
    const res = await fetch('./api/master-data');
    const json = await res.json();
    if (json.success && json.data) {
      currentMasterData = json.data;
      renderMasterDataChips();
      populateMasterSelectOptions();
    }
  } catch (err) {
    console.error('Failed to load master data:', err);
  }
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

        try {
          const res = await fetch('./api/master-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, name: val })
          });
          const json = await res.json();
          if (json.success) {
            input.value = '';
            await loadMasterData();
          } else {
            alert(json.message || 'Gagal menambahkan item.');
          }
        } catch (err) {
          alert('Terjadi kesalahan: ' + err.message);
        } finally {
          btn.disabled = false;
          btn.innerHTML = origBtn;
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
      try {
        const res = await fetch('./api/master-data/reset', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          await loadMasterData();
          alert('Master data berhasil dikembalikan ke pengaturan awal!');
        }
      } catch (err) {
        alert('Gagal mereset: ' + err.message);
      }
    });
  }
}

window.deleteMasterItem = async function(typeKey, id, name) {
  if (!confirm(`Hapus "${name}" dari ${typeKey}?`)) return;
  const token = getAdminToken();
  try {
    const res = await fetch('./api/master-data', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: typeKey, id, name })
    });
    const json = await res.json();
    if (json.success) {
      await loadMasterData();
    } else {
      alert(json.message || 'Gagal menghapus item.');
    }
  } catch (err) {
    alert('Terjadi kesalahan: ' + err.message);
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
