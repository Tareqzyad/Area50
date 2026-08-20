# دليل نشر موقع Area 50 على منصة Render

منصة **Render** تعتبر الخيار الأنسب والأسهل لاستضافة مشروع Area 50 بالكامل (الواجهة + الخادم + قاعدة البيانات MySQL) بدون الحاجة لعقود معقدة.

## الخطوات:

1. **إنشاء قاعدة البيانات (MySQL Database):**
   - سجل الدخول إلى [Render Dashboard](https://dashboard.render.com).
   - اضغط على **New +** ثم اختر **MySQL**.
   - اختر اسماً للقاعدة (مثلاً `area50-db`) وانسخ **Internal Database URL** أو **External Database URL**.

2. **رفع المشروع (Web Service):**
   - ارفع مجلد المشروع إلى مستودع GitHub خاص بك.
   - من لوحة تحكم Render، اضغط **New +** ثم **Web Service**.
   - اربطه بمستودع GitHub الخاص بـ Area 50.
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`

3. **إعداد متغيرات البيئة (Environment Variables):**
   في إعدادات الخدمة على Render، أضف المتجرين التاليين:
   - `DATABASE_URL`: رابط اتصال قاعدة البيانات الذي نسخته في الخطوة الأولى.
   - `JWT_SECRET`: مفتاح سري عشوائي (مثلاً `area50_render_secret_2026`).
   - `AREA50_ADMIN_CODE`: رمز الدخول للوحة الإدارة (`area50iq119080`).

4. **النشر:**
   - اضغط **Create Web Service**، وسيتم بناء ونشر الموقع بالكامل مع تفعيل الحجوزات ولوحة الأدمن والمزامنة الفورية للأسعار!
