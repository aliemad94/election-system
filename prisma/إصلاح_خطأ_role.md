مهمة إصلاح حرجة: عطل تسجيل الدخول في الإنتاج بسبب تعارض نوع عمود role.

السبب التشخيصي المؤكد (لا تناقشه، صدّقه):
عندنا تعارض بين الكود وقاعدة البيانات:
- في الكود (schema.prisma السطر 26): role معرف كـ String نص
- في قاعدة بيانات Supabase الإنتاجية: role موجود كـ Enum
- النتيجة: خطأ Prisma P2032 عند كل محاولة دخول، فينهار الخادم بـ 500

الخيار المعتمد من المالك: تحويل العمود في Supabase من Enum إلى TEXT ليتطابق مع الكود.

المطلوب منك بالترتيب:

المهمة الأولى: تحويل عمود role في Supabase الإنتاجية
ستنفّذ SQL التالي مباشرة على قاعدة بيانات Supabase الإنتاجية.
الوصول الموصى به: لوحة Supabase ثم SQL Editor.
بديلا عن ذلك: railway run npx prisma db execute.

نفّذ هذه الأوامر SQL بالترتيب:

الخطوة 1 - احتياطيا، أضف عمود role جديد كـ TEXT مؤقت:
ALTER TABLE "User" ADD COLUMN "role_new" TEXT;

الخطوة 2 - انسخ القيم من العمود القديم للجديد (مع تحويل Enum إلى نص):
UPDATE "User" SET "role_new" = "role"::text;

الخطوة 3 - احذف العمود القديم (الـEnum):
ALTER TABLE "User" DROP COLUMN "role";

الخطوة 4 - أعد تسمية العمود الجديد إلى role:
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";

الخطوة 5 - أعد بناء الفهرس:
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

الخطوة 6 - احذف نوع Enum القديم إن أمكن:
DROP TYPE IF EXISTS "Role";
ملاحظة: قد يكون الاسم مختلفا. استعلم أولا عن أسماء الأنواع:
SELECT typname FROM pg_type WHERE typtype = 'e';
ثم احذف النوع المسؤول عن role (غالبا اسمه Role أو UserRole).

المهمة الثانية: كرّر نفس الشيء لجدول Volunteer
جدول Volunteer له نفس العمود role بنفس التعارض (السطر 396 في schema.prisma).
نفّذ نفس الخطوات الست على جدول Volunteer بدل User.

المهمة الثالثة: اختبر الدخول بعد التحويل
بعد تنفيذ SQL، اختبر فورا:
1. POST /api/access بـ action=owner-login و ownerPassword=AdminSafeDhiQar2026#
2. يجب أن ترجع: success=true, role=ADMIN, HTTP 200
3. POST /api/access بـ action=login و password=UserSafeDhiQar2026$
4. يجب أن ترجع: success=true, HTTP 200

المهمة الرابعة: شغّل seed.core لتحديث كلمات المرور
بعد إصلاح النوع، شغّل:
railway run npm run db:seed:core
أو عبر نقطة /api/seed الجديدة.
هذا سيضمن أن كلمات المرور في قاعدة البيانات مطابقة لمتغيرات Railway.

المهمة الخامسة: تحقق نهائي حيا
أرسل لي ناتج هذه الطلبات بعد الإصلاح:
- POST /api/access (مالك) ← HTTP 200
- POST /api/access (زائر) ← HTTP 200
- GET /api/tribes ← 0
- GET /api/voters ← 0
- GET /api/early-warnings ← 0

المهمة السادسة: امنع تكرار المشكلة
في package.json، احذف npx prisma db push من أي سكربت يُشغّل في الإنتاج.
db push يمكن أن يكسر القاعدة في الإنتاج.
استخدم فقط: prisma migrate deploy في الإنتاج (إن وُجد migration جديد).

قواعد إلزامية:
- نفّذ SQL بحذر. هذه قاعدة بيانات حية.
- اختبر الدخول بعد كل خطوة SQL، لا تنتظر النهاية.
- إذا فشل أي خطأ، توقف فورا وأبلغني.
- لا تقل تم إلا بعد فحص حي بـ HTTP 200 للدخول.

ابدأ الآن.
