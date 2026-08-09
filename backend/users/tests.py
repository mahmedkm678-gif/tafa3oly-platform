from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
from .models import User, ContactRequest


class ContactAPITests(APITestCase):
    def test_contact_request_submission(self):
        url = reverse("contact-submit")
        data = {
            "first_name": "أحمد",
            "last_name": "العتيبي",
            "email": "ahmed@example.com",
            "company_name": "منظمة التعليم الذكي",
            "employee_count": "15",
            "question": "كيف يمكننا دمج البث التفاعلي؟"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        
        # Verify saved object in database
        self.assertEqual(ContactRequest.objects.count(), 1)
        req = ContactRequest.objects.first()
        self.assertEqual(req.first_name, "أحمد")
        self.assertEqual(req.employee_count, 15)

    def test_contact_request_validation(self):
        url = reverse("contact-submit")
        # Missing required fields
        data = {
            "first_name": "أحمد",
            "email": "ahmed@example.com"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthAPITests(APITestCase):
    def setUp(self):
        self.reg_url = reverse("register")
        self.reg_data = {
            "username": "student1",
            "email": "student1@example.com",
            "password": "strongpassword123",
            "first_name": "عمر",
            "last_name": "خالد",
            "role": "student",
            "student_levels": ["university"]
        }

    def test_registration_and_login_flow(self):
        # 1. Register student
        response = self.client.post(self.reg_url, self.reg_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)

        # 2. Login user
        login_url = reverse("login")
        login_data = {
            "username": "student1",
            "password": "strongpassword123"
        }
        response = self.client.post(login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_with_email(self):
        self.client.post(self.reg_url, self.reg_data, format="json")
        login_url = reverse("login")
        response = self.client.post(login_url, {
            "email": "student1@example.com",
            "password": "strongpassword123"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout(self):
        self.client.post(self.reg_url, self.reg_data, format="json")
        login_url = reverse("login")
        login_resp = self.client.post(login_url, {
            "username": "student1",
            "password": "strongpassword123"
        }, format="json")
        token = login_resp.data["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        logout_url = reverse("logout")
        response = self.client.post(logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Token should be invalid after logout
        profile_url = reverse("profile")
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_flow(self):
        self.client.post(self.reg_url, self.reg_data, format="json")

        user = User.objects.get(username="student1")

        # Request reset
        request_url = reverse("password-reset-request")
        response = self.client.post(request_url, {"email": "student1@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("reset_url", response.data)

        # Generate uid and token directly
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Confirm reset
        confirm_url = reverse("password-reset-confirm")
        response = self.client.post(confirm_url, {
            "uid": uid,
            "token": token,
            "new_password": "newpassword456"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Login with new password
        login_url = reverse("login")
        response = self.client.post(login_url, {
            "username": "student1",
            "password": "newpassword456"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BanAndComplaintTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", email="s1@test.com",
            password="pass12345", role="student"
        )
        self.tutor = User.objects.create_user(
            username="tutor1", email="t1@test.com",
            password="pass12345", role="tutor",
            teaching_level="university"
        )
        from files.models import File
        from offers.models import Request, Session
        self.file = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="done"
        )
        self.offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session", status="accepted"
        )
        self.session = Session.objects.create(
            request=self.offer, platform_fee=3.75,
            tutor_amount=21.25, status="done"
        )
        self.student_token = Token.objects.create(user=self.student).key

    def test_banned_user_cannot_login(self):
        self.tutor.is_banned = True
        self.tutor.save()
        response = self.client.post(reverse("login"), {
            "username": "tutor1",
            "password": "pass12345"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submit_complaint(self):
        from .models import Complaint
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("complaint-submit"), {
            "session_id": self.session.id,
            "reason": "لم يلتزم المدرس بالموعد"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Complaint.objects.count(), 1)

    def test_admin_ban_tutor_on_repeat_complaints(self):
        from .models import Complaint
        admin = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="pass12345"
        )
        admin_token = Token.objects.create(user=admin).key
        Complaint.objects.create(student=self.student, tutor=self.tutor, reason="أول شكوى")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("complaint-submit"), {
            "session_id": self.session.id,
            "reason": "شكوى ثانية"
        }, format="json")
        complaint_id = response.data["id"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {admin_token}")
        response = self.client.post(reverse("admin-complaint-resolve", args=[complaint_id]), {
            "action": "valid"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "banned")
        self.tutor.refresh_from_db()
        self.assertTrue(self.tutor.is_banned)

    def test_admin_approve_tutor(self):
        admin = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="pass12345"
        )
        admin_token = Token.objects.create(user=admin).key
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {admin_token}")
        response = self.client.put(reverse("admin-tutor-approval", args=[self.tutor.id]), {
            "approved": True
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tutor.refresh_from_db()
        self.assertTrue(self.tutor.is_approved)


class PublicTutorTests(APITestCase):
    def setUp(self):
        self.available = User.objects.create_user(
            username="tutor_avail", email="ta@test.com",
            password="pass12345", role="tutor",
            teaching_level="university", is_approved=True,
            first_name="أحمد", last_name="علي",
            is_available=True, last_seen=timezone.now(),
        )
        self.offline = User.objects.create_user(
            username="tutor_offline", email="to@test.com",
            password="pass12345", role="tutor",
            teaching_level="university", is_approved=True,
            is_available=False, last_seen=timezone.now() - timedelta(minutes=30),
        )
        self.unapproved = User.objects.create_user(
            username="tutor_pending", email="tp@test.com",
            password="pass12345", role="tutor",
            teaching_level="university", is_approved=False,
            is_available=True, last_seen=timezone.now(),
        )

    def test_public_tutor_detail(self):
        response = self.client.get(reverse("tutor-detail", args=[self.available.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "أحمد")

    def test_public_tutor_detail_not_found(self):
        response = self.client.get(reverse("tutor-detail", args=[99999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_tutors_list_only_available_approved(self):
        response = self.client.get(reverse("tutors-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [t["id"] for t in response.data]
        self.assertIn(self.available.id, ids)
        self.assertNotIn(self.offline.id, ids)
        self.assertNotIn(self.unapproved.id, ids)

    def test_public_tutors_list_level_filter(self):
        response = self.client.get(reverse("tutors-list"), {"level": "university"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

