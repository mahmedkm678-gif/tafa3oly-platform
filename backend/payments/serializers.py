from rest_framework import serializers
from .models import Payment, Payout


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'session', 'amount', 'payment_method', 'payment_status',
            'payment_type', 'month_year',
            'paypal_order_id', 'paypal_capture_id',
            'receipt_image_url', 'reference_number', 'webhook_verified',
            'payout', 'payout_batch_id', 'tutor_paid', 'created_at',
        ]
        read_only_fields = fields


class PayoutSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source='tutor.get_full_name', read_only=True)

    class Meta:
        model = Payout
        fields = [
            'id', 'tutor', 'tutor_name', 'month_year', 'amount', 'currency',
            'method', 'recipient', 'status', 'admin_note', 'created_at', 'paid_at',
        ]
        read_only_fields = fields
