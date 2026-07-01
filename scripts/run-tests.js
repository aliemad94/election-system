#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//  run-tests.js — حزمة الفحوصات الشاملة الآلية لمنظومة الماكينة الانتخابية
//  Automated test suite for the Electoral Machine System
// ════════════════════════════════════════════════════════════════════
//
//  الاستخدام (Usage):
//    node scripts/run-tests.js                 # فحص نظامي فقط (لا يحتاج خادماً)
//    node scripts/run-tests.js --live          # فحص كامل + فحص حي (يتطلب npm run dev يعمل)
//    node scripts/run-tests.js --live --keep   # لا توقف الخادم في النهاية
//
//  المتطلبات (Prerequisites):
//    - node_modules مثبّتة
//    - لوضع --live: الخادم يعمل على http://localhost:3000 (شغّل npm run dev أولاً)
//    - لوضع --live: قاعدة بيانات محلية مزروعة (db/local.db)
//
//  ملاحظة: السكربت للقراءة/الفحص فقط — لا يُعدّل أي ملف مصدر.
// ════════════════════════════════════════════════════════════════════

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "http://localhost:3000";
const SQLITE_SCHEMA = "prisma/schema.sqlite.prisma";
const ADMIN_COOKIE = path.join(require("os").tmpdir(), "election-admin.txt");
const USER_COOKIE = path.join(require("os").tmpdir(), "election-user.txt");

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const KEEP_SERVER = args.includes("--keep");

// عدّادات النتائج
let passCount = 0;
let failCount = 0;
let warnCount = 0;
const findings = []; // {severity, title, detail}

// ════════════════════════════════════════════════════════════════════
// أدوات مساعدة
// ════════════════════════════════════════════════════════════════════

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function section(title) {
  console.log(`\n${BOLD}${CYAN}══════ ${title} ══════${RESET}`);
}

function ok(msg) {
  passCount++;
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function fail(msg) {
  failCount++;
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

function warn(msg) {
  warnCount++;
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
}

function info(msg) {
  console.log(`  ${CYAN}ℹ${RESET} ${msg}`);
}

// تشغيل أمر وإرجاع الإخراج (يتحمل الأخطاء)
function run(cmd, opts = {}) {
  try {
    return {
      stdout: execSync(cmd, {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 180000,
        ...opts,
      }),
      status: 0,
    };
  } catch (e) {
    return { stdout: e.stdout || e.message, stderr: e.stderr || "", status: e.status || 1 };
  }
}

// طلب HTTP بسيط عبر node http (لا يعتمد curl)
function httpReq(method, urlPath, { headers = {}, body = null, cookieFile = null } = {}) {
  return new Promise((resolve) => {
    // اقرأ الكوكي من الملف إن وُجد (صيغة بسيطة: election_auth=VALUE)
    let cookieHeader = headers["Cookie"] || "";
    if (cookieFile && fs.existsSync(cookieFile)) {
      const txt = fs.readFileSync(cookieFile, "utf8");
      const m = txt.match(/election_auth=([^\s;]+)/);
      if (m) cookieHeader = `election_auth=${m[1]}`;
    }
    const finalHeaders = { ...headers };
    if (cookieHeader) finalHeaders["Cookie"] = cookieHeader;
    if (body) finalHeaders["Content-Type"] = "application/json";

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: urlPath,
        method,
        headers: finalHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: data, headers: res.headers })
        );
      }
    );
    req.on("error", () => resolve({ status: 0, body: "", headers: {} }));
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

// حفظ كوكي Set-Cookie إلى ملف (صيغة بسيطة: election_auth=VALUE)
function saveCookie(setCookieHeader, file) {
  // set-cookie قد يكون string أو array (Node يجمع تكراراته)
  const raw = Array.isArray(setCookieHeader)
    ? setCookieHeader.join("; ")
    : String(setCookieHeader || "");
  if (!raw) return;
  const m = raw.match(/election_auth=([^;]+)/);
  if (m) {
    fs.writeFileSync(file, `election_auth=${m[1]}`, "utf8");
  }
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 0: التجهيز
// ════════════════════════════════════════════════════════════════════

async function setup() {
  section("المرحلة 0: التجهيز (Setup)");

  if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
    fail("node_modules غير موجود — شغّل npm install أولاً");
    return false;
  }
  ok("node_modules موجود");

  if (LIVE) {
    const health = await httpReq("GET", "/api/health");
    if (health.status === 0) {
      fail(`الخادم لا يعمل على ${BASE_URL} — شغّل: npm run dev`);
      return false;
    }
    try {
      const j = JSON.parse(health.body);
      if (j.database === "connected") ok("الخادم يعمل وقاعدة البيانات متصلة");
      else {
        warn(`الخادم يعمل لكن قاعدة البيانات: ${j.database}`);
        if (j.error) info(`الخطأ: ${String(j.error).substring(0, 100)}`);
      }
    } catch {
      fail("نقطة الصحة لا تُرجع JSON صالح");
      return false;
    }

    // تجهيز جلسات المصادقة
    const adminLogin = await httpReq("POST", "/api/access", {
      body: JSON.stringify({
        action: "owner-login",
        ownerPassword: process.env.ADMIN_PASSWORD || "LocalAdminDev2026!",
      }),
    });
    saveCookie(adminLogin.headers["set-cookie"], ADMIN_COOKIE);

    const userLogin = await httpReq("POST", "/api/access", {
      body: JSON.stringify({
        action: "login",
        password: process.env.USER_PASSWORD || "LocalUserDev2026!",
      }),
    });
    saveCookie(userLogin.headers["set-cookie"], USER_COOKIE);

    // تحقق من الجلسات
    const me = await httpReq("GET", "/api/me", { cookieFile: ADMIN_COOKIE });
    if (me.status === 200) ok("جلسة ADMIN جاهزة");
    else fail(`فشل تجهيز جلسة ADMIN (HTTP ${me.status})`);

    const meUser = await httpReq("GET", "/api/me", { cookieFile: USER_COOKIE });
    if (meUser.status === 200) ok("جلسة OBSERVER جاهزة");
    else fail(`فشل تجهيز جلسة OBSERVER (HTTP ${meUser.status})`);
  } else {
    info("وضع الفحص النظامي فقط (للفحص الحي أضف --live)");
  }

  return true;
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 1: الفحوصات النظامية
// ════════════════════════════════════════════════════════════════════

function phase1Static() {
  section("المرحلة 1: الفحوصات النظامية (Static Analysis)");

  // 1.1 TypeScript
  info("tsc --noEmit ...");
  const tsc = run("npx tsc --noEmit");
  if (tsc.status === 0) ok("TypeScript: صفر أخطاء");
  else {
    fail(`TypeScript: أخطاء موجودة`);
    findings.push({
      severity: "high",
      title: "أخطاء أنواع TypeScript",
      detail: tsc.stdout.split("\n").slice(0, 5).join("\n"),
    });
  }

  // 1.2 ESLint
  info("eslint ...");
  const lint = run("npx eslint .", { encoding: "utf8" });
  const lintOut = lint.stdout + (lint.stderr || "");
  const errMatches = (lintOut.match(/\d+ error/g) || []);
  const warnMatches = (lintOut.match(/\d+ warning/g) || []);
  const errCount = errMatches.length ? parseInt(errMatches[0]) : (tsc.status === 0 && lint.status <= 1 ? 0 : "?");
  const warnCount = warnMatches.length ? parseInt(warnMatches[0]) : 0;
  if (lint.status === 0) ok(`ESLint: نظيف`);
  else {
    warn(`ESLint: ${errCount} خطأ، ${warnCount} تحذير`);
    findings.push({
      severity: "low",
      title: "تحذيرات/أخطاء ESLint",
      detail: `أغلبها غالباً react-hooks/set-state-in-effect. شغّل: npx eslint . للتفاصيل`,
    });
  }

  // 1.3 Vitest
  info("vitest run ...");
  const vitest = run("npx vitest run");
  const vOut = vitest.stdout + (vitest.stderr || "");
  const testMatch = vOut.match(/Tests\s+(\d+)\s+passed/);
  if (testMatch) ok(`Vitest: ${testMatch[1]} اختبار ناجح`);
  else {
    fail("Vitest: فشل أو لم يُشغّل");
    findings.push({
      severity: "high",
      title: "اختبارات الوحدة تفشل",
      detail: "شغّل: npx vitest run لرؤية التفاصيل",
    });
  }

  // 1.4 Prisma validate
  info("prisma validate ...");
  const env = { ...process.env, DATABASE_URL: "file:./db/local.db" };
  const prisma = run(
    `npx prisma validate --schema=${SQLITE_SCHEMA}`,
    { env }
  );
  if (prisma.stdout.includes("is valid")) ok("Prisma schema: صالح");
  else fail("Prisma schema: غير صالح");

  // 1.5 npm audit
  info("npm audit ...");
  const audit = run("npm audit --json", { encoding: "utf8" });
  try {
    const a = JSON.parse(audit.stdout || "{}");
    const meta = a.metadata && a.metadata.vulnerabilities;
    if (meta) {
      const total =
        (meta.critical || 0) +
        (meta.high || 0) +
        (meta.moderate || 0) +
        (meta.low || 0);
      if (total === 0) ok("npm audit: صفر ثغرات");
      else {
        warn(
          `npm audit: ${total} ثغرة (critical:${meta.critical || 0} high:${meta.high || 0} moderate:${meta.moderate || 0} low:${meta.low || 0})`
        );
        findings.push({
          severity: meta.high || meta.critical ? "high" : "medium",
          title: "ثغرات في التبعيات",
          detail: `شغّل: npm audit للتفاصيل. تحقق من xlsx و next-pwa تحديداً`,
        });
      }
    }
  } catch {
    info("npm audit: تعذّر تحليل الناتج JSON");
  }
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 2: اختبار الاختراق الحي
// ════════════════════════════════════════════════════════════════════

async function phase2Pentest() {
  section("المرحلة 2: اختبار الاختراق الأمني (Pentest)");

  // 2.1 الوصول غير المصرّح
  info("2.1 الوصول غير المصرّح (يجب أن يُرفض بـ 401)");
  const protectedRoutes = [
    "/api/voters",
    "/api/electoral-keys",
    "/api/dashboard",
    "/api/me",
    "/api/cron/backup",
    "/api/comprehensive-indicators",
    "/api/reset/simulate-turnout?action=reset",
  ];
  let unauthLeaks = 0;
  for (const r of protectedRoutes) {
    const res = await httpReq("GET", r);
    if (res.status === 401 || res.status === 403) {
      // ok
    } else {
      unauthLeaks++;
      fail(`${r} → HTTP ${res.status} (المتوقع 401/403)`);
    }
  }
  if (unauthLeaks === 0)
    ok(`كل المسارات المحمية السبعة ترفض الوصول غير المصرّح`);

  // 2.2 تجاوز المصادقة
  info("2.2 محاولات تجاوز المصادقة");
  const fakeTokens = ["", "fake-token", "x-user-role:ADMIN", "admin"];
  let bypassSuccess = 0;
  for (const t of fakeTokens) {
    const res = await httpReq("GET", "/api/voters", {
      headers: { Cookie: `election_auth=${t}` },
    });
    if (res.status !== 401 && res.status !== 403) bypassSuccess++;
  }
  // حقن headers
  const headerInject = await httpReq("GET", "/api/voters", {
    headers: {
      "x-user-id": "fake",
      "x-user-role": "ADMIN",
      "x-user-name": "hacker",
    },
  });
  if (headerInject.status === 401 || headerInject.status === 403) {
    // ok
  } else bypassSuccess++;
  // JWT alg:none
  const noneJwt =
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJoYWNrZXIiLCJyb2xlIjoiQURNSU4iLCJ1c2VybmFtZSI6ImhhY2tlciJ9.";
  const jwtTest = await httpReq("GET", "/api/voters", {
    headers: { Cookie: `election_auth=${noneJwt}` },
  });
  if (jwtTest.status === 401 || jwtTest.status === 403) {
    // ok
  } else bypassSuccess++;

  if (bypassSuccess === 0)
    ok("كل محاولات التجاوز (كوكيز مزوّرة + حقن headers + JWT alg:none) صُدّت");
  else {
    fail(`${bypassSuccess} محاولة تجاوز نجحت`);
    findings.push({
      severity: "critical",
      title: "تجاوز المصادقة ممكن",
      detail: "بعض محاولات الكوكيز/الـ headers/JWT المزوّفة لم تُرفض",
    });
  }

  // 2.3 RBAC
  info("2.3 فحص RBAC والعمليات التدميرية");
  // OBSERVER يحاول الإعادة التدميرية
  const obsReset = await httpReq(
    "POST",
    "/api/reset/simulate-turnout?action=reset&confirm=CONFIRM_RESET_TURNOUT",
    { cookieFile: USER_COOKIE }
  );
  if (obsReset.status === 403) ok("OBSERVER ممنوع من الإعادة التدميرية (ADMIN فقط)");
  else {
    fail(`OBSERVER استطاع الإعادة (HTTP ${obsReset.status}) — ثغرة حرجة`);
    findings.push({
      severity: "critical",
      title: "RBAC: OBSERVER ينفّذ إعادة تدميرية",
      detail: `HTTP ${obsReset.status} — يجب أن يكون ADMIN فقط`,
    });
  }

  // ADMIN بدون تأكيد
  const adminNoConfirm = await httpReq(
    "POST",
    "/api/reset/simulate-turnout?action=reset",
    { cookieFile: ADMIN_COOKIE }
  );
  if (adminNoConfirm.status === 400)
    ok("الإعادة التدميرية تتطلب تأكيداً مزدوجاً (CONFIRM_RESET_TURNOUT)");
  else {
    fail(`الإعادة بدون تأكيد نجحت (HTTP ${adminNoConfirm.status})`);
    findings.push({
      severity: "critical",
      title: "إعادة تدميرية بدون تأكيد مزدوج",
      detail: "يجب طلب confirm=CONFIRM_RESET_TURNOUT",
    });
  }

  // GET-mutation
  const getMutate = await httpReq(
    "GET",
    "/api/reset/simulate-turnout?action=reset",
    { cookieFile: ADMIN_COOKIE }
  );
  if (getMutate.status === 405)
    ok("GET-mutation على الإعادة التدميرية محجوب (405)");
  else warn(`GET-mutation رجع ${getMutate.status} (المفضل 405)`);

  // 2.5 التحقق من المدخلات (Zod enums)
  info("2.5 التحقق من المدخلات (Zod enums)");
  const badGender = await httpReq("POST", "/api/voters", {
    cookieFile: ADMIN_COOKIE,
    body: JSON.stringify({
      firstName: "Test",
      phone: `zod-test-${Date.now()}`,
      gender: "HACKED",
      district: "الغراف",
    }),
  });
  if (badGender.status === 400) ok("Zod يرفض gender غير الصالح");
  else fail(`gender غير الصالح لم يُرفض (HTTP ${badGender.status})`);

  // 2.6 Path traversal
  info("2.6 Path traversal");
  const pt = await httpReq(
    "GET",
    "/api/cron/backup?action=download&name=../../etc/passwd",
    { cookieFile: ADMIN_COOKIE }
  );
  if (pt.status === 400) ok("Path traversal محجوب");
  else warn(`Path traversal رجع ${pt.status}`);

  // 2.7/2.8 معالجة الأخطاء — وثّق فقط بدون اعتبارها ثغرة حرجة
  info("2.7 معالجة الأخطاء (SQLite mode:insensitive قد يُرجع 500)");
  const sqli = await httpReq(
    "GET",
    "/api/voters?search=%27%20OR%201%3D1--",
    { cookieFile: ADMIN_COOKIE }
  );
  if (sqli.status === 500) {
    warn("/api/voters?search رجع 500 — غالباً mode:insensitive على SQLite (يختفي في PostgreSQL)");
    findings.push({
      severity: "low",
      title: "خطأ 500 في البحث على SQLite",
      detail:
        "mode:'insensitive' خاص بـ PostgreSQL. في SQLite يرمي استثناء. السبب بـ contains في src/app/api/voters/route.ts. ليس ثغرة SQLi (Prisma يُعامل القيم كـ parameters).",
    });
  } else if (sqli.status === 200 || sqli.status === 400) {
    ok(`البحث يعمل بدون 500 (HTTP ${sqli.status})`);
  }

  const malformed = await httpReq("POST", "/api/voters", {
    cookieFile: ADMIN_COOKIE,
    body: "{invalid json!!!",
  });
  if (malformed.status === 500) {
    warn("JSON تالف يُرجع 500 (المفضل 400 نظيف)");
    findings.push({
      severity: "low",
      title: "JSON تالف يُرجع 500 بدل 400",
      detail: "أضف try/catch حول request.json() أو تحقق قبل المعالجة",
    });
  } else if (malformed.status === 400) {
    ok("JSON تالف يُرجع 400 نظيف");
  }

  // 2.4 Rate limiting — يُنفّذ LAST لأنه يقفل العميل لـ 30 دقيقة
  // ويعطّل تسجيل الدخول لكل الاختبارات اللاحقة.
  info("2.8 Rate limiting (brute-force) — يُنفّذ أخيراً لأنه يقفل الدخول");
  let locked = false;
  for (let i = 1; i <= 7; i++) {
    const res = await httpReq("POST", "/api/access", {
      body: JSON.stringify({ action: "login", password: `WRONG_${i}_${Date.now()}` }),
    });
    if (res.status === 429) {
      locked = true;
      break;
    }
  }
  if (locked) ok("Rate limiting يعمل (قفل بعد محاولات فاشلة → 429)");
  else {
    warn("Rate limiting لم يُفعّل بعد 7 محاولات — تحقق من جدول RateLimit");
    findings.push({
      severity: "medium",
      title: "Rate limiting قد لا يعمل",
      detail: "7 محاولات فاشلة لم تُنتج HTTP 429",
    });
  }
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 3: مصفوفة الـ API
// ════════════════════════════════════════════════════════════════════

async function phase3ApiMatrix() {
  section("المرحلة 3: مصفوفة الـ API (GET مع جلسة ADMIN)");

  const routes = [
    "/api/voters",
    "/api/electoral-keys",
    "/api/tribes",
    "/api/services",
    "/api/tasks",
    "/api/volunteers",
    "/api/competitors",
    "/api/early-warnings",
    "/api/alerts",
    "/api/analysis",
    "/api/indicators",
    "/api/composite-indicators",
    "/api/dynamic-indicators",
    "/api/comprehensive-indicators",
    "/api/election-results",
    "/api/election-results/historical",
    "/api/commission",
    "/api/sms",
    "/api/sms-campaigns",
    "/api/stats",
    "/api/campaign",
    "/api/dashboard",
    "/api/me",
    "/api/search",
  ];

  let ok200 = 0;
  const problems = [];
  for (const r of routes) {
    const res = await httpReq("GET", r, { cookieFile: ADMIN_COOKIE });
    if (res.status === 200) ok200++;
    else if (r === "/api/search" && res.status === 400) {
      // مقبول: /api/search يتطلب query params
    } else problems.push(`${r} → ${res.status}`);
  }
  ok(`${ok200}/${routes.length} مسار يُرجع 200`);
  if (problems.length) {
    for (const p of problems) warn(p);
  }
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 4: الأداء
// ════════════════════════════════════════════════════════════════════

async function phase4Performance() {
  section("المرحلة 4: قياس الأداء (Response Times)");

  const routes = [
    "/api/health",
    "/api/dashboard",
    "/api/comprehensive-indicators",
    "/api/voters",
    "/api/indicators",
    "/api/composite-indicators",
    "/api/election-results/historical",
    "/api/me",
  ];

  let slowest = { route: "", ms: 0 };
  for (const r of routes) {
    const t0 = Date.now();
    await httpReq("GET", r, { cookieFile: ADMIN_COOKIE });
    const ms = Date.now() - t0;
    if (ms > slowest.ms) slowest = { route: r, ms };
    const tag = ms < 100 ? "✓" : ms < 500 ? "⚠" : "✗";
    console.log(`  ${tag} ${r.padEnd(40)} ${ms}ms`);
  }
  if (slowest.ms < 200) ok(`أبطأ مسار ${slowest.route} بزمن ${slowest.ms}ms — مقبول`);
  else warn(`أبطأ مسار ${slowest.route} بزمن ${slowest.ms}ms — فوق المقبوب`);
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 5: التحقق من المحركات (لا بيانات وهمية)
// ════════════════════════════════════════════════════════════════════

async function phase5Engines() {
  section("المرحلة 5: التحقق من المحركات (لا بيانات وهمية)");

  const res = await httpReq("GET", "/api/comprehensive-indicators", {
    cookieFile: ADMIN_COOKIE,
  });
  if (res.status !== 200) {
    fail(`تعذّر جلب المؤشرات (HTTP ${res.status})`);
    return;
  }
  const body = res.body;
  const checks = [
    { name: "855000 (ناخبون وهميون)", present: body.includes("855000") },
    { name: "avgParticipation:58", present: body.includes('"avgParticipation":58') || body.includes('"avgParticipation": 58') },
    { name: 'digitalCampaigns:75', present: body.includes('"digitalCampaigns":75') || body.includes('"digitalCampaigns": 75') },
  ];
  let clean = true;
  for (const c of checks) {
    if (c.present) {
      fail(`لا يزال ${c.name} موجوداً في الاستجابة`);
      clean = false;
      findings.push({
        severity: "medium",
        title: `قيمة وهمية ${c.name} في comprehensive-indicators`,
        detail: "تحقق من src/lib/comprehensive-indicators-engine.ts",
      });
    }
  }
  if (clean) ok("لا قيم وهمية في comprehensive-indicators (855000/58/75 مُزالة)");
}

// ════════════════════════════════════════════════════════════════════
// المرحلة 6: سلامة قاعدة البيانات
// ════════════════════════════════════════════════════════════════════

async function phase6Database() {
  section("المرحلة 6: سلامة قاعدة البيانات");

  // عدّ السجلات عبر prisma client مباشرة
  const counter = `
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    Promise.all([
      p.user.count(), p.tribe.count(), p.electionKey.count(),
      p.voter.count(), p.provinceReference.count(), p.auditLog.count()
    ]).then(r => {
      console.log(JSON.stringify({
        users: r[0], tribes: r[1], keys: r[2],
        voters: r[3], provinceRef: r[4], audit: r[5]
      }));
      return p.$disconnect();
    }).catch(e => { console.error(e.message); process.exit(1); });
  `;
  const result = spawnSync(
    process.execPath,
    ["-e", counter],
    { cwd: ROOT, encoding: "utf8", env: { ...process.env, DATABASE_URL: "file:./db/local.db" } }
  );
  const out = (result.stdout || "").trim();
  try {
    const counts = JSON.parse(out);
    console.log(
      `  users=${counts.users} tribes=${counts.tribes} keys=${counts.keys} voters=${counts.voters} provinceRef=${counts.provinceRef} audit=${counts.audit}`
    );
    if (counts.users >= 3 && counts.provinceRef >= 1) ok("البيانات المرجعية الأساسية مزروعة");
    else warn("البيانات المرجعية قد تكون ناقصة — شغّل prisma db seed");
    if (counts.tribes === 0) {
      info("ملاحظة: 0 قبائل — CRUD الكامل للناخبين يحتاج قبيلة/مفتاح موجود");
    }
  } catch {
    warn("تعذّر عدّ سجلات قاعدة البيانات");
  }
}

// ════════════════════════════════════════════════════════════════════
// التقرير النهائي
// ════════════════════════════════════════════════════════════════════

function finalReport() {
  section("التقرير النهائي");

  console.log(
    `${GREEN}نجح: ${passCount}${RESET} | ${RED}فشل: ${failCount}${RESET} | ${YELLOW}تحذيرات: ${warnCount}${RESET}\n`
  );

  if (findings.length === 0) {
    console.log(`${GREEN}${BOLD}🎉 لا اكتشافات حرجة — المشروع بحالة سليمة${RESET}`);
    return;
  }

  // رتّب حسب الخطورة
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  const sevLabel = {
    critical: `${RED}${BOLD}حرج${RESET}`,
    high: `${RED}عالٍ${RESET}`,
    medium: `${YELLOW}متوسط${RESET}`,
    low: `${CYAN}منخفض${RESET}`,
  };

  console.log(`${BOLD}الاكتشافات (${findings.length}):${RESET}\n`);
  for (const f of findings) {
    console.log(`  ${sevLabel[f.severity]} — ${f.title}`);
    console.log(`     ${f.detail}\n`);
  }
}

// ════════════════════════════════════════════════════════════════════
// نقطة الدخول
// ════════════════════════════════════════════════════════════════════

(async () => {
  console.log(
    `${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}`
  );
  console.log(
    `${BOLD}${CYAN}║  حزمة الفحوصات الشاملة — منظومة الماكينة الانتخابية   ║${RESET}`
  );
  console.log(
    `${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}`
  );
  console.log(`  الوضع: ${LIVE ? "فحص كامل + حي (--live)" : "فحص نظامي فقط"}\n`);

  const ready = await setup();
  if (!ready) {
    console.log(`\n${RED}توقف: التجهيز فشل${RESET}`);
    process.exit(1);
  }

  phase1Static();

  if (LIVE) {
    await phase2Pentest();
    await phase3ApiMatrix();
    await phase4Performance();
    await phase5Engines();
    await phase6Database();
  }

  finalReport();

  process.exit(failCount > 0 ? 1 : 0);
})();
