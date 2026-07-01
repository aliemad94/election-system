'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Heart, TrendingUp, AlertCircle, Plus, Smile, Meh, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PublicOpinion() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    indicatorType: 'مزاج_شعبي',
    value: '',
    numericValue: '70',
    severity: 'عادي',
    source: 'استبيانات الفرق الميدانية',
  });

  const { toast } = useToast();

  const fetchIndicators = async () => {
    try {
      const res = await fetch('/api/dynamic-indicators');
      const data = await res.json();
      setIndicators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dynamic-indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل مؤشر رأي عام جديد' });
        setShowAddForm(false);
        setFormData({
          indicatorType: 'مزاج_شعبي',
          value: '',
          numericValue: '70',
          severity: 'عادي',
          source: 'استبيانات الفرق الميدانية',
        });
        fetchIndicators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'إيجابي': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> إيجابي</span>;
      case 'سلبي': return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Frown className="w-3.5 h-3.5" /> سلبي</span>;
      default: return <span className="bg-zinc-50 text-zinc-700 border border-zinc-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Meh className="w-3.5 h-3.5" /> عادي</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام قياس الرأي العام والنبض</h2>
          <p className="text-el-on-surface-variant text-[14px]">تتبع اتجاهات الشارع في ذي قار، قياس الرضا، والقضايا الخدمية والسياسية المؤثرة</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل مؤشر رأي جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">رصد اتجاه رأي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نوع المؤشر *</label>
                <select
                  value={formData.indicatorType}
                  onChange={e => setFormData({ ...formData, indicatorType: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="مزاج_شعبي">مزاج شعبي عام</option>
                  <option value="قضايا_ساخنة">قضايا ساخنة ومطالب</option>
                  <option value="اتجاه_رأي">اتجاه رأي حول المرشح</option>
                  <option value="قوة_خصوم">تحركات وقوة الخصوم</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">النسبة التقديرية أو القيمة الرقمية (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.numericValue}
                  onChange={e => setFormData({ ...formData, numericValue: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">التصنيف والاتجاه</label>
                <select
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="إيجابي">إيجابي / رضا</option>
                  <option value="عادي">عادي / متأرجح</option>
                  <option value="سلبي">سلبي / استياء</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">مصدر الرصد</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  placeholder="مثال: استبيانات ميدانية، منصات التواصل"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">وصف وتفاصيل التوجه العام للرأي</label>
                <textarea
                  required
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  placeholder="وصف تفصيلي لما يطرحه الشارع والناخبين..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px] h-20"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-el-outline rounded text-[14px] font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل المؤشر
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل مؤشرات الرأي العام...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicators.map((ind: any) => (
            <Card key={ind.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="bg-el-secondary-container text-el-on-secondary-container text-[11px] px-2 py-0.5 rounded font-bold">
                    {ind.indicatorType.replace('_', ' ')}
                  </span>
                  {getSeverityBadge(ind.severity)}
                </div>
                <CardTitle className="text-[16px] leading-[22px] mt-2 font-bold flex justify-between items-center">
                  <span>مستوى الدعم/التأثير:</span>
                  <span className="text-el-primary text-[20px] font-black">{ind.numericValue}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-[13px] space-y-3 border-t border-el-outline-variant mt-2">
                <p className="text-el-on-surface font-medium leading-[20px]">{ind.value}</p>
                <div className="pt-2 flex justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
                  <span>المصدر: {ind.source}</span>
                  <span>{new Date(ind.recordedAt || ind.createdAt).toLocaleDateString('en-US')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

