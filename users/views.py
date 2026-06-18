from datetime import timedelta
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UserSerializer, TutorProfileSerializer
from .services import upload_profile_picture


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"token": token.key, "user": UserSerializer(user).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    password = request.data.get("password")
    email_or_username = request.data.get("email") or request.data.get("username")
    
    if not email_or_username or not password:
        return Response({"error": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

    username = None
    try:
        if "@" in email_or_username:
            user_obj = User.objects.get(email__iexact=email_or_username)
        else:
            user_obj = User.objects.get(username__iexact=email_or_username)
        username = user_obj.username
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": UserSerializer(user).data})


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "PUT":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_picture(request):
    file_obj = request.FILES.get("picture")
    if not file_obj:
        return Response({"error": "No picture provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        url = upload_profile_picture(file_obj, request.user.id)
    except RuntimeError as e:
        return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    request.user.profile_picture_url = url
    request.user.save(update_fields=["profile_picture_url"])

    return Response({"profile_picture_url": url})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tutor_detail(request, pk):
    from .models import User
    try:
        tutor = User.objects.get(id=pk, role="tutor")
    except User.DoesNotExist:
        return Response({"error": "Tutor not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(TutorProfileSerializer(tutor).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def available_tutors(request):
    from .models import User
    cutoff = timezone.now() - timedelta(minutes=2)
    User.objects.filter(role="tutor", is_available=True, last_seen__lt=cutoff).update(is_available=False)
    qs = User.objects.filter(role="tutor", is_available=True, last_seen__gte=cutoff)
    level = request.query_params.get("level")
    if level:
        qs = qs.filter(teaching_level=level)
    return Response(TutorProfileSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ping(request):
    now = timezone.now()
    request.user.last_seen = now
    request.user.is_available = True
    request.user.save(update_fields=["last_seen", "is_available"])
    return Response({"status": "ok", "last_seen": now.isoformat()})
