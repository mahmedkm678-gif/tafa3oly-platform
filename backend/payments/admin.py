from django.contrib import admin
from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'amount', 'payment_method', 'payment_status', 'receipt_image_url', 'paypal_order_id', 'webhook_verified', 'payout', 'tutor_paid', 'created_at']
    list_filter = ['payment_status', 'payment_method', 'tutor_paid', 'webhook_verified']
    actions = ['confirm_manual']

    @admin.action(description="تأكيد الدفعات اليدوية وتفعيل الجلسات")
    def confirm_manual(self, request, queryset):
        from offers.models import Session
        updated = 0
        for payment in queryset:
            if payment.payment_status == "pending_review":
                payment.payment_status = "completed"
                payment.save()
                payment.session.status = Session.Status.SCHEDULED
                payment.session.save()
                updated += 1
        self.message_user(request, f"تم تأكيد {updated} دفعة وتفعيل جلساتها")


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['id', 'tutor', 'month_year', 'amount', 'currency', 'method', 'recipient', 'status', 'paid_at', 'created_at']
    list_filter = ['status', 'method', 'month_year']
    actions = ['mark_paid']

    @admin.action(description="تحديد كصرف تم تنفيذه")
    def mark_paid(self, request, queryset):
        from django.utils import timezone
        for payout in queryset:
            payout.status = "paid"
            payout.paid_at = timezone.now()
            payout.save()
            payout.payments.all().update(tutor_paid=True)
