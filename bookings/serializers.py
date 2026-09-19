from rest_framework import serializers
from .models import Bus, Seat,Bookings
from django.contrib.auth.models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)

    class Meta:
        model=User
        fields=['username','email','password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model=Seat
        fields=['id','seat_number','is_book']


class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = [
            'id',
            'Bus_name',
            'number',
            'origin',
            'destination',
            'features',
            'start_time',
            'reach_time',
            'no_of_seats',
            'price',
            'available_seats',
            'seats',
        ]

    def get_available_seats(self, obj):
        return obj.seats.filter(is_book=False).count()


class BookingSerializer(serializers.ModelSerializer):
    bus = serializers.StringRelatedField()
    seat = SeatSerializer()
    user = serializers.StringRelatedField()

    class Meta:
        model = Bookings
        fields = '__all__'
        read_only_fields = ['user', 'booking_time', 'bus', 'seat']
        