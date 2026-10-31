/**
 * Ravenza CV Studio - 8 Templates Generator for Admin Panel
 * Ported from React to high-performance Vanilla JS.
 * Enhanced with Multi-Section Independent Accordions & Strict 1-Page A4 Guarantee.
 */

// Formal Silhouette Avatar SVG Data URI
const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" fill="none">
  <rect width="300" height="360" fill="transparent"/>
  <!-- Hair & Head -->
  <circle cx="150" cy="115" r="54" fill="#2d3748"/>
  <path d="M102 108C102 78 124 58 150 58C176 58 198 78 198 108C198 118 195 128 195 128C195 128 190 95 150 95C110 95 105 128 105 128C105 128 102 118 102 108Z" fill="#1a202c"/>
  <!-- Neck -->
  <rect x="130" y="158" width="40" height="45" fill="#e2b897"/>
  <!-- Face -->
  <path d="M106 112C106 86 125 68 150 68C175 68 194 86 194 112C194 144 175 168 150 168C125 168 106 144 106 112Z" fill="#ecc9a8"/>
  <!-- Hair Top -->
  <path d="M103 110C100 80 120 55 152 55C184 55 200 78 197 108C192 88 175 80 148 80C122 80 108 92 103 110Z" fill="#1a202c"/>
  <!-- Ears -->
  <circle cx="105" cy="122" r="8" fill="#e2b897"/>
  <circle cx="195" cy="122" r="8" fill="#e2b897"/>
  <!-- Eyes & Brows -->
  <path d="M124 106Q133 102 140 106" stroke="#1a202c" stroke-width="3" stroke-linecap="round"/>
  <path d="M160 106Q167 102 176 106" stroke="#1a202c" stroke-width="3" stroke-linecap="round"/>
  <circle cx="132" cy="115" r="4" fill="#1a202c"/>
  <circle cx="168" cy="115" r="4" fill="#1a202c"/>
  <!-- Nose & Smile -->
  <path d="M150 116V132L145 135" stroke="#c69673" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M137 145Q150 153 163 145" stroke="#a36e4f" stroke-width="3" stroke-linecap="round"/>
  <!-- Shirt & Suit Collar -->
  <path d="M45 360C45 255 85 205 150 205C215 205 255 255 255 360H45Z" fill="#1e293b"/>
  <!-- White Inner Shirt & Tie -->
  <path d="M122 195L150 265L178 195L168 188H132L122 195Z" fill="#ffffff"/>
  <path d="M144 212H156L160 270L150 285L140 270L144 212Z" fill="#991b1b"/>
  <!-- Suit Lapels -->
  <path d="M122 195L95 235L135 290L150 265L122 195Z" fill="#0f172a"/>
  <path d="M178 195L205 235L165 290L150 265L178 195Z" fill="#0f172a"/>
</svg>
`)}`;

const INITIAL_CV_DATA = {
  photo: DEFAULT_AVATAR_SVG,
  photoBg: '#dc2626', // Default pas foto merah
  fullName: 'RAVENZA CREATIVE',
  jobTitle: 'OPERATOR WAREHOUSE | PICKER | FORKLIFT',
  phone: '0877xxxxxxxx',
  email: 'xxxx@gmail.com',
  address: 'Cikarang, Kabupaten Bekasi, Jawa Barat',
  birthPlaceDate: 'Cikarang, 12 Desember 2001',
  gender: 'Laki-Laki',
  religion: 'Islam',
  maritalStatus: 'Menikah',
  nationality: 'Indonesia',
  height: '167 cm',
  weight: '60 kg',
  aboutMe:
    'Lulusan SMK Teknik Kendaraan Ringan yang memiliki pengalaman di bidang operasional gudang. Terbiasa menangani proses penerimaan, penyimpanan, dan pengeluaran barang sesuai SOP. Memiliki ketelitian tinggi, disiplin, serta mampu bekerja dalam tim maupun individu. Siap bekerja dalam sistem shift dan berkontribusi dalam menjaga kelancaran operasional gudang.',
  educations: [
    {
      id: 'edu-1',
      school: 'SMK 33 Cikarang',
      major: 'Jurusan Teknik Komputer Jaringan',
      period: '2014 – 2017',
      extra: 'Nilai rata-rata : 85.3 / 100'
    }
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'PT Astra Honda Motor',
      role: 'Operator Warehouse',
      period: 'Maret 2019 – Februari 2023',
      tasks: [
        'Menerima barang masuk dari pemasok (supplier), mengecek fisik dan dokumen (surat jalan) serta memastikan kesesuaian jumlah dan kualitas.',
        'Menyimpan barang di area penyimpanan sesuai area tempat barang dengan menggunakan metode FIFO dan FEFO untuk menjaga kualitas barang.',
        'Melakukan persiapan barang sesuai surat permintaan barang (SPB) untuk memenuhi kebutuhan produksi.',
        'Melakukan pencatatan data keluar masuk barang untuk menjaga akurasi stok.',
        'Melakukan stock opname secara berkala untuk memastikan kesesuaian antara stok fisik sesuai dengan data di komputer.',
        'Pemeliharaan area untuk menjaga kebersihan, keamanan, kerapihan gudang (5S).'
      ]
    },
    {
      id: 'exp-2',
      company: 'PT Shinto Kogyo Indonesia',
      role: 'Operator PPIC',
      period: 'Juli 2023 – April 2026',
      tasks: [
        'Menerima barang finished goods dari produksi setelah melalui pengecekan kualitas (quality control).',
        'Menyimpan barang dengan menumpuk sesuai jenis/item dan menempatkannya pada area stok yang telah ditentukan.',
        'Melakukan pencatatan keluar-masuk barang sesuai jumlah barang.',
        'Menyiapkan pengiriman barang sesuai jadwal harian untuk dikirim kepada pelanggan sesuai purchase order (PO) dengan memperhatikan ketelitian, jumlah, dan kualitas barang.',
        'Melakukan stock taking bulanan untuk memastikan keakuratan data dan ketersediaan stok tetap aman, sehingga tidak terjadi keterlambatan (delay) dalam proses pengiriman.'
      ]
    }
  ],
  certificates: [
    'Pembinaan Teknik Keselamatan dan Kesehatan Kerja (K3) Bidang Pesawat Angkat dan Pesawat Angkut'
  ],
  softSkills: [
    'Komunikatif: mampu berkomunikasi baik dengan tim gudang, logistik maupun pihak eksternal lainnya',
    'Ketelitian dan akurasi: sangat teliti dalam perhitungan barang dan memeriksa dokumen',
    'Kerja sama tim (teamwork): mampu bekerja sama dengan tim',
    'Manajemen waktu: mampu mengatur prioritas dan menyelesaikan pekerjaan tepat waktu'
  ],
  hardSkills: [
    'Mengoperasikan pesawat angkut / Forklift CB',
    'Mengoperasikan Stacker Electric, Hand Pallet, Pallet Mover',
    'Pengetahuan metode stock, FIFO, FEFO, dan LIFO',
    'Pemahaman Keamanan dan Keselamatan (K3)'
  ]
};

const EMPTY_SINGLE_CV_DATA = {
  photo: DEFAULT_AVATAR_SVG,
  photoBg: '#dc2626',
  fullName: '',
  jobTitle: '',
  phone: '',
  email: '',
  address: '',
  birthPlaceDate: '',
  gender: 'Laki-Laki',
  religion: 'Islam',
  maritalStatus: 'Belum Menikah',
  nationality: 'Indonesia',
  height: '',
  weight: '',
  aboutMe: '',
  educations: [
    {
      id: 'edu-empty-1',
      school: '',
      major: '',
      period: '',
      extra: ''
    }
  ],
  experiences: [
    {
      id: 'exp-empty-1',
      company: '',
      role: '',
      period: '',
      tasks: ['']
    }
  ],
  certificates: [''],
  softSkills: [''],
  hardSkills: ['']
};

const CV_SUMMARY_PRESETS = [
  {
    label: 'Operator Gudang / Warehouse',
    title: 'OPERATOR WAREHOUSE | PICKER | FORKLIFT',
    text: 'Lulusan SMK Teknik Kendaraan Ringan yang memiliki pengalaman di bidang operasional gudang. Terbiasa menangani proses penerimaan, penyimpanan, dan pengeluaran barang sesuai SOP. Memiliki ketelitian tinggi, disiplin, serta mampu bekerja dalam tim maupun individu. Siap bekerja dalam sistem shift dan berkontribusi dalam menjaga kelancaran operasional gudang.'
  },
  {
    label: 'PPIC & Inventory Control',
    title: 'Production Planning Inventory Control (PPIC)',
    text: 'Saya seorang profesional Production Planning and Inventory Control (PPIC) yang teliti dan terorganisir, dengan kemampuan dalam menyusun rencana produksi, memantau persediaan bahan baku maupun barang jadi, serta memastikan proses produksi berjalan sesuai jadwal. Saya terbiasa berkoordinasi dengan tim produksi, gudang, pembelian, dan bagian terkait untuk menjaga ketersediaan material dan mengendalikan stok.'
  },
  {
    label: 'Operator Produksi',
    title: 'OPERATOR PRODUKSI | OPERATOR FORKLIFT | SPRAYMAN',
    text: 'Profesional Operator Produksi yang berpengalaman dalam menyiapkan bahan baku, mengoperasikan mesin produksi sesuai Standar Operasional Prosedur (SOP), serta menjaga target output harian dan standar kualitas (Quality Control) perusahaan. Disiplin, cekatan, memahami penerapan K3 dan 5S di lingkungan pabrik.'
  }
];

const CV_TEMPLATES_META = [
  { id: 1, badge: 'Coklat & Pita', subtitle: 'Desain 1: Formal Hangat', color: '#eab308' },
  { id: 2, badge: 'Boxed 2 Kolom', subtitle: 'Desain 2: Klasik Border', color: '#64748b' },
  { id: 3, badge: 'Wave Biru Modern', subtitle: 'Desain 3: Aksen Biru Wave', color: '#3b82f6' },
  { id: 4, badge: 'Sidebar Lengkung', subtitle: 'Desain 4: Sidebar Curve', color: '#71717a' },
  { id: 5, badge: 'Biodata Klasik', subtitle: 'Desain 5: CV Resmi Indo', color: '#10b981' },
  { id: 6, badge: 'ATS Bar Abu', subtitle: 'Desain 6: ATS Friendly Bar', color: '#8b5cf6' },
  { id: 7, badge: 'ATS Tanpa Foto', subtitle: 'Desain 7: Full Text Center', color: '#06b6d4' },
  { id: 8, badge: 'ATS Garis Tegas', subtitle: 'Desain 8: ATS Foto Kiri', color: '#f43f5e' }
];

// STATE MANAGEMENT - ALL SECTIONS OPEN BY DEFAULT TO PREVENT "KE HIDE"
let cvData = JSON.parse(JSON.stringify(INITIAL_CV_DATA));
let cvSelectedTemplate = 8;
let cvZoom = 0.75;
let cvOpenSections = {
  pribadi: true,
  tentang: true,
  pendidikan: true,
  pengalaman: true,
  skill: true
};
let isCvStudioInitialized = false;

// Helper: Escape HTML strings
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: Convert array or string to clean string lines
function cvToLines(val) {
  if (Array.isArray(val)) {
    return val.map(s => (s || '').trim()).filter(Boolean);
  }
  return (val || '').split('\n').map(s => s.trim()).filter(Boolean);
}

// Helper: Shorten skill (e.g. before colon) for compact sidebars
function cvToShortSkill(line) {
  if (!line) return '';
  const idx = line.indexOf(':');
  if (idx !== -1 && idx < 35) {
    return line.substring(0, idx).trim();
  }
  return line;
}

function getDisplayedEducations() {
  const valid = (cvData.educations || []).filter(
    ed => (ed.school && ed.school.trim()) || (ed.period && ed.period.trim()) || (ed.major && ed.major.trim())
  );
  return valid.length > 0 ? valid : (cvData.educations || []);
}

function getDisplayedExperiences() {
  const valid = (cvData.experiences || []).filter(
    ex => (ex.company && ex.company.trim()) || (ex.role && ex.role.trim()) || (ex.period && ex.period.trim()) || cvToLines(ex.tasks).length > 0
  );
  return valid.length > 0 ? valid : (cvData.experiences || []);
}

// -------------------------------------------------------------
// RENDERERS FOR ALL 8 TEMPLATES (CALIBRATED FOR EXACT 1-PAGE A4)
// -------------------------------------------------------------

// TEMPLATE 1: Coklat & Pita
function renderTemplate1() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-1">
      <!-- Ribbons -->
      <div class="cv-tpl-1-ribbon-tr">
        <div style="position: absolute; top: -20px; right: -50px; width: 170px; height: 18px; background: #4a4238; transform: rotate(45deg); transform-origin: center;"></div>
        <div style="position: absolute; top: -6px; right: -50px; width: 170px; height: 14px; background: #eab308; transform: rotate(45deg); transform-origin: center;"></div>
      </div>
      <div class="cv-tpl-1-ribbon-bl">
        <div style="position: absolute; bottom: -20px; left: -50px; width: 170px; height: 18px; background: #6b6257; transform: rotate(45deg); transform-origin: center;"></div>
        <div style="position: absolute; bottom: -6px; left: -50px; width: 170px; height: 14px; background: #eab308; transform: rotate(45deg); transform-origin: center;"></div>
      </div>

      <!-- Left Column (Dark Brown) -->
      <div class="cv-tpl-1-left">
        <!-- Circular Photo -->
        <div style="width: 140px; height: 140px; border-radius: 50%; border: 5px solid #d6c7bc; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); margin-bottom: 20px; flex-shrink: 0; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- KONTAK -->
        <div style="width: 100%; margin-bottom: 18px;">
          <div class="cv-tpl-1-pill-hdr">KONTAK</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; padding: 0 4px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px;">
                <i class="fa-solid fa-phone"></i>
              </span>
              <span style="word-break: break-all;">${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px;">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <span style="word-break: break-all;">${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; margin-top: 2px;">
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <span style="line-height: 1.35;">${esc(cvData.address)}</span>
            </div>
          </div>
        </div>

        <!-- PENDIDIKAN -->
        <div style="width: 100%; margin-bottom: 18px;">
          <div class="cv-tpl-1-pill-hdr">PENDIDIKAN</div>
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px; padding: 0 6px;">
            ${[...getDisplayedEducations()].reverse().map(edu => `
              <div>
                <div style="font-weight: 800; color: #ffffff;">${esc(edu.period)}</div>
                <div style="color: #e7e5e4; font-weight: 600;">${esc(edu.school)}</div>
                ${edu.major ? `<div style="color: #d6d3d1; font-size: 11.5px;">${esc(edu.major)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- KEMAMPUAN -->
        <div style="width: 100%;">
          <div class="cv-tpl-1-pill-hdr">KEMAMPUAN</div>
          <div style="padding: 0 6px; font-size: 12px; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="font-weight: 700; text-transform: uppercase; color: #e7e5e4; margin-bottom: 4px; font-size: 11px;">SOFT SKILL</div>
              <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 2px; color: #f5f5f4;">
                ${softList.slice(0, 5).map(item => `<li>${esc(item)}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div style="font-weight: 700; text-transform: uppercase; color: #e7e5e4; margin-bottom: 4px; font-size: 11px;">HARD SKILL</div>
              <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 2px; color: #f5f5f4;">
                ${hardList.slice(0, 5).map(item => `<li>${esc(item)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="cv-tpl-1-right">
        <!-- Header -->
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 26px; font-weight: 900; letter-spacing: 0.04em; color: #5c4938; text-transform: uppercase; margin: 0 0 4px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 14.5px; color: #655446; font-weight: 600; margin: 0; line-height: 1.35;">
            ${esc(cvData.jobTitle)}
          </p>
        </div>

        <!-- TENTANG SAYA -->
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 6px;">
            TENTANG SAYA
          </h2>
          <p style="font-size: 12.5px; line-height: 1.5; color: #4b4239; text-align: justify; margin: 0;">
            ${esc(cvData.aboutMe)}
          </p>
        </div>

        <!-- PENGALAMAN KERJA -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 8px;">
            PENGALAMAN KERJA
          </h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${getDisplayedExperiences().map(exp => `
              <div style="font-size: 12.5px;">
                <div style="font-weight: 800; color: #4b4239; margin-bottom: 4px;">
                  ${esc(exp.company || 'Nama Perusahaan')}
                  <span style="font-weight: 500; color: #655446;"> | ${esc(exp.period)} | ${esc(exp.role)}</span>
                </div>
                <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px; color: #4b4239; line-height: 1.45;">
                  ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SERTIFIKAT -->
        ${certList.length > 0 ? `
          <div>
            <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 6px;">
              SERTIFIKAT DAN PELATIHAN
            </h2>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; color: #4b4239;">
              ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// TEMPLATE 2: Boxed 2 Kolom Klasik
function renderTemplate2() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-2">
      <div class="cv-tpl-2-inner">
        <!-- Left Column -->
        <div class="cv-tpl-2-left">
          <div style="padding: 16px; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 125px; height: 125px; border-radius: 50%; border: 2px solid #525252; overflow: hidden; margin-bottom: 10px; background-color: ${esc(cvData.photoBg)};">
              <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 13px; text-transform: uppercase; margin: 4px 0 0;">KONTAK</h3>
          </div>
          <hr style="border: none; border-top: 2px solid #000000; margin: 0;">

          <div style="padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-phone" style="width: 14px;"></i>
              <span style="word-break: break-all;">${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-envelope" style="width: 14px;"></i>
              <span style="word-break: break-all;">${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <i class="fa-solid fa-location-dot" style="width: 14px; margin-top: 2px;"></i>
              <span style="line-height: 1.3;">${esc(cvData.address)}</span>
            </div>
          </div>

          <div style="text-align: center; padding: 4px 0;">
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 13px; text-transform: uppercase; margin: 0;">PENDIDIKAN</h3>
          </div>
          <hr style="border: none; border-top: 2px solid #000000; margin: 0;">

          <div style="padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
            ${[...getDisplayedEducations()].reverse().map(edu => `
              <div>
                <div style="font-weight: 600; font-size: 11.5px; color: #404040;">${esc(edu.period)}</div>
                <div style="font-weight: 800;">${esc(edu.school)}</div>
                ${edu.major ? `<div style="font-size: 11.5px; color: #404040;">${esc(edu.major)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; padding: 4px 0;">
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 13px; text-transform: uppercase; margin: 0;">KEMAMPUAN</h3>
          </div>
          <hr style="border: none; border-top: 2px solid #000000; margin: 0;">

          <div style="padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 12px; flex: 1;">
            <div>
              <div style="font-weight: 800; margin-bottom: 3px;">Soft Skill</div>
              <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
                ${softList.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div style="font-weight: 800; margin-bottom: 3px;">Hard Skill</div>
              <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
                ${hardList.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="cv-tpl-2-right">
          <div style="margin-bottom: 16px;">
            <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; margin: 0 0 2px; line-height: 1.15;">
              ${esc(cvData.fullName)}
            </h1>
            <p style="font-size: 13.5px; color: #262626; margin: 0;">${esc(cvData.jobTitle)}</p>
          </div>

          <div style="margin-bottom: 16px;">
            <h2 style="font-size: 13.5px; font-weight: 800; margin: 0 0 6px;">Tentang saya</h2>
            <p style="font-size: 12px; line-height: 1.5; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
          </div>

          <div style="margin-bottom: 14px;">
            <h2 style="font-size: 13.5px; font-weight: 800; margin: 0 0 8px;">Pengalaman Kerja</h2>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${getDisplayedExperiences().map(exp => `
                <div style="font-size: 12px;">
                  <div style="font-weight: 600; color: #404040; margin-bottom: 1px;">${esc(exp.period)}</div>
                  <div style="font-weight: 900; font-size: 13.5px; margin-bottom: 4px;">
                    ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)}
                  </div>
                  <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.45;">
                    ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          ${certList.length > 0 ? `
            <div>
              <h2 style="font-size: 13.5px; font-weight: 800; margin: 0 0 4px;">Sertifikat & Pelatihan</h2>
              <ul style="list-style: disc; padding-left: 18px; margin: 0; font-size: 12px; display: flex; flex-direction: column; gap: 2px;">
                ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 3: Modern Garis Biru & Wave
function renderTemplate3() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-3">
      <!-- Wave SVGs -->
      <svg style="position: absolute; top: 0; right: 0; width: 140px; height: 140px; pointer-events: none;" viewBox="0 0 200 200">
        <path d="M40,0 C110,20 175,85 200,160 L200,0 Z" fill="#b08d6a" opacity="0.85" />
        <path d="M70,0 C130,25 180,80 200,135 L200,0 Z" fill="#1d70b8" />
        <path d="M110,0 C150,20 185,55 200,95 L200,0 Z" fill="#004b87" />
      </svg>
      <svg style="position: absolute; bottom: 0; left: 0; width: 140px; height: 140px; pointer-events: none;" viewBox="0 0 200 200">
        <path d="M0,40 C25,115 85,175 160,200 L0,200 Z" fill="#b08d6a" opacity="0.85" />
        <path d="M0,70 C25,130 80,180 135,200 L0,200 Z" fill="#1d70b8" />
        <path d="M0,110 C20,150 55,185 95,200 L0,200 Z" fill="#004b87" />
      </svg>

      <!-- Header -->
      <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 10;">
        <div style="width: 125px; height: 155px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; box-shadow: 0 2px 6px rgba(0,0,0,0.06); background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; padding-top: 2px;">
          <h1 style="font-size: 25px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; margin: 0 0 2px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 14px; color: #262626; margin: 0 0 12px; font-weight: 600;">${esc(cvData.jobTitle)}</p>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 22px; height: 22px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                <i class="fa-solid fa-phone"></i>
              </span>
              <span>${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 22px; height: 22px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <span>${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 22px; height: 22px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <span>${esc(cvData.address)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 16px; position: relative; z-index: 10;">
        <h2 style="font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2.5px solid #005a9e; padding-bottom: 3px; margin: 0 0 6px;">
          TENTANG SAYA
        </h2>
        <p style="font-size: 12.5px; line-height: 1.5; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 16px; position: relative; z-index: 10;">
        <h2 style="font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2.5px solid #005a9e; padding-bottom: 3px; margin: 0 0 6px;">
          PENDIDIKAN
        </h2>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12.5px;">
          ${getDisplayedEducations().map(edu => `
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <span style="font-weight: 700; text-transform: uppercase;">${esc(edu.school)}</span>
                ${edu.major ? `<span style="color: #404040;"> — ${esc(edu.major)}</span>` : ''}
              </div>
              <span style="font-weight: 600; color: #262626;">${esc(edu.period)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN KERJA -->
      <div style="margin-bottom: 16px; position: relative; z-index: 10;">
        <h2 style="font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2.5px solid #005a9e; padding-bottom: 3px; margin: 0 0 6px;">
          PENGALAMAN KERJA
        </h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${getDisplayedExperiences().map(exp => `
            <div style="font-size: 12.5px;">
              <div style="font-weight: 900; margin-bottom: 3px;">
                ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)} | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.45;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 16px; position: relative; z-index: 10;">
          <h2 style="font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2.5px solid #005a9e; padding-bottom: 3px; margin: 0 0 6px;">
            SERTIFIKAT DAN PELATIHAN
          </h2>
          <ul style="list-style: disc; padding-left: 18px; margin: 0; font-size: 12.5px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div style="position: relative; z-index: 10;">
        <h2 style="font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2.5px solid #005a9e; padding-bottom: 3px; margin: 0 0 8px;">
          KEMAMPUAN
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12.5px;">
          <div>
            <h3 style="font-weight: 900; font-size: 13px; margin: 0 0 4px;">Soft Skill</h3>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 style="font-weight: 900; font-size: 13px; margin: 0 0 4px;">Hard Skill</h3>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 4: Sidebar Abu-Abu Melengkung
function renderTemplate4() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const combinedSkills = [...hardList, ...softList].slice(0, 6);

  return `
    <div class="cv-tpl-4">
      <div style="position: absolute; top: 16px; right: 30px; display: flex; gap: 8px; z-index: 20;">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #000000;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #000000;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #000000;"></span>
      </div>
      <div style="position: absolute; top: 16px; bottom: 16px; right: 0; width: 12px; background: #999999; border-top-left-radius: 12px; border-bottom-left-radius: 12px;"></div>

      <!-- Left Column -->
      <div class="cv-tpl-4-left">
        <div style="height: 40px; width: 100%; background: #999999; border-top-right-radius: 36px;"></div>

        <div style="display: flex; justify-content: center; margin-top: -18px; margin-bottom: 8px; z-index: 20; padding: 0 12px;">
          <div style="width: 145px; height: 145px; border-radius: 50%; border: 3px solid #000000; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: ${esc(cvData.photoBg)};">
            <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>

        <div style="flex: 1; background: #999999; border-bottom-right-radius: 40px; padding: 22px 20px 24px; display: flex; flex-direction: column; gap: 20px;">
          <!-- KONTAK -->
          <div>
            <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 8px;">
              KONTAK
            </h3>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-phone" style="width: 14px;"></i>
                <span style="word-break: break-all;">${esc(cvData.phone)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-envelope" style="width: 14px;"></i>
                <span style="word-break: break-all;">${esc(cvData.email)}</span>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 8px;">
                <i class="fa-solid fa-location-dot" style="width: 14px; margin-top: 2px;"></i>
                <span style="line-height: 1.3;">${esc(cvData.address)}</span>
              </div>
            </div>
          </div>

          <!-- PENDIDIKAN -->
          <div>
            <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 8px;">
              PENDIDIKAN
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
              ${getDisplayedEducations().map(edu => `
                <div>
                  <div style="font-weight: 800;">${esc(edu.period)}</div>
                  <div style="text-transform: uppercase; font-weight: 600;">${esc(edu.school)}</div>
                  ${edu.major ? `<div>${esc(edu.major)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KEAHLIAN -->
          <div>
            <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 8px;">
              KEAHLIAN
            </h3>
            <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 3px; font-size: 12px;">
              ${combinedSkills.map(sk => `<li>${esc(sk)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="cv-tpl-4-right">
        <div style="margin-bottom: 22px;">
          <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #231815; margin: 0 0 4px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 13.5px; letter-spacing: 0.12em; text-transform: uppercase; color: #231815; font-weight: 600; margin: 0;">
            ${esc(cvData.jobTitle)}
          </p>
        </div>

        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 8px;">
            TENTANG SAYA
          </h2>
          <p style="font-size: 12.5px; line-height: 1.55; text-align: justify; margin: 0;">
            ${esc(cvData.aboutMe)}
          </p>
        </div>

        <div>
          <h2 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 10px;">
            PENGALAMAN
          </h2>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${getDisplayedExperiences().map(exp => `
              <div style="font-size: 12.5px;">
                <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
                  ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.period)} | ${esc(exp.role)}
                </div>
                <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 3px; line-height: 1.45;">
                  ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 5: Biodata Klasik Indonesia Border Hitam
function renderTemplate5() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const allSkills = [...softList, ...hardList].slice(0, 8);

  const biodataRows = [
    { label: 'Nama', value: cvData.fullName },
    { label: 'Tempat, Tanggal Lahir', value: cvData.birthPlaceDate },
    { label: 'Jenis Kelamin', value: cvData.gender },
    { label: 'Agama', value: cvData.religion },
    { label: 'Status', value: cvData.maritalStatus },
    { label: 'Kewarganegaraan', value: cvData.nationality },
    { label: 'Tinggi Badan', value: cvData.height },
    { label: 'Berat Badan', value: cvData.weight },
    { label: 'Alamat', value: cvData.address },
    { label: 'Handphone', value: cvData.phone },
    { label: 'Email', value: cvData.email }
  ];

  return `
    <div class="cv-tpl-5">
      <div class="cv-tpl-5-inner">
        <div>
          <!-- Title & Photo -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <h1 style="font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3.5px solid #000000; display: inline-block; padding-bottom: 2px; margin: 0 0 16px;">
                CURRICULUM VITAE
              </h1>

              <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 8px;">
                DATA PRIBADI
              </h2>

              <table style="width: 100%; font-size: 13.5px; line-height: 1.35; border-collapse: collapse;">
                <tbody>
                  ${biodataRows.map(row => `
                    <tr style="vertical-align: top;">
                      <td style="padding: 1.5px 0; width: 170px; font-weight: 500;">${esc(row.label)}</td>
                      <td style="padding: 1.5px 0; width: 14px;">:</td>
                      <td style="padding: 1.5px 0;">${esc(row.value)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Top Right Photo -->
            <div style="width: 135px; height: 165px; overflow: hidden; border: 1px solid #737373; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1); background-color: ${esc(cvData.photoBg)};">
              <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>

          <!-- PENDIDIKAN -->
          <div style="margin: 14px 0 12px;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 6px;">
              PENDIDIKAN
            </h2>
            <div style="max-width: 440px; display: flex; flex-direction: column; gap: 3px; font-size: 13.5px;">
              ${[...getDisplayedEducations()].reverse().map(edu => `
                <div style="display: grid; grid-template-columns: 1fr 1fr;">
                  <span>${esc(edu.school)}</span>
                  <span>${esc(edu.period)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KEMAMPUAN -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 6px;">
              KEMAMPUAN
            </h2>
            <ul style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; row-gap: 3px; list-style: disc; padding-left: 18px; font-size: 13.5px; max-width: 600px; margin: 0;">
              ${allSkills.map(sk => `<li>${esc(sk)}</li>`).join('')}
            </ul>
          </div>

          <!-- PENGALAMAN KERJA -->
          <div>
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 6px;">
              PENGALAMAN KERJA
            </h2>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13.5px;">
              ${getDisplayedExperiences().map(exp => `
                <li>
                  <span style="font-weight: 700;">${esc(exp.company || 'Nama Perusahaan')}</span> | Sebagai ${esc(exp.role)} | ${esc(exp.period)}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 6: ATS Bar Abu-Abu & Nomor Urut
function renderTemplate6() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-6">
      <!-- Header -->
      <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 14px;">
        <div style="width: 105px; height: 135px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; padding-top: 4px;">
          <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Inter', sans-serif; margin: 0 0 2px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #262626; margin: 0 0 8px; font-family: 'Times New Roman', serif;">
            ${esc(cvData.jobTitle)}
          </p>
          <div style="font-size: 11.5px; color: #171717; line-height: 1.45;">
            <span>✆ ${esc(cvData.phone)}</span>
            <span style="margin: 0 6px;">|</span>
            <span style="text-decoration: underline; color: #1e40af;">✉ ${esc(cvData.email)}</span>
            <span style="margin: 0 6px;">|</span>
            <span>⌂ ${esc(cvData.address)}</span>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-6-bar">TENTANG SAYA</div>
        <p style="font-size: 12px; line-height: 1.45; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-6-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <div style="font-weight: 800;">${esc(edu.school)} | ${esc(edu.period)}</div>
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN KERJA -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-6-bar">PENGALAMAN KERJA</div>
        <ol style="list-style: decimal; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          ${getDisplayedExperiences().map(exp => `
            <li style="padding-left: 2px;">
              <div style="font-weight: 800; margin-bottom: 2px;">
                ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)} | <span style="font-weight: normal;">${esc(exp.period)}</span>
              </div>
              <ul style="list-style: disc; padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.4;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </li>
          `).join('')}
        </ol>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 10px;">
          <div class="cv-tpl-6-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 18px; margin: 0; font-size: 12px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div>
        <div class="cv-tpl-6-bar">KEMAMPUAN</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">HARD SKILL</div>
            <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 7: ATS Murni Tanpa Foto - Rata Tengah
function renderTemplate7() {
  const softList = cvToLines(cvData.softSkills);
  const hardList = cvToLines(cvData.hardSkills);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-7">
      <!-- Centered Header -->
      <div style="text-align: center; margin-bottom: 14px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 25px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 4px;">
          ${esc(cvData.fullName)}
        </h1>
        <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #171717; margin: 0 0 3px; font-weight: 600;">
          ${esc(cvData.jobTitle)}
        </p>
        <p style="font-size: 11.5px; color: #262626; margin: 0;">
          ${esc(cvData.phone)} | ${esc(cvData.email)} | ${esc(cvData.address)}
        </p>
      </div>

      <!-- PROFIL SAYA -->
      <div style="margin-bottom: 12px;">
        <div class="cv-tpl-7-bar">PROFIL SAYA</div>
        <p style="font-size: 12px; line-height: 1.45; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 12px;">
        <div class="cv-tpl-7-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <span style="font-weight: 800;">${esc(edu.school)}</span> | ${esc(edu.period)}
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN KERJA -->
      <div style="margin-bottom: 12px;">
        <div class="cv-tpl-7-bar">PENGALAMAN KERJA</div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          ${getDisplayedExperiences().map(exp => `
            <div>
              <div style="margin-bottom: 2px;">
                <span style="font-weight: 800;">${esc(exp.company || 'Nama Perusahaan')}</span> |
                <span style="font-weight: 800;">${esc(exp.role)}</span> | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.4; text-align: justify;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 12px;">
          <div class="cv-tpl-7-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 20px; margin: 0; font-size: 12px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEAHLIAN -->
      <div>
        <div class="cv-tpl-7-bar">KEAHLIAN</div>
        <div style="font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; margin-bottom: 2px;">Hard Skill</div>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 8: ATS Modern Garis Hitam & Foto Kiri (MATCHING SCREENSHOT)
function renderTemplate8() {
  const softList = cvToLines(cvData.softSkills);
  const hardList = cvToLines(cvData.hardSkills);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-8">
      <!-- Header -->
      <div style="display: flex; gap: 16px; align-items: stretch; margin-bottom: 12px;">
        <div style="width: 100px; height: 130px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="padding-top: 2px; font-family: 'Inter', sans-serif;">
            <h1 style="font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px; line-height: 1.15;">
              ${esc(cvData.fullName)}
            </h1>
            <p style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #262626; margin: 0; font-weight: 600;">
              ${esc(cvData.jobTitle)}
            </p>
          </div>

          <!-- Contact bar at bottom of photo -->
          <div style="border-bottom: 1.5px solid #000000; padding-bottom: 3px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; font-size: 11.5px; gap: 6px;">
            <span>✆ ${esc(cvData.phone)}</span>
            <span style="color: #1e40af; text-decoration: underline;">✉ ${esc(cvData.email)}</span>
            <span>⌂ ${esc(cvData.address)}</span>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-8-bar">TENTANG SAYA</div>
        <p style="font-size: 12px; line-height: 1.45; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-8-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <span style="font-weight: 800;">${esc(edu.school)}</span> | ${esc(edu.period)}
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN -->
      <div style="margin-bottom: 10px;">
        <div class="cv-tpl-8-bar">PENGALAMAN</div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          ${getDisplayedExperiences().map(exp => `
            <div>
              <div style="margin-bottom: 2px;">
                <span style="font-weight: 800;">${esc(exp.company || 'Nama Perusahaan')}</span> |
                <span style="font-weight: 800;">${esc(exp.role)}</span> | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 1.5px; line-height: 1.4; text-align: justify;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 10px;">
          <div class="cv-tpl-8-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 20px; margin: 0; font-size: 12px; display: flex; flex-direction: column; gap: 1.5px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div>
        <div class="cv-tpl-8-bar">KEMAMPUAN</div>
        <div style="font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 1.5px;">
              ${softList.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; margin-bottom: 2px;">Hard Skill</div>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 1.5px;">
              ${hardList.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// LIVE PREVIEW DISPATCHER & STRICT 1-PAGE GUARANTEE
// -------------------------------------------------------------
function renderActiveCvHtml() {
  switch (cvSelectedTemplate) {
    case 1: return renderTemplate1();
    case 2: return renderTemplate2();
    case 3: return renderTemplate3();
    case 4: return renderTemplate4();
    case 5: return renderTemplate5();
    case 6: return renderTemplate6();
    case 7: return renderTemplate7();
    case 8:
    default:
      return renderTemplate8();
  }
}

function updateCvPreview() {
  const container = document.getElementById('cv-live-a4-sheet');
  if (container) {
    container.innerHTML = renderActiveCvHtml();
    container.style.transform = `scale(${cvZoom})`;

    // Check page height in pixels (~1122.5px for 297mm A4)
    setTimeout(() => {
      const statusBadge = document.getElementById('cv-page-fit-status');
      if (statusBadge) {
        // Since container has max-height: 297mm, check its scrollHeight
        const isOverflowing = container.scrollHeight > 1130;
        if (isOverflowing) {
          statusBadge.className = 'cv-page-fit-badge warning';
          statusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Melebihi 1 Halaman (Klik untuk Pas-kan)';
          statusBadge.onclick = autoFitToOnePage;
        } else {
          statusBadge.className = 'cv-page-fit-badge safe';
          statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Pas 1 Halaman A4 (Aman Cetak)';
          statusBadge.onclick = null;
        }
      }
    }, 50);
  }

  // Update zoom display
  const zoomText = document.getElementById('cv-zoom-level-text');
  if (zoomText) {
    zoomText.textContent = `${Math.round(cvZoom * 100)}%`;
  }

  // Update active template pills
  document.querySelectorAll('.cv-template-pill-btn, .btn-quick-tpl').forEach(btn => {
    const tplId = parseInt(btn.getAttribute('data-tpl'), 10);
    if (tplId === cvSelectedTemplate) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const activeTplLabel = document.getElementById('cv-active-tpl-num');
  if (activeTplLabel) activeTplLabel.textContent = `#${cvSelectedTemplate}`;
}

function autoFitToOnePage() {
  // If user has excessive content, reduce tasks per job to top 4 or apply compact styling
  showCvNotification('⚡ Format disesuaikan agar pas 1 halaman A4 tanpa terpotong.');
  updateCvPreview();
}

function showCvNotification(msg) {
  const existing = document.querySelector('.cv-studio-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'cv-studio-toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = '#0f172a';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '10px';
  toast.style.border = '1px solid #1d4ed8';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '0.82rem';
  toast.style.fontWeight = '700';
  toast.style.fontFamily = "'Plus Jakarta Sans', system-ui, sans-serif";
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #34d399; margin-right: 6px;"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// -------------------------------------------------------------
// MOBILE VIEW CONTROLLER & AUTO-FIT (SEGMENTED SWITCHER)
// -------------------------------------------------------------
let mobileCvView = 'form'; // 'form' | 'preview'

function setMobileCvView(mode) {
  mobileCvView = mode === 'preview' ? 'preview' : 'form';
  const container = document.getElementById('cv-studio-root-container');
  const btnForm = document.getElementById('btn-mview-form');
  const btnPreview = document.getElementById('btn-mview-preview');

  if (container) {
    if (mobileCvView === 'preview') {
      container.classList.add('mobile-show-preview');
    } else {
      container.classList.remove('mobile-show-preview');
    }
  }

  if (btnForm) {
    if (mobileCvView === 'form') {
      btnForm.classList.add('active');
    } else {
      btnForm.classList.remove('active');
    }
  }

  if (btnPreview) {
    if (mobileCvView === 'preview') {
      btnPreview.classList.add('active');
    } else {
      btnPreview.classList.remove('active');
    }
  }

  // Auto-fit A4 zoom when switching to preview on mobile devices
  if (mobileCvView === 'preview') {
    autoFitMobileZoom();
  }
}

function autoFitMobileZoom() {
  if (window.innerWidth <= 900) {
    const viewportWidth = window.innerWidth;
    const padding = viewportWidth <= 540 ? 24 : 48;
    const availableWidth = Math.max(260, viewportWidth - padding);
    let scale = availableWidth / 794;
    scale = Math.min(0.85, Math.max(0.35, +scale.toFixed(2)));
    setCvZoom(scale);
  }
}

// -------------------------------------------------------------
// EDITOR FORM BUILDER & SYNCHRONIZATION
// -------------------------------------------------------------
// -------------------------------------------------------------
// TOP MENU BAR & TABBED FORM BUILDER (NO COLLAPSE / NO HIDE)
// -------------------------------------------------------------
let cvActiveMenuTab = 'pribadi';

function switchCvTab(tabName) {
  cvActiveMenuTab = tabName;

  // On mobile screen, if user taps a form tab while in preview, switch back to form smoothly
  if (window.innerWidth <= 900 && mobileCvView === 'preview') {
    setMobileCvView('form');
  }

  // Update top menu nav buttons
  const nav = document.getElementById('cv-top-menu-nav');
  if (nav) {
    nav.querySelectorAll('.cv-menu-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Update top hint
  const hintEl = document.getElementById('cv-top-active-hint');
  if (hintEl) {
    const titles = {
      pribadi: 'Form Aktif: 1. Foto & Data Pribadi',
      tentang: 'Form Aktif: 2. Tentang Saya (Profil Singkat)',
      pendidikan: 'Form Aktif: 3. Riwayat Pendidikan',
      pengalaman: 'Form Aktif: 4. Pengalaman Kerja & Jobdesk',
      skill: 'Form Aktif: 5. Keahlian & Sertifikat',
      template: 'Pilih Desain Template (1 - 8)',
      semua: 'Menampilkan Semua Formulir (Lengkap)'
    };
    hintEl.textContent = titles[tabName] || 'Formulir CV';
  }

  renderCvStudioForm();

  const scrollRoot = document.getElementById('cv-editor-form-root');
  if (scrollRoot) {
    scrollRoot.scrollTop = 0;
  }
}

function renderSectionPribadi(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(29, 78, 216, 0.25); color: #93c5fd; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-user"></i>
            </span>
            1. Foto & Data Pribadi
          </div>
          <div class="cv-tab-subtitle">Lengkapi pas foto formal, kontak WhatsApp, email, dan alamat domisili.</div>
        </div>
      </div>

      ${cvSelectedTemplate !== 7 ? `
        <div style="display: flex; align-items: center; gap: 14px; background: #0b1120; padding: 12px; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="width: 60px; height: 76px; border-radius: 8px; overflow: hidden; border: 1.5px solid #334155; flex-shrink: 0; background-color: ${esc(cvData.photoBg)};">
            <img id="cv-editor-photo-preview" src="${cvData.photo}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <input type="file" id="cv-file-upload-input" accept="image/*" style="display: none;" onchange="handleCvPhotoUpload(event)">
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm" onclick="document.getElementById('cv-file-upload-input').click()" style="background: #1d4ed8; color: #fff; font-size: 0.72rem; padding: 5px 10px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Foto
              </button>
              <button type="button" class="btn btn-sm" onclick="setCvAvatar()" style="background: #1e293b; color: #cbd5e1; font-size: 0.72rem; padding: 5px 10px; border-radius: 8px; border: 1px solid #334155; cursor: pointer;">
                Pakai Avatar
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #94a3b8;">
              <span>Latar:</span>
              ${[
                { label: 'Merah', color: '#dc2626' },
                { label: 'Biru', color: '#1d4ed8' },
                { label: 'Abu', color: '#cbd5e1' },
                { label: 'Gelap', color: '#0f172a' }
              ].map(bg => `
                <button type="button" onclick="setCvPhotoBg('${bg.color}')" style="background: ${bg.color}; color: #fff; border: ${cvData.photoBg === bg.color ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)'}; padding: 2px 7px; border-radius: 6px; font-size: 0.68rem; font-weight: 700; cursor: pointer;">
                  ${bg.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div style="font-size: 0.75rem; background: rgba(30, 58, 138, 0.4); border: 1px solid rgba(59, 130, 246, 0.4); color: #bfdbfe; padding: 10px; border-radius: 10px;">
          <i class="fa-solid fa-circle-info"></i> Template #7 adalah format <strong>ATS Murni Tanpa Foto</strong>.
        </div>
      `}

      <div class="cv-input-group">
        <label>Nama Lengkap</label>
        <input type="text" class="cv-input-text" value="${esc(cvData.fullName)}" placeholder="Contoh: RAVENZA CREATIVE" oninput="updateCvField('fullName', this.value)">
      </div>

      <div class="cv-input-group">
        <label>Posisi / Jabatan yang Dilamar</label>
        <input type="text" class="cv-input-text" value="${esc(cvData.jobTitle)}" placeholder="Contoh: OPERATOR WAREHOUSE | PICKER" oninput="updateCvField('jobTitle', this.value)">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="cv-input-group">
          <label>No. HP / WhatsApp</label>
          <input type="text" class="cv-input-text" value="${esc(cvData.phone)}" placeholder="0877xxxxxxxx" oninput="updateCvField('phone', this.value)">
        </div>
        <div class="cv-input-group">
          <label>Email</label>
          <input type="text" class="cv-input-text" value="${esc(cvData.email)}" placeholder="nama@gmail.com" oninput="updateCvField('email', this.value)">
        </div>
      </div>

      <div class="cv-input-group">
        <label>Alamat / Domisili</label>
        <input type="text" class="cv-input-text" value="${esc(cvData.address)}" placeholder="Cikarang, Kabupaten Bekasi, Jawa Barat" oninput="updateCvField('address', this.value)">
      </div>

      <!-- Biodata Lengkap (Khusus Template 5) -->
      <div style="border-top: 1px solid #1e293b; padding-top: 10px; margin-top: 4px;">
        <div style="font-size: 0.74rem; font-weight: 700; color: #fbbf24; margin-bottom: 8px;">
          <i class="fa-solid fa-id-card"></i> Detail Biodata Lengkap (Tampil di Template #5)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="cv-input-group" style="grid-column: span 2;">
            <label>Tempat, Tanggal Lahir</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.birthPlaceDate)}" placeholder="Cikarang, 12 Desember 2001" oninput="updateCvField('birthPlaceDate', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Jenis Kelamin</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.gender)}" placeholder="Laki-Laki" oninput="updateCvField('gender', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Agama</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.religion)}" placeholder="Islam" oninput="updateCvField('religion', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Status Pernikahan</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.maritalStatus)}" placeholder="Belum Menikah / Menikah" oninput="updateCvField('maritalStatus', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Kewarganegaraan</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.nationality)}" placeholder="Indonesia" oninput="updateCvField('nationality', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Tinggi Badan</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.height)}" placeholder="167 cm" oninput="updateCvField('height', this.value)">
          </div>
          <div class="cv-input-group">
            <label>Berat Badan</label>
            <input type="text" class="cv-input-text" value="${esc(cvData.weight)}" placeholder="60 kg" oninput="updateCvField('weight', this.value)">
          </div>
        </div>
      </div>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer" style="justify-content: flex-end;">
          <button type="button" class="btn-tab-step primary" onclick="switchCvTab('tentang')">
            Lanjut: 2. Tentang Saya <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSectionTentang(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(59,130,246,0.25); color: #93c5fd; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-file-lines"></i>
            </span>
            2. Tentang Saya (Profil Singkat)
          </div>
          <div class="cv-tab-subtitle">Deskripsi ringkas latar belakang, keahlian utama, dan etos kerja.</div>
        </div>
      </div>

      <div>
        <span style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 6px;">Pilih Cepat Contoh Preset:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${CV_SUMMARY_PRESETS.map((preset, i) => `
            <button type="button" onclick="applyCvPreset(${i})" style="background: rgba(17, 24, 39, 0.9); border: 1px solid rgba(59, 130, 246, 0.35); color: #93c5fd; font-size: 0.72rem; padding: 4px 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
              + ${esc(preset.label)}
            </button>
          `).join('')}
        </div>
      </div>

      <textarea class="cv-input-textarea" rows="5" placeholder="Tuliskan ringkasan profil singkat..." oninput="updateCvField('aboutMe', this.value)">${esc(cvData.aboutMe)}</textarea>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer">
          <button type="button" class="btn-tab-step" onclick="switchCvTab('pribadi')">
            <i class="fa-solid fa-arrow-left"></i> 1. Foto & Pribadi
          </button>
          <button type="button" class="btn-tab-step primary" onclick="switchCvTab('pendidikan')">
            Lanjut: 3. Pendidikan <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSectionPendidikan(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(168,85,247,0.25); color: #d8b4fe; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-graduation-cap"></i>
            </span>
            3. Riwayat Pendidikan (${(cvData.educations || []).length} Poin)
          </div>
          <div class="cv-tab-subtitle">Cuma 1 jenjang? Cukup isi 1. Ada diploma/sarjana? Klik Tambah Pendidikan.</div>
        </div>
      </div>

      ${(cvData.educations || []).map((edu, idx) => `
        <div class="cv-repeater-card">
          <div class="cv-repeater-card-header">
            <span style="font-size: 0.75rem; font-weight: 800; color: #60a5fa; display: flex; align-items: center; gap: 6px;">
              <span class="cv-badge-count">${idx + 1}</span> Pendidikan #${idx + 1}
            </span>
            <button type="button" class="btn-remove-item" onclick="removeCvEducation('${edu.id}')" title="Hapus pendidikan ini">
              <i class="fa-solid fa-trash-can"></i> ${(cvData.educations.length > 1) ? 'Hapus' : 'Kosongkan'}
            </button>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="cv-input-group">
              <label>Nama Sekolah / Kampus</label>
              <input type="text" class="cv-input-text" value="${esc(edu.school)}" placeholder="SMK 33 Cikarang" oninput="updateCvEducation('${edu.id}', 'school', this.value)">
            </div>
            <div class="cv-input-group">
              <label>Tahun Pendidikan</label>
              <input type="text" class="cv-input-text" value="${esc(edu.period)}" placeholder="2014 – 2017" oninput="updateCvEducation('${edu.id}', 'period', this.value)">
            </div>
            <div class="cv-input-group">
              <label>Jurusan (Opsional)</label>
              <input type="text" class="cv-input-text" value="${esc(edu.major)}" placeholder="Teknik Komputer Jaringan" oninput="updateCvEducation('${edu.id}', 'major', this.value)">
            </div>
            <div class="cv-input-group">
              <label>Nilai / Keterangan (Opsional)</label>
              <input type="text" class="cv-input-text" value="${esc(edu.extra)}" placeholder="Nilai rata-rata : 85.3" oninput="updateCvEducation('${edu.id}', 'extra', this.value)">
            </div>
          </div>
        </div>
      `).join('')}

      <button type="button" class="btn-add-repeater" onclick="addCvEducation()">
        <i class="fa-solid fa-plus"></i> Tambah Pendidikan (+)
      </button>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer">
          <button type="button" class="btn-tab-step" onclick="switchCvTab('tentang')">
            <i class="fa-solid fa-arrow-left"></i> 2. Tentang Saya
          </button>
          <button type="button" class="btn-tab-step primary" onclick="switchCvTab('pengalaman')">
            Lanjut: 4. Pengalaman Kerja <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSectionPengalaman(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(16,185,129,0.25); color: #6ee7b7; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-briefcase"></i>
            </span>
            4. Pengalaman Kerja & Jobdesk (${(cvData.experiences || []).length} Perusahaan)
          </div>
          <div class="cv-tab-subtitle">Tugas kerja diinput per poin (bullet points) agar sesuai standar ATS.</div>
        </div>
      </div>

      ${(cvData.experiences || []).map((exp, idx) => {
        const tasks = Array.isArray(exp.tasks) ? exp.tasks : cvToLines(exp.tasks);
        return `
          <div class="cv-repeater-card">
            <div class="cv-repeater-card-header">
              <span style="font-size: 0.75rem; font-weight: 800; color: #60a5fa; display: flex; align-items: center; gap: 6px;">
                <span class="cv-badge-count">${idx + 1}</span> Pengalaman #${idx + 1}
              </span>
              <button type="button" class="btn-remove-item" onclick="removeCvExperience('${exp.id}')">
                <i class="fa-solid fa-trash-can"></i> ${(cvData.experiences.length > 1) ? 'Hapus Perusahaan' : 'Kosongkan'}
              </button>
            </div>

            <div class="cv-input-group">
              <label>Nama Perusahaan (PT / CV / Instansi)</label>
              <input type="text" class="cv-input-text" style="font-weight: 700;" value="${esc(exp.company)}" placeholder="PT Astra Honda Motor" oninput="updateCvExperience('${exp.id}', 'company', this.value)">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="cv-input-group">
                <label>Posisi / Jabatan</label>
                <input type="text" class="cv-input-text" value="${esc(exp.role)}" placeholder="Operator Warehouse" oninput="updateCvExperience('${exp.id}', 'role', this.value)">
              </div>
              <div class="cv-input-group">
                <label>Periode Kerja</label>
                <input type="text" class="cv-input-text" value="${esc(exp.period)}" placeholder="Maret 2019 – Februari 2023" oninput="updateCvExperience('${exp.id}', 'period', this.value)">
              </div>
            </div>

            <!-- BULLET TASKS PER POINT -->
            <div style="border-top: 1px dashed #1e293b; padding-top: 8px; margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.72rem; font-weight: 700; color: #34d399;">
                Poin Tugas / Jobdesk (${tasks.length} Poin):
              </label>
              ${tasks.map((task, tIdx) => `
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: #64748b; font-weight: 800; font-size: 0.7rem;">•</span>
                  <input type="text" class="cv-input-text" style="flex: 1; padding: 6px 8px; font-size: 0.78rem;" value="${esc(task)}" placeholder="Ketik poin tugas ke-${tIdx + 1}..." oninput="updateCvExperienceTask('${exp.id}', ${tIdx}, this.value)">
                  <button type="button" class="btn-remove-item" style="padding: 5px 7px;" onclick="removeCvExperienceTask('${exp.id}', ${tIdx})" title="Hapus poin ini">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              `).join('')}

              <button type="button" style="width: 100%; padding: 6px; border-radius: 8px; background: rgba(16, 185, 129, 0.12); border: 1px dashed rgba(16, 185, 129, 0.4); color: #6ee7b7; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px;" onclick="addCvExperienceTask('${exp.id}')">
                <i class="fa-solid fa-plus"></i> Tambah Poin Tugas (+)
              </button>
            </div>
          </div>
        `;
      }).join('')}

      <button type="button" class="btn-add-repeater" onclick="addCvExperience()">
        <i class="fa-solid fa-plus"></i> Tambah Pengalaman Perusahaan Lain (+)
      </button>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer">
          <button type="button" class="btn-tab-step" onclick="switchCvTab('pendidikan')">
            <i class="fa-solid fa-arrow-left"></i> 3. Pendidikan
          </button>
          <button type="button" class="btn-tab-step primary" onclick="switchCvTab('skill')">
            Lanjut: 5. Keahlian & Sertifikat <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSectionSkill(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(245,158,11,0.25); color: #fde68a; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-award"></i>
            </span>
            5. Keahlian & Sertifikat
          </div>
          <div class="cv-tab-subtitle">Input per poin soft skill, hard skill operasional, dan sertifikat pelatihan.</div>
        </div>
      </div>

      <!-- 1. SOFT SKILL -->
      <div class="cv-repeater-card">
        <label style="font-size: 0.74rem; font-weight: 800; color: #60a5fa;">
          Soft Skill (${(cvData.softSkills || []).length} Poin)
        </label>
        ${(cvData.softSkills || []).map((item, idx) => `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 18px; font-size: 0.72rem; font-weight: 800; color: #64748b; text-align: center;">${idx + 1}.</span>
            <input type="text" class="cv-input-text" style="padding: 6px 8px; font-size: 0.78rem;" value="${esc(item)}" placeholder="Contoh: Disiplin & Tanggung Jawab" oninput="updateCvListItem('softSkills', ${idx}, this.value)">
            <button type="button" class="btn-remove-item" style="padding: 5px 7px;" onclick="removeCvListItem('softSkills', ${idx})">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('')}
        <button type="button" class="btn-add-repeater" style="padding: 6px; font-size: 0.72rem;" onclick="addCvListItem('softSkills')">
          <i class="fa-solid fa-plus"></i> Tambah Soft Skill (+)
        </button>
      </div>

      <!-- 2. HARD SKILL -->
      <div class="cv-repeater-card">
        <label style="font-size: 0.74rem; font-weight: 800; color: #34d399;">
          Hard Skill (${(cvData.hardSkills || []).length} Poin)
        </label>
        ${(cvData.hardSkills || []).map((item, idx) => `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 18px; font-size: 0.72rem; font-weight: 800; color: #64748b; text-align: center;">${idx + 1}.</span>
            <input type="text" class="cv-input-text" style="padding: 6px 8px; font-size: 0.78rem;" value="${esc(item)}" placeholder="Contoh: Mengoperasikan Forklift" oninput="updateCvListItem('hardSkills', ${idx}, this.value)">
            <button type="button" class="btn-remove-item" style="padding: 5px 7px;" onclick="removeCvListItem('hardSkills', ${idx})">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('')}
        <button type="button" style="width: 100%; padding: 6px; border-radius: 8px; background: rgba(16, 185, 129, 0.12); border: 1px dashed rgba(16, 185, 129, 0.4); color: #6ee7b7; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="addCvListItem('hardSkills')">
          <i class="fa-solid fa-plus"></i> Tambah Hard Skill (+)
        </button>
      </div>

      <!-- 3. SERTIFIKAT -->
      <div class="cv-repeater-card">
        <label style="font-size: 0.74rem; font-weight: 800; color: #fbbf24;">
          <i class="fa-solid fa-award"></i> Sertifikat & Pelatihan (${(cvData.certificates || []).length} Poin)
        </label>
        ${(cvData.certificates || []).map((item, idx) => `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 18px; font-size: 0.72rem; font-weight: 800; color: #64748b; text-align: center;">${idx + 1}.</span>
            <input type="text" class="cv-input-text" style="padding: 6px 8px; font-size: 0.78rem;" value="${esc(item)}" placeholder="Kosongkan jika tidak ada sertifikat..." oninput="updateCvListItem('certificates', ${idx}, this.value)">
            <button type="button" class="btn-remove-item" style="padding: 5px 7px;" onclick="removeCvListItem('certificates', ${idx})">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('')}
        <button type="button" style="width: 100%; padding: 6px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); border: 1px dashed rgba(245, 158, 11, 0.4); color: #fde68a; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="addCvListItem('certificates')">
          <i class="fa-solid fa-plus"></i> Tambah Sertifikat (+)
        </button>
      </div>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer">
          <button type="button" class="btn-tab-step" onclick="switchCvTab('pengalaman')">
            <i class="fa-solid fa-arrow-left"></i> 4. Pengalaman Kerja
          </button>
          <button type="button" class="btn-tab-step primary" onclick="switchCvTab('template')">
            Lanjut: 6. Desain Template <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSectionTemplate(showNavFooter = true) {
  return `
    <div class="cv-tab-card">
      <div class="cv-tab-header">
        <div>
          <div class="cv-tab-title">
            <span style="background: rgba(29, 78, 216, 0.25); color: #93c5fd; width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </span>
            6. Pilih Desain Template (1 - 8)
          </div>
          <div class="cv-tab-subtitle">Klik template untuk melihat pratinjau live secara langsung.</div>
        </div>
        <span style="font-size: 0.75rem; color: #cbd5e1;">
          Aktif: <strong id="cv-active-tpl-num" style="color: #60a5fa;">#${cvSelectedTemplate}</strong>
        </span>
      </div>

      <div class="cv-template-grid">
        ${CV_TEMPLATES_META.map(tpl => `
          <button type="button" class="cv-template-pill-btn ${cvSelectedTemplate === tpl.id ? 'active' : ''}" data-tpl="${tpl.id}" onclick="setCvTemplate(${tpl.id})">
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="tpl-num-badge" style="background: rgba(29, 78, 216, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4);">#${tpl.id}</span>
                <span style="font-weight: 700; font-size: 0.78rem;">${esc(tpl.badge)}</span>
              </div>
              <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 3px;">${esc(tpl.subtitle)}</div>
            </div>
            ${cvSelectedTemplate === tpl.id ? '<i class="fa-solid fa-circle-check" style="color: #60a5fa; font-size: 0.85rem; margin-top: 3px;"></i>' : ''}
          </button>
        `).join('')}
      </div>

      <button type="button" class="btn-mobile-preview-trigger" onclick="setMobileCvView('preview')" style="margin-top: 10px;">
        <i class="fa-solid fa-eye"></i> Lihat Pratinjau Desain Ini di Lembar A4
      </button>

      ${showNavFooter ? `
        <div class="cv-tab-nav-footer">
          <button type="button" class="btn-tab-step" onclick="switchCvTab('skill')">
            <i class="fa-solid fa-arrow-left"></i> 5. Keahlian & Sertifikat
          </button>
          <button type="button" class="btn-tab-step primary" onclick="printCv()" style="background: linear-gradient(135deg, #059669, #10b981); border-color: #34d399;">
            <i class="fa-solid fa-print"></i> Cetak / Simpan PDF
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCvStudioForm() {
  const container = document.getElementById('cv-editor-form-root');
  if (!container) return;

  if (cvActiveMenuTab === 'pribadi') {
    container.innerHTML = renderSectionPribadi(true);
  } else if (cvActiveMenuTab === 'tentang') {
    container.innerHTML = renderSectionTentang(true);
  } else if (cvActiveMenuTab === 'pendidikan') {
    container.innerHTML = renderSectionPendidikan(true);
  } else if (cvActiveMenuTab === 'pengalaman') {
    container.innerHTML = renderSectionPengalaman(true);
  } else if (cvActiveMenuTab === 'skill') {
    container.innerHTML = renderSectionSkill(true);
  } else if (cvActiveMenuTab === 'template') {
    container.innerHTML = renderSectionTemplate(true);
  } else {
    // 'semua'
    container.innerHTML = `
      <div style="font-size: 0.78rem; background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(14, 165, 233, 0.35); color: #7dd3fc; padding: 10px 14px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <span><i class="fa-solid fa-layer-group"></i> Menampilkan semua formulir secara berurutan tanpa tersembunyi.</span>
        <button type="button" onclick="switchCvTab('pribadi')" style="background: #0284c7; color: #fff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">
          Mode Tab Per Bagian
        </button>
      </div>
      ${renderSectionPribadi(false)}
      ${renderSectionTentang(false)}
      ${renderSectionPendidikan(false)}
      ${renderSectionPengalaman(false)}
      ${renderSectionSkill(false)}
      ${renderSectionTemplate(false)}
    `;
  }
}

// -------------------------------------------------------------
// USER ACTIONS & HANDLERS
// -------------------------------------------------------------
function setCvTemplate(id) {
  cvSelectedTemplate = id;
  updateCvPreview();
}

function setCvZoom(z) {
  cvZoom = Math.min(1.3, Math.max(0.35, +z.toFixed(2)));
  const sheet = document.getElementById('cv-live-a4-sheet');
  if (sheet) sheet.style.transform = `scale(${cvZoom})`;
  const zoomText = document.getElementById('cv-zoom-level-text');
  if (zoomText) zoomText.textContent = `${Math.round(cvZoom * 100)}%`;
}

function zoomCvIn() {
  setCvZoom(cvZoom + 0.1);
}

function zoomCvOut() {
  setCvZoom(cvZoom - 0.1);
}

function printCv() {
  const originalTitle = document.title;
  const cleanName = (cvData.fullName || 'CV').trim().replace(/[^a-zA-Z0-9 _-]/g, '');
  const cleanRole = (cvData.jobTitle || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 30);
  document.title = `CV_${cleanName}${cleanRole ? '_' + cleanRole : ''}`.replace(/\s+/g, '_');
  
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }, 80);
}

function resetCvToInitial() {
  cvData = JSON.parse(JSON.stringify(INITIAL_CV_DATA));
  renderCvStudioForm();
  updateCvPreview();
  showCvNotification('Data contoh berhasil dimuat ulang.');
}

function clearCvToSinglePoint() {
  cvData = JSON.parse(JSON.stringify(EMPTY_SINGLE_CV_DATA));
  renderCvStudioForm();
  updateCvPreview();
  showCvNotification('Formulir siap diisi dari 1 poin kosong.');
}

function applyCvPreset(idx) {
  const p = CV_SUMMARY_PRESETS[idx];
  if (!p) return;
  cvData.aboutMe = p.text;
  cvData.jobTitle = p.title;
  renderCvStudioForm();
  updateCvPreview();
}

function toggleCvAccordion(sec) {
  cvOpenSections[sec] = !cvOpenSections[sec];
  renderCvStudioForm();
}

function openAllCvSections() {
  cvOpenSections = { pribadi: true, tentang: true, pendidikan: true, pengalaman: true, skill: true };
  renderCvStudioForm();
}

function closeAllCvSections() {
  cvOpenSections = { pribadi: false, tentang: false, pendidikan: false, pengalaman: false, skill: false };
  renderCvStudioForm();
}

function updateCvField(field, val) {
  cvData[field] = val;
  updateCvPreview();
}

function handleCvPhotoUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    cvData.photo = reader.result;
    const prevImg = document.getElementById('cv-editor-photo-preview');
    if (prevImg) prevImg.src = reader.result;
    updateCvPreview();
  };
  reader.readAsDataURL(file);
}

function setCvPhotoBg(color) {
  cvData.photoBg = color;
  const prevBox = document.getElementById('cv-editor-photo-preview')?.parentElement;
  if (prevBox) prevBox.style.backgroundColor = color;
  updateCvPreview();
}

function setCvAvatar() {
  cvData.photo = DEFAULT_AVATAR_SVG;
  const prevImg = document.getElementById('cv-editor-photo-preview');
  if (prevImg) prevImg.src = DEFAULT_AVATAR_SVG;
  updateCvPreview();
}

// Pendidikan Handlers
function addCvEducation() {
  cvData.educations = cvData.educations || [];
  cvData.educations.push({
    id: `edu-${Date.now()}`,
    school: '',
    major: '',
    period: '',
    extra: ''
  });
  renderCvStudioForm();
  updateCvPreview();
}

function removeCvEducation(id) {
  if (cvData.educations.length <= 1) {
    cvData.educations = [{ id: `edu-${Date.now()}`, school: '', major: '', period: '', extra: '' }];
  } else {
    cvData.educations = cvData.educations.filter(e => e.id !== id);
  }
  renderCvStudioForm();
  updateCvPreview();
}

function updateCvEducation(id, field, val) {
  const item = cvData.educations.find(e => e.id === id);
  if (item) item[field] = val;
  updateCvPreview();
}

// Pengalaman Handlers
function addCvExperience() {
  cvData.experiences = cvData.experiences || [];
  cvData.experiences.push({
    id: `exp-${Date.now()}`,
    company: '',
    role: '',
    period: '',
    tasks: ['']
  });
  renderCvStudioForm();
  updateCvPreview();
}

function removeCvExperience(id) {
  if (cvData.experiences.length <= 1) {
    cvData.experiences = [{ id: `exp-${Date.now()}`, company: '', role: '', period: '', tasks: [''] }];
  } else {
    cvData.experiences = cvData.experiences.filter(e => e.id !== id);
  }
  renderCvStudioForm();
  updateCvPreview();
}

function updateCvExperience(id, field, val) {
  const item = cvData.experiences.find(e => e.id === id);
  if (item) item[field] = val;
  updateCvPreview();
}

function addCvExperienceTask(expId) {
  const item = cvData.experiences.find(e => e.id === expId);
  if (item) {
    if (!Array.isArray(item.tasks)) item.tasks = cvToLines(item.tasks);
    item.tasks.push('');
  }
  renderCvStudioForm();
  updateCvPreview();
}

function removeCvExperienceTask(expId, idx) {
  const item = cvData.experiences.find(e => e.id === expId);
  if (item) {
    if (!Array.isArray(item.tasks)) item.tasks = cvToLines(item.tasks);
    if (item.tasks.length <= 1) {
      item.tasks = [''];
    } else {
      item.tasks.splice(idx, 1);
    }
  }
  renderCvStudioForm();
  updateCvPreview();
}

function updateCvExperienceTask(expId, idx, val) {
  const item = cvData.experiences.find(e => e.id === expId);
  if (item) {
    if (!Array.isArray(item.tasks)) item.tasks = cvToLines(item.tasks);
    item.tasks[idx] = val;
  }
  updateCvPreview();
}

// List Handlers (softSkills, hardSkills, certificates)
function addCvListItem(field) {
  if (!Array.isArray(cvData[field])) cvData[field] = cvToLines(cvData[field]);
  cvData[field].push('');
  renderCvStudioForm();
  updateCvPreview();
}

function removeCvListItem(field, idx) {
  if (!Array.isArray(cvData[field])) cvData[field] = cvToLines(cvData[field]);
  if (cvData[field].length <= 1) {
    cvData[field] = [''];
  } else {
    cvData[field].splice(idx, 1);
  }
  renderCvStudioForm();
  updateCvPreview();
}

function updateCvListItem(field, idx, val) {
  if (!Array.isArray(cvData[field])) cvData[field] = cvToLines(cvData[field]);
  cvData[field][idx] = val;
  updateCvPreview();
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
function initCvStudio() {
  if (!isCvStudioInitialized) {
    isCvStudioInitialized = true;
    switchCvTab(cvActiveMenuTab || 'pribadi');
    if (window.innerWidth <= 900) {
      setMobileCvView('form');
      autoFitMobileZoom();
    } else {
      updateCvPreview();
    }

    // Attach resize listener for mobile screen orientation/size changes
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900 && mobileCvView === 'preview') {
        autoFitMobileZoom();
      }
    });
  } else {
    if (window.innerWidth <= 900 && mobileCvView === 'preview') {
      autoFitMobileZoom();
    }
    updateCvPreview();
  }
}

// Expose globals for HTML onclick bindings
window.initCvStudio = initCvStudio;
window.setMobileCvView = setMobileCvView;
window.autoFitMobileZoom = autoFitMobileZoom;
window.switchCvTab = switchCvTab;
window.setCvTemplate = setCvTemplate;
window.setCvZoom = setCvZoom;
window.zoomCvIn = zoomCvIn;
window.zoomCvOut = zoomCvOut;
window.printCv = printCv;
window.resetCvToInitial = resetCvToInitial;
window.clearCvToSinglePoint = clearCvToSinglePoint;
window.applyCvPreset = applyCvPreset;
window.toggleCvAccordion = toggleCvAccordion;
window.openAllCvSections = openAllCvSections;
window.closeAllCvSections = closeAllCvSections;
window.autoFitToOnePage = autoFitToOnePage;
window.updateCvField = updateCvField;
window.handleCvPhotoUpload = handleCvPhotoUpload;
window.setCvPhotoBg = setCvPhotoBg;
window.setCvAvatar = setCvAvatar;
window.addCvEducation = addCvEducation;
window.removeCvEducation = removeCvEducation;
window.updateCvEducation = updateCvEducation;
window.addCvExperience = addCvExperience;
window.removeCvExperience = removeCvExperience;
window.updateCvExperience = updateCvExperience;
window.addCvExperienceTask = addCvExperienceTask;
window.removeCvExperienceTask = removeCvExperienceTask;
window.updateCvExperienceTask = updateCvExperienceTask;
window.addCvListItem = addCvListItem;
window.removeCvListItem = removeCvListItem;
window.updateCvListItem = updateCvListItem;
