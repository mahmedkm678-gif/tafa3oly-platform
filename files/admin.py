from django.contrib import admin
from .models import File


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = [
        "id", "student", "specialization", "difficulty", "subject_type",
        "session_type", "base_price", "currency", "status", "created_at",
    ]
    list_filter = ["status", "difficulty", "subject_type", "session_type"]
