import json
import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from offers.models import Session
from users.models import User
from .models import Payment, Payout
from .serializers import PaymentSerializer, PayoutSerializer
from .services import (
    create_paypal_payment,
    execute_paypal_payment,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_payments(request):
    qs = Payment.objects.select_related("session__request__file", "session__request__tutor")
    if request.user.role == "student":
        qs = qs.filter(session__request__file__student=request.user)
    else:
        qs = qs.filter(session__request__tutor=request.user)
    qs = qs.order_by("-created_at")
    return Response(PaymentSerializer(qs, many=True).data)


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

    if session.is_trial:
        return Response({"error": "هذه جلسة مجانية (تجريبية) ولا تحتاج إلى دفع"}, status=status.HTTP_400_BAD_REQUEST)

    if session.status != Session.Status.AWAITING_PAYMENT:
        return Response({"error": "Session is not awaiting payment"}, status=status.HTTP_400_BAD_REQUEST)

    if Payment.objects.filter(session=session).exists():
        return Response({"error": "Payment already initiated"}, status=status.HTTP_400_BAD_REQUEST)

    payment_type = session.request.payment_type
    month_year = request.data.get("month_year", "")
    if payment_type == "monthly" and not month_year:
        month_year = timezone.now().strftime("%Y-%m")

    total = float(session.request.tutor_price)
    currency = session.request.file.currency
    return_url = request.data.get("return_url") or f"{request.scheme}://{request.get_host()}/student-dashboard"
    cancel_url = request.data.get("cancel_url") or f"{request.scheme}://{request.get_host()}/student-dashboard"

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
        payment = Payment.objects.select_related("session__request__file__student").get(paypal_order_id=payment_id)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    if payment.session.request.file.student != request.user:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tutor_earnings(request):
    if request.user.role != "tutor":
        return Response({"error": "Tutors only"}, status=status.HTTP_403_FORBIDDEN)

    month = request.query_params.get("month") or timezone.now().strftime("%Y-%m")

    sessions = []
    total_by_currency = {}

    qs = Payment.objects.filter(
        payment_status="completed",
        session__request__tutor=request.user,
        session__is_trial=False,
    ).select_related("session__request__file", "session__request")

    for p in qs:
        p_month = p.month_year if (p.payment_type == "monthly" and p.month_year) else p.created_at.strftime("%Y-%m")
        if p_month != month:
            continue
        cur = p.session.request.file.currency
        amount = float(p.session.tutor_amount)
        total_by_currency[cur] = round(total_by_currency.get(cur, 0) + amount, 2)
        sessions.append({
            "payment_id": p.id,
            "session_id": p.session_id,
            "amount": amount,
            "currency": cur,
            "tutor_paid": p.tutor_paid,
        })

    payouts = Payout.objects.filter(tutor=request.user, month_year=month).order_by("-created_at")

    return Response({
        "month": month,
        "total_by_currency": total_by_currency,
        "sessions": sessions,
        "payouts": PayoutSerializer(payouts, many=True).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_payouts(request):
    if request.user.is_staff or request.user.is_superuser:
        qs = Payout.objects.select_related("tutor").order_by("-created_at")
    else:
        qs = Payout.objects.filter(tutor=request.user).order_by("-created_at")
    return Response(PayoutSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_monthly_payouts(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Admins only"}, status=status.HTTP_403_FORBIDDEN)

    month = request.data.get("month_year") or timezone.now().strftime("%Y-%m")

    groups = {}
    qs = Payment.objects.filter(
        payment_status="completed",
        tutor_paid=False,
        payout__isnull=True,
        session__is_trial=False,
    ).select_related("session__request__tutor", "session__request__file")

    for p in qs:
        p_month = p.month_year if (p.payment_type == "monthly" and p.month_year) else p.created_at.strftime("%Y-%m")
        if p_month != month:
            continue
        cur = p.session.request.file.currency
        key = (p.session.request.tutor_id, cur)
        groups.setdefault(key, []).append(p)

    created = []
    for (tutor_id, cur), pays in groups.items():
        tutor = User.objects.get(id=tutor_id)
        amount = round(sum(float(p.session.tutor_amount) for p in pays), 2)
        method = Payout.PayoutMethod.INSTAPAY if tutor.instapay_phone else Payout.PayoutMethod.VODAFONE_CASH
        recipient = tutor.instapay_phone or tutor.vodafone_cash
        payout = Payout.objects.create(
            tutor=tutor,
            month_year=month,
            amount=amount,
            currency=cur,
            method=method,
            recipient=recipient,
        )
        Payment.objects.filter(id__in=[p.id for p in pays]).update(payout=payout)
        created.append(PayoutSerializer(payout).data)

    return Response({"month": month, "payouts": created, "count": len(created)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_payout_paid(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Admins only"}, status=status.HTTP_403_FORBIDDEN)

    try:
        payout = Payout.objects.get(id=pk)
    except Payout.DoesNotExist:
        return Response({"error": "Payout not found"}, status=status.HTTP_404_NOT_FOUND)

    payout.status = Payout.PayoutStatus.PAID
    payout.paid_at = timezone.now()
    payout.admin_note = request.data.get("admin_note", payout.admin_note)
    payout.save()
    Payment.objects.filter(payout=payout).update(tutor_paid=True)

    return Response(PayoutSerializer(payout).data)


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
        updated = Payment.objects.filter(paypal_capture_id=capture_id, payment_status="completed").update(
            webhook_verified=True
        )
        logger.info(f"Payment capture confirmed: {capture_id} (updated {updated})")

    elif event_type == "PAYMENT.CAPTURE.DENIED":
        capture_id = resource.get("id")
        Payment.objects.filter(paypal_capture_id=capture_id).update(payment_status="failed")
        logger.info(f"Payment denied: {capture_id}")

    elif event_type == "PAYMENT.CAPTURE.REFUNDED":
        capture_id = resource.get("id")
        Payment.objects.filter(paypal_capture_id=capture_id).update(payment_status="refunded")
        logger.info(f"Payment refunded: {capture_id}")

    return HttpResponse(status=200)
