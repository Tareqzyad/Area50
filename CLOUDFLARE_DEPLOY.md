# نشر Area 50 على Cloudflare دون بطاقة

هذه النسخة تحافظ على الواجهة العربية، الحجوزات، المتجر ولوحة الإدارة، لكنها تستبدل MySQL بـ **Cloudflare D1** وتستبدل تخزين الصور المرتبط بالمنصة السابقة بـ **Cloudinary Free**. لا تضع رمز الأدمن أو أي كلمة سر داخل GitHub.

## ما يحتاجه صاحب الحساب مرة واحدة

أنشئ حساباً مجانياً في [Cloudflare](https://dash.cloudflare.com/sign-up)، ثم افتح مجلد المشروع محلياً أو عبر GitHub Codespaces/Cloudflare Workers. من جذر المشروع شغّل الأوامر التالية بعد تسجيل الدخول إلى Cloudflare:

```bash
pnpm install
pnpm exec wrangler login
pnpm exec wrangler d1 create area50-db
```

انسخ قيمة `database_id` التي يعرضها الأمر الأخير، واستبدل القيمة الصفرية في `wrangler.jsonc`. بعد ذلك أنشئ الجداول:

```bash
pnpm exec wrangler d1 execute area50-db --remote --file=cloudflare/schema.sql
```

## رفع صور المنتجات

أنشئ حساباً مجانياً في [Cloudinary](https://cloudinary.com/users/register/free)، ومن **Settings → Upload → Upload presets** أنشئ preset من نوع **Unsigned**. انسخ **Cloud name** واسم الـ preset فقط؛ لا نحتاج API secret.

## الأسرار

أضف القيم الآتية من داخل Cloudflare أو بالأوامر أدناه. استبدل القيم بين الأقواس بالقيم الحقيقية ولا تضعها في ملف Git أو رسالة عامة:

```bash
pnpm exec wrangler secret put AREA50_ADMIN_CODE
pnpm exec wrangler secret put JWT_SECRET
pnpm exec wrangler secret put CLOUDINARY_CLOUD_NAME
pnpm exec wrangler secret put CLOUDINARY_UPLOAD_PRESET
```

اكتب رمز الإدارة الحالي عند طلب `AREA50_ADMIN_CODE`. أنشئ قيمة عشوائية طويلة لـ `JWT_SECRET`، وهو متغير احتياطي للتوافق مع طبقة الجلسات.

## النشر

```bash
pnpm build
pnpm exec wrangler deploy
```

بعدها يظهر رابط `workers.dev`. افحص صفحة `/area50iq-admin`، وجرّب حجزاً تجريبياً وطلباً من المتجر قبل مشاركة الرابط مع الزبائن.

## ملاحظات مهمة

ملف `wrangler.jsonc` يحتوي معرفاً صفرياً آمناً كقيمة مؤقتة؛ يجب استبداله بمعرّف D1 الحقيقي قبل النشر. الصور الأساسية في صفحات الموقع تشير مؤقتاً إلى روابط عامة مستقرة للنسخة المنشورة الحالية كي لا تتعطل الهوية البصرية؛ أما أي صور يرفعها المدير لاحقاً فستذهب إلى Cloudinary.

## المراجع

1. [Cloudflare — نشر Express على Workers](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/)
2. [Cloudflare D1 — التسعير والحدود](https://developers.cloudflare.com/d1/platform/pricing/)
3. [Cloudinary — خطة Free](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan)
