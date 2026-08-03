from rest_framework import serializers
from users.serializers import UserSerializer
from files.serializers import FileSerializer
from .models import Request, Session, MemorizationProgress, Review


class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['id', 'file', 'tutor', 'tutor_price', 'is_ai_proposed', 'payment_type', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class RequestDetailSerializer(serializers.ModelSerializer):
    tutor = UserSerializer(read_only=True)
    file = FileSerializer(read_only=True)
    session_id = serializers.SerializerMethodField()
    session_status = serializers.SerializerMethodField()
    session_is_trial = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            'id', 'file', 'tutor', 'tutor_price', 'is_ai_proposed',
            'payment_type', 'status', 'created_at',
            'session_id', 'session_status', 'session_is_trial',
        ]

    def get_session_id(self, obj):
        if hasattr(obj, 'session'):
            return obj.session.id
        return None

    def get_session_status(self, obj):
        if hasattr(obj, 'session'):
            return obj.session.status
        return None

    def get_session_is_trial(self, obj):
        if hasattr(obj, 'session'):
            return obj.session.is_trial
        return None


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'request', 'platform_fee', 'tutor_amount', 'is_trial', 'status', 'created_at']
        read_only_fields = ['id', 'platform_fee', 'tutor_amount', 'is_trial', 'created_at']


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemorizationProgress
        fields = ['id', 'session', 'progress_type', 'juz_from', 'juz_to',
                  'unit_from', 'unit_to', 'cefr_from', 'cefr_to',
                  'notes', 'tutor_notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'session', 'student', 'tutor', 'rating', 'comment', 'student_name', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']
