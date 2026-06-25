'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, X, MapPin, Calculator, Percent, Users, Trash2, Trophy, Landmark, Eye, Info } from 'lucide-react';

const DISTRICTS_21 = [
  'الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'الجبايش',
  'قلعة سكر', 'الغراف', 'النصر', 'الفجر', 'الفهود',
  'البطحاء', 'سيد دخيل', 'الإصلاح', 'الدواية', 'الطار',
  'الكرامة', 'أور', 'الحمّار', 'العكيكة', 'الشنافية', 'الخضر',
];

interface CandidateInput {
  candidateName: string;
  partyName: string;
  votes: number;
  isOurCandidate: boolean;
}

interface ElectionResultRecord {
  id: string;
  year: number;
  district: string | null;
  scope: string;
  electionType: string;
  totalRegistered: number;
  totalVotes: number;
  validVotes: number;
  invalidVotes: number;
  participationRate: number;
  totalSeats: number;
  seatsWon: number;
  thresholdVotes: number;
  status: string;
  winnerName: string | null;
  winnerVotes: number;
  notes: string | null;
  candidates: {
    id: string;
    candidateName: string;
    partyName: string | null;
    votes: number;
    votePercentage: number;
    votePercentageOfTurnout: number;
    seatsAllocated: number;
    isOurCandidate: boolean;
  }[];
  createdAt: string;
}

export default function ElectionResultsManagement() {
  const [results, setResults] = useState<ElectionResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState<ElectionResultRecord | null>(null);
  
  // Form State
  const [year, setYear] = useState(new Date().getFullYear());
  const [scope, setScope] = useState('محافظة');
  const [district, setDistrict] = useState('');
  const [electionType, setElectionType] = useState('برلمانية');
  const [totalRegistered, setTotalRegistered] = useState('');
  const [totalVotes, setTotalVotes] = useState('');
  const [invalidVotes, setInvalidVotes] = useState('');
  const [totalSeats, setTotalSeats] = useState('18');
  const [status, setStatus] = useState('أولية');
  const [notes, setNotes] = useState('');
  const [candidates, setCandidates] = useState<CandidateInput[]>([]);
  
  // Candidate Form Row State
  const [cName, setCName] = useState('');
  const [cParty, setCParty] = useState('');
  const [cVotes, setCVotes] = useState('');
  const [cIsOur, setCIsOur] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/election-results/historical');
      const data = await res.json();
      if (data.list && Array.isArray(data.list)) {
        setResults(data.list);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleAddCandidate = () => {
    if (!cName || !cVotes) return;
    setCandidates([
      ...candidates,
      {
        candidateName: cName,
        partyName: cParty,
        votes: Number(cVotes) || 0,
        isOurCandidate: cIsOur,
      },
    ]);
    setCName('');
    setCParty('');
    setCVotes('');
    setCIsOur(false);
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!year || !scope || !electionType || candidates.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة مرشح واحد على الأقل.');
      return;
    }
    try {
      const res = await fetch('/api/election-results/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          district: scope === 'قضاء' ? district : null,
          scope,
          electionType,
          totalRegistered: Number(totalRegistered) || 0,
          totalVotes: Number(totalVotes) || 0,
          invalidVotes: Number(invalidVotes) || 0,
          totalSeats: Number(totalSeats) || 0,
          status,
          notes,
          candidates,
        }),
      });
      if (res.ok) {
        setShowDialog(false);
        // Reset form
        setYear(new Date().getFullYear());
        setScope('محافظة');
        setDistrict('');
        setElectionType('برلمانية');
        setTotalRegistered('');
        setTotalVotes('');
        setInvalidVotes('');
        setTotalSeats('18');
        setStatus('أولية');
        setNotes('');
        setCandidates([]);
        fetchResults();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'حدث خطأ أثناء حفظ النتائج.');
      }
    } catch (err) {
      console.error('Error saving results:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد الحذف النهائي؟ يرجى التأكيد')) return;
    try {
      const res = await fetch(`/api/election-results/historical/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchResults();
      }
    } catch (err) {
      console.error('Error deleting result:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <FileText className="w-6 h-6 animate-pulse text-el-primary" />
        <span className="text-el-on-surface-variant">جاري تحميل النتائج الانتخابية التاريخية...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-el-primary flex items-center gap-2">
            <Landmark className="w-6 h-6" /> نتائج الانتخابات التاريخية والرسمية
          </h1>
          <p className="text-[12px] text-el-on-surface-variant mt-1">
            تسجيل وتوثيق وتحليل نتائج الانتخابات الرسمية مع توزيع المقاعد بـ Saint-Laguë وحساب نسب التصويت
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm font-bold text-[14px] cursor-pointer"
        >
          <Plus className="w-[18px] h-[18px]" /> إضافة نتائج رسمية
        </button>
      </div>

      {/* Grid List of Results */}
      {results.length === 0 ? (
        <div className="bg-el-surface-container border border-el-outline-variant rounded-xl p-8 text-center flex flex-col items-center gap-3">
          <Landmark className="w-12 h-12 text-el-on-surface-variant/40" />
          <p className="text-el-on-surface font-semibold">لا توجد نتائج انتخابات مسجلة حتى الآن</p>
          <p className="text-[12px] text-el-on-surface-variant/60">
            يمكنك إدخال نتائج دورات انتخابية سابقة أو حالية لعرض مقارنات دقة التنبؤ ونسب المشاركة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r.id} className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] bg-el-primary-container text-el-on-primary-container px-2 py-0.5 rounded-full font-bold">
                      {r.electionType}
                    </span>
                    <h3 className="text-[18px] font-bold text-el-on-surface mt-1">
                      انتخابات سنة {r.year}
                    </h3>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    r.status === 'مصادق' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="space-y-2 text-[13px] border-t border-el-outline-variant pt-3">
                  <div className="flex justify-between">
                    <span className="text-el-on-surface-variant">النطاق الجغرافي:</span>
                    <span className="font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-el-primary" />
                      {r.scope === 'قضاء' ? `قضاء ${r.district}` : 'على مستوى المحافظة'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-el-on-surface-variant">الأصوات الصحيحة / الكلية:</span>
                    <span className="font-mono">
                      {r.validVotes.toLocaleString()} / {r.totalVotes.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-el-on-surface-variant">نسبة المشاركة:</span>
                    <span className="font-mono font-bold text-el-primary">{r.participationRate}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-el-on-surface-variant">عتبة الفوز (الحد الأدنى):</span>
                    <span className="font-mono">{r.thresholdVotes.toLocaleString()} صوت</span>
                  </div>

                  {r.winnerName && (
                    <div className="flex justify-between items-center bg-el-surface-container-highest p-2 rounded-lg mt-2">
                      <span className="text-[12px] font-semibold text-el-primary flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" /> الفائز الأول:
                      </span>
                      <span className="font-bold text-[12px]">
                        {r.winnerName} ({r.winnerVotes.toLocaleString()} صوت)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mt-2 text-[12px] bg-el-secondary-container/30 p-2 rounded-lg">
                    <span className="font-semibold text-el-on-secondary-container">مقاعدنا المحققة:</span>
                    <span className="font-bold text-el-primary font-mono text-[14px]">
                      {r.seatsWon} / {r.totalSeats} مقاعد
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-el-outline-variant">
                <button
                  onClick={() => setShowDetailsDialog(r)}
                  className="flex-1 bg-el-surface-container-high hover:bg-el-surface-container-highest text-el-on-surface py-2 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> عرض التفاصيل الكاملة
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg cursor-pointer"
                  title="حذف السجل"
                >
                  <Trash2 className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for Adding New Result */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-el-outline-variant flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-el-primary flex items-center gap-2">
                <Landmark className="w-5 h-5" /> إضافة نتائج الانتخابات الرسمية
              </h2>
              <button onClick={() => setShowDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">السنة</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">نوع الانتخابات</label>
                  <select
                    value={electionType}
                    onChange={(e) => setElectionType(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  >
                    <option value="برلمانية">برلمانية</option>
                    <option value="مجالس محافظات">مجالس محافظات</option>
                    <option value="بلدية">بلدية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">النطاق الجغرافي</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  >
                    <option value="محافظة">محافظة كاملة</option>
                    <option value="قضاء">قضاء محدد</option>
                  </select>
                </div>

                {scope === 'قضاء' && (
                  <div>
                    <label className="block text-[12px] font-bold text-el-on-surface mb-1">القضاء</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                    >
                      <option value="">اختر القضاء...</option>
                      {DISTRICTS_21.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">إجمالي الناخبين المسجلين</label>
                  <input
                    type="number"
                    placeholder="مثال: 1099438"
                    value={totalRegistered}
                    onChange={(e) => setTotalRegistered(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">إجمالي المصوتين (المشاركة)</label>
                  <input
                    type="number"
                    placeholder="مثال: 538390"
                    value={totalVotes}
                    onChange={(e) => setTotalVotes(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">الأصوات الباطلة</label>
                  <input
                    type="number"
                    placeholder="مثال: 25000"
                    value={invalidVotes}
                    onChange={(e) => setInvalidVotes(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">عدد المقاعد الكلية المتاحة</label>
                  <input
                    type="number"
                    placeholder="مثال: 18"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">الحالة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  >
                    <option value="أولية">أولية</option>
                    <option value="نهائية">نهائية</option>
                    <option value="مصادق">مصادق عليها</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-el-on-surface mb-1">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات توثيقية عن الدورة الانتخابية..."
                  rows={2}
                  className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary resize-none"
                />
              </div>

              {/* Add Candidate/Party Section */}
              <div className="bg-el-surface-container-high rounded-xl p-4 border border-el-outline-variant">
                <h3 className="text-[14px] font-bold text-el-primary mb-3 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> إدخال أصوات الكيانات والمرشحين
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="اسم المرشح أو القائمة"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[13px] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="اسم الحزب/التحالف"
                    value={cParty}
                    onChange={(e) => setCParty(e.target.value)}
                    className="bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[13px] focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="عدد الأصوات"
                    value={cVotes}
                    onChange={(e) => setCVotes(e.target.value)}
                    className="bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[13px] focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-el-on-surface">
                      <input
                        type="checkbox"
                        checked={cIsOur}
                        onChange={(e) => setCIsOur(e.target.checked)}
                        className="w-4 h-4 accent-el-primary rounded"
                      />
                      مرشحنا / قائمتنا
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCandidate}
                      className="bg-el-primary text-el-on-primary p-2 rounded-lg mr-auto text-[13px] font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> إضافة
                    </button>
                  </div>
                </div>

                {/* Candidate List Table */}
                {candidates.length > 0 && (
                  <div className="overflow-x-auto border border-el-outline-variant rounded-lg bg-el-surface-container-lowest">
                    <table className="w-full text-right text-[12px]">
                      <thead>
                        <tr className="bg-el-surface-container-high border-b border-el-outline-variant">
                          <th className="p-2 font-bold">الاسم</th>
                          <th className="p-2 font-bold">الحزب</th>
                          <th className="p-2 font-bold">الأصوات</th>
                          <th className="p-2 font-bold">النوع</th>
                          <th className="p-2 font-bold text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((c, idx) => (
                          <tr key={idx} className="border-b border-el-outline-variant last:border-0">
                            <td className="p-2 font-bold">{c.candidateName}</td>
                            <td className="p-2">{c.partyName || '—'}</td>
                            <td className="p-2 font-mono font-bold">{c.votes.toLocaleString()}</td>
                            <td className="p-2">
                              {c.isOurCandidate ? (
                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  مرشحنا
                                </span>
                              ) : (
                                <span className="text-el-on-surface-variant opacity-70">منافس</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCandidate(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-el-outline-variant bg-el-surface-container-high flex justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="bg-el-surface-container-lowest border border-el-outline-variant hover:bg-el-surface-container text-el-on-surface px-5 py-2.5 rounded-lg text-[14px] font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-lg text-[14px] font-bold hover:opacity-90 cursor-pointer"
              >
                حفظ النتائج وتشغيل المحاكاة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Full Details View */}
      {showDetailsDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-el-outline-variant flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-el-primary flex items-center gap-2">
                <Landmark className="w-5 h-5" /> تفاصيل نتائج انتخابات سنة {showDetailsDialog.year}
              </h2>
              <button onClick={() => setShowDetailsDialog(null)} className="text-el-on-surface-variant hover:text-el-on-surface p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                <div className="bg-el-surface-container-high border border-el-outline-variant rounded-xl p-3">
                  <div className="text-[11px] text-el-on-surface-variant font-bold">نسبة المشاركة</div>
                  <div className="text-[20px] font-mono font-bold text-el-primary">{showDetailsDialog.participationRate}%</div>
                </div>
                <div className="bg-el-surface-container-high border border-el-outline-variant rounded-xl p-3">
                  <div className="text-[11px] text-el-on-surface-variant font-bold">الأصوات الصحيحة</div>
                  <div className="text-[20px] font-mono font-bold text-el-primary">{showDetailsDialog.validVotes.toLocaleString()}</div>
                </div>
                <div className="bg-el-surface-container-high border border-el-outline-variant rounded-xl p-3">
                  <div className="text-[11px] text-el-on-surface-variant font-bold">الأصوات الباطلة</div>
                  <div className="text-[20px] font-mono font-bold text-red-600">{showDetailsDialog.invalidVotes.toLocaleString()}</div>
                </div>
                <div className="bg-el-surface-container-high border border-el-outline-variant rounded-xl p-3">
                  <div className="text-[11px] text-el-on-surface-variant font-bold">مقاعدنا المحققة</div>
                  <div className="text-[20px] font-mono font-bold text-green-600">{showDetailsDialog.seatsWon} / {showDetailsDialog.totalSeats}</div>
                </div>
              </div>

              {/* Candidates List with Saint-Laguë details */}
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-el-primary flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> توزيع المقاعد والأصوات بالتفصيل (Saint-Laguë)
                </h3>

                <div className="overflow-x-auto border border-el-outline-variant rounded-xl bg-el-surface-container-lowest">
                  <table className="w-full text-right text-[13px]">
                    <thead>
                      <tr className="bg-el-surface-container-high border-b border-el-outline-variant">
                        <th className="p-3 font-bold">الاسم (المرشح / القائمة)</th>
                        <th className="p-3 font-bold">الحزب/التحالف</th>
                        <th className="p-3 font-bold">الأصوات</th>
                        <th className="p-3 font-bold">النسبة من الأصوات الصحيحة</th>
                        <th className="p-3 font-bold">النسبة من إجمالي الحضور</th>
                        <th className="p-3 font-bold text-center">المقاعد المخصصة</th>
                        <th className="p-3 font-bold text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showDetailsDialog.candidates.map((c) => (
                        <tr key={c.id} className="border-b border-el-outline-variant last:border-0 hover:bg-el-surface-container-highest/20 transition-all">
                          <td className="p-3 font-bold flex items-center gap-1.5">
                            {c.isOurCandidate && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                            {c.candidateName}
                          </td>
                          <td className="p-3">{c.partyName || '—'}</td>
                          <td className="p-3 font-mono font-bold">{c.votes.toLocaleString()}</td>
                          <td className="p-3 font-mono text-el-primary font-semibold flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" />
                            {c.votePercentage}%
                          </td>
                          <td className="p-3 font-mono text-el-on-surface-variant">{c.votePercentageOfTurnout}%</td>
                          <td className="p-3 text-center">
                            {c.seatsAllocated > 0 ? (
                              <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-[12px] inline-flex items-center gap-1 shadow-sm">
                                <Landmark className="w-3.5 h-3.5 text-yellow-600" />
                                {c.seatsAllocated} مقاعد
                              </span>
                            ) : (
                              <span className="text-el-on-surface-variant/40">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {c.isOurCandidate ? (
                              <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                                مرشحنا
                              </span>
                            ) : (
                              <span className="text-el-on-surface-variant/50">منافس</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {showDetailsDialog.notes && (
                <div className="bg-el-surface-container-high p-4 rounded-xl border border-el-outline-variant flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-el-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-el-on-surface">ملاحظات مسجلة</h4>
                    <p className="text-[12px] text-el-on-surface-variant mt-1 leading-relaxed">
                      {showDetailsDialog.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-el-outline-variant bg-el-surface-container-high flex justify-end">
              <button
                onClick={() => setShowDetailsDialog(null)}
                className="bg-el-primary text-el-on-primary px-6 py-2.5 rounded-lg text-[14px] font-bold hover:opacity-90 cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
