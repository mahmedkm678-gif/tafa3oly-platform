from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from files.models import File
from .models import Request, Session, MemorizationProgress
from .serializers import RequestSerializer, RequestDetailSerializer, ProgressSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_offers(request):
    file_id = request.query_params.get("file_id")
    if file_id:
        offers = Request.objects.filter(file_id=file_id, file__student=request.user)
    elif request.user.role == "tutor":
        offers = Request.objects.filter(tutor=request.user)
    else:
        offers = Request.objects.filter(file__student=request.user)
    offers = offers.select_related("tutor", "file__student").order_by("-created_at")
    return Response(RequestDetailSerializer(offers, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_offer(request):
    if request.user.role != "tutor":
        return Response({"error": "Only tutors can create offers"}, status=status.HTTP_403_FORBIDDEN)

    file_id = request.data.get("file_id")
    tutor_price = request.data.get("tutor_price")
    payment_type = request.data.get("payment_type", "per_session")

    try:
        file_obj = File.objects.get(id=file_id, status="pending")
    except File.DoesNotExist:
        return Response({"error": "File not found or already matched"}, status=status.HTTP_404_NOT_FOUND)

    if Request.objects.filter(file=file_obj, tutor=request.user).exists():
        return Response({"error": "You already submitted an offer for this file"}, status=status.HTTP_400_BAD_REQUEST)

    offer = Request.objects.create(
        file=file_obj,
        tutor=request.user,
        tutor_price=tutor_price,
        payment_type=payment_type,
    )
    return Response(RequestSerializer(offer).data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def accept_offer(request, pk):
    try:
        offer = Request.objects.get(id=pk, status="pending")
    except Request.DoesNotExist:
        return Response({"error": "Offer not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user != offer.file.student:
        return Response({"error": "Only the file owner can accept offers"}, status=status.HTTP_403_FORBIDDEN)

    offer.status = "accepted"
    offer.save()

    offer.file.status = "matched"
    offer.file.save()

    base = float(offer.tutor_price)
    platform_fee = round(base * settings.PLATFORM_FEE, 2)
    tutor_amount = round(base * (1 - settings.PLATFORM_FEE), 2)

    session = Session.objects.create(
        request=offer,
        platform_fee=platform_fee,
        tutor_amount=tutor_amount,
    )

    return Response(
        {
            "offer": RequestSerializer(offer).data,
            "session": {
                "id": session.id,
                "platform_fee": session.platform_fee,
                "tutor_amount": session.tutor_amount,
                "status": session.status,
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_progress(request):
    session_id = request.query_params.get("session_id")
    qs = MemorizationProgress.objects.select_related("session__request__file", "session__request__tutor")

    if session_id:
        qs = qs.filter(session_id=session_id)
    elif request.user.role == "tutor":
        qs = qs.filter(session__request__tutor=request.user)
    else:
        qs = qs.filter(session__request__file__student=request.user)

    qs = qs.order_by("-created_at")
    return Response(ProgressSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_progress(request):
    if request.user.role != "tutor":
        return Response({"error": "Only tutors can record progress"}, status=status.HTTP_403_FORBIDDEN)

    session_id = request.data.get("session_id")
    try:
        session = Session.objects.get(id=session_id, request__tutor=request.user)
    except Session.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

    progress_type = request.data.get("progress_type", "quran")
    if progress_type == "quran":
        if not request.data.get("juz_from") or not request.data.get("juz_to"):
            return Response({"error": "juz_from and juz_to required for Quran"}, status=status.HTTP_400_BAD_REQUEST)
    elif progress_type == "kindergarten":
        if not request.data.get("unit_from") or not request.data.get("unit_to"):
            return Response({"error": "unit_from and unit_to required for Kindergarten"}, status=status.HTTP_400_BAD_REQUEST)
    elif progress_type == "language":
        if not request.data.get("cefr_from") or not request.data.get("cefr_to"):
            return Response({"error": "cefr_from and cefr_to required for Language"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ProgressSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    progress = serializer.save(session_id=session_id)
    return Response(ProgressSerializer(progress).data, status=status.HTTP_201_CREATED)
