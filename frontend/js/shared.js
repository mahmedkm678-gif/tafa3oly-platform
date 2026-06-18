const API_BASE = 'http://127.0.0.1:8000/api';

function getToken() { return localStorage.getItem("access_token"); }
function getUser() {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}
function isLoggedIn() { return !!getToken() && !!getUser(); }
function isStudent() { const u = getUser(); return u && u.role === "student"; }
function isTutor() { const u = getUser(); return u && u.role === "tutor"; }
function getRole() { const u = getUser(); return u ? u.role : null; }

function setUserData(user) { localStorage.setItem("user", JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem("access_token"); localStorage.removeItem("user"); }

async function api(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    const token = getToken();
    if (token) opts.headers["Authorization"] = "Bearer " + token;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw { status: res.status, data };
    return data;
}

function apiForm(formEl) {
    const obj = {};
    const fd = new FormData(formEl);
    for (const [k, v] of fd) obj[k] = v;
    return obj;
}

function buildNavbar() {
    const user = getUser();
    const loggedIn = isLoggedIn();
    const role = getRole();
    let menuItems = "";
    if (!loggedIn) {
        menuItems = `
            <li><a class="nav-link" href="../index.html">الرئيسية</a></li>
            <li><a class="nav-link" href="login.html">تسجيل الدخول</a></li>
            <li><a class="nav-link" href="register.html">إنشاء حساب</a></li>
        `;
    } else if (role === "student") {
        menuItems = `
            <li><a class="nav-link" href="../index.html">الرئيسية</a></li>
            <li><a class="nav-link" href="student_dashboard.html">لوحة التحكم</a></li>
            <li><a class="nav-link" href="quran_request.html"><i class="fas fa-mosque"></i> تحفيظ قرآن</a></li>
            <li><a class="nav-link" href="edit_profile.html">الملف الشخصي</a></li>
        `;
    } else if (role === "tutor") {
        menuItems = `
            <li><a class="nav-link" href="../index.html">الرئيسية</a></li>
            <li><a class="nav-link" href="tutor_dashboard.html">لوحة التحكم</a></li>
            <li><a class="nav-link" href="edit_profile.html">الملف الشخصي</a></li>
        `;
    }
    return `
    <header class="header">
      <div class="container nav-wrapper">
        <a href="../index.html" class="logo"><span class="logo-cap"><i class="fas fa-graduation-cap"></i></span> تفاعلي</a>
        <button class="menu-toggle" onclick="this.nextElementSibling.classList.toggle('open')"><i class="fas fa-bars"></i></button>
        <ul class="nav-menu">${menuItems}</ul>
        <div class="nav-actions">
          ${loggedIn ? `<div class="nav-user"><span>${user.first_name || user.username}</span><a href="edit_profile.html"><img src="${user.profile_picture_url || '../static/default-avatar.png'}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(139,92,246,0.3)"></a><button class="btn btn-sm btn-ghost" onclick="handleLogout()">تسجيل خروج</button></div>` : `<a href="login.html" class="btn btn-sm btn-ghost">دخول</a><a href="register.html" class="btn btn-sm btn-primary">اشتراك</a>`}
        </div>
      </div>
    </header>
    <div style="height: 72px;"></div>
    `;
}

function buildFooter() {
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo"><span class="logo-cap"><i class="fas fa-graduation-cap"></i></span> تفاعلي</div>
            <p>أول منصة تعليمية ذكية في الخليج لربط طلاب الجامعات بمعلمين معتمدين لشرح الملفات الأكاديمية بتسعير عادل مدعوم بالذكاء الاصطناعي.</p>
            <div class="social-links">
              <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div>
            <h4 class="footer-nav-title">الخدمات</h4>
            <ul class="footer-nav-list">
              <li><a href="#" class="footer-nav-link">تحليل الملفات بالـ AI</a></li>
              <li><a href="quran_request.html" class="footer-nav-link">تحفيظ القرآن الكريم</a></li>
              <li><a href="#" class="footer-nav-link">الشرح التفاعلي الذكي</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-nav-title">روابط هامة</h4>
            <ul class="footer-nav-list">
              <li><a href="../index.html" class="footer-nav-link">الرئيسية</a></li>
              <li><a href="#" class="footer-nav-link">الشروط والأحكام</a></li>
              <li><a href="#" class="footer-nav-link">سياسة الخصوصية</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-nav-title">تواصل معنا</h4>
            <ul class="footer-nav-list">
              <li><a href="#" class="footer-nav-link">support@tafa3oly.com</a></li>
              <li><a href="#" class="footer-nav-link">+966 55 123 4567</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="copyright">© 2026 منصة تفاعلي التعليمية. جميع الحقوق محفوظة.</p>
          <div class="payment-methods">
            <span class="pay-badge"><i class="fas fa-cc-visa"></i> Visa</span>
            <span class="pay-badge"><i class="fas fa-cc-mastercard"></i> Mastercard</span>
            <span class="pay-badge"><i class="fab fa-cc-paypal"></i> PayPal</span>
          </div>
        </div>
      </div>
    </footer>
    `;
}

function handleLogout() {
    clearAuth();
    window.location.href = "../index.html";
}

const LEVEL_MAP = {
    quran: "القرآن الكريم", university: "الجامعة", high_school: "الثانوية",
    middle_school: "المتوسطة", primary: "الابتدائية", kindergarten: "رياض الأطفال", languages: "اللغات",
};
const LANG_MAP = {
    en: "الإنجليزية", fr: "الفرنسية", de: "الألمانية", es: "الإسبانية",
    it: "الإيطالية", tr: "التركية", zh: "الصينية", ru: "الروسية",
};
const LEVELS_DATA = [
    { code: 'quran', label: 'القرآن الكريم', icon: 'fa-mosque' },
    { code: 'university', label: 'الجامعة', icon: 'fa-university' },
    { code: 'high_school', label: 'الثانوية', icon: 'fa-school' },
    { code: 'middle_school', label: 'المتوسطة', icon: 'fa-book-open' },
    { code: 'primary', label: 'الابتدائية', icon: 'fa-child' },
    { code: 'kindergarten', label: 'رياض الأطفال', icon: 'fa-cubes' },
    { code: 'languages', label: 'اللغات', icon: 'fa-language' },
];
const LANG_DATA = [
    { code: 'en', label: 'الإنجليزية' }, { code: 'fr', label: 'الفرنسية' },
    { code: 'de', label: 'الألمانية' }, { code: 'es', label: 'الإسبانية' },
    { code: 'it', label: 'الإيطالية' }, { code: 'tr', label: 'التركية' },
    { code: 'zh', label: 'الصينية' }, { code: 'ru', label: 'الروسية' },
];
const LEVEL_ICONS = {};
LEVELS_DATA.forEach(l => LEVEL_ICONS[l.code] = l.icon);
const DAYS = [
    { key: 'sat', label: 'السبت' }, { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الإثنين' }, { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' }, { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' },
];
function redirectIfAuth() { if (isLoggedIn()) { window.location.href = getRole() === 'tutor' ? 'tutor_dashboard.html' : 'student_dashboard.html'; } }
function redirectIfGuest() { if (!isLoggedIn()) { window.location.href = 'login.html'; } }
