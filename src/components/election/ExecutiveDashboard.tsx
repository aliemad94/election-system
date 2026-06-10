'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Shield, AlertTriangle, MapPin, TrendingUp, TrendingDown,
  Users, Key, BarChart3, Award, Activity, Zap, ChevronDown, ChevronUp,
  Vote, ArrowUp, ArrowDown, Eye, ShieldAlert,
} from 'lucide-react';

interface DecisiveData {
  expectedVotesOnDay: number;
  expectedParticipation: number;
  strongAreas: any[];
  weakAreas: any[];
  geoDistribution: any[];
  keyRanking: any[];
  avgKRI: number;
  avgDRS: number;
  supportDistribution: {
    supported: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
    weak: { count: number; percentage: number };
  };
  areaMap: { district: string; color: 'green' | 'yellow' | 'red'; strength: number; netVotes: number; keyCount: number }[];
  totalNetVotes: number;
  totalRegistered: number;
  projectedSeats: number;
  gpsVerificationRate: number;
  registryVerificationRate: number;
  averageKeyAccuracy: number;
  serviceConversionRate: number;
  expectedVotes?: number;
  expectedTurnout?: number;
  votesNeededToWin?: number;
  electoralGap?: number;
  winProbability?: number;
  overallRisk?: number;
}

interface MetaData {
  calculatedAt: string;
  totalKeys: number;
  totalVoters: number;
  totalTribes: number;
  totalDistricts: number;
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<{ decisive: DecisiveData; meta: MetaData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/comprehensive-indicators');
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error('Error fetching indicators:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Activity className="w-6 h-6 text-el-primary animate-pulse" />
        <span className="text-el-on-surface-variant text-[14px]">جاري حساب المؤشرات الحاسمة...</span>
      </div>
    );
  }

  const d = data?.decisive || {} as any;
  const m = data?.meta || {} as any;
  
  const areaMap = d.areaMap || [];
  const greenCount = areaMap.filter((a: any) => a?.color === 'green').length;
  const yellowCount = areaMap.filter((a: any) => a?.color === 'yellow').length;
  const redCount = areaMap.filter((a: any) => a?.color === 'red').length;

  const expectedVotesOnDay = d.expectedVotesOnDay ?? d.expectedVotes ?? 0;
  const expectedParticipation = d.expectedParticipation ?? d.expectedTurnout ?? 0;
  const totalNetVotes = d.totalNetVotes ?? 0;
  const totalRegistered = d.totalRegistered ?? 0;
  const projectedSeats = d.projectedSeats ?? 0;
  const avgKRI = d.avgKRI ?? 0;
  const avgDRS = d.avgDRS ?? 0;
  const gpsVerificationRate = d.gpsVerificationRate ?? 0;
  const registryVerificationRate = d.registryVerificationRate ?? 0;
  const averageKeyAccuracy = d.averageKeyAccuracy ?? 100;
  const serviceConversionRate = d.serviceConversionRate ?? 0;

  const votesNeededToWin = d.votesNeededToWin ?? 12000;
  const electoralGap = d.electoralGap ?? Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const winProbability = d.winProbability ?? Math.min(100, Math.round((expectedVotesOnDay / votesNeededToWin) * 100));
  const overallRisk = d.overallRisk ?? Math.min(100, Math.max(0, Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4)));
  
  const supportDistribution = d.supportDistribution || {
    supported: { count: 0, percentage: 0 },
    neutral: { count: 0, percentage: 0 },
    weak: { count: 0, percentage: 0 }
  };
  
  const strongAreas = d.strongAreas || [];
  const weakAreas = d.weakAreas || [];
  const geoDistribution = d.geoDistribution || [];
  const keyRanking = d.keyRanking || [];

  return (
    <div className="flex flex-col gap-3 max-w-[1440px] mx-auto w-full">
      {/* ═══ العنوان ═══ */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[22px] font-bold text-el-primary flex items-center gap-2">
            <Target className="w-6 h-6" /> المؤشرات الحاسمة — ذي قار
          </h1>
          <p className="text-[11px] text-el-on-surface-variant mt-0.5">
            هل نحن متجهون للفوز أم الخسارة؟ — {m.totalKeys ?? 0} مفتاح · {m.totalVoters ?? 0} ناخب · {m.totalDistricts ?? 0} أقضية
          </p>
        </div>
        <div className="text-[10px] text-el-on-surface-variant bg-el-surface-container px-2 py-1 rounded">
          آخر تحديث: {new Date(m.calculatedAt || Date.now()).toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* ═══ Hero: المؤشرات الاستراتيجية ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* المقاعد المتوقعة - بنر عريض فاخر */}
        <div className="bg-gradient-to-r from-el-primary via-[#0f3b7d] to-el-primary text-white rounded-lg p-6 relative overflow-hidden shadow-lg border border-el-primary/30 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-24 -translate-y-24 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 translate-y-16 pointer-events-none" />
          
          <div className="relative z-10 flex-1 w-full text-right">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-el-secondary animate-pulse" />
              <span className="text-[13px] text-white/80 font-bold uppercase tracking-wider">خلاصة تقدير المقاعد المقترحة</span>
            </div>
            <h2 className="text-[20px] font-bold text-white mb-1">مسار حصد المقاعد النيابية في مجلس محافظة ذي قار</h2>
            <p className="text-[12px] text-white/70">
              يتم تحديث هذا التقدير ديناميكياً بناءً على صافي أصوات المفاتيح الانتخابية ومطابقتها مع نسبة المشاركة المستهدفة.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-[56px] font-extrabold leading-none font-mono text-el-secondary">{projectedSeats}</span>
              <span className="text-[20px] text-white/60">/ 18 مقعداً</span>
            </div>
            <div className="w-full md:w-64">
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-el-secondary transition-all duration-1000 rounded-full" style={{ width: `${(projectedSeats / 18) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 1. الأصوات المطلوبة للفوز */}
        <div className="bg-el-surface-container-lowest border-2 border-amber-500/20 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">الأصوات المطلوبة للفوز</span>
            </div>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">العتبة المستهدفة للمقعد</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-bold text-amber-700 leading-none font-mono">{votesNeededToWin.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant">صوت</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant leading-relaxed">
            الحد الأدنى التقريبي لحسم مقعد في ذي قار
          </div>
        </div>

        {/* 2. عدد الأصوات المتوقعة */}
        <div className="bg-el-surface-container-lowest border-2 border-el-primary/20 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-el-primary" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">عدد الأصوات المتوقعة</span>
            </div>
            <span className="text-[10px] text-el-primary bg-el-primary/5 px-2 py-0.5 rounded font-medium">معدل تقديري</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-bold text-el-primary leading-none font-mono">{expectedVotesOnDay.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant">صوت محتمل</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant">
            صافي الأصوات: <span className="font-bold text-el-primary font-mono">{totalNetVotes.toLocaleString()}</span> · المسجلون: <span className="font-mono">{totalRegistered.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. مؤشر الفجوة الانتخابية */}
        <div className={`border-2 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all ${electoralGap > 0 ? 'bg-red-50/50 border-red-500/20' : 'bg-green-50/50 border-green-500/20'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${electoralGap > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">مؤشر الفجوة الانتخابية</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${electoralGap > 0 ? 'text-red-600 bg-red-100/50' : 'text-green-600 bg-green-100/50'}`}>
              {electoralGap > 0 ? 'تحت المستهدف' : 'تم تخطي المستهدف'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-[36px] font-bold leading-none font-mono ${electoralGap > 0 ? 'text-red-700' : 'text-green-700'}`}>{electoralGap.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant">صوت متبقي</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant">
            {electoralGap > 0 ? 'الفارق المطلوب تغطيته لحسم الفوز بالمقعد' : 'أصواتنا الحالية تتجاوز عتبة الفوز الآمنة'}
          </div>
        </div>

        {/* 4. نسبة المشاركة المتوقعة */}
        <div className="bg-el-surface-container-lowest border-2 border-el-secondary/20 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-el-secondary" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">نسبة المشاركة المتوقعة</span>
            </div>
            <span className="text-[10px] text-el-secondary bg-el-secondary/5 px-2 py-0.5 rounded font-medium">تقدير الدائرة الميداني</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-bold text-el-secondary leading-none font-mono">{expectedParticipation}%</span>
          </div>
          <div className="mt-3 w-full">
            <div className="h-1.5 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-el-secondary transition-all" style={{ width: `${expectedParticipation}%` }} />
            </div>
          </div>
        </div>

        {/* 5. إمكانية الفوز */}
        <div className="bg-el-surface-container-lowest border-2 border-purple-500/20 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">إمكانية الفوز</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${winProbability >= 70 ? 'text-green-600 bg-green-50' : winProbability >= 40 ? 'text-purple-600 bg-purple-50' : 'text-red-600 bg-red-50'}`}>
              {winProbability >= 70 ? 'مرتفعة جداً' : winProbability >= 40 ? 'ممكنة' : 'ضعيفة'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-bold text-purple-700 leading-none font-mono">{winProbability}%</span>
            <span className="text-[12px] text-el-on-surface-variant">جاهزية حصد المقعد</span>
          </div>
          <div className="mt-3 w-full">
            <div className="h-1.5 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 transition-all" style={{ width: `${winProbability}%` }} />
            </div>
          </div>
        </div>

        {/* 6. مؤشر المخاطر الانتخابية الشامل */}
        <div className={`border-2 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-all ${overallRisk > 50 ? 'bg-red-50/50 border-red-500/20' : overallRisk > 25 ? 'bg-yellow-50/50 border-yellow-500/20' : 'bg-green-50/50 border-green-500/20'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-5 h-5 ${overallRisk > 50 ? 'text-red-500' : overallRisk > 25 ? 'text-yellow-500' : 'text-green-500'}`} />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">مؤشر المخاطر الانتخابية الشامل</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${overallRisk > 50 ? 'text-red-600 bg-red-100/50' : overallRisk > 25 ? 'text-yellow-600 bg-yellow-100/50' : 'text-green-600 bg-green-100/50'}`}>
              {overallRisk > 50 ? 'خطر مرتفع' : overallRisk > 25 ? 'خطر متوسط' : 'خطر منخفض'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-[36px] font-bold leading-none font-mono ${overallRisk > 50 ? 'text-red-700' : overallRisk > 25 ? 'text-yellow-700' : 'text-green-700'}`}>{overallRisk}%</span>
          </div>
          <div className="mt-3 w-full">
            <div className="h-1.5 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className={`h-full transition-all ${overallRisk > 50 ? 'bg-red-600' : overallRisk > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${overallRisk}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ مؤشرا الدقة والخطر + نسب التأييد ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* مؤشرات DRS + KRI */}
        <div className="grid grid-cols-2 gap-3">
          {/* مؤشر دقة المفتاح KRI */}
          <div className={`rounded-lg p-4 border-2 ${avgKRI >= 60 ? 'border-green-200 bg-green-50/50' : avgKRI >= 40 ? 'border-yellow-200 bg-yellow-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <Shield className={`w-5 h-5 mb-1 ${avgKRI >= 60 ? 'text-green-600' : avgKRI >= 40 ? 'text-yellow-600' : 'text-red-600'}`} />
            <div className="text-[10px] text-el-on-surface-variant uppercase tracking-wider">دقة المفتاح</div>
            <div className={`text-[32px] font-bold font-mono leading-none mt-1 ${avgKRI >= 60 ? 'text-green-700' : avgKRI >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>{avgKRI}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">KRI — من 100</div>
          </div>
          {/* مؤشر خطر التسرب DRS */}
          <div className={`rounded-lg p-4 border-2 ${avgDRS <= 30 ? 'border-green-200 bg-green-50/50' : avgDRS <= 50 ? 'border-yellow-200 bg-yellow-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <AlertTriangle className={`w-5 h-5 mb-1 ${avgDRS <= 30 ? 'text-green-600' : avgDRS <= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
            <div className="text-[10px] text-el-on-surface-variant uppercase tracking-wider">خطر التسرب</div>
            <div className={`text-[32px] font-bold font-mono leading-none mt-1 ${avgDRS <= 30 ? 'text-green-700' : avgDRS <= 50 ? 'text-yellow-700' : 'text-red-700'}`}>{avgDRS}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">DRS — الأقل أفضل</div>
          </div>
        </div>

        {/* نسبة المؤيدين / المحايدين / الضعفاء */}
        <div className="lg:col-span-2 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-el-on-surface mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-el-primary" /> نسبة المؤيدين والمحايدين والضعفاء
          </h3>
          <div className="flex gap-4 items-center">
            {/* شريط مركب */}
            <div className="flex-1">
              <div className="h-8 w-full rounded-lg overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.supported?.percentage ?? 0}%` }}>
                  {(supportDistribution.supported?.percentage ?? 0) > 10 ? `${supportDistribution.supported?.percentage}%` : ''}
                </div>
                <div className="bg-yellow-400 h-full transition-all flex items-center justify-center text-yellow-900 text-[11px] font-bold"
                  style={{ width: `${supportDistribution.neutral?.percentage ?? 0}%` }}>
                  {(supportDistribution.neutral?.percentage ?? 0) > 10 ? `${supportDistribution.neutral?.percentage}%` : ''}
                </div>
                <div className="bg-red-400 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.weak?.percentage ?? 0}%` }}>
                  {(supportDistribution.weak?.percentage ?? 0) > 10 ? `${supportDistribution.weak?.percentage}%` : ''}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                  <span>مؤيد: <b className="font-mono">{(supportDistribution.supported?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
                  <span>محايد: <b className="font-mono">{(supportDistribution.neutral?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span>ضعيف: <b className="font-mono">{(supportDistribution.weak?.count ?? 0).toLocaleString()}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ غرفة مراقبة موثوقية وجودة البيانات الميدانية (Data Reliability Cockpit) ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-5">
        <h3 className="text-[14px] font-bold text-el-on-surface mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-el-primary" /> غرفة مراقبة جودة وموثوقية البيانات الميدانية (Auditing Cockpit)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. التدقيق الجغرافي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">نسبة التدقيق الجغرافي (GPS)</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">GPS Audited</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-blue-700 font-mono leading-none">{gpsVerificationRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all rounded-full" style={{ width: `${gpsVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">الزيارات الميدانية المؤكدة بموقع جغرافي حقيقي للناخب</p>
          </div>

          {/* 2. مطابقة سجل المفوضية */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">التحقق البيومتري (المفوضية)</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Registry Match</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-purple-700 font-mono leading-none">{registryVerificationRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all rounded-full" style={{ width: `${registryVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">نسبة مطابقة كشوف بطاقات الناخب مع السجل الفيدرالي الرسمي</p>
          </div>

          {/* 3. متوسط دقة التقارير الفعلي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">دقة تقارير المفاتيح (Calibrated)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Report Accuracy</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-amber-700 font-mono leading-none">{averageKeyAccuracy}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all rounded-full" style={{ width: `${averageKeyAccuracy}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">معيار مصداقية ترشيحات المفاتيح بناءً على عينات التدقيق العشوائية</p>
          </div>

          {/* 4. معدل تحويل الأصوات الخدمي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">معدل كسب الأصوات الخدمي (ROI)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Service ROI</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-emerald-700 font-mono leading-none">{serviceConversionRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all rounded-full" style={{ width: `${serviceConversionRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">نسبة نجاح تلبية الخدمات في كسب وضمان أصوات المؤيدين</p>
          </div>

        </div>
      </section>

      {/* ═══ خريطة المناطق: أخضر / أصفر / أحمر ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[14px] font-bold text-el-on-surface flex items-center gap-2">
            <MapPin className="w-4 h-4 text-el-primary" /> خريطة المناطق — توزيع القوة جغرافياً
          </h3>
          <div className="flex gap-2 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> قوية ({greenCount})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400" /> متأرجحة ({yellowCount})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400" /> ضعيفة ({redCount})</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {areaMap.map((area: any) => (
            <div
              key={area?.district || Math.random().toString()}
              className={`rounded-lg p-3 border-2 transition-all hover:shadow-md ${
                area?.color === 'green' ? 'border-green-300 bg-green-50' :
                area?.color === 'yellow' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${
                  area?.color === 'green' ? 'bg-green-500' :
                  area?.color === 'yellow' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
                <span className="text-[13px] font-bold text-el-on-surface">{area?.district || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-el-on-surface-variant">
                <span>القوة: <b className="font-mono">{area?.strength ?? 0}%</b></span>
                <span>صافي: <b className="font-mono">{area?.netVotes ?? 0}</b></span>
              </div>
              <div className="text-[10px] text-el-on-surface-variant mt-0.5">{area?.keyCount ?? 0} مفتاح</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ مناطق القوة والضعف جنباً إلى جنب ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* مناطق القوة */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-green-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> مناطق القوة
          </h3>
          {strongAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant">لا توجد مناطق بقوة ≥ 50%</p>
          ) : (
            <div className="space-y-2">
              {strongAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12px] bg-white/60 rounded p-2">
                  <span className="font-semibold text-green-800">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span>القوة: <b>{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b>{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* مناطق الضعف */}
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-red-800 mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> مناطق الضعف
          </h3>
          {weakAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant">لا توجد مناطق بقوة &lt; 35%</p>
          ) : (
            <div className="space-y-2">
              {weakAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12px] bg-white/60 rounded p-2">
                  <span className="font-semibold text-red-800">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span>القوة: <b>{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b>{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ توزيع القوة جغرافياً ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[14px] font-bold text-el-on-surface mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-el-primary" /> توزيع القوة جغرافياً
        </h3>
        <div className="space-y-2">
          {geoDistribution.map((g: any) => (
            <div key={g?.district || Math.random().toString()}>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="font-medium">{g?.district}</span>
                <span className="font-mono text-el-on-surface-variant">
                  {g?.netVotes ?? 0} صوت · {g?.percentage ?? 0}% · {g?.keyCount ?? 0} مفتاح
                </span>
              </div>
              <div className="h-3 w-full bg-el-surface-variant rounded-full overflow-hidden">
                <div className="bg-el-primary h-full transition-all rounded-full" style={{ width: `${g?.percentage ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ترتيب المفاتيح الانتخابية ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-3 border-b border-el-outline-variant">
          <h3 className="text-[14px] font-bold text-el-on-surface flex items-center gap-2">
            <Key className="w-4 h-4 text-el-secondary" /> ترتيب المفاتيح الانتخابية — من الأقوى إلى الأضعف
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[12px]">
            <thead className="bg-el-surface-container border-b border-el-outline-variant text-[10px] font-bold uppercase text-el-on-surface-variant">
              <tr>
                <th className="px-3 py-2 w-10 font-normal">#</th>
                <th className="px-3 py-2 font-normal">الكود</th>
                <th className="px-3 py-2 font-normal">الاسم</th>
                <th className="px-3 py-2 font-normal">القضاء</th>
                <th className="px-3 py-2 font-normal text-center">الأصوات الصافية</th>
                <th className="px-3 py-2 font-normal text-center">التقييم</th>
                <th className="px-3 py-2 font-normal text-center">EII</th>
                <th className="px-3 py-2 font-normal text-center">KRI</th>
                <th className="px-3 py-2 font-normal text-center">DRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-el-outline-variant/50">
              {keyRanking.map((k: any) => (
                <tr key={k?.code || Math.random().toString()} className={`hover:bg-el-surface-container-low/50 transition-colors ${k?.rank && k.rank <= 3 ? 'bg-el-secondary-container/10' : ''}`}>
                  <td className="px-3 py-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      k?.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      k?.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      k?.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-el-surface-variant text-el-on-surface-variant'
                    }`}>
                      {k?.rank ?? '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-el-primary font-semibold">{k?.code}</td>
                  <td className="px-3 py-2 font-medium">
                    {k?.name}
                    {k?.nickname && <span className="text-el-on-surface-variant text-[10px] mr-1">({k.nickname})</span>}
                  </td>
                  <td className="px-3 py-2 text-el-on-surface-variant">{k?.district || '-'}</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-el-primary">{k?.netVotes ?? 0}</td>
                  <td className="px-3 py-2 text-center font-mono">{k?.weightedScore ?? 0}</td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.eiiScore ?? 0) >= 60 ? 'text-green-600' : (k?.eiiScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.eiiScore ?? 0}
                  </td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.kriScore ?? 0) >= 60 ? 'text-green-600' : (k?.kriScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.kriScore ?? 0}
                  </td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.drsScore ?? 0) <= 30 ? 'text-green-600' : (k?.drsScore ?? 0) <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.drsScore ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
