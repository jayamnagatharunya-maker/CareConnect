from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin, IsResident

from .models import Notification, NotificationTemplate
from .serializers import NotificationSerializer, NotificationTemplateSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by("-sent_at")


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        print("===== MARK READ =====")
        print("PK:", pk)
        print("USER:", request.user)

        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            print("FOUND:", notification.id)

            notification.is_read = True

            from django.utils import timezone
            notification.read_at = timezone.now()

            notification.save()

            print("SUCCESS")

            return Response(
                NotificationSerializer(notification).data,
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print("ERROR:", e)
            raise


class NotificationTemplateListView(generics.ListCreateAPIView):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
