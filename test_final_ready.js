const http = require('https');
const HOST = 'election-system-production-437f.up.railway.app';

function req(path, method, body, cookie) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname: HOST, path, method, headers: {} };
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
  // Login via /api/access (the actual login flow used by the frontend)
  console.log('=== Testing /api/access (owner login) ===');
  const login = await req('/api/access', 'POST', { action: 'owner-login', ownerPassword: 'YOUR_ADMIN_PASSWORD' });
  console.log('Owner login:', login.status, login.body.substring(0, 200));
  
  if (login.status !== 200) {
    // Try as visitor
    const visitorLogin = await req('/api/access', 'POST', { action: 'login', password: 'YOUR_USER_PASSWORD' });
    console.log('Visitor login:', visitorLogin.status, visitorLogin.body.substring(0, 200));
    return;
  }
  
  const cookie = login.cookie?.[0]?.split(';')[0] || '';
  console.log('Cookie:', cookie.substring(0, 50) + '...');
  
  // Test all endpoints
  const eps = [
    '/api/dashboard',
    '/api/comprehensive-indicators',
    '/api/indicators',
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
  ];
  
  console.log('\n=== API ENDPOINTS ===');
  let pass = 0, fail = 0;
  for (const ep of eps) {
    const r = await req(ep, 'GET', null, cookie);
    const ok = r.status === 200;
    if (ok) pass++; else fail++;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + ep + ' -> ' + r.status + (ok ? '' : ' | ' + r.body.substring(0, 80)));
  }
  
  console.log('\n=== WRITE OPERATIONS ===');
  
  // Create tribe
  const tribe = await req('/api/tribes', 'POST', {
    name: 'عشيرة الاختبار النهائي',
    district: 'الرفاعي',
    influenceRating: 4,
    population: 5000
  }, cookie);
  console.log('Create tribe:', tribe.status, tribe.body.substring(0, 100));
  
  // Create electoral key
  const key = await req('/api/electoral-keys', 'POST', {
    keyCode: 'READY-001',
    firstName: 'مفتاح',
    fatherName: 'اختبار',
    grandfatherName: 'الجاهزية',
    fourthName: 'النهائي',
    gender: 'ذكر',
    birthDate: '1985-03-15',
    education: 'ماجستير',
    profession: 'محامي',
    phone: '07700000001',
    district: 'الرفاعي',
    subDistrict: 'الرفاعي المركز',
    pollingCenter: 'مركز الرفاعي'
  }, cookie);
  console.log('Create key:', key.status, key.body.substring(0, 100));
  
  // Get the key ID
  let keyId = null;
  if (key.status === 201 || key.status === 200) {
    try { keyId = JSON.parse(key.body).id; } catch(e) {}
  }
  
  // Create voter
  const voter = await req('/api/voters', 'POST', {
    firstName: 'ناخب',
    fatherName: 'اختبار',
    grandfatherName: 'اول',
    fourthName: 'حقيقي',
    gender: 'ذكر',
    birthDate: '1990-01-01',
    keyId: keyId || 'dummy-id',
    district: 'الرفاعي',
    subDistrict: 'الرفاعي المركز',
    pollingCenter: 'مركز الرفاعي',
    ballotStation: '1'
  }, cookie);
  console.log('Create voter:', voter.status, voter.body.substring(0, 100));
  
  // Cleanup
  const reset = await req('/api/reset', 'POST', {}, cookie);
  console.log('Reset:', reset.status);
  
  console.log('\n=== FINAL SCORE ===');
  console.log('Read APIs: ' + pass + '/' + eps.length + ' passed');
  console.log('Write APIs: tested (tribe, key, voter, reset)');
})();
