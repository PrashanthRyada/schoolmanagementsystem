# Willow Creek School Operations & Management System

A full-stack school operations portal designed for managing attendance, classes, student performance, fee collection, school events, and homepage media.

---

## 🏫 What Is Implemented

The application provides an administrative workspace tailored for school operations:

### 1. Operations Dashboard (`/`)
- **Key Metrics Overview**: Real-time counts of enrolled students, faculty & staff, active classes, and outstanding fee totals.
- **Attendance Dial**: Visual percentage ring of students present today versus total enrollment, with breakdown for staff attendance.
- **Fee Collection Trend**: Area chart tracking paid vs. pending fees month-by-month over a 6-month trailing window.
- **Upcoming Highlights**: Quick glance at the next 3 scheduled school and cultural events.
- **Interactive Homepage Carousel**: Hero banner featuring campus photos/videos with automated rotation and manual navigation.

### 2. Daily Attendance Register (`/attendance`)
- **Dual-Register Tracking**: Separate registers for both **Students** and **Staff**.
- **Date Selector**: Check attendance records for today or any historical date.
- **Class Filtering**: Filter student roll by class (e.g., Cedar Room, Maple Room).
- **Status Controls**: Mark individuals as `present`, `absent`, `late`, or on `leave`.
- **Batch Action**: "Mark remaining present" button to quickly complete attendance.
- **Real-time Persisted Updates**: Status saves instantly with visual indicator pills.

### 3. Student Records & Academic History (`/students`)
- **Directory & Search**: Filter students by name or admission number in real-time.
- **Student Profile View**: Detailed breakdown including class assignment, attendance percentage, and average score.
- **Academic Progress Chart**: Historical assessment score trends plotted per subject (e.g. Mathematics, Science, English, Art).
- **Assessment Scoring**: Form to record new quiz, exam, or test results (`score / maxScore`).
- **Student Management**: Modal dialogs to add, edit, and delete student records with class mappings.

### 4. Classroom Organization (`/classes`)
- **Class Cards**: Visual cards displaying Grade, Section, Room number, and assigned class teacher.
- **Student Roster Mapping**: Direct multi-student checkbox mapping to classrooms.
- **Class Management**: Create, edit, and remove class cohorts.

### 5. Fee Collection & Accounts (`/fees`)
- **Financial Analytics**: Invoiced total, collected amount, and outstanding balances.
- **Status Filter**: Filter by payment status (`paid`, `partial`, `pending`).
- **Invoice Management**: Issue new fee invoices with specified periods (e.g., "Term 1 - 2024"), amounts, and due dates.
- **One-Click Settlement**: "Mark paid" quick button and invoice edit/deletion controls.

### 6. School Events & Cultural Calendar (`/events`)
- **Calendar Highlights**: Event cards featuring custom accent colors, dates, times, and venue locations.
- **Category Tags**: Tag events by Academics, Culture, Sports, or Community.
- **Event Management**: Create, edit, and delete school gatherings and milestones.

### 7. Homepage Media Carousel Manager (`/media`)
- **Media Gallery**: Image and video management for the front-facing website carousel.
- **Order Controls**: Drag-free arrow buttons to rearrange slide positions.
- **Visibility Toggle**: Instantly activate or hide media slides from the public view.
- **Custom Links**: Supports relative paths (e.g., bundled assets) and external HTTP/HTTPS URLs.

---

## 🛠️ Tech Stack & Workspace Architecture

The repository is organized as a typed pnpm monorepo:

| Directory | Role | Stack |
| :--- | :--- | :--- |
| **`artifacts/school-portal`** | Frontend web application | React 19, Vite, Tailwind CSS v4, TanStack Query, Wouter, Recharts, Lucide Icons |
| **`artifacts/api-server`** | Backend REST API server | Node.js 22+, Express 5, Pino Logger |
| **`lib/db`** | Database layer & models | Drizzle ORM, PostgreSQL (`pg`) + embedded PGlite fallback |
| **`lib/api-spec`** | API contract source of truth | OpenAPI 3.1, Orval codegen |
| **`lib/api-zod`** | Validation schemas | Zod v4 schemas generated from OpenAPI |
| **`lib/api-client-react`** | Typed React query hooks | TanStack React Query hooks generated from OpenAPI |
| **`scripts`** | Workspace maintenance tools | TypeScript, tsx |

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: v20+ (v22 recommended)
- **pnpm**: v9+ (`corepack enable pnpm` or `npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Development Mode
To run both the **API server** and the **Web Portal** concurrently:
```bash
pnpm run dev
```

- **School Portal (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **API Server (Backend)**: [http://localhost:5001](http://localhost:5001)
- **API Health Check**: [http://localhost:5001/api/healthz](http://localhost:5001/api/healthz)

> *Vite automatically proxies all `/api/*` requests from `http://localhost:5173` to the backend on `http://localhost:5001`.*

---

## 💾 Database Configuration

The system provides **two flexible database options**:

### Option A: Zero-Config Embedded Database (Default)
**No setup required!** If `DATABASE_URL` is not provided in your environment:
- The system automatically runs an embedded, persistent PostgreSQL instance via **PGlite** stored in `.data/local-db`.
- Schema tables are created automatically on launch.
- Realistic sample records (students, staff, classes, attendance, fees, events, media) are automatically seeded on first run!

### Option B: External PostgreSQL Database
To connect to an external PostgreSQL database (e.g. Supabase, Neon, Docker, or local PostgreSQL on port 5432):

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your connection string:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/school_management
   ```
3. Push the schema and seed sample data:
   ```bash
   pnpm run db:push
   pnpm run db:seed
   ```

---

## 📋 Available Commands

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Runs both backend API (port 5001) and frontend portal (port 5173) concurrently |
| `pnpm run dev:api` | Starts backend API server with live reload (`tsx watch`) |
| `pnpm run dev:web` | Starts frontend Vite dev server |
| `pnpm run build` | Compiles and builds all workspace packages for production |
| `pnpm run typecheck` | Runs TypeScript type checking across all libraries and applications |
| `pnpm run db:push` | Pushes Drizzle ORM schema changes to database |
| `pnpm run db:seed` | Populates database with sample school records |
| `pnpm run codegen` | Regenerates React Query hooks and Zod schemas from `openapi.yaml` |

---

## 🧹 Summary of Fixes Applied for Local Execution

1. **Removed Replit-Specific Artifacts & Bloat**:
   - Deleted `artifacts/mockup-sandbox` (an internal Replit visual canvas runner that broke builds).
   - Removed `.replit-artifact` configuration folders from all services.
   - Removed `@replit/connectors-sdk` and unused `@replit/vite-plugin-*` packages.
   - Removed `replit.md`.

2. **Fixed Platform-Specific Binary Overrides**:
   - Removed aggressive Replit `pnpm-workspace.yaml` overrides that blocked macOS (`darwin-arm64`/`darwin-x64`) and Windows native binaries (`esbuild`, `rollup`, `lightningcss`, `@tailwindcss/oxide`).

3. **Resolved Port 5000 macOS AirPlay Conflict**:
   - macOS Control Center uses port 5000 by default for AirPlay Receiver, causing `EADDRINUSE`.
   - Updated default API port to **5001** and configured Vite dev server proxy to seamlessly route `/api` requests.

4. **Added Zero-Config Local Database Support**:
   - Added automatic fallback to embedded persistent **PGlite** (`.data/local-db`) when no external PostgreSQL server is detected.
   - Added automatic table initialization and seeding of realistic sample data.
   - Preserved full compatibility with external PostgreSQL databases via `DATABASE_URL`.
