// ====================================================================
// /api/import/bulk — استيراد بيانات من Excel
// ====================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { auditLog } from "@/lib/security";
import * as XLSX from "xlsx";

export const config = { api: { bodyParser: false } };

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

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    switch (entity) {
      case "voters": {
        for (const row of rows) {
          try {
            const phone = String(row["الهاتف"] || row["phone"] || "").trim();
            if (!phone) { skipped++; continue; }

            // البحث عن المفتاح بالكود أو الاسم
            const keyCode = String(row["كود المفتاح"] || row["المفتاح"] || row["keyCode"] || "").trim();
            let electionKey = null;
            if (keyCode) {
              electionKey = await prisma.electionKey.findUnique({ where: { keyCode } });
            }

            const existing = await prisma.voter.findFirst({ where: { phone } });
            if (existing) { skipped++; continue; }

            await prisma.voter.create({
              data: {
                firstName: String(row["الاسم الأول"] || row["firstName"] || "").trim(),
                fatherName: String(row["اسم الأب"] || row["fatherName"] || "").trim(),
                grandfatherName: String(row["اسم الجد"] || row["grandfatherName"] || "").trim(),
                fourthName: String(row["اللقب"] || row["fourthName"] || "").trim(),
                gender: row["الجنس"] === "أنثى" || row["gender"] === "female" ? "أنثى" : "ذكر",
                phone,
                birthDate: new Date("2000-01-01"),
                district: String(row["القضاء"] || row["district"] || "الغراف").trim(),
                subDistrict: String(row["الناحية"] || row["subDistrict"] || "").trim(),
                pollingCenter: String(row["مركز الاقتراع"] || row["pollingCenter"] || "").trim(),
                ballotStation: String(row["المحطة"] || row["ballotStation"] || "").trim(),
                status: row["الحالة"] === "مؤيد" || row["status"] === "SUPPORTED" ? "SUPPORTED"
                  : row["الحالة"] === "ضعيف" || row["status"] === "WEAK" ? "WEAK" : "NEUTRAL",
                keyId: electionKey?.id || "cmock00000000000000000001",
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
            const phone = String(row["الهاتف"] || row["phone"] || "").trim();
            if (!phone) { skipped++; continue; }

            const existing = await prisma.electionKey.findFirst({ where: { phone } });
            if (existing) { skipped++; continue; }

            const maxKey = await prisma.electionKey.aggregate({ _max: { keyCode: true } });
            const maxSeq = maxKey._max.keyCode ? parseInt(maxKey._max.keyCode, 10) || 0 : 0;
            const code = String(maxSeq + 1);

            await prisma.electionKey.create({
              data: {
                keyCode: code,
                firstName: String(row["الاسم الأول"] || row["firstName"] || "").trim(),
                fatherName: String(row["اسم الأب"] || row["fatherName"] || "").trim(),
                grandfatherName: String(row["اسم الجد"] || row["grandfatherName"] || "").trim(),
                fourthName: String(row["اللقب"] || row["fourthName"] || "").trim(),
                phone,
                gender: "ذكر",
                birthDate: new Date("1980-01-01"),
                education: "",
                profession: "",
                district: String(row["القضاء"] || row["district"] || "الغراف").trim(),
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
