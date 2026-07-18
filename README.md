# NexoEdu — Frontend

This is the frontend application for **NexoEdu**, a web platform for tracking and managing student and graduate information across educational institutions in the District of Barranquilla, Colombia. It enables data update campaigns, role-based dashboards, and student information management.

---

## Architecture Overview

The frontend follows a **client-server architecture** where it consumes a REST API to perform all data operations. This separation of concerns keeps the presentation layer independent from business logic, making the system easier to maintain and extend over time.

The application is built as a **Single Page Application (SPA)** — the page never reloads fully. Instead, a custom client-side router intercepts navigation, renders the appropriate view, and updates the browser's URL, creating a fluid experience similar to a native app.

Communication with the backend is handled through a dedicated HTTP client module that centralizes request logic, authentication headers, error handling, and timeouts, keeping the rest of the codebase clean and focused on UI concerns.

### Architecture Diagram

![NexoEdu Architecture](src/assets/diagram-architecture.png)

---

## Why a Mock Backend?

This project uses a custom mock API server (Express 5 in the `backend/` folder) instead of a real backend. It reads and writes to a local `db.json` file, simulating the endpoints the production API will eventually provide.

The reason: **the frontend team doesn't need to wait for the backend team.** By defining the API contract early and mocking it, both teams work in parallel. The frontend is built against the same endpoints, data shapes, and authentication flow as the real backend. When the real API is ready, switching only requires changing `API_URL` and removing the mock server — no rewrites needed.

> See `backend/MIGRATION_GUIDE.md` for the migration plan.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **JavaScript (Vanilla ES Modules)** | Core language — no framework overhead, direct DOM control |
| **Vite 8** | Build tool and dev server — fast Hot Module Replacement, optimized builds |
| **Tailwind CSS v4** | Utility-first CSS — consistent design, rapid UI development |
| **Custom SPA Router** | Client-side navigation with role-based route protection |
| **Custom HTTP Client** | Centralized fetch wrapper with Bearer auth, timeout, and error handling |
| **Express 5** (mock backend) | Simulated REST API for local development |

---

## Project Structure

```
frontend/
├── index.html                # Entry point
├── vite.config.js            # Vite config with Tailwind plugin + API proxy
├── package.json
└── src/
    ├── main.js               # App bootstrap — auth init, route definitions
    ├── style.css             # Tailwind, design tokens, animations, component classes
    ├── components/           # Reusable UI building blocks (Layout, Sidebar, Toast, etc.)
    ├── views/                # Page-level views — one per route (Login, dashboards, CRUDs)
    ├── modules/              # Core infrastructure — auth, router, HTTP client
    ├── services/             # API service layer — one file per domain
    ├── utils/                # Shared helpers — permissions, filters, dates, cache, errors
    └── assets/               # Images and logos
```

---

## Design Concepts

### Navigation and Routing

Navigation is managed entirely on the client side. A custom router intercepts every link click and URL change, matches it against a defined route table, and renders the corresponding view without a full page reload. Each route can declare which roles are allowed to access it — users who don't meet the requirement are silently redirected to their default dashboard. Routes can also contain dynamic parameters (such as an institution or campaign ID) that are parsed and passed to the view at render time.

### Authentication and Authorization

The authentication module manages the user's session entirely in the browser. When a user logs in, the backend returns a token and the user's role. The module stores these in localStorage or sessionStorage, making the session persist across tabs and browser restarts. Every subsequent API request automatically includes the token in the Authorization header. The router and individual views both verify the user's role before granting access to pages or actions, creating a layered security model.

### API Communication

All backend communication flows through a centralized HTTP module. It attaches the auth token to every request, sets a configurable timeout to prevent hanging connections, and provides a consistent error format. The rest of the application never deals with raw `fetch` calls — it uses domain-specific service functions that return ready-to-use data. During development, Vite's proxy forwards `/api` requests to the mock backend, so the frontend uses relative URLs and needs no changes when switching to the real API.

### State and Data Flow

There is no global state management library. Instead, the application follows a simpler pattern: authentication state lives in the auth module (which notifies listeners on change), view state is local to each view, and API responses are consumed directly. For data that changes infrequently (like catalog tables), a lightweight in-memory cache with configurable TTL avoids redundant requests without adding complexity.

### UI and Theming

The interface is built with Tailwind CSS, using a set of semantic design tokens defined as CSS custom properties. Each user role receives its own color scheme through a `data-role` attribute on the root element, subtly adapting the interface without changing the layout. The design system includes custom animations for page transitions, skeleton loaders, toast notifications, and staggered grid entries, all of which respect the user's `prefers-reduced-motion` setting. Touch targets are sized for mobile usability, and a skip-to-content link improves keyboard navigation.

---

## Development

```bash
# From the project root — starts both mock backend and frontend
npm run dev
```

| Service | URL | Description |
|---------|-----|-------------|
| Backend mock | `http://localhost:3001` | Simulated REST API |
| Frontend | `http://localhost:5173` | Vite dev server with HMR |

---

## Routes

| Route | View | Access |
|---|---|---|
| `/` | Login | Public |
| `/dashboard-superadmin` | Super Admin Panel | SUPERADMIN |
| `/dashboard` | Institution Admin Panel | ADMINISTRADOR |
| `/dashboard-estudiante` | Student Panel | ESTUDIANTE |
| `/instituciones` | Institution Management | SUPERADMIN |
| `/instituciones/crear` | Create Institution | SUPERADMIN |
| `/instituciones/:id/editar` | Edit Institution | SUPERADMIN |
| `/instituciones/crear-admin` | Create Admin | SUPERADMIN |
| `/institucion/:id` | Institution Detail | SUPERADMIN, ADMINISTRADOR |
| `/institucion` | My Institution (admin) | ADMINISTRADOR |
| `/campanas` | Campaign List | SUPERADMIN, ADMINISTRADOR |
| `/campanas/crear` | Create Campaign | SUPERADMIN, ADMINISTRADOR |
| `/campanas/:id` | Campaign Detail | SUPERADMIN, ADMINISTRADOR |
| `/campanas/:id/editar` | Edit Campaign | SUPERADMIN, ADMINISTRADOR |
| `/estudiantes` | Student List | SUPERADMIN, ADMINISTRADOR |
| `/estudiantes/crear` | Create Student | ADMINISTRADOR |
| `/estudiante/:id` | Student Detail | SUPERADMIN, ADMINISTRADOR |
| `/estudiante/:id/editar` | Edit Student | ADMINISTRADOR |
| `/mis-campanas` | My Campaigns (student) | ESTUDIANTE |
| `/perfil` | Profile (read-only) | ADMINISTRADOR, ESTUDIANTE |
| `/perfil/editar` | Edit Profile | ESTUDIANTE |
| `/configuracion` | Settings | All authenticated |

---

## Migrating to the Real Backend

When the backend team finishes the real API:

1. Delete the `backend/` folder
2. Uncomment the production `API_URL` in `frontend/src/modules/auth.js`
3. Follow the [Migration Guide](../backend/MIGRATION_GUIDE.md)

