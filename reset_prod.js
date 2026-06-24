const https = require('https');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, headers: res.headers, body: data, cookies });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const host = 'election-system-production-437f.up.railway.app';
  
  // Step 1: Login as admin
  console.log('1. Logging in as admin...');
  const loginRes = await request({
    hostname: host,
    path: '/api/access',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { action: 'owner-login', ownerPassword: 'YOUR_ADMIN_PASSWORD' });
  
  console.log('   Status:', loginRes.status);
  console.log('   Body:', loginRes.body);
  
  const authCookie = loginRes.cookies.find(c => c.startsWith('election_auth='));
  if (!authCookie) {
    console.log('   ERROR: No auth cookie received');
    process.exit(1);
  }
  const cookieValue = authCookie.split(';')[0];
  console.log('   Cookie:', cookieValue.substring(0, 50) + '...');
  
  // Step 2: FULL reset - everything including tribes and IHEC
  console.log('\n2. FULL reset - clearing tribes + IHEC + all electoral data...');
  const resetRes = await request({
    hostname: host,
    path: '/api/reset',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue
    }
  }, { confirmReset: 'CONFIRM_RESET_ALL_DATA' });
  
  console.log('   Status:', resetRes.status);
  console.log('   Body:', resetRes.body);
  
  // Step 3: Verify - Count tables
  console.log('\n3. Verifying - counting remaining records...');
  
  const verifyRes = await request({
    hostname: host,
    path: '/api/stats',
    method: 'GET',
    headers: { 'Cookie': cookieValue }
  });
  console.log('   Stats:', verifyRes.body);
}

main().catch(e => console.error(e));
