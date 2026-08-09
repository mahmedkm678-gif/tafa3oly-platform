import { isLoggedIn, isStudent, isTutor } from './auth.js'
import { buildNavbar } from './components/Navbar.js'
import { buildFooter } from './components/Footer.js'
import { initReveal, initCounters, initParallax, initScrollProgress, initCursorGlow, initTiltCards } from './utils/animations.js'

const PAGE_TITLES = {
  'home': 'تفاعلي — منصة التعليم الذكية',
  'login': 'تسجيل دخول — تفاعلي',
  'register': 'إنشاء حساب — تفاعلي',
  'quran-request': 'طلب تحفيظ قرآن — تفاعلي',
  'student-dashboard': 'لوحة الطالب — تفاعلي',
  'tutor-dashboard': 'لوحة المدرس — تفاعلي',
  'edit-profile': 'تعديل الملف الشخصي — تفاعلي',
  'privacy': 'سياسة الخصوصية — تفاعلي',
  'terms': 'الشروط والأحكام — تفاعلي',
  'faq': 'الأسئلة الشائعة — تفاعلي',
  'upload-request': 'ارفع ملفك — تفاعلي',
  'how-it-works': 'ازاي بتشتغل تفاعلي — تفاعلي',
  'offer-detail': 'تفاصيل الطلب والعروض — تفاعلي',
  'tutor-profile': 'بروفايل المدرس — تفاعلي',
  'payment': 'الدفع — تفاعلي',
  '404': 'الصفحة غير موجودة — تفاعلي',
}

const PAGE_METAS = {
  'home': {
    description: 'تفاعلي منصة تعليمية ذكية تربط طلاب الجامعات والمدارس بمدرسين متخصصين. تحليل بالذكاء الاصطناعي، متابعة تقدم، ودفع آمن عبر PayPal.',
    canonical: 'https://tafa3oly.com/',
  },
  'login': {
    description: 'سجّل دخولك على منصة تفاعلي للوصول إلى لوحة التحكم والمتابعة مع مدرسيك المتخصصين.',
    canonical: 'https://tafa3oly.com/login',
  },
  'register': {
    description: 'أنشئ حسابك المجاني على تفاعلي وابدأ رحلة التعلم مع أفضل المدرسين في العالم العربي.',
    canonical: 'https://tafa3oly.com/register',
  },
  'quran-request': {
    description: 'قدّم طلب تحفيظ القرآن الكريم مع مدرسين متخصصين معتمدين في التجويد والترتيل.',
    canonical: 'https://tafa3oly.com/quran-request',
  },
  'student-dashboard': {
    description: 'لوحة تحكم الطالب — تابع جلساتك وتقدمك التعليمي ومدرسيك على منصة تفاعلي.',
    canonical: 'https://tafa3oly.com/student-dashboard',
  },
  'tutor-dashboard': {
    description: 'لوحة تحكم المدرس — تابع طلبات الطلاب وعروض أسعارك وجلساتك على منصة تفاعلي.',
    canonical: 'https://tafa3oly.com/tutor-dashboard',
  },
  'edit-profile': {
    description: 'عدّل ملفك الشخصي على منصة تفاعلي — تحديث البيانات والتخصصات والمستوى التعليمي.',
    canonical: 'https://tafa3oly.com/edit-profile',
  },
  'privacy': {
    description: 'سياسة الخصوصية لمنصة تفاعلي — كيف نجمع ونستخدم ونحمي بياناتك الشخصية.',
    canonical: 'https://tafa3oly.com/privacy',
  },
  'terms': {
    description: 'الشروط والأحكام لاستخدام منصة تفاعلي — حقوق ومسؤوليات المستخدمين.',
    canonical: 'https://tafa3oly.com/terms',
  },
  'faq': {
    description: 'الأسئلة الشائعة حول منصة تفاعلي — كيف تبدأ، الدفع، المدفوعات، والمزيد.',
    canonical: 'https://tafa3oly.com/faq',
  },
  'upload-request': {
    description: 'ارفع ملفك على منصة تفاعلي ليحلله الذكاء الاصطناعي ويرشّح لك مدرساً متخصصاً في مستواك.',
    canonical: 'https://tafa3oly.com/upload-request',
  },
  'how-it-works': {
    description: 'ازاي بتشتغل تفاعلي للطلاب والمدرسين — ارفع ملفك، يحلله الذكاء الاصطناعي، يرشحلك مدرساً، وتختار من عروض المدرسين.',
    canonical: 'https://tafa3oly.com/how-it-works',
  },
  'offer-detail': {
    description: 'تفاصيل طلبك وعروض المدرسين — قارن الأسعار والتقييمات واقبل العرض اللي يناسبك على منصة تفاعلي.',
    canonical: 'https://tafa3oly.com/offer-detail',
  },
  'payment': {
    description: 'أكمل دفعك بأمان على منصة تفاعلي — بايبال أو إنستاباي أو فودافون كاش.',
    canonical: 'https://tafa3oly.com/payment',
  },
  'tutor-profile': {
    description: 'بروفايل المدرس على منصة تفاعلي — التخصص، المؤهلات، الخبرة، وتقييمات الطلاب. أول جلسة مجانية.',
    canonical: 'https://tafa3oly.com/tutor-profile',
  },
  '404': {
    description: 'الصفحة التي تبحث عنها غير موجودة. عُد إلى الصفحة الرئيسية لمنصة تفاعلي.',
    canonical: 'https://tafa3oly.com/',
  },
}

export class Router {
  constructor(routes, notFound) {
    this.routes = routes
    this.notFound = notFound
    this.currentPage = ''
    this._wrap = document.getElementById('page-wrap')
    this._wrap.addEventListener('click', e => {
      const btn = e.target.closest('.page-btn, .page-link')
      if (btn) this.navigate(btn.dataset.page)
    })
    window.addEventListener('popstate', () => {
      const page = this._pageFromPath()
      if (page && page !== this.currentPage) {
        this._doNavigate(page, false)
      }
    })
  }

  _pageFromPath() {
    const path = location.pathname.replace(/^\//, '')
    const q = location.search ? location.search.slice(1) : ''
    const p = path || 'home'
    return q ? p + '?' + q : p
  }

  _doNavigate(page, pushState = true) {
    const [routeKey, query] = String(page || 'home').split('?')
    const fullKey = query ? routeKey + '?' + query : routeKey
    if (fullKey === this.currentPage) return

    if (!this.routes[routeKey] && routeKey !== 'home') {
      this._doNavigate('404', pushState)
      return
    }

    const guards = {
      'student-dashboard': isStudent,
      'tutor-dashboard': isTutor,
      'edit-profile': isLoggedIn,
      'quran-request': isLoggedIn,
      'upload-request': isLoggedIn,
      'offer-detail': isLoggedIn,
      'payment': isLoggedIn,
    }

    const guard = guards[routeKey]
    if (guard && !guard()) {
      this._doNavigate('login', pushState)
      return
    }

    if ((routeKey === 'login' || routeKey === 'register') && isLoggedIn()) {
      this._doNavigate(isStudent() ? 'student-dashboard' : 'tutor-dashboard', pushState)
      return
    }

    const prevPage = this.currentPage
    this.currentPage = fullKey

    const prevRoute = this.routes[prevPage ? prevPage.split('?')[0] : '']
    if (prevRoute?.cleanup) {
      prevRoute.cleanup()
    }

    if (pushState && this._pageFromPath() !== fullKey) {
      history.pushState({ page: fullKey }, '', '/' + (routeKey === 'home' ? '' : routeKey) + (query ? '?' + query : ''))
    }

    const route = this.routes[routeKey]
    if (route) {
      this._wrap.classList.add('page-transitioning')

      setTimeout(() => {
        try {
          this._wrap.innerHTML = route.render(this.navigate.bind(this))
        } catch (e) {
          console.error('Render error:', e)
          this._wrap.innerHTML = `
            <div class="page active" style="text-align:center;padding:100px 24px">
              <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--red);margin-bottom:16px"></i>
              <h2>عذراً، حدث خطأ في تحميل الصفحة</h2>
              <p style="color:var(--text-muted);margin:12px 0 24px">يرجى المحاولة مرة أخرى</p>
              <button class="btn btn-primary page-btn" data-page="home">العودة للرئيسية</button>
            </div>`
        }

        initReveal(this._wrap)
        initCounters(this._wrap)
        initTiltCards(this._wrap)

        requestAnimationFrame(() => {
          this._wrap.classList.remove('page-transitioning')
        })

        if (route.init) {
          setTimeout(() => route.init(this.navigate.bind(this)), 80)
        }
      }, 250)
    }

    window.scrollTo(0, 0)
    document.title = PAGE_TITLES[routeKey] || PAGE_TITLES['home']

    const meta = PAGE_METAS[routeKey] || PAGE_METAS['home']
    let descEl = document.querySelector('meta[name="description"]')
    if (descEl) descEl.setAttribute('content', meta.description)
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (canonicalEl) canonicalEl.setAttribute('href', meta.canonical)

    buildNavbar(this.navigate.bind(this))
    buildFooter(this.navigate.bind(this))
    initParallax()
    initScrollProgress()
    initCursorGlow()
  }

  navigate(page) {
    this._doNavigate(page, true)
  }

  start(initialPage) {
    const pathPage = this._pageFromPath()
    const routeKey = pathPage.split('?')[0]
    const page = (routeKey !== 'home' && this.routes[routeKey]) ? pathPage : initialPage
    this._doNavigate(page, false)
  }
}
