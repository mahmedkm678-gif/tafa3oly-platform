import { isLoggedIn, isStudent, isTutor } from './auth.js'
import { buildNavbar } from './components/Navbar.js'
import { buildFooter } from './components/Footer.js'

const PAGE_TITLES = {
  'home': 'تفاعلي — منصة التعليم الذكية',
  'login': 'تسجيل دخول — تفاعلي',
  'register': 'إنشاء حساب — تفاعلي',
  'quran-request': 'طلب تحفيظ قرآن — تفاعلي',
  'student-dashboard': 'لوحة الطالب — تفاعلي',
  'tutor-dashboard': 'لوحة المدرس — تفاعلي',
  'edit-profile': 'تعديل الملف الشخصي — تفاعلي',
  '404': 'الصفحة غير موجودة — تفاعلي',
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
  }

  navigate(page) {
    if (page === this.currentPage) return

    if (!this.routes[page] && page !== 'home') {
      this.navigate('404')
      return
    }

    const guards = {
      'student-dashboard': isStudent,
      'tutor-dashboard': isTutor,
      'edit-profile': isLoggedIn,
      'quran-request': isLoggedIn,
    }

    const guard = guards[page]
    if (guard && !guard()) {
      this.navigate('login')
      return
    }

    if ((page === 'login' || page === 'register') && isLoggedIn()) {
      this.navigate(isStudent() ? 'student-dashboard' : 'tutor-dashboard')
      return
    }

    const prevPage = this.currentPage
    this.currentPage = page

    const prevRoute = this.routes[prevPage]
    if (prevRoute?.cleanup) {
      prevRoute.cleanup()
    }

    const route = this.routes[page]
    if (route) {
      this._wrap.style.opacity = '0'
      this._wrap.style.transition = 'opacity 0.2s ease'

      setTimeout(() => {
        try {
          this._wrap.innerHTML = route.render(this.navigate.bind(this))
        } catch (e) {
          console.error('Render error:', e)
          this._wrap.innerHTML = `
            <div class="page active" style="text-align:center;padding:100px 24px">
              <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--accent-purple);margin-bottom:16px"></i>
              <h2>عذراً، حدث خطأ في تحميل الصفحة</h2>
              <p style="color:var(--text-muted);margin:12px 0 24px">يرجى المحاولة مرة أخرى</p>
              <button class="btn btn-primary page-btn" data-page="home">العودة للرئيسية</button>
            </div>`
        }
        this._wrap.style.opacity = '1'
      }, 150)
    }

    window.scrollTo(0, 0)
    document.title = PAGE_TITLES[page] || PAGE_TITLES['home']
    buildNavbar(this.navigate.bind(this))
    buildFooter(this.navigate.bind(this))

    if (route?.init) {
      setTimeout(() => route.init(this.navigate.bind(this)), 200)
    }
  }

  start(initialPage) {
    this.navigate(initialPage)
  }
}
