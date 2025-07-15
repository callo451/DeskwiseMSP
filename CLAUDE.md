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
- **Database**: MongoDB Atlas with Node.js driver
- **Authentication**: WorkOS AuthKit for enterprise authentication
- **Deployment**: Firebase App Hosting

### Project Structure

#### App Router Structure
- `src/app/(app)/`: Main application pages (dashboard, tickets, assets, etc.)
- `src/app/(marketing)/`: Marketing website pages (landing, pricing, features)
- `src/app/portal/`: Client portal interface
- Layout groups: `(app)`, `(marketing)`, `(portal)` with dedicated layouts

#### Key Directories
- `src/components/`: Reusable UI components organized by feature
- `src/lib/`: Utilities, types, placeholder data, and MongoDB connection
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
- **MongoDB Atlas**: Connected via Node.js driver (`src/lib/mongodb.ts`)
- **Connection String**: Configured in `.env.local` environment file
- **Placeholder Data**: Currently uses placeholder data (`src/lib/placeholder-data.ts`) for development
- **Database Integration**: Ready for production data migration from placeholder to MongoDB collections
- **Authentication**: WorkOS AuthKit integrated for enterprise-grade authentication

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

## Environment Configuration

Required environment variables (in `.env.local`):
- `MONGODB_URI`: MongoDB Atlas connection string for database access
- `WORKOS_API_KEY`: WorkOS API key for authentication
- `WORKOS_CLIENT_ID`: WorkOS client ID for your application
- `WORKOS_COOKIE_PASSWORD`: 32-character random string for cookie encryption
- `WORKOS_REDIRECT_URI`: Authentication callback URL (e.g., http://localhost:9002/auth/callback)

## Database Usage

Import the MongoDB client in your API routes or server components:

```typescript
import clientPromise from '@/lib/mongodb'

// Example usage
const client = await clientPromise
const db = client.db('deskwise')
const collection = db.collection('tickets')
```

## Implemented MongoDB Modules

### **Tickets Module** ✅ **Complete**
- **Database Collection**: `deskwise.tickets`
- **Service Layer**: `src/lib/services/tickets.ts`
- **API Routes**: `/api/tickets`, `/api/tickets/[id]`, `/api/tickets/stats`, `/api/tickets/personal-stats`
- **Features**: Full CRUD operations, filtering, statistics, SLA tracking
- **Components Updated**: Ticket list, creation form, detail view, dashboard metrics

### **Scheduling Module** ✅ **Complete with Advanced Features**
- **Database Collection**: `deskwise.schedule_items`
- **Service Layer**: `src/lib/services/scheduling.ts` (enhanced with advanced scheduling algorithms)
- **API Routes**: 
  - Basic: `/api/schedule`, `/api/schedule/[id]`, `/api/schedule/by-date`
  - Advanced: `/api/schedule/recurring`, `/api/schedule/workload`, `/api/schedule/optimal-slot`, `/api/schedule/conflicts`
- **Advanced Features**:
  - **Recurring Events**: Daily, weekly, monthly, yearly patterns with end dates/occurrences
  - **Conflict Detection**: Real-time scheduling conflict identification
  - **Workload Analysis**: Technician utilization tracking and visualization with charts
  - **Optimal Time Slot Finding**: AI-powered scheduling recommendations based on availability
  - **Appointment Creation**: Comprehensive dialog with recurring support and conflict checking
- **Components**: 
  - Enhanced scheduling page with workload analysis and appointment creation
  - `AppointmentCreationDialog`: Multi-tab interface for creating appointments with recurring support
  - `WorkloadAnalysisPanel`: Visual dashboard for technician capacity planning with charts
- **Extended Types**: `RecurrencePattern`, enhanced `ScheduleItem` with status, priority, skills, equipment

### **Dashboard Module** ✅ **Complete**
- **Real-time Integration**: Uses live ticket data from MongoDB
- **API Integration**: `/api/tickets/stats` and `/api/tickets/personal-stats`
- **Features**: Company and personal dashboards with live metrics
- **Components Updated**: Both personal and company dashboard views

### **Incidents Module** ✅ **Complete**
- **Database Collections**: `deskwise.incidents`, `deskwise.incident_updates`
- **Service Layer**: `src/lib/services/incidents.ts` with comprehensive incident management
- **API Routes**: 
  - Basic: `/api/incidents`, `/api/incidents/[id]`, `/api/incidents/stats`
  - Updates: `/api/incidents/[id]/updates`, `/api/incidents/[id]/updates/[updateId]`
  - Public: `/api/incidents/public` (for status page)
- **Features**:
  - **Incident Management**: Full CRUD operations with status tracking
  - **Status Updates**: Timeline-based incident communication
  - **Multi-tenant Support**: Client-specific and "All clients" incident scoping
  - **Public Status Page**: Customer-facing incident visibility
  - **Service Impact Tracking**: Multi-service incident categorization
  - **Audit Trail**: Complete incident lifecycle tracking
- **Components Updated**: 
  - Incidents list page with real-time data and delete functionality
  - New incident creation with MongoDB persistence
  - Public status page with live incident feed
- **Database Schema**: Comprehensive incident and update tracking with audit fields

### **Change Management Module** ✅ **Complete**
- **Database Collections**: `deskwise.change_requests`, `deskwise.change_approvals`
- **Service Layer**: `src/lib/services/change-management.ts` with comprehensive change request management
- **API Routes**: 
  - Basic: `/api/change-requests`, `/api/change-requests/[id]`, `/api/change-requests/stats`
  - Workflow: `/api/change-requests/[id]/approve`, `/api/change-requests/[id]/reject`
  - Advanced: `/api/change-requests/upcoming` (scheduled changes)
- **Features**:
  - **Change Request Management**: Full CRUD operations with status tracking
  - **Approval Workflow**: Approve/reject changes with audit trail
  - **Risk and Impact Assessment**: Multi-level risk and impact categorization
  - **Timeline Tracking**: Planned vs actual dates for change execution
  - **Associated Resources**: Link changes to assets and tickets
  - **Upcoming Changes**: View scheduled changes within specified timeframes
  - **Statistics Dashboard**: Comprehensive analytics on change patterns
- **Components Updated**: 
  - Change Management list page with real-time data and approval actions
  - New change request creation with MongoDB persistence
  - Change request detail view with live data
  - Integrated approval/rejection workflow
- **Database Schema**: Complete change request lifecycle tracking with approval audit trail

### **Projects Module** ✅ **Complete**
- **Database Collections**: `deskwise.projects`, `deskwise.project_tasks`, `deskwise.project_milestones`
- **Service Layer**: `src/lib/services/projects.ts` with comprehensive project management
- **API Routes**: 
  - Basic: `/api/projects`, `/api/projects/[id]`, `/api/projects/stats`
  - Tasks: `/api/projects/[id]/tasks`, `/api/projects/[id]/tasks/[taskId]`
  - Milestones: `/api/projects/[id]/milestones`, `/api/projects/[id]/milestones/[milestoneId]`
  - Advanced: `/api/projects/upcoming` (scheduled projects)
- **Features**:
  - **Project Management**: Full CRUD operations with status and progress tracking
  - **Task Management**: Create, update, delete tasks with status tracking and progress calculation
  - **Milestone Tracking**: Project milestone management with completion status
  - **Budget Tracking**: Total and used budget monitoring with utilization metrics
  - **Team Management**: Team member assignment and collaboration
  - **Progress Automation**: Automatic progress calculation based on task completion
  - **Timeline Management**: Start/end date tracking with actual vs planned dates
  - **Multi-client Support**: Project organization by client with filtering
  - **Statistics Dashboard**: Comprehensive project analytics and reporting
- **Components Updated**: 
  - Projects list page with real-time data, statistics, and delete functionality
  - New project creation with MongoDB persistence and form validation
  - Project detail view with live task and milestone management
  - Interactive task status updates with progress recalculation
- **Database Schema**: Complete project lifecycle tracking with tasks, milestones, and audit trails

### **Knowledge Base Module** ✅ **Complete**
- **Database Collections**: `deskwise.articles`, `deskwise.categories`, `deskwise.tags`
- **Service Layer**: `src/lib/services/knowledge-base.ts` with comprehensive article management
- **API Routes**: 
  - Basic: `/api/knowledge-base`, `/api/knowledge-base/[id]`, `/api/knowledge-base/stats`
  - Management: `/api/knowledge-base/[id]/archive`, `/api/knowledge-base/categories`, `/api/knowledge-base/tags`
  - Advanced: `/api/knowledge-base/search` (full-text search with validation)
- **Features**:
  - **Article Management**: Full CRUD operations with versioning and audit trail
  - **Content Search**: Full-text search across title, content, category, and tags with MongoDB regex
  - **Category System**: Hierarchical category structure with automatic article counting
  - **Tag Management**: Tag system with usage statistics and color coding
  - **Archive Functionality**: Soft deletion with archive/restore capabilities
  - **View Tracking**: Article view count analytics and engagement metrics
  - **Access Control**: Visibility permissions by user group with inheritance
  - **Content Types**: Support for Internal and Public article classifications
  - **Markdown Rendering**: Sanitized markdown content with ReactMarkdown
  - **AI Integration**: AI-powered article generation using Google Genkit
- **Components Updated**: 
  - Knowledge Base list page with real-time search, filtering, archive, and delete functionality
  - Article detail view with metadata display, view tracking, and enhanced navigation
  - New article creation with MongoDB persistence, AI generation, and form validation
  - Hierarchical category tree with article counts and filtering
- **Database Schema**: Complete article lifecycle with versioning, categories, tags, and analytics

### **Clients Module** ✅ **Complete**
- **Database Collection**: `deskwise.clients`
- **Service Layer**: `src/lib/services/clients.ts` with comprehensive client management
- **API Routes**: 
  - Basic: `/api/clients`, `/api/clients/[id]`, `/api/clients/stats`
  - Advanced: Search, filtering by status, and client metrics
- **Features**:
  - **Client Management**: Full CRUD operations with organization-scoped access
  - **Client Statistics**: Real-time dashboard metrics (total, active, onboarding, inactive)
  - **Contact Management**: Primary contact information and relationship tracking
  - **Counter Management**: Automatic tracking of associated tickets and contacts
  - **Search Functionality**: Find clients by name or industry with MongoDB regex
  - **Status Management**: Active, Inactive, and Onboarding status tracking
  - **Client Metrics**: Associated data counts (tickets, assets, contacts, contracts)
  - **Multi-tenant Security**: Complete organization-based data isolation
- **Components Updated**: 
  - Clients list page with real-time data, statistics dashboard, and delete functionality
  - Client detail view with live data loading and associated entity placeholders
  - Interactive client management with loading states and error handling
- **Database Schema**: Complete client lifecycle tracking with contact info, status, and audit trails

### **Quoting Module** ✅ **Complete**
- **Database Collections**: `deskwise.quotes`, `deskwise.service_catalogue`
- **Service Layer**: `src/lib/services/quotes.ts` with comprehensive quote and service catalogue management
- **API Routes**: 
  - Basic: `/api/quotes`, `/api/quotes/[id]`, `/api/quotes/stats`
  - Service Catalogue: `/api/service-catalogue`, `/api/service-catalogue/[id]`, `/api/service-catalogue/seed`
  - Advanced: Filtering by status, client, search functionality
- **Features**:
  - **Quote Management**: Full CRUD operations with organization-scoped access
  - **Quote Statistics**: Real-time dashboard metrics (total, draft, sent, accepted, rejected quotes)
  - **Conversion Tracking**: Quote conversion rates and acceptance analytics
  - **Line Item Management**: Dynamic quote line items with quantity and pricing
  - **Service Catalogue**: Comprehensive service offerings management (Fixed, Recurring, Hourly)
  - **Client Integration**: Seamless integration with clients module for quote-client relationships
  - **Status Workflow**: Draft → Sent → Accepted/Rejected status management
  - **Financial Tracking**: Total quote values, accepted values, and average quote metrics
  - **Multi-tenant Security**: Complete organization-based data isolation
  - **Service Seeding**: Default service catalogue for new organizations
- **Components Updated**: 
  - Quoting list page with real-time data, statistics dashboard, filtering, and delete functionality
  - New quote creation form with client integration, service catalogue, and dynamic line items
  - Live statistics dashboard with conversion metrics and financial tracking
- **Database Schema**: Complete quote lifecycle tracking with line items, service catalogue, and audit trails

### **Billing Module** ✅ **Complete**
- **Database Collections**: `deskwise.contracts`, `deskwise.time_logs`, `deskwise.sla_policies`, `deskwise.invoices`
- **Service Layer**: `src/lib/services/billing.ts` with comprehensive billing, contract, and invoice management
- **API Routes**: 
  - Basic: `/api/billing`, `/api/billing/[id]`, `/api/billing/stats`
  - Time Logs: `/api/billing/[id]/time-logs` with GET and POST for billable hours tracking
  - Invoices: `/api/billing/[id]/invoices` with GET and POST for automated invoice generation
  - SLA Policies: `/api/sla-policies` with comprehensive SLA target management
- **Features**:
  - **Contract Management**: Full CRUD operations with recurring billing and service definitions
  - **Monthly Recurring Revenue (MRR)**: Automatic MRR calculation from contract services
  - **Time Logging**: Billable hours tracking with technician, category, and work description
  - **Invoice Generation**: Automated invoice creation from contract services and billing periods
  - **SLA Policy Management**: Service level agreements with response/resolution time targets
  - **Contract Statistics**: Real-time dashboard metrics (MRR, active contracts, renewals, ARR)
  - **Client Integration**: Seamless contract-client relationships with quote-to-contract conversion
  - **Service Management**: Dynamic contract services with quantity, rate, and total calculations
  - **Multi-tenant Security**: Complete organization-based data isolation for all billing data
  - **Audit Trail**: Complete contract lifecycle tracking with creation and modification history
- **Components Created**: 
  - `ContractFormDialog`: Comprehensive contract creation/editing with services, terms, and client selection
  - `TimeLogFormDialog`: Billable hours logging with category, description, and billable status
  - `SLAPolicyFormDialog`: SLA policy creation with priority-based response targets
  - `QuoteToContractDialog`: Convert accepted quotes directly into service contracts
  - `InvoiceManagement`: Invoice generation, viewing, and billing period management
- **Components Updated**: 
  - Billing list page with real-time contract data, statistics dashboard, filtering, and delete functionality
  - Contract detail page with live data, time logs, invoice management, and contract editing
  - Full integration with clients module for contract-client relationships
- **Database Schema**: Complete billing lifecycle with contracts, time logs, SLA policies, invoices, and audit trails

### **Service Catalogue Module** ✅ **Complete**
- **Database Collection**: `deskwise.service_catalogue`
- **Service Layer**: `src/lib/services/service-catalogue.ts` with comprehensive service management and analytics
- **API Routes**: 
  - Basic: `/api/service-catalogue`, `/api/service-catalogue/[id]`, `/api/service-catalogue/stats`
  - Management: `/api/service-catalogue/categories`, `/api/service-catalogue/tags`, `/api/service-catalogue/[id]/restore`
  - Seeding: `/api/service-catalogue/seed` with default service catalogue
- **Features**:
  - **Service Management**: Full CRUD operations with soft delete and restore functionality
  - **Advanced Service Types**: Fixed, Recurring, and Hourly services with specific configurations
  - **Enhanced Metadata**: Tags, billing frequency, minimum hours, setup fees, and popularity tracking
  - **Category Management**: Dynamic category creation and organization with usage statistics
  - **Popularity Analytics**: Service usage tracking from quotes and contracts for recommendations
  - **Service Statistics**: Comprehensive analytics including revenue potential, usage patterns, and category breakdowns
  - **Search and Filtering**: Full-text search across names, descriptions, categories, and tags
  - **Multi-tenant Security**: Complete organization-based data isolation
  - **Integration Ready**: Seamless integration with quotes and billing modules
- **Components Created**: 
  - `ServiceForm`: Comprehensive service creation/editing with conditional fields based on service type
  - `ServiceStatsDashboard`: Analytics dashboard with charts, popular services, and category insights
  - Enhanced service list with filtering, popularity display, and tag management
- **Components Updated**: 
  - Service Catalogue list page with real-time data, advanced filtering, seeding capability, and delete/restore functionality
  - New service creation page with full form integration and validation
  - Complete replacement of placeholder data with MongoDB-powered functionality
- **Integration Features**:
  - **Quote Integration**: Service popularity tracking when used in quotes
  - **Billing Integration**: Service usage analytics from contract creation
  - **Service Selection**: Optimized service selection for quotes and contracts
- **Database Schema**: Complete service lifecycle with tags, popularity metrics, billing configurations, and audit trails

### **Inventory Management Module** ✅ **Complete**
- **Database Collections**: `deskwise.inventory`, `deskwise.stock_movements`, `deskwise.purchase_orders`
- **Service Layer**: `src/lib/services/inventory.ts` with comprehensive inventory and stock management
- **API Routes**: 
  - Basic: `/api/inventory`, `/api/inventory/[id]`, `/api/inventory/stats`
  - Management: `/api/inventory/[id]/restore`, `/api/inventory/[id]/adjust`, `/api/inventory/[id]/deploy`
  - Tracking: `/api/inventory/movements`, `/api/inventory/low-stock`, `/api/inventory/out-of-stock`
  - Analytics: `/api/inventory/categories`, `/api/inventory/locations`
  - Deployment: `/api/inventory/[id]/deploy-asset` (asset creation integration)
- **Features**:
  - **Inventory Management**: Full CRUD operations with soft delete and restore capabilities
  - **Stock Tracking**: Real-time quantity tracking with automatic movement logging
  - **Reorder Management**: Low stock alerts and reorder point monitoring
  - **Purchase Tracking**: Purchase order integration with vendor and cost tracking
  - **Deployment Workflow**: Deploy inventory items as assets with automatic asset creation
  - **Serial Number Tracking**: Individual item tracking for high-value equipment
  - **Warranty Management**: Warranty information tracking with expiration alerts
  - **Multi-Location Support**: Location-based inventory organization and tracking
  - **Category Analytics**: Category-based statistics and stock analysis
  - **Owner Management**: MSP vs client-owned inventory differentiation
  - **Cost Tracking**: Unit cost and total value calculations with financial analytics
  - **Stock Movements**: Comprehensive audit trail for all inventory changes
- **Components Created**: 
  - `InventoryForm`: Comprehensive inventory creation/editing with all tracking fields
  - `InventoryStatsDashboard`: Analytics dashboard with charts, alerts, and stock metrics
  - Inventory list page with real-time API integration, filtering, and stock alerts
  - Inventory detail page with stock adjustment, deployment, and notes management
  - New inventory creation page with form integration
- **Integration Features**:
  - **Asset Integration**: Seamless deployment of inventory items as trackable assets
  - **Purchase Order Management**: Future purchase order workflow foundation
  - **Supplier Tracking**: Supplier information and SKU cross-referencing
- **Multi-Tenant Features**: Complete organization-scoped data isolation and security
- **Database Schema**: Comprehensive inventory lifecycle with stock movements, purchase tracking, and deployment history

## Database Collections

### **Core Collections**
- `tickets`: Service requests and issues with full activity tracking
- `schedule_items`: Technician scheduling and calendar appointments
- `incidents`: Major service disruptions and outage management
- `incident_updates`: Timeline updates for incident communication
- `change_requests`: IT change management and approval workflow
- `change_approvals`: Change request approval audit trail
- `projects`: Project management with budget and timeline tracking
- `project_tasks`: Individual project tasks with dependencies and progress
- `project_milestones`: Project milestones and deliverable tracking
- `articles`: Knowledge base articles with content, metadata, and access control
- `categories`: Hierarchical category structure for article organization
- `tags`: Tag system for article classification and search
- `assets`: IT assets with comprehensive tracking and monitoring data
- `asset_maintenance`: Asset maintenance records and scheduling
- `inventory`: Inventory items with stock tracking, purchase info, and deployment history
- `stock_movements`: Stock movement audit trail for inventory changes
- `purchase_orders`: Purchase order management for inventory procurement
- `clients`: Client organizations with contact info, status, and relationship tracking
- `quotes`: Sales quotes with line items, status tracking, and client relationships
- `service_catalogue`: Service offerings with pricing, categorization, tags, and popularity tracking
- `contracts`: Service contracts with recurring billing, client relationships, and MRR tracking
- `time_logs`: Billable hours tracking with technician, contract, and work categorization
- `sla_policies`: Service level agreements with priority-based response and resolution targets
- `invoices`: Generated invoices from contracts with billing periods and line items

### **Collection Structure**
All collections include:
- Standard document structure with `_id` as primary key
- `createdAt` and `updatedAt` timestamps for audit trails
- Optimized indexing for efficient queries
- Comprehensive field validation

## API Endpoints

### **Tickets API**
- `GET/POST /api/tickets` - List and create tickets
- `GET/PUT/DELETE /api/tickets/[id]` - Individual ticket operations
- `GET /api/tickets/stats` - Company-wide ticket statistics
- `GET /api/tickets/personal-stats` - User-specific ticket metrics

### **Scheduling API**
- `GET/POST /api/schedule` - List and create schedule items
- `GET/PUT/DELETE /api/schedule/[id]` - Individual schedule operations
- `GET /api/schedule/by-date` - Date-specific schedule queries
- `POST /api/schedule/recurring` - Create recurring appointment series
- `GET /api/schedule/workload` - Technician workload analysis
- `POST /api/schedule/optimal-slot` - Find optimal available time slots
- `GET /api/schedule/conflicts` - Check for scheduling conflicts

### **Change Management API**
- `GET/POST /api/change-requests` - List and create change requests
- `GET/PUT/DELETE /api/change-requests/[id]` - Individual change request operations
- `POST /api/change-requests/[id]/approve` - Approve change request
- `POST /api/change-requests/[id]/reject` - Reject change request
- `GET /api/change-requests/stats` - Change request statistics
- `GET /api/change-requests/upcoming` - Upcoming scheduled changes

### **Projects API**
- `GET/POST /api/projects` - List and create projects
- `GET/PUT/DELETE /api/projects/[id]` - Individual project operations
- `GET/POST /api/projects/[id]/tasks` - Project task management
- `PUT/DELETE /api/projects/[id]/tasks/[taskId]` - Individual task operations
- `GET/POST /api/projects/[id]/milestones` - Project milestone management
- `PUT/DELETE /api/projects/[id]/milestones/[milestoneId]` - Individual milestone operations
- `GET /api/projects/stats` - Project statistics and analytics
- `GET /api/projects/upcoming` - Upcoming scheduled projects

### **Knowledge Base API**
- `GET/POST /api/knowledge-base` - List and create knowledge base articles
- `GET/PUT/DELETE /api/knowledge-base/[id]` - Individual article operations
- `POST /api/knowledge-base/[id]/archive` - Archive article (soft delete)
- `GET /api/knowledge-base/search` - Full-text search with validation
- `GET/POST /api/knowledge-base/categories` - Category management
- `GET/POST /api/knowledge-base/tags` - Tag management and creation
- `GET /api/knowledge-base/stats` - Knowledge base statistics and analytics

### **Clients API**
- `GET/POST /api/clients` - List and create clients
- `GET/PUT/DELETE /api/clients/[id]` - Individual client operations
- `GET /api/clients/stats` - Client statistics and analytics

### **Quoting API**
- `GET/POST /api/quotes` - List and create quotes with filtering (status, client)
- `GET/PUT/DELETE /api/quotes/[id]` - Individual quote operations
- `GET /api/quotes/stats` - Quote statistics and conversion metrics

### **Service Catalogue API**
- `GET/POST /api/service-catalogue` - List and create service catalogue items with filtering (category, type, search)
- `GET/PUT/DELETE /api/service-catalogue/[id]` - Individual service operations
- `GET /api/service-catalogue/stats` - Service catalogue statistics and analytics
- `GET /api/service-catalogue/categories` - List service categories
- `GET /api/service-catalogue/tags` - List service tags
- `POST /api/service-catalogue/[id]/restore` - Restore deleted service
- `POST /api/service-catalogue/seed` - Seed default services for organization

### **Billing API**
- `GET/POST /api/billing` - List and create contracts with filtering (status, client)
- `GET/PUT/DELETE /api/billing/[id]` - Individual contract operations
- `GET /api/billing/stats` - Contract statistics and MRR analytics
- `GET/POST /api/billing/[id]/time-logs` - Time log management for billable hours
- `GET/POST /api/billing/[id]/invoices` - Invoice generation and retrieval
- `GET/POST /api/sla-policies` - SLA policy management with response targets

## Multi-Tenancy Implementation ✅ **COMPLETE**

All implemented modules now feature **comprehensive multi-tenancy** for B2B SaaS deployment:

### **Multi-Tenant Architecture**
- **Organization ID (`orgId`)**: All database documents include organization identification
- **Data Isolation**: Complete separation of data between organizations
- **Security**: No cross-organization data access possible
- **Performance**: Optimized queries with organization-scoped indexes

### **Multi-Tenant Service Layer Pattern**
All service methods follow this pattern:
```typescript
// Example: Organization-first parameter pattern
static async getAll(orgId: string, filters?: FilterType): Promise<EntityType[]>
static async getById(id: string, orgId: string): Promise<EntityType | null>
static async create(orgId: string, data: CreateType, createdBy: string): Promise<EntityType>
```

### **Database Schema Multi-Tenancy**
All collections include:
- `orgId: string` field for organization identification
- Compound indexes on `(orgId, createdAt)`, `(orgId, status)`, etc.
- Organization-scoped aggregation pipelines with `{ $match: { orgId } }`

### **Multi-Tenant Features Implemented**
- ✅ **Tickets**: Organization-scoped ticket management and SLA tracking
- ✅ **Scheduling**: Organization-scoped technician schedules and workload analysis
- ✅ **Incidents**: Organization-scoped incident management and public status pages
- ✅ **Change Management**: Organization-scoped change requests and approval workflows
- ✅ **Projects**: Organization-scoped project, task, and milestone management
- ✅ **Knowledge Base**: Organization-scoped articles, categories, and tags
- ✅ **Clients**: Organization-scoped client management with contact tracking
- ✅ **Quoting**: Organization-scoped quote management with service catalogue integration
- ✅ **Billing**: Organization-scoped contract management with MRR tracking, time logs, and invoice generation
- ✅ **Service Catalogue**: Organization-scoped service management with popularity tracking and analytics

## Authentication Implementation ✅ **COMPLETE**

### **WorkOS Integration**
- **Middleware**: `middleware.ts` with `authkitMiddleware()` for App Router
- **Provider**: `AuthKitProvider` wrapping entire application in root layout
- **UI Components**: Custom authentication components using WorkOS hooks
- **Route Protection**: App routes protected with WorkOS authentication
- **Auth Routes**: `/auth/callback`, `/auth/signin`, `/auth/signout`

### **Multi-Tenant Authentication**
- **Session Management**: WorkOS session claims for organization context
- **API Authentication**: All API routes extract `orgId` from WorkOS user context
- **User Context**: Helper functions for authentication using WorkOS utilities

### **Security Features**
- **Enterprise Authentication**: WorkOS provides enterprise-grade security
- **Organization Management**: Built-in multi-tenant organization support
- **SSO Support**: Single Sign-On integration for enterprise customers
- **Route Protection**: Unauthenticated users redirected to WorkOS sign-in

### **Environment Configuration**
Required environment variables in `.env.local`:
```bash
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_COOKIE_PASSWORD=your_32_char_random_string
WORKOS_REDIRECT_URI=http://localhost:9002/auth/callback
```

## Next Steps and Implementation Status

### **✅ Recently Completed**
- **WorkOS Authentication**: Full integration with Next.js App Router including middleware, providers, and UI components
- **API Route Integration**: All API routes now extract `orgId` from WorkOS authentication context
- **Multi-Tenant Security**: Complete authentication-based data isolation implementation
- **Enterprise Migration**: Successfully migrated from Clerk to WorkOS for enterprise-grade authentication

### **🔄 In Progress**
- **Database Optimization**: Creating compound indexes for multi-tenant query optimization

### **📋 Next Steps**
1. **Database Performance Optimization** (High Priority)
   - Create compound indexes: `(orgId, createdAt)`, `(orgId, status)`, etc.
   - Optimize aggregation pipelines for multi-tenant queries
   - Test query performance across organizations

2. **WorkOS Organization Management** (Medium Priority)
   - Configure WorkOS organizations for true multi-tenancy
   - Implement organization switching UI
   - Add organization member management

3. **Frontend Components** (Lower Priority)
   - Update remaining components to handle organization context
   - Add organization-scoped navigation
   - Implement organization dashboard

### **⏸️ Pending Implementation**
**Remaining Modules**: Other modules (Assets, Clients, Inventory, etc.) still use placeholder data and need MongoDB integration following the established multi-tenant patterns.

### **✅ Recent Accomplishments**
- **Multi-Tenancy Security**: Implemented comprehensive data isolation across all core modules
- **Service Layer Refactoring**: All 6 core modules now enforce organization boundaries
- **Database Schema Enhancement**: Added `orgId` to all collection documents
- **API Security Foundation**: Established pattern for organization-scoped API access
- **WorkOS Authentication**: Complete integration with Next.js App Router for enterprise-grade authentication
- **Authentication-Based Multi-Tenancy**: API routes now properly extract user organization context from WorkOS
- **Route Protection**: All app routes protected with authentication middleware

This is a comprehensive PSA platform with **enterprise-grade multi-tenancy** and **complete authentication integration** now implemented. The platform is ready for B2B SaaS deployment with secure, organization-isolated access to all core modules.