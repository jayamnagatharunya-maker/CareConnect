from datetime import timedelta

from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin

from .models import Notification, NotificationTemplate
from .serializers import NotificationSerializer, NotificationTemplateSerializer


class NotificationAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        today = timezone.now().date()

        sent = Notification.objects.count()
        delivered = Notification.objects.filter(status="delivered").count()
        failed = Notification.objects.filter(status="failed").count()

        delivery_rate = (delivered / sent * 100) if sent > 0 else 0

        avg_response_seconds = (
            Notification.objects.filter(
                channel__in=["push", "sms", "email"],
                sent_at__isnull=False,
            )
            .exclude(sent_at=F("read_at"))
            .aggregate(
                avg_time=Avg(
                    ExpressionWrapper(
                        F("read_at") - F("sent_at"),
                        output_field=DurationField(),
                    )
                )
            )["avg_time"]
        )

        return Response(
            {
                "sent": sent,
                "delivered": delivered,
                "failed": failed,
                "delivery_rate": round(delivery_rate, 2),
                "average_response_time_seconds": (
                    avg_response_seconds.total_seconds() if avg_response_seconds else None
                ),
            }
        )


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
