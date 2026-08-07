from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from config.permissions import IsAdmin, IsResident, IsAdminOrResident

from .models import ResidentProfile, User
from .serializers import (
    RegisterSerializer,
    ResidentProfileSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)




class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer




class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print("STEP 1: Request received")
        print("DATA:", request.data)

        response = super().create(request, *args, **kwargs)

        print("STEP 2: Response created")
        print("STATUS:", response.status_code)

        return response


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class DeviceTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    class DeviceTokenSerializer(serializers.Serializer):
        token = serializers.CharField()
        platform = serializers.CharField(required=False, default="unknown")

    def post(self, request):
        serializer = self.DeviceTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        platform = serializer.validated_data.get("platform", "unknown")

        from .models import DeviceToken

        device_token, created = DeviceToken.objects.update_or_create(
            token=token,
            defaults={
                "user": request.user,
                "platform": platform,
            },
        )

        return Response(
            {
                "token": device_token.token,
                "platform": device_token.platform,
                "created": created,
            },
            status=status.HTTP_201_CREATED,
        )


class ResidentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ResidentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        print("USER:", self.request.user)
        profile, created = ResidentProfile.objects.get_or_create(
            user=self.request.user
        )
        print("PROFILE ID:", profile.id)
        return profile

    def update(self, request, *args, **kwargs):
        print("========== PROFILE UPDATE ==========")
        print("USER:", request.user)
        print("DATA:", request.data)
        print("AUTH:", request.headers.get("Authorization"))
        print("====================================")

        return super().update(request, *args, **kwargs)


class VolunteerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = VolunteerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class SecurityProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SecurityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = SecurityProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class ResidentApprovalListView(generics.ListAPIView):
    serializer_class = ResidentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return ResidentProfile.objects.filter(approval_status="pending")


class ResidentApprovalActionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        action = request.data.get("action")
        if action not in ("approve", "reject"):
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = ResidentProfile.objects.get(pk=pk)
        except ResidentProfile.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        profile.approval_status = "approved" if action == "approve" else "rejected"
        profile.approved_by = request.user
        from django.utils import timezone
        profile.approved_at = timezone.now()
        profile.rejection_reason = request.data.get("reason", "")
        profile.save(update_fields=["approval_status", "approved_by", "approved_at", "rejection_reason"])
        return Response(ResidentProfileSerializer(profile).data, status=status.HTTP_200_OK)


class ResidentDirectoryView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = User.objects.filter(role="resident")
        society_id = self.request.query_params.get("society_id")
        if society_id:
            queryset = queryset.filter(resident_profile__flat__block__society_id=society_id, resident_profile__approval_status="approved")
        return queryset
