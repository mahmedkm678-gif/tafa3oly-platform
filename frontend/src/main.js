import './styles/main.css'

import { Router } from './router.js'
import { renderHome, initHome } from './pages/Home.js'
import { renderLogin, initLogin } from './pages/Login.js'
import { renderRegister, initRegister } from './pages/Register.js'
import { renderQuranRequest, initQuranRequest } from './pages/QuranRequest.js'
import { renderStudentDashboard, initStudentDashboard, cleanupStudentDashboard } from './pages/StudentDashboard.js'
import { renderTutorDashboard, initTutorDashboard, cleanupTutorDashboard } from './pages/TutorDashboard.js'
import { renderEditProfile, initEditProfile } from './pages/EditProfile.js'
import { renderPrivacy } from './pages/Privacy.js'
import { renderTerms } from './pages/Terms.js'
import { renderFAQ } from './pages/FAQ.js'
import { renderNotFound } from './pages/NotFound.js'
import { toast } from './components/Toast.js'

window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled:', e.reason)
  toast('حدث خطأ غير متوقع', 'error')
})

window.addEventListener('error', e => {
  console.error('Global error:', e.error || e.message)
})

const routes = {
  'home': { render: renderHome, init: initHome },
  'login': { render: renderLogin, init: initLogin },
  'register': { render: renderRegister, init: initRegister },
  'quran-request': { render: renderQuranRequest, init: initQuranRequest },
  'student-dashboard': { render: renderStudentDashboard, init: initStudentDashboard, cleanup: cleanupStudentDashboard },
  'tutor-dashboard': { render: renderTutorDashboard, init: initTutorDashboard, cleanup: cleanupTutorDashboard },
  'edit-profile': { render: renderEditProfile, init: initEditProfile },
  'privacy': { render: renderPrivacy },
  'terms': { render: renderTerms },
  'faq': { render: renderFAQ },
  '404': { render: renderNotFound },
}

const app = document.getElementById('app')
app.innerHTML = '<div id="navbar"></div><div id="page-wrap"></div><div id="footerWrap"></div>'

const router = new Router(routes, renderNotFound)
router.start('home')
