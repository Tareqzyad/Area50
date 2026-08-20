# قاعدة البيانات الخارجية لـ Area 50

## الخيار المختار: TiDB Cloud Starter

يمكن استخدام **TiDB Cloud Starter** كقاعدة متوافقة مع MySQL لتطبيق Area 50. الوثائق الرسمية تذكر أن بدء الاستخدام لا يتطلب بطاقة ضمن الحصة المجانية، وأنه يمكن إبقاء حد الإنفاق عند `0` ليظل المثال مجانياً. كما توضح أن الاتصال يستخدم TLS وأن كلمة مرور الاتصال يجب توليدها وحفظها عند إنشائها.

## خطوات مختصرة

1. إنشاء حساب من <https://tidbcloud.com/free-trial>.
2. من صفحة **My TiDB** اختيار **Create Resource** ثم خطة **Starter**.
3. إبقاء **Spending Limit** عند `0`، ثم إنشاء المثال.
4. فتح المثال واختيار **Connect**، ثم توليد كلمة مرور الاتصال وحفظها في مكان آمن.
5. استخدام تفاصيل الاتصال التي يعرضها TiDB لبناء قيمة `DATABASE_URL` في Render بصيغة MySQL المتوافقة مع `mysql2`.
6. بعد النشر، تشغيل ترحيلات Drizzle مرة واحدة لإضافة جداول Area 50.

## ملاحظات الاتصال

تتطلب TiDB Cloud Starter اتصالات TLS، ويستخدم اسم المستخدم بادئة فريدة يضيفها TiDB إلى اسم المستخدم. يجب نسخ قيمة الاتصال كما يعرضها TiDB وعدم مشاركتها داخل المحادثة أو إضافتها إلى GitHub.

## المصادر

- <https://docs.pingcap.com/tidbcloud/select-cluster-tier/>
- <https://docs.pingcap.com/tidbcloud/create-tidb-cluster-serverless/>
- <https://docs.pingcap.com/developer/dev-guide-build-cluster-in-cloud/>
