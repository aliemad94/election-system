# 🏗️ دليل بناء الوكلاء والمهارات المتقدمة
## Agent & Skill Architecture Reference Guide

> **مصدر الإلهام:** تم استخلاص هذه الأنماط من تحليل معمارية أنظمة وكلاء الذكاء الاصطناعي المتقدمة.
> **الغرض:** مرجع داخلي لبناء مهارات ووكلاء أفضل في نظام إدارة الانتخابات.
> **الفلسفة:** نتعلم من التصميم، لا ندّعي الهوية.

---

## 1. معمارية المهارات (Skill Architecture)

### 1.1 الهيكل القياسي للمهارة

كل مهارة يجب أن تحتوي على بنية موحدة:

```
skills/
└── <skill-name>/
    ├── SKILL.md          # [مطلوب] التعليمات الرئيسية + YAML frontmatter
    ├── scripts/          # أدوات مساعدة وأتمتة
    ├── examples/         # نماذج مرجعية
    ├── resources/        # ملفات وقوالب إضافية
    └── references/       # وثائق تكميلية
```

### 1.2 بنية ملف SKILL.md

```yaml
---
name: "اسم المهارة"
description: "وصف مختصر يُستخدم للمطابقة التلقائية"
---

# تعليمات المهارة (Markdown)
- الحد الأقصى: 500 سطر
- استخدم references/ لأي محتوى إضافي
```

### 1.3 قواعد الاكتشاف والتفعيل

| القاعدة | التفصيل |
|---------|---------|
| **الاكتشاف التلقائي** | المهارات في المسارات القياسية تُحمّل تلقائياً |
| **التسجيل اليدوي** | المهارات في مواقع غير قياسية تحتاج `skills.json` |
| **القراءة الإلزامية** | يجب قراءة SKILL.md **قبل** أي تنفيذ |
| **التطابق** | يتم عبر `name` و `description` في الـ YAML فقط |

### 1.4 نمط skills.json للتسجيل

```json
{
  "entries": [
    { "path": "path/to/custom/skills" }
  ],
  "inherits": [
    { "path": "path/to/shared/skills.json" }
  ],
  "exclude": ["some_skill_to_ignore"]
}
```

> **📌 نقطة مهمة:** عند تعديل مهارات مشتركة، احصل دائماً على تأكيد صريح من المستخدم.

---

## 2. أنماط التوجيه الذكي (Intelligent Routing Patterns)

### 2.1 نمط قائمة التقييم المتسلسلة (Cascading Evaluation Checklist)

هذا النمط يضمن اختيار الأداة الأنسب عبر مراحل متدرجة:

```
الطلب الوارد
    │
    ▼
[الخطوة 0] هل يحتاج معالجة خاصة أصلاً؟
    │ لا → استجابة مباشرة
    │ نعم ▼
[الخطوة 1] هل يوجد أداة متخصصة متصلة؟
    │ نعم → استخدمها (أولوية الأدوات المتخصصة)
    │ لا ▼
[الخطوة 2] هل المطلوب ملف/تقرير؟
    │ نعم → أدوات الملفات
    │ لا ▼
[الخطوة 3] المعالجة الافتراضية
```

### 2.2 تطبيقه في مشروعنا

```typescript
// مثال: توجيه طلبات التحليل الانتخابي
function routeAnalysisRequest(request: AnalysisRequest) {
  // الخطوة 0: هل يحتاج تحليل فعلاً؟
  if (request.isSimpleQuery) return directAnswer(request);
  
  // الخطوة 1: هل يوجد محرك متخصص؟
  if (request.type === 'indicators') return indicatorsEngine.analyze(request);
  if (request.type === 'earlyWarning') return earlyWarningEngine.evaluate(request);
  
  // الخطوة 2: هل المطلوب تقرير؟
  if (request.needsExport) return reportGenerator.create(request);
  
  // الخطوة 3: تحليل عام
  return generalAnalysis.process(request);
}
```

---

## 3. معايير جودة الاستجابة (Response Quality Standards)

### 3.1 مبادئ التنسيق

| المبدأ | التطبيق |
|--------|---------|
| **الحد الأدنى من التنسيق** | استخدم القوائم فقط عند الضرورة الحقيقية |
| **النثر أولاً** | الاستجابات العادية بالنثر، ليس النقاط |
| **التناسب** | حجم الاستجابة يتناسب مع تعقيد السؤال |
| **السياق يحكم** | لا تفرض نمطاً واحداً على كل الحالات |

### 3.2 معيار "لا للحشو" (No Placeholders Rule)

```
❌ خطأ: استخدام بيانات وهمية أو مؤقتة في الواجهات
✅ صحيح: ربط كل عنصر UI بمصدر بيانات حقيقي

// تطبيقنا في AGENTS.md:
// "تجنب استخدام المتغيرات التبسيطية أو الحشوات المؤقتة (Placeholders)"
```

### 3.3 معيار الدقة المحاسبية

```typescript
// النمط الخاطئ: أرقام ثابتة في الواجهة
const participationRate = 85; // ❌ رقم وهمي

// النمط الصحيح: حساب مباشر من المحرك
const participationRate = indicatorsEngine.calculate(
  areaMetrics.totalVoters,
  areaMetrics.registeredVoters
); // ✅ مرتبط بمحرك الحسابات
```

---

## 4. أنماط إدارة الحالة (State Management Patterns)

### 4.1 نمط "لا ذاكرة بين الجلسات" (Stateless Between Sessions)

```
المبدأ: كل طلب يحمل حالته الكاملة
├── لا تعتمد على ذاكرة ضمنية
├── أرسل السياق الكامل مع كل طلب
└── استخدم قاعدة البيانات كمصدر وحيد للحقيقة
```

### 4.2 تطبيقه في إدارة الانتخابات

```typescript
// كل طلب API يحمل سياقه الكامل
export async function processElectionRequest(req: Request) {
  // 1. استخرج السياق من قاعدة البيانات (لا تعتمد على الذاكرة)
  const election = await prisma.election.findUnique({
    where: { id: req.electionId },
    include: { areas: true, candidates: true }
  });
  
  // 2. احسب المؤشرات من البيانات الحية
  const metrics = calculateMetrics(election);
  
  // 3. أعد النتيجة مع السياق الكامل
  return { election, metrics, timestamp: new Date() };
}
```

### 4.3 نمط المعاملات الذرية (Atomic Transactions)

```typescript
// نمط الاستعادة الآمنة من النسخ الاحتياطية
await prisma.$transaction(async (tx) => {
  // 1. احذف البيانات القديمة بالترتيب الصحيح (العلاقات أولاً)
  await tx.vote.deleteMany({});
  await tx.candidate.deleteMany({});
  await tx.area.deleteMany({});
  
  // 2. أعد إدخال البيانات الجديدة
  await tx.area.createMany({ data: backupData.areas });
  await tx.candidate.createMany({ data: backupData.candidates });
  await tx.vote.createMany({ data: backupData.votes });
  
  // 3. إما تنجح كلها أو تفشل كلها
});
```

---

## 5. أنماط السلامة والحماية (Safety & Protection Patterns)

### 5.1 نمط الحراسة المتعددة الطبقات (Multi-Layer Guard)

```
الطبقة 1: التحقق من المدخلات (Input Validation)
    │
الطبقة 2: التحقق من الصلاحيات (Authorization)
    │
الطبقة 3: التحقق من منطق العمل (Business Logic Validation)
    │
الطبقة 4: التنفيذ مع حماية المعاملات (Transactional Execution)
    │
الطبقة 5: التحقق من المخرجات (Output Verification)
```

### 5.2 تطبيقه في مشروعنا

```typescript
// مثال: حماية عملية حذف نتائج انتخابية
async function deleteElectionResults(userId: string, electionId: string) {
  // الطبقة 1: التحقق من المدخلات
  if (!electionId) throw new ValidationError('معرف الانتخابات مطلوب');
  
  // الطبقة 2: التحقق من الصلاحيات
  const user = await getUser(userId);
  if (user.role !== 'OWNER') throw new AuthError('غير مصرح');
  
  // الطبقة 3: التحقق من منطق العمل
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (election.status === 'FINALIZED') {
    throw new BusinessError('لا يمكن حذف نتائج انتخابات مؤكدة');
  }
  
  // الطبقة 4: التنفيذ الذري
  await prisma.$transaction(async (tx) => {
    await tx.vote.deleteMany({ where: { electionId } });
    await tx.auditLog.create({
      data: { action: 'DELETE_RESULTS', userId, electionId, timestamp: new Date() }
    });
  });
  
  // الطبقة 5: التحقق من النتيجة
  const remainingVotes = await prisma.vote.count({ where: { electionId } });
  if (remainingVotes > 0) throw new IntegrityError('فشل الحذف الكامل');
}
```

### 5.3 نمط التحذير قبل التدمير (Destructive Action Warning)

```
⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
├── عرض رسالة تحذيرية واضحة
├── طلب تأكيد صريح (نص أو زر مزدوج)
├── فترة انتظار قبل التنفيذ (3-5 ثوانٍ)
└── تسجيل العملية في سجل التدقيق
```

---

## 6. أنماط إدارة الأخطاء (Error Handling Patterns)

### 6.1 نمط "التغليف الشامل" (Comprehensive Wrapping)

```typescript
// كل استدعاء خارجي يجب تغليفه
try {
  const data = await externalService.fetch();
  const validated = validateSchema(data);
  return processData(validated);
} catch (error) {
  if (error instanceof NetworkError) {
    return fallbackData(); // بيانات احتياطية
  }
  if (error instanceof ValidationError) {
    logger.warn('بيانات غير متوافقة', { error });
    return sanitizeAndProcess(data); // معالجة جزئية
  }
  logger.error('خطأ غير متوقع', { error });
  throw error; // أعد رمي الأخطاء غير المعروفة
}
```

### 6.2 نمط التدهور الأنيق (Graceful Degradation)

```
السيناريو الطبيعي → كامل الوظائف
    │ فشل ▼
المستوى 1 → بيانات مخزنة مؤقتاً (Cache)
    │ فشل ▼
المستوى 2 → بيانات النسخة الاحتياطية الأخيرة
    │ فشل ▼
المستوى 3 → رسالة واضحة للمستخدم + سجل الخطأ
```

---

## 7. أنماط التوثيق (Documentation Patterns)

### 7.1 بنية الوثيقة المثالية

```markdown
# [اسم الميزة/المكون]

## الغرض
وصف مختصر لماذا يوجد هذا المكون.

## متى تستخدمه
- حالات الاستخدام الصحيحة (Trigger cases)

## متى لا تستخدمه  
- الحالات التي يُساء فيها استخدامه

## كيف يعمل
التفاصيل التقنية مع أمثلة كود.

## أمثلة
نماذج مرجعية واقعية.

## محاذير
ما يجب الانتباه إليه.
```

### 7.2 معيار "متى نستخدم / متى لا نستخدم"

كل أداة أو مكون يجب أن يوضح:
- **USE WHEN:** الحالات التي تستدعي استخدامه
- **DON'T USE WHEN:** الحالات التي يجب تجنبه فيها
- **TRIGGERS:** الكلمات أو الأنماط التي تفعّله تلقائياً

---

## 8. أنماط تصميم الأدوات (Tool Design Patterns)

### 8.1 نمط المتغيرات المحدودة (Constrained Parameters)

```typescript
// استخدم enum بدل string لتقليل الأخطاء
type DataExportFormat = 'json' | 'csv' | 'xlsx';
type AnalysisScope = 'area' | 'candidate' | 'overall';

interface AnalysisRequest {
  format: DataExportFormat;  // ليس string عام
  scope: AnalysisScope;      // ليس string عام
  electionId: string;
}
```

### 8.2 نمط الأداة ذاتية التوثيق (Self-Documenting Tool)

```typescript
/**
 * حساب معدل المشاركة الانتخابية لمنطقة معينة
 * 
 * @description يحسب نسبة المشاركة من إجمالي المسجلين
 * @trigger عند طلب "معدل المشاركة" أو "نسبة التصويت"
 * @returns رقم بين 0 و 100 يمثل النسبة المئوية
 * 
 * @example
 * calculateParticipation("area-123") // => 78.5
 */
function calculateParticipation(areaId: string): number {
  // التنفيذ
}
```

---

## 9. أنماط التفاعل مع المستخدم (User Interaction Patterns)

### 9.1 نمط التفضيلات السياقية (Contextual Preferences)

```
تطبيق التفضيلات فقط عندما:
├── ✅ مرتبطة مباشرة بالمهمة الحالية
├── ✅ تحسن جودة الاستجابة فعلاً
├── ✅ لن تكون مفاجئة أو محيرة
└── ❌ لا تطبق تفضيلات غير ذات صلة (حتى لو موجودة)
```

### 9.2 نمط الاستباقية المدروسة (Measured Proactivity)

```
بدل الانتظار حتى يسأل المستخدم:
├── اكتشف المشكلات المحتملة مبكراً
├── اقترح حلولاً بدون فرضها
├── وفر معلومات سياقية مفيدة
└── لكن لا تثقل على المستخدم بمعلومات لم يطلبها
```

---

## 10. قائمة فحص الجودة (Quality Checklist)

### قبل كل إصدار أو تعديل:

- [ ] **سلامة الكود:** هل تم الحفاظ على جميع الوظائف القائمة؟
- [ ] **الاختبارات:** هل نجحت `npx vitest run`؟
- [ ] **البناء:** هل نجح `npm run build`؟
- [ ] **التطابق:** هل أرقام الواجهة مرتبطة بمحركات الحسابات؟
- [ ] **لا حشوات:** هل كل بيانات الواجهة حقيقية (لا placeholders)؟
- [ ] **المعاملات الذرية:** هل العمليات الحساسة محمية بـ `$transaction`؟
- [ ] **التحذيرات:** هل الإجراءات التدميرية لها تأكيد مزدوج؟
- [ ] **التسجيل:** هل العمليات الحساسة مسجلة في سجل التدقيق؟
- [ ] **التدهور الأنيق:** هل يوجد سيناريو احتياطي لكل فشل محتمل؟
- [ ] **التوثيق:** هل تم تحديث الوثائق المتأثرة؟

---

## 11. مبادئ التصميم الأساسية (Core Design Principles)

### 11.1 مبدأ "اقرأ قبل أن تكتب" (Read Before Write)

> قراءة المهارة/التعليمات الإلزامية **قبل** أي تنفيذ.
> هذا غير قابل للتفاوض حتى لو كنت "تعرف" كيف تفعلها.

### 11.2 مبدأ "تناسب الجهد مع التعقيد" (Scale Effort to Complexity)

| تعقيد الطلب | مستوى الجهد |
|-------------|-------------|
| سؤال بسيط | إجابة مباشرة، أداة واحدة |
| مهمة متوسطة | 3-5 خطوات، بحث محدود |
| مهمة معقدة | 5-10 خطوات، بحث شامل |
| مشروع كبير | خطة مفصلة + مراجعة + تنفيذ مرحلي |

### 11.3 مبدأ "الأداة المتخصصة أولاً" (Specialized Tool First)

```
عند وجود أداة متخصصة → استخدمها (لا تخترع حلاً عاماً)
عند عدم وجودها → ابحث عن بديل مناسب
عند عدم وجود بديل → نفذ الحل العام مع توثيق السبب
```

### 11.4 مبدأ "لا تشرح الآلية" (Don't Narrate Routing)

```
❌ "بناءً على إرشاداتي، سأستخدم أداة X لأن..."
✅ "إليك نتائج التحليل:" (نفذ وأعطِ النتيجة مباشرة)
```

---

## 12. تطبيق عملي: بناء مهارة جديدة للمشروع

### مثال: مهارة "تحليل النتائج الانتخابية"

```
skills/
└── election-analysis/
    ├── SKILL.md
    ├── scripts/
    │   ├── calculate_metrics.ts
    │   └── generate_report.ts
    ├── examples/
    │   ├── sample_analysis.json
    │   └── sample_report.md
    └── references/
        └── indicators_reference.md
```

```yaml
# SKILL.md
---
name: "election-analysis"
description: "تحليل النتائج الانتخابية وحساب مؤشرات الأداء والإنذار المبكر"
---

# متى تستخدم هذه المهارة
- عند طلب تحليل نتائج انتخابية
- عند حساب مؤشرات DRS, EWLI, EFI, KRI
- عند توليد تقارير أداء المناطق

# متى لا تستخدمها
- للاستعلامات البسيطة عن بيانات خام
- لعمليات CRUD الأساسية على قاعدة البيانات

# كيف تعمل
1. اقرأ البيانات من محرك المؤشرات (indicators-engine)
2. طبق حسابات المحرك الأساسي
3. قارن مع عتبات الإنذار المبكر
4. أنتج التقرير بالتنسيق المطلوب
```

---

## 📚 مراجع داخلية

| المكون | الملف | الغرض |
|--------|-------|-------|
| محرك المؤشرات | `src/lib/indicators-engine.ts` | الحسابات الأساسية |
| نظام الإنذار المبكر | `src/app/api/early-warnings/route.ts` | تقييم المخاطر |
| النسخ الاحتياطي | `src/lib/backup.ts` | حماية البيانات |
| الجدولة | `src/lib/scheduler.ts` | الأتمتة الخلفية |
| لوحة المالك | `src/components/election/OwnerPanel.tsx` | واجهة الإدارة |
| قواعد المشروع | `.agents/AGENTS.md` | القواعد الملزمة |

---

> **آخر تحديث:** يونيو 2026
> **المُعِد:** مستخلص من تحليل أنماط تصميم أنظمة وكلاء الذكاء الاصطناعي المتقدمة
> **الترخيص:** مرجع داخلي للمشروع — الأنماط عامة، التطبيقات خاصة بنا
