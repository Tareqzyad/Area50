# دليل رفع وتشغيل مشروع Area 50 على GitHub والاستضافة السحابية

يوضح هذا المستند الخطوات العملية لرفع مشروع **Area 50** على مستودع **GitHub** وربطه بمنصة استضافة مجانية/مدعومة مثل **Render** أو **Railway** مع ضبط قاعدة البيانات ومتغيرات البيئة.

---

## أولاً: خطوات رفع المشروع إلى مستودع GitHub

1. أنشئ مستودعاً جديداً (Repository) فارغاً على موقع [GitHub](https://github.com) (يُفضل أن يكون Public أو Private حسب رغبتك).
2. افتح نافذة الأوامر في مجلد المشروع ونفذ الأوامر التالية لرفع الملفات:

```bash
git init
git add .
git commit -m "Area 50 Final Production Release"
git branch -M main
git remote add origin https://github.com/اسم_حسابك/اسم_المستودع.git
git push -u origin main
```

---

## ثانياً: إعدادات التشغيل (Build & Start Commands)

عند ربط المستودع بمنصة الاستضافة (مثل Render Web Service أو Railway)، استخدم الإعدادات التالية:

| الحقل | القيمة المطلوبة |
|---|---|
| **Build Command** | `pnpm install --frozen-lockfile && pnpm run build` |
| **Start Command** | `pnpm start` |
| **Node Version** | `20.x` أو أعلى |

---

## ثالثاً: متطلبات متغيرات البيئة (Environment Variables)

يجب إضافة المتطلبات التالية في لوحة تحكم الاستضافة (Environment Variables):

- `DATABASE_URL`: رابط اتصال قاعدة بيانات MySQL (مثل TiDB أو Aiven أو Supabase/Neon لـ MySQL).
- `JWT_SECRET`: مفتاح سري عشوائي طويل لتوقيع جلسات الخادم. أنشئه داخل لوحة الاستضافة ولا تضعه في GitHub.
- `AREA50_ADMIN_CODE`: رمز لوحة الإدارة الذي تختاره، ويُحفظ في Secrets داخل منصة الاستضافة فقط ولا يُضاف إلى مستودع GitHub.
- `NODE_ENV`: تعيين القيمة إلى `production`.
- `PORT`: تتركه الاستضافة تلقائياً (عادة يتم قراءته من `process.env.PORT`).
