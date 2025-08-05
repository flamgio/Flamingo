# Flamgio - AI Collaboration Platform

## Overview

Flamgio is a modern AI-powered collaboration platform built as a full-stack web application. It features multiple AI specialists working together to assist users with various tasks including coding, design, writing, and analysis. The platform uses a conversational interface where users can interact with different AI specialists simultaneously through a unified chat experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, utilizing a modern component-based architecture:

- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: React with TypeScript for type safety
- **Component Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable UI components
- **Styling**: Tailwind CSS with a custom design system featuring Flamgio brand colors (orange, pink, coral gradients)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation

### Backend Architecture
The server-side follows a REST API architecture with Express.js:

- **Framework**: Express.js with TypeScript for the API server
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC) for secure authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Middleware**: Custom logging, error handling, and authentication middleware

### Data Storage Solutions
The application uses PostgreSQL as the primary database:

- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: 
  - Users table for authentication and profile management
  - Conversations table for chat sessions
  - Messages table for storing conversation history
  - Sessions table for authentication session persistence
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Connection Pool**: Neon serverless connection pooling for efficient database access

### Authentication and Authorization
Security is implemented through Replit's authentication system:

- **Authentication Provider**: Replit OIDC for seamless integration with the Replit ecosystem
- **Session Strategy**: Server-side sessions stored in PostgreSQL with configurable TTL
- **Authorization**: Route-level authentication middleware protecting API endpoints
- **User Management**: Automatic user creation and profile updates through OIDC claims

### AI Specialist System
The platform features a multi-agent AI system with specialized roles:

- **Coordinator AI**: Main orchestrator that manages interactions between specialists
- **Code AI**: Specialized in programming tasks and technical assistance
- **Design AI**: Focused on UI/UX design and visual elements
- **Writing AI**: Handles content creation and writing tasks
- **Analysis AI**: Provides data analysis and insights

Each specialist has distinct visual indicators and personas to help users understand which AI is responding.

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework for building user interfaces
- **Express.js**: Backend web framework for Node.js
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server for the frontend

### Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: CLI tool for database migrations and schema management

### Authentication Services
- **Replit Auth**: OIDC-based authentication system
- **openid-client**: OpenID Connect client library
- **passport**: Authentication middleware for Express
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

### UI and Component Libraries
- **@radix-ui/react-***: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library based on Radix UI
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating component variants
- **lucide-react**: Icon library

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React

### Development and Build Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
- **tsx**: TypeScript execution engine for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Form Handling and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Utility Libraries
- **date-fns**: Date utility library
- **nanoid**: URL-safe unique ID generator
- **clsx**: Conditional className utility
- **memoizee**: Function memoization library