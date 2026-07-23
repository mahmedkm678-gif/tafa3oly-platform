from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from users.models import User
from files.models import File
from .models import Request, Session, MemorizationProgress, Review


class OfferAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", email="s1@test.com",
            password="pass12345", role="student",
            student_levels=["university"]
        )
        self.tutor = User.objects.create_user(
            username="tutor1", email="t1@test.com",
            password="pass12345", role="tutor",
            teaching_level="university"
        )
        self.file = File.objects.create(
            student=self.student, education_level="university",
            specialization="Math", base_price=30, currency="SAR",
            session_type="solo", status="pending"
        )
        self.student_token = Token.objects.create(user=self.student).key
        self.tutor_token = Token.objects.create(user=self.tutor).key

    def test_create_offer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("offer-create"), {
            "file_id": self.file.id,
            "tutor_price": 25,
            "payment_type": "per_session"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Request.objects.count(), 1)

    def test_create_offer_duplicate_fails(self):
        Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("offer-create"), {
            "file_id": self.file.id,
            "tutor_price": 20,
            "payment_type": "per_session"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_create_offer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("offer-create"), {
            "file_id": self.file.id,
            "tutor_price": 25,
            "payment_type": "per_session"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_accept_offer(self):
        offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(reverse("offer-accept", args=[offer.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.status, "accepted")
        self.file.refresh_from_db()
        self.assertEqual(self.file.status, "matched")
        self.assertEqual(Session.objects.count(), 1)

    def test_reject_offer(self):
        offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(reverse("offer-reject", args=[offer.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.status, "rejected")

    def test_tutor_cannot_accept(self):
        offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=25, payment_type="per_session"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-accept", args=[offer.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProgressAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", email="s1@test.com",
            password="pass12345", role="student"
        )
        self.tutor = User.objects.create_user(
            username="tutor1", email="t1@test.com",
            password="pass12345", role="tutor",
            teaching_level="quran"
        )
        self.file = File.objects.create(
            student=self.student, education_level="quran",
            specialization="Quran", base_price=20, currency="SAR",
            session_type="solo", status="matched"
        )
        self.offer = Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=18, payment_type="per_session", status="accepted"
        )
        self.session = Session.objects.create(
            request=self.offer, platform_fee=2.7, tutor_amount=15.3
        )
        self.tutor_token = Token.objects.create(user=self.tutor).key

    def test_create_quran_progress(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("progress-create"), {
            "session_id": self.session.id,
            "progress_type": "quran",
            "juz_from": 1,
            "juz_to": 3,
            "notes": "Memorized 3 ajza"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MemorizationProgress.objects.count(), 1)

    def test_create_progress_missing_fields(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("progress-create"), {
            "session_id": self.session.id,
            "progress_type": "quran"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReviewAPITests(APITestCase):
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
        self.tutor_token = Token.objects.create(user=self.tutor).key

    def test_create_review(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("review-create"), {
            "session_id": self.session.id,
            "rating": 5,
            "comment": "مدرس ممتاز!"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

    def test_duplicate_review_fails(self):
        Review.objects.create(
            session=self.session, student=self.student,
            tutor=self.tutor, rating=4, comment="Good"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("review-create"), {
            "session_id": self.session.id,
            "rating": 5
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tutor_cannot_review(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("review-create"), {
            "session_id": self.session.id,
            "rating": 5
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_tutor_reviews(self):
        Review.objects.create(
            session=self.session, student=self.student,
            tutor=self.tutor, rating=5, comment="Great!"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.get(reverse("tutor-reviews", args=[self.tutor.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_reviews"], 1)
        self.assertEqual(float(response.data["average_rating"]), 5.0)
