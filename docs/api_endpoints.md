# دليل نقاط الاتصال وواجهات البرمجة (API Endpoints)

توفر المنظومة الانتخابية مجموعة من واجهات البرمجة RESTful APIs لإدارة وتصفية البيانات الميدانية والتحليلية للمشروع. جميع الطلبات تتطلب ترويسة مصادقة (Bearer JWT Token) أو ملف تعريف ارتباط (Session Cookie) ساري المفعول.

---

## 1. مصادقة الدخول والوصول (`/api/access`)

### تسجيل دخول المستخدمين الميدانيين والمشرفين
- **المسار**: `POST /api/access`
- **الجسم (Body)**:
```json
{
  "username": "user123",
  "password": "password123"
}
```
- **الاستجابة (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "role": "KEY_USER",
  "username": "user123"
}
```

---

## 2. إدارة وتصفح سجلات الناخبين (`/api/voters`)

### جلب قائمة الناخبين (مع التصفح والتصفية)
- **المسار**: `GET /api/voters`
- **المعلمات المقبولة (Query Parameters)**:
  - `page`: رقم الصفحة (افتراضي: `1`).
  - `limit`: عدد السجلات بالصفحة (افتراضي: `50`).
  - `search`: نص البحث (يبحث بالاسم، الموبايل، الهوية).
  - `district`: تصفية حسب القضاء.
  - `votedStatus`: تصفية لحالات الاقتراع (`true` / `false`).
- **الاستجابة (200 OK)**:
```json
{
  "voters": [
    {
      "id": "voter-cuid",
      "fullName": "محمد أحمد علي حسين",
      "phone": "07701234567",
      "district": "الغراف",
      "votedStatus": false,
      "supportDegree": 4,
      "isRegistryVerified": true
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 50
}
```

### تسجيل ناخب جديد
- **المسار**: `POST /api/voters`
- **الجسم (Body)**:
```json
{
  "firstName": "أحمد",
  "fatherName": "علي",
  "grandfatherName": "حسين",
  "fourthName": "راضي",
  "phone": "07809876543",
  "district": "الغراف",
  "subDistrict": "المركز",
  "pollingCenterName": "مدرسة الغراف للبنين",
  "electoralKeyId": "key-id-123",
  "supportDegree": 5
}
```
- **الاستجابة (210 Created)**.

---

## 3. إدارة المفاتيح الانتخابية (`/api/electoral-keys`)

### جلب قائمة المفاتيح الميدانية
- **المسار**: `GET /api/electoral-keys`
- **الاستجابة (200 OK)**:
```json
[
  {
    "id": "key-id-123",
    "keyCode": "K-05",
    "firstName": "كريم",
    "phone": "07712345678",
    "expectedVotes": 150,
    "loyaltyScore": 5
  }
]
```

### تحديث بيانات مفتاح انتخابي
- **المسار**: `PUT /api/electoral-keys/[id]`
- **الاستجابة**: تحديث بيانات الكائن أو إرجاع خطأ تعارض البيانات المكررة (409 Conflict) في حال محاولة استخدام رقم هاتف مسجل مسبقاً.

---

## 4. محرك المؤشرات الحاسمة والتوقعات (`/api/comprehensive-indicators`)

### جلب المؤشرات الإستراتيجية الشاملة
- **المسار**: `GET /api/comprehensive-indicators`
- **الاستجابة (200 OK)**:
```json
{
  "decisive": {
    "expectedVotesOnDay": 8450,
    "expectedParticipation": 42.5,
    "avgKRI": 78.4,
    "avgDRS": 22.1,
    "projectedSeats": 2,
    "totalNetVotes": 9120,
    "totalRegistered": 24000,
    "gpsVerificationRate": 85.3,
    "registryVerificationRate": 92.1
  },
  "meta": {
    "calculatedAt": "2026-06-11T14:00:00.000Z",
    "totalKeys": 25,
    "totalVoters": 1240,
    "totalTribes": 14,
    "totalDistricts": 7
  }
}
```
