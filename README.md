# Bus Reservation System

This is a backend project developed using **Python, Django and Django REST Framework**.

The main purpose of this project is to provide REST APIs for managing buses, seats and bus bookings. Users can log in, check bus and seat details, and make bookings through the APIs.

## Technologies Used

* Python
* Django
* Django REST Framework
* JWT Authentication
* SQLite
* Thunder Client
* Git & GitHub

## Features

* User registration and login
* JWT authentication
* Bus management
* Seat management
* Seat availability
* Bus booking
* Booking management
* Payment workflow
* REST API development
* Protected APIs using authentication

## How the Project Works

1. User registers in the system.
2. User logs in and gets a JWT access token.
3. The access token is used to access protected APIs.
4. User can view available buses.
5. User can check seat information.
6. User selects a seat and creates a booking.
7. Booking information is stored in the database.
8. Payment details are handled as part of the booking process.

## Main Modules

### User

User authentication and account management.

### Bus

Stores bus information such as:

* Bus name/number
* Source
* Destination
* Travel details

### Seat

Manages seats associated with a bus and their availability.

### Booking

Stores information about:

* User
* Bus
* Selected seat
* Booking details
* Booking status

### Payment

Handles the payment part of the booking workflow.

## API Endpoints

### Authentication

```text
POST /api/register/
POST /api/login/
```

### Buses

```text
GET    /api/bus/
POST   /api/bus/
GET    /api/bus/{id}/
PUT    /api/bus/{id}/
DELETE /api/bus/{id}/
```

### Seats

```text
GET  /api/seat/
GET  /api/seat/{id}/
```

### Bookings

```text
GET  /api/booking/
POST /api/booking/
GET  /api/booking/{id}/
```

> Update the endpoint names above if your actual router URLs are different.

## Authentication

I used **JWT authentication** to protect the APIs.

After login, the user receives an access token.

The token is sent with requests using:

```text
Authorization: Bearer <access_token>
```

Only authenticated users can access the protected booking APIs.

## Database Relationship

The main relationships in the project are:

```text
User
  |
  | creates
  ↓
Booking
  |
  | belongs to
  ↓
Bus
  |
  | has
  ↓
Seat
```

## API Testing

I tested the APIs using **Thunder Client**.

I tested:

* User registration
* User login
* JWT authentication
* Getting bus details
* Checking seats
* Creating bookings
* Viewing bookings
* Updating booking information
* Payment workflow

## What I Learned

Through this project, I learned:

* How to build REST APIs using Django REST Framework
* How JWT authentication works
* How to create relationships between Django models
* How to use Django ORM
* How to manage seats and bookings
* How to protect APIs using authentication
* How to test APIs using Thunder Client
* How different APIs work together in a backend project

## Future Improvements

* Online payment gateway integration
* Email confirmation after booking
* Booking cancellation and refund
* Search buses by source and destination
* Pagination and filtering
* Swagger API documentation
* Deploying the project to the cloud

## Author

**Kummara Anoop**

Python | Django | REST API | SQL | AI/ML
