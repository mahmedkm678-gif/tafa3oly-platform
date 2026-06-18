from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'session', 'amount', 'payment_method', 'payment_status',
            'payment_type', 'month_year',
            'paypal_order_id', 'paypal_capture_id', 'webhook_verified',
            'payout_batch_id', 'tutor_paid', 'created_at',
        ]
        read_only_fields = fields
