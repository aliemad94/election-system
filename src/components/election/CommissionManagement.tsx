'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  ChevronDown,
  X,
  MapPin,
  TrendingUp,
  Award,
  Vote,
  Edit2,
  Trash2,
  Percent,
  Calculator,
} from 'lucide-react';

const DISTRICTS = [
  'الناصرية',
  'الشطرة',
  'سوق الشيوخ',
  'الرفاعي',
  'الجبايش',
  'قلعة سكر',
  'الغراف',
  'النصر',
  'الفجر',
  'الفهود',
  'البطحاء',
  'سيد دخيل',
  'الإصلاح',
  'الدواية',
];

interface CommissionDataRecord {
  id: string;
  province: string;
  district: string;
  subDistrict: string;
  pollingCenter: string;
  ballotStation: string;
  registeredVoters: number;
  historicalTurnout: number;
  expectedTurnout: number | null;
}

const defaultForm = {
  province: 'ذي قار',
  district: 'الناصرية',
  subDistrict: '',
  pollingCenter: '',
  ballotStation: '',
  registeredVoters: 0,
  historicalTurnout: 0,
  expectedTurnout: '',
};

export default function CommissionManagement() {
  const [records, setRecords] = useState<CommissionDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [form, setForm] = useState(defaultForm);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/commission');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching commission records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSaveRecord = async () => {
    try {
      const payload = {
        ...form,
        expectedTurnout: form.expectedTurnout ? parseFloat(form.expectedTurnout) : null,
      };

      const url = editMode ? `/api/commission/${editingId}` : '/api/commission';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setEditMode(false);
        setEditingId(null);
        setForm(defaultForm);
        fetchRecords();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في حفظ البيانات');
      }
    } catch (err) {
      console.error('Error saving commission record:', err);
    }
  };

  const handleStartEdit = (rec: CommissionDataRecord) => {
    setForm({
      province: rec.province,
      district: rec.district,
      subDistrict: rec.subDistrict || '',
      pollingCenter: rec.pollingCenter || '',
      ballotStation: rec.ballotStation || '',
      registeredVoters: rec.registeredVoters || 0,
      historicalTurnout: rec.historicalTurnout || 0,
      expectedTurnout: rec.expectedTurnout !== null ? String(rec.expectedTurnout) : '',
    });
    setEditingId(rec.id);
    setEditMode(true);
    setShowAddDialog(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل الانتخابي؟')) return;

    try {
      const res = await fetch(`/api/commission/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRecords();
      } else {
        alert('فشل في حذف السجل');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.district.includes(searchQuery) ||
      r.pollingCenter.includes(searchQuery) ||
      r.subDistrict.includes(searchQuery);
    const matchesDistrict = filterDistrict ? r.district === filterDistrict : true;
    return matchesSearch && matchesDistrict;
  });

  // Calculate totals
  const totalRegistered = filteredRecords.reduce((sum, r) => sum + r.registeredVoters, 0);
  const avgTurnout =
    filteredRecords.length > 0
      ? filteredRecords.reduce((sum, r) => sum + (r.expectedTurnout ?? r.historicalTurnout), 0) /
        filteredRecords.length
      : 0;
  const totalExpectedVoters = Math.round(
    filteredRecords.reduce(
      (sum, r) => sum + r.registeredVoters * ((r.expectedTurnout ?? r.historicalTurnout) / 100),
      0
    )
  );

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <FileText className="w-6 h-6" /> بيانات المفوضية المستقلة للانتخابات
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            إدارة أعداد الناخبين المسجلين، ونسب المشاركة، ومحطات الاقتراع الموزعة على أقضية ذي قار
          </p>
        </div>
        <button
          onClick={() => {
            setEditMode(false);
            setForm(defaultForm);
            setShowAddDialog(true);
          }}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة مركز/محطة اقتراع</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">الناخبون المسجلون كلياً</div>
          <div
            className="text-[28px] font-bold text-el-primary mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {totalRegistered.toLocaleString()}
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">إجمالي الناخبين في السجلات المختارة</div>
        </div>

        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">متوسط نسبة المشاركة المتوقعة</div>
          <div
            className="text-[28px] font-bold text-el-secondary mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {avgTurnout.toFixed(2)}%
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">بناءً على التحديثات والمشاركة التاريخية</div>
        </div>

        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">المصوتون المتوقع حضورهم</div>
          <div
            className="text-[28px] font-bold text-green-600 mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {totalExpectedVoters.toLocaleString()}
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">إجمالي الحضور التقريبي يوم الاقتراع</div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] focus:outline-none focus:border-el-primary"
            placeholder="بحث بالقضاء، اسم المركز أو الناحية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-[12px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* Grid of Data */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <FileText className="w-12 h-12 opacity-30" />
          <p>لا توجد بيانات مسجلة لمفوضية الانتخابات</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px] leading-[16px]">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-el-on-surface-variant text-[11px] font-bold">
                <tr>
                  <th className="px-3 py-2">المحافظة</th>
                  <th className="px-3 py-2">القضاء</th>
                  <th className="px-3 py-2">الناحية</th>
                  <th className="px-3 py-2">مركز الاقتراع</th>
                  <th className="px-3 py-2 text-center">المحطة</th>
                  <th className="px-3 py-2 text-center">الناخبون المسجلون</th>
                  <th className="px-3 py-2 text-center">نسبة المشاركة التاريخية</th>
                  <th className="px-3 py-2 text-center">نسبة المشاركة المتوقعة</th>
                  <th className="px-3 py-2 w-16 text-center">خيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-el-surface-container-low/20 transition-colors">
                    <td className="px-3 py-2">{rec.province}</td>
                    <td className="px-3 py-2 font-bold text-el-primary">{rec.district}</td>
                    <td className="px-3 py-2">{rec.subDistrict || '-'}</td>
                    <td className="px-3 py-2">{rec.pollingCenter}</td>
                    <td className="px-3 py-2 text-center font-mono">{rec.ballotStation}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{rec.registeredVoters.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center font-mono">{rec.historicalTurnout}%</td>
                    <td className="px-3 py-2 text-center font-mono text-el-secondary font-bold">
                      {rec.expectedTurnout !== null ? `${rec.expectedTurnout}%` : '-'}
                    </td>
                    <td className="px-3 py-2 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="text-el-secondary hover:text-el-primary transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded border border-el-outline-variant w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b border-el-outline-variant">
              <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-el-primary" />
                {editMode ? 'تعديل السجل الانتخابي' : 'إضافة سجل اقتراع للمفوضية'}
              </h3>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setForm(defaultForm);
                }}
                className="text-el-on-surface-variant hover:text-el-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المحافظة</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">القضاء *</label>
                  <select
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الناحية/المنطقة</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: المركز"
                    value={form.subDistrict}
                    onChange={(e) => setForm({ ...form, subDistrict: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">مركز الاقتراع *</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: مدرسة بابل"
                    value={form.pollingCenter}
                    onChange={(e) => setForm({ ...form, pollingCenter: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">رقم المحطة *</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: 1"
                    value={form.ballotStation}
                    onChange={(e) => setForm({ ...form, ballotStation: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الناخبين الكلي</label>
                  <input
                    type="number"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    value={form.registeredVoters || ''}
                    onChange={(e) => setForm({ ...form, registeredVoters: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نسبة المشاركة التاريخية (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    placeholder="مثال: 48.97"
                    value={form.historicalTurnout || ''}
                    onChange={(e) => setForm({ ...form, historicalTurnout: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نسبة المشاركة المتوقعة (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    placeholder="اختياري"
                    value={form.expectedTurnout}
                    onChange={(e) => setForm({ ...form, expectedTurnout: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-el-outline-variant bg-el-surface-container-lowest">
              <button
                onClick={handleSaveRecord}
                disabled={!form.pollingCenter || !form.ballotStation}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMode ? 'حفظ التعديلات' : 'إضافة السجل'}
              </button>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setForm(defaultForm);
                }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
