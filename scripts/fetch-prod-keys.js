const http = require("https");

async function postRequest(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on("error", (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

async function getRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on("error", (e) => { reject(e); });
    req.end();
  });
}

async function main() {
  const baseUrl = "https://election-system-production-437f.up.railway.app";
  console.log(`🚀 جلب المفاتيح الانتخابية من خادم الإنتاج: ${baseUrl}`);

  try {
    // 1. تسجيل الدخول
    const loginRes = await postRequest(`${baseUrl}/api/access`, {
      action: "owner-login",
      ownerPassword: "AdminSafeDhiQar2026#"
    });
    
    if (loginRes.statusCode !== 200) {
      throw new Error(`فشل تسجيل الدخول. الحالة: ${loginRes.statusCode}, الرد: ${loginRes.body}`);
    }

    const setCookie = loginRes.headers["set-cookie"];
    const cookie = setCookie.map(c => c.split(";")[0]).join("; ");

    // 2. جلب المفاتيح
    const keysRes = await getRequest(`${baseUrl}/api/electoral-keys`, { "Cookie": cookie });
    if (keysRes.statusCode !== 200) {
      throw new Error(`فشل جلب المفاتيح. الحالة: ${keysRes.statusCode}, الرد: ${keysRes.body}`);
    }

    const data = JSON.parse(keysRes.body);
    const keys = Array.isArray(data) ? data : data.keys || [];

    console.log(`📊 عدد المفاتيح المكتشفة في قاعدة البيانات الحية: ${keys.length}`);
    if (keys.length > 0) {
      keys.forEach((k, idx) => {
        console.log(`\n🔑 مفتاح [${idx + 1}]: ${k.firstName} ${k.fatherName} ${k.grandfatherName} (${k.keyCode || k.id})`);
        console.log(`   - الأصوات المدعاة: المؤيدة=${k.supportedVotes} | المحايدة=${k.neutralVotes} | الضعيفة=${k.weakVotes} | المجموع=${k.totalVotes}`);
        console.log(`   - الأصوات الصافية (صافي الأصوات): ${k.netVotes}`);
        console.log(`   - التقييم الموزون (معامل الكفاءة): ${k.weightedScore}%`);
        console.log(`   - التصنيف الحالي: ${k.classification}`);
        
        // حساب الأصوات المضمونة
        const hasEval = k.lastEvaluationAt !== null && k.lastEvaluationAt !== undefined;
        const effCoeff = hasEval ? (k.weightedScore / 100) : 1.0;
        const guaranteed = Math.round(k.netVotes * effCoeff);
        console.log(`   - الأصوات المضمونة: ${guaranteed} ${hasEval ? "(حساب بعد التقييم الميداني)" : "(حساب كلي افتراضي - قبل التقييم)"}`);
        console.log(`   - الأصوات المتسربة: ${Math.max(0, k.netVotes - guaranteed)}`);
        console.log(`   - تاريخ آخر تقييم: ${k.lastEvaluationAt || "لم يتم التقييم الميداني بعد"}`);
      });
    } else {
      console.log("ℹ️ قاعدة البيانات فارغة تماماً من المفاتيح الانتخابية (عدد السجلات = 0).");
    }
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  }
}

main();
