from django.contrib.auth.models import AbstractUser
from django.db import models


EDUCATION_LEVELS = (
    ('quran', 'القرآن الكريم'),
    ('university', 'جامعي'),
    ('high_school', 'ثانوي'),
    ('middle_school', 'إعدادي'),
    ('primary', 'ابتدائي'),
    ('kindergarten', 'حضانة'),
    ('languages', 'لغات'),
)


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        TUTOR = 'tutor', 'Tutor'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    specialization = models.CharField(max_length=255, blank=True, default='')
    instapay_phone = models.CharField(max_length=20, blank=True, default='')
    vodafone_cash = models.CharField(max_length=20, blank=True, default='')
    is_approved = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    profile_picture_url = models.URLField(blank=True, default='')
    bio = models.TextField(blank=True, default='')
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    education = models.TextField(blank=True, default='')
    certificates = models.TextField(blank=True, default='')
    is_available = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    teaching_level = models.CharField(max_length=15, choices=EDUCATION_LEVELS, null=True, blank=True)
    languages = models.JSONField(null=True, blank=True)
    student_levels = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class Complaint(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'قيد المراجعة'
        VALID = 'valid', 'ثابت'
        DISMISSED = 'dismissed', 'غير ثابت'
        BANNED = 'banned', 'تم الحظر'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints_made')
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints_received')
    session = models.ForeignKey('offers.Session', on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    admin_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Complaint #{self.id} - Student #{self.student_id} -> Tutor #{self.tutor_id} ({self.status})"


class ContactRequest(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    company_name = models.CharField(max_length=255, blank=True, default="")
    employee_count = models.PositiveIntegerField(null=True, blank=True)
    question = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contact request from {self.first_name} {self.last_name} ({self.email})"

