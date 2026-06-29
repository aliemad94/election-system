'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, Plus, X, Trash2, Trophy, Percent, Users, Award, MapPin, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

const DISTRICTS_21 = [
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
  'الفضلية',
  'العكيكة',
  'الطار',
  'كرمة بني سعيد',
  'أور',
  'المنار',
  'الحمار'
];

interface CandidateInput {
  candidateName: string;
  partyName: string;
  votes: number;
  votePercentage: number; // نسبة فوز المرشح
  notes: string;          // ترتيب المرشح
  isOurCandidate: boolean;
  gender: string;         // الجنس (ذكر / أنثى)
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
  gender: string;
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

const OFFICIAL_2025_DATA = {
  year: 2025,
  electionType: "مجلس النواب العراقي",
  scope: "محافظة ذي قار",
  totalRegistered: 1099438,
  totalVotes: 538390,
  validVotes: 513087,
  invalidVotes: 25303,
  participationRate: 48.97,
  totalSeats: 19,
  femaleSeats: 5,
  winnerName: "ائتلاف الاعمار والتنمية",
  winnerVotes: 80892,
  partyGroups: [
    {
      partyName: "ائتلاف الاعمار والتنمية",
      partyCode: "207",
      totalVotes: 80892,
      votePercentage: 15.76,
      seatsAllocated: 3,
      isOurParty: true,
      candidates: [
        { candidateName: "ناصر تركي ياسر لفته ال عواد", votes: 7474, votePercentage: 1.46, seatsAllocated: 1, notes: "مرشح فائز - رقم 5", gender: "ذكر", isOurCandidate: true },
        { candidateName: "باقر يوسف خلف علي الياسري", votes: 7406, votePercentage: 1.44, seatsAllocated: 1, notes: "مرشح فائز - رقم 3", gender: "ذكر", isOurCandidate: true },
        { candidateName: "زينب وحيد سلمان علي الخزرجي", votes: 2588, votePercentage: 0.5, seatsAllocated: 1, notes: "مرشح فائز - رقم 4", gender: "أنثى", isOurCandidate: true },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 63424, votePercentage: 12.36, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—", isOurCandidate: true }
      ]
    },
    {
      partyName: "ائتلاف دولة القانون",
      partyCode: "257",
      totalVotes: 74563,
      votePercentage: 14.53,
      seatsAllocated: 3,
      candidates: [
        { candidateName: "حسن وريوش دخيل محمد جويس الاسدي", votes: 16213, votePercentage: 3.16, seatsAllocated: 1, notes: "مرشح فائز - رقم 3", gender: "ذكر" },
        { candidateName: "حسين نعمة دخيل كاظم البطاط", votes: 9783, votePercentage: 1.91, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "ذكر" },
        { candidateName: "منى قاسم باقر جابر الفراجي", votes: 4957, votePercentage: 0.97, seatsAllocated: 1, notes: "مرشح فائز - رقم 9", gender: "أنثى" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 43610, votePercentage: 8.5, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "حركة الصادقون",
      partyCode: "202",
      totalVotes: 61696,
      votePercentage: 12.02,
      seatsAllocated: 3,
      candidates: [
        { candidateName: "احمد كاظم فارس محسن الرميض", votes: 7545, votePercentage: 1.47, seatsAllocated: 1, notes: "مرشح فائز - رقم 7", gender: "ذكر" },
        { candidateName: "عادل حاشوش جابر جاسم الحاتمي", votes: 7269, votePercentage: 1.42, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "ذكر" },
        { candidateName: "وفاء ضياء لازم عليوي الطائي", votes: 2908, votePercentage: 0.57, seatsAllocated: 1, notes: "مرشح فائز - رقم 8", gender: "أنثى" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 43974, votePercentage: 8.57, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "تحالف قوى الدولة الوطنية",
      partyCode: "231",
      totalVotes: 46607,
      votePercentage: 9.08,
      seatsAllocated: 2,
      candidates: [
        { candidateName: "قسطل ابوطالب ظاهر حاتم ال عجيل", votes: 6468, votePercentage: 1.26, seatsAllocated: 1, notes: "مرشح فائز - رقم 3", gender: "ذكر" },
        { candidateName: "مرتضى عبد خزعل ظاهر ال ابراهيمي", votes: 6306, votePercentage: 1.23, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 33833, votePercentage: 6.59, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "منظمة بدر",
      partyCode: "218",
      totalVotes: 44421,
      votePercentage: 8.66,
      seatsAllocated: 2,
      candidates: [
        { candidateName: "رزاق محيسن عجيمي تويلي الرماحي", votes: 9364, votePercentage: 1.83, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "ذكر" },
        { candidateName: "عبدالله حامد حسين شبيب الحميدي", votes: 3788, votePercentage: 0.74, seatsAllocated: 1, notes: "مرشح فائز - رقم 2", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 31269, votePercentage: 6.09, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "حركة سومريون",
      partyCode: "239",
      totalVotes: 36611,
      votePercentage: 7.14,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "هديه جاسم عليوي لفته الجميعان", votes: 5884, votePercentage: 1.15, seatsAllocated: 1, notes: "مرشح فائز - رقم 38", gender: "أنثى" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 30727, votePercentage: 5.99, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "تحالف خدمات",
      partyCode: "271",
      totalVotes: 31171,
      votePercentage: 6.08,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "علا عوده لايذ شناوه الشناوه", votes: 11484, votePercentage: 2.24, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "أنثى" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 19687, votePercentage: 3.84, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "ابشر يا عراق",
      partyCode: "224",
      totalVotes: 23214,
      votePercentage: 4.52,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "علي صابر كاظم عجيل الكناني", votes: 3732, votePercentage: 0.73, seatsAllocated: 1, notes: "مرشح فائز - رقم 4", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 19482, votePercentage: 3.8, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "اشراقة كانون",
      partyCode: "245",
      totalVotes: 22521,
      votePercentage: 4.39,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "فاروق عدنان يوسف يعقوب الهاشم", votes: 6471, votePercentage: 1.26, seatsAllocated: 1, notes: "مرشح فائز - رقم 9", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 16050, votePercentage: 3.13, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "كتلة دعم الدولة",
      partyCode: "289",
      totalVotes: 21615,
      votePercentage: 4.21,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "عماد قاسم عزيز عبد علي", votes: 3226, votePercentage: 0.63, seatsAllocated: 1, notes: "مرشح فائز - رقم 5", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 18389, votePercentage: 3.58, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    },
    {
      partyName: "حركة حقوق",
      partyCode: "251",
      totalVotes: 21184,
      votePercentage: 4.13,
      seatsAllocated: 1,
      candidates: [
        { candidateName: "محمد جبار مناتي مشيعل ال سلطان", votes: 6267, votePercentage: 1.22, seatsAllocated: 1, notes: "مرشح فائز - رقم 1", gender: "ذكر" },
        { candidateName: "أصوات بقية مرشحي القائمة", votes: 14917, votePercentage: 2.91, seatsAllocated: 0, notes: "أصوات بقية مرشحي القائمة غير الفائزين", gender: "—" }
      ]
    }
  ]
};

export default function ElectionResultsManagement() {
  const [results, setResults] = useState<ElectionResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState<ElectionResultRecord | null>(null);
  const [expandedParty, setExpandedParty] = useState<string | null>(null);
  const [activeResultsTab, setActiveResultsTab] = useState<'official' | 'dynamic'>('official');
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  // Form State
  const [year, setYear] = useState(new Date().getFullYear());
  const [district, setDistrict] = useState('');
  const [electionType, setElectionType] = useState('مجالس محافظات');
  const [totalRegistered, setTotalRegistered] = useState('');
  const [totalVotes, setTotalVotes] = useState('');
  const [notes, setNotes] = useState('');
  const [commissionRecords, setCommissionRecords] = useState<any[]>([]);

  // Party entry form fields
  const [cPartyName, setCPartyName] = useState('');
  const [cVotes, setCVotes] = useState('');

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

  const fetchCommissionRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/commission');
      const data = await res.json();
      if (data.list && Array.isArray(data.list)) {
        setCommissionRecords(data.list);
      }
    } catch (err) {
      console.error('Error fetching commission records:', err);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    fetchCommissionRecords();
  }, [fetchResults, fetchCommissionRecords]);

  const handleDistrictChange = (selectedDist: string) => {
    setDistrict(selectedDist);
    const match = commissionRecords.find(r => r.district === selectedDist);
    if (match) {
      // Auto-fill total votes with actualVoters from commissionData
      setTotalVotes(match.actualVoters.toString());
      setTotalRegistered(match.registeredVoters.toString());
    } else {
      setTotalVotes('');
      setTotalRegistered('');
    }
  };

  const handleSave = async () => {
    if (!year || !district || !cPartyName || !totalVotes || !cVotes) {
      alert('يرجى ملء جميع الحقول المطلوبة (السنة، القضاء، اسم الحزب، الأصوات الكلية للقضاء، وأصوات الحزب).');
      return;
    }

    const partyVotesNum = Number(cVotes) || 0;
    const totalVotesNum = Number(totalVotes) || 0;

    if (partyVotesNum > totalVotesNum) {
      alert('خطأ: عدد أصوات الحزب لا يمكن أن يكون أكبر من إجمالي أصوات القضاء.');
      return;
    }

    const calculatedPct = totalVotesNum > 0 ? (partyVotesNum / totalVotesNum) * 100 : 0;

    const payload = {
      year: Number(year),
      district,
      scope: 'قضاء',
      electionType,
      totalRegistered: Number(totalRegistered) || totalVotesNum,
      totalVotes: totalVotesNum,
      invalidVotes: 0,
      totalSeats: 1,
      status: 'مصادق',
      notes: notes || `نتائج القائمة في قضاء ${district}`,
      candidates: [
        {
          candidateName: cPartyName,
          partyName: cPartyName,
          votes: partyVotesNum,
          votePercentage: Math.round(calculatedPct * 100) / 100,
          isOurCandidate: cPartyName.includes("الاعمار والتنمية"),
          gender: 'ذكر',
          notes: 'مرشح الدائرة'
        }
      ],
    };

    try {
      const res = await fetch('/api/election-results/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedData = await res.json();
        setShowDialog(false);
        // Reset form
        setDistrict('');
        setCPartyName('');
        setCVotes('');
        setTotalVotes('');
        setTotalRegistered('');
        setNotes('');
        
        if (savedData.result?.id) {
          setSelectedResultId(savedData.result.id);
        }
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

  const result2025 = results.find((r) => r.id === selectedResultId) || results.find((r) => r.year === 2025) || results[0];

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-el-outline-variant pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-el-primary flex items-center gap-2">
            <Landmark className="w-7 h-7 animate-bounce text-amber-500" style={{ animationDuration: '3s' }} /> لوحة النتائج المعتمدة للانتخابات
          </h1>
          <p className="text-[12px] text-el-on-surface-variant mt-1">
            عرض وتوثيق النتائج الانتخابية الرسمية وتوزيع مقاعد الكتل والأحزاب وفق سانت ليغو
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-el-outline-variant gap-4 bg-el-surface-container-low/40 p-1 rounded-xl">
        <button
          onClick={() => {
            setActiveResultsTab('official');
            setExpandedParty(null);
          }}
          className={`pb-2.5 pt-2 px-4 rounded-lg font-bold text-[13px] transition-all flex items-center gap-1.5 cursor-pointer ${
            activeResultsTab === 'official'
              ? 'bg-el-primary text-el-on-primary shadow-sm'
              : 'text-el-on-surface-variant/80 hover:bg-el-surface-container-high'
          }`}
        >
          🏆 لوحة النتائج الرسمية للانتخابات
        </button>
        <button
          onClick={() => {
            setActiveResultsTab('dynamic');
            setExpandedParty(null);
          }}
          className={`pb-2.5 pt-2 px-4 rounded-lg font-bold text-[13px] transition-all flex items-center gap-1.5 cursor-pointer ${
            activeResultsTab === 'dynamic'
              ? 'bg-el-primary text-el-on-primary shadow-sm'
              : 'text-el-on-surface-variant/80 hover:bg-el-surface-container-high'
          }`}
        >
          📂 إدارة السجلات والنتائج الإضافية
        </button>
      </div>

      {activeResultsTab === 'official' ? (
        <div className="flex flex-col gap-5">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-el-primary/95 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden border border-el-outline-variant/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-el-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
                  النتائج الرسمية المصادق عليها
                </span>
                <h2 className="text-[22px] font-black mt-2 flex items-center gap-2 text-white">
                  <Landmark className="w-6 h-6 text-amber-400 animate-pulse" />
                  لوحة النتائج الرسمية المعتمدة لانتخابات ذي قار
                </h2>
                <p className="text-[12px] text-slate-300 mt-1.5 leading-relaxed">
                  السجلات الرسمية المعتمدة وتوزيع المقاعد وفق قانون سانت ليغو المعدل 1.7 لانتخابات مجلس النواب العراقي ومجلس المحافظة. المصدر: المفوضية العليا المستقلة للانتخابات.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 text-slate-200">
                <span className="text-[11px] opacity-75 font-semibold">الدورة الانتخابية</span>
                <span className="text-[20px] font-black text-amber-400 font-mono">2025</span>
              </div>
            </div>
          </div>

          {/* General Statistics Cards (Official) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Stat 1: Participation Rate */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300">
                  <span className="text-[12px] font-bold">نسبة المشاركة الكلية</span>
                  <Percent className="w-4 h-4" />
                </div>
                <div className="text-[26px] font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                  {OFFICIAL_2025_DATA.participationRate}%
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${OFFICIAL_2025_DATA.participationRate}%` }} />
                </div>
              </div>
            </div>

            {/* Stat 2: Registered Voters */}
            <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between items-center text-sky-800 dark:text-sky-300">
                  <span className="text-[12px] font-bold">الناخبين المسجلين الكلي</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-[24px] font-black text-sky-600 dark:text-sky-400 mt-2 font-mono">
                  {OFFICIAL_2025_DATA.totalRegistered.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] text-sky-700/80 dark:text-sky-400/80">من يحق لهم التصويت في ذي قار</span>
            </div>

            {/* Stat 3: Valid Votes */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between items-center text-blue-800 dark:text-blue-300">
                  <span className="text-[12px] font-bold">الأصوات الصحيحة</span>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-[24px] font-black text-blue-600 dark:text-blue-400 mt-2 font-mono">
                  {OFFICIAL_2025_DATA.validVotes.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">المعتمدة في توزيع المقاعد</span>
            </div>

            {/* Stat 4: Invalid Votes */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between items-center text-amber-800 dark:text-amber-300">
                  <span className="text-[12px] font-bold">الأصوات الباطلة</span>
                  <X className="w-4 h-4" />
                </div>
                <div className="text-[24px] font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
                  {OFFICIAL_2025_DATA.invalidVotes.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">تساوي {((OFFICIAL_2025_DATA.invalidVotes / OFFICIAL_2025_DATA.totalVotes) * 100).toFixed(2)}% من الحضور</span>
            </div>

            {/* Stat 5: Total Seats */}
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between items-center text-purple-800 dark:text-purple-300">
                  <span className="text-[12px] font-bold">المقاعد النيابية الكلية</span>
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-[24px] font-black text-purple-600 dark:text-purple-400 mt-2 font-mono">
                  {OFFICIAL_2025_DATA.totalSeats} مقعداً
                </div>
              </div>
              <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80">منها {OFFICIAL_2025_DATA.femaleSeats} مقاعد مخصصة لـ كوتا النساء</span>
            </div>
          </div>

          {/* Coalitions & Candidates Table (Official Pinned) */}
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-el-outline-variant pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-el-primary" />
                <h2 className="text-[16px] font-bold text-el-on-surface">ترتيب القوائم والكيانات الفائزة بمقاعد ذي قار</h2>
              </div>
              <span className="text-[11px] text-el-on-surface-variant font-bold">انقر على أي قائمة لمشاهدة أسماء وأصوات مرشحيها الفائزين</span>
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
                  {OFFICIAL_2025_DATA.partyGroups.map((p, idx) => {
                    const isExpanded = expandedParty === p.partyName;
                    const isOurParty = p.isOurParty;
                    return (
                      <React.Fragment key={p.partyName}>
                        <tr 
                          onClick={() => togglePartyExpand(p.partyName)}
                          className={`border-b border-el-outline-variant cursor-pointer hover:bg-el-surface-container-highest/20 transition-all ${
                            isExpanded ? 'bg-el-primary/5' : ''
                          } ${isOurParty ? 'bg-amber-500/5 hover:bg-amber-500/10 border-r-4 border-r-amber-500' : ''}`}
                        >
                          <td className="p-3 text-center font-bold text-el-on-surface-variant">
                            {isOurParty ? '⭐' : idx + 1}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-el-primary">{p.partyCode}</td>
                          <td className="p-3 font-bold text-el-on-surface flex items-center gap-2">
                            <span>{p.partyName}</span>
                            {isOurParty && (
                              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-300 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500" /> الكتلة المعتمدة
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{p.totalVotes.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-el-on-surface-variant">{p.votePercentage}%</span>
                              <div className="w-20 bg-el-outline-variant/30 rounded-full h-1">
                                <div className={`h-1 rounded-full ${isOurParty ? 'bg-amber-50' : 'bg-el-primary'}`} style={{ width: `${p.votePercentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold px-3 py-1 rounded-full text-[12px] inline-flex items-center gap-1 shadow-sm font-mono ${
                              isOurParty ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {p.seatsAllocated} مقاعد
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

                        {/* Nested Candidate Votes list */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-3 bg-el-surface-container-high/30 border-b border-el-outline-variant animate-in slide-in-from-top-1 duration-200">
                              <div className="px-4 py-2 space-y-2">
                                <div className="text-[12px] font-bold text-el-primary flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  المرشحون الفائزون وأصواتهم داخل الكيان
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {p.candidates.map((c, cIdx) => (
                                    <div key={c.candidateName} className={`border rounded-lg p-2.5 flex justify-between items-center shadow-xs ${
                                      isOurParty ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/15' : 'bg-white border-el-outline-variant'
                                    }`}>
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-[13px]">{c.candidateName}</span>
                                          {(c as any).isOurCandidate && (
                                            <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">مرشحنا</span>
                                          )}
                                        </div>
                                        <div className="flex gap-2 text-[10px] text-el-on-surface-variant/80">
                                          <span>{c.notes || `الترتيب: ${cIdx + 1}`}</span>
                                          <span>•</span>
                                          <span>الجنس: {c.gender}</span>
                                          <span>•</span>
                                          <span className="flex items-center text-el-primary font-bold">
                                            النسبة من الأصوات: {c.votePercentage}%
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
      ) : (
        <div className="flex flex-col gap-5">
          {/* Dynamic Records View Header */}
          <div className="flex justify-between items-center bg-el-surface-container-low p-3 rounded-xl border border-el-outline-variant">
            <span className="font-bold text-[13px] text-el-primary">إدارة وتعديل نتائج الأقضية والنتائج الإضافية للمحافظة</span>
            <button
              onClick={() => setShowDialog(true)}
              className="bg-el-primary text-el-on-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm font-bold text-[12px] cursor-pointer"
            >
              <Plus className="w-4 h-4" /> إضافة نتائج وقضاء جديد
            </button>
          </div>

          {result2025 && (
            <div className="bg-el-surface-container-high/20 p-2.5 rounded-xl border border-el-outline-variant flex justify-between items-center px-4">
              <span className="font-bold text-[13px] text-el-primary">عرض نتائج سنة: {result2025.year} ({result2025.electionType})</span>
              <div className="flex gap-2">
                {results.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedResultId(r.id);
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

          {result2025 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* General Statistics (Dynamic) */}
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

              {/* Winning Entities & Candidate list (Dynamic) */}
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
                        <th className="p-3 font-bold">اسم الكيان</th>
                        <th className="p-3 font-bold text-center">مجموع الأصوات</th>
                        <th className="p-3 font-bold text-center">نسبة الأصوات</th>
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
                              <td className="p-3 font-bold text-el-on-surface flex items-center gap-2">
                                {p.partyName}
                              </td>
                              <td className="p-3 text-center font-mono font-bold">{p.totalVotes.toLocaleString()}</td>
                              <td className="p-3 text-center font-mono text-el-on-surface-variant">{p.votePercentage}%</td>
                              <td className="p-3 text-center">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 mx-auto text-el-on-surface-variant" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 mx-auto text-el-on-surface-variant" />
                                )}
                              </td>
                            </tr>

                            {/* Nested Candidate Votes list */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="p-3 bg-el-surface-container-high/30 border-b border-el-outline-variant">
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
                                            <div className="flex gap-2 text-[10px] text-el-on-surface-variant/80">
                                              <span>{c.notes || `الترتيب: ${cIdx + 1}`}</span>
                                              <span>•</span>
                                              <span>الجنس: {c.gender || 'ذكر'}</span>
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
        </div>
      )}


      {/* Dialog for Adding New Result with exact requested fields */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-el-outline-variant flex justify-between items-center">
              <h2 className="text-[16px] font-bold text-el-primary flex items-center gap-2">
                <Landmark className="w-5 h-5" /> إضافة قضاء ونتائج جديدة
              </h2>
              <button onClick={() => setShowDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4 text-right" dir="rtl">
              <div className="space-y-3.5">
                {/* الحقل الأول: حقل القضاء */}
                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">
                    القضاء <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary cursor-pointer text-right"
                  >
                    <option value="">اختر القضاء...</option>
                    {DISTRICTS_21.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* الحقل الثاني: اسم الحزب */}
                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">
                    اسم الحزب / القائمة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ائتلاف الاعمار والتنمية"
                    value={cPartyName}
                    onChange={(e) => setCPartyName(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary text-right"
                  />
                </div>

                {/* الحقل الثالث: عدد الأصوات الكلية للقضاء */}
                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">
                    عدد الأصوات الكلية للقضاء <span className="text-[10px] text-el-on-surface-variant/70 font-normal mr-1">(يُسحب تلقائياً من بيانات المفوضية)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 538390"
                    value={totalVotes}
                    onChange={(e) => setTotalVotes(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary font-mono text-right"
                  />
                </div>

                {/* الحقل الرابع: عدد أصوات الحزب في القضاء */}
                <div>
                  <label className="block text-[12px] font-bold text-el-on-surface mb-1">
                    عدد أصوات الحزب في القضاء <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="أدخل الأصوات التي حصل عليها الحزب"
                    value={cVotes}
                    onChange={(e) => setCVotes(e.target.value)}
                    className="w-full bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 text-[14px] focus:outline-none focus:border-el-primary font-mono text-right"
                  />
                </div>

                {/* الحقل الخامس والنسبة المحسوبة */}
                <div className="bg-el-primary/5 border border-el-primary/10 rounded-lg p-3 flex justify-between items-center text-[13px] font-bold text-el-primary">
                  <span>النسبة المئوية المحسوبة للحزب:</span>
                  <span className="font-mono text-[16px] text-amber-600 dark:text-amber-400">
                    {(Number(totalVotes) > 0 && Number(cVotes) > 0)
                      ? ((Number(cVotes) / Number(totalVotes)) * 100).toFixed(2)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-el-outline-variant bg-el-surface-container-high flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDialog(false)}
                className="bg-el-surface-container-lowest border border-el-outline-variant hover:bg-el-surface-container text-el-on-surface px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-lg text-[13px] font-bold hover:opacity-90 cursor-pointer"
              >
                حفظ النتائج
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
