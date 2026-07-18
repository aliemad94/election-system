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

async function main() {
  const baseUrl = "https://election-system-production-437f.up.railway.app";
  console.log(`🚀 بدء الاتصال بالخادم لتهيئة البيانات: ${baseUrl}`);

  try {
    // 1. تسجيل الدخول بالرمز القديم للحصول على التوكن
    console.log("⏳ محاولة تسجيل الدخول كـ admin بالرمز القديم...");
    const loginRes = await postRequest(`${baseUrl}/api/access`, {
      action: "owner-login",
      ownerPassword: process.env.OWNER_PASSWORD || ""
    });
    
    console.log(`   حالة الاستجابة: ${loginRes.statusCode}`);
    if (loginRes.statusCode !== 200) {
      throw new Error(`تعذر تسجيل الدخول بالرمز المالك. الاستجابة: ${loginRes.body}`);
    }

    const setCookie = loginRes.headers["set-cookie"];
    const cookie = setCookie.map(c => c.split(";")[0]).join("; ");
    console.log("✅ تم الحصول على كوكيز المصادقة بنجاح.");

    // 2. إرسال طلب تهيئة البيانات الأساسية
    console.log("⏳ إرسال طلب تهيئة البيانات وتحديث كلمات المرور...");
    const seedRes = await postRequest(`${baseUrl}/api/seed`, {}, { "Cookie": cookie });
    console.log(`   حالة الاستجابة: ${seedRes.statusCode}`);
    console.log(`   محتوى الاستجابة: ${seedRes.body}`);
    
    const resObj = JSON.parse(seedRes.body);
    if (resObj.success) {
      console.log("✨ نجاح باهر! تم تحديث كلمات المرور والتهيئة بنجاح!");
    } else {
      console.error("⚠️ فشل التهيئة:", resObj.error);
    }
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  }
}

main();
