import json
import uuid
import PyPDF2
from django.conf import settings
from google import genai
from supabase import create_client

supabase = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_gemini_client():
    return genai.Client(api_key=settings.GEMINI_API_KEY)

ANALYSIS_PROMPT = """
Analyze this academic PDF content and return ONLY valid JSON with these fields:
{
  "specialization": "subject/field name",
  "difficulty": "easy" or "medium" or "hard",
  "estimated_hours": "number as string (e.g. 10)",
  "subject_type": "math" or "english" or "science" or "other"
}
No explanation, no markdown, just JSON.
"""


def upload_to_supabase(file_obj, student_id):
    if not supabase:
        import os
        from django.core.files.storage import default_storage
        ext = file_obj.name.rsplit(".", 1)[-1] if "." in file_obj.name else "pdf"
        file_path = f"students/{student_id}/{uuid.uuid4().hex}.{ext}"
        saved_path = default_storage.save(file_path, file_obj)
        return default_storage.url(saved_path)
    ext = file_obj.name.rsplit(".", 1)[-1] if "." in file_obj.name else "pdf"
    file_path = f"students/{student_id}/{uuid.uuid4().hex}.{ext}"
    raw = file_obj.read()
    file_obj.seek(0)
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        file_path, raw, {"content-type": file_obj.content_type or "application/pdf"}
    )
    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(file_path)
    return public_url


def extract_text_from_pdf(file_obj):
    try:
        reader = PyPDF2.PdfReader(file_obj)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception:
        return "محتوى ملف تجريبي"


def analyze_with_gemini(pdf_text):
    if not settings.GEMINI_API_KEY:
        return {
            "specialization": "هندسة برمجيات / علوم الحاسب",
            "difficulty": "medium",
            "estimated_hours": "10",
            "subject_type": "other"
        }
    try:
        truncated = pdf_text[:30000]
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{ANALYSIS_PROMPT}\n\n{truncated}",
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(raw)
    except Exception as e:
        return {
            "specialization": "تحليل مستندات (احتياطي)",
            "difficulty": "medium",
            "estimated_hours": "8",
            "subject_type": "other"
        }


def calculate_price(country, session_type, estimated_hours, students=1, level="university"):
    price = settings.PRICING[country].get(level, settings.PRICING[country]["university"])
    if session_type == "solo":
        base = price["solo"] * estimated_hours
    else:
        students = min(students, settings.MAX_GROUP_SIZE)
        base = price["group"] * students * estimated_hours
    platform_fee = round(base * settings.PLATFORM_FEE, 2)
    tutor_amount = round(base * (1 - settings.PLATFORM_FEE), 2)
    return {
        "base_price": round(base, 2),
        "platform_fee": platform_fee,
        "tutor_amount": tutor_amount,
        "currency": price["currency"],
    }
