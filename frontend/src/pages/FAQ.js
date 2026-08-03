export function renderFAQ() {
  const faqs = [
    {
      q: "كيف تبدأ مع تفاعلي؟",
      a: "أنشئ حسابك المجاني واختر دورك (طالب أو مدرس). كطالب، ارفع ملفاً لا تفهمه أو أرسل طلب تحفيظ القرآن. كدرس، انتظر الترشيح من الذكاء الاصطناعي أو اعرض سعرك على الطلبات المتوافقة مع تخصصك."
    },
    {
      q: "كيف يعمل التحليل بالذكاء الاصطناعي؟",
      a: "عند رفع ملف PDF، يقوم الذكاء الاصطناعي (Gemini) بتحليل المحتوى وتقييم صعوبته وعدد الساعات المقدرة، ثم يقترح سعراً ويرشّح مدرساً متخصصاً. المدرس هو من يقرر السعر النهائي (يقبل أو يعدّل أو يرفض)."
    },
    {
      q: "هل أول جلسة مجانية؟",
      a: "نعم، أول جلسة مع أي مدرس جديد مجانية تماماً ولا يدفع الطالب فيها شيئاً."
    },
    {
      q: "كيف يتم الدفع؟",
      a: "يدفع الطالب المنصة مباشرة عبر PayPal عند تأكيد المدرس للسعر. لا يوجد أي دفع مباشر من الطالب إلى المدرس. العمولة 15% تُخصم تلقائياً من سعر المدرس."
    },
    {
      q: "كيف يحصل المدرس على أجره؟",
      a: "تُجمّع أرباح المدرس خلال الشهر (بعد خصم عمولة المنصة) وتُحوَّل له شهرياً عبر إنستاباي أو فودافون كاش."
    },
    {
      q: "هل يمكنني تغيير المدرس؟",
      a: "نعم، يمكنك رفض أي ترشيح أو عرض جديد والبحث عن مدرس آخر. إذا كنت في جلسة نشطة، يجب إنهاء الجلسة أولاً."
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
        ${faqs.map((f, i) => `
          <details class="faq-item" style="background:var(--bg-dark-card);border:var(--border-glass);border-radius:var(--radius-md);overflow:hidden${i === 0 ? ';open' : ''}">
            <summary style="padding:16px 20px;cursor:pointer;font-weight:700;font-size:.92rem;display:flex;align-items:center;justify-content:space-between;list-style:none">
              <span>${f.q}</span>
              <i class="fas fa-chevron-down" style="color:var(--red);transition:transform .3s;font-size:.8rem"></i>
            </summary>
            <div style="padding:0 20px 16px;color:var(--text-gray-muted);font-size:.88rem;line-height:1.8">
              ${f.a}
            </div>
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
