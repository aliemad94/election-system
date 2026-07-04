// ====================================================================
// /api/import/bulk — استيراد بيانات من Excel
// ====================================================================
import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
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

async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const entity = formData.get("entity") as string || "voters";

    if (!file) {
      return NextResponse.json({ error: "يرجى رفع ملف Excel" }, { status: 400 });
    }

    // === تحقق أمني من الملف المرفوع ===
    // 1. فحص الامتداد
    const fileName = file.name?.toLowerCase() ?? "";
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. يُقبل فقط .xlsx أو .xls أو .csv" },
        { status: 400 }
      );
    }

    // 2. فحص حجم الملف (حد أقصى 10 ميغابايت)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف (${(file.size / 1024 / 1024).toFixed(1)}MB) يتجاوز الحد المسموح (10MB)` },
        { status: 400 }
      );
    }

    // 3. فحص MIME type
    const allowedMimes = new Set([
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv",
      "application/octet-stream", // بعض المتصفحات ترسل هذا
    ]);
    if (file.type && !allowedMimes.has(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف (${file.type}) غير مدعوم` },
        { status: 400 }
      );
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
        // تجميع كل أرقام الهواتف الفريدة من الملف المرفوع دفعة واحدة
        const phoneList = Array.from(new Set(rows
          .map(row => clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone))
          .filter(p => p.length > 0)
        ));

        // الاستعلام مرة واحدة في قاعدة البيانات لمعرفة الأرقام المسجلة مسبقاً
        const existingVoters = await prisma.voter.findMany({
          where: { phone: { in: phoneList } },
          select: { phone: true }
        });
        const existingPhones = new Set(existingVoters.map(v => v.phone));
        const localPhones = new Set<string>();

        // الاستعلام المسبق عن كافة رموز المفاتيح المستخدمة في الملف
        const keyCodes = Array.from(new Set(rows
          .map(row => clamp(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"], FIELD_LIMITS.code))
          .filter(c => c.length > 0)
        ));
        
        const dbKeys = await prisma.electionKey.findMany({
          where: { keyCode: { in: keyCodes } },
          select: { id: true, keyCode: true }
        });
        const keyMap = new Map(dbKeys.map(k => [k.keyCode, k.id]));

        const toInsert: any[] = [];

        for (const row of rows) {
          try {
            const phone = clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone);
            if (!phone) { skipped++; continue; }

            // التحقق من التكرار المزدوج (قاعدة البيانات + داخل الملف نفسه)
            if (existingPhones.has(phone) || localPhones.has(phone)) {
              skipped++;
              continue;
            }

            const keyCode = clamp(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"], FIELD_LIMITS.code);
            const rawKeyCode = String(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"] || "").trim();
            
            let keyId = "";
            if (rawKeyCode) {
              const matchedId = keyMap.get(keyCode);
              if (!matchedId) {
                errors.push(`صف ${toInsert.length + skipped + 1}: كود المفتاح "${rawKeyCode}" غير موجود في النظام`);
                skipped++;
                continue;
              }
              keyId = matchedId;
            }

            const rawStatus = row["الحالة"] || row["status"];
            const status =
              rawStatus === "مؤيد" || rawStatus === "SUPPORTED" ? "SUPPORTED"
              : rawStatus === "ضعيف" || rawStatus === "WEAK" ? "WEAK"
              : "NEUTRAL";

            toInsert.push({
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
              keyId,
            });
            localPhones.add(phone);
          } catch (e: any) {
            errors.push(`صف ${toInsert.length + skipped + 1}: ${e.message?.substring(0, 60)}`);
            skipped++;
          }
        }

        // الإدخال الجماعي على دفعات (Chunks) من 500 صف
        const chunkSize = 500;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          const chunk = toInsert.slice(i, i + chunkSize);
          await prisma.voter.createMany({ data: chunk });
          created += chunk.length;
        }
        break;
      }

      case "keys": {
        const phoneList = Array.from(new Set(rows
          .map(row => clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone))
          .filter(p => p.length > 0)
        ));

        // الاستعلام الجماعي عن أرقام هواتف المفاتيح الموجودة مسبقاً
        const existingKeys = await prisma.electionKey.findMany({
          where: { phone: { in: phoneList } },
          select: { phone: true }
        });
        const existingPhones = new Set(existingKeys.map(k => k.phone));
        const localPhones = new Set<string>();

        // جلب أعلى رقم متسلسل لـ keyCode دفعة واحدة لبدء الترقيم التلقائي بالذاكرة
        const maxKey = await prisma.electionKey.aggregate({ _max: { keyCode: true } });
        let maxSeq = maxKey._max.keyCode ? parseInt(maxKey._max.keyCode, 10) || 0 : 0;

        const toInsert: any[] = [];

        for (const row of rows) {
          try {
            const phone = clamp(row["الهاتف"] || row["phone"], FIELD_LIMITS.phone);
            if (!phone) { skipped++; continue; }

            if (existingPhones.has(phone) || localPhones.has(phone)) {
              skipped++;
              continue;
            }

            maxSeq++;
            const code = String(maxSeq);

            toInsert.push({
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
            });
            localPhones.add(phone);
          } catch (e: any) {
            errors.push(`صف ${toInsert.length + skipped + 1}: ${e.message?.substring(0, 60)}`);
            skipped++;
          }
        }

        // الإدخال الجماعي على دفعات (Chunks) من 500 صف
        const chunkSize = 500;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          const chunk = toInsert.slice(i, i + chunkSize);
          await prisma.electionKey.createMany({ data: chunk });
          created += chunk.length;
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
