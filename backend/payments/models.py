from django.db import models
from django.conf import settings
from offers.models import Session


class Payout(models.Model):
    class PayoutStatus(models.TextChoices):
        PENDING = 'pending', 'قيد التحويل'
        PAID = 'paid', 'تم التحويل'
        FAILED = 'failed', 'فشل التحويل'

    class PayoutMethod(models.TextChoices):
        INSTAPAY = 'instapay', 'إنستاباي'
        VODAFONE_CASH = 'vodafone_cash', 'فودافون كاش'

    tutor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payouts')
    month_year = models.CharField(max_length=7)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    method = models.CharField(max_length=15, choices=PayoutMethod.choices, default=PayoutMethod.INSTAPAY)
    recipient = models.CharField(max_length=30, blank=True, default='')
    status = models.CharField(max_length=10, choices=PayoutStatus.choices, default=PayoutStatus.PENDING)
    admin_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payout #{self.id} - Tutor #{self.tutor_id} {self.month_year} ({self.status})"


class Payment(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class PaymentType(models.TextChoices):
        MONTHLY = 'monthly', 'شهري'
        PER_SESSION = 'per_session', 'بالحصة'

    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='paypal')
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_type = models.CharField(max_length=15, choices=PaymentType.choices, default=PaymentType.PER_SESSION)
    month_year = models.CharField(max_length=7, blank=True, default='')
    paypal_order_id = models.CharField(max_length=255, blank=True, default='')
    paypal_capture_id = models.CharField(max_length=255, blank=True, default='')
    webhook_verified = models.BooleanField(default=False)
    payout = models.ForeignKey(Payout, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payout_batch_id = models.CharField(max_length=255, blank=True, default='')
    tutor_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} - Session #{self.session_id} ({self.payment_status})"
