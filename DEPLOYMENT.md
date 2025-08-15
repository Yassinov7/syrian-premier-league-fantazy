# دليل النشر والتشغيل 🚀

## النشر على Vercel (موصى به)

### 1. إعداد Vercel
1. انتقل إلى [vercel.com](https://vercel.com)
2. سجل دخولك أو أنشئ حساب جديد
3. انقر على "New Project"

### 2. ربط المشروع
1. اربط حساب GitHub الخاص بك
2. اختر مستودع `syrian-premier-league-fantasy`
3. انقر على "Import"

### 3. إعداد المتغيرات البيئية
في صفحة إعدادات المشروع، أضف المتغيرات التالية:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. النشر
1. انقر على "Deploy"
2. انتظر حتى يكتمل النشر
3. احصل على رابط المشروع

## النشر على Netlify

### 1. إعداد Netlify
1. انتقل إلى [netlify.com](https://netlify.com)
2. سجل دخولك أو أنشئ حساب جديد
3. انقر على "New site from Git"

### 2. ربط المشروع
1. اربط حساب GitHub
2. اختر المستودع
3. اضبط إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. إعداد المتغيرات البيئية
في إعدادات الموقع، أضف المتغيرات البيئية

## النشر على Railway

### 1. إعداد Railway
1. انتقل إلى [railway.app](https://railway.app)
2. سجل دخولك
3. انقر على "New Project"

### 2. ربط المشروع
1. اختر "Deploy from GitHub repo"
2. اختر المستودع
3. اضبط إعدادات البناء

## النشر المحلي للإنتاج

### 1. بناء المشروع
```bash
npm run build
```

### 2. تشغيل الإنتاج
```bash
npm start
```

### 3. استخدام PM2 (موصى به)
```bash
npm install -g pm2
pm2 start npm --name "fantasy-app" -- start
pm2 save
pm2 startup
```

## إعداد Supabase للإنتاج

### 1. تحديث إعدادات الأمان
1. انتقل إلى إعدادات المشروع في Supabase
2. أضف نطاق موقعك إلى "Site URL"
3. أضف نطاق موقعك إلى "Redirect URLs"

### 2. إعداد CORS
في إعدادات API، أضف نطاق موقعك إلى قائمة CORS

### 3. مراقبة الأداء
1. استخدم Supabase Dashboard لمراقبة الاستعلامات
2. راقب استخدام قاعدة البيانات
3. اضبط السياسات حسب الحاجة

## نصائح الأداء

### 1. تحسين الصور
- استخدم Next.js Image component
- اضغط الصور قبل رفعها
- استخدم CDN للصور

### 2. تحسين قاعدة البيانات
- أضف فهارس للاستعلامات المتكررة
- استخدم RLS policies فعالة
- راقب استعلامات N+1

### 3. تحسين التطبيق
- استخدم React.memo للمكونات
- اضبط bundle splitting
- استخدم lazy loading

## مراقبة الأخطاء

### 1. Sentry
```bash
npm install @sentry/nextjs
```

### 2. LogRocket
```bash
npm install logrocket
```

## النسخ الاحتياطي

### 1. قاعدة البيانات
- استخدم Supabase Backups
- أضف cron jobs للنسخ الاحتياطي
- اختبر استعادة البيانات

### 2. الكود
- استخدم Git tags للإصدارات
- احتفظ بنسخ من المتغيرات البيئية
- وثق جميع التغييرات

## الأمان

### 1. HTTPS
- تأكد من تفعيل HTTPS
- استخدم HSTS headers
- اضبط Content Security Policy

### 2. المصادقة
- استخدم JWT tokens
- اضبط انتهاء صلاحية الجلسات
- راقب محاولات تسجيل الدخول

### 3. قاعدة البيانات
- استخدم RLS policies
- اضبط permissions بدقة
- راقب الاستعلامات المشبوهة

## الدعم والصيانة

### 1. المراقبة
- استخدم Uptime monitoring
- راقب أداء التطبيق
- اضبط تنبيهات للأخطاء

### 2. التحديثات
- حافظ على تحديث التبعيات
- اختبر التحديثات في بيئة التطوير
- استخدم semantic versioning

### 3. التوثيق
- وثق جميع التغييرات
- احتفظ بدليل المستخدم محدث
- وثق إجراءات الطوارئ 