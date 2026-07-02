# Auto-Editor — الخيارات المتقدمة

## نظام التسميات (Labels) — منذ v31.0.0

كل لحظة في الفيديو تحصل على رقم تسمية:

| التسمية | المعنى | السلوك الافتراضي |
|---------|--------|------------------|
| `0` | صامت | يُقص |
| `1` | نشط | يُبقى |
| `2` — `255` | مخصصة | تحددها أنت |

```bash
# تعريف تسمية إضافية وسلوكها
auto-editor video.mp4 --edit:2 audio:-12dB --when:2 speed:1.5

# عند تداخل التسميات، الرقم الأعلى يفوز
```

**قيم خاصة:**
- `--edit 1` — إبقاء كل شيء
- `--edit 0` — قص كل شيء

## المسارات المتعددة (Multi-track)

```bash
# شروط مختلفة لكل مسار صوتي
auto-editor multi-track.mov --edit "(or audio:stream=0 audio:threshold=10%,stream=1)"

# كل المسارات معاً (الافتراضي)
auto-editor video.mp4 --edit audio:threshold=0.04,stream=all
```

## تسمية الـ Timeline عند التصدير

```bash
# POSIX shells
auto-editor video.mp4 --export 'premiere:name="اسم المشروع"'

# PowerShell
auto-editor video.mp4 --export 'premiere:name=""اسم المشروع""'
```

## تقسيم بدون قص

```bash
# تقسيم المقاطع في timeline دون حذف أي شيء
auto-editor video.mp4 --when-silent nil --when-normal nil --export premiere
```

## ميزات الإصدارات الحديثة (v31.x)

- `duck` — خفض صوت الموسيقى تلقائياً عند وجود كلام
  (sidechain/autoduck)
- `pos` — تحريك وتكبير العناصر عبر
  keyframes
  مع easing
- `aberration` — تأثير انحراف لوني للمظهر الـ glitch
- `whisper` — إعادة استخدام اللغة المكتشفة عبر المقاطع
- ffmpeg 8.1.2 مدمج — لا حاجة لتثبيت خارجي

## عرض كل الخيارات

```bash
auto-editor --help
```

التوثيق الكامل: https://auto-editor.com/ref/options
