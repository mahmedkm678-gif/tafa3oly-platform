from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_offers, name="offer-list"),
    path("create/", views.create_offer, name="offer-create"),
    path("<int:pk>/accept/", views.accept_offer, name="offer-accept"),
    path("progress/", views.list_progress, name="progress-list"),
    path("progress/create/", views.create_progress, name="progress-create"),
]
