from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ("resident", "Resident"),
        ("guardian", "Guardian"),
        ("volunteer", "Volunteer"),
        ("security", "Security"),
        ("admin", "Admin"),
    )

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role"]

    def __str__(self):
        return f"{self.email} ({self.role})"


class DeviceToken(models.Model):
    user = models.ForeignKey(
        User,
        related_name="device_tokens",
        on_delete=models.CASCADE,
    )
    token = models.TextField(unique=True)
    platform = models.CharField(max_length=20, blank=True, default="unknown")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.platform}"


class ResidentProfile(models.Model):
    APPROVAL_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(User, related_name="resident_profile", on_delete=models.CASCADE)
    flat = models.ForeignKey("society.Flat", related_name="residents", on_delete=models.SET_NULL, null=True, blank=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default="pending")
    approved_by = models.ForeignKey(User, related_name="approved_residents", on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    emergency_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.flat} ({self.approval_status})"


class SecurityProfile(models.Model):
    user = models.OneToOneField(User, related_name="security_profile", on_delete=models.CASCADE)
    badge_number = models.CharField(max_length=50, blank=True)
    shift_start = models.TimeField(null=True, blank=True)
    shift_end = models.TimeField(null=True, blank=True)
    duty_days = models.CharField(max_length=100, blank=True)
    is_onduty = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Security"


class VolunteerProfile(models.Model):
    user = models.OneToOneField(User, related_name="volunteer_profile", on_delete=models.CASCADE)
    skills = models.TextField(blank=True)
    availability_hours = models.CharField(max_length=100, blank=True)
    is_available = models.BooleanField(default=True)
    assigned_zone = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Volunteer"


class OTP(models.Model):
    user = models.ForeignKey(User, related_name="otps", on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"
