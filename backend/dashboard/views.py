from datetime import timedelta

from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin
from notifications.models import Notification
from sos.models import SOS


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=6)

        category_counts = (
            SOS.objects.values(name=F("category__name"))
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        daily_counts = (
            SOS.objects.filter(created_at__date__gte=week_ago)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        average_response = (
    SOS.objects.filter(status="resolved")
    .annotate(
        response_time=ExpressionWrapper(
            F("updated_at") - F("created_at"),
            output_field=DurationField(),
        )
    )
    .aggregate(avg_response_time=Avg("response_time"))
)

        resolved_today = SOS.objects.filter(
            status="resolved",
            updated_at__date=today,
        ).count()

        escalated_count = (
            SOS.objects.filter(
                escalation_logs__isnull=False
            )
            .distinct()
            .count()
        )

        volunteer_responding = SOS.objects.filter(
            status="acknowledged"
        ).count()

        pending_guardian = SOS.objects.filter(
            status="pending"
        ).count()

        active_sos = SOS.objects.filter(
            status__in=["pending", "acknowledged"]
        ).count()

        return Response({
            "total_sos": SOS.objects.count(),

            "active_sos": active_sos,

            "pending_sos": pending_guardian,

            "acknowledged_sos": SOS.objects.filter(
                status="acknowledged"
            ).count(),

            "resolved_sos": SOS.objects.filter(
                status="resolved"
            ).count(),

            "cancelled_sos": SOS.objects.filter(
                status="cancelled"
            ).count(),

            "resolved_today": resolved_today,

            "escalated": escalated_count,

            "volunteers_responding": volunteer_responding,

            "pending_guardian": pending_guardian,

            "total_notifications": Notification.objects.count(),

            "unread_notifications": Notification.objects.filter(
                is_read=False
            ).count(),

            "category_counts": [
                {
                    "category": item["name"] or "Uncategorized",
                    "count": item["count"],
                }
                for item in category_counts
            ],

            "daily_counts": [
                {
                    "day": entry["day"].strftime("%Y-%m-%d"),
                    "count": entry["count"],
                }
                for entry in daily_counts
            ],

            "average_response_time_minutes": (
                average_response["avg_response_time"].total_seconds() / 60
                if average_response["avg_response_time"]
                else None
            ),
        })