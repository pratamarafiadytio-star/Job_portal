/**
 * Ravenza CV Studio - 8 Templates Generator for Admin Panel
 * Ported from React to high-performance Vanilla JS.
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

// STATE MANAGEMENT
let cvData = JSON.parse(JSON.stringify(INITIAL_CV_DATA));
let cvSelectedTemplate = 8;
let cvZoom = 0.75;
let cvActiveSection = 'pengalaman';
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
// RENDERERS FOR ALL 8 TEMPLATES
// -------------------------------------------------------------

// TEMPLATE 1: Coklat & Pita
function renderTemplate1() {
  const softList = cvToLines(cvData.softSkills).map(cvToShortSkill);
  const hardList = cvToLines(cvData.hardSkills).map(cvToShortSkill);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-1">
      <!-- Top-Right Decorative Diagonal Ribbon -->
      <div class="cv-tpl-1-ribbon-tr">
        <div style="position: absolute; top: -24px; right: -56px; width: 192px; height: 20px; background: #4a4238; transform: rotate(45deg); transform-origin: center;"></div>
        <div style="position: absolute; top: -8px; right: -56px; width: 192px; height: 16px; background: #eab308; transform: rotate(45deg); transform-origin: center;"></div>
      </div>

      <!-- Bottom-Left Decorative Diagonal Ribbon -->
      <div class="cv-tpl-1-ribbon-bl">
        <div style="position: absolute; bottom: -24px; left: -56px; width: 192px; height: 20px; background: #6b6257; transform: rotate(45deg); transform-origin: center;"></div>
        <div style="position: absolute; bottom: -8px; left: -56px; width: 192px; height: 16px; background: #eab308; transform: rotate(45deg); transform-origin: center;"></div>
      </div>

      <!-- Left Column (Dark Brown) -->
      <div class="cv-tpl-1-left">
        <!-- Circular Photo -->
        <div style="width: 176px; height: 176px; border-radius: 50%; border: 6px solid #d6c7bc; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); margin-bottom: 32px; flex-shrink: 0; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- KONTAK -->
        <div style="width: 100%; margin-bottom: 28px;">
          <div class="cv-tpl-1-pill-hdr">KONTAK</div>
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; padding: 0 4px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">
                <i class="fa-solid fa-phone"></i>
              </span>
              <span style="word-break: break-all;">${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <span style="word-break: break-all;">${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #ffffff; color: #362f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; margin-top: 2px;">
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <span style="line-height: 1.4;">${esc(cvData.address)}</span>
            </div>
          </div>
        </div>

        <!-- PENDIDIKAN -->
        <div style="width: 100%; margin-bottom: 28px;">
          <div class="cv-tpl-1-pill-hdr">PENDIDIKAN</div>
          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px; padding: 0 8px;">
            ${[...getDisplayedEducations()].reverse().map(edu => `
              <div>
                <div style="font-weight: 800; color: #ffffff; letter-spacing: 0.03em;">${esc(edu.period)}</div>
                <div style="color: #e7e5e4; font-weight: 600;">${esc(edu.school)}</div>
                ${edu.major ? `<div style="color: #d6d3d1; font-size: 12px;">${esc(edu.major)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- KEMAMPUAN -->
        <div style="width: 100%; padding-bottom: 24px;">
          <div class="cv-tpl-1-pill-hdr">KEMAMPUAN</div>
          <div style="padding: 0 8px; font-size: 13px; display: flex; flex-direction: column; gap: 16px;">
            <div>
              <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #e7e5e4; margin-bottom: 6px; font-size: 12px;">SOFT SKILL</div>
              <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 4px; color: #f5f5f4;">
                ${softList.map(item => `<li>${esc(item)}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #e7e5e4; margin-bottom: 6px; font-size: 12px;">HARD SKILL</div>
              <ul style="list-style: disc; padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 4px; color: #f5f5f4;">
                ${hardList.map(item => `<li>${esc(item)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="cv-tpl-1-right">
        <!-- Header -->
        <div style="margin-bottom: 32px; padding-right: 24px;">
          <h1 style="font-size: 30px; font-weight: 900; letter-spacing: 0.05em; color: #5c4938; text-transform: uppercase; margin: 0 0 8px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 16px; color: #655446; font-weight: 600; margin: 0; line-height: 1.4;">
            ${esc(cvData.jobTitle)}
          </p>
        </div>

        <!-- TENTANG SAYA -->
        <div style="margin-bottom: 28px;">
          <h2 style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 8px;">
            TENTANG SAYA
          </h2>
          <p style="font-size: 13.5px; line-height: 1.6; color: #4b4239; text-align: justify; margin: 0;">
            ${esc(cvData.aboutMe)}
          </p>
        </div>

        <!-- PENGALAMAN KERJA -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 12px;">
            PENGALAMAN KERJA
          </h2>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${getDisplayedExperiences().map(exp => `
              <div style="font-size: 13.5px;">
                <div style="font-weight: 800; color: #4b4239; margin-bottom: 6px;">
                  ${esc(exp.company || 'Nama Perusahaan')}
                  <span style="font-weight: 500; color: #655446;"> | ${esc(exp.period)} | ${esc(exp.role)}</span>
                </div>
                <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; color: #4b4239; line-height: 1.55;">
                  ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SERTIFIKAT -->
        ${certList.length > 0 ? `
          <div>
            <h2 style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4938; margin: 0 0 8px;">
              SERTIFIKAT DAN PELATIHAN
            </h2>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: 13.5px; color: #4b4239;">
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
          <div style="padding: 24px; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 160px; height: 160px; border-radius: 50%; border: 2px solid #525252; overflow: hidden; margin-bottom: 16px; background-color: ${esc(cvData.photoBg)};">
              <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 14px; text-transform: uppercase; margin: 8px 0 0;">KONTAK</h3>
          </div>
          <hr style="border: none; border-top: 2.5px solid #000000; margin: 0;">

          <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="fa-solid fa-phone" style="width: 16px;"></i>
              <span style="word-break: break-all;">${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="fa-solid fa-envelope" style="width: 16px;"></i>
              <span style="word-break: break-all;">${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <i class="fa-solid fa-location-dot" style="width: 16px; margin-top: 2px;"></i>
              <span style="line-height: 1.4;">${esc(cvData.address)}</span>
            </div>
          </div>

          <div style="text-align: center; padding: 6px 0; margin-top: 8px;">
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 14px; text-transform: uppercase; margin: 0;">PENDIDIKAN</h3>
          </div>
          <hr style="border: none; border-top: 2.5px solid #000000; margin: 0;">

          <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
            ${[...getDisplayedEducations()].reverse().map(edu => `
              <div>
                <div style="font-weight: 600; font-size: 12px; color: #404040;">${esc(edu.period)}</div>
                <div style="font-weight: 800;">${esc(edu.school)}</div>
                ${edu.major ? `<div style="font-size: 12px; color: #404040;">${esc(edu.major)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; padding: 6px 0; margin-top: 8px;">
            <h3 style="font-weight: 800; letter-spacing: 0.05em; font-size: 14px; text-transform: uppercase; margin: 0;">KEMAMPUAN</h3>
          </div>
          <hr style="border: none; border-top: 2.5px solid #000000; margin: 0;">

          <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; font-size: 13px; flex: 1;">
            <div>
              <div style="font-weight: 800; margin-bottom: 4px;">Soft Skill</div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 3px;">
                ${softList.map(s => `<li>${esc(s)}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div style="font-weight: 800; margin-bottom: 4px;">Hard Skill</div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 3px;">
                ${hardList.map(h => `<li>${esc(h)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="cv-tpl-2-right">
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; margin: 0 0 4px; line-height: 1.15;">
              ${esc(cvData.fullName)}
            </h1>
            <p style="font-size: 15px; color: #262626; margin: 0;">${esc(cvData.jobTitle)}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 15px; font-weight: 800; margin: 0 0 8px;">Tentang saya</h2>
            <p style="font-size: 13px; line-height: 1.6; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 15px; font-weight: 800; margin: 0 0 12px;">Pengalaman Kerja</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${getDisplayedExperiences().map(exp => `
                <div style="font-size: 13px;">
                  <div style="font-weight: 600; color: #404040; margin-bottom: 2px;">${esc(exp.period)}</div>
                  <div style="font-weight: 900; font-size: 14.5px; margin-bottom: 6px;">
                    ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)}
                  </div>
                  <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; line-height: 1.55;">
                    ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          ${certList.length > 0 ? `
            <div>
              <h2 style="font-size: 15px; font-weight: 800; margin: 0 0 6px;">Sertifikat & Pelatihan</h2>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
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
      <!-- Top-Right Decorative Blue & Tan Wave SVG -->
      <svg style="position: absolute; top: 0; right: 0; width: 176px; height: 176px; pointer-events: none;" viewBox="0 0 200 200">
        <path d="M40,0 C110,20 175,85 200,160 L200,0 Z" fill="#b08d6a" opacity="0.85" />
        <path d="M70,0 C130,25 180,80 200,135 L200,0 Z" fill="#1d70b8" />
        <path d="M110,0 C150,20 185,55 200,95 L200,0 Z" fill="#004b87" />
      </svg>

      <!-- Bottom-Left Decorative Blue & Tan Wave SVG -->
      <svg style="position: absolute; bottom: 0; left: 0; width: 176px; height: 176px; pointer-events: none;" viewBox="0 0 200 200">
        <path d="M0,40 C25,115 85,175 160,200 L0,200 Z" fill="#b08d6a" opacity="0.85" />
        <path d="M0,70 C25,130 80,180 135,200 L0,200 Z" fill="#1d70b8" />
        <path d="M0,110 C20,150 55,185 95,200 L0,200 Z" fill="#004b87" />
      </svg>

      <!-- Header -->
      <div style="display: flex; gap: 28px; align-items: flex-start; margin-bottom: 28px; position: relative; z-index: 10;">
        <div style="width: 160px; height: 192px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; box-shadow: 0 2px 6px rgba(0,0,0,0.06); background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; padding-top: 4px;">
          <h1 style="font-size: 30px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; margin: 0 0 4px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 16px; color: #262626; margin: 0 0 20px; font-weight: 600;">${esc(cvData.jobTitle)}</p>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14.5px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px;">
                <i class="fa-solid fa-phone"></i>
              </span>
              <span>${esc(cvData.phone)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px;">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <span>${esc(cvData.email)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #005a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px;">
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <span>${esc(cvData.address)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 24px; position: relative; z-index: 10;">
        <h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3px solid #005a9e; padding-bottom: 4px; margin: 0 0 8px;">
          TENTANG SAYA
        </h2>
        <p style="font-size: 13.5px; line-height: 1.6; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 24px; position: relative; z-index: 10;">
        <h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3px solid #005a9e; padding-bottom: 4px; margin: 0 0 8px;">
          PENDIDIKAN
        </h2>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px;">
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
      <div style="margin-bottom: 24px; position: relative; z-index: 10;">
        <h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3px solid #005a9e; padding-bottom: 4px; margin: 0 0 10px;">
          PENGALAMAN KERJA
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${getDisplayedExperiences().map(exp => `
            <div style="font-size: 13.5px;">
              <div style="font-weight: 900; margin-bottom: 4px;">
                ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)} | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; line-height: 1.55;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 24px; position: relative; z-index: 10;">
          <h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3px solid #005a9e; padding-bottom: 4px; margin: 0 0 8px;">
            SERTIFIKAT DAN PELATIHAN
          </h2>
          <ul style="list-style: disc; padding-left: 20px; margin: 0; font-size: 13.5px; display: flex; flex-direction: column; gap: 4px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div style="position: relative; z-index: 10; padding-bottom: 30px;">
        <h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 3px solid #005a9e; padding-bottom: 4px; margin: 0 0 12px;">
          KEMAMPUAN
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; font-size: 13.5px;">
          <div>
            <h3 style="font-weight: 900; font-size: 15px; margin: 0 0 6px;">Soft Skill</h3>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px;">
              ${softList.map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 style="font-weight: 900; font-size: 15px; margin: 0 0 6px;">Hard Skill</h3>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px;">
              ${hardList.map(h => `<li>${esc(h)}</li>`).join('')}
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
  const combinedSkills = [...hardList, ...softList].slice(0, 7);

  return `
    <div class="cv-tpl-4">
      <!-- Three dots top right -->
      <div style="position: absolute; top: 24px; right: 40px; display: flex; gap: 12px; z-index: 20;">
        <span style="width: 16px; height: 16px; border-radius: 50%; background: #000000;"></span>
        <span style="width: 16px; height: 16px; border-radius: 50%; background: #000000;"></span>
        <span style="width: 16px; height: 16px; border-radius: 50%; background: #000000;"></span>
      </div>

      <!-- Right Edge Decorative Grey Bar -->
      <div style="position: absolute; top: 20px; bottom: 20px; right: 0; width: 16px; background: #999999; border-top-left-radius: 16px; border-bottom-left-radius: 16px;"></div>

      <!-- Left Column -->
      <div class="cv-tpl-4-left">
        <div style="height: 56px; width: 100%; background: #999999; border-top-right-radius: 42px;"></div>

        <div style="display: flex; justify-content: center; margin-top: -24px; margin-bottom: 12px; z-index: 20; padding: 0 16px;">
          <div style="width: 192px; height: 192px; border-radius: 50%; border: 3px solid #000000; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: ${esc(cvData.photoBg)};">
            <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>

        <div style="flex: 1; background: #999999; border-bottom-right-radius: 48px; padding: 32px 28px 40px; display: flex; flex-direction: column; gap: 32px;">
          <!-- KONTAK -->
          <div>
            <h3 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; margin: 0 0 12px;">
              KONTAK
            </h3>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13.5px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-phone" style="width: 16px;"></i>
                <span style="word-break: break-all;">${esc(cvData.phone)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-envelope" style="width: 16px;"></i>
                <span style="word-break: break-all;">${esc(cvData.email)}</span>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <i class="fa-solid fa-location-dot" style="width: 16px; margin-top: 2px;"></i>
                <span style="line-height: 1.35;">${esc(cvData.address)}</span>
              </div>
            </div>
          </div>

          <!-- PENDIDIKAN -->
          <div>
            <h3 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; margin: 0 0 12px;">
              PENDIDIKAN
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13.5px;">
              ${getDisplayedEducations().map(edu => `
                <div>
                  <div style="font-weight: 800;">${esc(edu.period)}</div>
                  <div style="text-transform: uppercase; font-weight: 600; margin-top: 2px;">${esc(edu.school)}</div>
                  ${edu.major ? `<div>${esc(edu.major)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KEAHLIAN -->
          <div>
            <h3 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; margin: 0 0 12px;">
              KEAHLIAN
            </h3>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13.5px;">
              ${combinedSkills.map(sk => `<li>${esc(sk)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="cv-tpl-4-right">
        <div style="margin-bottom: 36px;">
          <h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #231815; margin: 0 0 8px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase; color: #231815; font-weight: 600; margin: 0;">
            ${esc(cvData.jobTitle)}
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; margin: 0 0 12px;">
            TENTANG SAYA
          </h2>
          <p style="font-size: 13.5px; line-height: 1.6; text-align: justify; margin: 0;">
            ${esc(cvData.aboutMe)}
          </p>
        </div>

        <div>
          <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; margin: 0 0 16px;">
            PENGALAMAN
          </h2>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${getDisplayedExperiences().map(exp => `
              <div style="font-size: 13.5px;">
                <div style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 6px;">
                  ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.period)} | ${esc(exp.role)}
                </div>
                <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; line-height: 1.55;">
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
  const allSkills = [...softList, ...hardList];

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
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 16px;">
            <div style="flex: 1;">
              <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 4px solid #000000; display: inline-block; padding-bottom: 2px; margin: 0 0 28px;">
                CURRICULUM VITAE
              </h1>

              <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 12px;">
                DATA PRIBADI
              </h2>

              <table style="width: 100%; font-size: 15px; line-height: 1.4; border-collapse: collapse;">
                <tbody>
                  ${biodataRows.map(row => `
                    <tr style="vertical-align: top;">
                      <td style="padding: 2px 0; width: 190px; font-weight: 500;">${esc(row.label)}</td>
                      <td style="padding: 2px 0; width: 16px;">:</td>
                      <td style="padding: 2px 0;">${esc(row.value)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Top Right Photo -->
            <div style="width: 176px; height: 208px; overflow: hidden; border: 1px solid #737373; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1); background-color: ${esc(cvData.photoBg)};">
              <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>

          <!-- PENDIDIKAN -->
          <div style="margin: 20px 0;">
            <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 8px;">
              PENDIDIKAN
            </h2>
            <div style="max-width: 480px; display: flex; flex-direction: column; gap: 4px; font-size: 15px;">
              ${[...getDisplayedEducations()].reverse().map(edu => `
                <div style="display: grid; grid-template-columns: 1fr 1fr;">
                  <span>${esc(edu.school)}</span>
                  <span>${esc(edu.period)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KEMAMPUAN -->
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 8px;">
              KEMAMPUAN
            </h2>
            <ul style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 32px; row-gap: 4px; list-style: disc; padding-left: 20px; font-size: 15px; max-width: 650px; margin: 0;">
              ${allSkills.map(sk => `<li>${esc(sk)}</li>`).join('')}
            </ul>
          </div>

          <!-- PENGALAMAN KERJA -->
          <div>
            <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 8px;">
              PENGALAMAN KERJA
            </h2>
            <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 15px;">
              ${getDisplayedExperiences().map(exp => `
                <li>
                  <span style="font-weight: 600;">${esc(exp.company || 'Nama Perusahaan')}</span> | Sebagai ${esc(exp.role)} | ${esc(exp.period)}
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
      <div style="display: flex; align-items: flex-start; gap: 32px; margin-bottom: 24px;">
        <div style="width: 128px; height: 160px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; padding-top: 8px;">
          <h1 style="font-size: 30px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Inter', sans-serif; margin: 0 0 4px; line-height: 1.15;">
            ${esc(cvData.fullName)}
          </h1>
          <p style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #262626; margin: 0 0 12px; font-family: 'Times New Roman', serif;">
            ${esc(cvData.jobTitle)}
          </p>
          <div style="font-size: 13px; color: #171717; line-height: 1.6;">
            <span>✆ ${esc(cvData.phone)}</span>
            <span style="margin: 0 8px;">|</span>
            <span style="text-decoration: underline; color: #1e40af;">✉ ${esc(cvData.email)}</span>
            <span style="margin: 0 8px;">|</span>
            <span>⌂ ${esc(cvData.address)}</span>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-6-bar">TENTANG SAYA</div>
        <p style="font-size: 13px; line-height: 1.6; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-6-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <div style="font-weight: 800;">${esc(edu.school)} | ${esc(edu.period)}</div>
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN KERJA -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-6-bar">PENGALAMAN KERJA</div>
        <ol style="list-style: decimal; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          ${getDisplayedExperiences().map(exp => `
            <li style="padding-left: 4px;">
              <div style="font-weight: 800; margin-bottom: 4px;">
                ${esc(exp.company || 'Nama Perusahaan')} | ${esc(exp.role)} | <span style="font-weight: normal;">${esc(exp.period)}</span>
              </div>
              <ul style="list-style: disc; padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.55;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </li>
          `).join('')}
        </ol>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div class="cv-tpl-6-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 24px; margin: 0; font-size: 13px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div>
        <div class="cv-tpl-6-bar">KEMAMPUAN</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 13px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">HARD SKILL</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.map(h => `<li>${esc(h)}</li>`).join('')}
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
      <div style="text-align: center; margin-bottom: 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 30px; font-weight: 400; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 6px;">
          ${esc(cvData.fullName)}
        </h1>
        <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #171717; margin: 0 0 4px; font-weight: 600;">
          ${esc(cvData.jobTitle)}
        </p>
        <p style="font-size: 12px; color: #262626; margin: 0;">
          ${esc(cvData.phone)} | ${esc(cvData.email)} | ${esc(cvData.address)}
        </p>
      </div>

      <!-- PROFIL SAYA -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-7-bar">PROFIL SAYA</div>
        <p style="font-size: 13px; line-height: 1.6; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-7-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <span style="font-weight: 800;">${esc(edu.school)}</span> | ${esc(edu.period)}
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN KERJA -->
      <div style="margin-bottom: 16px;">
        <div class="cv-tpl-7-bar">PENGALAMAN KERJA</div>
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
          ${getDisplayedExperiences().map(exp => `
            <div>
              <div style="margin-bottom: 4px;">
                <span style="font-weight: 800;">${esc(exp.company || 'Nama Perusahaan')}</span> |
                <span style="font-weight: 800;">${esc(exp.role)}</span> | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.55; text-align: justify;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div class="cv-tpl-7-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 24px; margin: 0; font-size: 13px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEAHLIAN -->
      <div>
        <div class="cv-tpl-7-bar">KEAHLIAN</div>
        <div style="font-size: 13px; display: flex; flex-direction: column; gap: 10px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; margin-bottom: 4px;">Hard Skill</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TEMPLATE 8: ATS Modern Garis Hitam & Foto Kiri
function renderTemplate8() {
  const softList = cvToLines(cvData.softSkills);
  const hardList = cvToLines(cvData.hardSkills);
  const certList = cvToLines(cvData.certificates);

  return `
    <div class="cv-tpl-8">
      <!-- Header -->
      <div style="display: flex; gap: 20px; align-items: stretch; margin-bottom: 16px;">
        <div style="width: 112px; height: 144px; overflow: hidden; flex-shrink: 0; border: 1px solid #d4d4d4; background-color: ${esc(cvData.photoBg)};">
          <img src="${cvData.photo}" alt="${esc(cvData.fullName)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="padding-top: 4px; font-family: 'Inter', sans-serif;">
            <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px; line-height: 1.15;">
              ${esc(cvData.fullName)}
            </h1>
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #262626; margin: 0; font-weight: 600;">
              ${esc(cvData.jobTitle)}
            </p>
          </div>

          <!-- Contact bar at bottom of photo -->
          <div style="border-bottom: 1px solid #000000; padding-bottom: 4px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; font-size: 12px; gap: 8px;">
            <span>✆ ${esc(cvData.phone)}</span>
            <span style="color: #1e40af; text-decoration: underline;">✉ ${esc(cvData.email)}</span>
            <span>⌂ ${esc(cvData.address)}</span>
          </div>
        </div>
      </div>

      <!-- TENTANG SAYA -->
      <div style="margin-bottom: 14px;">
        <div class="cv-tpl-8-bar">TENTANG SAYA</div>
        <p style="font-size: 13px; line-height: 1.6; text-align: justify; margin: 0;">${esc(cvData.aboutMe)}</p>
      </div>

      <!-- PENDIDIKAN -->
      <div style="margin-bottom: 14px;">
        <div class="cv-tpl-8-bar">PENDIDIKAN</div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
          ${getDisplayedEducations().map(edu => `
            <div>
              <span style="font-weight: 800;">${esc(edu.school)}</span> | ${esc(edu.period)}
              ${(edu.major || edu.extra) ? `<div>${[edu.major, edu.extra].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENGALAMAN -->
      <div style="margin-bottom: 14px;">
        <div class="cv-tpl-8-bar">PENGALAMAN</div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          ${getDisplayedExperiences().map(exp => `
            <div>
              <div style="margin-bottom: 4px;">
                <span style="font-weight: 800;">${esc(exp.company || 'Nama Perusahaan')}</span> |
                <span style="font-weight: 800;">${esc(exp.role)}</span> | ${esc(exp.period)}
              </div>
              <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.55; text-align: justify;">
                ${cvToLines(exp.tasks).map(t => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SERTIFIKAT -->
      ${certList.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <div class="cv-tpl-8-bar">SERTIFIKAT DAN PELATIHAN</div>
          <ul style="list-style: disc; padding-left: 24px; margin: 0; font-size: 13px; display: flex; flex-direction: column; gap: 2px;">
            ${certList.map(c => `<li>${esc(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- KEMAMPUAN -->
      <div>
        <div class="cv-tpl-8-bar">KEMAMPUAN</div>
        <div style="font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
          <div>
            <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">SOFT SKILL</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${softList.map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-weight: 800; margin-bottom: 2px;">Hard Skill</div>
            <ul style="list-style: disc; padding-left: 24px; margin: 0; display: flex; flex-direction: column; gap: 2px;">
              ${hardList.map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// LIVE PREVIEW DISPATCHER
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

// -------------------------------------------------------------
// EDITOR FORM BUILDER & SYNCHRONIZATION
// -------------------------------------------------------------
function renderCvStudioForm() {
  const container = document.getElementById('cv-editor-form-root');
  if (!container) return;

  container.innerHTML = `
    <!-- 1. PILIH TEMPLATE (1 - 8) -->
    <div class="cv-template-selector-box">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #818cf8; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Pilih Desain Template (1 - 8)
        </span>
        <span style="font-size: 0.74rem; color: #94a3b8;">
          Aktif: <strong id="cv-active-tpl-num" style="color: #ffffff;">#${cvSelectedTemplate}</strong>
        </span>
      </div>

      <div class="cv-template-grid">
        ${CV_TEMPLATES_META.map(tpl => `
          <button type="button" class="cv-template-pill-btn ${cvSelectedTemplate === tpl.id ? 'active' : ''}" data-tpl="${tpl.id}" onclick="setCvTemplate(${tpl.id})">
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="tpl-num-badge" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4);">#${tpl.id}</span>
                <span style="font-weight: 700; font-size: 0.78rem;">${esc(tpl.badge)}</span>
              </div>
              <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 3px;">${esc(tpl.subtitle)}</div>
            </div>
            ${cvSelectedTemplate === tpl.id ? '<i class="fa-solid fa-circle-check" style="color: #818cf8; font-size: 0.85rem; margin-top: 3px;"></i>' : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- ACCORDION 1: FOTO & DATA PRIBADI -->
    <div class="cv-accordion-box">
      <button type="button" class="cv-accordion-toggle" onclick="toggleCvAccordion('pribadi')">
        <span style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-user" style="color: #818cf8;"></i> 1. Foto & Data Pribadi
        </span>
        <i class="fa-solid ${cvActiveSection === 'pribadi' ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: #94a3b8; font-size: 0.8rem;"></i>
      </button>

      <div class="cv-accordion-content" style="display: ${cvActiveSection === 'pribadi' ? 'flex' : 'none'};">
        ${cvSelectedTemplate !== 7 ? `
          <div style="display: flex; align-items: center; gap: 14px; background: #0b1120; padding: 12px; border-radius: 12px; border: 1px solid #1e293b;">
            <div style="width: 60px; height: 76px; border-radius: 8px; overflow: hidden; border: 1.5px solid #334155; flex-shrink: 0; background-color: ${esc(cvData.photoBg)};">
              <img id="cv-editor-photo-preview" src="${cvData.photo}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <input type="file" id="cv-file-upload-input" accept="image/*" style="display: none;" onchange="handleCvPhotoUpload(event)">
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm" onclick="document.getElementById('cv-file-upload-input').click()" style="background: #4f46e5; color: #fff; font-size: 0.72rem; padding: 5px 10px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer;">
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
      </div>
    </div>

    <!-- ACCORDION 2: TENTANG SAYA -->
    <div class="cv-accordion-box">
      <button type="button" class="cv-accordion-toggle" onclick="toggleCvAccordion('tentang')">
        <span style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-file-lines" style="color: #818cf8;"></i> 2. Tentang Saya (Profil Singkat)
        </span>
        <i class="fa-solid ${cvActiveSection === 'tentang' ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: #94a3b8; font-size: 0.8rem;"></i>
      </button>

      <div class="cv-accordion-content" style="display: ${cvActiveSection === 'tentang' ? 'flex' : 'none'};">
        <div>
          <span style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 6px;">Pilih Cepat Contoh:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${CV_SUMMARY_PRESETS.map((preset, i) => `
              <button type="button" onclick="applyCvPreset(${i})" style="background: rgba(30, 27, 75, 0.8); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; font-size: 0.72rem; padding: 4px 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                + ${esc(preset.label)}
              </button>
            `).join('')}
          </div>
        </div>

        <textarea class="cv-input-textarea" rows="4" placeholder="Tuliskan ringkasan profil singkat..." oninput="updateCvField('aboutMe', this.value)">${esc(cvData.aboutMe)}</textarea>
      </div>
    </div>

    <!-- ACCORDION 3: PENDIDIKAN (PER POIN) -->
    <div class="cv-accordion-box">
      <button type="button" class="cv-accordion-toggle" onclick="toggleCvAccordion('pendidikan')">
        <span style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-graduation-cap" style="color: #818cf8;"></i> 3. Pendidikan (${(cvData.educations || []).length} Poin)
        </span>
        <i class="fa-solid ${cvActiveSection === 'pendidikan' ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: #94a3b8; font-size: 0.8rem;"></i>
      </button>

      <div class="cv-accordion-content" style="display: ${cvActiveSection === 'pendidikan' ? 'flex' : 'none'};">
        <p style="font-size: 0.72rem; color: #94a3b8; margin: 0 0 6px;">
          Kalau cuma mau 1 jenjang (misal SMK saja), cukup isi 1 kotak. Jika ada jenjang lain, klik <strong>+ Tambah Pendidikan</strong>.
        </p>

        ${(cvData.educations || []).map((edu, idx) => `
          <div class="cv-repeater-card">
            <div class="cv-repeater-card-header">
              <span style="font-size: 0.75rem; font-weight: 800; color: #818cf8; display: flex; align-items: center; gap: 6px;">
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
      </div>
    </div>

    <!-- ACCORDION 4: PENGALAMAN KERJA & POIN JOBDESK DINAMIS -->
    <div class="cv-accordion-box">
      <button type="button" class="cv-accordion-toggle" onclick="toggleCvAccordion('pengalaman')">
        <span style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-briefcase" style="color: #818cf8;"></i> 4. Pengalaman Kerja (${(cvData.experiences || []).length} Perusahaan)
        </span>
        <i class="fa-solid ${cvActiveSection === 'pengalaman' ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: #94a3b8; font-size: 0.8rem;"></i>
      </button>

      <div class="cv-accordion-content" style="display: ${cvActiveSection === 'pengalaman' ? 'flex' : 'none'};">
        <p style="font-size: 0.72rem; color: #94a3b8; margin: 0 0 6px;">
          Setiap pengalaman kerja dan tugasnya dibuat <strong>per poin</strong>. Tambah bullet baru dengan tombol <strong>+ Tambah Poin Tugas</strong>.
        </p>

        ${(cvData.experiences || []).map((exp, idx) => {
          const tasks = Array.isArray(exp.tasks) ? exp.tasks : cvToLines(exp.tasks);
          return `
            <div class="cv-repeater-card">
              <div class="cv-repeater-card-header">
                <span style="font-size: 0.75rem; font-weight: 800; color: #818cf8; display: flex; align-items: center; gap: 6px;">
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
      </div>
    </div>

    <!-- ACCORDION 5: KEAHLIAN & SERTIFIKAT (PER POIN) -->
    <div class="cv-accordion-box">
      <button type="button" class="cv-accordion-toggle" onclick="toggleCvAccordion('skill')">
        <span style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-wrench" style="color: #818cf8;"></i> 5. Keahlian & Sertifikat (Per Poin)
        </span>
        <i class="fa-solid ${cvActiveSection === 'skill' ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: #94a3b8; font-size: 0.8rem;"></i>
      </button>

      <div class="cv-accordion-content" style="display: ${cvActiveSection === 'skill' ? 'flex' : 'none'};">
        <!-- 1. SOFT SKILL -->
        <div class="cv-repeater-card">
          <label style="font-size: 0.74rem; font-weight: 800; color: #818cf8;">
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
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// USER ACTIONS & HANDLERS
// -------------------------------------------------------------
function setCvTemplate(id) {
  cvSelectedTemplate = id;
  updateCvPreview();
}

function setCvZoom(z) {
  cvZoom = Math.min(1.2, Math.max(0.5, +z.toFixed(2)));
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
  window.print();
}

function resetCvToInitial() {
  cvData = JSON.parse(JSON.stringify(INITIAL_CV_DATA));
  renderCvStudioForm();
  updateCvPreview();
}

function clearCvToSinglePoint() {
  cvData = JSON.parse(JSON.stringify(EMPTY_SINGLE_CV_DATA));
  renderCvStudioForm();
  updateCvPreview();
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
  cvActiveSection = (cvActiveSection === sec) ? '' : sec;
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
    renderCvStudioForm();
    updateCvPreview();
  } else {
    updateCvPreview();
  }
}

// Expose globals for HTML onclick bindings
window.initCvStudio = initCvStudio;
window.setCvTemplate = setCvTemplate;
window.setCvZoom = setCvZoom;
window.zoomCvIn = zoomCvIn;
window.zoomCvOut = zoomCvOut;
window.printCv = printCv;
window.resetCvToInitial = resetCvToInitial;
window.clearCvToSinglePoint = clearCvToSinglePoint;
window.applyCvPreset = applyCvPreset;
window.toggleCvAccordion = toggleCvAccordion;
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
