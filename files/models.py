from django.db import models
from users.models import User


class EducationLevel(models.TextChoices):
    QURAN = 'quran', 'القرآن الكريم'
    UNIVERSITY = 'university', 'جامعي'
    HIGH_SCHOOL = 'high_school', 'ثانوي'
    MIDDLE_SCHOOL = 'middle_school', 'إعدادي'
    PRIMARY = 'primary', 'ابتدائي'
    KINDERGARTEN = 'kindergarten', 'حضانة'
    LANGUAGES = 'languages', 'لغات'


class Language(models.TextChoices):
    ENGLISH = 'english', 'الإنجليزية'
    FRENCH = 'french', 'الفرنسية'
    GERMAN = 'german', 'الألمانية'
    SPANISH = 'spanish', 'الإسبانية'
    ITALIAN = 'italian', 'الإيطالية'
    TURKISH = 'turkish', 'التركية'
    CHINESE = 'chinese', 'الصينية'
    RUSSIAN = 'russian', 'الروسية'


class File(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        MATCHED = 'matched', 'Matched'
        DONE = 'done', 'Done'

    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    class SubjectType(models.TextChoices):
        MATH = 'math', 'Math'
        ENGLISH = 'english', 'English'
        SCIENCE = 'science', 'Science'
        QURAN = 'quran', 'القرآن الكريم'
        OTHER = 'other', 'Other'

    class SessionType(models.TextChoices):
        SOLO = 'solo', 'Solo'
        GROUP = 'group', 'Group'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField(max_length=500, blank=True, default='')
    specialization = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    subject_type = models.CharField(max_length=10, choices=SubjectType.choices)
    education_level = models.CharField(max_length=15, choices=EducationLevel.choices, default=EducationLevel.UNIVERSITY)
    language = models.CharField(max_length=10, choices=Language.choices, null=True, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    session_type = models.CharField(max_length=5, choices=SessionType.choices, default=SessionType.SOLO)
    max_students = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    current_juz = models.PositiveSmallIntegerField(null=True, blank=True)
    start_juz = models.PositiveSmallIntegerField(null=True, blank=True)
    end_juz = models.PositiveSmallIntegerField(null=True, blank=True)
    current_unit = models.PositiveSmallIntegerField(null=True, blank=True)
    start_unit = models.PositiveSmallIntegerField(null=True, blank=True)
    current_cefr = models.CharField(max_length=3, blank=True, default='')
    start_cefr = models.CharField(max_length=3, blank=True, default='')
    sessions_per_week = models.PositiveSmallIntegerField(null=True, blank=True, default=1)
    session_duration = models.PositiveSmallIntegerField(null=True, blank=True, default=45)
    start_date = models.DateField(null=True, blank=True)
    weekly_availability = models.JSONField(null=True, blank=True)
    quran_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File #{self.id} - {self.student.username} ({self.get_education_level_display()})"
