'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus, Users, Landmark, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'MUNICIPAL',
    priority: 'NORMAL',
    status: 'PENDING',
    assignedTo: '',
    estimatedCost: '',
    estimatedVotesImpact: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل الطلب الخدمي بنجاح' });
        setShowAddForm(false);
        setFormData({
          title: '',
          description: '',
          serviceType: 'MUNICIPAL',
          priority: 'NORMAL',
          status: 'PENDING',
          assignedTo: '',
          estimatedCost: '',
          estimatedVotesImpact: '',
        });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تحديث حالة الخدمة' });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <AlertCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MUNICIPAL': return 'بلدية وبنى تحتية';
      case 'HEALTH': return 'رعاية صحية وتأمين طبي';
      case 'EMPLOYMENT': return 'توظيف وتعيينات';
      case 'FINANCIAL': return 'دعم مالي وتسهيلات';
      default: return 'إدارية ومعاملات';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام الخدمات والمساعدات</h2>
          <p className="text-el-on-surface-variant text-[14px]">متابعة وتلبية متطلبات المواطنين لتعزيز الثقة الانتخابية في ذي قار</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل طلب خدمي جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">طلب خدمي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">عنوان الطلب الخدمي *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: تبليط زقاق أو توفير محولة"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نوع الخدمة</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="MUNICIPAL">بلدية وبنى تحتية</option>
                  <option value="HEALTH">رعاية صحية وتأمين طبي</option>
                  <option value="EMPLOYMENT">توظيف وتعيينات</option>
                  <option value="FINANCIAL">دعم مالي وتسهيلات</option>
                  <option value="ADMINISTRATIVE">إدارية ومعاملات</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">تفاصيل الطلب والاحتياجات</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل إضافية..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px] h-20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المسؤول عن المتابعة</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="اسم المشرف أو المندوب"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الأصوات المتأثرة المتوقعة</label>
                <input
                  type="number"
                  value={formData.estimatedVotesImpact}
                  onChange={e => setFormData({ ...formData, estimatedVotesImpact: e.target.value })}
                  placeholder="عدد الأصوات كسباً"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-[14px] font-bold border border-el-outline rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل طلبات الخدمات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((serv: any) => (
            <Card key={serv.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-el-primary-container text-el-on-primary-container text-[11px] px-2 py-0.5 rounded font-bold">
                    {getTypeLabel(serv.serviceType)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(serv.status)}
                    <span className="text-[12px] font-bold">
                      {serv.status === 'COMPLETED' ? 'مكتمل' : serv.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : 'معلق'}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-[16px] leading-[22px] mt-2 font-bold">{serv.title}</CardTitle>
                <CardDescription className="text-[12px]">{serv.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-[13px] space-y-2 border-t border-el-outline-variant mt-2">
                <div className="flex justify-between text-zinc-500">
                  <span>المتابعة:</span>
                  <span className="font-bold text-el-on-surface">{serv.assignedTo || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>التأثير الانتخابي:</span>
                  <span className="font-bold text-emerald-600">{serv.estimatedVotesImpact} صوت</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>التكلفة التقديرية:</span>
                  <span className="font-bold text-amber-700">{serv.estimatedCost.toLocaleString()} د.ع</span>
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  {serv.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(serv.id, 'COMPLETED')}
                      className="bg-emerald-600 text-white text-[12px] font-bold py-1 px-3 rounded hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      تأكيد الإنجاز
                    </button>
                  )}
                  {serv.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(serv.id, 'IN_PROGRESS')}
                      className="bg-amber-600 text-white text-[12px] font-bold py-1 px-3 rounded hover:bg-amber-700 active:scale-95 transition-all"
                    >
                      بدء التنفيذ
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
