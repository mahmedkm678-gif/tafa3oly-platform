from django.db import models
from offers.models import Session


class Payment(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

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
    payout_batch_id = models.CharField(max_length=255, blank=True, default='')
    tutor_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} - Session #{self.session_id} ({self.payment_status})"
