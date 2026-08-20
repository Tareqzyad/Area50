# دليل نشر موقع Area 50 على Netlify

تم تجهيز هذا المشروع ليعمل بشكل كامل (الواجهة + وظائف الحجز ولوحة الإدارة عبر Netlify Functions + قاعدة البيانات).

## الخطوات:

1. **إنشاء مستودع GitHub:**
   - ارفع مجلد المشروع إلى مستودع جديد على GitHub (تأكد من عدم رفع مجلد `node_modules` أو `.env`).

2. **الربط مع Netlify:**
   - سجل الدخول إلى [Netlify](https://www.netlify.com).
   - اضغط على **Add new site** ثم **Import an existing project**.
   - اختر مستودع GitHub الخاص بـ Area 50.

3. **إعدادات البناء (Build Settings):**
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist/public`
   - **Functions directory:** `netlify/functions`

4. **متغيرات البيئة (Environment Variables):**
   اذهب إلى **Site settings > Environment variables** وأضف المتغيرات التالية:
   - `DATABASE_URL`: رابط اتصال قاعدة بيانات MySQL الخاصة بك (مثلاً من Aiven أو PlanetScale أو TiDB).
   - `JWT_SECRET`: مفتاح سري عشوائي لتوقيع الجلسات (مثلاً `area50_secure_jwt_key_2026`).
   - `AREA50_ADMIN_CODE`: رمز الدخول للوحة الإدارة (`area50iq119080`).

5. **النشر (Deploy):**
   - اضغط **Deploy site**، وسيتم نشر الموقع مع تفعيل واجهة الـ API والحجوزات ولوحة الأدمن بشكل كامل!
