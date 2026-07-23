export function renderFAQ() {
  const faqs = [
    {
      q: "كيف تبدأ مع تفاعلي؟",
      a: "أنشئ حسابك المجاني واختر دورك (طالب أو مدرس). كطالب، ارفع ملفك أو أرسل طلب تحفيظ القرآن. كدرس، اعرض سعرك على الطلبات المتوافقة مع تخصصك."
    },
    {
      q: "كيف يعمل التحليل بالذكاء الاصطناعي؟",
      a: "عند رفع ملف PDF، يقوم الذكاء الاصطناعي (Gemini) بتحليل المحتوى واستخراج التخصص، مستوى الصعوبة، وعدد الساعات المقدرة. ثم يتم احتساب السعر تلقائياً."
    },
    {
      q: "كيف يتم الدفع؟",
      a: "تتم المدفوعات بشكل آمن عبر PayPal. عند قبول عرض المدرس، يُ redirected الطالب لصفحة PayPal لتأكيد الدفع. العمولة 15% تُخصم تلقائياً."
    },
    {
      q: "كيف يحصل المدرس على أجره؟",
      a: "بعد تأكيد الدفع واكتمال الجلسة، يتم تحويل المبلغ المحدد (بعد خصم العمولة) تلقائياً لحساب PayPal الخاص بالمدرس."
    },
    {
      q: "هل يمكنني تغيير المدرس؟",
      a: "نعم، يمكنك رفض أي عرض جديد والبحث عن مدرس آخر. إذا كنت في جلسة نشطة، يجب إنهاء الجلسة أولاً."
    },
    {
      q: "ما هي المستويات التعليمية المدعومة؟",
      a: "ندعم 7 مستويات: تحفيظ القرآن الكريم، جامعي، ثانوي، إعدادي، ابتدائي، حضانة، وتعليم اللغات (إنجليزي، فرنسي، ألماني، إسباني، إيطالي، تركي، صيني، روسي)."
    },
  ]

  return `
    <div class="page active" style="max-width:800px;margin:0 auto;padding:40px 24px 80px">
      <h1 style="margin-bottom:32px;text-align:center">الأسئلة الشائعة</h1>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${faqs.map(f => `
          <details style="background:var(--glass-bg);border:1px solid var(--border-subtle);border-radius:12px;padding:20px 24px;backdrop-filter:blur(12px)">
            <summary style="cursor:pointer;font-weight:600;font-size:1.05rem;color:var(--text-primary);list-style:none;display:flex;justify-content:space-between;align-items:center">
              ${f.q}
              <i class="fas fa-chevron-down" style="color:var(--text-muted);transition:transform 0.3s;font-size:0.8rem"></i>
            </summary>
            <p style="color:var(--text-muted);line-height:1.8;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-subtle)">${f.a}</p>
          </details>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:48px">
        <p style="color:var(--text-muted);margin-bottom:16px">لسه عندك سؤال؟</p>
        <button class="btn btn-primary page-btn" data-page="home"><i class="fas fa-envelope"></i> تواصل معنا</button>
      </div>
    </div>
  `
}
