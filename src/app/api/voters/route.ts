import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const tribeId = searchParams.get('tribeId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const keyId = searchParams.get('keyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, any> = {};

    if (district) where.district = district;
    if (tribeId) where.tribeId = tribeId;
    if (status) where.status = status;
    if (keyId) where.keyId = keyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { fatherName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [voters, total] = await Promise.all([
      db.voter.findMany({
        where,
        include: {
          electionKey: { select: { id: true, keyCode: true, firstName: true, fatherName: true } },
          tribe: true,
          subTribe: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.voter.count({ where }),
    ]);

    // For frontend compatibility, map fields like fullName and phoneNumber
    const mappedVoters = voters.map((v) => ({
      ...v,
      fullName: `${v.firstName} ${v.fatherName} ${v.grandfatherName} ${v.fourthName}`.trim(),
      phoneNumber: v.phone,
      nickname: v.tribe?.name || 'غير محدد',
    }));

    return NextResponse.json({ voters: mappedVoters, total, page, limit });
  } catch (error) {
    console.error('Error fetching voters:', error);
    return NextResponse.json({ error: 'فشل في جلب الناخبين' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName, fatherName, grandfatherName, fourthName,
      tribe, gender, birthDate, phone, education, profession,
      province, district, subDistrict, pollingCenter, ballotStation,
      status, supportDegree, supportReason, voterCategory, conversionPath,
      keyId, relationship, influenceRate, isPrimaryFollow,
      lastContactDate, contactResult, nextAction, followUpDate,
      tribeId, subTribeId,
      maritalStatus, familySize, nationalId, area, socialMedia, firstContactDate
    } = body;

    const resolvedKeyId = keyId || body.electoralKeyId;
    if (!resolvedKeyId) {
      return NextResponse.json({ error: 'المفتاح الانتخابي المسؤول مطلوب' }, { status: 400 });
    }

    // Handle tribe resolve
    let resolvedTribeId = tribeId || null;
    if (!resolvedTribeId && tribe) {
      const foundTribe = await db.tribe.findUnique({ where: { name: tribe } });
      if (foundTribe) {
        resolvedTribeId = foundTribe.id;
      } else {
        const newTribe = await db.tribe.create({ data: { name: tribe } });
        resolvedTribeId = newTribe.id;
      }
    }

    // Resolve date and JSON fields
    const parsedBirthDate = birthDate || body.dateOfBirth ? new Date(birthDate || body.dateOfBirth) : new Date();
    const resolvedPhone = phone || body.phoneNumber || null;
    const resolvedEducation = education || body.educationLevel || null;
    
    let parsedSocialMedia = null;
    if (socialMedia) {
      try {
        parsedSocialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
      } catch (e) {
        console.error('Failed to parse social media JSON:', e);
      }
    }

    const voter = await db.voter.create({
      data: {
        firstName,
        fatherName,
        grandfatherName,
        fourthName,
        gender: gender || body.gender || 'ذكر',
        birthDate: parsedBirthDate,
        phone: resolvedPhone,
        education: resolvedEducation,
        profession: profession || null,
        maritalStatus: maritalStatus || body.maritalStatus || null,
        familySize: familySize !== undefined ? Number(familySize) : (body.familySize !== undefined ? Number(body.familySize) : null),
        nationalId: nationalId || body.nationalId || null,
        area: area || body.area || null,
        socialMedia: parsedSocialMedia ?? undefined,
        firstContactDate: firstContactDate ? new Date(firstContactDate) : (body.firstContactDate ? new Date(body.firstContactDate) : null),
        province: province || 'ذي قار',
        district: district || 'الغراف',
        subDistrict: subDistrict || 'المركز',
        pollingCenter: pollingCenter || body.pollingCenterName || 'مدرسة العراق الابتدائية',
        ballotStation: ballotStation || body.pollingCenterId || 'محطة رقم 1',
        status: status || (voterCategory === 'مؤيد' ? 'SUPPORTIVE' : voterCategory === 'ضعيف' ? 'OPPOSED' : 'NEUTRAL'),
        supportDegree: supportDegree !== undefined ? Number(supportDegree) : (body.confidenceScore ? Number(body.confidenceScore) : 3),
        supportReason: supportReason || null,
        voterCategory: voterCategory || body.voterCategory || 'محايد',
        conversionPath: conversionPath || null,
        votedOnDay: false,
        keyId: resolvedKeyId,
        relationship: relationship || null,
        influenceRate: influenceRate !== undefined ? Number(influenceRate) : 50,
        isPrimaryFollow: isPrimaryFollow !== undefined ? Boolean(isPrimaryFollow) : true,
        lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
        contactResult: contactResult || null,
        nextAction: nextAction || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        tribeId: resolvedTribeId,
        subTribeId: subTribeId || null,
        latitude: body.latitude !== undefined && body.latitude !== null ? Number(body.latitude) : null,
        longitude: body.longitude !== undefined && body.longitude !== null ? Number(body.longitude) : null,
        gpsVerified: body.gpsVerified !== undefined ? Boolean(body.gpsVerified) : false,
        isRegistryVerified: body.isRegistryVerified !== undefined ? Boolean(body.isRegistryVerified) : false,
        registryVoterId: body.registryVoterId || null,
      },
      include: {
        electionKey: { select: { id: true, keyCode: true, firstName: true, fatherName: true } },
        tribe: true,
        subTribe: true,
      },
    });

    const mapped = {
      ...voter,
      fullName: `${voter.firstName} ${voter.fatherName} ${voter.grandfatherName} ${voter.fourthName}`.trim(),
      phoneNumber: voter.phone,
      nickname: (voter as any).tribe?.name || 'غير محدد',
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error('Error creating voter:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الناخب' }, { status: 500 });
  }
}
