/**
 * مكتبة تطبيع الأسماء العربية للمشروع الانتخابي
 * Arabic Name Normalization for Electoral Deduplication
 */

/**
 * تطبيع العشيرة أو اللقب لإزالة أدوات التعريف واللواحق وتوحيد رسم الحروف
 * @param name الاسم المراد تطبيعه
 */
export function normalizeArabicName(name: string): string {
  if (!name) return "";
  
  // 1. تنظيف الفراغات وتحويل النص إلى أحرف صغيرة
  let normalized = name.trim().toLowerCase();

  // 2. توحيد الحروف المتشابهة في الرسم
  normalized = normalized
    .replace(/[أإآ]/g, "ا")   // توحيد الألف
    .replace(/ى/g, "ي")       // الألف المقصورة إلى ياء لتوحيد النسب
    .replace(/ة/g, "ه");      // التاء المربوطة إلى هاء

  // 3. إزالة السوابق التعريفية والقبائلية الشائعة
  // آل التعريف، البو، بيت، آل
  const prefixes = [
    /^ال(?!$)/,        // ال التعريف في البداية
    /^ال\s+/,          // الـ متبوعة بمسافة
    /^البو\s+/,        // البو متبوعة بمسافة
    /^بيت\s+/,         // بيت متبوعة بمسافة
    /^ال\s*/,          // الـ في البداية مع مسافة اختيارية
    /^آل\s+/,          // آلـ متبوعة بمسافة
  ];
  
  for (const p of prefixes) {
    normalized = normalized.replace(p, "");
  }

  // 4. إزالة اللواحق النسبية واللفظية الشائعة
  // ياء النسب، اوي، هاء التأنيث/المربوطة في نهاية الاسم
  const suffixes = [
    /اوي$/,            // مثل: غزاوي -> غز
    /ي$/,              // مثل: ركابي -> ركاب
    /ه$/,              // مثل: خفاجه -> خفاج
  ];
  
  for (const s of suffixes) {
    normalized = normalized.replace(s, "");
  }

  // 5. إزالة أي مسافات زائدة متبقية داخل الاسم
  normalized = normalized.replace(/\s+/g, "");

  return normalized;
}

/**
 * التحقق من تشابه اسمين بناءً على تطابق جذرهما المطبع
 */
export function areNamesSimilar(name1: string, name2: string): boolean {
  const norm1 = normalizeArabicName(name1);
  const norm2 = normalizeArabicName(name2);
  
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
}
