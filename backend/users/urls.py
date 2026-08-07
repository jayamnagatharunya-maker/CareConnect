from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    DeviceTokenView,
    LogoutView,
    MeView,
    RegisterView,
    ResidentApprovalActionView,
    ResidentApprovalListView,
    ResidentDirectoryView,
    ResidentProfileView,
    SecurityProfileView,
    VolunteerProfileView,
)
from .otp_views import SendOTPView, VerifyOTPView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("device-token/", DeviceTokenView.as_view(), name="device-token"),
    path("profile/resident/", ResidentProfileView.as_view(), name="resident-profile"),
    path("profile/volunteer/", VolunteerProfileView.as_view(), name="volunteer-profile"),
    path("profile/security/", SecurityProfileView.as_view(), name="security-profile"),
    path("residents/pending/", ResidentApprovalListView.as_view(), name="resident-pending"),
    path("residents/<int:pk>/approve/", ResidentApprovalActionView.as_view(), name="resident-approve"),
    path("residents/directory/", ResidentDirectoryView.as_view(), name="resident-directory"),
    path("otp/send/", SendOTPView.as_view(), name="otp-send"),
    path("otp/verify/", VerifyOTPView.as_view(), name="otp-verify"),
]