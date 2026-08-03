from django.contrib import admin
from .models import Request, Session, MemorizationProgress, Review


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'file', 'tutor', 'tutor_price', 'status', 'created_at']
    list_filter = ['status']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'request', 'platform_fee', 'tutor_amount', 'is_trial', 'status', 'created_at']
    list_filter = ['status', 'is_trial']


@admin.register(MemorizationProgress)
class MemorizationProgressAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'progress_type', 'created_at']
    list_filter = ['progress_type']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'student', 'tutor', 'rating', 'created_at']
    list_filter = ['rating']
