import { toast } from '../components/Toast.js'
import { COUNTRY_DATA, LEVEL_MAP } from '../constants.js'
import { api } from '../api.js'
import { esc } from '../utils.js'
import { EagleSeal } from '../components/EagleSeal.js'

const HOME_LEVELS = [
  { icon: 'fa-mosque', color: 'var(--red)', bg: 'rgba(180,40,30,0.08)', title: 'القرآن الكريم', desc: 'حفظ وتجويد قرآن مع مدرسين متخصصين معتمدين', tag: 'حفظ + تجويد', priceKey: 'quran', link: 'quran-request', large: true },
  { icon: 'fa-university', color: 'var(--gold)', bg: 'rgba(201,168,76,0.08)', title: 'الجامعة', desc: 'مقررات جامعية في جميع التخصصات، أبحاث، مشاريع تخرج', tag: 'تخصصات متنوعة', priceKey: 'university', link: 'register' },
  { icon: 'fa-school', color: 'var(--red)', bg: 'rgba(180,40,30,0.06)', title: 'الثانوية', desc: 'مواد الثانوية العامة، تحضير للقدرات والتحصيلي', tag: 'قدرات + تحصيلي', priceKey: 'high_school', link: 'register' },
  { icon: 'fa-book-open', color: 'var(--gold)', bg: 'rgba(201,168,76,0.06)', title: 'المتوسطة', desc: 'جميع مواد المرحلة المتوسطة، متابعة يومية وواجبات مكثفة', tag: 'متابعة مستمرة', priceKey: 'middle_school', link: 'register' },
  { icon: 'fa-child', color: 'var(--red)', bg: 'rgba(180,40,30,0.06)', title: 'الابتدائية', desc: 'تأسيس قوي في القراءة والكتابة والحساب', tag: 'تأسيس + متابعة', priceKey: 'primary', link: 'register' },
  { icon: 'fa-cubes', color: 'var(--gold)', bg: 'rgba(201,168,76,0.06)', title: 'رياض الأطفال', desc: 'برنامج تعليمي مبكر للأطفال، تعلّم باللعب والأنشطة التفاعلية', tag: 'لعب + تعلّم', priceKey: 'kindergarten', link: 'register' },
  { icon: 'fa-language', color: 'var(--red)', bg: 'rgba(180,40,30,0.08)', title: 'اللغات', desc: 'دورات لغة في 8 لغات مع مدرسين ناطقين أصليين', tag: '8 لغات · CEFR', priceKey: 'languages', link: 'register', wide: true },
]

const TYPING_WORDS = ['التحصيل الدراسي', 'حفظ القرآن الكريم', 'اللغات الأجنبية', 'المشاريع الجامعية', 'تأسيس الأطفال']

const MARQUEE_ITEMS = [
  'أول جلسة مجانية',
  'دفع آمن عبر PayPal',
  '85% للمدرس من كل جلسة',
  'مدرّسون معتمدون',
  'تحليل بالذكاء الاصطناعي',
  'صرف شهري إنستاباي / فودافون كاش',
  '8 لغات بمعايير CEFR',
]

const STATS_DATA = [
  { count: 7000, suffix: '+', label: 'طالب نشط' },
  { count: 450, suffix: '+', label: 'مدرّس معتمد' },
  { count: 7, suffix: '', label: 'دولة مدعومة' },
  { count: 8, suffix: '', label: 'لغة تدريس' },
]

const FAQ_DATA = [
  { q: 'كيف تعمل منصة تفاعلي؟', a: 'ارفع ملفاً أو مذكرة لا تفهمها (PDF)، يحلله الذكاء الاصطناعي ويقيّم صعوبته ويقترح سعراً ويرشّح لك مدرساً متخصصاً. المدرس يؤكد السعر أو يعدّله، وأول جلسة مع أي مدرس مجانية.' },
  { q: 'ما هي المستويات التعليمية المدعومة؟', a: 'تدعم تفاعلي 7 مستويات: القرآن الكريم، الجامعة، الثانوية، المتوسطة، الابتدائية، رياض الأطفال، واللغات (8 لغات بمعايير CEFR).' },
  { q: 'ما هي الدول المدعومة؟', a: 'نعمل في السعودية، الكويت، الإمارات، قطر، البحرين، عُمان، ومصر. كل دولة لها أسعارها الخاصة بالعملة المحلية.' },
  { q: 'كيف يحصل المدرسون على أرباحهم؟', a: 'يحصل كل مدرس على 85% من قيمة الجلسة، وتحتفظ المنصة بـ 15% فقط كرسوم خدمة. تُجمّع أرباح المدرس وتُحوَّل له شهرياً عبر إنستاباي أو فودافون كاش.' },
  { q: 'كيف يدفع الطالب؟', a: 'يدفع الطالب المنصة مباشرة عبر PayPal عند تأكيد المدرس للسعر. لا يوجد أي دفع مباشر من الطالب إلى المدرس.' },
  { q: 'هل أول جلسة مجانية فعلاً؟', a: 'نعم، أول جلسة مع أي مدرس مجانية تماماً. بعدها تبدأ الأسعار من 12 ريال سعودي فقط للجلسات اللاحقة.' },
]

const COMPARISON = [
  { feature: 'تقييم الصعوبة', ai: 'تحليل دقيق بالذكاء الاصطناعي', trad: 'تقييم يدوي تقليدي' },
  { feature: 'اختيار المدرس', ai: 'ترشيح ذكي لمدرس متخصص', trad: 'اختيار عشوائي' },
  { feature: 'تحديد السعر', ai: 'اقتراح سعر يقرره المدرس', trad: 'أسعار غير شفافة' },
  { feature: 'أول جلسة', ai: 'جلسة مجانية مع كل مدرس', trad: 'مصاريف إضافية' },
  { feature: 'المرونة', ai: 'جلسات حسب جدولك', trad: 'أوقات محددة' },
]

export function renderHome() {
  return `
    <div class="page active" id="page-home">

      <!-- ===== HERO: Asymmetric Layout ===== -->
      <section id="hero-section" style="padding:120px 0 80px;position:relative;overflow:hidden">
        <div class="container" style="display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:center">
          <div class="stagger-child">
            <div class="ai-badge" style="margin-bottom:20px"><i class="fas fa-robot"></i> مدعوم بالذكاء الاصطناعي</div>
            <h1 style="font-family:var(--font-heading);font-size:3rem;font-weight:700;margin-bottom:16px;line-height:1.25;color:var(--text-white)">
              منصة <span class="gradient-text">تفاعلي</span>
            </h1>
            <p style="color:var(--text-muted);font-size:1.1rem;margin-bottom:8px;line-height:1.7">
              الحل الأمثل لـ <span id="typewriter-text" style="color:var(--gold);font-weight:700"></span><span class="typewriter-cursor">|</span>
            </p>
            <p style="color:var(--text-gray-muted);font-size:.92rem;margin-bottom:32px;max-width:480px;line-height:1.8">
              ارفع ملفاً لا تفهمه، يحلله الذكاء الاصطناعي ويقترح السعر ويرشّح مدرساً — المدرس يؤكد السعر النهائي، وأول جلسة مجانية
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-primary btn-shine page-btn" data-page="upload-request"><i class="fas fa-cloud-upload-alt"></i> ارفع ملفك دلوقتي</button>
              <button class="btn btn-secondary page-btn" data-page="register"><i class="fas fa-user-graduate"></i> سجّل كمدرس</button>
            </div>
          </div>
          <div class="hero-seal-wrap">
            <div class="hero-glow"></div>
            <div class="hero-seal">
              <img src="/logo.jpg" alt="تفاعلي" style="width:240px;height:240px;border-radius:24px;object-fit:cover;box-shadow: 0 20px 50px rgba(0,0,0,0.5);border: 2px solid rgba(255,255,255,0.08);">
            </div>
          </div>
        </div>
      </section>

      <!-- ===== MARQUEE ===== -->
      <section class="marquee" aria-hidden="true">
        <div class="marquee-track">
          ${[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(item => `
            <div class="marquee-item"><span class="marquee-dot">✦</span> ${item}</div>
          `).join('')}
        </div>
      </section>

      <!-- ===== HOW IT WORKS ===== -->
      <section style="padding:60px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container">
          <div class="reveal" style="margin-bottom:32px">
            <span style="font-family:var(--font-heading);color:var(--gold);font-size:.9rem;display:block;margin-bottom:8px">ازاي بيشتغل</span>
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;margin-bottom:8px"><span class="text-reveal-inner">3 خطوات <span class="gradient-text">تبدأ بيها</span></span></h2>
            <p style="color:var(--text-gray-muted);font-size:.9rem">وفي الصفحات التفصيلية هتلاقي كل تفاصيل الخطوات للطلاب والمدرسين</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;align-items:stretch">
            <div class="reveal" style="padding:32px;border-left:1px solid rgba(255,255,255,0.04)">
              <div style="font-family:var(--font-latin);font-size:2.5rem;font-weight:800;color:var(--red);opacity:0.2;margin-bottom:12px">01</div>
              <div class="sim-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(180,40,30,0.08);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--red);margin-bottom:14px"><i class="fas fa-cloud-upload-alt"></i></div>
              <h4 style="font-family:var(--font-heading);font-size:1.1rem;margin-bottom:8px">ارفع الملف</h4>
              <p style="color:var(--text-gray-muted);font-size:.85rem;line-height:1.7">ارفع ملفاً أو مذكرة PDF واحدة تواجه صعوبة فيها</p>
            </div>
            <div class="reveal" style="padding:32px;border-left:1px solid rgba(255,255,255,0.04);transition-delay:0.12s">
              <div style="font-family:var(--font-latin);font-size:2.5rem;font-weight:800;color:var(--red);opacity:0.2;margin-bottom:12px">02</div>
              <div class="sim-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(180,40,30,0.08);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--red);margin-bottom:14px"><i class="fas fa-microchip"></i></div>
              <h4 style="font-family:var(--font-heading);font-size:1.1rem;margin-bottom:8px">تحليل ذكي</h4>
              <p style="color:var(--text-gray-muted);font-size:.85rem;line-height:1.7">يقيس الذكاء الاصطناعي صعوبة الملف ويقترح سعراً ويرشّح مدرساً</p>
            </div>
            <div class="reveal" style="padding:32px;transition-delay:0.24s">
              <div style="font-family:var(--font-latin);font-size:2.5rem;font-weight:800;color:var(--red);opacity:0.2;margin-bottom:12px">03</div>
              <div class="sim-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(180,40,30,0.08);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--red);margin-bottom:14px"><i class="fas fa-handshake"></i></div>
              <h4 style="font-family:var(--font-heading);font-size:1.1rem;margin-bottom:8px">المدرس يقرر</h4>
              <p style="color:var(--text-gray-muted);font-size:.85rem;line-height:1.7">يؤكد المدرس السعر المقترح أو يعدّله، وأول جلسة مجانية</p>
            </div>
          </div>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:40px">
            <button class="btn btn-secondary page-btn" data-page="how-it-works?role=student"><i class="fas fa-user-graduate"></i> ازاي بيشتغل للطلاب</button>
            <button class="btn btn-secondary page-btn" data-page="how-it-works?role=tutor"><i class="fas fa-chalkboard-teacher"></i> ازاي بيشتغل للمدرسين</button>
          </div>
        </div>
      </section>

      <!-- ===== COMPARISON ===== -->
      <section style="padding:60px 0">
        <div class="container" style="max-width:800px">
          <div class="reveal" style="margin-bottom:32px">
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;margin-bottom:8px"><span class="text-reveal-inner">لماذا <span class="gradient-text">تفاعلي</span>؟</span></h2>
            <p style="color:var(--text-gray-muted);font-size:.9rem">لماذا منصتنا هي الخيار الأفضل لمستقبل تعليمك</p>
          </div>
          <div class="reveal comparison-wrapper">
            <table class="comparison-table">
              <tr><th></th><th><i class="fas fa-check-circle" style="margin-left:6px"></i> تفاعلي</th><th>التقليدي</th></tr>
              ${COMPARISON.map(r => `<tr><td class="comp-feat">${r.feature}</td><td class="comp-ai"><i class="fas fa-check-circle"></i> ${r.ai}</td><td class="comp-trad"><i class="fas fa-times-circle"></i> ${r.trad}</td></tr>`).join('')}
            </table>
          </div>
        </div>
      </section>

      <!-- ===== STATS / COUNTERS ===== -->
      <section style="padding:60px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container">
          <div class="stats-grid">
            ${STATS_DATA.map((s, i) => `
              <div class="stat-card reveal" style="transition-delay:${i * 0.1}s">
                <div class="stat-num" data-count="${s.count}" data-suffix="${s.suffix}">0</div>
                <div class="stat-label">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ===== COUNTRIES ===== -->
      <section style="padding:40px 0;border-top:1px solid rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.03)">
        <div class="container">
          <div class="reveal" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center">
            <span style="font-family:var(--font-heading);font-size:1rem;color:var(--gold);white-space:nowrap">نخدم</span>
            <div class="trust-bar">
              ${[
                { flag: '🇸🇦', name: 'السعودية' }, { flag: '🇰🇼', name: 'الكويت' }, { flag: '🇦🇪', name: 'الإمارات' },
                { flag: '🇶🇦', name: 'قطر' }, { flag: '🇧🇭', name: 'البحرين' }, { flag: '🇴🇲', name: 'عمان' }, { flag: '🇪🇬', name: 'مصر' }
              ].map(c => `<div class="trust-item"><span>${c.flag}</span> ${c.name}</div>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- ===== LEVELS: Asymmetric Grid ===== -->
      <section style="padding:70px 0">
        <div class="container">
          <div class="reveal" style="margin-bottom:40px">
            <span style="font-family:var(--font-heading);color:var(--gold);font-size:.9rem;display:block;margin-bottom:8px">المستويات التعليمية</span>
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;margin-bottom:8px"><span class="text-reveal-inner">اختر <span class="gradient-text">مستواك</span></span></h2>
            <p style="color:var(--text-gray-muted);font-size:.9rem">جميع المراحل الدراسية ودورات اللغات تحت سقف واحد</p>
            <div style="margin-top:16px">
              <select id="homeCountrySelect" style="background:var(--bg-dark-card);border:var(--border-glass);color:var(--text-white);padding:8px 16px;border-radius:var(--radius-sm);font-family:var(--font-ar);font-size:.85rem;cursor:pointer">
                ${COUNTRY_DATA.map(c => `<option value="${c.code}">${c.label} (${c.symbol})</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            ${HOME_LEVELS.map((l, i) => {
              const isLarge = l.large
              const isWide = l.wide
              const style = isLarge
                ? 'grid-column:span 2;padding:36px'
                : isWide
                  ? 'grid-column:span 2'
                  : ''
              return `
              <div class="level-card reveal page-btn" data-page="${l.link}" style="background:var(--bg-dark-card);border:var(--border-glass);border-radius:var(--radius-lg);padding:24px;cursor:pointer;position:relative;overflow:hidden;transition-delay:${(i % 2) * 0.1}s;${style}">
                <div style="display:flex;align-items:flex-start;gap:16px${isLarge ? ';align-items:center' : ''}">
                  <div class="level-icon" style="width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;background:${l.bg};color:${l.color}"><i class="fas ${l.icon}"></i></div>
                  <div style="flex:1">
                    <h3 style="font-family:var(--font-heading);font-size:${isLarge ? '1.2rem' : '1rem'};margin-bottom:6px">${l.title}</h3>
                    <p style="color:var(--text-gray-muted);font-size:.82rem;line-height:1.6">${l.desc}</p>
                    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
                      <span style="padding:3px 10px;background:rgba(180,40,30,0.06);border-radius:12px;color:var(--red);font-size:.7rem;font-weight:700">${l.tag}</span>
                      <span class="home-price" data-key="${l.priceKey}" style="padding:3px 10px;background:rgba(201,168,76,0.06);border-radius:12px;color:var(--gold);font-size:.7rem;font-weight:700">جاري التحميل...</span>
                    </div>
                  </div>
                </div>
              </div>`
            }).join('')}
          </div>
        </div>
      </section>

      <!-- ===== TEACHER BENEFITS ===== -->
      <section style="padding:70px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container">
          <div class="reveal" style="margin-bottom:40px">
            <span style="font-family:var(--font-heading);color:var(--gold);font-size:.9rem;display:block;margin-bottom:8px">للمدرسين</span>
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem"><span class="text-reveal-inner">مدرس؟ <span class="gradient-text">انضم</span> إلينا</span></h2>
          </div>
          <div class="teacher-benefits">
            <div class="benefit-card reveal"><i class="fas fa-percent" style="font-size:1.8rem;color:var(--gold)"></i><h4>85% من السعر</h4><p style="color:var(--text-gray-muted);font-size:.82rem">تحصل على 85% من القيمة — 15% فقط رسوم منصة</p></div>
            <div class="benefit-card reveal" style="transition-delay:0.12s"><i class="fas fa-wallet" style="font-size:1.8rem;color:var(--red)"></i><h4>صرف شهري مضمون</h4><p style="color:var(--text-gray-muted);font-size:.82rem">تُجمّع أرباحك وتُحوَّل لك كل شهر عبر إنستاباي أو فودافون كاش</p></div>
            <div class="benefit-card reveal" style="transition-delay:0.24s"><i class="fas fa-users" style="font-size:1.8rem;color:var(--gold)"></i><h4>طلاب جاهزون</h4><p style="color:var(--text-gray-muted);font-size:.82rem">الذكاء الاصطناعي يرشّحك للطلاب المناسبين في تخصصك</p></div>
          </div>
          <div class="reveal" style="margin-top:32px;text-align:center">
            <button class="btn btn-secondary btn-shine page-btn" data-page="register"><i class="fas fa-user-graduate"></i> انضم كـ مدرس الآن</button>
          </div>
        </div>
      </section>

      <!-- ===== AVAILABLE TUTORS ===== -->
      <section style="padding:60px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container">
          <div class="reveal" style="margin-bottom:28px">
            <span style="font-family:var(--font-heading);color:var(--gold);font-size:.9rem;display:block;margin-bottom:8px">متاحون الآن</span>
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;margin-bottom:8px"><span class="text-reveal-inner">مدرّسون <span class="gradient-text">متاحون</span></span></h2>
            <p style="color:var(--text-gray-muted);font-size:.9rem">مدرّسون معتمدون جاهزون لبدء جلساتك — أول جلسة مجانية</p>
          </div>
          <div id="homeTutors" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px"></div>
        </div>
      </section>

      <!-- ===== CONTACT ===== -->
      <section style="padding:60px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container" style="max-width:560px">
          <div class="reveal">
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;margin-bottom:8px;text-align:center"><span class="text-reveal-inner">تواصل <span class="gradient-text">معنا</span></span></h2>
            <p style="text-align:center;color:var(--text-gray-muted);margin-bottom:28px;font-size:.9rem">لديك استفسار أو اقتراح؟ نحن هنا لمساعدتك</p>
          </div>
          <form class="glass-card reveal" style="padding:28px" id="contactForm">
            <div class="form-row">
              <div class="form-group"><input type="text" placeholder="الاسم" id="contactName" required style="background:var(--bg-dark-card)"></div>
              <div class="form-group"><input type="email" placeholder="البريد الإلكتروني" id="contactEmail" required style="background:var(--bg-dark-card)"></div>
            </div>
            <div class="form-group"><textarea placeholder="رسالتك..." id="contactMessage" rows="4" required style="background:var(--bg-dark-card)"></textarea></div>
            <button type="submit" class="btn btn-primary" style="width:100%"><i class="fas fa-paper-plane"></i> إرسال</button>
          </form>
        </div>
      </section>

      <!-- ===== FAQ ===== -->
      <section style="padding:60px 0;border-top:1px solid rgba(255,255,255,0.03)">
        <div class="container" style="max-width:700px">
          <div class="reveal" style="margin-bottom:32px">
            <span style="font-family:var(--font-heading);color:var(--gold);font-size:.9rem;display:block;margin-bottom:8px;text-align:center">الأسئلة الشائعة</span>
            <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:1.8rem;text-align:center"><span class="text-reveal-inner">الأسئلة <span class="gradient-text">الشائعة</span></span></h2>
          </div>
          <div class="faq-list reveal">
            ${FAQ_DATA.map((item, i) => `
              <details class="faq-item" style="background:var(--bg-dark-card);border:var(--border-glass);border-radius:var(--radius-md);margin-bottom:10px;overflow:hidden${i === 0 ? ';open' : ''}">
                <summary style="padding:16px 20px;cursor:pointer;font-weight:700;font-size:.92rem;display:flex;align-items:center;justify-content:space-between;list-style:none">
                  <span>${item.q}</span>
                  <i class="fas fa-chevron-down" style="color:var(--red);transition:transform .3s;font-size:.8rem"></i>
                </summary>
                <div style="padding:0 20px 16px;color:var(--text-gray-muted);font-size:.88rem;line-height:1.8">
                  ${item.a}
                </div>
              </details>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="cta-section reveal" style="padding:70px 0;background:var(--red-dark);position:relative;overflow:hidden">
        <div class="cta-eagle">
          <img src="/logo.jpg" alt="تفاعلي" style="width:140px;height:140px;border-radius:24px;object-fit:cover;opacity:0.18;">
        </div>
        <div style="position:absolute;inset:0;opacity:0.04;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L36 12L48 6L42 18L54 18L42 24L54 30L42 36L54 42L42 42L48 54L36 48L30 60L24 48L12 54L18 42L6 42L18 36L6 30L18 24L6 18L18 18L12 6L24 12Z' fill='none' stroke='%23C9A84C' stroke-width='0.4'/%3E%3C/svg%3E\");background-size:60px 60px"></div>
        <div class="container" style="text-align:center;position:relative">
          <h2 class="text-reveal" style="font-family:var(--font-heading);font-size:2rem;color:#fff;margin-bottom:12px"><span class="text-reveal-inner">جاهز <span style="color:var(--gold)">لبدء</span> رحلة التعلم؟</span></h2>
          <p style="color:rgba(255,255,255,0.7);margin-bottom:28px;font-size:.95rem">انضم إلى آلاف الطلاب والمدرسين في منصة تفاعلي — أول جلسة مجانية!</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-shine page-btn" data-page="register" style="background:var(--gold);color:var(--bg-dark-base);font-size:1rem;padding:14px 32px;box-shadow:0 10px 30px -10px rgba(201,168,76,0.4)"><i class="fas fa-rocket"></i> ابدأ الآن مجاناً</button>
            <button class="btn page-btn" data-page="quran-request" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:.92rem"><i class="fas fa-mosque"></i> تحفيظ قرآن</button>
          </div>
        </div>
      </section>

    </div>
  `
}

export function initHome() {
  initTypewriter()
  initPricing()
  initHomeTutors()
  const f = document.getElementById('contactForm')
  if (f) {
    f.addEventListener('submit', async e => {
      e.preventDefault()
      const btn = f.querySelector('button[type="submit"]')
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'
      try {
        const fd = new FormData(f)
        await api('POST', '/contact/', {
          first_name: fd.get('contactName') || '',
          last_name: '',
          email: fd.get('contactEmail') || '',
          question: fd.get('contactMessage') || '',
        }, { auth: false })
        toast('تم الإرسال بنجاح! سنتواصل معك قريباً', 'success')
        f.reset()
      } catch (err) {
        toast('حدث خطأ: ' + err.message, 'error')
      } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال'
      }
    })
  }
}

async function initPricing() {
  const sel = document.getElementById('homeCountrySelect')
  if (!sel) return

  async function loadPrices() {
    const country = sel.value
    try {
      const pricing = await api('GET', '/pricing/', null, { auth: false })
      const cp = pricing[country]
      if (!cp) return
      document.querySelectorAll('.home-price').forEach(el => {
        const key = el.dataset.key
        const p = cp[key]
        if (p) {
          const sym = COUNTRY_DATA.find(c => c.code === country)?.symbol || ''
          el.textContent = `${p.solo} ${sym} / الجلسة`
        }
      })
    } catch {}
  }

  await loadPrices()
  sel.addEventListener('change', loadPrices)
}

function initHomeTutors() {
  const wrap = document.getElementById('homeTutors')
  if (!wrap) return
  api('GET', '/tutors/')
    .then(r => {
      const list = Array.isArray(r) ? r.slice(0, 4) : []
      if (!list.length) {
        wrap.innerHTML = '<p class="empty">لا يوجد مدرّسون متاحون الآن — عد لاحقاً</p>'
        return
      }
      wrap.innerHTML = list.map(t => `
        <div class="level-card page-btn" data-page="tutor-profile?id=${t.id}" style="background:var(--bg-dark-card);border:var(--border-glass);border-radius:var(--radius-lg);padding:20px;cursor:pointer;position:relative;overflow:hidden">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <img src="${esc(t.profile_picture_url || '')}" onerror="this.style.display='none'" alt="" style="width:52px;height:52px;border-radius:50%;object-fit:cover">
            <div>
              <div style="font-weight:700;font-size:.95rem">أ. ${esc(t.first_name || '')} ${esc(t.last_name || '')}</div>
              <div style="color:var(--text-muted);font-size:.78rem">${esc(LEVEL_MAP[t.teaching_level] || t.teaching_level || '')}</div>
            </div>
          </div>
          <div style="color:var(--text-gray-muted);font-size:.82rem;line-height:1.7">${esc(t.specialization || '')}${t.years_experience ? ' · ' + esc(String(t.years_experience)) + ' سنة' : ''}</div>
          <div style="margin-top:12px;color:var(--gold);font-size:.78rem"><i class="fas fa-circle" style="font-size:.4rem;vertical-align:middle;margin-left:4px"></i> متاح الآن — أول جلسة مجانية</div>
        </div>
      `).join('')
    })
    .catch(() => { wrap.innerHTML = '<p class="empty">تعذر تحميل المدرسين</p>' })
}

const _typewriterTimers = []

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
      if (idx === w.length) {
        const t = setTimeout(() => { del = true; tick() }, 2000)
        _typewriterTimers.push(t)
        return
      }
    }
    const t = setTimeout(tick, del ? 40 : 80)
    _typewriterTimers.push(t)
  }
  tick()
}

export function cleanupHome() {
  _typewriterTimers.forEach(t => clearTimeout(t))
}
