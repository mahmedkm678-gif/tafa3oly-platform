from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_offers, name="offer-list"),
    path("create/", views.create_offer, name="offer-create"),
    path("<int:pk>/accept/", views.accept_offer, name="offer-accept"),
    path("<int:pk>/reject/", views.reject_offer, name="offer-reject"),
    path("progress/", views.list_progress, name="progress-list"),
    path("progress/create/", views.create_progress, name="progress-create"),
    path("reviews/create/", views.create_review, name="review-create"),
    path("reviews/<int:tutor_id>/", views.list_tutor_reviews, name="tutor-reviews"),
]
