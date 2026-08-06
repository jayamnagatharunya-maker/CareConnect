from celery import shared_task

from escalation.models import EscalationLog
from notifications.services import NotificationService
from sos.models import SOS


@shared_task
def auto_escalate_sos(sos_id):
    try:
        sos = SOS.objects.get(pk=sos_id)
    except SOS.DoesNotExist:
        return

    if sos.status.lower() in {"resolved", "cancelled", "acknowledged"}:
        return

    primary_guards = sos.resident.guardians.filter(is_primary=True, is_verified=True)
    if primary_guards.exists():
        from_role = "guardian"
        to_role = "secondary_guardian"
        NotificationService.notify_secondary_guardians_about_sos(sos)
        NotificationService.notify_emergency_contacts_about_sos(sos)
    else:
        from_role = "guardian"
        to_role = "emergency_contact"
        NotificationService.notify_emergency_contacts_about_sos(sos)

    NotificationService.notify_security_and_volunteers_about_sos(sos)

    EscalationLog.objects.create(
        sos=sos,
        from_role=from_role,
        to_role=to_role,
        reason="No response from guardian within response window",
    )