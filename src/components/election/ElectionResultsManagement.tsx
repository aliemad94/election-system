'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, Plus, X, Trash2, Trophy, Percent, Users, Award, MapPin, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';

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
  votePercentage: number; // نسبة فوز المرشح
  notes: string;          // ترتيب المرشح
  isOurCandidate: boolean;
}

interface CandidateRecord {
  id: string;
  candidateName: string;
  partyName: string | null;
  votes: number;
  votePercentage: number;
  votePercentageOfTurnout: number;
  seatsAllocated: number;
  isOurCandidate: boolean;
  notes: string | null;
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
  notes: string | null;
  candidates: CandidateRecord[];
}

interface PartyGroup {
  partyName: string;
  partyCode: string;
  totalVotes: number;
  votePercentage: number;
  seatsAllocated: number;
  candidates: CandidateRecord[];
}

export default function ElectionResultsManagement() {
  const [results, setResults] = useState<ElectionResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState<ElectionResultRecord | null>(null);
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  // Form State
  const [year, setYear] = useState(new Date().getFullYear());
  const [scope, setScope] = useState('محافظة');
  const [district, setDistrict] = useState('');
  const [electionType, setElectionType] = useState('برلمانية');
  const [totalRegistered, setTotalRegistered] = useState('');
  const [totalVotes, setTotalVotes] = useState('');
  const [invalidVotes, setInvalidVotes] = useState('');
  const [totalSeats, setTotalSeats] = useState('19');
  const [status, setStatus] = useState('مصادق');
  const [notes, setNotes] = useState('');
  const [candidates, setCandidates] = useState<CandidateInput[]>([]);

  // Candidate/Party Add Row State
  const [cPartyName, setCPartyName] = useState('');
  const [cName, setCName] = useState('');
  const [cOrder, setCOrder] = useState('');
  const [cWinPct, setCWinPct] = useState('');
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
    if (!cPartyName || !cName || !cVotes) {
      alert('يرجى ملء اسم القائمة، اسم المرشح، وعدد الأصوات.');
      return;
    }
    setCandidates([
      ...candidates,
      {
        candidateName: cName,
        partyName: cPartyName,
        votes: Number(cVotes) || 0,
        votePercentage: Number(cWinPct) || 0,
        notes: cOrder ? `الترتيب: ${cOrder}` : '',
        isOurCandidate: cIsOur,
      },
    ]);
    // تصفير الخانات مع الإبقاء على اسم القائمة لتسهيل الإدخال المتكرر لنفس الحزب
    setCName('');
    setCOrder('');
    setCWinPct('');
    setCVotes('');
    setCIsOur(false);
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!year || !scope || !electionType || candidates.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة مرشح/قائمة واحدة على الأقل.');
      return;
    }
    if (scope === 'قضاء' && !district) {
      alert('يرجى تحديد القضاء.');
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
        setTotalSeats('19');
        setStatus('مصادق');
        setNotes('');
        setCandidates([]);
        fetchResults();
      } else {
        const errData = await res.json();
        alert(errData.error || 'حدث خطأ أثناء حفظ النتائج.');
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

  const getPartyGroups = (candidates: CandidateRecord[], totalValidVotes: number): PartyGroup[] => {
    const groups: Record<string, CandidateRecord[]> = {};
    candidates.forEach((c) => {
      const pName = c.partyName || 'مستقلون / أخرى';
      if (!groups[pName]) groups[pName] = [];
      groups[pName].push(c);
    });

    const partyList = Object.keys(groups).map((pName) => {
      const partyCandidates = groups[pName];
      const totalVotes = partyCandidates.reduce((s, c) => s + c.votes, 0);
      const seatsAllocated = partyCandidates.reduce((s, c) => s + c.seatsAllocated, 0);
      const votePercentage = totalValidVotes > 0 ? (totalVotes / totalValidVotes) * 100 : 0;

      const match = pName.match(/^(.*?)(?:\s*\((\d+)\))?$/);
      const name = match ? match[1].trim() : pName;
      const code = match && match[2] ? match[2] : '—';

      // ترتيب مرشحي الحزب
      const sortedCandidates = [...partyCandidates].sort((a, b) => b.votes - a.votes);

      return {
        partyName: name,
        partyCode: code,
        totalVotes,
        votePercentage: Math.round(votePercentage * 100) / 100,
        seatsAllocated,
        candidates: sortedCandidates,
      };
    });

    return partyList.sort((a, b) => b.totalVotes - a.totalVotes);
  };

  const togglePartyExpand = (partyName: string) => {
    setExpandedParty(expandedParty === partyName ? null : partyName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Landmark className="w-6 h-6 animate-pulse text-el-primary" />
        <span className="text-el-on-surface-variant">جاري تحميل لوحة النتائج الرسمية...</span>
      </div>
    );
  }

  const result2025 = results.find((r) => r.year === 2025) || results[0];

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-el-outline-variant pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-el-primary flex items-center gap-2">
            <Landmark className="w-7 h-7" /> النتائج الرسمية للانتخابات
          </h1>
          <p className="text-[12px] text-el-on-surface-variant mt-1">
            عرض وتوثيق وتحليل نتائج الانتخابات الرسمية والمقاعد ونسب فوز المرشحين
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm font-bold text-[14px] cursor-pointer"
        >
          <Plus className="w-[18px] h-[18px]" /> إضافة نتائج وقضاء جديد
        </button>
      </div>

      {result2025 && (
        <div className="bg-el-surface-container-high/20 p-2.5 rounded-xl border border-el-outline-variant flex justify-between items-center px-4">
          <span className="font-bold text-[14px] text-el-primary">عرض نتائج سنة: {result2025.year} ({result2025.electionType})</span>
          <div className="flex gap-2">
            {results.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  // عرض النتيجة المحددة
                  const found = results.find(x => x.id === r.id);
                  if (found) {
                    // Update state to render this result
                    setResults([found, ...results.filter(x => x.id !== r.id)]);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold border transition-all ${
                  r.id === result2025.id ? 'bg-el-primary text-el-on-primary border-el-primary' : 'bg-white text-el-on-surface border-el-outline-variant'
                }`}
              >
                {r.year} - {r.scope === 'قضاء' ? `قضاء ${r.district}` : 'المحافظة'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Results View */}
      {result2025 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* General Statistics */}
          <div className="lg:col-span-4 bg-el-surface-container-lowest border border-el-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-el-outline-variant pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-el-primary" />
                <h2 className="text-[16px] font-bold text-el-on-surface">الإحصائيات العامة</h2>
              </div>
              <button
                onClick={() => handleDelete(result2025.id)}
                className="text-red-600 hover:text-red-800 text-[12px] font-bold border border-red-200 bg-red-50 px-2 py-0.5 rounded-lg"
              >
                حذف هذا السجل
              </button>
            </div>

            <div className="space-y-3">
              {result2025.year === 2025 ? (
                <>
                  <StatRow label="عدد مراكز الاقتراع الكلية" value="527" />
                  <StatRow label="عدد محطات الاقتراع الكلية" value="2,212" />
                  <StatRow label="عدد الناخبين الكلي" value="1,099,438" />
                  <StatRow label="عدد المصوتين الكلي" value="538,390" />
                  <StatRow label="نسبة التصويت الكلية" value="48.97%" isHighlight />
                  <StatRow label="عدد المصوتين الذكور" value="322,970" />
                  <StatRow label="عدد المصوتين الإناث" value="215,420" />
                  <StatRow label="عدد الأصوات الصحيحة" value="513,087" />
                  <StatRow label="عدد الأصوات الباطلة" value="25,303" />
                  <StatRow label="عدد المقاعد الكلي" value="19" />
                  <StatRow label="عدد المقاعد العامة" value="19" />
                  <StatRow label="عدد مقاعد الكوتا" value="0" />
                  <StatRow label="عدد مقاعد النساء" value="5" />
                  <StatRow label="مجموع المقاعد الموزّعة" value="19" isHighlight />
                </>
              ) : (
                <>
                  <StatRow label="النطاق الجغرافي" value={result2025.scope === 'قضاء' ? `قضاء ${result2025.district}` : 'المحافظة'} />
                  <StatRow label="عدد الناخبين الكلي" value={result2025.totalRegistered.toLocaleString()} />
                  <StatRow label="عدد المصوتين الكلي" value={result2025.totalVotes.toLocaleString()} />
                  <StatRow label="نسبة التصويت الكلية" value={`${result2025.participationRate}%`} isHighlight />
                  <StatRow label="عدد الأصوات الصحيحة" value={result2025.validVotes.toLocaleString()} />
                  <StatRow label="عدد الأصوات الباطلة" value={result2025.invalidVotes.toLocaleString()} />
                  <StatRow label="عدد المقاعد الكلي" value={result2025.totalSeats.toString()} />
                  <StatRow label="مجموع المقاعد الموزّعة" value={result2025.totalSeats.toString()} isHighlight />
                </>
              )}
            </div>

            {result2025.notes && (
              <div className="mt-5 pt-4 border-t border-el-outline-variant flex items-start gap-2 text-[11px] text-el-on-surface-variant bg-el-surface-container-high/25 p-3 rounded-xl">
                <Info className="w-4 h-4 text-el-primary shrink-0 mt-0.5" />
                <span>{result2025.notes}</span>
              </div>
            )}
          </div>

          {/* Winning Entities & Candidate list */}
          <div className="lg:col-span-8 bg-el-surface-container-lowest border border-el-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-el-outline-variant pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-el-primary" />
                <h2 className="text-[16px] font-bold text-el-on-surface">الكيانات الفائزة والأصوات</h2>
              </div>
            </div>

            <div className="overflow-hidden border border-el-outline-variant rounded-xl bg-el-surface-container-lowest">
              <table className="w-full text-right text-[13px] border-collapse">
                <thead>
                  <tr className="bg-el-surface-container-high border-b border-el-outline-variant text-el-on-surface">
                    <th className="p-3 font-bold w-12 text-center">ت</th>
                    <th className="p-3 font-bold w-20 text-center">رقم الكيان</th>
                    <th className="p-3 font-bold">اسم الكيان</th>
                    <th className="p-3 font-bold text-center">مجموع الأصوات</th>
                    <th className="p-3 font-bold text-center">نسبة الأصوات</th>
                    <th className="p-3 font-bold text-center">عدد المقاعد</th>
                    <th className="p-3 font-bold w-16 text-center">تفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {getPartyGroups(result2025.candidates, result2025.validVotes).map((p, idx) => {
                    const isExpanded = expandedParty === p.partyName;
                    return (
                      <React.Fragment key={p.partyName}>
                        <tr 
                          onClick={() => togglePartyExpand(p.partyName)}
                          className={`border-b border-el-outline-variant cursor-pointer hover:bg-el-surface-container-highest/20 transition-all ${
                            isExpanded ? 'bg-el-primary/5' : ''
                          }`}
                        >
                          <td className="p-3 text-center font-bold text-el-on-surface-variant">{idx + 1}</td>
                          <td className="p-3 text-center font-mono font-bold text-el-primary">{p.partyCode}</td>
                          <td className="p-3 font-bold text-el-on-surface flex items-center gap-2">
                            {p.partyName}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{p.totalVotes.toLocaleString()}</td>
                          <td className="p-3 text-center font-mono text-el-on-surface-variant">{p.votePercentage}%</td>
                          <td className="p-3 text-center">
                            <span className="bg-yellow-100 text-yellow-800 font-bold px-2.5 py-0.5 rounded-full text-[12px] inline-flex items-center gap-1 shadow-sm font-mono">
                              {p.seatsAllocated}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 mx-auto text-el-on-surface-variant" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mx-auto text-el-on-surface-variant" />
                            )}
                          </td>
                        </tr>

                        {/* Nested Candidate Votes list (أصوات المرشحين التفصيلية) */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-3 bg-el-surface-container-high/30 border-b border-el-outline-variant">
                              <div className="px-4 py-2 space-y-2">
                                <div className="text-[12px] font-bold text-el-primary flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  ترتيب وأصوات المرشحين داخل القائمة
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {p.candidates.map((c, cIdx) => (
                                    <div key={c.id} className="bg-white border border-el-outline-variant rounded-lg p-2.5 flex justify-between items-center shadow-xs">
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-[13px]">{c.candidateName}</span>
                                          {c.isOurCandidate && (
                                            <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">مرشحنا</span>
                                          )}
                                        </div>
                                        {/* الترتيب ونسبة الفوز */}
                                        <div className="flex gap-2 text-[10px] text-el-on-surface-variant/80">
                                          <span>{c.notes || `الترتيب: ${cIdx + 1}`}</span>
                                          <span>•</span>
                                          <span className="flex items-center text-el-primary font-bold">
                                            نسبة فوز المرشح: {c.votePercentage}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-[12px] font-bold text-el-on-surface">
                                          {c.votes.toLocaleString()} صوت
                                        </span>
                                        {c.seatsAllocated > 0 && (
                                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                            <Trophy className="w-3 h-3 text-yellow-600" /> فائز
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Adding New Result with exact requested fields */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-el-outline-variant flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-el-primary flex items-center gap-2">
                <Landmark className="w-5 h-5" /> إضافة قضاء ونتائج جديدة
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
                    <option value="قضاء">قضاء محدد</option>
                    <option value="محافظة">محافظة كاملة</option>
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
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">إجمالي المصوتين</label>
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
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">عدد المقاعد المتاحة</label>
                  <input
                    type="number"
                    placeholder="مثال: 19"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">حالة النتائج</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                  >
                    <option value="مصادق">مصادق عليها</option>
                    <option value="أولية">أولية</option>
                    <option value="نهائية">نهائية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-el-on-surface mb-1">ملاحظات</label>
                <input
                  type="text"
                  placeholder="ملاحظات إضافية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary"
                />
              </div>

              {/* Candidates Add Form Container */}
              <div className="bg-el-surface-container-high rounded-xl p-4 border border-el-outline-variant space-y-3">
                <h3 className="text-[13px] font-bold text-el-primary flex items-center gap-1.5 border-b border-el-outline-variant/30 pb-2">
                  <Users className="w-4 h-4" />
                  إدخال أصوات وترتيب ونسب فوز المرشحين
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface mb-0.5">اسم القائمة</label>
                    <input
                      type="text"
                      placeholder="اسم الكيان/القائمة"
                      value={cPartyName}
                      onChange={(e) => setCPartyName(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[12px] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface mb-0.5">اسم المرشح</label>
                    <input
                      type="text"
                      placeholder="اسم المرشح الكامل"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[12px] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface mb-0.5">ترتيب المرشح</label>
                    <input
                      type="number"
                      placeholder="مثال: 1"
                      value={cOrder}
                      onChange={(e) => setCOrder(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[12px] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface mb-0.5">نسبة فوز المرشح (%)</label>
                    <input
                      type="number"
                      placeholder="مثال: 85"
                      value={cWinPct}
                      onChange={(e) => setCWinPct(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[12px] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface mb-0.5">عدد الأصوات للمرشح</label>
                    <input
                      type="number"
                      placeholder="الأصوات"
                      value={cVotes}
                      onChange={(e) => setCVotes(e.target.value)}
                      className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2 text-[12px] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-el-on-surface">
                    <input
                      type="checkbox"
                      checked={cIsOur}
                      onChange={(e) => setCIsOur(e.target.checked)}
                      className="w-4 h-4 accent-el-primary rounded"
                    />
                    هل هو مرشحنا؟
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    className="bg-el-primary text-el-on-primary px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة مرشح للقائمة
                  </button>
                </div>

                {/* Added Candidates List */}
                {candidates.length > 0 && (
                  <div className="overflow-x-auto border border-el-outline-variant rounded-lg bg-el-surface-container-lowest max-h-48 overflow-y-auto">
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="bg-el-surface-container-high border-b border-el-outline-variant">
                          <th className="p-2 font-bold">اسم القائمة</th>
                          <th className="p-2 font-bold">اسم المرشح</th>
                          <th className="p-2 font-bold text-center">الترتيب</th>
                          <th className="p-2 font-bold text-center">نسبة الفوز</th>
                          <th className="p-2 font-bold text-center">الأصوات</th>
                          <th className="p-2 font-bold text-center">النوع</th>
                          <th className="p-2 font-bold text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((c, idx) => (
                          <tr key={idx} className="border-b border-el-outline-variant last:border-0">
                            <td className="p-2 font-bold">{c.partyName}</td>
                            <td className="p-2">{c.candidateName}</td>
                            <td className="p-2 text-center font-mono">{c.notes.replace('الترتيب: ', '') || '—'}</td>
                            <td className="p-2 text-center font-mono">{c.votePercentage}%</td>
                            <td className="p-2 text-center font-mono font-bold">{c.votes.toLocaleString()}</td>
                            <td className="p-2 text-center">
                              {c.isOurCandidate ? (
                                <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">مرشحنا</span>
                              ) : (
                                <span className="text-el-on-surface-variant opacity-50">منافس</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCandidate(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
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
                حفظ النتائج وتوزيع المقاعد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  isHighlight?: boolean;
}

function StatRow({ label, value, isHighlight = false }: StatRowProps) {
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg border-b border-el-outline-variant/30 last:border-0 ${
      isHighlight ? 'bg-el-primary/5 font-bold text-el-primary border-el-primary/20' : 'text-el-on-surface'
    }`}>
      <span className="text-[13px]">{label}:</span>
      <span className="font-mono font-bold text-[14px]">{value}</span>
    </div>
  );
}
