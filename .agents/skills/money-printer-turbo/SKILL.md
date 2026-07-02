---
name: money-printer-turbo
description: >
  أداة لتوليد مقاطع فيديو قصيرة احترافية تلقائياً بالذكاء الاصطناعي.
  استخدم هذه المهارة عند: "اصنع فيديو عن X", "ولّد مقطع فيديو", "أريد فيديو قصير",
  "generate a short video", "create video content", "صنع محتوى فيديو تلقائي",
  "MoneyPrinterTurbo", "money printer", "فيديو بالذكاء الاصطناعي", "AI video generator",
  أو أي طلب لإنشاء فيديو تلقائي من موضوع أو كلمة مفتاحية.
  تولّد الأداة: النص، الصور/مقاطع الفيديو، الترجمة، الموسيقى، وتجمعها في فيديو جاهز.
---

# MoneyPrinterTurbo 💸

**المستودع:**
https://github.com/harry0703/MoneyPrinterTurbo

**النجوم:** 95,000+ ⭐ | **اللغة:**
Python
| **الرخصة:**
MIT

---

## ما تفعله الأداة

أعطها موضوعاً أو كلمة مفتاحية، وتقوم تلقائياً بـ:

١. توليد نص الفيديو بنموذج ذكاء اصطناعي
٢. البحث عن مقاطع وصور مجانية مناسبة
٣. تحويل النص إلى صوت بشري
٤. إضافة ترجمة نصية
٥. إضافة موسيقى خلفية
٦. دمج كل شيء في فيديو
   HD
   جاهز للنشر

---

## متطلبات النظام

| المكوّن | الحد الأدنى | الموصى به |
|--------|-----------|-----------|
| CPU | 4 أنوية | 8 أنوية |
| RAM | 4 GB | 16 GB |
| GPU | غير مطلوب | 4 GB VRAM |
| Python | 3.11+ | 3.11+ |

**متطلبات خارجية إلزامية:**
- `ffmpeg` — لمعالجة الفيديو
- `imagemagick` — لمعالجة الصور
- مفاتيح
  `API`
  لنموذج ذكاء اصطناعي (
  `OpenAI`
  أو
  `DeepSeek`
  أو
  `Gemini`
  )
- مفتاح
  `Pexels API`
  أو
  `Pixabay API`
  للمقاطع المجانية

---

## أ) الإرشاد والتوجيه (Routing Mode)

استخدم هذا القسم عندما يسأل المستخدم عن الأداة أو يريد معرفة كيفية استخدامها.

### خطوات الإعداد الأولي

١. اشرح للمستخدم المتطلبات أعلاه
٢. ساعده في اختيار طريقة التثبيت المناسبة
٣. أرشده لإنشاء مفاتيح
   `API`
   المطلوبة
٤. اقترح موضوعات فيديو مناسبة

### مزودو الذكاء الاصطناعي المدعومون

```
OpenAI (GPT-4o)
DeepSeek (الأرخص)
Google Gemini (مجاني جزئياً)
Azure OpenAI
Moonshot (Kimi)
Ollama (محلي بدون إنترنت)
MiniMax
ModelScope
```

---

## ب) التشغيل الكامل (Execution Mode)

استخدم هذا القسم عندما يريد المستخدم تثبيت الأداة وتشغيلها مباشرة.

### الطريقة ١ — Docker (الأسهل والأسرع)

```bash
# تشغيل بدون GPU
docker run -it --rm \
  -p 8501:8501 \
  -v $(pwd)/storage:/MoneyPrinterTurbo/storage \
  ghcr.io/harry0703/moneyprinterturbo:latest
```

```bash
# تشغيل مع GPU (إن توفّر)
docker run -it --rm \
  --gpus all \
  -p 8501:8501 \
  -v $(pwd)/storage:/MoneyPrinterTurbo/storage \
  ghcr.io/harry0703/moneyprinterturbo:latest-gpu
```

الوصول بعد التشغيل:
`http://localhost:8501`

### الطريقة ٢ — تثبيت مباشر

```bash
# ١. استنساخ المستودع
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo

# ٢. تثبيت المتطلبات
pip install uv
uv sync --frozen

# ٣. تثبيت ffmpeg
## macOS:
brew install ffmpeg imagemagick
## Ubuntu/Debian:
sudo apt install ffmpeg imagemagick -y
## Windows: تحميل من ffmpeg.org ثم إضافته لـ PATH

# ٤. نسخ ملف الإعداد
cp config.example.toml config.toml

# ٥. تعديل config.toml بمفاتيح API (انظر القسم التالي)

# ٦. تشغيل الواجهة
uv run streamlit run webui/Main.py
```

### الطريقة ٣ — Google Colab (بدون تثبيت)

افتح مباشرة في المتصفح دون أي إعداد:
https://colab.research.google.com/github/harry0703/MoneyPrinterTurbo/blob/main/docs/MoneyPrinterTurbo.ipynb

---

## إعداد config.toml

```toml
[app]
video_source = "pexels"  # أو "pixabay" أو "coverr"

pexels_api_keys = ["YOUR_KEY_HERE"]
# احصل عليه من: https://www.pexels.com/api/

pixabay_api_keys = ["YOUR_KEY_HERE"]
# احصل عليه من: https://pixabay.com/api/docs/

[llm]
# اختر مزوداً واحداً:

# DeepSeek (الأرخص)
provider = "deepseek"
api_key = "sk-..."
model = "deepseek-chat"

# أو OpenAI
provider = "openai"
api_key = "sk-..."
model = "gpt-4o-mini"

# أو Gemini (مجاني)
provider = "gemini"
api_key = "AIza..."
model = "gemini-1.5-flash"
```

---

## استخدام الـ API مباشرة

```bash
# تشغيل الخادم
uv run python main.py
# الخادم يعمل على: http://localhost:8080
```

```bash
# توليد فيديو
curl -X POST "http://localhost:8080/api/v1/videos" \
  -H "Content-Type: application/json" \
  -d '{
    "video_subject": "فوائد ممارسة الرياضة يومياً",
    "video_language": "ar",
    "voice_name": "ar-IQ-RanaNeural",
    "video_clip_duration": 5,
    "video_count": 1,
    "video_aspect": "9:16",
    "subtitle_enabled": true,
    "bgm_type": "random",
    "bgm_volume": 0.15
  }'
```

```bash
# متابعة حالة التوليد
curl "http://localhost:8080/api/v1/tasks/{task_id}"
```

**حالات المهمة:**
- `1` = في الانتظار
- `2` = قيد التشغيل
- `3` = فشل
- `4` = اكتمل ✅

---

## أصوات عربية متاحة

| الصوت | النوع | اللهجة |
|------|------|--------|
| `ar-IQ-RanaNeural` | أنثى | العراق |
| `ar-IQ-BasselNeural` | ذكر | العراق |
| `ar-SA-ZariyahNeural` | أنثى | السعودية |
| `ar-SA-HamedNeural` | ذكر | السعودية |
| `ar-EG-SalmaNeural` | أنثى | مصر |
| `ar-EG-ShakirNeural` | ذكر | مصر |

---

## نشر تلقائي على منصات التواصل

تدعم الأداة النشر التلقائي على:
```
TikTok | Instagram | YouTube Shorts
```

يتطلب حساباً على
`Upload-Post.com`
وإضافة في
`config.toml`:

```toml
upload_post_platforms = ["tiktok", "instagram", "youtube_shorts"]
```

---

## حل المشاكل الشائعة

| المشكلة | السبب | الحل |
|--------|------|------|
| خطأ `ffmpeg not found` | غير مثبت في PATH | تثبيت ffmpeg وإعادة التشغيل |
| فيديو فارغ | مفتاح Pexels منتهي | تجديد المفتاح أو التبديل لـ Pixabay |
| صوت عربي مشوه | edge_tts timeout | زيادة `edge_tts_timeout = 60` في config |
| بطء شديد | لا GPU | تقليل `video_count` إلى 1 |

---

## المرجع التفصيلي

للمعلومات الكاملة عن معاملات الـ
`API`
وأمثلة
`Python`
انظر:
`references/api-details.md`
