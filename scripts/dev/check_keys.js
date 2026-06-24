const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient({datasourceUrl:'postgresql://postgres:wkBueuogzBSlCHqiilhkjxXPdQtNEpHX@thomas.proxy.rlwy.net:33563/railway'});
(async()=>{
  const keys=await p.electionKey.findMany({select:{keyCode:true,firstName:true,netVotes:true,totalVotes:true,weightedScore:true,classification:true},take:5});
  console.log(JSON.stringify(keys,null,2));
  const c=await p.electionKey.count();
  const avg=await p.electionKey.aggregate({_avg:{weightedScore:true},_sum:{netVotes:true,weightedScore:true}});
  console.log('Total keys:',c,'| avg weightedScore:',avg._avg.weightedScore,'| sum netVotes:',avg._sum.netVotes);
  await p.$disconnect();
})();
