from rest_framework import serializers
from users.serializers import UserSerializer
from files.serializers import FileSerializer
from .models import Request, Session, MemorizationProgress


class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['id', 'file', 'tutor', 'tutor_price', 'payment_type', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class RequestDetailSerializer(serializers.ModelSerializer):
    tutor = UserSerializer(read_only=True)
    file = FileSerializer(read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'file', 'tutor', 'tutor_price', 'payment_type', 'status', 'created_at']


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'request', 'platform_fee', 'tutor_amount', 'status', 'created_at']
        read_only_fields = ['id', 'platform_fee', 'tutor_amount', 'created_at']


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemorizationProgress
        fields = ['id', 'session', 'progress_type', 'juz_from', 'juz_to',
                  'unit_from', 'unit_to', 'cefr_from', 'cefr_to',
                  'notes', 'tutor_notes', 'created_at']
        read_only_fields = ['id', 'created_at']
