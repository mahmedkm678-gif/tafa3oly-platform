import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { LEVELS_DATA, LANG_DATA } from '../constants.js'
import { api } from '../api.js'
import { isLoggedIn, isStudent } from '../auth.js'
import { EagleSeal } from '../components/EagleSeal.js'

export function renderRegister() {
  return `
    <div class="page" id="page-register" style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:100px 24px 40px">
      <div class="glass-card" style="width:100%;max-width:600px;padding:32px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-20px;right:-20px;opacity:0.04;transform:rotate(15deg)">${EagleSeal(120, false)}</div>
        <div style="text-align:center;margin-bottom:24px;position:relative">
          <img src="/logo.jpg" alt="تفاعلي" style="width:54px;height:54px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);display:inline-block;">
          <h1 style="font-family:var(--font-heading);font-size:1.5rem;margin-top:12px;margin-bottom:4px">إنشاء حساب جديد</h1>
          <p style="color:var(--text-gray-muted);margin-bottom:0;font-size:.88rem">سجل كمدرس أو طالب في المنصة</p>
        </div>
        <form id="registerForm">
          <div class="form-row">
            <div class="form-group"><label>الاسم الأول</label><input type="text" id="regFirstName" required placeholder="أحمد"></div>
            <div class="form-group"><label>الاسم الأخير</label><input type="text" id="regLastName" required placeholder="محمد"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>اسم المستخدم</label><input type="text" id="regUsername" required placeholder="ahmed123"></div>
            <div class="form-group"><label>نوع الحساب</label><select id="regRole"><option value="student">طالب</option><option value="tutor">مدرس</option></select></div>
          </div>
          <div class="form-group"><label>البريد الإلكتروني</label><input type="email" id="regEmail" required placeholder="ahmed@example.com"></div>
          <div class="form-group"><label>كلمة المرور</label><input type="password" id="regPassword" required minlength="8" placeholder="أقل 8 أحرف"></div>
          <div class="form-group"><label>المستوى الدراسي</label><div id="regLevels" class="checkbox-group"></div><div style="color:var(--text-gray-muted);font-size:.75rem;margin-top:4px" id="regLevelHint">اختر مستوى واحد للتخصص كمدرس / مستوى أو أكثر كطالب</div></div>
          <div class="form-group"><label>التخصص</label><input type="text" id="regSpecialization" placeholder="مثال: تحفيظ قرآن, رياضيات, لغة إنجليزية"></div>
          <div id="regPayGroup" class="form-group" style="display:none"><label>رقم إنستاباي (للاستلام الشهري)</label><input type="tel" id="regInstapay" placeholder="01xxxxxxxxx"></div>
          <div id="regVodafoneGroup" class="form-group" style="display:none"><label>رقم فودافون كاش (اختياري)</label><input type="tel" id="regVodafone" placeholder="01xxxxxxxxx"></div>
          <div id="regLangGroup" class="form-group" style="display:none"><label>اللغات التي تدرسها</label><div id="regLangs" class="checkbox-group"></div></div>
          <div id="regTutorFields" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:18px;margin-top:18px;display:none">
            <h3 style="color:var(--primary-blue);font-size:1rem;margin-bottom:14px">بيانات المدرس</h3>
            <div class="form-group"><label>سنوات الخبرة</label><input type="number" id="regExperience" min="0" placeholder="مثال: 5"></div>
            <div class="form-group"><label>المؤهل العلمي</label><input type="text" id="regEducation" placeholder="مثال: بكالوريوس لغة عربية - جامعة الأزهر"></div>
            <div class="form-group"><label>الإجازات والشهادات</label><textarea id="regCertificates" placeholder="مثال: إجازة برواية حفص عن عاصم..."></textarea></div>
            <div class="form-group"><label>نبذة عني</label><textarea id="regBio" placeholder="اكتب نبذة مختصرة عن خبراتك..."></textarea></div>
            <p style="color:var(--gold);font-size:.8rem;line-height:1.8">بعد التسجيل سيكون حسابك <strong>قيد مراجعة الإدارة</strong> ولن يظهر للطلاب حتى يتم اعتماده. تصلك أرباحك شهرياً عبر إنستاباي أو فودافون كاش.</p>
          </div>
          <p id="regError" style="color:#EF4444;font-size:.85rem;text-align:center;display:none"></p>
          <button type="submit" class="btn btn-primary" style="width:100%" id="regBtn">تسجيل</button>
        </form>
        <div style="text-align:center;margin-top:18px;font-size:.9rem;color:var(--text-gray-muted)">لديك حساب؟ <a class="page-link" data-page="login" style="color:var(--red);font-weight:600;cursor:pointer">تسجيل دخول</a></div>
      </div>
    </div>
  `
}

export function initRegister(navigate) {
  if (isLoggedIn()) {
    navigate(isStudent() ? 'student-dashboard' : 'tutor-dashboard')
    return
  }
  const levelsContainer = $('regLevels')
  if (!levelsContainer || levelsContainer.children.length) return

  LEVELS_DATA.forEach(l => {
    levelsContainer.innerHTML += `<label><input type="checkbox" name="levels" value="${l.code}"><i class="fas ${l.icon}"></i> <span>${l.label}</span></label>`
  })
  LANG_DATA.forEach(l => {
    $('regLangs').innerHTML += `<label><input type="checkbox" name="langs" value="${l.code}"><span>${l.label}</span></label>`
  })

  $('regRole').addEventListener('change', function () {
    const t = this.value === 'tutor'
    $('regPayGroup').style.display = t ? 'block' : 'none'
    $('regVodafoneGroup').style.display = t ? 'block' : 'none'
    $('regTutorFields').style.display = t ? 'block' : 'none'
    $('regLangGroup').style.display = t ? 'block' : 'none'
    levelsContainer.querySelectorAll('input[type="checkbox"]').forEach(c => { c.checked = false })
    $('regLevelHint').textContent = t ? 'اختر مستوى واحد فقط للتخصص كمدرس' : 'اختر مستوى أو أكثر كطالب'
  })

  $('registerForm').addEventListener('submit', async e => {
    e.preventDefault()
    const btn = $('regBtn'), err = $('regError')
    btn.disabled = true; btn.textContent = 'جاري التسجيل...'; err.style.display = 'none'

    const cl = [...levelsContainer.querySelectorAll('input:checked')].map(c => c.value)
    if (!cl.length) { err.textContent = 'اختر مستوى تعليمي واحد على الأقل'; err.style.display = 'block'; btn.disabled = false; btn.textContent = 'تسجيل'; return }
    const role = $('regRole').value
    if (role === 'tutor' && cl.length > 1) { err.textContent = 'المدرس يختار مستوى واحد فقط'; err.style.display = 'block'; btn.disabled = false; btn.textContent = 'تسجيل'; return }

    const body = {
      username: $('regUsername').value, email: $('regEmail').value, password: $('regPassword').value,
      first_name: $('regFirstName').value, last_name: $('regLastName').value, role,
      specialization: $('regSpecialization').value
    }
    if (role === 'tutor') {
      body.teaching_level = cl[0]
      body.languages = [...document.querySelectorAll('#regLangs input:checked')].map(c => c.value)
      body.instapay_phone = $('regInstapay').value
      body.vodafone_cash = $('regVodafone').value
      body.years_experience = $('regExperience').value || null
      body.education = $('regEducation').value
      body.certificates = $('regCertificates').value
      body.bio = $('regBio').value
    } else {
      body.student_levels = cl
    }
    try {
      const d = await api('POST', '/register/', body, { auth: false })
      localStorage.setItem('access_token', d.token)
      localStorage.setItem('user', JSON.stringify(d.user))
      toast('تم إنشاء الحساب بنجاح', 'success')
      navigate(d.user.role === 'tutor' ? 'tutor-dashboard' : 'student-dashboard')
    } catch (e) { err.textContent = e.message; err.style.display = 'block' }
    finally { btn.disabled = false; btn.textContent = 'تسجيل' }
  })
}
