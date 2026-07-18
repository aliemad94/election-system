const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient({datasourceUrl: process.env.DATABASE_URL});
(async()=>{
  const keys=await p.electionKey.findMany({select:{keyCode:true,firstName:true,netVotes:true,totalVotes:true,weightedScore:true,classification:true},take:5});
  console.log(JSON.stringify(keys,null,2));
  const c=await p.electionKey.count();
  const avg=await p.electionKey.aggregate({_avg:{weightedScore:true},_sum:{netVotes:true,weightedScore:true}});
  console.log('Total keys:',c,'| avg weightedScore:',avg._avg.weightedScore,'| sum netVotes:',avg._sum.netVotes);
  await p.$disconnect();
})();
