'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, FileText, ChevronDown, ChevronUp, Trophy, Percent, Users, Award, MapPin, Layers, Info } from 'lucide-react';

interface CandidateRecord {
  id: string;
  candidateName: string;
  partyName: string | null;
  votes: number;
  votePercentage: number;
  votePercentageOfTurnout: number;
  seatsAllocated: number;
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
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

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

  // دالة تجميع المرشحين حسب الأحزاب وقراءة كود الكيان
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

      // استخراج كود الكيان من بين القوسين إن وجد (مثل: ائتلاف الاعمار والتنمية (207))
      const match = pName.match(/^(.*?)(?:\s*\((\d+)\))?$/);
      const name = match ? match[1].trim() : pName;
      const code = match && match[2] ? match[2] : '—';

      // ترتيب مرشحي الحزب تنازلياً حسب أصواتهم (أصوات المرشح)
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

    // ترتيب الأحزاب تنازلياً حسب إجمالي الأصوات
    return partyList.sort((a, b) => b.totalVotes - a.totalVotes);
  };

  const togglePartyExpand = (partyKey: string) => {
    setExpandedParty(expandedParty === partyKey ? null : partyKey);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Landmark className="w-6 h-6 animate-pulse text-el-primary" />
        <span className="text-el-on-surface-variant">جاري تحميل لوحة النتائج الرسمية...</span>
      </div>
    );
  }

  // نأخذ نتيجة 2025 كنسخة عرض افتراضية رئيسية
  const result2025 = results.find((r) => r.year === 2025) || results[0];

  if (!result2025) {
    return (
      <div className="bg-el-surface-container border border-el-outline-variant rounded-xl p-8 text-center flex flex-col items-center gap-3">
        <Landmark className="w-12 h-12 text-el-on-surface-variant/40" />
        <p className="text-el-on-surface font-semibold font-bold">لا توجد نتائج انتخابات مسجلة</p>
      </div>
    );
  }

  const partyGroups = getPartyGroups(result2025.candidates, result2025.validVotes);
  const sumWinningVotes = partyGroups.reduce((s, p) => s + p.totalVotes, 0);
  const winPercentOfValid = result2025.validVotes > 0 
    ? Math.round((sumWinningVotes / result2025.validVotes) * 1000) / 10 
    : 0;

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full text-right" dir="rtl">
      {/* Page Title */}
      <div className="flex flex-col gap-1 border-b border-el-outline-variant pb-4">
        <h1 className="text-[26px] font-bold text-el-primary flex items-center gap-2.5">
          <Landmark className="w-7 h-7 text-el-primary" />
          النتائج النهائية لانتخاب مجلس النواب العراقي {result2025.year}
        </h1>
        <p className="text-[14px] text-el-on-surface-variant">
          توزيع الفائزين والأصوات والمقاعد — محافظة ذي قار
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: General Statistics (14 Rows exactly) */}
        <div className="lg:col-span-4 bg-el-surface-container-lowest border border-el-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-el-outline-variant pb-3 mb-4">
            <FileText className="w-5 h-5 text-el-primary" />
            <h2 className="text-[16px] font-bold text-el-on-surface">الإحصائيات العامة</h2>
          </div>

          <div className="space-y-3">
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
          </div>

          <div className="mt-5 pt-4 border-t border-el-outline-variant flex items-start gap-2 text-[11px] text-el-on-surface-variant bg-el-surface-container-high/25 p-3 rounded-xl">
            <Info className="w-4 h-4 text-el-primary shrink-0 mt-0.5" />
            <span>
              <strong>المصدر:</strong> المفوضية العليا المستقلة للانتخابات — النتائج النهائية 2025. تم توزيع المقاعد باستخدام طريقة Saint-Laguë بقاسم أول 1.7.
            </span>
          </div>
        </div>

        {/* Right Column: Winning Entities Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-el-outline-variant pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-el-primary" />
                <h2 className="text-[16px] font-bold text-el-on-surface">الكيانات الفائزة والأصوات</h2>
              </div>
              <span className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">
                توزيع مقاعد Saint-Laguë (1.7)
              </span>
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
                  {partyGroups.map((p, idx) => {
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
                            {p.candidates.some(c => c.isOurCandidate) && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">تحالفنا</span>
                            )}
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

                        {/* Nested Candidate Votes list (عدد أصوات المرشح) */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-3 bg-el-surface-container-high/30 border-b border-el-outline-variant">
                              <div className="px-4 py-2 space-y-2">
                                <div className="text-[12px] font-bold text-el-primary flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  تفاصيل أصوات المرشحين داخل {p.partyName}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {p.candidates.map((c, cIdx) => (
                                    <div key={c.id} className="bg-white border border-el-outline-variant rounded-lg p-2.5 flex justify-between items-center shadow-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-el-on-surface-variant">مرشح {cIdx + 1}:</span>
                                        <span className="font-bold text-[13px]">{c.candidateName}</span>
                                        {c.isOurCandidate && (
                                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-[12px] text-el-on-surface-variant">
                                          {c.votes.toLocaleString()} صوت
                                        </span>
                                        {c.seatsAllocated > 0 ? (
                                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                            <Trophy className="w-3 h-3 text-yellow-600" /> فائز بمقعد
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-el-on-surface-variant/40">لم يفز</span>
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

            {/* Aggregates footer */}
            <div className="mt-4 p-4 bg-el-surface-container border border-el-outline-variant rounded-xl flex flex-col sm:flex-row justify-between gap-3 text-[13px]">
              <div className="font-bold text-el-on-surface">
                مجموع المقاعد الموزّعة: <span className="font-mono text-el-primary font-bold text-[15px]">19 مقعداً</span>
              </div>
              <div className="font-bold text-el-on-surface">
                مجموع أصوات الكيانات الفائزة: <span className="font-mono font-bold">{sumWinningVotes.toLocaleString()} صوت</span>
                <span className="text-el-on-surface-variant/70 font-normal mr-1">({winPercentOfValid}% من الأصوات الصحيحة)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون لسطر إحصائيات عامة
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
