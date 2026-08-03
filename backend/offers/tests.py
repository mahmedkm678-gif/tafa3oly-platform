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
            teaching_level="university",
            is_approved=True,
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

    def test_unapproved_tutor_cannot_create_offer(self):
        tutor2 = User.objects.create_user(
            username="tutor2", email="t2@test.com",
            password="pass12345", role="tutor",
            teaching_level="university", is_approved=False,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=tutor2).key}")
        response = self.client.post(reverse("offer-create"), {
            "file_id": self.file.id,
            "tutor_price": 25,
            "payment_type": "per_session"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_offer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.post(reverse("offer-create"), {
            "file_id": self.file.id,
            "tutor_price": 25,
            "payment_type": "per_session"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def _make_pending_offer(self, price=25):
        return Request.objects.create(
            file=self.file, tutor=self.tutor,
            tutor_price=price, payment_type="per_session", is_ai_proposed=True
        )

    def test_tutor_accept_first_session_is_trial(self):
        offer = self._make_pending_offer()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-respond", args=[offer.id]), {
            "action": "accept"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.status, "accepted")
        self.file.refresh_from_db()
        self.assertEqual(self.file.status, "matched")
        self.assertEqual(Session.objects.count(), 1)
        session = Session.objects.first()
        self.assertTrue(session.is_trial)
        self.assertEqual(float(session.tutor_amount), 0)
        self.assertEqual(float(session.platform_fee), 0)
        self.assertEqual(session.status, Session.Status.SCHEDULED)

    def test_tutor_accept_second_session_requires_payment(self):
        prior_offer = self._make_pending_offer()
        Session.objects.create(request=prior_offer, platform_fee=3.75, tutor_amount=21.25, is_trial=True, status="done")

        file2 = File.objects.create(
            student=self.student, education_level="university",
            specialization="Physics", base_price=40, currency="SAR",
            session_type="solo", status="pending"
        )
        offer = Request.objects.create(
            file=file2, tutor=self.tutor, tutor_price=40,
            payment_type="per_session", is_ai_proposed=True
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-respond", args=[offer.id]), {
            "action": "accept"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session = Session.objects.get(request=offer)
        self.assertFalse(session.is_trial)
        self.assertEqual(session.status, Session.Status.AWAITING_PAYMENT)
        self.assertEqual(float(session.platform_fee), round(40 * 0.15, 2))
        self.assertEqual(float(session.tutor_amount), round(40 * 0.85, 2))

    def test_tutor_accept_adjusts_price(self):
        prior_offer = self._make_pending_offer(price=20)
        Session.objects.create(request=prior_offer, platform_fee=3.0, tutor_amount=17.0, is_trial=True, status="done")
        offer = self._make_pending_offer(price=30)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-respond", args=[offer.id]), {
            "action": "accept",
            "tutor_price": 45
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(float(offer.tutor_price), 45)
        session = Session.objects.get(request=offer)
        self.assertEqual(float(session.platform_fee), round(45 * 0.15, 2))

    def test_tutor_rejects_offer(self):
        offer = self._make_pending_offer()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-respond", args=[offer.id]), {
            "action": "reject"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.status, "rejected")

    def test_student_cannot_respond(self):
        offer = self._make_pending_offer()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(reverse("offer-respond", args=[offer.id]), {
            "action": "accept"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_rejects_proposal(self):
        offer = self._make_pending_offer()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.student_token}")
        response = self.client.put(reverse("offer-reject", args=[offer.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        offer.refresh_from_db()
        self.assertEqual(offer.status, "rejected")

    def test_tutor_cannot_reject_student_proposal(self):
        offer = self._make_pending_offer()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.put(reverse("offer-reject", args=[offer.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_complete_session(self):
        offer = self._make_pending_offer()
        session = Session.objects.create(
            request=offer, platform_fee=0, tutor_amount=0,
            is_trial=True, status="scheduled"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.tutor_token}")
        response = self.client.post(reverse("session-complete", args=[session.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session.refresh_from_db()
        self.file.refresh_from_db()
        self.assertEqual(session.status, "done")
        self.assertEqual(self.file.status, "done")


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
