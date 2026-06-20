from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/files/", include("files.urls")),
    path("api/offers/", include("offers.urls")),
    path("api/payments/", include("payments.urls")),
    # Serve frontend files under /frontend/
    re_path(r"^frontend/(?P<path>.*)$", serve, {
        "document_root": settings.BASE_DIR / "frontend",
    }),
    # Serve pages at clean URLs
    re_path(r"^$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "index.html"}),
    re_path(r"^login$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/login.html"}),
    re_path(r"^register$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/register.html"}),
    re_path(r"^student-dashboard$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/student_dashboard.html"}),
    re_path(r"^tutor-dashboard$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/tutor_dashboard.html"}),
    re_path(r"^edit-profile$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/edit_profile.html"}),
    re_path(r"^quran-request$", serve, {"document_root": settings.BASE_DIR / "frontend", "path": "pages/quran_request.html"}),
]
