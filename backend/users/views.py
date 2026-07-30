import logging
from datetime import timedelta
from django.contrib.auth import authenticate
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UserSerializer, TutorProfileSerializer
from .services import upload_profile_picture

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    ip = request.META.get('REMOTE_ADDR', 'unknown')
    rate_key = f'register_attempts:{ip}'
    attempts = cache.get(rate_key, 0)
    if attempts >= 5:
        return Response({"error": "Too many registration attempts. Try again later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    cache.set(rate_key, attempts + 1, 3600)
    return Response(
        {"token": token.key, "user": UserSerializer(user).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    ip = request.META.get('REMOTE_ADDR', 'unknown')
    rate_key = f'login_attempts:{ip}'
    attempts = cache.get(rate_key, 0)
    if attempts >= 10:
        return Response({"error": "Too many login attempts. Try again in 15 minutes."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

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
        cache.set(rate_key, attempts + 1, 900)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=username, password=password)
    if not user:
        cache.set(rate_key, attempts + 1, 900)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    cache.delete(rate_key)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": UserSerializer(user).data})


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"message": "If the email exists, a reset link has been sent."})

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = f"{request.build_absolute_uri('/').rstrip('/')}/reset-password/{uid}/{token}/"

    logger.info(f"Password reset for {user.email}: {reset_url}")

    return Response({"message": "If the email exists, a reset link has been sent."})


@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not uid or not token or not new_password:
        return Response({"error": "uid, token, and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Invalid reset link"}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired reset link"}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    try:
        user.auth_token.delete()
    except Exception:
        pass

    return Response({"message": "Password reset successful. Please login with your new password."})


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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({"message": "Logged out successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_contact_request(request):
    ip = request.META.get('REMOTE_ADDR', 'unknown')
    rate_key = f'contact_attempts:{ip}'
    attempts = cache.get(rate_key, 0)
    if attempts >= 5:
        return Response({"error": "Too many submissions. Please try again later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    from .models import ContactRequest
    data = request.data
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    company_name = data.get("company_name", "")
    employee_count = data.get("employee_count")
    question = data.get("question", "")

    if not first_name or not last_name or not email:
        return Response(
            {"error": "First name, last name, and email are required fields."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        if employee_count:
            employee_count = int(employee_count)
        else:
            employee_count = None
    except ValueError:
        return Response(
            {"error": "Employee count must be an integer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contact_req = ContactRequest.objects.create(
        first_name=first_name,
        last_name=last_name,
        email=email,
        company_name=company_name,
        employee_count=employee_count,
        question=question,
    )
    cache.set(rate_key, attempts + 1, 3600)

    return Response(
        {
            "message": "Contact request submitted successfully.",
            "id": contact_req.id,
        },
        status=status.HTTP_201_CREATED,
    )

