from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings

from core.views import welcome_view

urlpatterns = [
    path("", welcome_view, name="welcome"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/files/", include("files.urls")),
    path("api/offers/", include("offers.urls")),
    path("api/payments/", include("payments.urls")),
]

if settings.DEBUG:
    # Serve frontend static files (CSS, JS)
    urlpatterns += [
        re_path(r"^frontend/(?P<path>.*)$", serve, {
            "document_root": settings.BASE_DIR / "frontend",
        }),
    ]
    # Serve HTML pages with clean URLs
    PAGE_MAP = {
        "": "index.html",
        "login": "login.html",
        "register": "register.html",
        "student-dashboard": "student_dashboard.html",
        "tutor-dashboard": "tutor_dashboard.html",
        "edit-profile": "edit_profile.html",
        "quran-request": "quran_request.html",
    }
    for slug, filename in PAGE_MAP.items():
        urlpatterns.append(
            re_path(r"^" + slug + r"$", serve, {
                "document_root": settings.BASE_DIR / "frontend",
                "path": filename,
            })
        )
