'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useExplanation } from '@/context/ExplanationModalContext';

interface IndicatorInfoBarProps {
  /** مفتاح المؤشر (مثل "EII", "KRI", "EFI" ...) */
  indicatorKey: string;
  /** حجم مصغّر للبطاقات الصغيرة */
  compact?: boolean;
}

export default function IndicatorInfoBar({
  indicatorKey,
  compact = false,
}: IndicatorInfoBarProps) {
  const { showExplanation } = useExplanation();

  // عناوين مخصصة سريعة للزر
  const TITLES: Record<string, string> = {
    EII: "مؤشر التأثير الانتخابي",
    KRI: "مؤشر موثوقية المفتاح",
    VPS: "مؤشر احتمالية التصويت",
    DRS: "مؤشر خطر الانشقاق",
    API: "مؤشر اختراق المنطقة",
    EWLI: "مؤشر الإنذار المبكر",
    GSI: "مؤشر القوة الجغرافية",
    EDRI: "مؤشر جاهزية يوم الاقتراع",
    EFI: "مؤشر التنبؤ الانتخابي الشامل",
    VOTES_NEEDED: "الأصوات المطلوبة للفوز",
    EXPECTED_VOTES: "الأصوات المتوقعة",
    ELECTORAL_GAP: "الفجوة الانتخابية",
    PARTICIPATION: "نسبة المشاركة المتوقعة",
    WIN_PROBABILITY: "إمكانية الفوز",
    OVERALL_RISK: "المخاطر الانتخابية الشاملة",
    PROJECTED_SEATS: "المقاعد المتوقعة"
  };

  const title = TITLES[indicatorKey] || "المؤشر";

  return (
    <button
      type="button"
      onClick={() => showExplanation(indicatorKey)}
      className={`w-full flex items-center justify-between gap-1.5 text-right rounded-lg border border-border bg-card/60 hover:bg-muted/50 hover:border-primary/45 transition-all duration-200 cursor-pointer ${
        compact ? "px-3 py-1 text-[10px]" : "px-3 py-1.5 text-[11px] mb-2"
      }`}
      aria-label={`شرح ${title}`}
      title="انقر لعرض تفاصيل وحساب هذا المؤشر"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Info className={`shrink-0 text-muted-foreground ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
        <span className="font-semibold text-muted-foreground truncate">
          كيف يُحسب {title}؟
        </span>
      </div>
      <span className="text-[10px] text-[#031635] dark:text-blue-400 font-bold hover:underline shrink-0">
        التفاصيل والمعادلة ←
      </span>
    </button>
  );
}
