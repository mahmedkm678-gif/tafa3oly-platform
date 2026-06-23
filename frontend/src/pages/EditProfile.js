import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { LEVELS_DATA, LANG_DATA } from '../constants.js'
import { api } from '../api.js'
import { getRole, isLoggedIn, setUserData } from '../auth.js'

export function renderEditProfile() {
  return `
    <div class="page" id="page-edit-profile">
      <div class="container" style="padding-top:32px;padding-bottom:40px;max-width:640px">
        <h2 style="margin-bottom:4px">تعديل الملف الشخصي</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:.9rem">حدّث بياناتك الشخصية والمهنية</p>
        <div class="glass-card" style="padding:24px">
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group"><label>الاسم الأول</label><input type="text" id="edFirstName" required></div>
              <div class="form-group"><label>الاسم الأخير</label><input type="text" id="edLastName" required></div>
            </div>
            <div class="form-group"><label>البريد الإلكتروني</label><input type="email" id="edEmail" required></div>
            <div class="form-group"><label>التخصص</label><input type="text" id="edSpecialization" placeholder="مثال: تحفيظ قرآن, رياضيات"></div>
            <div class="form-group" id="edPaypalGroup"><label>بريد PayPal</label><input type="email" id="edPaypal" placeholder="tutor@paypal.com"></div>
            <div id="edTutorOnly">
              <div class="form-group"><label>سنوات الخبرة</label><input type="number" id="edExperience" min="0"></div>
              <div class="form-group"><label>المؤهل العلمي</label><input type="text" id="edEducation" placeholder="بكالوريوس..."></div>
              <div class="form-group"><label>الإجازات والشهادات</label><textarea id="edCertificates" placeholder="إجازة برواية حفص..."></textarea></div>
              <div class="form-group"><label>نبذة عني</label><textarea id="edBio" placeholder="نبذة مختصرة عن خبراتك..."></textarea></div>
              <div class="form-group"><label>المستوى الدراسي (مختص به)</label><select id="edTeachingLevel"></select></div>
              <div class="form-group" id="edLangGroup" style="display:none"><label>اللغات التي تدرسها</label><div id="edLangs" class="checkbox-group"></div></div>
            </div>
            <div id="edStudentOnly" style="display:none">
              <div class="form-group"><label>المستويات الدراسية</label><div id="edStudentLevels" class="checkbox-group"></div></div>
            </div>
            <p id="edError" style="color:#EF4444;font-size:.85rem;display:none"></p>
            <button type="submit" class="btn btn-primary" style="width:100%" id="edBtn">حفظ التغييرات</button>
          </form>
        </div>
      </div>
    </div>
  `
}

export function initEditProfile() {
  if (!isLoggedIn()) return

  const role = getRole()
  if (role === 'student') {
    $('edTutorOnly').style.display = 'none'
    $('edStudentOnly').style.display = 'block'
    $('edPaypalGroup').style.display = 'none'
    const c = $('edStudentLevels')
    if (!c.children.length) {
      LEVELS_DATA.forEach(l => {
        c.innerHTML += `<label><input type="checkbox" name="student_levels" value="${l.code}"><span>${l.label}</span></label>`
      })
    }
  } else {
    const sl = $('edTeachingLevel')
    if (!sl.children.length) {
      LEVELS_DATA.forEach(l => {
        sl.innerHTML += `<option value="${l.code}">${l.label}</option>`
      })
      LANG_DATA.forEach(l => {
        $('edLangs').innerHTML += `<label><input type="checkbox" name="langs" value="${l.code}"><span>${l.label}</span></label>`
      })
      sl.addEventListener('change', function () {
        $('edLangGroup').style.display = this.value === 'languages' ? 'block' : 'none'
      })
    }
  }
  loadProfile()

  $('profileForm').addEventListener('submit', async e => {
    e.preventDefault()
    const btn = $('edBtn'), err = $('edError')
    btn.disabled = true; btn.textContent = 'جاري الحفظ...'; err.style.display = 'none'
    const role = getRole()
    const body = {
      first_name: $('edFirstName').value, last_name: $('edLastName').value,
      email: $('edEmail').value, specialization: $('edSpecialization').value
    }
    if (role === 'tutor') {
      body.paypal_email = $('edPaypal').value
      body.years_experience = $('edExperience').value || null
      body.education = $('edEducation').value
      body.certificates = $('edCertificates').value
      body.bio = $('edBio').value
      body.teaching_level = $('edTeachingLevel').value
      body.languages = [...document.querySelectorAll('#edLangs input:checked')].map(c => c.value)
    } else {
      body.student_levels = [...document.querySelectorAll('#edStudentLevels input:checked')].map(c => c.value)
    }
    try {
      const d = await api('PUT', '/profile/', body)
      setUserData(d)
      toast('تم حفظ التغييرات', 'success')
    } catch (e) {
      err.textContent = e.data?.error || e.message
      err.style.display = 'block'
    } finally {
      btn.disabled = false; btn.textContent = 'حفظ التغييرات'
    }
  })
}

async function loadProfile() {
  try {
    const u = await api('GET', '/profile/')
    $('edFirstName').value = u.first_name || ''
    $('edLastName').value = u.last_name || ''
    $('edEmail').value = u.email || ''
    $('edSpecialization').value = u.specialization || ''
    $('edPaypal').value = u.paypal_email || ''

    const role = getRole()
    if (role === 'tutor') {
      $('edExperience').value = u.years_experience || ''
      $('edEducation').value = u.education || ''
      $('edCertificates').value = u.certificates || ''
      $('edBio').value = u.bio || ''
      if (u.teaching_level) $('edTeachingLevel').value = u.teaching_level
      $('edLangGroup').style.display = u.teaching_level === 'languages' ? 'block' : 'none'
      if (u.languages) {
        document.querySelectorAll('#edLangs input').forEach(cb => {
          if (u.languages.includes(cb.value)) cb.checked = true
        })
      }
    } else {
      if (u.student_levels) {
        document.querySelectorAll('#edStudentLevels input').forEach(cb => {
          if (u.student_levels.includes(cb.value)) cb.checked = true
        })
      }
    }
  } catch (e) { toast('خطأ في تحميل البيانات', 'error') }
}
