from rest_framework import serializers
from .models import User, Complaint


class UserSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'specialization', 'instapay_phone', 'vodafone_cash',
            'is_approved', 'is_banned',
            'profile_picture_url', 'bio', 'years_experience',
            'education', 'certificates', 'is_available',
            'teaching_level', 'languages', 'student_levels', 'created_at',
            'average_rating',
        ]
        read_only_fields = ['id', 'created_at', 'is_approved', 'is_banned']

    def get_average_rating(self, obj):
        from django.db.models import Avg
        from offers.models import Review
        avg = Review.objects.filter(tutor=obj).aggregate(a=Avg("rating"))["a"]
        return round(float(avg), 1) if avg is not None else None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'specialization', 'instapay_phone', 'vodafone_cash',
            'profile_picture_url', 'bio', 'years_experience',
            'education', 'certificates',
            'teaching_level', 'languages', 'student_levels',
        ]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class TutorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'specialization',
            'profile_picture_url', 'bio', 'years_experience',
            'education', 'certificates', 'is_available',
            'teaching_level', 'languages',
        ]
        read_only_fields = fields


class ComplaintSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source='tutor.get_full_name', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'tutor', 'tutor_name', 'session', 'reason',
            'status', 'admin_note', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'admin_note', 'created_at']
