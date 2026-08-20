# خيارات استضافة Area 50

## النتيجة المختصرة

يتطلب Area 50 خدمة تشغّل **Node.js + Express** مع متغيرات بيئة واتصال MySQL؛ لذلك لا يكفي نشره كموقع Static على Netlify دون تحويل معماري للخادم.

| المنصة | التوافق | الخطة المجانية | القيد المهم |
|---|---|---|---|
| Render Web Service | مناسب مباشرةً | خدمة Free بلا بطاقة عند اختيارها | تنام الخدمة بعد 15 دقيقة من عدم النشاط |
| Bonto | متوافق مع Node.js و`package.json` | بلا بطاقة | 75 ساعة تشغيل شهرياً فقط، لذا لا تصلح كخيار رئيسي لموقع يعمل طوال الشهر |
| Netlify Static Site | غير مناسب مباشرةً | مجاني للملفات الثابتة | لا يشغّل خادم Express الحالي أو قاعدة البيانات كما هي |

## المصادر

- Render Free: https://render.com/docs/free
- Render Web Services: https://render.com/docs/web-services
- Bonto Node.js Hosting: https://bonto.dev/hosting/nodejs
