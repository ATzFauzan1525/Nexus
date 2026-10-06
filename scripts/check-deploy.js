/**
 * Cek kesehatan deployment: backend, login, dan proxy API di frontend.
 *
 * Pemakaian:
 *   npm run check:deploy
 *   npm run check:deploy -- https://url-backend-baru
 *   FRONTEND_URL=https://... npm run check:deploy
 */
const BACKEND_URL = (process.argv[2] || process.env.BACKEND_URL || 'https://sidis-api.onrender.com').replace(/\/$/, '');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://sidis-nexus.vercel.app').replace(/\/$/, '');

const results = [];
const ok = (name, detail) => { results.push({ name, pass: true, detail }); console.log(`  PASS  ${name} — ${detail}`); };
const fail = (name, detail) => { results.push({ name, pass: false, detail }); console.log(`  GAGAL ${name} — ${detail}`); };

async function checkHealth() {
  const name = 'Backend /api/health';
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* bukan JSON */ }
    if (res.ok && data && data.status === 'ok') {
      ok(name, `${BACKEND_URL} merespons {"status":"ok"}`);
    } else if (data && data.code === 404 && /not found/i.test(data.message || '')) {
      fail(name, 'Railway balas "Application not found" — service di Railway sudah mati/hilang/di-rename. Hidupkan lagi service-nya.');
    } else if (!data) {
      fail(name, `Respons bukan JSON (HTTP ${res.status}) — kemungkinan salah URL backend.`);
    } else {
      fail(name, `HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    fail(name, `Tidak bisa terhubung: ${err.message}`);
  }
}

async function checkLogin() {
  const name = 'Backend POST /api/auth/login';
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* bukan JSON */ }
    if (res.ok && data && data.token) {
      ok(name, 'Login sukses, token diterima.');
    } else if (res.status === 401) {
      fail(name, `Server jalan tapi ditolak (401): ${data && data.message}. Cek DATABASE_URL (data seed) atau akun.`);
    } else if (res.status === 500) {
      fail(name, `Server error 500: ${data && data.message}. Cek env JWT_SECRET / DATABASE_URL di Railway.`);
    } else {
      fail(name, `HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    fail(name, `Tidak bisa terhubung: ${err.message}`);
  }
}

async function checkFrontendProxy() {
  const name = 'Frontend /api (proxy Vercel)';
  try {
    const res = await fetch(`${FRONTEND_URL}/api/health`, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* bukan JSON */ }
    if (res.ok && data && data.status === 'ok') {
      ok(name, 'Proxy /api → backend berfungsi (respons JSON).');
    } else if (!data) {
      fail(name, `Mengembalikan HTML (HTTP ${res.status}) — rewrite proxy di vercel.json belum aktif. Deploy ulang & pastikan tidak ada rewrite lain yang menimpa.`);
    } else {
      fail(name, `HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    fail(name, `Tidak bisa terhubung: ${err.message}`);
  }
}

(async () => {
  console.log(`Cek deployment:\n  Backend : ${BACKEND_URL}\n  Frontend: ${FRONTEND_URL}\n`);
  await checkHealth();
  await checkLogin();
  await checkFrontendProxy();

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\nHasil: ${results.length - failed}/${results.length} lolos.`);
  if (failed > 0) {
    console.log('\nLangkah perbaikan:');
    console.log('1. Backend mati → deploy/hidupkan service di Railway, set env DATABASE_URL, JWT_SECRET, CORS_ORIGIN.');
    console.log('2. URL backend berubah → update "destination" di vercel.json + VITE_API_URL di Vercel, lalu redeploy.');
    console.log('3. Frontend balas HTML → pastikan rewrite proxy /api di vercel.json ter-deploy (redeploy Vercel).');
    process.exit(1);
  }
})();
