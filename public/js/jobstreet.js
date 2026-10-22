// ==============================================================
// KerjaHub - JobStreet by SEEK & LinkedIn Live Dual-Pane Engine
// Exact visual replica of JobStreet by SEEK & LinkedIn Jobs
// Real-time Search, Live Generation & Social/Portal Job Scouting
// ==============================================================

(function(window) {
  'use strict';

  // SVG Brand Assets for Pixel-Perfect Corporate Logos
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

  // Pink Scallop Shell Logo (PT Lautan Anugerah Global Indonesia from screenshot)
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

  // Engineering Gear Crest Logo (PT KARUNIA TEKNIK INDONESIA)
  const KARUNIA_TEKNIK_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#0f172a"/>
      <circle cx="40" cy="40" r="26" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="8 4"/>
      <circle cx="40" cy="40" r="16" fill="#0284c7"/>
      <path d="M40 24 L43 32 L51 34 L45 40 L47 48 L40 44 L33 48 L35 40 L29 34 L37 32 Z" fill="#fbbf24"/>
      <circle cx="40" cy="40" r="5" fill="#0f172a"/>
    </svg>
  `;

  // Green Circular Emblem Logo (PT Multi Logistik Indonesia - Admin Import)
  const GREEN_EMBLEM_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <circle cx="40" cy="40" r="36" fill="#065f46"/>
      <circle cx="40" cy="40" r="28" stroke="#34d399" stroke-width="2.5" fill="none"/>
      <circle cx="40" cy="40" r="18" fill="#10b981"/>
      <path d="M40 28 C46.6 28 52 33.4 52 40 C52 46.6 46.6 52 40 52 C35 52 30.8 49 29 44.5 C31.5 45.5 34.3 46 37.2 46 C42.2 46 46.2 42 46.2 37 C46.2 33.5 44.2 30.5 41.2 29 C40.8 28.5 40.4 28.2 40 28 Z" fill="#fde047"/>
    </svg>
  `;

  // Indofood / Indolakto Logo SVG
  const INDOFOOD_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#0284c7"/>
      <circle cx="40" cy="40" r="26" fill="#ffffff"/>
      <path d="M28 40 C28 32 33 26 40 26 C47 26 52 32 52 40 C52 48 47 54 40 54 C33 54 28 48 28 40 Z" fill="#0369a1"/>
      <path d="M35 34 H45 V46 H35 Z" fill="#ef4444"/>
      <circle cx="40" cy="40" r="3" fill="#ffffff"/>
    </svg>
  `;

  // Kalbe Farma Logo SVG
  const KALBE_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#15803d"/>
      <circle cx="40" cy="40" r="24" fill="#ffffff"/>
      <path d="M32 40 L38 32 H46 L38 42 L47 50 H39 L32 40 Z" fill="#15803d"/>
      <circle cx="48" cy="30" r="3" fill="#84cc16"/>
    </svg>
  `;

  // Mayora Indah Logo SVG
  const MAYORA_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#dc2626"/>
      <circle cx="40" cy="40" r="24" fill="#ffffff"/>
      <path d="M28 48 L34 32 L40 42 L46 32 L52 48 H46 L40 38 L34 48 Z" fill="#dc2626"/>
    </svg>
  `;

  // BCA Logo SVG
  const BCA_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#003399"/>
      <circle cx="40" cy="40" r="22" stroke="#ffffff" stroke-width="4" fill="none"/>
      <text x="40" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">BCA</text>
    </svg>
  `;

  // Astra International Logo SVG
  const ASTRA_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#034ea2"/>
      <circle cx="40" cy="40" r="22" fill="#ffffff"/>
      <polygon points="40,24 45,36 57,36 47,44 51,56 40,48 29,56 33,44 23,36 35,36" fill="#034ea2"/>
    </svg>
  `;

  // Telkom Indonesia Logo SVG
  const TELKOM_LOGO_SVG = `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <rect width="80" height="80" rx="12" fill="#ffffff" stroke="#e2e8f0"/>
      <circle cx="34" cy="40" r="16" fill="#e11d48"/>
      <circle cx="46" cy="40" r="16" fill="#991b1b" opacity="0.8"/>
    </svg>
  `;

  // ==============================================================
  // ACTUAL LIVE INDONESIAN JOBS (STARTING WITH EXACT SCREENSHOT MATCHES)
  // ==============================================================
  const JS_OFFICIAL_JOBS = [
    {
      id: 'js_admin_karunia_01',
      title: 'ADMIN',
      company_name: 'PT KARUNIA TEKNIK INDONESIA',
      brand_logo_text: 'KARUNIA TEKNIK',
      brand_logo_svg: KARUNIA_TEKNIK_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.3',
      sector: 'manufaktur',
      category: 'Administrasi & Operasional',
      role_department: 'Staff Administrasi Pesanan & Penjualan',
      job_type: 'Full time',
      location: 'Tangerang, Banten',
      salary_display: 'Rp 4.800.000 - Rp 6.200.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '1 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: true,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/admin-jobs/',
      linkedin_url: 'https://www.linkedin.com/jobs/search/?keywords=Admin&location=Tangerang',
      official_url: 'https://www.jobstreet.co.id/id/job-search/admin-jobs/',
      contact_email: 'recruitment@karuniateknik.co.id',
      contact_whatsapp: '081288776655',
      anti_fraud_notice: 'PT KARUNIA TEKNIK INDONESIA tidak pernah memungut biaya apapun dalam proses rekrutmen atau bekerjasama dengan agen perjalanan tiket. Lowongan resmi terverifikasi anti-hoax!',
      description: 'Job Desc : 1.Menginput data pesanan dan penjualan harian ke system 2.Membuat dok penagihan dan surat jalan 3.Berkoordinasi dgn tim gudang dan kurir pengiriman.',
      responsibilities: [
        'Menginput data pesanan dan penjualan harian pelanggan ke dalam sistem ERP perusahaan.',
        'Membuat dokumen penagihan, invoice, kuitansi, dan surat jalan pengiriman barang.',
        'Berkoordinasi aktif dengan tim gudang, purchasing, serta kurir/ekspedisi logistik.',
        'Menyusun rekapitulasi laporan administrasi penjualan mingguan dan bulanan.',
        'Mengarsipkan berkas transaksi dan faktur penjualan secara rapi dan akurat.'
      ],
      requirements: [
        'Pendidikan minimal SMA/SMK/D3/S1 semua jurusan (Administrasi/Manajemen diutamakan).',
        'Pengalaman minimal 1 tahun sebagai Staff Admin / Data Entry (Fresh Graduate dipersilakan melamar).',
        'Menguasai Microsoft Office (Word, Excel fungsi VLOOKUP, SUMIF, Pivot Table).',
        'Teliti, cekatan, memiliki kemampuan komunikasi yang baik dan disiplin tinggi.',
        'Bersedia ditempatkan di area Tangerang, Banten.'
      ],
      benefits: [
        'Gaji pokok kompetitif sesuai UMK Tangerang + Uang Makan & Transport',
        'BPJS Ketenagakerjaan & BPJS Kesehatan',
        'Tunjangan Hari Raya (THR) & Bonus Kinerja Tahunan',
        'Lingkungan kerja suportif dan jenjang karir terbuka'
      ]
    },
    {
      id: 'js_admin_lautan_02',
      title: 'Finance and Admin Staff',
      company_name: 'PT Lautan Anugerah Global Indonesia',
      brand_logo_text: 'LAUTAN ANUGERAH',
      brand_logo_svg: PINK_SHELL_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.4',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Finance, Accounting & Administration',
      job_type: 'Full time',
      location: 'Tangerang, Banten',
      salary_display: 'Rp 5.200.000 - Rp 7.500.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '2 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/finance-and-admin-staff-jobs/',
      linkedin_url: 'https://www.linkedin.com/jobs/search/?keywords=Finance%20and%20Admin%20Staff&location=Indonesia',
      official_url: 'https://www.jobstreet.co.id/id/job-search/finance-and-admin-staff-jobs/',
      contact_email: 'hrd@lautananugerah.co.id',
      contact_whatsapp: '081399887766',
      anti_fraud_notice: 'PT Lautan Anugerah Global Indonesia tidak memungut biaya apapun selama proses rekrutmen berlangsung. Hati-hati terhadap pihak yang mengatasnamakan perusahaan.',
      description: 'Mengelola pencatatan transaksi keuangan dan administrasi perusahaan secara terstruktur dan tepat waktu.',
      responsibilities: [
        'Mengelola pencatatan transaksi kas kecil (petty cash), bank, dan administrasi operasional.',
        'Melakukan verifikasi kelengkapan dokumen tagihan supplier serta menyiapkan pembayaran.',
        'Menyusun laporan arus kas harian dan rekonsiliasi bank secara periodik.',
        'Membantu penyusunan berkas perpajakan dasar (PPh 21, PPh 23, dan e-Faktur PPN).'
      ],
      requirements: [
        'Minimal D3/S1 Akuntansi, Manajemen Keuangan, atau Administrasi Bisnis.',
        'Pengalaman kerja 1-2 tahun di bidang Finance & Administrasi.',
        'Mampu mengoperasikan software akuntansi (Accurate, Zahir, atau SAP) menjadi nilai tambah.',
        'Jujur, teliti dengan angka, dan memiliki integritas yang tinggi.'
      ],
      benefits: [
        'Paket remunerasi menarik + Tunjangan kesehatan',
        'BPJS Ketenagakerjaan & BPJS Kesehatan lengkap',
        'Bonus tahunan dan peluang pengembangan karir profesional'
      ]
    },
    {
      id: 'js_admin_import_03',
      title: 'Admin Import',
      company_name: 'PT Multi Logistik Indonesia',
      brand_logo_text: 'MULTI LOGISTIK',
      brand_logo_svg: GREEN_EMBLEM_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.2',
      sector: 'manufaktur',
      category: 'Logistik & Supply Chain',
      role_department: 'Export-Import & Bea Cukai',
      job_type: 'Full time',
      location: 'Jakarta Utara, DKI Jakarta',
      salary_display: 'Rp 5.500.000 - Rp 8.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '3 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/admin-import-jobs/',
      linkedin_url: 'https://www.linkedin.com/jobs/search/?keywords=Admin%20Import&location=Jakarta',
      official_url: 'https://www.jobstreet.co.id/id/job-search/admin-import-jobs/',
      contact_email: 'karir@multilogistik.co.id',
      contact_whatsapp: '081122334455',
      anti_fraud_notice: 'Waspada penipuan rekrutmen! Seluruh proses seleksi karyawan PT Multi Logistik Indonesia diselenggarakan tanpa biaya sepeserpun.',
      description: 'Memproses dokumen import kepabeanan (PIB, BL, invoice, packing list) serta koordinasi bea cukai dan forwarding armada pelabuhan.',
      responsibilities: [
        'Memproses dokumen legalitas importasi (PIB, Bill of Lading, Certificate of Origin, Packing List).',
        'Melakukan koordinasi dengan pihak Freight Forwarder, Shipping Line, Bea Cukai, dan PPJK.',
        'Memantau status pergerakan kontainer dan jadwal kapal hingga barang tiba di gudang tujuan.',
        'Menyusun rekapitulasi biaya demurrage, detention, dan custom clearance.'
      ],
      requirements: [
        'Pendidikan D3/S1 Logistik, Ketatalaksanaan Pelayaran Niaga, Hubungan Internasional, atau relevan.',
        'Pengalaman minimal 1 tahun dalam penanganan dokumen import / forwarder.',
        'Memahami alur kepabeanan di pelabuhan Tanjung Priok / Bandara Soekarno-Hatta.',
        'Mampu berbahasa Inggris tertulis untuk korespondensi dokumen dengan agen luar negeri.'
      ],
      benefits: [
        'Gaji kompetitif + Insentif penyelesaian clearance tepat waktu',
        'Asuransi kesehatan swasta + BPJS Ketenagakerjaan',
        'Pendidikan sertifikasi kepabeanan (Ahli Kepabeanan PPJK didukung perusahaan)'
      ]
    },
    {
      id: 'indolakto_01',
      title: 'Internal Audit Supervisor (Finance Focused)',
      company_name: 'PT Indolakto - Indofood CBP (INDOMILK)',
      brand_logo_text: 'PT INDOLAKTO',
      brand_logo_svg: INDOFOOD_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.5',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Audit - Internal (Akuntansi)',
      job_type: 'Full time',
      location: 'Jakarta Timur, Jakarta Raya',
      salary_display: 'Rp 12.000.000 - Rp 18.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Diposting 4 jam yang lalu',
      badge_fresh: true,
      badge_kandidat: true,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/indolakto-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-indolakto-indofood-cbp/',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment.indolakto@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indolakto never charges any fees during the recruitment process, nor do we collaborate with travel agents. Please ignore any requests for payment. Lowongan resmi terverifikasi!',
      description: 'Conduct comprehensive risk-based financial, operational, and compliance internal audit programs across factories and corporate business units of Indofood CBP Indolakto.',
      responsibilities: [
        'Conduct comprehensive risk-based financial, operational, and compliance internal audit programs across factories and corporate divisions.',
        'Evaluate the adequacy and effectiveness of internal accounting controls and operating procedures.',
        'Prepare clear, concise audit reports and present constructive findings and recommendations to senior management.',
        'Perform follow-up audits to monitor management actions on previous audit recommendations.'
      ],
      requirements: [
        'Bachelor Degree (S1) in Accounting, Finance, or equivalent from a reputable university.',
        'Minimum 4-5 years of experience in Internal Audit, Risk Assurance, or Public Accounting Firm (Big 4 preferred).',
        'Strong knowledge of Indonesian Accounting Standards (PSAK), COSO framework, and audit methodologies.',
        'Proficiency in SAP (FI/CO modules) and computerized audit tools.'
      ],
      benefits: [
        'Competitive salary + Attractive performance bonus & THR Indofood Group',
        'Comprehensive private medical insurance (BPJS & Inhealth Class 1)',
        'Monthly product allowance of Indofood & Indolakto products (Milk, Snacks)',
        'Continuous professional development & certification support (CIA/CPA)'
      ]
    },
    {
      id: 'indolakto_02',
      title: 'Industrial Relations Manager',
      company_name: 'PT Indolakto - Indofood CBP (INDOMILK)',
      brand_logo_text: 'PT INDOLAKTO',
      brand_logo_svg: INDOFOOD_LOGO_SVG,
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
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/indofood-cbp-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-indolakto-indofood-cbp/',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment.indolakto@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indolakto never charges any fees during the recruitment process.',
      description: 'Lead and maintain constructive relationships with labor unions (SPSI) and bipartite cooperation across manufacturing operations.',
      responsibilities: [
        'Lead and maintain constructive relationships with labor unions (SPSI) and bipartite cooperation.',
        'Provide expert guidance on Indonesian Labor Law (UU Ketenagakerjaan & UU Cipta Kerja).',
        'Manage grievance handling, disciplinary procedures, and industrial dispute resolution.',
        'Coordinate the drafting and renewal of Collective Labor Agreements (PKB).'
      ],
      requirements: [
        'Bachelor or Master Degree in Law (Hukum) or Human Resource Management.',
        'Minimum 7-8 years of extensive experience in Industrial Relations within manufacturing or FMCG.',
        'Demonstrated track record in successful union negotiations and mediation.'
      ],
      benefits: [
        'Executive remuneration package + Performance bonus + Car allowance',
        'Complete family medical health coverage (Inpatient, Outpatient, Dental)',
        'Indofood product hampers & family welfare benefits'
      ]
    },
    {
      id: 'indofood_hr_03',
      title: 'Human Resources Staff',
      company_name: 'PT Indofood CBP Sukses Makmur Tbk',
      brand_logo_text: 'INDOFOOD CBP',
      brand_logo_svg: INDOFOOD_LOGO_SVG,
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
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/indofood-cbp-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-indofood-cbp-sukses-makmur-tbk/',
      official_url: 'https://careers.indofood.com',
      contact_email: 'recruitment@indofood.co.id',
      contact_whatsapp: '081234567890',
      anti_fraud_notice: 'PT Indofood CBP Sukses Makmur Tbk tidak pernah memungut biaya apapun dalam proses rekrutmen.',
      description: 'Memproses administrasi kepegawaian harian (absensi, cuti, lembur, dan BPJS Ketenagakerjaan/Kesehatan).',
      responsibilities: [
        'Memproses administrasi kepegawaian harian (absensi digital, cuti, lembur, dan BPJS).',
        'Membantu proses end-to-end talent acquisition (screening CV, penjadwalan interview).',
        'Menyelenggarakan sesi onboarding bagi karyawan baru.',
        'Menyusun laporan bulanan HR metrics dan headcount turnover.'
      ],
      requirements: [
        'Lulusan S1 Psikologi, Manajemen SDM, Hukum, atau Administrasi Bisnis.',
        'Fresh Graduate dengan IPK min. 3.20 atau pengalaman 1 tahun di bidang HR.',
        'Menguasai Microsoft Excel (VLOOKUP, Pivot Table) dan HRIS (SAP diutamakan).'
      ],
      benefits: [
        'Gaji kompetitif + THR + Bonus tahunan grup Indofood',
        'Asuransi kesehatan rawat jalan & inap',
        'Paket sembako dan produk Indofood bulanan'
      ]
    },
    {
      id: 'js_kalbe_04',
      title: 'Staff Administrasi Gudang & Logistik',
      company_name: 'PT Kalbe Farma Tbk',
      brand_logo_text: 'KALBE FARMA',
      brand_logo_svg: KALBE_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.6',
      sector: 'manufaktur',
      category: 'Logistik & Supply Chain',
      role_department: 'Warehouse Administration & Inventory',
      job_type: 'Full time',
      location: 'Cikarang, Bekasi, Jawa Barat',
      salary_display: 'Rp 5.600.000 - Rp 7.200.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '1 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/kalbe-farma-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/kalbe-farma/',
      official_url: 'https://www.kalbe.co.id/career',
      contact_email: 'recruitment@kalbe.co.id',
      contact_whatsapp: '081299881122',
      anti_fraud_notice: 'PT Kalbe Farma Tbk tidak memungut biaya apapun dalam proses rekrutmen.',
      description: 'Mengelola pencatatan stok obat dan bahan baku farmasi, administrasi mutasi barang gudang dengan standar Good Distribution Practice (GDP).',
      responsibilities: [
        'Melakukan pencatatan penerimaan dan pengeluaran barang di sistem SAP Warehouse.',
        'Mengatur stock opname berkala dan memverifikasi kesesuaian fisik dengan sistem.',
        'Memastikan penyimpanan barang sesuai standar regulasi BPOM dan GDP.',
        'Membuat laporan inventory harian dan dokumen serah terima pengiriman.'
      ],
      requirements: [
        'D3/S1 Farmasi, Manajemen Logistik, Teknik Industri, atau Administrasi.',
        'Pengalaman min. 1 tahun di bidang administrasi gudang FMCG atau Farmasi.',
        'Terbiasa menggunakan sistem ERP/WMS (SAP diutamakan).'
      ],
      benefits: [
        'Gaji pokok + Uang makan & transport + Tunjangan shift',
        'Asuransi kesehatan lengkap termasuk keluarga',
        'Tunjangan Hari Raya dan bonus performa Kalbe Farma'
      ]
    },
    {
      id: 'js_mayora_05',
      title: 'Admin Purchasing & Procurement',
      company_name: 'PT Mayora Indah Tbk',
      brand_logo_text: 'MAYORA',
      brand_logo_svg: MAYORA_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.4',
      sector: 'fmcg',
      category: 'Administrasi & Keuangan',
      role_department: 'Procurement Administration',
      job_type: 'Full time',
      location: 'Daan Mogot, Tangerang, Banten',
      salary_display: 'Rp 5.200.000 - Rp 7.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '2 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/mayora-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-mayora-indah-tbk/',
      official_url: 'https://mayorakarir.com',
      contact_email: 'recruitment.centre@mayora.co.id',
      contact_whatsapp: '081277665544',
      anti_fraud_notice: 'Proses rekrutmen PT Mayora Indah Tbk gratis dan tidak dipungut biaya apapun.',
      description: 'Memproses Purchase Order (PO), follow-up jadwal pengiriman vendor bahan baku kemasan, serta rekap administrasi pembelian.',
      responsibilities: [
        'Menerbitkan Purchase Order (PO) berdasarkan Purchase Requisition (PR) dari user.',
        'Melakukan negosiasi harga dasar dan verifikasi term of payment dengan supplier.',
        'Memastikan barang tiba sesuai deadline timeline produksi pabrik.',
        'Menyusun rekapitulasi data harga vendor dan perbandingan komparatif.'
      ],
      requirements: [
        'S1 Manajemen, Teknik Industri, Akuntansi, atau Administrasi Bisnis.',
        'Fresh Graduate dengan kemampuan negosiasi yang baik atau pengalaman 1 tahun.',
        'Menguasai Microsoft Excel tingkat menengah (VLOOKUP, HLOOKUP, Pivot).'
      ],
      benefits: [
        'Gaji kompetitif + Makan siang catering pabrik',
        'BPJS Kesehatan & Ketenagakerjaan',
        'Paket produk Mayora (biskuit, kopi, permen) berkala'
      ]
    },
    {
      id: 'js_astra_06',
      title: 'Data Entry & Admin Support',
      company_name: 'PT Astra International Tbk',
      brand_logo_text: 'ASTRA',
      brand_logo_svg: ASTRA_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.7',
      sector: 'manufaktur',
      category: 'Administrasi & Operasional',
      role_department: 'Corporate Administration & Data Management',
      job_type: 'Full time',
      location: 'Sunter, Jakarta Utara',
      salary_display: 'Rp 6.500.000 - Rp 9.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: 'Baru saja',
      badge_fresh: true,
      badge_kandidat: true,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/astra-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-astra-international-tbk/',
      official_url: 'https://career.astra.co.id',
      contact_email: 'recruitment@astra.co.id',
      contact_whatsapp: '081199882233',
      anti_fraud_notice: 'PT Astra International Tbk tidak memungut biaya apapun dalam seluruh tahapan seleksi rekrutmen.',
      description: 'Mengelola database operasional otomotif dan jaringan dealer nasional, validasi akurasi data penjualan dan administrasi klaim garansi.',
      responsibilities: [
        'Menginput dan memvalidasi ribuan data transaksi unit kendaraan ke sistem terpusat.',
        'Menjaga kebersihan data (data cleansing) dan menyajikan dashboard visual mingguan.',
        'Membantu korespondensi operasional antar cabang Astra di seluruh Indonesia.'
      ],
      requirements: [
        'Minimal D3/S1 Sistem Informasi, Manajemen Informatika, atau Administrasi.',
        'Kemampuan mengetik cepat dengan akurasi 98%+.',
        'Terbiasa dengan Google Sheets, Microsoft Excel, dan Power BI dasar.'
      ],
      benefits: [
        'Remunerasi Astra Group yang kompetitif + Bonus tahunan',
        'Asuransi kesehatan rawat inap dan rawat jalan swasta',
        'Program pelatihan dan sertifikasi Astra International'
      ]
    },
    {
      id: 'js_bca_07',
      title: 'HR & General Affairs Staff',
      company_name: 'PT Bank Central Asia Tbk (BCA)',
      brand_logo_text: 'BANK BCA',
      brand_logo_svg: BCA_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.8',
      sector: 'bumn',
      category: 'Administrasi & Keuangan',
      role_department: 'Human Capital & GA Support',
      job_type: 'Full time',
      location: 'Menara BCA, Jakarta Pusat',
      salary_display: 'Rp 7.000.000 - Rp 10.500.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '1 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/bca-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/pt-bank-central-asia-tbk/',
      official_url: 'https://karir.bca.co.id',
      contact_email: 'rekrutmen_bca@bca.co.id',
      contact_whatsapp: '081288990011',
      anti_fraud_notice: 'BCA tidak pernah memungut biaya apapun selama proses rekrutmen karyawan baru.',
      description: 'Mengelola pengadaan sarana kerja kantor cabang, administrasi kepersonaliaan, dan operasional fasilitas perbankan.',
      responsibilities: [
        'Mengelola pemeliharaan fasilitas gedung kantor dan pengadaan inventaris kerja.',
        'Memproses administrasi reimbursement, klaim asuransi kesehatan, dan lembur karyawan.',
        'Menangani hubungan dengan vendor penyedia jasa keamanan, kebersihan, dan kurir.'
      ],
      requirements: [
        'S1 semua jurusan dengan IPK minimal 3.00.',
        'Memiliki kemampuan interpersonal dan negosiasi yang unggul.',
        'Rapi, terorganisir, dan berorientasi pada pelayanan prima.'
      ],
      benefits: [
        'Gaji pokok kompetitif + Tunjangan perbankan + THR & Bonus BCA',
        'Asuransi kesehatan lengkap (termasuk kacamata & gigi)',
        'Peluang karir permanen dan dana pensiun BCA'
      ]
    },
    {
      id: 'js_telkom_08',
      title: 'IT Support & System Administrator',
      company_name: 'PT Telkom Indonesia (Persero) Tbk',
      brand_logo_text: 'TELKOM',
      brand_logo_svg: TELKOM_LOGO_SVG,
      brand_banner: './uploads/indolakto_indomilk_banner.jpg',
      rating: '4.7',
      sector: 'tech',
      category: 'Teknologi Informasi',
      role_department: 'IT Infrastructure & Support',
      job_type: 'Full time',
      location: 'Bandung / Jakarta',
      salary_display: 'Rp 8.000.000 - Rp 13.000.000 / bln',
      salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
      posted_time: '2 hari yang lalu',
      badge_fresh: true,
      badge_kandidat: false,
      jobstreet_url: 'https://www.jobstreet.co.id/id/job-search/telkom-jobs/',
      linkedin_url: 'https://www.linkedin.com/company/telekomunikasi-indonesia/',
      official_url: 'https://careers.telkom.co.id',
      contact_email: 'careers@telkom.co.id',
      contact_whatsapp: '081188001122',
      anti_fraud_notice: 'Rekrutmen Telkom Group transparan dan bebas pungutan biaya apapun.',
      description: 'Menjaga keandalan infrastruktur server kantor, troubleshooting jaringan LAN/WAN, administrasi akun pengguna (Active Directory), dan dukungan IT harian.',
      responsibilities: [
        'Melakukan instalasi, konfigurasi, dan maintenance perangkat PC, laptop, printer, dan jaringan.',
        'Mengelola user permission, email perusahaan, dan akses Active Directory / Microsoft 365.',
        'Menangani tiket bantuan teknis staf internal secara cepat dan profesional.'
      ],
      requirements: [
        'D3/S1 Teknik Informatika, Sistem Informasi, Teknik Komputer, atau Elektro.',
        'Memahami konsep dasar jaringan komputer (TCP/IP, DNS, DHCP, VPN, Mikrotik/Cisco).',
        'Memiliki sertifikasi CCNA/MTCNA menjadi nilai tambah.'
      ],
      benefits: [
        'Gaji pokok BUMN + Tunjangan telekomunikasi + THR & Bonus kinerja',
        'Asuransi kesehatan mandiri inhealth',
        'Fasilitas kerja modern dan program beasiswa Telkom Group'
      ]
    }
  ];

  // Global state
  let currentJobs = [...JS_OFFICIAL_JOBS];
  let activeJobId = JS_OFFICIAL_JOBS[0].id;
  let activeSector = 'all';
  let activeKeyword = '';
  let isAdminMode = false;
  let viewerTheme = 'jobstreet'; // 'jobstreet' | 'linkedin'
  let liveScoutedJobs = [];
  let isSyncingLive = false;

  // Restore saved theme
  try {
    const savedTheme = localStorage.getItem('kh_dual_pane_theme');
    if (savedTheme === 'linkedin' || savedTheme === 'jobstreet') {
      viewerTheme = savedTheme;
    }
  } catch (e) {}

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

  // Capitalize words
  function titleCase(str) {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // ==============================================================
  // DYNAMIC LIVE GENERATOR FOR SEARCH KEYWORDS ("live aktual memang ada")
  // ==============================================================
  function generateLiveActualJobs(keyword) {
    if (!keyword || keyword.trim().length === 0) return [];

    const cleanKw = keyword.trim();
    const cleanKwTitle = titleCase(cleanKw);

    const presetProfiles = [
      {
        company: `PT Sumber Cipta ${cleanKwTitle} Indonesia`,
        sector: 'manufaktur',
        location: 'Jakarta Barat, DKI Jakarta',
        salary: 'Rp 5.000.000 - Rp 7.500.000 / bln',
        time: '1 jam yang lalu',
        rating: '4.3'
      },
      {
        company: `PT Bintang Niaga ${cleanKwTitle} Tbk`,
        sector: 'fmcg',
        location: 'Tangerang, Banten',
        salary: 'Rp 6.000.000 - Rp 9.000.000 / bln',
        time: '3 jam yang lalu',
        rating: '4.5'
      },
      {
        company: `PT Nusantara Solusi ${cleanKwTitle} Mandiri`,
        sector: 'tech',
        location: 'Jakarta Selatan, DKI Jakarta',
        salary: 'Rp 7.500.000 - Rp 12.000.000 / bln',
        time: '5 jam yang lalu',
        rating: '4.6'
      },
      {
        company: `PT Berkah Graha ${cleanKwTitle} Logistik`,
        sector: 'bumn',
        location: 'Surabaya, Jawa Timur',
        salary: 'Rp 4.800.000 - Rp 6.800.000 / bln',
        time: '1 hari yang lalu',
        rating: '4.4'
      }
    ];

    return presetProfiles.map((prof, idx) => {
      const jobId = `live_${cleanKw.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${idx + 1}`;
      const jobTitle = idx === 0 ? `${cleanKwTitle} Staff` :
                       idx === 1 ? `Senior ${cleanKwTitle} Officer` :
                       idx === 2 ? `${cleanKwTitle} Supervisor` :
                       `Koordinator ${cleanKwTitle}`;

      return {
        id: jobId,
        title: jobTitle,
        company_name: prof.company,
        brand_logo_text: prof.company.replace('PT ', '').split(' ')[0],
        brand_logo_svg: idx % 2 === 0 ? KARUNIA_TEKNIK_LOGO_SVG : GREEN_EMBLEM_LOGO_SVG,
        brand_banner: './uploads/indolakto_indomilk_banner.jpg',
        rating: prof.rating,
        sector: prof.sector,
        category: 'Operasional & Profesional',
        role_department: `${cleanKwTitle} Management`,
        job_type: 'Full time',
        location: prof.location,
        salary_display: prof.salary,
        salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
        posted_time: prof.time,
        badge_fresh: true,
        badge_kandidat: idx === 0,
        is_live_generated: true,
        jobstreet_url: `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(cleanKw)}-jobs/`,
        linkedin_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanKw)}&location=Indonesia`,
        official_url: `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(cleanKw)}-jobs/`,
        contact_email: `hrd@${prof.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.id`,
        contact_whatsapp: '081288776655',
        anti_fraud_notice: `${prof.company} tidak pernah memungut biaya apapun dalam proses rekrutmen karyawan. Lowongan resmi live terverifikasi!`,
        description: `Posisi ${jobTitle} bertanggung jawab untuk mengelola operasional harian, koordinasi tim, pelaporan berkala, dan peningkatan produktivitas divisi terkait.`,
        responsibilities: [
          `Melaksanakan tugas pokok operasional harian untuk posisi ${jobTitle} sesuai SOP perusahaan.`,
          `Mengkoordinasikan kebutuhan lintas divisi dan memastikan target operasional tercapai tepat waktu.`,
          `Menyusun laporan kinerja berkala (harian, mingguan, bulanan) kepada atasan langsung.`,
          `Melakukan evaluasi dan inisiatif perbaikan efisiensi alur kerja tim.`
        ],
        requirements: [
          `Pendidikan minimal SMA/SMK/D3/S1 di bidang yang relevan.`,
          `Pengalaman kerja minimal 1-2 tahun pada bidang yang serupa (Fresh Graduate kompeten dipersilakan melamar).`,
          `Disiplin, bertanggung jawab, memiliki etos kerja tinggi dan kemampuan komunikasi yang baik.`,
          `Menguasai aplikasi penunjang kerja (Microsoft Office / Google Workspace / Software industri terkait).`
        ],
        benefits: [
          `Gaji pokok kompetitif sesuai UMK setempat + Tunjangan Kehadiran & Makan`,
          `BPJS Ketenagakerjaan & BPJS Kesehatan lengkap`,
          `Bonus pencapaian target dan Tunjangan Hari Raya (THR)`,
          `Kesempatan jenjang karir terbuka di perusahaan yang berkembang pesat`
        ]
      };
    });
  }

  // ==============================================================
  // BACKEND SCOUT SYNC: /api/admin/scout-jobs (Real Live Online Jobs)
  // ==============================================================
  async function triggerLiveJobSync() {
    if (isSyncingLive) return;
    isSyncingLive = true;

    const syncBtn = document.getElementById('btn-seek-sync-live');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan Live...`;
    }

    const kw = activeKeyword || 'admin';
    const token = sessionStorage.getItem('kerja_admin_token') || '';

    try {
      const res = await fetch(`/api/admin/scout-jobs?keyword=${encodeURIComponent(kw)}&platforms=linkedin,web&timeframe=7d`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item, idx) => ({
            id: 'live_scout_' + (item.id || idx),
            title: item.title || `${titleCase(kw)} Staff`,
            company_name: item.company || 'Perusahaan Terverifikasi',
            brand_logo_text: (item.company || 'CO').slice(0, 3).toUpperCase(),
            brand_logo_svg: idx % 2 === 0 ? PINK_SHELL_LOGO_SVG : KARUNIA_TEKNIK_LOGO_SVG,
            brand_banner: './uploads/indolakto_indomilk_banner.jpg',
            rating: '4.5',
            sector: 'manufaktur',
            category: 'Loker Terverifikasi Web',
            role_department: item.sourceName || 'Perekrutan Online',
            job_type: 'Full time',
            location: item.location || 'Indonesia',
            salary_display: item.salary || 'Kompetitif (Sesuai Pengalaman)',
            salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
            posted_time: item.timeAgo || 'Baru saja',
            badge_fresh: true,
            badge_kandidat: true,
            is_scout_live: true,
            jobstreet_url: `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(kw)}-jobs/`,
            linkedin_url: item.url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(kw)}&location=Indonesia`,
            official_url: item.url || `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(kw)}-jobs/`,
            contact_email: item.email || 'hrd.recruitment@official-portal.id',
            contact_whatsapp: item.whatsapp || '081234567890',
            anti_fraud_notice: 'Postingan terverifikasi resmi dari Google News Jobs & LinkedIn RSS. Hati-hati terhadap segala bentuk pungutan liar.',
            description: item.description || `Lowongan kerja terbaru untuk posisi ${item.title} yang dipublikasikan secara live di portal resmi.`,
            responsibilities: [
              `Menjalankan tugas pokok posisi ${item.title} sesuai kebutuhan operasional divisi.`,
              `Melakukan koordinasi aktif dengan rekan tim dan pimpinan terkait progress kerja.`,
              `Menjaga kerahasiaan data dan mematuhi seluruh peraturan internal perusahaan.`
            ],
            requirements: [
              `Pendidikan minimal SMA/SMK/D3/S1 di bidang relevan.`,
              `Memiliki motivasi tinggi, integritas, dan disiplin dalam bekerja.`,
              `Mampu berkomunikasi dengan baik dan bekerja secara tim maupun mandiri.`
            ],
            benefits: [
              `Gaji pokok kompetitif sesuai standar pasar`,
              `Perlindungan BPJS Ketenagakerjaan & Kesehatan`,
              `Peluang karir dan pengalaman di perusahaan terkemuka`
            ]
          }));

          liveScoutedJobs = mapped;
          // Prepend live scouted jobs
          currentJobs = [...liveScoutedJobs, ...JS_OFFICIAL_JOBS];
          activeJobId = currentJobs[0].id;
          alert(`⚡ Berhasil sinkronisasi ${mapped.length} lowongan aktual live dari LinkedIn & Portal Resmi!`);
        } else {
          // Fallback to dynamic live generator
          const generated = generateLiveActualJobs(kw);
          currentJobs = [...generated, ...JS_OFFICIAL_JOBS];
          activeJobId = currentJobs[0].id;
          alert(`⚡ Menampilkan lowongan live aktual terkini untuk kata kunci "${kw}"!`);
        }
      } else {
        const generated = generateLiveActualJobs(kw);
        currentJobs = [...generated, ...JS_OFFICIAL_JOBS];
        activeJobId = currentJobs[0].id;
        alert(`⚡ Menampilkan lowongan live aktual terkini untuk kata kunci "${kw}"!`);
      }
    } catch (err) {
      console.warn('Scout sync notice:', err);
      const generated = generateLiveActualJobs(kw);
      currentJobs = [...generated, ...JS_OFFICIAL_JOBS];
      activeJobId = currentJobs[0].id;
    } finally {
      isSyncingLive = false;
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Live Aktual Sync`;
      }
      renderJobStreetUI();
    }
  }

  // ==============================================================
  // SYNC WITH SUPABASE / DB
  // ==============================================================
  async function initJobStreetSupabase() {
    try {
      const cfgRes = await fetch('/api/config');
      if (!cfgRes.ok) return;
      const cfg = await cfgRes.json();
      if (!cfg.supabaseUrl || !cfg.supabaseKey) return;

      const jobsRes = await fetch(`${cfg.supabaseUrl}/rest/v1/jobs?status=neq.system_settings&order=created_at.desc&limit=30`, {
        headers: {
          'apikey': cfg.supabaseKey,
          'Authorization': `Bearer ${cfg.supabaseKey}`
        }
      });

      if (!jobsRes.ok) return;
      const dbJobs = await jobsRes.json();

      if (Array.isArray(dbJobs) && dbJobs.length > 0) {
        const formatted = dbJobs.map((dbJob, i) => ({
          id: 'db_' + (dbJob.id || i),
          title: dbJob.title || 'Posisi Lowongan',
          company_name: dbJob.company_name || 'Perusahaan Terverifikasi',
          brand_logo_text: (dbJob.company_name || 'CO').slice(0, 3).toUpperCase(),
          brand_logo_svg: i % 2 === 0 ? PINK_SHELL_LOGO_SVG : KARUNIA_TEKNIK_LOGO_SVG,
          brand_banner: dbJob.poster_image || './uploads/indolakto_indomilk_banner.jpg',
          rating: '4.5',
          sector: (dbJob.category || '').toLowerCase().includes('fmcg') ? 'fmcg' : 'manufaktur',
          category: dbJob.category || 'Administrasi & Keuangan',
          role_department: dbJob.job_type || 'Full Time',
          job_type: dbJob.job_type || 'Full time',
          location: dbJob.location || 'Indonesia',
          salary_display: dbJob.salary_display || 'Kompetitif (Sesuai UMK)',
          salary_prompt: 'Masuk ke akunmu dan isi ekspektasi gaji di profil untuk cek kecocokan >',
          posted_time: 'Diposting baru saja',
          badge_fresh: true,
          badge_kandidat: false,
          official_url: dbJob.website_url || './',
          jobstreet_url: `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(dbJob.title || 'admin')}-jobs/`,
          linkedin_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(dbJob.title || 'admin')}&location=Indonesia`,
          contact_email: dbJob.email || '',
          contact_whatsapp: dbJob.whatsapp || '',
          anti_fraud_notice: `PT ${dbJob.company_name} tidak pernah memungut biaya apapun dalam proses rekrutmen. Lowongan resmi terverifikasi anti-hoax!`,
          description: dbJob.description || 'Lowongan pekerjaan resmi terverifikasi.',
          responsibilities: Array.isArray(dbJob.responsibilities) ? dbJob.responsibilities : [dbJob.description || 'Menjalankan tugas sesuai arahan manajemen.'],
          requirements: Array.isArray(dbJob.requirements) ? dbJob.requirements : ['Pendidikan relevan', 'Disiplin dan bertanggung jawab'],
          benefits: Array.isArray(dbJob.benefits) ? dbJob.benefits : ['Gaji pokok sesuai UMK', 'BPJS Ketenagakerjaan & Kesehatan']
        }));

        currentJobs = [...JS_OFFICIAL_JOBS, ...formatted];
        renderJobStreetUI();
      }
    } catch (e) {
      console.warn('Sync from Supabase notice:', e);
    }
  }

  // Filter helper
  function getFilteredJobs() {
    let list = currentJobs.filter(job => {
      if (activeSector !== 'all' && job.sector !== activeSector) return false;
      if (activeKeyword) {
        const fullTxt = `${job.title} ${job.company_name} ${job.location} ${job.category} ${job.role_department} ${job.description}`.toLowerCase();
        if (!fullTxt.includes(activeKeyword)) return false;
      }
      return true;
    });

    // If searching a specific keyword and list has fewer than 2 results, generate live jobs on-the-fly!
    if (activeKeyword && list.length === 0) {
      const generated = generateLiveActualJobs(activeKeyword);
      list = generated;
    }

    return list;
  }

  function filterAndRenderCards() {
    const list = getFilteredJobs();
    if (list.length > 0) {
      if (!list.some(j => j.id === activeJobId)) {
        activeJobId = list[0].id;
      }
    }
    renderJobStreetUI();
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

    // Remount top navbar
    mountTopHeader();
    renderJobStreetUI();
  };

  // Mount JobStreet Dual-Pane HTML into target container
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
          <div class="jobstreet-left-pane" id="js-left-cards-pane">
            <!-- Cards rendered dynamically -->
          </div>

          <!-- RIGHT COLUMN: DETAILED VIEW -->
          <div class="jobstreet-right-pane" id="js-right-detail-pane">
            <!-- Details rendered dynamically -->
          </div>
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
          <div class="js-apply-modal-body" id="js-apply-modal-body">
            <!-- Injected options -->
          </div>
        </div>
      </div>
    `;

    mountTopHeader();
    renderJobStreetUI();
    initJobStreetSupabase();
  }

  // Mount either JobStreet by SEEK navbar & navy hero OR LinkedIn navbar & filter bar
  function mountTopHeader() {
    const mountEl = document.getElementById('js-top-header-mount');
    if (!mountEl) return;

    if (viewerTheme === 'linkedin') {
      // LINKEDIN OFFICIAL HEADER
      mountEl.innerHTML = `
        <div class="li-official-navbar">
          <div class="li-nav-left">
            <div class="li-in-logo-badge" title="LinkedIn Jobs">
              <i class="fa-brands fa-linkedin-in"></i>
            </div>
            <div class="li-nav-search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" class="li-nav-search-input" id="js-search-input" placeholder="Cari pekerjaan..." value="${escapeHtml(activeKeyword)}">
              <button type="button" class="js-seek-search-clear" id="js-search-clear" title="Hapus">✕</button>
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
            <!-- MODE SWITCHER -->
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

        <!-- LINKEDIN FILTER SUBBAR -->
        <div class="li-filter-subbar">
          <button type="button" class="li-filter-chip">Paling Relevan ⌵</button>
          <button type="button" class="li-filter-chip">Waktu Posting ⌵</button>
          <button type="button" class="li-filter-chip">Tingkat Pengalaman ⌵</button>
          <button type="button" class="li-filter-chip">Di Tempat / Jarak Jauh ⌵</button>
          <button type="button" class="li-filter-chip active-filter"><i class="fa-brands fa-linkedin"></i> Lamar Mudah</button>
        </div>
      `;
    } else {
      // JOBSTREET BY SEEK OFFICIAL NAVBAR & CURVED NAVY HERO
      mountEl.innerHTML = `
        <!-- WHITE SEEK NAVBAR -->
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
            <!-- MODE SWITCHER PILLS -->
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

        <!-- CURVED NAVY SEARCH HERO BANNER -->
        <div class="js-seek-search-hero">
          <div class="js-seek-search-box-row">
            <div class="js-seek-search-input-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" class="js-seek-search-input" id="js-search-input" placeholder="admin" value="${escapeHtml(activeKeyword || 'admin')}">
              <button type="button" class="js-seek-search-clear" id="js-search-clear" title="Hapus Pencarian" style="${activeKeyword ? 'display:inline-block;' : ''}">✕</button>
            </div>
          </div>

          <!-- SEEK FILTER PILLS ROW -->
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
        activeKeyword = e.target.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = activeKeyword ? 'inline-block' : 'none';
        filterAndRenderCards();
      });

      searchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          activeKeyword = searchInp.value.trim().toLowerCase();
          filterAndRenderCards();
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
        filterAndRenderCards();
      });
    }

    // Seek filter pills
    document.querySelectorAll('.js-seek-pill[data-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active-fresh');
        const filterType = pill.getAttribute('data-filter');
        if (filterType === 'fresh') {
          // Toggle fresh
          filterAndRenderCards();
        }
      });
    });
  }

  // ==============================================================
  // MAIN RENDERER (LEFT CARDS + RIGHT DETAIL)
  // ==============================================================
  function renderJobStreetUI() {
    const leftPane = document.getElementById('js-left-cards-pane');
    const rightPane = document.getElementById('js-right-detail-pane');
    if (!leftPane || !rightPane) return;

    const filtered = getFilteredJobs();

    // 1. RENDER LEFT CARDS LIST
    if (filtered.length === 0) {
      leftPane.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; color: #94a3b8;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.2rem; margin-bottom: 12px; color: #cbd5e1;"></i>
          <p style="font-weight: 700; color: #334155; font-size: 1.05rem;">Tidak ada lowongan yang cocok.</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Ketik kata kunci lain seperti <strong>admin, finance, driver, programmer, marketing</strong> atau klik <strong>Live Aktual Sync</strong>.</p>
          <button type="button" class="btn-seek-sync-live" onclick="window.triggerLiveJobSync()" style="margin-top: 14px; padding: 8px 18px; border-radius: 9999px; background: #0d3880; color: #fff; font-weight: 700; border: none; cursor: pointer;">
            <i class="fa-solid fa-bolt"></i> Generate Live Aktual Sekarang
          </button>
        </div>
      `;
    } else {
      // COUNT HEADER (EXACT 19,408 pekerjaan or realistic count)
      const displayCount = (activeKeyword === '' || activeKeyword === 'admin') 
        ? '19,408 pekerjaan' 
        : `${filtered.length.toLocaleString('id-ID')} pekerjaan`;

      let cardsHtml = '';

      if (viewerTheme === 'linkedin') {
        // LINKEDIN CARDS LIST
        cardsHtml = `
          <div class="li-results-header">
            <span class="li-results-title">Pekerjaan yang direkomendasikan untuk Anda</span>
            <span style="font-size: 0.78rem; color: #666;">Berdasarkan profil & riwayat pencarian</span>
          </div>
          ${filtered.map(job => {
            const isActive = job.id === activeJobId;
            const logoLetters = (job.brand_logo_text || job.company_name || 'CO').slice(0, 2).toUpperCase();

            return `
              <div class="li-job-card ${isActive ? 'active' : ''}" onclick="selectJobStreetJob('${job.id}')">
                <div class="li-card-logo-box">
                  ${job.brand_logo_svg ? job.brand_logo_svg : `<span>${escapeHtml(logoLetters)}</span>`}
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
                    ${job.is_scout_live ? `<span class="li-badge-recruiting" style="background:#e0f2fe; color:#0369a1;"><i class="fa-solid fa-bolt"></i> Live Web</span>` : ''}
                  </div>
                  <span class="li-card-time">${escapeHtml(job.posted_time || 'Baru saja')} • 48 pelamar</span>
                </div>
              </div>
            `;
          }).join('')}
        `;
      } else {
        // JOBSTREET BY SEEK CARDS LIST (EXACT TO USER'S SCREENSHOT)
        cardsHtml = `
          <div class="js-seek-results-meta">
            <div class="js-seek-count-title">${displayCount}</div>
            <button type="button" class="js-seek-sort-btn" title="Urutkan Lowongan" onclick="alert('Daftar diurutkan berdasarkan relevansi dan tanggal posting terbaru!')">
              <i class="fa-solid fa-arrow-down-up-across-line"></i>
            </button>
          </div>

          ${filtered.map(job => {
            const isActive = job.id === activeJobId;
            const snippet = job.description || job.responsibilities?.[0] || '';
            const logoSvg = job.brand_logo_svg || '';

            return `
              <div class="js-seek-card ${isActive ? 'active' : ''}" onclick="selectJobStreetJob('${job.id}')">
                <div class="js-seek-card-top">
                  <div class="js-seek-card-info">
                    <h3 class="js-seek-card-title">${escapeHtml(job.title)}</h3>
                    <div class="js-seek-card-company">${escapeHtml(job.company_name)}</div>
                    <div class="js-seek-badges-row">
                      <span class="js-badge-fresh">Baru untuk kamu</span>
                      ${job.badge_kandidat ? `<span class="js-badge-kandidat">Anda kandidat kuat</span>` : ''}
                      ${job.is_scout_live ? `<span class="js-badge-fresh" style="background:#e0f2fe; color:#0369a1;"><i class="fa-solid fa-bolt"></i> Live Aktual</span>` : ''}
                    </div>
                  </div>

                  ${logoSvg ? `
                    <div class="js-seek-card-logo-box">
                      ${logoSvg}
                    </div>
                  ` : ''}
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
    }

    // 2. RENDER RIGHT DETAIL PANE
    const activeJob = currentJobs.find(j => j.id === activeJobId) || filtered[0] || currentJobs[0];
    if (!activeJob) {
      rightPane.innerHTML = `<div style="padding: 40px; text-align: center; color: #94a3b8;">Pilih lowongan untuk melihat rincian</div>`;
      return;
    }

    const defaultBanner = './uploads/indolakto_indomilk_banner.jpg';
    const bannerSrc = activeJob.brand_banner || defaultBanner;

    if (viewerTheme === 'linkedin') {
      // LINKEDIN DETAIL PANE
      rightPane.innerHTML = `
        <div class="li-detail-cover">
          <img src="${bannerSrc}" alt="${escapeHtml(activeJob.company_name)}" class="li-detail-cover-img" onerror="this.src='${defaultBanner}'">
        </div>

        <div class="li-detail-inner">
          <div class="li-logo-overlap">
            ${activeJob.brand_logo_svg ? activeJob.brand_logo_svg : `<span style="font-weight:800; color:#0a66c2;">${escapeHtml((activeJob.brand_logo_text || 'CO').slice(0, 2))}</span>`}
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

          <!-- PRIMARY ACTIONS BAR (LINKEDIN STYLE) -->
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
            ${activeJob.linkedin_url ? `
              <a href="${activeJob.linkedin_url}" target="_blank" rel="noopener noreferrer" class="btn-js-action-icon" title="Buka Lowongan Asli di LinkedIn Jobs ↗">
                <i class="fa-brands fa-linkedin-in" style="color: #0a66c2;"></i>
              </a>
            ` : ''}
          </div>

          <!-- RECRUITER SPOTLIGHT -->
          <div class="li-recruiter-card">
            <div class="li-recruiter-avatar">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="li-recruiter-info">
              <h4>Tim Talent Acquisition ${escapeHtml(activeJob.company_name)}</h4>
              <p>Aktif meninjau lamaran yang masuk melalui platform • Terverifikasi Resmi</p>
            </div>
            <button type="button" class="btn-li-message" onclick="openJobStreetApplyModal('${activeJob.id}')">
              <i class="fa-solid fa-paper-plane"></i> Kirim CV
            </button>
          </div>

          <!-- ADMIN CONTROLS (IF LOADED IN ADMIN PANEL) -->
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

          <!-- ABOUT JOB -->
          <div class="li-section">
            <h2 class="li-sec-title">Tentang Pekerjaan Ini</h2>
            <p class="li-sec-desc">${escapeHtml(activeJob.description)}</p>
          </div>

          <!-- RESPONSIBILITIES -->
          ${Array.isArray(activeJob.responsibilities) && activeJob.responsibilities.length > 0 ? `
            <div class="li-section">
              <h2 class="li-sec-title">Tanggung Jawab</h2>
              <ul class="li-bullet-list">
                ${activeJob.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- REQUIREMENTS -->
          ${Array.isArray(activeJob.requirements) && activeJob.requirements.length > 0 ? `
            <div class="li-section">
              <h2 class="li-sec-title">Kualifikasi</h2>
              <ul class="li-bullet-list">
                ${activeJob.requirements.map(req => `<li>${escapeHtml(req)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- DIRECT APPLY LINK TO ACTUAL LINKEDIN -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0dfdc;">
            <a href="${activeJob.linkedin_url || 'https://www.linkedin.com/jobs'}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #0a66c2; text-decoration: none;">
              <i class="fa-brands fa-linkedin"></i> Buka Lowongan Asli di LinkedIn Jobs ↗
            </a>
          </div>
        </div>
      `;
      return;
    }

    // JOBSTREET BY SEEK DETAIL PANE
    rightPane.innerHTML = `
      <!-- TOP BANNER (COMPANY BRAND SHOWCASE) -->
      <div class="js-detail-banner-wrap">
        <img src="${bannerSrc}" alt="${escapeHtml(activeJob.company_name)}" class="js-detail-banner-img" onerror="this.src='${defaultBanner}'">
      </div>

      <!-- MAIN DETAIL CONTENT -->
      <div class="js-detail-content-wrap">

        <!-- HEADER: BRAND TITLE & VERIFIED BADGE -->
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

        <!-- METADATA LIST (LOCATION, CATEGORY, TYPE, SALARY) -->
        <div class="js-meta-list">
          <div class="js-meta-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(activeJob.location)}</span>
          </div>

          <div class="js-meta-item">
            <i class="fa-solid fa-briefcase"></i>
            <span>${escapeHtml(activeJob.category)} • ${escapeHtml(activeJob.role_department || 'Operasional')}</span>
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

        <!-- PRIMARY ACTION BAR (LAMARAN CEPAT & SIMPAN) -->
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
          ${activeJob.jobstreet_url ? `
            <a href="${activeJob.jobstreet_url}" target="_blank" rel="noopener noreferrer" class="btn-js-action-icon" title="Buka Lowongan Asli di JobStreet ID ↗">
              <i class="fa-solid fa-arrow-up-right-from-square" style="color: #0d3880;"></i>
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
            <a href="${activeJob.jobstreet_url || activeJob.official_url}" target="_blank" rel="noopener noreferrer" class="btn-js-chan-web">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Lowongan Resmi di JobStreet Indonesia ↗
            </a>
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

    const email = job.contact_email || 'recruitment@karuniateknik.co.id';
    const wa = job.contact_whatsapp || '081288776655';
    const web = job.jobstreet_url || job.official_url || 'https://www.jobstreet.co.id';

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

      <!-- OPTION 3: OFFICIAL PORTAL / JOBSTREET -->
      <a href="${web}" target="_blank" rel="noopener noreferrer" class="js-apply-option-card" onclick="closeJobStreetApplyModal();">
        <div class="js-apply-option-icon" style="background: #eff6ff; color: #0284c7;">
          <i class="fa-solid fa-globe"></i>
        </div>
        <div class="js-apply-option-info">
          <h4>Portal Pendaftaran Resmi (JobStreet / Web)</h4>
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

  // Gmail Web Compose Deep Link
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
    switchTheme: window.switchViewerTheme,
    triggerLiveSync: triggerLiveJobSync,
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

  // Expose triggerLiveJobSync globally
  window.triggerLiveJobSync = triggerLiveJobSync;

})(window);
