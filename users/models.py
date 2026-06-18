from django.contrib.auth.models import AbstractUser
from django.db import models


EDUCATION_LEVELS = (
    ('quran', 'القرآن الكريم'),
    ('university', 'جامعي'),
    ('high_school', 'ثانوي'),
    ('middle_school', 'إعدادي'),
    ('primary', 'ابتدائي'),
    ('kindergarten', 'حضانة'),
    ('language', 'لغات'),
)


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        TUTOR = 'tutor', 'Tutor'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    specialization = models.CharField(max_length=255, blank=True, default='')
    paypal_email = models.EmailField(blank=True, default='')
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
