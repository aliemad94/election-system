'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Shield, AlertTriangle, MapPin, TrendingUp, TrendingDown,
  Users, Key, BarChart3, Award, Activity, Zap, ChevronDown, ChevronUp,
  Vote, ArrowUp, ArrowDown, Eye, ShieldAlert,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const DistrictMap = dynamic(() => import('./districtmap'), { ssr: false });
import IndicatorInfoBar from "./IndicatorInfoBar";
import Explainable from "./Explainable";


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
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setData({ error: errData.error || `خطأ في الاتصال بالخادم (${res.status})` } as any);
          return;
        }
        const d = await res.json();
        setData(d);
      } catch (err: any) {
        console.error('Error fetching indicators:', err);
        setData({ error: err?.message || 'خطأ غير متوقع في جلب البيانات' } as any);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto w-full p-4 animate-pulse">
        {/* Title skeleton */}
        <div className="flex justify-between items-center border-b border-el-outline-variant/30 pb-3">
          <div className="h-8 bg-el-surface-container-highest rounded-md w-64"></div>
          <div className="h-5 bg-el-surface-container-highest rounded-md w-32"></div>
        </div>

        {/* Top metrics grids skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-el-surface-container border border-el-outline-variant/20 rounded-xl p-6 flex flex-col justify-between">
              <div className="h-4 bg-el-surface-container-highest rounded w-24"></div>
              <div className="h-8 bg-el-surface-container-highest rounded w-32 mt-2"></div>
              <div className="h-3 bg-el-surface-container-highest rounded w-48 mt-1"></div>
            </div>
          ))}
        </div>

        {/* Main section skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[450px] bg-el-surface-container border border-el-outline-variant/20 rounded-xl p-6"></div>
          <div className="h-[450px] bg-el-surface-container border border-el-outline-variant/20 rounded-xl p-6"></div>
        </div>
      </div>
    );
  }

  if (!data || 'error' in data) {
    const errorMsg = data ? (data as any).error : 'تعذر تحميل البيانات';
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-8 text-center max-w-[600px] mx-auto mt-12 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-el-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-[18px] font-bold text-el-on-surface">أهلاً بك في الماكينة الانتخابية</h2>
        <p className="text-[14px] text-el-on-surface-variant leading-relaxed">
          {errorMsg === 'غير مسموح' 
            ? 'بصفتك مندوباً ميدانياً، يرجى الانتقال إلى تبويبات "تسجيل الناخبين" أو "بوابة المندوب الميداني" لبدء إدخال وتحديث البيانات.' 
            : `تعذر جلب بيانات لوحة التحكم: ${errorMsg}`}
        </p>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 140,
        damping: 18
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full premium-noise-bg"
    >
      {/* ═══ العنوان ═══ */}
      <motion.div variants={itemVariants} className="flex justify-between items-start border-b border-el-outline-variant/30 pb-3">
        <div>
          <h1 className="text-[24px] font-extrabold text-el-primary flex items-center gap-2 tracking-tight">
            <Target className="w-6 h-6 text-el-secondary" /> المؤشرات الحاسمة — ذي قار
          </h1>
          <p className="text-[12px] text-el-on-surface-variant mt-1 font-medium">
            هل نحن متجهون للفوز أم الخسارة؟ — {m.totalKeys ?? 0} مفتاح · {m.totalVoters ?? 0} ناخب · {m.totalDistricts ?? 0} أقضية
          </p>
        </div>
        <div className="text-[11px] text-el-on-surface-variant bg-el-surface-container/60 px-3 py-1.5 rounded-lg border border-el-outline-variant/20 kowalski-shadow-sm font-mono">
          آخر تحديث: {new Date(m.calculatedAt || Date.now()).toLocaleString('en-US')}
        </div>
      </motion.div>

      {/* ═══ Hero: المؤشرات الاستراتيجية ═══ */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* المقاعد المتوقعة - بنر عريض فاخر */}
        <div className="lg:col-span-3">
          <IndicatorInfoBar indicatorKey="PROJECTED_SEATS" />
          <div className="bg-gradient-to-r from-el-primary via-[#0e2752] to-el-primary text-white rounded-xl p-6 relative overflow-hidden kowalski-shadow-lg border border-el-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-24 -translate-y-24 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 translate-y-16 pointer-events-none" />
            
            <div className="relative z-10 flex-1 w-full text-right">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6 text-el-secondary animate-pulse" />
                <Explainable termKey="PROJECTED_SEATS" plain className="text-[13px] text-white/90 font-bold uppercase tracking-wider hover:text-white cursor-pointer transition-colors">
                  خلاصة تقدير المقاعد المقترحة
                </Explainable>
              </div>
              <h2 className="text-[22px] font-extrabold text-white mb-2 tracking-tight">مسار حصد المقاعد النيابية في مجلس محافظة ذي قار</h2>
              <p className="text-[13px] text-white/70 leading-relaxed font-light">
                يتم تحديث هذا التقدير ديناميكياً بناءً على صافي أصوات المفاتيح الانتخابية ومطابقتها مع نسبة المشاركة المستهدفة.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-[64px] font-black leading-none font-mono text-el-secondary tracking-tighter">{projectedSeats}</span>
                <span className="text-[22px] text-white/60 font-medium">/ 18 مقعداً</span>
              </div>
              <div className="w-full md:w-64">
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-el-secondary transition-all duration-1000 rounded-full" style={{ width: `${(projectedSeats / 18) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. الأصوات المطلوبة للفوز */}
        <div>
          <IndicatorInfoBar indicatorKey="VOTES_NEEDED" compact />
          <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                <Explainable termKey="VOTES_NEEDED" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  الأصوات المطلوبة للفوز
                </Explainable>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold">عتبة الفوز</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[38px] font-black text-amber-600 dark:text-amber-500 leading-none font-mono tracking-tight">{votesNeededToWin.toLocaleString()}</span>
              <span className="text-[12px] text-el-on-surface-variant font-semibold">صوت</span>
            </div>
            <div className="mt-4 text-[11px] text-el-on-surface-variant/80 border-t border-el-outline-variant/10 pt-2 font-medium">
              الحد الأدنى التقريبي لحسم مقعد في ذي قار
            </div>
          </div>
        </div>

        {/* 2. عدد الأصوات المتوقعة */}
        <div>
          <IndicatorInfoBar indicatorKey="EXPECTED_VOTES" compact />
          <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-el-primary" />
                <Explainable termKey="EXPECTED_VOTES" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  الأصوات المتوقعة
                </Explainable>
              </div>
              <span className="text-[10px] text-el-primary dark:text-el-primary-fixed bg-el-primary/10 dark:bg-el-primary-container px-2.5 py-0.5 rounded-full font-bold">تقدير حالي</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[38px] font-black text-el-primary leading-none font-mono tracking-tight">{expectedVotesOnDay.toLocaleString()}</span>
              <span className="text-[12px] text-el-on-surface-variant font-semibold">صوت محتمل</span>
            </div>
            <div className="mt-4 text-[11px] text-el-on-surface-variant/80 border-t border-el-outline-variant/10 pt-2 font-medium flex justify-between">
              <span>صافي: <b className="font-mono text-el-primary">{totalNetVotes.toLocaleString()}</b></span>
              <span>مسجلين: <b className="font-mono">{totalRegistered.toLocaleString()}</b></span>
            </div>
          </div>
        </div>

        {/* 3. مؤشر الفجوة الانتخابية */}
        <div>
          <IndicatorInfoBar indicatorKey="ELECTORAL_GAP" compact />
          <div className={`border rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px] bg-gradient-to-br ${electoralGap > 0 ? 'from-red-500/5 to-red-500/10 border-red-500/20 dark:border-red-500/30' : 'from-green-500/5 to-green-500/10 border-green-500/20 dark:border-green-500/30'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${electoralGap > 0 ? 'text-red-500' : 'text-green-500'}`} />
                <Explainable termKey="ELECTORAL_GAP" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  الفجوة الانتخابية
                </Explainable>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${electoralGap > 0 ? 'text-red-700 bg-red-500/10 dark:text-red-400' : 'text-green-700 bg-green-500/10 dark:text-green-400'}`}>
                {electoralGap > 0 ? 'تحت المستهدف' : 'تخطي الآمن'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-[38px] font-black leading-none font-mono tracking-tight ${electoralGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{electoralGap.toLocaleString()}</span>
              <span className="text-[12px] text-el-on-surface-variant font-semibold">صوت</span>
            </div>
            <div className="mt-4 text-[11px] text-el-on-surface-variant/80 border-t border-el-outline-variant/10 pt-2 font-medium">
              {electoralGap > 0 ? 'الفارق المطلوب تغطيته لحسم الفوز بالمقعد' : 'أصواتنا الحالية تتجاوز عتبة الفوز الآمنة'}
            </div>
          </div>
        </div>

        {/* 4. نسبة المشاركة المتوقعة */}
        <div>
          <IndicatorInfoBar indicatorKey="PARTICIPATION" compact />
          <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-el-secondary" />
                <Explainable termKey="PARTICIPATION" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  المشاركة المتوقعة
                </Explainable>
              </div>
              <span className="text-[10px] text-el-secondary dark:text-el-secondary-fixed bg-el-secondary/10 px-2.5 py-0.5 rounded-full font-bold">ميداني</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[38px] font-black text-el-secondary leading-none font-mono tracking-tight">{expectedParticipation}%</span>
            </div>
            <div className="mt-4 w-full border-t border-el-outline-variant/10 pt-3">
              <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-el-secondary transition-all duration-700" style={{ width: `${expectedParticipation}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 5. إمكانية الفوز */}
        <div>
          <IndicatorInfoBar indicatorKey="WIN_PROBABILITY" compact />
          <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
                <Explainable termKey="WIN_PROBABILITY" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  جاهزية حصد المقعد
                </Explainable>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${winProbability >= 70 ? 'text-green-700 bg-green-500/10 dark:text-green-400' : winProbability >= 40 ? 'text-purple-700 bg-purple-500/10 dark:text-purple-400' : 'text-red-700 bg-red-500/10 dark:text-red-400'}`}>
                {winProbability >= 70 ? 'مرتفعة جداً' : winProbability >= 40 ? 'ممكنة' : 'ضعيفة'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[38px] font-black text-purple-500 leading-none font-mono tracking-tight">{winProbability}%</span>
            </div>
            <div className="mt-4 w-full border-t border-el-outline-variant/10 pt-3">
              <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all duration-700" style={{ width: `${winProbability}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 6. مؤشر المخاطر الانتخابية الشامل */}
        <div>
          <IndicatorInfoBar indicatorKey="OVERALL_RISK" compact />
          <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 flex flex-col justify-between kowalski-shadow-md premium-hover-card h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                <Explainable termKey="OVERALL_RISK" plain className="text-[13px] text-el-on-surface font-bold hover:text-el-secondary transition-colors cursor-pointer">
                  مؤشر المخاطر الشامل
                </Explainable>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${overallRisk > 50 ? 'text-red-700 bg-red-500/10' : overallRisk > 25 ? 'text-yellow-700 bg-yellow-500/10' : 'text-green-700 bg-green-500/10'}`}>
                {overallRisk > 50 ? 'مخاطر عالية' : overallRisk > 25 ? 'متوسطة' : 'منخفضة'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[38px] font-black text-el-on-surface leading-none font-mono tracking-tight">{overallRisk}</span>
              <span className="text-[12px] text-el-on-surface-variant font-semibold">/ 100</span>
            </div>
            <div className="mt-3 w-full border-t border-el-outline-variant/20 pt-3">
              <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${overallRisk > 50 ? 'bg-red-500' : overallRisk > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${overallRisk}%` }} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ مؤشرا الدقة والخطر + نسب التأييد ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* مؤشرات DRS + KRI */}
        <div className="grid grid-cols-2 gap-4">
          {/* مؤشر دقة المفتاح KRI */}
          <div className={`rounded-xl p-4 border kowalski-shadow-sm transition-all duration-300 ${avgKRI >= 60 ? 'border-green-500/20 bg-green-500/5' : avgKRI >= 40 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <Shield className={`w-5 h-5 mb-2.5 ${avgKRI >= 60 ? 'text-green-500' : avgKRI >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
            <div className="text-[11px] font-bold text-el-on-surface-variant uppercase tracking-wide">
              <Explainable termKey="KRI">دقة المفتاح</Explainable>
            </div>
            <div className={`text-[34px] font-black font-mono leading-none mt-1.5 ${avgKRI >= 60 ? 'text-green-600' : avgKRI >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{avgKRI}</div>
            <div className="text-[10px] text-el-on-surface-variant/80 mt-2 font-medium">KRI — المعيار العام للمشروع</div>
          </div>
          {/* مؤشر خطر التسرب DRS */}
          <div className={`rounded-xl p-4 border kowalski-shadow-sm transition-all duration-300 ${avgDRS <= 30 ? 'border-green-500/20 bg-green-500/5' : avgDRS <= 50 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <AlertTriangle className={`w-5 h-5 mb-2.5 ${avgDRS <= 30 ? 'text-green-500' : avgDRS <= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
            <div className="text-[11px] font-bold text-el-on-surface-variant uppercase tracking-wide">
              <Explainable termKey="DRS">خطر التسرب</Explainable>
            </div>
            <div className={`text-[34px] font-black font-mono leading-none mt-1.5 ${avgDRS <= 30 ? 'text-green-600' : avgDRS <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{avgDRS}</div>
            <div className="text-[10px] text-el-on-surface-variant/80 mt-2 font-medium">DRS — الأقل أفضل</div>
          </div>
        </div>

        {/* نسبة المؤيدين / المحايدين / الضعفاء */}
        <div className="lg:col-span-2 bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 kowalski-shadow-md">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-4 flex items-center gap-2 tracking-tight">
            <Users className="w-4.5 h-4.5 text-el-secondary" />
            <Explainable termKey="VOTER_CLASSIFICATION">نسبة المؤيدين والمحايدين والضعفاء</Explainable>
          </h3>
          <div className="flex gap-4 items-center">
            {/* شريط مركب */}
            <div className="flex-1">
              <div className="h-7 w-full rounded-lg overflow-hidden flex kowalski-shadow-sm border border-el-outline-variant/20">
                <div className="bg-green-500 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.supported?.percentage ?? 0}%` }}>
                  {(supportDistribution.supported?.percentage ?? 0) > 10 ? `${supportDistribution.supported?.percentage}%` : ''}
                </div>
                <div className="bg-yellow-400 h-full transition-all flex items-center justify-center text-yellow-950 text-[11px] font-bold"
                  style={{ width: `${supportDistribution.neutral?.percentage ?? 0}%` }}>
                  {(supportDistribution.neutral?.percentage ?? 0) > 10 ? `${supportDistribution.neutral?.percentage}%` : ''}
                </div>
                <div className="bg-red-400 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.weak?.percentage ?? 0}%` }}>
                  {(supportDistribution.weak?.percentage ?? 0) > 10 ? `${supportDistribution.weak?.percentage}%` : ''}
                </div>
              </div>
              <div className="flex justify-between mt-3 text-[11.5px] font-medium text-el-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                  <span>مؤيد: <b className="font-mono text-el-primary">{(supportDistribution.supported?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
                  <span>محايد: <b className="font-mono text-el-primary">{(supportDistribution.neutral?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span>ضعيف: <b className="font-mono text-el-primary">{(supportDistribution.weak?.count ?? 0).toLocaleString()}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ غرفة مراقبة موثوقية وجودة البيانات الميدانية (Data Reliability Cockpit) ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 kowalski-shadow-md">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-4 flex items-center gap-2 tracking-tight">
          <Shield className="w-5 h-5 text-el-secondary" /> غرفة مراقبة جودة وموثوقية البيانات الميدانية (Auditing Cockpit)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. التدقيق الجغرافي */}
          <div className="bg-el-surface-container/30 rounded-xl p-4 flex flex-col justify-between border border-el-outline-variant/30">
            <div className="flex justify-between items-start">
              <Explainable termKey="GPS_VERIFICATION" className="text-[12px] font-bold text-el-on-surface-variant">نسبة التدقيق الجغرافي (GPS)</Explainable>
              <span className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">GPS Audited</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[28px] font-black text-blue-700 dark:text-blue-500 font-mono leading-none">{gpsVerificationRate}%</span>
            </div>
            <div className="w-full mt-3">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all rounded-full" style={{ width: `${gpsVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-el-on-surface-variant/75 mt-2.5 font-medium leading-relaxed">الزيارات الميدانية المؤكدة بموقع جغرافي حقيقي للناخب</p>
          </div>

          {/* 2. مطابقة سجل المفوضية */}
          <div className="bg-el-surface-container/30 rounded-xl p-4 flex flex-col justify-between border border-el-outline-variant/30">
            <div className="flex justify-between items-start">
              <Explainable termKey="REGISTRY_VERIFICATION" className="text-[12px] font-bold text-el-on-surface-variant">التحقق البيومتري (المفوضية)</Explainable>
              <span className="bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Registry Match</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[28px] font-black text-purple-700 dark:text-purple-500 font-mono leading-none">{registryVerificationRate}%</span>
            </div>
            <div className="w-full mt-3">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all rounded-full" style={{ width: `${registryVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-el-on-surface-variant/75 mt-2.5 font-medium leading-relaxed">نسبة مطابقة كشوف بطاقات الناخب مع السجل الفيدرالي الرسمي</p>
          </div>

          {/* 3. متوسط دقة التقارير الفعلي */}
          <div className="bg-el-surface-container/30 rounded-xl p-4 flex flex-col justify-between border border-el-outline-variant/30">
            <div className="flex justify-between items-start">
              <Explainable termKey="KRI" className="text-[12px] font-bold text-el-on-surface-variant">دقة تقارير المفاتيح (Calibrated)</Explainable>
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Report Accuracy</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[28px] font-black text-amber-700 dark:text-amber-500 font-mono leading-none">{averageKeyAccuracy}%</span>
            </div>
            <div className="w-full mt-3">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all rounded-full" style={{ width: `${averageKeyAccuracy}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-el-on-surface-variant/75 mt-2.5 font-medium leading-relaxed">معيار مصداقية ترشيحات المفاتيح بناءً على عينات التدقيق العشوائية</p>
          </div>

          {/* 4. معدل تحويل الأصوات الخدمي */}
          <div className="bg-el-surface-container/30 rounded-xl p-4 flex flex-col justify-between border border-el-outline-variant/30">
            <div className="flex justify-between items-start">
              <Explainable termKey="SERVICE_CONVERSION" className="text-[12px] font-bold text-el-on-surface-variant">معدل كسب الأصوات الخدمي (ROI)</Explainable>
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Service ROI</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[28px] font-black text-emerald-700 dark:text-emerald-500 font-mono leading-none">{serviceConversionRate}%</span>
            </div>
            <div className="w-full mt-3">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all rounded-full" style={{ width: `${serviceConversionRate}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-el-on-surface-variant/75 mt-2.5 font-medium leading-relaxed">نسبة نجاح تلبية الخدمات في كسب وضمان أصوات المؤيدين</p>
          </div>

        </div>
      </section>

      {/* ═══ خريطة المناطق الجغرافية التفاعلية ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 kowalski-shadow-md">
        {/* الخريطة التفاعلية */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-2 tracking-tight">
            <MapPin className="w-4.5 h-4.5 text-el-primary" /> خريطة الدوائر الانتخابية التفاعلية — ذي قار
          </h3>
          <DistrictMap districtData={areaMap} height={380} />
        </div>
        {/* قائمة تفاصيل الأقضية */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-4.5 h-4.5 text-el-secondary" /> ملخص توزيع القوة جغرافياً
            </h3>
            <div className="flex gap-2 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> قوية ({greenCount})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> متأرجحة ({yellowCount})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> ضعيفة ({redCount})</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 custom-scroll pr-1">
            {areaMap.map((area: any) => (
              <div
                key={area?.district || Math.random().toString()}
                className={`rounded-xl p-3 border transition-all duration-300 hover:scale-[1.01] ${
                  area?.color === 'green' ? 'border-green-300/40 bg-green-500/5 dark:bg-green-950/20' :
                  area?.color === 'yellow' ? 'border-yellow-300/40 bg-yellow-500/5 dark:bg-yellow-950/20' :
                  'border-red-300/40 bg-red-500/5 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      area?.color === 'green' ? 'bg-green-500' :
                      area?.color === 'yellow' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <span className="text-[13px] font-bold text-el-on-surface">{area?.district || 'غير محدد'}</span>
                  </div>
                  <div className="flex gap-3 items-center text-[11px] text-el-on-surface-variant font-mono">
                    <span>صافي: <b className="text-el-primary">{area?.netVotes ?? 0}</b></span>
                    <span>تأييد: <b className="text-el-primary">{area?.strength ?? 0}%</b></span>
                    <span>مفاتيح: <b>{area?.keyCount ?? 0}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ مناطق القوة والضعف جنباً إلى جنب ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* مناطق القوة */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 kowalski-shadow-sm">
          <h3 className="text-[13px] font-bold text-green-700 dark:text-green-500 mb-3 flex items-center gap-2 tracking-tight">
            <TrendingUp className="w-4.5 h-4.5" /> مناطق القوة (تأييد ≥ 50%)
          </h3>
          {strongAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant/80 font-medium">لا توجد مناطق بقوة ≥ 50%</p>
          ) : (
            <div className="space-y-2">
              {strongAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12.5px] bg-el-surface-container-lowest/60 border border-green-500/10 rounded-lg p-2.5 kowalski-shadow-sm">
                  <span className="font-bold text-green-800 dark:text-green-400">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11.5px] text-el-on-surface-variant">
                    <span>القوة: <b className="text-green-600 dark:text-green-400">{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b className="text-el-primary">{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* مناطق الضعف */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 kowalski-shadow-sm">
          <h3 className="text-[13px] font-bold text-red-700 dark:text-red-500 mb-3 flex items-center gap-2 tracking-tight">
            <TrendingDown className="w-4.5 h-4.5" /> مناطق الضعف (تأييد &lt; 35%)
          </h3>
          {weakAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant/80 font-medium">لا توجد مناطق بقوة &lt; 35%</p>
          ) : (
            <div className="space-y-2">
              {weakAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12.5px] bg-el-surface-container-lowest/60 border border-red-500/10 rounded-lg p-2.5 kowalski-shadow-sm">
                  <span className="font-bold text-red-800 dark:text-red-400">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11.5px] text-el-on-surface-variant">
                    <span>القوة: <b className="text-red-600 dark:text-red-400">{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b className="text-el-primary">{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ توزيع القوة جغرافياً ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl p-5 kowalski-shadow-md">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-4 flex items-center gap-2 tracking-tight">
          <BarChart3 className="w-5 h-5 text-el-primary" /> توزيع القوة والنتائج جغرافياً عبر الأقضية
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* قائمة الأقضية بالتفاصيل */}
          <div className="space-y-3">
            {geoDistribution.map((g: any) => (
              <div key={g?.district || Math.random().toString()} className="bg-el-surface-container/10 border border-el-outline-variant/20 rounded-xl p-3 hover:bg-el-surface-container/20 transition-all duration-300">
                <div className="flex justify-between text-[12.5px] mb-2">
                  <span className="font-bold text-el-on-surface">{g?.district}</span>
                  <span className="font-mono text-el-on-surface-variant font-semibold">
                    {g?.netVotes ?? 0} صوت صافي · {g?.percentage ?? 0}% تأييد · {g?.keyCount ?? 0} مفتاح
                  </span>
                </div>
                <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                  <div className="bg-el-primary h-full transition-all duration-700 rounded-full" style={{ width: `${g?.percentage ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* مخطط Recharts التفاعلي */}
          <div className="bg-el-surface-container/10 border border-el-outline-variant/40 rounded-xl p-4 h-72 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-el-on-surface-variant mb-2">رسم بياني تفاعلي: الأصوات الصافية لكل قضاء</span>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoDistribution} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--el-outline-variant)" opacity={0.2} vertical={false} />
                  <XAxis dataKey="district" stroke="var(--el-on-surface-variant)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--el-on-surface-variant)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--el-surface-container-lowest)',
                      borderColor: 'var(--el-outline-variant)',
                      borderRadius: '8px',
                      color: 'var(--el-on-surface)',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    cursor={{ fill: 'var(--el-surface-container-high)', opacity: 0.2 }}
                  />
                  <Bar dataKey="netVotes" name="الأصوات الصافية" fill="var(--el-primary)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ترتيب المفاتيح الانتخابية ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl overflow-hidden kowalski-shadow-md">
        <div className="bg-el-surface-container/60 px-5 py-4 border-b border-el-outline-variant/30 flex justify-between items-center">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-2 tracking-tight">
            <Key className="w-4.5 h-4.5 text-el-secondary" /> ترتيب المفاتيح الانتخابية — من الأقوى إلى الأضعف
          </h3>
          <span className="text-[10px] bg-el-surface-variant text-el-on-surface-variant font-bold px-2.5 py-1 rounded-full border border-el-outline-variant/15">مرتبة تنازلياً</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[12.5px] border-collapse">
            <thead className="bg-el-surface-container/30 border-b border-el-outline-variant/20 text-[11px] font-bold uppercase text-el-on-surface-variant">
              <tr>
                <th className="px-4 py-3 w-12 font-bold text-center">#</th>
                <th className="px-4 py-3 font-bold">الكود</th>
                <th className="px-4 py-3 font-bold">الاسم</th>
                <th className="px-4 py-3 font-bold">القضاء</th>
                <th className="px-4 py-3 font-bold text-center">الأصوات الصافية</th>
                <th className="px-4 py-3 font-bold text-center">التقييم</th>
                <th className="px-4 py-3 font-bold text-center">EII</th>
                <th className="px-4 py-3 font-bold text-center">KRI</th>
                <th className="px-4 py-3 font-bold text-center">DRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-el-outline-variant/20">
              {keyRanking.map((k: any) => (
                <tr key={k?.code || Math.random().toString()} className={`hover:bg-el-surface-container/30 transition-colors duration-200 ${k?.rank && k.rank <= 3 ? 'bg-el-secondary-container/5 dark:bg-el-secondary/5' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-black ${
                      k?.rank === 1 ? 'bg-yellow-400 text-yellow-950 kowalski-shadow-sm' :
                      k?.rank === 2 ? 'bg-slate-300 text-slate-800 kowalski-shadow-sm' :
                      k?.rank === 3 ? 'bg-amber-600 text-white kowalski-shadow-sm' :
                      'bg-el-surface-variant text-el-on-surface-variant font-medium'
                    }`}>
                      {k?.rank ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-el-primary font-bold">{k?.code}</td>
                  <td className="px-4 py-3 font-bold text-el-on-surface">
                    {k?.name}
                    {k?.nickname && <span className="text-el-on-surface-variant text-[11px] mr-1.5 font-normal opacity-85">({k.nickname})</span>}
                  </td>
                  <td className="px-4 py-3 text-el-on-surface-variant font-medium">{k?.district || '-'}</td>
                  <td className="px-4 py-3 text-center font-mono font-black text-el-primary">{k?.netVotes ?? 0}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-el-on-surface">{k?.weightedScore ?? 0}</td>
                  <td className={`px-4 py-3 text-center font-mono font-bold ${(k?.eiiScore ?? 0) >= 60 ? 'text-green-600' : (k?.eiiScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.eiiScore ?? 0}
                  </td>
                  <td className={`px-4 py-3 text-center font-mono font-bold ${(k?.kriScore ?? 0) >= 60 ? 'text-green-600' : (k?.kriScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.kriScore ?? 0}
                  </td>
                  <td className={`px-4 py-3 text-center font-mono font-bold ${(k?.drsScore ?? 0) <= 30 ? 'text-green-600' : (k?.drsScore ?? 0) <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.drsScore ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}


