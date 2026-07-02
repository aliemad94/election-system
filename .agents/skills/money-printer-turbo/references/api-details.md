# MoneyPrinterTurbo — مرجع API التفصيلي

## الحقول الكاملة لـ POST /api/v1/videos

```json
{
  "video_subject": "موضوع الفيديو",
  "video_script": "نص مخصص (اختياري)",
  "video_terms": "كلمات مفتاحية للبحث (اختياري)",
  "video_aspect": "9:16 | 16:9 | 1:1",
  "video_concat_mode": "random | sequential",
  "video_clip_duration": 5,
  "video_count": 1,
  "video_language": "ar | en | zh | fr",
  "voice_name": "ar-IQ-RanaNeural",
  "voice_volume": 1.0,
  "voice_rate": 1.0,
  "bgm_type": "random | none | file",
  "bgm_volume": 0.2,
  "subtitle_enabled": true,
  "subtitle_position": "bottom | top | center",
  "font_size": 60,
  "text_fore_color": "#FFFFFF",
  "stroke_color": "#000000",
  "stroke_width": 1.5,
  "n_threads": 2,
  "paragraph_number": 1
}
```

## مثال Python كامل

```python
import requests
import time

BASE_URL = "http://localhost:8080"

def generate_video(subject: str, language: str = "ar"):
    response = requests.post(f"{BASE_URL}/api/v1/videos", json={
        "video_subject": subject,
        "video_language": language,
        "voice_name": "ar-IQ-RanaNeural",
        "video_aspect": "9:16",
        "video_clip_duration": 5,
        "subtitle_enabled": True,
        "bgm_type": "random",
        "bgm_volume": 0.15
    })
    task_id = response.json()["task_id"]

    while True:
        status = requests.get(f"{BASE_URL}/api/v1/tasks/{task_id}").json()
        print(f"التقدم: {status.get('progress', 0)}%")
        if status["state"] == 4:
            return status["videos"][0]
        elif status["state"] == 3:
            raise Exception("فشل التوليد")
        time.sleep(5)

video = generate_video("فوائد التأمل اليومي")
print(f"الفيديو جاهز: {video}")
```

## نقاط API إضافية

```
GET /api/v1/voices       — قائمة الأصوات المتاحة
GET /api/v1/musics       — قائمة الموسيقى المتاحة
GET /api/v1/tasks/{id}   — حالة مهمة
DELETE /api/v1/tasks/{id} — حذف مهمة
```

## المكتبات المستخدمة داخلياً

```
moviepy==2.2.1          — تحرير الفيديو
streamlit==1.58.0       — واجهة الويب
edge_tts==7.2.7         — تحويل النص لصوت
fastapi==0.136.3        — خادم الـ API
faster-whisper==1.1.0   — تحويل الصوت لنص
litellm==1.86.2         — توحيد واجهات نماذج الذكاء الاصطناعي
```
