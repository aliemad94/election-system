'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, Star, Phone, MapPin, ChevronDown, CheckCircle, XCircle, X, Users, Eye,
  User, MessageSquare, Key, Calendar, Edit2, ShieldAlert, Award, FileText, Trash2
} from 'lucide-react';

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء', 'الغراف'];

interface Tribe {
  id: string;
  name: string;
  influence: number;
  district: string | null;
}

interface Voter {
  id: string;
  firstName: string;
  fatherName: string | null;
  grandfatherName: string | null;
  fourthName: string | null;
  fullName: string;
  phoneNumber: string;
  phone: string | null;
  nationalId: string | null;
  nickname: string | null;
  gender: string | null;
  birthDate: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  education: string | null;
  specialization: string | null;
  profession: string | null;
  maritalStatus: string | null;
  familySize: number | null;
  socialMedia: any;
  firstContactDate: string | null;
  lastContactDate: string | null;
  contactResult: string | null;
  nextAction: string | null;
  followUpDate: string | null;
  relationship: string | null;
  influenceRate: number;
  isPrimaryFollow: boolean;
  supportDegree: number;
  supportReason: string | null;
  governorate: string;
  district: string;
  subDistrict: string | null;
  area: string | null;
  pollingCenter: string | null;
  ballotStation: string | null;
  pollingCenterId: string | null;
  pollingCenterName: string | null;
  tribeId: string | null;
  tribe: { id: string; name: string; influence: number } | null;
  electoralKey?: { id: string; code: string; firstName: string; fatherName: string | null } | null;
  electionKey?: { id: string; code: string; firstName: string; fatherName: string | null; keyCode?: string } | null;
  keyId?: string | null;
  electoralKeyId?: string | null;
  confidenceScore: number;
  confidencePoints: number;
  votedStatus: boolean;
  votedAt: string | null;
  gpsVerified: boolean;
  latitude: number | null;
  longitude: number | null;
  isRegistryVerified: boolean;
  registryVoterId: string | null;
  voterCategory: string;
  registeredBy: { id: string; name: string } | null;
  createdAt: string;
}

const EDUCATION_LEVELS = ['يقرا ويكتب', 'ابتدائية', 'متوسطة', 'اعدادية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
const MARITAL_STATUS = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
const GENDER_OPTIONS = ['ذكر', 'أنثى'];
const CATEGORY_OPTIONS = ['مؤيد', 'محايد', 'ضعيف'];

const defaultForm = {
  firstName: '', fatherName: '', grandfatherName: '', fourthName: '',
  phoneNumber: '', nationalId: '', district: 'الغراف', subDistrict: '', area: '',
  pollingCenterId: '', pollingCenterName: '', tribeId: '', confidenceScore: 3,
  nickname: '', gender: 'ذكر', dateOfBirth: '', educationLevel: '',
  specialization: '', profession: '', maritalStatus: '', familySize: 0,
  firstContactDate: '', voterCategory: 'محايد', electoralKeyId: '',
  socialFacebook: '', socialTelegram: '', socialWhatsApp: '',
  supportReason: '', relationship: '', influenceRate: 50, isPrimaryFollow: true,
  lastContactDate: '', contactResult: '', nextAction: '', followUpDate: '',
  latitude: '', longitude: '', gpsVerified: false, isRegistryVerified: false,
  registryVoterId: '',
};

export default function VoterRegistration() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [electoralKeys, setElectoralKeys] = useState<{ id: string; code: string; firstName: string; fatherName: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVoted, setFilterVoted] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchTribes = useCallback(async () => {
    try {
      const res = await fetch('/api/tribes');
      const data = await res.json();
      setTribes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tribes:', err);
    }
  }, []);

  const fetchElectoralKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/electoral-keys');
      const data = await res.json();
      setElectoralKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching electoral keys:', err);
      setElectoralKeys([]);
    }
  }, []);

  const fetchVoters = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterVoted) params.set('votedStatus', filterVoted);
      const res = await fetch(`/api/voters?${params.toString()}`);
      const data = await res.json();
      setVoters(data.voters || []);
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterDistrict, filterVoted]);

  useEffect(() => {
    fetchTribes();
    fetchElectoralKeys();
  }, [fetchTribes, fetchElectoralKeys]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  const parseSocialMedia = (socialStr: any) => {
    if (!socialStr) return { facebook: '', telegram: '', whatsapp: '' };
    if (typeof socialStr === 'object') {
      return {
        facebook: socialStr.facebook || '',
        telegram: socialStr.telegram || '',
        whatsapp: socialStr.whatsapp || '',
      };
    }
    try {
      const obj = JSON.parse(socialStr);
      return {
        facebook: obj.facebook || '',
        telegram: obj.telegram || '',
        whatsapp: obj.whatsapp || '',
      };
    } catch {
      return { facebook: '', telegram: '', whatsapp: '' };
    }
  };

  const calculateAge = (dobString: string | null) => {
    if (!dobString) return 'غير محدد';
    try {
      const birthDate = new Date(dobString);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return isNaN(age) ? 'غير محدد' : `${age} سنة`;
    } catch {
      return 'غير محدد';
    }
  };

  const handleEditClick = (voter: Voter) => {
    setIsEditMode(true);
    setEditingId(voter.id);
    const social = parseSocialMedia(voter.socialMedia);
    
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    setForm({
      firstName: voter.firstName || '',
      fatherName: voter.fatherName || '',
      grandfatherName: voter.grandfatherName || '',
      fourthName: voter.fourthName || '',
      phoneNumber: voter.phone || voter.phoneNumber || '',
      nationalId: voter.nationalId || '',
      district: voter.district || 'الغراف',
      subDistrict: voter.subDistrict || '',
      area: voter.area || '',
      pollingCenterId: voter.pollingCenterId || voter.ballotStation || '',
      pollingCenterName: voter.pollingCenterName || voter.pollingCenter || '',
      tribeId: voter.tribeId || '',
      confidenceScore: voter.supportDegree || voter.confidenceScore || 3,
      nickname: voter.nickname || '',
      gender: voter.gender || 'ذكر',
      dateOfBirth: formatDate(voter.birthDate || voter.dateOfBirth),
      educationLevel: voter.education || voter.educationLevel || '',
      specialization: voter.specialization || '',
      profession: voter.profession || '',
      maritalStatus: voter.maritalStatus || '',
      familySize: voter.familySize || 0,
      firstContactDate: formatDate(voter.firstContactDate),
      voterCategory: voter.voterCategory || 'محايد',
      electoralKeyId: voter.electoralKeyId || '',
      socialFacebook: social.facebook,
      socialTelegram: social.telegram,
      socialWhatsApp: social.whatsapp,
      supportReason: voter.supportReason || '',
      relationship: voter.relationship || '',
      influenceRate: voter.influenceRate || 50,
      isPrimaryFollow: voter.isPrimaryFollow !== undefined ? voter.isPrimaryFollow : true,
      lastContactDate: formatDate(voter.lastContactDate),
      contactResult: voter.contactResult || '',
      nextAction: voter.nextAction || '',
      followUpDate: formatDate(voter.followUpDate),
      latitude: voter.latitude !== null && voter.latitude !== undefined ? String(voter.latitude) : '',
      longitude: voter.longitude !== null && voter.longitude !== undefined ? String(voter.longitude) : '',
      gpsVerified: voter.gpsVerified || false,
      isRegistryVerified: voter.isRegistryVerified || false,
      registryVoterId: voter.registryVoterId || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (voterId: string, voterName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الناخب ${voterName} نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/voters/${voterId}`, { method: 'DELETE' });
      if (res.ok) {
        setFormMessage({ type: 'success', text: `تم حذف الناخب ${voterName} بنجاح` });
        fetchVoters();
      } else {
        setFormMessage({ type: 'error', text: 'فشل في حذف الناخب' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phoneNumber.length !== 11) {
      setFormMessage({ type: 'error', text: 'رقم الهاتف يجب أن يكون 11 رقماً' });
      return;
    }
    setSubmitting(true);
    setFormMessage(null);

    try {
      const socialMediaString = JSON.stringify({
        facebook: form.socialFacebook,
        telegram: form.socialTelegram,
        whatsapp: form.socialWhatsApp,
      });

      const fullName = [form.firstName, form.fatherName, form.grandfatherName, form.fourthName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const url = isEditMode ? `/api/voters/${editingId}` : '/api/voters';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fullName,
          socialMedia: socialMediaString,
          governorate: 'ذي قار',
          tribeId: form.tribeId || undefined,
          nationalId: form.nationalId || undefined,
          electoralKeyId: form.electoralKeyId || undefined,
          keyId: form.electoralKeyId || undefined,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          gpsVerified: Boolean(form.gpsVerified),
          isRegistryVerified: Boolean(form.isRegistryVerified),
          registryVoterId: form.registryVoterId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormMessage({
          type: 'success',
          text: isEditMode ? `تم تحديث بيانات الناخب ${fullName} بنجاح` : `تم تسجيل الناخب ${fullName} بنجاح`
        });
        setForm(defaultForm);
        setIsEditMode(false);
        setEditingId(null);
        setShowForm(false);
        fetchVoters();
      } else {
        setFormMessage({ type: 'error', text: data.error || 'فشل الإجراء المطلوبة' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVote = async (voterId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/voters/${voterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votedStatus: !currentStatus }),
      });
      fetchVoters();
    } catch (err) {
      console.error('Error updating voter status:', err);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setFormMessage(null);
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <Users className="w-7 h-7 text-el-primary" /> إدارة وسجل الناخبين
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            إدخال، تعديل، وتبويب ملفات الناخبين جغرافياً وعشائرياً للتخطيط ليوم الاقتراع بدقة
          </p>
        </div>
        <div className="flex gap-2">
          {showForm && (
            <button
              onClick={resetForm}
              className="bg-el-surface-container border border-el-outline-variant text-el-on-surface px-4 py-2 rounded text-[14px] leading-[20px] font-medium hover:bg-el-surface-container-high transition-all"
            >
              إلغاء وتفريغ الاستمارة
            </button>
          )}
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                setShowForm(true);
              }
            }}
            className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <UserPlus className="w-[18px] h-[18px]" />
            <span className="text-[14px] leading-[20px] font-medium">
              {showForm ? (isEditMode ? 'عرض سجل الناخبين' : 'عرض سجل الناخبين') : 'تسجيل ناخب جديد'}
            </span>
          </button>
        </div>
      </div>

      {showForm && (
        <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-5 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-el-outline-variant pb-3">
            <h3 className="text-[18px] leading-[24px] font-bold text-el-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {isEditMode ? `تعديل استمارة الناخب: ${form.firstName} ${form.fatherName}` : 'استمارة الناخب الشاملة (6 أقسام)'}
            </h3>
            <span className="text-[11px] text-el-on-surface-variant/70 bg-el-surface-container px-3 py-1 rounded">
              محافظة ذي قار
            </span>
          </div>

          {formMessage && (
            <div className={`p-3 rounded flex items-center gap-2 text-[12px] leading-[16px] ${
              formMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {formMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-el-secondary" /> 1. البيانات الشخصية والأساسية للناخب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الاسم الأول *</label>
                    <input required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم الأب</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم الجد</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.grandfatherName} onChange={(e) => setForm({ ...form, grandfatherName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الاسم الرابع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.fourthName} onChange={(e) => setForm({ ...form, fourthName: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اللقب / الشهرة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الجنس</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} >
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">تاريخ الميلاد (العمر)</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الشهادة</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} >
                        <option value="">اختر التحصيل</option>
                        {EDUCATION_LEVELS.map((el) => <option key={el} value={el}>{el}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الحالة الاجتماعية</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })} >
                        <option value="">اختر الحالة</option>
                        {MARITAL_STATUS.map((ms) => <option key={ms} value={ms}>{ms}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المهنة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">عدد أفراد الأسرة</label>
                    <input type="number" min="0" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.familySize || ''} onChange={(e) => setForm({ ...form, familySize: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-el-secondary" /> 2. السكن والدائرة الانتخابية للناخب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">القضاء *</label>
                    <div className="relative">
                      <select required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} >
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الناحية / النافذة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.subDistrict} onChange={(e) => setForm({ ...form, subDistrict: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المنطقة (الحي أو القرية)</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="مثال: حي الحسين أو قرية البو صالح" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم مركز الاقتراع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.pollingCenterId} onChange={(e) => setForm({ ...form, pollingCenterId: e.target.value })} placeholder="مثال: 45620" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم مركز الاقتراع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.pollingCenterName} onChange={(e) => setForm({ ...form, pollingCenterName: e.target.value })} placeholder="مثال: مدرسة بابل الابتدائية" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">العشيرة المرتبطة</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.tribeId} onChange={(e) => setForm({ ...form, tribeId: e.target.value })} >
                        <option value="">اختر العشيرة (تلقائي حسب القضاء)</option>
                        {tribes.filter(t => !form.district || t.district === form.district).map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-el-outline-variant/40 pt-2 mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isRegistryVerified" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                        checked={form.isRegistryVerified} onChange={(e) => setForm({ ...form, isRegistryVerified: e.target.checked })} />
                      <label htmlFor="isRegistryVerified" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                        تم التحقق والمطابقة مع سجلات المفوضية الرسمية؟
                      </label>
                    </div>
                    {form.isRegistryVerified && (
                      <div>
                        <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الناخب الرسمي (المفوضية)</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                          value={form.registryVoterId} onChange={(e) => setForm({ ...form, registryVoterId: e.target.value })} placeholder="مثال: 10984532" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-el-secondary" /> 3. بيانات الاتصال والتواصل للناخب
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الموبايل *</label>
                    <input required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.phoneNumber} placeholder="07XXXXXXXXX"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 11) setForm({ ...form, phoneNumber: val });
                      }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الهوية الوطنية</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="أدخل رقم الهوية" />
                  </div>
                  <div className="border border-el-outline-variant/60 rounded p-3 bg-el-surface space-y-2">
                    <span className="block text-[10px] font-bold text-el-primary">منصات التواصل الاجتماعي للناخب</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">فيسبوك</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط الصفحة"
                          value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">تلكرام</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="معرف المستخدم"
                          value={form.socialTelegram} onChange={e => setForm({ ...form, socialTelegram: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">واتساب</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رقم واتساب"
                          value={form.socialWhatsApp} onChange={e => setForm({ ...form, socialWhatsApp: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-el-secondary" /> 4. التصنيف الانتخابي والتقييم الداخلي
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">فئة الناخب (التصنيف العام)</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.voterCategory} onChange={(e) => setForm({ ...form, voterCategory: e.target.value })} >
                        {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">درجة دعم وتأييد الناخب (1 - 5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setForm({ ...form, confidenceScore: s })}
                          className={`flex-1 h-8 border rounded text-[11px] font-medium transition-all ${
                            form.confidenceScore >= s
                              ? 'border-amber-500 bg-amber-500 text-white font-bold'
                              : 'border-el-outline-variant text-el-on-surface-variant'
                          }`} >
                          {s} ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">سبب الدعم أو التحفّظ</label>
                    <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[11px] focus:outline-none focus:border-el-primary h-16 resize-none"
                      value={form.supportReason} onChange={(e) => setForm({ ...form, supportReason: e.target.value })} placeholder="أدخل أسباب تأييده أو تحفظاته الانتخابية..." />
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-el-secondary" /> 5. بيانات المفتاح الانتخابي المسؤول
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المفتاح الانتخابي المسؤول</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.electoralKeyId} onChange={(e) => setForm({ ...form, electoralKeyId: e.target.value })} >
                        <option value="">بدون مفتاح (غير مرتبط حالياً)</option>
                        {electoralKeys.map((ek) => (
                          <option key={ek.id} value={ek.id}>{ek.code} - {ek.firstName} {ek.fatherName || ''}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">علاقة المفتاح بالناخب</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="مثال: قرابة، صداقة، عمل" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">نسبة تأثير المفتاح (0 - 100%)</label>
                      <input type="number" min="0" max="100" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.influenceRate} onChange={(e) => setForm({ ...form, influenceRate: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isPrimaryFollow" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                      checked={form.isPrimaryFollow} onChange={(e) => setForm({ ...form, isPrimaryFollow: e.target.checked })} />
                    <label htmlFor="isPrimaryFollow" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                      هل هذا المفتاح هو المتابع الرئيسي والمباشر للناخب؟
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-el-secondary" /> 6. سجل التواصل والتحديث والمتابعة
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">أول تواصل تاريخي</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.firstContactDate} onChange={(e) => setForm({ ...form, firstContactDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">آخر تواصل فعلي</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.lastContactDate} onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">نتيجة التواصل الأخير</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.contactResult} onChange={(e) => setForm({ ...form, contactResult: e.target.value })} placeholder="مثال: مضمون التأييد، متردد، يطلب خدمة معينة..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الإجراء القادم المطلوب</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="مثال: تلبية طلب الخدمة الصحية، اتصال تذكيري..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">موعد المتابعة القادمة</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                  </div>
                  <div className="col-span-2 border-t border-el-outline-variant/40 pt-2 mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="gpsVerified" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                        checked={form.gpsVerified} onChange={(e) => setForm({ ...form, gpsVerified: e.target.checked })} />
                      <label htmlFor="gpsVerified" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                        تأكيد المطابقة والتدقيق الجغرافي (GPS Verified)؟
                      </label>
                    </div>
                    {form.gpsVerified && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">خط العرض (Latitude)</label>
                          <input type="number" step="any" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                            value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="31.123456" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">خط الطول (Longitude)</label>
                          <input type="number" step="any" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                            value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="46.123456" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-el-outline-variant">
              <button
                type="button"
                onClick={resetForm}
                className="bg-el-surface-container border border-el-outline-variant text-el-on-surface px-6 py-2.5 rounded text-[14px] font-medium hover:bg-el-surface-container-high transition-all"
              >
                تفريغ الحقول
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-el-primary text-el-on-primary px-8 py-2.5 rounded flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 font-bold shadow"
              >
                {submitting ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'تسجيل الناخب وحفظ البيانات')}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-9 pl-3 pr-9 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث بالاسم أو رقم الهاتف أو الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-9 pr-3 py-1 h-9 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-9 pr-3 py-1 h-9 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterVoted}
            onChange={(e) => setFilterVoted(e.target.value)}
          >
            <option value="">كل حالات التصويت</option>
            <option value="true">صوّت فعلياً</option>
            <option value="false">لم يصوت بعد</option>
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant font-bold">جاري تحميل سجلات الناخبين...</div>
      ) : voters.length === 0 ? (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-12 text-center text-el-on-surface-variant">
          <ShieldAlert className="w-12 h-12 text-el-outline/50 mx-auto mb-2" />
          <p className="text-[14px] font-bold">لا يوجد ناخبين متطابقين للبحث</p>
          <p className="text-[11px] mt-1 text-el-on-surface-variant/70">قم بتسجيل ناخب جديد للبدء بالبناء الإحصائي.</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-[11px] font-bold tracking-[0.05em] text-el-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">القضاء والسكن</th>
                  <th className="px-4 py-3 text-center">التحصيل والشهادة</th>
                  <th className="px-4 py-3 text-center">درجة التأييد</th>
                  <th className="px-4 py-3 text-center">المفتاح المسؤول</th>
                  <th className="px-4 py-3 text-center">حالة التصويت يوم الاقتراع</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50 text-[12px] leading-[16px]">
                {voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-el-surface-container-lowest/50 transition-colors h-11">
                    <td className="px-4 py-2 font-semibold text-el-on-surface">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {voter.fullName}
                        {voter.nickname && <span className="text-el-on-surface-variant text-[10px] mr-1">({voter.nickname})</span>}
                        {voter.gpsVerified && <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold px-1 rounded" title="موقع جغرافي مؤكد">GPS</span>}
                        {voter.isRegistryVerified && <span className="bg-purple-100 text-purple-800 text-[8px] font-extrabold px-1 rounded" title="سجل المفوضية مؤكد">رسمي</span>}
                      </div>
                      <div className="text-[10px] text-el-on-surface-variant/60 font-normal mt-0.5">
                        {voter.gender} · {calculateAge(voter.birthDate || voter.dateOfBirth)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-el-on-surface-variant font-mono">{voter.phone || voter.phoneNumber || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{voter.district}</div>
                      <div className="text-[10px] text-el-on-surface-variant/60">{voter.area || voter.subDistrict || '—'}</div>
                    </td>
                    <td className="px-4 py-2 text-center">{voter.education || voter.educationLevel || '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < (voter.supportDegree || voter.confidenceScore || 3) ? 'text-amber-500 fill-amber-500' : 'text-el-outline-variant'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {voter.electoralKey ? (
                        <span className="bg-el-surface-container text-el-on-surface font-semibold px-2 py-0.5 rounded text-[10px]">
                          {voter.electoralKey.code} - {voter.electoralKey.firstName}
                        </span>
                      ) : (
                        <span className="text-el-outline/50 text-[10px]">بدون مفتاح</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {voter.votedStatus ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> صوّت فعلياً
                        </span>
                      ) : (
                        <span className="bg-el-surface-container text-el-on-surface-variant/60 px-3 py-1 rounded-full text-[10px]">
                          لم يصوت بعد
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedVoter(voter)}
                          className="text-el-primary p-1.5 hover:bg-el-surface-container-high rounded transition-all"
                          title="عرض ملف التفاصيل الكامل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(voter)}
                          className="text-el-secondary p-1.5 hover:bg-el-surface-container-high rounded transition-all"
                          title="تعديل بيانات الناخب"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(voter.id, voter.fullName)}
                          className="text-red-500 p-1.5 hover:bg-red-50 rounded transition-all"
                          title="حذف الناخب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVote(voter.id, voter.votedStatus)}
                          className={`p-1.5 rounded transition-all ${voter.votedStatus ? 'text-el-on-surface-variant hover:bg-el-surface-container-high' : 'text-el-primary hover:bg-el-primary-container'}`}
                          title={voter.votedStatus ? 'إلغاء التصويت' : 'تأكيد التصويت'}
                        >
                          {voter.votedStatus ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-el-outline-variant text-[12px] leading-[16px] text-el-on-surface-variant text-center">
            إجمالي الناخبين المسجلين: <b className="text-el-primary font-mono">{voters.length}</b> ناخب في ذي قار
          </div>
        </div>
      )}

      {selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-el-outline-variant bg-el-surface-container-low">
              <div>
                <h3 className="text-[20px] font-bold text-el-primary flex items-center gap-2">
                  <User className="w-5 h-5 text-el-secondary" /> ملف الناخب الشامل: {selectedVoter.firstName} {selectedVoter.fatherName || ''} {selectedVoter.grandfatherName || ''} {selectedVoter.fourthName || ''}
                </h3>
                <p className="text-[11px] text-el-on-surface-variant/75 mt-1">
                  الرقم التعريفي للناخب: <span className="font-mono">{selectedVoter.id}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedVoter(null)}
                className="p-1.5 hover:bg-el-surface-container-high rounded-full transition-all text-el-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body - 6 Sections Grid */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. البيانات الشخصية والأساسية */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-el-secondary" /> 1. البيانات الشخصية والأساسية للناخب
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الاسم الكامل:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.firstName} {selectedVoter.fatherName || ''} {selectedVoter.grandfatherName || ''} {selectedVoter.fourthName || ''}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">اللقب / الشهرة:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.nickname || selectedVoter.tribe?.name || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الجنس:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.gender || 'ذكر'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">العمر:</span>
                      <span className="font-medium text-el-on-surface">{calculateAge(selectedVoter.birthDate || selectedVoter.dateOfBirth)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">التحصيل الدراسي:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.education || selectedVoter.educationLevel || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المهنة:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.profession || 'غير محدد'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">الحالة الاجتماعية:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.maritalStatus || 'غير محدد'} {selectedVoter.familySize ? `(عدد أفراد الأسرة: ${selectedVoter.familySize})` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* 2. السكن والدائرة الانتخابية */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-el-secondary" /> 2. السكن والدائرة الانتخابية
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المحافظة:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.governorate || 'ذي قار'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">القضاء:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.district || 'الغراف'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الناحية:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.subDistrict || 'المركز'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المنطقة (الحي أو القرية):</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.area || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رمز مركز الاقتراع:</span>
                      <span className="font-mono text-el-on-surface">{selectedVoter.pollingCenterId || selectedVoter.ballotStation || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">اسم مركز الاقتراع:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.pollingCenterName || selectedVoter.pollingCenter || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">العشيرة المرتبطة:</span>
                      <span className="font-bold text-el-primary">{selectedVoter.tribe?.name || 'غير حدد'}</span>
                    </div>
                    <div className="col-span-2 border-t border-el-outline-variant/30 pt-2 mt-1 space-y-1">
                      <span className="block text-[10px] text-el-on-surface-variant/70">تحقق المفوضية:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        selectedVoter.isRegistryVerified
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-el-surface-container text-el-on-surface-variant/60'
                      }`}>
                        {selectedVoter.isRegistryVerified
                          ? `مؤكد ومطابق (رقم الناخب: ${selectedVoter.registryVoterId || '—'})`
                          : 'غير متحقق منه رسمياً في السجل الفيدرالي'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. بيانات الاتصال والتواصل */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-el-secondary" /> 3. بيانات الاتصال والتواصل
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رقم الهاتف:</span>
                      <span className="font-mono font-bold text-el-primary">{selectedVoter.phone || selectedVoter.phoneNumber || 'غير متوفر'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رقم الهوية الوطنية:</span>
                      <span className="font-mono text-el-on-surface">{selectedVoter.nationalId || 'غير متوفر'}</span>
                    </div>
                    <div className="col-span-2 bg-el-surface p-2.5 rounded border border-el-outline-variant/50 space-y-2">
                      <span className="block text-[10px] font-bold text-el-on-surface-variant">حسابات التواصل الاجتماعي:</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">فيسبوك:</span>
                          <span className="font-medium text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).facebook || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">تليجرام:</span>
                          <span className="font-mono text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).telegram || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">واتساب:</span>
                          <span className="font-mono text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).whatsapp || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. التصنيف الانتخابي والتقييم الداخلي */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-el-secondary" /> 4. التصنيف الانتخابي والتقييم الداخلي
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">فئة الناخب:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                        selectedVoter.voterCategory === 'مؤيد'
                          ? 'bg-green-100 text-green-800'
                          : selectedVoter.voterCategory === 'ضعيف'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>{selectedVoter.voterCategory || 'محايد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">درجة الدعم والتأييد:</span>
                      <span className="font-medium text-amber-500 font-bold flex items-center gap-1">
                        {selectedVoter.supportDegree || selectedVoter.confidenceScore || 3} ⭐
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">أسباب الدعم / التحفظات:</span>
                      <span className="font-medium text-el-on-surface block bg-el-surface p-2 rounded border border-el-outline-variant/50 min-h-[50px] leading-relaxed">
                        {selectedVoter.supportReason || 'لا توجد ملاحظات مسجلة حول سبب الدعم.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. بيانات المفتاح الانتخابي */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-el-secondary" /> 5. بيانات المفتاح الانتخابي (المسؤول عن الناخب)
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">المفتاح المسؤول:</span>
                      {selectedVoter.electoralKey || selectedVoter.electionKey ? (
                        <span className="font-bold text-el-primary bg-el-surface-container px-2 py-1 rounded inline-block mt-0.5">
                          {selectedVoter.electoralKey
                            ? `${selectedVoter.electoralKey.code} - ${selectedVoter.electoralKey.firstName} ${selectedVoter.electoralKey.fatherName || ''}`
                            : `${selectedVoter.electionKey?.keyCode || ''} - ${selectedVoter.electionKey?.firstName || ''} ${selectedVoter.electionKey?.fatherName || ''}`
                          }
                        </span>
                      ) : (
                        <span className="text-el-on-surface-variant/50">غير مرتبط بمفتاح انتخابي حالياً</span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">علاقة المفتاح بالناخب:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.relationship || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">نسبة التأثير المقدرة:</span>
                      <span className="font-bold text-el-on-surface font-mono">{selectedVoter.influenceRate ?? 50}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">المتابعة المباشرة:</span>
                      <span className="font-bold text-el-on-surface">
                        {selectedVoter.isPrimaryFollow ? 'نعم - المفتاح هو المتابع المباشر والرئيسي' : 'لا - توجد قنوات متابعة بديلة'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. سجل التحديث والمتابعة */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-el-secondary" /> 6. سجل السجل والتحديث والمتابعة
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">تاريخ أول تواصل:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.firstContactDate ? new Date(selectedVoter.firstContactDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">تاريخ آخر تواصل:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.lastContactDate ? new Date(selectedVoter.lastContactDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">نتيجة التواصل الأخير:</span>
                      <span className="font-medium text-el-on-surface block bg-el-surface p-2 rounded border border-el-outline-variant/50">
                        {selectedVoter.contactResult || 'لم يتم تسجيل نتائج.'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الإجراء القادم المطلوب:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.nextAction || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">موعد المتابعة القادمة:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.followUpDate ? new Date(selectedVoter.followUpDate).toLocaleDateString('ar-EG') : '—'}</span>
                    </div>
                    <div className="col-span-2 border-t border-el-outline-variant/30 pt-2 mt-1 space-y-1">
                      <span className="block text-[10px] text-el-on-surface-variant/70">التدقيق الجغرافي:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        selectedVoter.gpsVerified
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-el-surface-container text-el-on-surface-variant/60'
                      }`}>
                        {selectedVoter.gpsVerified
                          ? `موقع مؤكد (GPS Verified - الإحداثيات: Lat: ${selectedVoter.latitude ?? '—'}, Lon: ${selectedVoter.longitude ?? '—'})`
                          : 'لم يتم تدقيق الموقع الجغرافي'
                        }
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-el-outline-variant bg-el-surface-container-low text-left">
              <button
                onClick={() => {
                  handleEditClick(selectedVoter);
                  setSelectedVoter(null);
                }}
                className="bg-el-secondary text-el-on-secondary px-4 py-2 rounded text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" /> تعديل البيانات
              </button>
              <button
                onClick={() => setSelectedVoter(null)}
                className="bg-el-primary text-el-on-primary px-6 py-2 rounded text-[13px] font-bold hover:opacity-90 transition-all"
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
