'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingDown,
  Swords,
  Plus,
  X,
  MapPin,
  Eye,
} from 'lucide-react';

const WARNING_TYPES = [
  { value: 'مهددة_خسارة', label: 'مهددة بخسارة الأصوات', icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { value: 'قابلة_لاختراق', label: 'قابلة للاختراق', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { value: 'آمنة', label: 'آمنة', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'متأرجحة', label: 'متأرجحة', icon: Shield, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'مشاركة_منخفضة', label: 'مشاركة منخفضة', icon: TrendingDown, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { value: 'منافسة_عالية', label: 'منافسة عالية', icon: Swords, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
];

const SEVERITY_LEVELS = ['منخفض', 'متوسط', 'مرتفع', 'حرج'];
const AREA_TYPES = ['محافظة', 'قضاء', 'ناحية', 'مركز اقتراع'];

interface WarningData {
  id: string;
  areaType: string;
  areaName: string;
  warningType: string;
  severity: string;
  description: string | null;
  estimatedVotesAtRisk: number;
  recommendedAction: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function EarlyWarningMonitor() {
  const [warnings, setWarnings] = useState<WarningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [form, setForm] = useState({
    areaType: 'قضاء',
    areaName: '',
    warningType: 'مهددة_خسارة',
    severity: 'متوسط',
    description: '',
    estimatedVotesAtRisk: 0,
    recommendedAction: '',
  });

  const fetchWarnings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('warningType', selectedType);
      if (selectedSeverity) params.set('severity', selectedSeverity);
      const res = await fetch(`/api/early-warnings?${params.toString()}`);
      const data = await res.json();
      setWarnings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching warnings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSeverity]);

  useEffect(() => { fetchWarnings(); }, [fetchWarnings]);

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/early-warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddDialog(false);
        setForm({ areaType: 'قضاء', areaName: '', warningType: 'مهددة_خسارة', severity: 'متوسط', description: '', estimatedVotesAtRisk: 0, recommendedAction: '' });
        fetchWarnings();
      }
    } catch (err) {
      console.error('Error adding warning:', err);
    }
  };

  const getTypeInfo = (type: string) => WARNING_TYPES.find(t => t.value === type) || WARNING_TYPES[0];
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'حرج': return 'bg-red-100 text-red-800 border-red-300';
      case 'مرتفع': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // إحصائيات
  const stats = WARNING_TYPES.map(wt => ({
    ...wt,
    count: warnings.filter(w => w.warningType === wt.value).length,
    votesAtRisk: warnings.filter(w => w.warningType === wt.value).reduce((s, w) => s + w.estimatedVotesAtRisk, 0),
  }));

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> مؤشرات الإنذار المبكر
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            تصنيف المناطق حسب مستوى الخطر - مهددة / قابلة للاختراق / آمنة / متأرجحة
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] font-medium">إضافة مؤشر جديد</span>
        </button>
      </div>

      {/* بطاقات التصنيف */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.value} className={`border rounded-sm p-3 ${stat.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[14px] font-semibold">{stat.label}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[28px] font-bold font-mono">{stat.count}</div>
                {stat.votesAtRisk > 0 && (
                  <div className="text-[11px] text-el-on-surface-variant">
                    {stat.votesAtRisk.toLocaleString()} صوت مهدد
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* فلاتر */}
      <div className="flex gap-3">
        <select
          className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">جميع الأنواع</option>
          {WARNING_TYPES.map(wt => <option key={wt.value} value={wt.value}>{wt.label}</option>)}
        </select>
        <select
          className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
        >
          <option value="">جميع المستويات</option>
          {SEVERITY_LEVELS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
        </select>
      </div>

      {/* قائمة المؤشرات */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : warnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <Shield className="w-12 h-12 opacity-30" />
          <p>لا توجد مؤشرات إنذار - أضف أول مؤشر</p>
        </div>
      ) : (
        <div className="space-y-2">
          {warnings.map(w => {
            const typeInfo = getTypeInfo(w.warningType);
            const TypeIcon = typeInfo.icon;
            return (
              <div key={w.id} className={`bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 flex items-start gap-3`}>
                <div className={`shrink-0 w-10 h-10 rounded flex items-center justify-center ${typeInfo.bg}`}>
                  <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-el-on-surface">{w.areaName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(w.severity)}`}>
                      {w.severity}
                    </span>
                    <span className="text-[10px] text-el-on-surface-variant">{w.areaType}</span>
                  </div>
                  <div className="text-[12px] text-el-on-surface-variant">{typeInfo.label}</div>
                  {w.description && <div className="text-[11px] text-el-on-surface-variant mt-1">{w.description}</div>}
                  <div className="flex items-center gap-4 mt-1">
                    {w.estimatedVotesAtRisk > 0 && (
                      <span className="text-[11px] text-red-600 font-mono">أصوات مهددة: {w.estimatedVotesAtRisk}</span>
                    )}
                    {w.recommendedAction && (
                      <span className="text-[11px] text-el-primary">الإجراء: {w.recommendedAction}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة إضافة */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-semibold text-el-on-surface">إضافة مؤشر إنذار جديد</h3>
              <button onClick={() => setShowAddDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نوع المنطقة</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.areaType} onChange={e => setForm({ ...form, areaType: e.target.value })}>
                  {AREA_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم المنطقة *</label>
                <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                  value={form.areaName} onChange={e => setForm({ ...form, areaName: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نوع المؤشر</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.warningType} onChange={e => setForm({ ...form, warningType: e.target.value })}>
                  {WARNING_TYPES.map(wt => <option key={wt.value} value={wt.value}>{wt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">مستوى الخطورة</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITY_LEVELS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المعرضة للخطر</label>
                <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                  value={form.estimatedVotesAtRisk} onChange={e => setForm({ ...form, estimatedVotesAtRisk: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">وصف</label>
                <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] h-16 resize-none focus:outline-none focus:border-el-primary"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الإجراء الموصى به</label>
                <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                  value={form.recommendedAction} onChange={e => setForm({ ...form, recommendedAction: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-el-outline-variant">
              <button onClick={handleAdd} disabled={!form.areaName}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50">
                إضافة
              </button>
              <button onClick={() => setShowAddDialog(false)}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
