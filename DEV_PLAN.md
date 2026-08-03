# 🗺️ خطة عمل "تفاعلي" — من التعليم إلى الإطلاق

> **Tafa3oly** — منصة تربط الطلاب العرب (🇸🇦 السعودية، 🇰🇼 الكويت، 🇦🇪 الإمارات، 🇶🇦 قطر، 🇧🇭 البحرين، 🇴🇲 عُمان، 🇪🇬 مصر) بمدرسين مصريين.
> نموذج العمل: الطالب يرفع ملف/PDF ← الذكاء الاصطناعي يحلل الصعوبة ويقترح سعراً ويرشّح مدرساً ← **المدرس يقرر السعر النهائي** (قبول/تعديل/رفض) ← أول جلسة مجانية ← الطالب يدفع المنصة عبر PayPal ← صرف أرباح المدرس شهرياً عبر إنستاباي/فودافون كاش.
>
> آخر تحديث: 2026-08-03 | Stack: Django 6 + DRF + PostgreSQL + Supabase + Gemini 2.0 Flash + PayPal REST SDK

---

## 📍 الوضع الحالي (Current State)

| المجال | الحالة | ملاحظات |
|--------|--------|---------|
| **Backend** | ✅ 46 اختباراً ناجحاً | Django 6.0.6 + DRF 3.17.1، 4 تطبيقات |
| **Frontend** | ✅ Build ناجح | Vite 6 Vanilla JS، RTL عربي، ثيم dark glassmorphism |
| **قاعدة البيانات** | ⚠️ SQLite (فارغة) | PostgreSQL جاهز عبر `DATABASE_URL` |
| **PayPal** | ✅ API كامل (وضع تجريبي) | يدفع الطالب المنصة فقط — لا تحويل مباشر للمدرس |
| **صرف المدرسين** | ✅ شهري عبر إنستاباي/فودافون كاش | موديل `Payout` + تجميع رصيد لكل عملة |
| **قرار المدرس** | ✅ AI يقترح — المدرس يقرر | `PUT /api/offers/<id>/respond/` (قبول/تعديل/رفض) |
| **أول جلسة مجانية** | ✅ `Session.is_trial` | تُنشأ تلقائياً عند أول قبول مع طالب جديد |
| **اعتماد المدرسين** | ✅ يدوي من الإدارة | `User.is_approved` + شكاوى وحظر `is_banned` |
| **Gemini AI** | ⚠️ كود متكامل — يعمل mock بدون مفتاح | يحتاج `GEMINI_API_KEY` حقيقي |
| **Supabase** | ⚠️ كود متكامل — يرفع محلياً بدون مفتاح | يحتاج `SUPABASE_URL` + `SUPABASE_KEY` |
| **Docker** | ⚠️ ينقصه `migrate` | الـ CMD الحالي لا يشغّل الترحيلات |
| **Railway** | ❌ لم ينشر بعد | الملفات جاهزة (`Dockerfile` + `railway.toml`) |
| **المفاتيح السرية** | ❌ كلها فارغة | GEMINI_API_KEY, SUPABASE_URL/KEY, PAYPAL_* في `.env` |

---

## 🟢 المرحلة 0: تشغيل الموقع (الأسبوع 1)

**الهدف:** موقع حي على الإنترنت — مستخدم حقيقي يسجل ويرفع ملف ويشاهد التسعير.

| # | المهمة | التفاصيل | الملفات المرتبطة |
|---|--------|----------|-------------------|
| 0.1 | **نشر Backend على Railway** | إنشاء مشروع Railway ← ربط مستودع GitHub ← إضافة `DATABASE_URL` PostgreSQL ← إضافة `SECRET_KEY` قوي ←Build & Deploy | `backend/Dockerfile`، `backend/railway.toml` |
| 0.2 | **إضافة `migrate` إلى Dockerfile** | تعديل `CMD` ليشمل ترحيل قاعدة البيانات قبل تشغيل gunicorn | `backend/Dockerfile` |
| 0.3 | **نشر Frontend على Vercel** | ربط مستودع ← تحديث `VITE_API_BASE` ← نشر ← تأكيد SSL | `frontend/.env`، `vercel.json` |
| 0.4 | **اختبار التكامل** | تسجيل مستخدم ← تسجيل دخول ← رفع ملف ← عرض التسعير | `backend/core/urls.py:11-14`، `frontend/src/api.js` |
| 0.5 | **CORS محكم** | بعد النشر: تغيير `CORS_ALLOW_ALL_ORIGINS` إلى `False` وإضافة domain Vercel | `backend/core/settings.py:210` |

### 🛠️ Dockerfile المعدل (مهمة 0.2)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-railway.txt .
RUN pip install --upgrade pip && pip install -r requirements-railway.txt

COPY . .

RUN SECRET_KEY=dummy python manage.py collectstatic --noinput --clear

EXPOSE 8000

CMD python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
```

### 🌐 المتغيرات المطلوبة على Railway

```
SECRET_KEY=<توليد مفتاح عشوائي قوي>
DEBUG=False
ALLOWED_HOSTS=.railway.app,<your-domain>
DATABASE_URL=<postgresql://... من add-on PostgreSQL>
SUPABASE_URL=
SUPABASE_KEY=
GEMINI_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=
```

---

## 🟡 المرحلة 1: MVP — الحلقة الأساسية (الأسبوع 2-3)

**الهدف:** إكمال دورة كاملة: رفع ملف → AI → عرض سعر → تطابق مع مدرس → دفع → جلسة → تقييم.

### 1.1 📁 Supabase — تخزين حقيقي للملفات

| # | المهمة | الملفات |
|---|--------|---------|
| 1.1.1 | إنشاء bucket `academic-files` في Supabase | لوحة Supabase |
| 1.1.2 | تفعيل Row Level Security للـ bucket | SQL editor في Supabase |
| 1.1.3 | إضافة `SUPABASE_URL` و `SUPABASE_KEY` حقيقية | `.env` (السحابي) |
| 1.1.4 | اختبار رفع ملف PDF ← استرجاع ← حذف | `backend/files/services.py` |
| 1.1.5 | رفع صورة البروفايل عبر Supabase (بدلاً `FileSystemStorage`) | `backend/users/services.py` |

**نموذج سياسة RLS للـ bucket:**
```sql
-- Allow public read access to files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'academic-files');

-- Allow authenticated upload
CREATE POLICY "Auth Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'academic-files' AND auth.role() = 'authenticated');

-- Allow owner delete
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'academic-files' AND owner = auth.uid());
```

### 1.2 💳 تفعيل PayPal في الواجهة

| # | المهمة | الملفات |
|---|--------|---------|
| 1.2.1 | الحصول على PayPal Client ID حقيقي (sandbox) | `developer.paypal.com` |
| 1.2.2 | إضافة أزرار PayPal في واجهة الدفع | `frontend/src/pages/` |
| 1.2.3 | ربط النقر بـ `POST /api/payments/create-order/` | `backend/payments/views.py` |
| 1.2.4 | تنفيذ `onApprove` ← `POST /api/payments/capture-order/` | `backend/payments/views.py` |
| 1.2.5 | تفعيل webhook عبر `PAYPAL_WEBHOOK_ID` | `backend/payments/views.py` |
| 1.2.6 | اختبار دفع كامل: أمر ← قبول ← تأكيد | `backend/payments/tests.py` |

**تدفق الدفع في الواجهة:**
```
مستخدم يضغط "دفع" ← frontend ينشئ Order عبر backend API
← نافذة PayPal تظهر ← المستخدم يسجل الدخول لـ PayPal ويدفع
← onApprove ترسل طلب capture للـ backend
← backend يؤكد الدفع ← إنشاء Session ← تحويل المستخدم إلى صفحة الجلسة
```

### 1.3 🤖 AI Tutor Matching (اقتراح تلقائي)

| # | المهمة | الملفات |
|---|--------|---------|
| 1.3.1 | تطوير خوارزمية مطابقة: مقارنة `teaching_level` مع `education_level` للملف | `backend/offers/services.py` |
| 1.3.2 | ترتيب المدرسين حسب: عدد الشهادات، الخبرة (سنوات)، التقييم | `backend/users/models.py` |
| 1.3.3 | إنشاء API endpoint: `GET /api/offers/match/?file_id=X` | `backend/offers/views.py` |
| 1.3.4 | عرض المدرسين المقترحين في dashboard الطالب | `frontend/src/pages/student_dashboard/` |
| 1.3.5 | إرسال إشعار للمدرس عند اختياره | عبر Polling في الـ dashboard |

**خوارزمية المطابقة المقترحة:**
```python
def match_tutors(file):
    tutors = User.objects.filter(
        role='tutor',
        teaching_level=file.education_level,
        is_available=True
    ).annotate(
        cert_count=Count('certificates'),
        avg_rating=Avg('received_reviews__rating')
    ).order_by('-cert_count', '-years_of_experience', '-avg_rating')
    return tutors
```

### 1.4 🔄 التدفق الكامل: Student → Tutor

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Upload  │ → │  Gemini  │ → │  Offer   │ → │ Payment  │ → │ Session  │
│  File    │   │ Analysis │   │ Matching │   │  PayPal  │   │  Start   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     ↓              ↓              ↓              ↓              ↓
  POST /api     Gemini         GET /api      POST /api/     Session
  /files/       يعود بـ       /offers/       payments/      created
  upload        difficulty     match?        create-order/  automatical
                + price        file_id=X                    ly after
                                                           payment OK
```

| # | الخطوة | الوصف | Endpoint |
|---|--------|-------|----------|
| 1.4.1 | **رفع ملف** | طالب يرفع PDF، النظام يستخرج النص | `POST /api/files/upload/` |
| 1.4.2 | **تحليل AI** | Gemini 2.0 Flash يحلل الصعوبة ويقترح سعراً | `files/services.py` → `analyze_with_gemini()` |
| 1.4.3 | **عرض السعر** | الطالب يرى السعر المقترح بناءً على البلد + المستوى | `GET /api/pricing/` |
| 1.4.4 | **اقتراح مدرسين** | النظام يقترح 3-5 مدرسين مناسبين | `GET /api/offers/match/?file_id=X` |
| 1.4.5 | **إرسال عرض** | الطالب يختار مدرساً ← Offer يُنشأ | `POST /api/offers/` |
| 1.4.6 | **قبول/رفض** | المدرس يرى العرض ويقبله أو يرفضه | `PATCH /api/offers/<id>/respond/` |
| 1.4.7 | **دفع** | بعد القبول، الطالب يدفع عبر PayPal | `POST /api/payments/create-order/` |
| 1.4.8 | **بدء الجلسة** | بعد تأكيد الدفع، Session تتولد تلقائياً | `payments/views.py:capture_order` |
| 1.4.9 | **تسجيل تقدم** | المدرس يسجل تقدم الطالب (juz/unit/cefr) | `POST /api/offers/progress/` |
| 1.4.10 | **تقييم** | الطالب يقيم المدرس بعد أول جلسة | `POST /api/offers/review/` |

### 📋 تفاصيل API المهمة

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/auth/register/` | تسجيل مستخدم جديد (student/tutor) |
| `POST` | `/api/auth/login/` | تسجيل دخول ← Token |
| `GET` | `/api/profile/` | عرض الملف الشخصي |
| `PATCH` | `/api/profile/` | تعديل الملف الشخصي |
| `POST` | `/api/files/upload/` | رفع ملف (PDF, image, doc) |
| `GET` | `/api/files/` | قائمة ملفات الطالب |
| `GET` | `/api/pricing/` | جدول التسعير (حسب البلد + المستوى) |
| `GET` | `/api/offers/match/?file_id=X` | المدرسين المقترحين لملف معين |
| `POST` | `/api/offers/` | إرسال عرض لمدرس |
| `GET` | `/api/offers/` | عروض المستخدم (student يرى عروضه، tutor يرى طلباته) |
| `PATCH` | `/api/offers/<id>/respond/` | قبول/رفض عرض (للمدرس) |
| `POST` | `/api/payments/create-order/` | إنشاء أمر PayPal |
| `POST` | `/api/payments/capture-order/` | تأكيد الدفع بعد موافقة PayPal |
| `POST` | `/api/offers/progress/` | تسجيل تقدم الطالب |
| `POST` | `/api/offers/review/` | تقييم المدرس |

---

## 🟠 المرحلة 2: الإطلاق الجاد (الأسبوع 4-5)

**الهدف:** موقع إنتاجي آمن، مزايا متقدمة، ولوحة متكاملة للمدرسين.

### 2.1 🚀 بيئة الإنتاج

| # | المهمة | التفاصيل |
|---|--------|----------|
| 2.1.1 | **Domain مخصص** | شراء domain (مثلاً `tafa3oly.com`) ← ربطه بـ Railway |
| 2.1.2 | **SSL/TLS** | تأكيد HTTPS عبر Railway (Cloudflare optional) |
| 2.1.3 | **CORS محكم** | `CORS_ALLOWED_ORIGINS = ['https://tafa3oly.com', 'https://www.tafa3oly.com']` |
| 2.1.4 | **بريد إلكتروني** | إرسال إيميلات الترحيب والتأكيد عبر SendGrid/Mailgun |
| 2.1.5 | **أمان** | Rate limiting، CSRF صارم، مراجعة صلاحيات API |
| 2.1.6 | **مراقبة** | Sentry للأخطاء، مراقبة أداء API |
| 2.1.7 | **Backup** | PostgreSQL backup آلي (يومي) عبر Railway |
| 2.1.8 | **HTTPS إجباري** | تأكيد `SECURE_SSL_REDIRECT = True` في settings.py |

### 2.2 🧠 AI متقدم

| # | المهمة | الوصف |
|---|--------|--------|
| 2.2.1 | تحليل محتوى PDF عميق | Gemini يستخرج الموضوع، عدد الصفحات، المصطلحات، الصعوبة |
| 2.2.2 | توصية بعدد الجلسات | بناءً على حجم المحتوى ومستوى الطالب |
| 2.2.3 | توصية بنوع الجلسة | فردي vs جماعي (حسب تعقيد المادة) |
| 2.2.4 | كشف المواد المتشابهة | هل سبق أن رفع طالب آخر نفس الملف؟ اقتراح مدرس متخصص |
| 2.2.5 | تحليل احتياجات المدرس | إشعارات ذكية للمدرسين بملفات تتناسب مع خبراتهم |

### 2.3 📊 لوحة المدرس الكاملة

| # | المهمة | الوصف |
|---|--------|-------|
| 2.3.1 | إحصائيات الدخل | إجمالي الأرباح، الشهر الحالي، الشهر الماضي |
| 2.3.2 | جدول الجلسات | عرض جلساتي (الحالية + السابقة + القادمة) |
| 2.3.3 | إدارة الطلاب | قائمة الطلاب الذين درّسهم، إمكانية التواصل |
| 2.3.4 | ملف تعريفي متقدم | إضافة فيديو تعريفي، روابط شهادات قابلة للتحقق |
| 2.3.5 | إشعارات داخلية | إشعارات باقتراب موعد جلسة، طلب جديد، رد على عرض |
| 2.3.6 | التقارير | تقارير PDF شهرية عن أداء المدرس وتقييماته |

---

## 🔴 المرحلة 3: Post-Launch (بعد الإطلاق)

**الهدف:** مزايا تنافسية، نموذج ربح واضح، وتوسع.

### 3.1 ✨ مزايا متقدمة

| # | الميزة | الوصف | الأولوية |
|---|--------|-------|----------|
| 3.1.1 | **AI Grading** | تصحيح تلقائي للواجبات عبر Gemini | 🥇 عالية |
| 3.1.2 | **جلسات جماعية** | Group sessions مع خصم جماعي (25-40%) | 🥇 عالية |
| 3.1.3 | **اشتراكات شهرية** | باقات اشتراك للطلاب (4/8/12 جلسة شهرياً) | 🥇 عالية |
| 3.1.4 | **WebSockets** | شات مباشر بين الطالب والمدرس | 🥈 متوسطة |
| 3.1.5 | **تكامل Zoom/Google Meet** | إنشاء رابط جلسة تلقائياً عند بدء الجلسة | 🥈 متوسطة |
| 3.1.6 | **تطبيق جوال** | PWA أو React Native للجوال | 🥉 منخفضة |
| 3.1.7 | **منتدى أسئلة** | Q&A لكل مادة، المدرسين يجيبون وأفضل إجابة تفوز | 🥉 منخفضة |
| 3.1.8 | **دعم عدة لغات** | English interface للمدرسين الأجانب مستقبلاً | 🥉 منخفضة |

### 3.2 💰 النموذج التجاري

| البند | القيمة |
|-------|--------|
| **عمولة المنصة** | 15% من كل جلسة |
| **سعر الجلسة النموذجي** | $15-30 (حسب البلد + المستوى) |
| **عائد المنصة لكل جلسة** | $2.25-4.50 |
| **هدف الجلسات شهرياً (شهر 1)** | 50 جلسة |
| **هدف الجلسات شهرياً (شهر 6)** | 500 جلسة |
| **الإيراد المتوقع (شهر 6)** | $1,125-2,250 شهرياً |
| **تكلفة التشغيل** | Railway ~$20/شهر + Supabase ~$25/شهر + Gemini API ~$10/شهر |
| **PayPal Fees** | 2.9% + $0.30 لكل معاملة |

**هيكل العمولة:**
- الطالب يدفع: سعر الجلسة للمنصة عبر PayPal
- المدرس يستلم: 85% من السعر (عمولة 15% تُخصم من سعر المدرس)
- الصرف: شهري عبر إنستاباي أو فودافون كاش (موديل `Payout`)
- أول جلسة مع أي مدرس مجانية (`Session.is_trial` — بلا دفع وبلا أرباح للمدرس)

> ⚠️ **مهم:** إيضاح هيكل الرسوم للمستخدمين في صفحة التسعير وTerms of Service.

---

## 📋 المهام الفورية (Next Actions)

### ✅ الأسبوع 1: أولويات قصوى

- [ ] **0.1** إنشاء مشروع على [Railway](https://railway.app) ← ربط مستودع GitHub
- [ ] **0.1** إضافة PostgreSQL add-on في Railway ← نسخ عنوان `DATABASE_URL`
- [ ] **0.1** إضافة جميع المتغيرات في Railway Dashboard (Settings → Environment)
- [ ] **0.2** تعديل `backend/Dockerfile` — إضافة `python manage.py migrate` قبل `gunicorn`
- [ ] **0.3** تحديث `frontend/.env` — `VITE_API_BASE=https://<your-app>.railway.app/api`
- [ ] **0.3** ربط frontend بمشروع Vercel ← تأكيد Build ← إضافة domain
- [ ] **0.4** اختبار: `curl https://<your-app>.railway.app/api/auth/login/` ← تأكيد HTTP 200
- [ ] **0.4** اختبار: تسجيل ← login ← رفع ملف ← عرض تسعير ← تأكيد بدون أخطاء CORS
- [ ] **0.5** تغيير `CORS_ALLOW_ALL_ORIGINS = False` ووضع `CORS_ALLOWED_ORIGINS`
- [ ] توثيق جميع المتغيرات في مكان آمن (وليس في الكود)

### ✅ الأسبوع 2-3: MVP

- [ ] **1.1.1** إنشاء bucket `academic-files` في Supabase
- [ ] **1.1.2** تفعيل RLS (سياسات الأمان)
- [ ] **1.1.3** إضافة مفاتيح Supabase الحقيقية إلى Railway env
- [ ] **1.1.4** اختبار رفع/استرجاع ملفات عبر Supabase
- [ ] **1.2.1** إنشاء PayPal app في `developer.paypal.com` (sandbox)
- [ ] **1.2.2** إضافة زر PayPal في frontend
- [ ] **1.2.3** ربط `create-order` + `capture-order` مع frontend
- [ ] **1.2.5** تفعيل webhook لوحة PayPal مع `PAYPAL_WEBHOOK_ID`
- [ ] **1.3.1** تنفيذ خوارزمية مطابقة المدرسين
- [ ] **1.3.3** إنشاء endpoint اقتراح المدرسين
- [ ] **1.4.1-1.4.10** اختبار التدفق الكامل (رفع → AI → عرض → قبول → دفع → جلسة → تقييم)

### ✅ الأسبوع 4-5: الإطلاق

- [ ] **2.1.1** شراء domain (مثلاً `tafa3oly.com`)
- [ ] **2.1.2** ربط domain بـ Railway + SSL
- [ ] **2.1.3** تكوين CORS محكم
- [ ] **2.1.4** تفعيل البريد الإلكتروني (SendGrid)
- [ ] **2.1.5** Rate limiting للـ API
- [ ] **2.1.7** PostgreSQL backup آلي
- [ ] **2.2.1** تحسين تحليل AI للمحتوى
- [ ] **2.3** لوحة مدرس متكاملة مع إحصائيات

---

## 🧭 خريطة الملفات الهامة

| الملف | الغرض |
|-------|-------|
| `backend/core/settings.py` | إعدادات Django، CORS، PayPal، AI، التسعير |
| `backend/core/urls.py` | توزيع المسارات — API تحت `/api/`، SPA catch-all للتطوير |
| `backend/users/models.py` | نموذج User (role، teaching_level، student_levels، languages، certificates...) |
| `backend/files/models.py` | نموذج File (education_level، country، price، AI analysis...) |
| `backend/offers/models.py` | Offer، Session، ProgressRecord، Review |
| `backend/payments/models.py` | Payment (status، PayPal order ID، payout) |
| `backend/files/services.py` | رفع Supabase، تحليل Gemini |
| `backend/payments/services.py` | إنشاء PayPal Orders، تأكيد المدفوعات، webhook |
| `frontend/src/api.js` | دالة API الموحدة — كل طلب يمر هنا |
| `frontend/src/constants.js` | المتغيرات الثابتة (API_BASE، LEVEL_MAP...) |
| `frontend/src/router.js` | توجيه الصفحات في الـ SPA |
| `Dockerfile` | بناء حاوية Docker للنشر على Railway |
| `railway.toml` | تكوين نشر Railway |
| `vercel.json` | تكوين نشر Vercel (جذر المشروع) |
| `frontend/vercel.json` | تكوين Vercel للـ SPA وتوجيه المسارات |

---

## ⚠️ ملاحظات مهمة

1. **Frontend منفصل عن Backend**: الـ SPA منشور على Vercel، والـ API على Railway. الـ catch-all في `core/urls.py` (`re_path(r"^.*$", serve, ...)`) هو فقط لتسهيل التطوير المحلي — **لا تعتمد عليه في الإنتاج**.

2. **المفاتيح السرية**: لا تضع أبداً `SECRET_KEY` أو `PAYPAL_CLIENT_SECRET` في الكود. استخدم `.env` محلياً ومتغيرات البيئة في Railway.

3. **PayPal في الإنتاج**: غيّر `PAYPAL_MODE` من `sandbox` إلى `live` عندما تكون جاهزاً للدفع الحقيقي. اختبر أولاً بحسابات Sandbox.

4. **Gemini API**: مفتاح Gemini مجاني لحد معين (60 طلب/دقيقة على الطبقة المجانية). كافٍ للمرحلة الأولى.

5. **Supabase**: خطط Supabase المجانية يعطيك 500 MB للتخزين و 2 GB للنقل — كافٍ لبداية التشغيل.

6. **اختبارات الـ Backend**: شغّل `python manage.py test` قبل كل نشر للتأكد من عدم كسر أي شيء.

7. **مزامنة الـ migrations**: بعد سحب تغييرات النموذج من Git، شغّل `python manage.py migrate` يدوياً أو عبر Dockerfile.

---

## 🏁 معايير النجاح لكل مرحلة

| المرحلة | معيار النجاح |
|---------|-------------|
| **🟢 0 — تشغيل** | موقع حي: تسجيل + رفع ملف + تسعير يعملون بدون أخطاء |
| **🟡 1 — MVP** | دورة كاملة: طالب يدفع ← مدرس يستلم ← جلسة تنعقد ← تقدم يُسجل |
| **🟠 2 — إطلاق** | 10 طلاب نشطين + 5 مدرسين نشطين + 20 جلسة شهرياً |
| **🔴 3 — Post-Launch** | 100+ طالب، AI Grading، اشتراكات، ربحية إيجابية |

> **"تفاعلي" ليست مجرد منصة — هي جسر تعليمي بين مصر والعالم العربي. كل جلسة هي فرصة لتغيير حياة طالب ومدرس.** 🇪🇬❤️🇸🇦🇰🇼🇦🇪🇶🇦
