const http = require('https');
const HOST = 'election-system-production-437f.up.railway.app';

function req(path, method, body, cookie) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { 
      hostname: HOST, 
      path, 
      method, 
      headers: {} 
    };
    if (cookie) opts.headers.Cookie = cookie;
    if (data) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ 
        status: res.statusCode, 
        body: d.substring(0, 500), 
        cookie: res.headers['set-cookie'] 
      }));
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  // Login
  const login = await req('/api/auth/login', 'POST', { username: 'admin', password: 'Admin12345!' });
  console.log('Login status:', login.status);
  console.log('Login body:', login.body);
  if (login.cookie) console.log('Cookie set:', login.cookie[0].substring(0, 50) + '...');
  
  if (login.status !== 200) {
    console.log('\nLogin failed - checking if mustChangePwd is the issue');
    return;
  }
  
  const cookie = login.cookie?.[0]?.split(';')[0] || '';
  
  // Test critical endpoints
  const eps = [
    '/api/dashboard',
    '/api/comprehensive-indicators',
    '/api/electoral-keys',
    '/api/voters?limit=5',
    '/api/tribes',
    '/api/commission',
    '/api/competitors',
    '/api/services',
    '/api/volunteers',
    '/api/tasks',
    '/api/alerts',
    '/api/stats',
    '/api/early-warnings',
    '/api/composite-indicators',
    '/api/dynamic-indicators',
    '/api/election-results',
    '/api/voters/stats',
    '/api/search?q=test',
  ];
  
  console.log('\n=== API ENDPOINT TEST ===');
  let pass = 0, fail = 0;
  for (const ep of eps) {
    const r = await req(ep, 'GET', null, cookie);
    const ok = r.status === 200;
    if (ok) pass++; else fail++;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + ep + ' -> ' + r.status + (ok ? '' : ' | ' + r.body.substring(0, 100)));
  }
  console.log('\nResult: ' + pass + '/' + eps.length + ' passed, ' + fail + ' failed');
})();
