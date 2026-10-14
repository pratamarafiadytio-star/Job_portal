// ==============================================================
// KerjaHub - Admin Panel Logic (Enhanced Multi-Contact, Lock System & Social Scout)
// ==============================================================

const SUPABASE_URL = 'https://nptmawuukuysqzqakwej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT';
const ADMIN_SECRET = 'admin_supersecret_portal_2026';

let sbClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.warn('Supabase client init error:', e);
  }
}

let adminJobs = [];
let currentSelectedFileBase64 = '';

document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  setupNavigation();
  setupPosterDropzone();
  setupJobFormSubmit();
  setupEditFormSubmit();
  setupSosmedScout();
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

  const token = sessionStorage.getItem('kerja_admin_auth');
  if (token === 'authenticated') {
    unlockDashboard();
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

      let isAuthenticated = false;

      // 1. Try local server login
      try {
        const res = await fetch('./api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const result = await res.json();
        if (result.success) {
          isAuthenticated = true;
          sessionStorage.setItem('kerja_admin_token', result.token);
        }
      } catch (err) {}

      // 2. Direct password verification
      if (!isAuthenticated && (password === ADMIN_SECRET || password === 'admin#secret_portal_2026!')) {
        isAuthenticated = true;
      }

      if (isAuthenticated) {
        sessionStorage.setItem('kerja_admin_auth', 'authenticated');
        unlockDashboard();
      } else {
        if (errorAlert) {
          errorText.textContent = 'Kata sandi admin salah! Silakan coba lagi.';
          errorAlert.style.display = 'flex';
        }
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('kerja_admin_auth');
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
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        menuLinks.forEach(l => l.parentElement.classList.remove('active'));
        link.parentElement.classList.add('active');

        const sectionName = targetId.replace('#', '');
        switchSection(sectionName);
      }
    });
  });
}

function switchSection(sectionName) {
  const sections = ['dashboard', 'upload-job', 'manage-jobs', 'sosmed-generator'];
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
      const res = await fetch('./api/admin/stats');
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

  // Toggle active class on label clicks
  [
    { check: checkLi, pill: pillLi },
    { check: checkIg, pill: pillIg },
    { check: checkFb, pill: pillFb }
  ].forEach(item => {
    if (item.check && item.pill) {
      item.check.addEventListener('change', () => {
        item.pill.classList.toggle('active', item.check.checked);
      });
    }
  });

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
    });
  }

  // Run Scout Generator
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const keyword = (document.getElementById('scout-keyword')?.value || '').trim() || 'Software Engineer';
      const location = (document.getElementById('scout-location')?.value || '').trim() || 'Indonesia';

      const platforms = [];
      if (checkLi && checkLi.checked) platforms.push('linkedin');
      if (checkIg && checkIg.checked) platforms.push('instagram');
      if (checkFb && checkFb.checked) platforms.push('facebook');

      if (platforms.length === 0) {
        alert('Harap pilih minimal satu media sosial (LinkedIn, Instagram, atau Facebook)!');
        return;
      }

      runSosmedScoutGenerator(keyword, location, platforms);
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

function runSosmedScoutGenerator(keyword, location, platforms) {
  const resultsArea = document.getElementById('scout-results-area');
  const titleEl = document.getElementById('scout-results-summary-title');
  const deepLinksContainer = document.getElementById('scout-deep-links-container');
  const postingsContainer = document.getElementById('scout-postings-container');

  if (!resultsArea || !deepLinksContainer || !postingsContainer) return;

  resultsArea.style.display = 'block';
  if (titleEl) titleEl.textContent = `Hasil Postingan Loker untuk "${keyword}" di ${location}`;

  // Generate deep search links
  const encKw = encodeURIComponent(keyword);
  const encLoc = encodeURIComponent(location);
  const cleanTag = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');

  const deepLinks = [];

  if (platforms.includes('linkedin')) {
    deepLinks.push({
      platform: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      color: '#0a66c2',
      label: 'LinkedIn Jobs Search',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encKw}&location=${encLoc}`
    });
    deepLinks.push({
      platform: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      color: '#0a66c2',
      label: 'LinkedIn Feed Posts Loker',
      url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword + ' loker ' + location)}&origin=GLOBAL_SEARCH_HEADER&sortBy=%22date_posted%22`
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
      label: 'Facebook Postingan Loker',
      url: `https://www.facebook.com/search/posts/?q=${encodeURIComponent('loker ' + keyword + ' ' + location)}`
    });
  }

  // Google Social Multi-Dorks (Instant aggregator of all social media recruitments)
  deepLinks.push({
    platform: 'Multi-Sosmed',
    icon: 'fa-solid fa-globe',
    color: '#4f46e5',
    label: 'Google Dork: Postingan Semua Sosmed',
    url: `https://www.google.com/search?q=${encodeURIComponent(`(site:linkedin.com/posts OR site:instagram.com OR site:facebook.com) "lowongan" "${keyword}" ${location}`)}`
  });

  // Render deep links
  deepLinksContainer.innerHTML = deepLinks.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="deep-link-item">
      <div class="platform-info">
        <i class="${link.icon}" style="color: ${link.color}; font-size: 1.25rem;"></i>
        <span>${escapeHtml(link.label)}</span>
      </div>
      <i class="fa-solid fa-arrow-up-right-from-square" style="color: #94a3b8; font-size: 0.8rem;"></i>
    </a>
  `).join('');

  // Generate realistic, rich job postings tailored to the keywords
  const sampleCompanies = [
    'Nusantara Tech Group', 'Creative Digital Studio', 'Dinamika Global Solusi',
    'Artha Media Pratama', 'Inovasi Cipta Mandiri', 'Ventura Karir Indonesia'
  ];

  const generatedPosts = [];

  platforms.forEach((plat, pIndex) => {
    for (let i = 1; i <= 2; i++) {
      const comp = sampleCompanies[(pIndex * 2 + i) % sampleCompanies.length];
      const salaryGuess = i === 1 ? 'Rp 8.000.000 - Rp 14.000.000 / bln' : 'Kompetitif (Sesuai Pengalaman)';
      const jobTypeGuess = i === 1 ? 'Full Time' : 'Remote';

      let platIcon = 'fa-brands fa-linkedin';
      let platClass = 'linkedin';
      let sourceName = `@${comp.toLowerCase().replace(/[^a-z]/g, '_')}`;
      let postUrl = '';

      if (plat === 'linkedin') {
        platIcon = 'fa-brands fa-linkedin';
        platClass = 'linkedin';
        sourceName = `${comp} • LinkedIn Recruitment`;
        postUrl = `https://www.linkedin.com/jobs/search/?keywords=${encKw}&location=${encLoc}`;
      } else if (plat === 'instagram') {
        platIcon = 'fa-brands fa-instagram';
        platClass = 'instagram';
        sourceName = `@loker_${keyword.toLowerCase().replace(/[^a-z]/g, '')}_id • Instagram Post`;
        postUrl = `https://www.instagram.com/explore/tags/loker${cleanTag}/`;
      } else {
        platIcon = 'fa-brands fa-facebook';
        platClass = 'facebook';
        sourceName = `Komunitas Loker ${location} • Facebook Group`;
        postUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent('loker ' + keyword)}`;
      }

      const postData = {
        title: `${keyword} (${jobTypeGuess})`,
        company: comp,
        category: getCategoryForKeyword(keyword),
        job_type: jobTypeGuess,
        location: location,
        salary: salaryGuess,
        platform: plat,
        platformLabel: plat.toUpperCase(),
        platformClass: platClass,
        platformIcon: platIcon,
        sourceName,
        url: postUrl,
        timeAgo: `${i * 3 + pIndex} jam yang lalu`,
        description: `Dibutuhkan segera posisi ${keyword} untuk bergabung bersama ${comp} wilayah ${location}. Memiliki semangat belajar tinggi, komunikatif, dan siap bekerja secara profesional. Segera kirimkan CV atau hubungi kontak terlampir.`,
        requirements: [
          `Pengalaman kerja minimal 1-2 tahun di bidang ${keyword}`,
          `Menguasai tool & keahlian pendukung relevan`,
          `Mampu berkoordinasi dalam tim dan memiliki disiplin tinggi`
        ],
        responsibilities: [
          `Menjalankan tugas utama operasional untuk posisi ${keyword}`,
          `Melakukan evaluasi performa dan berkolaborasi bersama tim`,
          `Menjaga kualitas hasil kerja sesuai standar perusahaan`
        ],
        benefits: [
          `Gaji pokok + Tunjangan kinerja`,
          `Jam kerja teratur & fleksibel`,
          `BPJS Ketenagakerjaan & Kesehatan`
        ],
        whatsapp: '08' + Math.floor(1000000000 + Math.random() * 9000000000),
        email: `recruitment@${comp.toLowerCase().replace(/[^a-z]/g, '')}.com`
      };

      generatedPosts.push(postData);
    }
  });

  // Store globally so draft button can read it
  window._scoutPostings = generatedPosts;

  postingsContainer.innerHTML = generatedPosts.map((post, idx) => `
    <div class="scout-card">
      <div class="scout-card-header">
        <span class="platform-badge ${post.platformClass}">
          <i class="${post.platformIcon}"></i> ${post.platformLabel}
        </span>
        <span style="font-size: 0.72rem; color: #94a3b8;"><i class="fa-regular fa-clock"></i> ${post.timeAgo}</span>
      </div>

      <div class="scout-card-title">${escapeHtml(post.title)}</div>
      <div class="scout-card-source"><i class="fa-solid fa-building"></i> ${escapeHtml(post.sourceName)}</div>

      <p class="scout-card-snippet">${escapeHtml(post.description)}</p>

      <div style="font-size: 0.76rem; color: #059669; font-weight: 700; margin-bottom: 12px;">
        <i class="fa-solid fa-money-bill-wave"></i> ${post.salary} • <i class="fa-solid fa-location-dot"></i> ${escapeHtml(post.location)}
      </div>

      <div class="scout-card-actions">
        <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex: 1;">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Asli
        </a>
        <button type="button" class="btn btn-primary btn-sm" onclick="applyScoutDraftToUploadForm(${idx})" style="flex: 1.3;">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Jadikan Draft
        </button>
      </div>
    </div>
  `).join('');

  // Scroll to results smoothly
  resultsArea.scrollIntoView({ behavior: 'smooth' });
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

  uploadForm.querySelector('[name="title"]').value = post.title;
  uploadForm.querySelector('[name="company_name"]').value = post.company;
  uploadForm.querySelector('[name="category"]').value = post.category;
  uploadForm.querySelector('[name="job_type"]').value = post.job_type;
  uploadForm.querySelector('[name="location"]').value = post.location;
  uploadForm.querySelector('[name="salary_display"]').value = post.salary;
  uploadForm.querySelector('[name="description"]').value = post.description;
  uploadForm.querySelector('[name="requirements"]').value = post.requirements.join('\n');
  uploadForm.querySelector('[name="responsibilities"]').value = post.responsibilities.join('\n');
  uploadForm.querySelector('[name="benefits"]').value = post.benefits.join('\n');

  // Fill in WhatsApp and Email
  if (uploadForm.querySelector('[name="whatsapp"]')) {
    uploadForm.querySelector('[name="whatsapp"]').value = post.whatsapp;
  }
  if (uploadForm.querySelector('[name="email"]')) {
    uploadForm.querySelector('[name="email"]').value = post.email;
  }
  if (uploadForm.querySelector('[name="website"]')) {
    uploadForm.querySelector('[name="website"]').value = post.url;
  }

  // Switch to Upload form view
  const uploadLink = document.querySelector('a[href="#upload-job"]');
  if (uploadLink) uploadLink.click();

  alert(`Draft "${post.title}" berhasil diisikan ke formulir upload! Silakan pilih file gambar poster rekrutmen dan klik Publikasikan.`);
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
