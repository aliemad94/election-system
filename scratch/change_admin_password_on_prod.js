const https = require('https');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { ...(options.headers || {}) };
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request({ ...options, headers }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, headers: res.headers, body: responseBody, cookies });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const host = 'election-system-production-437f.up.railway.app';
  
  // Step 1: Login as admin using old password
  console.log('1. Logging in as admin with old password jRiOOlD6UDhlQPAX...');
  const loginRes = await request({
    hostname: host,
    path: '/api/access',
    method: 'POST'
  }, { action: 'owner-login', ownerPassword: 'jRiOOlD6UDhlQPAX' });
  
  console.log('   Login Status:', loginRes.status);
  console.log('   Login Body:', loginRes.body);
  
  const authCookie = loginRes.cookies.find(c => c.startsWith('election_auth='));
  if (!authCookie) {
    console.log('   ERROR: No auth cookie received. Maybe password already changed?');
    process.exit(1);
  }
  const cookieValue = authCookie.split(';')[0];
  
  // Step 2: Change password to YOUR_ADMIN_PASSWORD
  console.log('\n2. Changing password to YOUR_ADMIN_PASSWORD...');
  const changeRes = await request({
    hostname: host,
    path: '/api/access',
    method: 'POST',
    headers: { 'Cookie': cookieValue }
  }, { 
    action: 'change-password', 
    currentPassword: 'jRiOOlD6UDhlQPAX', 
    newPassword: 'YOUR_ADMIN_PASSWORD' 
  });
  
  console.log('   Change Status:', changeRes.status);
  console.log('   Change Body:', changeRes.body);
  if (changeRes.status === 200) {
    console.log('\n🎉 Password successfully updated to YOUR_ADMIN_PASSWORD on election-system-production-437f.up.railway.app');
  } else {
    console.log('❌ Failed to update password.');
  }
}

main().catch(e => console.error(e));
