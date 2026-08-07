from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmergencyContact, Guardian
from .serializers import EmergencyContactSerializer, GuardianSerializer


class GuardianListCreateView(generics.ListCreateAPIView):
    serializer_class = GuardianSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Guardian.objects.none()
        return Guardian.objects.filter(resident=self.request.user)

    def perform_create(self, serializer):
        serializer.save(resident=self.request.user)


class GuardianDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GuardianSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Guardian.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Guardian.objects.none()
        return Guardian.objects.filter(resident=self.request.user)


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return EmergencyContact.objects.none()

        if self.request.user.role == "admin":
            return EmergencyContact.objects.all()

        return EmergencyContact.objects.filter(resident=self.request.user)

    def perform_create(self, serializer):
        serializer.save(resident=self.request.user)


class EmergencyContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = EmergencyContact.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return EmergencyContact.objects.none()

        if self.request.user.role == "admin":
            return EmergencyContact.objects.all()

        return EmergencyContact.objects.filter(resident=self.request.user)


class VerifyContactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        contact = EmergencyContact.objects.get(pk=pk, resident=request.user)
        contact.verification_status = "verified"
        contact.save(update_fields=["verification_status"])
        return Response(
            {
                "detail": "Contact verified",
                "contact": EmergencyContactSerializer(contact).data,
            },
            status=status.HTTP_200_OK,
        )


class RejectContactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        contact = EmergencyContact.objects.get(pk=pk, resident=request.user)
        contact.verification_status = "rejected"
        contact.save(update_fields=["verification_status"])
        return Response(
            {
                "detail": "Contact rejected",
                "contact": EmergencyContactSerializer(contact).data,
            },
            status=status.HTTP_200_OK,
        )