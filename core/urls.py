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
    # Serve built SPA assets
    re_path(r"^assets/(?P<path>.*)$", serve, {
        "document_root": settings.BASE_DIR / "frontend" / "dist" / "assets",
    }),
    # Serve root-level static files from dist
    re_path(r"^(favicon\.svg|hero\.png|robots\.txt|sitemap\.xml)$", serve, {
        "document_root": settings.BASE_DIR / "frontend" / "dist",
    }),
    # Backward compat: serve frontend source files under /frontend/
    re_path(r"^frontend/(?P<path>.*)$", serve, {
        "document_root": settings.BASE_DIR / "frontend",
    }),
    # Catch-all: serve SPA index.html for all other routes (client-side routing)
    re_path(r"^.*$", serve, {
        "document_root": settings.BASE_DIR / "frontend" / "dist", "path": "index.html",
    }),
]
