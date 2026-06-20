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
]

# Serve frontend static files (CSS, JS, assets) under /frontend/
urlpatterns += [
    re_path(r"^frontend/(?P<path>.*)$", serve, {
        "document_root": settings.BASE_DIR / "frontend",
    }),
]

from django.views.generic import RedirectView

# Redirect root and clean URLs to their physical files under /frontend/
# This ensures that relative paths for CSS/JS resolve correctly.
PAGE_MAP = {
    "": "/frontend/index.html",
    "login": "/frontend/pages/login.html",
    "register": "/frontend/pages/register.html",
    "student-dashboard": "/frontend/pages/student_dashboard.html",
    "tutor-dashboard": "/frontend/pages/tutor_dashboard.html",
    "edit-profile": "/frontend/pages/edit_profile.html",
    "quran-request": "/frontend/pages/quran_request.html",
}
for slug, redirect_url in PAGE_MAP.items():
    urlpatterns.append(
        re_path(r"^" + slug + r"$", RedirectView.as_view(url=redirect_url, permanent=False))
    )
