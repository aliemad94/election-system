/**
 * ═══════════════════════════════════════════════════════════════
 * محرك المؤشرات الشامل — 70 مؤشر تحليلي انتخابي
 * Comprehensive Electoral Indicators Engine
 * 
 * 7 فئات × 10 مؤشرات = 70 مؤشر
 * مصممة للأنظمة الانتخابية العراقية — محافظة ذي قار
 * 
 * مُكيَّف من النسخة الأصلية ليعمل مع الـ schema الحالية
 * (ElectionKey, Voter, Tribe, CommissionData, etc.)
 * ═══════════════════════════════════════════════════════════════
 */

import { prisma } from "./prisma";
import { enrichElectoralKey, type EnrichedKey } from "./indicators-helper";
import { DHIQAR_DISTRICTS } from "@/lib/types";
import { classifyKey, calculateThresholdVotes } from "./electoral-calculations";
import { allocateSeatsLaguë } from "./seat-projection";

// ═══ الأنواع ═══

interface KeyData {
  id: string;
  code: string;
  firstName: string;
  fatherName: string | null;
  nickname: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  profession: string | null;
  phone: string | null;
  socialMedia: string | null;
  totalVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  netVotes: number;
  loyaltyLevel: number;
  influenceLevel: number;
  mobilizationAbility: number;
  voteProtection: number;
  supportReason: number;
  needsLevel: number;
  politicalNote: number;
  organizationalNote: number;
  generalNote: number;
  weightedScore: number;
  totalSpent: number;
  monthlyBudget: number;
  lastContactDate: string | null;
  trainingStatus: string | null;
  district: string | null;
  area: string | null;
  pollingCenter: string | null;
  tribeId: string | null;
  isActive: boolean;
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  _count?: { voters: number };
}

interface VoterData {
  id: string;
  firstName: string | null;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  profession: string | null;
  phone: string | null;
  socialMedia: string | null;
  district: string;
  area: string | null;
  pollingCenterId: string | null;
  tribeId: string | null;
  voterCategory: string;
  votedStatus: boolean;
  confidenceScore: number;
  electoralKeyId: string | null;
}

interface TribeData {
  id: string;
  name: string;
  influence: number;
  district: string | null;
  _count: { voters: number; electoralKeys: number };
}

interface IHECRecord {
  district: string | null;
  registeredVoters: number;
  actualParticipants: number;
  participationRate: number;
  maleVoters: number;
  femaleVoters: number;
  pollingCenters: number;
  electionYear: string | null;
}

// ═══ الدوال المساعدة ═══

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function norm100(v: number, maxP: number): number {
  return maxP <= 0 ? 0 : clamp((v / maxP) * 100);
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function daysSince(d: string | null): number {
  if (!d) return 999;
  try { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000); }
  catch { return 999; }
}

function ageFromDOB(dob: string | null): number | null {
  if (!dob) return null;
  try {
    const born = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - born.getFullYear();
    if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) age--;
    return age > 0 && age < 120 ? age : null;
  } catch { return null; }
}

function getAgeGroup(age: number): string {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

// HHI - مؤشر تركز هيرفيندال
function calculateHHI(shares: number[]): number {
  const total = shares.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return shares.reduce((sum, s) => sum + Math.pow(s / total, 2), 0) * 10000;
}

// ═══════════════════════════════════════════════════════════════
// الفئة 1: المؤشرات الحاسمة (1-10)
// ═══════════════════════════════════════════════════════════════

function calcDecisiveIndicators(
  keys: KeyData[], voters: VoterData[], ihec: IHECRecord[],
  districtKeys: Record<string, KeyData[]>,
  competitors: any[]
) {
  const totalRegistered = ihec.reduce((s, r) => s + r.registeredVoters, 0) || 0;
  const avgParticipation = ihec.length > 0
    ? ihec.reduce((s, r) => s + r.participationRate, 0) / ihec.length : 0;

  // 1. عدد الأصوات المتوقعة يوم الاقتراع
  const totalNetVotes = keys.reduce((s, k) => s + k.netVotes, 0);
  const expectedVotesOnDay = Math.round(totalNetVotes * (avgParticipation / 100));

  // 2. نسبة المشاركة المتوقعة
  const expectedParticipation = round1(avgParticipation);

  // 3 & 4. مناطق القوة والضعف
  const districtScores = DHIQAR_DISTRICTS.map((dist) => {
    const dKeys = districtKeys[dist] || [];
    const net = dKeys.reduce((s, k) => s + k.netVotes, 0);
    const total = dKeys.reduce((s, k) => s + k.totalVotes, 0);
    const avgWeighted = dKeys.length > 0 ? dKeys.reduce((s, k) => s + k.weightedScore, 0) / dKeys.length : 0;
    const ihecDist = ihec.find(i => i.district === dist);
    const registered = ihecDist?.registeredVoters || 0;
    const strength = total > 0 ? round1((net / Math.max(total, 1)) * 100) : 0;
    return { district: dist, netVotes: net, totalVotes: total, keyCount: dKeys.length, avgWeighted: round1(avgWeighted), strength, registeredVoters: registered };
  }).sort((a, b) => b.strength - a.strength);

  const strongAreas = districtScores.filter(d => d.strength >= 50);
  const weakAreas = districtScores.filter(d => d.strength < 35);

  // 5. توزيع القوة جغرافياً
  const geoDistribution = districtScores.map(d => ({
    district: d.district,
    netVotes: d.netVotes,
    percentage: totalNetVotes > 0 ? round1((d.netVotes / totalNetVotes) * 100) : 0,
    keyCount: d.keyCount,
  }));

  // 6. ترتيب المفاتيح من الأقوى إلى الأضعف
  const keyRanking = [...keys]
    .sort((a, b) => b.weightedScore - a.weightedScore || b.netVotes - a.netVotes)
    .slice(0, 25)
    .map((k, i) => ({
      rank: i + 1,
      code: k.code,
      name: `${k.firstName} ${k.fatherName || ''}`.trim(),
      nickname: k.nickname,
      district: k.district,
      netVotes: k.netVotes,
      totalVotes: k.totalVotes,
      weightedScore: k.weightedScore,
      eiiScore: k.eiiScore,
      kriScore: k.kriScore,
      drsScore: k.drsScore,
    }));

  // 7. مؤشر دقة المفتاح الانتخابي (متوسط KRI)
  const avgKRI = keys.length > 0 ? round1(keys.reduce((s, k) => s + k.kriScore, 0) / keys.length) : 0;

  // 8. مؤشر خطر التسرب الانتخابي (متوسط DRS)
  const avgDRS = keys.length > 0 ? round1(keys.reduce((s, k) => s + k.drsScore, 0) / keys.length) : 0;

  // 9. نسبة المؤيدين والمحايدين والضعفاء
  const totalSupported = keys.reduce((s, k) => s + k.supportedVotes, 0);
  const totalNeutral = keys.reduce((s, k) => s + k.neutralVotes, 0);
  const totalWeak = keys.reduce((s, k) => s + k.weakVotes, 0);
  const totalAll = totalSupported + totalNeutral + totalWeak;
  const supportDistribution = {
    supported: { count: totalSupported, percentage: totalAll > 0 ? round1((totalSupported / totalAll) * 100) : 0 },
    neutral: { count: totalNeutral, percentage: totalAll > 0 ? round1((totalNeutral / totalAll) * 100) : 0 },
    weak: { count: totalWeak, percentage: totalAll > 0 ? round1((totalWeak / totalAll) * 100) : 0 },
  };

  // 10. خريطة المناطق (أحمر / أصفر / أخضر)
  const areaMap = districtScores.map(d => {
    let color: 'green' | 'yellow' | 'red';
    if (d.strength >= 55) color = 'green';
    else if (d.strength >= 35) color = 'yellow';
    else color = 'red';
    return { district: d.district, color, strength: d.strength, netVotes: d.netVotes, keyCount: d.keyCount };
  });

  const expectedVotes = expectedVotesOnDay;
  const expectedTurnout = expectedParticipation;
  const votesNeededToWin = calculateThresholdVotes(totalRegistered, avgParticipation / 100);
  const electoralGap = Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const baseParticipation = (totalRegistered * avgParticipation) / 100;
  const winProbability = (totalNetVotes > 0 && baseParticipation > 0) ? round1(clamp((totalNetVotes / baseParticipation) * 100)) : 0;
  const overallRisk = Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4);
  const stability = Math.round(Math.min(100, avgKRI));
  const earlyWarning = Math.round(avgDRS * 0.5);
  const supportersDistribution = {
    supported: supportDistribution.supported.percentage || 0,
    neutral: supportDistribution.neutral.percentage || 0,
    opponent: supportDistribution.weak.percentage || 0,
  };

  return {
    expectedVotesOnDay, expectedVotes, expectedTurnout, expectedParticipation,
    votesNeededToWin, electoralGap, winProbability, overallRisk, stability, earlyWarning,
    supportDistribution, supportersDistribution,
    strongAreas,
    weakAreas,
    geoDistribution,
    keyRanking,
    avgKRI,
    avgDRS,
    areaMap,
    totalNetVotes,
    totalRegistered,
    projectedSeats: (() => {
      const parties = [
        { partyName: "حملتنا الانتخابية", votes: totalNetVotes },
        ...competitors.map(c => ({
          partyName: c.party || c.name,
          votes: c.estimatedVotes || 0,
        })),
      ];
      const allocated = allocateSeatsLaguë(parties, 18);
      return allocated.find(p => p.partyName === "حملتنا الانتخابية")?.seats || 0;
    })(),
  };
}

// ═══════════════════════════════════════════════════════════════
// الفئة 2: مؤشرات إدارة الحملة (11-20)
// ═══════════════════════════════════════════════════════════════

function calcCampaignIndicators(
  keys: KeyData[],
  _voters: VoterData[],
  districtKeys: Record<string, KeyData[]>,
  services: any[],
  smsCampaigns: any[],
  totalNetVotes: number,
  totalVoters: number
) {
  // 11. أعلى المفاتيح للأصوات
  const topKeysByVotes = [...keys]
    .sort((a, b) => b.netVotes - a.netVotes)
    .slice(0, 15)
    .map((k, i) => ({
      rank: i + 1,
      code: k.code,
      name: `${k.firstName} ${k.fatherName || ''}`.trim(),
      nickname: k.nickname,
      district: k.district,
      netVotes: k.netVotes,
      totalVotes: k.totalVotes,
      supportedVotes: k.supportedVotes,
    }));

  // 12. المفاتيح المستحقة للاستثمار
  const investmentKeys = [...keys]
    .filter(k => k.totalVotes > 0)
    .map(k => ({
      code: k.code,
      name: `${k.firstName} ${k.fatherName || ''}`.trim(),
      district: k.district,
      totalVotes: k.totalVotes,
      netVotes: k.netVotes,
      neutralVotes: k.neutralVotes,
      totalSpent: k.totalSpent,
      potentialGain: Math.round(k.neutralVotes * 0.5 + k.weakVotes * 0.3),
      roi: k.totalSpent > 0 ? round1(k.netVotes / (k.totalSpent / 1000)) : 999,
      investmentScore: round1(
        (k.neutralVotes * 0.5 + k.weakVotes * 0.3) * (k.totalSpent < 100000 ? 2 : 1) * (k.influenceLevel / 5)
      ),
    }))
    .sort((a, b) => b.investmentScore - a.investmentScore)
    .slice(0, 15);

  // 13. مؤشر الحشد الميداني
  const avgMobilization = keys.length > 0
    ? round1(keys.reduce((s, k) => s + k.mobilizationAbility, 0) / keys.length * 20) : 0;
  const highMobilization = keys.filter(k => k.mobilizationAbility >= 4).length;
  const mobilizationIndex = {
    score: avgMobilization,
    highCount: highMobilization,
    percentage: keys.length > 0 ? round1((highMobilization / keys.length) * 100) : 0,
  };

  // 14. مؤشر حماية الأصوات
  const avgProtection = keys.length > 0
    ? round1(keys.reduce((s, k) => s + k.voteProtection, 0) / keys.length * 20) : 0;
  const highProtection = keys.filter(k => k.voteProtection >= 4).length;
  const protectionIndex = {
    score: avgProtection,
    highCount: highProtection,
    percentage: keys.length > 0 ? round1((highProtection / keys.length) * 100) : 0,
  };

  // 15. المناطق الأكثر حاجة للجهد الميداني
  const areasNeedingEffort = Object.entries(districtKeys)
    .map(([dist, dKeys]) => {
      const avgDRS = dKeys.length > 0 ? dKeys.reduce((s, k) => s + k.drsScore, 0) / dKeys.length : 0;
      const neutralCount = dKeys.reduce((s, k) => s + k.neutralVotes, 0);
      const weakCount = dKeys.reduce((s, k) => s + k.weakVotes, 0);
      const effortScore = round1(avgDRS * 0.3 + (neutralCount + weakCount) * 0.01);
      return { district: dist, effortScore, avgDRS: round1(avgDRS), neutralCount, weakCount, keyCount: dKeys.length };
    })
    .sort((a, b) => b.effortScore - a.effortScore);

  // 16. كفاءة حملات SMS
  const sentSMS = smsCampaigns.filter(c => c.status === 'SENT');
  const messageEffectivenessVal = smsCampaigns.length > 0
    ? round1((sentSMS.reduce((sum, c) => sum + (c.recipientCount || 0), 0) / Math.max(totalVoters, 1)) * 100)
    : 0;

  // 17. تأثير الخدمات المقدمة
  const completedServices = services.filter(s => s.status === 'COMPLETED');
  const serviceImpactVal = services.length > 0
    ? round1((completedServices.reduce((sum, s) => sum + (s.estimatedVotesImpact || 0), 0) / Math.max(totalNetVotes, 1)) * 100)
    : 0;

  return {
    topKeysByVotes,
    investmentKeys,
    mobilizationIndex,
    protectionIndex,
    areasNeedingEffort,
    messageEffectiveness: messageEffectivenessVal,
    serviceImpact: serviceImpactVal,
  };
}

// ═══════════════════════════════════════════════════════════════
// الفئة 3: مؤشرات فهم الجمهور (21-30)
// ═══════════════════════════════════════════════════════════════

function calcAudienceIndicators(keys: KeyData[], voters: VoterData[], sentimentTrends: any[]) {
  const allPeople = [
    ...keys.map(k => ({ dob: k.dateOfBirth, gender: k.gender, edu: k.educationLevel, prof: k.profession, category: 'مفتاح' as string, voted: true })),
    ...voters.map(v => ({ dob: v.dateOfBirth, gender: v.gender, edu: v.educationLevel, prof: v.profession, category: v.voterCategory, voted: v.votedStatus })),
  ];

  // 21. الفئات العمرية الأكثر دعماً
  const ageGroupSupport: Record<string, { total: number; supported: number }> = {};
  allPeople.forEach(p => {
    const age = ageFromDOB(p.dob);
    if (age === null) return;
    const group = getAgeGroup(age);
    if (!ageGroupSupport[group]) ageGroupSupport[group] = { total: 0, supported: 0 };
    ageGroupSupport[group].total++;
    if (p.category === 'مؤيد' || p.category === 'SUPPORTED' || p.category === 'مفتاح') ageGroupSupport[group].supported++;
  });
  const topSupportingAgeGroups = Object.entries(ageGroupSupport)
    .map(([group, data]) => ({ group, ...data, percentage: data.total > 0 ? round1((data.supported / data.total) * 100) : 0 }))
    .sort((a, b) => b.percentage - a.percentage);

  // 22. الفئة العمرية الأكثر تردداً
  const hesitantAgeGroups: Record<string, { total: number; neutral: number }> = {};
  allPeople.forEach(p => {
    const age = ageFromDOB(p.dob);
    if (age === null) return;
    const group = getAgeGroup(age);
    if (!hesitantAgeGroups[group]) hesitantAgeGroups[group] = { total: 0, neutral: 0 };
    hesitantAgeGroups[group].total++;
    if (p.category === 'محايد' || p.category === 'NEUTRAL') hesitantAgeGroups[group].neutral++;
  });
  const mostHesitantAgeGroups = Object.entries(hesitantAgeGroups)
    .map(([group, data]) => ({ group, ...data, percentage: data.total > 0 ? round1((data.neutral / data.total) * 100) : 0 }))
    .sort((a, b) => b.percentage - a.percentage);

  // 23. الفئات الأكثر تصويتاً
  const votingAgeGroups: Record<string, { total: number; voted: number }> = {};
  allPeople.forEach(p => {
    const age = ageFromDOB(p.dob);
    if (age === null) return;
    const group = getAgeGroup(age);
    if (!votingAgeGroups[group]) votingAgeGroups[group] = { total: 0, voted: 0 };
    votingAgeGroups[group].total++;
    if (p.voted) votingAgeGroups[group].voted++;
  });
  const topVotingAgeGroups = Object.entries(votingAgeGroups)
    .map(([group, data]) => ({ group, ...data, percentage: data.total > 0 ? round1((data.voted / data.total) * 100) : 0 }))
    .sort((a, b) => b.percentage - a.percentage);

  // 24. نسبة الرجال إلى النساء
  const maleCount = allPeople.filter(p => p.gender === 'ذكر').length;
  const femaleCount = allPeople.filter(p => p.gender === 'أنثى').length;
  const unknownGender = allPeople.length - maleCount - femaleCount;
  const genderRatio = {
    male: maleCount, female: femaleCount, unknown: unknownGender,
    malePercentage: allPeople.length > 0 ? round1((maleCount / allPeople.length) * 100) : 0,
    femalePercentage: allPeople.length > 0 ? round1((femaleCount / allPeople.length) * 100) : 0,
  };

  // 25. تأثير التعليم على اختيار المرشح
  const eduSupport: Record<string, { total: number; supported: number }> = {};
  allPeople.forEach(p => {
    const edu = p.edu || 'غير محدد';
    if (!eduSupport[edu]) eduSupport[edu] = { total: 0, supported: 0 };
    eduSupport[edu].total++;
    if (p.category === 'مؤيد' || p.category === 'SUPPORTED' || p.category === 'مفتاح') eduSupport[edu].supported++;
  });
  const educationImpact = Object.entries(eduSupport)
    .map(([level, data]) => ({ level, ...data, supportRate: data.total > 0 ? round1((data.supported / data.total) * 100) : 0 }))
    .sort((a, b) => b.supportRate - a.supportRate);

  // 26. نسبة الجامعيين
  const universityLevels = ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم', 'خريج'];
  const universityCount = allPeople.filter(p => universityLevels.includes(p.edu || '')).length;
  const universityPercentage = allPeople.length > 0 ? round1((universityCount / allPeople.length) * 100) : 0;

  // 27. المهن الأكثر تأييداً
  const profSupport: Record<string, { total: number; supported: number }> = {};
  allPeople.forEach(p => {
    const prof = p.prof || 'غير محدد';
    if (!profSupport[prof]) profSupport[prof] = { total: 0, supported: 0 };
    profSupport[prof].total++;
    if (p.category === 'مؤيد' || p.category === 'SUPPORTED' || p.category === 'مفتاح') profSupport[prof].supported++;
  });
  const professionSupport = Object.entries(profSupport)
    .filter(([, d]) => d.total >= 2)
    .map(([prof, data]) => ({ profession: prof, ...data, supportRate: data.total > 0 ? round1((data.supported / data.total) * 100) : 0 }))
    .sort((a, b) => b.supportRate - a.supportRate);

  // 28. تقسيم الناخبين إلى شرائح
  const segments = [
    { name: 'شباب مؤيد', count: allPeople.filter(p => { const a = ageFromDOB(p.dob); return a !== null && a < 35 && (p.category === 'مؤيد' || p.category === 'SUPPORTED' || p.category === 'مفتاح'); }).length },
    { name: 'شباب محايد', count: allPeople.filter(p => { const a = ageFromDOB(p.dob); return a !== null && a < 35 && (p.category === 'محايد' || p.category === 'NEUTRAL'); }).length },
    { name: 'كبار مؤيد', count: allPeople.filter(p => { const a = ageFromDOB(p.dob); return a !== null && a >= 45 && (p.category === 'مؤيد' || p.category === 'SUPPORTED' || p.category === 'مفتاح'); }).length },
    { name: 'كبار محايد', count: allPeople.filter(p => { const a = ageFromDOB(p.dob); return a !== null && a >= 45 && (p.category === 'محايد' || p.category === 'NEUTRAL'); }).length },
    { name: 'جامعيون', count: universityCount },
    { name: 'نساء', count: femaleCount },
    { name: 'عمال وحرفيون', count: allPeople.filter(p => ['عامل', 'حرفي', 'سائق', 'فلاح'].includes(p.prof || '')).length },
  ].filter(s => s.count > 0);

  // 37. القضايا الأكثر تأثيراً من اتجاهات الرأي العام الحقيقية
  const topIssues = sentimentTrends.length > 0
    ? sentimentTrends.map(s => {
        let keyword = 'عامة';
        try {
          const parsed = JSON.parse(s.keywords || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) keyword = parsed[0];
          else if (typeof parsed === 'string') keyword = parsed;
        } catch {
          if (s.keywords) keyword = s.keywords;
        }
        return { issue: `ملف ${keyword} في ${s.region}`, weight: Math.round(clamp(s.score * 100)) };
      }).slice(0, 5)
    : [];

  // 38. نوع الخطاب المناسب لكل شريحة تصويتية
  const segmentMessaging = segments.map(s => {
    let messageType = 'خطاب تنموي عام';
    if (s.name.includes('شباب')) messageType = 'تركيز على فرص العمل والتأهيل الرقمي والأنشطة الشبابية';
    else if (s.name.includes('جامعيون')) messageType = 'خطاب مؤسسي، تحفيز الكفاءات، والاصلاح الإداري والنزاهة';
    else if (s.name.includes('نساء')) messageType = 'تركيز على التنمية الأسرية والخدمات الصحية المباشرة والتعليم';
    else if (s.name.includes('كبار')) messageType = 'تركيز على الخدمات البلدية الأساسية والاستقرار الاجتماعي العشائري';
    return { segment: s.name, messageType };
  });

  return {
    topSupportingAgeGroups,
    mostHesitantAgeGroups,
    topVotingAgeGroups,
    genderRatio,
    educationImpact,
    universityPercentage,
    universityCount,
    professionSupport,
    segments,
    topIssues,
    segmentMessaging,
  };
}

// ═══════════════════════════════════════════════════════════════
// الفئة 4: مؤشرات النفوذ الاجتماعي والسياسي (31-39)
// ═══════════════════════════════════════════════════════════════

function calcInfluenceIndicators(
  keys: KeyData[], voters: VoterData[], tribes: TribeData[]
) {
  // 31. التصويت العشائري
  const tribalVoting = tribes.map(t => {
    const tribeKeys = keys.filter(k => k.tribeId === t.id);
    const tribeVoters = voters.filter(v => v.tribeId === t.id);
    const totalVotes = tribeKeys.reduce((s, k) => s + k.totalVotes, 0);
    const netVotes = tribeKeys.reduce((s, k) => s + k.netVotes, 0);
    return {
      tribe: t.name, influence: t.influence, district: t.district,
      keyCount: tribeKeys.length, voterCount: tribeVoters.length,
      totalVotes, netVotes,
      efficiency: totalVotes > 0 ? round1((netVotes / totalVotes) * 100) : 0,
    };
  }).sort((a, b) => b.netVotes - a.netVotes);

  // 32. أعلى العشائر دعماً
  const topSupportingTribes = tribalVoting.filter(t => t.efficiency >= 50);

  // 33. العشائر المحايدة
  const neutralTribes = tribes.map(t => {
    const tribeKeys = keys.filter(k => k.tribeId === t.id);
    const neutralVotes = tribeKeys.reduce((s, k) => s + k.neutralVotes, 0);
    const totalVotes = tribeKeys.reduce((s, k) => s + k.totalVotes, 0);
    return {
      tribe: t.name, influence: t.influence,
      neutralVotes, totalVotes,
      neutralPercentage: totalVotes > 0 ? round1((neutralVotes / totalVotes) * 100) : 0,
    };
  }).filter(t => t.neutralPercentage > 30).sort((a, b) => b.neutralPercentage - a.neutralPercentage);

  // 34. العشائر المنافسة
  const competingTribes = tribalVoting
    .filter(t => t.efficiency < 40 && t.influence >= 3)
    .sort((a, b) => b.influence - a.influence);

  // 35. مؤشر النفوذ العشائري
  const tribalInfluenceIndex = tribes.length > 0
    ? round1(tribes.reduce((s, t) => s + t.influence * (t._count.voters + t._count.electoralKeys), 0) /
        Math.max(tribes.reduce((s, t) => s + t._count.voters + t._count.electoralKeys, 0), 1))
    : 0;

  // 36. مؤشر النفوذ الوظيفي
  const profInfluence: Record<string, { count: number; avgInfluence: number }> = {};
  keys.forEach(k => {
    const prof = k.profession || 'غير محدد';
    if (!profInfluence[prof]) profInfluence[prof] = { count: 0, avgInfluence: 0 };
    profInfluence[prof].count++;
    profInfluence[prof].avgInfluence += k.influenceLevel;
  });
  const professionalInfluence = Object.entries(profInfluence)
    .map(([prof, data]) => ({
      profession: prof, count: data.count,
      avgInfluence: round1(data.avgInfluence / data.count),
      influenceScore: round1((data.avgInfluence / data.count) * 20),
    }))
    .sort((a, b) => b.influenceScore - a.influenceScore);

  // 39. الناخبين القابلين للوصول رقمياً
  const allPeople = [...keys, ...voters];
  const hasPhone = allPeople.filter(p => p.phone && p.phone.length > 0).length;
  const hasSocial = allPeople.filter(p => p.socialMedia && p.socialMedia.length > 2).length;
  const digitalReach = {
    hasPhone, hasSocial,
    phonePercentage: allPeople.length > 0 ? round1((hasPhone / allPeople.length) * 100) : 0,
    socialPercentage: allPeople.length > 0 ? round1((hasSocial / allPeople.length) * 100) : 0,
    totalReachable: hasPhone,
  };

  // 37. تصنيف المفاتيح حسب القوة النهائية (نظام النفوذ والتأثير)
  const classificationStats = {
    weak: keys.filter(k => classifyKey(k.weightedScore) === 'ضعيف').length,
    acceptable: keys.filter(k => classifyKey(k.weightedScore) === 'مقبول').length,
    good: keys.filter(k => classifyKey(k.weightedScore) === 'جيد').length,
    strong: keys.filter(k => classifyKey(k.weightedScore) === 'قوي').length,
    total: keys.length,
  };

  // 38. أعلى المفاتيح من حيث الدرجة المرجّحة
  const topInfluenceKeys = [...keys]
    .sort((a, b) => b.weightedScore - a.weightedScore || b.netVotes - a.netVotes)
    .slice(0, 15)
    .map(k => ({
      id: k.id,
      name: k.firstName || 'غير معروف',
      district: k.district,
      weightedScore: k.weightedScore,
      classification: classifyKey(k.weightedScore),
      netVotes: k.netVotes,
      loyaltyLevel: k.loyaltyLevel,
      influenceLevel: k.influenceLevel,
      mobilizationAbility: k.mobilizationAbility,
      voteProtection: (k as any).voteProtection || 3,
      supportReason: (k as any).supportReason || 3,
      needsLevel: (k as any).needsLevel || 3,
      politicalNote: (k as any).politicalNote || 3,
      organizationalNote: (k as any).organizationalNote || 3,
      generalNote: (k as any).generalNote || 3,
    }));

  // 39. توزيع الأبعاد التسعة للمفاتيح
  const dimensionAverages = keys.length > 0 ? {
    loyalty: round1(keys.reduce((s, k) => s + k.loyaltyLevel, 0) / keys.length),
    influence: round1(keys.reduce((s, k) => s + k.influenceLevel, 0) / keys.length),
    mobilization: round1(keys.reduce((s, k) => s + k.mobilizationAbility, 0) / keys.length),
    protection: round1(keys.reduce((s, k) => s + ((k as any).voteProtection || 3), 0) / keys.length),
    support: round1(keys.reduce((s, k) => s + ((k as any).supportReason || 3), 0) / keys.length),
    needs: round1(keys.reduce((s, k) => s + ((k as any).needsLevel || 3), 0) / keys.length),
    political: round1(keys.reduce((s, k) => s + ((k as any).politicalNote || 3), 0) / keys.length),
    organizational: round1(keys.reduce((s, k) => s + ((k as any).organizationalNote || 3), 0) / keys.length),
    general: round1(keys.reduce((s, k) => s + ((k as any).generalNote || 3), 0) / keys.length),
  } : null;

  // 40. متوسط الدرجة المرجّحة
  const avgWeightedScore = keys.length > 0 ? round1(keys.reduce((s, k) => s + k.weightedScore, 0) / keys.length) : 0;

  return {
    tribalVoting, topSupportingTribes, neutralTribes, competingTribes,
    tribalInfluenceIndex, professionalInfluence,
    classificationStats,
    topInfluenceKeys,
    dimensionAverages,
    avgWeightedScore,
    competitorAnalysis: { available: false, message: 'يحتاج بيانات المرشحين المنافسين' },
    digitalInfluence: { available: false, message: 'يحتاج بيانات حملات إلكترونية' },
    digitalReach,
  };
}

/** @deprecated Use classifyKey from electoral-calculations instead */
function classifyByScore(score: number): string {
  return classifyKey(score);
}

// ═══════════════════════════════════════════════════════════════
// الفئة 5: مؤشرات الأداء الخدمي والتنظيمي (40-45)
// ═══════════════════════════════════════════════════════════════

function calcPerformanceIndicators(keys: KeyData[], _voters: VoterData[], services: any[], volunteers: any[]) {
  // 40-42 - حساب مقاييس الأداء الخدمي
  const completedServices = services.filter((s: any) => s.status === 'COMPLETED');
  const pendingServices = services.filter((s: any) => s.status === 'PENDING' || s.status === 'IN_PROGRESS');
  const totalCost = services.reduce((sum: number, s: any) => sum + (s.cost || 0), 0);
  const totalVotesImpact = services.reduce((sum: number, s: any) => sum + (s.estimatedVotesImpact || 0), 0);

  const serviceMetrics = {
    available: true,
    completedCount: completedServices.length,
    pendingCount: pendingServices.length,
    totalCost,
    totalVotesImpact,
    avgSatisfaction: services.length > 0 ? round1((completedServices.length / services.length) * 5) : 0,
  };

  // 43. نسبة الولاء العامة للحملة
  const avgLoyalty = keys.length > 0 ? round1(keys.reduce((s, k) => s + k.loyaltyLevel, 0) / keys.length) : 0;
  const loyaltyDistribution = {
    score: round1(avgLoyalty * 20),
    high: keys.filter(k => k.loyaltyLevel >= 4).length,
    medium: keys.filter(k => k.loyaltyLevel === 3).length,
    low: keys.filter(k => k.loyaltyLevel <= 2).length,
    average: avgLoyalty,
  };

  // 44. كفاءة الكوادر والمتطوعين الميدانية
  const activeVolunteers = volunteers.filter((v: any) => v.status !== 'INACTIVE');
  const avgVolunteerEfficiency = volunteers.length > 0
    ? round1(volunteers.reduce((sum: number, v: any) => sum + (v.efficiencyScore || 0), 0) / volunteers.length)
    : 0;

  const campaignEfficiency = {
    available: true,
    totalVolunteers: volunteers.length,
    activeCount: activeVolunteers.length,
    avgEfficiency: avgVolunteerEfficiency,
    tasksPerformance: volunteers.length > 0
      ? round1((volunteers.reduce((sum: number, v: any) => sum + (v.totalCompletedTasks || 0), 0) / Math.max(volunteers.reduce((sum: number, v: any) => sum + (v.totalAssignedTasks || 0), 0), 1)) * 100)
      : 0,
  };

  // 45. تأثير العوامل الاقتصادية
  const economicImpact = {
    available: true,
    totalSpent: totalCost,
    costPerAssistedVoter: totalVotesImpact > 0 ? round1(totalCost / totalVotesImpact) : 0,
    impactLevel: totalCost > 1000000 ? 'مرتفع' : 'متوسط',
  };

  return { serviceMetrics, loyaltyDistribution, campaignEfficiency, economicImpact };
}

// ═══════════════════════════════════════════════════════════════
// الفئة 6: المقارنة التاريخية والاستراتيجية (46-50)
// ═══════════════════════════════════════════════════════════════

function calcHistoricalIndicators(ihec: IHECRecord[]) {
  const electionTrend = {
    avgParticipation: ihec.length > 0 ? round1(ihec.reduce((s, r) => s + r.participationRate, 0) / ihec.length) : 0,
    totalRegistered: ihec.reduce((s, r) => s + r.registeredVoters, 0),
    trend: 'بيانات تاريخية محدودة — ستتحسن مع إضافة نتائج انتخابية سابقة',
  };

  return {
    partyWinRates: [],
    votingShifts: [],
    participationChanges: [],
    partyStrengthChanges: [],
    electionTrend,
  };
}

// ═══════════════════════════════════════════════════════════════
// الفئة 7: المؤشرات التحليلية المركبة (51-70)
// ═══════════════════════════════════════════════════════════════

function calcCompositeAnalyticalIndicators(
  keys: KeyData[], voters: VoterData[],
  districtKeys: Record<string, KeyData[]>,
  ihec: IHECRecord[]
) {
  // 51. مؤشر كفاءة المفتاح الانتخابي
  const keyEfficiency = keys.map(k => ({
    code: k.code, name: `${k.firstName} ${k.fatherName || ''}`.trim(),
    efficiency: k.totalVotes > 0 ? round1((k.netVotes / k.totalVotes) * 100) : 0,
    netVotes: k.netVotes, totalVotes: k.totalVotes,
  })).sort((a, b) => b.efficiency - a.efficiency);
  const avgKeyEfficiency = keys.length > 0
    ? round1(keyEfficiency.reduce((s, k) => s + k.efficiency, 0) / keyEfficiency.length)
    : 0;

  // 52. مؤشر الاعتماد على المفتاح
  const totalNetVotes = keys.reduce((s, k) => s + k.netVotes, 0);
  const topKeyVotes = keys.length > 0 ? Math.max(...keys.map(k => k.netVotes)) : 0;
  const dependencyIndex = totalNetVotes > 0 ? round1((topKeyVotes / totalNetVotes) * 100) : 0;

  // 53. مؤشر تركز الأصوات (HHI)
  const voteShares = keys.map(k => k.netVotes);
  const concentrationHHI = round1(calculateHHI(voteShares));
  const concentrationLevel = concentrationHHI > 2500 ? 'مرتفع جداً' : concentrationHHI > 1500 ? 'مرتفع' : concentrationHHI > 1000 ? 'متوسط' : 'منخفض';

  // 54. مؤشر التنوع الاجتماعي
  const uniqueTribes = new Set(keys.filter(k => k.tribeId).map(k => k.tribeId)).size;
  const uniqueDistricts = new Set(keys.filter(k => k.district).map(k => k.district)).size;
  const uniqueProfessions = new Set(keys.filter(k => k.profession).map(k => k.profession)).size;
  const diversityIndex = round1(
    (norm100(uniqueTribes, 10) * 0.35) + (norm100(uniqueDistricts, 7) * 0.35) + (norm100(uniqueProfessions, 15) * 0.30)
  );

  // 55. مؤشر التوسع الانتخابي
  const totalNeutral = keys.reduce((s, k) => s + k.neutralVotes, 0);
  const totalWeak = keys.reduce((s, k) => s + k.weakVotes, 0);
  const expansionPotential = Math.round(totalNeutral * 0.5 + totalWeak * 0.3);
  const expansionIndex = totalNetVotes > 0 ? round1((expansionPotential / totalNetVotes) * 100) : 0;

  // 56. مؤشر استنزاف الحملة
  const totalSpent = keys.reduce((s, k) => s + k.totalSpent, 0);
  const costPerVote = totalNetVotes > 0 ? round1(totalSpent / totalNetVotes) : 0;
  const exhaustionIndex = totalSpent > 0 ? round1(clamp((totalSpent / Math.max(keys.reduce((s, k) => s + k.monthlyBudget, 0), 1)) * 100)) : 0;

  // 57-58. العائد الانتخابي المالي
  const financialROI = totalSpent > 0
    ? round1((totalNetVotes / (totalSpent / 1000)) * 10)
    : (totalNetVotes > 0 ? 100 : 0);

  // 59. مؤشر تأثير التواصل المباشر
  const recentContact = keys.filter(k => daysSince(k.lastContactDate) <= 7).length;
  const mediumContact = keys.filter(k => { const d = daysSince(k.lastContactDate); return d > 7 && d <= 30; }).length;
  const noContact = keys.filter(k => daysSince(k.lastContactDate) > 30).length;
  const contactImpact = {
    recentCount: recentContact, mediumCount: mediumContact, noContactCount: noContact,
    recentPercentage: keys.length > 0 ? round1((recentContact / keys.length) * 100) : 0,
    score: keys.length > 0 ? round1(((recentContact * 3 + mediumContact * 1) / (keys.length * 3)) * 100) : 0,
  };

  // 61. مؤشر قوة مركز الاقتراع
  const pollingStrength: Record<string, { keys: number; netVotes: number; totalVotes: number }> = {};
  keys.filter(k => k.pollingCenter).forEach(k => {
    const pc = k.pollingCenter!;
    if (!pollingStrength[pc]) pollingStrength[pc] = { keys: 0, netVotes: 0, totalVotes: 0 };
    pollingStrength[pc].keys++;
    pollingStrength[pc].netVotes += k.netVotes;
    pollingStrength[pc].totalVotes += k.totalVotes;
  });
  const pollingCenterStrength = Object.entries(pollingStrength)
    .map(([center, data]) => ({
      center, ...data,
      efficiency: data.totalVotes > 0 ? round1((data.netVotes / data.totalVotes) * 100) : 0,
    }))
    .sort((a, b) => b.netVotes - a.netVotes);

  // 62. مؤشر أولوية المنطقة
  const areaPriority = Object.entries(districtKeys).map(([dist, dKeys]) => {
    const avgDRS = dKeys.length > 0 ? dKeys.reduce((s, k) => s + k.drsScore, 0) / dKeys.length : 0;
    const netV = dKeys.reduce((s, k) => s + k.netVotes, 0);
    const neutral = dKeys.reduce((s, k) => s + k.neutralVotes, 0);
    const priorityScore = round1(avgDRS * 0.3 + norm100(neutral, 500) * 0.3 + norm100(netV, 2000) * 0.4);
    return { district: dist, priorityScore, avgDRS: round1(avgDRS), netVotes: netV, neutralVotes: neutral };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  // 63. مؤشر المنافسة الانتخابية
  const competitionIndex = { available: true, score: round1(100 - (avgKeyEfficiency || 0)), level: avgKeyEfficiency > 60 ? 'منخفضة' : avgKeyEfficiency > 40 ? 'متوسطة' : 'عالية' };

  // 64. مؤشر احتمالية الفوز
  const totalRegistered = ihec.reduce((s, r) => s + r.registeredVoters, 0) || 0;
  const avgPart = ihec.length > 0 ? ihec.reduce((s, r) => s + r.participationRate, 0) / ihec.length : 0;
  const expectedTotal = totalRegistered * (avgPart / 100);
  const voteShare = expectedTotal > 0 ? (totalNetVotes / expectedTotal) : 0;
  const winProbability = round1(clamp(voteShare * 100));

  // 65. مؤشر الاستقرار الانتخابي
  const scores = keys.map(k => k.weightedScore);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const variance = scores.length > 0 ? scores.reduce((s, sc) => s + Math.pow(sc - avgScore, 2), 0) / scores.length : 0;
  const stabilityIndex = round1(clamp(100 - Math.sqrt(variance)));

  // 66. مؤشر الجاهزية ليوم الاقتراع
  const highProtection = keys.filter(k => k.voteProtection >= 4).length;
  const highLoyalty = keys.filter(k => k.loyaltyLevel >= 4).length;
  const readinessIndex = keys.length > 0
    ? round1(((highProtection / keys.length) * 30 + (highLoyalty / keys.length) * 30 + contactImpact.score * 0.4))
    : 0;

  // 67. مؤشر المخاطر الانتخابية الشامل
  const avgDRS = keys.length > 0 ? keys.reduce((s, k) => s + k.drsScore, 0) / keys.length : 0;
  const riskIndex = round1(clamp(avgDRS * 0.5 + (100 - stabilityIndex) * 0.3 + exhaustionIndex * 0.2));

  // 68. مؤشر القيمة الاستراتيجية للمفتاح
  const strategicValues = keys.map(k => ({
    code: k.code, name: `${k.firstName} ${k.fatherName || ''}`.trim(),
    strategicValue: round1((k.eiiScore * 0.3 + k.kriScore * 0.3 + (k.netVotes / Math.max(totalNetVotes, 1)) * 100 * 0.4)),
    eii: k.eiiScore, kri: k.kriScore, netVotes: k.netVotes,
  })).sort((a, b) => b.strategicValue - a.strategicValue).slice(0, 15);

  // 69. مؤشر القيمة السياسية للمنطقة
  const politicalValue = Object.entries(districtKeys).map(([dist, dKeys]) => {
    const net = dKeys.reduce((s, k) => s + k.netVotes, 0);
    const avgEII = dKeys.length > 0 ? dKeys.reduce((s, k) => s + k.eiiScore, 0) / dKeys.length : 0;
    const ihecDist = ihec.find(i => i.district === dist);
    const registered = ihecDist?.registeredVoters || 0;
    const politicalScore = round1(norm100(net, 2000) * 0.4 + avgEII * 0.3 + norm100(registered, 200000) * 0.3);
    return { district: dist, politicalScore, netVotes: net, avgEII: round1(avgEII), registeredVoters: registered };
  }).sort((a, b) => b.politicalScore - a.politicalScore);

  // 70. مؤشر الإنذار المبكر (ملخص شامل)
  const earlyWarningIndex = round1(clamp(riskIndex * 0.4 + (100 - readinessIndex) * 0.3 + exhaustionIndex * 0.3));

  return {
    keyEfficiency: keyEfficiency.slice(0, 15), avgKeyEfficiency,
    dependencyIndex, concentrationHHI, concentrationLevel,
    diversityIndex, expansionPotential, expansionIndex,
    exhaustionIndex, costPerVote,
    serviceROI: totalSpent > 0 ? round1(totalNetVotes / (totalSpent / 1000000)) : (totalNetVotes > 0 ? 100 : 0),
    financialROI,
    contactImpact,
    digitalActivity: keys.length > 0 ? round1((keys.filter(k => k.lastContactDate).length / keys.length) * 100) : 0,
    pollingCenterStrength: pollingCenterStrength.slice(0, 10),
    areaPriority, competitionIndex, winProbability,
    stabilityIndex, readinessIndex, riskIndex,
    strategicValues, politicalValue, earlyWarningIndex,
  };
}

// ═══════════════════════════════════════════════════════════════
// الدالة الرئيسية: حساب جميع الـ 70 مؤشر
// ═══════════════════════════════════════════════════════════════

export async function calculateComprehensiveIndicators() {
  // جلب البيانات من قاعدة البيانات الحالية
  const [rawKeys, rawVoters, rawTribes, rawCommission, rawServices, rawVolunteers, rawSentiments, rawCompetitors, rawSMS] = await Promise.all([
    prisma.electionKey.findMany({
      include: { tribe: true, services: true },
    }),
    prisma.voter.findMany(),
    prisma.tribe.findMany({
      include: {
        _count: { select: { voters: true, electionKeys: true } },
      },
    }),
    prisma.commissionData.findMany(),
    prisma.service.findMany(),
    prisma.volunteer.findMany(),
    prisma.sentimentTrend.findMany(),
    prisma.competitor.findMany(),
    prisma.sMSCampaign.findMany(),
  ]);

  // تجميع الناخبين حسب keyId في Map — O(N) بدل O(N×M)
  const votersByKeyId = new Map<string, typeof rawVoters>();
  for (const v of rawVoters) {
    if (!v.keyId) continue;
    const list = votersByKeyId.get(v.keyId);
    if (list) list.push(v);
    else votersByKeyId.set(v.keyId, [v]);
  }

  // إثراء المفاتيح باستخدام enrichElectoralKey الموجود
  const enrichedKeys: EnrichedKey[] = rawKeys.map((key) =>
    enrichElectoralKey(key, votersByKeyId.get(key.id) ?? [], rawSentiments)
  );

  // تحويل المفاتيح المُثراة إلى KeyData
  const keys: KeyData[] = enrichedKeys.map(k => ({
    id: k.id,
    code: k.keyCode,
    firstName: k.firstName,
    fatherName: k.fatherName || null,
    nickname: (k as any).nickname || null,
    gender: (k as any).gender || null,
    dateOfBirth: (k as any).birthDate ? new Date((k as any).birthDate).toISOString() : null,
    educationLevel: (k as any).education || null,
    profession: (k as any).profession || null,
    phone: (k as any).phone || null,
    socialMedia: (k as any).socialMedia || null,
    totalVotes: k.totalVotes,
    supportedVotes: k.supportedVotes,
    neutralVotes: k.neutralVotes,
    weakVotes: k.weakVotes,
    netVotes: k.netVotes,
    loyaltyLevel: k.loyaltyScore,
    influenceLevel: k.influenceLevel,
    mobilizationAbility: k.mobilizationCap,
    voteProtection: (k as any).voteProtection || Math.max(1, 6 - k.riskLevel),
    supportReason: (k as any).supportReason || 3,
    needsLevel: (k as any).needsLevel || 3,
    politicalNote: (k as any).politicalNote || 3,
    organizationalNote: (k as any).organizationalNote || 3,
    generalNote: (k as any).generalNote || 3,
    weightedScore: k.weightedScore,
    totalSpent: (k as any).totalSpent || ((k as any).services || []).reduce((sum: number, s: any) => sum + (s.cost || 0), 0),
    monthlyBudget: (k as any).monthlyBudget || 0,
    lastContactDate: (k as any).lastContactDate ? new Date((k as any).lastContactDate).toISOString() : null,
    trainingStatus: (k as any).trainingStatus || null,
    district: k.district,
    area: (k as any).subDistrict || null,
    pollingCenter: k.pollingCenter,
    tribeId: k.tribeId,
    isActive: (k as any).isActive ?? true,
    eiiScore: k.eiiScore,
    kriScore: k.kriScore,
    vpsScore: k.vpsScore,
    drsScore: k.drsScore,
    campaignROI: k.campaignROI,
  }));

  // تحويل الناخبين إلى VoterData
  const voters: VoterData[] = rawVoters.map(v => ({
    id: v.id,
    firstName: v.firstName,
    fullName: `${v.firstName} ${v.fatherName} ${v.grandfatherName}`.trim(),
    gender: v.gender || null,
    dateOfBirth: v.birthDate ? new Date(v.birthDate).toISOString() : null,
    educationLevel: v.education || null,
    profession: v.profession || null,
    phone: v.phone || null,
    socialMedia: v.socialMedia || null,
    district: v.district,
    area: v.area || v.subDistrict || null,
    pollingCenterId: v.pollingCenter || null,
    tribeId: v.tribeId,
    voterCategory: v.status || 'NEUTRAL',
    votedStatus: v.votedOnDay,
    confidenceScore: v.supportDegree || 3,
    electoralKeyId: v.keyId,
  }));

  // تحويل القبائل إلى TribeData
  const tribes: TribeData[] = rawTribes.map(t => ({
    id: t.id,
    name: t.name,
    influence: t.influenceRating ?? 3,
    district: t.district || null,
    _count: {
      voters: t._count.voters,
      electoralKeys: t._count.electionKeys,
    },
  }));

  // تحويل بيانات المفوضية إلى IHECRecord
  const ihec: IHECRecord[] = rawCommission.map(c => ({
    district: c.district,
    registeredVoters: c.registeredVoters,
    actualParticipants: Math.round(c.registeredVoters * ((c.registeredVoters > 0 ? (c.actualVoters / c.registeredVoters) * 100 : 0) / 100)),
    participationRate: c.registeredVoters > 0 ? (c.actualVoters / c.registeredVoters) * 100 : 0,
    maleVoters: 0,
    femaleVoters: 0,
    pollingCenters: c.pollingCenters || 0,
    electionYear: null,
  }));

  // تجميع المفاتيح حسب القضاء
  const districtKeys: Record<string, KeyData[]> = {};
  keys.forEach(k => {
    const d = k.district || 'غير محدد';
    if (!districtKeys[d]) districtKeys[d] = [];
    districtKeys[d].push(k);
  });

  // حساب جميع الفئات السبع
  const decisive = calcDecisiveIndicators(keys, voters, ihec, districtKeys, rawCompetitors);
  const campaign = calcCampaignIndicators(keys, voters, districtKeys, rawServices, rawSMS, decisive.totalNetVotes, voters.length);
  const audience = calcAudienceIndicators(keys, voters, rawSentiments);
  const influence = calcInfluenceIndicators(keys, voters, tribes);
  const performance = calcPerformanceIndicators(keys, voters, rawServices, rawVolunteers);
  const historical = calcHistoricalIndicators(ihec);
  const composite = calcCompositeAnalyticalIndicators(keys, voters, districtKeys, ihec);

  return {
    meta: {
      calculatedAt: new Date().toISOString(),
      totalKeys: keys.length,
      totalVoters: voters.length,
      totalTribes: tribes.length,
      totalDistricts: Object.keys(districtKeys).filter(d => d !== 'غير محدد').length,
    },
    decisive,
    campaign,
    audience,
    influence,
    performance,
    historical,
    composite,
  };
}
