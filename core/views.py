from django.http import JsonResponse


def welcome_view(request):
    return JsonResponse({"message": "تفاعلي API", "status": "running"})
