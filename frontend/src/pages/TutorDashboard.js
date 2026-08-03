import { $ } from '../utils.js'
import { esc } from '../utils.js'
import { toast } from '../components/Toast.js'
import { LEVEL_MAP, LEVEL_ICONS } from '../constants.js'
import { api } from '../api.js'
import { getUser, isTutor } from '../auth.js'
import { openModal, closeModal, createModalHTML } from '../components/Modal.js'
import { Spinner } from '../components/Spinner.js'

export function renderTutorDashboard() {
  return `
    <div class="page active" id="page-tutor-dashboard">
      <div class="container" style="padding-top:32px;padding-bottom:40px">
        <div id="tdApprovalBanner"></div>
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
    ${createModalHTML('offerModal', '')}
    ${createModalHTML('progressModal', '')}
  `
}

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

  const banner = $('tdApprovalBanner')
  if (banner) {
    if (u.is_banned) {
      banner.innerHTML = '<div class="card" style="padding:12px 16px;border:1px solid #EF4444;background:#FEF2F2;color:#B91C1C;margin-bottom:16px;font-size:.9rem">تم حظر حسابك بعد مراجعة شكاوى. تواصل مع إدارة المنصة.</div>'
    } else if (!u.is_approved) {
      banner.innerHTML = '<div class="card" style="padding:12px 16px;border:1px solid #F59E0B;background:#FFFBEB;color:#92400E;margin-bottom:16px;font-size:.9rem">حسابك قيد مراجعة الإدارة ولن تظهر لك الطلبات حتى يتم اعتمادك.</div>'
    }
  }

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
    <h3>طلبات مقترحة عليك — ${LEVEL_MAP[tdLevel]}</h3>
    <p style="color:var(--text-muted);font-size:.82rem;margin-bottom:8px">اقترح عليك الذكاء الاصطناعي سعراً — أنت من يقرر: قبول أو تعديل السعر أو رفض.</p>
    <div class="tdProposals" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin-top:20px">سجل عروضي</h3>
    <div class="tdOffers" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin-top:20px">جلساتي النشطة</h3>
    <div class="tdSessions" style="padding:20px 0">${Spinner()}</div>
    <h3 style="margin-top:20px">أرباحي الشهرية (85% من السعر — صرف شهري عبر إنستاباي/فودافون كاش)</h3>
    <div class="tdEarnings" style="padding:20px 0">${Spinner()}</div>
  `
  tdLoad()
}

async function tdLoad() {
  try { await Promise.all([tdLoadProposals(), tdLoadOffers(), tdLoadSessions(), tdLoadEarnings()]) } catch { }
}

async function tdLoadEarnings() {
  const el = document.querySelector('#tdContent .tdEarnings')
  if (!el) return
  try {
    const r = await api('GET', '/payments/earnings/')
    const totals = Object.entries(r.total_by_currency || {})
    const pays = Array.isArray(r.payouts) ? r.payouts : []
    let html = ''
    if (!totals.length && !pays.length) {
      el.innerHTML = '<p class="empty">لا توجد أرباح مدفوعة بعد</p>'
      return
    }
    if (totals.length) {
      html += `<div class="price-box" style="grid-template-columns:repeat(${Math.max(totals.length, 2)}, 1fr);display:grid;gap:12px">` +
        totals.map(([cur, amt]) => `<div class="price-item"><div class="num">${amt} ${cur}</div><div class="lbl">أرباح الشهر (${r.month})</div></div>`).join('') +
        `</div>`
    }
    if (pays.length) {
      html += `<h4 style="margin:14px 0 8px">كشوف الصرف</h4><div class="table-wrap"><table><tr><th>#</th><th>الشهر</th><th>المبلغ</th><th>الطريقة</th><th>رقم الاستلام</th><th>الحالة</th></tr>` +
        pays.map(p => `<tr><td>${p.id}</td><td>${esc(p.month_year)}</td><td>${p.amount} ${esc(p.currency)}</td><td>${p.method === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}</td><td>${esc(p.recipient || '—')}</td><td><span class="badge badge-${esc(p.status)}">${esc(p.status)}</span></td></tr>`).join('') +
        `</table></div>`
    }
    el.innerHTML = html
  } catch { el.innerHTML = '<p class="empty">خطأ في تحميل الأرباح</p>' }
}

async function tdLoadProposals() {
  const el = document.querySelector('#tdContent .tdProposals')
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    const pending = Array.isArray(r) ? r.filter(o => o.status === 'pending') : []
    if (!pending.length) { el.innerHTML = '<p class="empty">لا توجد طلبات مقترحة حالياً</p>'; return }
    el.innerHTML = pending.map(o => `
      <div class="session-card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <strong>${esc(o.file?.specialization || o.file?.subject_type || tdLevel)}</strong>
            ${o.is_ai_proposed ? ' <span class="badge badge-matched" style="font-size:.7rem">اقتراح ذكاء اصطناعي</span>' : ''}
            <div style="color:var(--text-muted);font-size:.82rem;margin-top:4px">
              الصعوبة: ${esc(o.file?.difficulty || '—')} · السعر المقترح: <strong>${o.tutor_price} ${esc(o.file?.currency || '')}</strong> · ${o.payment_type === 'monthly' ? 'شهري' : 'بالحصة'}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button class="btn btn-sm btn-success td-accept-btn" data-id="${o.id}">قبول السعر</button>
          <button class="btn btn-sm btn-secondary td-modify-btn" data-id="${o.id}">تعديل السعر</button>
          <button class="btn btn-sm btn-ghost td-reject-btn" data-id="${o.id}">رفض</button>
        </div>
      </div>
    `).join('')
    el.querySelectorAll('.td-accept-btn').forEach(b => b.addEventListener('click', () => tdRespond(parseInt(b.dataset.id), 'accept')))
    el.querySelectorAll('.td-modify-btn').forEach(b => b.addEventListener('click', () => tdOpenModify(parseInt(b.dataset.id))))
    el.querySelectorAll('.td-reject-btn').forEach(b => b.addEventListener('click', () => tdRespond(parseInt(b.dataset.id), 'reject')))
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

async function tdRespond(id, action) {
  if (action === 'reject') {
    const ok = await window.confirm('رفض هذا الاقتراح؟ سيُبحث عن مدرس آخر لهذا الطالب.')
    if (!ok) return
  }
  try {
    const r = await api('PUT', '/offers/' + id + '/respond/', { action })
    toast(action === 'accept' ? 'تم قبول الاقتراح ✓' : 'تم رفض الاقتراح', action === 'accept' ? 'success' : 'info')
    if (action === 'accept' && r.session?.is_trial) {
      toast('أول جلسة مع هذا الطالب مجانية ✓', 'success')
    }
    tdLoad()
  } catch (e) {
    toast('خطأ: ' + (e.data?.error || e.message), 'error')
  }
}

let tdRespondId = null

function tdOpenModify(id) {
  tdRespondId = id
  const content = `
    <h3>تعديل السعر المقترح</h3>
    <p style="color:var(--text-muted);margin-bottom:12px;font-size:.9rem">حدد السعر الذي يرضيك، وسيُعتمد إذا قبلته:</p>
    <div class="form-group"><label>سعرك الجديد</label><input type="number" id="modalNewPrice" step="0.01" min="1"></div>
    <div class="modal-btns">
      <button class="btn btn-primary" id="submitModifyBtn">اعتماد السعر الجديد</button>
      <button class="btn btn-ghost" id="closeModifyBtn">إلغاء</button>
    </div>
    <p id="modifyError" style="color:#EF4444;font-size:.85rem;margin-top:8px;display:none"></p>
  `
  $('offerModal').querySelector('.modal').innerHTML = content
  openModal('offerModal')

  $('submitModifyBtn').addEventListener('click', submitModify)
  $('closeModifyBtn').addEventListener('click', () => closeModal('offerModal'))
}

async function submitModify() {
  const p = $('modalNewPrice').value
  if (!p || p <= 0) {
    $('modifyError').textContent = 'أدخل سعراً صحيحاً'
    $('modifyError').style.display = 'block'
    return
  }
  try {
    await api('PUT', '/offers/' + tdRespondId + '/respond/', { action: 'accept', tutor_price: p })
    toast('تم اعتماد السعر الجديد ✓', 'success')
    closeModal('offerModal')
    tdLoad()
  } catch (e) {
    $('modifyError').textContent = e.data?.error || e.message
    $('modifyError').style.display = 'block'
  }
}

async function tdLoadOffers() {
  const el = document.querySelector('#tdContent .tdOffers')
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لم ترسل أي عروض</p>'; return }
    el.innerHTML = `<div class="table-wrap"><table><tr><th>#</th><th>سعري</th><th>نوع الدفع</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(o => `<tr><td>${o.id}</td><td>${o.tutor_price || o.price}</td><td>${o.payment_type === 'monthly' ? 'شهري' : 'بالحصة'}</td><td><span class="badge badge-${esc(o.status)}">${esc(o.status)}</span></td><td>${new Date(o.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

async function tdLoadSessions() {
  const el = document.querySelector('#tdContent .tdSessions')
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    const ac = Array.isArray(r) ? r.filter(o => o.status === 'accepted' && o.session_id) : []
    if (!ac.length) { el.innerHTML = '<p class="empty">لا توجد جلسات نشطة</p>'; return }
    el.innerHTML = ac.map(o => {
      const trial = o.session_is_trial
      const paid = o.session_status === 'scheduled' || o.session_status === 'done'
      const stateTxt = trial ? '<span class="badge badge-matched">جلسة مجانية (أول مرة)</span>' : paid ? '<span class="badge badge-active">مدفوعة</span>' : '<span class="badge badge-warning">في انتظار دفع الطالب</span>'
      return `
      <div class="session-card">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <strong>${o.tutor_price} ${o.file?.currency || ''} · ${o.payment_type === 'monthly' ? 'شهري' : 'بالحصة'}</strong>
            ${stateTxt}
            ${o.file?.current_juz ? '<div style="color:var(--text-muted);font-size:.82rem">الجزء ' + o.file.current_juz + ' ← ' + o.file.start_juz + '</div>' : ''}
          </div>
          <button class="btn btn-sm btn-success progress-btn" data-sid="${o.session_id}">تسجيل تقدم</button>
        </div>
        <div id="tdSessProg-${o.session_id}" style="margin-top:8px"></div>
      </div>
    `
    }).join('')
    ac.forEach(o => tdLoadSessProg(o.session_id))
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
      return `<div class="progress-row"><strong>${ft}</strong> <span style="color:var(--text-muted);font-size:.8rem">${new Date(e.created_at).toLocaleDateString('ar')}</span>${e.tutor_notes ? '<div>📝 ' + esc(e.tutor_notes) + '</div>' : ''}</div>`
    }).join('')
  } catch { }
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
