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
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  const baseUrl = "https://election-system-production-437f.up.railway.app";
  console.log(`🚀 بدء الاتصال بالخادم العام: ${baseUrl}`);

  try {
    // 1. تسجيل الدخول للحصول على التوكن
    console.log("⏳ محاولة تسجيل الدخول كـ admin...");
    const loginRes = await postRequest(`${baseUrl}/api/access`, {
      action: "owner-login",
      ownerPassword: "YOUR_ADMIN_PASSWORD"
    });

    console.log(`   حالة الاستجابة: ${loginRes.statusCode}`);
    
    // استخلاص كوكيز الجلسة (token)
    const setCookie = loginRes.headers["set-cookie"];
    if (!setCookie) {
      throw new Error(`تعذر الحصول على كوكيز المصادقة. الاستجابة: ${loginRes.body}`);
    }
    
    const cookie = setCookie.map(c => c.split(";")[0]).join("; ");
    console.log("✅ تم الحصول على كوكيز المصادقة بنجاح.");

    // 2. إرسال طلب إعادة تعيين البيانات
    console.log("⏳ إرسال طلب إعادة تعيين البيانات بالكامل (مسح العشائر والبيانات الوهمية)...");
    const resetRes = await postRequest(`${baseUrl}/api/reset`, {
      confirmReset: "CONFIRM_RESET_ALL_DATA"
    }, {
      "Cookie": cookie
    });

    console.log(`   حالة الاستجابة: ${resetRes.statusCode}`);
    console.log(`   محتوى الاستجابة: ${resetRes.body}`);

    const resObj = JSON.parse(resetRes.body);
    if (resObj.success) {
      console.log("✨ نجاح باهر! تم تفريغ ومسح كافة العشائر والبيانات الوهمية بالكامل من السيرفر السحابي!");
    } else {
      console.log(`⚠️ فشل المسح: ${resObj.error || "خطأ غير معروف"}`);
    }

  } catch (error) {
    console.error("❌ حدث خطأ غير متوقع:", error.message);
  }
}

main();
