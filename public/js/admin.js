// ==============================================================
// KerjaHub - Secure Admin Panel Logic (Supabase & Auth Guard)
// ==============================================================

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

  // Toggle password visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }

  // Check existing session token
  const token = sessionStorage.getItem('kerja_admin_token');
  if (token) {
    verifySession(token);
  } else {
    showLoginScreen();
  }

  // Handle Login submission
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
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const result = await res.json();

        if (result.success && result.token) {
          sessionStorage.setItem('kerja_admin_token', result.token);
          unlockDashboard();
        } else {
          if (errorAlert) {
            errorText.textContent = result.message || 'Password salah!';
            errorAlert.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorAlert) {
          errorText.textContent = 'Gagal terhubung ke server.';
          errorAlert.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      const currentToken = sessionStorage.getItem('kerja_admin_token');
      if (currentToken) {
        fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken })
        }).catch(() => {});
      }
      sessionStorage.removeItem('kerja_admin_token');
      showLoginScreen();
    });
  }
}

async function verifySession(token) {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await res.json();
    if (result.valid) {
      unlockDashboard();
    } else {
      sessionStorage.removeItem('kerja_admin_token');
      showLoginScreen();
    }
  } catch (err) {
    showLoginScreen();
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

function getAuthHeader() {
  const token = sessionStorage.getItem('kerja_admin_token') || '';
  return { 'Authorization': `Bearer ${token}` };
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
    if (subEl) subEl.textContent = 'Kelola poster dan sinkronisasi database Supabase.';
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
      previewImg.src = e.target.result;
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
      previewImg.src = '';
      previewImg.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
      removeBtn.style.display = 'none';
    });
  }
}

// Upload Job Form Submission
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
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Supabase...';

    const formData = new FormData(form);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      if (res.status === 401) {
        alert('Sesi telah berakhir. Silakan login kembali.');
        showLoginScreen();
        return;
      }

      const result = await res.json();

      if (result.success) {
        alert('Berhasil: ' + result.message);
        form.reset();
        
        const btnRemove = document.getElementById('btn-remove-poster-preview');
        if (btnRemove) btnRemove.click();
        
        loadAdminJobs();
        loadDashboardData();
        const manageLink = document.querySelector('a[href="#manage-jobs"]');
        if (manageLink) manageLink.click();
      } else {
        alert('Gagal: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah lowongan.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}

// Load Dashboard Metrics
async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeader()
    });

    if (res.status === 401) {
      showLoginScreen();
      return;
    }

    const result = await res.json();
    if (!result.success) return;

    const data = result.data;
    document.getElementById('stat-total-jobs').textContent = data.totalJobs || 0;
    document.getElementById('stat-active-jobs').textContent = data.activeJobs || 0;
    document.getElementById('stat-total-views').textContent = data.totalViews || 0;

    const recentJobsTbody = document.getElementById('dashboard-recent-jobs');
    if (recentJobsTbody) {
      if (!data.recentJobs || data.recentJobs.length === 0) {
        recentJobsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada lowongan terdaftar</td></tr>`;
      } else {
        recentJobsTbody.innerHTML = data.recentJobs.map(j => `
          <tr>
            <td>
              <strong>${escapeHtml(j.title)}</strong><br>
              <small style="color:#64748b;">${escapeHtml(j.company_name)}</small>
            </td>
            <td><small>${escapeHtml(j.category)}</small></td>
            <td><span class="badge" style="background:#f1f5f9; color:#475569;">${escapeHtml(j.job_type)}</span></td>
            <td><span class="badge ${j.status === 'active' ? 'badge-active' : 'badge-closed'}">${j.status}</span></td>
            <td>${j.views_count || 0} views</td>
            <td><small>${new Date(j.created_at).toLocaleDateString('id-ID')}</small></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Load Admin Jobs Table
async function loadAdminJobs() {
  const tbody = document.getElementById('admin-jobs-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>`;

  try {
    const res = await fetch('/api/jobs?status=all');
    const result = await res.json();
    if (!result.success) return;

    adminJobs = result.data;

    if (adminJobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:#94a3b8;">Belum ada lowongan terdaftar. Klik menu "Upload Poster Baru"!</td></tr>`;
      return;
    }

    tbody.innerHTML = adminJobs.map(job => {
      const defaultPoster = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80';
      const posterSrc = job.poster_image ? job.poster_image : defaultPoster;
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
                <a href="/?job=${job.id}" target="_blank" class="job-cell-title">${escapeHtml(job.title)}</a>
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
              <a href="/?job=${job.id}" target="_blank" class="btn-table" title="Lihat di Web Publik"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
              <button class="btn-table" onclick="openEditJobModal(${job.id})" title="Edit Lowongan"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn-table delete" onclick="deleteJob(${job.id}, '${escapeHtml(job.title)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Gagal memuat lowongan.</td></tr>`;
  }
}

// Toggle Status (active/closed)
async function toggleJobStatus(jobId, currentStatus) {
  const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
  try {
    const res = await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (res.status === 401) {
      alert('Sesi telah berakhir. Silakan login kembali.');
      showLoginScreen();
      return;
    }

    const result = await res.json();
    if (result.success) {
      loadAdminJobs();
      loadDashboardData();
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert('Gagal mengubah status lowongan');
  }
}

// Delete Job
async function deleteJob(jobId, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus lowongan "${title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    if (res.status === 401) {
      alert('Sesi telah berakhir. Silakan login kembali.');
      showLoginScreen();
      return;
    }

    const result = await res.json();
    if (result.success) {
      alert(result.message);
      loadAdminJobs();
      loadDashboardData();
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert('Gagal menghapus lowongan.');
  }
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

  form.querySelector('[name="requirements"]').value = Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || '');
  form.querySelector('[name="responsibilities"]').value = Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || '');
  form.querySelector('[name="benefits"]').value = Array.isArray(job.benefits) ? job.benefits.join('\n') : (job.benefits || '');

  const currPoster = document.getElementById('edit-current-poster-preview');
  if (currPoster) {
    currPoster.src = job.poster_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800';
  }

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
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan Perubahan...';

    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: formData
      });

      if (res.status === 401) {
        alert('Sesi telah berakhir. Silakan login kembali.');
        showLoginScreen();
        return;
      }

      const result = await res.json();

      if (result.success) {
        alert(result.message);
        closeEditModal();
        loadAdminJobs();
        loadDashboardData();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Gagal memperbarui data lowongan.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
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
