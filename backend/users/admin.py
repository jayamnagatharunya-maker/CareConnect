from django.contrib import admin
from .models import DeviceToken, ResidentProfile, User


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "platform", "token", "created_at")
    search_fields = ("user__email", "token", "platform")


@admin.register(ResidentProfile)
class ResidentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "flat", "approval_status", "approved_by", "approved_at")
    list_filter = ("approval_status",)
    search_fields = ("user__email",)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "phone_number", "is_verified", "is_staff", "created_at")
    list_filter = ("role", "is_verified", "is_staff")
    search_fields = ("email", "phone_number")
