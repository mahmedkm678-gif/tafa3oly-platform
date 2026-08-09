import { $, esc } from '../utils.js'
import { api } from '../api.js'
import { LEVEL_MAP, LANG_MAP } from '../constants.js'
import { Spinner } from '../components/Spinner.js'

export function renderTutorProfile() {
  return `
    <div class="page active" id="page-tutor-profile">
      <div class="container" style="padding-top:32px;padding-bottom:40px;max-width:760px">
        <div id="tpBack" style="margin-bottom:16px"></div>
        <div id="tpContent">${Spinner()}</div>
      </div>
    </div>
  `
}

export async function initTutorProfile() {
  const back = $('#tpBack')
  if (back) {
    back.innerHTML = `<button class="btn btn-sm btn-ghost page-btn" data-page="home"><i class="fas fa-arrow-right"></i> الرجوع للرئيسية</button>`
  }
  const cont = $('#tpContent')
  if (!cont) return

  const id = new URLSearchParams(window.location.search).get('id')
  if (!id) {
    cont.innerHTML = '<p class="empty">مدرس غير صالح — اختر مدرساً من القائمة</p>'
    return
  }

  try {
    const [t, rev] = await Promise.all([
      api('GET', '/tutors/' + id + '/'),
      api('GET', '/offers/reviews/' + id + '/'),
    ])
    renderProfile(cont, t, rev)
  } catch (e) {
    cont.innerHTML = `<p class="empty">تعذر تحميل بيانات المدرس: ${esc(e.data?.error || e.message)}</p>`
  }
}

function stars(r) {
  if (r == null) return '<span style="font-size:.8rem;color:var(--text-muted)">من غير تقييم</span>'
  const full = Math.round(r)
  let s = ''
  for (let i = 1; i <= 5; i++) {
    s += `<i class="fas fa-star" style="color:${i <= full ? 'var(--gold)' : 'rgba(255,255,255,0.12)'};font-size:.85rem"></i>`
  }
  return `<span style="display:inline-flex;align-items:center;gap:3px">${s}</span>`
}

function renderProfile(cont, t, rev) {
  const level = LEVEL_MAP[t.teaching_level] || t.teaching_level || '—'
  const langs = Array.isArray(t.languages) ? t.languages.map(l => LANG_MAP[l] || l) : []
  const reviews = Array.isArray(rev.reviews) ? rev.reviews : []
  const avg = rev.average_rating != null ? Number(rev.average_rating).toFixed(1) : null

  cont.innerHTML = `
    <div class="card" style="padding:24px;margin-bottom:16px">
      <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
        <img src="${esc(t.profile_picture_url || '')}" onerror="this.style.display='none'" alt="${esc(t.first_name || '')}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:2px solid rgba(201,168,76,.3)">
        <div style="flex:1;min-width:200px">
          <h2 style="margin-bottom:6px">أ. ${esc(t.first_name || '')} ${esc(t.last_name || '')}</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px">
            ${t.is_available ? '<span class="online-badge"><span class="dot"></span> متاح الآن</span>' : '<span class="badge">غير متاح حالياً</span>'}
            <span class="badge badge-matched">${esc(level)}</span>
          </div>
          <div style="font-size:.88rem;color:var(--text-gray-muted);line-height:1.9">
            ${t.specialization ? '<div><i class="fas fa-graduation-cap" style="color:var(--gold)"></i> ' + esc(t.specialization) + '</div>' : ''}
            ${t.years_experience ? '<div><i class="fas fa-briefcase" style="color:var(--gold)"></i> ' + esc(String(t.years_experience)) + ' سنوات خبرة</div>' : ''}
            ${langs.length ? '<div><i class="fas fa-language" style="color:var(--gold)"></i> ' + langs.map(esc).join('، ') + '</div>' : ''}
          </div>
          <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
            ${stars(avg)} ${avg ? '<span style="color:var(--text-muted);font-size:.85rem">(' + esc(String(rev.total_reviews || 0)) + ' تقييم)</span>' : ''}
          </div>
        </div>
      </div>
      ${t.bio ? '<div style="margin-top:16px;color:var(--text-gray);font-size:.9rem;line-height:1.9;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:var(--radius-md);padding:14px 16px">' + esc(t.bio) + '</div>' : ''}
      ${(t.education || t.certificates) ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
          ${t.education ? '<div><div style="font-size:.78rem;color:var(--text-muted)">المؤهل</div><div style="font-size:.9rem">' + esc(t.education) + '</div></div>' : ''}
          ${t.certificates ? '<div><div style="font-size:.78rem;color:var(--text-muted)">الشهادات</div><div style="font-size:.9rem">' + esc(t.certificates) + '</div></div>' : ''}
        </div>` : ''}
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary page-btn" data-page="register"><i class="fas fa-user-graduate"></i> سجّل كطالب وابدأ معه</button>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <h3 style="margin-bottom:12px">تقييمات المدرس <span style="color:var(--text-muted);font-size:.85rem">(${esc(String(rev.total_reviews || 0))})</span></h3>
      ${reviews.length ? reviews.map(r => `
        <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <strong style="font-size:.9rem">${esc(r.student_name || 'طالب')}</strong>
            <span style="color:var(--text-muted);font-size:.78rem">${new Date(r.created_at).toLocaleDateString('ar')}</span>
          </div>
          <div style="margin:4px 0">${stars(r.rating)}</div>
          ${r.comment ? '<div style="color:var(--text-gray-muted);font-size:.87rem;line-height:1.7">' + esc(r.comment) + '</div>' : ''}
        </div>
      `).join('') : '<p class="empty">لا توجد تقييمات بعد — أول جلسة معه مجانية، جرب وقيّم!</p>'}
    </div>
  `
}
