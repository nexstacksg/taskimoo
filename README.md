# App Template - Full-Stack Application Template

A modern full-stack application template with authentication and user management. Built with Next.js, Express.js, React Native, and TypeScript.

## 🏗️ Monorepo Structure

```
app-template/
├── packages/
│   └── shared-types/          # Shared TypeScript types and interfaces
├── app-be/                    # Backend API (Express.js + TypeScript + Prisma)
├── app-web/                   # Customer web portal (Next.js)
├── app-admin/                 # Admin portal (Next.js)
├── app-mobile/                # Mobile app (React Native/Expo)
└── docs/                      # Documentation files
    ├── CLAUDE.md             # AI assistant instructions
    ├── architecture.md       # System architecture
    ├── developer.md          # Developer guide
    └── project.md            # Project overview
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- SQLite (for development)
- iOS/Android development environment (for mobile app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/app-template.git
   cd app-template
   ```

2. **Install dependencies for each app**

   **Backend API:**
   ```bash
   cd app-be
   bun install
   cp .env.example .env  # Configure your environment variables
   bun run prisma:migrate
   bun run prisma:seed
   ```

   **Web Portal:**
   ```bash
   cd app-web
   bun install
   ```

   **Admin Portal:**
   ```bash
   cd app-admin
   bun install
   ```

   **Mobile App:**
   ```bash
   cd app-mobile
   bun install
   ```

### Running the Applications

1. **Start the Backend API** (Port 4000)
   ```bash
   cd app-be
   bun run dev
   ```

2. **Start the Web Portal** (Port 3000)
   ```bash
   cd app-web
   bun run dev
   ```

3. **Start the Admin Portal** (Port 3100)
   ```bash
   cd app-admin
   bun run dev
   ```

4. **Start the Mobile App**
   ```bash
   cd app-mobile
   bun run start
   # Press 'i' for iOS or 'a' for Android
   ```

## 📦 Shared Types Package

All TypeScript types and interfaces are centralized in the `@app/shared-types` package to ensure consistency across all applications.

### Structure
```
packages/shared-types/
├── src/
│   ├── index.ts              # Main export file
│   ├── enums/               # Shared enumerations
│   ├── types/               # Common types
│   │   ├── auth.ts          # Authentication types
│   │   └── common.ts        # Common/utility types
│   └── models/              # Data model interfaces
│       └── user.ts          # User model interfaces
```

### Usage

The shared-types package is linked locally using the `file:` protocol in each app's `package.json`:

```json
{
  "dependencies": {
    "@app/shared-types": "file:../packages/shared-types"
  }
}
```

Import types in your code:
```typescript
import { UserRole, IUser, ApiResponse } from '@app/shared-types';
```

## 👥 User Roles

The template supports three user roles with different access levels:

- **SUPER_ADMIN**: Platform administrators with full system access
- **MANAGER**: Middle-level users with management capabilities
- **USER**: Standard users with basic access

## 🔑 Features

- **Authentication**: Email/password login with JWT tokens
- **User Management**: User registration, profile management
- **Role-based Access**: Different permissions for different user types
- **Email Verification**: Email verification workflow
- **Password Reset**: Forgot password functionality
- **Multi-platform**: Web, admin portal, and mobile apps

## 🛠️ Development

### Database Commands

```bash
# Run migrations
bun run prisma:migrate

# Open Prisma Studio
bun run prisma:studio

# Seed the database
bun run prisma:seed

# Generate Prisma client
bun run prisma:generate
```

### Build Commands

```bash
# Build backend
cd app-be && bun run build

# Build web apps
cd app-web && bun run build
cd app-admin && bun run build

# Build mobile app
cd app-mobile && eas build
```

### Testing

```bash
# Run backend tests
cd app-be && bun run test

# Run web app tests
cd app-web && bun run test
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure HTTP-only cookies for web sessions
- Email verification and password reset functionality

## 🌍 Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
```

### Web Apps (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

### Mobile App
Configure in `app.json` or use environment-specific config files.

## 📄 API Documentation

The backend API is documented with Swagger/OpenAPI. Access the documentation at:
```
http://localhost:4000/api-docs
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ as a modern app template