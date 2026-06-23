from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
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
    def test_registration_and_login_flow(self):
        # 1. Register student
        reg_url = reverse("register")
        reg_data = {
            "username": "student1",
            "email": "student1@example.com",
            "password": "strongpassword123",
            "first_name": "عمر",
            "last_name": "خالد",
            "role": "student",
            "student_levels": ["university"]
        }
        response = self.client.post(reg_url, reg_data, format="json")
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

