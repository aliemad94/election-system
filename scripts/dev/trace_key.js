const {PrismaClient} = require('@prisma/client');
(async () => {
const p = new PrismaClient({datasourceUrl:'postgresql://postgres:wkBueuogzBSlCHqiilhkjxXPdQtNEpHX@thomas.proxy.rlwy.net:33563/railway'});
const k = await p.electionKey.findFirst({select:{keyCode:true,firstName:true,netVotes:true,totalVotes:true,supportedVotes:true,neutralVotes:true,weakVotes:true,weightedScore:true,classification:true,loyaltyScore:true,influenceLevel:true,mobilizationCap:true,voteProtection:true,supportReason:true,needsLevel:true,politicalNote:true,organizationalNote:true,generalNote:true,dataAccuracy:true,trainingStatus:true}});
console.log(JSON.stringify(k,null,2));
const disc = p.$disconnect;
await disc.call(p);
})();
