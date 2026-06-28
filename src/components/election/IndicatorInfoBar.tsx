"use client";

// ====================================================================
// IndicatorInfoBar — شريط تعريفي يوضح آلية حساب كل مؤشر انتخابي
// ====================================================================
// مكوّن قابل لإعادة الاستخدام — يُوضع فوق أي مؤشر لعرض:
//   1. اسم المؤشر الكامل
//   2. ماذا يقيس (التفسير)
//   3. المعادلة والأوزان
// ====================================================================

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

// ────────────────────────────────────────────────────────────────
// قاموس المؤشرات — كل المعادلات والأوزان والشروحات بالعربية
// ────────────────────────────────────────────────────────────────

interface IndicatorWeight {
  factor: string;
  weight: string;
  description: string;
}

interface IndicatorDefinition {
  title: string;
  description: string;
  formula: string;
  weights: IndicatorWeight[];
  classification?: { range: string; label: string }[];
  note?: string;
}

const INDICATOR_DEFINITIONS: Record<string, IndicatorDefinition> = {
  // ───── المؤشرات الفردية (indicators-helper.ts) ─────
  EII: {
    title: "مؤشر التأثير الانتخابي",
    description:
      "يقيس مدى قدرة المفتاح الانتخابي على التأثير الفعلي في توجيه الأصوات لصالح الحملة. كلما ارتفعت القيمة، دلّ ذلك على أن المفتاح يملك نفوذاً حقيقياً وقدرة على تحريك الناخبين.",
    formula:
      "القيمة = (التقييم الموزون × 0.30) + (نسبة الصافي × 0.25) + (النفوذ × 0.25) + (التحشيد × 0.20)",
    weights: [
      {
        factor: "التقييم الموزون",
        weight: "30%",
        description:
          "نسبة الأصوات الصافية من إجمالي الأصوات المُدّعاة",
      },
      {
        factor: "نسبة الأصوات الصافية",
        weight: "25%",
        description:
          "الأصوات بعد تطبيق أوزان الترجيح (مؤيد 80%، محايد 50%، ضعيف 30%) مقسومة على الإجمالي",
      },
      {
        factor: "مستوى النفوذ",
        weight: "25%",
        description:
          "تقييم نفوذ المفتاح في بيئته (من 1 إلى 5) محوّل لنسبة مئوية",
      },
      {
        factor: "القدرة على التحشيد",
        weight: "20%",
        description:
          "تقييم قدرة المفتاح على حشد الناخبين يوم الاقتراع (من 1 إلى 5)",
      },
    ],
  },

  KRI: {
    title: "مؤشر موثوقية المفتاح",
    description:
      "يقيس مدى إمكانية الاعتماد على المفتاح الانتخابي والثقة بأن أصواته ستصل فعلاً إلى الصندوق. كلما ارتفعت القيمة، زادت الثقة بأن هذا المفتاح لن يخذلنا.",
    formula:
      "القيمة = (الولاء × 0.25) + (أسباب الدعم × 0.20) + (الحماية × 0.20) + (الاحتياجات × 0.20) + (الاستقرار × 0.15)",
    weights: [
      {
        factor: "درجة الولاء",
        weight: "25%",
        description:
          "تقييم ولاء المفتاح للحملة (من 1 إلى 5) محوّل لنسبة مئوية",
      },
      {
        factor: "وجود أسباب دعم واضحة",
        weight: "20%",
        description:
          "نسبة الناخبين الذين لديهم سبب دعم مسجّل ومعروف",
      },
      {
        factor: "مستوى الحماية (عكس الخطر)",
        weight: "20%",
        description:
          "كلما انخفض مستوى الخطر، ارتفعت الحماية — يُحسب: (6 − مستوى الخطر) ÷ 5 × 100",
      },
      {
        factor: "تلبية الاحتياجات",
        weight: "20%",
        description:
          "نسبة الخدمات المُنجزة من إجمالي الخدمات المطلوبة",
      },
      {
        factor: "الاستقرار",
        weight: "15%",
        description:
          "مؤشر عكسي لمستوى الخطر: 100 − (مستوى الخطر × 15)",
      },
    ],
  },

  VPS: {
    title: "مؤشر احتمالية التصويت",
    description:
      "يقيس الاحتمال المرجّح بأن ناخبي المفتاح سيصوتون فعلاً يوم الاقتراع. يأخذ بعين الاعتبار أن المؤيد أكثر احتمالاً للتصويت من المحايد، والمحايد أكثر من الضعيف.",
    formula:
      "القيمة = (عدد المؤيدين × 80 + عدد المحايدين × 50 + عدد الضعفاء × 30) ÷ إجمالي عدد الناخبين",
    weights: [
      {
        factor: "ناخب مؤيّد",
        weight: "80 نقطة",
        description: "احتمال مرتفع للتصويت الفعلي",
      },
      {
        factor: "ناخب محايد",
        weight: "50 نقطة",
        description: "احتمال متوسط — قد يصوّت أو لا",
      },
      {
        factor: "ناخب ضعيف",
        weight: "30 نقطة",
        description: "احتمال منخفض — يحتاج متابعة مكثّفة",
      },
    ],
  },

  DRS: {
    title: "مؤشر خطر الانشقاق",
    description:
      "يقيس مدى خطورة أن ينشق المفتاح أو ناخبوه عن الحملة ويتوجهوا لمرشح أو جهة أخرى. كلما ارتفعت القيمة، زاد الخطر ووجب التدخل السريع.",
    formula:
      "القيمة = (ضعف الولاء × 0.25) + (نسبة الضعفاء × 0.20) + (ضغط الاحتياجات × 0.20) + (ضعف التعليم × 0.15) + (ضعف التنظيم × 0.10) + (انقطاع التواصل × 0.10)",
    weights: [
      {
        factor: "ضعف الولاء",
        weight: "25%",
        description:
          "كلما انخفض تقييم الولاء، ارتفع خطر الانشقاق",
      },
      {
        factor: "نسبة الناخبين الضعفاء",
        weight: "20%",
        description: "نسبة الناخبين ذوي الحالة «ضعيف» من الإجمالي",
      },
      {
        factor: "ضغط الاحتياجات",
        weight: "20%",
        description:
          "مستوى خطر المفتاح محوّل لنسبة مئوية — الاحتياجات غير الملباة تزيد خطر الانشقاق",
      },
      {
        factor: "ضعف المستوى التعليمي",
        weight: "15%",
        description:
          "نسبة الناخبين بمستوى تعليمي ابتدائي أو أمّي — أكثر عرضة للتأثر بالمنافسين",
      },
      {
        factor: "ضعف التنظيم",
        weight: "10%",
        description:
          "عكس درجة دقة بيانات المفتاح — ضعف التنظيم يُسهّل الاختراق",
      },
      {
        factor: "انقطاع التواصل",
        weight: "10%",
        description:
          "نسبة الناخبين الذين لم يتم التواصل معهم مؤخراً",
      },
    ],
    note: "⚠️ هذا مؤشر خطر — القيمة المرتفعة تعني خطراً أكبر",
  },

  // ───── المؤشرات المركّبة (indicators-engine.ts) ─────
  API: {
    title: "مؤشر اختراق المنطقة",
    description:
      "يقيس مدى قدرة الحملة على التوسع والانتشار في منطقة جغرافية معينة. يأخذ بعين الاعتبار حجم الشريحة المحايدة (القابلة للاستقطاب) وقوة المفاتيح العاملة في المنطقة.",
    formula:
      "القيمة = (نسبة المحايدين × 0.30) + (نسبة التوسع × 0.25) + (موثوقية المفاتيح × 0.25) + (التقييم الموزون × 0.20)",
    weights: [
      {
        factor: "نسبة المحايدين",
        weight: "30%",
        description:
          "كلما زاد المحايدون، زادت فرصة استقطابهم — وهم الشريحة الأكثر قابلية للتحويل",
      },
      {
        factor: "نسبة التوسع",
        weight: "25%",
        description:
          "نسبة المؤيدين من إجمالي الأصوات — يعكس مدى الانتشار الحالي",
      },
      {
        factor: "موثوقية المفاتيح",
        weight: "25%",
        description: "متوسط مؤشر موثوقية المفاتيح العاملة في المنطقة",
      },
      {
        factor: "التقييم الموزون",
        weight: "20%",
        description: "متوسط التقييم الموزون لمفاتيح المنطقة",
      },
    ],
  },

  EWLI: {
    title: "مؤشر الإنذار المبكر لفقدان الأصوات",
    description:
      "يُنبّه مبكراً إلى احتمال فقدان أصوات في منطقة معينة. كلما ارتفعت القيمة، زاد خطر خسارة الأصوات ووجب التحرك العاجل.",
    formula:
      "القيمة = (نسبة الضعفاء × 0.30) + (خطر الانشقاق × 0.25) + (التهديدات × 0.20) + (تراجع الدعم × 0.15) + (قوة المنافسين × 0.10)",
    weights: [
      {
        factor: "نسبة الناخبين الضعفاء",
        weight: "30%",
        description: "كثرة الضعفاء مؤشر خطر لفقدان الأصوات",
      },
      {
        factor: "خطر الانشقاق",
        weight: "25%",
        description: "متوسط خطر انشقاق مفاتيح المنطقة",
      },
      {
        factor: "التهديدات الميدانية",
        weight: "20%",
        description:
          "مستوى التهديدات المحسوب من مؤشر الانشقاق × 80%",
      },
      {
        factor: "تراجع الدعم",
        weight: "15%",
        description:
          "عكس مؤشر الموثوقية — يعكس ضعف الدعم: 100 − متوسط الموثوقية",
      },
      {
        factor: "قوة المنافسين",
        weight: "10%",
        description: "تقدير قوة المنافسين في المنطقة",
      },
    ],
    note: "⚠️ هذا مؤشر خطر — القيمة المرتفعة تعني خطراً أكبر",
  },

  GSI: {
    title: "مؤشر القوة الجغرافية",
    description:
      "يقيس مدى قوة الحملة وانتشارها في المنطقة الجغرافية من حيث تغطية مراكز الاقتراع وتوزيع الأصوات والتوازن بين المناطق الفرعية.",
    formula:
      "القيمة = (التغطية × 0.25) + (توزيع الأصوات × 0.25) + (التقييم الموزون × 0.25) + (التوازن × 0.25)",
    weights: [
      {
        factor: "تغطية مراكز الاقتراع",
        weight: "25%",
        description:
          "نسبة المراكز التي لدينا فيها مفاتيح انتخابية من إجمالي مراكز المنطقة",
      },
      {
        factor: "توزيع الأصوات",
        weight: "25%",
        description:
          "مدى انتشار الأصوات عبر المنطقة وعدم تركّزها في نقطة واحدة",
      },
      {
        factor: "التقييم الموزون",
        weight: "25%",
        description: "متوسط التقييم الموزون لمفاتيح المنطقة",
      },
      {
        factor: "التوازن الجغرافي",
        weight: "25%",
        description:
          "مدى توازن وجود الحملة بين المناطق الفرعية المختلفة",
      },
    ],
  },

  EDRI: {
    title: "مؤشر جاهزية يوم الاقتراع",
    description:
      "يقيس مدى استعداد الحملة ليوم الاقتراع الفعلي من حيث تدريب المفاتيح وحماية الأصوات ووجود المراقبين والتحقق من بيانات الناخبين.",
    formula:
      "القيمة = (المدربون × 0.20) + (الحماية × 0.20) + (التحقق بالموقع × 0.20) + (التحقق من السجل × 0.20) + (الولاء × 0.20)",
    weights: [
      {
        factor: "نسبة المفاتيح المدربة",
        weight: "20%",
        description:
          "نسبة المفاتيح التي حصلت على درجة دقة ≥ 80% من إجمالي المفاتيح",
      },
      {
        factor: "نسبة الحماية العالية",
        weight: "20%",
        description:
          "نسبة المفاتيح ذات مستوى خطر منخفض (≤ 2) من الإجمالي",
      },
      {
        factor: "نسبة التحقق بالموقع",
        weight: "20%",
        description:
          "نسبة الناخبين الذين تم التحقق من موقعهم الجغرافي",
      },
      {
        factor: "نسبة التحقق من السجل",
        weight: "20%",
        description:
          "نسبة الناخبين المؤكد تسجيلهم في سجل الناخبين الرسمي",
      },
      {
        factor: "متوسط الولاء",
        weight: "20%",
        description: "متوسط مؤشر موثوقية المفاتيح في المنطقة",
      },
    ],
  },

  EFI: {
    title: "مؤشر التنبؤ الانتخابي الشامل",
    description:
      "المؤشر الرئيسي الأشمل — يجمع كل المؤشرات السابقة في رقم واحد يعكس الوضع الانتخابي العام. يُعتبر ملخص الملخصات ومقياس الصحة الانتخابية الشاملة.",
    formula:
      "القيمة = (التأثير × 0.15) + (الموثوقية × 0.15) + (احتمالية التصويت × 0.20) + (أمان الانشقاق × 0.10) + (الاختراق × 0.10) + (أمان الفقدان × 0.10) + (القوة الجغرافية × 0.10) + (الجاهزية × 0.10)",
    weights: [
      {
        factor: "التأثير الانتخابي",
        weight: "15%",
        description: "قوة تأثير المفاتيح في تحريك الأصوات",
      },
      {
        factor: "موثوقية المفاتيح",
        weight: "15%",
        description: "مدى الاعتمادية على المفاتيح",
      },
      {
        factor: "احتمالية التصويت",
        weight: "20%",
        description:
          "الوزن الأعلى — مدى احتمال التصويت الفعلي يوم الاقتراع",
      },
      {
        factor: "أمان الانشقاق",
        weight: "10%",
        description:
          "عكس مؤشر خطر الانشقاق — كلما انخفض الخطر ارتفع الأمان: (100 − خطر الانشقاق)",
      },
      {
        factor: "اختراق المنطقة",
        weight: "10%",
        description: "قدرة التوسع والانتشار في المنطقة",
      },
      {
        factor: "أمان فقدان الأصوات",
        weight: "10%",
        description:
          "عكس مؤشر الإنذار المبكر — الأمان من فقدان الأصوات: (100 − الإنذار المبكر)",
      },
      {
        factor: "القوة الجغرافية",
        weight: "10%",
        description: "قوة الانتشار الجغرافي وتغطية مراكز الاقتراع",
      },
      {
        factor: "جاهزية يوم الاقتراع",
        weight: "10%",
        description: "الاستعداد الميداني ليوم التصويت الفعلي",
      },
    ],
    classification: [
      { range: "75 فأكثر", label: "وضع ممتاز ✅" },
      { range: "60 إلى 74", label: "وضع جيد 🟢" },
      { range: "45 إلى 59", label: "وضع متوسط 🟡" },
      { range: "أقل من 45", label: "وضع حرج 🔴" },
    ],
  },

  // ───── مؤشرات لوحة التحكم التنفيذية ─────
  VOTES_NEEDED: {
    title: "الأصوات المطلوبة للفوز",
    description:
      "الحد الأدنى التقريبي من الأصوات اللازمة لحسم مقعد واحد في محافظة ذي قار. يُحسب بناءً على عدد الناخبين المسجلين ونسبة المشاركة التاريخية وعدد المقاعد.",
    formula:
      "الأصوات المطلوبة = (عدد الناخبين المسجلين × نسبة المشاركة المتوقعة) ÷ عدد المقاعد",
    weights: [
      {
        factor: "عدد الناخبين المسجلين",
        weight: "—",
        description: "855,000 ناخب مسجّل في محافظة ذي قار",
      },
      {
        factor: "نسبة المشاركة التاريخية",
        weight: "—",
        description: "58% بناءً على متوسط المشاركة في الانتخابات السابقة",
      },
      {
        factor: "عدد المقاعد",
        weight: "—",
        description: "18 مقعداً في مجلس محافظة ذي قار",
      },
    ],
  },

  EXPECTED_VOTES: {
    title: "عدد الأصوات المتوقعة",
    description:
      "التقدير الحالي لعدد الأصوات التي ستصل فعلاً إلى الصندوق لصالح حملتنا. يُحسب من صافي أصوات جميع المفاتيح الانتخابية بعد تطبيق أوزان الترجيح.",
    formula:
      "الصافي = (أصوات المؤيدين × 0.80) + (أصوات المحايدين × 0.50) + (أصوات الضعفاء × 0.30)",
    weights: [
      {
        factor: "أصوات المؤيدين",
        weight: "× 0.80",
        description: "يُحتسب 80% من أصوات المؤيدين — احتمال تصويت مرتفع",
      },
      {
        factor: "أصوات المحايدين",
        weight: "× 0.50",
        description: "يُحتسب 50% من أصوات المحايدين — احتمال متوسط",
      },
      {
        factor: "أصوات الضعفاء",
        weight: "× 0.30",
        description: "يُحتسب 30% من أصوات الضعفاء — احتمال منخفض",
      },
    ],
  },

  ELECTORAL_GAP: {
    title: "الفجوة الانتخابية",
    description:
      "الفارق بين الأصوات المطلوبة للفوز والأصوات المتوقعة حالياً. إذا كان الرقم موجباً فنحن تحت المستهدف ونحتاج أصواتاً إضافية. إذا كان صفراً أو سالباً فقد تخطينا العتبة.",
    formula: "الفجوة = الأصوات المطلوبة للفوز − الأصوات المتوقعة يوم الاقتراع",
    weights: [
      {
        factor: "الأصوات المطلوبة",
        weight: "—",
        description: "عدد الأصوات اللازمة لحسم المقعد",
      },
      {
        factor: "الأصوات المتوقعة",
        weight: "—",
        description: "صافي أصواتنا المرجّحة بعد تطبيق أوزان الترجيح",
      },
    ],
    note: "رقم موجب = نحتاج أصواتاً إضافية · رقم سالب أو صفر = تخطينا المستهدف",
  },

  PARTICIPATION: {
    title: "نسبة المشاركة المتوقعة",
    description:
      "النسبة المئوية المتوقعة لمشاركة الناخبين المسجلين في التصويت، بناءً على البيانات التاريخية والتقديرات الميدانية. ارتفاع المشاركة يُغيّر حسابات العتبة الانتخابية.",
    formula:
      "نسبة المشاركة = (عدد المصوتين الفعليين ÷ عدد الناخبين المسجلين) × 100",
    weights: [
      {
        factor: "المشاركة التاريخية",
        weight: "58%",
        description: "متوسط نسبة المشاركة في انتخابات محافظة ذي قار السابقة",
      },
    ],
  },

  WIN_PROBABILITY: {
    title: "إمكانية الفوز",
    description:
      "مدى اقترابنا من تحقيق الفوز بالمقعد كنسبة مئوية. إذا تجاوزت 100% فقد تخطينا العتبة الآمنة للفوز.",
    formula: "إمكانية الفوز = (الأصوات المتوقعة ÷ الأصوات المطلوبة للفوز) × 100",
    weights: [
      {
        factor: "الأصوات المتوقعة",
        weight: "البسط",
        description: "صافي أصواتنا المرجّحة المتوقعة يوم الاقتراع",
      },
      {
        factor: "الأصوات المطلوبة",
        weight: "المقام",
        description: "الحد الأدنى لحسم المقعد",
      },
    ],
    classification: [
      { range: "70% فأكثر", label: "مرتفعة جداً ✅" },
      { range: "40% إلى 69%", label: "ممكنة 🟡" },
      { range: "أقل من 40%", label: "ضعيفة 🔴" },
    ],
  },

  OVERALL_RISK: {
    title: "مؤشر المخاطر الانتخابية الشامل",
    description:
      "مستوى المخاطر الإجمالي الذي يهدد حملتنا. يجمع بين خطر الانشقاق وضعف الموثوقية في رقم واحد يعكس الوضع الأمني الانتخابي.",
    formula:
      "المخاطر = (متوسط خطر الانشقاق × 0.60) + ((100 − متوسط الموثوقية) × 0.40)",
    weights: [
      {
        factor: "متوسط خطر الانشقاق",
        weight: "60%",
        description:
          "متوسط مؤشر خطر الانشقاق لجميع المفاتيح — العامل الأكبر",
      },
      {
        factor: "ضعف الموثوقية",
        weight: "40%",
        description:
          "عكس متوسط مؤشر الموثوقية: (100 − متوسط الموثوقية) — ضعف الموثوقية يزيد المخاطر",
      },
    ],
    classification: [
      { range: "أقل من 25", label: "خطر منخفض 🟢" },
      { range: "25 إلى 50", label: "خطر متوسط 🟡" },
      { range: "أكثر من 50", label: "خطر مرتفع 🔴" },
    ],
    note: "⚠️ هذا مؤشر خطر — القيمة المرتفعة تعني خطراً أكبر",
  },

  PROJECTED_SEATS: {
    title: "المقاعد المتوقعة",
    description:
      "تقدير عدد المقاعد التي يمكن أن تحصدها حملتنا بناءً على صافي الأصوات المتوقعة مقارنة بأصوات المنافسين. يُحسب باستخدام طريقة سانت لاغي المعدّلة لتوزيع المقاعد.",
    formula:
      "تُوزّع المقاعد عبر طريقة سانت لاغي المعدّلة (القاسم الأول 1.7) — تُقسم أصوات كل كيان على القواسم: 1.7، 3، 5، 7 ... ثم تُوزّع المقاعد على أعلى الحواصل",
    weights: [
      {
        factor: "صافي أصواتنا",
        weight: "—",
        description: "أصواتنا المرجّحة بعد تطبيق أوزان الترجيح",
      },
      {
        factor: "أصوات المنافسين",
        weight: "—",
        description: "الأصوات المقدّرة لكل كيان/حزب منافس",
      },
      {
        factor: "عدد المقاعد الكلي",
        weight: "—",
        description: "18 مقعداً في مجلس محافظة ذي قار",
      },
    ],
  },
};

// ────────────────────────────────────────────────────────────────
// المكوّن الرئيسي
// ────────────────────────────────────────────────────────────────

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
  const [expanded, setExpanded] = useState(false);

  const def = INDICATOR_DEFINITIONS[indicatorKey];
  if (!def) return null;

  return (
    <div
      className={`rounded-lg border transition-all duration-300 ${
        expanded
          ? "border-[var(--el-primary)]/40 bg-[var(--el-primary)]/[0.03] shadow-sm"
          : "border-[var(--el-outline-variant)]/40 bg-[var(--el-surface-container-lowest)]/60 hover:border-[var(--el-primary)]/30"
      } ${compact ? "mb-1.5" : "mb-3"}`}
    >
      {/* ── زر الطي/التوسيع ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between gap-2 text-right transition-colors duration-200 ${
          compact ? "px-2.5 py-1.5" : "px-3 py-2"
        }`}
        aria-expanded={expanded}
        aria-label={`شرح ${def.title}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Info
            className={`shrink-0 ${
              compact ? "w-3 h-3" : "w-3.5 h-3.5"
            } ${
              expanded
                ? "text-[var(--el-primary)]"
                : "text-[var(--el-on-surface-variant)]"
            }`}
          />
          <span
            className={`truncate font-medium ${
              compact ? "text-[10px]" : "text-[11px]"
            } ${
              expanded
                ? "text-[var(--el-primary)]"
                : "text-[var(--el-on-surface-variant)]"
            }`}
          >
            كيف يُحسب هذا المؤشر؟
          </span>
        </div>
        {expanded ? (
          <ChevronUp
            className={`shrink-0 ${
              compact ? "w-3 h-3" : "w-3.5 h-3.5"
            } text-[var(--el-primary)]`}
          />
        ) : (
          <ChevronDown
            className={`shrink-0 ${
              compact ? "w-3 h-3" : "w-3.5 h-3.5"
            } text-[var(--el-on-surface-variant)]`}
          />
        )}
      </button>

      {/* ── المحتوى الموسّع ── */}
      {expanded && (
        <div
          className={`border-t border-[var(--el-outline-variant)]/30 ${
            compact ? "px-2.5 py-2" : "px-4 py-3"
          } space-y-3 animate-in slide-in-from-top-1 duration-200`}
        >
          {/* العنوان */}
          <div>
            <h4
              className={`font-bold text-[var(--el-on-surface)] ${
                compact ? "text-[11px]" : "text-[13px]"
              }`}
            >
              📊 {def.title}
            </h4>
          </div>

          {/* الوصف */}
          <p
            className={`leading-relaxed text-[var(--el-on-surface-variant)] ${
              compact ? "text-[10px]" : "text-[12px]"
            }`}
          >
            {def.description}
          </p>

          {/* ملاحظة تحذيرية */}
          {def.note && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
              <p
                className={`text-amber-700 dark:text-amber-400 font-medium ${
                  compact ? "text-[10px]" : "text-[11px]"
                }`}
              >
                {def.note}
              </p>
            </div>
          )}

          {/* جدول الأوزان */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--el-outline-variant)]/30">
                  <th
                    className={`text-right py-1.5 px-2 font-bold text-[var(--el-on-surface)] ${
                      compact ? "text-[9px]" : "text-[11px]"
                    }`}
                  >
                    العامل
                  </th>
                  <th
                    className={`text-center py-1.5 px-2 font-bold text-[var(--el-on-surface)] ${
                      compact ? "text-[9px]" : "text-[11px]"
                    }`}
                  >
                    الوزن
                  </th>
                  <th
                    className={`text-right py-1.5 px-2 font-bold text-[var(--el-on-surface)] ${
                      compact ? "text-[9px]" : "text-[11px]"
                    }`}
                  >
                    الشرح
                  </th>
                </tr>
              </thead>
              <tbody>
                {def.weights.map((w, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[var(--el-outline-variant)]/15 ${
                      i % 2 === 0
                        ? "bg-[var(--el-surface-container-lowest)]/40"
                        : ""
                    }`}
                  >
                    <td
                      className={`py-1.5 px-2 font-medium text-[var(--el-on-surface)] ${
                        compact ? "text-[9px]" : "text-[11px]"
                      }`}
                    >
                      {w.factor}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-center font-bold text-[var(--el-primary)] ${
                        compact ? "text-[9px]" : "text-[11px]"
                      }`}
                    >
                      {w.weight}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-[var(--el-on-surface-variant)] ${
                        compact ? "text-[9px]" : "text-[10px]"
                      }`}
                    >
                      {w.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* المعادلة */}
          <div className="rounded-md bg-[var(--el-surface-container)]/60 border border-[var(--el-outline-variant)]/20 px-3 py-2">
            <p
              className={`font-bold text-[var(--el-on-surface)] mb-1 ${
                compact ? "text-[9px]" : "text-[11px]"
              }`}
            >
              المعادلة:
            </p>
            <p
              className={`font-mono text-[var(--el-primary)] leading-relaxed ${
                compact ? "text-[9px]" : "text-[11px]"
              }`}
              dir="ltr"
              style={{ direction: "rtl", unicodeBidi: "plaintext" }}
            >
              {def.formula}
            </p>
          </div>

          {/* تصنيف النتائج */}
          {def.classification && (
            <div>
              <p
                className={`font-bold text-[var(--el-on-surface)] mb-1.5 ${
                  compact ? "text-[9px]" : "text-[11px]"
                }`}
              >
                تصنيف النتيجة:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {def.classification.map((c, i) => (
                  <span
                    key={i}
                    className={`inline-block rounded-md border border-[var(--el-outline-variant)]/30 bg-[var(--el-surface-container-lowest)] px-2 py-0.5 ${
                      compact ? "text-[8px]" : "text-[10px]"
                    } text-[var(--el-on-surface-variant)]`}
                  >
                    <span className="font-bold">{c.range}</span>{" "}
                    → {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
