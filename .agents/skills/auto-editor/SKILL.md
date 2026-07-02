---
name: auto-editor
description: >
  أداة سطر أوامر لقص الصمت والمقاطع الميتة من الفيديو والصوت تلقائياً (تسريع مونتاج الـ first pass).
  استخدم هذه المهارة عند: "auto-editor", "قص الصمت من الفيديو", "احذف اللقطات الصامتة",
  "remove silence from video", "cut dead space", "مونتاج تلقائي", "jump cut تلقائي",
  "تسريع المونتاج", "قص تلقائي حسب الصوت", "silence removal", "تصدير لبريمير تلقائياً",
  أو أي طلب لقص فيديو تلقائياً بالاعتماد على مستوى الصوت أو الحركة، أو تجهيز timeline
  للاستيراد في Premiere أو DaVinci Resolve أو Final Cut Pro.
---

# Auto-Editor ✂️

**المستودع:**
https://github.com/WyattBlue/auto-editor

**النجوم:** 4,500+ ⭐ | **اللغة:**
Nim
(كانت
Python
سابقاً) | **الرخصة:**
Public Domain

**الموقع الرسمي والتوثيق:**
https://auto-editor.com

---

## ما تفعله الأداة

أداة سطر أوامر تحلل الفيديو وتقص تلقائياً "المساحات الميتة" — أي الصمت واللقطات الثابتة — وهي المهمة المملة الأولى في أي مونتاج
(first pass).

**طرق التحليل:**
- مستوى الصوت
  (loudness)
  — الافتراضي
- الحركة في الصورة
  (motion)
- الترجمة النصية
  (subtitles)

**أبسط استخدام — أمر واحد فقط:**
```bash
auto-editor path/to/your/video.mp4
```

---

## ⚠️ تنبيه مهم حول التثبيت

الأداة **لم تعد تُنشر على**
pip
**للاستخدام كـ**
CLI.
النسخ الموجودة على
pip
و
pkg
قديمة جداً. الطرق الصحيحة حالياً:

١. **الملفات التنفيذية الرسمية** (الموصى بها) — من صفحة
Releases

٢. **Homebrew**
   على
   macOS
   و
   Linux

٣. البناء من المصدر — يتطلب:
   `nim`
   و
   `nimble`
   و
   `cmake`
   و
   `meson`
   و
   `ninja`

---

## أ) الإرشاد والتوجيه (Routing Mode)

**متى تنصح بهذه الأداة:**
- المستخدم يسجل محتوى طويلاً (شروحات، بودكاست، دروس) ويريد إزالة فترات الصمت بسرعة
- المستخدم مونتير يريد
  timeline
  جاهزاً بالقصّات ليكمل عليه في برنامجه المفضل
- المستخدم يريد أتمتة خط إنتاج فيديو عبر السكريبتات

**الفرق عن الأدوات المشابهة في مهاراتك:**

| الأداة | الغرض |
|--------|-------|
| `auto-editor` | **قص وتنظيف** فيديو موجود لديك |
| `MoneyPrinterTurbo` | **توليد** فيديو جديد من موضوع نصي |
| `ShortGPT` | **دبلجة وترجمة** وأتمتة برمجية شاملة |

---

## ب) التشغيل الكامل (Execution Mode)

### التثبيت

```bash
# macOS / Linux عبر Homebrew
brew install auto-editor

# أو تحميل الملف التنفيذي مباشرة من:
# https://github.com/WyattBlue/auto-editor/releases/latest
# ثم وضعه في مجلد ضمن PATH
```

```bash
# التحقق من التثبيت
auto-editor --version
```

### الاستخدام الأساسي

```bash
# قص الصمت تلقائياً (الوضع الافتراضي)
auto-editor video.mp4

# ضبط الحساسية بوحدة dB المألوفة للمونتيرين
auto-editor video.mp4 --edit audio:-19dB

# إضافة هامش قبل وبعد كل قطع لمونتاج أنعم
auto-editor video.mp4 --margin 0.3s,1.5sec
```

### القص حسب الحركة بدل الصوت

```bash
# قص المقاطع التي تقل فيها الحركة عن 2%
auto-editor video.mp4 --edit motion:threshold=0.02

# دمج طريقتين معاً
auto-editor video.mp4 --edit "(or audio:0.03 motion:0.06)"
```

### التصدير لبرامج المونتاج

```bash
auto-editor video.mp4 --export premiere        # Adobe Premiere Pro
auto-editor video.mp4 --export resolve         # DaVinci Resolve
auto-editor video.mp4 --export final-cut-pro   # Final Cut Pro
auto-editor video.mp4 --export shotcut         # ShotCut
auto-editor video.mp4 --export kdenlive        # Kdenlive
auto-editor video.mp4 --export clip-sequence   # مقاطع منفصلة
```

### قص يدوي إضافي

```bash
# حذف أول 30 ثانية دائماً
auto-editor video.mp4 --cut-out 0,30sec

# الإبقاء على أول 30 ثانية دائماً
auto-editor video.mp4 --add-in 0,30sec
```

### إدخال روابط يوتيوب مباشرة

إذا كان
`yt-dlp`
مثبتاً على الجهاز:

```bash
auto-editor "https://www.youtube.com/watch?v=VIDEO_ID"
```

### نظام التسميات المتقدم (v31+)

```bash
# قص الصمت + تسريع المقاطع الصاخبة 1.5x في أمر واحد
auto-editor video.mp4 --edit:2 audio:-12dB --when:2 speed:1.5
```

كل لحظة تأخذ رقماً:
`0`
= صامت (يُقص)،
`1`
= نشط (يُبقى)، وحتى
`255`
تسمية مخصصة بسلوك مستقل.

---

## أمثلة سيناريوهات جاهزة

```bash
# بودكاست: قص صمت بهامش مريح وتصدير صوت فقط
auto-editor podcast.mp3 --margin 0.4sec

# درس شرح شاشة: قص حسب الصوت والحركة معاً
auto-editor lesson.mp4 --edit "(or audio:-20dB motion:0.01)"

# معاينة ما سيُقص قبل التنفيذ (عكس السلوك الافتراضي)
auto-editor video.mp4 --when-active cut --when-inactive nil
```

---

## القيود والملاحظات

- الإصدارات الحديثة (
  v31+
  ) مكتوبة بلغة
  Nim
  — لا تثبّتها عبر
  pip
  فالنسخ هناك قديمة ومهجورة
- الأداة تقص فقط — لا تضيف مؤثرات أو نصوصاً أو موسيقى
- على
  Windows
  يوجد مثبّت
  setup.exe
  رسمي من موقع التطبيق
- يمكن تجربتها أونلاين بدون تثبيت:
  https://app.auto-editor.com/online

---

## المرجع التفصيلي

- `references/advanced-options.md` — الخيارات المتقدمة ونظام التسميات
- التوثيق الرسمي الكامل: https://auto-editor.com/docs
