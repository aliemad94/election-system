'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, TrendingUp, Users, Target, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompetitorsManagement() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    partyOrList: '',
    strengthLevel: '3',
    district: '',
    primaryArea: '',
    estimatedVotesBase: '',
    keyStrengths: '',
    keyWeaknesses: '',
    counterStrategy: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const res = await fetch('/api/competitors');
      const data = await res.json();
      setCompetitors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل المرشح المنافس بنجاح' });
        setShowAddForm(false);
        setFormData({
          candidateName: '',
          partyOrList: '',
          strengthLevel: '3',
          district: '',
          primaryArea: '',
          estimatedVotesBase: '',
          keyStrengths: '',
          keyWeaknesses: '',
          counterStrategy: '',
        });
        fetchCompetitors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام تتبع المنافسين والخصوم</h2>
          <p className="text-el-on-surface-variant text-[14px]">رصد تحركات المرشحين المنافسين في دوائر ذي قار الانتخابية وصياغة الخطط المضادة</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة مرشح منافس جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">تسجيل مرشح منافس</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">اسم المرشح المنافس *</label>
                <input
                  type="text"
                  required
                  value={formData.candidateName}
                  onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="الاسم الكامل للمنافس"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القائمة / الحزب *</label>
                <input
                  type="text"
                  required
                  value={formData.partyOrList}
                  onChange={e => setFormData({ ...formData, partyOrList: e.target.value })}
                  placeholder="اسم القائمة أو التحالف"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">مستوى الخطورة والقوة (1-5)</label>
                <select
                  value={formData.strengthLevel}
                  onChange={e => setFormData({ ...formData, strengthLevel: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="1">1 - ضعيف جداً</option>
                  <option value="2">2 - محدود التأثير</option>
                  <option value="3">3 - متوسط القوة</option>
                  <option value="4">4 - قوي ومؤثر</option>
                  <option value="5">5 - خطير جداً (رئيسي)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القضاء الرئيسي</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="مثال: الشطرة، الناصرية"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المنطقة الجغرافية للنفوذ</label>
                <input
                  type="text"
                  value={formData.primaryArea}
                  onChange={e => setFormData({ ...formData, primaryArea: e.target.value })}
                  placeholder="مثال: حي الحسين، الشرقية"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">خزان الأصوات التقديري</label>
                <input
                  type="number"
                  value={formData.estimatedVotesBase}
                  onChange={e => setFormData({ ...formData, estimatedVotesBase: e.target.value })}
                  placeholder="الأصوات المتوقعة له"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نقاط القوة لديه</label>
                <input
                  type="text"
                  value={formData.keyStrengths}
                  onChange={e => setFormData({ ...formData, keyStrengths: e.target.value })}
                  placeholder="مثال: نفوذ مالي، حضور عشائري"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نقاط الضعف</label>
                <input
                  type="text"
                  value={formData.keyWeaknesses}
                  onChange={e => setFormData({ ...formData, keyWeaknesses: e.target.value })}
                  placeholder="مثال: خلافات داخلية، غياب خدمي"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">الخطة والتحرك المضاد الموصى به</label>
                <textarea
                  value={formData.counterStrategy}
                  onChange={e => setFormData({ ...formData, counterStrategy: e.target.value })}
                  placeholder="الإجراءات اللازمة لتقليص نفوذه في المنطقة..."
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
                  حفظ وتسجيل المنافس
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل بيانات المنافسين...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitors.map((comp: any) => (
            <Card key={comp.id} className="border-el-outline-variant hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-full font-bold border border-rose-100 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    مستوى خطورة {comp.strengthLevel}/5
                  </span>
                  <span className="text-[13px] font-bold text-zinc-500">{comp.partyOrList}</span>
                </div>
                <CardTitle className="text-[18px] leading-[26px] mt-3 text-rose-950 font-bold">{comp.candidateName}</CardTitle>
                <CardDescription className="text-[12px]">القضاء: {comp.district || 'غير محدد'} | المنطقة: {comp.primaryArea || 'غير محدد'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-[13px] space-y-3 border-t border-el-outline-variant/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <span className="font-bold">قاعدة الأصوات التقديرية:</span>
                  <span className="text-rose-700 font-bold">{(comp.estimatedVotesBase || 0).toLocaleString()} صوت</span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 space-y-1.5">
                  <div>
                    <span className="text-[11px] text-emerald-600 font-bold">💪 نقاط القوة: </span>
                    <span className="text-[13px] text-zinc-800">{comp.keyStrengths || 'غير موثقة'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-500 font-bold">⚠️ نقاط الضعف: </span>
                    <span className="text-[13px] text-zinc-800">{comp.keyWeaknesses || 'غير موثقة'}</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-100">
                  <span className="text-[12px] font-bold text-amber-900 block mb-1">🎯 الإستراتيجية المضادة:</span>
                  <p className="text-[13px] text-amber-950 leading-[18px] font-medium">{comp.counterStrategy || 'لم تحدد بعد'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
