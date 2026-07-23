from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from users.models import User
from files.models import File
from offers.models import Request, Session
from .models import Payment


class PaymentAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", email="s1@test.com",
            password="pass12345", role="student"
        )
        self.tutor = User.objects.create_user(
            username="tutor1", email="t1@test.com",
            password="pass12345", role="tutor",
            teaching_level="university",
            paypal_email="tutor@paypal.com"
        )
        self.file = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="matched"
        )
        self.offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session", status="accepted"
        )
        self.session = Session.objects.create(
            request=self.offer, platform_fee=3.75,
            tutor_amount=21.25, status="scheduled"
        )
        self.student_token = Token.objects.create(user=self.student).key
        self.tutor_token = Token.objects.create(user=self.tutor).key

    def test_list_payments_student(self):
        Payment.objects.create(
            session=self.session, amount=25,
            payment_status="completed"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.get(reverse("payment-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_payments_tutor(self):
        Payment.objects.create(
            session=self.session, amount=25,
            payment_status="completed"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.get(reverse("payment-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_payment_mock(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("payment-create"), {
            "session_id": self.session.id
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("payment", response.data)

    def test_create_payment_duplicate_fails(self):
        Payment.objects.create(
            session=self.session, amount=25
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("payment-create"), {
            "session_id": self.session.id
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_payment_access(self):
        other = User.objects.create_user(
            username="other", email="o@test.com",
            password="pass12345", role="student"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=other).key}")
        response = self.client.get(reverse("payment-list"))
        self.assertEqual(len(response.data), 0)
