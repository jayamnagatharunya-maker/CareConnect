from rest_framework import serializers
from .models import Notification, NotificationTemplate


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "recipient", "channel", "title", "body", "data", "is_read", "status", "sent_at", "read_at")
        read_only_fields = ("id", "sent_at", "read_at")


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = ("id", "name", "channel", "subject", "body_template", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
