'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, TrendingUp, Users, Target, FileText, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export default function CompetitorsManagement() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
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

  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitors();
    return () => {
      // Execute any pending deletes immediately on unmount
      Object.keys(timeoutsRef.current).forEach(id => {
        clearTimeout(timeoutsRef.current[id]);
        fetch(`/api/competitors/${id}`, { method: 'DELETE' }).catch(console.error);
      });
    };
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

  const handleDelete = (id: string, name: string) => {
    const competitorToRestore = competitors.find(c => c.id === id);
    if (!competitorToRestore) return;

    // Remove from UI optimistically
    setCompetitors(prev => prev.filter(c => c.id !== id));

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          toast({ title: 'خطأ', description: `فشل حذف المنافس ${name}`, variant: 'destructive' });
          fetchCompetitors();
        }
      } catch (err) {
        toast({ title: 'خطأ', description: 'تعذر الاتصال بالخادم لحذف المنافس', variant: 'destructive' });
        fetchCompetitors();
      }
      delete timeoutsRef.current[id];
    }, 5000);

    timeoutsRef.current[id] = timeoutId;

    toast({
      title: 'تم حذف المنافس مؤقتاً',
      description: `تم حذف المنافس ${name} من القائمة.`,
      action: (
        <ToastAction
          altText="تراجع"
          onClick={() => {
            if (timeoutsRef.current[id]) {
              clearTimeout(timeoutsRef.current[id]);
              delete timeoutsRef.current[id];
            }
            setCompetitors(prev => {
              if (prev.some(c => c.id === id)) return prev;
              return [competitorToRestore, ...prev];
            });
            toast({ title: 'تم التراجع', description: `تم استعادة المنافس ${name}` });
          }}
        >
          تراجع
        </ToastAction>
      ),
    });
  };

  const filteredCompetitors = competitors.filter(comp =>
    comp.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    comp.partyOrList.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search Input with Clear Button */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث عن منافس بالاسم أو القائمة..."
          className="bg-el-surface border border-el-outline rounded p-2 pr-9 pl-8 text-[14px] w-full"
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-el-on-surface-variant"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-el-on-surface-variant hover:text-el-on-surface p-0.5 rounded-full hover:bg-el-surface-container cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">جاري تحميل بيانات المنافسين...</div>
      ) : filteredCompetitors.length === 0 ? (
        <div className="text-center py-10 text-el-on-surface-variant">لا توجد سجلات منافسين مطابقة للبحث.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompetitors.map((comp: any) => (
            <Card key={comp.id} className="border-el-outline-variant hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-full font-bold border border-rose-100 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    مستوى خطورة {comp.strengthLevel}/5
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-zinc-500">{comp.partyOrList}</span>
                    <button
                      onClick={() => handleDelete(comp.id, comp.candidateName)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-500/10 cursor-pointer"
                      title="حذف المنافس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <CardTitle className="text-[18px] leading-[26px] mt-3 text-rose-950 font-bold">{comp.candidateName}</CardTitle>
                <CardDescription className="text-[12px]">القضاء: {comp.district || 'غير محدد'} | المنطقة: {comp.primaryArea || 'غير محدد'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-[13px] space-y-3 border-t border-el-outline-variant/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <span className="font-bold">قاعدة الأصوات التقديرية:</span>
                  <span className="text-rose-700 font-bold">{(Number(comp.estimatedVotesBase) || 0).toLocaleString()} صوت</span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 space-y-1.5 dark:bg-el-surface-container dark:border-el-outline-variant">
                  <div>
                    <span className="text-[11px] text-emerald-600 font-bold">💪 نقاط القوة: </span>
                    <span className="text-[13px] text-zinc-800 dark:text-el-on-surface">{comp.keyStrengths || 'غير موثقة'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-500 font-bold">⚠️ نقاط الضعف: </span>
                    <span className="text-[13px] text-zinc-800 dark:text-el-on-surface">{comp.keyWeaknesses || 'غير موثقة'}</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-100 dark:bg-el-surface-container-low dark:border-el-outline-variant">
                  <span className="text-[12px] font-bold text-amber-900 dark:text-amber-400 block mb-1">🎯 الإستراتيجية المضادة:</span>
                  <p className="text-[13px] text-amber-950 dark:text-el-on-surface leading-[18px] font-medium">{comp.counterStrategy || 'لم تحدد بعد'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


