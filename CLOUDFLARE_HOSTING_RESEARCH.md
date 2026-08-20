# تقييم Cloudflare Workers لاستضافة Area 50

تمت المراجعة في 20 آب 2026 بعد أن طلب Render إضافة بطاقة من حساب المستخدم على الرغم من اختيار الخطة المجانية. لا ينبغي إدخال بطاقة أو الانتقال إلى خطة مدفوعة من أجل هذا المشروع.

| البند | النتيجة | الدلالة على Area 50 |
|---|---|---|
| Cloudflare Workers Free | متاحة افتراضياً، بحد 100,000 طلب ديناميكي يومياً و10 ms CPU لكل طلب | مناسبة لحجوزات ومتجر مركز صغير عند تحسين الاستعلامات |
| Cloudflare D1 Free | متاحة ضمن Workers Free، بحد 5 ملايين صف مقروء يومياً و100,000 صف مكتوب يومياً و5 GB تخزين إجمالي | مناسبة لحجوزات ومنتجات وطلبات Area 50 في الحجم المتوقع |
| واجهة المستخدم + الخادم | Workers قادر على استضافة تطبيق React وخادم API ضمن نشر واحد، ويدعم Express عبر وضع Node compatibility | يمكن الحفاظ على تجربة الموقع، لكن يحتاج الخادم وقاعدة البيانات إلى تكييف تقني |
| التكلفة وبطاقة الدفع | صفحة Workers الرسمية تذكر خيار البدء المجاني دون بطاقة؛ يجب البقاء على Workers Free وعدم تفعيل المنتجات المدفوعة | يطابق مطلب المستخدم بعد رفض Render |

## التغيير التقني المطلوب

المشروع الحالي يستخدم Express وtRPC وDrizzle مع MySQL عبر `mysql2`. لذلك لا يمكن رفعه كما هو إلى Cloudflare. يلزم نقل طبقة البيانات إلى D1 (SQLite) وتكييف تشغيل الخادم كي يعمل داخل Worker، مع إضافة إعدادات Wrangler وربط GitHub للنشر التلقائي. واجهات React ومنطق الحجز والمتجر ولوحة الإدارة يمكن الحفاظ عليها وظيفياً.

## المصادر الرسمية

1. [Cloudflare Workers — صفحة المنتج](https://www.cloudflare.com/products/workers/)
2. [Workers Pricing — Cloudflare Docs](https://developers.cloudflare.com/workers/platform/pricing/)
3. [D1 Pricing — Cloudflare Docs](https://developers.cloudflare.com/d1/platform/pricing/)
4. [Deploy an Express.js application on Cloudflare Workers — Cloudflare Docs](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/)
