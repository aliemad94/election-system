---
name: github-to-skill
description: >
  Converts any GitHub repository into a reusable Claude skill (.skill file) automatically.
  ALWAYS use this skill when the user provides a GitHub URL and wants to save it as a skill,
  says "حوّل هذا المستودع إلى مهارة", "اصنع مهارة من هذا الرابط", "أضف هذه الأداة كمهارة",
  "convert this repo to a skill", "make a skill from this GitHub link",
  or any variation asking to turn a GitHub project into something Claude can remember and invoke.
  Also triggers on: "اجعل كلود يتعلم هذه الأداة", "احفظ هذه الأداة", "علّم كلود كيف يستخدم X من GitHub".
---

# GitHub → Skill Converter

تحويل أي مستودع GitHub إلى مهارة قابلة للحفظ والاستدعاء تلقائياً.

## الخطوات الإلزامية

### الخطوة ١ — جلب معلومات المستودع

```bash
# استخراج owner/repo من الرابط
# مثال: https://github.com/harry0703/MoneyPrinterTurbo → harry0703/MoneyPrinterTurbo

curl -s "https://api.github.com/repos/{owner}/{repo}" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('Name:', d.get('name'))
print('Description:', d.get('description'))
print('Language:', d.get('language'))
print('Stars:', d.get('stargazers_count'))
print('Topics:', d.get('topics'))
"
```

### الخطوة ٢ — جلب الملفات الأساسية

```bash
# README باللغة الإنجليزية أولاً (أشمل)
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/README-en.md"  # إن وُجد

# ملفات التثبيت
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/requirements.txt"
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/pyproject.toml"
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/package.json"

# ملف الإعداد إن وُجد
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/config.example.toml"
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/.env.example"
```

### الخطوة ٣ — تحليل المستودع

بعد جلب الملفات، حدّد:

| البُعد | الأسئلة |
|-------|---------|
| **الغرض** | ماذا تفعل الأداة بجملة واحدة؟ |
| **التثبيت** | pip / npm / git clone / docker؟ |
| **التشغيل** | CLI / API / Web UI؟ |
| **المتطلبات** | API keys؟ متغيرات بيئة؟ |
| **المخرجات** | ملفات / JSON / واجهة؟ |
| **القيود** | ما الذي لا تستطيع فعله؟ |

### الخطوة ٤ — توليد SKILL.md

استخدم القالب التالي وامله بناءً على تحليل المستودع:

```markdown
---
name: {repo-name}
description: >
  {وصف دقيق يتضمن: ما تفعله الأداة، متى تُستدعى هذه المهارة،
  الكلمات المفتاحية العربية والإنجليزية التي تُفعّلها.
  مثال: "اصنع فيديو", "generate video", "استخدم MoneyPrinterTurbo"}
---

# {اسم الأداة}

{وصف موجز بالعربية}

**المستودع الأصلي:**
https://github.com/{owner}/{repo}

## التثبيت السريع

```bash
{أوامر التثبيت المستخرجة من README}
```

## المتطلبات الأساسية

{قائمة بمتغيرات البيئة أو مفاتيح API المطلوبة}

## طريقة الاستخدام

### أ) تشغيل مباشر (CLI)
```bash
{الأوامر الأساسية}
```

### ب) استخدام الـ API (إن وُجد)
```bash
{أمثلة curl أو Python}
```

### ج) واجهة الويب (إن وُجدت)
{كيفية الوصول إليها}

## أنماط الاستخدام الشائعة

{أمثلة عملية من README}

## القيود والملاحظات

{ما لا تستطيع الأداة فعله، متطلبات النظام، إلخ}
```

### الخطوة ٥ — إنشاء الملفات وتعبئة المهارة

```bash
# إنشاء مجلد المهارة
mkdir -p /home/claude/skills/{repo-name}

# كتابة SKILL.md (يفعل Claude هذا عبر create_file)

# نسخ سكريبت التعبئة
cp -r /mnt/skills/examples/skill-creator/scripts /tmp/skill-scripts/

# تعبئة المهارة
cd /tmp
python3 /tmp/skill-scripts/package_skill.py /home/claude/skills/{repo-name} /mnt/user-data/outputs/
```

## قواعد جودة SKILL.md

1. **الوصف (description):** يجب أن يكون "دافعاً" — يشمل كلمات مفتاحية عربية وإنجليزية لضمان التفعيل التلقائي
2. **التثبيت:** اختبر صحة الأوامر قدر الإمكان
3. **الأمثلة:** خذها مباشرة من README الأصلي، لا تخترعها
4. **القيود:** اذكر متطلبات النظام الحقيقية (RAM، GPU، OS)
5. **اللغة:** اكتب الشرح بالعربية، الأوامر بالإنجليزية

## نوعا المهارات الناتجة

**نوع أ — مهارة التوجيه (Routing Skill):**
تُخبر Claude بكيفية استخدام الأداة ومتى يقترحها.
مناسبة لـ: الأدوات المعقدة التي تحتاج تثبيتاً مسبقاً.

**نوع ب — مهارة التشغيل الكامل (Execution Skill):**
تُثبّت الأداة وتشغّلها مباشرة داخل الجلسة عبر bash_tool.
مناسبة لـ: أدوات Python/Node بسيطة التثبيت.

**الافتراضي:** أنشئ كلا النوعين معاً في ملف واحد (sections منفصلة).
