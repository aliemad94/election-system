# 📋 دليل نقل مشروع المنظومة الانتخابية — Electoral Machine System
# Complete Project Handoff Document

> **الهدف**: هذا المستند يحتوي على كل ما تحتاجه بيئة تطوير جديدة لاستنساخ وتشغيل ونشر المشروع بالكامل تماماً كما يعمل حالياً، دون فقدان أي تفصيل.

---

## 1. نظرة عامة على المشروع (Project Overview)

### ما هو المشروع؟
منظومة إدارة ماكينة انتخابية مركزية لمحافظة ذي قار (العراق). النظام يحتوي على:
- **80 مؤشراً تحليلياً** متقدماً لقياس الأداء الانتخابي
- **إدارة المفاتيح الانتخابية** (الوجهاء والشخصيات المؤثرة)
- **تسجيل وتتبع الناخبين** مع تصنيفهم (مؤيد/محايد/ضعيف)
- **نظام العشائر والأفخاذ** (هيكلة شجرية هرمية)
- **تتبع المنافسين والخصوم**
- **إدارة الخدمات والمهام الميدانية**
- **نظام المتطوعين والكوادر**
- **لوحة تحكم Dashboard** مع مؤشرات حية
- **نظام مصادقة JWT** مع أدوار ثلاثة (ADMIN, KEY_USER, OBSERVER)

### Technology Stack
| المكون | التقنية | الإصدار |
|--------|---------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Runtime | Node.js | 20.x |
| Language | TypeScript | 5.x |
| CSS | Tailwind CSS **v4** | 4.x |
| Database | PostgreSQL (Supabase) | — |
| ORM | Prisma Client | 6.19.x |
| Auth | JWT via `jose` library | 6.x |
| Password Hashing | `bcryptjs` | 3.x |
| UI Components | Radix UI + shadcn/ui pattern | — |
| Charts | Recharts | 2.x |
| State | Zustand + TanStack React Query | — |
| Deployment | Railway (via Dockerfile) | — |
| Repository | GitHub: `aliemad94/election-system` | — |

---

## 2. الكود المصدري الكامل (Source Code)

### الخيار الأول: استنساخ من GitHub (الأفضل)
```bash
git clone https://github.com/aliemad94/election-system.git
cd election-system
```

### الخيار الثاني: استخدام الملف المضغوط
الملف `election-system.zip` (232 كيلوبايت) يحتوي على كافة ملفات المشروع الأصلية ماعدا:
- `node_modules/` (يتم تثبيته بـ `npm install`)
- `.next/` (يتم بناؤه بـ `npm run build`)
- `.git/` (يتم إنشاؤه بـ `git init`)

### الخيار الثالث: الملف المرجعي الكامل
الملف `project_clean_source.md` (864 كيلوبايت) يحتوي على كامل الكود المصدري بصيغة Markdown مع syntax highlighting لكل ملف.

---

## 3. هيكلة المشروع (Project Structure)

```
election-system/
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات (PostgreSQL)
│   ├── schema.postgres.prisma # نسخة إنتاج (تُنسخ تلقائياً في Dockerfile)
│   ├── seed.js                # سكريبت تهيئة البيانات
│   └── seed.ts                # (نسخة TypeScript مرجعية فقط)
├── src/
│   ├── app/
│   │   ├── api/               # 30+ API route handlers
│   │   ├── globals.css        # ألوان التصميم (CSS Variables + Tailwind)
│   │   ├── tw-animate.css     # Tailwind Animation utilities
│   │   ├── layout.tsx         # Root layout (RTL + Arabic font)
│   │   └── page.tsx           # الصفحة الرئيسية (Login Gate + Dashboard)
│   ├── components/
│   │   ├── election/          # مكونات الواجهة الانتخابية
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # React hooks
│   ├── lib/
│   │   ├── auth.ts            # JWT token create/verify
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Edge middleware (JWT + security headers)
├── public/                    # Static assets
├── scenarios/                 # Test scenarios
├── docs/                      # Documentation
├── package.json
├── tsconfig.json
├── next.config.ts             # Next.js config (standalone output)
├── tailwind.config.ts         # Tailwind v4 config
├── postcss.config.mjs         # PostCSS config (CRITICAL)
├── Dockerfile                 # Multi-stage Docker build
├── nixpacks.toml              # Railway Nixpacks config
├── railway.toml               # Railway deployment config
├── copy-standalone.js         # Post-build script
├── .env                       # Environment variables (LOCAL)
├── .env.example               # Template for environment variables
└── .env.production            # Production environment template
```

---

## 4. إعداد البيئة المحلية (Local Setup)

### الخطوة 1: تثبيت الاعتماديات
```bash
npm install
```

### الخطوة 2: إنشاء ملف `.env`
أنشئ ملف `.env` في جذر المشروع بالمحتوى التالي:

```env
DATABASE_URL="postgresql://postgres.bgesrqnmguqkjbsyhuvi:<REDACTED>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="<REDACTED_LOCAL_JWT_SECRET>"
ADMIN_PASSWORD="<REDACTED_DEFAULT_PASSWORD>"
USER_PASSWORD="<REDACTED_DEFAULT_PASSWORD>"
NODE_ENV="development"
```

> ⚠️ **ملاحظة أمنية**: رابط قاعدة البيانات أعلاه هو رابط Supabase الحقيقي المستخدم حالياً. إذا أردت قاعدة بيانات جديدة، أنشئ مشروع Supabase جديد واستبدل الرابط.

### الخطوة 3: مزامنة قاعدة البيانات وتهيئتها
```bash
npx prisma generate
npx prisma db push --force-reset
npm run db:seed
```

**تفسير الأوامر:**
- `prisma generate`: يولّد Prisma Client من المخطط
- `prisma db push --force-reset`: يحذف كل الجداول ويعيد إنشاءها من المخطط (⚠️ تحذير: يمسح كل البيانات)
- `npm run db:seed`: يُنشئ المستخدمين الافتراضيين والبيانات التجريبية

### الخطوة 4: تشغيل خادم التطوير
```bash
npm run dev
```
يفتح على: `http://localhost:3000`

### بيانات الدخول:
| المستخدم | اسم المستخدم | كلمة المرور | الدور |
|----------|-------------|-------------|-------|
| مدير النظام | `admin` | `Admin12345!` | ADMIN |
| المراقب | `observer` | `User12345!` | OBSERVER |
| مفتاح انتخابي | `key_user` | `User12345!` | KEY_USER |

---

## 5. الإصلاحات الحرجة المُطبّقة (Critical Fixes Applied)

### ⚠️ إصلاح #1: Edge Runtime + Prisma (middleware.ts)
**المشكلة**: Next.js middleware يعمل على Edge Runtime الذي لا يدعم اتصالات TCP مباشرة. Prisma Client يحتاج TCP للاتصال بـ PostgreSQL، مما يسبب `PrismaClientValidationError` عند محاولة التحقق من المستخدم في الـ middleware.

**الحل**: الـ middleware يتحقق فقط من صلاحية JWT token (باستخدام مكتبة `jose` المتوافقة مع Edge). أما التحقق من وجود المستخدم في قاعدة البيانات فيتم تأجيله إلى كل route handler عبر دالة `withAuth()`.

**الملف**: `src/middleware.ts` — السطر 74-75 يوضح ذلك:
```typescript
// Note: DB user validation is deferred to each route handler via withAuth()
// because the Edge Runtime cannot open TCP connections directly to PostgreSQL.
```

### ⚠️ إصلاح #2: Tailwind CSS v4 لا يُجمّع الأنماط
**المشكلة**: جميع أنماط Tailwind CSS كانت لا تظهر في الإنتاج، والواجهة تظهر بدون تنسيق.

**السبب الجذري**: ملف `postcss.config.mjs` كان مفقوداً. Tailwind CSS v4 يتطلب PostCSS plugin خاص (`@tailwindcss/postcss`) بدلاً من التكوين القديم.

**الحل**: إنشاء ملف `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

### ⚠️ إصلاح #3: Tailwind content paths
**المشكلة**: حتى بعد إضافة PostCSS config، بعض الأنماط في مجلد `src/` لا تُجمّع.

**الحل**: إضافة مسارات `./src/` إلى `content` في `tailwind.config.ts`:
```typescript
content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

### ⚠️ إصلاح #4: أمان وتنظيف Git History
**المشكلة**: ملف `.env` (يحتوي على بيانات Supabase الحساسة) كان ملتزماً بالخطأ في Git history.

**الحل**: تم تنظيف التاريخ باستخدام:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

---

## 6. نظام المصادقة (Authentication System)

### آلية العمل:
1. **تسجيل الدخول** (`POST /api/access`): يتحقق من اسم المستخدم وكلمة المرور عبر `bcryptjs`، ثم يُنشئ JWT token ويخزنه في cookie `election_auth`.
2. **Middleware** (`src/middleware.ts`): يعترض كل طلبات `/api/*` (ماعدا `/api/access` و `/api/health`) ويتحقق من JWT token باستخدام مكتبة `jose`.
3. **Route Handlers**: كل handler يستخدم `withAuth()` للتحقق الإضافي من قاعدة البيانات.
4. **الأدوار**:
   - `ADMIN`: صلاحيات كاملة
   - `KEY_USER`: إدارة المفاتيح والناخبين
   - `OBSERVER`: قراءة فقط

### ملفات المصادقة الرئيسية:
- `src/lib/auth.ts` — إنشاء والتحقق من JWT tokens
- `src/middleware.ts` — حماية API routes
- `src/app/api/access/route.ts` — Login/Logout endpoint
- `prisma/seed.js` — إنشاء المستخدمين الافتراضيين

---

## 7. قاعدة البيانات (Database Schema)

### الجداول الرئيسية:
| الجدول | الوصف | الحقول المهمة |
|--------|-------|--------------|
| `User` | المستخدمون | username, password, role (ADMIN/KEY_USER/OBSERVER) |
| `Tribe` | العشائر | name (unique) |
| `SubTribe` | الأفخاذ/البيوت | name, tribeId |
| `ElectionKey` | المفاتيح الانتخابية | keyCode, expectedVotes, influenceLevel, loyaltyScore, riskLevel |
| `Voter` | الناخبون | status, supportDegree, voterCategory, votedOnDay, keyId |
| `Service` | الخدمات | title, category, status, cost, keyId, voterId |
| `CommissionData` | بيانات المفوضية | pollingCenter, ballotStation, registeredVoters, historicalTurnout |
| `Competitor` | المنافسون | name, party, estimatedVotes, strengthLevel |
| `Volunteer` | المتطوعون | fullName, role, district, efficiencyScore |
| `Task` | المهام الميدانية | title, priority, status, taskType |
| `AuditLog` | سجل التدقيق | userId, action, entity, details |
| `RateLimit` | تحديد المعدل | key, count, blockedUntil |
| `SystemConfig` | إعدادات النظام | enabled |
| `SentimentTrend` | تحليل المشاعر | source, sentiment, score, region |

### العلاقات الرئيسية:
- `Tribe` ← `SubTribe` (1:N)
- `Tribe` ← `Voter` (1:N)
- `ElectionKey` ← `Voter` (1:N)
- `ElectionKey` ← `Service` (1:N)
- `Voter` ← `Task` (1:N)
- `Volunteer` ← `Task` (1:N)

---

## 8. API Routes الكاملة

```
POST   /api/access              — تسجيل الدخول/الخروج
GET    /api/health               — فحص صحة النظام
GET    /api/dashboard            — بيانات لوحة التحكم
GET    /api/comprehensive-indicators — 80 مؤشراً تحليلياً
GET    /api/composite-indicators — مؤشرات مركبة
GET    /api/dynamic-indicators   — مؤشرات ديناميكية
GET    /api/indicators           — مؤشرات أساسية
GET    /api/analysis             — تحليلات
GET    /api/stats                — إحصائيات عامة
GET    /api/search               — بحث شامل

CRUD   /api/voters               — إدارة الناخبين
CRUD   /api/voters/[id]          — ناخب محدد
POST   /api/voters/checkin       — تسجيل حضور ناخب يوم الاقتراع
GET    /api/voters/stats         — إحصائيات الناخبين

CRUD   /api/electoral-keys       — إدارة المفاتيح الانتخابية
CRUD   /api/electoral-keys/[id]  — مفتاح محدد

CRUD   /api/tribes               — إدارة العشائر والأفخاذ
CRUD   /api/services             — إدارة الخدمات
CRUD   /api/competitors          — إدارة المنافسين
CRUD   /api/volunteers           — إدارة المتطوعين
CRUD   /api/tasks                — إدارة المهام
CRUD   /api/alerts               — إدارة التنبيهات
CRUD   /api/commission           — بيانات المفوضية
CRUD   /api/commission/[id]      — بيانات مفوضية محددة
CRUD   /api/campaign             — إدارة الحملة
CRUD   /api/sms                  — إرسال رسائل
GET    /api/early-warnings       — نظام الإنذار المبكر
CRUD   /api/election-results     — نتائج الانتخابات
GET    /api/keys                 — مفاتيح (legacy)
```

---

## 9. النشر على Railway (Deployment)

### المتغيرات البيئية المطلوبة في Railway:
```env
DATABASE_URL=postgresql://postgres.bgesrqnmguqkjbsyhuvi:<REDACTED>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=<REDACTED_PRODUCTION_JWT_SECRET>
ADMIN_PASSWORD=<REDACTED_PRODUCTION_ADMIN_PASSWORD>
USER_PASSWORD=<REDACTED_PRODUCTION_USER_PASSWORD>
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

### آلية النشر:
1. المشروع مربوط بمستودع GitHub: `aliemad94/election-system`
2. Railway يبني تلقائياً عند كل Push
3. يستخدم `Dockerfile` متعدد المراحل:
   - Stage 1 (builder): يثبّت الاعتماديات، يولّد Prisma Client، يبني Next.js standalone
   - Stage 2 (runner): ينسخ البناء فقط، يشغل `start.sh`
4. **`start.sh`** عند التشغيل:
   - يتحقق من وجود `JWT_SECRET` و `ADMIN_PASSWORD` و `USER_PASSWORD`
   - ينفذ `prisma db push --skip-generate`
   - ينفذ `prisma db seed`
   - يشغل `node server.js`

### الرابط العام:
```
https://election-system-production-437f.up.railway.app
```

---

## 10. التحقق من صحة البناء (Build Verification)

```bash
# 1. تشغيل بناء إنتاجي كامل
npm run build

# النتيجة المتوقعة:
# ✔ Generated Prisma Client
# ✓ Compiled successfully
# ✓ Generating static pages (30/30)
# ✅ Standalone static files copied successfully.

# 2. التأكد من عدم وجود أخطاء TypeScript
# npm run build يتضمن فحص TypeScript تلقائياً

# 3. Routes المتوقعة:
# ○ / (Static)
# ƒ /api/* (Dynamic, 30+ routes)
```

---

## 11. النظام البصري (Design System - Command Deck)

### لوحة الألوان المخصصة (Command Deck):
النظام مطبق بنظام ألوان **منصة القيادة (Command Deck)** عالية الكثافة لغرف العمليات السياسية بالخصائص التالية:
* **الثيم الداكن (الافتراضي للـ War Room):**
  * الخلفية (`--color-el-bg`): `#0B1120` (حبري مريح للعين)
  * الأسطح والبطاقات (`--color-el-surface`): `#131C2E`
  * حاويات الأسطح ورؤوس الجداول (`--color-el-surface-container`): `#1B2638`
  * الفواصل والحدود (`--color-el-line` / `--border`): `#26324B`
  * الإشارة الكهرمانية الحرجة (`--color-el-primary` / `--primary`): `#F2A024`
  * مؤشر الولاء/الدعم التيل (`--color-el-secondary` / `--secondary`): `#2DD4BF`
  * مؤشر التنبيه/الخطر القرمزي (`--color-el-alert` / `--destructive`): `#E5484D`
  * النصوص الأساسية والخافتة: `#E8EDF7` و `#8A99B4`

### الخطوط المستخدمة (Typography):
* **العرض والواجهات:** الخط العربي الراقي **IBM Plex Sans Arabic** (بأوزان 400/600/700).
* **الأرقام والبيانات:** الخط الأحادي **IBM Plex Mono** مع تفعيل الأرقام الجدولية (`font-variant-numeric: tabular-nums`) لمحاذاة مثالية وسهولة القراءة في الجداول.


---

## 12. ملاحظات حرجة للمطور الجديد

### 🔴 لا تفعل:
1. **لا تضع Prisma Client في middleware** — Edge Runtime لا يدعم TCP connections
2. **لا تحذف `postcss.config.mjs`** — بدونه Tailwind v4 لن يعمل إطلاقاً
3. **لا تحذف مسارات `./src/` من `tailwind.config.ts`** — كل الأنماط في مجلد `src/`
4. **لا ترفع `.env` إلى Git** — تم تنظيف التاريخ سابقاً
5. **لا تستخدم `seed.ts`** — Railway لا يدعمه، استخدم `seed.js` فقط

### 🟢 افعل:
1. **استخدم `jose` للـ JWT** في أي كود يعمل على Edge Runtime
2. **استخدم `withAuth()` wrapper** في كل API route handler للتحقق من الأدوار
3. **اختبر البناء الإنتاجي** (`npm run build`) قبل كل Push
4. **تأكد من `output: "standalone"`** في `next.config.ts` — مطلوب لـ Railway

---

## 13. أوامر البناء والتطوير الشائعة

```bash
# تطوير محلي
npm run dev                    # تشغيل خادم التطوير (port 3000)

# قاعدة البيانات
npx prisma generate            # توليد Prisma Client
npx prisma db push              # مزامنة المخطط مع قاعدة البيانات
npx prisma db push --force-reset # حذف + إعادة إنشاء كل الجداول
npm run db:seed                 # تهيئة البيانات الافتراضية

# بناء إنتاجي
npm run build                  # prisma generate + next build + copy-standalone

# Git
git add . && git commit -m "message" && git push origin main
# ↑ يطلق Railway build تلقائياً
```

---

## 14. ملخص الخطوات الكاملة للتشغيل من الصفر

```bash
# 1. استنساخ المشروع
git clone https://github.com/aliemad94/election-system.git
cd election-system

# 2. تثبيت الاعتماديات
npm install

# 3. إنشاء ملف .env (انسخ المحتوى من القسم 4 أعلاه)

# 4. توليد Prisma Client
npx prisma generate

# 5. مزامنة قاعدة البيانات
npx prisma db push --force-reset

# 6. تهيئة البيانات
npm run db:seed

# 7. تشغيل خادم التطوير
npm run dev

# 8. فتح المتصفح
# http://localhost:3000
# الدخول بـ: admin / Admin12345!
```

---

> **آخر تحديث**: 2026-06-19
> **آخر commit**: `96bf4a1 - Remove buyer guide label from DataAnalysis UI`
> **حالة البناء**: ✅ ناجح (30/30 صفحة، 30+ API route)
