/* ==========================================
   Tafa3oly Platform - Complete App Logic
   ========================================== */

// ==================== CONSTANTS ====================
const API_BASE = 'https://mahmoudkaram326.pythonanywhere.com/api';
const LEVELS_DATA = [
  {code:'quran',label:'القرآن الكريم',icon:'fa-mosque'},
  {code:'university',label:'الجامعة',icon:'fa-university'},
  {code:'high_school',label:'الثانوية',icon:'fa-school'},
  {code:'middle_school',label:'المتوسطة',icon:'fa-book-open'},
  {code:'primary',label:'الابتدائية',icon:'fa-child'},
  {code:'kindergarten',label:'رياض الأطفال',icon:'fa-cubes'},
  {code:'languages',label:'اللغات',icon:'fa-language'}
];
const LEVEL_ICONS = {}; LEVELS_DATA.forEach(l => LEVEL_ICONS[l.code] = l.icon);
const LEVEL_MAP = {quran:'القرآن الكريم',university:'الجامعة',high_school:'الثانوية',middle_school:'المتوسطة',primary:'الابتدائية',kindergarten:'رياض الأطفال',languages:'اللغات'};
const LANG_DATA = [{code:'en',label:'الإنجليزية'},{code:'fr',label:'الفرنسية'},{code:'de',label:'الألمانية'},{code:'es',label:'الإسبانية'},{code:'it',label:'الإيطالية'},{code:'tr',label:'التركية'},{code:'zh',label:'الصينية'},{code:'ru',label:'الروسية'}];
const LANG_MAP = {en:'الإنجليزية',fr:'الفرنسية',de:'الألمانية',es:'الإسبانية',it:'الإيطالية',tr:'التركية',zh:'الصينية',ru:'الروسية'};
const DAYS = [{key:'sat',label:'السبت'},{key:'sun',label:'الأحد'},{key:'mon',label:'الإثنين'},{key:'tue',label:'الثلاثاء'},{key:'wed',label:'الأربعاء'},{key:'thu',label:'الخميس'},{key:'fri',label:'الجمعة'}];

// ==================== AUTH ====================
function getToken(){return localStorage.getItem('access_token')}
function getUser(){try{return JSON.parse(localStorage.getItem('user')||'{}')}catch{return{}}}
function setUserData(u){localStorage.setItem('user',JSON.stringify(u))}
function isLoggedIn(){return!!getToken()}
function getRole(){return getUser().role||''}
function isStudent(){return getRole()==='student'}
function isTutor(){return getRole()==='tutor'}
async function api(m,u,b){
  const opts={method:m,headers:{'Authorization':'Bearer '+getToken()}};
  if(b){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(b)}
  const r=await fetch(API_BASE+u,opts);
  const d=await r.json();
  if(!r.ok){const e=new Error(d.error||'خطأ');e.data=d;throw e}
  return d
}
function logout(){
  localStorage.removeItem('access_token');localStorage.removeItem('user');
  if(currentPage!=='home') navigate('home');
  else{buildNavbar();buildHomeLevels()}
}

// ==================== ROUTING ====================
// ==================== ROUTING ====================
let currentPage = '';
function navigate(page){
  if(page==='home') {
    currentPage='home';
    document.querySelectorAll('.page-section').forEach(el=>el.style.display='none');
    document.querySelectorAll('.hidden-page').forEach(el=>el.style.display='none');
    const pg=document.getElementById('page-home');
    if(pg){pg.style.display='';initPage('home');window.scrollTo(0,0)}
    buildNavbar();
    return;
  }

  const pageMap = {
    'login': 'pages/login.html',
    'register': 'pages/register.html',
    'student-dashboard': 'pages/student_dashboard.html',
    'tutor-dashboard': 'pages/tutor_dashboard.html',
    'edit-profile': 'pages/edit_profile.html',
    'quran-request': 'pages/quran_request.html'
  };

  if (pageMap[page]) {
    window.location.href = pageMap[page];
    return;
  }

  // Handle section scrolling on home page
  const homeEl=document.getElementById('page-home');
  if(homeEl)homeEl.style.display='';
  initHome();
  requestAnimationFrame(()=>{
    const target=document.getElementById(page);
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function initPage(page){
  if(page==='home') initHome();
}

// ==================== NAVBAR ====================
function buildNavbar(){
  const u=getUser(),li=isLoggedIn();
  const links=`
    <li><a class="nav-link" onclick="navigate('home')">الرئيسية</a></li>
    ${li?(isStudent()?`<li><a class="nav-link" onclick="navigate('student-dashboard')">لوحة التحكم</a></li>`
    :`<li><a class="nav-link" onclick="navigate('tutor-dashboard')">لوحة التحكم</a></li>`):''}
    ${li?'':`<li><a class="nav-link" onclick="navigate('register')">انضم الآن</a></li>`}
  `;
  const actions=li
    ?`<span style="font-size:.85rem;color:var(--text-gray-muted)">${u.first_name||u.username||''}</span><button class="btn btn-sm btn-ghost" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>`
    :`<button class="btn btn-sm btn-primary" onclick="navigate('login')">دخول</button><button class="btn btn-sm btn-secondary" onclick="navigate('register')">تسجيل</button>`;
  const nav=document.getElementById('mainNavbar');
  if(nav)nav.innerHTML=`
    <div class="container nav-wrapper">
      <div class="logo" onclick="navigate('home')" style="cursor:pointer">
        <div class="logo-cap"><i class="fa-solid fa-graduation-cap"></i></div>
        <div class="logo-text"><span class="gradient-text-accent">تفاعلي</span></div>
      </div>
      <ul class="nav-menu" id="navMenu">${links}</ul>
      <div class="nav-actions">${actions}</div>
      <button class="menu-toggle" id="menuToggle" onclick="document.getElementById('navMenu').classList.toggle('open')">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>`;
}

// ==================== HOME ====================
const HOME_LEVELS=[
  {icon:'fa-mosque',color:'#10B981',bg:'rgba(16,185,129,0.1)',title:'القرآن الكريم',desc:'حفظ وتجويد قرآن مع مدرسين متخصصين معتمدين',tag:'حفظ + تجويد',price:'30 ر.س',link:'quran-request'},
  {icon:'fa-university',color:'#3B82F6',bg:'rgba(59,130,246,0.1)',title:'الجامعة',desc:'مقررات جامعية في جميع التخصصات، أبحاث، مشاريع تخرج',tag:'تخصصات متنوعة',price:'25 ر.س',link:'register'},
  {icon:'fa-school',color:'#EC4899',bg:'rgba(236,72,153,0.1)',title:'الثانوية',desc:'مواد الثانوية العامة، تحضير للقدرات والتحصيلي',tag:'قدرات + تحصيلي',price:'20 ر.س',link:'register'},
  {icon:'fa-book-open',color:'#F59E0B',bg:'rgba(245,158,11,0.1)',title:'المتوسطة',desc:'جميع مواد المرحلة المتوسطة، متابعة يومية وواجبات مكثفة',tag:'متابعة مستمرة',price:'15 ر.س',link:'register'},
  {icon:'fa-child',color:'#10B981',bg:'rgba(16,185,129,0.1)',title:'الابتدائية',desc:'تأسيس قوي في القراءة والكتابة والحساب',tag:'تأسيس + متابعة',price:'20 ر.س',link:'register'},
  {icon:'fa-cubes',color:'#A855F7',bg:'rgba(168,85,247,0.1)',title:'رياض الأطفال',desc:'برنامج تعليمي مبكر للأطفال، تعلّم باللعب والأنشطة التفاعلية',tag:'لعب + تعلّم',price:'12 ر.س',link:'register'},
  {icon:'fa-language',color:'#EC4899',bg:'rgba(236,72,153,0.1)',title:'اللغات',desc:'دورات لغة في 8 لغات مع مدرسين ناطقين أصليين',tag:'8 لغات · CEFR',price:'25 ر.س',link:'register',wide:true}
];
function initHome(){
  const grid=document.getElementById('homeLevelsGrid');
  if(grid&&!grid.querySelector('.level-card')) buildHomeLevels();
  buildFeatures();
}
function buildHomeLevels(){
  const el=document.getElementById('homeLevelsGrid');
  if(!el) return;
  el.innerHTML=HOME_LEVELS.map(l=>`
    <div class="level-card" onclick="navigate('${l.link}')" style="background:var(--glass-bg);backdrop-filter:blur(12px);border:var(--border-glass);border-radius:var(--radius-lg);padding:28px;cursor:pointer;position:relative;overflow:hidden;transition:var(--transition);${l.wide?'grid-column:span 2':''}">
      <div style="width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;background:${l.bg};color:${l.color}"><i class="fas ${l.icon}"></i></div>
      <h3 style="font-size:1.2rem;margin-bottom:8px">${l.title}</h3>
      <p style="color:var(--text-muted);font-size:.85rem;line-height:1.6">${l.desc}</p>
      <span class="level-tag" style="display:inline-block;margin-top:12px;padding:4px 12px;background:rgba(139,92,246,0.1);border-radius:20px;color:var(--accent-purple);font-size:.75rem;font-weight:600">${l.tag}</span>
      <span class="level-tag price" style="display:inline-block;margin-top:12px;margin-right:6px;padding:4px 12px;background:rgba(59,130,246,0.1);border-radius:20px;color:var(--primary-blue);font-size:.75rem;font-weight:600">${l.price}</span>
    </div>
  `).join('');
}
function buildFeatures(){
  const el=document.getElementById('homeFeaturesGrid');
  if(!el||el.querySelector('.feature-card')) return;
  el.innerHTML=[
    {i:'fa-robot',c:'var(--accent-purple)',t:'تحليل ذكي بالذكاء الاصطناعي',d:'يقوم الذكاء الاصطناعي بتحليل ملفك الأكاديمي وتحديد مستواك بدقة'},
    {i:'fa-chart-line',c:'var(--primary-blue)',t:'متابعة التقدم',d:'سجل تقدمك في الحفظ والوحدات ومستويات CEFR بشكل تفصيلي'},
    {i:'fab fa-paypal',c:'#0070BA',t:'دفع آمن عبر PayPal',d:'15% رسوم منصة فقط — 85% للمدرس. دفعات مضمونة وموثوقة'},
    {i:'fa-hand-holding-usd',c:'#10B981',t:'أسعار شفافة',d:'أسعار تنافسية تبدأ من 12 ر.س للجلسة حسب المستوى والدولة'},
    {i:'fas fa-globe',c:'#3B82F6',t:'دول الخليج',d:'أسعار خاصة لكل دولة: السعودية، الكويت، الإمارات، قطر'},
    {i:'fa-users',c:'#EC4899',t:'مدرسين متخصصين',d:'كل مدرس متخصص في مستوى واحد فقط لضمان أعلى جودة تعليم'}
  ].map(f=>`
    <div class="feature-card glass-card" style="text-align:center;padding:24px;transition:var(--transition)">
      <i class="${f.i}" style="font-size:2rem;margin-bottom:12px;color:${f.c}"></i>
      <h4 style="margin-bottom:8px;font-size:1rem">${f.t}</h4>
      <p style="color:var(--text-muted);font-size:.82rem">${f.d}</p>
    </div>
  `).join('');
}

// ==================== LOGIN ====================
function attachLogin(){
  const f=document.getElementById('loginForm');
  if(!f) return;
  f.addEventListener('submit',async e=>{
    e.preventDefault();const btn=document.getElementById('loginBtn'),err=document.getElementById('loginError');
    if(!btn)return;
    btn.disabled=true;btn.textContent='جاري الدخول...';if(err)err.style.display='none';
    try{
      const r=await fetch(API_BASE+'/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('loginEmail')?.value,password:document.getElementById('loginPassword')?.value})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||'بيانات الدخول غير صحيحة');
      localStorage.setItem('access_token',d.token);localStorage.setItem('user',JSON.stringify(d.user));
      navigate(d.user.role==='tutor'?'tutor-dashboard':'student-dashboard');
    }catch(e){if(err){err.textContent=e.message;err.style.display='block'}}
    finally{btn.disabled=false;btn.textContent='دخول'}
  });
}

// ==================== REGISTER ====================
function initRegister(){
  const c=document.getElementById('regLevels');
  if(!c||c.children.length) return;
  LEVELS_DATA.forEach(l=>{c.innerHTML+=`<label><input type="checkbox" name="levels" value="${l.code}"><i class="fas ${l.icon}"></i> <span>${l.label}</span></label>`});
  LANG_DATA.forEach(l=>{const el=document.getElementById('regLangs');if(el)el.innerHTML+=`<label><input type="checkbox" name="langs" value="${l.code}"><span>${l.label}</span></label>`});
  const roleSel=document.getElementById('regRole');
  if(roleSel) roleSel.addEventListener('change',function(){
    const t=this.value==='tutor';
    const pg=document.getElementById('regPaypalGroup'),tf=document.getElementById('regTutorFields'),lg=document.getElementById('regLangGroup'),h=document.getElementById('regLevelHint');
    if(pg)pg.style.display=t?'block':'none';if(tf)tf.style.display=t?'block':'none';if(lg)lg.style.display=t?'block':'none';
    if(c){c.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.checked=false)}
    if(h)h.textContent=t?'اختر مستوى واحد فقط للتخصص كمدرس':'اختر مستوى أو أكثر كطالب';
  });
}
function attachRegister(){
  const f=document.getElementById('registerForm');
  if(!f) return;
  f.addEventListener('submit',async e=>{
    e.preventDefault();const btn=document.getElementById('regBtn'),err=document.getElementById('regError');
    if(!btn)return;
    btn.disabled=true;btn.textContent='جاري التسجيل...';if(err)err.style.display='none';
    const cl=[...document.querySelectorAll('#regLevels input:checked')].map(c=>c.value);
    if(!cl.length){if(err){err.textContent='اختر مستوى تعليمي واحد على الأقل';err.style.display='block'}btn.disabled=false;btn.textContent='تسجيل';return}
    const role=document.getElementById('regRole')?.value||'student';
    if(role==='tutor'&&cl.length>1){if(err){err.textContent='المدرس يختار مستوى واحد فقط';err.style.display='block'}btn.disabled=false;btn.textContent='تسجيل';return}
    const gid=(id)=>document.getElementById(id)?.value||'';
    const body={username:gid('regUsername'),email:gid('regEmail'),password:gid('regPassword'),first_name:gid('regFirstName'),last_name:gid('regLastName'),role,specialization:gid('regSpecialization')};
    if(role==='tutor'){body.teaching_level=cl[0];body.languages=[...document.querySelectorAll('#regLangs input:checked')].map(c=>c.value);body.paypal_email=gid('regPaypalEmail');body.years_experience=document.getElementById('regExperience')?.value||null;body.education=gid('regEducation');body.certificates=gid('regCertificates');body.bio=gid('regBio')}
    else body.student_levels=cl;
    try{
      const r=await fetch(API_BASE+'/register/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();if(!r.ok)throw new Error(Object.values(d).flat().join(', '));
      localStorage.setItem('access_token',d.token);localStorage.setItem('user',JSON.stringify(d.user));
      navigate(d.user.role==='tutor'?'tutor-dashboard':'student-dashboard');
    }catch(e){if(err){err.textContent=e.message;err.style.display='block'}}
    finally{btn.disabled=false;btn.textContent='تسجيل'}
  });
}

// ==================== QURAN REQUEST ====================
function initQuran(){
  const g=document.getElementById('quranAvailability');
  if(!g||g.children.length) return;
  DAYS.forEach(d=>{
    const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:10px';
    r.innerHTML=`<span style="min-width:60px;font-weight:600;color:var(--text-gray)">${d.label}</span><input type="text" placeholder="مثال: 4-6 مساءً" style="flex:1;padding:8px 10px;background:rgba(255,255,255,0.03);border:var(--border-glass);border-radius:var(--radius-sm);color:var(--text-white);font-family:inherit"><input type="hidden" name="weekly_availability_${d.key}">`;
    r.querySelector('input[type="text"]').addEventListener('input',function(){this.nextElementSibling.value=this.value});
    g.appendChild(r);
  });
  const st=document.getElementById('quranSessionType');
  if(st)st.addEventListener('change',function(){const el=document.getElementById('quranStudentsGroup');if(el)el.style.display=this.value==='group'?'block':'none'});
}
function attachQuran(){
  const f=document.getElementById('quranForm');
  if(!f) return;
  f.addEventListener('submit',async e=>{
    e.preventDefault();const btn=document.getElementById('quranBtn');
    if(!btn)return;
    btn.disabled=true;btn.textContent='جاري الإرسال...';
    const times={};document.querySelectorAll('[name^="weekly_availability_"]').forEach(h=>{const d=h.name.replace('weekly_availability_','');if(h.value)times[d]=[h.value]});
    const data={education_level:'quran',start_juz:parseInt(f.start_juz?.value)||1,current_juz:parseInt(f.current_juz?.value)||1,country:f.country?.value||'SA',session_type:f.sessionType?.value||'solo',weekly_availability:times,notes:f.notes?.value||''};
    if(data.session_type==='group')data.students_count=parseInt(f.students_count?.value)||2;
    try{
      const r=await fetch(API_BASE+'/files/structured-request/',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},body:JSON.stringify(data)});
      const res=await r.json();if(!r.ok)throw new Error(JSON.stringify(res));
      const el=document.getElementById('quranResult');if(el){el.style.display='block';el.innerHTML='<div class="price-box" style="margin:0"><div style="color:#10B981;font-weight:700;text-align:center">✅ تم إرسال طلب التحفيظ بنجاح</div></div>'}
      if(f.reset)f.reset();
    }catch(e){alert('خطأ: '+e.message)}
    finally{btn.disabled=false;btn.textContent='إرسال الطلب'}
  });
}

// ==================== STUDENT DASHBOARD ====================
let sdActiveLevel='',sdInterval=null;
function initSD(){
  const u=getUser();
  const nm=document.getElementById('sdUserName');if(nm)nm.textContent=u.first_name||u.username;
  const sl=u.student_levels||[];
  const ld=document.getElementById('sdLevels');if(ld)ld.textContent='مستوياتك: '+sl.map(c=>LEVEL_MAP[c]||c).join(' · ');
  const all=LEVELS_DATA.map(l=>l.code),display=sl.length?sl:all;
  const tb=document.getElementById('sdTabs');if(!tb)return;tb.innerHTML='';
  display.forEach((l,i)=>{
    const a=i===0;if(a)sdActiveLevel=l;
    tb.innerHTML+=`<span class="tab ${a?'active':''}" onclick="sdSwitch('${l}',this)"><i class="fas ${LEVEL_ICONS[l]||'fa-book'}"></i> ${LEVEL_MAP[l]||l}</span>`;
  });
  const cont=document.getElementById('sdContent');
  if(cont){cont.innerHTML=sdBuild(sdActiveLevel);sdLoad(sdActiveLevel)}
  if(sdInterval)clearInterval(sdInterval);
  sdInterval=setInterval(()=>{if(sdActiveLevel)sdLoad(sdActiveLevel)},15000);
}
function sdSwitch(level,el){sdActiveLevel=level;document.querySelectorAll('#sdTabs .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');const cont=document.getElementById('sdContent');if(cont){cont.innerHTML=sdBuild(level);sdLoad(level)}}
function sdBuild(level){return(level==='quran'||level==='kindergarten'||level==='languages')?sdBuildStructured(level):sdBuildAcademic(level)}
function sdBuildStructured(level){
  const extra=level==='quran'?`<div class="form-row"><div class="form-group"><label>جزأ البداية (من)</label><input type="number" name="start_juz" min="1" max="30" value="1" required></div><div class="form-group"><label>الجزء الحالي</label><input type="number" name="current_juz" min="1" max="30" value="1" required></div></div>`
    :level==='kindergarten'?`<div class="form-row"><div class="form-group"><label>الوحدة الحالية</label><input type="text" name="current_unit" placeholder="مثال: وحدة 3" required></div><div class="form-group"><label>البدء من وحدة</label><input type="text" name="start_unit" placeholder="مثال: وحدة 1" required></div></div>`
    :`<div class="form-row"><div class="form-group"><label>اللغة</label><select name="language" required>${LANG_DATA.map(l=>`<option value="${l.code}">${l.label}</option>`).join('')}</select></div><div class="form-group"><label>مستوى CEFR الحالي</label><select name="current_cefr" required>${['A1','A2','B1','B2','C1','C2'].map(v=>`<option>${v}</option>`).join('')}</select></div><div class="form-group"><label>البدء من مستوى</label><select name="start_cefr" required>${['A1','A2','B1','B2','C1','C2'].map(v=>`<option>${v}</option>`).join('')}</select></div></div>`;
  return `<div class="card"><h3>طلب ${LEVEL_MAP[level]} جديد</h3><p style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px">${level==='quran'?'حدد جزأ البداية وأوقاتك المتاحة':level==='kindergarten'?'حدد الوحدة الدراسية الحالية':'حدد مستوى CEFR الحالي واللغة'}</p>
    <form onsubmit="sdSubmitStructured(event,'${level}')"><input type="hidden" name="education_level" value="${level}">
    <div class="form-row"><div class="form-group"><label>الدولة</label><select name="country" required><option value="SA">السعودية</option><option value="KW">الكويت</option><option value="AE">الإمارات</option><option value="QA">قطر</option></select></div>
    <div class="form-group"><label>نوع الجلسة</label><select name="session_type" onchange="this.closest('form').querySelector('.stdGroup').style.display=this.value==='group'?'block':'none'"><option value="solo">فردي</option><option value="group">مجموعة</option></select></div>
    <div class="form-group stdGroup" style="display:none"><label>عدد الطلاب</label><input type="number" name="students_count" value="2" min="2" max="10"></div></div>
    ${extra}<div class="form-group"><label>ملاحظات</label><textarea name="notes" placeholder="ملاحظات إضافية..." style="min-height:50px"></textarea></div>
    <button type="submit" class="btn btn-primary">إرسال الطلب</button></form><div class="sdStructResult hidden" style="margin-top:12px"></div></div>
    <h3 style="margin:20px 0 12px">طلباتي — ${LEVEL_MAP[level]}</h3><div class="sdFiles"><p class="empty">جاري التحميل...</p></div>
    <h3 style="margin:20px 0 12px">المدرسون المتاحون — ${LEVEL_MAP[level]}</h3><div class="sdTutors"><p class="empty">جاري التحميل...</p></div>
    <h3 style="margin:20px 0 12px">التقدم — ${LEVEL_MAP[level]}</h3><div class="sdProgress"><p class="empty">لا يوجد تقدم بعد</p></div>
    <h3 style="margin:20px 0 12px">العروض المقدمة</h3><div class="sdOffers"><p class="empty">لا توجد عروض</p></div>`;
}
function sdBuildAcademic(level){
  return `<div class="card"><h3>رفع ملف أكاديمي جديد — ${LEVEL_MAP[level]}</h3>
    <div class="upload-zone"><i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--accent-purple);margin-bottom:8px"></i>
    <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px">ارفع ملف PDF وسيحلله الذكاء الاصطناعي لتحديد مستواك واقتراح السعر</p>
    <form onsubmit="sdSubmitAcademic(event,'${level}')"><input type="file" name="file" accept=".pdf" required style="display:block;margin:0 auto 12px"><input type="hidden" name="education_level" value="${level}">
    <div class="form-row"><div class="form-group"><label>الدولة</label><select name="country" required><option value="SA">السعودية</option><option value="KW">الكويت</option><option value="AE">الإمارات</option><option value="QA">قطر</option></select></div>
    <div class="form-group"><label>النوع</label><select name="session_type" onchange="this.closest('form').querySelector('.acGroup').style.display=this.value==='group'?'block':'none'"><option value="solo">فردي</option><option value="group">مجموعة</option></select></div>
    <div class="form-group acGroup" style="display:none"><label>عدد الطلاب</label><input type="number" name="students_count" value="2" min="2" max="10"></div></div>
    <button type="submit" class="btn btn-primary">رفع وتحليل بالذكاء الاصطناعي</button></form><div class="sdAcadResult hidden" style="margin-top:12px"></div></div></div>
    <h3 style="margin:20px 0 12px">ملفاتي — ${LEVEL_MAP[level]}</h3><div class="sdFiles"><p class="empty">جاري التحميل...</p></div>
    <h3 style="margin:20px 0 12px">المدرسون المتاحون — ${LEVEL_MAP[level]}</h3><div class="sdTutors"><p class="empty">جاري التحميل...</p></div>
    <h3 style="margin:20px 0 12px">العروض المقدمة</h3><div class="sdOffers"><p class="empty">لا توجد عروض</p></div>`;
}
async function sdLoad(level){try{await Promise.all([sdLoadFiles(level),sdLoadTutors(level),sdLoadProgress(level),sdLoadOffers(level)])}catch(){}}
async function sdLoadFiles(level){const el=document.querySelector('#sdContent .sdFiles');if(!el)return;
  try{const r=await api('GET','/files/?level='+level);if(!Array.isArray(r)){el.innerHTML='<p class="empty">لا توجد ملفات</p>';return}
  el.innerHTML=r.length?`<div class="table-wrap"><table><tr><th>#</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(f=>`<tr><td>${f.id}</td><td><span class="badge badge-${f.status}">${f.status}</span></td><td>${new Date(f.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`:'<p class="empty">لا توجد ملفات</p>'
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function sdLoadTutors(level){const el=document.querySelector('#sdContent .sdTutors');if(!el)return;
  try{const r=await api('GET','/users/available-tutors/?level='+level);if(!Array.isArray(r)||!r.length){el.innerHTML='<p class="empty">لا يوجد مدرسون متاحون</p>';return}
  el.innerHTML=r.map(t=>`<div class="tutor-card"><img src="${t.profile_picture_url||''}" onerror="this.style.display='none'"><div class="tutor-info"><div class="name"><span class="online-dot"></span>${t.first_name||''} ${t.last_name||''}</div><div class="detail">${t.specialization||''} ${t.years_experience?'· '+t.years_experience+' سنة':''}</div></div><button class="btn btn-sm btn-ghost" onclick="sdOpenTutor(${t.id})">عرض</button></div>`).join('')
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function sdLoadProgress(level){const el=document.querySelector('#sdContent .sdProgress');if(!el)return;
  try{const r=await api('GET','/offers/progress/');if(!Array.isArray(r)||!r.length){el.innerHTML='<p class="empty">لا يوجد تقدم بعد</p>';return}
  el.innerHTML=r.map(e=>{const ft=e.juz_from?`الجزء ${e.juz_from} ← ${e.juz_to}`:e.unit_from?`${e.unit_from} ← ${e.unit_to}`:e.cefr_from?`${e.cefr_from} ← ${e.cefr_to}`:'—';return `<div class="progress-entry"><div class="date">${new Date(e.created_at).toLocaleDateString('ar')}</div><div class="fromto">${ft}</div>${e.tutor_notes?'<div style="font-size:.85rem;color:var(--text-gray)">📝 '+e.tutor_notes+'</div>':''}</div>`}).join('')
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function sdLoadOffers(level){const el=document.querySelector('#sdContent .sdOffers');if(!el)return;
  try{const r=await api('GET','/offers/');if(!Array.isArray(r)||!r.length){el.innerHTML='<p class="empty">لا توجد عروض</p>';return}
  el.innerHTML=`<div class="table-wrap"><table><tr><th>#</th><th>السعر</th><th>الحالة</th><th>إجراء</th></tr>${r.map(o=>`<tr><td>${o.id}</td><td>${o.tutor_price||o.price}</td><td><span class="badge badge-${o.status}">${o.status}</span></td><td>${o.status==='pending'?`<button class="btn btn-sm btn-primary" onclick="sdAccept(${o.id})">قبول</button>`:'—'}</td></tr>`).join('')}</table></div>`
  }catch{el.innerHTML='<p class="empty">لا توجد عروض</p>'}
}
async function sdSubmitAcademic(e,level){e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');if(!btn)return;
  btn.disabled=true;btn.textContent='جاري التحليل...';const fd=new FormData(e.target);
  try{const r=await fetch(API_BASE+'/files/upload/',{method:'POST',headers:{'Authorization':'Bearer '+getToken()},body:fd});const d=await r.json();if(!r.ok)throw new Error(JSON.stringify(d))
  const res=e.target.parentElement.querySelector('.sdAcadResult');if(res){res.classList.remove('hidden');res.innerHTML=`<div class="price-box"><div class="price-item"><div class="num">${d.base_price||d.pricing_breakdown?.base_price||'—'}</div><div class="lbl">السعر</div></div><div class="price-item"><div class="num">${d.specialization||d.subject_type||'—'}</div><div class="lbl">التخصص</div></div></div>`}sdLoad(level);e.target.reset()
  }catch(e){alert('خطأ: '+e.message)}finally{btn.disabled=false;btn.textContent='رفع وتحليل بالذكاء الاصطناعي'}
}
async function sdSubmitStructured(e,level){e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');if(!btn)return;
  btn.disabled=true;btn.textContent='جاري الإرسال...';const data=Object.fromEntries(new FormData(e.target));
  try{await api('POST','/files/structured-request/',data);const res=e.target.parentElement.querySelector('.sdStructResult');if(res){res.classList.remove('hidden');res.innerHTML='<div class="price-box"><div style="color:var(--accent-purple);font-weight:700">✅ تم إرسال الطلب بنجاح</div></div>'}sdLoad(level);e.target.reset()
  }catch(e){alert('خطأ: '+(e.data?.error||e.message))}finally{btn.disabled=false;btn.textContent='إرسال الطلب'}
}
async function sdAccept(id){if(!confirm('تأكيد قبول العرض؟'))return;try{await api('PUT','/offers/'+id+'/accept/');alert('تم قبول العرض!');sdLoad(sdActiveLevel)}catch(e){alert('خطأ: '+(e.data?.error||e.message))}}
async function sdOpenTutor(id){try{const t=await api('GET','/users/tutors/'+id+'/');
  const mc=document.getElementById('tutorModalContent');if(!mc)return;
  mc.innerHTML=`<div style="text-align:center;margin-bottom:16px"><img src="${t.profile_picture_url||''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px" onerror="this.style.display='none'"><h3>${t.first_name||''} ${t.last_name||''}</h3><span class="badge badge-matched">${LEVEL_MAP[t.teaching_level]||t.teaching_level||''}</span></div>${t.bio?'<p style="color:var(--text-gray);font-size:.9rem;text-align:center;margin-bottom:16px">'+t.bio+'</p>':''}<div style="display:grid;gap:8px"><div><strong>التخصص:</strong> ${t.specialization||'—'}</div><div><strong>سنوات الخبرة:</strong> ${t.years_experience||'—'}</div><div><strong>المؤهل:</strong> ${t.education||'—'}</div><div><strong>الشهادات:</strong> ${t.certificates||'—'}</div>${t.languages?.length?'<div><strong>اللغات:</strong> '+t.languages.map(l=>LANG_MAP[l]||l).join('، ')+'</div>':''}</div><button class="btn btn-primary" onclick="closeModal('tutorModal')" style="width:100%;margin-top:16px">إغلاق</button>`;
  const mo=document.getElementById('tutorModal');if(mo)mo.classList.add('active')
}catch{alert('خطأ في تحميل البيانات')}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('active')}

// ==================== TUTOR DASHBOARD ====================
let tdCurrentFileId=null,tdCurrentSessionId=null,tdPing=null,tdLevel='',tdInterval=null;
function initTD(){
  const u=getUser();tdLevel=u.teaching_level||'quran';
  const un=document.getElementById('tdUserName');if(un)un.textContent=u.first_name||u.username;
  const tl=document.getElementById('tdLevel');if(tl)tl.textContent='مختص في: '+(LEVEL_MAP[tdLevel]||tdLevel);
  const tb=document.getElementById('tdTabs');if(tb)tb.innerHTML=`<span class="tab active"><i class="fas ${LEVEL_ICONS[tdLevel]||'fa-book'}"></i> ${LEVEL_MAP[tdLevel]||tdLevel}</span>`;
  const cont=document.getElementById('tdContent');if(cont){cont.innerHTML=tdBuild(tdLevel);tdLoad(tdLevel)}
  if(tdPing)clearInterval(tdPing);tdPing=setInterval(()=>{try{api('POST','/users/ping/')}catch(){}},30000);
  if(tdInterval)clearInterval(tdInterval);tdInterval=setInterval(()=>tdLoad(tdLevel),15000);
}
function tdBuild(level){return`<h3>الملفات المتاحة — ${LEVEL_MAP[level]}</h3><div class="tdFiles"><p class="empty">جاري التحميل...</p></div><h3 style="margin-top:20px">عروضي المرسلة</h3><div class="tdOffers"><p class="empty">لم ترسل أي عروض</p></div><h3 style="margin-top:20px">جلساتي النشطة</h3><div class="tdSessions"><p class="empty">لا توجد جلسات نشطة</p></div>`}
async function tdLoad(level){try{await Promise.all([tdLoadFiles(level),tdLoadOffers(level),tdLoadSessions(level)])}catch(){}}
async function tdLoadFiles(level){const el=document.querySelector('#tdContent .tdFiles');if(!el)return;
  try{const r=await fetch(API_BASE+'/files/?level='+level,{headers:{'Authorization':'Bearer '+getToken()}});const f=await r.json()
  if(!Array.isArray(f)||!f.length){el.innerHTML='<p class="empty">لا توجد ملفات متاحة</p>';return}
  el.innerHTML=`<div class="table-wrap"><table><tr><th>#</th><th>التفاصيل</th><th>النوع</th><th>السعر الأساسي</th><th>إجراء</th></tr>${f.map(x=>`<tr><td>${x.id}</td><td>${x.specialization||x.subject_type||level}${x.difficulty?' · '+x.difficulty:''}</td><td>${x.session_type==='solo'?'فردي':'مجموعة'}</td><td>${x.base_price||'—'} ${x.currency||''}</td><td><button class="btn btn-sm btn-primary" onclick="tdOpenModal(${x.id},'${(x.specialization||level).replace(/'/g,"\\'")}')">إرسال عرض</button></td></tr>`).join('')}</table></div>`
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function tdLoadOffers(level){const el=document.querySelector('#tdContent .tdOffers');if(!el)return;
  try{const r=await api('GET','/offers/');if(!Array.isArray(r)||!r.length){el.innerHTML='<p class="empty">لم ترسل أي عروض</p>';return}
  el.innerHTML=`<div class="table-wrap"><table><tr><th>#</th><th>سعري</th><th>نوع الدفع</th><th>الحالة</th><th>التاريخ</th></tr>${r.map(o=>`<tr><td>${o.id}</td><td>${o.tutor_price||o.price}</td><td>${o.payment_type==='monthly'?'شهري':'بالحصة'}</td><td><span class="badge badge-${o.status}">${o.status}</span></td><td>${new Date(o.created_at).toLocaleDateString('ar')}</td></tr>`).join('')}</table></div>`
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function tdLoadSessions(level){const el=document.querySelector('#tdContent .tdSessions');if(!el)return;
  try{const r=await api('GET','/offers/');const ac=Array.isArray(r)?r.filter(o=>o.status==='accepted'):[]
  if(!ac.length){el.innerHTML='<p class="empty">لا توجد جلسات نشطة</p>';return}
  el.innerHTML=ac.map(o=>`<div class="session-card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><div><strong>💰 ${o.tutor_price} ${o.file?.currency||''} · ${o.payment_type==='monthly'?'شهري':'بالحصة'}</strong>${o.file?.current_juz?'<div style="color:var(--text-muted);font-size:.82rem">الجزء '+o.file.current_juz+' ← '+o.file.start_juz+'</div>':''}</div><button class="btn btn-sm btn-success" onclick="tdOpenProgress(${o.id})">تسجيل تقدم</button></div><div id="tdSessProg-${o.id}" style="margin-top:8px"></div></div>`).join('')
  ac.forEach(o=>tdLoadSessProg(o.id))
  }catch{el.innerHTML='<p class="empty">خطأ في التحميل</p>'}
}
async function tdLoadSessProg(sid){const c=document.getElementById('tdSessProg-'+sid);if(!c)return;
  try{const r=await api('GET','/offers/progress/?session_id='+sid);if(!Array.isArray(r)||!r.length){c.innerHTML='<p style="color:var(--text-muted);font-size:.82rem">لا يوجد تقدم مسجل بعد</p>';return}
  c.innerHTML=r.map(e=>{const ft=e.juz_from?`الجزء ${e.juz_from} ← ${e.juz_to}`:e.unit_from?`${e.unit_from} ← ${e.unit_to}`:e.cefr_from?`${e.cefr_from} ← ${e.cefr_to}`:'—';return `<div class="progress-row"><strong>${ft}</strong> <span style="color:var(--text-muted);font-size:.8rem">${new Date(e.created_at).toLocaleDateString('ar')}</span>${e.tutor_notes?'<div>📝 '+e.tutor_notes+'</div>':''}</div>`}).join('')
  }catch(){}
}
function tdOpenModal(fid,info){tdCurrentFileId=fid;const mi=document.getElementById('modalFileInfo');if(mi)mi.textContent=info;const mp=document.getElementById('modalPrice');if(mp)mp.value='';const mt=document.getElementById('modalPaymentType');if(mt)mt.value='per_session';const me=document.getElementById('modalError');if(me)me.style.display='none';const mo=document.getElementById('offerModal');if(mo)mo.classList.add('active')}
async function submitOffer(){const p=document.getElementById('modalPrice')?.value,pt=document.getElementById('modalPaymentType')?.value,me=document.getElementById('modalError');
  if(!p||p<=0){if(me){me.textContent='أدخل سعراً صحيحاً';me.style.display='block'}return}
  try{await api('POST','/offers/create/',{file_id:tdCurrentFileId,tutor_price:p,payment_type:pt});alert('تم إرسال العرض');closeModal('offerModal');tdLoad(tdLevel)}
  catch(e){if(me){me.textContent=e.data?.error||e.message;me.style.display='block'}}
}
function tdOpenProgress(sid){tdCurrentSessionId=sid;const psi=document.getElementById('progressSessionInfo');if(psi)psi.textContent='تسجيل تقدم الجلسة رقم '+sid;const ptn=document.getElementById('progressTutorNotes');if(ptn)ptn.value='';const pe=document.getElementById('progressError');if(pe)pe.style.display='none';
  let html='';
  if(tdLevel==='quran')html=`<div class="form-row"><div class="form-group"><label>من الجزء</label><input type="number" id="progFrom" min="1" max="30"></div><div class="form-group"><label>إلى الجزء</label><input type="number" id="progTo" min="1" max="30"></div></div>`
  else if(tdLevel==='kindergarten')html=`<div class="form-row"><div class="form-group"><label>من الوحدة</label><input type="text" id="progFrom" placeholder="وحدة 3"></div><div class="form-group"><label>إلى الوحدة</label><input type="text" id="progTo" placeholder="وحدة 5"></div></div>`
  else if(tdLevel==='languages')html=`<div class="form-row"><div class="form-group"><label>من مستوى CEFR</label><select id="progFrom"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div><div class="form-group"><label>إلى مستوى CEFR</label><select id="progTo"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div></div>`
  else html='<p style="color:var(--text-muted)">هذا المستوى لا يتطلب تتبع تقدم رقمي</p>';
  const pf=document.getElementById('progressFields');if(pf)pf.innerHTML=html;const pm=document.getElementById('progressModal');if(pm)pm.classList.add('active')
}
async function submitProgress(){const tn=document.getElementById('progressTutorNotes')?.value||'',p={session_id:tdCurrentSessionId,tutor_notes:tn},l=tdLevel,pe=document.getElementById('progressError');
  if(l==='quran'||l==='kindergarten'||l==='languages'){p.progress_type=l
  if(l==='quran'){p.juz_from=parseInt(document.getElementById('progFrom')?.value);p.juz_to=parseInt(document.getElementById('progTo')?.value)}
  else if(l==='kindergarten'){p.unit_from=document.getElementById('progFrom')?.value;p.unit_to=document.getElementById('progTo')?.value}
  else{p.cefr_from=document.getElementById('progFrom')?.value;p.cefr_to=document.getElementById('progTo')?.value}}
  if(!p.juz_from&&!p.unit_from&&!p.cefr_from){if(l!=='university'&&l!=='high_school'&&l!=='middle_school'&&l!=='primary'){if(pe){pe.textContent='يرجى تعبئة الحقول المطلوبة';pe.style.display='block'}return}}
  try{await api('POST','/offers/progress/create/',p);alert('تم تسجيل التقدم');closeModal('progressModal');tdLoad(tdLevel)}
  catch(e){if(pe){pe.textContent=e.data?.error||e.message;pe.style.display='block'}}
}

// ==================== EDIT PROFILE ====================
function initEdit(){const role=getRole();
  if(role==='student'){
    const tu=document.getElementById('edTutorOnly');if(tu)tu.style.display='none';const so=document.getElementById('edStudentOnly');if(so)so.style.display='block';const pg=document.getElementById('edPaypalGroup');if(pg)pg.style.display='none'
    const c=document.getElementById('edStudentLevels');if(c&&!c.children.length)LEVELS_DATA.forEach(l=>{c.innerHTML+=`<label><input type="checkbox" name="student_levels" value="${l.code}"><span>${l.label}</span></label>`})
  }else{const sl=document.getElementById('edTeachingLevel');if(sl&&!sl.children.length){LEVELS_DATA.forEach(l=>{sl.innerHTML+=`<option value="${l.code}">${l.label}</option>`})
    LANG_DATA.forEach(l=>{const el=document.getElementById('edLangs');if(el)el.innerHTML+=`<label><input type="checkbox" name="langs" value="${l.code}"><span>${l.label}</span></label>`})
    if(sl)sl.addEventListener('change',function(){const lg=document.getElementById('edLangGroup');if(lg)lg.style.display=this.value==='languages'?'block':'none'})}
  }
  loadProfile();
}
async function loadProfile(){try{const u=await api('GET','/users/profile/');
  ['edFirstName','edLastName','edEmail','edSpecialization'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=u[id.replace('ed','').toLowerCase()]||''});const pe=document.getElementById('edPaypal');if(pe)pe.value=u.paypal_email||''
  if(getRole()==='tutor'){const fields={edExperience:'years_experience',edEducation:'education',edCertificates:'certificates',edBio:'bio'};Object.entries(fields).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=u[key]||''})
    const tl=document.getElementById('edTeachingLevel');if(tl&&u.teaching_level)tl.value=u.teaching_level;const lg=document.getElementById('edLangGroup');if(lg)lg.style.display=u.teaching_level==='languages'?'block':'none'
    if(u.languages)document.querySelectorAll('#edLangs input').forEach(cb=>{if(u.languages.includes(cb.value))cb.checked=true})
  }else{if(u.student_levels)document.querySelectorAll('#edStudentLevels input').forEach(cb=>{if(u.student_levels.includes(cb.value))cb.checked=true})}
}catch(e){alert('خطأ في تحميل البيانات')}}
function attachProfile(){const f=document.getElementById('profileForm');if(!f)return;
  f.addEventListener('submit',async e=>{e.preventDefault();const btn=document.getElementById('edBtn'),err=document.getElementById('edError');if(!btn)return;
    btn.disabled=true;btn.textContent='جاري الحفظ...';if(err)err.style.display='none';const role=getRole();
    const gid=(id)=>document.getElementById(id)?.value||'';
    const body={first_name:gid('edFirstName'),last_name:gid('edLastName'),email:gid('edEmail'),specialization:gid('edSpecialization')};
    if(role==='tutor'){body.paypal_email=gid('edPaypal');body.years_experience=document.getElementById('edExperience')?.value||null;body.education=gid('edEducation');body.certificates=gid('edCertificates');body.bio=gid('edBio');body.teaching_level=document.getElementById('edTeachingLevel')?.value||'';body.languages=[...document.querySelectorAll('#edLangs input:checked')].map(c=>c.value)}
    else body.student_levels=[...document.querySelectorAll('#edStudentLevels input:checked')].map(c=>c.value);
    try{const d=await api('PUT','/users/profile/',body);setUserData(d);alert('تم حفظ التغييرات')}
    catch(e){if(err){err.textContent=e.data?.error||e.message;err.style.display='block'}}
    finally{btn.disabled=false;btn.textContent='حفظ التغييرات'}
  });
}

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.getElementById('mainNavbar');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // --- Hash routing for internal anchors ---
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#', '') || 'home';
    navigate(page);
  });

  // --- Simulator: Interactive 3-Step Flow ---
  const stepCards = document.querySelectorAll('.step-card');
  const simScreens = document.querySelectorAll('.sim-screen');
  const fakeUploadBtn = document.getElementById('fakeUploadBtn');
  const uploadAreaBtn = document.getElementById('uploadAreaBtn');
  const fileListContainer = document.getElementById('fileListContainer');
  const startAnalysisBtn = document.getElementById('startAnalysisBtn');
  const progressFillBar = document.getElementById('progressFillBar');
  const scanPages = document.getElementById('scan-pages');
  const scanLevel = document.getElementById('scan-level');
  const scanDifficulty = document.getElementById('scan-difficulty');
  const priceRevealBox = document.getElementById('priceRevealBox');
  const connectTeacherBtn = document.getElementById('connectTeacherBtn');
  const chatBoxContainer = document.getElementById('chatBoxContainer');
  const msg1 = document.getElementById('msg-1');
  const msg2 = document.getElementById('msg-2');
  const msg3 = document.getElementById('msg-3');
  const canvasProblemText = document.getElementById('canvasProblemText');
  const canvasExplanationText = document.getElementById('canvasExplanationText');

  let analysisInProgress = false, step3Running = false;

  function switchScreen(stepNum) {
    stepCards.forEach(c => c.classList.toggle('active', parseInt(c.dataset.step) === stepNum));
    simScreens.forEach(s => s.classList.remove('active'));
    setTimeout(() => {
      const activeScreen = document.getElementById(`screen-${stepNum}`);
      if (activeScreen) activeScreen.classList.add('active');
    }, 100);
  }

  stepCards.forEach(card => {
    card.addEventListener('click', () => {
      const stepNum = parseInt(card.dataset.step);
      switchScreen(stepNum);
      if (stepNum === 3) runStep3Simulation();
    });
  });

  const handleUploadSimulation = () => {
    if (uploadAreaBtn) uploadAreaBtn.style.display = 'none';
    if (fileListContainer) fileListContainer.style.display = 'flex';
  };
  if (fakeUploadBtn) fakeUploadBtn.addEventListener('click', (e) => { e.stopPropagation(); handleUploadSimulation(); });
  if (uploadAreaBtn) uploadAreaBtn.addEventListener('click', handleUploadSimulation);

  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', () => {
      switchScreen(2);
      runStep2Simulation();
    });
  }

  function runStep2Simulation() {
    if (analysisInProgress) return;
    analysisInProgress = true;
    if (progressFillBar) progressFillBar.style.width = '0%';
    if (priceRevealBox) { priceRevealBox.classList.remove('show'); priceRevealBox.style.display = 'none'; }
    ['scan-pages','scan-level','scan-difficulty'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = 'جاري التحليل...'; el.className = 'scan-value scanning'; }
    });
    setTimeout(() => { if (progressFillBar) progressFillBar.style.width = '100%'; }, 100);
    setTimeout(() => { if (scanPages) { scanPages.textContent = '4 صفحات'; scanPages.className = 'scan-value'; } }, 1200);
    setTimeout(() => { if (scanLevel) { scanLevel.textContent = 'رياضيات (تفاضل وتكامل 1)'; scanLevel.className = 'scan-value'; } }, 2200);
    setTimeout(() => { if (scanDifficulty) { scanDifficulty.textContent = 'متوسط الصعوبة (سنة تحضيرية)'; scanDifficulty.className = 'scan-value'; } }, 3200);
    setTimeout(() => {
      if (priceRevealBox) { priceRevealBox.style.display = 'block'; setTimeout(() => priceRevealBox.classList.add('show'), 50); }
      analysisInProgress = false;
    }, 3800);
  }

  if (connectTeacherBtn) {
    connectTeacherBtn.addEventListener('click', () => { switchScreen(3); runStep3Simulation(); });
  }

  function runStep3Simulation() {
    if (step3Running) return;
    step3Running = true;
    [msg1, msg2, msg3, canvasProblemText, canvasExplanationText].forEach(el => { if (el) el.classList.remove('show'); });
    if (chatBoxContainer) chatBoxContainer.scrollTop = 0;
    setTimeout(() => { if (msg1) { msg1.classList.add('show'); if (chatBoxContainer) chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight; } }, 600);
    setTimeout(() => { if (msg2) { msg2.classList.add('show'); if (chatBoxContainer) chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight; } }, 2200);
    setTimeout(() => { if (canvasProblemText) canvasProblemText.classList.add('show'); }, 4000);
    setTimeout(() => { if (canvasExplanationText) canvasExplanationText.classList.add('show'); }, 5800);
    setTimeout(() => { if (msg3) { msg3.classList.add('show'); if (chatBoxContainer) chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight; } step3Running = false; }, 8000);
  }

  // --- App: Navbar ---
  buildNavbar();

  // --- App: Form listeners ---
  attachLogin();
  attachRegister();
  attachQuran();
  attachProfile();

  // --- App: Start ---
  const initialPage = location.hash.replace('#', '') || 'home';
  navigate(initialPage);
});
