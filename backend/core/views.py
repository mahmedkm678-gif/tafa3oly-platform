from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

def welcome_view(request):
    return JsonResponse({"message": "تفاعلي API", "status": "running"})

@api_view(["GET"])
@permission_classes([AllowAny])
def pricing_view(request):
    """Return pricing data for all countries (public endpoint)."""
    return Response(settings.PRICING)

