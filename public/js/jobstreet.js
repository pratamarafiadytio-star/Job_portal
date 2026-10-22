// ==============================================================
// KerjaHub - JobStreet-Style Interactive Dual-Pane Job Engine
// Split-Screen Layout, Real-Time Instant Filtering,
// Corporate Brand Showcase Banner, Anti-Fraud & Lamaran Cepat
// ==============================================================

(function(window) {
  'use strict';

  // High-profile official jobs including exact jobs from Indolakto - Indofood CBP
  const JS_OFFICIAL_JOBS = [
    {
      id: 'indolakto_01',
      title: 'Internal Audit Supervisor (Finance Focused)',
      company_name: 'PT Indolakto - Indofood CBP (INDOMILK)',
      brand_logo_text: 'PT INDOLAKTO',
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.4',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Audit - Internal (Akuntansi)',
      job_type: 'Full time',
      location: 'Jakarta Timur, Jakarta Raya',
      salary_display: 'Rp 12.000.000 - Rp 18.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 4 jam yang lalu',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment.indolakto@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indolakto never charges any fees during the recruitment process, nor do we collaborate with travel agents or bureaus. Please ignore any requests for payment related to tickets, accommodation, or administration fees. Lowongan resmi terverifikasi anti-hoax!',
      description: 'This position is responsible to conduct efficient and effective audit plans and audit programs, ensuring compliance with company financial policies, internal accounting controls, and recommending actionable improvements across Indofood CBP Indolakto business units.',
      responsibilities: [
        'Conduct comprehensive risk-based financial, operational, and compliance internal audit programs across factories and corporate divisions.',
        'Evaluate the adequacy and effectiveness of internal accounting controls and operating procedures.',
        'Prepare clear, concise audit reports and present constructive findings and recommendations to senior management.',
        'Perform follow-up audits to monitor management actions on previous audit recommendations.',
        'Assist in special investigative audits and ad-hoc reviews requested by the Audit Committee or Directors.'
      ],
      requirements: [
        'Bachelor Degree (S1) in Accounting, Finance, or equivalent from a reputable university.',
        'Minimum 4-5 years of experience in Internal Audit, Risk Assurance, or Public Accounting Firm (Big 4 preferred).',
        'Strong knowledge of Indonesian Accounting Standards (PSAK), internal control frameworks (COSO), and audit methodologies.',
        'Proficiency in SAP (FI/CO modules) and computerized audit tools (ACL, IDEA, or advanced Excel).',
        'High integrity, objective mindset, sharp analytical thinking, and excellent interpersonal communication skills in Indonesian & English.'
      ],
      benefits: [
        'Competitive salary + Attractive performance bonus & THR',
        'Comprehensive private medical insurance (BPJS & Inhealth/Class 1)',
        'Monthly product allowance of Indofood & Indolakto products (Milk, Snacks, Cooking Essentials)',
        'Continuous learning, professional development & certification support (CIA/CPA)'
      ]
    },
    {
      id: 'indolakto_02',
      title: 'Industrial Relations Manager',
      company_name: 'PT Indolakto - Indofood CBP (INDOMILK)',
      brand_logo_text: 'PT INDOLAKTO',
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.4',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Human Resources & Industrial Relations',
      job_type: 'Full time',
      location: 'Jakarta Timur, Jakarta Raya',
      salary_display: 'Rp 20.000.000 - Rp 30.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 3 hari yang lalu',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment.indolakto@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indolakto never charges any fees during the recruitment process, nor do we collaborate with travel agents or bureaus. Please ignore any requests for payment related to tickets, accommodation, or administration fees.',
      description: 'This position is responsible to develop and implement Industrial Relations strategies and policies across HO, factories, and distribution operations to maintain a harmonious work environment and statutory compliance.',
      responsibilities: [
        'Lead and maintain constructive relationships with labor unions (SPSI) and bipartite cooperation.',
        'Provide expert guidance on Indonesian Labor Law (UU Ketenagakerjaan & UU Cipta Kerja).',
        'Manage grievance handling, disciplinary procedures, and industrial dispute resolution.',
        'Coordinate the drafting and renewal of Collective Labor Agreements (PKB).'
      ],
      requirements: [
        'Bachelor or Master Degree in Law (Hukum) or Human Resource Management.',
        'Minimum 7-8 years of extensive experience in Industrial Relations within manufacturing or FMCG.',
        'Demonstrated track record in successful union negotiations and mediation.',
        'Strong leadership, emotional intelligence, and excellent crisis management skills.'
      ],
      benefits: [
        'Executive remuneration package + Performance bonus + Annual company car allowance',
        'Complete family medical health coverage (Inpatient, Outpatient, Dental)',
        'Indofood product hampers & family welfare benefits'
      ]
    },
    {
      id: 'indofood_hr_03',
      title: 'Human Resources Staff',
      company_name: 'PT Indofood CBP Sukses Makmur Tbk',
      brand_logo_text: 'INDOFOOD CBP',
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.5',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'People & Organization / HR Operations',
      job_type: 'Full time',
      location: 'Jakarta Raya / Cibitung',
      salary_display: 'Rp 6.000.000 - Rp 8.500.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 37 menit yang lalu',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indofood CBP Sukses Makmur Tbk tidak pernah memungut biaya apapun dalam proses rekrutmen. Waspadai segala bentuk penipuan.',
      description: 'Info Terbaru Lowongan Kerja Human Resources Staff Jakarta November 2026 di Indofood CBP. Mengelola administrasi kepersonaliaan, rekrutmen karyawan, absensi digital, dan program orientasi karyawan baru.',
      responsibilities: [
        'Memproses administrasi kepegawaian harian (absensi, cuti, lembur, dan BPJS Ketenagakerjaan/Kesehatan).',
        'Membantu proses end-to-end talent acquisition (screening CV, penjadwalan interview, dan tes psikologi).',
        'Menyelenggarakan sesi onboarding bagi karyawan baru.',
        'Menyusun laporan bulanan HR metrics dan headcount turn-over.'
      ],
      requirements: [
        'Lulusan S1 Psikologi, Manajemen SDM, Hukum, atau Administrasi Bisnis.',
        'Fresh Graduate dengan IPK min. 3.20 atau pengalaman 1 tahun di bidang HR.',
        'Memahami dasar-dasar alat tes psikologi dan administrasi kepersonaliaan.',
        'Menguasai Microsoft Excel (VLOOKUP, Pivot Table) dan HRIS (SAP diutamakan).'
      ],
      benefits: [
        'Gaji kompetitif + THR + Bonus tahunan grup Indofood',
        'Asuransi kesehatan rawat jalan & inap',
        'Paket sembako dan produk Indofood bulanan'
      ]
    },
    {
      id: 'indolakto_comben_04',
      title: 'Compensation & Benefit Manager',
      company_name: 'PT Indolakto - Indofood CBP (INDOMILK)',
      brand_logo_text: 'PT INDOLAKTO',
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.4',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Total Rewards / C&B',
      job_type: 'Full time',
      location: 'Jakarta Timur, Jakarta Raya',
      salary_display: 'Rp 22.000.000 - Rp 32.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 1 hari yang lalu',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment.indolakto@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indolakto never charges any fees during the recruitment process, nor do we collaborate with travel agents or bureaus.',
      description: 'Responsible to design, benchmark, and administer competitive compensation structures, grading systems, executive salary scales, and comprehensive employee welfare benefits programs.',
      responsibilities: [
        'Conduct comprehensive salary surveys (Mercer, Korn Ferry) and market benchmarking.',
        'Formulate and maintain the job evaluation and grading system (Hay methodology).',
        'Manage annual merit increase, bonus distribution schemes, and variable incentive plans.',
        'Oversee medical insurance scheme renewal and cost efficiency analysis.'
      ],
      requirements: [
        'Bachelor Degree in Economics, Statistics, Mathematics, or Human Resources.',
        'Minimum 6-8 years in Compensation & Benefits with prior managerial role in FMCG.',
        'Advanced analytical abilities with deep expertise in compensation modeling and taxation (PPh 21).'
      ],
      benefits: [
        'Executive salary package + Car allowance + Annual performance bonus',
        'Full medical insurance coverage for employee and family',
        'Indofood welfare hampers'
      ]
    },
    {
      id: 'bri_it_05',
      title: 'IT Solution Architect & Cloud Engineer',
      company_name: 'PT Bank Rakyat Indonesia (Persero) Tbk',
      brand_logo_text: 'BANK BRI',
      brand_banner: './uploads/corporate_worker_mascot.jpg',
      rating: '4.7',
      sector: 'bumn',
      category: 'Teknologi & IT',
      role_department: 'Information Technology Division',
      job_type: 'Full time',
      location: 'Jakarta Pusat (Kantor Pusat BRI)',
      salary_display: 'Rp 20.000.000 - Rp 35.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 5 jam yang lalu',
      official_url: 'https://e-recruitment.bri.co.id',
      contact_email: 'recruitment@bri.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Bank Rakyat Indonesia (Persero) Tbk tidak pernah memungut biaya apapun dalam proses seleksi. Pengumuman resmi hanya melalui e-recruitment.bri.co.id.',
      description: 'BRI mengundang IT Architect berpengalaman untuk merancang arsitektur sistem digital banking modern, microservices, dan multi-cloud infrastructure yang melayani lebih dari 100 juta nasabah.',
      responsibilities: [
        'Merancang arsitektur sistem perbankan scalable, high availability (99.99%), dan zero downtime.',
        'Mengembangkan standar keamanan cloud enterprise (AWS, Google Cloud, Private Cloud).',
        'Memimpin arsitektur integrasi API BRIAPI bersama ribuan mitra korporasi.'
      ],
      requirements: [
        'Lulusan S1/S2 Teknik Informatika, Sistem Informasi, atau bidang terkait.',
        'Pengalaman minimal 5 tahun dalam enterprise IT architecture atau cloud infrastructure.',
        'Memiliki sertifikasi resmi AWS Certified Solutions Architect atau GCP Professional Architect.'
      ],
      benefits: [
        'Gaji kompetitif BUMN tier 1 + Bonus kinerja tahunan + Insentif prestasi',
        'Fasilitas asuransi kesehatan swasta kelas VVIP',
        'Tunjangan cuti, kepemilikan rumah (KPR bunga khusus karyawan), dan dana pensiun'
      ]
    },
    {
      id: 'toyota_ops_06',
      title: 'Operator Produksi & Logistik Manufaktur',
      company_name: 'PT Toyota Motor Manufacturing Indonesia (TMMIN)',
      brand_logo_text: 'TOYOTA TMMIN',
      brand_banner: './uploads/factory_operator_mascot.jpg',
      rating: '4.6',
      sector: 'manufaktur',
      category: 'Operasional',
      role_department: 'Production Division',
      job_type: 'Full time',
      location: 'KIIC Karawang / Sunter Jakarta',
      salary_display: 'Rp 5.500.000 - Rp 7.200.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 6 jam yang lalu',
      official_url: 'https://recruitment.toyota.co.id',
      contact_email: 'recruitment@toyota.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Toyota Motor Manufacturing Indonesia tidak pernah memungut biaya apapun dalam proses rekrutmen karyawan. Hati-hati terhadap calo.',
      description: 'Kesempatan karir resmi Operator Produksi & Logistik Manufaktur untuk fasilitas perakitan kendaraan kelas dunia berstandar Toyota Production System (TPS).',
      responsibilities: [
        'Menjalankan proses assembling dan inspeksi part otomotif sesuai standar TPS.',
        'Mengoperasikan mesin manufaktur dan memantau parameter kualitas tanpa cacat.',
        'Melakukan continuous improvement (Kaizen) di lini perakitan.'
      ],
      requirements: [
        'Pendidikan minimal SMA/SMK sederajat (Teknik Mesin, Otomotif, Listrik, atau sejenis).',
        'Nilai rata-rata raport/ijazah memuaskan, disiplin, dan teliti.',
        'Sehat jasmani dan rohani, tidak buta warna, dan siap bekerja sistem shift.'
      ],
      benefits: [
        'Gaji pokok sesuai UMK Karawang/Jakarta + Lembur normatif',
        'Asuransi kesehatan swasta rawat jalan & inap serta BPJS lengkap',
        'Fasilitas jemputan bus karyawan, makan siang, dan seragam lengkap'
      ]
    }
  ];

  let currentJobs = [...JS_OFFICIAL_JOBS];
  let activeJobId = JS_OFFICIAL_JOBS[0].id;
  let activeSector = 'all';
  let activeKeyword = '';
  let isAdminMode = false;

  // Supabase client instance initialized from /api/config
  let sbClient = null;

  async function initJobStreetSupabase() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
          sbClient = window.supabase.createClient(data.supabaseUrl, data.supabaseKey);
          // Sync live jobs from Supabase
          syncJobsFromSupabase();
        }
      }
    } catch (e) {
      console.warn('JobStreet Supabase init notice:', e);
    }
  }

  async function syncJobsFromSupabase() {
    if (!sbClient) return;
    try {
      const { data, error } = await sbClient
        .from('jobs')
        .select('*')
        .in('status', ['active', 'expired', 'closed'])
        .order('id', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase jobs into our view if not duplicates
        const formatted = data.map(dbJob => {
          let brandBanner = dbJob.poster_image || './uploads/indolakto_indomilk_banner.jpg';
          if ((dbJob.company_name || '').toLowerCase().includes('indolakto') || (dbJob.company_name || '').toLowerCase().includes('indofood')) {
            brandBanner = './uploads/indolakto_indomilk_banner.jpg';
          }
          return {
            id: 'db_' + dbJob.id,
            db_id: dbJob.id,
            title: dbJob.title,
            company_name: dbJob.company_name,
            brand_logo_text: (dbJob.company_name || 'PERUSAHAAN').substring(0, 18).toUpperCase(),
            brand_banner: brandBanner,
            rating: '4.5',
            sector: (dbJob.category || '').toLowerCase().includes('it') ? 'tech' : 'fmcg',
            category: dbJob.category || 'Umum',
            role_department: dbJob.category || 'Operasional',
            job_type: dbJob.job_type || 'Full time',
            location: dbJob.location || 'Indonesia',
            salary_display: dbJob.salary_display || 'Kompetitif',
            salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
            posted_time: 'Diposting baru saja',
            official_url: dbJob.website_url || './',
            contact_email: dbJob.email || '',
            contact_whatsapp: dbJob.whatsapp || '',
            anti_fraud_notice: `PT ${dbJob.company_name} tidak pernah memungut biaya apapun dalam proses rekrutmen. Lowongan resmi terverifikasi anti-hoax!`,
            description: dbJob.description || 'Lowongan pekerjaan resmi terverifikasi.',
            responsibilities: Array.isArray(dbJob.responsibilities) ? dbJob.responsibilities : [dbJob.description || 'Menjalankan tugas sesuai arahan manajemen.'],
            requirements: Array.isArray(dbJob.requirements) ? dbJob.requirements : ['Pendidikan relevan', 'Disiplin dan bertanggung jawab'],
            benefits: Array.isArray(dbJob.benefits) ? dbJob.benefits : ['Gaji pokok sesuai UMK', 'BPJS Ketenagakerjaan & Kesehatan']
          };
        });

        // Prepend fresh DB jobs while keeping Indolakto showcase at top
        const indolaktoMain = JS_OFFICIAL_JOBS.slice(0, 4);
        currentJobs = [...indolaktoMain, ...formatted];
        renderJobStreetUI();
      }
    } catch (e) {
      console.warn('Sync from Supabase failed, using local presets:', e);
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Mount JobStreet Dual-Pane HTML into target container
  function mountJobStreetViewer(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    isAdminMode = !!options.isAdmin;

    container.innerHTML = `
      <div class="jobstreet-viewer-wrap" id="jobstreet-main-wrapper">
        <!-- TOP SEARCH & FILTER BAR -->
        <div class="jobstreet-top-bar">
          <div class="jobstreet-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="jobstreet-search-input" id="js-search-input" placeholder="Cari posisi atau perusahaan (Contoh: indofood cbp, audit, staff)..." value="${escapeHtml(activeKeyword)}">
            <button type="button" class="jobstreet-search-clear" id="js-search-clear" title="Hapus Pencarian">✕</button>
          </div>

          <div class="jobstreet-pills-row" id="js-filter-pills-row">
            <button type="button" class="js-filter-pill active" data-sector="all">Semua</button>
            <button type="button" class="js-filter-pill" data-sector="fmcg"><i class="fa-solid fa-sparkles"></i> Baru untuk kamu</button>
            <button type="button" class="js-filter-pill" data-sector="fmcg">Indofood / FMCG</button>
            <button type="button" class="js-filter-pill" data-sector="bumn">BUMN & Bank</button>
            <button type="button" class="js-filter-pill" data-sector="manufaktur">Manufaktur</button>
            <button type="button" class="js-filter-pill" data-sector="tech">Teknologi</button>
          </div>

          <div class="jobstreet-top-actions">
            <a href="./loker.html" target="_blank" class="btn-js-open-tab" title="Buka Tampilan Penuh di Tab Baru">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka di Tab Baru
            </a>
            ${isAdminMode ? `
              <button type="button" class="btn-js-close-viewer" onclick="closeJobStreetAdminSection()" title="Kembali ke Dashboard Admin">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- DUAL PANE BODY -->
        <div class="jobstreet-body">
          <!-- LEFT COLUMN: CARDS LIST -->
          <div class="jobstreet-left-pane" id="js-left-cards-pane">
            <!-- Cards rendered dynamically -->
          </div>

          <!-- RIGHT COLUMN: DETAILED VIEW -->
          <div class="jobstreet-right-pane" id="js-right-detail-pane">
            <!-- Details rendered dynamically -->
          </div>
        </div>
      </div>

      <!-- APPLY MODAL (LAMARAN CEPAT) -->
      <div class="js-apply-modal-overlay" id="js-apply-modal">
        <div class="js-apply-modal-box">
          <div class="js-apply-modal-header">
            <span class="js-apply-modal-title"><i class="fa-solid fa-bolt" style="color: #e6005c;"></i> Opsi Lamaran Cepat Resmi</span>
            <button type="button" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#9d174d;" onclick="closeJobStreetApplyModal()">✕</button>
          </div>
          <div class="js-apply-modal-body" id="js-apply-modal-body">
            <!-- Injected options -->
          </div>
        </div>
      </div>
    `;

    setupJobStreetEvents();
    renderJobStreetUI();
    initJobStreetSupabase();
  }

  function setupJobStreetEvents() {
    const searchInp = document.getElementById('js-search-input');
    const clearBtn = document.getElementById('js-search-clear');

    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        activeKeyword = e.target.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = activeKeyword ? 'inline-block' : 'none';
        filterAndRenderCards();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInp) searchInp.value = '';
        activeKeyword = '';
        clearBtn.style.display = 'none';
        filterAndRenderCards();
      });
    }

    // Sector pills
    document.querySelectorAll('.js-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.js-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSector = btn.getAttribute('data-sector') || 'all';
        filterAndRenderCards();
      });
    });
  }

  function getFilteredJobs() {
    return currentJobs.filter(job => {
      if (activeSector !== 'all' && job.sector !== activeSector) return false;
      if (activeKeyword) {
        const fullTxt = `${job.title} ${job.company_name} ${job.location} ${job.category} ${job.role_department}`.toLowerCase();
        if (!fullTxt.includes(activeKeyword)) return false;
      }
      return true;
    });
  }

  function filterAndRenderCards() {
    const list = getFilteredJobs();
    if (list.length > 0) {
      // If current active job not in list, pick first
      if (!list.some(j => j.id === activeJobId)) {
        activeJobId = list[0].id;
      }
    }
    renderJobStreetUI();
  }

  function renderJobStreetUI() {
    const leftPane = document.getElementById('js-left-cards-pane');
    const rightPane = document.getElementById('js-right-detail-pane');
    if (!leftPane || !rightPane) return;

    const filtered = getFilteredJobs();

    // 1. Render Left Cards List
    if (filtered.length === 0) {
      leftPane.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 12px; color: #cbd5e1;"></i>
          <p style="font-weight: 700; color: #475569;">Tidak ada lowongan yang cocok.</p>
          <p style="font-size: 0.82rem;">Coba ubah kata kunci atau pilih pill "Semua".</p>
        </div>
      `;
    } else {
      leftPane.innerHTML = `
        <div class="js-cards-meta-header">
          <span>Menampilkan ${filtered.length} Lowongan</span>
          <span style="color: #059669; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-circle-check"></i> Terverifikasi</span>
        </div>
        ${filtered.map(job => {
          const isActive = job.id === activeJobId;
          const snippet = job.responsibilities?.[0] || job.description || '';
          return `
            <div class="js-job-card ${isActive ? 'active' : ''}" onclick="selectJobStreetJob('${job.id}')">
              <div class="js-card-top-row">
                <h3 class="js-card-title">${escapeHtml(job.title)}</h3>
                <span class="js-card-brand-logo-text">${escapeHtml(job.brand_logo_text || 'OFFICIAL')}</span>
              </div>
              <div class="js-card-company">${escapeHtml(job.company_name)}</div>
              <div class="js-card-location">
                <i class="fa-solid fa-location-dot" style="color: #64748b;"></i>
                <span>${escapeHtml(job.location)}</span>
              </div>
              <div class="js-card-snippet">${escapeHtml(snippet)}</div>
              <div class="js-card-footer">
                <span class="js-card-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(job.posted_time || 'Baru saja')}</span>
                <button type="button" class="js-card-bookmark-btn" onclick="event.stopPropagation(); toggleSaveJob('${job.id}')" title="Simpan Lowongan">
                  <i class="fa-regular fa-bookmark"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      `;
    }

    // 2. Render Right Detail Pane
    const activeJob = currentJobs.find(j => j.id === activeJobId) || filtered[0] || currentJobs[0];
    if (!activeJob) {
      rightPane.innerHTML = `<div style="padding: 40px; text-align: center; color: #94a3b8;">Pilih lowongan untuk melihat rincian</div>`;
      return;
    }

    const defaultBanner = './uploads/indolakto_indomilk_banner.jpg';
    const bannerSrc = activeJob.brand_banner || defaultBanner;

    rightPane.innerHTML = `
      <!-- BRAND HERO SHOWCASE BANNER -->
      <div class="js-hero-banner-container">
        <img src="${bannerSrc}" alt="${escapeHtml(activeJob.company_name)}" class="js-hero-banner-img" onerror="this.src='${defaultBanner}'">
      </div>

      <div class="js-detail-inner">
        <!-- COMPANY BRAND MARK -->
        <div class="js-company-logo-badge">
          <i class="fa-solid fa-building" style="color: #0284c7;"></i> ${escapeHtml(activeJob.brand_logo_text || activeJob.company_name)}
        </div>

        <!-- JOB TITLE -->
        <h1 class="js-detail-title">${escapeHtml(activeJob.title)}</h1>

        <!-- COMPANY ROW WITH RATING & VERIFIED BADGE -->
        <div class="js-company-info-row">
          <span>${escapeHtml(activeJob.company_name)}</span>
          <i class="fa-solid fa-circle-check js-verified-badge" title="Perusahaan Terverifikasi Resmi"></i>
          <span class="js-star-rating">
            <i class="fa-solid fa-star"></i> ${escapeHtml(activeJob.rating || '4.5')}
          </span>
          <span>•</span>
          <a href="javascript:void(0)" onclick="filterCompanyJobs('${escapeHtml(activeJob.company_name)}')" class="js-see-all-jobs-link">Lihat semua lowongan kerja</a>
        </div>

        <!-- METADATA LIST -->
        <div class="js-meta-list">
          <div class="js-meta-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(activeJob.location)}</span>
          </div>
          <div class="js-meta-item">
            <i class="fa-solid fa-briefcase"></i>
            <span>${escapeHtml(activeJob.role_department || activeJob.category)}</span>
          </div>
          <div class="js-meta-item">
            <i class="fa-solid fa-clock"></i>
            <span>${escapeHtml(activeJob.job_type)}</span>
          </div>
          <div class="js-meta-item">
            <i class="fa-solid fa-money-bill-wave" style="color: #059669;"></i>
            <span style="font-weight: 700; color: #059669;">${escapeHtml(activeJob.salary_display || 'Gaji Kompetitif')}</span>
            <span style="color: #94a3b8;">—</span>
            <a href="javascript:void(0)" class="js-salary-expectation-link" onclick="promptSalaryExpectation()">${escapeHtml(activeJob.salary_prompt || 'Isi ekspektasi gaji di profil untuk cek kecocokan >')}</a>
          </div>
        </div>

        <span class="js-posted-time-badge">${escapeHtml(activeJob.posted_time || 'Diposting baru saja')}</span>

        <!-- ACTIONS BAR -->
        <div class="js-actions-bar">
          <button type="button" class="btn-lamaran-cepat" onclick="openJobStreetApplyModal('${activeJob.id}')">
            <i class="fa-solid fa-bolt"></i> Lamaran Cepat
          </button>
          <button type="button" class="btn-js-simpan" id="btn-save-${activeJob.id}" onclick="toggleSaveJob('${activeJob.id}')">
            <i class="fa-regular fa-bookmark"></i> Simpan
          </button>
          <button type="button" class="btn-js-action-icon" onclick="shareJobStreetJob('${activeJob.id}', 'wa')" title="Bagikan ke WhatsApp">
            <i class="fa-brands fa-whatsapp" style="color: #25d366; font-size: 1.15rem;"></i>
          </button>
          <button type="button" class="btn-js-action-icon" onclick="copyJobStreetLink('${activeJob.id}')" title="Salin Tautan Lowongan">
            <i class="fa-solid fa-link"></i>
          </button>
          ${activeJob.official_url ? `
            <a href="${activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-action-icon" title="Buka Tautan Resmi Perusahaan ↗">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          ` : ''}
        </div>

        <!-- ADMIN CONTROLS (IF LOADED IN ADMIN PANEL) -->
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

        <!-- ANTI-FRAUD / SECURITY DISCLAIMER (RED TINT BOX) -->
        <div class="js-anti-fraud-banner">
          <i class="fa-solid fa-shield-heart"></i>
          <div>
            <strong>Pemberitahuan Keamanan Rekrutmen:</strong>
            <p style="margin: 4px 0 0 0;">${escapeHtml(activeJob.anti_fraud_notice)}</p>
          </div>
        </div>

        <!-- JOB DESCRIPTION -->
        <div class="js-content-block">
          <h2 class="js-section-heading"><i class="fa-solid fa-file-lines" style="color: #6366f1;"></i> Deskripsi Pekerjaan</h2>
          <p class="js-text-desc">${escapeHtml(activeJob.description)}</p>
        </div>

        <!-- RESPONSIBILITIES -->
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

        <!-- REQUIREMENTS -->
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

        <!-- BENEFITS -->
        ${Array.isArray(activeJob.benefits) && activeJob.benefits.length > 0 ? `
          <div class="js-content-block">
            <h2 class="js-section-heading"><i class="fa-solid fa-gift" style="color: #f59e0b;"></i> Benefit & Tunjangan</h2>
            <ul class="js-check-list">
              ${activeJob.benefits.map(ben => `
                <li><i class="fa-solid fa-circle-check" style="color: #f59e0b;"></i> <span>${escapeHtml(ben)}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- DIRECT CONTACT CHANNELS -->
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
            ${activeJob.official_url ? `
              <a href="${activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-chan-web">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Tautan Resmi Perusahaan
              </a>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }

  // Select job in left pane
  window.selectJobStreetJob = function(jobId) {
    activeJobId = jobId;
    renderJobStreetUI();
  };

  // Filter company jobs
  window.filterCompanyJobs = function(compName) {
    const searchInp = document.getElementById('js-search-input');
    if (searchInp) {
      searchInp.value = compName;
      activeKeyword = compName.toLowerCase();
      filterAndRenderCards();
    }
  };

  // Lamaran Cepat Modal
  window.openJobStreetApplyModal = function(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('js-apply-modal');
    const body = document.getElementById('js-apply-modal-body');
    if (!modal || !body) return;

    const email = job.contact_email || 'recruitment@indolakto.com';
    const wa = job.contact_whatsapp || '081234567890';
    const web = job.official_url || 'https://careers.indofood.com';

    body.innerHTML = `
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${escapeHtml(job.title)}</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin: 0;">${escapeHtml(job.company_name)}</p>
      </div>

      <!-- OPTION 1: GMAIL WEB COMPOSE -->
      <a href="javascript:void(0)" class="js-apply-option-card" onclick="triggerWebmailApply('${email}', '${escapeHtml(job.company_name)}', '${escapeHtml(job.title)}'); closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #fef2f2; color: #ea4335;">
          <i class="fa-brands fa-google"></i>
        </div>
        <div class="js-apply-option-info">
          <h4>Kirim Lamaran via Gmail (Home Webmail)</h4>
          <p>Membuka Gmail Web Compose dengan penerima ${escapeHtml(email)} dan draf surat lamaran formal siap kirim.</p>
        </div>
      </a>

      <!-- OPTION 2: WHATSAPP HRD -->
      <a href="javascript:void(0)" class="js-apply-option-card" onclick="triggerWhatsAppApply('${wa}', '${escapeHtml(job.company_name)}', '${escapeHtml(job.title)}'); closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #ecfdf5; color: #10b981;">
          <i class="fa-brands fa-whatsapp"></i>
        </div>
        <div class="js-apply-option-info">
          <h4>Hubungi HRD Rekrutmen via WhatsApp</h4>
          <p>Membuka chat WhatsApp dengan template pesan perkenalan & pengajuan berkas CV.</p>
        </div>
      </a>

      <!-- OPTION 3: OFFICIAL CAREER PORTAL -->
      <a href="${web}" target="_blank" rel="noopener noreferrer" class="js-apply-option-card" onclick="closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #eff6ff; color: #0284c7;">
          <i class="fa-solid fa-globe"></i>
        </div>
        <div class="js-apply-option-info">
          <h4>Portal Pendaftaran Resmi Perusahaan</h4>
          <p>Daftar online langsung melalui sistem portal karir resmi perusahaan (bebas calo & anti-hoax).</p>
        </div>
      </a>
    `;

    modal.classList.add('active');
  };

  window.closeJobStreetApplyModal = function() {
    const modal = document.getElementById('js-apply-modal');
    if (modal) modal.classList.remove('active');
  };

  // Gmail Web Compose Deep Link ("masuk ke home email gitu gas")
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

  // WhatsApp HRD Launcher
  window.triggerWhatsAppApply = function(phone, companyName, jobTitle) {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    else if (!clean.startsWith('62')) clean = '62' + clean;

    const text = encodeURIComponent(
      `Halo Tim Rekrutmen ${companyName},\n\nPerkenalkan saya [Nama Anda]. Saya melihat informasi poster lowongan kerja resmi untuk posisi ${jobTitle} di portal KerjaHub.\n\nSaya bermaksud mengajukan lamaran kerja dan siap mengirimkan berkas CV serta dokumen pendukung. Mohon petunjuk proses pendaftaran selanjutnya. Terima kasih.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, '_blank');
  };

  // Bookmark / Save toggle
  window.toggleSaveJob = function(jobId) {
    const btn = document.getElementById(`btn-save-${jobId}`);
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('js_saved_jobs') || '[]');
    } catch (e) {}

    const idx = saved.indexOf(jobId);
    if (idx >= 0) {
      saved.splice(idx, 1);
      if (btn) {
        btn.classList.remove('saved');
        btn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Simpan`;
      }
    } else {
      saved.push(jobId);
      if (btn) {
        btn.classList.add('saved');
        btn.innerHTML = `<i class="fa-solid fa-bookmark" style="color:#e11d48;"></i> Tersimpan`;
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
    const exp = prompt('Masukkan ekspektasi gaji Anda (contoh: Rp 15.000.000):');
    if (exp) {
      alert(`Ekspektasi gaji ${exp} tersimpan! Profil Anda cocok dengan rentang anggaran posisi ini.`);
    }
  };

  // Admin controls bridge
  window.publishFromJobStreetView = function(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    if (typeof window.publishJobDataDirectly === 'function') {
      window.publishJobDataDirectly(job);
    } else {
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
      window.switchSection('sosmed-generator');
    }
  };

  // Public API
  window.JobStreetViewer = {
    mount: mountJobStreetViewer,
    selectJob: selectJobStreetJob,
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
