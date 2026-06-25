'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Send,
  Users,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface Tribe {
  id: string;
  name: string;
  district: string | null;
  voterCount: number;
}

interface VoterPreview {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  pollingCenter: string;
  tribeName: string;
}

interface CampaignHistory {
  id: string;
  message: string;
  recipients: number;
  filter: string;
  createdAt: string;
  username: string;
}

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'الغراف', 'البطحاء'];

export default function SMSBroadcasting() {
  const [confidenceScore, setConfidenceScore] = useState<number[]>([3, 4, 5]);
  const [smsText, setSmsText] = useState('مرحباً يا {voter_name}، نود تذكيركم بمساندة حملتنا الانتخابية ومراجعة مركز اقتراعكم في {polling_center}. صوتكم حاسم لمستقبل ذي قار.');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [votedFilter, setVotedFilter] = useState<'all' | 'true' | 'false'>('false');
  const [influenceValue, setInfluenceValue] = useState(5);

  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [previewVoters, setPreviewVoters] = useState<VoterPreview[]>([]);
  const [totalReach, setTotalReach] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [pastCampaigns, setPastCampaigns] = useState<CampaignHistory[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [sending, setSending] = useState(false);

  const charCount = smsText.length;
  const smsParts = Math.ceil(charCount / 70) || 1; // 70 chars for Unicode (Arabic) SMS parts

  // 1. Load Tribes for selector
  useEffect(() => {
    let cancelled = false;
    async function loadTribes() {
      try {
        const res = await fetch('/api/tribes');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setTribes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching tribes:', err);
      }
    }
    loadTribes();
    return () => { cancelled = true; };
  }, []);

  // 2. Load dynamic voter previews based on filters
  useEffect(() => {
    let active = true;
    async function fetchPreview() {
      setLoadingPreview(true);
      try {
        const params = new URLSearchParams();
        if (selectedDistrict) params.set('district', selectedDistrict);
        if (selectedTribe) params.set('tribeId', selectedTribe);
        if (confidenceScore.length > 0) params.set('supportDegrees', confidenceScore.join(','));
        if (votedFilter !== 'all') params.set('voted', votedFilter);

        const res = await fetch(`/api/sms/preview?${params.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          setTotalReach(data.totalCount || 0);
          setPreviewVoters(data.voters || []);
        }
      } catch (err) {
        console.error('Error fetching SMS preview:', err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchPreview();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [selectedDistrict, selectedTribe, confidenceScore, votedFilter]);

  // 3. Fetch past campaign history
  const fetchHistory = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch('/api/sms');
      if (res.ok) {
        const data = await res.json();
        setPastCampaigns(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredTribes = tribes.filter(
    (t) => !selectedDistrict || t.district === selectedDistrict
  );

  // 4. Personalized message preview calculation
  const renderedPreviewText = useMemo(() => {
    if (!smsText) return 'اكتب رسالة لمعاينتها هنا...';
    let text = smsText;
    const firstVoter = previewVoters[0];
    const name = firstVoter ? firstVoter.fullName : 'أحمد عبد الله الحسيني';
    const center = firstVoter ? firstVoter.pollingCenter : 'مدرسة الكندي الابتدائية';
    const tribe = firstVoter ? firstVoter.tribeName : 'عشيرة آل خاقان';

    text = text.replace(/{voter_name}/g, name);
    text = text.replace(/{polling_center}/g, center);
    text = text.replace(/{tribe}/g, tribe);
    return text;
  }, [smsText, previewVoters]);

  // 5. Send campaign handler
  const handleLaunch = async () => {
    if (!smsText.trim()) {
      toast.error('يرجى كتابة نص الرسالة أولاً');
      return;
    }
    if (totalReach === 0) {
      toast.error('لا يوجد مستلمون مطابقون للفلاتر المحددة حالياً');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: smsText,
          district: selectedDistrict || undefined,
          tribeId: selectedTribe || undefined,
          minSupportDegree: confidenceScore.length > 0 ? Math.min(...confidenceScore) : undefined,
          status: undefined,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`✅ تم تسجيل وإطلاق حملة البث لـ ${totalReach} ناخب بنجاح!`);
        fetchHistory(); // reload campaign history list
      } else {
        const err = await res.json();
        toast.error(err.error || 'فشل إطلاق حملة البث');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSending(false);
    }
  };

  const insertPlaceholder = (ph: string) => {
    setSmsText((prev) => prev + ph);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[var(--el-line)] pb-3">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-el-primary flex items-center gap-2">
            <Radio className="w-5 h-5 text-el-primary animate-pulse" /> لوحة بث وإرسال رسائل SMS الذكية
          </h2>
          <p className="text-[11.5px] text-[var(--el-muted)] mt-1">
            قم بتكوين وإطلاق حملات رسائل SMS المخصصة والمستهدفة للناخبين والمفاتيح في محافظة ذي قار.
          </p>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Right Column: Audience Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded-lg p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--el-line)] pb-2 mb-1">
              <h3 className="text-xs font-bold text-[var(--el-text)]">فلاتر الاستهداف الذكي</h3>
              <span className="text-[10px] text-el-secondary bg-el-secondary/10 px-2 py-0.5 rounded font-bold">محدد الجمهور</span>
            </div>

            {/* Governorate/District selector */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--el-text)] mb-1">المحافظة / القضاء</label>
              <select
                className="w-full h-8 px-2 bg-[var(--el-surface-container)] text-[var(--el-text)] border border-[var(--el-line)] rounded text-xs outline-none cursor-pointer focus:border-el-primary focus:ring-1 focus:ring-el-primary"
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedTribe(''); }}
              >
                <option value="">جميع أقضية ذي قار</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Tribe targeting */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--el-text)] mb-1">العشيرة الانتخابية</label>
              <select
                className="w-full h-8 px-2 bg-[var(--el-surface-container)] text-[var(--el-text)] border border-[var(--el-line)] rounded text-xs outline-none cursor-pointer focus:border-el-primary focus:ring-1 focus:ring-el-primary"
                value={selectedTribe}
                onChange={(e) => setSelectedTribe(e.target.value)}
              >
                <option value="">جميع العشائر</option>
                {filteredTribes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.voterCount} ناخب)</option>
                ))}
              </select>
            </div>

            {/* Confidence Score filter */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--el-text)] mb-1">درجة التأييد والولاء (1-5 نجوم)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((score) => {
                  const active = confidenceScore.includes(score);
                  return (
                    <button
                      key={score}
                      onClick={() => {
                        if (active) {
                          setConfidenceScore(confidenceScore.filter((s) => s !== score));
                        } else {
                          setConfidenceScore([...confidenceScore, score]);
                        }
                      }}
                      className={`flex-1 h-8 rounded text-[11.5px] font-mono font-bold transition-all border cursor-pointer ${
                        active
                          ? 'bg-el-secondary border-el-secondary text-white'
                          : 'border-[var(--el-line)] text-[var(--el-muted)] hover:bg-[var(--el-surface-container)]'
                      }`}
                    >
                      {score}★
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voted Day status */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--el-text)] mb-1.5">حالة حضور الناخب وتصويته</label>
              <div className="grid grid-cols-3 gap-1 bg-[var(--el-surface-container)] p-0.5 rounded border border-[var(--el-line)]">
                <button
                  onClick={() => setVotedFilter('all')}
                  className={`py-1 text-[10px] sm:text-xs font-bold rounded cursor-pointer transition-colors ${votedFilter === 'all' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:text-[var(--el-text)]'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setVotedFilter('false')}
                  className={`py-1 text-[10px] sm:text-xs font-bold rounded cursor-pointer transition-colors ${votedFilter === 'false' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:text-[var(--el-text)]'}`}
                >
                  لم يصوت
                </button>
                <button
                  onClick={() => setVotedFilter('true')}
                  className={`py-1 text-[10px] sm:text-xs font-bold rounded cursor-pointer transition-colors ${votedFilter === 'true' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:text-[var(--el-text)]'}`}
                >
                  صوّت
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--el-line)] flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--el-muted)] flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-el-primary" /> حجم المستهدفين الحالي:
              </span>
              <span className="text-sm font-extrabold text-el-primary font-mono tnum">
                {loadingPreview ? '...' : totalReach.toLocaleString()} ناخب
              </span>
            </div>
          </div>
        </div>

        {/* Center & Left Column: Composer, Preview & History (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Message Composer */}
            <div className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded-lg flex flex-col overflow-hidden">
              <div className="bg-[var(--el-surface-container)] px-3 py-2 border-b border-[var(--el-line)] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[var(--el-text)]">منشئ الرسالة</h3>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => insertPlaceholder('{voter_name}')}
                    className="text-[9.5px] font-bold border border-[var(--el-line)] px-2 py-0.5 rounded bg-[var(--el-surface)] hover:bg-[var(--el-surface-container-high)] text-[var(--el-text)] cursor-pointer"
                  >
                    اسم الناخب
                  </button>
                  <button
                    onClick={() => insertPlaceholder('{polling_center}')}
                    className="text-[9.5px] font-bold border border-[var(--el-line)] px-2 py-0.5 rounded bg-[var(--el-surface)] hover:bg-[var(--el-surface-container-high)] text-[var(--el-text)] cursor-pointer"
                  >
                    المركز
                  </button>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <textarea
                  className="w-full flex-grow min-h-[100px] p-2 bg-[var(--el-surface-container)] text-[var(--el-text)] border border-[var(--el-line)] rounded text-[12px] leading-relaxed resize-none outline-none focus:border-el-primary focus:ring-1 focus:ring-el-primary"
                  placeholder="أدخل نص الرسالة واستخدم المتغيرات بين قفلين..."
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                />
                <div className="flex justify-between items-center text-[10.5px] text-[var(--el-muted)] font-mono">
                  <span>الأحرف: {charCount} · الأجزاء: <b className="text-el-primary">{smsParts}</b> رسالة</span>
                  <span>(70 حرفاً للرسالة الواحدة بالعربية)</span>
                </div>
              </div>
            </div>

            {/* Live Personalized Preview Card */}
            <div className="bg-gradient-to-br from-[var(--el-surface-container)] to-[var(--el-surface)] border border-[var(--el-line)] rounded-lg p-3.5 flex flex-col justify-between relative">
              <div className="absolute top-2 left-2 text-[var(--el-muted)] opacity-20">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="flex items-center gap-1.5 border-b border-[var(--el-line)] pb-1.5 mb-2.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-[var(--el-text)]">معاينة البث المخصصة للمستلم الأول</h3>
              </div>

              <div className="flex-1 bg-[var(--el-surface-container-lowest)] border border-[var(--el-line)] rounded p-2.5 text-[11.5px] leading-relaxed text-[var(--el-text)] select-none whitespace-pre-wrap font-sans">
                {renderedPreviewText}
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--el-line)] shrink-0">
                <span className="text-[10px] text-[var(--el-muted)] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  المستلم المقترح الأول:
                </span>
                <span className="text-[10px] font-bold text-[var(--el-text)]">
                  {previewVoters[0]?.fullName || 'أحمد عبد الله الحسيني (افتراضي)'}
                </span>
              </div>
            </div>
          </div>

          {/* Voter Preview Table */}
          <div className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded-lg overflow-hidden">
            <div className="bg-[var(--el-surface-container)] px-4 py-2 border-b border-[var(--el-line)] flex justify-between items-center">
              <h3 className="text-xs font-bold text-[var(--el-text)]">قائمة المستلمين المقترحين للمعاينة حية</h3>
              <span className="text-[10px] text-[var(--el-muted)] font-mono">
                عرض 5 من إجمالي {totalReach.toLocaleString()} مستهدف
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[var(--el-surface-container-low)] text-[var(--el-muted)] border-b border-[var(--el-line)]">
                  <tr>
                    <th className="px-3 py-2 font-bold w-1/3">الاسم (مخفي جزئياً)</th>
                    <th className="px-3 py-2 font-bold">رقم الهاتف</th>
                    <th className="px-3 py-2 font-bold">العشيرة</th>
                    <th className="px-3 py-2 font-bold">مركز الاقتراع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--el-line)] text-[var(--el-text)] font-sans">
                  {previewVoters.map((voter) => (
                    <tr key={voter.id} className="hover:bg-[var(--el-surface-container-lowest)] transition-colors h-8">
                      <td className="px-3 py-1.5 font-semibold">{voter.fullName}</td>
                      <td className="px-3 py-1.5 font-mono">{voter.phone}</td>
                      <td className="px-3 py-1.5 text-[var(--el-muted)]">{voter.tribeName}</td>
                      <td className="px-3 py-1.5 text-[var(--el-muted)]">{voter.pollingCenter}</td>
                    </tr>
                  ))}
                  {previewVoters.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[var(--el-muted)]">
                        لا يوجد ناخبون مطابقون للفلاتر الحالية ولديهم أرقام هواتف مسجلة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={handleLaunch}
              disabled={sending || totalReach === 0}
              className="flex items-center gap-2 bg-el-primary text-white px-6 py-2 rounded shadow-md hover:bg-el-primary/95 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-el-primary-container"
            >
              <Send className="w-4 h-4" />
              <span className="text-[13px] font-bold">إطلاق البث وتوزيع الرسائل حية</span>
            </button>
          </div>

          {/* Campaign History Log */}
          <div className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded-lg overflow-hidden">
            <div className="bg-[var(--el-surface-container)] px-4 py-2 border-b border-[var(--el-line)] flex justify-between items-center">
              <h3 className="text-xs font-bold text-[var(--el-text)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-el-secondary" /> سجل حملات البث المنفذة سابقاً
              </h3>
              <button
                onClick={fetchHistory}
                disabled={loadingCampaigns}
                className="text-[10px] text-el-secondary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                تحديث السجل
              </button>
            </div>
            <div className="max-h-[220px] overflow-y-auto custom-scroll divide-y divide-[var(--el-line)]">
              {pastCampaigns.map((camp) => (
                <div key={camp.id} className="p-3 hover:bg-[var(--el-surface-container-lowest)] transition-colors flex flex-col sm:flex-row justify-between sm:items-start gap-2 text-xs">
                  <div className="space-y-1 sm:max-w-[70%]">
                    <p className="font-sans text-[var(--el-text)] font-semibold leading-relaxed">
                      {camp.message}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-[var(--el-muted)]">
                      <span>الفلاتر: <b className="text-el-secondary">{camp.filter}</b></span>
                      <span>بواسطة: <b>{camp.username}</b></span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-1 shrink-0 font-mono text-[10.5px]">
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      {camp.recipients.toLocaleString()} مستلم
                    </span>
                    <span className="text-[var(--el-muted)] text-[10px]">
                      {new Date(camp.createdAt).toLocaleString('ar-IQ')}
                    </span>
                  </div>
                </div>
              ))}
              {pastCampaigns.length === 0 && (
                <div className="p-8 text-center text-[var(--el-muted)]">
                  لا توجد حملات بث مسجلة سابقاً في أرشيف العمليات.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
