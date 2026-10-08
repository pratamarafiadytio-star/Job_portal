// ==============================================================
// KerjaHub - Admin Panel Logic (Supabase Cloud & Online Ready)
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

document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  setupNavigation();
  setupPosterDropzone();
  setupJobFormSubmit();
  setupEditFormSubmit();
});

// Auth Guard & Login Screen
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

      // Check password (both server and client side check)
      let isAuthenticated = false;

      // 1. Try local server login if available
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

      // 2. Direct password verification for static GitHub Pages host
      if (!isAuthenticated && password === ADMIN_SECRET) {
        isAuthenticated = true;
      }

      if (isAuthenticated) {
        sessionStorage.setItem('kerja_admin_auth', 'authenticated');
        unlockDashboard();
      } else {
        if (errorAlert) {
          errorText.textContent = 'Kata sandi admin salah! Silakan coba lagi.';
          errorAlert.style.display = 'block';
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
  document.getElementById('admin-login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard-app').style.display = 'none';
}

function unlockDashboard() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-dashboard-app').style.display = 'flex';
  loadDashboardData();
  loadAdminJobs();
}

// Sidebar Navigation
function setupNavigation() {
  const menuLinks = document.querySelectorAll('.menu-item a');
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
  const sections = ['dashboard', 'upload-job', 'manage-jobs'];
  sections.forEach(sec => {
    const el = document.getElementById(`section-${sec}`);
    if (el) el.style.display = (sec === sectionName) ? 'block' : 'none';
  });

  const titleEl = document.getElementById('admin-page-title');
  const subEl = document.getElementById('admin-page-sub');

  if (sectionName === 'dashboard') {
    if (titleEl) titleEl.textContent = 'Dashboard Lowongan';
    if (subEl) subEl.textContent = 'Kelola poster online & database Supabase Cloud.';
    loadDashboardData();
  } else if (sectionName === 'upload-job') {
    if (titleEl) titleEl.textContent = 'Upload Poster & Lowongan Baru';
    if (subEl) subEl.textContent = 'Unggah gambar flyer desain dan rincian kualifikasi posisi.';
  } else if (sectionName === 'manage-jobs') {
    if (titleEl) titleEl.textContent = 'Daftar Semua Lowongan';
    if (subEl) subEl.textContent = 'Lihat, ubah status, edit, atau hapus lowongan terdaftar.';
    loadAdminJobs();
  }
}

// Poster Upload Drag & Drop Preview
let currentSelectedFileBase64 = '';

function setupPosterDropzone() {
  const dropzone = document.getElementById('poster-dropzone');
  const fileInput = document.getElementById('poster-file-input');
  const previewImg = document.getElementById('poster-preview-img');
  const placeholder = document.getElementById('poster-preview-placeholder');
  const removeBtn = document.getElementById('btn-remove-poster-preview');

  if (!dropzone || !fileInput) return;

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
      previewImg.src = currentSelectedFileBase64;
      previewImg.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      if (removeBtn) removeBtn.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      currentSelectedFileBase64 = '';
      previewImg.src = '';
      previewImg.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
      removeBtn.style.display = 'none';
    });
  }
}

// Upload Job Submission (Writes to Supabase Cloud)
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
      contact_type: form.querySelector('[name="contact_type"]').value,
      contact_value: form.querySelector('[name="contact_value"]').value.trim(),
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
      alert('Berhasil! Poster lowongan telah disimpan ke Supabase Cloud.');
      form.reset();
      currentSelectedFileBase64 = '';
      const btnRemove = document.getElementById('btn-remove-poster-preview');
      if (btnRemove) btnRemove.click();

      loadAdminJobs();
      loadDashboardData();
      const manageLink = document.querySelector('a[href="#manage-jobs"]');
      if (manageLink) manageLink.click();
    } else {
      alert('Info: Silakan pastikan tabel `jobs` di Supabase SQL Editor sudah di-run (lihat file schema.sql)!');
    }
  });
}

// Load Dashboard Metrics
async function loadDashboardData() {
  let stats = null;

  if (sbClient) {
    try {
      const { data, error } = await sbClient.from('jobs').select('*');
      if (!error && Array.isArray(data)) {
        stats = {
          totalJobs: data.length,
          activeJobs: data.filter(j => j.status === 'active').length,
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
      totalJobs: 3,
      activeJobs: 3,
      totalViews: 529,
      recentJobs: []
    };
  }

  document.getElementById('stat-total-jobs').textContent = stats.totalJobs || 0;
  document.getElementById('stat-active-jobs').textContent = stats.activeJobs || 0;
  document.getElementById('stat-total-views').textContent = stats.totalViews || 0;
}

// Load Admin Jobs Table
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

    const statusBadge = job.status === 'active' ? 'badge-active' : 'badge-closed';

    let contactDisplay = '-';
    if (job.contact_value) {
      contactDisplay = job.contact_type === 'whatsapp' 
        ? `<span style="color:#059669; font-weight:600;"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(job.contact_value)}</span>`
        : `<span style="color:#4f46e5;"><i class="fa-solid fa-link"></i> ${escapeHtml(job.contact_value)}</span>`;
    }

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
        <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${contactDisplay}</td>
        <td>
          <button class="badge ${statusBadge}" style="cursor:pointer; border:none;" onclick="toggleJobStatus(${job.id}, '${job.status}')" title="Klik untuk ubah status">
            ${job.status} <i class="fa-solid fa-rotate" style="font-size:0.65rem; margin-left:3px;"></i>
          </button>
        </td>
        <td>${job.views_count || 0}</td>
        <td><small>${new Date(job.created_at).toLocaleDateString('id-ID')}</small></td>
        <td>
          <div class="action-buttons">
            <a href="./?job=${job.id}" target="_blank" class="btn-table" title="Lihat di Web Publik"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <button class="btn-table" onclick="openEditJobModal(${job.id})" title="Edit Lowongan"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-table delete" onclick="deleteJob(${job.id}, '${escapeHtml(job.title)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Status
async function toggleJobStatus(jobId, currentStatus) {
  const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
  if (sbClient) {
    await sbClient.from('jobs').update({ status: nextStatus }).eq('id', jobId);
  }
  loadAdminJobs();
  loadDashboardData();
}

// Delete Job
async function deleteJob(jobId, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus lowongan "${title}"?`)) return;

  if (sbClient) {
    await sbClient.from('jobs').delete().eq('id', jobId);
  }
  loadAdminJobs();
  loadDashboardData();
}

// Open Edit Modal
function openEditJobModal(jobId) {
  const job = adminJobs.find(j => j.id === jobId);
  if (!job) return;

  const modal = document.getElementById('edit-job-modal');
  const form = document.getElementById('form-edit-job');
  if (!modal || !form) return;

  form.querySelector('[name="id"]').value = job.id;
  form.querySelector('[name="title"]').value = job.title;
  form.querySelector('[name="company_name"]').value = job.company_name;
  form.querySelector('[name="category"]').value = job.category;
  form.querySelector('[name="job_type"]').value = job.job_type;
  form.querySelector('[name="location"]').value = job.location;
  form.querySelector('[name="salary_display"]').value = job.salary_display || '';
  form.querySelector('[name="experience_level"]').value = job.experience_level || '';
  form.querySelector('[name="status"]').value = job.status;
  form.querySelector('[name="contact_type"]').value = job.contact_type || 'whatsapp';
  form.querySelector('[name="contact_value"]').value = job.contact_value || '';
  form.querySelector('[name="description"]').value = job.description;

  const parseOrStr = (v) => Array.isArray(v) ? v.join('\n') : (typeof v === 'string' && v.startsWith('[') ? JSON.parse(v).join('\n') : (v || ''));
  form.querySelector('[name="requirements"]').value = parseOrStr(job.requirements);
  form.querySelector('[name="responsibilities"]').value = parseOrStr(job.responsibilities);
  form.querySelector('[name="benefits"]').value = parseOrStr(job.benefits);

  modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('edit-job-modal');
  if (modal) modal.classList.remove('active');
}

// Submit Edit Form
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

    const updatePayload = {
      title: form.querySelector('[name="title"]').value.trim(),
      company_name: form.querySelector('[name="company_name"]').value.trim(),
      category: form.querySelector('[name="category"]').value,
      job_type: form.querySelector('[name="job_type"]').value,
      location: form.querySelector('[name="location"]').value,
      salary_display: form.querySelector('[name="salary_display"]').value || 'Kompetitif',
      experience_level: form.querySelector('[name="experience_level"]').value,
      contact_type: form.querySelector('[name="contact_type"]').value,
      contact_value: form.querySelector('[name="contact_value"]').value.trim(),
      status: form.querySelector('[name="status"]').value,
      description: form.querySelector('[name="description"]').value.trim(),
      requirements: parseLines(form.querySelector('[name="requirements"]').value),
      responsibilities: parseLines(form.querySelector('[name="responsibilities"]').value),
      benefits: parseLines(form.querySelector('[name="benefits"]').value)
    };

    if (sbClient) {
      await sbClient.from('jobs').update(updatePayload).eq('id', jobId);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;
    closeEditModal();
    loadAdminJobs();
    loadDashboardData();
    alert('Perubahan berhasil disimpan ke Supabase Cloud!');
  });
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
