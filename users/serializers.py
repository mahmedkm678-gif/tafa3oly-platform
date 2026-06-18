from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'specialization', 'paypal_email',
            'profile_picture_url', 'bio', 'years_experience',
            'education', 'certificates', 'is_available',
            'teaching_level', 'languages', 'student_levels', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'specialization', 'paypal_email',
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
            'specialization', 'paypal_email',
            'profile_picture_url', 'bio', 'years_experience',
            'education', 'certificates', 'is_available',
            'teaching_level', 'languages',
        ]
        read_only_fields = fields
