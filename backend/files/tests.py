from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch
from users.models import User
from .models import File
from .views import _safe_analysis


class FileAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", email="s1@test.com",
            password="pass12345", role="student",
            student_levels=["university", "high_school"]
        )
        self.tutor = User.objects.create_user(
            username="tutor1", email="t1@test.com",
            password="pass12345", role="tutor",
            teaching_level="university",
            is_approved=True,
        )
        self.student_token = Token.objects.create(user=self.student).key
        self.tutor_token = Token.objects.create(user=self.tutor).key

    def test_list_files_student(self):
        File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.get(reverse("file-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_files_tutor_sees_pending(self):
        File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.get(reverse("file-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_files_tutor_no_match(self):
        File.objects.create(
            student=self.student, education_level="high_school",
            specialization="Math", base_price=25, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.get(reverse("file-list"))
        self.assertEqual(len(response.data), 0)

    def test_file_detail_owner(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.get(reverse("file-detail", args=[f.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_file_detail_unauthorized(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        other_student = User.objects.create_user(
            username="other", email="o@test.com",
            password="pass12345", role="student"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=other_student).key}")
        response = self.client.get(reverse("file-detail", args=[f.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_file_pending(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(
            reverse("file-update", args=[f.id]),
            {"session_type": "group", "max_students": 5},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        f.refresh_from_db()
        self.assertEqual(f.session_type, "group")
        self.assertEqual(f.max_students, 5)

    def test_update_file_matched_fails(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="matched"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(
            reverse("file-update", args=[f.id]),
            {"session_type": "group"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_file_pending(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.delete(reverse("file-delete", args=[f.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(File.objects.count(), 0)

    def test_delete_file_matched_fails(self):
        f = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="matched"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.delete(reverse("file-delete", args=[f.id]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_structured_request(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("structured-request"), {
            "education_level": "quran",
            "session_type": "solo",
            "country": "SA",
            "current_juz": 5,
            "start_juz": 1,
            "end_juz": 10,
            "weekly_availability": {"sat": "10:00-12:00"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 1)

    def test_upload_file_with_malformed_analysis_still_succeeds(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        with patch("files.views.upload_to_supabase", return_value="http://example.com/f.pdf"), \
                patch("files.views.analyze_with_gemini", return_value={"estimated_hours": "abc"}):
            response = self.client.post(
                reverse("file-upload"),
                {
                    "file": SimpleUploadedFile("test.pdf", b"%PDF-1.4 not a real pdf", content_type="application/pdf"),
                    "country": "SA",
                    "session_type": "solo",
                    "education_level": "university",
                },
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.get(id=response.data["id"]).estimated_hours, 8)


class SafeAnalysisTests(SimpleTestCase):
    def test_valid_passthrough(self):
        out = _safe_analysis({"specialization": "Math", "difficulty": "hard", "estimated_hours": "12", "subject_type": "math"})
        self.assertEqual(out["estimated_hours"], 12)
        self.assertEqual(out["specialization"], "Math")
        self.assertEqual(out["difficulty"], "hard")
        self.assertEqual(out["subject_type"], "math")

    def test_non_numeric_hours_defaults_to_8(self):
        out = _safe_analysis({"estimated_hours": "not-a-number"})
        self.assertEqual(out["estimated_hours"], 8)

    def test_negative_or_zero_hours_defaults_to_8(self):
        self.assertEqual(_safe_analysis({"estimated_hours": "-3"})["estimated_hours"], 8)
        self.assertEqual(_safe_analysis({"estimated_hours": "0"})["estimated_hours"], 8)

    def test_huge_hours_defaults_to_8(self):
        self.assertEqual(_safe_analysis({"estimated_hours": "99999"})["estimated_hours"], 8)

    def test_missing_keys_get_defaults(self):
        out = _safe_analysis({})
        self.assertEqual(out["estimated_hours"], 8)
        self.assertEqual(out["difficulty"], "medium")
        self.assertEqual(out["subject_type"], "other")
        self.assertTrue(out["specialization"])
