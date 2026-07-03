const { z } = require('zod');

const schema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(100),
  gender: z.enum(["ذكر", "أنثى"]).default("ذكر"),
  expectedVotes: z.number().default(0),
  influenceLevel: z.number().int().min(1).max(5).default(3),
  email: z.string().email().optional().nullable().or(z.literal("")),
  familySize: z.number().int().optional().nullable(),
});

function check(payload) {
  const res = schema.safeParse(payload);
  if (!res.success) {
    console.log("Payload:", payload);
    console.log("Error message:", res.error.issues[0].message);
    console.log("Error code:", res.error.issues[0].code);
    console.log("------------------------");
  }
}

check({ firstName: '' }); // الاسم الأول مطلوب
check({ firstName: 'علي', gender: 'other' }); // Invalid enum value
check({ firstName: 'علي', expectedVotes: '10' }); // Expected number, received string
check({ firstName: 'علي', influenceLevel: 6 }); // Number must be less than or equal to 5
check({ firstName: 'علي', influenceLevel: 3.5 }); // Expected integer, received float
check({ firstName: 'علي', email: 'not-an-email' }); // Invalid email address
check({ firstName: 'علي', email: 123 }); // Invalid input
check({ firstName: 'علي', familySize: 'abc' }); // Expected number, received string
check({ firstName: 'علي', familySize: 3.5 }); // Expected integer, received float
