from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("profile/", views.profile, name="profile"),
    path("upload-picture/", views.upload_picture, name="upload-picture"),
    path("available-tutors/", views.available_tutors, name="available-tutors"),
    path("ping/", views.ping, name="ping"),
    path("tutors/<int:pk>/", views.tutor_detail, name="tutor-detail"),
]
