import { $, esc } from '../utils.js'
import { toast } from '../components/Toast.js'
import { api } from '../api.js'
import { LEVEL_MAP } from '../constants.js'
import { Spinner } from '../components/Spinner.js'
import { confirmDialog } from '../components/ConfirmDialog.js'

const DIFF_LABEL = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' }
const PAY_LABEL = { per_session: 'بالحصة', monthly: 'شهري' }

export function renderOfferDetail() {
  return `
    <div class="page active" id="page-offer-detail">
      <div class="container" style="padding-top:32px;padding-bottom:40px;max-width:760px">
        <div id="odBack" style="margin-bottom:16px"></div>
        <div id="odContent">${Spinner()}</div>
      </div>
    </div>
  `
}

export async function initOfferDetail(navigate) {
  const back = $('#odBack')
  if (back) {
    back.innerHTML = `<button class="btn btn-sm btn-ghost page-btn" data-page="student-dashboard"><i class="fas fa-arrow-right"></i> رجوع للوحة التحكم</button>`
  }
  const cont = $('#odContent')
  if (!cont) return

  const fileId = new URLSearchParams(window.location.search).get('file_id')
  if (!fileId) {
    cont.innerHTML = '<p class="empty">طلب غير صالح — رجوع للوحة التحكم وجرب تاني</p>'
    return
  }

  try {
    const [file, offers] = await Promise.all([
      api('GET', '/files/' + fileId + '/'),
      api('GET', '/offers/?file_id=' + fileId),
    ])
    renderOD(cont, file, offers)
  } catch (e) {
    cont.innerHTML = `<p class="empty">تعذر تحميل الطلب: ${esc(e.data?.error || e.message)}</p>`
  }
}

function renderOD(cont, file, offers) {
  const level = LEVEL_MAP[file.education_level] || file.education_level || '—'
  const diff = DIFF_LABEL[file.difficulty] || file.difficulty || '—'
  const cur = file.currency || ''
  const matched = file.status === 'matched'
  const pendingCount = offers.filter(o => o.status === 'pending').length

  cont.innerHTML = `
    <div class="card" style="padding:22px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        <div>
          <h3 style="margin-bottom:6px">طلب #${file.id} — ${esc(level)}</h3>
          <p style="color:var(--text-gray-muted);font-size:.88rem;line-height:1.8">
            <i class="fas fa-book" style="color:var(--gold)"></i> ${esc(file.specialization || '—')}
            · <i class="fas fa-signal" style="color:var(--gold)"></i> ${esc(diff)}
            · <i class="fas fa-clock" style="color:var(--gold)"></i> ${file.estimated_hours || '—'} ساعات تقديرية
          </p>
        </div>
        <span class="badge badge-${esc(file.status)}">${esc(file.status)}</span>
      </div>
      <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.25);border-radius:var(--radius-md);padding:14px 18px;display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(201,168,76,0.1);display:flex;align-items:center;justify-content:center;color:var(--gold)"><i class="fas fa-microchip"></i></div>
          <div>
            <div style="font-size:.75rem;color:var(--text-gray-muted)">السعر المقترح من الذكاء الاصطناعي</div>
            <div style="font-family:var(--font-heading);font-size:1.25rem;font-weight:800;color:var(--gold)">${file.base_price} ${esc(cur)}</div>
          </div>
        </div>
        <div style="font-size:.8rem;color:var(--text-gray-muted)">المدرس بيحدد السعر النهائي في عرضه</div>
      </div>
      ${matched && pendingCount === 0 ? `<p style="margin-top:12px;font-size:.82rem;color:var(--text-gray-muted)">الملف اتقبل بالفعل — تقدّم الجلسات من لوحة التحكم.</p>` : ''}
    </div>

    <div id="odOffers">
      <h3 style="margin-bottom:12px">العروض المقدمة <span style="color:var(--text-muted);font-size:.85rem">(${offers.length})</span></h3>
      ${offers.length
        ? `<div style="display:flex;flex-direction:column;gap:12px">${offers.map(o => offerCard(o, cur, matched)).join('')}</div>`
        : '<p class="empty">لسه مفيش عروض من المدرسين — أول جلسة مع أي مدرس مجانية</p>'}
    </div>
  `

  cont.querySelectorAll('.od-accept-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirmDialog('قبول عرض هذا المدرس؟ باقي العروض المعلقة هتترفض تلقائياً.')
      if (!ok) return
      btn.disabled = true
      try {
        const d = await api('PUT', '/offers/' + btn.dataset.id + '/accept/')
        toast('تم قبول العرض بنجاح', 'success')
        const s = d.session
        if (typeof navigate === 'function') {
          navigate('payment?session_id=' + s.id + '&amount=' + d.offer.tutor_price + '&currency=' + encodeURIComponent(cur) + '&trial=' + (s.is_trial ? 1 : 0))
        }
      } catch (e) {
        toast('خطأ: ' + (e.data?.error || e.message), 'error')
        btn.disabled = false
      }
    })
  })

  cont.querySelectorAll('.od-reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirmDialog('رفض عرض هذا المدرس؟')
      if (!ok) return
      btn.disabled = true
      try {
        await api('PUT', '/offers/' + btn.dataset.id + '/reject/')
        toast('تم رفض العرض', 'success')
        initOfferDetail(navigate)
      } catch (e) {
        toast('خطأ: ' + (e.data?.error || e.message), 'error')
        btn.disabled = false
      }
    })
  })

  cont.querySelectorAll('.od-tutor-link').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.tutorId
      if (id && typeof navigate === 'function') navigate('tutor-profile?id=' + id)
    })
  })
}

function offerCard(o, cur, fileMatched) {
  const t = o.tutor || {}
  const name = ((t.first_name || t.username || 'مدرس') + (t.last_name ? ' ' + t.last_name : '')).trim()
  const rating = t.average_rating
  const stars = rating != null ? starHtml(rating) : '<span style="font-size:.78rem;color:var(--text-muted)">مدرس جديد (من غير تقييم)</span>'
  const pay = PAY_LABEL[o.payment_type] || ''
  const pending = o.status === 'pending' && !fileMatched
  const isAccepted = o.status === 'accepted'
  const statusBadge = isAccepted
    ? '<span class="badge badge-matched" style="font-size:.7rem">اتقبل</span>'
    : o.status === 'rejected'
      ? '<span class="badge badge-rejected" style="font-size:.7rem">مرفوض</span>'
      : '<span class="badge badge-pending" style="font-size:.7rem">معلق</span>'
  const priceSuffix = pay === 'شهري' ? '/ الشهر' : '/ الحصة'

  return `
    <div class="offer-row" style="background:var(--bg-dark-card);border:${isAccepted ? '1px solid rgba(201,168,76,0.5)' : 'var(--border-glass)'};border-radius:var(--radius-md);padding:18px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <img src="${esc(t.profile_picture_url || '')}" onerror="this.style.display='none'" class="od-tutor-link" data-tutor-id="${o.tutor?.id || ''}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;cursor:pointer" alt="">
      <div style="flex:1;min-width:170px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <strong class="od-tutor-link" data-tutor-id="${o.tutor?.id || ''}" style="font-size:.95rem;cursor:pointer;color:var(--gold)">${esc(name)}</strong>
          ${statusBadge}
        </div>
        <div style="margin-top:4px">${stars}</div>
        <div style="font-size:.8rem;color:var(--text-gray-muted);margin-top:2px">${esc(t.specialization || '')} ${pay ? '· ' + esc(pay) : ''}</div>
      </div>
      <div style="text-align:center;min-width:100px">
        <div style="font-family:var(--font-heading);font-size:1.2rem;font-weight:800;color:var(--gold)">${o.tutor_price} ${esc(cur)}</div>
        <div style="font-size:.72rem;color:var(--text-gray-muted)">${priceSuffix}</div>
      </div>
      <div style="display:flex;gap:8px">
        ${pending
          ? `<button class="btn btn-sm btn-primary od-accept-btn" data-id="${o.id}"><i class="fas fa-check"></i> قبول</button>
             <button class="btn btn-sm btn-ghost od-reject-btn" data-id="${o.id}"><i class="fas fa-times"></i> رفض</button>`
          : ''}
      </div>
    </div>
  `
}

function starHtml(r) {
  const full = Math.round(r)
  let s = ''
  for (let i = 1; i <= 5; i++) {
    s += `<i class="fas fa-star" style="color:${i <= full ? 'var(--gold)' : 'rgba(255,255,255,0.12)'};font-size:.75rem"></i>`
  }
  return `<span style="display:inline-flex;align-items:center;gap:2px">${s}<span style="font-size:.75rem;color:var(--text-muted);margin-right:4px">${r}</span></span>`
}
