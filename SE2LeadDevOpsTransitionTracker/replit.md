# DevOps Leadership Transition Plan - 90 Day Tracker

## Overview

This is a comprehensive web application designed to help DevOps professionals transition from Senior Engineer to Team Lead roles over a 90-day period. The application provides structured tracking and management tools for the three-phase development plan: Foundation Building (Days 1-30), Leadership Development (Days 31-60), and Excellence & Optimization (Days 61-90).

The platform offers task management, team assessment tools, learning resource tracking, KPI metrics monitoring, weekly self-assessments, and risk mitigation planning. Users can monitor their progress through interactive dashboards, manage team member relationships, and track key performance indicators that demonstrate leadership effectiveness.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Docker Setup (Latest)**: Added comprehensive Docker containerization following 12 Factor App principles with multi-stage builds, health checks, and security best practices
- **Enhanced Export System**: Implemented dropdown export menu with JSON and CSV format options for comprehensive progress reporting
- **12 Factor Compliance**: Full adherence to 12 Factor App methodology including environment config, stateless processes, and proper backing services
- **Production Ready**: Complete deployment setup with docker-compose.yml, health monitoring, and proper database initialization
- **Export Functionality**: Implemented fully functional export report feature that generates comprehensive JSON reports with all user progress data
- **Responsive Export Button**: Made export button adapt to screen sizes with appropriate text and sizing
- **Navigation Enhancement**: Added collapsible sidebar navigation with responsive behavior that defaults to collapsed on devices less than 8 inches
- **UI Cleanup**: Removed demo user icon and username from header component for cleaner interface
- **Multipoint Checklist System**: Implemented comprehensive checklist management with CRUD operations, priority levels, progress tracking, and database integration

## System Architecture

### Frontend Architecture
The client is built using **React 18** with **TypeScript** and leverages modern React patterns including hooks and functional components. The UI is constructed with **shadcn/ui** components built on top of **Radix UI primitives**, providing accessible and customizable interface elements. **Tailwind CSS** handles styling with a comprehensive design system using CSS variables for theming.

Navigation is managed through **wouter** for client-side routing, providing a lightweight alternative to React Router. State management utilizes **TanStack Query** (React Query) for server state management, caching, and synchronization, eliminating the need for global state management libraries.

Form handling is implemented with **react-hook-form** combined with **Zod** for validation through **@hookform/resolvers**. This approach provides type-safe form validation with excellent developer experience.

### Backend Architecture
The server runs on **Node.js** with **Express.js** providing the REST API foundation. The application uses **TypeScript** throughout for type safety and better development experience. The build system combines **Vite** for frontend bundling and **esbuild** for server-side compilation.

API routes follow RESTful conventions and are organized by resource types (tasks, team members, learning resources, KPI metrics, assessments, risks, and activities). Each route includes proper error handling and authentication middleware.

### Database Design
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations. The database schema includes tables for user management, session storage, and all business entities (tasks, team members, learning resources, metrics, assessments, risks, activities, and phases).

Database connections are managed through **@neondatabase/serverless** with connection pooling for optimal performance. Migrations are handled through Drizzle Kit with schema definitions centralized in the shared directory.

### Authentication System
Authentication is implemented using **Replit's OpenID Connect (OIDC)** provider with **passport.js** for session management. User sessions are stored in PostgreSQL using **connect-pg-simple** for persistent session storage.

The system includes middleware for protecting routes and automatic session refresh. User profiles include basic information (email, name, profile image) synchronized from the OIDC provider.

### Data Architecture
The application follows a three-phase structure reflecting the 90-day transition plan:
- Phase 1: Foundation Building (Days 1-30)
- Phase 2: Leadership Development (Days 31-60) 
- Phase 3: Excellence & Optimization (Days 61-90)

Core entities include tasks with priority and status tracking, team members with assessment data, learning resources with progress tracking, KPI metrics with historical data, weekly assessments for self-reflection, and risk management with mitigation plans.

### File Structure
The project uses a monorepo structure with clear separation between client, server, and shared code. Path aliases are configured for clean imports, and the shared directory contains common types, schemas, and validation logic used by both client and server.

## External Dependencies

### Core Technologies
- **React 18** with TypeScript for the frontend framework
- **Express.js** with Node.js for the backend API server
- **PostgreSQL** with Drizzle ORM for data persistence
- **Neon Database** (@neondatabase/serverless) for serverless PostgreSQL hosting

### UI and Styling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Radix UI** for accessible, unstyled UI primitives
- **Lucide React** and **Font Awesome** for iconography

### Development and Build Tools
- **Vite** for frontend build tooling and development server
- **esbuild** for fast server-side TypeScript compilation
- **TypeScript** for static type checking across the entire codebase
- **Drizzle Kit** for database schema management and migrations

### Authentication and Session Management
- **Replit Auth** with OpenID Connect for user authentication
- **Passport.js** for authentication middleware and strategy management
- **express-session** with PostgreSQL storage for session persistence

### Form Handling and Validation
- **react-hook-form** for performant form management
- **Zod** with @hookform/resolvers for schema validation
- **@tanstack/react-query** for server state management and caching

### Optional File Upload (Configured but Not Required)
- **Google Cloud Storage** (@google-cloud/storage) for file storage
- **Uppy** components for file upload UI (dashboard, drag-drop, progress tracking)
- **AWS S3** integration through Uppy for alternative cloud storage

### Development Environment
- **Replit-specific** plugins for development environment integration
- **WebSocket** support (ws) for real-time features
- **PostCSS** with Autoprefixer for CSS processing