'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, X, MapPin, Calculator, TrendingUp, Percent, Users, UserCheck, UserRoundCheck, UserRound, Building2, Hash, Edit2, Trash2 } from 'lucide-react';

// القائمة المعتمدة لـ 21 قضاء في محافظة ذي قار
const DISTRICTS_21 = [
  'الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'الجبايش',
  'قلعة سكر', 'الغراف', 'النصر', 'الفجر', 'الفهود',
  'البطحاء', 'سيد دخيل', 'الإصلاح', 'الدواية', 'الطار',
  'الكرامة', 'أور', 'الحمّار', 'العكيكة', 'الشنافية', 'الخضر',
];

interface CommissionRecord {
  id: string;
  district: string;
  registeredVoters: number;
  actualVoters: number;
  maleVoters: number;
  femaleVoters: number;
  pollingCenters: number;
  ballotStations: number;
  turnout: number;
}

interface ProvinceRef {
  province: string;
  totalRegisteredVoters: number;
  totalActualVoters: number;
  generalTurnout: number;
  maleVoters: number;
  femaleVoters: number;
  pollingCentersCount: number;
  ballotStationsCount: number;
}

interface DistrictForm {
  district: string;
  registeredVoters: string;
  actualVoters: string;
  maleVoters: string;
  femaleVoters: string;
  pollingCenters: string;
  ballotStations: string;
}

const emptyForm: DistrictForm = {
  district: '',
  registeredVoters: '',
  actualVoters: '',
  maleVoters: '',
  femaleVoters: '',
  pollingCenters: '',
  ballotStations: '',
};

export default function CommissionManagement() {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [reference, setReference] = useState<ProvinceRef | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<DistrictForm>(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const handleEditClick = (record: CommissionRecord) => {
    setForm({
      district: record.district,
      registeredVoters: record.registeredVoters.toString(),
      actualVoters: record.actualVoters.toString(),
      maleVoters: record.maleVoters.toString(),
      femaleVoters: record.femaleVoters.toString(),
      pollingCenters: record.pollingCenters.toString(),
      ballotStations: record.ballotStations.toString(),
    });
    setIsEdit(true);
    setShowDialog(true);
  };

  // إحصاءات المقارنة
  const computedTurnout = form.registeredVoters && form.actualVoters
    ? ((Number(form.actualVoters) / Number(form.registeredVoters)) * 100).toFixed(2)
    : '0.00';

  const availableDistricts = DISTRICTS_21.filter(
    (d) => !records.find((r) => r.district === d)
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/commission');
      const data = await res.json();
      if (data.list && Array.isArray(data.list)) {
        setRecords(data.list);
        setReference(data.reference || null);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.district) return;
    try {
      const res = await fetch('/api/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: form.district,
          registeredVoters: Number(form.registeredVoters) || 0,
          actualVoters: Number(form.actualVoters) || 0,
          maleVoters: Number(form.maleVoters) || 0,
          femaleVoters: Number(form.femaleVoters) || 0,
          pollingCenters: Number(form.pollingCenters) || 0,
          ballotStations: Number(form.ballotStations) || 0,
        }),
      });
      if (res.ok) {
        setForm(emptyForm);
        setIsEdit(false);
        setShowDialog(false);
        fetchData();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد الحذف؟ يرجى التأكيد')) return;
    try {
      await fetch(`/api/commission/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // تجميعات المقارنة
  const totalReg = records.reduce((s, r) => s + r.registeredVoters, 0);
  const totalAct = records.reduce((s, r) => s + r.actualVoters, 0);
  const totalM = records.reduce((s, r) => s + r.maleVoters, 0);
  const totalF = records.reduce((s, r) => s + r.femaleVoters, 0);
  const totalCenters = records.reduce((s, r) => s + (r.pollingCenters || 0), 0);
  const totalStations = records.reduce((s, r) => s + (r.ballotStations || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <FileText className="w-6 h-6 animate-pulse text-el-primary" />
        <span className="text-el-on-surface-variant">جاري تحميل بيانات المفوضية...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-el-primary flex items-center gap-2">
            <FileText className="w-6 h-6" /> بيانات المفوضية المستقلة للانتخابات
          </h1>
          <p className="text-[12px] text-el-on-surface-variant mt-1">
            إدارة بيانات الأقضية الانتخابية — 21 قضاءً في محافظة ذي قار
          </p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setIsEdit(false); setShowDialog(true); }}
          className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm font-bold text-[14px]"
        >
          <Plus className="w-[18px] h-[18px]" /> إضافة بيانات
        </button>
      </div>

      {/* المرجعية الثابتة للمحافظة (Read-Only) */}
      {reference && (
        <div className="bg-gradient-to-l from-el-primary to-[#0a2a5e] text-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-el-secondary" />
            <h2 className="text-[16px] font-bold">المرجعية الثابتة — محافظة {reference.province}</h2>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">للقراءة فقط</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <RefCard label="عدد الناخبين الكلي" value={reference.totalRegisteredVoters.toLocaleString()} />
            <RefCard label="عدد المصوتين الكلي" value={reference.totalActualVoters.toLocaleString()} />
            <RefCard label="نسبة المشاركة العامة" value={`${reference.generalTurnout}%`} />
            <RefCard label="المصوتين (ذكور)" value={reference.maleVoters.toLocaleString()} />
            <RefCard label="المصوتين (إناث)" value={reference.femaleVoters.toLocaleString()} />
            <RefCard label="مراكز الاقتراع" value={reference.pollingCentersCount.toLocaleString()} />
            <RefCard label="محطات الاقتراع" value={reference.ballotStationsCount.toLocaleString()} />
          </div>
        </div>
      )}

      {/* جدول بيانات الأقضية + المقارنات */}
      {records.length > 0 && (
        <>
          {/* صف المجاميع */}
          <div className="bg-el-primary/5 border border-el-primary/20 rounded-lg p-3 flex flex-wrap gap-4 text-[12px]">
            <span className="font-bold text-el-primary">إجمالي ما تم إدخاله:</span>
            <span>📋 {records.length} قضاء</span>
            <span>👥 ناخبين: {totalReg.toLocaleString()}</span>
            <span>🗳️ مصوتين: {totalAct.toLocaleString()}</span>
            <span>👨 ذكور: {totalM.toLocaleString()}</span>
            <span>👩 إناث: {totalF.toLocaleString()}</span>
            <span>🏢 مراكز الاقتراع: {totalCenters.toLocaleString()}</span>
            <span>🔢 محطات الاقتراع: {totalStations.toLocaleString()}</span>
            <span>📊 مشاركة: {totalReg > 0 ? ((totalAct / totalReg) * 100).toFixed(2) : '0.00'}%</span>
          </div>

          {/* جدول المقارنة */}
          <div className="overflow-x-auto border border-el-outline-variant rounded-lg">
            <table className="w-full text-[12px]">
              <thead className="bg-el-surface-container">
                <tr>
                  <th className="p-2 text-right">القضاء</th>
                  <th className="p-2 text-center">الناخبين</th>
                  <th className="p-2 text-center">المصوتين</th>
                  <th className="p-2 text-center">ذكور</th>
                  <th className="p-2 text-center">إناث</th>
                  <th className="p-2 text-center">مراكز</th>
                  <th className="p-2 text-center">محطات</th>
                  <th className="p-2 text-center bg-el-primary/10">نسبة المشاركة %</th>
                  <th className="p-2 text-center">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-el-outline-variant hover:bg-el-surface-container-lowest">
                    <td className="p-2 font-bold">{r.district}</td>
                    <td className="p-2 text-center font-mono">{r.registeredVoters.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono">{r.actualVoters.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono">{r.maleVoters.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono">{r.femaleVoters.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono">{r.pollingCenters}</td>
                    <td className="p-2 text-center font-mono">{r.ballotStations}</td>
                    <td className="p-2 text-center font-mono font-bold bg-el-primary/5 text-el-primary">
                      {r.turnout}%
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-500/10 rounded transition-all cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* نافذة إضافة بيانات قضاء */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[16px] font-bold text-el-primary flex items-center gap-2">
                <Calculator className="w-5 h-5" /> {isEdit ? 'تعديل بيانات القضاء' : 'إضافة بيانات قضاء'}
              </h3>
              <button onClick={() => { setShowDialog(false); setIsEdit(false); }} className="text-el-on-surface-variant hover:text-el-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* اختيار القضاء */}
              <div>
                <label className="text-[11px] font-bold text-el-on-surface-variant mb-1 block">اختيار القضاء المستهدف</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  disabled={isEdit}
                  className="w-full border border-el-outline-variant rounded-lg p-2.5 text-[13px] bg-el-surface-container disabled:opacity-75"
                >
                  <option value="">— اختر القضاء —</option>
                  {isEdit && <option value={form.district}>{form.district}</option>}
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  {!isEdit && records.find((r) => r.district === form.district) && (
                    <option value="" disabled>تم إدخال هذا القضاء مسبقاً</option>
                  )}
                </select>
              </div>

              {/* الحقول الستة اليدوية */}
              <div className="grid grid-cols-2 gap-3">
                <NumField label="عدد الناخبين الكلي" icon={Users} value={form.registeredVoters} onChange={(v) => setForm({ ...form, registeredVoters: v })} />
                <NumField label="عدد المصوتين الكلي" icon={UserCheck} value={form.actualVoters} onChange={(v) => setForm({ ...form, actualVoters: v })} />
                <NumField label="عدد أصوات الذكور" icon={UserRound} value={form.maleVoters} onChange={(v) => setForm({ ...form, maleVoters: v })} />
                <NumField label="عدد أصوات الإناث" icon={UserRoundCheck} value={form.femaleVoters} onChange={(v) => setForm({ ...form, femaleVoters: v })} />
                <NumField label="عدد مراكز الاقتراع" icon={Building2} value={form.pollingCenters} onChange={(v) => setForm({ ...form, pollingCenters: v })} />
                <NumField label="عدد محطات الاقتراع" icon={Hash} value={form.ballotStations} onChange={(v) => setForm({ ...form, ballotStations: v })} />
              </div>

              {/* الحقل السابع — حساب تلقائي */}
              <div className="bg-el-primary/5 border border-el-primary/20 rounded-lg p-3 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-el-primary shrink-0" />
                <div>
                  <div className="text-[11px] text-el-on-surface-variant">نسبة المشاركة في القضاء (حساب تلقائي)</div>
                  <div className="text-[20px] font-bold text-el-primary font-mono">{computedTurnout}%</div>
                  <div className="text-[9px] text-el-on-surface-variant/50 mt-0.5">
                    المعادلة: (عدد المصوتين ÷ عدد الناخبين) × 100
                  </div>
                </div>
              </div>

              {/* أزرار الحفظ */}
              <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => { setShowDialog(false); setIsEdit(false); }} className="px-4 py-2 text-[13px] border border-el-outline-variant rounded-lg hover:bg-el-surface-container cursor-pointer">إلغاء</button>
                <button
                  onClick={handleSave}
                  disabled={!form.district}
                  className="px-6 py-2 bg-el-primary text-el-on-primary rounded-lg text-[13px] font-bold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isEdit ? 'تعديل البيانات' : 'حفظ البيانات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** بطاقة مرجعية صغيرة */
function RefCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-2.5 text-center">
      <div className="text-[10px] opacity-70 leading-tight">{label}</div>
      <div className="text-[16px] font-bold mt-0.5">{value}</div>
    </div>
  );
}

/** حقل إدخال رقمي */
function NumField({ label, icon: Icon, value, onChange }: { label: string; icon: any; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-el-on-surface-variant mb-1 block">{label}</label>
      <div className="relative">
        <Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-el-on-surface-variant/40" />
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full border border-el-outline-variant rounded-lg p-2.5 pr-8 text-[13px] font-mono bg-el-surface-container text-right"
        />
      </div>
    </div>
  );
}
