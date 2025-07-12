# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 9002 with Turbopack)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`
- **Type checking**: `npm run typecheck`
- **Install dependencies**: `npm install`

### AI Development Commands
- **Start Genkit development**: `npm run genkit:dev`
- **Start Genkit with watch mode**: `npm run genkit:watch`

## Architecture Overview

This is a Next.js 15 application for **Deskwise**, an AI-powered Professional Services Automation (PSA) platform designed for Managed Service Providers (MSPs) and IT teams.

### Technology Stack
- **Frontend**: Next.js 15 with React 18, TypeScript, App Router
- **Build Tool**: Turbopack (for development)
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model
- **UI Components**: Radix UI primitives with custom components
- **Styling**: Tailwind CSS with custom design system
- **Database**: Planned Firebase integration (not yet implemented)
- **Authentication**: Planned Firebase Auth (not yet implemented)
- **Deployment**: Firebase App Hosting

### Project Structure

#### App Router Structure
- `src/app/(app)/`: Main application pages (dashboard, tickets, assets, etc.)
- `src/app/(marketing)/`: Marketing website pages (landing, pricing, features)
- `src/app/portal/`: Client portal interface
- Layout groups: `(app)`, `(marketing)`, `(portal)` with dedicated layouts

#### Key Directories
- `src/components/`: Reusable UI components organized by feature
- `src/lib/`: Utilities, types, and placeholder data
- `src/ai/`: Google Genkit AI integration and configuration
- `src/components/ui/`: Base UI components (shadcn/ui style)

### Core Features and Modules

The platform supports both **MSP mode** (multi-tenant) and **Internal IT mode** (single organization):

#### Core Modules (Available in both modes)
- Dashboard with personal/company views
- Tickets (IT service requests)
- Incidents (service disruptions)
- Projects (task management)
- Scheduling (technician calendar)
- Change Management (IT change approval)
- Assets (device/infrastructure tracking)
- Inventory (stock management)
- Knowledge Base (internal/public articles)
- Settings (configuration)

#### MSP-Specific Modules
- Clients (customer management)
- Contacts (client contact management)
- Quoting (sales proposals)
- Billing (contracts and recurring billing)
- Service Catalogue (service offerings)

### Key Architecture Patterns

#### Component Organization
- Feature-based component grouping (`components/layout/`, `components/ai/`, etc.)
- Shared UI components in `components/ui/`
- Page components follow Next.js App Router conventions

#### Type System
- Comprehensive TypeScript types in `src/lib/types.ts`
- Covers all entities: Tickets, Assets, Clients, Projects, etc.
- Includes complex types like permissions, SLA policies, and custom fields

#### AI Integration
- Google Genkit configured in `src/ai/genkit.ts`
- Uses Gemini 2.0 Flash model
- AI assistant component for ticket resolution and content generation

#### Design System
- Custom Tailwind configuration with brand colors
- Radix UI components for accessibility
- Consistent component patterns across the application
- Theme support (light/dark mode)

#### Data Management
Currently uses placeholder data (`src/lib/placeholder-data.ts`). Firebase integration is planned but not implemented:
- No Firebase configuration present
- No authentication system implemented
- No database connections established
- Application ready for Firebase integration

### Development Notes

#### Page Routing
- Uses Next.js App Router with TypeScript
- Dynamic routes: `[id]/page.tsx` for detail views
- Nested routes for complex features
- Route groups for different application sections

#### Styling Approach
- Tailwind CSS with custom configuration
- Component-level styling with consistent patterns
- Responsive design with mobile-first approach
- Inter font family via Google Fonts

#### State Management
- React hooks and local state
- Context planned for authentication and global state
- No external state management library currently used

#### Performance
- Turbopack for fast development builds
- Next.js optimizations (Image, Link components)
- Component lazy loading where appropriate

### Missing Implementation

**Firebase Backend**: While the project is configured for Firebase hosting and has Firebase as a dependency, the actual Firebase integration is not implemented:
- No Firebase initialization
- No authentication system
- No database connections
- No security rules

**Environment Configuration**: No environment files present, though Firebase environment variables are expected.

This is a comprehensive PSA platform in active development, with a solid foundation ready for backend integration and additional feature development.