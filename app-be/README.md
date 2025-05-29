# Backend API Template

A modern, scalable backend API template built with Node.js, Express, TypeScript, and Prisma. This template provides a solid foundation for building RESTful APIs with authentication, user management, and email functionality.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification
  - Password reset functionality
  - Role-based access control (SUPER_ADMIN, MANAGER, USER)

- **User Management**
  - User registration and login
  - Profile management
  - User CRUD operations
  - Audit logging

- **Email Service**
  - Email verification
  - Password reset emails
  - Configurable SMTP settings

- **Database**
  - Prisma ORM with SQLite (easily switchable to PostgreSQL, MySQL, etc.)
  - Database migrations
  - Type-safe database queries
  - Seed data for development

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface

- **Security**
  - Password hashing with bcrypt
  - Input validation
  - Error handling middleware
  - CORS configuration

## Tech Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- SQLite (included by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-be
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# App Configuration
APP_NAME="Your App Name"
APP_URL="http://localhost:4000"
PORT=4000
```

4. Generate Prisma client:
```bash
bun prisma generate
# or
npx prisma generate
```

5. Run database migrations:
```bash
bun prisma migrate dev
# or
npx prisma migrate dev
```

6. Seed the database (optional):
```bash
bun run prisma:seed
# or
npm run prisma:seed
```

7. Start the development server:
```bash
bun dev
# or
npm run dev
```

The API will be available at `http://localhost:4000`

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
bun prisma generate

# Create a new migration
bun prisma migrate dev --name <migration_name>

# Apply pending migrations in production
bun prisma migrate deploy

# Reset database (drops all data!)
bun prisma migrate reset

# Open Prisma Studio (GUI for database)
bun prisma studio

# Seed the database
bun run prisma:seed
```

### Migration Workflow

1. **Modify schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `bun prisma migrate dev --name add_user_field`
3. **Generate client**: Automatically happens after migration
4. **Update code**: Use the new fields in your TypeScript code

### Important Notes

- SQLite doesn't support native enums, so they're stored as strings
- DateTime fields automatically include seconds and are stored in ISO 8601 format
- The database file is located at `prisma/dev.db`
- Migrations are stored in `prisma/migrations/`

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:4000/api-docs
```

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Configuration files
│   ├── jwt.ts               # JWT configuration
│   └── swagger.ts           # Swagger configuration
├── controllers/              # Route controllers
│   ├── auth/                # Authentication controllers
│   └── user/                # User management controllers
├── database/                 # Database configuration
│   ├── client.ts            # Prisma client instance
│   └── seed.ts              # Database seed script
├── middleware/              # Express middleware
│   ├── auth/                # Authentication middleware
│   ├── error/               # Error handling middleware
│   └── validation/          # Request validation
├── models/                  # TypeScript interfaces and types
│   ├── interfaces/          # Data interfaces
│   ├── types/               # Type definitions
│   └── enums/               # Enum definitions
├── routes/                  # API routes
│   └── api/v1/              # Version 1 API routes
├── services/                # Business logic
│   ├── auth/                # Authentication services
│   └── user/                # User services
└── utils/                   # Utility functions
    ├── auth.ts              # Authentication utilities
    └── email.ts             # Email utilities
```

## Available Scripts

- `bun dev` - Start development server with hot reload
- `bun build` - Build for production
- `bun start` - Start production server
- `bun prisma:generate` - Generate Prisma client
- `bun prisma:migrate` - Run database migrations
- `bun prisma:studio` - Open Prisma Studio GUI
- `bun prisma:seed` - Seed database with sample data

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/profile` - Get current user profile (requires auth)
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users
- `GET /api/v1/users` - Get all users (requires auth)
- `POST /api/v1/users` - Create a new user (requires manager role)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires admin role)
- `PATCH /api/v1/users/:id/status` - Update user status (requires manager role)
- `PUT /api/v1/users/my-profile` - Update current user profile (requires auth)
- `POST /api/v1/users/change-password` - Change password (requires auth)

## Test Credentials

After running the seed script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super.admin@example.com | Password123 |
| Manager | manager@example.com | Password123 |
| User | user1@example.com | Password123 |
| User | user2@example.com | Password123 |
| User (Unverified) | user3@example.com | Password123 |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | Database connection string | Yes | - |
| JWT_SECRET | Secret key for JWT tokens | Yes | - |
| JWT_REFRESH_SECRET | Secret key for refresh tokens | Yes | - |
| EMAIL_USER | SMTP email address | Yes | - |
| EMAIL_PASS | SMTP password | Yes | - |
| APP_NAME | Application name | No | "App Template" |
| APP_URL | Application URL | No | "http://localhost:4000" |
| PORT | Server port | No | 4000 |

## Database Schema

### User Model
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  firstName              String
  lastName               String
  role                   String    @default("USER")
  status                 String    @default("PENDING_VERIFICATION")
  refreshToken           String?
  lastLoginAt            DateTime?
  emailVerificationToken String?
  emailVerifiedAt        DateTime?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  auditLogs              AuditLog[]
}
```

### Enums (stored as strings)
- **UserRole**: SUPER_ADMIN, MANAGER, USER
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION

## Extending the Template

### Adding New Features

1. **Create new models** in `prisma/schema.prisma`
2. **Run migrations**: `bun prisma migrate dev --name your_feature`
3. **Create interfaces** in `src/models/interfaces/`
4. **Create services** in `src/services/`
5. **Create controllers** in `src/controllers/`
6. **Add routes** in `src/routes/api/v1/`
7. **Update Swagger docs** in route files

### Switching Databases

To switch from SQLite to another database:

1. Update `datasource` in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql" // or "mysql", "mongodb", etc.
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

3. If using PostgreSQL/MySQL, change string enums back to native enums:
```prisma
enum UserRole {
  SUPER_ADMIN
  MANAGER
  USER
}
```

4. Run migrations:
```bash
bun prisma migrate dev
```

## Troubleshooting

### Common Issues

1. **Prisma Studio Error**: Make sure to run migrations first:
   ```bash
   bun prisma migrate dev
   ```

2. **TypeScript Errors**: Regenerate Prisma client:
   ```bash
   bun prisma generate
   ```

3. **Database Locked**: Stop all running processes and try again

4. **Email Not Sending**: 
   - Check Gmail app-specific password
   - Enable "Less secure app access" or use OAuth2

## Security Considerations

- Always use environment variables for sensitive data
- Keep dependencies up to date
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add request logging and monitoring
- Consider implementing API versioning
- Use proper CORS configuration for production

## License

This project is licensed under the MIT License.