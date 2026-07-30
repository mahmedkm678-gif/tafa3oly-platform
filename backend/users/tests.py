from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.authtoken.models import Token
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

