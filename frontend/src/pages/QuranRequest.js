import { $ } from '../utils.js'
import { toast } from '../components/Toast.js'
import { API_BASE, DAYS } from '../constants.js'
import { getToken, isLoggedIn } from '../auth.js'

const JUZ_NAMES = [
  '', 'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام',
  'الأعراف', 'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد',
  'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء',
  'النمل', 'القصص', 'العنكبوت', 'الروم'
]

function juzGridHTML(selected) {
  let html = '<div class="juz-grid">'
  for (let i = 1; i <= 30; i++) {
    const active = selected === i ? ' juz-active' : ''
    html += `<div class="juz-cell${active}" data-juz="${i}"><span class="juz-num">${i}</span><span class="juz-name">${JUZ_NAMES[i]}</span></div>`
  }
  return html + '</div>'
}

export function renderQuranRequest() {
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  return `
    <div class="page" id="page-quran-request">
      <div class="container" style="padding-top:40px;padding-bottom:40px">
        <div style="text-align:center;padding:30px 0 20px">
          <i class="fas fa-mosque" style="font-size:3rem;color:#10B981;margin-bottom:12px"></i>
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px">طلب <span class="gradient-text">تحفيظ قرآن</span> جديد</h1>
          <p style="color:var(--text-gray-muted);max-width:500px;margin:0 auto">حدد الأجزاء اللي عايز تحفظها وأوقاتك المتاحة</p>
        </div>

        <div class="glass-card" style="max-width:720px;margin:0 auto;padding:24px">
          <form id="quranForm">
            <input type="hidden" name="education_level" value="quran">

            <div class="section-title"><i class="fas fa-book-open"></i> اختر الأجزاء اللي عايز تحفظها</div>
            <div class="form-row" style="flex-wrap:wrap">
              <div class="form-group" style="flex:1;min-width:180px"><label>من الجزء</label><input type="number" id="startJuz" min="1" max="30" value="1" required></div>
              <div class="form-group" style="flex:1;min-width:180px"><label>إلى الجزء</label><input type="number" id="endJuz" min="1" max="30" value="1" required></div>
              <div class="form-group" style="flex:1;min-width:180px"><label>المستوى الحالي (واصل لكام؟)</label><input type="number" id="currentJuz" min="0" max="30" value="0" required></div>
            </div>

            <div id="juzSelector" style="margin-bottom:20px">${juzGridHTML(1)}</div>

            <div class="section-title" style="margin-top:24px"><i class="fas fa-credit-card"></i> الباقة</div>
            <div class="form-row">
              <div class="form-group" style="flex:1"><label>عدد الحصص بالأسبوع</label><select id="sessionsPerWeek" required><option value="1">حصّة واحدة</option><option value="2">حصّتان</option><option value="3">3 حصص</option><option value="4">4 حصص</option><option value="5">5 حصص</option></select></div>
              <div class="form-group" style="flex:1"><label>مدة الحصة</label><select id="sessionDuration" required><option value="30">30 دقيقة</option><option value="45" selected>45 دقيقة</option><option value="60">ساعة</option><option value="90">ساعة ونص</option></select></div>
              <div class="form-group" style="flex:1"><label>الدولة</label><select id="country" required><option value="SA">🇸🇦 السعودية</option><option value="KW">🇰🇼 الكويت</option><option value="AE">🇦🇪 الإمارات</option><option value="QA">🇶🇦 قطر</option></select></div>
            </div>

            <div class="section-title" style="margin-top:24px"><i class="fas fa-users"></i> نوع الجلسة</div>
            <div class="session-type-selector" id="sessionTypeSelector">
              <div class="session-option active" data-type="solo"><i class="fas fa-user"></i><span>فردي</span><small>تركيز كامل مع المدرس</small></div>
              <div class="session-option" data-type="group"><i class="fas fa-users"></i><span>مجموعة</span><small>مجموعة من 2-10 طلاب</small></div>
            </div>
            <div class="form-group" id="studentsCountGroup" style="display:none;margin-top:12px"><label>عدد الطلاب</label><input type="number" id="studentsCount" value="3" min="2" max="10"></div>

            <div class="section-title" style="margin-top:24px"><i class="fas fa-calendar-alt"></i> أوقاتك المتاحة</div>
            <div id="quranAvailability" class="availability-grid"></div>

            <div class="form-group" style="margin-top:16px"><label>تاريخ المتابعة الأول</label><input type="date" id="startDate" min="${minDate}" required></div>

            <div class="form-group" style="margin-top:16px"><label>ملاحظات</label><textarea id="notes" placeholder="أي ملاحظات للمدرس..." style="min-height:60px"></textarea></div>

            <div id="quranResult" style="display:none;margin-bottom:12px"></div>

            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:16px" id="quranBtn"><i class="fas fa-paper-plane"></i> إرسال الطلب</button>
          </form>
        </div>

        <div style="text-align:center;margin-top:20px"><button class="btn btn-secondary page-btn" data-page="student-dashboard"><i class="fas fa-arrow-right"></i> العودة للوحة التحكم</button></div>
      </div>
    </div>
  `
}

export function initQuranRequest() {
  if (!isLoggedIn()) return

  let selectedStart = 1
  let selectedEnd = 1
  let selectedCurrent = 0

  function renderGrid() {
    const c = $('juzSelector')
    let html = '<div class="juz-grid">'
    for (let i = 1; i <= 30; i++) {
      let cls = 'juz-cell'
      if (i >= selectedStart && i <= selectedEnd) cls += ' juz-range'
      if (i === selectedStart) cls += ' juz-start'
      if (i === selectedEnd) cls += ' juz-end'
      html += `<div class="${cls}" data-juz="${i}"><span class="juz-num">${i}</span><span class="juz-name">${JUZ_NAMES[i]}</span></div>`
    }
    c.innerHTML = html + '</div>'

    c.querySelectorAll('.juz-cell').forEach(el => {
      el.addEventListener('click', () => {
        const j = parseInt(el.dataset.juz)
        if (j < selectedStart) { selectedStart = j; if (selectedEnd < j) selectedEnd = j }
        else if (j > selectedEnd) { selectedEnd = j; if (selectedStart > j) selectedStart = j }
        else { selectedStart = j; selectedEnd = j }
        $('startJuz').value = selectedStart
        $('endJuz').value = selectedEnd
        renderGrid()
      })
    })
  }

  function updateFromInputs() {
    const s = parseInt($('startJuz').value) || 1
    const e = parseInt($('endJuz').value) || 1
    const c = parseInt($('currentJuz').value) || 0
    if (s >= 1 && s <= 30) selectedStart = s
    if (e >= 1 && e <= 30 && e >= selectedStart) selectedEnd = e
    if (c >= 0 && c <= 30) selectedCurrent = c
    renderGrid()
  }

  $('startJuz').addEventListener('change', updateFromInputs)
  $('endJuz').addEventListener('change', updateFromInputs)
  $('currentJuz').addEventListener('change', updateFromInputs)

  const g = $('quranAvailability')
  if (g && !g.children.length) {
    DAYS.forEach(d => {
      const r = document.createElement('div')
      r.className = 'avail-row'
      r.innerHTML = `
        <span class="avail-day">${d.label}</span>
        <label class="avail-toggle"><input type="checkbox" class="avail-check" data-key="${d.key}"><span class="avail-slider"></span></label>
        <input type="text" class="avail-time" placeholder="مثال: 4-6 مساءً" disabled>
        <input type="hidden" name="weekly_availability_${d.key}">
      `
      r.querySelector('.avail-check').addEventListener('change', function () {
        const inp = this.closest('.avail-row').querySelector('.avail-time')
        inp.disabled = !this.checked
        if (!this.checked) inp.value = ''
        inp.nextElementSibling.value = inp.value
      })
      r.querySelector('.avail-time').addEventListener('input', function () {
        this.nextElementSibling.value = this.value
      })
      g.appendChild(r)
    })
  }

  const sel = $('sessionTypeSelector')
  sel.querySelectorAll('.session-option').forEach(opt => {
    opt.addEventListener('click', function () {
      sel.querySelectorAll('.session-option').forEach(o => o.classList.remove('active'))
      this.classList.add('active')
      $('studentsCountGroup').style.display = this.dataset.type === 'group' ? 'block' : 'none'
    })
  })

  $('quranForm').addEventListener('submit', async e => {
    e.preventDefault()
    const btn = $('quranBtn')
    btn.disabled = true; btn.innerHTML = 'جاري الإرسال... <i class="fas fa-spinner fa-spin"></i>'

    const times = {}
    document.querySelectorAll('[name^="weekly_availability_"]').forEach(h => {
      const d = h.name.replace('weekly_availability_', '')
      if (h.value) times[d] = [h.value]
    })

    const sessionType = sel.querySelector('.active').dataset.type
    const data = {
      education_level: 'quran',
      start_juz: parseInt($('startJuz').value),
      end_juz: parseInt($('endJuz').value),
      current_juz: parseInt($('currentJuz').value),
      country: $('country').value,
      session_type: sessionType,
      sessions_per_week: parseInt($('sessionsPerWeek').value),
      session_duration: parseInt($('sessionDuration').value),
      start_date: $('startDate').value,
      weekly_availability: times,
      notes: $('notes').value
    }
    if (sessionType === 'group') data.students_count = parseInt($('studentsCount').value)

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
      e.target.reset()
      toast('تم إرسال طلب التحفيظ بنجاح', 'success')
    } catch (e) {
      toast('خطأ: ' + e.message, 'error')
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الطلب'
    }
  })
}
