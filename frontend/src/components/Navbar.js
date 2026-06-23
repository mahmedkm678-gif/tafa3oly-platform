import { getUser, isLoggedIn, isStudent, isTutor, logout as authLogout } from '../auth.js'

export function buildNavbar(navigate) {
  const u = getUser()
  const li = isLoggedIn()
  const links = `
    <li><a class="nav-link" data-page="home">الرئيسية</a></li>
    ${li ? (isStudent()
      ? `<li><a class="nav-link" data-page="student-dashboard">لوحة التحكم</a></li>`
      : `<li><a class="nav-link" data-page="tutor-dashboard">لوحة التحكم</a></li>`)
      : ''}
    ${li ? '' : `<li><a class="nav-link" data-page="register">انضم الآن</a></li>`}
  `
  const actions = li
    ? `<div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:.85rem;color:var(--text-gray-muted)">${u.first_name || u.username || ''}</span>
        <button class="btn btn-sm btn-ghost" id="logoutBtn"><i class="fas fa-sign-out-alt"></i></button>
       </div>`
    : `<button class="btn btn-sm btn-primary" data-page="login">دخول</button>
       <button class="btn btn-sm btn-secondary" data-page="register">تسجيل</button>`

  const html = `
    <header class="header">
      <div class="container">
        <div class="nav-wrapper">
          <div class="logo" data-page="home">
            <span class="logo-cap"><i class="fas fa-graduation-cap"></i></span> تفاعلي
          </div>
          <ul class="nav-menu" id="navMenu" role="navigation">${links}</ul>
          <div class="nav-actions">${actions}</div>
          <button class="menu-toggle" id="menuToggle" aria-label="فتح القائمة"><i class="fas fa-bars"></i></button>
        </div>
      </div>
    </header>
  `
  document.getElementById('navbar').innerHTML = html

  document.querySelectorAll('#navbar [data-page]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('navMenu')?.classList.remove('open')
      navigate(el.dataset.page)
    })
  })

  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authLogout()
      navigate('home')
    })
  }

  const menuToggle = document.getElementById('menuToggle')
  const navMenu = document.getElementById('navMenu')
  menuToggle?.addEventListener('click', e => {
    e.stopPropagation()
    navMenu?.classList.toggle('open')
  })
  document.addEventListener('click', e => {
    if (navMenu?.classList.contains('open') && !e.target.closest('.header')) {
      navMenu.classList.remove('open')
    }
  })
}
