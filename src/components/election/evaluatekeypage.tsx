'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, Zap } from 'lucide-react';
import Explainable from './Explainable';

const LOYALTY_LABELS = ['متذبذب — لا ولاء ثابت', 'ضعيف — ولاء محدود لعدة أطراف', 'متوسط — يميل للطرف المؤثر', 'عالٍ — يفضل جهة بعينها', 'قوي جداً — ولاء راسخ لا يتزحزح'];
const INFLUENCE_LABELS = ['تأثير محدود — على نفسه فقط', 'دائرة صغيرة — الأسرة المباشرة', 'متوسط — 10-30 فرداً', 'واسع — 30-100 فرداً', 'شخصية قيادية — أكثر من 100'];
const MOBILIZATION_LABELS = ['أقل من 10 — غير قادر', '10-30 — قدرة محدودة', '30-50 — تحشيد متوسط', '50-100 — تحشيد قوي', 'أكثر من 100 — قادر على الحشد'];
const VOTE_PROTECTION_LABELS = ['لا يتابع — لا حماية', 'متابعة ضعيفة — ينسى أو يهمل', 'متابعة عادية — يذكرهم فقط', 'متابعة جيدة — يرافقهم', 'متابعة ميدانية — يضمن وصول الجميع'];
const SUPPORT_REASON_LABELS = ['مصلحة مؤقتة — قابل للتغير', 'علاقة شخصية — غير سياسية', 'مصلحة مشتركة — حاجة متبادلة', 'قناعة نسبية — تأييد جزئي', 'قناعة سياسية — داعم مخلص'];
const NEEDS_LABELS = ['مرتفعة جداً — ينتظر خدمات كثيرة', 'مرتفعة — يحتاج خدمات أساسية', 'متوسطة — بعض الاحتياجات', 'منخفضة — مكتفٍ ذاتياً', 'لا توجد — لا يطلب شيئاً'];
const POLITICAL_NOTE_LABELS = ['قليل الوعي — لا يتابع الشأن السياسي', 'وعي محدود — يتابع أحياناً', 'مهتم — يشارك في النقاش', 'ناشط — يشارك في الفعاليات', 'ناشط ومدافع — قيادي في الرأي العام'];
const ORGANIZATIONAL_NOTE_LABELS = ['غير متعاون — يرفض التعليمات', 'قليل الالتزام — متأخر غالباً', 'متوسط — يلتزم أحياناً', 'جيد — ملتزم ومتعاون', 'منضبط وملتزم — قدوة للآخرين'];
const GENERAL_NOTE_LABELS = ['سلبي جداً — معيق للعمل', 'سلبي — غير متحمس', 'محايد — لا إيجابي ولا سلبي', 'إيجابي — متعاون ومتفائل', 'ايجابي جداً — داعم ومؤثر'];

interface Props {
  preselectedKeyId?: string | null;
  preselectedKey?: any;
  onClose?: () => void;
}

interface RatingBarProps {
  field: string;
  label: string;
  weight: number;
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const RatingBar = ({ field, label, weight, scores, setScores }: RatingBarProps) => {
  const labels = (() => {
    switch (field) { case 'loyaltyScore': return LOYALTY_LABELS; case 'influenceLevel': return INFLUENCE_LABELS; case 'mobilizationCap': return MOBILIZATION_LABELS; case 'voteProtection': return VOTE_PROTECTION_LABELS; case 'supportReason': return SUPPORT_REASON_LABELS; case 'needsLevel': return NEEDS_LABELS; case 'politicalNote': return POLITICAL_NOTE_LABELS; case 'organizationalNote': return ORGANIZATIONAL_NOTE_LABELS; case 'generalNote': return GENERAL_NOTE_LABELS; default: return ['', '', '', '', '']; }
  })();
  const v = scores[field] ?? 3;
  return (
    <div className="space-y-1.5 bg-el-surface-container border border-el-outline-variant rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-el-on-surface">{label}</span>
        <span className="text-[10px] bg-blue-600/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">الوزن: {weight}%</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => setScores(s => ({ ...s, [field]: n }))}
            className={`flex-1 py-1.5 text-[11px] rounded border transition-all ${v >= n ? 'bg-blue-600 text-white border-blue-500' : 'bg-el-surface border-el-outline-variant text-el-on-surface-variant hover:border-blue-500/50'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-el-on-surface-variant">{labels[v - 1]}</div>
    </div>
  );
};

export default function EvaluateKeyPage({ preselectedKeyId, preselectedKey, onClose }: Props) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [accuracy, setAccuracy] = useState('3');
  const [training, setTraining] = useState('غير مدرب');

  useEffect(() => {
    if (preselectedKey) {
      setKeys([preselectedKey]);
      setSelectedKey(preselectedKey);
      return;
    }
    fetch('/api/electoral-keys')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.keys || [];
        setKeys(list);
      })
      .catch(() => toast({ title: 'فشل تحميل المفاتيح', description: 'تأكد من اتصال الشبكة', variant: 'destructive' }));
  }, [preselectedKey]);

  useEffect(() => {
    if (selectedKey) {
      setScores({
        loyaltyScore: selectedKey.loyaltyScore ?? 3,
        influenceLevel: selectedKey.influenceLevel ?? 3,
        mobilizationCap: selectedKey.mobilizationCap ?? 3,
        voteProtection: selectedKey.voteProtection ?? 3,
        supportReason: selectedKey.supportReason ?? 3,
        needsLevel: selectedKey.needsLevel ?? 3,
        politicalNote: selectedKey.politicalNote ?? 3,
        organizationalNote: selectedKey.organizationalNote ?? 3,
        generalNote: selectedKey.generalNote ?? 3,
      });
      setAccuracy(selectedKey.dataAccuracy || '3');
      setTraining(selectedKey.trainingStatus || 'غير مدرب');
    }
  }, [selectedKey]);

  const weights: Record<string, number> = {
    loyaltyScore: 20, influenceLevel: 20, mobilizationCap: 15, voteProtection: 15,
    supportReason: 10, needsLevel: 5, politicalNote: 5, organizationalNote: 5, generalNote: 5,
  };

  const efficiency = (() => {
    let raw = 0;
    for (const [field, w] of Object.entries(weights)) {
      raw += ((scores[field] ?? 3) / 5) * w;
    }
    const accMul = (parseInt(accuracy) || 3) / 5;
    const trainMul = training === 'مكتمل' ? 1 : training === 'تحت التدريب' ? 0.5 : 0.2;
    return parseFloat((raw * accMul * trainMul).toFixed(1));
  })();

  const classification = efficiency >= 100 ? 'قوي جداً' : efficiency >= 50 ? 'جيد' : efficiency >= 20 ? 'مقبول' : 'ضعيف';
  const guaranteed = Math.round((selectedKey?.netVotes || 0) * (efficiency / 100));

  const [actionLoading, setActionLoading] = useState(false);

  const save = async () => {
    if (!selectedKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/electoral-keys/${selectedKey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scores, dataAccuracy: accuracy, trainingStatus: training,
          weightedScore: efficiency, classification,
        }),
      });
      if (res.ok) {
        toast({ title: '✅ تم التقييم', description: `${selectedKey.firstName} — ${classification} (${efficiency}%)`, variant: 'default' });
      } else {
        toast({ title: '❌ فشل الحفظ', description: 'حدث خطأ أثناء حفظ التقييم', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ في الاتصال', description: 'تأكد من اتصال الشبكة', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSmsAction = async () => {
    if (!selectedKey) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/sms-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `حملة معالجة مخاطر المفتاح ${selectedKey.firstName}`,
          message: `السلام عليكم {voter_name}، نود إعلامكم بأننا مستمرون في دعمكم والتنسيق معكم لخدمة منطقتنا الغالية. دمتم بخير.`,
          filterType: 'CLASSIFICATION',
          filterValue: selectedKey.classification,
        }),
      });
      if (res.ok) {
        toast({ title: '💬 تم إنشاء حملة SMS', description: 'تم حفظ مسودة الحملة الموجهة بنجاح.', variant: 'default' });
      } else {
        toast({ title: '❌ فشل إطلاق الحملة', description: 'حدث خطأ أثناء الاتصال بالخادم', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ في الاتصال', description: 'تأكد من الاتصال بالشبكة', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskAction = async () => {
    if (!selectedKey) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `تدخل ميداني عاجل للمفتاح: ${selectedKey.firstName}`,
          description: `مطلوب التنسيق الفوري وحل المشكلة الميدانية. التشخيص: ${efficiency < 40 ? 'كفاءة منخفضة جداً' : 'مخاطر تسرب نشطة'}.`,
          priority: 'HIGH',
          status: 'PENDING',
          taskType: 'FIELD',
          district: selectedKey.district,
        }),
      });
      if (res.ok) {
        toast({ title: '📋 تم إنشاء مهمة ميدانية', description: 'تمت إضافة المهمة لجدول المتابعة بنجاح.', variant: 'default' });
      } else {
        toast({ title: '❌ فشل إنشاء المهمة', description: 'حدث خطأ أثناء الاتصال بالخادم', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ في الاتصال', description: 'تأكد من الاتصال بالشبكة', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWarningAction = async () => {
    if (!selectedKey) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/early-warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaType: 'قضاء',
          areaName: selectedKey.district || 'قضاء ذي قار',
          warningType: efficiency < 40 ? 'مهددة_خسارة' : 'متأرجحة',
          severity: efficiency < 30 ? 'حرج' : 'متوسط',
          description: `الاسم: ${selectedKey.firstName} ${selectedKey.fatherName} - كفاءة التقييم: ${efficiency}%`,
          estimatedVotesAtRisk: Math.max(0, (selectedKey.netVotes || 0) - guaranteed),
          recommendedAction: 'متابعة وتعديل مسار ميداني عاجل',
          electoralKeyId: selectedKey.id,
        }),
      });
      if (res.ok) {
        toast({ title: '🚨 تم تسجيل إنذار مبكر', description: 'تم إدراج الإنذار بنجاح وسيظهر في لوحة الإشراف.', variant: 'default' });
      } else {
        toast({ title: '❌ فشل تسجيل الإنذار', description: 'حدث خطأ أثناء الاتصال بالخادم', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ في الاتصال', description: 'تأكد من الاتصال بالشبكة', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="text-el-on-surface" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <h1 className="text-xl font-bold">تقييم النفوذ والتأثير</h1>
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-semibold block mb-2">اختيار المفتاح الانتخابي</label>
          <select
            className="w-full bg-el-surface border border-el-outline-variant text-el-on-surface rounded-lg px-3 py-2.5 text-sm"
            value={selectedKey?.id || ''}
            onChange={e => {
              const k = keys.find(x => x.id === e.target.value);
              setSelectedKey(k || null);
            }}
          >
            <option value="">— اختر مفتاحاً —</option>
            {keys.map(k => (
              <option key={k.id} value={k.id}>{k.fullName || k.firstName} — {k.district || ''} — صافي: {k.netVotes || 0}</option>
            ))}
          </select>
        </div>

        {selectedKey && (
          <>
            <div className="bg-blue-600/10 border border-blue-500/25 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedKey.fullName || selectedKey.firstName}</h2>
                  <p className="text-[12px] text-el-on-surface-variant">صافي الأصوات: {selectedKey.netVotes} | التصنيف الحالي: {selectedKey.classification}</p>
                </div>
                <button onClick={save} disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-el-surface-container disabled:text-muted-foreground text-white px-5 py-2 rounded-lg text-[13px] font-bold transition">
                  {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <RatingBar field="loyaltyScore" label="مستوى الولاء" weight={20} scores={scores} setScores={setScores} />
              <RatingBar field="influenceLevel" label="مستوى التأثير" weight={20} scores={scores} setScores={setScores} />
              <RatingBar field="mobilizationCap" label="القدرة على التحشيد" weight={15} scores={scores} setScores={setScores} />
              <RatingBar field="voteProtection" label="حماية الأصوات" weight={15} scores={scores} setScores={setScores} />
              <RatingBar field="supportReason" label="أسباب الدعم" weight={10} scores={scores} setScores={setScores} />
              <RatingBar field="needsLevel" label="الاحتياجات والمطالب" weight={5} scores={scores} setScores={setScores} />
              <RatingBar field="politicalNote" label="الملاحظات السياسية" weight={5} scores={scores} setScores={setScores} />
              <RatingBar field="organizationalNote" label="الملاحظات التنظيمية" weight={5} scores={scores} setScores={setScores} />
              <RatingBar field="generalNote" label="الملاحظات العامة" weight={5} scores={scores} setScores={setScores} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-[11px] font-semibold block mb-1">دقة المعلومات (F10)</label>
                <select className="w-full bg-el-surface border border-el-outline-variant text-el-on-surface rounded-lg px-3 py-2 text-sm" value={accuracy}
                  onChange={e => setAccuracy(e.target.value)}>
                  <option value="1">1 — غير دقيقة</option>
                  <option value="2">2 — مشكوك فيها</option>
                  <option value="3">3 — متوسطة</option>
                  <option value="4">4 — جيدة</option>
                  <option value="5">5 — دقيقة جداً</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1">حالة التدريب (F11)</label>
                <select className="w-full bg-el-surface border border-el-outline-variant text-el-on-surface rounded-lg px-3 py-2 text-sm" value={training}
                  onChange={e => setTraining(e.target.value)}>
                  <option value="غير مدرب">غير مدرب</option>
                  <option value="تحت التدريب">تحت التدريب</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* خلاصة التقييم الحسابية */}
              <div className="bg-el-surface-container border border-el-outline-variant rounded-lg p-4 flex flex-col justify-between">
                <h4 className="text-[12px] font-bold text-el-on-surface border-b border-el-outline-variant pb-1.5 mb-2.5">
                  <Explainable termKey="WEIGHTED_SCORE">معادلة الكفاءة الموزونة</Explainable>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-[11px] text-el-on-surface-variant">
                      <Explainable termKey="WEIGHTED_SCORE">معامل الكفاءة</Explainable>
                    </div>
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{efficiency}%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-el-on-surface-variant">
                      <Explainable termKey="VOTER_CLASSIFICATION">التصنيف</Explainable>
                    </div>
                    <div className={`text-lg font-bold ${efficiency >= 100 ? 'text-green-500 dark:text-green-400' : efficiency >= 50 ? 'text-blue-600 dark:text-blue-400' : efficiency >= 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                      {classification}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-el-on-surface-variant">
                      <Explainable termKey="GUARANTEED_VOTES">الأصوات المضمونة</Explainable>
                    </div>
                    <div className="text-3xl font-extrabold text-green-500 dark:text-green-400 font-mono">{guaranteed}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-el-on-surface-variant">الأصوات المتسربة</div>
                    <div className="text-3xl font-extrabold text-red-500 dark:text-red-400 font-mono">{Math.max(0, (selectedKey?.netVotes || 0) - guaranteed)}</div>
                  </div>
                </div>
              </div>

              {/* تشخيص الذكاء الاصطناعي لمخاطر التسرب */}
              <div className="bg-el-surface-container border border-el-outline-variant rounded-lg p-4">
                <h4 className="text-[12px] font-bold text-blue-600 dark:text-blue-400 border-b border-el-outline-variant pb-1.5 mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-500 animate-pulse" /> تشخيص مخاطر تسرب الأصوات (AI Diagnostic)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-el-surface px-2.5 py-1.5 rounded border border-el-outline-variant">
                    <span className="text-el-on-surface-variant">احتمالية الالتزام الانتخابي:</span>
                    <span className={`font-bold font-mono ${efficiency >= 70 ? 'text-green-500 dark:text-green-400' : efficiency >= 45 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                      {efficiency}%
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2.5">
                    <span className="text-[10px] font-bold text-el-on-surface-variant block mb-1">عوامل خطر تسرب الأصوات النشطة:</span>
                    {(scores.loyaltyScore ?? 3) <= 2 && (
                      <p className="text-red-500 dark:text-red-400 flex gap-1.5 items-start">⚠️ <span>ولاء متذبذب أو ضعيف للجهة المنظمة.</span></p>
                    )}
                    {(scores.needsLevel ?? 3) <= 2 && (
                      <p className="text-amber-600 dark:text-amber-400 flex gap-1.5 items-start">⚠️ <span>مطالب خدمية مرتفعة قد تؤدي لانشقاق وتراجع الأصوات.</span></p>
                    )}
                    {(scores.voteProtection ?? 3) <= 2 && (
                      <p className="text-red-500 dark:text-red-400 flex gap-1.5 items-start">⚠️ <span>ضعف المتابعة الميدانية وتأمين وصول الناخبين.</span></p>
                    )}
                    {(parseInt(accuracy) || 3) <= 2 && (
                      <p className="text-amber-600 dark:text-amber-400 flex gap-1.5 items-start">⚠️ <span>دقة البيانات الميدانية مشكوك بها وتضخيم للأرقام.</span></p>
                    )}
                    {training !== 'مكتمل' && (
                      <p className="text-el-on-surface-variant flex gap-1.5 items-start">ℹ️ <span>لم يتم إكمال التدريب التنظيمي للمندوبين.</span></p>
                    )}
                    {((scores.loyaltyScore ?? 3) > 2 && (scores.needsLevel ?? 3) > 2 && (scores.voteProtection ?? 3) > 2 && (parseInt(accuracy) || 3) > 2 && training === 'مكتمل') && (
                      <p className="text-green-500 dark:text-green-400 flex gap-1.5 items-start">✅ <span>الوضع مستقر ولا توجد مؤشرات خطر نشطة.</span></p>
                    )}
                  </div>

                  {/* AI Action Hub */}
                  <div className="mt-4 pt-3 border-t border-el-outline-variant space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">⚡ إجراءات الذكاء الاصطناعي التنفيذية المقترحة:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handleSmsAction}
                        disabled={actionLoading}
                        className="bg-blue-600/10 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded py-1.5 px-2 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer transition disabled:opacity-50"
                      >
                        <span>💬 حملة SMS موجهة</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTaskAction}
                        disabled={actionLoading}
                        className="bg-amber-600/10 hover:bg-amber-600/25 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded py-1.5 px-2 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer transition disabled:opacity-50"
                      >
                        <span>📋 إنشاء مهمة ميدانية</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleWarningAction}
                        disabled={actionLoading}
                        className="bg-red-600/10 hover:bg-red-600/25 text-red-600 dark:text-red-400 border border-red-500/20 rounded py-1.5 px-2 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer transition disabled:opacity-50"
                      >
                        <span>🚨 تسجيل إنذار مبكر</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
