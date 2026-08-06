from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin, IsResident, IsSecurity, IsVolunteer

from .utils import get_address
from .models import EmergencyCategory, IncidentUpdate, SOS
from .serializers import (
    EmergencyCategorySerializer,
    IncidentUpdateCreateSerializer,
    IncidentUpdateSerializer,
    SOSCreateSerializer,
    SOSSerializer,
)


class EmergencyCategoryListView(generics.ListAPIView):
    queryset = EmergencyCategory.objects.filter(is_active=True)
    serializer_class = EmergencyCategorySerializer
    permission_classes = [permissions.AllowAny]


class SOSListCreateView(generics.ListCreateAPIView):
    serializer_class = SOSSerializer
    permission_classes = [permissions.IsAuthenticated, IsResident]

    def get_queryset(self):
        user = self.request.user
        sos_status = self.request.query_params.get("status")

        if user.role == "resident":
            queryset = SOS.objects.filter(resident=user)
        elif user.role == "admin":
            queryset = SOS.objects.all()
        else:
            queryset = SOS.objects.filter(status="pending")

        if sos_status:
            queryset = queryset.filter(status=sos_status)

        return queryset

    def perform_create(self, serializer):
        latitude = serializer.validated_data.get("latitude")
        longitude = serializer.validated_data.get("longitude")

        address = ""

        if latitude is not None and longitude is not None:
            address = get_address(latitude, longitude)

        sos = serializer.save(
            resident=self.request.user,
            address=address,
        )

        from escalation.models import ResponseTimeConfig
        from escalation.tasks import auto_escalate_sos
        from notifications.services import NotificationService

        try:
            NotificationService.notify_primary_guardians_about_sos(sos)
        except Exception as exc:
            print("SOS notification dispatch failed:", exc)

        response_config = (
            ResponseTimeConfig.objects.filter(role="guardian", is_active=True, auto_escalate=True)
            .order_by("response_window_minutes")
            .first()
        )

        if response_config:
            countdown_seconds = response_config.response_window_minutes * 60
            try:
                auto_escalate_sos.apply_async((sos.id,), countdown=countdown_seconds)
            except Exception as exc:
                print("Failed to schedule auto-escalation task:", exc)

        return sos

    def create(self, request, *args, **kwargs):
        print("========== CREATE METHOD CALLED ==========")

        serializer = SOSCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sos = self.perform_create(serializer)

        return Response(
            SOSSerializer(sos).data,
            status=status.HTTP_201_CREATED,
        )


class SOSDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SOS.objects.all()
    serializer_class = SOSSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class IncidentUpdateCreateView(generics.CreateAPIView):
    serializer_class = IncidentUpdateCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)


class SosStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        print("===== STATUS UPDATE CALLED =====")
        print(request.data)

        sos = SOS.objects.get(pk=pk)

        new_status = request.data.get("status")

        if new_status not in dict(SOS.STATUS_CHOICES):
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sos.status = new_status
        sos.save()

        return Response(
            SOSSerializer(sos).data,
            status=status.HTTP_200_OK,
        )


class SOSGuardianResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        if request.user.role != "guardian":
            return Response(
                {"detail": "Only guardian users can acknowledge SOS alerts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            sos = SOS.objects.get(pk=pk)
        except SOS.DoesNotExist:
            return Response(
                {"detail": "SOS not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if sos.status in {"resolved", "cancelled", "acknowledged"}:
            return Response(
                {"detail": "SOS cannot be acknowledged in its current state."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sos.status = "acknowledged"
        sos.save()

        from escalation.models import EscalationLog

        EscalationLog.objects.create(
            sos=sos,
            from_role="guardian",
            to_role="guardian",
            reason="Guardian acknowledged the SOS alert.",
            triggered_by=request.user,
        )

        return Response(
            SOSSerializer(sos).data,
            status=status.HTTP_200_OK,
        )


class CommunityBroadcastView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        sos_id = request.data.get("sos_id")
        radius_km = request.data.get("radius_km", 5)

        from sos.models import SOS
        from users.models import User

        try:
            sos = SOS.objects.get(pk=sos_id)

        except SOS.DoesNotExist:
            return Response(
                {"detail": "SOS not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        volunteers = User.objects.filter(
            role="volunteer",
            is_verified=True,
        )

        security = User.objects.filter(
            role="security",
            is_verified=True,
        )

        recipients = list(volunteers) + list(security)

        notified = 0

        for recipient in recipients:
            try:
                from notifications.services import NotificationService

                NotificationService.send_push_notification(
                    recipient,
                    "Community Broadcast SOS",
                    f"SOS from {sos.resident.email} within {radius_km}km",
                )

                notified += 1

            except Exception:
                pass

        return Response(
            {
                "notified": notified,
                "recipients": len(recipients),
            },
            status=status.HTTP_200_OK,
        )


class VolunteerAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.role != "volunteer":
            return Response(
                {"detail": "Only volunteers can access this"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "user_id": user.id,
                "available": True,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.role != "volunteer":
            return Response(
                {"detail": "Only volunteers can access this"},
                status=status.HTTP_403_FORBIDDEN,
            )

        available = request.data.get("available", True)

        return Response(
            {
                "user_id": user.id,
                "available": available,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )