// ====================================================================
// POST /api/import — استيراد البيانات بصيغة JSON
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(
  request: NextRequest,
  { user }: { user: any }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { type, data } = body;

    if (!type || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "يجب تحديد نوع البيانات (type) ومصفوفة البيانات (data)" },
        { status: 400 }
      );
    }

    const results = {
      total: data.length,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    switch (type) {
      case "electoral-keys": {
        for (const item of data) {
          try {
            if (!item.keyCode || !item.firstName || !item.phone) {
              results.errors.push(`مفتاح بدون بيانات كافية: ${JSON.stringify(item).slice(0, 100)}`);
              continue;
            }

            await prisma.electionKey.upsert({
              where: { keyCode: item.keyCode },
              update: {
                firstName: item.firstName,
                fatherName: item.fatherName || "",
                grandfatherName: item.grandfatherName || "",
                fourthName: item.fourthName || "",
                gender: item.gender || "ذكر",
                education: item.education || "",
                profession: item.profession || "",
                district: item.district || "الغراف",
                subDistrict: item.subDistrict || "",
                pollingCenter: item.pollingCenter || "",
                supportedVotes: item.supportedVotes || 0,
                neutralVotes: item.neutralVotes || 0,
                weakVotes: item.weakVotes || 0,
                totalVotes: item.totalVotes || 0,
              },
              create: {
                keyCode: item.keyCode,
                firstName: item.firstName,
                fatherName: item.fatherName || "",
                grandfatherName: item.grandfatherName || "",
                fourthName: item.fourthName || "",
                gender: item.gender || "ذكر",
                birthDate: item.birthDate ? new Date(item.birthDate) : new Date("1990-01-01"),
                education: item.education || "",
                profession: item.profession || "",
                phone: item.phone,
                district: item.district || "الغراف",
                subDistrict: item.subDistrict || "",
                pollingCenter: item.pollingCenter || "",
                supportedVotes: item.supportedVotes || 0,
                neutralVotes: item.neutralVotes || 0,
                weakVotes: item.weakVotes || 0,
                totalVotes: item.totalVotes || 0,
              },
            });
            results.created++;
          } catch (err) {
            results.errors.push(`خطأ في المفتاح ${item.keyCode}: ${(err as Error).message}`);
          }
        }
        break;
      }

      case "tribes": {
        for (const item of data) {
          try {
            if (!item.name) {
              results.errors.push(`عشيرة بدون اسم`);
              continue;
            }

            await prisma.tribe.upsert({
              where: { name: item.name },
              update: {
                district: item.district,
                influenceRating: item.influenceRating || 3,
                population: item.population,
                notes: item.notes,
              },
              create: {
                name: item.name,
                district: item.district,
                influenceRating: item.influenceRating || 3,
                population: item.population,
                notes: item.notes,
              },
            });
            results.created++;
          } catch (err) {
            results.errors.push(`خطأ في العشيرة ${item.name}: ${(err as Error).message}`);
          }
        }
        break;
      }

      case "commission-data": {
        for (const item of data) {
          try {
            await prisma.commissionData.upsert({
              where: {
                pollingCenter_ballotStation: {
                  pollingCenter: item.pollingCenter,
                  ballotStation: item.ballotStation,
                },
              },
              update: {
                registeredVoters: item.registeredVoters,
                historicalTurnout: item.historicalTurnout || 0,
                expectedTurnout: item.expectedTurnout,
              },
              create: {
                province: item.province || "ذي قار",
                district: item.district || "",
                subDistrict: item.subDistrict || "",
                pollingCenter: item.pollingCenter,
                ballotStation: item.ballotStation,
                registeredVoters: item.registeredVoters,
                historicalTurnout: item.historicalTurnout || 0,
                expectedTurnout: item.expectedTurnout,
              },
            });
            results.created++;
          } catch (err) {
            results.errors.push(`خطأ في بيانات المفوضية: ${(err as Error).message}`);
          }
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: "نوع الاستيراد غير مدعوم. الأنواع المتاحة: electoral-keys, tribes, commission-data" },
          { status: 400 }
        );
    }

    // تسجيل العملية
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "CREATE",
        entity: "Import",
        details: JSON.stringify({
          type,
          total: results.total,
          created: results.created,
          errors: results.errors.length,
        }),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "حدث خطأ في استيراد البيانات" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
