import random
import string
from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import OTP, User
from .serializers import UserSerializer


def generate_otp_code(length=6):
    return "".join(random.choices(string.digits, k=length))


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        purpose = request.data.get("purpose", "verification")

        if not email:
            return Response(
                {"detail": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        OTP.objects.filter(user=user, purpose=purpose, is_used=False).update(
            is_used=True
        )

        code = generate_otp_code()
        expires_at = timezone.now() + timedelta(minutes=10)

        OTP.objects.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
        )

        from notifications.services import NotificationService
        NotificationService.send_email(
            user,
            f"Your OTP for {purpose}",
            f"Your OTP is {code}. It expires in 10 minutes.",
        )

        return Response(
            {"detail": "OTP sent successfully"},
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        purpose = request.data.get("purpose", "verification")

        if not email or not code:
            return Response(
                {"detail": "Email and code are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        otp = OTP.objects.filter(
            user=user,
            code=code,
            purpose=purpose,
            is_used=False,
            expires_at__gt=timezone.now(),
        ).first()

        if not otp:
            return Response(
                {"detail": "Invalid or expired OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        if purpose == "verification":
            user.is_verified = True
            user.save(update_fields=["is_verified"])

        return Response(
            {
                "detail": "OTP verified successfully",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
