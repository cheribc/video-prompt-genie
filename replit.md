# Video Prompt Generator Application

## Overview

This is a full-stack web application for generating AI video prompts with customizable parameters. The application features a React frontend with a modern UI built using shadcn/ui components, an Express.js backend API, and PostgreSQL database integration using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints for prompt generation and template management
- **Development**: Hot reload with tsx for server-side development

### Database Schema
- **Primary Tables**: 
  - `prompts`: Stores generated prompts with metadata and configuration
  - `templates`: Contains reusable prompt templates with usage tracking
- **Key Features**: JSON columns for flexible configuration storage, timestamp tracking, and usage analytics

## Key Components

### Prompt Generation System
- **Configuration Interface**: Multi-parameter form for customizing video prompt generation
- **Template Library**: Searchable collection of pre-built prompt templates
- **Variations Generator**: API endpoint for creating multiple prompt variations from a single configuration
- **Real-time Preview**: Live preview of prompt generation based on current settings

### Template Management
- **CRUD Operations**: Full create, read, update, delete functionality for templates
- **Search & Filter**: Text search and category-based filtering
- **Usage Tracking**: Analytics for template popularity and usage frequency
- **Rating System**: Community-driven template rating system

### Data Storage Strategy
- **Development**: In-memory storage implementation for rapid development
- **Production**: PostgreSQL database with Drizzle migrations
- **Configuration**: Environment-based database connection management

## Data Flow

1. **User Configuration**: User selects prompt parameters through the React frontend
2. **API Request**: Frontend sends configuration to Express backend via TanStack Query
3. **Prompt Generation**: Backend processes configuration and generates customized prompt
4. **Database Storage**: Generated prompts are stored with metadata for future reference
5. **Response Delivery**: Generated prompt is returned to frontend and displayed to user
6. **Template Integration**: Users can save successful configurations as reusable templates

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitive components
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **zod**: Runtime type validation and schema definition

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting in development
- **@replit/vite-plugin-cartographer**: Development environment integration
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Static type checking

### UI Enhancement Libraries
- **class-variance-authority**: Dynamic class name generation
- **cmdk**: Command menu implementation
- **embla-carousel-react**: Carousel/slider functionality
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Build Process
- **Frontend Build**: Vite builds React application to static assets in `dist/public`
- **Backend Build**: esbuild bundles Express server with external dependencies to `dist/index.js`
- **Database Migrations**: Drizzle generates and applies PostgreSQL migrations

### Environment Configuration
- **Development**: Local development with hot reload and in-memory storage
- **Production**: Node.js server with PostgreSQL database connection
- **Environment Variables**: Database URL and other sensitive configuration via environment variables

### Development Workflow
- **npm run dev**: Starts development server with hot reload
- **npm run build**: Creates production build of both frontend and backend
- **npm run start**: Runs production server
- **npm run db:push**: Applies database schema changes

## Recent Changes

### January 19, 2025
- **Copy Functionality Enhancement**: Added comprehensive copy-to-clipboard functionality
  - Main prompt text copy button
  - Dedicated JSON format copy button  
  - Individual copy buttons for each prompt variation
  - Toast notifications for successful copy operations
- **User Interface Polish**: Improved usability with intuitive copy icons and clear feedback