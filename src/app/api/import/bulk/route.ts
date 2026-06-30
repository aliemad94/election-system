// ====================================================================
// /api/import/bulk — استيراد بيانات من Excel
// ====================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { auditLog } from "@/lib/security";
import * as XLSX from "xlsx";

export const config = { api: { bodyParser: false } };

// سقف لعدد الصفوف لمنع إرهاق قاعدة البيانات وهجمات الفيضان.
const MAX_IMPORT_ROWS = 5000;
// حدود طول الحقول النصية (تتطابق مع قيود Zod في validators.ts).
const FIELD_LIMITS = { name: 100, phone: 50, district: 100, code: 50 } as const;
// قيم status المسموح بها فقط (تتطابق مع z.enum في createVoterSchema).
const ALLOWED_STATUS = new Set(["SUPPORTED", "NEUTRAL", "WEAK"]);

function clamp(str: unknown, max: number): string {
  const s = String(str ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const entity = formData.get("entity") as string || "voters";

    if (!file) {
      return NextResponse.json({ error: "يرجى رفع ملف Excel" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    if (rows.length === 0) {
      return NextResponse.json({ error: "الملف فارغ" }, { status: 400 });
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `تجاوز عدد الصفوف الحد المسموح (${MAX_IMPORT_ROWS}). يحتوي الملف على ${rows.length} صف.` },
        { status: 400 }
      );
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    switch (entity) {
      case "voters": {
        for (const row of rows) {
          try {
            const phone = clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone);
            if (!phone) { skipped++; continue; }

            // البحث عن المفتاح بالكود أو الاسم
            const keyCode = clamp(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"], FIELD_LIMITS.code);
            let electionKey = null;
            if (keyCode) {
              electionKey = await prisma.electionKey.findUnique({ where: { keyCode } });
            }
            // إن أُعطي كود مفتاح لكنه غير موجود، نتجاهل الصف بدل إسناده لمفتاح وهمي
            // (cmock...) يُيتم الناخب تحت مفتاح مزيف — يخالف سلامة البيانات.
            const rawKeyCode = String(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"] || "").trim();
            if (rawKeyCode && !electionKey) {
              errors.push(`صف ${created + skipped + 1}: كود المفتاح "${rawKeyCode}" غير موجود في النظام`);
              skipped++;
              continue;
            }

            const existing = await prisma.voter.findFirst({ where: { phone } });
            if (existing) { skipped++; continue; }

            // قصر status على القيم المسموحة فقط (تتطابق مع z.enum).
            const rawStatus = row["الحالة"] || row["status"];
            const status =
              rawStatus === "مؤيد" || rawStatus === "SUPPORTED" ? "SUPPORTED"
              : rawStatus === "ضعيف" || rawStatus === "WEAK" ? "WEAK"
              : "NEUTRAL";

            await prisma.voter.create({
              data: {
                firstName: clamp(row["الاسم الأول"] || row["firstName"], FIELD_LIMITS.name),
                fatherName: clamp(row["اسم الأب"] || row["fatherName"], FIELD_LIMITS.name),
                grandfatherName: clamp(row["اسم الجد"] || row["grandfatherName"], FIELD_LIMITS.name),
                fourthName: clamp(row["اللقب"] || row["fourthName"], FIELD_LIMITS.name),
                gender: row["الجنس"] === "أنثى" || row["gender"] === "female" ? "أنثى" : "ذكر",
                phone,
                birthDate: new Date("2000-01-01"),
                district: clamp(row["القضاء"] || row["district"] || "الغراف", FIELD_LIMITS.district),
                subDistrict: clamp(row["الناحية"] || row["subDistrict"], FIELD_LIMITS.district),
                pollingCenter: clamp(row["مركز الاقتراع"] || row["pollingCenter"], FIELD_LIMITS.district),
                ballotStation: clamp(row["المحطة"] || row["ballotStation"], FIELD_LIMITS.district),
                status,
                // keyId: مفتاح فعلي موجود، أو '' (ناخب غير مرتبط) — نتّبع نمط voters/route.ts، لا قيم وهمية cmock.
                keyId: electionKey?.id ?? "",
              },
            });
            created++;
          } catch (e: any) {
            errors.push(`صف ${created + skipped + 1}: ${e.message?.substring(0, 60)}`);
            skipped++;
          }
        }
        break;
      }

      case "keys": {
        for (const row of rows) {
          try {
            const phone = clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone);
            if (!phone) { skipped++; continue; }

            const existing = await prisma.electionKey.findFirst({ where: { phone } });
            if (existing) { skipped++; continue; }

            const maxKey = await prisma.electionKey.aggregate({ _max: { keyCode: true } });
            const maxSeq = maxKey._max.keyCode ? parseInt(maxKey._max.keyCode, 10) || 0 : 0;
            const code = String(maxSeq + 1);

            await prisma.electionKey.create({
              data: {
                keyCode: code,
                firstName: clamp(row["الاسم الأول"] || row["firstName"], FIELD_LIMITS.name),
                fatherName: clamp(row["اسم الأب"] || row["fatherName"], FIELD_LIMITS.name),
                grandfatherName: clamp(row["اسم الجد"] || row["grandfatherName"], FIELD_LIMITS.name),
                fourthName: clamp(row["اللقب"] || row["fourthName"], FIELD_LIMITS.name),
                phone,
                gender: "ذكر",
                birthDate: new Date("1980-01-01"),
                education: "",
                profession: "",
                district: clamp(row["القضاء"] || row["district"] || "الغراف", FIELD_LIMITS.district),
                subDistrict: "",
                pollingCenter: "",
                loyaltyScore: Number(row["مستوى الولاء"] || row["loyaltyLevel"] || 3),
                influenceLevel: Number(row["مستوى التأثير"] || row["influenceLevel"] || 3),
                mobilizationCap: Number(row["القدرة على التحشيد"] || row["mobilizationCap"] || 3),
              },
            });
            created++;
          } catch (e: any) {
            errors.push(`صف ${created + skipped + 1}: ${e.message?.substring(0, 60)}`);
            skipped++;
          }
        }
        break;
      }

      default:
        return NextResponse.json({ error: "نوع الكيان غير مدعوم للاستيراد" }, { status: 400 });
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: `BulkImport_${entity}`,
      entityId: `batch_${Date.now()}`,
      details: { created, skipped, errorsCount: errors.length, fileName: file.name },
    });

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "فشل الاستيراد" }, { status: 500 });
  }
}

export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });
