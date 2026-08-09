import { $, esc } from '../utils.js'
import { toast } from '../components/Toast.js'
import { api } from '../api.js'
import { Spinner } from '../components/Spinner.js'
import { confirmDialog } from '../components/ConfirmDialog.js'

export function renderPayment() {
  return `
    <div class="page active" id="page-payment">
      <div class="container" style="max-width:520px;padding-top:40px;padding-bottom:40px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:56px;height:56px;border-radius:14px;background:rgba(180,40,30,0.08);display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--red);margin:0 auto 12px"><i class="fas fa-credit-card"></i></div>
          <h1 style="font-family:var(--font-heading);font-size:1.5rem">الدفع</h1>
        </div>
        <div id="payContent">${Spinner()}</div>
      </div>
    </div>
  `
}

export async function initPayment() {
  const content = $('#payContent')
  if (!content) return

  const sp = new URLSearchParams(window.location.search)
  const paymentId = sp.get('paymentId')
  const payerId = sp.get('PayerID')
  const sid = sp.get('session_id')

  if (paymentId && payerId) {
    try {
      await api('POST', '/payments/confirm/', { payment_id: paymentId, payer_id: payerId })
      toast('تم تأكيد الدفع بنجاح ✓', 'success')
      content.innerHTML = doneHTML('تم تأكيد الدفع بنجاح ✓', 'جلساتك جاهزة — المدرس هيبدأ معاك قريب.')
    } catch (e) {
      content.innerHTML = doneHTML('تعذر تأكيد الدفع', e.data?.error || e.message, true)
    }
    return
  }

  if (!sid) {
    content.innerHTML = '<p class="empty">لا يوجد session_id — ارجع للوحة التحكم وجرب تاني</p>'
    return
  }

  const amount = sp.get('amount') || ''
  const currency = sp.get('currency') || ''
  const trial = sp.get('trial') === '1'

  if (trial) {
    content.innerHTML = doneHTML('أول جلسة مجانية ✓', 'الجلسة التجريبية الأولى مع المدرس مجانية ومش محتاجة دفع — المدرس هيبدأ معاك قريب.')
    return
  }

  content.innerHTML = methodsHTML(sid, amount, currency)
  wireMethods(sid, amount, currency, content)
}

function doneHTML(title, msg, error) {
  return `
    <div class="card" style="padding:24px;text-align:center">
      <i class="fas ${error ? 'fa-exclamation-triangle' : 'fa-check-circle'}" style="font-size:2.2rem;color:${error ? 'var(--red)' : '#10B981'};margin-bottom:12px"></i>
      <h3 style="margin-bottom:8px">${esc(title)}</h3>
      <p style="color:var(--text-gray-muted);font-size:.88rem;line-height:1.8;margin-bottom:20px">${esc(msg)}</p>
      <button class="btn btn-primary page-btn" data-page="student-dashboard"><i class="fas fa-tachometer-alt"></i> الرجوع للوحة التحكم</button>
    </div>
  `
}

function methodsHTML(sid, amount, currency) {
  return `
    <div class="card" style="padding:22px">
      <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
        <span style="color:var(--text-gray-muted);font-size:.88rem">المبلغ المطلوب</span>
        <strong style="font-family:var(--font-heading);font-size:1.15rem;color:var(--gold)">${amount} ${currency}</strong>
      </div>
      <div id="payMethodList" style="display:grid;gap:10px">
        <button class="btn btn-ghost pay-method-btn" data-method="paypal" style="display:flex;align-items:center;gap:10px;justify-content:center"><i class="fas fa-credit-card"></i> الدفع عبر PayPal (بطاقة دولية)</button>
        <button class="btn btn-ghost pay-method-btn" data-method="instapay" style="display:flex;align-items:center;gap:10px;justify-content:center"><i class="fas fa-mobile-alt"></i> تحويل عبر إنستاباي</button>
        <button class="btn btn-ghost pay-method-btn" data-method="vodafone_cash" style="display:flex;align-items:center;gap:10px;justify-content:center"><i class="fas fa-mobile-alt"></i> تحويل عبر فودافون كاش</button>
      </div>
      <div id="payManualBox" class="hidden" style="margin-top:14px"></div>
      <button class="btn btn-ghost page-btn" data-page="student-dashboard" style="width:100%;margin-top:14px">إلغاء والرجوع للوحة التحكم</button>
    </div>
  `
}

function wireMethods(sid, amount, currency, content) {
  const list = content.querySelector('#payMethodList')
  const box = content.querySelector('#payManualBox')

  content.querySelectorAll('.pay-method-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const method = btn.dataset.method

      if (method === 'paypal') {
        const ok = await confirmDialog(`تأكيد دفع ${amount} ${currency} عبر PayPal؟ سيتم تحويلك إلى PayPal لإتمام الدفع.`)
        if (!ok) return
        try {
          const base = window.location.origin + '/payment?session_id=' + sid
          const d = await api('POST', '/payments/create/', { session_id: sid, return_url: base, cancel_url: base })
          window.location.href = d.approval_url
        } catch (e) {
          toast('خطأ: ' + (e.data?.error || e.message), 'error')
        }
        return
      }

      let createRes
      try {
        createRes = await api('POST', '/payments/create/', { session_id: sid, payment_method: method })
      } catch (e) {
        toast('خطأ: ' + (e.data?.error || e.message), 'error')
        return
      }

      const pid = createRes.payment.id
      const recipient = createRes.recipient || ''

      list.classList.add('hidden')
      box.classList.remove('hidden')
      box.innerHTML = `
        <div style="padding:14px;background:rgba(255,255,255,.04);border-radius:10px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>المبلغ</span><strong>${amount} ${currency}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>تحوّل إلى</span><strong dir="ltr">${recipient}</strong></div>
          <div style="display:flex;justify-content:space-between"><span>المحفظة</span><strong>${method === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}</strong></div>
        </div>
        <form id="payManualForm">
          <div class="form-group"><label>رقم المرجع من عملية التحويل</label><input type="text" name="reference_number" required placeholder="مثال: 123456789"></div>
          <div class="form-group"><label>صورة الإيصال (سكرين شوت)</label><input type="file" name="receipt" accept="image/*" required style="width:100%"></div>
          <button type="submit" class="btn btn-primary" style="width:100%">إرسال للاعتماد اليدوي</button>
        </form>
        <p style="color:var(--text-muted);font-size:.8rem;margin-top:8px">سيقوم فريقنا بالتحقق من التحويل وتفعيل الجلسة خلال ساعات العمل.</p>
      `
      box.querySelector('#payManualForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        const form = e.target
        const sbtn = form.querySelector('button')
        sbtn.disabled = true; sbtn.textContent = 'جاري الإرسال...'
        try {
          const fd = new FormData(form)
          fd.append('payment_id', pid)
          await api('POST', '/payments/receipt/', fd)
          box.innerHTML = doneHTML('تم استلام بيانات التحويل ✓', 'دفعك قيد المراجعة — هنفعّل جلساتك بمجرد تأكيد التحويل.')
        } catch (err) {
          toast('خطأ: ' + (err.data?.error || err.message), 'error')
        } finally {
          sbtn.disabled = false; sbtn.textContent = 'إرسال للاعتماد اليدوي'
        }
      })
    })
  })
}
