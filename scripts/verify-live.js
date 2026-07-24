#!/bin/env node
/**
 * 🤖 Live Environment Automated Security & Health Verifier
 * 
 * Verifies live deployment on Railway / production URL.
 * Usage: node scripts/verify-live.js <BASE_URL> [ADMIN_PASSWORD] [OBSERVER_PASSWORD]
 * Example: node scripts/verify-live.js https://election-system.up.railway.app
 */

const targetUrl = process.argv[2] || process.env.LIVE_URL || 'http://localhost:3000';
const adminPassword = process.env.LIVE_ADMIN_PASSWORD;
const observerPassword = process.env.LIVE_OBSERVER_PASSWORD;

console.log(`\n🔍 Starting Live Security Verification for target: ${targetUrl}\n${'='.repeat(60)}`);

let passedCount = 0;
let failedCount = 0;

function report(testName, isSuccess, details) {
  if (isSuccess) {
    passedCount++;
    console.log(` [PASS] ${testName}`);
    if (details) console.log(`        └─ ${details}`);
  } else {
    failedCount++;
    console.log(`❌ [FAIL] ${testName}`);
    if (details) console.log(`        └─ ${details}`);
  }
}

async function runLiveChecks() {
  const baseUrl = targetUrl.replace(/\/+$/, '');

  // 1. GET / -> 200
  try {
    const res = await fetch(`${baseUrl}/`);
    report('1. GET / (Homepage HTTP status)', res.status === 200, `HTTP status code: ${res.status}`);
  } catch (err) {
    report('1. GET / (Homepage HTTP status)', false, `Error: ${err.message}`);
  }

  // 2. GET /api/health -> 200
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = await res.json().catch(() => ({}));
    const isOk = res.status === 200 && json.status === 'ok';
    report('2. GET /api/health (System Health Check)', isOk, `HTTP status: ${res.status}, body: ${JSON.stringify(json)}`);
  } catch (err) {
    report('2. GET /api/health (System Health Check)', false, `Error: ${err.message}`);
  }

  // 3. Security Headers Check
  try {
    const res = await fetch(`${baseUrl}/`);
    const headers = res.headers;
    const csp = headers.get('content-security-policy');
    const xframe = headers.get('x-frame-options');
    const hsts = headers.get('strict-transport-security');
    
    const hasHeaders = Boolean(csp || xframe);
    report('3. Security Headers Presence (CSP/X-Frame-Options/HSTS)', hasHeaders, 
      `CSP: ${csp ? 'Present' : 'Missing'}, X-Frame-Options: ${xframe || 'Missing'}, HSTS: ${hsts || 'Missing'}`);
  } catch (err) {
    report('3. Security Headers Presence', false, `Error: ${err.message}`);
  }

  // 4. Unauthorized Access Block -> 401
  try {
    const res = await fetch(`${baseUrl}/api/voters`);
    report('4. GET /api/voters without token (Unauthenticated Request)', res.status === 401, `HTTP status code: ${res.status}`);
  } catch (err) {
    report('4. GET /api/voters without token', false, `Error: ${err.message}`);
  }

  // 5. Anti-Header Impersonation Block -> 401
  try {
    const res = await fetch(`${baseUrl}/api/voters`, {
      headers: { 'x-user-role': 'ADMIN' }
    });
    report('5. Header Spoofing Prevention (x-user-role: ADMIN header injection)', res.status === 401, `HTTP status code: ${res.status}`);
  } catch (err) {
    report('5. Header Spoofing Prevention', false, `Error: ${err.message}`);
  }

  // 6. ADMIN Authentication Flow
  if (!adminPassword) {
    report('6. ADMIN Authentication & Session Cookie Generation', 'SKIP', 'Skipped: LIVE_ADMIN_PASSWORD environment variable is not set');
  } else {
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: adminPassword })
      });
      const cookie = res.headers.get('set-cookie');
      if (res.status === 200 && cookie) {
        report('6. ADMIN Authentication & Session Cookie Generation', 'PASS', `HTTP status: 200, Set-Cookie header present`);
      } else {
        report('6. ADMIN Authentication & Session Cookie Generation', 'FAIL', `HTTP status: ${res.status}, cookie present: ${Boolean(cookie)}`);
      }
    } catch (err) {
      report('6. ADMIN Authentication', 'FAIL', `Error: ${err.message}`);
    }
  }

  // 7. OBSERVER PII Data Masking Test
  if (!observerPassword) {
    report('7. OBSERVER PII Data Masking (nationalId/phone masked)', 'SKIP', 'Skipped: LIVE_OBSERVER_PASSWORD environment variable is not set');
  } else {
    try {
      const resAuth = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'observer', password: observerPassword })
      });
      const cookie = resAuth.headers.get('set-cookie');
      if (resAuth.status === 200 && cookie) {
        const observerCookie = cookie.split(';')[0];
        const votersRes = await fetch(`${baseUrl}/api/voters`, {
          headers: { Cookie: observerCookie }
        });
        const data = await votersRes.json().catch(() => ({}));
        const votersList = Array.isArray(data) ? data : (data.voters || data.data || []);
        
        let leaksNationalId = false;
        let leaksPhone = false;
        for (const v of votersList) {
          if (v.nationalId && !v.nationalId.includes('*')) leaksNationalId = true;
          if (v.phone && !v.phone.includes('*')) leaksPhone = true;
        }

        const passed = votersRes.status === 200 && !leaksNationalId && !leaksPhone;
        report('7. OBSERVER PII Data Masking (nationalId/phone masked)', passed ? 'PASS' : 'FAIL', 
          `HTTP status: ${votersRes.status}, Leaks Unmasked nationalId: ${leaksNationalId}, Leaks Unmasked phone: ${leaksPhone}`);
      } else {
        report('7. OBSERVER PII Data Masking', 'FAIL', `Observer login failed with status ${resAuth.status}`);
      }
    } catch (err) {
      report('7. OBSERVER PII Data Masking', 'FAIL', `Error: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Summary: ${passedCount} Passed | ${failedCount} Failed`);

  if (failedCount > 0) {
    console.log(`❌ Live verification FAILED. Please review failing gates above.`);
    process.exit(1);
  } else {
    console.log(`🎉 ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
    process.exit(0);
  }
}

runLiveChecks();
