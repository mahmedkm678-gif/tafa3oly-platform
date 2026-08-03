import { api } from '../api.js'
import { LEVEL_MAP, LEVEL_ICONS, LANG_MAP, LANG_DATA, CEFR_LEVELS } from '../constants.js'
import { Spinner } from '../components/Spinner.js'
import { toast } from '../components/Toast.js'
import { esc } from '../utils.js'

export { LEVEL_MAP, LEVEL_ICONS, LANG_MAP, LANG_DATA, CEFR_LEVELS }

export function buildTabBar(levels, active, onSwitch) {
  return levels.map((l, i) => {
    const a = i === 0
    return `<span class="tab ${a ? 'active' : ''}" data-level="${l}"><i class="fas ${LEVEL_ICONS[l] || 'fa-book'}"></i> ${LEVEL_MAP[l] || l}</span>`
  }).join('')
}

export async function loadFiles(el, level) {
  if (!el) return
  try {
    const r = await api('GET', '/files/?level=' + level)
    if (!Array.isArray(r)) { el.innerHTML = '<p class="empty">لا توجد ملفات</p>'; return }
    el.innerHTML = r.length
      ? `<div class="table-wrap"><table><tr><th>#</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(f => `<tr><td>${f.id}</td><td><span class="badge badge-${esc(f.status)}">${esc(f.status)}</span></td><td>${new Date(f.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`
      : '<p class="empty">لا توجد ملفات</p>'
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadTutors(el, level, onClick) {
  if (!el) return
  try {
    const r = await api('GET', '/available-tutors/?level=' + level)
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لا يوجد مدرسون متاحون</p>'; return }
    el.innerHTML = r.map(t =>
      `<div class="tutor-card">
        <img src="${esc(t.profile_picture_url || '')}" onerror="this.style.display='none'" alt="${esc(t.first_name || '')}">
        <div class="tutor-info">
          <div class="name"><span class="online-dot" style="display:inline-block;width:8px;height:8px;background:#10B981;border-radius:50%;margin-left:4px"></span>${esc(t.first_name || '')} ${esc(t.last_name || '')}</div>
          <div class="detail">${esc(t.specialization || '')} ${t.years_experience ? '· ' + t.years_experience + ' سنة' : ''}</div>
        </div>
        <button class="btn btn-sm btn-ghost tutor-view-btn" data-id="${t.id}">عرض</button>
      </div>`
    ).join('')
    el.querySelectorAll('.tutor-view-btn').forEach(btn => {
      btn.addEventListener('click', () => onClick(parseInt(btn.dataset.id)))
    })
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadProgress(el) {
  if (!el) return
  try {
    const r = await api('GET', '/offers/progress/')
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لا يوجد تقدم بعد</p>'; return }
    el.innerHTML = r.map(e => {
      const ft = e.juz_from ? `الجزء ${e.juz_from} ← ${e.juz_to}` : e.unit_from ? `${e.unit_from} ← ${e.unit_to}` : e.cefr_from ? `${e.cefr_from} ← ${e.cefr_to}` : '—'
      return `<div class="progress-entry"><div class="date">${new Date(e.created_at).toLocaleDateString('ar')}</div><div class="fromto">${ft}</div>${e.tutor_notes ? '<div style="font-size:.85rem;color:var(--text-gray)">📝 ' + esc(e.tutor_notes) + '</div>' : ''}</div>`
    }).join('')
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadOffers(el, onReject, onPay) {
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لا توجد عروض</p>'; return }
    el.innerHTML = `<div class="table-wrap"><table><tr><th>#</th><th>السعر</th><th>الحالة</th>${onReject || onPay ? '<th>إجراء</th>' : ''}</tr>${r.map(o => {
      const needsPay = onPay && o.status === 'accepted' && o.session_status === 'awaiting_payment'
      const canReject = onReject && o.status === 'pending'
      let trial = ''
      if (o.session_is_trial) trial = ' <span class="badge badge-matched" style="font-size:.7rem">مجانية</span>'
      const action = canReject
        ? `<button class="btn btn-sm btn-ghost offer-reject-btn" data-id="${o.id}">رفض</button>`
        : needsPay
          ? `<button class="btn btn-sm btn-primary offer-pay-btn" data-sid="${o.session_id}" data-amount="${o.tutor_price}" data-currency="${o.file?.currency || ''}">ادفع الآن (PayPal)</button>`
          : onReject || onPay ? '—' : ''
      return `
      <tr>
        <td>${o.id}</td>
        <td>${o.tutor_price || o.price} ${o.file?.currency || ''}${trial}</td>
        <td><span class="badge badge-${esc(o.status)}">${esc(o.status)}</span></td>
        <td>${action}</td>
      </tr>`
    }).join('')}</table></div>`
    if (onReject) {
      el.querySelectorAll('.offer-reject-btn').forEach(btn => {
        btn.addEventListener('click', () => onReject(parseInt(btn.dataset.id)))
      })
    }
    if (onPay) {
      el.querySelectorAll('.offer-pay-btn').forEach(btn => {
        btn.addEventListener('click', () => onPay(parseInt(btn.dataset.sid), btn.dataset.amount, btn.dataset.currency))
      })
    }
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadTutorProfile(id, modalContentEl, closeModal) {
  try {
    const t = await api('GET', '/tutors/' + id + '/')
    modalContentEl.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <img src="${esc(t.profile_picture_url || '')}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px" onerror="this.style.display='none'" alt="${esc(t.first_name || '')}">
        <h3>${esc(t.first_name || '')} ${esc(t.last_name || '')}</h3>
        <span class="badge badge-matched">${esc(LEVEL_MAP[t.teaching_level] || t.teaching_level || '')}</span>
      </div>
      ${t.bio ? '<p style="color:var(--text-gray);font-size:.9rem;text-align:center;margin-bottom:16px">' + esc(t.bio) + '</p>' : ''}
      <div style="display:grid;gap:8px">
        <div><strong>التخصص:</strong> ${esc(t.specialization || '—')}</div>
        <div><strong>سنوات الخبرة:</strong> ${esc(String(t.years_experience || '—'))}</div>
        <div><strong>المؤهل:</strong> ${esc(t.education || '—')}</div>
        <div><strong>الشهادات:</strong> ${esc(t.certificates || '—')}</div>
        ${t.languages?.length ? '<div><strong>اللغات:</strong> ' + t.languages.map(l => esc(LANG_MAP[l] || l)).join('، ') + '</div>' : ''}
      </div>
      <button class="btn btn-primary close-modal-btn" style="width:100%;margin-top:16px">إغلاق</button>`
    modalContentEl.querySelector('.close-modal-btn')?.addEventListener('click', closeModal)
  } catch { }
}
