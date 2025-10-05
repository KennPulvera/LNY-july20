# Pediatric Center Website - Codebase Context Guide

## Project Overview
This is a full-stack web application for a pediatric center offering developmental therapy services. The system includes a public-facing website for bookings and an admin dashboard for managing appointments and payments.

## Architecture
- **Frontend**: React.js application (`client/` directory)
- **Backend**: Node.js/Express API (`api/` directory)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system

## Project Structure

### Frontend (`client/`)
```
client/
├── public/                     # Static assets
├── src/
│   ├── features/ui/           # Main UI components
│   │   ├── LandingPage.jsx    # Main landing page container
│   │   ├── Header.jsx         # Navigation header with admin logout
│   │   ├── HeroSection.jsx    # Hero banner section
│   │   ├── ServicesSection.jsx # Professional consultation + programs
│   │   ├── AboutSection.jsx   # About the center
│   │   ├── ContactSection.jsx # Contact information
│   │   ├── CTASection.jsx     # Call-to-action section
│   │   ├── Footer.jsx         # Footer component
│   │   ├── AuthModal.jsx      # Login/registration modal
│   │   ├── BookingModal.jsx   # Appointment booking form
│   │   ├── PaymentPage.jsx    # Payment processing page
│   │   ├── AdminDashboard.jsx # Admin management interface
│   │   └── FloatingElements.jsx # Decorative animations
│   ├── App.jsx                # Main app component with routing
│   ├── index.js               # React entry point
│   └── styles/                # CSS files
│       ├── styles.css         # Main website styles
│       ├── admin-styles.css   # Admin dashboard styles
│       └── payment-styles.css # Payment page styles
```

### Backend (`api/`)
```
api/
├── features/
│   ├── bookings/              # Booking system
│   │   ├── bookings.controller.js
│   │   ├── bookings.model.js
│   │   ├── bookings.routes.js
│   │   └── bookings.validation.js
│   ├── users/                 # User management
│   │   ├── userController.js
│   │   ├── userModel.js
│   │   ├── userRoutes.js
│   │   └── userValidation.js
│   └── admin/                 # Admin functionality
│       └── admin.routes.js
├── middleware/
│   └── auth.js                # Authentication middleware
├── server.js                  # Express server entry point
└── package.json               # Backend dependencies
```

## Key Features

### 1. Landing Page System
- **Hero Section**: Animated welcome banner with call-to-action
- **Services Section**: Professional consultation team + therapy programs
- **About Section**: Information about the center
- **Contact Section**: Contact details and location
- **CTA Section**: Call-to-action for appointments
- **Footer**: Links and additional information

### 2. Booking System
- **BookingModal.jsx**: Multi-step booking form with:
  - Branch selection
  - Guardian information
  - Child details with age calculation
  - Appointment date/time selection
  - Form persistence using localStorage
  - Auto-save functionality with visual indicators
- **PaymentPage.jsx**: Payment processing with:
  - GCash and Bank Transfer options
  - QR code scanning and account details
  - 15-minute countdown timer with color-coded urgency
  - Real-time expiration handling
  - Form persistence for payment data

### 3. Admin Dashboard System
- **AdminDashboard.jsx**: Complete booking management with:
  - Booking overview with status badges
  - Payment verification system
  - Booking details modal (view and edit)
  - Payment status management (Verified, Pending, No Payment)
  - "Done" button for marking bookings completed
  - Color-coded payment method badges
  - Real-time booking updates

### 4. Authentication System
- **AuthModal.jsx**: User login/registration
- **Admin Authentication**: Separate admin login system
- **JWT Tokens**: Secure authentication with token storage
- **Logout Functionality**: Complete session termination

### 5. Form Persistence System
- **Booking Form**: Auto-saves all form fields as user types
- **Payment Form**: Saves payment method and confirmation data
- **Storage Keys**: 
  - `bookingFormData`: Booking form state
  - `paymentFormData`: Payment confirmation data
  - `selectedPaymentMethod`: Payment method selection
- **Smart Restoration**: Calculates age and loads time slots on restore
- **Visual Indicators**: Auto-save indicator and clear button

## Component Relationships

### Main App Flow
```
App.jsx
├── Header.jsx (with admin logout)
├── LandingPage.jsx
│   ├── HeroSection.jsx
│   ├── ServicesSection.jsx
│   ├── AboutSection.jsx
│   ├── ContactSection.jsx
│   ├── CTASection.jsx
│   └── Footer.jsx
├── AuthModal.jsx
├── BookingModal.jsx
├── PaymentPage.jsx
├── AdminDashboard.jsx
└── FloatingElements.jsx
```

## State Management

### Local Storage Data
- **Authentication**: `adminAuth`, `userData`, `userToken`
- **Booking Form**: `bookingFormData` (auto-saved)
- **Payment Form**: `paymentFormData`, `selectedPaymentMethod`

### Component State
- **BookingModal**: Form fields, validation, step management
- **PaymentPage**: Countdown timer, payment method, expiration state
- **AdminDashboard**: Bookings list, modal state, payment verification

## API Endpoints

### Booking Routes (`/api/bookings`)
- `GET /` - Get all bookings
- `POST /` - Create new booking
- `PUT /:id` - Update booking
- `DELETE /:id` - Delete booking

### User Routes (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `GET /bookings` - Get all bookings (admin)
- `PUT /bookings/:id` - Update booking status

## Payment System

### Payment Methods
- **GCash**: QR code scanning and account details
- **Bank Transfer**: BDO Unibank account information

### Payment Status
- **Verified**: Green badge, confirmed payment
- **Pending Verification**: Yellow badge, awaiting confirmation
- **No Payment**: Red badge, no payment submitted

### Payment Timer
- **15-minute countdown**: MM:SS format
- **Color progression**: Green → Yellow → Red (with pulsing)
- **Auto-expiration**: Disables form and redirects after 5 seconds

## Styling System

### CSS Files
- **styles.css**: Main website styling with animations
- **admin-styles.css**: Admin dashboard specific styles
- **payment-styles.css**: Payment page styling with timer animations

### Key Style Classes
- `.magic-service-card`: Animated service cards
- `.admin-nav-menu`: Admin-specific navigation
- `.payment-timer`: Countdown timer styling
- `.urgentPulse`: Pulsing animation for urgency
- `.modal-overlay`: Modal backdrop styling

## Important Technical Details

### Form Validation
- **Booking Form**: Real-time validation with error messages
- **Payment Form**: Reference number and account name validation
- **Admin Forms**: Booking status and payment verification

### Data Persistence
- **Auto-save**: Saves form data on every input change
- **Smart Restoration**: Restores form state with calculated fields
- **Error Handling**: Graceful handling of localStorage errors

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all forms
- **Admin Authorization**: Protected admin routes and functions

## Recent Modifications

### Admin Dashboard Enhancements
- Replaced User Database with Payment Information
- Added payment verification system
- Implemented booking details modal
- Added "Done" button for completing bookings
- Enhanced payment status badges

### Payment System Improvements
- Added 15-minute countdown timer
- Implemented unified Step 2 interface
- Added form persistence for payment data
- Enhanced expiration handling

### Form Persistence Implementation
- Added auto-save functionality to booking form
- Implemented visual indicators for auto-save
- Added clear button for form data
- Smart restoration with calculated fields

## Development Guidelines

### Code Organization
- Components are organized by feature in `features/ui/`
- Styles are separated by functionality
- API routes are organized by feature
- Models and controllers are paired

### Adding New Features
1. Create component in appropriate `features/ui/` directory
2. Add corresponding API routes in `api/features/`
3. Update styles in appropriate CSS file
4. Add to main App.jsx routing if needed
5. Update this context file

### Common Patterns
- **Modal Management**: Use state for open/close with overlay
- **Form Handling**: Implement auto-save with localStorage
- **API Integration**: Use async/await with try-catch
- **Styling**: Use CSS classes with BEM-like naming

## Dependencies

### Frontend Key Dependencies
- React.js: UI framework
- React Router: Navigation
- Font Awesome: Icons
- Date handling for appointment scheduling

### Backend Key Dependencies
- Express.js: Web framework
- Mongoose: MongoDB ODM
- JWT: Authentication
- Bcrypt: Password hashing
- Cors: Cross-origin requests

## Environment Variables
- Database connection strings
- JWT secret keys
- Payment gateway configurations
- Server port settings

This context file provides comprehensive information about the codebase structure, features, and implementation details for future AI assistance and development work. 