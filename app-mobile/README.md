# Mobile App

React Native/Expo mobile application with authentication system.

## Features

- **Authentication Flow**

  - Login with email and password
  - User registration with email verification
  - Forgot password functionality
  - Persistent authentication state
  - Development credentials display for easy testing

- **Form Validation**

  - Email format validation
  - Password requirements
  - Real-time error feedback

- **Security**

  - JWT token authentication
  - Automatic token refresh
  - Secure storage using AsyncStorage

- **Development Features**
  - Built-in test credentials on login screen
  - Easy setup for development and testing

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update the API URL in `.env` to match your backend:

```
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Development Credentials

For easy testing during development, the login screen displays test credentials:

- **Email**: `user1@example.com`
- **Password**: `Password123`

These credentials are shown directly on the login screen for convenience during development.

## Running the App

```bash
# Start the development server
bun start

# Run on iOS
bun ios

# Run on Android
bun android

# Run on web
bun web
```

## Project Structure

```
app-mobile/
├── app/                  # Expo Router app directory
├── contexts/            # React contexts (Auth)
├── navigation/          # Navigation configuration
├── screens/             # Screen components
│   └── auth/           # Authentication screens (LoginScreen.tsx with dev credentials)
├── services/           # API services
├── components/         # Reusable components
└── constants/          # App constants
```

## Authentication Flow

1. **Login**: Users authenticate with email and password
2. **Register**: New users sign up with email verification
3. **Email Verification**: Users must verify email before accessing the app
4. **Forgot Password**: Password reset via email

## API Integration

The app communicates with the backend API:

- Base URL configured in `.env`
- Automatic token management
- Request/response interceptors for auth

## Development Notes

- Development credentials are displayed on the login screen for easy testing
- Uses React Native Navigation for screen management
- Implements form validation with react-hook-form
- TypeScript configuration includes JSX support for React Native
