from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'amount', 'payment_method', 'payment_status', 'paypal_order_id', 'webhook_verified', 'tutor_paid', 'created_at']
    list_filter = ['payment_status', 'tutor_paid', 'webhook_verified']
