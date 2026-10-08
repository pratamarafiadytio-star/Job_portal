const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jobsFilePath = path.join(dataDir, 'jobs.json');

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
const storage = {
  // Get all jobs with optional filters
  getJobs({ search, category, job_type, location, status, sort } = {}) {
    let jobs = getAllJobs();

    // Filter by status (default is active)
    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status === status);
    } else if (!status) {
      jobs = jobs.filter(j => j.status === 'active');
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
      contact_type: jobData.contact_type || 'whatsapp', // 'whatsapp', 'email', 'link'
      contact_value: jobData.contact_value || '',
      deadline: jobData.deadline || '',
      status: jobData.status || 'active',
      is_featured: jobData.is_featured ? 1 : 0,
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

  // Toggle status (active/closed)
  toggleStatus(id, newStatus) {
    const jobs = getAllJobs();
    const job = jobs.find(j => j.id === parseInt(id));
    if (!job) return null;

    job.status = newStatus || (job.status === 'active' ? 'closed' : 'active');
    job.updated_at = new Date().toISOString();
    saveAllJobs(jobs);
    return job;
  },

  // Get statistics for admin
  getStats() {
    const jobs = getAllJobs();
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const closedJobs = jobs.filter(j => j.status === 'closed').length;
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
  }
};

module.exports = storage;
