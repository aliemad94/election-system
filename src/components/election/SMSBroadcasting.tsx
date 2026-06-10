'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Send,
} from 'lucide-react';

interface Tribe {
  id: string;
  name: string;
  influence: number;
  district: string | null;
  voterCount: number;
}

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

export default function SMSBroadcasting() {
  const [confidenceScore, setConfidenceScore] = useState<number[]>([4, 5]);
  const [smsText, setSmsText] = useState('');
  const [influenceValue, setInfluenceValue] = useState(5);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const charCount = smsText.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  useEffect(() => {
    let cancelled = false;
    async function loadTribes() {
      try {
        const res = await fetch('/api/tribes');
        const data = await res.json();
        if (!cancelled) setTribes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tribes:', err);
      }
    }
    loadTribes();
    return () => { cancelled = true; };
  }, []);

  const estimatedReach = useMemo(() => {
    let reach = 50;
    if (selectedDistrict) reach = Math.floor(reach * 0.3);
    if (selectedTribe) reach = Math.floor(reach * 0.1);
    if (confidenceScore.length > 0) reach = Math.floor(reach * (confidenceScore.length / 5));
    return reach;
  }, [selectedDistrict, selectedTribe, confidenceScore]);

  const filteredTribes = tribes.filter(
    (t) => !selectedDistrict || t.district === selectedDistrict
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-el-outline-variant pb-2 mb-4">
        <div>
          <h2 className="text-[18px] leading-[24px] font-semibold text-el-primary">لوحة بث رسائل SMS</h2>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">قم بتكوين وإطلاق حملات SMS المستهدفة في ذي قار.</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Filtering (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-el-surface rounded border border-el-outline-variant p-4">
            <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant border-b border-el-outline-variant pb-2 mb-3">استهداف الجمهور</h3>
            <div className="space-y-4">
              {/* Governorate/District */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">المحافظة / القضاء</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedTribe(''); }}
                >
                  <option value="">جميع أقضية ذي قار</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Tribe Targeting */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">العشيرة (اختياري)</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedTribe}
                  onChange={(e) => setSelectedTribe(e.target.value)}
                >
                  <option value="">جميع العشائر</option>
                  {filteredTribes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.voterCount} ناخب)</option>
                  ))}
                </select>
              </div>

              {/* Confidence Score */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">درجة الثقة (نجوم)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => {
                        if (confidenceScore.includes(score)) {
                          setConfidenceScore(confidenceScore.filter((s) => s !== score));
                        } else {
                          setConfidenceScore([...confidenceScore, score]);
                        }
                      }}
                      className={`flex-1 h-8 border rounded text-[12px] leading-[16px] font-medium transition-colors ${
                        confidenceScore.includes(score)
                          ? 'border-el-secondary bg-el-secondary-container text-el-on-secondary-container'
                          : 'border-el-secondary text-el-secondary hover:bg-el-secondary-container hover:text-el-on-secondary-container'
                      }`}
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voted Status */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">حالة التصويت</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input defaultChecked className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    لم يصوت
                  </label>
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    صوّت
                  </label>
                </div>
              </div>

              {/* Influence Weight */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">تأثير الشبكة العشائرية</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={influenceValue}
                  onChange={(e) => setInfluenceValue(Number(e.target.value))}
                  className="w-full h-1 bg-el-outline-variant rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[12px] leading-[16px] font-medium text-el-outline mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <span>عالي</span>
                  <span>منخفض</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-el-outline-variant flex justify-between items-center">
              <span className="text-[12px] leading-[16px] font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>الوصول التقديري:</span>
              <span className="text-[12px] leading-[16px] font-bold text-el-primary" style={{ fontFamily: 'var(--font-geist-mono)' }}>{estimatedReach.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Composer & Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          {/* Top Row: Composer and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Composer */}
            <div className="bg-el-surface rounded border border-el-outline-variant flex flex-col">
              <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
                <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">منشئ الحملة</h3>
                <div className="flex gap-2">
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{voter_name}'}</button>
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{polling_center}'}</button>
                </div>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  className="w-full h-32 p-2 border border-el-outline-variant rounded bg-el-surface text-el-on-surface text-[12px] leading-[16px] resize-none focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none"
                  placeholder="أدخل رسالة SMS هنا..."
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[12px] leading-[16px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    الأحرف: {charCount} / 160 ({smsCount} SMS)
                  </span>
                </div>
              </div>
            </div>

            {/* Overview / Quota */}
            <div className="bg-el-primary-container text-el-on-primary-container rounded p-4 border border-el-primary-container relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Radio className="w-[120px] h-[120px]" />
              </div>
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] mb-4 relative z-10" style={{ color: '#d8e2ff' }}>نظرة عامة على البث</h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-[12px] leading-[16px] font-medium mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <span>استخدام الحصة اليومية</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#364768' }}>
                    <div className="bg-el-secondary-container h-1.5 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="text-right text-[10px] leading-[16px] font-medium mt-1" style={{ color: '#b6c6ef', fontFamily: 'var(--font-geist-mono)' }}>
                    45,000 / 100,000 SMS
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2" style={{ borderTop: '1px solid #364768' }}>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">12k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>مرسل</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">11.8k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>تم التسليم</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold" style={{ color: '#ffdad6' }}>200</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>فشل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voter Preview Table */}
          <div className="bg-el-surface rounded border border-el-outline-variant overflow-hidden">
            <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">معاينة الناخبين</h3>
              <span className="text-[10px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>عرض 5 من {estimatedReach.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-el-surface-container-low border-b border-el-outline-variant">
                  <tr>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الاسم (مخفي)</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الهاتف</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">القضاء</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">مركز الاقتراع</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] leading-[16px] font-medium text-el-on-surface divide-y divide-el-outline-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">أح*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الناصرية</td>
                    <td className="px-4 py-2 h-9">مدرسة الناصرية</td>
                  </tr>
                  <tr className="bg-el-surface-container-low hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">فاط*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الشطرة</td>
                    <td className="px-4 py-2 h-9">مدرسة الشطرة</td>
                  </tr>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">حس*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">سوق الشيوخ</td>
                    <td className="px-4 py-2 h-9">مركز الشيوخ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-el-primary text-el-on-primary px-6 py-2 rounded shadow-sm hover:opacity-90 transition-all active:scale-95 border border-el-primary-container">
              <Send className="w-[18px] h-[18px]" />
              <span className="text-[18px] leading-[24px] font-semibold">إطلاق البث</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
