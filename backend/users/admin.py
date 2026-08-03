from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ContactRequest, Complaint


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'specialization', 'is_approved', 'is_banned', 'is_active']
    list_filter = ['role', 'is_active', 'is_approved', 'is_banned']
    actions = ['approve_tutors', 'reject_tutors', 'ban_users']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'specialization', 'instapay_phone', 'vodafone_cash', 'is_approved', 'is_banned')}),
    )

    @admin.action(description="اعتماد المدرسين المحددين")
    def approve_tutors(self, request, queryset):
        queryset.filter(role="tutor").update(is_approved=True)

    @admin.action(description="إلغاء اعتماد المدرسين المحددين")
    def reject_tutors(self, request, queryset):
        queryset.filter(role="tutor").update(is_approved=False)

    @admin.action(description="حظر المستخدمين المحددين")
    def ban_users(self, request, queryset):
        queryset.update(is_banned=True)


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'tutor', 'status', 'reason', 'created_at']
    list_filter = ['status']
    actions = ['mark_valid', 'mark_dismissed', 'ban_tutor']

    @admin.action(description="تأكيد الشكوى ثابتة")
    def mark_valid(self, request, queryset):
        queryset.update(status="valid")

    @admin.action(description="رفض الشكوى (غير ثابتة)")
    def mark_dismissed(self, request, queryset):
        queryset.update(status="dismissed")

    @admin.action(description="حظر المدرس المشكو منه")
    def ban_tutor(self, request, queryset):
        for c in queryset:
            c.status = "banned"
            c.tutor.is_banned = True
            c.tutor.save(update_fields=["is_banned"])
            c.save()
