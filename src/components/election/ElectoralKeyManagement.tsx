'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import {
  Key,
  Plus,
  Search,
  ChevronDown,
  X,
  Star,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Phone,
  Calculator,
  Award,
  Filter,
  Eye,
  Trash2,
  Zap,
  Calendar,
} from 'lucide-react';
import { useToast } from './toastprovider';
import { SearchableSelect } from '@/components/ui/searchable-select';
import EvaluateKeyPage from './evaluatekeypage';
import Explainable from './Explainable';

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
  'الفضلية',
  'العكيكة',
  'الطار',
  'كرمة بني سعيد',
  'أور',
  'المنار',
  'الحمار'
];
const EDUCATION_LEVELS = ['يقرا ويكتب', 'ابتدائية', 'متوسطة', 'اعدادية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
const GENDER_OPTIONS = ['ذكر', 'أنثى'];
const MARITAL_STATUS_MALE = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
const MARITAL_STATUS_FEMALE = ['عزباء', 'متزوجة', 'مطلقة', 'أرملة'];

// جداول التقييم من الوثيقة
const LOYALTY_LABELS = ['متذبذب', 'ولاء ضعيف', 'ولاء متوسط', 'ولاء جيد', 'ولاء قوي'];
const INFLUENCE_LABELS = ['تأثير محدود جدا', 'داخل عائلته فقط', 'داخل عشيرته أو منطقته', 'تأثير واسع', 'شخصية قيادية مؤثرة'];
const MOBILIZATION_LABELS = ['أقل من 10', '10 – 25', '25 – 50', '50 – 100', 'أكثر من 100'];
const VOTE_PROTECTION_LABELS = ['لا يتابع', 'متابعة محدودة', 'متابعة مقبولة', 'متابعة جيدة', 'متابعة ميدانية فعالة'];
const SUPPORT_REASON_LABELS = ['مصلحة مؤقتة', 'معرفة شخصية', 'صداقة', 'عشيرة', 'قناعة سياسية وفكرية'];
const NEEDS_LABELS = ['مطالب مرتفعة جدا', 'مطالب كثيرة', 'مطالب متوسطة', 'مطالب محدودة', 'لا توجد مطالب مؤثرة'];
const POLITICAL_NOTE_LABELS = ['قليل الوعي', 'متذبذب سياسيا', 'محايد', 'داعم', 'ناشط ومدافع'];
const ORGANIZATIONAL_NOTE_LABELS = ['غير متعاون', 'تعاون ضعيف', 'تعاون متوسط', 'متعاون', 'منضبط وملتزم'];
const GENERAL_NOTE_LABELS = ['سلبي جدا', 'سلبي', 'عادي', 'إيجابي', 'إيجابي جدا'];

interface ElectoralKeyData {
  id: string;
  code: string;
  firstName: string;
  fatherName: string | null;
  grandfatherName: string | null;
  fourthName: string | null;
  nickname: string | null;
  gender: string | null;
  phone: string | null;
  educationLevel: string | null;
  profession: string | null;
  governorate: string;
  district: string | null;
  area: string | null;
  pollingCenter: string | null;
  totalVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  netVotes: number;
  loyaltyLevel: number;
  influenceLevel: number;
  mobilizationAbility: number;
  voteProtection: number;
  supportReason: number;
  needsLevel: number;
  politicalNote: number;
  organizationalNote: number;
  generalNote: number;
  weightedScore: number;
  classification: string;
  tribeId: string | null;
  tribe: { id: string; name: string; influence: number } | null;
  voterCount: number;
  notes: string | null;
  isActive: boolean;
  socialMedia?: string | null;
  dateOfBirth?: string | null;
  specialization?: string | null;
  maritalStatus?: string | null;
  familySize?: number | null;
  firstContactDate?: string | null;
  lastEvaluationAt?: string | null;
  createdAt: string;
}

const defaultForm = {
  code: '', firstName: '', fatherName: '', grandfatherName: '', fourthName: '',
  nickname: '', gender: 'ذكر', dateOfBirth: '', phone: '', educationLevel: '', profession: '',
  specialization: '', maritalStatus: '', familySize: 0,
  firstContactDate: '', governorate: 'ذي قار', district: 'الناصرية', area: '',
  pollingCenter: '', totalVotes: 0, supportedVotes: 0, neutralVotes: 0, weakVotes: 0,
  loyaltyLevel: 3, influenceLevel: 3, mobilizationAbility: 3, voteProtection: 3,
  supportReason: 3, needsLevel: 3, politicalNote: 3, organizationalNote: 3, generalNote: 3,
  tribeId: '', notes: '', socialFacebook: '', socialTelegram: '', socialWhatsApp: '',
};

const RatingBar = ({ value, onChange, labels, weight, field }: { value: number; onChange: (v: number) => void; labels: string[]; weight?: number; field?: string }) => (
  <div className="space-y-1.5 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-3">
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-bold text-el-on-surface">{field || ''}</span>
      {weight && <span className="text-[10px] bg-el-primary/10 text-el-primary px-1.5 py-0.5 rounded font-bold">الوزن: {weight}%</span>}
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-1.5 text-[11px] rounded border transition-all ${
            value >= n
              ? 'bg-el-primary text-white border-el-primary'
              : 'bg-el-surface border-el-outline-variant text-el-on-surface-variant hover:border-el-primary/50'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="text-[10px] text-el-on-surface-variant">{labels[value - 1]}</div>
  </div>
);

export default function ElectoralKeyManagement() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ElectoralKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ElectoralKeyData | null>(null);
  const [editingKey, setEditingKey] = useState<ElectoralKeyData | null>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'power' | 'influence'>('identity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [tribes, setTribes] = useState<{ id: string; name: string }[]>([]);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [evalKeyId, setEvalKeyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearText, setClearText] = useState('');
  const [clearPwd, setClearPwd] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string; value: string } | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterClassification) params.set('classification', filterClassification);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/electoral-keys?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setKeys(data);
      } else {
        console.error('API returned non-array data:', data);
        setKeys([]);
      }
    } catch (err) {
      console.error('Error fetching keys:', err);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [filterDistrict, filterClassification, searchQuery]);

  const fetchTribes = useCallback(async () => {
    try {
      const res = await fetch('/api/tribes');
      const data = await res.json();
      setTribes(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, name: t.name })) : []);
    } catch (err) {
      console.error('Error fetching tribes:', err);
      setTribes([]);
    }
  }, []);

  useEffect(() => { fetchKeys(); fetchTribes(); }, [fetchKeys, fetchTribes]);

  useEffect(() => {
    const handleGlobalSelect = async (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'key') {
        const keyId = customEvent.detail.id;
        const localKey = keys.find(k => k.id === keyId);
        if (localKey) {
          handleStartEdit(localKey);
        } else {
          try {
            const res = await fetch(`/api/electoral-keys/${keyId}`);
            if (res.ok) {
              const key = await res.json();
              if (key) {
                handleStartEdit(key);
              }
            }
          } catch (err) {
            console.error('Error fetching selected key details:', err);
          }
        }
      }
    };
    window.addEventListener('global-search-select', handleGlobalSelect);
    return () => window.removeEventListener('global-search-select', handleGlobalSelect);
  }, [keys]);

  const handleSaveKey = async () => {
    try {
      const socialMediaString = JSON.stringify({
        facebook: form.socialFacebook,
        telegram: form.socialTelegram,
        whatsapp: form.socialWhatsApp,
      });

      const netVotesVal = calcNetVotes(form.supportedVotes, form.neutralVotes, form.weakVotes);
      const totalVotesVal = form.totalVotes || (form.supportedVotes + form.neutralVotes + form.weakVotes);
      const weightedVal = calcWeighted();
      const classVal = getClassification(weightedVal);

      const payload = {
        ...form,
        education: form.educationLevel,   // ربط حقل التعليم بالقاعدة
        loyaltyScore: form.loyaltyLevel,  // تعيين اسم الحقل للـ API
        mobilizationCap: form.mobilizationAbility,
        netVotes: netVotesVal,
        totalVotes: totalVotesVal,
        weightedScore: weightedVal,
        classification: classVal,
        socialMedia: socialMediaString,
      };
      delete (payload as any).loyaltyLevel;  // إزالة الاسم الداخلي
      delete (payload as any).mobilizationAbility;

      const url = editMode ? `/api/electoral-keys/${editingKey?.id || selectedKey?.id}` : '/api/electoral-keys';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        const newId = saved?.id || editingKey?.id || selectedKey?.id;

        // تشغيل التقييم الخادمي بعد الحفظ مباشرة
        if (newId && editMode) {
          try {
            const evalRes = await fetch(`/api/electoral-keys/${newId}/evaluate`, { method: 'POST' });
            if (evalRes.ok) {
              const evalData = await evalRes.json();
              if (evalData.key) {
                setSelectedKey(evalData.key);
                fetchKeys();
              }
            }
          } catch (_) { /* التقييم اختياري */ }
        }

        setShowAddDialog(false);
        setEditMode(false);
        setForm(defaultForm);
        setEditingKey(null);
        fetchKeys();
        if (selectedKey) {
          setSelectedKey(saved);
        }
      } else {
        const err = await res.json();
        toast(err.error || 'فشل في حفظ المفتاح الانتخابي', 'error');
      }
    } catch (err) {
      console.error('Error saving key:', err);
    }
  };

  // === الحذف الجماعي ===
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل تريد الحذف؟ يرجى التأكيد (حذف ${selectedIds.size} مفاتيح نهائياً)`)) return;
    try {
      for (const id of selectedIds) {
        await fetch(`/api/electoral-keys/${id}`, { method: 'DELETE' });
      }
      setSelectedIds(new Set());
      fetchKeys();
    } catch (e) { console.error('Bulk delete error:', e); }
  };

  // === مسح الكل ===
  const handleClearAll = async () => {
    if (clearText !== 'حذف') return;
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: clearText, password: clearPwd }),
      });
      if (res.ok) {
        setShowClearConfirm(false);
        setClearText('');
        setClearPwd('');
        fetchKeys();
      }
    } catch (e) { console.error('Clear all error:', e); }
  };

  // === تحرير مباشر ===
  const handleInlineSave = async (id: string, field: string, value: string) => {
    try {
      await fetch(`/api/electoral-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      setEditingCell(null);
      fetchKeys();
    } catch (e) { console.error('Inline save error:', e); }
  };

  function handleStartEdit(key: ElectoralKeyData) {
    let fb = '', tg = '', wa = '';
    if (key.socialMedia) {
      try {
        const parsed = JSON.parse(key.socialMedia);
        fb = parsed.facebook || '';
        tg = parsed.telegram || '';
        wa = parsed.whatsapp || '';
      } catch (e) {}
    }

    setForm({
      code: key.code || '',
      firstName: key.firstName || '',
      fatherName: key.fatherName || '',
      grandfatherName: key.grandfatherName || '',
      fourthName: key.fourthName || '',
      nickname: key.nickname || '',
      gender: key.gender || 'ذكر',
      dateOfBirth: key.dateOfBirth || '',
      phone: key.phone || '',
      educationLevel: key.educationLevel || '',
      profession: key.profession || '',
      specialization: key.specialization || '',
      maritalStatus: key.maritalStatus || '',
      familySize: key.familySize || 0,
      firstContactDate: key.firstContactDate || '',
      governorate: key.governorate || 'ذي قار',
      district: key.district || 'الناصرية',
      area: key.area || '',
      pollingCenter: key.pollingCenter || '',
      totalVotes: key.totalVotes || 0,
      supportedVotes: key.supportedVotes || 0,
      neutralVotes: key.neutralVotes || 0,
      weakVotes: key.weakVotes || 0,
      loyaltyLevel: (key as any).loyaltyScore || (key as any).loyaltyLevel || 3,
      influenceLevel: (key as any).influenceLevel || 3,
      mobilizationAbility: (key as any).mobilizationCap || (key as any).mobilizationAbility || 3,
      voteProtection: key.voteProtection || 3,
      supportReason: key.supportReason || 3,
      needsLevel: key.needsLevel || 3,
      politicalNote: key.politicalNote || 3,
      organizationalNote: key.organizationalNote || 3,
      generalNote: key.generalNote || 3,
      tribeId: key.tribeId || '',
      notes: key.notes || '',
      socialFacebook: fb,
      socialTelegram: tg,
      socialWhatsApp: wa,
    });
    setEditMode(true);
    setShowAddDialog(true);
    setEditingKey(key);
  }

  const calcNetVotes = (s: number, n: number, w: number) => {
    const net = s * 0.8 + n * 0.5 + w * 0.3;
    return Math.round(net * 10) / 10;
  };
  
  const calcWeighted = () => {
    const totalVotesVal = form.totalVotes || (form.supportedVotes + form.neutralVotes + form.weakVotes);
    if (totalVotesVal <= 0) return 0;
    const netVal = calcNetVotes(form.supportedVotes, form.neutralVotes, form.weakVotes);
    const evaluation = (netVal / totalVotesVal) * 100;
    return Math.round(evaluation * 10) / 10;
  };

  const getClassification = (score: number) => {
    if (score >= 75) return 'قوي';
    if (score >= 60) return 'جيد';
    if (score >= 45) return 'مقبول';
    return 'ضعيف';
  };

  const getClassColor = (c: string) => {
    switch (c) {
      case 'قوي': return 'bg-green-100 text-green-800 border-green-300';
      case 'جيد': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'مقبول': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ضعيف': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // ملخص الإحصائيات
  const totalNetVotes = keys.reduce((s, k) => s + k.netVotes, 0);
  
  // دالة لحساب الأصوات المضمونة للمفتاح الواحد بعد تطبيق معامل كفاءة التقييم
  const getGuaranteedVotes = (k: ElectoralKeyData) => {
    const efficiencyCoeff = k.lastEvaluationAt ? (k.weightedScore / 100) : 1.0;
    return k.netVotes * efficiencyCoeff;
  };

  const totalGuaranteed = Math.round(keys.reduce((s, k) => s + getGuaranteedVotes(k), 0));
  const avgGuaranteed = keys.length ? parseFloat((keys.reduce((s, k) => s + getGuaranteedVotes(k), 0) / keys.length).toFixed(1)) : 0;


  const stats = {
    total: keys.length,
    totalNetVotes: totalNetVotes,
    avgWeighted: keys.length ? Math.round(keys.reduce((s, k) => s + k.weightedScore, 0) / keys.length) : 0,
    totalPower: Math.round(keys.reduce((s, k) => s + k.weightedScore, 0)),
    totalGuaranteed: totalGuaranteed,
    avgGuaranteed: avgGuaranteed,
    strongCount: keys.filter(k => k.classification === 'قوي' || k.classification === 'قوي جداً').length,
    goodCount: keys.filter(k => k.classification === 'جيد').length,
    acceptableCount: keys.filter(k => k.classification === 'مقبول').length,
    weakCount: keys.filter(k => k.classification === 'ضعيف').length,
  };



  const isStale = (k: ElectoralKeyData) => {
    if (!k.lastEvaluationAt) return true;
    const date = new Date(k.lastEvaluationAt);
    const diffTime = Math.abs(Date.now() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
        <div>
          <h1 className="text-[26px] leading-[36px] font-bold text-el-primary flex items-center gap-2.5">
            <Key className="w-6 h-6 text-el-primary" /> المفاتيح الانتخابية
          </h1>
          <p className="text-[12.5px] leading-[18px] text-el-on-surface-variant mt-1.5">
            إدارة وتقييم المفاتيح الانتخابية - نظام التقييم الموزون والتصنيف حسب القوة
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-full flex items-center gap-2.5 hover:shadow-lg hover:shadow-el-primary/20 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group"
        >
          <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
            <Plus className="w-[16px] h-[16px]" />
          </span>
          <span className="text-[14px] leading-[20px] font-semibold">إضافة مفتاح جديد</span>
        </button>
      </div>

      {/* بطاقات الإحصائيات - Double-Bezel Architecture */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">إجمالي المفاتيح</div>
            <div className="text-[32px] font-bold text-el-primary mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.total}</div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">
              <Explainable termKey="NET_VOTES">صافي الأصوات (قبل التقييم)</Explainable>
            </div>
            <div className="text-[32px] font-bold text-el-secondary mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.totalNetVotes.toLocaleString()}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">(مؤيد×0.8 + محايد×0.5 + ضعيف×0.3)</div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">
              <Explainable termKey="GUARANTEED_VOTES">متوسط الأصوات المضمونة</Explainable>
            </div>
            <div className="text-[32px] font-bold text-el-on-surface mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.avgGuaranteed.toLocaleString()}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">للمفتاح الواحد بعد الفلترة الثنائية</div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">
              <Explainable termKey="GUARANTEED_VOTES">إجمالي الأصوات المضمونة</Explainable>
            </div>
            <div className="text-[32px] font-bold text-el-primary mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.totalGuaranteed.toLocaleString()}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">الأصوات المتوقعة في الصندوق</div>
          </div>
        </div>
      </section>

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] focus:outline-none focus:border-el-primary"
            placeholder="بحث بالاسم أو الكود أو اللقب..."
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
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-[12px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
          >
            <option value="">جميع التصنيفات</option>
            <option value="قوي">قوي</option>
            <option value="جيد">جيد</option>
            <option value="مقبول">مقبول</option>
            <option value="ضعيف">ضعيف</option>
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* شريط أدوات الحذف الجماعي */}
      {keys.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> حذف المحدد ({selectedIds.size})
            </button>
          )}
          {process.env.NODE_ENV !== 'production' && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded text-[12px] font-bold border border-red-700/50"
            >
              مسح الكل
            </button>
          )}
        </div>
      )}

      {/* نافذة تأكيد المسح الشامل */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-lg border border-red-700 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ مسح جميع المفاتيح</h3>
            <p className="text-[13px] text-el-on-surface-variant mb-4">لا يمكن التراجع. اكتب "حذف" + كلمة سر المالك:</p>
            <input
              type="text"
              placeholder='اكتب "حذف"'
              value={clearText}
              onChange={e => setClearText(e.target.value)}
              className="w-full bg-el-surface border border-el-outline-variant rounded px-3 py-2 text-sm mb-2"
            />
            <input
              type="password"
              placeholder="كلمة سر المالك"
              value={clearPwd}
              onChange={e => setClearPwd(e.target.value)}
              className="w-full bg-el-surface border border-el-outline-variant rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                disabled={clearText !== 'حذف' || !clearPwd}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-bold"
              >مسح نهائي</button>
              <button
                onClick={() => { setShowClearConfirm(false); setClearText(''); setClearPwd(''); }}
                className="flex-1 bg-el-surface border border-el-outline-variant px-4 py-2 rounded text-sm"
              >إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* جدول المفاتيح */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <Key className="w-12 h-12 opacity-30" />
          <p>لا توجد مفاتيح انتخابية - أضف أول مفتاح</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant/40 dark:border-el-outline-variant/20 rounded-xl overflow-hidden kowalski-shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12.5px] border-collapse">
              <thead className="bg-el-surface-container/30 border-b border-el-outline-variant/20 text-el-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === (keys || []).length && (keys || []).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set((keys || []).map(k => k.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="w-4 h-4 cursor-pointer rounded border-el-outline-variant/40 text-el-primary focus:ring-el-primary"
                    />
                  </th>
                  <th className="px-4 py-3.5">الكود</th>
                  <th className="px-4 py-3.5">الاسم</th>
                  <th className="px-4 py-3.5">اللقب/العشيرة</th>
                  <th className="px-4 py-3.5">القضاء</th>
                  <th className="px-4 py-3.5 text-center">الأصوات الكلية</th>
                  <th className="px-4 py-3.5 text-center">المؤيد</th>
                  <th className="px-4 py-3.5 text-center">المحايد</th>
                  <th className="px-4 py-3.5 text-center">الضعيف</th>
                  <th className="px-4 py-3.5 text-center font-bold">الصافي</th>
                  <th className="px-4 py-3.5 text-center">التقييم</th>
                  <th className="px-4 py-3.5 text-center">التصنيف</th>
                  <th className="px-4 py-3.5 w-16 text-center">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/15">
                {(keys || []).map((key, idx) => (
                  <tr key={key.id} className={`hover:bg-el-surface-container/30 transition-colors duration-200 h-12 ${idx % 2 === 1 ? 'bg-el-surface-container-low/20' : ''}`}>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(key.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(key.id);
                          else next.delete(key.id);
                          setSelectedIds(next);
                        }}
                        className="w-4 h-4 cursor-pointer rounded border-el-outline-variant/40 text-el-primary focus:ring-el-primary"
                      />
                    </td>
                    <td className="px-3 py-1 font-mono text-el-primary font-semibold">{key.code}</td>
                    <td
                      className="px-3 py-1 text-el-on-surface font-medium cursor-pointer"
                      onDoubleClick={() => setEditingCell({ id: key.id, field: 'firstName', value: key.firstName })}
                    >
                      {editingCell?.id === key.id && editingCell.field === 'firstName' ? (
                        <input
                          autoFocus
                          defaultValue={key.firstName}
                          onBlur={e => handleInlineSave(key.id, 'firstName', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(key.id, 'firstName', (e.target as HTMLInputElement).value); if (e.key === 'Escape') setEditingCell(null); }}
                          className="bg-el-surface border border-el-primary rounded px-1 py-0.5 text-[12px] w-full"
                        />
                      ) : (
                        <span>{key.firstName} {key.fatherName || ''}</span>
                      )}
                    </td>
                    <td className="px-3 py-1 text-el-on-surface-variant">{key.nickname || key.tribe?.name || '-'}</td>
                    <td className="px-3 py-1 text-el-on-surface-variant">{key.district || '-'}</td>
                    <td className="px-3 py-1 text-center font-mono">{key.totalVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-green-600">{key.supportedVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-yellow-600">{key.neutralVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-red-600">{key.weakVotes}</td>
                    <td className="px-3 py-1 text-center font-mono font-bold text-el-primary">{key.netVotes}</td>
                    <td className="px-3 py-1 text-center">
                      <span className="font-mono font-bold">{key.weightedScore}%</span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getClassColor(key.classification)}`}>
                          {key.classification}
                        </span>
                        {isStale(key) && (
                          <span className="text-[8px] bg-red-900/20 text-red-400 border border-red-900/50 px-1 rounded font-bold animate-pulse" title="التقييم قديم (مر عليه أكثر من 30 يوماً)">
                            ⚠️ بحاجة لتحديث
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedKey(key)} className="text-el-primary hover:text-el-secondary transition-colors" title="عرض التفاصيل">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEvalKeyId(key.id); setShowEvaluate(true); }} className="text-yellow-400 hover:text-yellow-300 transition-colors" title="تقييم النفوذ والتأثير">
                          <Shield className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة إضافة مفتاح جديد */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-2xl my-8">
            {/* رأس النافذة */}
            <div className="flex justify-between items-center p-4 border-b border-el-outline-variant sticky top-0 bg-el-surface-container-lowest z-10">
              <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                <Key className="w-5 h-5 text-el-primary" /> إضافة مفتاح انتخابي جديد
              </h3>
              <button onClick={() => { setShowAddDialog(false); setEditMode(false); setForm(defaultForm); setEditingKey(null); }} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* تبويبات */}
            <div className="flex border-b border-el-outline-variant">
              {[
                { id: 'identity' as const, label: 'الهوية الأساسية', icon: Users },
                { id: 'power' as const, label: 'القوة الانتخابية', icon: Calculator },
                { id: 'influence' as const, label: 'النفوذ والتأثير', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[12px] font-medium flex items-center justify-center gap-1 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-el-primary text-el-primary bg-el-primary/5'
                      : 'border-transparent text-el-on-surface-variant hover:text-el-on-surface'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* تبويب الهوية */}
              {activeTab === 'identity' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">كود المفتاح (توليد تلقائي)</label>
                      <input className="w-full bg-el-surface-container border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none font-mono opacity-70 cursor-not-allowed" disabled={true}
                        value={editMode ? form.code : 'توليد تلقائي'} onChange={e => setForm({ ...form, code: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الاسم المجرد *</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم الأب</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم الجد</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.grandfatherName} onChange={e => setForm({ ...form, grandfatherName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الاسم الرابع</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.fourthName} onChange={e => setForm({ ...form, fourthName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اللقب / العشيرة</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الجنس</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value, maritalStatus: '' })}>
                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">العمر (تاريخ الميلاد)</label>
                      <ModernDatePicker
                        value={form.dateOfBirth}
                        onChange={(val) => setForm({ ...form, dateOfBirth: val })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">رقم الموبايل (11 رقم)</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono" placeholder="07XXXXXXXXX"
                        value={form.phone} onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 11) {
                            setForm({ ...form, phone: val });
                          }
                        }} />
                      {form.phone && form.phone.length !== 11 && (
                        <span className="text-[10px] text-red-500 font-bold block mt-0.5">رقم الهاتف يجب أن يكون 11 رقماً</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">التحصيل الدراسي</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })}>
                        <option value="">اختر</option>
                        {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">التخصص الدقيق</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary" placeholder="بكالوريوس هندسة مثلاً"
                        value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المهنة الفعلية</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الحالة الاجتماعية</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.maritalStatus || ''} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                        <option value="">اختر</option>
                        {(form.gender === 'أنثى' ? MARITAL_STATUS_FEMALE : MARITAL_STATUS_MALE).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد أفراد الأسرة</label>
                      <input type="number" min="0" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.familySize === 0 ? '' : form.familySize || ''} onChange={e => setForm({ ...form, familySize: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">تاريخ أول تواصل</label>
                      <ModernDatePicker
                        value={form.firstContactDate}
                        onChange={(val) => setForm({ ...form, firstContactDate: val })}
                      />
                    </div>
                  </div>
                  
                  {/* مواقع التواصل الاجتماعي */}
                  <div className="border border-el-outline-variant/60 rounded p-3 bg-el-surface-container-low space-y-2">
                    <span className="block text-[11px] font-bold text-el-primary">مواقع التواصل الاجتماعي (رابط الحساب / الرقم)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">فيسبوك</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط الصفحة"
                          value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">تلكرام</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط أو معرف"
                          value={form.socialTelegram} onChange={e => setForm({ ...form, socialTelegram: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">واتساب</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط أو رقم"
                          value={form.socialWhatsApp} onChange={e => setForm({ ...form, socialWhatsApp: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">القضاء</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">العشيرة المرتبطة</label>
                      <SearchableSelect
                        options={tribes.map(t => ({ value: t.id, label: t.name }))}
                        value={form.tribeId || ''}
                        onChange={(val) => setForm({ ...form, tribeId: String(val) })}
                        placeholder="اختر العشيرة..."
                        searchPlaceholder="البحث عن عشيرة..."
                        emptyMessage="لا توجد عشائر مطابقة"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المنطقة</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">مركز الاقتراع</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.pollingCenter} onChange={e => setForm({ ...form, pollingCenter: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب القوة الانتخابية */}
              {activeTab === 'power' && (
                <div className="space-y-4">
                  <div className="bg-el-primary/5 border border-el-primary/20 rounded-sm p-3">
                    <h4 className="text-[14px] font-semibold text-el-primary mb-2 flex items-center gap-1">
                      <Calculator className="w-4 h-4" /> معادلة حساب الأصوات الصافية
                    </h4>
                    <p className="text-[12px] text-el-on-surface-variant">
                      الأصوات الصافية = (المؤيدة × 80%) + (المحايدة × 50%) + (الضعيفة × 30%)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات الكلي *</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.totalVotes === 0 ? '' : form.totalVotes} onChange={e => setForm({ ...form, totalVotes: parseInt(e.target.value) || 0 })} />
                      <p className="text-[10px] text-el-on-surface-variant mt-0.5">إجمالي الكتلة التصويتية المستهدفة للمفتاح</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المؤيدة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.supportedVotes === 0 ? '' : form.supportedVotes} onChange={e => {
                          const s = parseInt(e.target.value) || 0;
                          setForm({ ...form, supportedVotes: s });
                        }} />
                      <p className="text-[10px] text-green-600 mt-0.5">= {Math.round(form.supportedVotes * 0.8)} صوت فعلي (80%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المحايدة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.neutralVotes === 0 ? '' : form.neutralVotes} onChange={e => {
                          const n = parseInt(e.target.value) || 0;
                          setForm({ ...form, neutralVotes: n });
                        }} />
                      <p className="text-[10px] text-yellow-600 mt-0.5">= {Math.round(form.neutralVotes * 0.5)} صوت فعلي (50%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات الضعيفة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.weakVotes === 0 ? '' : form.weakVotes} onChange={e => {
                          const w = parseInt(e.target.value) || 0;
                          setForm({ ...form, weakVotes: w });
                        }} />
                      <p className="text-[10px] text-red-600 mt-0.5">= {Math.round(form.weakVotes * 0.3)} صوت فعلي (30%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الأصوات الصافية</label>
                      <div className="bg-el-primary/10 border border-el-primary/30 rounded h-8 px-2 flex items-center text-[16px] font-bold text-el-primary font-mono">
                        {calcNetVotes(form.supportedVotes, form.neutralVotes, form.weakVotes)}
                      </div>
                    </div>
                  </div>
                  {/* مؤشرات ميدانية للمؤيد */}
                  <div className="bg-green-50 border border-green-200 rounded-sm p-2">
                    <p className="text-[11px] font-bold text-green-800 mb-1">مؤشرات الصوت المؤيد:</p>
                    <ul className="text-[10px] text-green-700 space-y-0.5">
                      <li>● صوت للمرشح سابقاً</li>
                      <li>● يشارك في نشاطات الحملة</li>
                      <li>● يدافع عن المرشح أمام الآخرين</li>
                      <li>● يمكن الاعتماد عليه يوم الاقتراع</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* تبويب النفوذ والتأثير */}
              {activeTab === 'influence' && (
                <div className="space-y-4">
                  <div className="bg-el-primary/5 border border-el-primary/20 rounded-sm p-3">
                    <h4 className="text-[14px] font-semibold text-el-primary mb-2 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <Explainable termKey="WEIGHTED_SCORE">نظام التقييم الموزون — 9 أبعاد × 5 مستويات</Explainable>
                    </h4>
                    <p className="text-[12px] text-el-on-surface-variant">
                      كل حقل يُقيّم من 1-5 ويُضرب بالوزن المحدد، المجموع يحدد تصنيف المفتاح
                    </p>
                  </div>

                  <div className="space-y-3">
                    <RatingBar field="مستوى الولاء" value={form.loyaltyLevel} onChange={v => setForm({ ...form, loyaltyLevel: v })} labels={LOYALTY_LABELS} weight={20} />
                    <RatingBar field="مستوى التأثير" value={form.influenceLevel} onChange={v => setForm({ ...form, influenceLevel: v })} labels={INFLUENCE_LABELS} weight={20} />
                    <RatingBar field="القدرة على التحشيد" value={form.mobilizationAbility} onChange={v => setForm({ ...form, mobilizationAbility: v })} labels={MOBILIZATION_LABELS} weight={15} />
                    <RatingBar field="حماية الأصوات" value={form.voteProtection} onChange={v => setForm({ ...form, voteProtection: v })} labels={VOTE_PROTECTION_LABELS} weight={15} />
                    <RatingBar field="أسباب الدعم" value={form.supportReason} onChange={v => setForm({ ...form, supportReason: v })} labels={SUPPORT_REASON_LABELS} weight={10} />
                    <RatingBar field="الاحتياجات والمطالب" value={form.needsLevel} onChange={v => setForm({ ...form, needsLevel: v })} labels={NEEDS_LABELS} weight={5} />
                    <RatingBar field="الملاحظات السياسية" value={form.politicalNote} onChange={v => setForm({ ...form, politicalNote: v })} labels={POLITICAL_NOTE_LABELS} weight={5} />
                    <RatingBar field="الملاحظات التنظيمية" value={form.organizationalNote} onChange={v => setForm({ ...form, organizationalNote: v })} labels={ORGANIZATIONAL_NOTE_LABELS} weight={5} />
                    <RatingBar field="الملاحظات العامة" value={form.generalNote} onChange={v => setForm({ ...form, generalNote: v })} labels={GENERAL_NOTE_LABELS} weight={5} />
                  </div>

                  {/* النتيجة النهائية */}
                  <div className="bg-el-surface border border-el-outline-variant rounded-sm p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] font-semibold text-el-on-surface">
                        <Explainable termKey="WEIGHTED_SCORE">التقييم الموزون النهائي:</Explainable>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[24px] font-bold text-el-primary font-mono">{calcWeighted()}</span>
                        <span className="text-[12px] text-el-on-surface-variant">درجة</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[14px] text-el-on-surface-variant">التصنيف:</span>
                      <span className={`px-3 py-1 rounded text-[12px] font-bold border ${getClassColor(getClassification(calcWeighted()))}`}>
                        {getClassification(calcWeighted())}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${calcWeighted() >= 100 ? 'bg-green-500' : calcWeighted() >= 50 ? 'bg-blue-500' : calcWeighted() >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(calcWeighted() / 2, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-el-on-surface-variant mt-1">
                      <span>ضعيف &lt;20</span>
                      <span>مقبول 20-50</span>
                      <span>جيد 50-100</span>
                      <span>قوي 100-200</span>
                    </div>
                  </div>

                  {/* ملاحظات */}
                  <div>
                    <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">ملاحظات</label>
                    <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] h-16 resize-none focus:outline-none focus:border-el-primary"
                      value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-2 p-4 border-t border-el-outline-variant sticky bottom-0 bg-el-surface-container-lowest">
              <button
                onClick={handleSaveKey}
                disabled={((editMode && !form.code) || !form.firstName || (form.phone ? form.phone.length !== 11 : false))}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMode ? 'حفظ التعديلات' : 'إضافة المفتاح'}
              </button>
              <button
                onClick={() => { setShowAddDialog(false); setEditMode(false); setForm(defaultForm); setEditingKey(null); }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل المفتاح */}
      {selectedKey && (() => {
        let social = { facebook: '', telegram: '', whatsapp: '' };
        if (selectedKey.socialMedia) {
          try {
            social = JSON.parse(selectedKey.socialMedia);
          } catch (e) {}
        }
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-el-outline-variant">
                <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                  <Key className="w-5 h-5 text-el-primary" />
                  {selectedKey.code} - {selectedKey.firstName} {selectedKey.fatherName || ''} {selectedKey.grandfatherName || ''} {selectedKey.fourthName || ''}
                </h3>
                <button onClick={() => setSelectedKey(null)} className="text-el-on-surface-variant hover:text-el-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* التصنيف والتقييم */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded text-[14px] font-bold border ${getClassColor(selectedKey.classification)}`}>
                    {selectedKey.classification}
                  </span>
                  <span className="text-[16px] font-bold font-mono text-el-primary">التقييم: {selectedKey.weightedScore}</span>
                </div>

                {/* الأصوات */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-el-surface-container rounded">
                    <div className="text-[18px] font-bold font-mono">{selectedKey.totalVotes}</div>
                    <div className="text-[10px] text-el-on-surface-variant">كلية</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-green-700">{selectedKey.supportedVotes}</div>
                    <div className="text-[10px] text-green-600">مؤيد</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-yellow-700">{selectedKey.neutralVotes}</div>
                    <div className="text-[10px] text-yellow-600">محايد</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-red-700">{selectedKey.weakVotes}</div>
                    <div className="text-[10px] text-red-600">ضعيف</div>
                  </div>
                </div>

                {/* الأصوات الصافية */}
                <div className="bg-el-primary/5 border border-el-primary/20 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-el-on-surface-variant">الأصوات الصافية (المعادلة)</span>
                    <span className="text-[20px] font-bold text-el-primary font-mono">{selectedKey.netVotes}</span>
                  </div>
                  <div className="text-[10px] text-el-on-surface-variant mt-1">
                    ({selectedKey.supportedVotes}×80%) + ({selectedKey.neutralVotes}×50%) + ({selectedKey.weakVotes}×30%) = {selectedKey.netVotes}
                  </div>
                </div>

                {/* التفاصيل الأساسية والجغرافية */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] border-t border-el-outline-variant/60 pt-3">
                  {selectedKey.nickname && <div><span className="text-el-on-surface-variant">اللقب/العشيرة:</span> <span className="font-medium">{selectedKey.nickname}</span></div>}
                  {selectedKey.gender && <div><span className="text-el-on-surface-variant">الجنس:</span> <span className="font-medium">{selectedKey.gender}</span></div>}
                  {selectedKey.dateOfBirth && <div><span className="text-el-on-surface-variant">تاريخ الميلاد:</span> <span className="font-medium font-mono">{selectedKey.dateOfBirth}</span></div>}
                  {selectedKey.phone && <div><span className="text-el-on-surface-variant">رقم الموبايل:</span> <span className="font-mono font-medium">{selectedKey.phone}</span></div>}
                  {selectedKey.educationLevel && <div><span className="text-el-on-surface-variant">التحصيل الدراسي:</span> <span className="font-medium">{selectedKey.educationLevel}</span></div>}
                  {selectedKey.specialization && <div><span className="text-el-on-surface-variant">التخصص الدقيق:</span> <span className="font-medium">{selectedKey.specialization}</span></div>}
                  {selectedKey.profession && <div><span className="text-el-on-surface-variant">المهنة الفعلية:</span> <span className="font-medium">{selectedKey.profession}</span></div>}
                  {selectedKey.maritalStatus && <div><span className="text-el-on-surface-variant">الحالة الاجتماعية:</span> <span className="font-medium">{selectedKey.maritalStatus}</span></div>}
                  {selectedKey.familySize !== null && selectedKey.familySize !== undefined && <div><span className="text-el-on-surface-variant">عدد أفراد الأسرة:</span> <span className="font-mono font-medium">{selectedKey.familySize}</span></div>}
                  {selectedKey.firstContactDate && <div><span className="text-el-on-surface-variant">تاريخ أول تواصل:</span> <span className="font-medium font-mono">{selectedKey.firstContactDate}</span></div>}
                  <div><span className="text-el-on-surface-variant">المحافظة:</span> <span className="font-medium">{selectedKey.governorate}</span></div>
                  {selectedKey.district && <div><span className="text-el-on-surface-variant">القضاء:</span> <span className="font-medium">{selectedKey.district}</span></div>}
                  {selectedKey.area && <div><span className="text-el-on-surface-variant">المنطقة:</span> <span className="font-medium">{selectedKey.area}</span></div>}
                  {selectedKey.pollingCenter && <div><span className="text-el-on-surface-variant">مركز الاقتراع:</span> <span className="font-medium">{selectedKey.pollingCenter}</span></div>}
                  {selectedKey.tribe && <div><span className="text-el-on-surface-variant">العشيرة المرتبطة:</span> <span className="font-medium">{selectedKey.tribe.name}</span></div>}
                  <div><span className="text-el-on-surface-variant">الناخبون المسجلون:</span> <span className="font-mono font-bold text-el-secondary">{selectedKey.voterCount}</span></div>
                </div>

                {/* روابط مواقع التواصل الاجتماعي */}
                {(social.facebook || social.telegram || social.whatsapp) && (
                  <div className="border-t border-el-outline-variant/60 pt-3 text-[12px] space-y-1">
                    <span className="text-el-on-surface-variant font-bold block mb-1">التواصل الرقمي:</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {social.facebook && (
                        <a href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          🌐 فيسبوك
                        </a>
                      )}
                      {social.telegram && (
                        <a href={social.telegram.startsWith('http') ? social.telegram : `https://t.me/${social.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          ✈️ تلكرام
                        </a>
                      )}
                      {social.whatsapp && (
                        <a href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          💬 واتساب
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* شريط التقييم */}
                <div className="border-t border-el-outline-variant/60 pt-3">
                  <div className="flex justify-between text-[11px] text-el-on-surface-variant mb-1">
                    <span>قوة نفوذ المفتاح</span>
                    <span>{selectedKey.weightedScore}</span>
                  </div>
                  <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full ${selectedKey.weightedScore >= 100 ? 'bg-green-500' : selectedKey.weightedScore >= 50 ? 'bg-blue-500' : selectedKey.weightedScore >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(selectedKey.weightedScore / 2, 100)}%` }} />
                  </div>
                </div>

                {/* تشخيص الذكاء الاصطناعي ومخاطر تسرب الأصوات */}
                <div className="border-t border-el-outline-variant/60 pt-3 space-y-2">
                  <span className="text-el-on-surface-variant font-bold block text-[12px] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> تشخيص مخاطر تسرب الأصوات (AI Diagnostic):
                  </span>
                  <div className="bg-[var(--el-surface-container)] p-2.5 rounded border border-[var(--el-line)] text-[11px] space-y-1 text-right">
                    <div className="flex justify-between items-center pb-1 border-b border-[var(--el-line)] mb-1.5">
                      <span className="text-[var(--el-muted)]">احتمالية الالتزام الانتخابي:</span>
                      <span className={`font-bold font-mono ${selectedKey.weightedScore >= 70 ? 'text-emerald-500' : selectedKey.weightedScore >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {selectedKey.weightedScore}%
                      </span>
                    </div>
                    {(() => {
                      const warnings = [];
                      const loyalty = (selectedKey as any).loyaltyScore || (selectedKey as any).loyaltyLevel || 3;
                      const needs = selectedKey.needsLevel || 3;
                      const protection = selectedKey.voteProtection || 3;
                      const org = selectedKey.organizationalNote || 3;
                      
                      if (loyalty <= 2) warnings.push('ولاء متذبذب أو ضعيف للجهة المنظمة.');
                      if (needs <= 2) warnings.push('مطالب خدمية مرتفعة جداً قد تؤدي لانشقاق.');
                      if (protection <= 2) warnings.push('ضعف المتابعة الميدانية وحماية أصوات الصناديق.');
                      if (org <= 2) warnings.push('ضعف الانضباط والتعاون مع الكادر التنظيمي.');
                      
                      if (warnings.length === 0) {
                        return <p className="text-emerald-500 flex gap-1 items-center">✅ <span>الوضع مستقر ولا توجد مؤشرات خطر نشطة.</span></p>;
                      }
                      return warnings.map((w, i) => (
                        <p key={i} className="text-amber-500 flex gap-1.5 items-start">⚠️ <span>{w}</span></p>
                      ));
                    })()}
                  </div>
                </div>

                {/* ملاحظات حرة */}
                {selectedKey.notes && (
                  <div className="border-t border-el-outline-variant/60 pt-3 text-[12px]">
                    <span className="text-el-on-surface-variant font-bold block">ملاحظات:</span>
                    <p className="mt-1 text-el-on-surface bg-el-surface p-2 rounded text-justify">{selectedKey.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex border-t border-el-outline-variant">
                <button
                  onClick={() => { handleStartEdit(selectedKey); setSelectedKey(null); }}
                  className="flex-1 p-3 text-el-secondary text-[14px] font-semibold hover:bg-el-primary/5 border-l border-el-outline-variant transition-colors"
                >
                  تعديل البيانات
                </button>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="flex-1 p-3 text-el-on-surface-variant text-[14px] font-medium hover:bg-el-surface-container transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* صفحة تقييم النفوذ والتأثير (مستقلة) */}
      {showEvaluate && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-el-surface rounded-lg border border-el-outline-variant w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-el-surface border-b border-el-outline-variant p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-el-on-surface flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500 dark:text-yellow-400" /> تقييم النفوذ والتأثير
              </h3>
              <button onClick={() => { setShowEvaluate(false); setEvalKeyId(null); }} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <EvaluateKeyPage preselectedKey={keys.find(k => k.id === evalKeyId) || null} onClose={() => { setShowEvaluate(false); setEvalKeyId(null); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

