# 🧪 دليل الفحوصات الشاملة — منظومة الماكينة الانتخابية

> **الغرض:** مرجع موحّد للفريق لاختبار المشروع محلياً وقبل النشر. يغطي 6 أنواع من الفحوصات،
> كل واحد قابل للتشغيل المستقل أو عبر سكربت آلي واحد.

---

## ⚡ التشغيل السريع (الطريقة المختصرة)

طُعّم المشروع بسكربت آلي ينفّذ **كل الفحوصات الستة** بضغطة واحدة:

```bash
# 1) شغّل الخادم في طرفية منفصلة
npm run dev

# 2) في طرفية ثانية، شغّل الفحوصات الكاملة (نظامية + حية):
node scripts/run-tests.js --live

# أو الفحص النظامي فقط (بدون خادم):
node scripts/run-tests.js
```

**أكواد الخروج:**
- `0` = كل الفحوصات الحرجة نجحت
- `1` = فشل فحص حرج واحد على الأقل

السكربت يطبع تقريراً ملوّناً في الطرفية مع الاكتشافات مرتّبة حسب الخطورة (حرج/عالٍ/متوسط/منخفض).

---

## 📋 الأنواع الستة للفحوصات

| # | النوع | يكتشف | يحتاج خادم؟ |
|---|------|-------|-------------|
| 1 | **فحوصات نظامية** (static) | أخطاء أنواع، جودة الكود، فشل الاختبارات، ثغرات التبعيات | ❌ |
| 2 | **اختبار اختراق أمني** (pentest) | ثغرات المصادقة/الصلاحيات/التحقق/التسريب | ✅ |
| 3 | **مصفوفة الـ API** | المسارات المعطّلة، استجابات غير صحيحة | ✅ |
| 4 | **قياس الأداء** | زمن الاستجابة، اختناقات الأداء | ✅ |
| 5 | **تحقق المحركات** | القيم الوهمية (placeholders) في المؤشرات | ✅ |
| 6 | **سلامة البيانات** | تكامل مرجعي، سجلات يتيمة، اكتمال الـ seed | جزئي |

---

## 🔧 التجهيز الأولي (مرة واحدة)

### المتطلبات
- Node.js 20+
- `npm install` مُنفّذة (node_modules موجودة)
- قاعدة بيانات SQLite محلية مزروعة

### إعداد قاعدة البيانات المحلية (آمن — لا يلمس الإنتاج)

> **مهم:** ملف `.env` الأصلي يحتوي على أسرار Supabase الإنتاجية. **لا تلمسه**.
> بدلاً من ذلك، أنشئ `.env.local` (متجاهل من Git) للتطوير المحلي.

```bash
# 1) أنشئ .env.local بقيم محلية آمنة (مثال)
cat > .env.local << 'EOF'
DATABASE_URL="file:./db/local.db"
JWT_SECRET="dev-only-local-jwt-secret-DO-NOT-USE-IN-PRODUCTION-8f3k2j9h"
ADMIN_PASSWORD="LocalAdminDev2026!"
USER_PASSWORD="LocalUserDev2026!"
NODE_ENV="development"
BYPASS_AUTH="false"
EOF

# 2) توليد Prisma client + إنشاء الجداول + الزرع
DATABASE_URL="file:./db/local.db" npx prisma generate --schema=prisma/schema.sqlite.prisma
DATABASE_URL="file:./db/local.db" npx prisma db push --schema=prisma/schema.sqlite.prisma --skip-generate
DATABASE_URL="file:./db/local.db" ADMIN_PASSWORD="LocalAdminDev2026!" USER_PASSWORD="LocalUserDev2026!" \
  npx prisma db seed --schema=prisma/schema.sqlite.prisma
```

### بيانات الدخول المحلية (بعد الـ seed)

| الوضع | كلمة المرور | الدور |
|------|-------------|------|
| مالك | `LocalAdminDev2026!` | ADMIN |
| مستخدم | `LocalUserDev2026!` | OBSERVER |

---

## 1️⃣ الفحوصات النظامية (Static Analysis)

فحوصات لا تحتاج خادماً — تُجرى على الكود المصدري مباشرة. **يجب أن تمر قبل كل commit.**

### 1.1 فحص الأنواع (TypeScript)
```bash
npx tsc --noEmit
```
- **المتوقع:** صفر أخطاء (EXIT 0)
- **متى يفشل:** عند وجود `as any` مخفي، أنواع غير متوافقة، خصائص مفقودة

### 1.2 فحص الجودة (ESLint)
```bash
npx eslint .
```
- **المتوقع:** نظيف أو تحذيرات بسيطة فقط
- **معروف حالياً:** ~66 خطأ `react-hooks/set-state-in-effect` في hooks شائعة من shadcn/ui — غير حرجة وظيفياً
- **للإصلاح التلقائي:** `npx eslint . --fix`

### 1.3 اختبارات الوحدة (Vitest)
```bash
npx vitest run          # تشغيل مرة واحدة
npx vitest              # وضع المراقبة (watch)
```
- **المتوقع:** كل الاختبارات تنجح
- **الموقع الحالي:** 60 اختبار عبر 4 ملفات (permissions, arabic-normalization, electoral-calculations, useUndoableDelete)
- **لإضافة اختبار جديد:** أنشئ `src/lib/__tests__/<name>.test.ts`

### 1.4 صحة مخطط قاعدة البيانات
```bash
DATABASE_URL="file:./db/local.db" npx prisma validate --schema=prisma/schema.sqlite.prisma
```
- **المتوقع:** `The schema ... is valid 🚀`

### 1.5 ثغرات التبعيات
```bash
npm audit               # عرض الثغرات
npm audit --json        # تنسيق قابل للمعالجة
npm audit fix           # إصلاح آمن (لا كسر)
npm audit fix --force   # ⚠️ قد يكسر التبعيات
```
- **معروف حالياً:** ~15 ثغرة (9 moderate, 6 high)، أبرزها:
  - `xlsx` (high — لا إصلاح متاح، بديل: `@e965/xlsx`)
  - `next-pwa`/`workbox` (transitive — مرشّح للحذف إن لم يُستخدم PWA فعلياً)

### 1.6 الحزم القديمة
```bash
npm outdated            # عرض الحزم القابلة للتحديث
```
- راجع قبل التحديث الكبير (مثل `@prisma/client` 6→7) لاحتمال كسر التوافق

---

## 2️⃣ اختبار الاختراق الأمني الحي (Pentest)

> ⚠️ **مطلوب خادم يعمل** (`npm run dev`)

### تجهيز جلسات المصادقة

```bash
# جلسة المالك (ADMIN) — تُحفظ في admin.txt
curl -s -X POST http://localhost:3000/api/access \
  -H "Content-Type: application/json" \
  -d '{"action":"owner-login","ownerPassword":"LocalAdminDev2026!"}' \
  -c admin.txt

# جلسة المستخدم (OBSERVER) — تُحفظ في user.txt
curl -s -X POST http://localhost:3000/api/access \
  -H "Content-Type: application/json" \
  -d '{"action":"login","password":"LocalUserDev2026!"}' \
  -c user.txt
```

### 2.1 الوصول غير المصرّح به

كل مسار محمي يجب أن يُرجع **401** بدون كوكي:
```bash
for route in "/api/voters" "/api/electoral-keys" "/api/dashboard" \
             "/api/me" "/api/cron/backup" "/api/comprehensive-indicators"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${route}")
  echo "$route → $code"
done
# المتوقع: 401 لكل مسار
```

### 2.2 تجاوز المصادقة

كل المحاولات التالية يجب أن تُرفض بـ **401**:
```bash
# كوكيز مزوّرة
for val in "" "fake-token" "x-user-role:ADMIN"; do
  curl -s -o /dev/null -w "cookie='$val' → %{http_code}\n" \
    "http://localhost:3000/api/voters" -H "Cookie: election_auth=${val}"
done

# حقن headers بدون كوكي (الحماية يجب ألا تثق بالـ headers)
curl -s -o /dev/null -w "header injection → %{http_code}\n" \
  "http://localhost:3000/api/voters" \
  -H "x-user-id: fake" -H "x-user-role: ADMIN" -H "x-user-name: hacker"

# JWT مزوّف بـ alg:none
TAMPERED="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJoYWNrZXIiLCJyb2xlIjoiQURNSU4ifQ."
curl -s -o /dev/null -w "alg:none JWT → %{http_code}\n" \
  "http://localhost:3000/api/voters" -H "Cookie: election_auth=${TAMPERED}"
```

### 2.3 فحص RBAC والعمليات التدميرية

```bash
# OBSERVER يحاول الإعادة التدميرية — يجب أن يُرفض (ADMIN فقط)
curl -s -o /dev/null -w "OBSERVER reset → %{http_code}\n" \
  -X POST "http://localhost:3000/api/reset/simulate-turnout?action=reset&confirm=CONFIRM_RESET_TURNOUT" \
  -b user.txt
# المتوقع: 403

# ADMIN بدون تأكيد — يجب أن يُرفض (التأكيد المزدوج مطلوب)
curl -s -o /dev/null -w "ADMIN no-confirm → %{http_code}\n" \
  -X POST "http://localhost:3000/api/reset/simulate-turnout?action=reset" \
  -b admin.txt
# المتوقع: 400

# الإعادة عبر GET — يجب أن تُرفض (GET-mutation محذوفة)
curl -s -o /dev/null -w "GET reset → %{http_code}\n" \
  "http://localhost:3000/api/reset/simulate-turnout?action=reset" -b admin.txt
# المتوقع: 405
```

### 2.4 Rate Limiting (مكافحة brute-force)
```bash
for i in 1 2 3 4 5 6 7; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/access \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"login\",\"password\":\"WRONG_${i}\"}")
  echo "attempt $i → $code"
done
# المتوقع: أول 5 → 401، ثم 429 (مقفل)
```

### 2.5 التحقق من المدخلات (Zod enums)
```bash
# gender غير صالح
curl -s -X POST http://localhost:3000/api/voters -b admin.txt \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","phone":"999","gender":"HACKED"}' -w "\n→ %{http_code}\n"
# المتوقع: 400 (z.enum يرفض)

# status غير صالح
curl -s -X POST http://localhost:3000/api/voters -b admin.txt \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","phone":"888","status":"HACKED"}' -w "\n→ %{http_code}\n"
# المتوقع: 400
```

### 2.6 Path Traversal
```bash
curl -s "http://localhost:3000/api/cron/backup?action=download&name=../../etc/passwd" \
  -b admin.txt -w "\n→ %{http_code}\n"
# المتوقع: 400 ("اسم الملف غير صالح")
```

### 2.7 معالجة الأخطاء ⚠️

```bash
# حقن SQL في البحث
curl -s "http://localhost:3000/api/voters?search=%27%20OR%201%3D1--" -b admin.txt -w "\n→ %{http_code}\n"
# ملاحظة: Prisma يُعامل القيم كـ parameters فلا SQLi حقيقي.
# على SQLite قد يُرجع 500 بسبب mode:"insensitive" — هذا خطأ بيئي يختفي في PostgreSQL الإنتاجي.
# ليست ثغرة أمنية.

# JSON تالف
curl -s -X POST http://localhost:3000/api/voters -b admin.txt \
  -H "Content-Type: application/json" -d '{invalid!!!' -w "\n→ %{http_code}\n"
# المتوقع: 400 نظيف. إن رجع 500 فهناك تحسين في معالجة الأخطاء.
```

---

## 3️⃣ مصفوفة الـ API

```bash
# اختبر كل مسار GET بجلسة المالك (المتوقع 200 لكلها ما عدا /api/search)
routes=(
  "/api/voters" "/api/electoral-keys" "/api/tribes" "/api/services"
  "/api/tasks" "/api/volunteers" "/api/competitors" "/api/early-warnings"
  "/api/alerts" "/api/analysis" "/api/indicators" "/api/composite-indicators"
  "/api/dynamic-indicators" "/api/comprehensive-indicators"
  "/api/election-results" "/api/election-results/historical"
  "/api/commission" "/api/sms" "/api/sms-campaigns" "/api/stats"
  "/api/campaign" "/api/dashboard" "/api/me"
)
for r in "${routes[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${r}" -b admin.txt)
  echo "$r → $code"
done
# المتوقع: 200 لكل المسارات. /api/search ربما 400 (يحتاج query params).
```

---

## 4️⃣ قياس الأداء

```bash
for route in "/api/health" "/api/dashboard" "/api/comprehensive-indicators" \
             "/api/voters" "/api/indicators" "/api/composite-indicators"; do
  t=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:3000${route}" -b admin.txt)
  echo "$route → ${t}s"
done
# القاعدة: كل مسار تحت 100ms على بيانات محلية صغيرة. أبطأ مسار: comprehensive-indicators (~40ms).
# فوق 500ms يستحق تحقيقاً (فهارس مفقودة، N+1، حسابات ثقيلة بدون كاش).
```

---

## 5️⃣ التحقق من المحركات (لا بيانات وهمية)

قاعدة المشروع الصارمة: **لا حشو بأرقام ثابتة**. كل قيمة في الواجهة يجب أن تأتي من محرك حقيقي.

```bash
curl -s http://localhost:3000/api/comprehensive-indicators -b admin.txt -o /tmp/ind.json
node -e "
  const d = require('/tmp/ind.json');
  const s = JSON.stringify(d);
  console.log('يحتوي 855000 (ناخبون وهميون)؟', s.includes('855000') ? '❌ نعم' : '✅ لا');
  console.log('يحتوي avgParticipation:58؟', s.includes('58') ? '❌ نعم' : '✅ لا');
  console.log('يحتوي digitalCampaigns:75؟', s.includes('\"digitalCampaigns\":75') ? '❌ نعم' : '✅ لا');
"
# المتوقع: كلها "لا" (القيم الوهمية أُزيلت في جولة التصلّيد)
```

---

## 6️⃣ سلامة قاعدة البيانات

### عدّ السجلات لكل جدول
```bash
DATABASE_URL="file:./db/local.db" node -e "
  const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
  Promise.all([p.user.count(),p.tribe.count(),p.electionKey.count(),
               p.voter.count(),p.provinceReference.count(),p.auditLog.count()])
  .then(r=>console.log({users:r[0],tribes:r[1],keys:r[2],voters:r[3],provinceRef:r[4],audit:r[5]}))
  .finally(()=>p.\$disconnect())
"
# المتوقع: users=3, provinceRef=1. tribes=0 افتراضياً (الـ seed المحلي مُبسّط).
```

### التكامل المرجعي
```bash
# محاولة إنشاء ناخب بمرجع غير موجود — يجب الرفض (400)
curl -s -X POST http://localhost:3000/api/voters -b admin.txt \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","phone":"777","tribeId":"nonexistent-id"}' -w "\n→ %{http_code}\n"
# المتوقع: 400 ("مرجع غير صالح")
```

---

## 🧹 التنظيف بعد الفحص

```bash
# أوقف الخادم
taskkill //F //IM node.exe        # على Windows
# pkill -f "next dev"              # على Linux/macOS

# احذف ملفات الكوكيز المؤقتة
rm -f admin.txt user.txt /tmp/ind.json
```

---

## 🔌 التكامل مع CI/CD (اختياري)

لأتمتة الفحوصات قبل كل merge، أضف إلى GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx vitest run
      - run: npx eslint .
      - run: npm audit --audit-level=high
```

> **ملاحظة:** فحوصات الـ Pentest الحية (المرحلة 2) تحتاج خادماً + قاعدة بيانات في CI،
> لذا تُترك للتشغيل اليدوي قبل النشر.

---

## 🐛 مشاكل معروفة (ليست ثغرات)

| المشكلة | السبب | الحل |
|---------|------|------|
| `/api/voters?search=` يُرجع 500 على SQLite | `mode:"insensitive"` خاص بـ PostgreSQL | تختفي في الإنتاج (PostgreSQL). محلياً استخدم PostgreSQL أو تجاهل |
| الـ seed المحلي يزرع 0 قبائل | الـ seed مبسّط | لاختبار CRUD الكامل للناخبين، أنشئ قبيلة/مفتاحاً يدوياً أولاً |
| ~66 خطأ ESLint `set-state-in-effect` | hooks شائعة من shadcn/ui | غير حرجة وظيفياً. أصلحها بـ `--fix` عند التفرغ |

---

## 📚 مهارات الاختبار المتاحة

المشروع يضمّ مهارات قابلة للتفعيل عبر `/skill <name>`:

| المهارة | الغرض |
|--------|------|
| `agency-penetration-tester` | اختبار اختراق أمني شامل |
| `agency-api-tester` | فحص مصفوفة الـ API والعقود |
| `agency-accessibility-auditor` | فحص الوصول/الإتاحة (WCAG) |
| `agency-performance-benchmarker` | قياس الأداء وتحليل الاختناقات |
| `agency-code-reviewer` | مراجعة جودة الكود |
| `agency-security-architect` | تدقيق معمارية الأمان |

لتفعيلها: `/skill agency-penetration-tester <طلب مفصل>`

---

## 📖 مراجع داخلية

| الوثيقة | الغرض |
|--------|------|
| `docs/api_endpoints.md` | قائمة نقاط الاتصال |
| `docs/architecture.md` | المعمارية التقنية |
| `docs/developer_guide.md` | الأمان والأداء |
| `docs/AGENT_PATTERNS.md` | أنماط بناء الوكلاء والمهارات |
| `.agents/skills/election-agent-patterns/SKILL.md` | دليل KB الإلزامي للمشروع |
| `walkthrough.md` | سجل التغييرات التاريخية |
| `audit-report.md` / `تقرير_تدقيق_المشروع.md` | تقارير التدقيق السابقة |

---

> **آخر تحديث:** يوليو 2026 — بعد جولة التصلّيد الأمني وإطلاق سكربت `run-tests.js`
