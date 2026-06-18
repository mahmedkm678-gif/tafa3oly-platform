import uuid
from django.conf import settings
from supabase import create_client


def upload_profile_picture(file_obj, user_id):
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        from django.core.files.storage import default_storage
        ext = file_obj.name.rsplit(".", 1)[-1] if "." in file_obj.name else "jpg"
        file_path = f"profiles/{user_id}/{uuid.uuid4().hex}.{ext}"
        saved_path = default_storage.save(file_path, file_obj)
        return default_storage.url(saved_path)
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    ext = file_obj.name.rsplit(".", 1)[-1] if "." in file_obj.name else "jpg"
    file_path = f"profiles/{user_id}/{uuid.uuid4().hex}.{ext}"
    raw = file_obj.read()
    file_obj.seek(0)
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        file_path, raw, {"content-type": file_obj.content_type or "image/jpeg"}
    )
    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(file_path)
    return public_url
