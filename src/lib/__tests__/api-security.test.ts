import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as getConfidenceLog, POST as postConfidenceLog } from "../../app/api/voters/[id]/confidence-log/route";
import { POST as evaluateKey } from "../../app/api/electoral-keys/[id]/evaluate/route";
import { POST as simulateKey } from "../../app/api/electoral-keys/[id]/simulate/route";
import { POST as checkinVoter } from "../../app/api/voters/checkin/route";
import { GET as getVoters } from "../../app/api/voters/route";
import { prisma } from "../prisma";
import { verifyToken } from "../auth";

// Mock prisma and auth
vi.mock("../prisma", () => ({
  prisma: {
    voter: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    electionKey: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    confidenceLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((x) => Promise.all(x)),
  },
}));

vi.mock("../auth", () => ({
  verifyToken: vi.fn(),
}));

describe("ثغرات التحكم بالوصول (IDOR) لـ KEY_USER", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNextRequest = (url: string, cookies: Record<string, string>, body?: any) => {
    const init: any = {
      method: body ? "POST" : "GET",
      headers: {
        "content-type": "application/json",
      },
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    const req = new NextRequest(url, init);
    // Mock cookies
    Object.defineProperty(req, "cookies", {
      value: {
        get: (name: string) => (cookies[name] ? { value: cookies[name] } : null),
      },
      writable: true,
    });
    return req;
  };

  describe("سجل الثقة للناخبين (Voters Confidence Log)", () => {
    it("يجب أن يرفض KEY_USER إذا كان الناخب لا ينتمي لمفتاحه (GET)", async () => {
      // Mock user authentication as KEY_USER
      (verifyToken as any).mockResolvedValue({
        userId: "user_key_1",
        username: "07701234567",
        role: "KEY_USER",
        isOwner: false,
      });

      // Mock User in DB to prevent MUST_CHANGE_PWD check failure
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_key_1",
        role: "KEY_USER",
        mustChangePwd: false,
      });

      // Mock voter belonging to a different keyId
      (prisma.voter.findUnique as any).mockResolvedValue({
        id: "voter_1",
        keyId: "key_other",
      });

      // Mock key matching the KEY_USER's phone
      (prisma.electionKey.findFirst as any).mockResolvedValue({
        id: "key_own",
        phone: "07701234567",
      });

      const req = mockNextRequest("http://localhost/api/voters/voter_1/confidence-log", {
        election_auth: "valid-jwt",
      });

      const context = { params: Promise.resolve({ id: "voter_1" }) };
      const res = await getConfidenceLog(req, context);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("غير مصرح");
    });

    it("يجب أن يرفض KEY_USER إذا كان الناخب لا ينتمي لمفتاحه (POST)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_key_1",
        username: "07701234567",
        role: "KEY_USER",
        isOwner: false,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_key_1",
        role: "KEY_USER",
        mustChangePwd: false,
      });

      (prisma.voter.findUnique as any).mockResolvedValue({
        id: "voter_1",
        keyId: "key_other",
        confidenceScore: 50,
      });

      (prisma.electionKey.findFirst as any).mockResolvedValue({
        id: "key_own",
        phone: "07701234567",
      });

      const req = mockNextRequest(
        "http://localhost/api/voters/voter_1/confidence-log",
        { election_auth: "valid-jwt" },
        { newScore: 80, reason: "Test update" }
      );

      const context = { params: Promise.resolve({ id: "voter_1" }) };
      const res = await postConfidenceLog(req, context);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("غير مصرح");
    });
  });

  describe("تقييم المفتاح الانتخابي (Evaluate Election Key)", () => {
    it("يجب أن يرفض KEY_USER إذا حاول تقييم مفتاح غير هاتف حسابه (POST)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_key_1",
        username: "07701234567",
        role: "KEY_USER",
        isOwner: false,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_key_1",
        role: "KEY_USER",
        mustChangePwd: false,
      });

      // Mock electionKey belonging to a different phone
      (prisma.electionKey.findUnique as any).mockResolvedValue({
        id: "key_other_id",
        phone: "07709999999", // Different phone
        supportedVotes: 10,
        neutralVotes: 5,
        weakVotes: 2,
        totalVotes: 17,
        loyaltyScore: 3,
        influenceLevel: 3,
        mobilizationCap: 3,
        voteProtection: 3,
        supportReason: 3,
        needsLevel: 3,
        politicalNote: 3,
        organizationalNote: 3,
        generalNote: 3,
      });

      const req = mockNextRequest(
        "http://localhost/api/electoral-keys/key_other_id/evaluate",
        { election_auth: "valid-jwt" },
        {}
      );

      const context = { params: Promise.resolve({ id: "key_other_id" }) };
      const res = await evaluateKey(req, context);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("غير مصرح");
    });
  });

  describe("محاكاة المفتاح الانتخابي (Simulate Election Key)", () => {
    it("يجب أن يرفض KEY_USER إذا حاول محاكاة مفتاح غير هاتف حسابه (POST)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_key_1",
        username: "07701234567",
        role: "KEY_USER",
        isOwner: false,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_key_1",
        role: "KEY_USER",
        mustChangePwd: false,
      });

      (prisma.electionKey.findUnique as any).mockResolvedValue({
        id: "key_other_id",
        phone: "07709999999", // Different phone
      });

      const req = mockNextRequest(
        "http://localhost/api/electoral-keys/key_other_id/simulate",
        { election_auth: "valid-jwt" },
        { overrides: {} }
      );

      const context = { params: Promise.resolve({ id: "key_other_id" }) };
      const res = await simulateKey(req, context);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("غير مصرح");
    });
  });

  describe("تسجيل حضور الناخبين (Voters Checkin)", () => {
    it("يجب أن يرفض KEY_USER إذا كان الناخب المراد تسجيل حضوره لا ينتمي لمفتاحه (POST)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_key_1",
        username: "07701234567",
        role: "KEY_USER",
        isOwner: false,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_key_1",
        role: "KEY_USER",
        mustChangePwd: false,
      });

      (prisma.voter.findUnique as any).mockResolvedValue({
        id: "voter_1",
        keyId: "key_other",
        votedOnDay: false,
      });

      (prisma.electionKey.findFirst as any).mockResolvedValue({
        id: "key_own",
        phone: "07701234567",
      });

      const req = mockNextRequest(
        "http://localhost/api/voters/checkin",
        { election_auth: "valid-jwt" },
        { voterId: "voter_1" }
      );

      const res = await checkinVoter(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("غير مصرح");
    });
  });

  describe("قناع البيانات للناخبين (Voters PII Masking)", () => {
    it("يجب قناع nationalId وهاتف الناخب لـ OBSERVER (GET)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_obs_1",
        username: "observer",
        role: "OBSERVER",
        isOwner: false,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_obs_1",
        role: "OBSERVER",
        mustChangePwd: false,
      });

      (prisma.voter.findMany as any).mockResolvedValue([
        {
          id: "voter_1",
          firstName: "احمد",
          fatherName: "علي",
          grandfatherName: "حسين",
          fourthName: "عريبي",
          gender: "ذكر",
          phone: "07701111111",
          nationalId: "1234567890",
          district: "الناصرية",
          subDistrict: "الغراف",
          pollingCenter: "مركز 1",
          ballotStation: "محطة 2",
          status: "SUPPORTED",
          supportDegree: 4,
          votedOnDay: false,
          checkedIn: false,
          createdAt: new Date(),
        },
      ]);
      (prisma.voter.count as any).mockResolvedValue(1);

      const req = mockNextRequest("http://localhost/api/voters", {
        election_auth: "valid-jwt",
      });

      const res = await getVoters(req, {});
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.voters[0].nationalId).toBe("***");
      expect(data.voters[0].phone).toBe("077****111");
    });

    it("يجب إظهار nationalId وهاتف الناخب لـ ADMIN كاملة (GET)", async () => {
      (verifyToken as any).mockResolvedValue({
        userId: "user_admin_1",
        username: "admin",
        role: "ADMIN",
        isOwner: true,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user_admin_1",
        role: "ADMIN",
        mustChangePwd: false,
      });

      (prisma.voter.findMany as any).mockResolvedValue([
        {
          id: "voter_1",
          firstName: "احمد",
          fatherName: "علي",
          grandfatherName: "حسين",
          fourthName: "عريبي",
          gender: "ذكر",
          phone: "07701111111",
          nationalId: "1234567890",
          district: "الناصرية",
          subDistrict: "الغراف",
          pollingCenter: "مركز 1",
          ballotStation: "محطة 2",
          status: "SUPPORTED",
          supportDegree: 4,
          votedOnDay: false,
          checkedIn: false,
          createdAt: new Date(),
        },
      ]);
      (prisma.voter.count as any).mockResolvedValue(1);

      const req = mockNextRequest("http://localhost/api/voters", {
        election_auth: "valid-jwt",
      });

      const res = await getVoters(req, {});
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.voters[0].nationalId).toBe("1234567890");
      expect(data.voters[0].phone).toBe("07701111111");
    });
  });
});
