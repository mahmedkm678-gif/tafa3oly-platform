import logging
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import File
from .serializers import FileUploadSerializer, StructuredRequestSerializer, FileSerializer
from .services import upload_to_supabase, extract_text_from_pdf, analyze_with_gemini, calculate_price

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    serializer = FileUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    student = request.user
    file_obj = serializer.validated_data["file"]
    country = serializer.validated_data["country"]
    session_type = serializer.validated_data["session_type"]
    students_count = serializer.validated_data.get("students_count", 1)
    education_level = serializer.validated_data["education_level"]

    file_url = upload_to_supabase(file_obj, student.id)
    pdf_text = extract_text_from_pdf(file_obj)
    analysis = analyze_with_gemini(pdf_text)
    estimated_hours = float(analysis["estimated_hours"])
    pricing = calculate_price(country, session_type, estimated_hours, students_count, education_level)
    max_students = students_count if session_type == "group" else 1

    file_record = File.objects.create(
        student=student,
        file_url=file_url,
        specialization=analysis["specialization"],
        difficulty=analysis["difficulty"],
        estimated_hours=estimated_hours,
        subject_type=analysis["subject_type"],
        education_level=education_level,
        base_price=pricing["base_price"],
        currency=pricing["currency"],
        session_type=session_type,
        max_students=max_students,
    )

    result = FileSerializer(file_record).data
    result["pricing_breakdown"] = pricing
    return Response(result, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
    level = request.query_params.get("level")
    qs = File.objects.all()
    if level:
        qs = qs.filter(education_level=level)
    if request.user.role == "tutor":
        tl = request.user.teaching_level
        if tl:
            qs = qs.filter(education_level=tl, status="pending")
        else:
            qs = qs.filter(status="pending")
    else:
        qs = qs.filter(student=request.user)
    qs = qs.order_by("-created_at")
    return Response(FileSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def structured_request(request):
    serializer = StructuredRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    country = data["country"]
    level = data["education_level"]
    currency = settings.PRICING[country].get(level, settings.PRICING[country]["university"])["currency"]

    kwargs = {
        "student": request.user,
        "education_level": level,
        "subject_type": "quran" if level == "quran" else "other",
        "base_price": 0,
        "currency": currency,
        "session_type": data["session_type"],
        "max_students": data.get("max_students", 1),
        "weekly_availability": data["weekly_availability"],
        "quran_notes": data.get("notes", ""),
    }

    if level == "quran":
        kwargs["current_juz"] = data["current_juz"]
        kwargs["start_juz"] = data["start_juz"]
        kwargs["specialization"] = "تحفيظ القرآن الكريم"
    elif level == "kindergarten":
        kwargs["current_unit"] = data["current_unit"]
        kwargs["start_unit"] = data["start_unit"]
        kwargs["specialization"] = "رياض الأطفال"
    elif level == "language":
        kwargs["current_cefr"] = data.get("current_cefr", "A1")
        kwargs["start_cefr"] = data.get("start_cefr", "A1")
        kwargs["language"] = data.get("language", "english")
        kwargs["specialization"] = f"لغة {dict(File._meta.get_field('language').flatchoices).get(data.get('language', 'english'), '')}"

    file_record = File.objects.create(**kwargs)
    return Response(FileSerializer(file_record).data, status=status.HTTP_201_CREATED)
