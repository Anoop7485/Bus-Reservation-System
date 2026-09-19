#authicate, permission, token, status,  response, generics, apiviews

from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, BusSerializer, BookingSerializer
from .models import Bus, Seat, Bookings

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            self.send_welcome_email(user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_welcome_email(self, user):
        if not user.email:
            return
        subject = 'Welcome to Travels Booking'
        message = (
            f'Hi {user.username},\n\n'
            'Thank you for creating an account at Travels Booking.\n'
            'You can now browse buses, select a seat, and complete payment from the app.\n\n'
            'Safe travels!\n'
            'Travels Booking Team'
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)

class LoginView(APIView):
    def post(self, request):
        username=request.data.get('username')
        password=request.data.get('password')
        user=authenticate(username=username, password=password)

        if user:
            token, created=Token.objects.get_or_create(user=user)
            return Response({
                'token':token.key,
                'user_id': user.id,
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        
class BusListCreateView(generics.ListCreateAPIView):
    queryset=Bus.objects.all()
    serializer_class=BusSerializer

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset=Bus.objects.all()
    serializer_class=BusSerializer

class BookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat')
        try:
            seat = Seat.objects.get(id=seat_id)
            if seat.is_book:
                return Response({'error': 'seat already booked'}, status=status.HTTP_400_BAD_REQUEST)
            seat.is_book = True
            seat.save()

            booking = Bookings.objects.create(
                user=request.user,
                bus=seat.bus,
                seat=seat,
            )
            self.send_booking_email(request.user, booking)
            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Seat.DoesNotExist:
            return Response({'error': 'invalid seat id'}, status=status.HTTP_400_BAD_REQUEST)

    def send_booking_email(self, user, booking):
        if not user.email:
            return
        subject = 'Your Travels Booking is Confirmed'
        message = (
            f'Hi {user.username},\n\n'
            f'Your booking for seat {booking.seat.seat_number} on {booking.bus.Bus_name} is confirmed.\n'
            f'Route: {booking.bus.origin} → {booking.bus.destination}\n'
            f'Departure: {booking.bus.start_time}\n'
            f'Arrival: {booking.bus.reach_time}\n\n'
            'Thank you for booking with Travels Booking.\n'
            'We look forward to seeing you on board!\n'
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)

class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat')
        card_number = request.data.get('card_number', '')
        if not seat_id or len(card_number) < 12:
            return Response({'error': 'Invalid payment details'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            seat = Seat.objects.get(id=seat_id)
            if seat.is_book:
                return Response({'error': 'seat already booked'}, status=status.HTTP_400_BAD_REQUEST)

            seat.is_book = True
            seat.save()

            booking = Bookings.objects.create(
                user=request.user,
                bus=seat.bus,
                seat=seat,
            )
            self.send_booking_email(request.user, booking)
            serializer = BookingSerializer(booking)
            response_data = serializer.data
            response_data['message'] = self.build_booking_confirmation_message(request.user, booking)
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Seat.DoesNotExist:
            return Response({'error': 'invalid seat id'}, status=status.HTTP_400_BAD_REQUEST)

    def build_booking_confirmation_message(self, user, booking):
        return (
            f'Hi {user.username},\n\n'
            'Your payment was successful and your booking is confirmed.\n'
            f'Bus: {booking.bus.Bus_name} ({booking.bus.number})\n'
            f'Seat: {booking.seat.seat_number}\n'
            f'Route: {booking.bus.origin} → {booking.bus.destination}\n'
            f'Departure: {booking.bus.start_time}\n'
            f'Arrival: {booking.bus.reach_time}\n\n'
            'Thank you for choosing Travels Booking.'
        )

    def send_booking_email(self, user, booking):
        if not user.email:
            return
        subject = 'Your Travels Payment and Booking are Confirmed'
        message = self.build_booking_confirmation_message(user, booking)
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)

class UserBookingView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id!=user_id:
            return Response({"error":'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        bookings = Bookings.objects.filter(user_id=user_id)
        serializer=BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    