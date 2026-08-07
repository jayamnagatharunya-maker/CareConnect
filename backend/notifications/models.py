from django.db import models
from users.models import User


class Notification(models.Model):
    CHANNEL_CHOICES = (
        ("push", "Push"),
        ("sms", "SMS"),
        ("email", "Email"),
        ("in_app", "In-App"),
    )

    STATUS_CHOICES = (
        ("queued", "Queued"),
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("failed", "Failed"),
    )

    recipient = models.ForeignKey(User, related_name="notifications", on_delete=models.CASCADE)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} -> {self.recipient.email}"


class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    channel = models.CharField(max_length=20, choices=Notification.CHANNEL_CHOICES)
    subject = models.CharField(max_length=255, blank=True)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
