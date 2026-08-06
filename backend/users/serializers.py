from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import DeviceToken, ResidentProfile, SecurityProfile, VolunteerProfile, User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["email"] = self.user.email
        data["user_id"] = self.user.id
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    flat = serializers.IntegerField(required=False, allow_null=True)

    badge_number = serializers.CharField(required=False, allow_blank=True)
    shift_start = serializers.TimeField(required=False, allow_null=True)
    shift_end = serializers.TimeField(required=False, allow_null=True)
    duty_days = serializers.CharField(required=False, allow_blank=True)

    skills = serializers.CharField(required=False, allow_blank=True)
    availability_hours = serializers.CharField(required=False, allow_blank=True)
    is_available = serializers.BooleanField(required=False, default=True)
    assigned_zone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "password", "password2", "role", "phone_number",
                  "flat",
                  "badge_number", "shift_start", "shift_end", "duty_days",
                  "skills", "availability_hours", "is_available", "assigned_zone")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        role = attrs.get("role")
        if role == "resident" and not attrs.get("flat"):
            raise serializers.ValidationError(
                {"flat": "Flat is required for residents."}
            )
        return attrs

    def create(self, validated_data):
        print("STEP A: create() called")

        validated_data.pop("password2")
        password = validated_data.pop("password")

        flat_id = validated_data.pop("flat", None)
        badge_number = validated_data.pop("badge_number", "")
        shift_start = validated_data.pop("shift_start", None)
        shift_end = validated_data.pop("shift_end", None)
        duty_days = validated_data.pop("duty_days", "")
        skills = validated_data.pop("skills", "")
        availability_hours = validated_data.pop("availability_hours", "")
        is_available = validated_data.pop("is_available", True)
        assigned_zone = validated_data.pop("assigned_zone", "")

        print("STEP B:", validated_data)

        user = User(**validated_data)

        print("STEP C: User object created")

        user.set_password(password)

        print("STEP D: Password hashed")

        user.save()

        print("STEP E: User saved")

        if user.role == "resident":
            flat = None
            if flat_id:
                from society.models import Flat
                try:
                    flat = Flat.objects.get(pk=flat_id)
                except Flat.DoesNotExist:
                    flat = None
            ResidentProfile.objects.create(user=user, flat=flat)
        elif user.role == "security":
            SecurityProfile.objects.create(
                user=user,
                badge_number=badge_number,
                shift_start=shift_start,
                shift_end=shift_end,
                duty_days=duty_days,
            )
        elif user.role == "volunteer":
            VolunteerProfile.objects.create(
                user=user,
                skills=skills,
                availability_hours=availability_hours,
                is_available=is_available,
                assigned_zone=assigned_zone,
            )

        return user


class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ("token", "platform")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "role", "phone_number", "is_verified", "created_at")
        read_only_fields = ("id", "email", "role", "created_at")


class ResidentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ResidentProfile
        fields = ("id", "user", "flat", "approval_status", "approved_by", "approved_at", "rejection_reason", "emergency_notes", "created_at")
        read_only_fields = ("id", "created_at", "user", "approved_by", "approved_at")


class SecurityProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SecurityProfile
        fields = ("id", "user", "badge_number", "shift_start", "shift_end", "duty_days", "is_onduty", "created_at")
        read_only_fields = ("id", "created_at", "user")


class VolunteerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = ("id", "user", "skills", "availability_hours", "is_available", "assigned_zone", "created_at")
        read_only_fields = ("id", "created_at", "user")
