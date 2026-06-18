from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_file, name="file-upload"),
    path("structured-request/", views.structured_request, name="structured-request"),
    path("", views.list_files, name="file-list"),
]
