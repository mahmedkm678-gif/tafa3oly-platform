from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_payments, name="payment-list"),
    path("create/", views.create_payment, name="payment-create"),
    path("confirm/", views.confirm_payment, name="payment-confirm"),
    path("receipt/", views.submit_receipt, name="payment-receipt"),
    path("<int:pk>/verify/", views.verify_manual_payment, name="payment-verify"),
    path("webhook/", views.webhook, name="payment-webhook"),
    path("earnings/", views.tutor_earnings, name="tutor-earnings"),
    path("payouts/", views.list_payouts, name="payout-list"),
    path("payouts/generate/", views.generate_monthly_payouts, name="payout-generate"),
    path("payouts/<int:pk>/mark-paid/", views.mark_payout_paid, name="payout-mark-paid"),
]
