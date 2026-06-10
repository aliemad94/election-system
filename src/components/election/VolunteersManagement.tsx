'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, Plus, Star, Award, CheckCircle, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'FIELD_AGENT',
    district: '',
    area: '',
    notes: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch('/api/volunteers');
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل العضو / المتطوع بنجاح' });
        setShowAddForm(false);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          role: 'FIELD_AGENT',
          district: '',
          area: '',
          notes: '',
        });
        fetchVolunteers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'FIELD_AGENT': return 'مندوب ميداني';
      case 'LOGISTICS': return 'مسؤول دعم لوجستي';
      case 'MEDIA': return 'إعلام وتواصل رقمي';
      case 'COORDINATOR': return 'منسق جغرافي';
      case 'ELECTION_DAY_OBSERVER': return 'مراقب محطة اقتراع';
      default: return 'عضو كادر';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام إدارة المتطوعين والكوادر</h2>
          <p className="text-el-on-surface-variant text-[14px]">تنظيم الكادر المشرف والمندوبين وتوزيع المهام الميدانية في محافظة ذي قار</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل متطوع/عضو جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">طلب انضمام متطوع</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="اسم المتطوع الثلاثي أو الرباعي"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">رقم الهاتف الجوال *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="رقم الهاتف (11 رقم)"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الدور التنظيمي</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="FIELD_AGENT">مندوب ميداني</option>
                  <option value="LOGISTICS">مسؤول دعم لوجستي</option>
                  <option value="MEDIA">إعلام وتواصل رقمي</option>
                  <option value="COORDINATOR">منسق جغرافي</option>
                  <option value="ELECTION_DAY_OBSERVER">مراقب محطة اقتراع</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القضاء المكلف به</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="الناصرية، الشطرة، الرفاعي..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المنطقة / المحلة</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                  placeholder="اسم الحي أو المنطقة المحددة"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">البريد الإلكتروني (إن وجد)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
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
                  حفظ وتسجيل المتطوع
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل الكوادر والمتطوعين...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteers.map((vol: any) => (
            <Card key={vol.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardContent className="p-5 flex gap-4">
                <div className="w-16 h-16 rounded bg-el-primary-container text-el-on-primary-container flex items-center justify-center shrink-0">
                  <Users2 className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[16px] font-bold">{vol.fullName}</h3>
                      <p className="text-[12px] text-zinc-500">{vol.phone} | {getRoleLabel(vol.role)}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-0.5 rounded font-bold border border-emerald-100 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      كفاءة {vol.efficiencyScore}%
                    </span>
                  </div>

                  <div className="text-[12px] text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 flex justify-between">
                    <div>
                      <span className="font-bold text-zinc-700">المنطقة المكلف بها:</span>{' '}
                      <span>{vol.district ? `${vol.district} (${vol.area || 'المركز'})` : 'غير محدد'}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-[12px] pt-1 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4 text-zinc-400" />
                      المهام الموكلة: {vol.totalAssignedTasks}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      المهام المنجزة: {vol.totalCompletedTasks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
