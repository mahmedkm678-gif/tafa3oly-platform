from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("password-reset/request/", views.request_password_reset, name="password-reset-request"),
    path("password-reset/confirm/", views.confirm_password_reset, name="password-reset-confirm"),
    path("profile/", views.profile, name="profile"),
    path("upload-picture/", views.upload_picture, name="upload-picture"),
    path("available-tutors/", views.available_tutors, name="available-tutors"),
    path("ping/", views.ping, name="ping"),
    path("tutors/", views.tutors_list, name="tutors-list"),
    path("tutors/<int:pk>/", views.tutor_detail, name="tutor-detail"),
    path("contact/", views.submit_contact_request, name="contact-submit"),
    path("complaints/", views.submit_complaint, name="complaint-submit"),
    path("complaints/mine/", views.list_my_complaints, name="complaints-mine"),
    path("admin/complaints/", views.admin_list_complaints, name="admin-complaints"),
    path("admin/complaints/<int:pk>/resolve/", views.admin_resolve_complaint, name="admin-complaint-resolve"),
    path("admin/tutors/<int:pk>/approval/", views.admin_approve_tutor, name="admin-tutor-approval"),
]
