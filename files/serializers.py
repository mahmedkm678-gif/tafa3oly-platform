from rest_framework import serializers
from .models import File, Language


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)
    country = serializers.ChoiceField(choices=["SA", "KW", "AE", "QA"])
    session_type = serializers.ChoiceField(choices=["solo", "group"])
    students_count = serializers.IntegerField(default=1, min_value=1, max_value=10)
    education_level = serializers.ChoiceField(choices=["university", "high_school", "middle_school", "primary"])


class StructuredRequestSerializer(serializers.Serializer):
    education_level = serializers.ChoiceField(choices=["quran", "kindergarten", "language"])
    current_juz = serializers.IntegerField(min_value=1, max_value=30, required=False)
    start_juz = serializers.IntegerField(min_value=1, max_value=30, required=False)
    current_unit = serializers.IntegerField(min_value=1, required=False)
    start_unit = serializers.IntegerField(min_value=1, required=False)
    current_cefr = serializers.ChoiceField(choices=["A1", "A2", "B1", "B2", "C1", "C2"], required=False)
    start_cefr = serializers.ChoiceField(choices=["A1", "A2", "B1", "B2", "C1", "C2"], required=False)
    language = serializers.ChoiceField(choices=Language.values, required=False)
    session_type = serializers.ChoiceField(choices=["solo", "group"])
    max_students = serializers.IntegerField(default=1, min_value=1, max_value=10)
    weekly_availability = serializers.JSONField()
    country = serializers.ChoiceField(choices=["SA", "KW", "AE", "QA"])
    notes = serializers.CharField(required=False, allow_blank=True)


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            "id", "student", "file_url", "specialization", "difficulty",
            "estimated_hours", "subject_type", "education_level", "language",
            "base_price", "currency", "session_type", "max_students", "status",
            "current_juz", "start_juz", "current_unit", "start_unit",
            "current_cefr", "start_cefr",
            "weekly_availability", "quran_notes", "created_at",
        ]
        read_only_fields = fields
