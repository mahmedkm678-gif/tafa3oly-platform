import { api } from '../api.js'
import { LEVEL_MAP, LEVEL_ICONS, LANG_MAP, LANG_DATA, CEFR_LEVELS } from '../constants.js'
import { Spinner } from '../components/Spinner.js'
import { toast } from '../components/Toast.js'

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
      ? `<div class="table-wrap"><table><tr><th>#</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(f => `<tr><td>${f.id}</td><td><span class="badge badge-${f.status}">${f.status}</span></td><td>${new Date(f.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`
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
        <img src="${t.profile_picture_url || ''}" onerror="this.style.display='none'" alt="${t.first_name || ''}">
        <div class="tutor-info">
          <div class="name"><span class="online-dot" style="display:inline-block;width:8px;height:8px;background:#10B981;border-radius:50%;margin-left:4px"></span>${t.first_name || ''} ${t.last_name || ''}</div>
          <div class="detail">${t.specialization || ''} ${t.years_experience ? '· ' + t.years_experience + ' سنة' : ''}</div>
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
      return `<div class="progress-entry"><div class="date">${new Date(e.created_at).toLocaleDateString('ar')}</div><div class="fromto">${ft}</div>${e.tutor_notes ? '<div style="font-size:.85rem;color:var(--text-gray)">📝 ' + e.tutor_notes + '</div>' : ''}</div>`
    }).join('')
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadOffers(el, onAccept) {
  if (!el) return
  try {
    const r = await api('GET', '/offers/')
    if (!Array.isArray(r) || !r.length) { el.innerHTML = '<p class="empty">لا توجد عروض</p>'; return }
    el.innerHTML = `<div class="table-wrap"><table><tr><th>#</th><th>السعر</th><th>الحالة</th>${onAccept ? '<th>إجراء</th>' : ''}</tr>${r.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.tutor_price || o.price}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        ${onAccept && o.status === 'pending' ? `<td><button class="btn btn-sm btn-primary offer-accept-btn" data-id="${o.id}">قبول</button></td>` : onAccept ? '<td>—</td>' : ''}
      </tr>`).join('')}</table></div>`
    if (onAccept) {
      el.querySelectorAll('.offer-accept-btn').forEach(btn => {
        btn.addEventListener('click', () => onAccept(parseInt(btn.dataset.id)))
      })
    }
  } catch { el.innerHTML = '<p class="empty">خطأ في التحميل</p>' }
}

export async function loadTutorProfile(id, modalContentEl, closeModal) {
  try {
    const t = await api('GET', '/tutors/' + id + '/')
    modalContentEl.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <img src="${t.profile_picture_url || ''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px" onerror="this.style.display='none'" alt="${t.first_name || ''}">
        <h3>${t.first_name || ''} ${t.last_name || ''}</h3>
        <span class="badge badge-matched">${LEVEL_MAP[t.teaching_level] || t.teaching_level || ''}</span>
      </div>
      ${t.bio ? '<p style="color:var(--text-gray);font-size:.9rem;text-align:center;margin-bottom:16px">' + t.bio + '</p>' : ''}
      <div style="display:grid;gap:8px">
        <div><strong>التخصص:</strong> ${t.specialization || '—'}</div>
        <div><strong>سنوات الخبرة:</strong> ${t.years_experience || '—'}</div>
        <div><strong>المؤهل:</strong> ${t.education || '—'}</div>
        <div><strong>الشهادات:</strong> ${t.certificates || '—'}</div>
        ${t.languages?.length ? '<div><strong>اللغات:</strong> ' + t.languages.map(l => LANG_MAP[l] || l).join('، ') + '</div>' : ''}
      </div>
      <button class="btn btn-primary close-modal-btn" style="width:100%;margin-top:16px">إغلاق</button>`
    modalContentEl.querySelector('.close-modal-btn')?.addEventListener('click', closeModal)
  } catch { }
}
