const https = require('https');

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, body: d, cookies });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  const host = 'election-system-production-437f.up.railway.app';
  
  // Login
  console.log('Logging in...');
  const login = await req({
    hostname: host, path: '/api/access', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { action: 'owner-login', ownerPassword: 'YOUR_ADMIN_PASSWORD' });
  
  const cookie = login.cookies.find(c => c.startsWith('election_auth='))?.split(';')[0];
  if (!cookie) { console.log('Auth failed'); return; }
  console.log('Auth OK\n');
  
  const h = { 'Content-Type': 'application/json', 'Cookie': cookie };
  
  // Test all APIs
  const endpoints = [
    { method: 'GET', path: '/api/comprehensive-indicators' },
    { method: 'GET', path: '/api/indicators' },
    { method: 'GET', path: '/api/composite-indicators' },
    { method: 'GET', path: '/api/dashboard' },
    { method: 'GET', path: '/api/stats' },
    { method: 'GET', path: '/api/tribes' },
    { method: 'GET', path: '/api/commission' },
    { method: 'GET', path: '/api/competitors' },
    { method: 'GET', path: '/api/volunteers' },
    { method: 'GET', path: '/api/services' },
    { method: 'GET', path: '/api/voters' },
    { method: 'GET', path: '/api/electoral-keys' },
    { method: 'GET', path: '/api/tasks' },
    { method: 'GET', path: '/api/analysis' },
    { method: 'GET', path: '/api/sms-campaigns' },
    { method: 'GET', path: '/api/early-warnings' },
    { method: 'GET', path: '/api/alerts' },
    { method: 'GET', path: '/api/dynamic-indicators' },
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await req({ hostname: host, path: ep.path, method: ep.method, headers: h });
      const ok = r.status < 400;
      let body = '';
      try {
        const parsed = JSON.parse(r.body);
        body = Array.isArray(parsed) ? `array[${parsed.length}]` : `obj keys: ${Object.keys(parsed).slice(0,5).join(',')}`;
      } catch { body = r.body.substring(0, 80); }
      console.log(`${ok ? 'OK' : 'ERR'} ${r.status} ${ep.method} ${ep.path} → ${body}`);
    } catch(e) { console.log(`FAIL ${ep.method} ${ep.path} → ${e.message}`); }
  }
}

main().catch(console.error);
