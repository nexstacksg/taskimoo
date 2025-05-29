# App Template

A full-stack application template with web, mobile, admin, and backend components.

## Architecture

This project consists of four main applications:

- **app-be**: Express.js backend API with Prisma ORM and PostgreSQL
- **app-web**: Next.js web application
- **app-mobile**: React Native mobile app with Expo
- **app-admin**: Next.js admin dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- PostgreSQL database

### Backend Setup (app-be)

```bash
cd app-be
bun install
cp .env.example .env
# Configure your database connection in .env
bun run prisma:migrate
bun run prisma:seed
bun run dev
```

The backend API will be available at `http://localhost:4000`

### Web App Setup (app-web)

```bash
cd app-web
bun install
bun run dev
```

The web application will be available at `http://localhost:3000`

### Mobile App Setup (app-mobile)

```bash
cd app-mobile
bun install
bun start
```

Use the Expo Go app to scan the QR code or run on simulators.

### Admin Dashboard Setup (app-admin)

```bash
cd app-admin
bun install
bun run dev
```

The admin dashboard will be available at `http://localhost:3100`

## Features

### Authentication System
- JWT-based authentication
- User registration and login
- Password reset functionality
- Protected routes

### Database
- Prisma ORM with PostgreSQL
- User management
- Database migrations and seeding

### API Documentation
- Swagger/OpenAPI documentation
- Input validation with express-validator
- Error handling middleware

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting
- Password hashing with bcrypt

## Tech Stack

### Backend (app-be)
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Swagger documentation

### Web (app-web)
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Mobile (app-mobile)
- React Native
- Expo Router
- TypeScript
- React Navigation

### Admin (app-admin)
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## Development

### Available Scripts

Each application has its own set of scripts:

- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint

### Testing

Backend includes Jest testing setup:

```bash
cd app-be
bun run test
```

## Deployment

Each application can be deployed independently:

- **Backend**: Deploy to any Node.js hosting service (Heroku, Railway, etc.)
- **Web/Admin**: Deploy to Vercel, Netlify, or any static hosting
- **Mobile**: Build and distribute through app stores using EAS Build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the ISC License.
