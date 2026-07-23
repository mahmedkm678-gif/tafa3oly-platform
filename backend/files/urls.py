from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_file, name="file-upload"),
    path("structured-request/", views.structured_request, name="structured-request"),
    path("", views.list_files, name="file-list"),
    path("<int:pk>/", views.file_detail, name="file-detail"),
    path("<int:pk>/update/", views.update_file, name="file-update"),
    path("<int:pk>/delete/", views.delete_file, name="file-delete"),
]
