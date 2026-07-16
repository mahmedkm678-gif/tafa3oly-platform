import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, 'dist')
const TEMPLATE = resolve(__dirname, 'dist', 'index.html')

const template = readFileSync(TEMPLATE, 'utf-8')

const PAGES = {
  '/': {
    title: 'تفاعلي — منصة التعليم الذكية: اربط بالطلاب والمدرسين في العالم العربي',
    description: 'تفاعلي منصة تعليمية ذكية تربط طلاب الجامعات والمدارس بمدرسين متخصصين. تحليل بالذكاء الاصطناعي، متابعة تقدم، ودفع آمن عبر PayPal.',
    canonical: 'https://tafa3oly.com/',
    ogTitle: 'تفاعلي — منصة التعليم الذكية',
    ogDesc: 'ارفع ملفك الأكاديمي، دع الذكاء الاصطناعي يحلله، وابدأ التعلم مع أفضل المدرسين في العالم العربي.',
    content: `
      <noscript>
        <div style="max-width:800px;margin:80px auto;padding:0 24px;text-align:center;font-family:Tajawal,sans-serif;color:#e2e8f0">
          <h1 style="font-size:2.5rem;font-weight:900;margin-bottom:16px">منصة <span style="color:#8b5cf6">تفاعلي</span> التعليمية</h1>
          <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px">الحل الأمثل للتحصيل الدراسي، حفظ القرآن الكريم، اللغات الأجنبية، المشاريع الجامعية، وتأسيس الأطفال</p>
          <p style="color:#94a3b8;margin-bottom:16px">ارفع ملفك الأكاديمي، يحلله الذكاء الاصطناعي ويحدد مستواك بدقة، ويقترح أفضل مدرس يناسبك</p>
          <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:24px 0">
            <a href="/register" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:12px 24px;border-radius:16px;font-weight:700;text-decoration:none">ابدأ مجاناً</a>
            <a href="/quran-request" style="background:rgba(255,255,255,0.04);color:#e2e8f0;padding:12px 24px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);text-decoration:none">تحفيظ قرآن</a>
          </div>
          <h2 style="font-size:1.5rem;font-weight:800;margin-top:48px;margin-bottom:16px">المستويات التعليمية</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;text-align:right">
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#10b981;margin-bottom:6px">القرآن الكريم</h3>
              <p style="font-size:.85rem;color:#94a3b8">حفظ وتجويد مع مدرسين متخصصين</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#3b82f6;margin-bottom:6px">الجامعة</h3>
              <p style="font-size:.85rem;color:#94a3b8">مقررات جامعية في جميع التخصصات</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#ec4899;margin-bottom:6px">الثانوية</h3>
              <p style="font-size:.85rem;color:#94a3b8">مواد الثانوية العامة والقدرات</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#f59e0b;margin-bottom:6px">المتوسطة</h3>
              <p style="font-size:.85rem;color:#94a3b8">جميع مواد المرحلة المتوسطة</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#10b981;margin-bottom:6px">الابتدائية</h3>
              <p style="font-size:.85rem;color:#94a3b8">تأسيس قوي في القراءة والكتابة</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#a855f7;margin-bottom:6px">رياض الأطفال</h3>
              <p style="font-size:.85rem;color:#94a3b8">برنامج تعليمي مبكر باللعب</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
              <h3 style="color:#ec4899;margin-bottom:6px">اللغات</h3>
              <p style="font-size:.85rem;color:#94a3b8">8 لغات مع مدرسين ناطقين أصليين</p>
            </div>
          </div>
          <h2 style="font-size:1.5rem;font-weight:800;margin-top:48px;margin-bottom:16px">الأسئلة الشائعة</h2>
          <div style="text-align:right">
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px">
              <h3 style="font-weight:700;margin-bottom:8px">كيف تعمل منصة تفاعلي؟</h3>
              <p style="color:#94a3b8;font-size:.9rem">قم برفع ملفك الأكاديمي (PDF)، يقوم الذكاء الاصطناعي بتحليله وتحديد مستواك بدقة، ثم يقترح لك أفضل مدرس يناسب مستواك وميزانيتك.</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px">
              <h3 style="font-weight:700;margin-bottom:8px">ما هي المستويات التعليمية المدعومة؟</h3>
              <p style="color:#94a3b8;font-size:.9rem">تدعم تفاعلي 7 مستويات: القرآن الكريم، الجامعة، الثانوية، المتوسطة، الابتدائية، رياض الأطفال، واللغات (8 لغات بمعايير CEFR).</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px">
              <h3 style="font-weight:700;margin-bottom:8px">ما هي الدول المدعومة؟</h3>
              <p style="color:#94a3b8;font-size:.9rem">نعمل في 6 دول خليجية: السعودية، الكويت، الإمارات، قطر، البحرين، وعمان.</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px">
              <h3 style="font-weight:700;margin-bottom:8px">كيف يحصل المدرسون على أرباحهم؟</h3>
              <p style="color:#94a3b8;font-size:.9rem">يحصل كل مدرس على 85% من قيمة الجلسة، وتحتفظ المنصة بـ 15% فقط كرسوم خدمة. الدفع يتم عبر PayPal بشكل آمن.</p>
            </div>
            <div style="background:rgba(10,19,44,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px">
              <h3 style="font-weight:700;margin-bottom:8px">هل يمكن الحجز لمجموعة من الطلاب؟</h3>
              <p style="color:#94a3b8;font-size:.9rem">نعم، نوفر جلسات جماعية بأسعار مخفضة تصل إلى 30% أقل من الجلسات الفردية، مع حد أقصى 10 طلاب لكل جلسة.</p>
            </div>
          </div>
          <p style="color:#64748b;font-size:.8rem;margin-top:48px">الرجاء تفعيل JavaScript لتجربة الموقع الكاملة.</p>
        </div>
      </noscript>
    `,
  },
  '/login': {
    title: 'تسجيل دخول — تفاعلي',
    description: 'سجّل دخولك على منصة تفاعلي للوصول إلى لوحة التحكم والمتابعة مع مدرسيك المتخصصين.',
    canonical: 'https://tafa3oly.com/login',
    ogTitle: 'تسجيل دخول — تفاعلي',
    ogDesc: 'سجّل دخولك على منصة تفاعلي للوصول إلى لوحة التحكم والمتابعة مع مدرسيك.',
    content: `
      <noscript>
        <div style="max-width:420px;margin:100px auto;padding:0 24px;text-align:center;font-family:Tajawal,sans-serif;color:#e2e8f0">
          <h1 style="font-size:1.6rem;margin-bottom:6px">تسجيل دخول</h1>
          <p style="color:#94a3b8;margin-bottom:24px;font-size:.9rem">أهلاً بعودتك! سجل دخولك للمتابعة</p>
          <p style="color:#94a3b8;font-size:.9rem">الرجاء تفعيل JavaScript لتسجيل الدخول.</p>
          <a href="/" style="color:#8b5cf6;font-weight:600;margin-top:16px;display:inline-block">العودة للرئيسية</a>
        </div>
      </noscript>
    `,
  },
  '/register': {
    title: 'إنشاء حساب — تفاعلي',
    description: 'أنشئ حسابك المجاني على تفاعلي وابدأ رحلة التعلم مع أفضل المدرسين في العالم العربي.',
    canonical: 'https://tafa3oly.com/register',
    ogTitle: 'إنشاء حساب — تفاعلي',
    ogDesc: 'أنشئ حسابك المجاني على تفاعلي وابدأ رحلة التعلم مع أفضل المدرسين.',
    content: `
      <noscript>
        <div style="max-width:600px;margin:100px auto;padding:0 24px;text-align:center;font-family:Tajawal,sans-serif;color:#e2e8f0">
          <h1 style="font-size:1.6rem;margin-bottom:6px">إنشاء حساب جديد</h1>
          <p style="color:#94a3b8;margin-bottom:24px;font-size:.9rem">سجل كمدرس أو طالب في المنصة</p>
          <p style="color:#94a3b8;font-size:.9rem">الرجاء تفعيل JavaScript لإنشاء الحساب.</p>
          <a href="/" style="color:#8b5cf6;font-weight:600;margin-top:16px;display:inline-block">العودة للرئيسية</a>
        </div>
      </noscript>
    `,
  },
  '/quran-request': {
    title: 'طلب تحفيظ قرآن — تفاعلي',
    description: 'قدّم طلب تحفيظ القرآن الكريم مع مدرسين متخصصين معتمدين في التجويد والترتيل.',
    canonical: 'https://tafa3oly.com/quran-request',
    ogTitle: 'طلب تحفيظ قرآن — تفاعلي',
    ogDesc: 'قدّم طلب تحفيظ القرآن الكريم مع مدرسين متخصصين معتمدين.',
    content: `
      <noscript>
        <div style="max-width:600px;margin:100px auto;padding:0 24px;text-align:center;font-family:Tajawal,sans-serif;color:#e2e8f0">
          <h1 style="font-size:1.6rem;margin-bottom:6px">طلب تحفيظ قرآن</h1>
          <p style="color:#94a3b8;margin-bottom:16px;font-size:.9rem">قدّم طلبك للحصول على أفضل مدرس قرآن يناسبك</p>
          <p style="color:#94a3b8;font-size:.9rem">الرجاء تفعيل JavaScript لتقديم الطلب.</p>
          <a href="/" style="color:#8b5cf6;font-weight:600;margin-top:16px;display:inline-block">العودة للرئيسية</a>
        </div>
      </noscript>
    `,
  },
}

function buildPage(route, meta) {
  let html = template

  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${meta.title}</title>`
  )

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${meta.canonical}" />`
  )

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${meta.ogTitle}" />`
  )
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${meta.ogDesc}" />`
  )
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${meta.canonical}" />`
  )

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${meta.ogTitle}" />`
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${meta.ogDesc}" />`
  )

  // Insert prerender content before closing </body>
  html = html.replace('</body>', `${meta.content}\n</body>`)

  return html
}

console.log(' prerendering pages...')

let count = 0
for (const [route, meta] of Object.entries(PAGES)) {
  const html = buildPage(route, meta)

  if (route === '/') {
    writeFileSync(resolve(DIST, 'index.html'), html, 'utf-8')
    console.log(`  ✓ ${route} → index.html`)
  } else {
    const dir = resolve(DIST, route.slice(1))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(resolve(dir, 'index.html'), html, 'utf-8')
    console.log(`  ✓ ${route} → ${route.slice(1)}/index.html`)
  }
  count++
}

console.log(`\n prerendered ${count} pages successfully!`)
