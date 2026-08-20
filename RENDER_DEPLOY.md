# نشر Area 50 على Render

تعمل نسخة Area 50 الحالية كتطبيق **Node.js + Express + React + tRPC** مع قاعدة بيانات MySQL؛ لذلك يجب نشرها كـ **Web Service** وليس كموقع Static فقط.

## الإعدادات

| الحقل | القيمة |
|---|---|
| Environment | Node |
| Build Command | `pnpm install --frozen-lockfile && pnpm run build` |
| Start Command | `pnpm start` |
| Node Version | 20 أو أحدث |
| Health Check Path | `/` |

اربط الخدمة بمستودع GitHub من لوحة Render، ثم أضف متغيرات البيئة في قسم **Environment Variables**. لا تضع القيم السرية داخل المستودع أو ملفات Markdown.

| المتغير | الاستخدام |
|---|---|
| `DATABASE_URL` | رابط اتصال MySQL أو TiDB القابل للوصول من Render |
| `JWT_SECRET` | مفتاح سري طويل لتوقيع جلسات الخادم |
| `AREA50_ADMIN_CODE` | الرمز الذي تختاره لدخول لوحة الإدارة |
| `NODE_ENV` | القيمة `production` |

بعد إنشاء الخدمة، شغّل تهيئة الجداول مرة واحدة من Shell الاستضافة أو من جهاز موثوق:

```bash
pnpm db:push
```

ثم افتح رابط الخدمة، وستكون لوحة الإدارة على المسار:

```text
/area50iq-admin
```

> لا تستخدم رمزاً تجريبياً أو رمزاً منشوراً في GitHub. خزّن رمز الإدارة وقيمة `JWT_SECRET` في Secrets الخاصة بالاستضافة فقط.

للمراجعة، راجع [وثائق Render الخاصة بخدمات الويب](https://render.com/docs/web-services) و[وثائق متغيرات البيئة](https://render.com/docs/configure-environment-variables).
