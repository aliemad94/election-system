'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { X, Info, Calculator, ListFilter, AlertTriangle } from 'lucide-react';

export interface ExplanationWeight {
  factor: string;
  weight: string;
  description: string;
}

export interface ExplanationItem {
  title: string;
  type: 'indicator' | 'term';
  description: string;
  formula?: string;
  weights?: ExplanationWeight[];
  classification?: { range: string; label: string }[];
  note?: string;
}

const EXPLANATIONS: Record<string, ExplanationItem> = {
  // ─── المؤشرات الحسابية (Indicators) ───
  EFI: {
    title: "مؤشر التنبؤ الانتخابي الشامل (EFI)",
    type: "indicator",
    description: "المؤشر الرئيسي الأشمل في المنظومة؛ يجمع كافة الأبعاد الفرعية (ميدانية، تنظيمية، جغرافية) ليعطي رقماً واحداً يمثل النسبة المئوية التقريبية لصحة وقوة الوضع الانتخابي الكلي في المنطقة أو المحافظة.",
    formula: "EFI = (التأثير × 0.15) + (الموثوقية × 0.15) + (احتمالية التصويت × 0.20) + (أمان الانشقاق × 0.10) + (الاختراق × 0.10) + (أمان الفقدان × 0.10) + (القوة الجغرافية × 0.10) + (جاهزية يوم الاقتراع × 0.10)",
    weights: [
      { factor: "مؤشر التأثير الانتخابي (EII)", weight: "15%", description: "مدى نفوذ وقدرة المفاتيح في توجيه وتحريك الشارع." },
      { factor: "مؤشر موثوقية المفتاح (KRI)", weight: "15%", description: "مدى الثقة بالالتزام الميداني والتنظيمي للمفاتيح." },
      { factor: "مؤشر احتمالية التصويت (VPS)", weight: "20%", description: "الاحتمال المرجّح لحضور الناخبين الفعلي يوم التصويت (العامل الأثقل)." },
      { factor: "أمان الانشقاق (100 - DRS)", weight: "10%", description: "المقاومة والتحصين ضد خطر تحول المفاتيح لجهات أخرى." },
      { factor: "مؤشر اختراق المنطقة (API)", weight: "10%", description: "القدرة على استقطاب وتوسيع رقعة التأييد بين المحايدين." },
      { factor: "أمان فقدان الأصوات (100 - EWLI)", weight: "10%", description: "عكس الإنذار المبكر — الاستقرار العام وتفادي الخسائر المفاجئة." },
      { factor: "مؤشر القوة الجغرافية (GSI)", weight: "10%", description: "انتشار الحملة وتغطية مراكز الاقتراع وتوزيع الأصوات المتوازن." },
      { factor: "جاهزية يوم الاقتراع (EDRI)", weight: "10%", description: "جهوزية الكوادر الميدانية والتحقق من مواقع وهويات الناخبين." }
    ],
    classification: [
      { range: "75% فأكثر", label: "وضع ممتاز وآمن جداً ✅" },
      { range: "60% إلى 74%", label: "وضع مستقر وجيد 🟢" },
      { range: "45% إلى 59%", label: "وضع متوسط يحتاج تعزيز 🟡" },
      { range: "أقل من 45%", label: "وضع حرج يستدعي تدخل فوري 🔴" }
    ]
  },
  EII: {
    title: "مؤشر التأثير الانتخابي للمفتاح (EII)",
    type: "indicator",
    description: "يقيس مدى قدرة المفتاح الانتخابي (المنسق الميداني) ونفوذه في توجيه الكتلة التصويتية التابعة له بشكل فعال وحقيقي.",
    formula: "EII = (التقييم الموزون × 0.30) + (نسبة الصافي × 0.25) + (مستوى النفوذ × 0.25) + (القدرة على التحشيد × 0.20)",
    weights: [
      { factor: "التقييم الموزون", weight: "30%", description: "تقييم الكفاءة والالتزام العام بناءً على الأبعاد التسعة." },
      { factor: "نسبة الأصوات الصافية", weight: "25%", description: "حجم الأصوات الصافية المرجحة مقسوماً على إجمالي الأصوات المدعاة." },
      { factor: "مستوى النفوذ", weight: "25%", description: "التقييم الميداني لقدرته التأثيرية (عائلة، عشيرة، منطقة)." },
      { factor: "القدرة على التحشيد", weight: "20%", description: "تقدير مدى كفاءته وقدراته على النقل والتحشيد الفعلي يوم الاقتراع." }
    ]
  },
  KRI: {
    title: "مؤشر موثوقية المفتاح (KRI)",
    type: "indicator",
    description: "يقيس مدى إمكانية الاعتماد الموثوق على المفتاح الميداني لضمان ثبات الأصوات الموعودة ووصولها لصناديق الاقتراع دون تلاعب أو تسرب.",
    formula: "KRI = (الولاء × 0.25) + (أسباب الدعم × 0.20) + (الحماية × 0.20) + (الاحتياجات × 0.20) + (الاستقرار الميداني × 0.15)",
    weights: [
      { factor: "درجة الولاء للمرشح", weight: "25%", description: "التقييم المباشر لولاء المفتاح من 1 إلى 5." },
      { factor: "وجود أسباب دعم واضحة", weight: "20%", description: "أسباب الدعم المسجلة للناخبين التابعين له (مثل عقيدة سياسية أو عشائرية)." },
      { factor: "مستوى الحماية", weight: "20%", description: "مؤشر عكسي لمستوى الخطر الميداني المحيط بالمفتاح." },
      { factor: "تلبية الاحتياجات والخدمات", weight: "20%", description: "نسبة الطلبات والاحتياجات المنجزة للمفتاح وكتلته." },
      { factor: "الاستقرار الميداني والتواصل", weight: "15%", description: "مدى استمرارية التواصل والزيارات الميدانية للمفتاح." }
    ]
  },
  VPS: {
    title: "مؤشر احتمالية التصويت (VPS)",
    type: "indicator",
    description: "يقيس مدى ترجيح إقبال الناخبين المرتبطين بمفاتيحنا وتصويتهم الفعلي يوم الحسم، مع مراعاة اختلاف مستويات التأييد.",
    formula: "VPS = (عدد المؤيدين × 80 + عدد المحايدين × 50 + عدد الضعفاء × 30) ÷ إجمالي عدد الناخبين",
    weights: [
      { factor: "صوت مؤيد", weight: "80 نقطة", description: "احتمال تصويت مرتفع جداً." },
      { factor: "صوت محايد", weight: "50 نقطة", description: "احتمال تصويت متوسط (بحاجة لتحفيز)." },
      { factor: "صوت ضعيف", weight: "30 نقطة", description: "احتمال تصويت منخفض (بحاجة لمتابعة مكثفة)." }
    ]
  },
  DRS: {
    title: "مؤشر خطر انشقاق الكادر (DRS)",
    type: "indicator",
    description: "يقيس احتمالية انشقاق المفتاح الانتخابي أو تحوله لمرشح منافس مع الكتلة التصويتية التابعة له.",
    formula: "DRS = (ضعف الولاء × 0.25) + (نسبة الناخبين الضعفاء × 0.20) + (ضغط الاحتياجات غير الملباة × 0.20) + (ضعف التعليم للكتلة × 0.15) + (ضعف التنظيم والبيانات × 0.10) + (انقطاع التواصل × 0.10)",
    weights: [
      { factor: "ضعف الولاء", weight: "25%", description: "انخفاض درجة ولاء المفتاح للحملة يزيد الخطر مباشرة." },
      { factor: "تضخم الشريحة الضعيفة", weight: "20%", description: "زيادة نسبة الناخبين ذوي الولاء المتذبذب التابعين له." },
      { factor: "ضغط المطالب والاحتياجات", weight: "20%", description: "المطالب والخدمات غير المستجاب لها ترفع من دافعية الانشقاق." },
      { factor: "ضعف المستوى التعليمي للناخبين", weight: "15%", description: "ارتفاع نسبة الأمية يجعل الكتلة أكثر عرضة للتأثيرات الخارجية." },
      { factor: "ضعف تنظيم وتدقيق البيانات", weight: "10%", description: "بيانات ناقصة أو غير دقيقة تسهل اختراق الكوادر من المنافسين." },
      { factor: "انقطاع التواصل الميداني", weight: "10%", description: "إهمال التواصل المباشر مع المفتاح لفترة طويلة." }
    ],
    note: "⚠️ هذا مؤشر عكسي: القيمة المرتفعة تشير إلى خطر كبير يتطلب تدخلاً عاجلاً وسريعاً من اللجنة القيادية."
  },
  API: {
    title: "مؤشر اختراق المنطقة وتوسع التأثير (API)",
    type: "indicator",
    description: "يقيس مدى قدرة الحملة على اختراق البيئة الجغرافية المحددة واستقطاب الشرائح المحايدة لضمهم لجمهور المرشح.",
    formula: "API = (نسبة المحايدين × 0.30) + (نسبة التوسع الحالية × 0.25) + (متوسط موثوقية المفاتيح × 0.25) + (التقييم الموزون للمنطقة × 0.20)",
    weights: [
      { factor: "نسبة المحايدين بالمنطقة", weight: "30%", description: "تمثل الشريحة المستهدفة القابلة للاستقطاب والتوجيه." },
      { factor: "نسبة التوسع الحالية", weight: "25%", description: "نسبة الأصوات المؤيدة الحالية من إجمالي الكتلة الانتخابية للمنطقة." },
      { factor: "متوسط موثوقية المفاتيح (KRI)", weight: "25%", description: "مدى استقرار وموثوقية الكوادر العاملة بالمنطقة." },
      { factor: "التقييم الموزون للمنطقة", weight: "20%", description: "جودة أداء وكفاءة عمل المفاتيح الميداني بالمنطقة." }
    ]
  },
  EWLI: {
    title: "مؤشر الإنذار المبكر لفقدان الأصوات (EWLI)",
    type: "indicator",
    description: "مؤشر أمني انتخابي يحذر من مخاطر تراجع التأييد أو تسرب وفقدان أصوات مضمونة في قضاء أو منطقة معينة نتيجة أنشطة المنافسين أو تذبذب الولاء.",
    formula: "EWLI = (نسبة الضعفاء بالمنطقة × 0.30) + (متوسط خطر الانشقاق × 0.25) + (مستوى التهديدات الميدانية × 0.20) + (تراجع الموثوقية العامة × 0.15) + (قوة ووجود المنافسين بالمنطقة × 0.10)",
    weights: [
      { factor: "نسبة الناخبين الضعفاء بالمنطقة", weight: "30%", description: "الناخبون ذوو الولاء المذبذب هم الأكثر عرضة للتسرب." },
      { factor: "خطر انشقاق الكوادر (DRS)", weight: "25%", description: "خطر خسارة مفاتيح بالمنطقة يهدد بانهيار الكتلة المرتبطة بهم." },
      { factor: "التهديدات الميدانية المرصودة", weight: "20%", description: "المشاكل العشائرية أو الخدمية الحرجة المكتشفة في المنطقة." },
      { factor: "تراجع الموثوقية العامة", weight: "15%", description: "عكس مؤشر الموثوقية KRI للمنطقة." },
      { factor: "قوة وحراك المنافسين", weight: "10%", description: "كثافة الحراك الدعائي والخدمي للقوائم الأخرى في نفس المنطقة." }
    ],
    note: "⚠️ القيمة المرتفعة تشير إلى خطر حاد يستدعي عقد اجتماع طارئ لغرفة العمليات لحماية المنطقة."
  },
  GSI: {
    title: "مؤشر القوة الجغرافية وتغطية الدوائر (GSI)",
    type: "indicator",
    description: "يقيس مدى قوة انتشار الحملة الجغرافي وتوازنها الانتخابي وتغطيتها الشاملة لمختلف مراكز الاقتراع في المحافظة.",
    formula: "GSI = (تغطية مراكز الاقتراع × 0.25) + (توزيع الأصوات والتشتت × 0.25) + (متوسط كفاءة المفاتيح بالمنطقة × 0.25) + (التوازن الجغرافي الفرعي × 0.25)",
    weights: [
      { factor: "تغطية مراكز الاقتراع", weight: "25%", description: "نسبة المراكز التي يغطيها مفتاح انتخابي نشط واحد على الأقل." },
      { factor: "توزيع وتماسك الأصوات", weight: "25%", description: "مدى كثافة أصواتنا وعدم تركزها في دائرة واحدة وتهميش الدوائر الأخرى." },
      { factor: "متوسط كفاءة المفاتيح (التقييم الموزون)", weight: "25%", description: "متوسط درجات التقييم الموزون للكوادر بالمنطقة." },
      { factor: "التوازن الجغرافي الفرعي", weight: "25%", description: "التمثيل المتوازن للحملة عبر الأقضية والقرى والأحياء." }
    ]
  },
  EDRI: {
    title: "مؤشر جاهزية يوم الاقتراع (EDRI)",
    type: "indicator",
    description: "يقيس المستوى العملي واللوجستي لاستعداد كادر الماكينة الانتخابية لإنجاح عملية التصويت وضمان وصول الناخبين وحماية أصواتهم يوم الاقتراع.",
    formula: "EDRI = (المفاتيح المدربة والجاهزة × 0.20) + (نسبة الحماية العالية للمفاتيح × 0.20) + (التحقق الجغرافي بالموقع × 0.20) + (التحقق من السجل الانتخابي × 0.20) + (متوسط الولاء والالتزام للمنطقة × 0.20)",
    weights: [
      { factor: "نسبة المفاتيح الميدانية المدربة", weight: "20%", description: "نسبة المفاتيح الحاصلة على درجة دقة بيانات وموثوقية ميدانية تفوق 80%." },
      { factor: "نسبة الأمان للمفاتيح (خطر منخفض)", weight: "20%", description: "نسبة المفاتيح التي تعيش في وضع مستقر وبعيد عن الضغوط (خطر ≤ 2)." },
      { factor: "التحقق الجغرافي بالموقع (GPS)", weight: "20%", description: "نسبة ناخبينا الذين تم التحقق وتثبيت مواقع سكنهم ومطابقتها ميدانياً." },
      { factor: "التحقق من السجل الانتخابي الرسمي", weight: "20%", description: "نسبة الناخبين المؤكد ورود أسمائهم وبياناتهم في سجلات المفوضية." },
      { factor: "متوسط الولاء والالتزام للمنطقة", weight: "20%", description: "الالتزام الكلي والموثوقية العامة للمفاتيح والناخبين." }
    ]
  },
  PROJECTED_SEATS: {
    title: "المقاعد المتوقعة (Projected Seats)",
    type: "indicator",
    description: "تقدير فوري لعدد المقاعد المتوقع حصدها لصالح قائمتنا من أصل مقاعد مجلس المحافظة الـ 18، بناءً على الحسابات اللحظية المرجحة وصافي الأصوات الانتخابية المضمونة ومطابقتها مع أصوات المنافسين.",
    formula: "حساب لحظي غير مخزن (On-the-fly) يعتمد على خوارزمية سانت لاغي المعدلة بقاسم 1.7. يتم تقسيم صافي الأصوات المتوقع للقوائم المتنافسة على القواسم الفردية وتوزيع المقاعد الـ 18 على الكيانات صاحبة أعلى نواتج القسمة.",
    weights: [
      { factor: "صافي أصواتنا المتوقعة", weight: "مدخل رئيسي", description: "مجموع الأصوات الصافية المرجحة بعد استبعاد هامش الغياب والتذبذب." },
      { factor: "أصوات القوائم المنافسة", weight: "مدخل مقارن", description: "تقدير الأصوات للأحزاب المنافسة بناءً على استطلاعات الرأي والنتائج التاريخية." },
      { factor: "إجمالي المقاعد المخصصة", weight: "ثابت النظام", description: "18 مقعداً مخصصة لتمثيل مجلس محافظة ذي قار." }
    ]
  },
  VOTES_NEEDED: {
    title: "الأصوات المطلوبة للفوز بمقعد",
    type: "indicator",
    description: "الحد الأدنى التقديري والآمن من الأصوات الصافية اللازمة لحسم وضمان المقعد الأول لقائمتنا في محافظة ذي قار.",
    formula: "الأصوات المطلوبة = (إجمالي عدد الناخبين المسجلين بالمحافظة × نسبة المشاركة العامة المتوقعة) ÷ إجمالي عدد مقاعد المحافظة",
    weights: [
      { factor: "الناخبون المسجلون بالمحافظة", weight: "855,000", description: "العدد الكلي للناخبين المسجلين الذين يحق لهم التصويت في ذي قار." },
      { factor: "نسبة المشاركة التاريخية المتوقعة", weight: "58%", description: "متوسط نسبة إقبال الناخبين يوم الاقتراع بناءً على الإحصاءات السابقة." },
      { factor: "عدد المقاعد الكلي بالمحافظة", weight: "18 مقعداً", description: "التمثيل النسبي لمقاعد مجلس محافظة ذي قار." }
    ]
  },
  EXPECTED_VOTES: {
    title: "عدد الأصوات المتوقعة",
    type: "indicator",
    description: "التقدير الإحصائي والواقعي لأعداد الناخبين الذين سيتوجهون فعلياً لصناديق الاقتراع للتصويت لصالح مرشحنا، بعد تصفية أرقام المفاتيح الانتخابية بالمعادلة المرجحة.",
    formula: "الأصوات المتوقعة = (أصوات المؤيدين للمفاتيح × 0.80) + (أصوات المحايدين × 0.50) + (أصوات الضعفاء × 0.30)",
    weights: [
      { factor: "ناخب مؤيد", weight: "× 0.80", description: "يحتسب 80% من أصوات المؤيدين للتصويت الفعلي." },
      { factor: "ناخب محايد", weight: "× 0.50", description: "يحتسب 50% من أصوات المحايدين كمشاركين محتملين." },
      { factor: "ناخب ضعيف", weight: "× 0.30", description: "يحتسب 30% من الأصوات الضعيفة كتصويت مشارك كحد أقصى." }
    ]
  },
  ELECTORAL_GAP: {
    title: "الفجوة الانتخابية (Electoral Gap)",
    type: "indicator",
    description: "الفارق العددي بين حجم الأصوات المتوقع حصدها حالياً وبين عتبة الأصوات المطلوبة لضمان حسم المقعد الانتخابي الأول.",
    formula: "الفجوة الانتخابية = الأصوات المطلوبة للفوز − الأصوات المتوقعة الحالية",
    note: "إذا كانت القيمة موجبة: تدل على وجود عجز ونحتاج لحشد المزيد من الناخبين. إذا كانت صفراً أو سالبة: فهذا يعني أننا تخطينا عتبة الأمان بنجاح وتجاوزنا المستهدف."
  },
  PARTICIPATION: {
    title: "نسبة المشاركة المتوقعة",
    type: "indicator",
    description: "النسبة المئوية التقديرية لإجمالي المصوتين الذين سيشاركون فعلياً في العملية الانتخابية بالمحافظة في يوم الحسم، وارتفاعها يعني ارتفاع عتبة الفوز.",
    formula: "نسبة المشاركة = (عدد المصوتين الفعليين المتوقع ÷ إجمالي عدد الناخبين المسجلين) × 100"
  },
  WIN_PROBABILITY: {
    title: "نسبة إمكانية الفوز (Win Probability)",
    type: "indicator",
    description: "مؤشر يعكس احتمالية حصد وضمان قائمتنا للمقعد الأول بناءً على المسافة الفاصلة بين أصواتنا المتوقعة الحالية وبين العتبة الانتخابية.",
    formula: "إمكانية الفوز = (الأصوات المتوقعة ÷ الأصوات المطلوبة للفوز) × 100 (الحد الأقصى 100%)",
    classification: [
      { range: "70% فأكثر", label: "فرصة فوز مرتفعة جداً وقوية ✅" },
      { range: "40% إلى 69%", label: "فرصة فوز متوسطة وممكنة بالجهد 🟡" },
      { range: "أقل من 40%", label: "فرصة فوز ضعيفة تتطلب مراجعة جذرية 🔴" }
    ]
  },
  OVERALL_RISK: {
    title: "مؤشر المخاطر الانتخابية الشامل",
    type: "indicator",
    description: "مستوى المخاطر العام الذي يهدد استقرار الماكينة الانتخابية، ويجمع بين خطر الانشقاق وضعف الموثوقية العامة للكوادر.",
    formula: "المخاطر الشاملة = (متوسط خطر الانشقاق DRS × 0.60) + ((100 − متوسط موثوقية الكوادر KRI) × 0.40)",
    weights: [
      { factor: "متوسط خطر الانشقاق (DRS)", weight: "60%", description: "العامل الأكثر أهمية وتأثيراً في مؤشر الخطر." },
      { factor: "ضعف الموثوقية (100 - KRI)", weight: "40%", description: "يقيس احتمالية الانهيار الداخلي وتذبذب الولاء." }
    ],
    classification: [
      { range: "أقل من 25", label: "مخاطر منخفضة ووضع آمن ومستقر 🟢" },
      { range: "25 إلى 50", label: "مخاطر متوسطة تتطلب المتابعة والحذر 🟡" },
      { range: "أكثر من 50", label: "مخاطر مرتفعة وحرجة تتطلب تدخلاً فورياً 🔴" }
    ]
  },

  // ─── المصطلحات والتعاريف الفنية (Terms) ───
  ELECTORAL_KEY: {
    title: "المفتاح الانتخابي (Electoral Key)",
    type: "term",
    description: "هو شخصية اعتبارية أو كادر ميداني مؤثر (مثل شيخ عشيرة، وجيه اجتماعي، منسق نقابي) يتبعه كتلة من الناخبين. يمثل المفتاح صلة الوصل بين إدارة الحملة والجمهور الانتخابي، وهو المسؤول عن توجيه وحشد هذه الأصوات وتنظيم تواصلها.",
    note: "يتم تقييم المفاتيح دورياً للتأكد من التزامهم وكفاءتهم الميدانية عبر نظام الأبعاد التسعة."
  },
  NET_VOTES: {
    title: "الأصوات الصافية (Net Votes)",
    type: "term",
    description: "هي الأصوات الفعلية المرجحة التي يتوقع الحصول عليها من المفتاح الانتخابي بعد تصفية أرقام كتلته الانتخابية بالمعادلة المرجحة للماكينة الانتخابية، بدلاً من الاعتماد على أرقام الادعاء الكاملة.",
    formula: "الأصوات الصافية = (أصوات المؤيدين × 0.8) + (أصوات المحايدين × 0.5) + (أصوات الضعفاء × 0.3)",
    note: "تعد هذه الطريقة الحسابية صمام الأمان لمنع تضخيم الأرقام الميدانية والمفاجآت غير السارة يوم الاقتراع."
  },
  GUARANTEED_VOTES: {
    title: "الأصوات المضمونة (Guaranteed Votes)",
    type: "term",
    description: "تمثل الأصوات شبه المؤكد وصولها لصندوق الاقتراع لصالح المرشح، وتُحسب بضرب الأصوات الصافية للمفتاح في كفاءته التنظيمية (تقييمه الموزون النهائي).",
    formula: "الأصوات المضمونة = الأصوات الصافية للمفتاح × (التقييم الموزون النهائي للمفتاح ÷ 100)",
    note: "إذا لم يخضع المفتاح لعملية التقييم بعد (حقل تاريخ التقييم فارغ)، يعتبر معامل الكفاءة 100% (1.0) كقيمة افتراضية حتى يتم تقييمه."
  },
  WEIGHTED_SCORE: {
    title: "التقييم الموزون للكادر (Weighted Score)",
    type: "term",
    description: "درجة كفاءة الكادر والمفتاح الانتخابي من أصل 200 نقطة (تُقسم على 2 كنسبة مئوية)، وتُحسب بجمع تقييمات المفتاح عبر 9 أبعاد ميدانية وتأثيرية مع أوزانها المخصصة، مضروبة بمعامل حجم الكتلة الانتخابية لتفضيل المفاتيح ذات الثقل الأكبر.",
    formula: "التقييم الموزون = مجموع (درجة البُعد × الوزن النسبي) × (إجمالي أصوات المفتاح ÷ 50) ، والحد الأقصى للدرجة المرجحة الكلية هو 200 نقطة.",
    weights: [
      { factor: "الولاء للمرشح", weight: "20%", description: "الالتزام الحقيقي والارتباط بالحملة." },
      { factor: "مستوى التأثير والنفوذ", weight: "20%", description: "نفوذه الاجتماعي والعائلي والعشائري." },
      { factor: "الالقدرة على التحشيد", weight: "15%", description: "القدرة على توفير اللوجستيات وتحريك الناخبين يوم التصويت." },
      { factor: "حماية الأصوات والمراقبة", weight: "15%", description: "الخبرة في متابعة مراكز الاقتراع وتعيين الوكلاء." },
      { factor: "أسباب الدعم", weight: "10%", description: "دوافع دعم المفتاح للحملة (قناعة سياسية، عشائرية، مصلحة)." },
      { factor: "الاحتياجات والمطالب", weight: "5%", description: "مدى واقعية مطالبه الشخصية والخدمية للمنطقة." },
      { factor: "الملاحظات السياسية", weight: "5%", description: "الوعي والثبات السياسي وتجنب التشتت." },
      { factor: "الملاحظات التنظيمية", weight: "5%", description: "الالتزام بتوجيهات الماكينة وتسليم الاستمارات والتقارير." },
      { factor: "الملاحظات العامة", weight: "5%", description: "السمعة والمصداقية والقبول الاجتماعي العام للمفتاح." }
    ]
  },
  SAINT_LAGUE: {
    title: "طريقة سانت لاغي المعدلة 1.7 (Saint-Laguë)",
    type: "term",
    description: "هي آلية توزيع المقاعد البرلمانية ومجالس المحافظات المعتمدة رسمياً في العراق. تهدف لتوزيع المقاعد بطريقة نسبية وعادلة تمنح الكيانات الكبيرة والصغيرة حظوظاً عادلة بناءً على مجموع الأصوات الحزبية.",
    formula: "يتم جمع إجمالي الأصوات لكل حزب. تُقسم أصوات الحزب على القواسم الفردية المتتالية (1.7، 3، 5، 7، 9...) وتُرتب النواتج تنازلياً، ليتم منح مقاعد مجلس المحافظة الـ 18 لأصحاب أعلى النواتج."
  },
  WAR_ROOM: {
    title: "غرفة العمليات المشتركة (War Room)",
    type: "term",
    description: "مركز المراقبة اللحظي والتفاعلي المخصص لمتابعة مجريات يوم الحسم الانتخابي. يعرض إحصائيات الإقبال، ونسب التصويت العامة، والفرز في الأقضية، وسجل التنبيهات والإنذارات الميدانية الحرجة لتوفير استجابة سريعة للجان التنفيذية."
  },
  EARLY_WARNING: {
    title: "الإنذار المبكر (Early Warning)",
    type: "term",
    description: "نظام إلكتروني ذكي يرصد ويحلل مؤشرات الخطر مثل انخفاض درجات ثقة الناخبين أو تذبذب ولاء الكوادر أو تزايد ضغط المطالب المادية والخدمية، وينبه قيادة الحملة تلقائياً بوجود مناطق أو مفاتيح تحت تهديد التسرب لفقدان الأصوات."
  },
  CONFIDENCE_DEGREE: {
    title: "درجة الثقة / الولاء (Confidence Degree)",
    type: "term",
    description: "مقياس تفصيلي من 1 إلى 5 نجوم يُحدد لكل ناخب في قاعدة البيانات ليعكس مدى التزامه بالتصويت لمرشحنا. يتم تسجيل السجل التاريخي لتعديلات هذا الحقل مع توثيق الأسباب لمنع التلاعب وضمان نزاهة وموثوقية الإدخال الميداني."
  },
  VOTER_CLASSIFICATION: {
    title: "تصنيف الناخبين (Voter Classification)",
    type: "term",
    description: "تقسيم وتصنيف ناخبي الماكينة الانتخابية إلى ثلاث فئات رئيسية بناءً على درجة ولائهم للحملة لتركيز خطة الاستهداف:",
    classification: [
      { range: "مؤيد", label: "ناخب مضمون بنسبة عالية للحملة (احتمالية مشاركته وتصويته 80%)" },
      { range: "محايد", label: "ناخب متردد أو لم يقرر بعد (يُحتسب بنسبة 50% ويستهدف بكثافة لإقناعه)" },
      { range: "ضعيف", label: "ناخب يميل للمنافسين أو يمتلك قناعة هشة (يُحتسب بنسبة 30% فقط ويحتاج متابعة وحذر)" }
    ]
  },
  GPS_VERIFICATION: {
    title: "التحقق الجغرافي (GPS Auditing)",
    type: "term",
    description: "مؤشر يعبر عن النسبة المئوية للناخبين الذين تم تدقيق ومطابقة مواقع سكنهم الجغرافية ميدانياً عبر مناديبنا، للتأكد من صحة توزيعهم الجغرافي وربطهم بالمراكز الانتخابية الصحيحة."
  },
  REGISTRY_VERIFICATION: {
    title: "التحقق من السجل الانتخابي (Registry Auditing)",
    type: "term",
    description: "نسبة مطابقة بيانات هويات ناخبينا مع سجلات الناخبين الرسمية الصادرة من المفوضية العليا المستقلة للانتخابات لضمان عدم وجود أخطاء في الدوائر أو استبعاد للناخبين قبل يوم الحسم."
  },
  TRIBAL_DEDUPLICATION: {
    title: "تنقية ودمج العشائر (Tribal Deduplication)",
    type: "term",
    description: "محرك لتنقية وتطهير سجلات العشائر والقبائل من التكرار التشابهي والإملائي (مثل السالم والسامر، أو دمج أل التعريف واللاواحق) عبر خوارزميات الذكاء الاصطناعي والتطبيع العربي لتوحيد البيانات وإعادة توجيه الناخبين والمفاتيح لقاعدة بيانات واحدة سليمة."
  },
  AUDITING_COCKPIT: {
    title: "غرفة مراقبة جودة البيانات (Auditing Cockpit)",
    type: "term",
    description: "منصة رقابة فنية متكاملة تضمن خلو بيانات الماكينة الانتخابية من التضخيم أو البيانات المدخلة بشكل عشوائي، وتقيس جودة المدخلات عبر معايير: التدقيق الجغرافي، مطابقة المفوضية، جاهزية المفتاح، واستجابة الناخبين للخدمات."
  },
  SERVICE_CONVERSION: {
    title: "نسبة تحويل الخدمات لأصوات (Service Conversion)",
    type: "term",
    description: "تقيس النسبة المئوية لفعالية تلبية الخدمات والاحتياجات الميدانية والمجتمعية التي تقدمها الحملة للمناطق والمفاتيح في تحويل وتأكيد ولاء الناخبين ليصبحوا داعمين للمرشح.",
    formula: "النسبة = (عدد الأصوات التي تم تثبيت تأييدها بسبب خدمة ملباة ÷ إجمالي الخدمات المقدمة) × 100"
  }
};

interface ExplanationModalContextType {
  showExplanation: (key: string) => void;
  closeExplanation: () => void;
  activeKey: string | null;
  activeItem: ExplanationItem | null;
}

const ExplanationModalContext = createContext<ExplanationModalContextType | null>(null);

export function ExplanationModalProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeItem = activeKey ? EXPLANATIONS[activeKey] : null;

  const showExplanation = useCallback((key: string) => {
    if (EXPLANATIONS[key]) {
      setActiveKey(key);
    } else {
      console.warn(`Explanation key "${key}" not found in definitions.`);
    }
  }, []);

  const closeExplanation = useCallback(() => {
    setActiveKey(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeExplanation();
      }
    };
    if (activeKey) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKey, closeExplanation]);

  return (
    <ExplanationModalContext.Provider value={{ showExplanation, closeExplanation, activeKey, activeItem }}>
      {children}
      
      {/* ─── Modal ─── */}
      {activeKey && activeItem && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
          dir="rtl"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#031635]/65 backdrop-blur-md transition-opacity duration-300"
            onClick={closeExplanation}
          />
          
          {/* Modal Container */}
          <div 
            className="relative bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explanation-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${activeItem.type === 'indicator' ? 'bg-[#031635]/10 text-[#031635] dark:bg-blue-900/30 dark:text-blue-400' : 'bg-[#fea619]/10 text-[#855300] dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  <Info className="w-5 h-5" />
                </span>
                <h3 
                  id="explanation-modal-title" 
                  className="text-base font-bold text-foreground"
                >
                  {activeItem.title}
                </h3>
              </div>
              <button 
                onClick={closeExplanation}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scroll text-right">
              {/* Technical Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">التفسير الفني</span>
                <p className="text-[13.5px] leading-relaxed text-foreground/90">
                  {activeItem.description}
                </p>
              </div>

              {/* Note banner if present */}
              {activeItem.note && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                    {activeItem.note}
                  </p>
                </div>
              )}

              {/* Weights Table if present */}
              {activeItem.weights && activeItem.weights.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">العوامل المؤثرة والأوزان</span>
                  <div className="rounded-lg border border-border/20 overflow-hidden bg-muted/10">
                    <table className="w-full border-collapse text-[12px]">
                      <thead>
                        <tr className="border-b border-border/20 bg-muted/40">
                          <th className="py-2 px-3 text-right font-bold text-foreground">العامل</th>
                          <th className="py-2 px-3 text-center font-bold text-[#031635] dark:text-blue-400 w-16">الوزن</th>
                          <th className="py-2 px-3 text-right font-bold text-foreground">التأثير والشرح</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeItem.weights.map((w, idx) => (
                          <tr 
                            key={idx} 
                            className="border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors"
                          >
                            <td className="py-2 px-3 font-semibold text-foreground/90">{w.factor}</td>
                            <td className="py-2 px-3 text-center font-bold text-[#031635] dark:text-blue-400">{w.weight}</td>
                            <td className="py-2 px-3 text-muted-foreground text-[11px] leading-relaxed">{w.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Classifications if present */}
              {activeItem.classification && activeItem.classification.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">تصنيف النتائج</span>
                  <div className="flex flex-wrap gap-2">
                    {activeItem.classification.map((cls, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-lg border border-border/30 bg-muted/30 px-3 py-1.5 text-[11px] flex items-center gap-1.5"
                      >
                        <span className="font-bold text-foreground">{cls.range}</span>
                        <span className="text-muted-foreground">←</span>
                        <span className="font-semibold text-[#031635] dark:text-blue-400">{cls.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mathematical Formula if present */}
              {activeItem.formula && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    المعادلة الحسابية للماكينة
                  </span>
                  <div className="rounded-lg bg-muted/40 border border-border/20 p-3 text-center">
                    <code 
                      className="text-[13px] font-bold text-[#031635] dark:text-blue-400 font-mono leading-relaxed block whitespace-pre-wrap"
                      dir="ltr"
                      style={{ unicodeBidi: "plaintext" }}
                    >
                      {activeItem.formula}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border/20 bg-muted/20 flex justify-end shrink-0">
              <button 
                onClick={closeExplanation}
                className="px-4 py-1.5 rounded-lg bg-muted hover:bg-muted-foreground/15 text-foreground text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                إغلاق التوضيح
              </button>
            </div>
          </div>
        </div>
      )}
    </ExplanationModalContext.Provider>
  );
}

export function useExplanation(): ExplanationModalContextType {
  const ctx = useContext(ExplanationModalContext);
  if (!ctx) throw new Error('useExplanation must be used within ExplanationModalProvider');
  return ctx;
}
