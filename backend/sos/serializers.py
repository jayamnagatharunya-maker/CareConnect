from rest_framework import serializers
from users.serializers import UserSerializer
from .models import EmergencyCategory, IncidentUpdate, SOS


class EmergencyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyCategory
        fields = ("id", "name", "description", "icon", "is_active")
        read_only_fields = ("id",)


class IncidentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentUpdate
        fields = ("id", "sos", "message", "updated_by", "created_at")
        read_only_fields = ("id", "created_at", "updated_by")


class SOSSerializer(serializers.ModelSerializer):
    resident = UserSerializer(read_only=True)
    category = EmergencyCategorySerializer(read_only=True)
    updates = IncidentUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = SOS
        fields = (
            "id",
            "resident",
            "category",
            "message",
            "latitude",
            "longitude",
            "address",
            "status",
            "updates",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "resident",
        )


class SOSCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOS
        fields = ("category", "message", "latitude", "longitude", "address")


class IncidentUpdateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentUpdate
        fields = ("sos", "message")