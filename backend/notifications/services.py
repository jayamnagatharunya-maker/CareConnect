import json

from django.conf import settings
from django.core.mail import send_mail

import firebase_admin
from firebase_admin import credentials, messaging

from users.models import User


class NotificationService:

    @staticmethod
    def _get_firebase_app():
        try:
            return firebase_admin.get_app()
        except ValueError:
            service_account_path = getattr(settings, "FIREBASE_SERVICE_ACCOUNT_PATH", "")
            service_account_json = getattr(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", "")

            if service_account_path:
                cred = credentials.Certificate(service_account_path)
            elif service_account_json:
                cred = credentials.Certificate(json.loads(service_account_json))
            else:
                return None

            return firebase_admin.initialize_app(cred)

    @staticmethod
    def _send_fcm_notification(tokens, title, body, data=None):
        if not tokens:
            return False

        app = NotificationService._get_firebase_app()
        if app is None:
            print("FCM not configured. Skipping push delivery.")
            return False

        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
        )

        try:
            response = messaging.send_multicast(message, app=app)
            if response.failure_count:
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        print(f"FCM delivery failed for token {tokens[idx]}: {resp.exception}")
            return response.success_count > 0
        except Exception as exc:
            print("FCM Error:", exc)
            return False

    @staticmethod
    def _get_user_tokens(user):
        from users.models import DeviceToken

        return list(
            DeviceToken.objects.filter(user=user)
            .values_list("token", flat=True)
        )

    @staticmethod
    def send_push_notification(user, title, body, data=None):
        tokens = NotificationService._get_user_tokens(user)
        sent = NotificationService._send_fcm_notification(tokens, title, body, data)

        NotificationService._log_notification(
            "push",
            user,
            title,
            body,
            data,
        )

        return sent


    @staticmethod
    def send_sms(user, body):
        account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
        auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")

        # If Twilio is not configured, only log notification
        if not account_sid or not auth_token:
            NotificationService._log_notification(
                "sms",
                user,
                "",
                body,
            )
            return True

        try:
            from twilio.rest import Client

            client = Client(
                account_sid,
                auth_token,
            )

            client.messages.create(
                body=body,
                from_=getattr(
                    settings,
                    "TWILIO_FROM_NUMBER",
                    "",
                ),
                to=getattr(
                    user,
                    "phone_number",
                    "",
                ),
            )

            NotificationService._log_notification(
                "sms",
                user,
                "",
                body,
            )

            return True

        except Exception as e:
            print("SMS Error:", e)
            return False


    @staticmethod
    def send_email(user, subject, body):
        from_email = getattr(
            settings,
            "DEFAULT_FROM_EMAIL",
            "no-reply@careconnect.local",
        )

        try:
            send_mail(
                subject,
                body,
                from_email,
                [user.email],
                fail_silently=True,
            )

            NotificationService._log_notification(
                "email",
                user,
                subject,
                body,
            )

            return True

        except Exception as e:
            print("Email Error:", e)
            return False


    @staticmethod
    def _log_notification(channel, user, title, body, data=None):
        from notifications.models import Notification

        Notification.objects.create(
            recipient=user,
            channel=channel,
            title=title or "",
            body=body or "",
            data=data or {},
        )


    @staticmethod
    def _send_sms_to_contact(phone_number, body):
        if not phone_number:
            return False

        account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
        auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")

        if not account_sid or not auth_token:
            print("SMS to contact logged:", phone_number, body)
            return True

        try:
            from twilio.rest import Client

            client = Client(account_sid, auth_token)
            client.messages.create(
                body=body,
                from_=getattr(settings, "TWILIO_FROM_NUMBER", ""),
                to=phone_number,
            )
            return True
        except Exception as e:
            print("SMS Contact Error:", e)
            return False

    @staticmethod
    def _send_email_to_contact(email, subject, body):
        if not email:
            return False

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@careconnect.local")

        try:
            send_mail(subject, body, from_email, [email], fail_silently=True)
            return True
        except Exception as e:
            print("Email Contact Error:", e)
            return False

    @staticmethod
    def notify_primary_guardians_about_sos(sos):
        from sos.models import SOS

        if not isinstance(sos, SOS):
            sos = SOS.objects.select_related("resident", "category").get(pk=sos)

        guardians = sos.resident.guardians.filter(is_primary=True, is_verified=True)
        if not guardians.exists():
            guardians = sos.resident.guardians.filter(is_verified=True)

        if not guardians.exists():
            return

        subject = (
            f"Emergency SOS Alert - "
            f"{sos.category.name if sos.category else 'General'}"
        )
        body = (
            f"SOS triggered by {sos.resident.email}.\n"
            f"Message: {sos.message or 'No additional message'}\n"
            f"Location: {sos.latitude}, {sos.longitude}"
        )

        for guardian in guardians:
            NotificationService._send_sms_to_contact(guardian.phone_number, body)
            NotificationService._send_email_to_contact(guardian.email, subject, body)

    @staticmethod
    def notify_secondary_guardians_about_sos(sos):
        from sos.models import SOS

        if not isinstance(sos, SOS):
            sos = SOS.objects.select_related("resident", "category").get(pk=sos)

        secondary_guardians = sos.resident.guardians.filter(is_primary=False, is_verified=True)
        if not secondary_guardians.exists():
            return

        subject = (
            f"SOS Escalation Alert - "
            f"{sos.category.name if sos.category else 'General'}"
        )
        body = (
            f"Escalation alert for {sos.resident.email}.\n"
            f"Message: {sos.message or 'No additional message'}\n"
            f"Location: {sos.latitude}, {sos.longitude}"
        )

        for guardian in secondary_guardians:
            NotificationService._send_sms_to_contact(guardian.phone_number, body)
            NotificationService._send_email_to_contact(guardian.email, subject, body)

    @staticmethod
    def notify_emergency_contacts_about_sos(sos):
        from sos.models import SOS

        if not isinstance(sos, SOS):
            sos = SOS.objects.select_related("resident", "category").get(pk=sos)

        emergency_contacts = sos.resident.emergency_contacts.filter(is_active=True)
        if not emergency_contacts.exists():
            return

        subject = (
            f"Emergency Contact Alert - "
            f"{sos.category.name if sos.category else 'General'}"
        )
        body = (
            f"Emergency contact alert for {sos.resident.email}.\n"
            f"Message: {sos.message or 'No additional message'}\n"
            f"Location: {sos.latitude}, {sos.longitude}"
        )

        for contact in emergency_contacts:
            NotificationService._send_sms_to_contact(contact.phone_number, body)
            NotificationService._send_email_to_contact(contact.email, subject, body)

    @staticmethod
    def notify_security_and_volunteers_about_sos(sos):
        from sos.models import SOS
        from users.models import User

        if not isinstance(sos, SOS):
            sos = SOS.objects.select_related("resident", "category").get(pk=sos)

        security_users = User.objects.filter(role="security", is_verified=True)
        volunteer_users = User.objects.filter(role="volunteer", is_verified=True)
        recipients = list(security_users) + list(volunteer_users)
        if not recipients:
            return

        subject = (
            f"SOS Escalated - "
            f"{sos.category.name if sos.category else 'General'}"
        )
        body = (
            f"SOS escalation for {sos.resident.email}.\n"
            f"Message: {sos.message or 'No additional message'}\n"
            f"Location: {sos.latitude}, {sos.longitude}"
        )
        data = {
            "sos_id": sos.id,
            "type": "sos_escalation",
        }

        for recipient in recipients:
            NotificationService.send_push_notification(recipient, subject, body, data)
            NotificationService.send_sms(recipient, body)
            NotificationService.send_email(recipient, subject, body)

    @staticmethod
    def notify_guardians_about_sos(sos):
        return NotificationService.notify_primary_guardians_about_sos(sos)
