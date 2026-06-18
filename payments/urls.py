from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_payment, name="payment-create"),
    path("confirm/", views.confirm_payment, name="payment-confirm"),
    path("webhook/", views.webhook, name="payment-webhook"),
]
