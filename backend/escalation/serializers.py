from rest_framework import serializers
from .models import EscalationLog, ResponseTimeConfig


class ResponseTimeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseTimeConfig
        fields = ("id", "role", "response_window_minutes", "auto_escalate", "is_active")
        read_only_fields = ("id",)


class EscalationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscalationLog
        fields = ("id", "sos", "from_role", "to_role", "reason", "triggered_at")
        read_only_fields = ("id", "triggered_at")
        ref_name = "EscalationLogEscalation"
