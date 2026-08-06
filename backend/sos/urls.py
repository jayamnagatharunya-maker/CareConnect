from django.urls import path
from .views import (
    CommunityBroadcastView,
    EmergencyCategoryListView,
    IncidentUpdateCreateView,
    SOSDetailView,
    SOSGuardianResponseView,
    SOSListCreateView,
    SosStatusUpdateView,
    VolunteerAvailabilityView,
)

urlpatterns = [
    path("categories/", EmergencyCategoryListView.as_view(), name="sos-categories"),
    path("", SOSListCreateView.as_view(), name="sos-list-create"),
    path("<int:pk>/", SOSDetailView.as_view(), name="sos-detail"),
    path("<int:pk>/status/", SosStatusUpdateView.as_view(), name="sos-status-update"),
    path("<int:pk>/guardian-response/", SOSGuardianResponseView.as_view(), name="sos-guardian-response"),
    path("updates/", IncidentUpdateCreateView.as_view(), name="incident-update-create"),
    path("broadcast/", CommunityBroadcastView.as_view(), name="sos-broadcast"),
    path("volunteer/availability/", VolunteerAvailabilityView.as_view(), name="volunteer-availability"),
]
