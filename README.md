# LuxuryStay - Hotel Management & Online Booking Platform

A production-ready, enterprise-grade Hotel Management & Online Booking Platform built with **Spring Boot 3** (Java 21) backend and **React 19** (TypeScript) frontend.

## 🏨 Features

### Authentication & Authorization
- JWT Authentication with Access & Refresh Tokens
- Role-Based Access Control (Admin, Manager, Reception, Housekeeping, Staff, Customer)
- Password encryption with BCrypt
- Forgot Password / Reset Password flow
- Account lockout after failed attempts

### Hotel Management
- Full CRUD for hotels with images, amenities, and policies
- Hotel search with city, price, rating filters
- Featured hotels and popular destinations
- Hotel ratings and reviews

### Room Management
- Room types: Luxury Suite, Deluxe, Executive, Standard, Family, Villa, Penthouse
- Room availability calendar
- Seasonal/Weekend/Holiday pricing
- Room status and cleaning status tracking

### Booking System
- Real-time availability checking
- Check-in/Check-out date selection
- Guest count and children tracking
- Coupon code support with discount calculation
- Booking confirmation and email notifications
- Booking history, cancellation, and modification

### Payment Integration
- Stripe payment integration
- Razorpay payment integration
- Payment webhooks
- Refund processing
- Invoice generation

### Dashboards
- **Customer Dashboard**: Profile, bookings, wishlist, notifications, reviews, settings
- **Admin Dashboard**: Revenue charts, booking analytics, occupancy rates, room distribution

### Housekeeping
- Cleaning schedule management
- Room inspection tracking
- Maintenance request system

### Employee Management
- Employee CRUD
- Attendance tracking
- Salary and shift management

### Review System
- Verified reviews with ratings
- Like and reply functionality
- Report abuse feature

### Notifications
- Email notifications
- In-app notifications
- Push notification ready

## 🛠 Tech Stack

### Backend
- Java 21 + Spring Boot 3
- Spring Security with JWT
- Spring Data JPA + MySQL
- MapStruct (Object Mapping)
- Lombok (Boilerplate Reduction)
- OpenAPI/Swagger Documentation
- Maven (Build Tool)

### Frontend
- React 19 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router (Routing)
- TanStack Query (Server State)
- Axios (HTTP Client)
- React Hook Form + Zod (Forms & Validation)
- Framer Motion (Animations)
- Recharts (Charts)
- Lucide Icons

### Database
- MySQL 8.0+
- 30+ normalized tables with proper indexes

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.9+

### Database Setup
```sql
# Create database and run schema
mysql -u root -p < backend/src/main/resources/schema.sql
```

### Backend Setup
```bash
cd backend
# Update database credentials in src/main/resources/application.yml
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8080/api`.

### Default Credentials
- **Admin**: admin@luxurystay.com / Admin@12345

## 📁 Project Structure

```
luxurystay/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/luxurystay/
│   │   ├── config/                   # Spring configurations
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA entities
│   │   ├── enums/                    # Enumeration types
│   │   ├── exception/                # Custom exceptions
│   │   ├── mapper/                   # MapStruct mappers
│   │   ├── repository/               # Spring Data repositories
│   │   ├── security/                 # JWT & security
│   │   ├── service/                  # Business logic
│   │   │   └── impl/                # Service implementations
│   │   ├── scheduler/                # Scheduled tasks
│   │   └── util/                     # Utility classes
│   ├── src/main/resources/
│   │   ├── application.yml           # Application config
│   │   └── schema.sql                # Database schema
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── api/                      # API client & services
│   │   ├── components/               # Reusable components
│   │   │   └── layout/              # Layout components
│   │   ├── contexts/                 # React contexts
│   │   ├── hooks/                    # Custom hooks
│   │   ├── pages/                    # Page components
│   │   ├── types/                    # TypeScript types
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔐 Security Features

- JWT-based stateless authentication
- Role-based access control (RBAC)
- Password hashing with BCrypt
- CORS configuration
- Input validation with Bean Validation
- SQL injection prevention via JPA
- XSS protection
- Global exception handling

## 📊 API Documentation

Once the backend is running, access Swagger UI at:
```
http://localhost:8080/api/swagger-ui.html
```

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend type checking
cd frontend
npx tsc --noEmit
```

## 📝 License

MIT License - See LICENSE file for details.
