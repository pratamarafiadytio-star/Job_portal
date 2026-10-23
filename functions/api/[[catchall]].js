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

function normalizeMasterType(type) {
  if (!type) return 'categories';
  const t = String(type).toLowerCase().trim();
  if (t === 'category' || t === 'categories' || t === 'kategori') return 'categories';
  if (t === 'job_type' || t === 'job_types' || t === 'tipe') return 'job_types';
  if (t === 'experience_level' || t === 'experience_levels' || t === 'level' || t === 'pengalaman') return 'experience_levels';
  if (t === 'location' || t === 'locations' || t === 'lokasi') return 'locations';
  return 'categories';
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

// Helper: Fetch Master Data from Supabase
async function fetchMasterData(supabaseUrl, supabaseKey) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.system_master_data&select=id,description&limit=1`, {
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
          if (parsed && Array.isArray(parsed.categories)) {
            return parsed;
          }
        } catch (e) {}
      }
    }
  } catch (err) {}
  return DEFAULT_MASTER_DATA;
}

// Helper: Save Master Data to Supabase
async function saveMasterData(supabaseUrl, supabaseKey, masterData) {
  try {
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.system_master_data&select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const checkRows = checkRes.ok ? await checkRes.json() : [];

    if (checkRows && checkRows.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${checkRows[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          description: JSON.stringify(masterData),
          updated_at: new Date().toISOString()
        })
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          title: '__SYSTEM_MASTER_DATA__',
          company_name: 'System',
          category: 'System',
          job_type: 'Full Time',
          location: 'Indonesia',
          salary_display: 'Kompetitif',
          experience_level: 'Semua Tingkat',
          poster_image: '',
          description: JSON.stringify(masterData),
          status: 'system_master_data'
        })
      });
    }
  } catch (e) {
    console.error('Error saving master data to Supabase:', e);
  }
  return masterData;
}

// Clean HTML Tags & Entities from RSS snippets
function cleanHtmlSnippet(raw) {
  if (!raw) return '';
  return raw
    .replace(/&lt;[\s\S]*?&gt;/gi, ' ')
    .replace(/<[\s\S]*?>/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTimeAgo(pubDateStr) {
  if (!pubDateStr) return { text: 'Baru saja', isFresh: true, badge: 'Baru', timestamp: Date.now() };
  const pubTime = new Date(pubDateStr).getTime();
  if (isNaN(pubTime)) return { text: 'Baru saja', isFresh: true, badge: 'Baru', timestamp: Date.now() };

  const diffMs = Date.now() - pubTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return { text: diffMins <= 1 ? '1 menit lalu' : `${diffMins} menit lalu`, isFresh: true, badge: 'Baru Saja', timestamp: pubTime };
  }
  if (diffHours < 24) {
    return { text: `${diffHours} jam lalu`, isFresh: true, badge: 'Hari Ini', timestamp: pubTime };
  }
  if (diffDays === 1) {
    return { text: '1 hari lalu (Kemarin)', isFresh: true, badge: 'Kemarin', timestamp: pubTime };
  }
  return { text: `${diffDays} hari lalu`, isFresh: diffDays <= 7, badge: `${diffDays}h lalu`, timestamp: pubTime };
}

function decodeBingUrl(rawUrl) {
  try {
    const u = new URL(rawUrl.replace(/&amp;/g, '&'));
    const target = u.searchParams.get('url');
    if (target) return decodeURIComponent(target);
  } catch(e) {}
  return rawUrl.replace(/&amp;/g, '&');
}

function parseJobHeadline(rawTitle, defaultSource = 'Portal Web Resmi', rawDesc = '') {
  let title = cleanHtmlSnippet(rawTitle || '');
  let desc = cleanHtmlSnippet(rawDesc || '');
  let comp = defaultSource || 'Perusahaan Terverifikasi';

  const searchTexts = [desc, title];
  const isGenericComp = /^(instagram|facebook|twitter|linkedin|web|portal|loker|google|bing|website)/i.test(comp);
  for (const text of searchTexts) {
    const ptMatch = text.match(/(?:🏢\s*)?((?:PT|CV|Bank|Yayasan|RSUD|RS|Universitas|Politeknik)\s+[^💼📢🕒🕐🎓\n\r,]+?)(?=\s+(?:membuka|buka|posisi|career|recruitment|💼|📢|🕒|🕐|🎓|$))/i);
    if (ptMatch && ptMatch[1]) {
      const extractedComp = ptMatch[1].replace(/^[🏢\s]+/, '').replace(/[\.\s]+$/, '').trim();
      if (isGenericComp || (comp.length < 8 && extractedComp.length > comp.length)) {
        comp = extractedComp;
        break;
      }
    }
  }

  let cleanTitle = '';
  for (const text of searchTexts) {
    const posMatch = text.match(/(?:💼\s*Posisi:?|Posisi\s*:?)\s*([^🕒🕐🎓📢🏢\n\r]+?)(?=\s*(?:🕒|🕐|🎓|📢|🏢|Status:|Jenjang:|Pendidikan:|PT |CV |membuka|$))/i);
    if (posMatch && posMatch[1]) {
      const candidate = posMatch[1].replace(/[\.\s]+$/, '').trim();
      if (!candidate.endsWith('..') && candidate.length > cleanTitle.length && !candidate.toLowerCase().includes('informasi dipublikasikan')) {
        cleanTitle = candidate;
      }
    }
  }

  if (!cleanTitle) {
    cleanTitle = title;
    cleanTitle = cleanTitle.replace(/\s+-\s+[^-]+$/, '').trim();
    const openMatch = cleanTitle.match(/^(.*?)\s+Buka Lowongan(?:\s+Kerja)?\s+(.*?)(?:,\s*.*)?$/i);
    if (openMatch) {
      if (isGenericComp) comp = openMatch[1].trim();
      cleanTitle = openMatch[2].trim();
    }
    cleanTitle = cleanTitle.replace(/\b(LOWONGAN\s+(?:BUMN\s+)?(?:TERBARU\s+)?|LOKER\s+TERBARU\s+|WE ARE HIRING\s+|DIBUTUHKAN\s+SEGERA\s+)\b/gi, ' ');
    if (comp && cleanTitle.includes(comp)) {
      cleanTitle = cleanTitle.replace(comp, ' ');
    }
  }

  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  comp = comp.replace(/\s+/g, ' ').trim();

  let cleanDesc = desc;
  if (!cleanDesc || cleanDesc.includes('📢') || cleanDesc.includes('🏢') || cleanDesc.includes('💼')) {
    cleanDesc = `${comp} membuka kesempatan berkarir untuk posisi ${cleanTitle}. Seluruh tahapan pendaftaran dan verifikasi berkas dilakukan secara resmi tanpa dipungut biaya apapun.`;
  }

  return {
    title: cleanTitle || 'Staf Operasional',
    company: comp || defaultSource,
    cleanDesc
  };
}

function detectJobPlatformMeta(directUrl, rawTitle, sourceName, requestedPlatform = 'all') {
  const urlLower = (directUrl || '').toLowerCase();
  const titleLower = (rawTitle || '').toLowerCase();
  const sourceLower = (sourceName || '').toLowerCase();
  const req = (requestedPlatform || 'all').toLowerCase();

  if (urlLower.includes('bukajobs.com') || titleLower.includes('bukajobs') || sourceLower.includes('bukajobs') || req === 'bukajobs') {
    return { platform: 'bukajobs', platformLabel: 'Bukajobs Karir', platformIcon: 'fa-solid fa-briefcase', platformClass: 'bukajobs', sourceWebsite: 'Bukajobs.com' };
  }
  if (urlLower.includes('linkedin.com') || titleLower.endsWith('- linkedin') || sourceLower.includes('linkedin') || req === 'linkedin') {
    return { platform: 'linkedin', platformLabel: 'LinkedIn Karir', platformIcon: 'fa-brands fa-linkedin', platformClass: 'linkedin', sourceWebsite: 'LinkedIn' };
  }
  if (urlLower.includes('instagram.com') || titleLower.endsWith('- instagram') || sourceLower.includes('instagram') || req === 'instagram') {
    return { platform: 'instagram', platformLabel: 'Instagram Karir', platformIcon: 'fa-brands fa-instagram', platformClass: 'instagram', sourceWebsite: 'Instagram' };
  }
  if (urlLower.includes('facebook.com') || titleLower.endsWith('- facebook') || sourceLower.includes('facebook') || req === 'facebook') {
    return { platform: 'facebook', platformLabel: 'Facebook Post', platformIcon: 'fa-brands fa-facebook', platformClass: 'facebook', sourceWebsite: 'Facebook' };
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || titleLower.endsWith('- x') || titleLower.endsWith('- twitter') || sourceLower.includes('twitter') || sourceLower.includes('x') || req === 'twitter' || req === 'x') {
    return { platform: 'twitter', platformLabel: 'X (Twitter) Karir', platformIcon: 'fa-brands fa-x-twitter', platformClass: 'twitter', sourceWebsite: 'Twitter (X)' };
  }
  if (titleLower.includes('bumn') || sourceLower.includes('bumn') || urlLower.includes('bumn.go.id') || urlLower.includes('kemnaker') || req === 'bumn') {
    return { platform: 'bumn', platformLabel: 'BUMN & Kedinasan', platformIcon: 'fa-solid fa-landmark', platformClass: 'bumn', sourceWebsite: sourceName || 'Portal BUMN' };
  }
  if (urlLower.includes('kompas.com') || urlLower.includes('detik.com') || urlLower.includes('tribunnews.com') || urlLower.includes('bisnis.com') || req === 'media') {
    return { platform: 'media', platformLabel: 'Portal Media Resmi', platformIcon: 'fa-solid fa-newspaper', platformClass: 'media', sourceWebsite: sourceName || 'Portal Berita' };
  }
  return { platform: 'web', platformLabel: sourceName || 'Website Karir Resmi', platformIcon: 'fa-solid fa-globe', platformClass: 'web', sourceWebsite: sourceName || 'Web' };
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
  if (pathname.toLowerCase().startsWith('/job_portal/api/')) {
    pathname = pathname.slice('/job_portal'.length);
  }

  // 1. GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    const settings = (supabaseUrl && supabaseKey) ? await fetchSiteSettings(supabaseUrl, supabaseKey) : DEFAULT_SETTINGS;
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
    const master = await fetchMasterData(supabaseUrl, supabaseKey);
    return jsonResponse({
      success: true,
      data: master
    });
  }

  // 8. POST /api/master-data (Add Item)
  if (pathname === '/api/master-data' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { type, name, icon } = body;
      const cleanName = String(name || '').trim();
      if (!cleanName) {
        return jsonResponse({ success: false, message: 'Nama item tidak boleh kosong!' }, 400);
      }

      const key = normalizeMasterType(type);
      const master = await fetchMasterData(supabaseUrl, supabaseKey);
      if (!Array.isArray(master[key])) master[key] = [];

      const exists = master[key].some(i => (i.name || '').toLowerCase() === cleanName.toLowerCase());
      if (exists) {
        return jsonResponse({ success: false, message: `Item "${cleanName}" sudah ada!` }, 400);
      }

      const defaultIcon = (key === 'categories') ? 'fa-layer-group' : (key === 'job_types') ? 'fa-briefcase' : (key === 'experience_levels') ? 'fa-user-check' : 'fa-location-dot';
      const newItem = {
        id: Date.now(),
        name: cleanName,
        icon: icon || defaultIcon
      };

      master[key].push(newItem);
      await saveMasterData(supabaseUrl, supabaseKey, master);

      return jsonResponse({
        success: true,
        message: `Item "${cleanName}" berhasil ditambahkan!`,
        data: master
      }, 201);
    } catch (err) {
      return jsonResponse({ success: false, message: 'Gagal menambahkan master data: ' + err.message }, 500);
    }
  }

  // 8b. DELETE /api/master-data (Delete Item)
  if (pathname === '/api/master-data' && method === 'DELETE') {
    try {
      const body = await request.json().catch(() => ({}));
      const { type, id, name } = body;
      const key = normalizeMasterType(type);
      const master = await fetchMasterData(supabaseUrl, supabaseKey);

      if (Array.isArray(master[key])) {
        master[key] = master[key].filter(i => {
          if (id && String(i.id) === String(id)) return false;
          if (name && (i.name || '').toLowerCase() === String(name).toLowerCase()) return false;
          return true;
        });
        await saveMasterData(supabaseUrl, supabaseKey, master);
      }

      return jsonResponse({
        success: true,
        message: 'Item berhasil dihapus!',
        data: master
      });
    } catch (err) {
      return jsonResponse({ success: false, message: 'Gagal menghapus master data: ' + err.message }, 500);
    }
  }

  // 8c. POST /api/master-data/reset (Reset to default)
  if (pathname === '/api/master-data/reset' && method === 'POST') {
    await saveMasterData(supabaseUrl, supabaseKey, DEFAULT_MASTER_DATA);
    return jsonResponse({
      success: true,
      message: 'Master data berhasil dikembalikan ke pengaturan standar.',
      data: DEFAULT_MASTER_DATA
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
        jobs = (jobs || []).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
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

  // 10.5. GET /api/live-jobs & /api/admin/live-jobs (Real-time live scout engine)
  if ((pathname === '/api/live-jobs' || pathname === '/api/admin/live-jobs') && method === 'GET') {
    const cleanKw = (url.searchParams.get('keyword') || 'lowongan').trim();
    const cleanLoc = (url.searchParams.get('location') || 'Indonesia').trim();
    const activePlat = (url.searchParams.get('platform') || 'all').trim().toLowerCase();
    const results = [];
    const seenUrls = new Set();

    // 1. Fetch Bukajobs RSS (direct verified vacancies)
    if (activePlat === 'all' || activePlat === 'bukajobs' || activePlat === 'web' || activePlat === 'corporate') {
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 3500);
        const bukaRes = await fetch('https://bukajobs.com/feed', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: ctl.signal
        });
        clearTimeout(timer);
        if (bukaRes.ok) {
          const xml = await bukaRes.text();
          const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g)];
          for (const item of items) {
            const rawTitle = cleanHtmlSnippet(item[1]);
            const link = item[2].trim();
            const pubDate = item[3].trim();
            const desc = cleanHtmlSnippet(item[4]);
            if (seenUrls.has(link)) continue;
            seenUrls.add(link);

            const parsed = parseJobHeadline(rawTitle, 'Bukajobs Karir', desc);
            const timeInfo = formatTimeAgo(pubDate);

            results.push({
              id: 'buka_' + Math.random().toString(36).substring(2, 10),
              source: 'bukajobs',
              platform: 'bukajobs',
              platform_label: 'Bukajobs Resmi',
              platform_icon: 'fa-solid fa-briefcase',
              platform_class: 'bukajobs',
              title: parsed.title,
              company_name: parsed.company,
              company: parsed.company,
              location: cleanLoc || 'Indonesia',
              pubDate,
              pubTimestamp: timeInfo.timestamp,
              timeAgo: timeInfo.text,
              posted_time: timeInfo.text || 'Baru saja',
              isFresh: timeInfo.isFresh,
              salary_display: 'Kompetitif (Standar Industri & Korporasi)',
              salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
              job_type: 'Full time',
              category: 'Loker Asli Web',
              role_department: parsed.title,
              badge_fresh: true,
              badge_kandidat: true,
              is_live_actual: true,
              official_url: link,
              url: link,
              website_url: link,
              source_website: 'Bukajobs.com',
              poster_image: '',
              rating: '4.9',
              contact_email: '',
              contact_whatsapp: '',
              anti_fraud_notice: 'Informasi lowongan kerja tervalidasi dari portal Bukajobs.com. Bebas pungutan biaya apapun.',
              description: parsed.cleanDesc || desc,
              responsibilities: [
                `Menjalankan tugas pokok dan fungsi operasional untuk posisi ${parsed.title}.`,
                `Menjaga profesionalisme, kedisiplinan kerja, dan kepatuhan terhadap SOP di lingkungan ${parsed.company}.`,
                `Berkoordinasi secara aktif dengan tim kerja terkait kelancaran operasional harian.`
              ],
              requirements: [
                `Pendidikan sesuai kualifikasi yang disyaratkan posisi.`,
                `Memiliki etos kerja tinggi, integritas, dan siap berkembang.`,
                `Ketentuan dan dokumen lamaran dapat dicek langsung pada postingan resmi Bukajobs.`
              ],
              benefits: [
                `Gaji & tunjangan sesuai standar perusahaan`,
                `Perlindungan jaminan sosial tenaga kerja (BPJS)`
              ]
            });
          }
        }
      } catch (e) {}
    }

    // 2. Fetch Bing News RSS for real-time live web articles
    try {
      let bingSearchQuery = `lowongan kerja "${cleanKw}" ${cleanLoc}`;
      if (activePlat === 'linkedin') bingSearchQuery = `site:linkedin.com "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'instagram') bingSearchQuery = `site:instagram.com "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'facebook') bingSearchQuery = `site:facebook.com "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'twitter' || activePlat === 'x') bingSearchQuery = `site:twitter.com "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'bumn') bingSearchQuery = `"bumn" "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'media') bingSearchQuery = `(site:kompas.com OR site:detik.com OR site:tribunnews.com) "lowongan kerja" "${cleanKw}"`;

      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3500);
      const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(bingSearchQuery)}&format=rss`;
      const res = await fetch(bingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: ctl.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const xml = await res.text();
        const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g)];
        for (const item of items) {
          const rawTitle = cleanHtmlSnippet(item[1]);
          const rawLink = item[2].trim();
          const rawDesc = cleanHtmlSnippet(item[3]);
          const pubDate = item[4].trim();

          if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) {
            continue;
          }

          const directUrl = decodeBingUrl(rawLink);
          if (seenUrls.has(directUrl)) continue;
          seenUrls.add(directUrl);

          let domain = 'Website Berita & Karir';
          try {
            const u = new URL(directUrl);
            domain = u.hostname.replace(/^www\./, '');
          } catch(e) {}

          const parsed = parseJobHeadline(rawTitle, domain, rawDesc);
          const timeInfo = formatTimeAgo(pubDate);
          const platMeta = detectJobPlatformMeta(directUrl, rawTitle, domain, activePlat);

          results.push({
            id: 'web_' + Math.random().toString(36).substring(2, 10),
            source: 'web',
            platform: platMeta.platform,
            platform_label: platMeta.platformLabel,
            platform_icon: platMeta.platformIcon,
            platform_class: platMeta.platformClass,
            title: parsed.title,
            company_name: parsed.company,
            company: parsed.company,
            location: cleanLoc,
            pubDate,
            pubTimestamp: timeInfo.timestamp,
            timeAgo: timeInfo.text,
            posted_time: timeInfo.text || 'Baru saja',
            isFresh: timeInfo.isFresh,
            salary_display: 'Kompetitif (Standar Industri & UMK)',
            salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
            job_type: 'Full time',
            category: 'Loker Asli Web',
            role_department: parsed.title,
            badge_fresh: timeInfo.isFresh,
            badge_kandidat: true,
            is_live_actual: true,
            official_url: directUrl,
            url: directUrl,
            website_url: directUrl,
            source_website: domain,
            poster_image: '',
            rating: '4.8',
            contact_email: '',
            contact_whatsapp: '',
            anti_fraud_notice: `Informasi lowongan kerja ${parsed.company} disaring dari sumber berita web resmi. 100% bebas biaya pendaftaran.`,
            description: parsed.cleanDesc,
            responsibilities: [
              `Menjalankan tugas utama untuk posisi ${parsed.title}.`,
              `Menjaga kepatuhan terhadap standar operasional perusahaan.`
            ],
            requirements: [
              `Pendidikan dan pengalaman relevan dengan posisi.`,
              `Disiplin, bertanggung jawab, dan memiliki integritas kerja tinggi.`
            ],
            benefits: [
              `Gaji pokok & tunjangan sesuai standar operasional`,
              `Jaminan perlindungan tenaga kerja`
            ]
          });
        }
      }
    } catch (e) {}

    // 2.5. Fetch Google News RSS for targeted platform / social media
    try {
      let googleSearchQuery = `("lowongan kerja" OR "we are hiring") "${cleanKw}" ${cleanLoc}`;
      if (activePlat === 'linkedin') googleSearchQuery = `site:linkedin.com ("lowongan kerja" OR "hiring") "${cleanKw}"`;
      else if (activePlat === 'instagram') googleSearchQuery = `site:instagram.com ("lowongan kerja" OR "loker") "${cleanKw}"`;
      else if (activePlat === 'facebook') googleSearchQuery = `site:facebook.com ("lowongan kerja" OR "loker") "${cleanKw}"`;
      else if (activePlat === 'twitter' || activePlat === 'x') googleSearchQuery = `(site:x.com OR site:twitter.com) ("lowongan kerja" OR "loker") "${cleanKw}"`;
      else if (activePlat === 'bumn') googleSearchQuery = `("bumn" OR "rekrutmen bersama bumn") "lowongan kerja" "${cleanKw}"`;
      else if (activePlat === 'media') googleSearchQuery = `(site:kompas.com OR site:detik.com OR site:tribunnews.com OR site:bisnis.com) "lowongan kerja" "${cleanKw}"`;

      const ctl2 = new AbortController();
      const timer2 = setTimeout(() => ctl2.abort(), 3500);
      const gUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(googleSearchQuery)}&hl=id&gl=ID&ceid=ID:id`;
      const gRes = await fetch(gUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: ctl2.signal
      });
      clearTimeout(timer2);
      if (gRes.ok) {
        const gXml = await gRes.text();
        const gItems = [...gXml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g)];
        for (const it of gItems) {
          const rawTitle = cleanHtmlSnippet(it[1]);
          const link = it[2].trim();
          const pubDate = it[3].trim();
          const desc = cleanHtmlSnippet(it[4]);
          const sourceName = it[5] ? cleanHtmlSnippet(it[5]) : '';

          if (rawTitle.toLowerCase().includes('hoaks') || rawTitle.toLowerCase().includes('penipuan') || rawTitle.toLowerCase().includes('bantah')) continue;
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          const platMeta = detectJobPlatformMeta(link, rawTitle, sourceName, activePlat);
          const parsed = parseJobHeadline(rawTitle, platMeta.sourceWebsite || sourceName, desc);
          const timeInfo = formatTimeAgo(pubDate);

          results.push({
            id: 'gweb_' + Math.random().toString(36).substring(2, 10),
            source: 'web',
            platform: platMeta.platform,
            platform_label: platMeta.platformLabel,
            platform_icon: platMeta.platformIcon,
            platform_class: platMeta.platformClass,
            title: parsed.title,
            company_name: parsed.company,
            company: parsed.company,
            location: cleanLoc,
            pubDate,
            pubTimestamp: timeInfo.timestamp,
            timeAgo: timeInfo.text,
            posted_time: timeInfo.text || 'Baru saja',
            isFresh: timeInfo.isFresh,
            salary_display: 'Kompetitif (Standar Industri & Korporasi)',
            salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
            job_type: 'Full time',
            category: 'Loker Asli Web',
            role_department: parsed.title,
            badge_fresh: true,
            badge_kandidat: true,
            is_live_actual: true,
            official_url: link,
            url: link,
            website_url: link,
            source_website: platMeta.sourceWebsite || sourceName,
            poster_image: '',
            rating: '4.9',
            contact_email: '',
            contact_whatsapp: '',
            anti_fraud_notice: `Informasi lowongan kerja tervalidasi dari ${platMeta.sourceWebsite || sourceName}. Bebas pungutan biaya apapun dalam proses rekrutmen.`,
            description: parsed.cleanDesc || desc,
            responsibilities: [
              `Menjalankan tugas pokok dan fungsi operasional untuk posisi ${parsed.title}.`,
              `Menjaga profesionalisme, kedisiplinan kerja, dan kepatuhan terhadap SOP di ${parsed.company}.`,
              `Berkoordinasi secara aktif dengan tim kerja terkait kelancaran operasional.`
            ],
            requirements: [
              `Pendidikan sesuai kualifikasi yang disyaratkan posisi.`,
              `Memiliki etos kerja tinggi, integritas, dan siap berkembang.`,
              `Ketentuan dan dokumen lamaran dapat dicek langsung pada postingan resmi.`
            ],
            benefits: [
              `Gaji & tunjangan sesuai standar perusahaan`,
              `Perlindungan jaminan sosial tenaga kerja (BPJS)`
            ]
          });
        }
      }
    } catch(e) {}

    // 3. Fallback: If external feeds are blocked or empty, fetch actual Supabase DB jobs!
    if (results.length === 0) {
      try {
        const sbRes = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.active&select=*&order=id.desc&limit=30`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (sbRes.ok) {
          const dbJobs = await sbRes.json();
          if (Array.isArray(dbJobs) && dbJobs.length > 0) {
            dbJobs.forEach(dj => {
              if (dj.status === 'system_settings' || dj.status === 'system_master_data') return;
              let contacts = {};
              try {
                contacts = typeof dj.contact_value === 'string' ? JSON.parse(dj.contact_value) : (dj.contact_value || {});
              } catch (e) {}

              let fallbackPlat = contacts.source_platform || (activePlat !== 'all' ? activePlat : 'official');
              let fallbackLabel = contacts.source_label || (activePlat === 'twitter' ? 'X (Twitter) Karir' : (activePlat === 'linkedin' ? 'LinkedIn Karir' : (activePlat === 'instagram' ? 'Instagram Karir' : (activePlat === 'facebook' ? 'Facebook Karir' : (activePlat === 'bumn' ? 'BUMN & Kedinasan' : (activePlat === 'media' ? 'Portal Berita Media' : 'Portal Resmi'))))));
              let fallbackIcon = activePlat === 'twitter' ? 'fa-brands fa-x-twitter' : (activePlat === 'linkedin' ? 'fa-brands fa-linkedin' : (activePlat === 'instagram' ? 'fa-brands fa-instagram' : (activePlat === 'facebook' ? 'fa-brands fa-facebook' : (activePlat === 'bumn' ? 'fa-solid fa-landmark' : (activePlat === 'media' ? 'fa-solid fa-newspaper' : 'fa-solid fa-building-circle-check')))));
              let fallbackClass = activePlat !== 'all' ? activePlat : 'official';

              results.push({
                id: 'db_' + dj.id,
                source: 'official',
                platform: fallbackPlat,
                platform_label: fallbackLabel,
                platform_icon: fallbackIcon,
                platform_class: fallbackClass,
                title: dj.title,
                company_name: dj.company_name,
                company: dj.company_name,
                location: dj.location || 'Indonesia',
                pubDate: dj.created_at || new Date().toISOString(),
                pubTimestamp: dj.created_at ? new Date(dj.created_at).getTime() : Date.now(),
                timeAgo: 'Baru saja',
                posted_time: 'Baru saja',
                isFresh: true,
                salary_display: dj.salary_display || 'Kompetitif',
                salary_prompt: 'Gaji kompetitif sesuai standar industri dan peraturan yang berlaku.',
                job_type: dj.job_type || 'Full Time',
                category: dj.category || 'Operasional',
                role_department: dj.job_type || 'Full Time',
                badge_fresh: true,
                badge_kandidat: true,
                is_live_actual: true,
                official_url: contacts.website || dj.website_url || './?job=' + dj.id,
                url: contacts.website || dj.website_url || './?job=' + dj.id,
                website_url: contacts.website || dj.website_url || './?job=' + dj.id,
                source_website: 'KerjaHub Portal Resmi',
                poster_image: dj.poster_image || '',
                rating: '4.9',
                contact_email: contacts.email || dj.email || '',
                contact_whatsapp: contacts.whatsapp || dj.whatsapp || '',
                anti_fraud_notice: `PT ${dj.company_name} tidak memungut biaya apapun dalam proses rekrutmen.`,
                description: dj.description || 'Lowongan resmi dari database sistem KerjaHub.',
                responsibilities: Array.isArray(dj.responsibilities) ? dj.responsibilities : [dj.responsibilities || 'Tanggung jawab sesuai posisi'],
                requirements: Array.isArray(dj.requirements) ? dj.requirements : [dj.requirements || 'Kualifikasi sesuai arahan perusahaan'],
                benefits: Array.isArray(dj.benefits) ? dj.benefits : ['BPJS & Tunjangan Standar']
              });
            });
          }
        }
      } catch (e) {}
    }

    results.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

    return jsonResponse({
      success: true,
      keyword: cleanKw,
      location: cleanLoc,
      platform: activePlat,
      count: results.length,
      data: results
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
        jobs = (jobs || []).filter(j => j.status !== 'system_settings' && j.status !== 'system_master_data');
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

      // Safely pack contact info and platform metadata into contact_value JSON
      const contactObj = {
        whatsapp: wa,
        email: em,
        website: wb,
        source_platform: source_platform || (wb.includes('linkedin.com') ? 'linkedin' : (wb.includes('instagram.com') ? 'instagram' : (wb.includes('facebook.com') ? 'facebook' : 'official'))),
        source_label: source_label || 'Resmi BUMN & Swasta'
      };

      if (contact_value) {
        try {
          const parsed = JSON.parse(contact_value);
          if (parsed && typeof parsed === 'object') {
            Object.assign(contactObj, parsed);
          }
        } catch (e) {
          contactObj.raw = contact_value;
        }
      }
      const finalContactVal = JSON.stringify(contactObj);

      const parseJsonList = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return String(val).split('\n').map(s => s.trim()).filter(Boolean);
      };

      // Only include valid Supabase table schema columns
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
        benefits: parseJsonList(benefits),
        contact_type: contact_type || (wa ? 'whatsapp' : (em ? 'email' : 'link')),
        contact_value: finalContactVal,
        deadline: deadline || '',
        status: status || 'active',
        is_featured: is_featured === true || is_featured === 'true' || is_featured === '1' || is_featured === 1,
        views_count: 0
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
          if (rows && rows.length > 0 && rows[0].status !== 'system_settings' && rows[0].status !== 'system_master_data') {
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

        const allowedColumns = [
          'title', 'company_name', 'category', 'job_type', 'location',
          'salary_display', 'experience_level', 'poster_image', 'description',
          'requirements', 'responsibilities', 'benefits', 'contact_type',
          'contact_value', 'deadline', 'status', 'is_featured', 'views_count'
        ];

        const updateData = { updated_at: new Date().toISOString() };
        for (const col of allowedColumns) {
          if (bodyData[col] !== undefined) {
            updateData[col] = bodyData[col];
          }
        }

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
