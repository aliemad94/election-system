'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  DollarSign,
  MapPin,
  Activity,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Award,
  ChevronDown,
  Info,
  Zap,
} from 'lucide-react';

interface CompositeData {
  governorate: {
    id: string;
    eiiScore: number;
    kriScore: number;
    vpsScore: number;
    drsScore: number;
    campaignROI: number;
    apiScore: number;
    ewliScore: number;
    gsiScore: number;
    edriScore: number;
    efiScore: number;
    totalKeysInArea: number;
    totalNetVotes: number;
    totalSupportedVotes: number;
    totalNeutralVotes: number;
    totalWeakVotes: number;
    totalVotersInArea: number;
    projectedSeats: number;
    calculatedAt: string;
  } | null;
  districts: {
    id: string;
    district: string;
    eiiScore: number;
    kriScore: number;
    vpsScore: number;
    drsScore: number;
    campaignROI: number;
    apiScore: number;
    ewliScore: number;
    gsiScore: number;
    edriScore: number;
    efiScore: number;
    totalKeysInArea: number;
    totalNetVotes: number;
    totalSupportedVotes: number;
    totalNeutralVotes: number;
    totalWeakVotes: number;
    totalVotersInArea: number;
    projectedSeats: number;
  }[];
  lastCalculated: string | null;
}

const INDICATORS = [
  { key: 'eiiScore', name: 'مؤشر النفوذ الانتخابي', abbr: 'EII', icon: Zap, color: '#3b82f6', desc: 'يقيس قدرة المفاتيح على تحويل النفوذ الاجتماعي إلى أصوات فعلية. المعادلة: (التقييم الموزون×30%) + (نسبة الأصوات الصافية×25%) + (التأثير×25%) + (التحشيد×20%)' },
  { key: 'kriScore', name: 'مؤشر موثوقية المفتاح', abbr: 'KRI', icon: Shield, color: '#10b981', desc: 'يقيس مدى إمكانية الاعتماد على المفتاح يوم الاقتراع. المعادلة: (الولاء×25%) + (أسباب الدعم×20%) + (الحماية×20%) + (قلة الاحتياجات×20%) + (الاستقرار×15%)' },
  { key: 'vpsScore', name: 'مؤشر احتمالية التصويت', abbr: 'VPS', icon: Target, color: '#8b5cf6', desc: 'يقدر نسبة الناخبين الذين سيصوتون فعلاً. المعادلة: (المؤيد×80%×50%) + (المحايد×50%×30%) + (الضعيف×30%×20%) مع تعديل المشاركة التاريخية' },
  { key: 'drsScore', name: 'مؤشر خطر الانسحاب', abbr: 'DRS', icon: AlertTriangle, color: '#ef4444', desc: 'يحسب احتمال انقلاب المفتاح أو انسحاب دعمه. المعادلة: (ضعف الولاء×25%) + (ضعف الدعم×20%) + (الاحتياجات×20%) + (ضعف الوعي السياسي×15%) + (ضعف التنظيم×10%) + (انقطاع التواصل×10%). ملاحظة: القيمة الأعلى = خطر أكبر' },
  { key: 'campaignROI', name: 'مؤشر كفاءة الإنفاق', abbr: 'ROI', icon: DollarSign, color: '#f59e0b', desc: 'يقيس العائد الانتخابي مقابل كل دينار مُنفق. المعادلة: (الأصوات الصافية / الإنفاق بالآلاف) × 10' },
  { key: 'apiScore', name: 'مؤشر قابلية الاختراق', abbr: 'API', icon: TrendingUp, color: '#06b6d4', desc: 'يقيس قدرة الحملة على اختراق مناطق الخصوم. المعادلة: (نسبة المحايد×30%) + (فرصة التوسع×25%) + (معدل التحسن×25%) + (القوة الجغرافية×20%)' },
  { key: 'ewliScore', name: 'مؤشر الإنذار المبكر للخسارة', abbr: 'EWLI', icon: AlertTriangle, color: '#dc2626', desc: 'يتنبأ بكمية الأصوات المعرضة للخسارة. المعادلة: (الأصوات الضعيفة×30%) + (خطر الانسحاب×25%) + (التهديدات×20%) + (انخفاض المؤيد×15%) + (قوة الخصوم×10%). ملاحظة: القيمة الأعلى = خطر أكبر' },
  { key: 'gsiScore', name: 'مؤشر القوة الجغرافية', abbr: 'GSI', icon: MapPin, color: '#0ea5e9', desc: 'يقيس التغطية الجغرافية وجودة التوزيع. المعادلة: (التغطية×25%) + (الأصوات الموزعة×25%) + (متوسط التقييم×25%) + (التوازن×25%)' },
  { key: 'edriScore', name: 'مؤشر جاهزية الاقتراع', abbr: 'EDRI', icon: CheckCircle2, color: '#22c55e', desc: 'يقيس استعداد الحملة ليوم التصويت. المعادلة: (المفاتيح المدربة×20%) + (الحماية العالية×20%) + (المندوبون×20%) + (التحقق×20%) + (الولاء العالي×20%)' },
  { key: 'efiScore', name: 'مؤشر التوقع الانتخابي النهائي', abbr: 'EFI', icon: Brain, color: '#7c3aed', desc: 'المؤشر الشامل للتنبؤ بالمقاعد. المعادلة: EII×15% + KRI×15% + VPS×20% + (100-DRS)×10% + API×10% + (100-EWLI)×10% + GSI×10% + EDRI×10%' },
];

function getScoreColor(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'text-green-600';
  if (s >= 50) return 'text-blue-600';
  if (s >= 25) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'bg-green-50 border-green-200';
  if (s >= 50) return 'bg-blue-50 border-blue-200';
  if (s >= 25) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function getBarColor(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'bg-green-500';
  if (s >= 50) return 'bg-blue-500';
  if (s >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function AdvancedIndicators() {
  const [data, setData] = useState<CompositeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/composite-indicators');
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/composite-indicators?recalculate=true', { method: 'POST' });
      const d = await res.json();
      await fetchData();
    } catch (err) {
      console.error('Error recalculating:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-el-on-surface-variant">
        جاري تحميل المؤشرات المركبة...
      </div>
    );
  }

  const gov = data.governorate;
  if (!gov) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Brain className="w-16 h-16 text-el-primary opacity-30" />
        <p className="text-el-on-surface-variant">لم يتم حساب المؤشرات بعد</p>
        <button onClick={recalculate} className="bg-el-primary text-el-on-primary px-6 py-2 rounded hover:opacity-90">
          حساب المؤشرات الآن
        </button>
      </div>
    );
  }

  const activeData = selectedDistrict && data.districts.length > 0
    ? data.districts.find(d => d.district === selectedDistrict) || gov
    : gov;
  const isActiveGov = activeData === gov;

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <Brain className="w-6 h-6" /> المؤشرات المركبة المتقدمة
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            غرفة العمليات الانتخابية - الذكاء التحليلي والتنبؤ - محافظة ذي قار
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
          >
            <option value="">محافظة ذي قار (كلي)</option>
            {data.districts.map(d => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>
          <button
            onClick={recalculate}
            disabled={calculating}
            className="bg-el-primary text-el-on-primary px-4 py-1.5 rounded text-[12px] flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'جاري الحساب...' : 'إعادة حساب'}
          </button>
        </div>
      </div>

      {/* ═══ المؤشر النهائي + المقاعد المتوقعة ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* التوقع الانتخابي النهائي EFI */}
        <div className="lg:col-span-2 bg-gradient-to-l from-el-primary to-[#0a2a5e] text-white rounded-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full translate-x-6 translate-y-6" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-el-secondary" />
              <span className="text-[14px] font-bold text-white/80">مؤشر التوقع الانتخابي النهائي (EFI)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[56px] font-bold leading-none" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                {activeData.efiScore.toFixed(1)}
              </span>
              <span className="text-[20px] text-white/60">/100</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-el-secondary transition-all duration-700"
                style={{ width: `${activeData.efiScore}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60">
              EFI = EII×15% + KRI×15% + VPS×20% + (100-DRS)×10% + API×10% + (100-EWLI)×10% + GSI×10% + EDRI×10%
            </p>
          </div>
        </div>

        {/* المقاعد المتوقعة */}
        <div className="bg-el-surface-container-lowest border-2 border-el-secondary/30 rounded-sm p-5 flex flex-col items-center justify-center">
          <Award className="w-8 h-8 text-el-secondary mb-2" />
          <span className="text-[11px] text-el-on-surface-variant uppercase tracking-wider mb-1">المقاعد المتوقعة</span>
          <span className="text-[48px] font-bold text-el-secondary leading-none" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            {activeData.projectedSeats?.toFixed(1) || '0'}
          </span>
          <span className="text-[12px] text-el-on-surface-variant">من أصل 18 مقعد في ذي قار</span>
        </div>
      </section>

      {/* ═══ شبكة المؤشرات العشرة ═══ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {INDICATORS.map(ind => {
          const score = (activeData as any)[ind.key] || 0;
          const isInverted = ind.key === 'drsScore' || ind.key === 'ewliScore';
          const Icon = ind.icon;
          return (
            <div
              key={ind.key}
              className={`border rounded-sm p-3 ${getScoreBg(score, isInverted)} relative cursor-pointer transition-all hover:shadow-md`}
              onClick={() => setShowInfo(showInfo === ind.key ? null : ind.key)}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-4 h-4" style={{ color: ind.color }} />
                <span className="text-[11px] font-bold text-el-on-surface">{ind.abbr}</span>
                <Info className="w-3 h-3 text-el-on-surface-variant opacity-50" />
              </div>
              <div className={`text-[28px] font-bold leading-none mb-1 ${getScoreColor(score, isInverted)}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>
                {score.toFixed(1)}
              </div>
              <div className="text-[10px] text-el-on-surface-variant leading-tight">{ind.name}</div>
              <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${getBarColor(score, isInverted)}`}
                  style={{ width: `${isInverted ? 100 - score : score}%` }}
                />
              </div>
              {isInverted && (
                <div className="text-[9px] text-red-500 mt-1">⚠ الأعلى = خطر أكبر</div>
              )}
              
              {/* نافذة المعادلة */}
              {showInfo === ind.key && (
                <div className="absolute top-full right-0 left-0 z-20 mt-1 bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-2 shadow-lg text-[10px] text-el-on-surface-variant leading-relaxed">
                  {ind.desc}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ═══ ملخص إحصائي ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-el-primary font-mono">{activeData.totalKeysInArea}</div>
          <div className="text-[10px] text-el-on-surface-variant">مفتاح انتخابي</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-green-600 font-mono">{activeData.totalSupportedVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات مؤيدة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-yellow-600 font-mono">{activeData.totalNeutralVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات محايدة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-red-600 font-mono">{activeData.totalWeakVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات ضعيفة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-el-primary font-mono">{activeData.totalNetVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات صافية</div>
        </div>
      </section>

      {/* ═══ مقارنة الأقضية ═══ */}
      {data.districts.length > 0 && (
        <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
          <h3 className="text-[16px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-el-primary" /> مقارنة المؤشرات حسب الأقضية
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px] leading-[16px]">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-el-on-surface-variant text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-2 py-2 font-normal">القضاء</th>
                  <th className="px-2 py-2 font-normal text-center">EFI</th>
                  <th className="px-2 py-2 font-normal text-center">EII</th>
                  <th className="px-2 py-2 font-normal text-center">KRI</th>
                  <th className="px-2 py-2 font-normal text-center">VPS</th>
                  <th className="px-2 py-2 font-normal text-center">DRS</th>
                  <th className="px-2 py-2 font-normal text-center">API</th>
                  <th className="px-2 py-2 font-normal text-center">GSI</th>
                  <th className="px-2 py-2 font-normal text-center">EDRI</th>
                  <th className="px-2 py-2 font-normal text-center">مقاعد</th>
                  <th className="px-2 py-2 font-normal text-center">صافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50">
                {data.districts
                  .sort((a, b) => b.efiScore - a.efiScore)
                  .map((d, idx) => (
                    <tr key={d.district} className={`hover:bg-el-surface-container-lowest/50 ${idx % 2 === 1 ? 'bg-el-surface-container-low/30' : ''}`}>
                      <td className="px-2 py-1.5 font-semibold text-el-on-surface">{d.district}</td>
                      <td className="px-2 py-1.5 text-center font-mono font-bold">
                        <span className={getScoreColor(d.efiScore)}>{d.efiScore.toFixed(1)}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.eiiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.kriScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.vpsScore.toFixed(1)}%</td>
                      <td className="px-2 py-1.5 text-center font-mono">
                        <span className={getScoreColor(d.drsScore, true)}>{d.drsScore.toFixed(1)}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.apiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.gsiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.edriScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono font-bold text-el-secondary">
                        {d.projectedSeats?.toFixed(1) || '-'}
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono text-el-primary">{d.totalNetVotes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ مخطط المؤشرات الشامل ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[16px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-el-primary" /> الملف التعريفي الانتخابي - محافظة ذي قار
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {INDICATORS.map(ind => {
            const score = (activeData as any)[ind.key] || 0;
            const isInverted = ind.key === 'drsScore' || ind.key === 'ewliScore';
            const normalizedScore = isInverted ? 100 - score : score;
            return (
              <div key={ind.key} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-el-on-surface-variant">{ind.abbr}</span>
                <div className="w-full bg-el-surface-variant rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${normalizedScore}%`,
                      backgroundColor: ind.color,
                    }}
                  />
                </div>
                <span className={`text-[12px] font-bold font-mono ${getScoreColor(score, isInverted)}`}>
                  {score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ آخر تحديث ═══ */}
      <div className="text-[10px] text-el-on-surface-variant text-center">
        آخر حساب: {data.lastCalculated ? new Date(data.lastCalculated).toLocaleString('ar-IQ') : 'لم يتم الحساب بعد'}
      </div>
    </div>
  );
}
