import { $, esc } from '../utils.js'
import { toast } from '../components/Toast.js'
import { api } from '../api.js'

const STAR_HTML = [1, 2, 3, 4, 5].map(n =>
  `<i class="fas fa-star rf-star" data-val="${n}" style="color:rgba(255,255,255,0.12)"></i>`
).join('')

export function renderReviewForm({ tutorName = '' } = {}) {
  return `
    <div class="modal" style="max-width:440px">
      <h3 style="margin-bottom:4px">تقييم المدرس</h3>
      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:16px">كيف كانت تجربتك مع ${esc(tutorName) || 'هذا المدرس'}؟ تقييمك يظهر على بروفايله ويساعد الطلاب الآخرين.</p>
      <div id="rfStars" style="display:flex;gap:6px;font-size:1.6rem;cursor:pointer;margin-bottom:6px">${STAR_HTML}</div>
      <div style="color:var(--text-muted);font-size:.8rem;margin-bottom:14px" id="rfHint">اضغط على النجوم لتحديد التقييم</div>
      <div class="form-group"><label>تعليقك</label><textarea id="rfComment" rows="3" placeholder="شارك تفاصيل تجربتك..."></textarea></div>
      <div class="modal-btns">
        <button class="btn btn-primary" id="rfSubmitBtn">إرسال التقييم</button>
        <button class="btn btn-ghost" id="rfCloseBtn">إلغاء</button>
      </div>
      <p id="rfError" style="color:#EF4444;font-size:.85rem;margin-top:8px;display:none"></p>
    </div>
  `
}

export function openReviewForm({ sessionId, tutorName = '', onSuccess } = {}) {
  document.getElementById('reviewModal')?.remove()

  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay active'
  overlay.id = 'reviewModal'
  overlay.onclick = function (e) { if (e.target === this) closeReviewForm() }
  overlay.innerHTML = renderReviewForm({ tutorName })
  document.body.appendChild(overlay)

  let rfRating = 0

  function paintStars(n) {
    overlay.querySelectorAll('.rf-star').forEach(s => {
      s.style.color = parseInt(s.dataset.val) <= n ? 'var(--gold)' : 'rgba(255,255,255,0.12)'
    })
  }

  overlay.querySelectorAll('.rf-star').forEach(s => {
    s.addEventListener('mouseenter', () => paintStars(parseInt(s.dataset.val)))
    s.addEventListener('click', () => {
      rfRating = parseInt(s.dataset.val)
      paintStars(rfRating)
      $('rfHint').textContent = 'التقييم المختار: ' + rfRating + ' / 5'
    })
  })
  overlay.addEventListener('mouseleave', () => paintStars(rfRating))

  $('rfSubmitBtn').addEventListener('click', async () => {
    if (!rfRating) {
      $('rfError').textContent = 'اختر تقييماً من 1 إلى 5 نجوم'
      $('rfError').style.display = 'block'
      return
    }
    const btn = $('rfSubmitBtn')
    btn.disabled = true
    btn.textContent = 'جاري الإرسال...'
    $('rfError').style.display = 'none'
    try {
      await api('POST', '/offers/reviews/create/', {
        session_id: sessionId,
        rating: rfRating,
        comment: $('rfComment').value,
      })
      toast('تم إرسال تقييمك ✓ شكراً!', 'success')
      closeReviewForm()
      if (typeof onSuccess === 'function') onSuccess()
    } catch (e) {
      $('rfError').textContent = e.data?.error || e.message
      $('rfError').style.display = 'block'
      btn.disabled = false
      btn.textContent = 'إرسال التقييم'
    }
  })

  $('rfCloseBtn').addEventListener('click', closeReviewForm)
}

function closeReviewForm() {
  document.getElementById('reviewModal')?.remove()
}
