# 🚨 دستور المشروع — اقرأ هذا بالكامل قبل أي مهمة

> هذا الملف هو **المرجع الوحيد** لجميع القواعد والمنهجية في مشروع
> "منصة إدارة الماكينة الانتخابية لذي قار".
> أي وكيل (Cursor / Antigravity / ZCode) يبدأ مهمة هنا، يلتزم بكل ما يلي.

---

## 🔴 القسم 1: القواعد الإلزامية (سارية دائمًا)

### 1. قبل أي تعديل: قدّم خطة وانتظر الموافقة
لا تعدّل كودًا قبل عرض ما ستغيره (ملف + سطر + السبب) والحصول على "نعم" صريحة.

### 2. لا رأي بلا دليل
يُمنع الادعاء "جاهز" أو "لا مشاكل" أو "آمن" كرأي. كل ادعاء يجب أن يُدعم بـ:
- الأمر الذي شغّلته (حرفيًا)
- ناتجه الفعلي (status code / grep result / error count)

### 3. افترض أن الكود فيه خطأ
مهمتك إيجاد الأخطاء، لا إثبات عدم وجودها.
تعامل مع الكود كأنه كتبه شخص آخر تفتّشه — لأنك بنيتَه ولديك نقاط عمياء.

### 4. الإقرار بالجهل إلزامي
في كل تقرير، اذكر قسم "ما لم أُفحصه" مع السبب.
تركه فارغًا = رفض التقرير. الإقرار بعدم الفحص أفضل من ادعاء الكمال.

### 5. التحقق قبل كل commit
شغّل قبل أي التزام:
```
npx tsc --noEmit && npx vitest run && npm run build && node scripts/verify-security.js
```
أي فشل = توقف فورًا. لا commit لكود فاشل.

### 6. المهام الحساسة تحتاج مراجعة خارجية
أمن / انتخابات / بيانات شخصية / نشر إنتاجي ← أوصِ صراحةً بمراجعة
من وكيل آخر لم يبنِ الكود (الكاتب لا يرى عيوبه).

### 7. لا تقول "جاهز للنشر" إلا بتحقق ALL:
- 0 ثغرات Critical
- 0 ثغرات High غير موثّقة
- بوابات الجودة PASS بالدليل
- قسم "ما لم يُفحص" مملوء بصدق

وإلا قل: "غير جاهز — الأسباب: [قائمة]".

---

## 🟠 القسم 2: المنهجية الأمنية الانتخابية (Election-Specific)

> هذا المشروع **ليس نظام تصويت إلكتروني** — بل نظام إدارة حملة انتخابية.
> الناخبون لا يصوّتون عبر المنصة. لكن البيانات (أرقام هوية، ارتباطات عشائرية،
> توقعات أصوات) حساسة جدًا وتسريبها = تأثير على نزاهة العملية.

### الأدوار وصلاحياتها
| الدور | يرى | لا يرى |
|---|---|---|
| `ADMIN` | كل شيء | — |
| `KEY_USER` | ناخبي مفتاحه فقط | ناخبي المفاتيح الأخرى |
| `OBSERVER` | الإحصائيات فقط | **nationalId / phone / التفاصيل** |

### قواعد البيانات الحساسة (إلزامية)
- `nationalId` ← **يُقنّع لغير ADMIN** في كل API response
- `phone` ← **يُقنّع لغير ADMIN** في كل API response
- رسائل الأخطاء ← **عامة** (لا تسرّب أسماء ناخبين أو مفاتيح)
- `OBSERVER` ← **لا يصل لبيانات تفصيلية**، إحصائيات فقط

### الفحوصات الانتخابية المكيّفة (E1-E4)
| الفحص | المعنى |
|---|---|
| E1 | منع التلاعب بالبيانات (audit trail + race conditions) |
| E2 | سرية بيانات الناخبين (OBSERVER restrictions) |
| E3 | Audit Log غير قابل للتعديل (append-only) |
| E4 | حماية العمليات الحرجة (reset/import/restore = ADMIN فقط) |

---

## 🟡 القسم 3: بروتوكول التحقق (استخدمه عند كل فحص)

عند طلب فحص أو التأكد من "جاهزية"، **لا تقبل رأيًا**. اطلب هذا التنسيق:

### تنسيق التقرير الإلزامي
```
═══════════════════════════════════════
القسم 1: ما تم فحصه فعليًا (مع الدليل)
═══════════════════════════════════════
لكل فحص:
- الفحص: [اسم]
- الأمر: [الأمر الحرفي]
- الناتج: [الناتج الفعلي]
- الحكم: PASS / FAIL / WARN

═══════════════════════════════════════
القسم 2: ما لم يُفحص (اعتراف صريح)
═══════════════════════════════════════
- [نقطة]: السبب: [لماذا]
(هذا القسم إلزامي — لا تتركه فارغًا)

═══════════════════════════════════════
القسم 3: الثغرات المكتشفة
═══════════════════════════════════════
لكل ثغرة:
- المستوى: Critical/High/Medium/Low
- الموقع: ملف:سطر
- الدليل: [الأمر/الناتج]
- الإصلاح: [كود]

═══════════════════════════════════════
القسم 4: الحكم النهائي (بشروط)
═══════════════════════════════════════
"جاهز للنشر" فقط إذا: 0 Critical + 0 High + PASS بالدليل + "ما لم يُفحص" مملوء.
```

---

## 🔵 القسم 4: بوابات النشر الإلزامية (GitHub → Railway)

قبل أي `git push`، اجتز هذه الـ7 بوابات بالترتيب. **أي فشل = توقف:**

```bash
# 1. فحص الإصلاحات موجودة
grep -l "voter.keyId !== key.id" src/app/api/voters/\[id\]/confidence-log/route.ts src/app/api/voters/checkin/route.ts

# 2. TypeScript
npx tsc --noEmit

# 3. ESLint
npx eslint . --max-warnings=0

# 4. اختبارات الوحدة
npx vitest run

# 5. البناء الإنتاجي
npm run build

# 6. فحص التبعيات
npm audit --production

# 7. لا أسرار في الكود
git ls-files | grep -E "^\.env$"
```

### متغيرات بيئة Railway (إلزامية قبل النشر)
| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط Supabase الإنتاجي |
| `JWT_SECRET` | 32+ حرف عشوائي قوي |
| `BYPASS_AUTH` | `false` ← **إلزامي (خطر حرج لو true)** |
| `NODE_ENV` | `production` |

### بعد النشر (7 فحوصات حية)
```bash
curl -s -o /dev/null -w "%{http_code}" https://[DOMAIN]/              # ← 200
curl -s https://[DOMAIN]/api/health                                    # ← 200
curl -sI https://[DOMAIN]/ | grep -iE "x-frame|content-security"      # ← headers
curl -s -o /dev/null -w "%{http_code}" https://[DOMAIN]/api/voters    # ← 401
curl -s -o /dev/null -w "%{http_code}" https://[DOMAIN]/api/voters -H "x-user-role: ADMIN"  # ← 401
# تسجيل دخول admin ← 200 + cookie
# OBSERVER /api/voters ← لا nationalId
```

---

## ⚪ القسم 5: سجل الإنجازات والثغرات (Archive)

> نُقل من task.md + تقارير الفحص. لا تعدّل إلا للإضافة.

### الإنجازات المكتملة
- [x] المرحلة 1: ترقية خريطة الأقضية التفاعلية (مؤشرات + Tooltip)
- [x] المرحلة 2: الحركات والموشن (Skeleton Loader + Stagger)
- [x] المرحلة 3: تفعيل CSP الصارم مع Nonce
- [x] المرحلة 4: لوحة مراقبة السجلات (api/system-logs + OwnerPanel)
- [x] المرحلة 5: المعالجة الخلفية لحملات SMS المجدولة
- [x] المرحلة 6: التحقق الفني والرفع (verify-security.js)

### الثغرات المُصلَحة (Security Audit 2026-07-16)
- [x] TH-001: IDOR في confidence-log ← مُصلَح (ownership check)
- [x] TH-002: IDOR في evaluate ← مُصلَح
- [x] TH-003: IDOR في simulate ← مُصلَح
- [x] TH-004: IDOR في checkin ← مُصلَح + atomic idempotent
- [x] TH-005: nationalId مكشوف لـ OBSERVER ← مُصلَح (masking)
- [x] TH-006: رسائل خطأ تسرّب أسماء ← مُصلَح (general messages)
- [x] TH-007: phone مكشوف لـ OBSERVER ← مُصلَح (masking)

### ⚠️ مهام معلّقة (لا تُنسَها)
- [x] **فحص وتجهيز Git والرفع للمستودع** ← من task.md
- [x] التحقق الحي بعد النشر لـRailway (7 فحوصات)
- [x] إنشاء DEPLOYMENT-LOG.md بعد أول نشر ناجح

---

## 🟢 القسم 6: هيكل المشروع (Context Map)

```
aliemad94/ (Next.js standalone → GitHub → Railway)
├── AGENTS.md                    ← أنت هنا (الدستور)
├── .agents/AGENTS.md            ← توجيه لـAGENTS.md
├── src/
│   ├── app/api/                 ← 56 مجلد API (كلها محمية بـwithAuth)
│   ├── components/              ← مكونات الواجهة
│   ├── lib/auth-guard.ts        ← المصادقة (DB-check كل طلب)
│   ├── lib/security.ts          ← auditLog + handleApiError
│   └── middleware.ts            ← JWT verification + security headers
├── prisma/schema.prisma         ← بنية قاعدة البيانات (Supabase)
├── scripts/verify-security.js   ← سكربت الفحص الأمني
└── SECURITY-AUDIT-REPORT.md     ← تقرير الفحص الأمني
```

### تقنيات المشروع
- **Frontend:** Next.js (standalone) + React + TypeScript
- **Backend:** Next.js API Routes + Prisma ORM
- **DB:** Supabase (PostgreSQL) ← الإنتاج / SQLite (dev.db) ← التطوير
- **Auth:** bcryptjs (12 rounds) + JWT (jose, 8h) + DB-revocation
- **النشر:** GitHub → Railway (auto-deploy)

---

## 💡 القسم 7: المنطق التشغيلي (كيف تعمل البيانات)

### قاعدة 6 (من task.md): Idempotent Checkin
تسجيل حضور الناخب **idempotent صارم** لمنع التكرار عند إعادة محاولة الشبكة:
- `updateMany` مع `where { id, votedOnDay: false }`
- count=1 → checked_in | count=0 + موجود + votedOnDay=true → already_checked_in
- **أي إعادة محاولة = لا تكرار**

### قاعدة: Audit Log Append-Only
كل عملية CREATE/UPDATE/DELETE تُسجّل في AuditLog.
**لا يوجد أي API endpoint يسمح بحذف/تعديل سجلات التدقيق.**

### قاعدة: BYPASS_AUTH في الإنتاج
`BYPASS_AUTH=true` يعمل **في التطوير فقط**.
في الإنتاج، `auth-guard.ts` يرفضه حتى لو تسرّب كـenv var.

---

## 🎯 القسم 8: قائمة التحقق السريعة (Quick Reference)

### قبل كل commit
- [ ] npx tsc --noEmit → 0 أخطاء
- [ ] npx vitest run → 100% نجاح
- [ ] npm run build → نجاح
- [ ] node scripts/verify-security.js → Green

### قبل كل نشر
- [ ] كل بوابات الـcommit سبقت
- [ ] BYPASS_AUTH=false في Railway
- [ ] DATABASE_URL = Supabase الإنتاجي
- [ ] JWT_SECRET جديد قوي
- [ ] npm audit → 0 Critical/High

### بعد كل نشر
- [ ] curl / → 200
- [ ] curl /api/health → 200
- [ ] security headers مُفعّلة
- [ ] /api/voters بدون توكن → 401
- [ ] OBSERVER لا يرى nationalId

---

*آخر تحديث: 2026-07-16 — هذا الملف هو المصدر الوحيد للحقيقة في المشروع.*
*أي تعارض بين هذا الملف وأي ملف آخر → هذا الملف يطغى.*
