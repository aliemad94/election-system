---
name: shortgpt
description: >
  إطار عمل لأتمتة إنشاء الفيديوهات القصيرة والمحتوى بالذكاء الاصطناعي، مع دعم الدبلجة والترجمة الصوتية للفيديوهات الكاملة.
  استخدم هذه المهارة عند: "ShortGPT", "شورت جي بي تي", "دبلجة فيديو", "ترجمة فيديو صوتياً",
  "dub a video", "translate video audio", "أتمتة يوتيوب", "youtube automation",
  "فيديوهات تيك توك تلقائية", "TikTok automation", "video automation framework",
  أو أي طلب لأتمتة إنشاء شورتات، دبلجة محتوى للغات أخرى، أو بناء خط إنتاج فيديو برمجي.
  يدعم أكثر من 30 لغة (منها العربية) عبر EdgeTTS المجاني.
---

# ShortGPT 🚀🎬

**المستودع:**
https://github.com/RayVentura/ShortGPT

**النجوم:** 7,500+ ⭐ | **اللغة:**
Python
| **التوثيق:**
https://docs.shortgpt.ai

---

## ما تفعله الأداة

إطار عمل
(Framework)
برمجي لأتمتة إنتاج الفيديو — أعمق من مجرد أداة توليد. يوفر أربعة محركات:

| المحرك | الوظيفة |
|--------|---------|
| `ContentShortEngine` | إنشاء شورتات كاملة: من النص حتى الرندر النهائي مع بيانات يوتيوب |
| `ContentVideoEngine` | فيديوهات أطول: صوت، مقاطع خلفية تلقائية، توقيت الترجمة |
| `ContentTranslationEngine` | **دبلجة وترجمة فيديو كامل** — يأخذ ملفاً أو رابط يوتيوب ويعيده بلغة أخرى مع صوت وترجمة |
| `EditingEngine` | لغة تحرير مبنية على JSON يفهمها الذكاء الاصطناعي |

**الميزة الفريدة مقارنة بـ**
MoneyPrinterTurbo
**:** محرك الدبلجة والترجمة — تحويل فيديو عربي إلى إنجليزي أو العكس بصوت مولّد.

---

## اللغات المدعومة

أكثر من 30 لغة عبر
EdgeTTS
المجاني، منها:
العربية 🇦🇪، الإنجليزية، الفرنسية، الألمانية، الإسبانية، الروسية، الصينية، اليابانية، الهندية، الكورية.

---

## المتطلبات

| المتطلب | ملاحظات |
|---------|---------|
| `Docker` | **إلزامي للتشغيل المحلي** (أو استخدم Colab بدون تثبيت) |
| `Python 3.10` | فقط عند التثبيت اليدوي من المصدر |
| `ffmpeg 4.2.3` | للتثبيت اليدوي |
| مفتاح `OPENAI_API_KEY` أو `GEMINI_API_KEY` | لتوليد النصوص |
| مفتاح `PEXELS_API_KEY` | للمقاطع المجانية |
| مفتاح `ELEVENLABS_API_KEY` | اختياري — أصوات أفضل (EdgeTTS مجاني كبديل) |

---

## أ) الإرشاد والتوجيه (Routing Mode)

استخدم هذا القسم عند شرح الأداة أو مقارنتها ببدائل.

**متى تنصح بـ**
ShortGPT
**:**
- المستخدم يريد **دبلجة/ترجمة** فيديوهات موجودة
- المستخدم مطوّر يريد **إطار عمل برمجي** قابل للتخصيص
- المستخدم يبني خط إنتاج
  (pipeline)
  آلي للمحتوى

**متى تنصح بـ**
MoneyPrinterTurbo
**بدلاً منه:**
- المستخدم يريد واجهة جاهزة سهلة بدون برمجة
- التركيز على توليد فيديوهات من موضوع نصي فقط

---

## ب) التشغيل الكامل (Execution Mode)

### الطريقة ١ — Google Colab (بدون تثبيت — الموصى بها)

افتح الرابط وشغّل الخلايا بالترتيب:
```
https://colab.research.google.com/drive/1_2UKdpF6lqxCqWaAcZb3rwMVQqtbisdE
```

### الطريقة ٢ — Docker (للتشغيل المحلي)

```bash
# ١. استنساخ المستودع
git clone https://github.com/RayVentura/ShortGPT.git
cd ShortGPT

# ٢. إنشاء ملف .env بمفاتيح API
cat > .env << 'EOF'
GEMINI_API_KEY=put_your_gemini_api_key_here
OPENAI_API_KEY=sk-_put_your_openai_api_key_here
ELEVENLABS_API_KEY=put_your_eleven_labs_api_key_here
PEXELS_API_KEY=put_your_pexels_api_key_here
EOF

# ٣. بناء الصورة وتشغيلها
docker build -t short_gpt_docker:latest .
docker run -p 31415:31415 --env-file .env short_gpt_docker:latest
```

الوصول بعد التشغيل — واجهة
Gradio
على:
```
http://localhost:31415
```

### الطريقة ٣ — تثبيت يدوي (Linux، للمتقدمين)

يتطلب
Python 3.10
تحديداً و
ffmpeg 4.2.3
— التفاصيل الكاملة في:
`references/manual-install.md`

---

## الاستخدام البرمجي (كمكتبة Python)

```bash
pip install shortgpt
```

```python
# مثال: إنشاء شورت تلقائي
from shortGPT.engine.content_short_engine import ContentShortEngine
from shortGPT.config.languages import Language

engine = ContentShortEngine(
    short_type="facts_shorts",
    background_video_name="minecraft",
    background_music_name="chill",
    short_id="my_first_short",
    language=Language.ARABIC,
)

for step_num, step_info in engine.makeContent():
    print(f"الخطوة {step_num}: {step_info}")

video_path = engine.get_video_output_path()
print(f"الفيديو جاهز: {video_path}")
```

---

## التقنيات الداخلية

```
moviepy==2.1.2          — تحرير الفيديو والرندر
gradio==5.12.0          — واجهة الويب
openai==1.37.0          — توليد النصوص
whisper-timestamped     — تحويل الصوت لنص بتوقيت دقيق
edge-tts                — أصوات مجانية بأكثر من 30 لغة
yt-dlp                  — تحميل فيديوهات يوتيوب للدبلجة
tinydb                  — حفظ حالة التحرير
torch / torchaudio      — معالجة الصوت
```

---

## القيود والملاحظات

- **التشغيل المحلي يتطلب**
  Docker
  **حصراً** — التثبيت اليدوي معقّد (إصدارات محددة من
  Python
  و
  ffmpeg
  )
- التوثيق الرسمي ما يزال قيد التطوير — بعض الميزات موثقة في الكود فقط
- محرك الدبلجة يحتاج ذاكرة كبيرة للفيديوهات الطويلة (يعتمد على
  whisper
  محلياً عبر
  torch
  )
- أصوات
  ElevenLabs
  مدفوعة —
  EdgeTTS
  المجاني بديل جيد للعربية

---

## المرجع التفصيلي

- `references/manual-install.md` — خطوات التثبيت اليدوي الكاملة على Linux
