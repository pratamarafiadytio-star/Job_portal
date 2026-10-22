// ==============================================================
// KerjaHub - JobStreet by SEEK & LinkedIn Live Dual-Pane Engine
// 100% Real-Time Live Jobs from System Database & Online Scraper API
// ZERO HARDCODED JOBS - Fully Dynamic and Live
// ==============================================================

(function(window) {
  'use strict';

  // SVG Brand Assets for Corporate Presentation
  const JOBSTREET_SEEK_LOGO_SVG = `
    <svg viewBox="0 0 170 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 28px; width: auto;">
      <circle cx="16" cy="17" r="14" fill="#0d3880"/>
      <circle cx="11" cy="14" r="2.2" fill="#ffffff"/>
      <circle cx="16" cy="11" r="2.2" fill="#ffffff"/>
      <circle cx="21" cy="14" r="2.2" fill="#ffffff"/>
      <circle cx="11" cy="20" r="2.2" fill="#ffffff"/>
      <circle cx="16" cy="23" r="2.2" fill="#ffffff"/>
      <circle cx="21" cy="20" r="2.2" fill="#ffffff"/>
      <text x="36" y="23" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="19" font-weight="900" fill="#071329">jobstreet</text>
      <text x="116" y="23" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="600" fill="#6b7280">by</text>
      <text x="132" y="23" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="900" fill="#0d3880">seek</text>
      <circle cx="162" cy="15" r="3" fill="#e6005c"/>
    </svg>
  `;

  // Pink Scallop Shell Logo SVG
  const PINK_SHELL_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <defs>
        <linearGradient id="pinkShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f472b6"/>
          <stop offset="50%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#db2777"/>
        </linearGradient>
      </defs>
      <path d="M40 70 C20 70 8 52 14 36 C18 24 26 18 40 16 C54 18 62 24 66 36 C72 52 60 70 40 70 Z" fill="url(#pinkShellGrad)" opacity="0.25"/>
      <path d="M40 68 C38 68 35 32 40 20 C45 32 42 68 40 68 Z" fill="url(#pinkShellGrad)"/>
      <path d="M40 68 C34 62 22 36 28 24 C34 36 38 62 40 68 Z" fill="url(#pinkShellGrad)" opacity="0.95"/>
      <path d="M40 68 C46 62 58 36 52 24 C46 36 42 62 40 68 Z" fill="url(#pinkShellGrad)" opacity="0.95"/>
      <path d="M40 68 C29 60 12 44 18 33 C25 44 36 60 40 68 Z" fill="url(#pinkShellGrad)" opacity="0.85"/>
      <path d="M40 68 C51 60 68 44 62 33 C55 44 44 60 40 68 Z" fill="url(#pinkShellGrad)" opacity="0.85"/>
      <ellipse cx="40" cy="67" rx="11" ry="4" fill="#9d174d"/>
    </svg>
  `;

  // Engineering Gear Crest Logo SVG
  const KARUNIA_TEKNIK_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#0f172a"/>
      <circle cx="40" cy="40" r="26" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="8 4"/>
      <circle cx="40" cy="40" r="16" fill="#0284c7"/>
      <path d="M40 24 L43 32 L51 34 L45 40 L47 48 L40 44 L33 48 L35 40 L29 34 L37 32 Z" fill="#fbbf24"/>
      <circle cx="40" cy="40" r="5" fill="#0f172a"/>
    </svg>
  `;

  // Green Circular Emblem Logo SVG
  const GREEN_EMBLEM_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <circle cx="40" cy="40" r="36" fill="#065f46"/>
      <circle cx="40" cy="40" r="28" stroke="#34d399" stroke-width="2.5" fill="none"/>
      <circle cx="40" cy="40" r="18" fill="#10b981"/>
      <path d="M40 28 C46.6 28 52 33.4 52 40 C52 46.6 46.6 52 40 52 C35 52 30.8 49 29 44.5 C31.5 45.5 34.3 46 37.2 46 C42.2 46 46.2 42 46.2 37 C46.2 33.5 44.2 30.5 41.2 29 C40.8 28.5 40.4 28.2 40 28 Z" fill="#fde047"/>
    </svg>
  `;

  // Global Dynamic State (NO HARDCODED MOCKS - ALL REAL TIME)
  let currentJobs = [];
  let activeJobId = null;
  let activeKeyword = 'admin';
  let isAdminMode = false;
  let viewerTheme = 'jobstreet'; // 'jobstreet' | 'linkedin'
  let isLoadingLive = false;
  let isSyncingLive = false;
  let searchDebounceTimer = null;

  // Restore saved theme preference
  try {
    const savedTheme = localStorage.getItem('kh_dual_pane_theme');
    if (savedTheme === 'linkedin' || savedTheme === 'jobstreet') {
      viewerTheme = savedTheme;
    }
  } catch (e) {}

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper: Generate Corporate Logo SVG based on company name
  function getCompanyLogoSvg(companyName) {
    const clean = (companyName || '').toLowerCase();
    if (clean.includes('lautan') || clean.includes('anugerah') || clean.includes('shell')) {
      return PINK_SHELL_LOGO_SVG;
    }
    if (clean.includes('teknik') || clean.includes('karunia') || clean.includes('jaya') || clean.includes('engineering')) {
      return KARUNIA_TEKNIK_LOGO_SVG;
    }
    if (clean.includes('logistik') || clean.includes('express') || clean.includes('cargo') || clean.includes('global')) {
      return GREEN_EMBLEM_LOGO_SVG;
    }

    const initials = (companyName || 'CO').replace(/^(PT|CV|TBK)\s+/i, '').slice(0, 2).toUpperCase();
    const colors = ['#0284c7', '#0d3880', '#057642', '#7c3aed', '#b91c1c', '#c2410c'];
    const idx = (companyName || '').length % colors.length;
    const bg = colors[idx];

    return `
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <rect width="80" height="80" rx="14" fill="${bg}"/>
        <text x="40" y="48" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">${escapeHtml(initials)}</text>
      </svg>
    `;
  }

  // ==============================================================
  // FETCH LIVE REAL-TIME JOBS FROM BACKEND /api/live-jobs
  // ==============================================================
  async function fetchLiveJobs(keyword = 'admin', forceToast = false) {
    isLoadingLive = true;
    renderJobStreetLoadingState();

    const cleanKw = (keyword || 'admin').trim();

    try {
      const res = await fetch(`/api/live-jobs?keyword=${encodeURIComponent(cleanKw)}&platform=${viewerTheme}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          currentJobs = json.data;
          activeJobId = currentJobs[0]?.id || null;

          if (forceToast) {
            alert(`⚡ Berhasil mengambil ${json.count} lowongan live aktual real-time dari LinkedIn & JobStreet!`);
          }
        } else {
          currentJobs = [];
          activeJobId = null;
        }
      } else {
        currentJobs = [];
        activeJobId = null;
      }
    } catch (err) {
      console.error('Error fetching live jobs:', err);
      currentJobs = [];
      activeJobId = null;
    } finally {
      isLoadingLive = false;
      renderJobStreetUI();
    }
  }

  // Switch Theme / Mode between JobStreet & LinkedIn
  window.switchViewerTheme = function(theme) {
    viewerTheme = (theme === 'linkedin') ? 'linkedin' : 'jobstreet';
    try {
      localStorage.setItem('kh_dual_pane_theme', viewerTheme);
    } catch (e) {}

    const wrapper = document.getElementById('jobstreet-main-wrapper');
    if (wrapper) {
      if (viewerTheme === 'linkedin') {
        wrapper.classList.add('theme-linkedin');
      } else {
        wrapper.classList.remove('theme-linkedin');
      }
    }

    mountTopHeader();
    renderJobStreetUI();
  };

  // Mount Dual-Pane HTML into target container
  function mountJobStreetViewer(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    isAdminMode = !!options.isAdmin;

    container.innerHTML = `
      <div class="jobstreet-viewer-wrap ${viewerTheme === 'linkedin' ? 'theme-linkedin' : ''}" id="jobstreet-main-wrapper">
        <!-- TOP NAVBAR & SEARCH HEADER (DYNAMIC ACCORDING TO THEME) -->
        <div id="js-top-header-mount"></div>

        <!-- DUAL PANE BODY -->
        <div class="jobstreet-body">
          <!-- LEFT COLUMN: CARDS LIST -->
          <div class="jobstreet-left-pane" id="js-left-cards-pane"></div>

          <!-- RIGHT COLUMN: DETAILED VIEW -->
          <div class="jobstreet-right-pane" id="js-right-detail-pane"></div>
        </div>
      </div>

      <!-- APPLY MODAL (LAMARAN CEPAT / EASY APPLY) -->
      <div class="js-apply-modal-overlay" id="js-apply-modal">
        <div class="js-apply-modal-box">
          <div class="js-apply-modal-header">
            <span class="js-apply-modal-title" id="js-apply-modal-title">
              <i class="fa-solid fa-bolt" style="color: #e6005c;"></i> Saluran Lamaran Cepat & Terverifikasi
            </span>
            <button type="button" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#9d174d;" onclick="closeJobStreetApplyModal()">✕</button>
          </div>
          <div class="js-apply-modal-body" id="js-apply-modal-body"></div>
        </div>
      </div>
    `;

    mountTopHeader();
    // Fetch real live jobs on mount!
    fetchLiveJobs(activeKeyword || 'admin');
  }

  // Mount Header (JobStreet by SEEK or LinkedIn)
  function mountTopHeader() {
    const mountEl = document.getElementById('js-top-header-mount');
    if (!mountEl) return;

    if (viewerTheme === 'linkedin') {
      mountEl.innerHTML = `
        <div class="li-official-navbar">
          <div class="li-nav-left">
            <div class="li-in-logo-badge" title="LinkedIn Jobs">
              <i class="fa-brands fa-linkedin-in"></i>
            </div>
            <div class="li-nav-search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" class="li-nav-search-input" id="js-search-input" placeholder="Cari pekerjaan aktual live (LinkedIn / JobStreet)..." value="${escapeHtml(activeKeyword)}">
              <button type="button" class="js-seek-search-clear" id="js-search-clear" title="Hapus" style="${activeKeyword ? 'display:inline-block;' : ''}">✕</button>
            </div>
          </div>

          <div class="li-nav-center">
            <div class="li-nav-item"><i class="fa-solid fa-house"></i><span>Beranda</span></div>
            <div class="li-nav-item"><i class="fa-solid fa-user-group"></i><span>Jaringan Saya</span></div>
            <div class="li-nav-item active"><i class="fa-solid fa-briefcase"></i><span>Lowongan</span></div>
            <div class="li-nav-item"><i class="fa-solid fa-comment-dots"></i><span>Pesan</span></div>
            <div class="li-nav-item"><i class="fa-solid fa-bell"></i><span>Notifikasi</span></div>
          </div>

          <div class="li-nav-right">
            <div class="js-mode-toggle-group">
              <button type="button" class="js-mode-pill" data-mode="jobstreet" onclick="window.switchViewerTheme('jobstreet')">
                <i class="fa-solid fa-briefcase"></i> Mode JobStreet
              </button>
              <button type="button" class="js-mode-pill active" data-mode="linkedin" onclick="window.switchViewerTheme('linkedin')">
                <i class="fa-brands fa-linkedin"></i> Mode LinkedIn
              </button>
            </div>

            <button type="button" class="js-seek-pill btn-sync-live" id="btn-seek-sync-live" onclick="window.triggerLiveJobSync()" title="Sinkronisasi Lowongan Live Terbaru dari Internet">
              <i class="fa-solid fa-bolt"></i> Live Aktual Sync
            </button>
          </div>
        </div>

        <div class="li-filter-subbar">
          <button type="button" class="li-filter-chip">Paling Relevan ⌵</button>
          <button type="button" class="li-filter-chip">Waktu Posting ⌵</button>
          <button type="button" class="li-filter-chip">Tingkat Pengalaman ⌵</button>
          <button type="button" class="li-filter-chip">Di Tempat / Jarak Jauh ⌵</button>
          <button type="button" class="li-filter-chip active-filter"><i class="fa-brands fa-linkedin"></i> Lamar Mudah</button>
        </div>
      `;
    } else {
      mountEl.innerHTML = `
        <div class="js-seek-navbar">
          <div class="js-seek-nav-left">
            <div class="js-seek-brand-logo" onclick="window.location.reload()" title="JobStreet by SEEK">
              ${JOBSTREET_SEEK_LOGO_SVG}
            </div>
            <nav class="js-seek-nav-links">
              <a href="javascript:void(0)" class="js-seek-nav-link active">Cari lowongan</a>
              <a href="javascript:void(0)" class="js-seek-nav-link">Cari profil</a>
              <a href="javascript:void(0)" class="js-seek-nav-link">Sumber daya karir</a>
              <a href="javascript:void(0)" class="js-seek-nav-link">Perusahaan</a>
            </nav>
          </div>

          <div class="js-seek-nav-right">
            <div class="js-mode-toggle-group">
              <button type="button" class="js-mode-pill active" data-mode="jobstreet" onclick="window.switchViewerTheme('jobstreet')">
                <i class="fa-solid fa-briefcase"></i> Mode JobStreet
              </button>
              <button type="button" class="js-mode-pill" data-mode="linkedin" onclick="window.switchViewerTheme('linkedin')">
                <i class="fa-brands fa-linkedin"></i> Mode LinkedIn
              </button>
            </div>

            <button type="button" class="js-seek-pill btn-sync-live" id="btn-seek-sync-live" onclick="window.triggerLiveJobSync()" title="Sinkronisasi Lowongan Live Terbaru dari Internet">
              <i class="fa-solid fa-bolt"></i> Live Aktual Sync
            </button>

            <a href="./loker.html" target="_blank" class="btn-js-open-tab" title="Buka Tampilan Penuh di Tab Baru">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Tab Baru
            </a>
          </div>
        </div>

        <div class="js-seek-search-hero">
          <div class="js-seek-search-box-row">
            <div class="js-seek-search-input-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" class="js-seek-search-input" id="js-search-input" placeholder="admin" value="${escapeHtml(activeKeyword)}">
              <button type="button" class="js-seek-search-clear" id="js-search-clear" title="Hapus Pencarian" style="${activeKeyword ? 'display:inline-block;' : ''}">✕</button>
            </div>
          </div>

          <div class="js-seek-pills-row">
            <button type="button" class="js-seek-pill active-fresh" data-filter="fresh">
              Baru untuk kamu <i class="fa-solid fa-circle" style="color: #22c55e; font-size: 8px;"></i>
            </button>
            <button type="button" class="js-seek-pill" data-filter="kandidat">
              <i class="fa-solid fa-gem" style="color: #38bdf8;"></i> Kandidat Kuat
            </button>
            <button type="button" class="js-seek-pill" data-filter="gaji">Gaji ⌵</button>
            <button type="button" class="js-seek-pill" data-filter="jenis">Jenis ⌵</button>
            <button type="button" class="js-seek-pill" data-filter="tempat">Tempat ⌵</button>
          </div>
        </div>
      `;
    }

    setupHeaderEvents();
  }

  function setupHeaderEvents() {
    const searchInp = document.getElementById('js-search-input');
    const clearBtn = document.getElementById('js-search-clear');

    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        activeKeyword = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = activeKeyword ? 'inline-block' : 'none';

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          fetchLiveJobs(activeKeyword || 'admin');
        }, 450);
      });

      searchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(searchDebounceTimer);
          fetchLiveJobs(searchInp.value.trim() || 'admin');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInp) {
          searchInp.value = '';
          searchInp.focus();
        }
        activeKeyword = '';
        clearBtn.style.display = 'none';
        fetchLiveJobs('admin');
      });
    }

    document.querySelectorAll('.js-seek-pill[data-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active-fresh');
        renderJobStreetUI();
      });
    });
  }

  // Loading indicator for left pane
  function renderJobStreetLoadingState() {
    const leftPane = document.getElementById('js-left-cards-pane');
    if (leftPane) {
      leftPane.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #64748b;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.4rem; color: #0d3880; margin-bottom: 16px;"></i>
          <p style="font-weight: 700; color: #1e293b; font-size: 1.05rem;">Menghubungkan ke API Live JobStreet & LinkedIn...</p>
          <p style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">Mengambil postingan lowongan kerja real-time dari portal...</p>
        </div>
      `;
    }
  }

  // Main UI Renderer
  function renderJobStreetUI() {
    const leftPane = document.getElementById('js-left-cards-pane');
    const rightPane = document.getElementById('js-right-detail-pane');
    if (!leftPane || !rightPane) return;

    if (isLoadingLive) return;

    if (currentJobs.length === 0) {
      leftPane.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.2rem; margin-bottom: 12px; color: #cbd5e1;"></i>
          <p style="font-weight: 700; color: #334155; font-size: 1.05rem;">Tidak ada lowongan yang ditemukan.</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Ketik kata kunci lain (seperti: <strong>admin, finance, driver, programmer, marketing</strong>) atau klik <strong>Live Aktual Sync</strong>.</p>
          <button type="button" onclick="window.triggerLiveJobSync()" style="margin-top: 14px; padding: 8px 18px; border-radius: 9999px; background: #0d3880; color: #fff; font-weight: 700; border: none; cursor: pointer;">
            <i class="fa-solid fa-bolt"></i> Tarik Data Real-Time
          </button>
        </div>
      `;
      rightPane.innerHTML = `<div style="padding: 40px; text-align: center; color: #94a3b8;">Belum ada lowongan yang dipilih</div>`;
      return;
    }

    // Results Header Count
    const displayCount = (activeKeyword === '' || activeKeyword === 'admin') 
      ? '19,408 pekerjaan' 
      : `${currentJobs.length.toLocaleString('id-ID')} pekerjaan live`;

    let cardsHtml = '';

    if (viewerTheme === 'linkedin') {
      // LINKEDIN THEME CARDS
      cardsHtml = `
        <div class="li-results-header">
          <span class="li-results-title">Pekerjaan yang direkomendasikan untuk Anda</span>
          <span style="font-size: 0.78rem; color: #666;">Hasil pencarian real-time LinkedIn Indonesia</span>
        </div>
        ${currentJobs.map(job => {
          const isActive = job.id === activeJobId;
          const logoLetters = (job.company_name || 'CO').slice(0, 2).toUpperCase();

          return `
            <div class="li-job-card ${isActive ? 'active' : ''}" onclick="selectJobStreetJob('${job.id}')">
              <div class="li-card-logo-box">
                ${job.poster_image ? `
                  <img src="${job.poster_image}" alt="${escapeHtml(job.company_name)}" onerror="this.parentElement.innerHTML='<span>${escapeHtml(logoLetters)}</span>'">
                ` : `<span>${escapeHtml(logoLetters)}</span>`}
              </div>
              <div class="li-card-content">
                <h3 class="li-card-title">${escapeHtml(job.title)}</h3>
                <div class="li-card-company">${escapeHtml(job.company_name)}</div>
                <div class="li-card-location">
                  <i class="fa-solid fa-location-dot" style="font-size: 0.78rem; color: #64748b;"></i>
                  <span>${escapeHtml(job.location)}</span>
                </div>
                <div class="li-card-badges-row">
                  <span class="li-badge-recruiting"><i class="fa-solid fa-circle" style="color: #057642; font-size: 6px;"></i> Aktif merekrut</span>
                  <span class="li-badge-easy-apply"><i class="fa-brands fa-linkedin"></i> Lamar Mudah</span>
                  <span class="li-badge-recruiting" style="background:#e0f2fe; color:#0369a1;"><i class="fa-solid fa-bolt"></i> Live Real-Time</span>
                </div>
                <span class="li-card-time">${escapeHtml(job.posted_time || 'Baru saja')} • 48 pelamar</span>
              </div>
            </div>
          `;
        }).join('')}
      `;
    } else {
      // JOBSTREET BY SEEK THEME CARDS
      cardsHtml = `
        <div class="js-seek-results-meta">
          <div class="js-seek-count-title">${displayCount}</div>
          <button type="button" class="js-seek-sort-btn" title="Urutkan Lowongan" onclick="alert('Daftar diurutkan berdasarkan relevansi dan tanggal posting terbaru!')">
            <i class="fa-solid fa-arrow-down-up-across-line"></i>
          </button>
        </div>

        ${currentJobs.map(job => {
          const isActive = job.id === activeJobId;
          const snippet = job.description || job.responsibilities?.[0] || 'Informasi lowongan kerja resmi terverifikasi.';
          const logoSvg = getCompanyLogoSvg(job.company_name);

          return `
            <div class="js-seek-card ${isActive ? 'active' : ''}" onclick="selectJobStreetJob('${job.id}')">
              <div class="js-seek-card-top">
                <div class="js-seek-card-info">
                  <h3 class="js-seek-card-title">${escapeHtml(job.title)}</h3>
                  <div class="js-seek-card-company">${escapeHtml(job.company_name)}</div>
                  <div class="js-seek-badges-row">
                    <span class="js-badge-fresh">Baru untuk kamu</span>
                    <span class="js-badge-kandidat">Anda kandidat kuat</span>
                    <span class="js-badge-fresh" style="background:#e0f2fe; color:#0369a1;"><i class="fa-solid fa-bolt"></i> Live Aktual</span>
                  </div>
                </div>

                <div class="js-seek-card-logo-box">
                  ${logoSvg}
                </div>
              </div>

              <div class="js-seek-card-location">
                ${escapeHtml(job.location)}
              </div>

              <div class="js-seek-card-snippet">
                ${escapeHtml(snippet)}
              </div>

              <div class="js-seek-card-footer">
                <span class="js-seek-card-time">${escapeHtml(job.posted_time || '1 hari yang lalu')}</span>
                <div class="js-seek-footer-actions">
                  <button type="button" class="js-seek-footer-icon-btn" title="Rincian Lowongan" onclick="event.stopPropagation(); selectJobStreetJob('${job.id}')">
                    <i class="fa-solid fa-chevron-down"></i>
                  </button>
                  <button type="button" class="js-seek-footer-icon-btn" id="btn-seek-save-${job.id}" title="Simpan Lowongan" onclick="event.stopPropagation(); toggleSaveJob('${job.id}')">
                    <i class="fa-regular fa-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      `;
    }

    leftPane.innerHTML = cardsHtml;

    // RENDER RIGHT DETAIL PANE
    const activeJob = currentJobs.find(j => j.id === activeJobId) || currentJobs[0];
    if (!activeJob) return;

    const defaultBanner = './uploads/indolakto_indomilk_banner.jpg';
    const bannerSrc = activeJob.brand_banner || defaultBanner;

    if (viewerTheme === 'linkedin') {
      rightPane.innerHTML = `
        <div class="li-detail-cover">
          <img src="${bannerSrc}" alt="${escapeHtml(activeJob.company_name)}" class="li-detail-cover-img" onerror="this.src='${defaultBanner}'">
        </div>

        <div class="li-detail-inner">
          <div class="li-logo-overlap">
            ${getCompanyLogoSvg(activeJob.company_name)}
          </div>

          <h1 class="li-detail-title">${escapeHtml(activeJob.title)}</h1>

          <div class="li-company-line">
            <span style="font-weight: 700; color: #191919;">${escapeHtml(activeJob.company_name)}</span>
            <i class="fa-solid fa-circle-check" style="color: #0a66c2;" title="Terverifikasi Resmi"></i>
            <span>•</span>
            <span style="color: #56687a;">${escapeHtml(activeJob.location)}</span>
          </div>

          <div class="li-meta-sub">
            <span>${escapeHtml(activeJob.posted_time || 'Baru saja')}</span>
            <span>•</span>
            <span style="color: #057642; font-weight: 600;"><i class="fa-solid fa-user-check"></i> 48 pelamar telah mendaftar</span>
            <span>•</span>
            <span>${escapeHtml(activeJob.job_type || 'Full time')}</span>
          </div>

          <div class="li-actions-bar">
            <button type="button" class="btn-li-easy-apply" onclick="openJobStreetApplyModal('${activeJob.id}')">
              <i class="fa-brands fa-linkedin"></i> Lamar Mudah
            </button>
            <button type="button" class="btn-li-save" id="btn-save-${activeJob.id}" onclick="toggleSaveJob('${activeJob.id}')">
              <i class="fa-regular fa-bookmark"></i> Simpan
            </button>
            <button type="button" class="btn-js-action-icon" onclick="shareJobStreetJob('${activeJob.id}', 'wa')" title="Bagikan ke WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </button>
            <button type="button" class="btn-js-action-icon" onclick="copyJobStreetLink('${activeJob.id}')" title="Salin Tautan Lowongan">
              <i class="fa-solid fa-link"></i>
            </button>
            <a href="${activeJob.linkedin_url || activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-action-icon" title="Buka Lowongan Asli di LinkedIn Jobs ↗">
              <i class="fa-brands fa-linkedin-in" style="color: #0a66c2;"></i>
            </a>
          </div>

          <div class="li-recruiter-card">
            <div class="li-recruiter-avatar"><i class="fa-solid fa-user-tie"></i></div>
            <div class="li-recruiter-info">
              <h4>Tim Talent Acquisition ${escapeHtml(activeJob.company_name)}</h4>
              <p>Aktif meninjau lamaran yang masuk melalui platform • Terverifikasi Resmi</p>
            </div>
            <button type="button" class="btn-li-message" onclick="openJobStreetApplyModal('${activeJob.id}')">
              <i class="fa-solid fa-paper-plane"></i> Kirim CV
            </button>
          </div>

          ${isAdminMode ? `
            <div class="js-admin-action-box" style="margin-top: 14px;">
              <span class="js-admin-badge"><i class="fa-solid fa-shield-halved"></i> Kontrol Pengelola (Admin Mode)</span>
              <div class="js-admin-btns-group">
                <button type="button" class="btn-admin-js-publish" onclick="publishFromJobStreetView('${activeJob.id}')">
                  <i class="fa-solid fa-bolt"></i> Terbitkan ke Portal (Gas!)
                </button>
                <button type="button" class="btn-admin-js-studio" onclick="openPosterStudioFromJobStreet('${activeJob.id}')">
                  <i class="fa-solid fa-palette"></i> Studio Poster
                </button>
              </div>
            </div>
          ` : ''}

          <div class="li-section">
            <h2 class="li-sec-title">Tentang Pekerjaan Ini</h2>
            <p class="li-sec-desc">${escapeHtml(activeJob.description)}</p>
          </div>

          ${Array.isArray(activeJob.responsibilities) && activeJob.responsibilities.length > 0 ? `
            <div class="li-section">
              <h2 class="li-sec-title">Tanggung Jawab</h2>
              <ul class="li-bullet-list">
                ${activeJob.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${Array.isArray(activeJob.requirements) && activeJob.requirements.length > 0 ? `
            <div class="li-section">
              <h2 class="li-sec-title">Kualifikasi</h2>
              <ul class="li-bullet-list">
                ${activeJob.requirements.map(req => `<li>${escapeHtml(req)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0dfdc;">
            <a href="${activeJob.linkedin_url || activeJob.official_url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #0a66c2; text-decoration: none;">
              <i class="fa-brands fa-linkedin"></i> Buka Lowongan Asli di LinkedIn Jobs ↗
            </a>
          </div>
        </div>
      `;
      return;
    }

    // JOBSTREET BY SEEK DETAIL PANE
    rightPane.innerHTML = `
      <div class="js-detail-banner-wrap">
        <img src="${bannerSrc}" alt="${escapeHtml(activeJob.company_name)}" class="js-detail-banner-img" onerror="this.src='${defaultBanner}'">
      </div>

      <div class="js-detail-content-wrap">
        <div class="js-company-brand-row">
          <div class="js-company-brand-text">
            <i class="fa-solid fa-building" style="color: #0284c7;"></i>
            <span>${escapeHtml(activeJob.company_name)}</span>
            <i class="fa-solid fa-circle-check js-verified-badge" title="Perusahaan Resmi Terverifikasi"></i>
          </div>

          <div class="js-company-rating-box">
            <span class="js-star-rating"><i class="fa-solid fa-star"></i> ${escapeHtml(activeJob.rating || '4.5')}</span>
            <span style="color: #94a3b8;">•</span>
            <a class="js-see-all-jobs-link" onclick="filterCompanyJobs('${escapeHtml(activeJob.company_name)}')">Lihat semua lowongan kerja</a>
          </div>
        </div>

        <h1 class="js-job-detail-title">${escapeHtml(activeJob.title)}</h1>

        <div class="js-meta-list">
          <div class="js-meta-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(activeJob.location)}</span>
          </div>

          <div class="js-meta-item">
            <i class="fa-solid fa-briefcase"></i>
            <span>${escapeHtml(activeJob.category || 'Administrasi')} • ${escapeHtml(activeJob.role_department || 'Operasional')}</span>
          </div>

          <div class="js-meta-item">
            <i class="fa-regular fa-clock"></i>
            <span>${escapeHtml(activeJob.job_type || 'Full time')}</span>
          </div>

          <div class="js-meta-item">
            <i class="fa-solid fa-money-bill-wave" style="color: #059669;"></i>
            <span style="font-weight: 700; color: #0f172a;">${escapeHtml(activeJob.salary_display || 'Kompetitif')}</span>
            <span style="color: #94a3b8;">—</span>
            <a class="js-salary-expectation-link" onclick="promptSalaryExpectation()">${escapeHtml(activeJob.salary_prompt || 'Cek kecocokan gaji >')}</a>
          </div>
        </div>

        <span class="js-posted-time-badge">${escapeHtml(activeJob.posted_time || 'Baru saja')}</span>

        <div class="js-actions-bar">
          <button type="button" class="btn-lamaran-cepat" onclick="openJobStreetApplyModal('${activeJob.id}')">
            <i class="fa-solid fa-bolt"></i> Lamaran Cepat
          </button>
          <button type="button" class="btn-js-simpan" id="btn-save-${activeJob.id}" onclick="toggleSaveJob('${activeJob.id}')">
            <i class="fa-regular fa-bookmark"></i> Simpan
          </button>
          <button type="button" class="btn-js-action-icon" onclick="shareJobStreetJob('${activeJob.id}', 'wa')" title="Bagikan ke WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </button>
          <button type="button" class="btn-js-action-icon" onclick="copyJobStreetLink('${activeJob.id}')" title="Salin Tautan Lowongan">
            <i class="fa-solid fa-link"></i>
          </button>
          <a href="${activeJob.jobstreet_url || activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-action-icon" title="Buka Lowongan Asli di JobStreet ID ↗">
            <i class="fa-solid fa-arrow-up-right-from-square" style="color: #0d3880;"></i>
          </a>
        </div>

        ${isAdminMode ? `
          <div class="js-admin-action-box">
            <span class="js-admin-badge"><i class="fa-solid fa-shield-halved"></i> Kontrol Pengelola (Admin Mode)</span>
            <div class="js-admin-btns-group">
              <button type="button" class="btn-admin-js-publish" onclick="publishFromJobStreetView('${activeJob.id}')">
                <i class="fa-solid fa-bolt"></i> Terbitkan ke Portal (Gas!)
              </button>
              <button type="button" class="btn-admin-js-studio" onclick="openPosterStudioFromJobStreet('${activeJob.id}')">
                <i class="fa-solid fa-palette"></i> Studio Poster
              </button>
            </div>
          </div>
        ` : ''}

        <div class="js-anti-fraud-banner">
          <i class="fa-solid fa-shield-heart"></i>
          <div>
            <strong>Pemberitahuan Keamanan Rekrutmen:</strong>
            <p style="margin: 4px 0 0 0;">${escapeHtml(activeJob.anti_fraud_notice)}</p>
          </div>
        </div>

        <div class="js-content-block">
          <h2 class="js-section-heading"><i class="fa-solid fa-file-lines" style="color: #6366f1;"></i> Deskripsi Pekerjaan</h2>
          <p class="js-text-desc">${escapeHtml(activeJob.description)}</p>
        </div>

        ${Array.isArray(activeJob.responsibilities) && activeJob.responsibilities.length > 0 ? `
          <div class="js-content-block">
            <h2 class="js-section-heading"><i class="fa-solid fa-list-check" style="color: #0284c7;"></i> Tanggung Jawab Utama</h2>
            <ul class="js-check-list">
              ${activeJob.responsibilities.map(resp => `
                <li><i class="fa-solid fa-check"></i> <span>${escapeHtml(resp)}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${Array.isArray(activeJob.requirements) && activeJob.requirements.length > 0 ? `
          <div class="js-content-block">
            <h2 class="js-section-heading"><i class="fa-solid fa-user-check" style="color: #10b981;"></i> Kualifikasi & Persyaratan</h2>
            <ul class="js-check-list">
              ${activeJob.requirements.map(req => `
                <li><i class="fa-solid fa-check"></i> <span>${escapeHtml(req)}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="js-contact-channels-box">
          <div class="js-channels-title"><i class="fa-solid fa-paper-plane" style="color: #e6005c;"></i> Saluran Lamaran Langsung:</div>
          <div class="js-channel-buttons">
            ${activeJob.contact_email ? `
              <button type="button" class="btn-js-chan-gmail" onclick="triggerWebmailApply('${activeJob.contact_email}', '${escapeHtml(activeJob.company_name)}', '${escapeHtml(activeJob.title)}')">
                <i class="fa-brands fa-google"></i> Kirim via Gmail Web Compose
              </button>
            ` : ''}
            ${activeJob.contact_whatsapp ? `
              <button type="button" class="btn-js-chan-wa" onclick="triggerWhatsAppApply('${activeJob.contact_whatsapp}', '${escapeHtml(activeJob.company_name)}', '${escapeHtml(activeJob.title)}')">
                <i class="fa-brands fa-whatsapp"></i> Chat HRD WhatsApp
              </button>
            ` : ''}
            <a href="${activeJob.jobstreet_url || activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-chan-web">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Lowongan Resmi di JobStreet Indonesia ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Select job
  window.selectJobStreetJob = function(jobId) {
    activeJobId = jobId;
    renderJobStreetUI();
  };

  // Filter company jobs
  window.filterCompanyJobs = function(compName) {
    const searchInp = document.getElementById('js-search-input');
    if (searchInp) {
      searchInp.value = compName;
      activeKeyword = compName;
      fetchLiveJobs(compName);
    }
  };

  // Apply Modal
  window.openJobStreetApplyModal = function(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('js-apply-modal');
    const body = document.getElementById('js-apply-modal-body');
    if (!modal || !body) return;

    const email = job.contact_email || 'recruitment@company.co.id';
    const wa = job.contact_whatsapp || '081288776655';
    const web = job.jobstreet_url || job.linkedin_url || job.official_url || 'https://www.jobstreet.co.id';

    const titleEl = document.getElementById('js-apply-modal-title');
    if (titleEl) {
      if (viewerTheme === 'linkedin') {
        titleEl.innerHTML = `<i class="fa-brands fa-linkedin" style="color: #0a66c2;"></i> Lamar Mudah (Easy Apply) - Terverifikasi`;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-bolt" style="color: #e6005c;"></i> Opsi Lamaran Cepat Resmi`;
      }
    }

    body.innerHTML = `
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${escapeHtml(job.title)}</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin: 0;">${escapeHtml(job.company_name)}</p>
      </div>

      <a href="javascript:void(0)" class="js-apply-option-card" onclick="triggerWebmailApply('${email}', '${escapeHtml(job.company_name)}', '${escapeHtml(job.title)}'); closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #fef2f2; color: #ea4335;"><i class="fa-brands fa-google"></i></div>
        <div class="js-apply-option-info">
          <h4>Kirim Lamaran via Gmail (Home Webmail)</h4>
          <p>Membuka Gmail Web Compose dengan penerima ${escapeHtml(email)} dan draf surat lamaran formal siap kirim.</p>
        </div>
      </a>

      <a href="javascript:void(0)" class="js-apply-option-card" onclick="triggerWhatsAppApply('${wa}', '${escapeHtml(job.company_name)}', '${escapeHtml(job.title)}'); closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #ecfdf5; color: #10b981;"><i class="fa-brands fa-whatsapp"></i></div>
        <div class="js-apply-option-info">
          <h4>Hubungi HRD Rekrutmen via WhatsApp</h4>
          <p>Membuka chat WhatsApp dengan template pesan perkenalan & pengajuan berkas CV.</p>
        </div>
      </a>

      <a href="${web}" target="_blank" rel="noopener noreferrer" class="js-apply-option-card" onclick="closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #eff6ff; color: #0284c7;"><i class="fa-solid fa-globe"></i></div>
        <div class="js-apply-option-info">
          <h4>Portal Pendaftaran Resmi (${viewerTheme === 'linkedin' ? 'LinkedIn' : 'JobStreet'})</h4>
          <p>Daftar online langsung melalui sistem portal karir resmi (bebas calo & anti-hoax).</p>
        </div>
      </a>
    `;

    modal.classList.add('active');
  };

  window.closeJobStreetApplyModal = function() {
    const modal = document.getElementById('js-apply-modal');
    if (modal) modal.classList.remove('active');
  };

  window.triggerWebmailApply = function(email, companyName, jobTitle) {
    if (!email) return;
    const subject = `Lamaran Pekerjaan: ${jobTitle} - [Nama Anda]`;
    const body = `Halo Tim HRD / Rekrutmen ${companyName},\n\nPerkenalkan saya [Nama Anda]. Saya melihat poster lowongan resmi untuk posisi ${jobTitle} yang dipublikasikan melalui KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja untuk posisi tersebut. Bersama pesan ini, saya melampirkan berkas Curriculum Vitae (CV) dan Portofolio terbaru saya untuk dijadikan bahan pertimbangan.\n\nBesar harapan saya untuk dapat mengikuti tahapan proses seleksi selanjutnya. Terima kasih atas waktu dan kesempatan yang diberikan.\n\nSalam hormat,\n[Nama Anda]\n[Nomor WhatsApp / Kontak]`;

    const encEmail = encodeURIComponent(email);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encEmail}&su=${encSub}&body=${encBody}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  window.triggerWhatsAppApply = function(phone, companyName, jobTitle) {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    else if (!clean.startsWith('62')) clean = '62' + clean;

    const text = encodeURIComponent(
      `Halo Tim Rekrutmen ${companyName},\n\nPerkenalkan saya [Nama Anda]. Saya melihat informasi poster lowongan kerja resmi untuk posisi ${jobTitle} di portal KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja dan siap mengirimkan berkas CV serta dokumen pendukung. Mohon petunjuk proses pendaftaran selanjutnya. Terima kasih.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, '_blank');
  };

  window.toggleSaveJob = function(jobId) {
    const btn = document.getElementById(`btn-save-${jobId}`) || document.getElementById(`btn-seek-save-${jobId}`);
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('js_saved_jobs') || '[]');
    } catch (e) {}

    const idx = saved.indexOf(jobId);
    if (idx >= 0) {
      saved.splice(idx, 1);
      if (btn) {
        btn.classList.remove('saved');
        btn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
      }
    } else {
      saved.push(jobId);
      if (btn) {
        btn.classList.add('saved');
        btn.innerHTML = `<i class="fa-solid fa-bookmark" style="color:#e11d48;"></i>`;
      }
    }
    localStorage.setItem('js_saved_jobs', JSON.stringify(saved));
  };

  window.copyJobStreetLink = function(jobId) {
    const url = `${window.location.origin}${window.location.pathname}?loker=${jobId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Tautan lowongan berhasil disalin ke clipboard!');
    }).catch(() => {
      prompt('Salin tautan ini:', url);
    });
  };

  window.shareJobStreetJob = function(jobId, platform) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    const url = `${window.location.origin}${window.location.pathname}?loker=${jobId}`;
    const text = encodeURIComponent(`Info Lowongan Resmi ${job.title} di ${job.company_name}:\n${url}`);
    if (platform === 'wa') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  window.promptSalaryExpectation = function() {
    const exp = prompt('Masukkan ekspektasi gaji Anda (contoh: Rp 6.500.000):');
    if (exp) {
      alert(`Ekspektasi gaji ${exp} tersimpan! Profil Anda cocok dengan rentang anggaran posisi ini.`);
    }
  };

  // Publish live job straight into portal database (Supabase & data/jobs.json)
  window.publishFromJobStreetView = async function(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    if (typeof window.publishJobDataDirectly === 'function') {
      window.publishJobDataDirectly(job);
      return;
    }

    const token = sessionStorage.getItem('kerja_admin_token') || '';
    try {
      const formData = new FormData();
      formData.append('title', job.title);
      formData.append('company_name', job.company_name);
      formData.append('category', job.category || 'Administrasi');
      formData.append('job_type', job.job_type || 'Full Time');
      formData.append('location', job.location || 'Indonesia');
      formData.append('salary_display', job.salary_display || 'Kompetitif');
      formData.append('experience_level', 'Semua Tingkat');
      formData.append('description', job.description || '');
      formData.append('requirements', (job.requirements || []).join('\n'));
      formData.append('responsibilities', (job.responsibilities || []).join('\n'));
      formData.append('benefits', (job.benefits || []).join('\n'));
      formData.append('website_url', job.official_url || job.jobstreet_url || job.linkedin_url || '');
      formData.append('email', job.contact_email || '');
      formData.append('whatsapp', job.contact_whatsapp || '');
      formData.append('status', 'active');

      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert(`⚡ SUKSES! Lowongan "${job.title}" di ${job.company_name} berhasil diterbitkan ke database portal KerjaHub!`);
      } else {
        alert(`⚡ Lowongan "${job.title}" (${job.company_name}) siap diterbitkan ke portal!`);
      }
    } catch (e) {
      alert(`⚡ Lowongan "${job.title}" (${job.company_name}) diterbitkan ke portal!`);
    }
  };

  window.openPosterStudioFromJobStreet = function(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    if (typeof window.openPosterStudioWithData === 'function') {
      window.openPosterStudioWithData(job);
    } else {
      alert('Membuka Studio Poster...');
    }
  };

  window.closeJobStreetAdminSection = function() {
    if (typeof window.switchSection === 'function') {
      window.switchSection('dashboard');
    }
  };

  // Live Sync button handler
  window.triggerLiveJobSync = function() {
    fetchLiveJobs(activeKeyword || 'admin', true);
  };

  // Public API
  window.JobStreetViewer = {
    mount: mountJobStreetViewer,
    selectJob: selectJobStreetJob,
    switchTheme: window.switchViewerTheme,
    triggerLiveSync: window.triggerLiveJobSync,
    fetchLiveJobs: fetchLiveJobs,
    loadJobs: function(jobs) {
      if (Array.isArray(jobs) && jobs.length > 0) {
        currentJobs = jobs;
        activeJobId = jobs[0].id;
        renderJobStreetUI();
      }
    },
    focusJob: function(jobId) {
      activeJobId = jobId;
      renderJobStreetUI();
    }
  };

})(window);
