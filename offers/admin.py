from django.contrib import admin
from .models import Request, Session


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'file', 'tutor', 'tutor_price', 'status', 'created_at']
    list_filter = ['status']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'request', 'platform_fee', 'tutor_amount', 'status', 'created_at']
    list_filter = ['status']
