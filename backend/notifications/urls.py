from django.urls import path
from .views import NotificationAnalyticsView, NotificationListView, NotificationMarkReadView, NotificationTemplateDetailView, NotificationTemplateListView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("analytics/", NotificationAnalyticsView.as_view(), name="notification-analytics"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("templates/", NotificationTemplateListView.as_view(), name="notification-template-list"),
    path("templates/<int:pk>/", NotificationTemplateDetailView.as_view(), name="notification-template-detail"),
]
