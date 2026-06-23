import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { API_BASE, LEVELS_DATA, LANG_DATA, LEVEL_MAP, LEVEL_ICONS, DAYS } from '../constants.js'
import { api } from '../api.js'
import { getUser, getToken, isStudent } from '../auth.js'
import { loadFiles, loadTutors, loadProgress, loadOffers, loadTutorProfile } from '../utils/dashboardShared.js'
import { closeModal } from '../components/Modal.js'
import { confirmDialog } from '../components/ConfirmDialog.js'
import { Spinner } from '../components/Spinner.js'

export function renderStudentDashboard() {
  return `
    <div class="page" id="page-student-dashboard">
      <div class="container" style="padding-top:32px;padding-bottom:40px">
        <h2 style="margin-bottom:6px">مرحباً، <span class="gradient-text" id="sdUserName"></span></h2>
        <p style="color:var(--text-muted);margin-bottom:20px;font-size:.9rem" id="sdLevels"></p>
        <div class="card" style="padding:16px">
          <div class="tab-bar" id="sdTabs"></div>
          <div id="sdContent"></div>
        </div>
      </div>
    </div>
  `
}

let sdActiveLevel = ''
let sdInterval = null

export function initStudentDashboard() {
  if (!isStudent()) return
  const u = getUser()
  $('sdUserName').textContent = u.first_name || u.username
  const sl = u.student_levels || []
  $('sdLevels').textContent = 'مستوياتك: ' + sl.map(c => LEVEL_MAP[c] || c).join(' · ')

  const all = LEVELS_DATA.map(l => l.code)
  const display = sl.length ? sl : all

  const tb = $('sdTabs')
  tb.innerHTML = ''
  display.forEach((l, i) => {
    const a = i === 0
    if (a) sdActiveLevel = l
    const tab = document.createElement('span')
    tab.className = `tab ${a ? 'active' : ''}`
    tab.dataset.level = l
    tab.innerHTML = `<i class="fas ${LEVEL_ICONS[l] || 'fa-book'}"></i> ${LEVEL_MAP[l] || l}`
    tab.addEventListener('click', () => sdSwitch(l, tab))
    tb.appendChild(tab)
  })
  sdBuild(sdActiveLevel)
  sdLoad(sdActiveLevel)

  if (sdInterval) clearInterval(sdInterval)
  sdInterval = setInterval(() => { if (sdActiveLevel) sdLoad(sdActiveLevel) }, 15000)
}

function sdSwitch(level, el) {
  sdActiveLevel = level
  document.querySelectorAll('#sdTabs .tab').forEach(t => t.classList.remove('active'))
  el.classList.add('active')
  sdBuild(level)
  sdLoad(level)
}

function sdBuild(level) {
  const isStructured = level === 'quran' || level === 'kindergarten' || level === 'languages'
  const cont = $('sdContent')
  if (isStructured) {
    sdBuildStructured(level, cont)
  } else {
    sdBuildAcademic(level, cont)
  }
}

function sdBuildStructured(level, cont) {
  const extra = level === 'quran'
    ? `<div class="form-row"><div class="form-group"><label>جزأ البداية (من)</label><input type="number" name="start_juz" min="1" max="30" value="1" required></div><div class="form-group"><label>الجزء الحالي</label><input type="number" name="current_juz" min="1" max="30" value="1" required></div></div>`
    : level === 'kindergarten'
      ? `<div class="form-row"><div class="form-group"><label>الوحدة الحالية</label><input type="text" name="current_unit" placeholder="مثال: وحدة 3" required></div><div class="form-group"><label>البدء من وحدة</label><input type="text" name="start_unit" placeholder="مثال: وحدة 1" required></div></div>`
      : `<div class="form-row"><div class="form-group"><label>اللغة</label><select name="language" required>${LANG_DATA.map(l => `<option value="${l.code}">${l.label}</option>`).join('')}</select></div><div class="form-group"><label>مستوى CEFR الحالي</label><select name="current_cefr" required>${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(v => `<option>${v}</option>`).join('')}</select></div><div class="form-group"><label>البدء من مستوى</label><select name="start_cefr" required>${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(v => `<option>${v}</option>`).join('')}</select></div></div>`

  cont.innerHTML = `
    <div class="card">
      <h3>طلب ${LEVEL_MAP[level]} جديد</h3>
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px">${level === 'quran' ? 'حدد جزأ البداية وأوقاتك المتاحة' : level === 'kindergarten' ? 'حدد الوحدة الدراسية الحالية' : 'حدد مستوى CEFR الحالي واللغة'}</p>
      <form id="sdStructForm-${level}">
        <input type="hidden" name="education_level" value="${level}">
        <div class="form-row">
          <div class="form-group"><label>الدولة</label><select name="country" required><option value="SA">السعودية</option><option value="KW">الكويت</option><option value="AE">الإمارات</option><option value="QA">قطر</option></select></div>
          <div class="form-group"><label>نوع الجلسة</label><select name="session_type" onchange="this.closest('form').querySelector('.stdGroup').style.display=this.value==='group'?'block':'none'"><option value="solo">فردي</option><option value="group">مجموعة</option></select></div>
          <div class="form-group stdGroup" style="display:none"><label>عدد الطلاب</label><input type="number" name="students_count" value="2" min="2" max="10"></div>
        </div>
        ${extra}
        <div class="form-group"><label>ملاحظات</label><textarea name="notes" placeholder="ملاحظات إضافية..." style="min-height:50px"></textarea></div>
        <button type="submit" class="btn btn-primary sd-struct-submit" data-level="${level}">إرسال الطلب</button>
      </form>
      <div class="sdStructResult hidden" style="margin-top:12px"></div>
    </div>
    <h3 style="margin-bottom:12px">طلباتي — ${LEVEL_MAP[level]}</h3>
    <div class="sdFiles" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin:20px 0 12px">المدرسون المتاحون — ${LEVEL_MAP[level]}</h3>
    <div class="sdTutors" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin:20px 0 12px">التقدم — ${LEVEL_MAP[level]}</h3>
    <div class="sdProgress"><p class="empty">لا يوجد تقدم بعد</p></div>
    <h3 style="margin:20px 0 12px">العروض المقدمة</h3>
    <div class="sdOffers"><p class="empty">لا توجد عروض</p></div>
  `

  cont.querySelector('.sd-struct-submit')?.addEventListener('click', async (e) => {
    e.preventDefault()
    const form = e.target.closest('form')
    const btn = e.target
    btn.disabled = true; btn.textContent = 'جاري الإرسال...'
    const data = Object.fromEntries(new FormData(form))
    try {
      await api('POST', '/files/structured-request/', data)
      const res = form.querySelector('.sdStructResult')
      res.classList.remove('hidden')
      res.innerHTML = '<div class="price-box"><div style="color:var(--accent-purple);font-weight:700">✅ تم إرسال الطلب بنجاح</div></div>'
      sdLoad(level)
      form.reset()
      toast('تم إرسال الطلب بنجاح', 'success')
    } catch (e) {
      toast('خطأ: ' + (e.data?.error || e.message), 'error')
    } finally {
      btn.disabled = false; btn.textContent = 'إرسال الطلب'
    }
  })
}

function sdBuildAcademic(level, cont) {
  cont.innerHTML = `
    <div class="card">
      <h3>رفع ملف أكاديمي جديد — ${LEVEL_MAP[level]}</h3>
      <div class="upload-zone">
        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--accent-purple);margin-bottom:8px"></i>
        <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px">ارفع ملف PDF وسيحلله الذكاء الاصطناعي لتحديد مستواك واقتراح السعر</p>
        <form id="sdAcadForm-${level}">
          <input type="file" name="file" accept=".pdf" required style="display:block;margin:0 auto 12px">
          <input type="hidden" name="education_level" value="${level}">
          <div class="form-row">
            <div class="form-group"><label>الدولة</label><select name="country" required><option value="SA">السعودية</option><option value="KW">الكويت</option><option value="AE">الإمارات</option><option value="QA">قطر</option></select></div>
            <div class="form-group"><label>النوع</label><select name="session_type" onchange="this.closest('form').querySelector('.acGroup').style.display=this.value==='group'?'block':'none'"><option value="solo">فردي</option><option value="group">مجموعة</option></select></div>
            <div class="form-group acGroup" style="display:none"><label>عدد الطلاب</label><input type="number" name="students_count" value="2" min="2" max="10"></div>
          </div>
          <button type="submit" class="btn btn-primary sd-acad-submit" data-level="${level}">رفع وتحليل بالذكاء الاصطناعي</button>
        </form>
        <div class="sdAcadResult hidden" style="margin-top:12px"></div>
      </div>
    </div>
    <h3 style="margin:20px 0 12px">ملفاتي — ${LEVEL_MAP[level]}</h3>
    <div class="sdFiles" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin:20px 0 12px">المدرسون المتاحون — ${LEVEL_MAP[level]}</h3>
    <div class="sdTutors" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin:20px 0 12px">العروض المقدمة</h3>
    <div class="sdOffers"><p class="empty">لا توجد عروض</p></div>
  `

  cont.querySelector('.sd-acad-submit')?.addEventListener('click', async (e) => {
    e.preventDefault()
    const form = e.target.closest('form')
    const btn = e.target
    btn.disabled = true; btn.textContent = 'جاري التحليل...'
    const fd = new FormData(form)
    try {
      const r = await fetch(API_BASE + '/files/upload/', {
        method: 'POST', headers: { 'Authorization': 'Token ' + getToken() }, body: fd
      })
      const d = await r.json()
      if (!r.ok) throw new Error(JSON.stringify(d))
      const res = form.querySelector('.sdAcadResult')
      res.classList.remove('hidden')
      res.innerHTML = `<div class="price-box">
        <div class="price-item"><div class="num">${d.base_price || d.pricing_breakdown?.base_price || '—'}</div><div class="lbl">السعر</div></div>
        <div class="price-item"><div class="num">${d.specialization || d.subject_type || '—'}</div><div class="lbl">التخصص</div></div>
      </div>`
      sdLoad(level)
      form.reset()
      toast('تم رفع الملف وتحليله بنجاح', 'success')
    } catch (e) { toast('خطأ: ' + e.message, 'error') }
    finally { btn.disabled = false; btn.textContent = 'رفع وتحليل بالذكاء الاصطناعي' }
  })
}

async function sdLoad(level) {
  try {
    await Promise.all([
      loadFiles(document.querySelector('#sdContent .sdFiles'), level),
      loadTutors(document.querySelector('#sdContent .sdTutors'), level, showTutorModal),
      loadProgress(document.querySelector('#sdContent .sdProgress')),
      loadOffers(document.querySelector('#sdContent .sdOffers'), handleAcceptOffer),
    ])
  } catch { }
}

async function handleAcceptOffer(id) {
  const ok = await confirmDialog('تأكيد قبول العرض؟')
  if (!ok) return
  try {
    await api('PUT', '/offers/' + id + '/accept/')
    toast('تم قبول العرض!', 'success')
    sdLoad(sdActiveLevel)
  } catch (e) {
    toast('خطأ: ' + (e.data?.error || e.message), 'error')
  }
}

async function showTutorModal(id) {
  const modalContent = $('tutorModalContent') || buildTutorModal()
  await loadTutorProfile(id, modalContent, () => closeModal('tutorModal'))
  $('tutorModal')?.classList.add('active')
}

function buildTutorModal() {
  const div = document.createElement('div')
  div.className = 'modal-overlay'
  div.id = 'tutorModal'
  div.onclick = function (e) { if (e.target === this) this.classList.remove('active') }
  div.innerHTML = '<div class="modal" id="tutorModalContent"></div>'
  document.body.appendChild(div)
  return document.getElementById('tutorModalContent')
}

export function cleanupStudentDashboard() {
  if (sdInterval) { clearInterval(sdInterval); sdInterval = null }
}
