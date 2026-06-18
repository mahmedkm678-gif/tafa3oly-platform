import json
import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from offers.models import Session
from .models import Payment
from .serializers import PaymentSerializer
from .services import (
    create_paypal_payment,
    execute_paypal_payment,
    send_tutor_payout,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment(request):
    session_id = request.data.get("session_id")

    try:
        session = Session.objects.select_related("request__file__student", "request").get(
            id=session_id, request__file__student=request.user
        )
    except Session.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

    if Payment.objects.filter(session=session).exists():
        return Response({"error": "Payment already initiated"}, status=status.HTTP_400_BAD_REQUEST)

    payment_type = session.request.payment_type
    month_year = request.data.get("month_year", "")
    if payment_type == "monthly" and not month_year:
        from datetime import datetime
        month_year = datetime.now().strftime("%Y-%m")

    total = float(session.request.tutor_price)
    currency = session.request.file.currency
    return_url = request.data.get("return_url", "http://127.0.0.1:8000/frontend/student_dashboard.html")
    cancel_url = request.data.get("cancel_url", "http://127.0.0.1:8000/frontend/student_dashboard.html")

    try:
        paypal_id, approval_url = create_paypal_payment(total, currency, return_url, cancel_url)
    except RuntimeError as e:
        return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    payment = Payment.objects.create(
        session=session,
        amount=total,
        payment_method="paypal",
        payment_type=payment_type,
        month_year=month_year,
        paypal_order_id=paypal_id,
    )

    return Response({
        "payment": PaymentSerializer(payment).data,
        "approval_url": approval_url,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    payment_id = request.data.get("payment_id")
    payer_id = request.data.get("payer_id")

    if not payment_id or not payer_id:
        return Response({"error": "Missing payment_id or payer_id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment = Payment.objects.get(paypal_order_id=payment_id)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        capture_id = execute_paypal_payment(payment_id, payer_id)
    except RuntimeError as e:
        payment.payment_status = "failed"
        payment.save()
        return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    payment.payment_status = "completed"
    payment.paypal_capture_id = capture_id
    payment.save()

    payment.session.status = "scheduled"
    payment.session.save()

    return Response(PaymentSerializer(payment).data)


@csrf_exempt
def webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    body = request.body.decode("utf-8")

    if settings.PAYPAL_WEBHOOK_ID:
        if not verify_webhook_signature(request):
            logger.warning("PayPal webhook signature verification failed")
            return HttpResponse(status=400)

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        return HttpResponse(status=400)

    event_type = event.get("event_type")
    resource = event.get("resource", {})

    if event_type == "PAYMENT.CAPTURE.COMPLETED":
        capture_id = resource.get("id")
        for payment in Payment.objects.filter(paypal_capture_id=capture_id, payment_status="completed", tutor_paid=False):
            session = payment.session
            tutor = session.request.tutor
            tutor_email = tutor.paypal_email
            if not tutor_email:
                logger.warning(f"Tutor {tutor.id} has no PayPal email")
                continue
            try:
                amount = float(session.tutor_amount)
                batch_id = send_tutor_payout(tutor_email, amount, "USD")
                payment.tutor_paid = True
                payment.payout_batch_id = batch_id
                payment.webhook_verified = True
                payment.save()
                if payment.payment_type != "monthly":
                    session.status = "done"
                    session.save()
                    session.request.file.status = "done"
                    session.request.file.save()
                logger.info(f"Payout sent to tutor {tutor.id}: batch {batch_id}")
            except RuntimeError as e:
                logger.error(f"Payout failed for tutor {tutor.id}: {e}")

    elif event_type == "PAYMENT.CAPTURE.DENIED":
        capture_id = resource.get("id")
        Payment.objects.filter(paypal_capture_id=capture_id).update(payment_status="failed")
        logger.info(f"Payment denied: {capture_id}")

    elif event_type == "PAYMENT.CAPTURE.REFUNDED":
        capture_id = resource.get("id")
        Payment.objects.filter(paypal_capture_id=capture_id).update(payment_status="refunded")
        logger.info(f"Payment refunded: {capture_id}")

    return HttpResponse(status=200)
