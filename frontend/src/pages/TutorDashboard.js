import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { API_BASE, LEVEL_MAP, LEVEL_ICONS } from '../constants.js'
import { api } from '../api.js'
import { getUser, getToken, isTutor } from '../auth.js'
import { openModal, closeModal } from '../components/Modal.js'
import { Spinner } from '../components/Spinner.js'

export function renderTutorDashboard() {
  return `
    <div class="page" id="page-tutor-dashboard">
      <div class="container" style="padding-top:32px;padding-bottom:40px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h2 style="margin-bottom:4px">مرحباً، أ. <span class="gradient-text" id="tdUserName"></span></h2>
            <span style="color:var(--text-muted);font-size:.85rem" id="tdLevel"></span>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="online-badge"><span class="dot"></span> متصل</span>
            <button class="btn btn-sm btn-secondary page-btn" data-page="edit-profile"><i class="fas fa-user-edit"></i> تعديل البروفايل</button>
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div class="tab-bar" id="tdTabs"></div>
          <div id="tdContent"></div>
        </div>
      </div>
    </div>
  `
}

let tdCurrentFileId = null
let tdCurrentSessionId = null
let tdLevel = ''
let tdInterval = null
let tdPing = null

export function initTutorDashboard() {
  if (!isTutor()) return
  const u = getUser()
  tdLevel = u.teaching_level || 'quran'
  $('tdUserName').textContent = u.first_name || u.username
  $('tdLevel').textContent = 'مختص في: ' + (LEVEL_MAP[tdLevel] || tdLevel)

  const tb = $('tdTabs')
  tb.innerHTML = `<span class="tab active"><i class="fas ${LEVEL_ICONS[tdLevel] || 'fa-book'}"></i> ${LEVEL_MAP[tdLevel] || tdLevel}</span>`

  tdBuild()

  if (tdPing) clearInterval(tdPing)
  tdPing = setInterval(() => { try { api('POST', '/ping/') } catch { } }, 30000)

  if (tdInterval) clearInterval(tdInterval)
  tdInterval = setInterval(() => tdLoad(), 15000)
}

function tdBuild() {
  $('tdContent').innerHTML = `
    <h3>الملفات المتاحة — ${LEVEL_MAP[tdLevel]}</h3>
    <div class="tdFiles" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin-top:20px">عروضي المرسلة</h3>
    <div class="tdOffers" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin-top:20px">جلساتي النشطة</h3>
    <div class="tdSessions" style="padding:20px 0">${Spinner()}</div>
  `
  tdLoad()
}

async function tdLoad() {
  try { await Promise.all([tdLoadFiles(), tdLoadOffers(), tdLoadSessions()]) } catch { }
}

async function tdLoadFiles() {
  const el = document.querySelector('#tdContent .tdFiles')
  if (!el) return
  try {
    const r = await fetch(API_BASE + '/files/?level=' + tdLevel, { headers: { 'Authorization': 'Token ' + getToken() } })
    const f = await r.json()
    if (!Array.isArray(f) || !f.length) { el.innerHTML = '<p class="empty">لا توجد ملفات متاحة</p>'; return }
    el.innerHTML = `<div class="table-wrap"><table><tr><th>#</th><th>التفاصيل</th><th>النوع</th><th>السعر الأساسي</th><th>إجراء</th></tr>${f.map(x =>
      `<tr><td>${x.id}</td><td>${x.specialization || x.subject_type || tdLevel}${x.difficulty ? ' · ' + x.difficulty : ''}</td><td>${x.session_type === 'solo' ? 'فردي' : 'مجموعة'}</td><td>${x.base_price || '—'} ${x.currency || ''}</td><td><button class="btn btn-sm btn-primary offer-btn" data-fid="${x.id}" data-info="${(x.specialization || tdLevel)}">إرسال عرض</button></td></tr>`
    ).join('')}</table></div>`
    el.querySelectorAll('.offer-btn').forEach(btn => {
      btn.addEventListener('click', () => tdOpenModal(parseInt(btn.dataset.fid), btn.dataset.info))
    })
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

async function tdLoadOffers() {
  const el = document.querySelector('#tdContent .tdOffers')
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لم ترسل أي عروض</p>'; return }
    el.innerHTML = `<div class="table-wrap"><table><tr><th>#</th><th>سعري</th><th>نوع الدفع</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(o => `<tr><td>${o.id}</td><td>${o.tutor_price || o.price}</td><td>${o.payment_type === 'monthly' ? 'شهري' : 'بالحصة'}</td><td><span class="badge badge-${o.status}">${o.status}</span></td><td>${new Date(o.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

async function tdLoadSessions() {
  const el = document.querySelector('#tdContent .tdSessions')
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    const ac = Array.isArray(r) ? r.filter(o => o.status === 'accepted') : []
    if (!ac.length) { el.innerHTML = '<p class="empty">لا توجد جلسات نشطة</p>'; return }
    el.innerHTML = ac.map(o => `
      <div class="session-card">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <strong>💰 ${o.tutor_price} ${o.file?.currency || ''} · ${o.payment_type === 'monthly' ? 'شهري' : 'بالحصة'}</strong>
            ${o.file?.current_juz ? '<div style="color:var(--text-muted);font-size:.82rem">الجزء ' + o.file.current_juz + ' ← ' + o.file.start_juz + '</div>' : ''}
          </div>
          <button class="btn btn-sm btn-success progress-btn" data-sid="${o.id}">تسجيل تقدم</button>
        </div>
        <div id="tdSessProg-${o.id}" style="margin-top:8px"></div>
      </div>
    `).join('')
    ac.forEach(o => tdLoadSessProg(o.id))
    el.querySelectorAll('.progress-btn').forEach(btn => {
      btn.addEventListener('click', () => tdOpenProgress(parseInt(btn.dataset.sid)))
    })
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

async function tdLoadSessProg(sid) {
  const c = $('tdSessProg-' + sid)
  if (!c) return
  try {
    const r = await api('GET', '/offers/progress/?session_id=' + sid)
    if (!Array.isArray(r) || !r.length) { c.innerHTML = '<p style="color:var(--text-muted);font-size:.82rem">لا يوجد تقدم مسجل بعد</p>'; return }
    c.innerHTML = r.map(e => {
      const ft = e.juz_from ? `الجزء ${e.juz_from} ← ${e.juz_to}` : e.unit_from ? `${e.unit_from} ← ${e.unit_to}` : e.cefr_from ? `${e.cefr_from} ← ${e.cefr_to}` : '—'
      return `<div class="progress-row"><strong>${ft}</strong> <span style="color:var(--text-muted);font-size:.8rem">${new Date(e.created_at).toLocaleDateString('ar')}</span>${e.tutor_notes ? '<div>📝 ' + e.tutor_notes + '</div>' : ''}</div>`
    }).join('')
  } catch { }
}

function tdOpenModal(fid, info) {
  tdCurrentFileId = fid
  const content = `
    <h3>إرسال عرض سعر</h3>
    <p id="modalFileInfo" style="color:var(--text-muted);margin-bottom:12px;font-size:.9rem">${info}</p>
    <div class="form-group"><label>سعرك</label><input type="number" id="modalPrice" step="0.01" min="1"></div>
    <div class="form-group"><label>نوع الدفع</label><select id="modalPaymentType"><option value="per_session">بالحصة</option><option value="monthly">شهري</option></select></div>
    <div class="modal-btns">
      <button class="btn btn-primary" id="submitOfferBtn">إرسال العرض</button>
      <button class="btn btn-ghost" id="closeOfferBtn">إلغاء</button>
    </div>
    <p id="modalError" style="color:#EF4444;font-size:.85rem;margin-top:8px;display:none"></p>
  `
  $('offerModal').querySelector('.modal').innerHTML = content
  openModal('offerModal')

  $('submitOfferBtn').addEventListener('click', submitOffer)
  $('closeOfferBtn').addEventListener('click', () => closeModal('offerModal'))
}

async function submitOffer() {
  const p = $('modalPrice').value, pt = $('modalPaymentType').value
  if (!p || p <= 0) {
    $('modalError').textContent = 'أدخل سعراً صحيحاً'
    $('modalError').style.display = 'block'
    return
  }
  try {
    await api('POST', '/offers/create/', { file_id: tdCurrentFileId, tutor_price: p, payment_type: pt })
    toast('تم إرسال العرض', 'success')
    closeModal('offerModal')
    tdLoad()
  } catch (e) {
    $('modalError').textContent = e.data?.error || e.message
    $('modalError').style.display = 'block'
  }
}

function tdOpenProgress(sid) {
  tdCurrentSessionId = sid
  let fieldsHtml = ''
  if (tdLevel === 'quran') {
    fieldsHtml = `<div class="form-row"><div class="form-group"><label>من الجزء</label><input type="number" id="progFrom" min="1" max="30"></div><div class="form-group"><label>إلى الجزء</label><input type="number" id="progTo" min="1" max="30"></div></div>`
  } else if (tdLevel === 'kindergarten') {
    fieldsHtml = `<div class="form-row"><div class="form-group"><label>من الوحدة</label><input type="text" id="progFrom" placeholder="وحدة 3"></div><div class="form-group"><label>إلى الوحدة</label><input type="text" id="progTo" placeholder="وحدة 5"></div></div>`
  } else if (tdLevel === 'languages') {
    fieldsHtml = `<div class="form-row"><div class="form-group"><label>من مستوى CEFR</label><select id="progFrom"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div><div class="form-group"><label>إلى مستوى CEFR</label><select id="progTo"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div></div>`
  } else {
    fieldsHtml = '<p style="color:var(--text-muted)">هذا المستوى لا يتطلب تتبع تقدم رقمي</p>'
  }

  const content = `
    <h3>تسجيل تقدم</h3>
    <p id="progressSessionInfo" style="color:var(--text-muted);margin-bottom:12px;font-size:.9rem">تسجيل تقدم الجلسة رقم ${sid}</p>
    <div id="progressFields">${fieldsHtml}</div>
    <div class="form-group"><label>ملاحظات المدرس</label><textarea id="progressTutorNotes" placeholder="..."></textarea></div>
    <div class="modal-btns">
      <button class="btn btn-success" id="submitProgressBtn">حفظ</button>
      <button class="btn btn-ghost" id="closeProgressBtn">إلغاء</button>
    </div>
    <p id="progressError" style="color:#EF4444;font-size:.85rem;margin-top:8px;display:none"></p>
  `
  $('progressModal').querySelector('.modal').innerHTML = content
  openModal('progressModal')

  $('submitProgressBtn').addEventListener('click', submitProgress)
  $('closeProgressBtn').addEventListener('click', () => closeModal('progressModal'))
}

async function submitProgress() {
  const tn = $('progressTutorNotes').value
  const p = { session_id: tdCurrentSessionId, tutor_notes: tn }
  const l = tdLevel
  if (l === 'quran' || l === 'kindergarten' || l === 'languages') {
    p.progress_type = l
    if (l === 'quran') { p.juz_from = parseInt($('progFrom').value); p.juz_to = parseInt($('progTo').value) }
    else if (l === 'kindergarten') { p.unit_from = $('progFrom').value; p.unit_to = $('progTo').value }
    else { p.cefr_from = $('progFrom').value; p.cefr_to = $('progTo').value }
  }
  if (!p.juz_from && !p.unit_from && !p.cefr_from) {
    if (l !== 'university' && l !== 'high_school' && l !== 'middle_school' && l !== 'primary') {
      $('progressError').textContent = 'يرجى تعبئة الحقول المطلوبة'
      $('progressError').style.display = 'block'
      return
    }
  }
  try {
    await api('POST', '/offers/progress/create/', p)
    toast('تم تسجيل التقدم', 'success')
    closeModal('progressModal')
    tdLoad()
  } catch (e) {
    $('progressError').textContent = e.data?.error || e.message
    $('progressError').style.display = 'block'
  }
}

export function cleanupTutorDashboard() {
  if (tdInterval) { clearInterval(tdInterval); tdInterval = null }
  if (tdPing) { clearInterval(tdPing); tdPing = null }
}
