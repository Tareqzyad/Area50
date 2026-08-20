# ملاحظة توافق Netlify

نسخة Area 50 الحالية ليست موقعاً ثابتاً فقط؛ فهي تعتمد على خادم **Node.js + Express + tRPC** وقاعدة بيانات MySQL. لذلك لا يكفي إعداد Netlify Static أو رفع مجلد `dist/public` وحده لتشغيل الحجوزات ولوحة الإدارة.

للنشر الخارجي المباشر، استخدم خدمة Node كاملة مثل **Render Web Service** أو Railway، مع أوامر البناء والتشغيل الموجودة في `RENDER_DEPLOY.md` و`GITHUB_DEPLOY.md`.

يمكن استخدام Netlify فقط بعد تنفيذ تحويل منفصل إلى Netlify Functions وربط مسارات tRPC وقاعدة البيانات بها، وهذا ليس مسار التشغيل المعتمد للنسخة الحالية.

> لا ترفع ملفات `.env` أو أي مفاتيح سرية إلى GitHub أو Netlify. أضف `DATABASE_URL` و`JWT_SECRET` و`AREA50_ADMIN_CODE` من خلال قسم Secrets في منصة الاستضافة التي ستشغّل خدمة Node.
