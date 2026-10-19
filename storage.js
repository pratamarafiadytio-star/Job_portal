const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jobsFilePath = path.join(dataDir, 'jobs.json');
const masterDataFilePath = path.join(dataDir, 'master_data.json');

const defaultMasterData = {
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

function normalizeMasterType(type) {
  if (!type) return 'categories';
  const t = String(type).toLowerCase().trim();
  if (t === 'category' || t === 'categories' || t === 'kategori') return 'categories';
  if (t === 'job_type' || t === 'job_types' || t === 'type' || t === 'types' || t === 'tipe') return 'job_types';
  if (t === 'experience_level' || t === 'experience_levels' || t === 'experience' || t === 'level' || t === 'pengalaman') return 'experience_levels';
  if (t === 'location' || t === 'locations' || t === 'lokasi') return 'locations';
  return 'categories';
}

function loadMasterData() {
  if (!fs.existsSync(masterDataFilePath)) {
    saveMasterData(defaultMasterData);
    return JSON.parse(JSON.stringify(defaultMasterData));
  }
  try {
    const raw = fs.readFileSync(masterDataFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      categories: parsed.categories || defaultMasterData.categories,
      job_types: parsed.job_types || defaultMasterData.job_types,
      experience_levels: parsed.experience_levels || defaultMasterData.experience_levels,
      locations: parsed.locations || defaultMasterData.locations
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultMasterData));
  }
}

function saveMasterData(data) {
  try {
    fs.writeFileSync(masterDataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save master data:', e);
  }
}

// Default initial jobs with posters
const defaultJobs = [
  {
    id: 1,
    title: 'Senior UI/UX Designer',
    company_name: 'Synergy Tech Global',
    category: 'Design & Kreatif',
    job_type: 'Remote',
    location: 'Jakarta / Remote',
    salary_display: 'Rp 15.000.000 - Rp 25.000.000 / bln',
    experience_level: 'Senior (5+ Tahun)',
    poster_image: '/uploads/sample_uiux.jpg',
    description: 'Synergy Tech sedang mencari Senior UI/UX Designer untuk memimpin strategi desain produk digital generasi berikutnya. Anda akan merancang antarmuka elegan, prototipe interaktif, dan berkolaborasi erat dengan tim engineering.',
    requirements: [
      'Pengalaman minimal 5 tahun di bidang UI/UX Design untuk platform web & mobile',
      'Portofolio kuat yang menunjukkan proses design thinking dan UI visual modern',
      'Mahir menggunakan Figma, Design Systems, dan interactive prototyping',
      'Pemahaman kuat mengenai usability testing dan user journey mapping',
      'Kemampuan komunikasi dan kepemimpinan yang baik'
    ],
    responsibilities: [
      'Memimpin dan merumuskan arah desain UI/UX produk utama',
      'Membuat wireframe, interactive high-fidelity prototype di Figma',
      'Mengembangkan dan memelihara Design System bersama tim front-end',
      'Melakukan riset dan wawancara pengguna untuk validasi fitur baru'
    ],
    benefits: [
      'Kerja 100% Remote dengan jam fleksibel',
      'Asuransi Kesehatan Swasta Kelas 1 & BPJS',
      'Tunjangan perangkat MacBook Pro & monitor 4K',
      'Budget pembelajaran & sertifikasi tahunan'
    ],
    contact_type: 'whatsapp',
    contact_value: '081234567890',
    deadline: '2026-11-30',
    status: 'active',
    is_featured: 1,
    views_count: 142,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Full Stack Web Developer (Node.js & React)',
    company_name: 'Tech Innovations Lab',
    category: 'Teknologi & IT',
    job_type: 'Hybrid',
    location: 'Jakarta Selatan (SCBD)',
    salary_display: 'Rp 18.000.000 - Rp 28.000.000 / bln',
    experience_level: '3-5 Tahun',
    poster_image: '/uploads/sample_fullstack.jpg',
    description: 'Kami mengundang Full Stack Developer berbakat untuk membangun arsitektur sistem enterprise yang cepat, terukur, dan aman. Mengembangkan REST API modern dan antarmuka responsif.',
    requirements: [
      'Pengalaman kerja minimal 3 tahun menggunakan Node.js dan React / Next.js',
      'Fasih bekerja dengan database relasional dan konsep RESTful API modern',
      'Pemahaman solid mengenai Clean Architecture dan version control (Git)',
      'Berpengalaman dengan cloud deployment dan containerization (Docker)'
    ],
    responsibilities: [
      'Merancang arsitektur backend scalable dan antarmuka web modern',
      'Mengoptimasi performa dan keamanan aplikasi web',
      'Bekerjasama dalam tim sprint agile mingguan'
    ],
    benefits: [
      'Sistem kerja Hybrid fleksibel (2 hari kantor, 3 hari WFH)',
      'Gaji kompetitif + THR + Bonus kuartalan',
      'Makan siang gratis & snack bar sepuasnya di kantor SCBD',
      'Asuransi kesehatan lengkap termasuk keluarga'
    ],
    contact_type: 'email',
    contact_value: 'careers@techinnovations.com',
    deadline: '2026-11-25',
    status: 'active',
    is_featured: 1,
    views_count: 298,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Digital Marketing & Social Media Strategist',
    company_name: 'Creative Sparks Agency',
    category: 'Marketing & Penjualan',
    job_type: 'Full Time',
    location: 'Bandung, Jawa Barat',
    salary_display: 'Rp 9.000.000 - Rp 14.000.000 / bln',
    experience_level: '1-3 Tahun',
    poster_image: '/uploads/sample_marketing.jpg',
    description: 'Creative Sparks mencari Digital Marketing Specialist yang kreatif dan analitis untuk memimpin kampanye multi-channel, paid ads (Meta & TikTok), serta konten viral.',
    requirements: [
      'Pengalaman minimal 2 tahun dalam digital marketing dan social media ads',
      'Terbukti sukses mengelola Meta Ads (Facebook/Instagram) dan TikTok Ads',
      'Kreatif dalam menyusun copywriting iklan yang engaging',
      'Menguasai tren media sosial terkini (Reels, TikTok, Shorts)'
    ],
    responsibilities: [
      'Merencanakan dan mengeksekusi kampanye pemasaran digital bulanan',
      'Mengoptimalkan performa iklan berbayar (paid ads) untuk ROI maksimal',
      'Membuat strategi konten bersama tim kreatif desain grafis'
    ],
    benefits: [
      'Suasana kerja agensi yang seru, dinamis, tanpa birokrasi kaku',
      'Tunjangan kuota internet & transportasi',
      'Bonus performa pencapaian target campaign'
    ],
    contact_type: 'link',
    contact_value: 'https://creativesparks.io/apply',
    deadline: '2026-11-15',
    status: 'active',
    is_featured: 0,
    views_count: 89,
    created_at: new Date().toISOString()
  }
];

// Helper to read all jobs from jobs.json
function getAllJobs() {
  try {
    if (!fs.existsSync(jobsFilePath)) {
      saveAllJobs(defaultJobs);
      return defaultJobs;
    }
    const raw = fs.readFileSync(jobsFilePath, 'utf-8');
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      saveAllJobs(defaultJobs);
      return defaultJobs;
    }
    return jobs;
  } catch (err) {
    console.error('Error reading jobs.json, restoring defaults:', err);
    saveAllJobs(defaultJobs);
    return defaultJobs;
  }
}

// Helper to save all jobs to jobs.json
function saveAllJobs(jobs) {
  try {
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing jobs.json:', err);
    return false;
  }
}

// Storage Operations
function enrichPlatform(j) {
  if (!j) return j;
  let p = j.source_platform;
  let l = j.source_label;
  if (!p) {
    const raw = String(j.contact_value || '') + ' ' + String(j.website_url || '');
    const desc = String(j.description || '') + ' ' + String(j.title || '');
    if (raw.includes('linkedin.com') || desc.includes('LinkedIn') || desc.includes('#LokerLinkedIn')) {
      p = 'linkedin';
      l = 'LinkedIn Recruiter';
    } else if (raw.includes('instagram.com') || desc.includes('Instagram') || desc.includes('#LokerInstagram')) {
      p = 'instagram';
      l = 'Instagram Karir';
    } else if (raw.includes('facebook.com') || desc.includes('Facebook') || desc.includes('#LokerFacebook')) {
      p = 'facebook';
      l = 'Facebook Recruitment';
    } else {
      p = 'official';
      l = 'Resmi BUMN & Swasta';
    }
  }
  j.source_platform = p;
  j.source_label = l || (p === 'linkedin' ? 'LinkedIn Recruiter' : p === 'instagram' ? 'Instagram Karir' : p === 'facebook' ? 'Facebook Loker' : 'Resmi BUMN & Swasta');
  return j;
}

const storage = {
  // Get all jobs with optional filters
  getJobs({ search, category, job_type, location, status, sort, platform } = {}) {
    let jobs = getAllJobs().map(enrichPlatform);

    // Filter by status (default includes active, expired, and closed so locked jobs show to visitors)
    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status === status);
    } else if (!status) {
      jobs = jobs.filter(j => j.status === 'active' || j.status === 'expired' || j.status === 'closed');
    }

    if (category && category !== 'Semua') {
      jobs = jobs.filter(j => j.category === category);
    }

    if (job_type && job_type !== 'Semua') {
      jobs = jobs.filter(j => j.job_type === job_type);
    }

    if (location && location !== 'Semua') {
      const locLower = location.toLowerCase();
      jobs = jobs.filter(j => j.location && j.location.toLowerCase().includes(locLower));
    }

    if (platform && platform !== 'Semua' && platform !== 'all') {
      const plat = platform.toLowerCase();
      jobs = jobs.filter(j => j.source_platform === plat);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      jobs = jobs.filter(j =>
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.company_name && j.company_name.toLowerCase().includes(q)) ||
        (j.description && j.description.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'salary_high') {
      jobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
    } else if (sort === 'views') {
      jobs.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else {
      // Featured first, then newest
      jobs.sort((a, b) => {
        if ((b.is_featured || 0) !== (a.is_featured || 0)) {
          return (b.is_featured || 0) - (a.is_featured || 0);
        }
        return (b.id || 0) - (a.id || 0);
      });
    }

    return jobs;
  },

  // Get job by ID and increment views
  getJobById(id) {
    const jobs = getAllJobs();
    const job = jobs.find(j => j.id === parseInt(id));
    if (job) {
      job.views_count = (job.views_count || 0) + 1;
      saveAllJobs(jobs);
    }
    return job;
  },

  // Add new job
  addJob(jobData) {
    const jobs = getAllJobs();
    const nextId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id || 0)) + 1 : 1;

    const wa = jobData.whatsapp || (jobData.contact_type === 'whatsapp' ? jobData.contact_value : '');
    const email = jobData.email || (jobData.contact_type === 'email' ? jobData.contact_value : '');
    const web = jobData.website_url || jobData.website || (jobData.contact_type === 'link' ? jobData.contact_value : '');

    let contactVal = jobData.contact_value || '';
    if (!contactVal && (wa || email || web)) {
      contactVal = JSON.stringify({ whatsapp: wa, email, website: web });
    }

    const newJob = {
      id: nextId,
      title: jobData.title || '',
      company_name: jobData.company_name || '',
      category: jobData.category || 'Lainnya',
      job_type: jobData.job_type || 'Full Time',
      location: jobData.location || 'Indonesia',
      salary_display: jobData.salary_display || '',
      experience_level: jobData.experience_level || 'Semua Pengalaman',
      poster_image: jobData.poster_image || '',
      description: jobData.description || '',
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
      responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities : [],
      benefits: Array.isArray(jobData.benefits) ? jobData.benefits : [],
      whatsapp: wa,
      email: email,
      website_url: web,
      contact_type: jobData.contact_type || (wa ? 'whatsapp' : (email ? 'email' : 'link')),
      deadline: jobData.deadline || '',
      status: jobData.status || 'active',
      is_featured: jobData.is_featured ? 1 : 0,
      source_platform: jobData.source_platform || (web.includes('linkedin.com') ? 'linkedin' : (web.includes('instagram.com') ? 'instagram' : (web.includes('facebook.com') ? 'facebook' : 'official'))),
      source_label: jobData.source_label || (web.includes('linkedin.com') ? 'LinkedIn Recruiter' : (web.includes('instagram.com') ? 'Instagram Karir' : (web.includes('facebook.com') ? 'Facebook Loker' : 'Resmi BUMN & Korporasi'))),
      views_count: 0,
      created_at: new Date().toISOString()
    };

    jobs.unshift(newJob);
    saveAllJobs(jobs);
    return newJob;
  },

  // Update existing job
  updateJob(id, updateData) {
    const jobs = getAllJobs();
    const idx = jobs.findIndex(j => j.id === parseInt(id));
    if (idx === -1) return null;

    jobs[idx] = {
      ...jobs[idx],
      ...updateData,
      id: jobs[idx].id, // preserve id
      updated_at: new Date().toISOString()
    };

    saveAllJobs(jobs);
    return jobs[idx];
  },

  // Delete job
  deleteJob(id) {
    let jobs = getAllJobs();
    const initialLen = jobs.length;
    jobs = jobs.filter(j => j.id !== parseInt(id));
    if (jobs.length < initialLen) {
      saveAllJobs(jobs);
      return true;
    }
    return false;
  },

  // Toggle status (active/expired/closed)
  toggleStatus(id, newStatus) {
    const jobs = getAllJobs();
    const job = jobs.find(j => j.id === parseInt(id));
    if (!job) return null;

    job.status = newStatus || (job.status === 'active' ? 'expired' : 'active');
    job.updated_at = new Date().toISOString();
    saveAllJobs(jobs);
    return job;
  },

  // Get statistics for admin
  getStats() {
    const jobs = getAllJobs();
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const closedJobs = jobs.filter(j => j.status === 'closed' || j.status === 'expired').length;
    const totalViews = jobs.reduce((acc, j) => acc + (j.views_count || 0), 0);

    const categoriesCount = {};
    jobs.forEach(j => {
      categoriesCount[j.category] = (categoriesCount[j.category] || 0) + 1;
    });

    const categories = Object.entries(categoriesCount).map(([category, count]) => ({
      category,
      count
    }));

    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalViews,
      categories,
      recentJobs: jobs.slice(0, 5)
    };
  },

  // Master Data Settings CRUD
  getMasterData() {
    return loadMasterData();
  },

  addMasterDataItem({ type, name, icon }) {
    if (!name || !name.trim()) {
      throw new Error('Nama item master data tidak boleh kosong!');
    }
    const key = normalizeMasterType(type);
    const data = loadMasterData();
    const cleanName = name.trim();

    // Prevent duplicates
    const exists = data[key].some(item => item.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      throw new Error(`Item "${cleanName}" sudah ada di dalam data ${key}!`);
    }

    const newItem = {
      id: Date.now(),
      name: cleanName,
      icon: icon || (key === 'categories' ? 'fa-layer-group' : key === 'job_types' ? 'fa-briefcase' : key === 'experience_levels' ? 'fa-user-clock' : 'fa-location-dot')
    };

    data[key].push(newItem);
    saveMasterData(data);
    return { newItem, allData: data, ...data };
  },

  deleteMasterDataItem({ type, name, id }) {
    const key = normalizeMasterType(type);
    const data = loadMasterData();

    if (id !== undefined && id !== null && id !== '') {
      data[key] = data[key].filter(item => String(item.id) !== String(id));
    } else if (name) {
      data[key] = data[key].filter(item => item.name.toLowerCase() !== String(name).trim().toLowerCase());
    } else {
      throw new Error('ID atau nama item harus disertakan untuk menghapus!');
    }

    saveMasterData(data);
    return { success: true, allData: data, ...data };
  },

  resetMasterData() {
    saveMasterData(defaultMasterData);
    return JSON.parse(JSON.stringify(defaultMasterData));
  }
};

module.exports = storage;
