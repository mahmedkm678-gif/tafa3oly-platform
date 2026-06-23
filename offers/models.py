from django.db import models
from users.models import User
from files.models import File


class Request(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    class PaymentType(models.TextChoices):
        MONTHLY = 'monthly', 'شهري'
        PER_SESSION = 'per_session', 'بالحصة'

    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='offers')
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tutor_offers')
    tutor_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=15, choices=PaymentType.choices, default=PaymentType.PER_SESSION)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request #{self.id} - File #{self.file_id} -> Tutor #{self.tutor_id} ({self.status})"


class Session(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        DONE = 'done', 'Done'

    request = models.OneToOneField(Request, on_delete=models.CASCADE, related_name='session')
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    tutor_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session #{self.id} - Request #{self.request_id} ({self.status})"


class MemorizationProgress(models.Model):
    class ProgressType(models.TextChoices):
        QURAN = 'quran', 'القرآن الكريم'
        KINDERGARTEN = 'kindergarten', 'حضانة'
        LANGUAGES = 'languages', 'لغات'

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='progress')
    progress_type = models.CharField(max_length=15, choices=ProgressType.choices, default=ProgressType.QURAN)
    juz_from = models.PositiveSmallIntegerField(null=True, blank=True)
    juz_to = models.PositiveSmallIntegerField(null=True, blank=True)
    unit_from = models.PositiveSmallIntegerField(null=True, blank=True)
    unit_to = models.PositiveSmallIntegerField(null=True, blank=True)
    cefr_from = models.CharField(max_length=3, blank=True, default='')
    cefr_to = models.CharField(max_length=3, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    tutor_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        parts = [f"Progress #{self.id} - Session #{self.session_id}"]
        if self.progress_type == 'quran' and self.juz_from:
            parts.append(f"juz {self.juz_from}->{self.juz_to}")
        elif self.progress_type == 'kindergarten' and self.unit_from:
            parts.append(f"unit {self.unit_from}->{self.unit_to}")
        elif self.progress_type == 'languages' and self.cefr_from:
            parts.append(f"{self.cefr_from}->{self.cefr_to}")
        return ' ('.join(parts) + ')'
