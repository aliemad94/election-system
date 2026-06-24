const http=require('https');const H='election-system-production-437f.up.railway.app';
function req(p,m,b,c){return new Promise(R=>{const d=b?JSON.stringify(b):null;const o={hostname:H,path:p,method:m,headers:{}};if(c)o.headers.Cookie=c;if(d){o.headers['Content-Type']='application/json';o.headers['Content-Length']=Buffer.byteLength(d)}const rq=http.request(o,res=>{let x='';res.on('data',z=>x+=z);res.on('end',()=>R({s:res.statusCode,b:x,ck:res.headers['set-cookie']}))});rq.on('error',e=>R({s:0,e:e.message}));if(d)rq.write(d);rq.end()})}
(async()=>{
  const L=await req('/api/access','POST',{action:'owner-login',ownerPassword:'DhiQarOwner2026!'});
  const ck=L.ck?.[0]?.split(';')[0]||'';
  const keysResp=await req('/api/electoral-keys','GET',null,ck);
  const list=JSON.parse(keysResp.b);
  const id=Array.isArray(list)?list[0]?.id:list?.keys?.[0]?.id;
  if(!id){console.log('No keys');return}
  console.log('Key ID:',id);
  const ev=await req('/api/electoral-keys/'+id+'/evaluate','POST',null,ck);
  console.log('Status:',ev.s);
  const d=JSON.parse(ev.b);
  if(d.result){
    console.log('Classification:',d.result.classification);
    console.log('Net Voters:',d.result.netVoters);
    console.log('Efficiency:',d.result.efficiencyCoefficient+'%');
    console.log('Actual Ballots:',d.result.actualBallots);
    console.log('Leaked:',d.result.leakedVotes);
    console.log('Recommendation:',d.result.recommendation);
  } else {
    console.log('Full response:',ev.b.substring(0,300));
  }
})();
