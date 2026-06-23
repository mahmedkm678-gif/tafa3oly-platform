import { LEVELS_DATA } from '../constants.js'

export function buildFooter(navigate) {
  const html = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo"><span class="logo-cap"><i class="fas fa-graduation-cap"></i></span> تفاعلي</div>
            <p>منصة التعليم الذكية التي تجمع الطلاب والمدرسين في العالم العربي</p>
            <div class="social-links">
              <a class="social-icon" href="#"><i class="fab fa-twitter"></i></a>
              <a class="social-icon" href="#"><i class="fab fa-instagram"></i></a>
              <a class="social-icon" href="#"><i class="fab fa-telegram"></i></a>
              <a class="social-icon" href="#"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div>
            <h4 class="footer-nav-title">المستويات</h4>
            <ul class="footer-nav-list">
              ${LEVELS_DATA.map(l => `<li><a class="footer-nav-link" data-page="register">${l.label}</a></li>`).join('')}
            </ul>
          </div>
          <div>
            <h4 class="footer-nav-title">روابط سريعة</h4>
            <ul class="footer-nav-list">
              <li><a class="footer-nav-link" data-page="home">الرئيسية</a></li>
              <li><a class="footer-nav-link" data-page="register">إنشاء حساب</a></li>
              <li><a class="footer-nav-link" data-page="login">تسجيل دخول</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-nav-title">الدعم</h4>
            <ul class="footer-nav-list">
              <li><a class="footer-nav-link" href="#">الأسئلة الشائعة</a></li>
              <li><a class="footer-nav-link" href="#">الشروط والأحكام</a></li>
              <li><a class="footer-nav-link" href="#">سياسة الخصوصية</a></li>
              <li><a class="footer-nav-link" href="#">اتصل بنا</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="copyright">© 2026 تفاعلي — جميع الحقوق محفوظة</span>
          <div class="payment-methods">
            <span class="pay-badge">PayPal</span>
            <span class="pay-badge">Visa</span>
            <span class="pay-badge">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  `
  const wrap = document.getElementById('footerWrap')
  if (wrap) wrap.innerHTML = html

  document.querySelectorAll('#footerWrap [data-page]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page))
  })
}
