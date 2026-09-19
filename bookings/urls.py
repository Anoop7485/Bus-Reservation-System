app_name = 'bookings'
from django.urls import path
from .views import LoginView, RegisterView, BusListCreateView, BusDetailView, UserBookingView, BookingsView, PaymentView

urlpatterns = [
    path('buses/', BusListCreateView.as_view(), name='buslist'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('payment/', PaymentView.as_view(), name='payment'),
    path('user/<int:user_id>/bookings/', UserBookingView.as_view(), name='user-bookings'),
    path('booking/', BookingsView.as_view(), name='bookings'),
]
