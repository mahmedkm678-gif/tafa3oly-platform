const STUDENT_STEPS = [
  { icon: 'fa-cloud-upload-alt', title: 'ارفع ملفك أو محاضرتك', desc: 'ارفع ملف PDF لمحاضرتك، مذكرتك، أو أي مادة عايز تتعلمها.' },
  { icon: 'fa-microchip', title: 'الذكاء الاصطناعي يحلل المحتوى', desc: 'بيحدد التخصص ومستوى الصعوبة ويقترح سعر مبدئي عادل — ده نقطة بداية مش سعر نهائي.' },
  { icon: 'fa-handshake', title: 'المدرسين يبعتوا عروضهم', desc: 'مدرسين متخصصين في نفس مستواك يشوفوا طلبك ويبعتولك عروض أسعار، وإنت تقارن وتختار اللي يناسبك.' },
  { icon: 'fa-chalkboard-teacher', title: 'ابدأ التعلم مع مدرس حقيقي', desc: 'بعد ما توافق على عرض وتدفع، بتبدأ حصصك مع مدرس بشري متخصص — مش شات بوت.' },
]

const TUTOR_STEPS = [
  { icon: 'fa-id-card', title: 'اعمل بروفايلك', desc: 'أضف خبرتك، شهاداتك، والمواد اللي بتدرّسها ومستوياتها.' },
  { icon: 'fa-toggle-on', title: 'فعّل "متاح الآن"', desc: 'لما تكون جاهز تاخد طلاب جداد، فعّل حالة التوفر عشان تظهر طلباتك.' },
  { icon: 'fa-inbox', title: 'شوف الطلبات في تخصصك', desc: 'كل الطلبات اللي في نفس المستوى والتخصص بتاعك بتظهرلك، مع السعر المقترح من الـ AI.' },
  { icon: 'fa-hand-holding-usd', title: 'ابعت عرضك وابدأ', desc: 'حدد سعرك الخاص، ولو الطالب وافق تبدأ الحصص وتاخد أرباحك شهريًا.' },
]

const STUDENT_FAQ = [
  { q: 'هل الذكاء الاصطناعي هو اللي بيدرّسني؟', a: 'لأ خالص. الذكاء الاصطناعي بيحلل المحتوى بس عشان يحدد المستوى والسعر ويرشحلك مدرس مناسب. التدريس الفعلي بيحصل مع مدرس بشري حقيقي.' },
  { q: 'السعر اللي بيظهرلي بعد التحليل نهائي؟', a: 'لأ، ده سعر مبدئي مقترح بس. المدرسين المتاحين ممكن يبعتولك عروض بأسعار مختلفة شوية، وإنت اللي بتختار توافق على أنهي عرض.' },
  { q: 'هل ممكن أرفض كل العروض؟', a: 'أكيد، مفيش أي التزام. تقدر تستنى عروض تانية أو تعدل طلبك.' },
]

const TUTOR_FAQ = [
  { q: 'إزاي بحدد سعري؟', a: 'الذكاء الاصطناعي بيقترحلك سعر بداية بناءً على صعوبة المادة والدولة، وإنت حر تحدد سعرك الفعلي في عرضك.' },
  { q: 'إمتى بستلم فلوسي؟', a: 'أرباحك بتتجمع وبتتصرف لك شهريًا في نهاية كل شهر.' },
]

export function renderHowItWorks() {
  return `
    <div class="page active" id="page-how-it-works">
      <section style="text-align:center;padding:80px 0 40px;background:radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.15) 0%,transparent 60%)">
        <div class="container">
          <span class="ai-badge"><i class="fas fa-question-circle"></i> ازاي بتشتغل تفاعلي</span>
          <h1 style="font-size:2.6rem;font-weight:900;margin:16px 0 10px">ازاي بتشتغل <span class="gradient-text">تفاعلي</span>؟</h1>
          <p style="color:var(--text-muted);max-width:560px;margin:0 auto">سواء كنت طالب بتدور على مدرس، أو مدرس عايز تدرّس — اختار دورك وشوف الرحلة كاملة.</p>

          <div class="session-type-selector" id="hiwTabs" style="max-width:420px;margin:28px auto 0">
            <div class="session-option active" data-role="student"><i class="fas fa-user-graduate"></i><span>أنا طالب</span></div>
            <div class="session-option" data-role="tutor"><i class="fas fa-chalkboard-teacher"></i><span>أنا مدرس</span></div>
          </div>
        </div>
      </section>

      <section class="container" style="padding:40px 0">
        <div id="hiwStudentPanel">
          <div class="sim-grid" style="grid-template-columns:repeat(4,1fr)">
            ${STUDENT_STEPS.map((s, i) => `
              <div class="sim-card">
                <div class="sim-icon"><i class="fas ${s.icon}"></i></div>
                <span class="badge" style="margin-bottom:8px;display:inline-block">خطوة ${i + 1}</span>
                <h4 style="margin-bottom:8px">${s.title}</h4>
                <p style="color:var(--text-muted);font-size:.85rem">${s.desc}</p>
              </div>
            `).join('')}
          </div>

          <div class="glass-card" style="max-width:640px;margin:40px auto;padding:24px;text-align:center">
            <i class="fas fa-shield-alt" style="color:#10B981;font-size:1.6rem;margin-bottom:10px"></i>
            <h3 style="margin-bottom:8px">التدريس دايمًا مع بني آدم حقيقي</h3>
            <p style="color:var(--text-muted);font-size:.9rem">الذكاء الاصطناعي بيسهّل عليك المطابقة والتسعير بس — مش بديل عن المدرس. أي حصة بتاخدها هتكون مع مدرس متخصص فعلي.</p>
          </div>

          <div style="text-align:center;margin-top:20px">
            <button class="btn btn-primary page-btn" data-page="register"><i class="fas fa-rocket"></i> ابدأ دلوقتي مجانًا</button>
          </div>

          <div style="max-width:700px;margin:50px auto 0">
            ${STUDENT_FAQ.map((f, i) => `
              <details class="faq-item" style="background:var(--glass-bg);border:var(--border-glass);border-radius:var(--radius-md);margin-bottom:12px;overflow:hidden${i === 0 ? ';open' : ''}">
                <summary style="padding:16px 22px;cursor:pointer;font-weight:700;font-size:.95rem">${f.q}</summary>
                <div style="padding:0 22px 16px;color:var(--text-gray-muted);font-size:.88rem;line-height:1.8">${f.a}</div>
              </details>
            `).join('')}
          </div>
        </div>

        <div id="hiwTutorPanel" style="display:none">
          <div class="sim-grid" style="grid-template-columns:repeat(4,1fr)">
            ${TUTOR_STEPS.map((s, i) => `
              <div class="sim-card">
                <div class="sim-icon"><i class="fas ${s.icon}"></i></div>
                <span class="badge" style="margin-bottom:8px;display:inline-block">خطوة ${i + 1}</span>
                <h4 style="margin-bottom:8px">${s.title}</h4>
                <p style="color:var(--text-muted);font-size:.85rem">${s.desc}</p>
              </div>
            `).join('')}
          </div>

          <div class="glass-card" style="max-width:640px;margin:40px auto;padding:24px;text-align:center">
            <i class="fas fa-coins" style="color:#F59E0B;font-size:1.6rem;margin-bottom:10px"></i>
            <h3 style="margin-bottom:8px">85% من قيمة كل جلسة ليك</h3>
            <p style="color:var(--text-muted);font-size:.9rem">تفاعلي بتاخد 15% عمولة خدمة بس، والباقي بيتصرف لك شهريًا.</p>
          </div>

          <div style="text-align:center;margin-top:20px">
            <button class="btn btn-primary page-btn" data-page="register"><i class="fas fa-chalkboard-teacher"></i> سجّل كمدرس</button>
          </div>

          <div style="max-width:700px;margin:50px auto 0">
            ${TUTOR_FAQ.map((f, i) => `
              <details class="faq-item" style="background:var(--glass-bg);border:var(--border-glass);border-radius:var(--radius-md);margin-bottom:12px;overflow:hidden${i === 0 ? ';open' : ''}">
                <summary style="padding:16px 22px;cursor:pointer;font-weight:700;font-size:.95rem">${f.q}</summary>
                <div style="padding:0 22px 16px;color:var(--text-gray-muted);font-size:.88rem;line-height:1.8">${f.a}</div>
              </details>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `
}

export function initHowItWorks() {
  const tabs = document.getElementById('hiwTabs')
  const studentPanel = document.getElementById('hiwStudentPanel')
  const tutorPanel = document.getElementById('hiwTutorPanel')
  if (!tabs) return

  function setRole(role) {
    tabs.querySelectorAll('.session-option').forEach(o => o.classList.remove('active'))
    const opt = tabs.querySelector(`.session-option[data-role="${role}"]`)
    if (opt) opt.classList.add('active')
    studentPanel.style.display = role === 'student' ? 'block' : 'none'
    tutorPanel.style.display = role === 'tutor' ? 'block' : 'none'
  }

  const role = new URLSearchParams(window.location.search).get('role')
  setRole(role === 'tutor' ? 'tutor' : 'student')

  tabs.querySelectorAll('.session-option').forEach(opt => {
    opt.addEventListener('click', function () {
      setRole(this.dataset.role)
    })
  })
}
