from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin, IsSecurity

from .models import EscalationLog, ResponseTimeConfig
from .serializers import EscalationLogSerializer, ResponseTimeConfigSerializer


class ResponseTimeConfigListView(generics.ListCreateAPIView):
    queryset = ResponseTimeConfig.objects.all()
    serializer_class = ResponseTimeConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class ResponseTimeConfigDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ResponseTimeConfig.objects.all()
    serializer_class = ResponseTimeConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class EscalationLogListView(generics.ListAPIView):
    serializer_class = EscalationLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return EscalationLog.objects.all().order_by("-triggered_at")


class EscalationTriggerView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, sos_id, *args, **kwargs):
        sos_id = int(sos_id)
        from_role = request.data.get("from_role", "guardian")
        to_role = request.data.get("to_role", "security")
        reason = request.data.get("reason", "Auto-escalation due to no response")
        from sos.models import SOS
        from users.models import User
        try:
            sos = SOS.objects.get(pk=sos_id)
        except SOS.DoesNotExist:
            return Response({"detail": "SOS not found"}, status=404)
        log = EscalationLog.objects.create(sos=sos, from_role=from_role, to_role=to_role, reason=reason, triggered_by=request.user)
        return Response(EscalationLogSerializer(log).data, status=201)
