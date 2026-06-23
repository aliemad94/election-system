'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft } from 'lucide-react';

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

  const RatingBar = ({ field, label, weight }: { field: string; label: string; weight: number }) => {
    const labels = (() => {
      switch (field) { case 'loyaltyScore': return LOYALTY_LABELS; case 'influenceLevel': return INFLUENCE_LABELS; case 'mobilizationCap': return MOBILIZATION_LABELS; case 'voteProtection': return VOTE_PROTECTION_LABELS; case 'supportReason': return SUPPORT_REASON_LABELS; case 'needsLevel': return NEEDS_LABELS; case 'politicalNote': return POLITICAL_NOTE_LABELS; case 'organizationalNote': return ORGANIZATIONAL_NOTE_LABELS; case 'generalNote': return GENERAL_NOTE_LABELS; default: return ['', '', '', '', '']; }
    })();
    const v = scores[field] ?? 3;
    return (
      <div className="space-y-1.5 bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-slate-100">{label}</span>
          <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded font-bold">الوزن: {weight}%</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setScores(s => ({ ...s, [field]: n }))}
              className={`flex-1 py-1.5 text-[11px] rounded border transition-all ${v >= n ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-blue-500/50'}`}>
              {n}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-400">{labels[v - 1]}</div>
      </div>
    );
  };

  return (
    <div className="text-slate-100" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">تقييم النفوذ والتأثير</h1>
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-semibold block mb-2">اختيار المفتاح الانتخابي</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm"
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
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-blue-300">{selectedKey.fullName || selectedKey.firstName}</h2>
                  <p className="text-[12px] text-slate-400">صافي الأصوات: {selectedKey.netVotes} | التصنيف الحالي: {selectedKey.classification}</p>
                </div>
                <button onClick={save} disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-5 py-2 rounded-lg text-[13px] font-bold transition">
                  {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <RatingBar field="loyaltyScore" label="مستوى الولاء" weight={20} />
              <RatingBar field="influenceLevel" label="مستوى التأثير" weight={20} />
              <RatingBar field="mobilizationCap" label="القدرة على التحشيد" weight={15} />
              <RatingBar field="voteProtection" label="حماية الأصوات" weight={15} />
              <RatingBar field="supportReason" label="أسباب الدعم" weight={10} />
              <RatingBar field="needsLevel" label="الاحتياجات والمطالب" weight={5} />
              <RatingBar field="politicalNote" label="الملاحظات السياسية" weight={5} />
              <RatingBar field="organizationalNote" label="الملاحظات التنظيمية" weight={5} />
              <RatingBar field="generalNote" label="الملاحظات العامة" weight={5} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-[11px] font-semibold block mb-1">دقة المعلومات (F10)</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={accuracy}
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
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={training}
                  onChange={e => setTraining(e.target.value)}>
                  <option value="غير مدرب">غير مدرب</option>
                  <option value="تحت التدريب">تحت التدريب</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-[11px] text-slate-400">معامل الكفاءة</div>
                  <div className="text-3xl font-bold text-blue-400 font-mono">{efficiency}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">التصنيف</div>
                  <div className={`text-xl font-bold ${efficiency >= 100 ? 'text-green-400' : efficiency >= 50 ? 'text-blue-400' : efficiency >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {classification}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">الأصوات المضمونة</div>
                  <div className="text-3xl font-bold text-green-400 font-mono">{guaranteed}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">الأصوات المتسربة</div>
                  <div className="text-3xl font-bold text-red-400 font-mono">{(selectedKey?.netVotes || 0) - guaranteed}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
