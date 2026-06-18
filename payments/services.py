import json
import hashlib
import paypalrestsdk
from django.conf import settings


def configure_paypal():
    paypalrestsdk.configure({
        "mode": settings.PAYPAL_MODE,
        "client_id": settings.PAYPAL_CLIENT_ID,
        "client_secret": settings.PAYPAL_CLIENT_SECRET,
    })


def create_paypal_payment(amount, currency, return_url, cancel_url):
    if not settings.PAYPAL_CLIENT_ID or settings.PAYPAL_CLIENT_ID == "your-paypal-client-id":
        import uuid
        mock_id = f"PAY-MOCK-{uuid.uuid4().hex[:16].upper()}"
        # We append simulated PayPal query parameters to return_url
        sep = "&" if "?" in return_url else "?"
        mock_approval_url = f"{return_url}{sep}paymentId={mock_id}&PayerID=MOCK_PAYER_ID"
        return mock_id, mock_approval_url

    configure_paypal()
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {"payment_method": "paypal"},
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
        "transactions": [{
            "amount": {"total": f"{amount:.2f}", "currency": currency},
            "description": "Tutoring session payment",
        }],
    })
    if payment.create():
        approval_url = next(
            (link.href for link in payment.links if link.rel == "approval_url"),
            None,
        )
        return payment.id, approval_url
    raise RuntimeError(f"PayPal payment creation failed: {payment.error}")


def execute_paypal_payment(payment_id, payer_id):
    if payment_id.startswith("PAY-MOCK-"):
        import uuid
        return f"PAY-MOCK-CAPTURE-{uuid.uuid4().hex[:16].upper()}"

    configure_paypal()
    payment = paypalrestsdk.Payment.find(payment_id)
    if not payment:
        raise RuntimeError("PayPal payment not found")
    if payment.execute({"payer_id": payer_id}):
        capture_id = payment.transactions[0].related_resources[0].sale.id
        return capture_id
    raise RuntimeError(f"PayPal execution failed: {payment.error}")


def send_tutor_payout(tutor_email, amount, currency, note="Tutoring session payout"):
    configure_paypal()
    payout = paypalrestsdk.Payout({
        "sender_batch_header": {
            "sender_batch_id": f"payout_{int(__import__('time').time())}",
            "email_subject": "New payment received!",
            "email_message": note,
        },
        "items": [{
            "recipient_type": "EMAIL",
            "amount": {"value": f"{amount:.2f}", "currency": currency},
            "receiver": tutor_email,
            "note": note,
        }],
    })
    if payout.create():
        return payout.batch_header.payout_batch_id
    raise RuntimeError(f"PayPal payout failed: {payout.error}")


def verify_webhook_signature(request):
    webhook_id = settings.PAYPAL_WEBHOOK_ID
    if not webhook_id:
        return True
    configure_paypal()
    headers = request.META
    body = request.body.decode("utf-8")
    try:
        verification = paypalrestsdk.WebhookEvent.verify(
            transmission_id=headers.get("HTTP_PAYPAL_TRANSMISSION_ID"),
            transmission_sig=headers.get("HTTP_PAYPAL_TRANSMISSION_SIG"),
            cert_url=headers.get("HTTP_PAYPAL_CERT_URL"),
            auth_algo=headers.get("HTTP_PAYPAL_AUTH_ALGO"),
            transmission_time=headers.get("HTTP_PAYPAL_TRANSMISSION_TIME"),
            webhook_id=webhook_id,
            event_body=json.loads(body),
        )
        return verification
    except Exception:
        return False
