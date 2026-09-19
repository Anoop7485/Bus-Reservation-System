from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Bus, Seat


class PaymentNotificationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='kumar', email='kumar@example.com', password='secret123')
        self.bus = Bus.objects.create(
            Bus_name='Tirumula Express',
            number='AP03Z107',
            origin='Tirupati',
            destination='Tirumula',
            features='AC Sleeper',
            start_time='06:00:00',
            reach_time='18:00:00',
            no_of_seats=40,
            price='800.00',
        )
        self.seat = Seat.objects.create(bus=self.bus, seat_number='S1', is_book=False)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_payment_response_includes_booking_confirmation_message(self):
        response = self.client.post('/api/payment/', {'seat': self.seat.id, 'card_number': '123456789012'}, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertIn('message', response.data)
        self.assertIn('Your payment was successful and your booking is confirmed.', response.data['message'])
        self.assertIn('Tirumula Express', response.data['message'])
        self.assertIn('S1', response.data['message'])
