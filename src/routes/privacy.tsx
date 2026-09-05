import { createFileRoute } from "@tanstack/react-router";

const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>سياسة الخصوصية | تأميني - GoSuksa</title>
<meta name="description" content="سياسة الخصوصية لموقع تأميني GoSuksa: البيانات التي نجمعها، كيفية استخدامها، وحقوقك وفق نظام حماية البيانات الشخصية في المملكة العربية السعودية." />
<meta property="og:title" content="سياسة الخصوصية | تأميني - GoSuksa" />
<meta property="og:description" content="كيف نجمع بياناتك ونستخدمها ونحميها، وحقوقك في الوصول والتصحيح والحذف." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://gosuksa.com/privacy" />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
body{font-family:"Cairo",sans-serif;background:#f5f7fa;color:#0a1628;margin:0;padding:32px 16px;line-height:1.9}
.wrap{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e3e8ef;border-radius:16px;padding:28px}
h1{font-size:26px;margin:0 0 8px}h2{font-size:18px;margin:24px 0 8px}
a{color:#0a7cff;text-decoration:none}
.back{display:inline-block;margin-top:24px}
</style>
</head>
<body>
<div class="wrap">
<h1>سياسة الخصوصية</h1>
<p>نلتزم بحماية بياناتك الشخصية وفق نظام حماية البيانات الشخصية في المملكة العربية السعودية. تُوضّح هذه السياسة البيانات التي نجمعها عند استخدامك لموقع تأميني - GoSuksa وكيفية استخدامها وحمايتها.</p>

<h2>البيانات التي نجمعها</h2>
<ul>
<li>الاسم ورقم الجوال والبريد الإلكتروني.</li>
<li>رقم الهوية أو الإقامة ورقم تسلسل المركبة لأغراض إصدار الوثيقة.</li>
<li>معلومات الدفع تُعالَج مباشرةً عبر بوابة الدفع المعتمدة (Mada / Visa / Mastercard) ولا نخزّن بيانات البطاقة على خوادمنا.</li>
</ul>

<h2>كيف نستخدم البيانات</h2>
<p>لإصدار عروض التأمين، إتمام الشراء، خدمة العملاء، والامتثال للأنظمة. لا نبيع بياناتك لأي طرف ثالث، ولا نشاركها إلا مع شركة التأمين المختارة لإصدار الوثيقة.</p>

<h2>نماذج التواصل والإعلانات</h2>
<p>عند إرسال بياناتك عبر نموذج على الموقع أو عبر نموذج تواصل داخل إعلاناتنا، تُستخدم هذه البيانات فقط للتواصل معك بخصوص طلبك وتقديم عرض السعر المناسب.</p>

<h2>ملفات الارتباط (Cookies)</h2>
<p>نستخدم ملفات ارتباط أساسية لتشغيل الموقع وأخرى لقياس أداء الإعلانات. يمكنك تعطيلها من إعدادات المتصفح.</p>

<h2>حقوقك</h2>
<p>يحق لك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها عبر التواصل معنا على <a href="mailto:support@gosuksa.com">support@gosuksa.com</a> أو هاتفياً على <a href="tel:8001247247">8001247247</a>.</p>

<h2>من نحن</h2>
<p>تأميني - GoSuksa، سجل تجاري رقم 1101119، شركة خاصة مستقلة وليست جهة حكومية.</p>

<a class="back" href="/">العودة إلى الصفحة الرئيسية</a>
</div>
</body>
</html>`;

export const Route = createFileRoute("/privacy")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "x-robots-tag": "index, follow",
          },
        }),
    },
  },
});
