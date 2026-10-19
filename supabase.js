require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const localStorage = require('./storage');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.error('❌ Failed to create Supabase client:', err.message);
  }
}

// In-Memory Fast Cache with TTL & Instant Invalidation
const cache = {
  jobs: null, // { timestamp, data }
  stats: null, // { timestamp, data }
  masterData: null, // { timestamp, data }
  settings: null, // { timestamp, data }
  TTL_JOBS_MS: 20000, // 20 seconds
  TTL_STATS_MS: 20000,
  TTL_MASTER_MS: 60000, // 60 seconds
  TTL_SETTINGS_MS: 60000,
  invalidateJobs() {
    this.jobs = null;
    this.stats = null;
  },
  invalidateMaster() {
    this.masterData = null;
  },
  invalidateSettings() {
    this.settings = null;
  }
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

function enrichJobPlatform(job) {
  if (!job) return job;
  let p = job.source_platform;
  let l = job.source_label;
  if (!p) {
    const rawContact = String(job.contact_value || '') + ' ' + String(job.website_url || '');
    const desc = String(job.description || '') + ' ' + String(job.title || '');
    if (rawContact.includes('linkedin.com') || desc.includes('LinkedIn') || desc.includes('#LokerLinkedIn')) {
      p = 'linkedin';
      l = 'LinkedIn Recruiter';
    } else if (rawContact.includes('instagram.com') || desc.includes('Instagram') || desc.includes('#LokerInstagram')) {
      p = 'instagram';
      l = 'Instagram Karir';
    } else if (rawContact.includes('facebook.com') || desc.includes('Facebook') || desc.includes('#LokerFacebook')) {
      p = 'facebook';
      l = 'Facebook Recruitment';
    } else {
      p = 'official';
      l = 'Resmi BUMN & Swasta';
    }
  }
  job.source_platform = p;
  job.source_label = l || (p === 'linkedin' ? 'LinkedIn Recruiter' : p === 'instagram' ? 'Instagram Karir' : p === 'facebook' ? 'Facebook Loker' : 'Resmi BUMN & Swasta');
  return job;
}

const db = {
  // Get all jobs (Optimized with high-speed in-memory cache)
  async getJobs(filters = {}) {
    if (!supabase) return localStorage.getJobs(filters);

    try {
      const now = Date.now();
      let allRawJobs = null;

      // 1. Check in-memory cache
      if (cache.jobs && (now - cache.jobs.timestamp < cache.TTL_JOBS_MS)) {
        allRawJobs = cache.jobs.data;
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('id', { ascending: false });

        if (error) {
          console.warn('⚠️ Supabase error (falling back to local storage):', error.message);
          return localStorage.getJobs(filters);
        }

        allRawJobs = (data || [])
          .filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data')
          .map(enrichJobPlatform);

        cache.jobs = { timestamp: now, data: allRawJobs };
      }

      // 2. Perform lightning-fast in-memory filtering (<1ms)
      let list = allRawJobs;

      if (filters.status && filters.status !== 'all') {
        list = list.filter(j => j.status === filters.status);
      } else if (!filters.status) {
        list = list.filter(j => ['active', 'expired', 'closed'].includes(j.status));
      }

      if (filters.category && filters.category !== 'Semua') {
        list = list.filter(j => j.category === filters.category);
      }

      if (filters.job_type && filters.job_type !== 'Semua') {
        list = list.filter(j => j.job_type === filters.job_type);
      }

      if (filters.location && filters.location !== 'Semua') {
        const locLower = filters.location.toLowerCase();
        list = list.filter(j => (j.location || '').toLowerCase().includes(locLower));
      }

      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(j =>
          (j.title || '').toLowerCase().includes(q) ||
          (j.company_name || '').toLowerCase().includes(q) ||
          (j.description || '').toLowerCase().includes(q) ||
          (j.location || '').toLowerCase().includes(q)
        );
      }

      if (filters.platform && filters.platform !== 'Semua' && filters.platform !== 'all') {
        const plat = filters.platform.toLowerCase();
        list = list.filter(j => j.source_platform === plat);
      }

      if (filters.sort === 'views') {
        list = [...list].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      }

      return list;
    } catch (err) {
      console.warn('⚠️ Supabase fetch exception, using local storage:', err.message);
      return localStorage.getJobs(filters);
    }
  },

  // Get job by ID
  async getJobById(id) {
    if (!supabase) return localStorage.getJobById(id);

    try {
      // Check cached jobs first if available
      if (cache.jobs) {
        const found = cache.jobs.data.find(j => Number(j.id) === Number(id));
        if (found) {
          // Increment views asynchronously in background without blocking
          supabase.from('jobs').update({ views_count: (found.views_count || 0) + 1 }).eq('id', Number(id)).then();
          found.views_count = (found.views_count || 0) + 1;
          return found;
        }
      }

      const { data, error } = await supabase.from('jobs').select('*').eq('id', Number(id)).single();
      if (error || !data || data.status === 'system_settings' || data.status === 'system_master_data') {
        return null;
      }

      // Increment views count in background
      supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', Number(id)).then();

      return enrichJobPlatform(data);
    } catch (err) {
      return localStorage.getJobById(id);
    }
  },

  // Add new job
  async addJob(jobData) {
    cache.invalidateJobs();
    if (!supabase) return localStorage.addJob(jobData);

    try {
      const payload = {
        title: jobData.title,
        company_name: jobData.company_name,
        category: jobData.category || 'Lainnya',
        job_type: jobData.job_type || 'Full Time',
        location: jobData.location || 'Indonesia',
        salary_display: jobData.salary_display || 'Kompetitif',
        experience_level: jobData.experience_level || 'Semua Pengalaman',
        poster_image: jobData.poster_image || '',
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        benefits: jobData.benefits || [],
        contact_type: jobData.contact_type || (jobData.whatsapp ? 'whatsapp' : (jobData.email ? 'email' : 'link')),
        contact_value: jobData.contact_value || (
          (jobData.whatsapp || jobData.email || jobData.website || jobData.website_url)
            ? JSON.stringify({
                whatsapp: jobData.whatsapp || '',
                email: jobData.email || '',
                website: jobData.website_url || jobData.website || ''
              })
            : ''
        ),
        deadline: jobData.deadline || '',
        status: jobData.status || 'active',
        is_featured: !!jobData.is_featured,
        views_count: 0
      };

      const { data, error } = await supabase.from('jobs').insert([payload]).select().single();
      if (error) {
        console.warn('⚠️ Supabase insert error, saving to local storage:', error.message);
        return localStorage.addJob(jobData);
      }

      // Also sync to local storage as backup
      localStorage.addJob(jobData);
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase insert exception, using local storage:', err.message);
      return localStorage.addJob(jobData);
    }
  },

  // Update job
  async updateJob(id, updateData) {
    cache.invalidateJobs();
    if (!supabase) return localStorage.updateJob(id, updateData);

    try {
      const allowedColumns = [
        'title', 'company_name', 'category', 'job_type', 'location',
        'salary_display', 'experience_level', 'poster_image', 'description',
        'requirements', 'responsibilities', 'benefits', 'contact_type',
        'contact_value', 'deadline', 'status', 'is_featured', 'views_count'
      ];

      const payload = { updated_at: new Date().toISOString() };
      for (const col of allowedColumns) {
        if (updateData[col] !== undefined) {
          payload[col] = updateData[col];
        }
      }

      if (!payload.contact_value && (updateData.whatsapp || updateData.email || updateData.website || updateData.website_url)) {
        payload.contact_value = JSON.stringify({
          whatsapp: updateData.whatsapp || '',
          email: updateData.email || '',
          website: updateData.website_url || updateData.website || ''
        });
      }

      const { data, error } = await supabase.from('jobs').update(payload).eq('id', Number(id)).select().single();
      if (error) {
        console.warn('⚠️ Supabase update error, falling back to local storage:', error.message);
        return localStorage.updateJob(id, updateData);
      }

      localStorage.updateJob(id, updateData);
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase update exception:', err.message);
      return localStorage.updateJob(id, updateData);
    }
  },

  // Delete job
  async deleteJob(id) {
    cache.invalidateJobs();
    if (!supabase) return localStorage.deleteJob(id);

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', Number(id));
      if (error) {
        console.warn('⚠️ Supabase delete error:', error.message);
        return localStorage.deleteJob(id);
      }
      localStorage.deleteJob(id);
      return true;
    } catch (err) {
      return localStorage.deleteJob(id);
    }
  },

  // Toggle status
  async toggleStatus(id, newStatus) {
    cache.invalidateJobs();
    if (!supabase) return localStorage.toggleStatus(id, newStatus);

    try {
      const current = await this.getJobById(id);
      if (!current) return null;

      const nextStatus = newStatus || (current.status === 'active' ? 'expired' : 'active');
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', Number(id))
        .select()
        .single();

      if (error) {
        return localStorage.toggleStatus(id, newStatus);
      }

      localStorage.toggleStatus(id, newStatus);
      return data;
    } catch (err) {
      return localStorage.toggleStatus(id, newStatus);
    }
  },

  // Get statistics (Computed instantly from cached jobs)
  async getStats() {
    const jobs = await this.getJobs({ status: 'all' });
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

  // Master Data Settings (Fast cached & synchronized)
  async getMasterData() {
    if (!supabase) return localStorage.getMasterData();

    const now = Date.now();
    if (cache.masterData && (now - cache.masterData.timestamp < cache.TTL_MASTER_MS)) {
      return cache.masterData.data;
    }

    try {
      // 1. Try master_data table if present
      const { data, error } = await supabase.from('master_data').select('*').order('id', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        const result = {
          categories: data.filter(d => d.type === 'category' || d.type === 'categories'),
          job_types: data.filter(d => d.type === 'job_type' || d.type === 'job_types'),
          experience_levels: data.filter(d => d.type === 'experience_level' || d.type === 'experience_levels'),
          locations: data.filter(d => d.type === 'location' || d.type === 'locations')
        };
        cache.masterData = { timestamp: now, data: result };
        return result;
      }

      // 2. Fallback to system_master_data in jobs table
      const { data: sysData } = await supabase.from('jobs').select('description').eq('status', 'system_master_data').limit(1);
      if (sysData && sysData.length > 0 && sysData[0].description) {
        try {
          const parsed = JSON.parse(sysData[0].description);
          if (parsed && typeof parsed === 'object') {
            const result = {
              categories: Array.isArray(parsed.categories) ? parsed.categories : [],
              job_types: Array.isArray(parsed.job_types) ? parsed.job_types : [],
              experience_levels: Array.isArray(parsed.experience_levels) ? parsed.experience_levels : [],
              locations: Array.isArray(parsed.locations) ? parsed.locations : []
            };
            if (result.categories.length > 0 || result.job_types.length > 0) {
              cache.masterData = { timestamp: now, data: result };
              return result;
            }
          }
        } catch (e) {}
      }

      // 3. Fallback to local storage
      const local = localStorage.getMasterData();
      cache.masterData = { timestamp: now, data: local };
      return local;
    } catch (err) {
      return localStorage.getMasterData();
    }
  },

  async addMasterDataItem({ type, name, icon }) {
    cache.invalidateMaster();
    if (!name || !name.trim()) {
      throw new Error('Nama item master data tidak boleh kosong!');
    }
    const key = normalizeMasterType(type);
    const cleanName = name.trim();
    const localResult = localStorage.addMasterDataItem({ type: key, name: cleanName, icon });

    if (supabase) {
      try {
        const { data: sysData } = await supabase.from('jobs').select('id, description').eq('status', 'system_master_data').limit(1);
        let masterObj = null;
        let sysRowId = null;

        if (sysData && sysData.length > 0) {
          sysRowId = sysData[0].id;
          try { masterObj = JSON.parse(sysData[0].description); } catch (e) {}
        }

        if (!masterObj || typeof masterObj !== 'object') {
          masterObj = localStorage.getMasterData();
        }

        if (!Array.isArray(masterObj[key])) masterObj[key] = [];

        const exists = masterObj[key].some(i => (i.name || '').toLowerCase() === cleanName.toLowerCase());
        if (!exists) {
          const defaultIcon = (key === 'categories') ? 'fa-layer-group' : (key === 'job_types') ? 'fa-briefcase' : (key === 'experience_levels') ? 'fa-user-check' : 'fa-location-dot';
          masterObj[key].push({ id: Date.now(), name: cleanName, icon: icon || defaultIcon });

          if (sysRowId) {
            await supabase.from('jobs').update({
              description: JSON.stringify(masterObj),
              updated_at: new Date().toISOString()
            }).eq('id', sysRowId);
          } else {
            await supabase.from('jobs').insert([{
              title: '__SYSTEM_MASTER_DATA__',
              company_name: 'System',
              category: 'System',
              job_type: 'Full Time',
              location: 'Indonesia',
              salary_display: 'Kompetitif',
              experience_level: 'Semua Tingkat',
              description: JSON.stringify(masterObj),
              status: 'system_master_data'
            }]);
          }
        }
        cache.masterData = { timestamp: Date.now(), data: masterObj };
        return { newItem: localResult.newItem, allData: masterObj, ...masterObj };
      } catch (err) {
        console.warn('Supabase addMasterDataItem exception:', err.message);
      }
    }

    return localResult;
  },

  async deleteMasterDataItem({ type, name, id }) {
    cache.invalidateMaster();
    const key = normalizeMasterType(type);
    const localResult = localStorage.deleteMasterDataItem({ type: key, name, id });

    if (supabase) {
      try {
        const { data: sysData } = await supabase.from('jobs').select('id, description').eq('status', 'system_master_data').limit(1);
        if (sysData && sysData.length > 0 && sysData[0].description) {
          const masterObj = JSON.parse(sysData[0].description);
          if (Array.isArray(masterObj[key])) {
            masterObj[key] = masterObj[key].filter(i => {
              if (id !== undefined && id !== null && id !== '' && String(i.id) === String(id)) return false;
              if (name && (i.name || '').toLowerCase() === String(name).trim().toLowerCase()) return false;
              return true;
            });
            await supabase.from('jobs').update({
              description: JSON.stringify(masterObj),
              updated_at: new Date().toISOString()
            }).eq('id', sysData[0].id);
          }
          cache.masterData = { timestamp: Date.now(), data: masterObj };
          return { success: true, allData: masterObj, ...masterObj };
        }
      } catch (err) {
        console.warn('Supabase deleteMasterDataItem exception:', err.message);
      }
    }

    return localResult;
  },

  async resetMasterData() {
    cache.invalidateMaster();
    const defaultData = localStorage.resetMasterData();
    if (supabase) {
      try {
        const { data: sysData } = await supabase.from('jobs').select('id').eq('status', 'system_master_data').limit(1);
        if (sysData && sysData.length > 0) {
          await supabase.from('jobs').update({
            description: JSON.stringify(defaultData),
            updated_at: new Date().toISOString()
          }).eq('id', sysData[0].id);
        } else {
          await supabase.from('jobs').insert([{
            title: '__SYSTEM_MASTER_DATA__',
            company_name: 'System',
            category: 'System',
            job_type: 'Full Time',
            location: 'Indonesia',
            salary_display: 'Kompetitif',
            experience_level: 'Semua Tingkat',
            description: JSON.stringify(defaultData),
            status: 'system_master_data'
          }]);
        }
      } catch (e) {
        console.warn('Supabase resetMasterData exception:', e.message);
      }
    }
    cache.masterData = { timestamp: Date.now(), data: defaultData };
    return defaultData;
  },

  // Settings CRUD (WhatsApp CV & messages)
  async getSettings() {
    const now = Date.now();
    if (cache.settings && (now - cache.settings.timestamp < cache.TTL_SETTINGS_MS)) {
      return cache.settings.data;
    }

    let result = {
      cv_whatsapp: '081234567890',
      cv_order_message: 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS agar lolos seleksi kerja. Mohon informasi tarif dan prosedurnya. Terima kasih.'
    };

    if (supabase) {
      try {
        const { data: rows } = await supabase.from('jobs').select('description').eq('status', 'system_settings').limit(1);
        if (rows && rows.length > 0 && rows[0].description) {
          const parsed = JSON.parse(rows[0].description);
          if (parsed && typeof parsed === 'object') {
            result = { ...result, ...parsed };
          }
        }
      } catch (e) {}
    }

    cache.settings = { timestamp: now, data: result };
    return result;
  },

  async saveSettings(settingsData) {
    cache.invalidateSettings();
    const current = await this.getSettings();
    const updated = {
      cv_whatsapp: settingsData.cv_whatsapp !== undefined ? settingsData.cv_whatsapp : current.cv_whatsapp,
      cv_order_message: settingsData.cv_order_message !== undefined ? settingsData.cv_order_message : current.cv_order_message
    };

    if (supabase) {
      try {
        const { data: rows } = await supabase.from('jobs').select('id').eq('status', 'system_settings').limit(1);
        if (rows && rows.length > 0) {
          await supabase.from('jobs').update({
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString()
          }).eq('id', rows[0].id);
        } else {
          await supabase.from('jobs').insert([{
            title: '__SYSTEM_SETTINGS__',
            company_name: 'System',
            category: 'System',
            job_type: 'Full Time',
            location: 'Indonesia',
            salary_display: 'Kompetitif',
            experience_level: 'Semua Tingkat',
            description: JSON.stringify(updated),
            status: 'system_settings'
          }]);
        }
      } catch (e) {}
    }

    cache.settings = { timestamp: Date.now(), data: updated };
    return updated;
  }
};

module.exports = db;
