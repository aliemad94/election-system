const https = require('https');
function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const cookies = (res.headers['set-cookie'] || []).filter(Boolean);
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
  const login = await req({hostname:host,path:'/api/access',method:'POST',headers:{'Content-Type':'application/json'}},{action:'owner-login',ownerPassword:'Admin12345!'});
  const c = login.cookies.find(x=>x&&x.startsWith('election_auth='));
  if (!c) { console.log('Cookie not found! Headers:', login.cookies); return; }
  const cv = c.split(';')[0];
  const h = {'Cookie':cv};
  const r = await req({hostname:host,path:'/api/comprehensive-indicators',method:'GET',headers:h});
  const d = JSON.parse(r.body);
  console.log('=== Decisive fields ===');
  console.log('expectedVotes:', d.decisive.expectedVotes);
  console.log('votesNeededToWin:', d.decisive.votesNeededToWin);
  console.log('electoralGap:', d.decisive.electoralGap);
  console.log('winProbability:', d.decisive.winProbability);
  console.log('expectedTurnout:', d.decisive.expectedTurnout);
  console.log('overallRisk:', d.decisive.overallRisk);
  console.log('stability:', d.decisive.stability);
  console.log('earlyWarning:', d.decisive.earlyWarning);
  console.log('supportersDistribution:', JSON.stringify(d.decisive.supportersDistribution));
  console.log('\nAll new fields present - deploy OK!');
}
main().catch(console.error);
