# PROJECT_MAP — منصة تفاعلي (Tafa3oly)

> آخر تحديث: 2026-06-17 (جميع Milestones 1-10 ✅)  
> البيئة: Python 3.12.10 / Django 6.0.6 / DRF 3.17.1

---

## [TECH_STACK]

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| Backend | Django | 6.0.6 |
| API | Django REST Framework | 3.17.1 |
| Database | SQLite (dev) / PostgreSQL (prod via DATABASE_URL) | — |
| AI | google-genai (Gemini 2.0 Flash) | >=2.0.0 |
| Storage | Supabase (files + profile pictures) | — |
| Payments | PayPal REST SDK (paypalrestsdk) | >=1.13.0 |
| Auth | TokenAuthentication (DRF) | — |
| Frontend | Vanilla HTML/CSS/JS (RTL Arabic) | — |
| Hosting | Railway (Docker + gunicorn) | — |
| Static Files | Whitenoise (CompressedManifestStaticFilesStorage) | >=6.6.0 |
| PDF | PyPDF2 | >=3.0.0 |

---

## [SYSTEM_FLOW]

### رحلة المستخدم — Student

```
Landing Page → Register (اختيار مستوى/مستويات)
→ Student Dashboard (7 tabs)
  ├── 📖 قرآن: طلب تحفيظ → structured-request → عرض العروض ← قبول → دفع → متابعة تقدم
  ├── 🎓 جامعي: رفع PDF → AI تحليل → تسعير → عرض العروض ← قبول → دفع → جلسة
  ├── 📐 ثانوي: نفس جامعي (أسعار مختلفة)
  ├── 📚 إعدادي: نفس جامعي (أسعار مختلفة)
  ├── ✏️ ابتدائي: نفس جامعي (أسعار مختلفة)
  ├── 🧸 حضانة: structured-request → عرض العروض ← قبول → دفع → متابعة تقدم
  └── 🌐 لغات: structured-request → عرض العروض ← قبول → دفع → متابعة تقدم
```

### رحلة المستخدم — Tutor

```
Landing Page → Register (اختيار مستوى واحد + لغات لو لغات)
→ Tutor Dashboard (7 tabs — يرى فقط طلبات مستواه)
  ├── عرض الطلبات المتاحة ← إرسال عرض سعر
  ├── عروضي (pending/accepted/rejected)
  └── جلساتي ← تسجيل تقدم (حسب النوع: juz/unit/cefr)
```

### تدفق API

```
Client → [Token Auth] → Django Views → Serializers → Models → DB
                                        ↕
                                   Supabase (files)
                                        ↕
                                   Gemini AI (analysis)
                                        ↕
                                   PayPal (payments)
```

### هيكل الملفات

```
/ (جذر المشروع)
├── core/          — Django project config (settings, urls, wsgi)
├── users/         — User model, auth, profile, ping
├── files/         — File model, upload, AI analysis, Quran/KG/Lang requests
├── offers/        — Request/Session/Progress models, tutor offers
├── payments/      — Payment model, PayPal integration, webhook
├── frontend/      — HTML/CSS/JS pages
│   ├── css/       — design-system.css (مشترك، ثيم داكن glassmorphism)
│   ├── js/        — shared.js (navbar, footer, API, LEVEL_MAP)
│   ├── ui design/ — إصدار متقدم (Spline 3D, simulator, MathJax) للدمج لاحقاً
│   └── *.html     — 8 صفحات (index, login, register, student_dashboard, tutor_dashboard, edit_profile, quran_request, structured_request_iface)
├── staticfiles/   — Whitenoise output
├── media/         — Local file uploads (dev only)
├── Dockerfile     — Python 3.11-slim + gunicorn
├── railway.toml   — Railway deployment config
└── .env.example   — متغيرات البيئة
```

---

## [ARCHITECTURE]

### اعتمادات التصميم (Design Decisions)

1. **EducationLevel كحقل في File** — ليس table منفصل. كل File ينتمي لمستوى واحد.
2. **User.teaching_level** — حقل واحد للمدرس (وفقاً للطلب). `User.student_levels` JSON للطالب (عدة مستويات).
3. **ProgressRecord واحد** — بثلاث مجموعات حقول (juz/unit/cefr) + `progress_type` بدلاً من 3 موديلز.
4. **Tiered Pricing** — `PRICING` dict موسع بـ level dimension في `settings.py`.
5. **Quran/Kindergarten/Languages** — نفس الـ flow (structured-request + availability + progress tracking).
6. **لا WebSockets** — Polling كل 10 ثواني للداشبورد (كافٍ للمرحلة الحالية).
7. **لا إشعارات** بريد إلكتروني (يضاف لاحقاً كخيار).

### Domain Model — العلاقات

```
User (1) ───→ File (N)          [student]
User (1) ───→ Request (N)       [tutor]
File  (1) ───→ Request (N)
Request (1) ─→ Session (1)
Session (1) ─→ Payment (1)
Session (1) ─→ ProgressRecord (N)
```

### Pricing Structure

```python
PRICING = {
    "SA": {
        "quran":        {"solo": 20, "group": 14},
        "university":   {"solo": 30, "group": 20},
        "high_school":  {"solo": 25, "group": 17},
        "middle_school": {"solo": 20, "group": 14},
        "primary":      {"solo": 15, "group": 10},
        "kindergarten": {"solo": 12, "group": 8},
        "language":     {"solo": 25, "group": 17},
    },
    "KW": {"quran": {"solo": 1.7, "group": 1.2}, ...},
    "AE": {"quran": {"solo": 20, "group": 14}, ...},
    "QA": {"quran": {"solo": 20, "group": 14}, ...},
}
```

### Progress Tracking Fields

| `progress_type` | الحقول المستخدمة | مثال |
|-----------------|------------------|------|
| `quran` | `juz_from` (1-30), `juz_to` (1-30) | جزء 10 ← جزء 12 |
| `kindergarten` | `unit_from` (int), `unit_to` (int) | Unit 3 ← Unit 5 |
| `language` | `cefr_from` (A1-C2), `cefr_to` (A1-C2) | A1 ← A2 |

---

## [ORPHANS & PENDING]

- [ ] **API keys مفقودة**: GEMINI_API_KEY, SUPABASE_URL/KEY, PAYPAL_* في `.env` — الموقع يعمل بدونها عدا الوظائف المتصلة بها
- [ ] **Supabase profile picture upload** — يحتاج SUPABASE_URL + KEY (RuntimeError إذا مش موجودين)
- [ ] **PayPal webhook** — يحتاج PAYPAL_WEBHOOK_ID للتوقيع (بدونه يتخطى التحقق)
- [ ] **Email notifications** — غير مطبقة
- [ ] **WebSocket** للشات المباشر — غير مطبق (الدردشة مجرد وهم في الـ simulator)
- [ ] **Testing** — لا توجد اختبارات آلية (`tests.py` فارغ)
- [x] **الـ index.html الجديد** — تم تبنيه كصفحة رئيسية بالثيم الداكن (فيه 7 level cards, glassmorphism, خط Tajawal)
- [ ] **ui design/ القديم** — مجلد `frontend/ui design/` يحتوي CSS/JS متقدم (Spline 3D, MathJax, simulator) ممكن دمجه لاحقاً

---

## [MILESTONES]

| # | Milestone | الحالة |
|---|-----------|--------|
| 1 | Backend: Models (EducationLevel, Language, ProgressRecord) + migrations | ✅ |
| 2 | Backend: Tiered pricing + views/serializers (users, offers, files) | ✅ |
| 3 | Frontend: design-system.css + shared.js | ✅ |
| 4 | Landing page: dark glassmorphism + 7 education level cards | ✅ |
| 5 | Register/Login: dark theme + level/language selection | ✅ |
| 6 | Student Dashboard: 7 dynamic tabs + dark theme | ✅ |
| 7 | Tutor Dashboard: single level + progress by type + dark theme | ✅ |
| 8 | Structured request: inline in student dashboard (Quran/KG/Lang) | ✅ |
| 9 | Edit profile: dark theme + teaching_level/student_levels/languages | ✅ |
| 10 | manage.py check ✅ + all 8 URLs serving 200 | ✅ |
