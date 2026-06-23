import { toast } from '../components/Toast.js'

const HOME_LEVELS = [
  { icon: 'fa-mosque', color: '#10B981', bg: 'rgba(16,185,129,0.1)', title: 'القرآن الكريم', desc: 'حفظ وتجويد قرآن مع مدرسين متخصصين معتمدين', tag: 'حفظ + تجويد', price: '30 ر.س', link: 'quran-request' },
  { icon: 'fa-university', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', title: 'الجامعة', desc: 'مقررات جامعية في جميع التخصصات، أبحاث، مشاريع تخرج', tag: 'تخصصات متنوعة', price: '25 ر.س', link: 'register' },
  { icon: 'fa-school', color: '#EC4899', bg: 'rgba(236,72,153,0.1)', title: 'الثانوية', desc: 'مواد الثانوية العامة، تحضير للقدرات والتحصيلي', tag: 'قدرات + تحصيلي', price: '20 ر.س', link: 'register' },
  { icon: 'fa-book-open', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', title: 'المتوسطة', desc: 'جميع مواد المرحلة المتوسطة، متابعة يومية وواجبات مكثفة', tag: 'متابعة مستمرة', price: '15 ر.س', link: 'register' },
  { icon: 'fa-child', color: '#10B981', bg: 'rgba(16,185,129,0.1)', title: 'الابتدائية', desc: 'تأسيس قوي في القراءة والكتابة والحساب', tag: 'تأسيس + متابعة', price: '20 ر.س', link: 'register' },
  { icon: 'fa-cubes', color: '#A855F7', bg: 'rgba(168,85,247,0.1)', title: 'رياض الأطفال', desc: 'برنامج تعليمي مبكر للأطفال، تعلّم باللعب والأنشطة التفاعلية', tag: 'لعب + تعلّم', price: '12 ر.س', link: 'register' },
  { icon: 'fa-language', color: '#EC4899', bg: 'rgba(236,72,153,0.1)', title: 'اللغات', desc: 'دورات لغة في 8 لغات مع مدرسين ناطقين أصليين', tag: '8 لغات · CEFR', price: '25 ر.س', link: 'register', wide: true },
]

const TYPING_WORDS = ['التحصيل الدراسي', 'حفظ القرآن الكريم', 'اللغات الأجنبية', 'المشاريع الجامعية', 'تأسيس الأطفال']

const COMPARISON = [
  { feature: 'تقييم المستوى', ai: 'تحليل دقيق بالذكاء الاصطناعي', trad: 'تقييم يدوي تقليدي' },
  { feature: 'اختيار المدرس', ai: 'توافق ذكي حسب مستواك', trad: 'اختيار عشوائي' },
  { feature: 'المتابعة', ai: 'تتبع تقدمك آلياً', trad: 'متابعة تقليدية' },
  { feature: 'التسعير', ai: 'شفاف ومدروس', trad: 'أسعار متغيرة' },
  { feature: 'المرونة', ai: 'جلسات حسب جدولك', trad: 'أوقات محددة' },
]

export function renderHome() {
  return `
    <div class="page active" id="page-home">

      <section style="text-align:center;padding:110px 0 80px;background:radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.15) 0%,transparent 60%)">
        <div class="container">
          <div class="ai-badge"><i class="fas fa-robot"></i> مدعوم بالذكاء الاصطناعي</div>
          <h1 style="font-size:3.2rem;font-weight:900;margin:20px 0 12px;line-height:1.2">منصة <span class="gradient-text">تفاعلي</span> التعليمية</h1>
          <p style="color:var(--text-muted);font-size:1.15rem;max-width:600px;margin:0 auto">الحل الأمثل لـ <span id="typewriter-text" style="color:var(--accent-purple);font-weight:700"></span><span class="typewriter-cursor">|</span></p>
          <p style="color:var(--text-muted);font-size:.95rem;margin:12px auto 36px;max-width:550px">ارفع ملفك الأكاديمي، يحلله الذكاء الاصطناعي ويحدد مستواك بدقة، ويقترح أفضل مدرس يناسبك</p>
          <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-primary page-btn" data-page="register"><i class="fas fa-rocket"></i> ابدأ مجاناً</button>
            <button class="btn btn-secondary page-btn" data-page="quran-request"><i class="fas fa-mosque"></i> تحفيظ قرآن</button>
            <button class="btn btn-ghost page-btn" data-page="login"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
          </div>
        </div>
      </section>

      <section class="container" style="padding:60px 0">
        <div style="text-align:center;margin-bottom:40px">
          <span class="badge badge-matched" style="font-size:.85rem;padding:6px 18px">المحاكاة التفاعلية</span>
          <h2 style="font-size:2rem;font-weight:800;margin-top:12px">كيف يعمل <span class="gradient-text">الذكاء الاصطناعي</span>؟</h2>
          <p style="color:var(--text-muted);margin-top:8px">ثلاث خطوات بسيطة — من الرفع إلى التطابق مع المدرس</p>
        </div>
        <div class="sim-grid">
          <div class="sim-card">
            <div class="sim-icon"><i class="fas fa-cloud-upload-alt"></i></div>
            <h4 style="margin-bottom:8px">ارفع ملفك الأكاديمي</h4>
            <p style="color:var(--text-muted);font-size:.85rem">قم برفع ملف PDF لجدول درجاتك أو شهاداتك السابقة</p>
          </div>
          <div class="sim-arrow"><i class="fas fa-arrow-left"></i></div>
          <div class="sim-card">
            <div class="sim-icon"><i class="fas fa-microchip"></i></div>
            <h4 style="margin-bottom:8px">تحليل بالذكاء الاصطناعي</h4>
            <p style="color:var(--text-muted);font-size:.85rem">يقوم AI بتحليل ملفك وتحديد مستواك بدقة متناهية</p>
          </div>
          <div class="sim-arrow"><i class="fas fa-arrow-left"></i></div>
          <div class="sim-card">
            <div class="sim-icon"><i class="fas fa-handshake"></i></div>
            <h4 style="margin-bottom:8px">تطابق مع مدرس</h4>
            <p style="color:var(--text-muted);font-size:.85rem">يقترح النظام أفضل مدرس يناسب مستواك وميزانيتك</p>
          </div>
        </div>
      </section>

      <section class="container" style="padding:40px 0">
        <div style="text-align:center;margin-bottom:32px">
          <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">تفاعلي vs <span class="gradient-text">التقليدي</span></h2>
          <p style="color:var(--text-muted)">لماذا منصتنا هي الخيار الأفضل لمستقبل تعليمك؟</p>
        </div>
        <div class="comparison-wrapper">
          <table class="comparison-table">
            <tr><th></th><th><i class="fas fa-graduation-cap" style="color:var(--accent-purple)"></i> تفاعلي</th><th><i class="fas fa-school"></i> التقليدي</th></tr>
            ${COMPARISON.map(r => `<tr><td class="comp-feat">${r.feature}</td><td class="comp-ai"><i class="fas fa-check-circle"></i> ${r.ai}</td><td class="comp-trad"><i class="fas fa-times-circle"></i> ${r.trad}</td></tr>`).join('')}
          </table>
        </div>
      </section>

      <section class="container" style="padding:20px 0 40px">
        <div style="text-align:center;margin-bottom:24px">
          <span class="badge badge-matched" style="font-size:.8rem">نخدم دول الخليج</span>
        </div>
        <div class="trust-bar">
          <div class="trust-item"><i class="fas fa-flag" style="color:#006C35"></i> السعودية</div>
          <div class="trust-item"><i class="fas fa-flag" style="color:#CE1126"></i> الكويت</div>
          <div class="trust-item"><i class="fas fa-flag" style="color:#00732F"></i> الإمارات</div>
          <div class="trust-item"><i class="fas fa-flag" style="color:#8D1B3D"></i> قطر</div>
          <div class="trust-item"><i class="fas fa-flag" style="color:#CE1126"></i> البحرين</div>
          <div class="trust-item"><i class="fas fa-flag" style="color:#00732F"></i> عمان</div>
        </div>
      </section>

      <section style="padding:60px 0;text-align:center">
        <div class="container">
          <span class="badge badge-matched" style="font-size:.85rem;padding:6px 18px">المستويات التعليمية</span>
          <h2 style="font-size:2rem;font-weight:800;margin-top:16px">اختر <span class="gradient-text">مستواك</span> التعليمي</h2>
          <p style="color:var(--text-muted);margin-top:8px">جميع المراحل الدراسية ودورات اللغات تحت سقف واحد</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;margin-top:40px;text-align:right">
            ${HOME_LEVELS.map(l => `
              <div class="level-card page-btn" data-page="${l.link}" style="background:var(--glass-bg);backdrop-filter:blur(12px);border:var(--border-glass);border-radius:var(--radius-lg);padding:28px;transition:var(--transition-smooth);cursor:pointer;position:relative;overflow:hidden${l.wide ? ';grid-column:span 2' : ''}">
                <div style="width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;background:${l.bg};color:${l.color}"><i class="fas ${l.icon}"></i></div>
                <h3 style="font-size:1.2rem;margin-bottom:8px">${l.title}</h3>
                <p style="color:var(--text-muted);font-size:.85rem;line-height:1.6">${l.desc}</p>
                <span style="display:inline-block;margin-top:12px;padding:4px 12px;background:rgba(139,92,246,0.1);border-radius:20px;color:var(--accent-purple);font-size:.75rem;font-weight:600">${l.tag}</span>
                <span style="display:inline-block;margin-top:12px;margin-right:6px;padding:4px 12px;background:rgba(59,130,246,0.1);border-radius:20px;color:var(--primary-blue);font-size:.75rem;font-weight:600">${l.price}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section style="padding:60px 0;background:radial-gradient(ellipse at 50% 50%,rgba(16,185,129,0.05) 0%,transparent 60%)">
        <div class="container">
          <h2 style="text-align:center;font-size:2rem;font-weight:800;margin-bottom:8px">مدرس؟ <span class="gradient-text">انضم</span> إلينا</h2>
          <p style="text-align:center;color:var(--text-muted);margin-bottom:40px">قدم خدماتك التعليمية لآلاف الطلاب في العالم العربي</p>
          <div class="teacher-benefits">
            <div class="benefit-card"><i class="fas fa-percent" style="font-size:2rem;color:#10B981"></i><h4>85% من السعر</h4><p style="color:var(--text-muted);font-size:.85rem">تحصل على 85% من القيمة — 15% فقط رسوم منصة</p></div>
            <div class="benefit-card"><i class="fas fa-calendar-check" style="font-size:2rem;color:var(--primary-blue)"></i><h4>جدول مرن</h4><p style="color:var(--text-muted);font-size:.85rem">حدد أوقاتك بنفسك، وادرس متى يناسبك</p></div>
            <div class="benefit-card"><i class="fas fa-users" style="font-size:2rem;color:var(--accent-purple)"></i><h4>طلاب جاهزون</h4><p style="color:var(--text-muted);font-size:.85rem">تواصل مع طلاب يبحثون عن مدرس في تخصصك</p></div>
          </div>
          <div style="text-align:center;margin-top:32px">
            <button class="btn btn-secondary page-btn" data-page="register"><i class="fas fa-user-graduate"></i> انضم كـ مدرس الآن</button>
          </div>
        </div>
      </section>

      <section style="padding:60px 0">
        <div class="container" style="max-width:600px">
          <h2 style="text-align:center;font-size:2rem;font-weight:800;margin-bottom:8px">تواصل <span class="gradient-text">معنا</span></h2>
          <p style="text-align:center;color:var(--text-muted);margin-bottom:32px">لديك استفسار أو اقتراح؟ نحن هنا لمساعدتك</p>
          <form class="glass-card" style="padding:32px" id="contactForm">
            <div class="form-row">
              <div class="form-group"><input type="text" placeholder="الاسم" id="contactName" required style="background:var(--bg-dark-card)"></div>
              <div class="form-group"><input type="email" placeholder="البريد الإلكتروني" id="contactEmail" required style="background:var(--bg-dark-card)"></div>
            </div>
            <div class="form-group"><textarea placeholder="رسالتك..." id="contactMessage" rows="4" required style="background:var(--bg-dark-card)"></textarea></div>
            <button type="submit" class="btn btn-primary" style="width:100%"><i class="fas fa-paper-plane"></i> إرسال</button>
          </form>
        </div>
      </section>

      <section style="padding:60px 0 80px;text-align:center;background:radial-gradient(ellipse at 50% 50%,rgba(139,92,246,0.08) 0%,transparent 60%)">
        <div class="container">
          <h2 style="font-size:2.2rem;font-weight:800;margin-bottom:12px">جاهز <span class="gradient-text">لبدء</span> رحلة التعلم؟</h2>
          <p style="color:var(--text-muted);margin-bottom:28px;font-size:1.05rem">انضم إلى آلاف الطلاب والمدرسين في منصة تفاعلي — أول جلسة مجانية!</p>
          <button class="btn btn-primary page-btn" data-page="register" style="font-size:1.1rem;padding:14px 36px"><i class="fas fa-rocket"></i> ابدأ الآن مجاناً</button>
          <button class="btn btn-secondary page-btn" data-page="quran-request" style="margin-right:14px"><i class="fas fa-mosque"></i> تحفيظ قرآن</button>
        </div>
      </section>

    </div>
  `
}

export function initHome() {
  initTypewriter()
  const f = document.getElementById('contactForm')
  if (f) {
    f.addEventListener('submit', e => {
      e.preventDefault()
      toast('شكراً لتواصلك! سنرد عليك قريباً', 'success')
      f.reset()
    })
  }
}

function initTypewriter() {
  const el = document.getElementById('typewriter-text')
  if (!el) return
  let i = 0, idx = 0, del = false
  function tick() {
    const w = TYPING_WORDS[i]
    if (del) {
      idx--
      el.textContent = w.substring(0, idx)
      if (idx === 0) { del = false; i = (i + 1) % TYPING_WORDS.length }
    } else {
      idx++
      el.textContent = w.substring(0, idx)
      if (idx === w.length) { setTimeout(() => { del = true; tick() }, 2000); return }
    }
    setTimeout(tick, del ? 40 : 80)
  }
  tick()
}
