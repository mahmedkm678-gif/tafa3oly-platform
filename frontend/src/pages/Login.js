import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { api } from '../api.js'
import { isLoggedIn, isStudent } from '../auth.js'
import { EagleSeal } from '../components/EagleSeal.js'

export function renderLogin() {
  return `
    <div class="page" id="page-login" style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:100px 24px 40px">
      <div class="glass-card" style="width:100%;max-width:420px;padding:32px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-20px;left:-20px;opacity:0.04;transform:rotate(-15deg)">${EagleSeal(120, false)}</div>
        <div style="text-align:center;margin-bottom:28px;position:relative">
          <img src="/logo.jpg" alt="تفاعلي" style="width:54px;height:54px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);display:inline-block;">
          <h1 style="font-family:var(--font-heading);font-size:1.5rem;margin-top:12px;margin-bottom:4px">تسجيل دخول</h1>
          <p style="color:var(--text-gray-muted);font-size:.88rem">أهلاً بعودتك! سجل دخولك للمتابعة</p>
        </div>
        <form id="loginForm">
          <div class="form-group"><label>البريد الإلكتروني أو اسم المستخدم</label><input type="text" id="loginEmail" required placeholder="ahmed@example.com"></div>
          <div class="form-group"><label>كلمة المرور</label><input type="password" id="loginPassword" required placeholder="********"></div>
          <p id="loginError" style="color:#EF4444;font-size:.85rem;text-align:center;display:none"></p>
          <button type="submit" class="btn btn-primary" style="width:100%" id="loginBtn">دخول</button>
        </form>
        <div style="display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--text-gray-muted);font-size:.8rem"><span style="flex:1;height:1px;background:rgba(255,255,255,0.06)"></span>أو<span style="flex:1;height:1px;background:rgba(255,255,255,0.06)"></span></div>
        <div style="text-align:center;font-size:.9rem;color:var(--text-gray-muted)">ما عندك حساب؟ <a class="page-link" data-page="register" style="color:var(--red);font-weight:600;cursor:pointer">سجل الآن</a></div>
      </div>
    </div>
  `
}

export function initLogin(navigate) {
  if (isLoggedIn()) {
    navigate(isStudent() ? 'student-dashboard' : 'tutor-dashboard')
    return
  }
  const form = $('loginForm')
  if (!form) return
  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = $('loginBtn'), err = $('loginError')
    btn.disabled = true; btn.textContent = 'جاري الدخول...'; err.style.display = 'none'
    try {
      const d = await api('POST', '/login/', { email: $('loginEmail').value, password: $('loginPassword').value }, { auth: false })
      localStorage.setItem('access_token', d.token)
      localStorage.setItem('user', JSON.stringify(d.user))
      toast('تم تسجيل الدخول بنجاح', 'success')
      navigate(d.user.role === 'tutor' ? 'tutor-dashboard' : 'student-dashboard')
    } catch (e) { err.textContent = e.message; err.style.display = 'block' }
    finally { btn.disabled = false; btn.textContent = 'دخول' }
  })
}
