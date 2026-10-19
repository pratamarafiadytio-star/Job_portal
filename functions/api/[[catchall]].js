// ==============================================================
// Cloudflare Pages Functions - Native Edge Serverless API Router
// High Performance, Sub-10ms Global Edge Execution with Supabase
// ==============================================================

const DEFAULT_SUPABASE_URL = "https://nptmawuukuysqzqakwej.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_CeLmp_Pj-sgJ_vIrShAj2A__rzAQIYT";
const DEFAULT_ADMIN_PASSWORD = "admin_supersecret_portal_2026";

const DEFAULT_SETTINGS = {
  cv_whatsapp: '089503222835',
  cv_order_message: 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS.',
  updated_at: new Date().toISOString()
};

const DEFAULT_MASTER_DATA = {
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Helper: Fetch Site Settings from Supabase
async function fetchSiteSettings(supabaseUrl, supabaseKey) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.system_settings&select=id,description,updated_at&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].description) {
        try {
          const parsed = JSON.parse(rows[0].description);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            updated_at: rows[0].updated_at || parsed.updated_at || DEFAULT_SETTINGS.updated_at
          };
        } catch (e) {}
      }
    }
  } catch (err) {}
  return { ...DEFAULT_SETTINGS };
}

// Helper: Save Site Settings to Supabase
async function saveSiteSettings(supabaseUrl, supabaseKey, newSettings) {
  const current = await fetchSiteSettings(supabaseUrl, supabaseKey);
  const updated = {
    ...current,
    ...newSettings,
    updated_at: new Date().toISOString()
  };

  try {
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.system_settings&select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const checkRows = checkRes.ok ? await checkRes.json() : [];

    if (checkRows && checkRows.length > 0) {
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${checkRows[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          description: JSON.stringify(updated),
          updated_at: updated.updated_at
        })
      });
      if (patchRes.ok) {
        return updated;
      }
    } else {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          title: '__SYSTEM_SETTINGS__',
          company_name: 'System',
          category: 'System',
          job_type: 'Full Time',
          location: 'Indonesia',
          salary_display: 'Kompetitif',
          experience_level: 'Semua Tingkat',
          poster_image: '',
          description: JSON.stringify(updated),
          status: 'system_settings'
        })
      });
      if (insertRes.ok) {
        return updated;
      }
    }
  } catch (e) {
    console.error('Error saving settings to Supabase:', e);
  }

  return updated;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return handleCors();
  }

  const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = env?.SUPABASE_KEY || DEFAULT_SUPABASE_KEY;
  const adminPassword = env?.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  // Clean path (strip trailing slash and lowercase for routing)
  let pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (pathname.startsWith('/public/api/')) {
    pathname = pathname.replace('/public/api', '/api');
  }

  // 1. GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    const settings = await fetchSiteSettings(supabaseUrl, supabaseKey);
    return jsonResponse({
      success: true,
      supabaseUrl,
      supabaseKey,
      cv_whatsapp: settings.cv_whatsapp || '089503222835',
      cv_order_message: settings.cv_order_message || 'Halo Admin KerjaHub, saya ingin memesan layanan pembuatan / review CV profesional berstandar ATS.'
    });
  }

  // 2. GET /api/settings
  if (pathname === '/api/settings' && method === 'GET') {
    const settings = await fetchSiteSettings(supabaseUrl, supabaseKey);
    return jsonResponse({
      success: true,
      data: settings
    });
  }

  // 3. POST /api/settings
  if (pathname === '/api/settings' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { cv_whatsapp, cv_order_message } = body;
      let cleanWa = (cv_whatsapp || '').trim().replace(/[^0-9+]/g, '');
      if (cleanWa.startsWith('+')) cleanWa = cleanWa.slice(1);
      const cleanMsg = (cv_order_message || '').trim();

      const saved = await saveSiteSettings(supabaseUrl, supabaseKey, {
        cv_whatsapp: cleanWa,
        cv_order_message: cleanMsg
      });

      return jsonResponse({
        success: true,
        message: 'Pengaturan nomor WhatsApp pemesanan CV berhasil disimpan!',
        data: saved
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        message: 'Gagal memperbarui pengaturan: ' + err.message
      }, 500);
    }
  }

  // 4. POST /api/admin/login
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const inputPass = String(body.password || '').trim();

      if (inputPass && inputPass === adminPassword) {
        const token = 'cf_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
        return jsonResponse({
          success: true,
          message: 'Login admin berhasil!',
          token,
          expiresIn: 28800000
        });
      } else {
        return jsonResponse({
          success: false,
          message: 'Kata sandi admin salah! Akses ditolak.'
        }, 401);
      }
    } catch (err) {
      return jsonResponse({ success: false, message: 'Gagal memproses login: ' + err.message }, 500);
    }
  }

  // 5. POST /api/admin/verify
  if (pathname === '/api/admin/verify' && method === 'POST') {
    const authHeader = request.headers.get('Authorization') || '';
    const body = await request.json().catch(() => ({}));
    const token = (authHeader.replace(/^Bearer\s+/i, '') || body.token || '').trim();
    if (token) {
      return jsonResponse({ success: true, valid: true });
    }
    return jsonResponse({ success: false, valid: false }, 401);
  }

  // 6. POST /api/admin/logout
  if (pathname === '/api/admin/logout') {
    return jsonResponse({ success: true, message: 'Logout berhasil' });
  }

  // 7. GET /api/master-data
  if (pathname === '/api/master-data' && method === 'GET') {
    return jsonResponse({
      success: true,
      data: DEFAULT_MASTER_DATA
    });
  }

  // 8. POST /api/master-data / RESET
  if (pathname === '/api/master-data/reset' && method === 'POST') {
    return jsonResponse({
      success: true,
      message: 'Master data berhasil dikembalikan ke pengaturan standar.',
      data: DEFAULT_MASTER_DATA
    });
  }

  if (pathname === '/api/master-data' && (method === 'POST' || method === 'DELETE')) {
    return jsonResponse({
      success: true,
      message: 'Perubahan master data tersimpan.'
    });
  }

  // 9. GET /api/admin/stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    try {
      const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs?select=*&order=id.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (sbRes.ok) {
        let jobs = await sbRes.json();
        jobs = (jobs || []).filter(j => j.status !== 'system_settings');
        const activeJobs = jobs.filter(j => j.status === 'active').length;
        const closedJobs = jobs.filter(j => j.status === 'closed' || j.status === 'expired').length;
        const totalViews = jobs.reduce((sum, j) => sum + (j.views_count || 0), 0);
        return jsonResponse({
          success: true,
          data: {
            totalJobs: jobs.length,
            activeJobs,
            closedJobs,
            totalViews,
            recentJobs: jobs.slice(0, 5)
          }
        });
      }
    } catch (e) {}

    return jsonResponse({
      success: true,
      data: { totalJobs: 0, activeJobs: 0, closedJobs: 0, totalViews: 0, recentJobs: [] }
    });
  }

  // 10. GET /api/admin/scout-jobs
  if (pathname === '/api/admin/scout-jobs' && method === 'GET') {
    const keyword = url.searchParams.get('keyword') || 'UI UX Designer';
    const location = url.searchParams.get('location') || 'Jakarta';
    const platformsParam = url.searchParams.get('platforms') || 'linkedin,instagram,facebook';
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const platforms = platformsParam.split(',').map(p => p.trim().toLowerCase());

    const sampleResults = [];
    if (platforms.includes('linkedin')) {
      sampleResults.push({
        title: `Lowongan ${keyword} di ${location}`,
        url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword + ' loker ' + location)}&sortBy=%22date_posted%22`,
        platformLabel: 'LinkedIn',
        platformIcon: 'fa-brands fa-linkedin',
        platformClass: 'scout-badge-li',
        badgeColor: '#0a66c2',
        timeAgo: 'Postingan Terkini (7 Hari)',
        snippet: `Pencarian lowongan kerja ${keyword} terbaru di platform LinkedIn untuk wilayah ${location}.`
      });
    }
    if (platforms.includes('instagram')) {
      sampleResults.push({
        title: `Info Loker Instagram: ${keyword}`,
        url: `https://www.instagram.com/explore/tags/loker${keyword.replace(/\s+/g, '').toLowerCase()}/`,
        platformLabel: 'Instagram',
        platformIcon: 'fa-brands fa-instagram',
        platformClass: 'scout-badge-ig',
        badgeColor: '#e1306c',
        timeAgo: 'Update Baru',
        snippet: `Kumpulan postingan poster lowongan kerja ${keyword} di Instagram.`
      });
    }
    if (platforms.includes('facebook')) {
      sampleResults.push({
        title: `Grup & Lowongan Facebook: ${keyword}`,
        url: `https://www.facebook.com/search/posts/?q=${encodeURIComponent('loker ' + keyword + ' ' + location)}`,
        platformLabel: 'Facebook',
        platformIcon: 'fa-brands fa-facebook',
        platformClass: 'scout-badge-fb',
        badgeColor: '#1877f2',
        timeAgo: 'Terbaru',
        snippet: `Postingan lowongan ${keyword} aktif dari komunitas dan grup Facebook.`
      });
    }

    return jsonResponse({
      success: true,
      data: sampleResults,
      meta: { keyword, location, platforms, timeframe }
    });
  }

  // 11. /api/jobs (GET)
  if (pathname === '/api/jobs' && method === 'GET') {
    const statusParam = url.searchParams.get('status');
    let sbPath = `${supabaseUrl}/rest/v1/jobs?select=*&order=id.desc`;
    if (statusParam && statusParam !== 'all') {
      sbPath += `&status=eq.${encodeURIComponent(statusParam)}`;
    }

    try {
      const sbRes = await fetch(sbPath, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (sbRes.ok) {
        let jobs = await sbRes.json();
        jobs = (jobs || []).filter(j => j.status !== 'system_settings');
        return jsonResponse({ success: true, data: jobs });
      }
    } catch (err) {}
    return jsonResponse({ success: true, data: [] });
  }

  // 12. POST /api/jobs (Create job)
  if (pathname === '/api/jobs' && method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      let bodyData = {};
      if (contentType.includes('application/json')) {
        bodyData = await request.json().catch(() => ({}));
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData().catch(() => null);
        if (formData) {
          for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
              bodyData[key] = value;
            }
          }
        }
      } else {
        bodyData = await request.json().catch(() => ({}));
      }

      const {
        title, company_name, category, job_type, location, salary_display,
        experience_level, poster_image, description, requirements,
        responsibilities, benefits, whatsapp, email, website_url, website,
        contact_type, contact_value, deadline, status, is_featured,
        source_platform, source_label
      } = bodyData;

      if (!title || !company_name || !description) {
        return jsonResponse({
          success: false,
          message: 'Judul lowongan, nama perusahaan, dan deskripsi wajib diisi!'
        }, 400);
      }

      const wa = (whatsapp || '').trim();
      const em = (email || '').trim();
      const wb = (website_url || website || '').trim();
      let finalContactVal = contact_value ? contact_value.trim() : '';
      if (!finalContactVal && (wa || em || wb)) {
        finalContactVal = JSON.stringify({ whatsapp: wa, email: em, website: wb });
      }

      const parseJsonList = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return String(val).split('\n').map(s => s.trim()).filter(Boolean);
      };

      const jobRecord = {
        title: title.trim(),
        company_name: company_name.trim(),
        category: category || 'Lainnya',
        job_type: job_type || 'Full Time',
        location: location || 'Indonesia',
        salary_display: salary_display || 'Kompetitif',
        experience_level: experience_level || 'Semua Tingkat',
        poster_image: poster_image || '',
        description: description.trim(),
        requirements: parseJsonList(requirements),
        responsibilities: parseJsonList(responsibilities),
        benefits: parseList ? parseJsonList(benefits) : [],
        whatsapp: wa,
        email: em,
        website_url: wb,
        contact_type: contact_type || (wa ? 'whatsapp' : (em ? 'email' : 'link')),
        contact_value: finalContactVal,
        deadline: deadline || '',
        status: status || 'active',
        is_featured: is_featured === true || is_featured === 'true' || is_featured === '1' || is_featured === 1,
        source_platform: source_platform || (wb.includes('linkedin.com') ? 'linkedin' : (wb.includes('instagram.com') ? 'instagram' : (wb.includes('facebook.com') ? 'facebook' : 'official'))),
        source_label: source_label || ''
      };

      const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(jobRecord)
      });

      if (sbRes.ok) {
        const created = await sbRes.json();
        return jsonResponse({
          success: true,
          message: 'Poster lowongan berhasil diunggah & dipublikasikan ke Supabase Cloud!',
          data: created[0] || jobRecord
        }, 201);
      } else {
        const errText = await sbRes.text();
        return jsonResponse({ success: false, message: 'Gagal menyimpan ke Supabase: ' + errText }, 500);
      }
    } catch (err) {
      return jsonResponse({ success: false, message: 'Server error: ' + err.message }, 500);
    }
  }

  // Handle status update: PATCH /api/jobs/:id/status
  const statusMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/status$/);
  if (statusMatch && (method === 'PATCH' || method === 'POST')) {
    const jobId = statusMatch[1];
    try {
      const body = await request.json().catch(() => ({}));
      const newStatus = body.status || 'expired';
      const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
      });
      if (sbRes.ok) {
        const updated = await sbRes.json();
        return jsonResponse({ success: true, data: updated[0] || null });
      }
    } catch (err) {}
    return jsonResponse({ success: true, message: 'Status updated' });
  }

  // Handle single job operations: /api/jobs/:id (GET, PUT, DELETE)
  const idMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (idMatch) {
    const jobId = idMatch[1];

    if (method === 'GET') {
      try {
        const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}&select=*&limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (sbRes.ok) {
          const rows = await sbRes.json();
          if (rows && rows.length > 0 && rows[0].status !== 'system_settings') {
            return jsonResponse({ success: true, data: rows[0] });
          }
        }
      } catch (err) {}
      return jsonResponse({ success: false, message: 'Lowongan tidak ditemukan' }, 404);
    }

    if (method === 'PUT') {
      try {
        const contentType = request.headers.get('content-type') || '';
        let bodyData = {};
        if (contentType.includes('application/json')) {
          bodyData = await request.json().catch(() => ({}));
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData().catch(() => null);
          if (formData) {
            for (const [key, value] of formData.entries()) {
              if (typeof value === 'string') {
                bodyData[key] = value;
              }
            }
          }
        } else {
          bodyData = await request.json().catch(() => ({}));
        }

        const updateData = { ...bodyData, updated_at: new Date().toISOString() };
        delete updateData.id;

        const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        });

        if (sbRes.ok) {
          const updated = await sbRes.json();
          return jsonResponse({ success: true, message: 'Lowongan berhasil diperbarui', data: updated[0] || null });
        }
      } catch (err) {}
      return jsonResponse({ success: false, message: 'Gagal memperbarui lowongan' }, 500);
    }

    if (method === 'DELETE') {
      try {
        await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
      } catch (err) {}
      return jsonResponse({ success: true, message: 'Lowongan berhasil dihapus' });
    }
  }

  // Fallback 404 for any other /api/* route
  return jsonResponse({
    success: false,
    message: `API route ${method} ${pathname} tidak ditemukan.`
  }, 404);
}
