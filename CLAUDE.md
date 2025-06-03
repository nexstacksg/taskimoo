# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskiMoo is a comprehensive AI-powered project management platform designed specifically for software development teams. It integrates traditional project management methodologies with cutting-edge AI capabilities to streamline the entire software development lifecycle - from requirements gathering to deployment monitoring.

### Key Features:
- **AI-Powered Requirements Management**: Natural language processing, automatic categorization, and test case generation
- **Persona & User Story Management**: Visual persona builder with AI-generated user stories
- **Advanced Task Management**: Multiple views (Kanban, Gantt, Calendar, etc.) with AI predictions
- **Real-time Collaboration**: Whiteboards, co-editing, and integrated communication
- **Source Code & Deployment Integration**: Git repository connections and CI/CD pipeline management
- **Automation Engine**: Event-driven workflows and process automation
- **AI Assistant**: Natural language task creation, predictive analytics, and content generation

### User Roles:
- **Admin**: Full system access and configuration
- **Project Manager**: Project planning and team management
- **Developer**: Development tasks and code integration
- **Tester**: Quality assurance and test management
- **Viewer**: Read-only access to project information
- **Guest**: Limited access for external stakeholders

## Repository Structure

- `app-be/` - Backend API (Express.js + TypeScript + Prisma)
- `app-web/` - Customer web portal (Next.js)
- `app-admin/` - Admin web portal (Next.js)
- `app-mobile/` - Mobile app (React Native/Expo)
- `packages/shared-types/` - Shared TypeScript types for all apps

## Common Development Commands

### Backend (app-be)

```bash
bun run dev              # Start dev server with hot reload
bun run prisma:migrate   # Run database migrations
bun run prisma:studio    # Open Prisma Studio GUI
bun run prisma:seed      # Seed database
bun run build           # Build TypeScript
bun run test            # Run tests
bun run lint            # Run ESLint
bun run format          # Run Prettier
```

### Web Apps (app-web, app-admin)

```bash
bun run dev             # Start Next.js dev server
bun run build           # Build for production
bun run start           # Start production server
bun run lint            # Run Next.js linting
```

### Mobile App (app-mobile)

```bash
bun run start           # Start Expo dev server
bun run android         # Run on Android
bun run ios             # Run on iOS
bun run web             # Run on web browser
bun run lint            # Run Expo linting
```

### Shared Types (packages/shared-types)

```bash
# Types are linked locally using file: protocol
# Import in any app:
import { UserRole, IUser } from '@app/shared-types';
```

## Type Sharing

All TypeScript types, interfaces, and enums are centralized in `packages/shared-types`:

```typescript
// Import shared types in any app
import { IUser, UserRole, ApiResponse } from '@app/shared-types';
```

See [packages/shared-types/README.md](packages/shared-types/README.md) for detailed usage.

## Architecture Notes

### Backend Architecture

- RESTful API built with Express.js and TypeScript
- Prisma ORM for database operations
- JWT authentication with role-based access control (Admin, Project Manager, Developer, Tester, Viewer, Guest)
- Modular structure: controllers, services, models, middleware
- API versioning (v1) in routes
- WebSocket support for real-time collaboration features
- Integration points for Git repositories and CI/CD pipelines

### Frontend Architecture

- Next.js 15+ with App Router
- Server-side rendering and API routes
- Tailwind CSS for styling
- TypeScript for type safety
- Real-time collaboration with WebSocket connections
- Rich text editors and whiteboard canvas components
- Drag-and-drop interfaces for task management

### Mobile Architecture

- Expo SDK with React Native
- Tab-based navigation
- Themed components system
- Platform-specific code handling (iOS/Android)
- Offline-first with data synchronization
- Push notifications for task updates
- Voice command integration

### AI Integration Architecture

- Natural language processing for requirement analysis
- Machine learning models for predictive analytics
- Content generation APIs for documentation
- Intelligent task assignment and workload balancing
- Pattern recognition for workflow optimization

### Key Integration Points

- Authentication: JWT tokens shared between web and mobile
- API: All clients communicate with app-be backend
- Database: SQLite (dev), PostgreSQL (production)
- Shared Types: All apps use @app/shared-types for TypeScript definitions
- External Integrations: GitHub, GitLab, Slack, Jira, Figma
- Real-time: WebSocket connections for collaborative features
- AI Services: NLP and ML models for intelligent features

## Important Considerations

1. **AI-Powered Platform**: TaskiMoo leverages AI throughout the development lifecycle for requirements, task management, and predictions.

2. **Role-based Access**: Six distinct user roles with granular permissions for project management features.

3. **Multi-platform**: Comprehensive support for web, admin portal, mobile apps, and browser extensions.

4. **Collaboration-First**: Real-time collaboration features including whiteboards, co-editing, and integrated communication.

5. **Enterprise-Ready**: Built with security, compliance, and scalability in mind for software development teams.
