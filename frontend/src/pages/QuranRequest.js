import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { API_BASE, DAYS } from '../constants.js'
import { getToken, isLoggedIn } from '../auth.js'

export function renderQuranRequest() {
  return `
    <div class="page" id="page-quran-request">
      <div class="container" style="padding-top:40px;padding-bottom:40px">
        <div style="text-align:center;padding:40px 0">
          <i class="fas fa-mosque" style="font-size:3rem;color:#10B981;margin-bottom:12px"></i>
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px">طلب <span class="gradient-text">تحفيظ قرآن</span> جديد</h1>
          <p style="color:var(--text-gray-muted);max-width:500px;margin:0 auto">اختر جزأ البداية وحدد أوقاتك المتاحة لنجد لك المدرس المناسب</p>
        </div>
        <div class="glass-card" style="max-width:640px;margin:0 auto;padding:24px">
          <form id="quranForm">
            <input type="hidden" name="education_level" value="quran">
            <div class="form-row">
              <div class="form-group"><label>من الجزء</label><input type="number" name="start_juz" min="1" max="30" value="1" required></div>
              <div class="form-group"><label>الجزء الحالي</label><input type="number" name="current_juz" min="1" max="30" value="1" required></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>الدولة</label><select name="country" required><option value="SA">السعودية</option><option value="KW">الكويت</option><option value="AE">الإمارات</option><option value="QA">قطر</option></select></div>
              <div class="form-group"><label>نوع الجلسة</label><select name="session_type" id="quranSessionType" required><option value="solo">فردي</option><option value="group">مجموعة</option></select></div>
              <div class="form-group" id="quranStudentsGroup" style="display:none"><label>عدد الطلاب</label><input type="number" name="students_count" value="2" min="2" max="10"></div>
            </div>
            <div class="form-group">
              <label>أوقاتك المتاحة</label>
              <div id="quranAvailability" style="display:flex;flex-direction:column;gap:8px"></div>
            </div>
            <div class="form-group"><label>ملاحظات</label><textarea name="notes" placeholder="أي ملاحظات للمدرس..."></textarea></div>
            <div id="quranResult" style="display:none;margin-bottom:12px"></div>
            <button type="submit" class="btn btn-primary" style="width:100%" id="quranBtn">إرسال الطلب</button>
          </form>
        </div>
        <div style="text-align:center;margin-top:20px"><button class="btn btn-secondary page-btn" data-page="student-dashboard"><i class="fas fa-arrow-right"></i> العودة للوحة التحكم</button></div>
      </div>
    </div>
  `
}

export function initQuranRequest() {
  if (!isLoggedIn()) return
  const g = $('quranAvailability')
  if (!g || g.children.length) return

  DAYS.forEach(d => {
    const r = document.createElement('div')
    r.style.cssText = 'display:flex;align-items:center;gap:10px'
    r.innerHTML = `
      <span style="min-width:60px;font-weight:600;color:var(--text-gray)">${d.label}</span>
      <input type="text" placeholder="مثال: 4-6 مساءً" style="flex:1;padding:8px 10px;background:rgba(255,255,255,0.03);border:var(--border-glass);border-radius:var(--radius-sm);color:var(--text-white);font-family:inherit">
      <input type="hidden" name="weekly_availability_${d.key}">
    `
    r.querySelector('input[type="text"]').addEventListener('input', function () {
      this.nextElementSibling.value = this.value
    })
    g.appendChild(r)
  })

  $('quranSessionType').addEventListener('change', function () {
    $('quranStudentsGroup').style.display = this.value === 'group' ? 'block' : 'none'
  })

  $('quranForm').addEventListener('submit', async e => {
    e.preventDefault()
    const btn = $('quranBtn')
    btn.disabled = true; btn.textContent = 'جاري الإرسال...'

    const times = {}
    document.querySelectorAll('[name^="weekly_availability_"]').forEach(h => {
      const d = h.name.replace('weekly_availability_', '')
      if (h.value) times[d] = [h.value]
    })
    const f = e.target
    const data = {
      education_level: 'quran', start_juz: parseInt(f.start_juz.value),
      current_juz: parseInt(f.current_juz.value), country: f.country.value,
      session_type: f.session_type.value, weekly_availability: times, notes: f.notes.value
    }
    if (data.session_type === 'group') data.students_count = parseInt(f.students_count.value)

    try {
      const r = await fetch(API_BASE + '/files/structured-request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + getToken() },
        body: JSON.stringify(data)
      })
      const res = await r.json()
      if (!r.ok) throw new Error(JSON.stringify(res))
      $('quranResult').style.display = 'block'
      $('quranResult').innerHTML = '<div class="price-box" style="margin:0"><div style="color:#10B981;font-weight:700;text-align:center">✅ تم إرسال طلب التحفيظ بنجاح</div></div>'
      f.reset()
      toast('تم إرسال طلب التحفيظ بنجاح', 'success')
    } catch (e) {
      toast('خطأ: ' + e.message, 'error')
    } finally {
      btn.disabled = false; btn.textContent = 'إرسال الطلب'
    }
  })
}
