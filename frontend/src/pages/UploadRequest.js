import { isLoggedIn, isStudent } from '../auth.js'

export function renderUploadRequest() {
  const li = isLoggedIn()
  const student = li && isStudent()
  return `
    <div class="page active" style="max-width:640px;margin:0 auto;padding:80px 24px;text-align:center">
      <div style="width:64px;height:64px;border-radius:16px;background:rgba(180,40,30,0.08);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--red);margin:0 auto 20px"><i class="fas fa-cloud-upload-alt"></i></div>
      <h1 style="font-family:var(--font-heading);font-size:1.6rem;margin-bottom:12px">${li ? (student ? 'اتفضل، جهّز ملفك' : 'صفحة رفع الملفات للطلاب') : 'سجّل دخولك عشان ترفع ملفك'}</h1>
      <p style="color:var(--text-gray-muted);font-size:.92rem;line-height:1.8;margin-bottom:28px">
        ${li
          ? (student
            ? 'من لوحة التحكم هتقدر ترفع ملفك وتتابع تحليل الذكاء الاصطناعي وعروض المدرسين.'
            : 'حسابك مسجل كمدرس — صفحة رفع الملفات مخصوصة للطلاب. تقدر تروح للوحة التحكم بتاعتك.')
          : 'عشان نربط ملفك بمدرسين متخصصين في مستواك، محتاجين حسابك الأول — مش هياخد منك دقيقة.'}
      </p>
      ${li
        ? `<button class="btn btn-primary page-btn" data-page="${student ? 'student-dashboard' : 'tutor-dashboard'}"><i class="fas fa-tachometer-alt"></i> ${student ? 'روح للوحة التحكم وارفع ملفك' : 'لوحة تحكم المدرس'}</button>`
        : `<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
             <button class="btn btn-primary page-btn" data-page="login"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
             <button class="btn btn-secondary page-btn" data-page="register"><i class="fas fa-user-plus"></i> إنشاء حساب</button>
           </div>`}
    </div>
  `
}
