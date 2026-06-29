'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Shield, Activity, TrendingUp, Key,
  Target, AlertTriangle, MapPin, Award, Brain,
  DollarSign, Megaphone, UserCheck, Clock, Zap,
  Crown, Briefcase, Globe, Phone, HelpCircle, FileText, CheckCircle2, ShieldAlert, Vote, Wrench
} from 'lucide-react';
import InfluenceTab from '@/components/election/InfluenceTab';
import { safeMerge, EMPTY_DECISIVE } from '@/lib/safedata';

/** دالة حماية عامة لأي تبويب — تضمن إن كل المصفوفات موجودة */
function safeTab(data: any): any {
  if (!data || typeof data !== 'object') return {};
  // Deep clone simple objects, wrap arrays
  const out: any = {};
  for (const key of Object.keys(data)) {
    const v = data[key];
    if (v === null || v === undefined) {
      out[key] = Array.isArray(data[key]) ? [] : 0;
    } else if (Array.isArray(v)) {
      out[key] = v.length > 0 ? v : [];
    } else {
      out[key] = v;
    }
  }
  return out;
}

type TabId =
  | 'decisive'
  | 'regions'
  | 'keys'
  | 'audience'
  | 'influence'
  | 'performance'
  | 'media'
  | 'investment'
  | 'pollingDay'
  | 'strategic';

const TABS: { id: TabId; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'decisive', label: 'المؤشرات الحاسمة', icon: Target, description: 'هل نتجه نحو الفوز أو الخسارة؟ (1-12)' },
  { id: 'regions', label: 'مؤشرات المناطق', icon: MapPin, description: 'أين نركز الجهد والمال؟ (13-21)' },
  { id: 'keys', label: 'المفاتيح الانتخابية', icon: Key, description: 'من هم الأشخاص الذين نعتمد عليهم؟ (22-28)' },
  { id: 'audience', label: 'الجمهور والناخبين', icon: Users, description: 'من هو جمهورنا وكيف نستهدفه؟ (29-38)' },
  { id: 'influence', label: 'النفوذ الاجتماعي والسياسي', icon: Crown, description: 'من يؤثر على الناخبين؟ (39-47)' },
  { id: 'performance', label: 'الأداء الميداني والتنظيمي', icon: Activity, description: 'هل تعمل الحملة بكفاءة؟ (48-55)' },
  { id: 'media', label: 'الإعلام والاتصال السياسي', icon: Megaphone, description: 'هل رسائلنا الانتخابية مؤثرة؟ (56-60)' },
  { id: 'investment', label: 'العائد والاستثمار', icon: DollarSign, description: 'هل نصرف الموارد بشكل صحيح؟ (61-65)' },
  { id: 'pollingDay', label: 'يوم الاقتراع', icon: CheckCircle2, description: 'ماذا يحدث الآن داخل مراكز الاقتراع؟ (66-75)' },
  { id: 'strategic', label: 'التخطيط الاستراتيجي والتاريخي', icon: Clock, description: 'إلى أين نتجه مستقبلاً؟ (76-80)' },
];

function ScoreBar({ score, max = 100, color = 'bg-el-primary', height = 'h-2' }: { score: number; max?: number; color?: string; height?: string }) {
  return (
    <div className={`w-full bg-el-surface-variant rounded-full ${height} overflow-hidden`}>
      <div className={`${color} ${height} transition-all rounded-full`} style={{ width: `${Math.min((score / max) * 100, 100)}%` }} />
    </div>
  );
}

function IndicatorCard({ 
  number, 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'text-el-primary',
  bgColor = 'bg-el-primary/5',
  activationGuide 
}: { 
  number: number; 
  title: string; 
  value: any; 
  subtitle?: string; 
  icon: React.ElementType; 
  color?: string;
  bgColor?: string;
  activationGuide?: string;
}) {
  const [showGuide, setShowGuide] = useState(false);
  const isZeroOrEmpty = value === 0 || value === '0' || value === '0%' || value === 'N/A' || (Array.isArray(value) && value.length === 0);

  return (
    <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-3 hover:shadow-md transition-all relative flex flex-col justify-between min-h-[120px]">
      <div>
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${bgColor} ${color}`}>
              {number}
            </div>
            <span className="text-[11px] font-semibold text-el-on-surface-variant line-clamp-1">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon className={`w-4 h-4 ${color}`} />
            {activationGuide && (
              <button 
                onClick={() => setShowGuide(!showGuide)}
                title="كيف يتم تفعيل وحساب هذا المؤشر؟" 
                className="text-el-on-surface-variant opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <div className={`text-[22px] font-bold font-mono ${isZeroOrEmpty ? 'text-el-on-surface-variant/40' : color}`}>
            {isZeroOrEmpty ? '0' : value}
          </div>
          {subtitle && !isZeroOrEmpty && (
            <span className="text-[10px] text-el-on-surface-variant line-clamp-1">{subtitle}</span>
          )}
        </div>
      </div>

      {activationGuide && showGuide && (
        <div className="absolute inset-0 bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 z-10 text-[10px] text-el-on-surface-variant leading-relaxed flex flex-col justify-between">
          <p className="font-semibold text-el-primary flex items-center gap-1">
            <Brain className="w-3 h-3" /> دليل المؤشر:
          </p>
          <p className="mt-1">{activationGuide}</p>
          <button 
            onClick={() => setShowGuide(false)} 
            className="text-[9px] text-el-secondary font-bold self-end hover:underline mt-1 cursor-pointer"
          >
            إغلاق المساعدة
          </button>
        </div>
      )}

      {isZeroOrEmpty && activationGuide && !showGuide && (
        <div className="text-[9px] text-el-on-surface-variant/40 italic flex items-center gap-1 mt-1 border-t border-el-outline-variant/30 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          بانتظار إدخال البيانات الميدانية
        </div>
      )}
    </div>
  );
}

export default function DataAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('decisive');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/comprehensive-indicators');
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error('Error fetching analysis:', err);
      } finally {
        setData((prev: any) => prev || null);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg">
        <Brain className="w-6 h-6 text-el-primary animate-pulse" />
        <span className="text-el-on-surface-variant text-[14px]">جاري تشغيل محرك التحليل الشامل (80 مؤشراً)...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس التحليل الفاخر */}
      <div className="bg-gradient-to-l from-el-primary to-[#0a2a5e] text-white rounded-lg p-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
        <div className="relative z-10">
          <h1 className="text-[24px] leading-[32px] font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-el-secondary" /> غرفة التحليل والقياس الانتخابي — 80 مؤشرًا
          </h1>
          <p className="text-[12px] leading-[18px] text-white/70 mt-1 max-w-3xl">
            العقل المركزي للحملة الانتخابية: تحويل العمل الميداني من العشوائية والتخمين إلى قرارات إدارية مبنية على البيانات، والتنبؤ الدقيق بالنتائج، وإدارة يوم الاقتراع بكفاءة عالية في محافظة ذي قار.
          </p>
        </div>
      </div>

      {/* التبويبات العشرة */}
      <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-el-outline-variant scrollbar-thin">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-el-primary text-el-on-primary font-bold border-el-primary shadow-sm'
                  : 'bg-el-surface-container text-el-on-surface-variant border-transparent hover:bg-el-surface-container-highest'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="text-[12px] text-el-on-surface-variant bg-el-surface-container p-3 rounded-lg border border-el-outline-variant flex items-center gap-2">
        <span className="font-bold text-el-primary">📊 لوحة المؤشرات المركزية:</span>
        <span>جميع المؤشرات جاهزة لاستقبال البيانات الميدانية. انقر على أيقونة المساعدة <HelpCircle className="w-3.5 h-3.5 inline text-el-primary" /> بجوار أي مؤشر لمعرفة نوع البيانات المطلوب إدخالها ميدانياً لتفعيله.</span>
      </div>

      {/* محتوى التبويبات */}
      <div className="min-h-[400px]">
        {activeTab === 'decisive' && <DecisiveTab data={safeMerge(data.decisive, EMPTY_DECISIVE)} />}
        {activeTab === 'regions' && <RegionsTab data={safeTab(data.regions)} />}
        {activeTab === 'keys' && <KeysTab data={safeTab(data.keys)} />}
        {activeTab === 'audience' && <AudienceTab data={safeTab(data.audience)} />}
        {activeTab === 'influence' && <InfluenceTab data={safeTab(data.influence)} />}
        {activeTab === 'performance' && <PerformanceTab data={safeTab(data.performance)} />}
        {activeTab === 'media' && <MediaTab data={safeTab(data.media)} />}
        {activeTab === 'investment' && <InvestmentTab data={safeTab(data.investment)} />}
        {activeTab === 'pollingDay' && <PollingDayTab data={safeTab(data.pollingDay)} />}
        {activeTab === 'strategic' && <StrategicTab data={safeTab(data.strategic)} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. المؤشرات الحاسمة (1-12)
// ═══════════════════════════════════════════════════════════════
function DecisiveTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fallback: any = 0) => (v !== undefined && v !== null) ? v : fallback;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={1} title="عدد الأصوات المتوقعة" value={(safe(d.expectedVotes) || safe(d.expectedVotesOnDay)).toLocaleString()} subtitle="صوت محتمل" icon={Vote} activationGuide="يُحسب تلقائياً من الأصوات الصافية للمفاتيح الانتخابية الموزعة حسب نسبة المشاركة التاريخية لذي قار." />
        <IndicatorCard number={2} title="الأصوات المطلوبة للفوز" value={safe(d.votesNeededToWin, 12000).toLocaleString()} subtitle="العتبة المستهدفة للمقعد" icon={Award} color="text-amber-600" bgColor="bg-amber-100" activationGuide="العتبة الانتخابية الثابتة المطلوبة لحصد مقعد آمن لمجلس المحافظة (محددة بـ 12,000 صوت في ذي قار)." />
        <IndicatorCard number={3} title="مؤشر الفجوة الانتخابية" value={safe(d.electoralGap, 12000).toLocaleString()} subtitle="صوت للفوز" icon={AlertTriangle} color="text-red-600" bgColor="bg-red-100" activationGuide="هو الفرق المتبقي بين عدد الأصوات المتوقعة ومستهدف الفوز (12,000 صوت)." />
        <IndicatorCard number={4} title="احتمالية الفوز" value={`${safe(d.winProbability, 0)}%`} subtitle="جاهزية الحصول على مقعد" icon={Brain} color="text-purple-600" bgColor="bg-purple-100" activationGuide="يقيس نسبة حصد المقعد بناءً على الأصوات الصافية المتحققة مقارنة بالعتبة المطلوبة." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={5} title="نسبة المشاركة المتوقعة" value={`${safe(d.expectedTurnout) || safe(d.expectedParticipation) || 58}%`} subtitle="معدل مشاركة الناخبين" icon={Activity} activationGuide="يتم قراءته من بيانات سجلات المفوضية الموثقة في جدول IHECData للأقضية." />
        <IndicatorCard number={6} title="المخاطر الانتخابية الشامل" value={safe(d.overallRisk, 0)} subtitle="مستوى الخطر الكلي" icon={ShieldAlert} color="text-red-500" bgColor="bg-red-50" activationGuide="مؤشر يدمج متوسط خطرDefection للمفاتيح والتهديدات النشطة غير المعالجة." />
        <IndicatorCard number={7} title="مؤشر الاستقرار الانتخابي" value={safe(d.stability, 0)} subtitle="استقرار أصوات المفاتيح" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس مدى التزام واستقرار ولاء المفاتيح ومعدلات الزيارات الدورية لهم." />
        <IndicatorCard number={8} title="مؤشر الإنذار المبكر" value={safe(d.earlyWarning, 0)} subtitle="التهديدات النشطة" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" activationGuide="يتنبأ بالمشاكل السياسية والميدانية التي تسجلها الفرق الميدانية في قائمة التنبيهات." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* نسبة المؤيدين والمحايدين والمعارضين */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4 lg:col-span-2">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">9</span>
            نسبة المؤيدين والمحايدين والمعارضين
          </h3>
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-el-surface-variant">
            <div className="bg-green-500 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold" style={{ width: `${(d.supportersDistribution?.supported || d.supportDistribution?.supported?.percentage || 33.3)}%` }}>
              {(d.supportersDistribution?.supported || d.supportDistribution?.supported?.percentage || 0) > 0 ? `${d.supportersDistribution?.supported || d.supportDistribution?.supported?.percentage || 0}% مؤيد` : 'بدون مؤيد'}
            </div>
            <div className="bg-yellow-400 h-full transition-all flex items-center justify-center text-yellow-900 text-[11px] font-bold" style={{ width: `${(d.supportersDistribution?.neutral || d.supportDistribution?.neutral?.percentage || 33.3)}%` }}>
              {(d.supportersDistribution?.neutral || d.supportDistribution?.neutral?.percentage || 0) > 0 ? `${d.supportersDistribution?.neutral || d.supportDistribution?.neutral?.percentage || 0}% محايد` : 'بدون محايد'}
            </div>
            <div className="bg-red-400 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold" style={{ width: `${(d.supportersDistribution?.opponent || d.supportDistribution?.weak?.percentage || 33.3)}%` }}>
              {(d.supportersDistribution?.opponent || d.supportDistribution?.weak?.percentage || 0) > 0 ? `${d.supportersDistribution?.opponent || d.supportDistribution?.weak?.percentage || 0}% معارض` : 'بدون ضعيف'}
            </div>
          </div>
          <p className="text-[10px] text-el-on-surface-variant mt-2 italic">
            * يتم الحساب بناءً على تصنيف الناخبCategory في جدول الناخبين (مؤيد، محايد، ضعيف). يرجى تسجيل الناخبين في قائمة "تسجيل الناخبين" لتحديث هذا الشريط.
          </p>
        </div>

        {/* مؤشر خطر التسرب */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-50 text-red-500">10</span>
            مؤشر خطر التسرب الانتخابي
          </h3>
          <div className="text-[36px] font-bold font-mono text-red-500 leading-none">{safe(d.defectionRisk) || safe(d.avgDRS, 0)}</div>
          <p className="text-[10px] text-el-on-surface-variant mt-1.5">
            يقيس احتمال خروج المفاتيح الانتخابية عن التحالف أو التراجع عن دعم المرشح بسبب الاحتياجات أو انقطاع الاتصال.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 11. خريطة المناطق */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">11</span>
            خريطة المناطق الانتخابية (أخضر / أصفر / أحمر)
          </h3>
          {d.areaMap.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-el-on-surface-variant/50">
              لا توجد مناطق لعرض قوتها. يرجى إدخال بيانات المفاتيح الانتخابية وتخصيص الأقضية لها.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {d.areaMap.map((area: any) => (
                <div key={area.district} className={`p-2.5 border rounded-lg flex justify-between items-center ${
                  area.color === 'green' ? 'bg-green-50 border-green-200 text-green-800' :
                  area.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="font-semibold text-[12px]">{area.district}</span>
                  <span className="font-mono text-[12px] font-bold">{area.strength}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 12. توزيع القوة الجغرافية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">12</span>
            توزيع القوة الجغرافية (صافي الأصوات ونسبتها)
          </h3>
          {d.geoDistribution.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-el-on-surface-variant/50">
              بانتظار إدخال المفاتيح وتوزيع أصواتهم جغرافياً.
            </div>
          ) : (
            <div className="space-y-2">
              {d.geoDistribution.map((geo: any) => (
                <div key={geo.district} className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold">{geo.district}</span>
                  <span className="font-mono text-el-on-surface-variant">{geo.netVotes} صوت ({geo.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. مؤشرات المناطق الانتخابية (13-21)
// ═══════════════════════════════════════════════════════════════
function RegionsTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* مناطق القوة */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-600">13</span>
            🟢 مناطق القوة الانتخابية (قوة الأصوات &gt;= 50%)
          </h3>
          {(d.strongAreas || []).length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد أقضية مصنفة كمنطقة قوة حالياً.</p>
          ) : (
            <div className="space-y-1">
              {(d.strongAreas || []).map((a: any) => (
                <div key={a.district} className="flex justify-between text-[12px] font-medium text-green-800">
                  <span>{a.district}</span>
                  <span className="font-mono">{a.strength}% تأييد</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مناطق الضعف */}
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-red-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-100 text-red-600">14</span>
            🔴 مناطق الضعف الانتخابية (قوة الأصوات &lt; 35%)
          </h3>
          {(d.weakAreas || []).length === 0 ? (
            <p className="text-[11px] text-red-800/60 italic">لا توجد مناطق ضعف (جميعها مستقرة أو لم تسجل بعد).</p>
          ) : (
            <div className="space-y-1">
              {(d.weakAreas || []).map((a: any) => (
                <div key={a.district} className="flex justify-between text-[12px] font-medium text-red-800">
                  <span>{a.district}</span>
                  <span className="font-mono">{a.strength}% تأييد</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IndicatorCard number={15} title="مؤشر أولوية المنطقة" value={(d.priorityIndex || []).length > 0 ? d.priorityIndex[0]?.district : 'N/A'} subtitle={(d.priorityIndex || []).length > 0 ? `درجة الأولوية: ${d.priorityIndex[0]?.score}` : undefined} icon={MapPin} activationGuide="يحدد أولوية التدخل في المناطق التي تحتوي على كتل أصوات متأرجحة (محايد وضعيف) كبيرة." />
        <IndicatorCard number={16} title="مؤشر القيمة السياسية للمنطقة" value={(d.politicalValue || []).length > 0 ? d.politicalValue[0]?.district : 'N/A'} subtitle={(d.politicalValue || []).length > 0 ? `القيمة: ${d.politicalValue[0]?.score}` : undefined} icon={Award} activationGuide="مؤشر يدمج عدد المسجلين الكليين للمفوضية وحجم التأييد المحرز للحملة." />
        <IndicatorCard number={17} title="مؤشر المنافسة الانتخابية" value={(d.competitionIndex || []).length > 0 ? d.competitionIndex[0]?.district : 'N/A'} subtitle={(d.competitionIndex || []).length > 0 ? `قوة الخصوم: ${d.competitionIndex[0]?.score}` : undefined} icon={ShieldAlert} activationGuide="يُحسب بناءً على تحركات الخصوم المسجلين في قائمة المنافسين وقوتهم في القضاء." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <IndicatorCard number={18} title="مؤشر تركز الأصوات (HHI)" value={d.concentrationHHI} subtitle="قياس تشتت أو تركز الأصوات" icon={Target} activationGuide="مؤشر هيرفيندال لقياس تركز الأصوات في أيدي مفاتيح معينة. الرقم المنخفض = توازن جيد للأصوات." />
        <IndicatorCard number={19} title="مؤشر التوسع الانتخابي" value={`${d.expansionIndex}%`} subtitle={`صافي التوسع: +${d.expansionPotential} صوت`} icon={TrendingUp} activationGuide="يقيس نسبة النمو التصويتي الممكن إحرازه من تحويل الأصوات المحايدة لداعمة." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* التغير في المشاركة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">20</span>
            التغير في نسبة المشاركة التاريخية للأقضية
          </h3>
          {(d.turnoutChange || []).length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">
              يرجى إضافة نتائج انتخابات سابقة لجدول ElectionResult لعرض التحولات في المشاركة.
            </p>
          ) : (
            <div className="space-y-2">
              {(d.turnoutChange || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* التحول التصويتي */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">21</span>
            التحول في التصويت بين الانتخابات
          </h3>
          {(d.votingShift || []).length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">
              بانتظار توثيق تحولات القوى الحزبية التاريخية في قاعدة البيانات.
            </p>
          ) : (
            <div className="space-y-2">
              {(d.votingShift || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} - قائمة {item.party}</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. مؤشرات المفاتيح الانتخابية (22-28)
// ═══════════════════════════════════════════════════════════════
function KeysTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      {/* الترتيب والموثوقية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={23} title="مؤشر دقة المفتاح (KRI)" value={d.accuracy} subtitle="دقة التعهدات والمعلومات" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس مصداقية المفتاح ونظافة بياناته المسجلة بناءً على تكرار الزيارات." />
        <IndicatorCard number={24} title="كفاءة المفتاح الانتخابي" value={`${d.efficiency}%`} subtitle="متوسط كفاءة المفاتيح" icon={Award} activationGuide="يمثل نسبة الأصوات الصافية المقنعة من الأصوات التي يزعم المفتاح إحضارها." />
        <IndicatorCard number={25} title="مؤشر الاعتماد على المفتاح" value={`${d.dependency}%`} subtitle="نسبة تشتت القوة التصويتية" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" activationGuide="يقيس مدى تركز الأصوات في يد مفتاح واحد. الرقم المرتفع جدًا يمثل خطورة على استقرار الحملة." />
        <IndicatorCard number={27} title="مؤشر النفوذ الانتخابي للمفتاح" value={d.electoralInfluence} subtitle="EII الموزون العام" icon={Zap} color="text-blue-600" bgColor="bg-blue-100" activationGuide="القدرة الكلية للمفاتيح الاجتماعية على حشد وتحويل العلاقات العامة إلى أصوات." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 22. ترتيب المفاتيح الانتخابية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">22</span>
              ترتيب المفاتيح الانتخابية (الأعلى وزناً وتأثيراً)
            </h3>
          </div>
          {(d.ranking || []).length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              لا توجد مفاتيح مسجلة بعد. أضف وجهاء ومفاتيح في صفحة "المفاتيح الانتخابية" لتظهر هنا.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 w-8 font-normal">#</th>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">صافي الأصوات</th>
                  <th className="px-3 py-2 text-center font-normal">التقييم الموزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {(d.ranking || []).slice(0, 5).map((item: any) => (
                  <tr key={item.rank} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono font-bold text-el-primary">{item.rank}</td>
                    <td className="px-3 py-2 font-mono text-el-on-surface-variant">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-primary">{item.netVotes}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.weightedScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 26. مؤشر القيمة الاستراتيجية للمفتاح */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">26</span>
              مؤشر القيمة الاستراتيجية للمفاتيح
            </h3>
          </div>
          {(d.strategicValue || []).length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              بانتظار إدخال المفاتيح الانتخابية وحسابها تلقائياً.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">القيمة الاستراتيجية</th>
                  <th className="px-3 py-2 text-center font-normal">القضاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {(d.strategicValue || []).slice(0, 5).map((item: any) => (
                  <tr key={item.code} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono text-el-primary">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.value}</td>
                    <td className="px-3 py-2 text-center text-el-on-surface-variant">{item.district}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 28. مؤشر مخاطر فقدان المفتاح */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-50 text-red-500">28</span>
          مؤشر مخاطر فقدان المفاتيح (الأكثر خطورة بالتسرب)
        </h3>
        {(d.lossRisk || []).length === 0 ? (
          <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد مفاتيح في منطقة الخطر.</p>
        ) : (
          <div className="space-y-2">
            {(d.lossRisk || []).slice(0, 5).map((item: any) => (
              <div key={item.code} className="flex justify-between items-center text-[12px] bg-red-50/30 p-2 border border-red-100 rounded-lg">
                <span className="font-semibold text-red-800">{item.name} (قضاء {item.district})</span>
                <span className="font-mono text-red-600 font-bold">خطر الفقدان: {item.risk}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. مؤشرات الجمهور والناخبين (29-38)
// ═══════════════════════════════════════════════════════════════
function AudienceTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={32} title="نسبة الذكور" value={`${d.genderRatio.malePercentage}%`} subtitle={`${d.genderRatio.male} ناخب مسجل`} icon={Users} color="text-blue-600" bgColor="bg-blue-100" activationGuide="نسبة الناخبين الذكور المسجلين في قاعدة بيانات الحملة من إجمالي الناخبين." />
        <IndicatorCard number={32} title="نسبة الإناث" value={`${d.genderRatio.femalePercentage}%`} subtitle={`${d.genderRatio.female} ناخبة مسجلة`} icon={Users} color="text-pink-600" bgColor="bg-pink-100" activationGuide="نسبة الناخبات الإناث المسجلات في قاعدة بيانات الحملة من إجمالي الناخبين." />
        <IndicatorCard number={33} title="نسبة الجامعيين" value={`${d.graduatesRatio}%`} subtitle="حملة شهادة بكالوريوس وأعلى" icon={Award} color="text-purple-600" bgColor="bg-purple-100" activationGuide="يُقرأ من حقل المستوى التعليمي للناخب والمفتاح." />
        <IndicatorCard number={36} title="شرائح الناخبين المفصلة" value={(d.segmentation || []).length} subtitle="فئة مستهدفة حالياً" icon={UserCheck} activationGuide="شرائح مصنفة بالاعتماد على الأعمار والولاء الميداني." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* الأكثر دعماً */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-600">29</span>
            🟢 الفئات العمرية الأكثر دعماً للحملة
          </h3>
          {(d.topAgeGroups || []).length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            (d.topAgeGroups || []).map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-green-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% تأييد</span>
              </div>
            ))
          )}
        </div>

        {/* الأكثر تردداً */}
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-yellow-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-yellow-100 text-yellow-600">30</span>
            🟡 الفئات العمرية الأكثر تردداً (محايدون)
          </h3>
          {(d.hesitantAgeGroups || []).length === 0 ? (
            <p className="text-[11px] text-yellow-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            (d.hesitantAgeGroups || []).map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-yellow-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% حياد</span>
              </div>
            ))
          )}
        </div>

        {/* الأكثر التزاماً بالتصويت */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-blue-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-600">31</span>
            🔵 الفئات العمرية الأكثر التزاماً بالتصويت
          </h3>
          {(d.votingAgeGroups || []).length === 0 ? (
            <p className="text-[11px] text-blue-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            (d.votingAgeGroups || []).map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-blue-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% تصويت</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* تأثير التعليم */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">34</span>
            تأثير التعليم على التصويت والتأييد
          </h3>
          {(d.educationImpact || []).length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار إدخال بيانات التحصيل الدراسي للناخبين.</p>
          ) : (
            <div className="space-y-2">
              {(d.educationImpact || []).filter((e: any) => e.level !== 'غيرحدد' && e.level !== 'غير محدد').map((e: any) => (
                <div key={e.level}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium">{e.level}</span>
                    <span className="font-mono text-el-primary font-bold">{e.supportRate}% تأييد</span>
                  </div>
                  <ScoreBar score={e.supportRate} color="bg-purple-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* المهن الأكثر تأييداً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">35</span>
            المهن الأكثر تأييداً ودعماً للحملة الانتخابية
          </h3>
          {(d.topProfessions || []).length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">أدخل مهن الناخبين في لوحة التسجيل لتصنيف الدعم حسب المهنة.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(d.topProfessions || []).slice(0, 6).map((p: any) => (
                <div key={p.profession} className="bg-el-surface-container p-2 border border-el-outline-variant/60 rounded-lg flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-el-on-surface">{p.profession}</span>
                  <span className="font-mono text-green-600 font-bold">{p.supportRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 37. القضايا الأكثر تأثيراً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">37</span>
            القضايا الأكثر تأثيراً على المزاج الانتخابي للمواطنين
          </h3>
          <div className="space-y-2">
            {(d.topIssues || []).map((issue: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">{issue.issue}</span>
                  <span className="font-mono text-el-secondary font-bold">الأهمية: {issue.weight}%</span>
                </div>
                <ScoreBar score={issue.weight} color="bg-amber-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 38. نوع الخطاب المناسب لكل شريحة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">38</span>
            نوع الخطاب المناسب لكل شريحة تصويتية
          </h3>
          <div className="space-y-2">
            {(d.segmentMessaging || []).map((m: any, idx: number) => (
              <div key={idx} className="p-2 border border-el-outline-variant/60 rounded-lg text-[12px] bg-el-surface-container">
                <span className="font-bold text-el-primary">{m.segment}:</span>
                <span className="text-el-on-surface-variant mr-1">{m.messageType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. النفوذ الاجتماعي والسياسي (39-47)
// ═══════════════════════════════════════════════════════════════
// InfluenceTab moved to @/components/election/InfluenceTab.tsx

// ═══════════════════════════════════════════════════════════════
// 6. الأداء الميداني والتنظيمي (48-55)
// ═══════════════════════════════════════════════════════════════
function PerformanceTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={48} title="مؤشر الحشد الميداني" value={d.mobilization} subtitle="قدرة التحشيد للمفاتيح" icon={Megaphone} color="text-blue-600" bgColor="bg-blue-100" activationGuide="متوسط مستوى قدرة المفاتيح على التحشيد الميداني من 100 نقطة." />
        <IndicatorCard number={49} title="مؤشر الجاهزية الميدانية" value={`${d.readiness}%`} subtitle="كفاءة المتطوعين النشطين" icon={UserCheck} color="text-green-600" bgColor="bg-green-100" activationGuide="يتم قراءته من تقييم كفاءة المتطوعين والمهام المكتملة في إدارة الكوادر." />
        <IndicatorCard number={51} title="مؤشر استنزاف الحملة" value={d.exhaustion} subtitle="كفاءة ترشيد النفقات" icon={DollarSign} color="text-red-500" bgColor="bg-red-50" activationGuide="العائد المادي المصروف مقارنة بالأصوات الصافية المحرزة لحساب الفاعلية المالية." />
        <IndicatorCard number={55} title="مؤشر الولاء العام للحملة" value={`${d.overallLoyalty}%`} subtitle="متوسط ولاء المفاتيح" icon={Shield} color="text-teal-600" bgColor="bg-teal-100" activationGuide="يمثل متوسط نسبة ثبات وولاء المفاتيح والناخبين الملتزمين بالكامل بالتصويت للحملة." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={52} title="المواطنون المخدومون فعلياً" value={d.servedCitizens.toLocaleString()} subtitle="طلب مكتمل بنجاح" icon={CheckCircle2} color="text-green-600" bgColor="bg-green-100" activationGuide="عدد طلبات الخدمات المنفذة والمكتملة بالكامل للمواطنين." />
        <IndicatorCard number={53} title="أهم ملف خدمي مكرر" value={d.recurringServices.length > 0 ? d.recurringServices[0]?.type : 'لا يوجد'} subtitle={d.recurringServices.length > 0 ? `${d.recurringServices[0]?.count} طلب` : undefined} icon={Wrench} activationGuide="يحدد نوع الطلبات الخدمية الأكثر تكراراً وإلحاحاً من قبل المواطنين لتوجيه الموارد لها." />
        <IndicatorCard number={54} title="أكثر المناطق مراجعة" value={d.frequentAreas.length > 0 ? d.frequentAreas[0]?.district : 'لا يوجد'} subtitle={d.frequentAreas.length > 0 ? `${d.frequentAreas[0]?.count} طلب خدمة` : undefined} icon={MapPin} activationGuide="المناطق والأقضية الجغرافية الأكثر طلباً للخدمات وتلقياً للدعم الميداني." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* المناطق الأكثر حاجة للجهد الميداني */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">50</span>
            أكثر الأقضية والمناطق حاجة للجهد والتحشيد الميداني
          </h3>
          {d.needingEffort.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد أقضية نشطة.</p>
          ) : (
            <div className="space-y-3">
              {d.needingEffort.map((item: any) => (
                <div key={item.district}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold">{item.district} ({item.keyCount} مفتاح)</span>
                    <span className="font-mono text-red-500 font-bold">الحاجة للجهد الميداني: {item.score}/100</span>
                  </div>
                  <ScoreBar score={item.score} color="bg-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* تكرار الملفات الخدمية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">53</span>
            توزيع وتكرار الملفات الخدمية في ذي قار
          </h3>
          {d.recurringServices.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">يرجى إضافة طلبات خدمات للمفاتيح والناخبين في صفحة "نظام الخدمات".</p>
          ) : (
            <div className="space-y-2">
              {d.recurringServices.map((item: any) => (
                <div key={item.type} className="flex justify-between text-[12px] border-b border-el-outline-variant/30 pb-1">
                  <span className="font-medium">{item.type}</span>
                  <span className="font-mono text-el-primary font-bold">{item.count} طلب خدمي</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. الإعلام والاتصال السياسي (56-60)
// ═══════════════════════════════════════════════════════════════
function MediaTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={57} title="كفاءة الحملات الرقمية" value={`${d.digitalCampaigns}%`} subtitle="نسبة تسليم الرسائل الموبيل" icon={Globe} color="text-green-600" bgColor="bg-green-100" activationGuide="تُحسب تلقائياً من تقارير توصيل رسائل SMS وبثها المباشر." />
        <IndicatorCard number={58} title="مؤشر النشاط الرقمي اليومي" value={d.dailyDigitalActivity} subtitle="نشاط الزيارات وتحديث البيانات" icon={Activity} activationGuide="نشاط الفرق الانتخابية الميدانية في تدوين وتحديث المهام الانتخابية." />
        <IndicatorCard number={59} title="مؤشر تأثير التواصل المباشر" value={`${d.directContactImpact}%`} subtitle="التواصل الدوري مع الوجهاء" icon={Users} color="text-blue-600" bgColor="bg-blue-100" activationGuide="نسبة الوجهاء والمفاتيح الذين تم التواصل معهم في أخر 14 يوم بنجاح." />
        <IndicatorCard number={60} title="الجمهور القابل للوصول إعلامياً" value={d.mediaReachable.toLocaleString()} subtitle="مستلم رسائل SMS محتمل" icon={Phone} activationGuide="يقيس نسبة الناخبين المسجلة أرقام هواتفهم وحساباتهم الرقمية النشطة والجاهزين لتلقي الرسائل الإعلانية." />
      </div>

      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">56</span>
            الرسائل الأكثر تأثيراً وكفاءة التوصيل الرقمي لحملات الـ SMS
          </h3>
        </div>
        {d.topMessages.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
            أرسل حملة رسائل SMS في لوحة "بث الرسائل" أو "الاتصالات السياسية" لتنشيط مؤشرات كفاءة المحتوى.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">اسم قالب الرسالة</th>
                  <th className="px-3 py-2 text-center font-normal">عدد المستهدفين</th>
                  <th className="px-3 py-2 text-center font-normal">الرسائل المستلمة</th>
                  <th className="px-3 py-2 text-center font-normal">نسبة التوصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {d.topMessages.map((msg: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{msg.name}</td>
                    <td className="px-3 py-2 text-center font-mono">{msg.sentCount}</td>
                    <td className="px-3 py-2 text-center font-mono">{msg.deliveredCount}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">{msg.deliveredPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. العائد والاستثمار (61-65)
// ═══════════════════════════════════════════════════════════════
function InvestmentTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IndicatorCard number={61} title="العائد الانتخابي للخدمات" value={d.serviceROI} subtitle="صوت كسب متوقع / مليون دينار" icon={Wrench} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس الكسب المتوقع للأصوات بناءً على إجمالي الإنفاق الفعلي المصروف للخدمات." />
        <IndicatorCard number={62} title="العائد الانتخابي المالي للمفاتيح" value={d.financialROI} subtitle="صوت كسب متوقع / 100 ألف دينار" icon={DollarSign} color="text-blue-600" bgColor="bg-blue-100" activationGuide="الأصوات الصافية المتحققة مقارنة بالإنفاق الكلي المخصص لدعم المفاتيح." />
        <IndicatorCard number={63} title="تكلفة الصوت الانتخابي الواحد" value={d.costPerVote > 0 ? `${d.costPerVote.toLocaleString()} د.ع` : '0'} subtitle="إجمالي الإنفاق / الأصوات الصافية" icon={DollarSign} color="text-amber-600" bgColor="bg-amber-100" activationGuide="معدل الإنفاق المالي الإجمالي مقسوماً على عدد الأصوات الصافية المتوقع حصدها." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 64. قائمة المفاتيح المستحقة للاستثمار */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">64</span>
              الوجهاء والمفاتيح المستحقون للاستثمار الانتخابي (فرص عالية الكسب)
            </h3>
          </div>
          {d.investmentKeys.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              أدخل المفاتيح وعرّف أصواتهم المحايدة والإنفاق المالي لتحديث التحليل الاستثماري للأصوات.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات المحايدة</th>
                  <th className="px-3 py-2 text-center font-normal">الإنفاق الحالي</th>
                  <th className="px-3 py-2 text-center font-normal">نقاط الاستثمار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {d.investmentKeys.slice(0, 5).map((item: any) => (
                  <tr key={item.code} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono text-el-primary">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono text-yellow-600 font-bold">{item.neutralVotes}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.spent.toLocaleString()} د.ع</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 65. أكثر الخدمات تأثيراً انتخابياً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">65</span>
              الخدمات الأكثر تأثيراً وجذباً للأصوات
            </h3>
          </div>
          {d.impactfulServices.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              بانتظار إنجاز وتوثيق تأثير طلبات المساعدات الخدمية.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">عنوان الخدمة المنجزة</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات المتأثرة</th>
                  <th className="px-3 py-2 text-center font-normal">التكلفة</th>
                  <th className="px-3 py-2 text-center font-normal">الكفاءة الميدانية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {d.impactfulServices.slice(0, 5).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.title}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">+{item.impact}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.cost.toLocaleString()} د.ع</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. يوم الاقتراع (66-75)
// ═══════════════════════════════════════════════════════════════
function PollingDayTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={67} title="نسبة حضور مؤيدينا" value={`${d.supportersTurnout}%`} subtitle="من صوتوا من المؤيدين المسجلين" icon={CheckCircle2} color="text-green-600" bgColor="bg-green-100" activationGuide="تُحسب يوم الاقتراع عند تأكيد حضور الناخبين المؤيدين في بوابة المندوب." />
        <IndicatorCard number={68} title="نسبة الحشد المنجز" value={`${d.mobilizationAchieved}%`} subtitle="المصوتون / إجمالي المستهدف الصافي" icon={Users} color="text-blue-600" bgColor="bg-blue-100" activationGuide="نسبة ما تم إنجازه وحشده من كتلتنا التصويتية الصافية المضمونة." />
        <IndicatorCard number={69} title="نسبة التغطية بالمراقبين" value={`${d.observerCoverage}%`} subtitle="مراكز الاقتراع المراقبة بالوكلاء" icon={Shield} color="text-purple-600" bgColor="bg-purple-100" activationGuide="نسبة تغطية مراكز الاقتراع بالوكلاء والمراقبين الانتخابيين المسجلين." />
        <IndicatorCard number={71} title="مؤشر حماية الأصوات" value={d.voteProtection} subtitle="حماية ومنع التلاعب بالأصوات" icon={ShieldAlert} color="text-teal-600" bgColor="bg-teal-100" activationGuide="يقيس مستوى تأمين أصواتنا ضد التزوير أو الإبطال بناءً على تدريب وتوزيع مراقبي الصناديق." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={72} title="نسبة الأصوات المحمية" value={`${d.protectedVotes}%`} subtitle="أصوات تحت مراقبة الوكلاء" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="نسبة الأصوات التابعة لمفوضية الاقتراع المغطاة بالوكلاء المدربين." />
        <IndicatorCard number={73} title="نسبة الشكاوى الانتخابية" value={`${d.complaintsRate}%`} subtitle="خروقات مسجلة لكل مركز" icon={AlertTriangle} color="text-red-500" bgColor="bg-red-50" activationGuide="معدل الشكاوى المسجلة في مراكز الاقتراع من قبل مراقبينا يوم التصويت." />
        <IndicatorCard number={74} title="إنذار يوم الاقتراع المبكر" value={d.earlyWarningEDay} subtitle="خطر تسرب أصوات يوم الاقتراع" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" activationGuide="يتنبأ بأي تراجع أو خلل في نسب الحضور والتعبئة خلال الساعات الأولى ليوم التصويت." />
        <IndicatorCard number={75} title="مؤشر الجاهزية الشامل ليوم الحسم" value={`${d.readinessEDay}%`} subtitle="جاهزية الماكينة الانتخابية" icon={Zap} color="text-purple-600" bgColor="bg-purple-100" activationGuide="مؤشر مركب يدمج نسب تغطية المراقبين، وتدريب المفاتيح، وحماية الأصوات لتحديد الاستعداد الكلي ليوم التصويت." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 66. نسبة التصويت الفعلية حسب الساعة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">66</span>
            نسبة المشاركة والتصويت الفعلية حسب ساعة يوم الاقتراع
          </h3>
          <div className="space-y-2">
            {d.hourlyTurnout.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">توقيت الساعة {item.hour}</span>
                  <span className="font-mono text-el-primary font-bold">{item.rate}% مشاركة</span>
                </div>
                <ScoreBar score={item.rate} max={100} color="bg-blue-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 70. مؤشر قوة مركز الاقتراع */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">70</span>
              مؤشر قوة مراكز الاقتراع وتراكم أصواتنا فيها
            </h3>
          </div>
          {d.pollingCenterStrength.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              أدخل مراكز الاقتراع للمفاتيح لتصنيف القوة التصويتية للمراكز.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">مركز الاقتراع</th>
                  <th className="px-3 py-2 text-center font-normal">الوجهاء والمفاتيح</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات الصافية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {d.pollingCenterStrength.slice(0, 5).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.keysCount} وجيه</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.netVotes} صوت</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. التخطيط الاستراتيجي والتاريخي (76-80)
// ═══════════════════════════════════════════════════════════════
function StrategicTab({ data }: { data: any }) {
  const d = data || {};
  const safe = (v: any, fb: any = 0) => (v !== undefined && v !== null) ? v : fb;
  return (
    <div className="flex flex-col gap-4">
      {/* 76. نسبة الفوز لكل حزب */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">76</span>
          نسب الفوز التاريخية ومقاعد الكتل والأحزاب في محافظة ذي قار
        </h3>
        {d.partyWinRates.length === 0 ? (
          <p className="text-[11px] text-el-on-surface-variant/60 italic">
            يرجى تعبئة جدول النتائج التاريخية للمفوضية لتفعيل التحليلات الاستراتيجية للأحزاب.
          </p>
        ) : (
          <div className="space-y-2">
            {d.partyWinRates.map((party: any) => (
              <div key={party.party}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">{party.party}</span>
                  <span className="font-mono text-el-primary font-bold">الأصوات: {party.votes.toLocaleString()} · المقاعد: {party.seats}</span>
                </div>
                <ScoreBar score={party.percentage} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 77. التغيير في قوة الأحزاب */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">77</span>
            التغيير والتحول في قوة ونسب الأحزاب والكتل السياسية
          </h3>
          {d.partyStrengthChange.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار إدخال المقارنات التاريخية.</p>
          ) : (
            <div className="space-y-2">
              {d.partyStrengthChange.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قائمة {item.party} (قضاء {item.district})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 78. التغيير في نسب المشاركة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">78</span>
            التغير التاريخي في نسب إقبال المشاركة للناخبين
          </h3>
          {d.participationChange.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار توثيق تباين مشاركة الناخبين بين الانتخابات.</p>
          ) : (
            <div className="space-y-2">
              {d.participationChange.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 79. التحول التاريخي في التصويت */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">79</span>
            معدل التحول التاريخي وهجرة الأصوات الكلية
          </h3>
          {d.historicalShifts.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد بيانات كافية.</p>
          ) : (
            <div className="space-y-2">
              {d.historicalShifts.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قائمة {item.party} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}% انزياح
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 80. توقع اتجاهات الانتخابات القادمة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">80</span>
            توقع التوجهات العامة ومشاركة الانتخابات القادمة
          </h3>
          <div className="p-3 border border-el-outline-variant/60 rounded-lg bg-el-surface-container text-[12px]">
            <p className="font-semibold text-el-primary">تحليل الاتجاه المقدر:</p>
            <p className="mt-1 text-el-on-surface-variant leading-relaxed">{d.nextElectionForecast.trend}</p>
            <p className="mt-2 text-[11px] text-el-on-surface-variant/60">
              * نسبة المشاركة المقدرة للدورة القادمة: <b className="font-mono text-el-secondary">{d.nextElectionForecast.predictedTurnout}%</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

