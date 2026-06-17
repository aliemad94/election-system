# 🚀 نشر المنصة على Railway — دليل كامل

## الخطوة 1: إنشاء المشروع في Railway

1. افتح **https://railway.app** وسجّل دخولك
2. اضغط **New Project**
3. اختر **Deploy from GitHub repo**
4. اختر مستودع **`aliemad94/election-system`**
5. اضغط **Deploy Now**

---

## الخطوة 2: إضافة قاعدة البيانات PostgreSQL

1. داخل المشروع، اضغط **+ Add Service**
2. اختر **Database → PostgreSQL**
3. انتظر حتى يكتمل الإنشاء
4. اضغط على خدمة PostgreSQL → **Variables** → انسخ **`DATABASE_URL`**

> ⚠️ **ملاحظة**: Railway يوفّر متغير `DATABASE_URL` تلقائياً. يمكنك ربطه بالتطبيق عبر **Reference Variables**.

---

## الخطوة 3: إضافة Redis (اختياري — لمزامنة Socket.io)

1. اضغط **+ Add Service**
2. اختر **Database → Redis**
3. انتظر حتى يكتمل الإنشاء
4. اضغط على خدمة Redis → **Variables** → انسخ **`REDIS_URL`**

---

## الخطوة 4: متغيرات البيئة (Variables)

اضغط على **خدمة التطبيق** (election-system) → **Variables** → **Raw Editor**  
والصق هذا النص كاملاً:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1

# ← ضعها من Railway PostgreSQL (خدمة قاعدة البيانات → Variables → DATABASE_URL)
DATABASE_URL=postgresql://...

# ← نفس DATABASE_URL (للـ migrations)
DIRECT_DATABASE_URL=postgresql://...

# ← ضعها من Railway Redis (خدمة Redis → Variables → REDIS_URL)
REDIS_URL=redis://...

# ─── مفتاح JWT (لا تغيّره) ───
JWT_SECRET=Y98eqCW0nN6fD08tP1DwjPoqXlBf5qs5tSUVkOjWswtIZ0PXJ4X3BoHg7TvjXHMagbA_o2SPKcf8yhWA1vDuqg

# ─── كلمات مرور المستخدمين الافتراضيين ───
ADMIN_PASSWORD=Admin12345!
USER_PASSWORD=User12345!
```

### 📋 شرح المتغيرات:

| المتغير | الوصف | المصدر |
|---------|-------|--------|
| `NODE_ENV` | وضع الإنتاج | ثابت: `production` |
| `PORT` | منفذ التطبيق | ثابت: `3000` |
| `HOSTNAME` | عنوان الاستماع | ثابت: `0.0.0.0` |
| `DATABASE_URL` | رابط PostgreSQL | من خدمة PostgreSQL في Railway |
| `DIRECT_DATABASE_URL` | رابط مباشر لـ Prisma | نفس `DATABASE_URL` |
| `REDIS_URL` | رابط Redis | من خدمة Redis في Railway |
| `JWT_SECRET` | مفتاح تشفير التوكنات | **محفوظ في المشروع** |
| `ADMIN_PASSWORD` | كلمة مرور المسؤول | `Admin12345!` |
| `USER_PASSWORD` | كلمة مرور المراقب | `User12345!` |

---

## الخطوة 5: Deploy

1. اضغط **Deploy** (أو سيبدأ تلقائياً بعد إضافة المتغيرات)
2. اضغط **View Logs** لمتابعة البناء (يستغرق 3-5 دقائق)
3. بعد اكتمال البناء:
   - **Generate Domain**: اضغط **Settings → Networking → Generate Domain**
   - سيظهر رابط: `https://xxxxx.up.railway.app`

---

## الخطوة 6: التحقق من النجاح

بعد نجاح النشر، ستظهر في اللوجات:
```
Pushing database schema...
Running database seed...
✅ تم تهيئة قاعدة البيانات بنجاح!
Starting server...
```

### بيانات الدخول الافتراضية:

| المستخدم | اسم المستخدم | كلمة المرور | الدور |
|----------|-------------|-------------|-------|
| المسؤول | `admin` | `Admin12345!` | ADMIN |
| المراقب | `observer` | `User12345!` | OBSERVER |
| مستخدم رئيسي | `key_user` | `User12345!` | KEY_USER |

> ⚠️ **جميع المستخدمين مطالبون بتغيير كلمة المرور عند أول دخول**

---

## ملاحظات فنية مهمة

### كيف يعمل البناء:
- **البناء**: يستخدم `Dockerfile` (مُهيّأ في `railway.toml`)
- **المرحلة 1** (Builder): `npm install` → `prisma generate` → `next build`
- **المرحلة 2** (Runner): صورة خفيفة مع standalone build فقط
- **التشغيل**: `start.sh` يقوم بـ:
  1. التحقق من المتغيرات المطلوبة (`JWT_SECRET`, `ADMIN_PASSWORD`, `USER_PASSWORD`)
  2. `prisma db push` — إنشاء الجداول تلقائياً
  3. `prisma db seed` — إضافة المستخدمين الافتراضيين
  4. `node server.js` — تشغيل الخادم

### ملفات التكوين:
- [`railway.toml`](railway.toml) — إعدادات Railway (يستخدم Dockerfile)
- [`Dockerfile`](Dockerfile) — بناء الصورة (multi-stage)
- [`nixpacks.toml`](nixpacks.toml) — بديل (لا يُستخدم عندما يكون `railway.toml` يحدد Dockerfile)

---

## إذا فشل البناء

تحقق من اللوجات في Railway → **Deployments** → **View Logs** وابحث عن:

| الخطأ | الحل |
|-------|------|
| `FATAL: JWT_SECRET` | أضف متغير `JWT_SECRET` |
| `FATAL: ADMIN_PASSWORD` | أضف متغير `ADMIN_PASSWORD` |
| `FATAL: USER_PASSWORD` | أضف متغير `USER_PASSWORD` |
| `Error: DATABASE_URL` | تحقق من رابط PostgreSQL |
| `prisma db push` فشل | تأكد أن `DATABASE_URL` صحيح ويمكن الوصول إليه |
| Build timeout | Railway Free Tier له حد 500 ساعة — تأكد من عدم تجاوزه |

---

## تحديث التطبيق

عند أي `git push` إلى الفرع الرئيسي (`main`)، Railway يعيد البناء والنشر تلقائياً:

```bash
git add .
git commit -m "update"
git push origin main
```
