# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Development
```bash
npm run dev                    # Start Vite dev server (http://localhost:5173)
npm run netlify:dev           # Start Netlify dev server with functions (http://localhost:8888)
npm run build                 # TypeScript check + Vite build
npm run lint                  # Run ESLint
npm run preview               # Preview production build locally
```

### Database
```bash
npm run drizzle:generate     # Generate migration from schema changes
npm run drizzle:push         # Apply migrations to database
npm run drizzle:studio       # Open Drizzle Studio GUI (localhost:3000)
npm run drizzle:introspect   # Sync schema with existing database
```

### Deployment
```bash
npm run netlify:build        # Build for Netlify
npm run netlify:prod         # Deploy to production
```

## Project Structure

```
src/                         # Frontend React application
├── config/                  # Configuration & HTTP adapter
│   ├── adapters/           # AxiosAdapter (centralized HTTP client)
│   └── helpers/            # Utility functions & HTTP error handling
├── core/                    # Business logic (clean architecture)
│   ├── entities/           # Domain models (User, Appointment, Patient, etc.)
│   └── use-cases/          # Business logic functions (getPatientsUseCase, etc.)
├── infrastructure/          # Data mapping
│   ├── interfaces/         # API response types
│   └── mappers/            # Data transformers
└── presentation/            # UI Layer
    ├── components/         # React components (shared, ui, feature-specific)
    ├── hooks/              # Custom React hooks (auth, patients, appointments, etc.)
    ├── layouts/            # Page layouts (AuthLayout, HomeLayout)
    ├── pages/              # Page components (auth, dashboard, calendar, etc.)
    └── router/             # React Router configuration

netlify/                     # Backend serverless functions
├── functions/              # Netlify Functions (auth, appointments, budgets, etc.)
├── config/                 # Backend config (JWT, BCrypt, env validation)
├── data/schemas/           # Drizzle ORM database schemas
└── ...

migrations/                 # Drizzle database migrations
public/                     # Static assets
```

## Architecture Overview

### High-Level Architecture: Clean Architecture + React Query

ArmoniClick follows a **three-layer pattern**:

```
React Component
    ↓
Custom Hook (usePatients, useLoginMutation)
    ↓
React Query (useQuery, useMutation) - Caching & Synchronization
    ↓
Use Case Function (getPatientsUseCase, loginUserUseCase)
    ↓
AxiosAdapter (HTTP client with JWT Bearer token)
    ↓
Netlify Serverless Function (Backend API)
    ↓
PostgreSQL (Neon serverless)
```

### Key Patterns

**1. HTTP Client (AxiosAdapter)**
- Located: `src/config/adapters/http.adapter.ts`
- Automatically adds JWT Bearer token from localStorage
- Provides generic methods: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`
- Base URL: environment variable `VITE_BACKEND_URL`
- Centralized error handling via `HttpError` class

**2. Use Cases Pattern**
- Located: `src/core/use-cases/`
- Functions that encapsulate business logic (e.g., `getPatientsUseCase()`)
- Receive dependencies (http adapter) and return typed data
- Called by custom hooks, NOT directly from components

**3. Custom Hooks Pattern**
- Located: `src/presentation/hooks/`
- Wrap use cases + React Query (useQuery/useMutation)
- Handle loading/error states
- Manage cache invalidation on mutations
- Example: `usePatients()` → useQuery → getPatientsUseCase() → AxiosAdapter

**4. API Route Structure (netlify.toml)**
- Frontend routes to: `VITE_BACKEND_URL = http://localhost:8888/.netlify/functions`
- Example: POST `/api/auth/login` → `netlify/functions/auth/login.ts`
- Redirects configured in netlify.toml for pattern matching

### Database (Drizzle ORM + PostgreSQL)

**Key Schemas** (in `netlify/data/schemas/`):
- `users` - Doctor/admin profiles with email validation & active status
- `patients` - Patient database
- `appointments` - Medical appointments with guest fields, confirmation tokens, reminders
- `treatments` - Treatment records with photos and media
- `budgets` - Medical budget items
- `services` - Available medical services
- `documents` - Medical documents with digital signatures and PDF generation

**Configuration**: `drizzle.config.ts` uses Neon PostgreSQL serverless

### Backend Services Pattern

Services in `netlify/services/` handle cross-cutting concerns:
- `EmailService` - Base email sending with Gmail SMTP
- `DocumentEmailService` - Specialized email for documents with PDF attachments
- `PDFService` - Backend PDF generation with pdfkit
- `UploadService` - Cloudinary integration
- `NotificationService` - Appointment reminders
- `TokenService` - JWT handling
- `PatientService`, `BudgetService`, `TreatmentService` - Business logic services

**Pattern**: Services are instantiated in functions and used by use cases. Email services extend a base class for consistency.

### Authentication Flow

1. User logs in via `/auth/login`
2. Backend validates credentials, returns JWT token
3. Frontend stores token in localStorage
4. AxiosAdapter automatically includes token in all requests as Bearer token
5. Backend validates token via `JwtAdapter.validateToken()`
6. Protected routes check token presence; missing token redirects to login

**Related Hooks**:
- `useLoginMutation` - Login with auto-redirect to dashboard
- `useCheckUserToken` - Validate token on app load
- Auto-logout if token missing

### Major Features

**Documents Module** (`src/presentation/pages/documents/`)
- Digital signature via canvas drawing
- Dynamic document template system with patient/doctor data interpolation
- PDF generation (frontend via jsPDF, backend via pdfkit)
- Email delivery to patients with signed documents
- Document status tracking (pendiente/firmado)
- View signed documents with embedded signatures
- Four predefined consent templates with placeholder variables: `{{PATIENT_NAME}}`, `{{PATIENT_RUT}}`, `{{DOCTOR_NAME}}`, `{{PARENT_NAME}}`

**Other Core Features**:
- Appointments with availability checking and reminder emails
- Budget management with status tracking
- Treatment records with photo/media uploads
- Patient management with profile images
- Services catalog

### Routing

**Protected Routes** (require authentication):
- `/dashboard` - Home page
- `/dashboard/calendario` - Calendar view
- `/dashboard/pacientes` - Patient management
- `/dashboard/presupuestos` - Budgets
- `/dashboard/documentos` - Documents with signature capability
- `/dashboard/configuracion` - Settings

**Public Routes**:
- `/auth/login`, `/auth/registrar`, `/auth/olvide-password`
- `/confirm-appointment/:token`, `/cancel-appointment/:token`

**Router Location**: `src/presentation/router/router.tsx`

## State Management

- **Server State**: React Query (@tanstack/react-query) - caching, synchronization, auto-invalidation
- **Form State**: React Hook Form (react-hook-form) - efficient form handling
- **Auth State**: localStorage for JWT token + URL params for redirects
- **UI State**: React hooks (useState, useEffect)

**Cache Invalidation Pattern**:
```typescript
// In hooks, after mutation:
queryClient.invalidateQueries({ queryKey: ['patients'] });
```

## Environment Configuration

**Frontend** (`.env` or `.env.local`):
```env
VITE_BACKEND_URL=http://localhost:8888/.netlify/functions
```

**Backend** (uses `netlify/config/envs.ts` with env-var library):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SEED` - Secret for token generation
- `MAILER_*` - Email service (Gmail SMTP)
- `CLOUDINARY_*` - Image storage API
- `FRONTEND_URL` - For email confirmation links

**Validation**: Backend uses `env-var` library to validate env vars at startup

## Building & Deployment

**Frontend Build**:
1. `npm run build` runs: `tsc -b && vite build`
2. TypeScript type-checking first
3. Vite bundles into `dist/` directory

**Development**:
- `npm run dev` - Vite with HMR
- `npm run netlify:dev` - Includes serverless functions locally
- Open http://localhost:8888 (Netlify) or http://localhost:5173 (Vite only)

**Deployment to Netlify**:
- Automatic on git push to main
- Builds in `dist/` directory
- Functions deployed from `netlify/functions/`
- Environment variables configured in Netlify dashboard

**Scheduled Functions** (configured in `netlify.toml`):
- `daily-reminders`: Runs at 13:30 Chile time (UTC-3) daily, sends appointment reminders via email
- Add more scheduled functions in `netlify.toml` with cron syntax, then create the function file

## Component & Hook Examples

**Creating a New Feature Page**:
1. Create page component: `src/presentation/pages/my-feature/MyFeature.tsx`
2. Create custom hook: `src/presentation/hooks/my-domain/useMyFeature.ts`
   - Use `useQuery`/`useMutation` from React Query
   - Call corresponding use case function
   - Return data/loading/error
3. Create use case: `src/core/use-cases/getMyDataUseCase.ts`
   - Receive http adapter as dependency
   - Call adapter methods
   - Return typed data
4. Add route to `src/presentation/router/router.tsx`

**Pattern for Custom Hooks**:
```typescript
// src/presentation/hooks/my-domain/useMyFeature.ts
import { useQuery } from '@tanstack/react-query';
import { getMyFeatureUseCase } from '@/core/use-cases/getMyFeatureUseCase';
import { useHttpAdapter } from './useHttpAdapter'; // or import directly

export function useMyFeature(id: string) {
  const httpAdapter = useHttpAdapter(); // or pass via prop

  return useQuery({
    queryKey: ['myFeature', id],
    queryFn: async () => getMyFeatureUseCase(httpAdapter, id),
  });
}
```

## Key Dependencies

**Frontend**:
- `react` (18.3.1) - UI framework
- `react-router-dom` (7.6.2) - Routing
- `@tanstack/react-query` (5.85.5) - Server state management
- `react-hook-form` (7.51.4) - Form handling
- `zod` (3.23.8) - Schema validation
- `axios` (1.9.0) - HTTP client (wrapped by AxiosAdapter)
- `@radix-ui/*` - Accessible unstyled components
- `tailwindcss` (3.4.3) - Styling
- `jspdf` (3.0.1) - Client-side PDF generation (documents feature)
- `html2canvas` (1.4.1) - Canvas rendering for PDFs
- `recharts` (3.0.0) - Charts/graphs (budgets, analytics)
- `sonner` (2.0.7) - Toast notifications

**Backend** (Netlify Functions):
- `drizzle-orm` (0.44.1) - TypeScript ORM
- `@neondatabase/serverless` - PostgreSQL client
- `jsonwebtoken` - JWT signing/validation
- `bcryptjs` - Password hashing
- `nodemailer` (7.0.3) - Email sending
- `cloudinary` - Image storage API
- `pdfkit` (0.17.2) - Server-side PDF generation (documents feature)

## Important Implementation Notes

### API Route Mapping
- Frontend calls: `POST /documents` → Backend receives at `/.netlify/functions/documents/documents`
- **Routing Rule**: `VITE_BACKEND_URL` = `http://localhost:8888/.netlify/functions` (already includes base)
- In use cases, call `/documents` (not `/api/documents`), as the base URL includes `/.netlify/functions`
- See `netlify.toml` for redirect rules matching patterns like `/documents/*` → `/.netlify/functions/documents/documents`

### Document Feature Implementation Details
**Frontend Path**: `src/presentation/pages/documents/DocumentsPage.tsx`
- Three views: `list` (view documents), `generate` (create new), `sign` (add signature), `view` (see signed)
- Uses `useDocuments()` hook which wraps use cases + React Query
- Templates in `src/presentation/pages/documents/templates/index.ts` use placeholder syntax
- PDF download: `generateDocumentPDF(document)` from `utils/pdfGenerator.ts`

**Backend Path**: `netlify/functions/documents/documents.ts`
- Single handler managing GET (list), POST (create), PUT (sign), DELETE operations
- Signing sends emails via `DocumentEmailService` with PDF attachment
- PDF backend generation: `generateDocumentPDF(document)` from `services/pdfService.ts` (pdfkit)

**Database**: `documents` table tracks signature data, status, timestamps

### Middleware Pattern
- `validateJWT(event.headers.authorization!)` extracts and validates token
- Returns error response if invalid; otherwise returns `{ statusCode: 200, body: userJson }`
- Doctor ID extracted from JWT for ownership/association

## Common Development Tasks

**Adding a New API Endpoint**:
1. Create function in `netlify/functions/my-feature/my-endpoint.ts`
2. Export handler function with Netlify signature
3. Add route redirect in `netlify.toml` if needed (pattern matching)
4. Import database schemas from `netlify/data/schemas/`
5. Use `validateJWT()` for authentication
6. Remember: base URL already includes `/.netlify/functions`, so use `/endpoint` not `/api/endpoint`

**Adding a New Database Schema**:
1. Define schema in `netlify/data/schemas/`
2. Run `npm run drizzle:generate`
3. Review generated migration in `migrations/`
4. Run `npm run drizzle:push`

**Creating a Form**:
1. Use `react-hook-form` + `zod` for validation
2. Import form components from `src/presentation/components/ui/form/`
3. Example: `useForm()` + `zodResolver()` + `<Form>` component

**Uploading Files**:
- Use `netlify/functions/upload/upload.ts` (handles Cloudinary)
- Custom hooks: `useUploadImages()`, `useTreatmentUpload()`

## TypeScript Configuration

- Target: ES2020
- Module: ESNext
- Path alias: `@/*` → `src/*` (use `@/` for imports)
- Strict mode enabled
- React JSX preset

## Linting

ESLint is configured in `eslint.config.js`:
- TypeScript support via `@typescript-eslint`
- React hooks rules via `eslint-plugin-react-hooks`
- React refresh rules via `eslint-plugin-react-refresh`

Run: `npm run lint`
