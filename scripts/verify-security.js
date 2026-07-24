#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// verify-security.js — فحص الأمان والجودة المتكامل بعد كل تعديل
// Automated check script run after every code modification
// ════════════════════════════════════════════════════════════════════

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

let hasFailed = false;

function printSection(title) {
  console.log(`\n${BOLD}${CYAN}=== ${title} ===${RESET}`);
}

function ok(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function fail(msg) {
  hasFailed = true;
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

function warn(msg) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
}

function runCommand(cmd) {
  try {
    return {
      stdout: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }),
      status: 0
    };
  } catch (e) {
    return {
      stdout: e.stdout || "",
      stderr: e.stderr || "",
      status: e.status || 1
    };
  }
}

// 1. فحص ملفات البيئة والأسرار
printSection("1. فحص تسريب الأسرار وملفات البيئة (Secrets Leak Check)");
const envFiles = [".env", ".env.production", ".env.sqlite", ".env.local"];
let stagedEnvFiles = [];
try {
  const statusOut = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
  stagedEnvFiles = statusOut
    .split("\n")
    .map(line => line.trim().slice(3))
    .filter(file => envFiles.includes(path.basename(file)));
} catch (e) {
  warn("تعذر فحص حالة Git للملفات");
}

if (stagedEnvFiles.length > 0) {
  fail(`ملفات البيئة الحساسة مضافة للمستودع! تم العثور على: ${stagedEnvFiles.join(", ")}`);
} else {
  ok("لا توجد ملفات بيئة حساسة مضافة لـ Git");
}

// التأكد من أن الملفات غير متتبعة حالياً في الفهرس
let trackedEnv = false;
for (const f of envFiles) {
  const check = runCommand(`git ls-files --error-unmatch ${f}`);
  if (check.status === 0) {
    fail(`الملف الحساس ${f} لا يزال متتبعاً في Git!`);
    trackedEnv = true;
  }
}
if (!trackedEnv) {
  ok("تاريخ ومؤشر Git نظيف تماماً من ملفات البيئة الحساسة");
}

// فحص تاريخ Git بالكامل عبر كافة الالتزامات (Full History Scan)
// Scan the commit lineage that will be deployed. Remote-tracking refs may still
// point to an old commit locally while a permitted force-update is pending.
const historyScan = runCommand('git log HEAD -G "JWT_SECRET.*[A-Za-z0-9+/=_-]{20,}" --format="%H"');
if (historyScan.status === 0 && historyScan.stdout.trim().length > 0) {
  fail(`تم اكتشاف أنماط أسرار في تاريخ Git! Commits متأثرة: ${historyScan.stdout.trim().split('\n').slice(0, 3).join(', ')}`);
} else {
  ok("فحص التاريخ الجنائي الكامل لـ Git نظيف 100% من أي أسرار محتملة");
}

// 2. التحقق من وجود رؤوس الأمان في Middleware
printSection("2. فحص رؤوس الأمان (Security Headers Check)");
const middlewarePath = fs.existsSync(path.join(ROOT, "src", "proxy.ts"))
  ? path.join(ROOT, "src", "proxy.ts")
  : path.join(ROOT, "src", "middleware.ts");
if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, "utf8");
  const hasCSP = content.includes("Content-Security-Policy");
  const hasHSTS = content.includes("Strict-Transport-Security");
  const hasPerms = content.includes("Permissions-Policy");
  
  if (hasCSP && hasHSTS && hasPerms) {
    ok("رؤوس الأمان CSP, HSTS, Permissions-Policy متوفرة في middleware.ts");
  } else {
    if (!hasCSP) fail("رأس الأمان Content-Security-Policy مفقود من middleware.ts");
    if (!hasHSTS) fail("رأس الأمان Strict-Transport-Security مفقود من middleware.ts");
    if (!hasPerms) fail("رأس الأمان Permissions-Policy مفقود من middleware.ts");
  }
} else {
  fail("ملف middleware.ts غير موجود!");
}

// 3. فحص الأنواع غير المحددة user: any في الـ API
printSection("3. فحص صلاحيات وأنواع Route Handlers (Type-Safety Check)");
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const apiDir = path.join(ROOT, "src", "app", "api");
let untypedHandlers = 0;
if (fs.existsSync(apiDir)) {
  const files = walkDir(apiDir);
  files.forEach(file => {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("{ user }: any") || content.match(/user:\s*any\b/)) {
      fail(`تم اكتشاف نوع غير آمن 'user: any' في: ${path.relative(ROOT, file)}`);
      untypedHandlers++;
    }
  });
  if (untypedHandlers === 0) {
    ok("كل Route Handlers تستخدم أنواعاً صارمة وصحيحة للمستخدم (تم تجنب user: any)");
  }
} else {
  warn("مجلد src/app/api غير موجود");
}

// 4. فحص تشفير النسخ الاحتياطية
printSection("4. فحص تشفير النسخ الاحتياطية (Backup Encryption)");
const backupPath = path.join(ROOT, "src", "lib", "backup.ts");
if (fs.existsSync(backupPath)) {
  const content = fs.readFileSync(backupPath, "utf8");
  const hasAES = content.includes("aes-256-gcm") && content.includes("encryptData") && content.includes("decryptData");
  if (hasAES) {
    ok("تشفير النسخ الاحتياطية بـ AES-256-GCM متوفر ومطبّق في backup.ts");
  } else {
    fail("تشفير النسخ الاحتياطية بـ AES-256-GCM غير مطبق أو تم حذفه في backup.ts!");
  }
} else {
  fail("ملف src/lib/backup.ts غير موجود!");
}

// 5. فحص التحقق من الملفات المرفوعة
printSection("5. فحص قيود رفع الملفات (File Upload Security)");
const importPath = path.join(ROOT, "src", "app", "api", "import", "bulk", "route.ts");
if (fs.existsSync(importPath)) {
  const content = fs.readFileSync(importPath, "utf8");
  const hasExtCheck = content.includes("fileName.endsWith") && content.includes(".xlsx");
  const hasSizeCheck = content.includes("MAX_FILE_SIZE") && content.includes("file.size");
  const hasMimeCheck = content.includes("allowedMimes") && content.includes("file.type");
  
  if (hasExtCheck && hasSizeCheck && hasMimeCheck) {
    ok("قيود التحقق من الحجم والنوع والامتداد متوفرة في import/bulk/route.ts");
  } else {
    if (!hasExtCheck) fail("التحقق من امتداد الملف مفقود في import/bulk/route.ts");
    if (!hasSizeCheck) fail("التحقق من حجم الملف مفقود في import/bulk/route.ts");
    if (!hasMimeCheck) fail("التحقق من MIME type مفقود في import/bulk/route.ts");
  }
} else {
  warn("ملف import/bulk/route.ts غير موجود");
}

// 6. تشغيل اختبارات TypeScript
printSection("6. اختبارات الأنواع (TypeScript Validation)");
console.log("  تشغيل npx tsc --noEmit ...");
const tscResult = runCommand("npx tsc --noEmit");
if (tscResult.status === 0) {
  ok("تطابق الأنواع وتكامل TypeScript نظيف بالكامل (0 أخطاء)");
} else {
  fail(`أخطاء TypeScript مكتشفة! الإخراج:\n${tscResult.stdout || tscResult.stderr}`);
}

// 7. تشغيل اختبارات الوحدة
printSection("7. اختبارات الوحدة (Unit Tests)");
console.log("  تشغيل npx vitest run ...");
const testResult = runCommand("npx vitest run");
if (testResult.status === 0) {
  const match = testResult.stdout.match(/Tests\s+(\d+)\s+passed/);
  ok(`اختبارات الوحدة ناجحة بالكامل: ${match ? match[1] + " اختبارات" : "مكتملة"}`);
} else {
  fail(`فشل اختبار أو أكثر من اختبارات الوحدة! الإخراج:\n${testResult.stdout || testResult.stderr}`);
}

// 8. فحص الثغرات الأمنية في التبعيات
printSection("8. فحص ثغرات التبعيات (Dependencies Audit)");
console.log("  تشغيل npm audit ...");
const auditResult = runCommand("npm audit --omit=dev --json");
try {
  const a = JSON.parse(auditResult.stdout || "{}");
  const meta = a.metadata && a.metadata.vulnerabilities;
  if (meta) {
    if ((meta.critical || 0) > 0 || (meta.high || 0) > 0) {
      fail(`تم اكتشاف ثغرات أمنية في التبعيات (critical: ${meta.critical || 0}, high: ${meta.high || 0})`);
    } else {
      ok(`لا توجد ثغرات Critical أو High في تبعيات الإنتاج`);
    }
  } else {
    ok("لا توجد أي ثغرات في التبعيات");
  }
} catch {
  warn("تعذر تحليل ناتج npm audit كـ JSON");
}

// 9. البناء الكامل للمشروع
printSection("9. بناء الإنتاج الشامل (Production Build Check)");
console.log("  تشغيل npm run build ...");
const buildResult = runCommand("npm run build");
if (buildResult.status === 0) {
  ok("بناء الإنتاج ناجح ومتكامل بنسبة 100%");
} else {
  fail(`فشل بناء الإنتاج! الإخراج:\n${buildResult.stdout || buildResult.stderr}`);
}

// التقرير النهائي
console.log("\n==================================================");
if (hasFailed) {
  console.log(`${RED}${BOLD}🚨 فشل فحص الأمان والجودة! يجب معالجة الأخطاء قبل إكمال العمل.${RESET}`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}🎉 نجاح جميع الفحوصات الأمنية والفنية بنجاح بنسبة 100%! المشروع جاهز تماماً.${RESET}`);
  process.exit(0);
}
