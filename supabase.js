require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const localStorage = require('./storage');

const supabaseUrl = process.env.SUPABASE_URL || 'https://nptmawuukuysqzqakwej.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.error('❌ Failed to create Supabase client:', err.message);
  }
}

const db = {
  // Get all jobs
  async getJobs(filters = {}) {
    if (!supabase) return localStorage.getJobs(filters);

    try {
      let query = supabase.from('jobs').select('*');

      // Status filter (default includes active, expired, and closed so locked jobs show to visitors)
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      } else if (!filters.status) {
        query = query.in('status', ['active', 'expired', 'closed']);
      }

      if (filters.category && filters.category !== 'Semua') {
        query = query.eq('category', filters.category);
      }

      if (filters.job_type && filters.job_type !== 'Semua') {
        query = query.eq('job_type', filters.job_type);
      }

      if (filters.location && filters.location !== 'Semua') {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.search && filters.search.trim() !== '') {
        const q = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${q},company_name.ilike.${q},description.ilike.${q},location.ilike.${q}`);
      }

      // Order
      if (filters.sort === 'views') {
        query = query.order('views_count', { ascending: false });
      } else {
        query = query.order('is_featured', { ascending: false }).order('id', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        // Fallback to local storage if table doesn't exist yet
        console.warn('⚠️ Supabase error (falling back to local storage):', error.message);
        return localStorage.getJobs(filters);
      }

      return data || [];
    } catch (err) {
      console.warn('⚠️ Supabase fetch exception, using local storage:', err.message);
      return localStorage.getJobs(filters);
    }
  },

  // Get job by ID
  async getJobById(id) {
    if (!supabase) return localStorage.getJobById(id);

    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (error || !data) {
        return localStorage.getJobById(id);
      }

      // Increment views count in background
      supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id).then();

      return data;
    } catch (err) {
      return localStorage.getJobById(id);
    }
  },

  // Add new job
  async addJob(jobData) {
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
        contact_type: jobData.contact_type || 'whatsapp',
        contact_value: jobData.contact_value || '',
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
    if (!supabase) return localStorage.updateJob(id, updateData);

    try {
      const payload = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('jobs').update(payload).eq('id', id).select().single();
      if (error) {
        console.warn('⚠️ Supabase update error, falling back to local storage:', error.message);
        return localStorage.updateJob(id, updateData);
      }

      localStorage.updateJob(id, updateData);
      return data;
    } catch (err) {
      return localStorage.updateJob(id, updateData);
    }
  },

  // Delete job
  async deleteJob(id) {
    if (!supabase) return localStorage.deleteJob(id);

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) {
        console.warn('⚠️ Supabase delete error:', error.message);
      }
      return localStorage.deleteJob(id);
    } catch (err) {
      return localStorage.deleteJob(id);
    }
  },

  // Toggle status
  async toggleStatus(id, newStatus) {
    if (!supabase) return localStorage.toggleStatus(id, newStatus);

    try {
      const current = await this.getJobById(id);
      if (!current) return null;

      const nextStatus = newStatus || (current.status === 'active' ? 'expired' : 'active');
      const { data, error } = await supabase.from('jobs').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', id).select().single();

      if (error) {
        return localStorage.toggleStatus(id, newStatus);
      }

      localStorage.toggleStatus(id, newStatus);
      return data;
    } catch (err) {
      return localStorage.toggleStatus(id, newStatus);
    }
  },

  // Get statistics
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
  }
};

module.exports = db;
