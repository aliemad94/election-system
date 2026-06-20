import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    closing_burst: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 600,
      maxDuration: '90s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const k = __ITER % 4;
  let res;
  if (k === 0) {
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, timeout: '15s' });
  } else if (k === 1) {
    res = http.get(`${BASE}/api/indicators`, { timeout: '15s' });
  } else if (k === 2) {
    res = http.get(`${BASE}/api/voters?page=1`, { timeout: '15s' });
  } else {
    res = http.get(`${BASE}/api/tribes`, { timeout: '15s' });
  }
  check(res, { 'served': (r) => r.status !== 0 }, { type: 'served' });
}

```


---

## ملخص المشروع

### إحصائيات
- **API endpoints:** 30
- **مكوّنات election UI:** 22
- **مكوّنات shadcn/ui:** 48
- **مكتبات lib:** 16 (محركات تحليل + أمان + أنواع)
- **نماذج Prisma:** 14
- **مؤشرات تحليلية:** 80+ (EII/KRI/VPS/DRS/EFI/API/EWLI/GSI/EDRI + Saint-Laguë)
- **صفحات UI:** 17 (في 5 مجموعات)

### المعمارية
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui (Command Deck dark theme)
- **Database:** Prisma ORM + SQLite (staging) / PostgreSQL (production)
- **Auth:** JWT (jose) + bcryptjs + RBAC (ADMIN/KEY_USER/OBSERVER)
- **Charts:** Recharts 2
- **Fonts:** IBM Plex Sans Arabic + IBM Plex Mono (tabular-nums)

### نظام التصميم (Command Deck)
- ثيم داكن افتراضي: خلفية `#0B1120`، سطح `#131C2E`
- اللون الأساسي: `#F2A024` (كهرماني — سلطة/تأثير)
- اللون الثانوي: `#2DD4BF` (تيل — ولاء/إيجابي)
- لون التحذير: `#E5484D` (قرمزي — خطر/سلبي)
- أرقام جدولية (tabular-nums) في كل البيانات
- RTL عربي كامل + تجاوب موبايل/سطح مكتب

### حسابات الدخول
| المستخدم | كلمة المرور | الدور |
|----------|-------------|-------|
| `admin` | `Election2024!Admin` | ADMIN |
| `observer` | `Election2024!User` | OBSERVER |
| `key_user` | `Election2024!User` | KEY_USER |

### التشغيل
```bash
bun install              # تثبيت الاعتماديات
bun run db:push          # مزامنة قاعدة البيانات
bun run db:seed          # تهيئة البيانات الأولية
bun run dev              # تشغيل خادم التطوير (port 3000)
