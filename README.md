# invest-alert-front

Frontend application for **InvestAlert** - a platform for monitoring investment assets and managing price/indicator alert rules.

Built with Angular 21, Angular Material, and Server-Side Rendering (SSR).

---

## Features

- **Authentication** - Login and registration with JWT-based session management
- **Dashboard** - Overview of active rules and recent alert history
- **Assets** - Browse and search investment assets by ticker
- **Rules** - Create, edit, and delete alert rules (price, dividend yield, P/VP) with support for rule groups
- **Alerts** - View alert history with filtering by status and ticker
- **Theme** - Light/dark mode toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone Components) |
| UI | Angular Material 21 |
| Rendering | Angular SSR (Express) |
| Styling | SCSS |
| Testing | Vitest + fast-check (property-based) |
| Container | Docker (Nginx + Node SSR) |

---

## Architecture

The project follows Clean Architecture principles organized by feature:

```
src/app/
├── core/               # Guards, interceptors, layout, shared services
├── features/
│   ├── auth/           # Login, register
│   ├── dashboard/      # Summary view
│   ├── assets/         # Asset listing
│   ├── rules/          # Alert rule management
│   └── alerts/         # Alert history
└── shared/             # Reusable components, pipes, models
```

Each feature is internally structured into four layers:

```
feature/
├── domain/             # Models and interfaces (framework-agnostic)
├── application/        # Facades and use-case services
├── infrastructure/     # HTTP services and API integration
└── presentation/       # Angular components and templates
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 11+

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Build for production

```bash
npm run build
```

Output is placed in `dist/invest-alert-front/`.

### Run SSR server (after build)

```bash
npm run serve:ssr:invest-alert-front
```

---

## Testing

Unit and property-based tests are run with Vitest:

```bash
npm test
```

Property-based tests use [fast-check](https://fast-check.dev/) and are co-located with their respective services (`.property.spec.ts`).

---

## Docker

The app is containerized with a multi-stage Dockerfile:

1. **Build stage** - Compiles the Angular app with SSR
2. **Runtime stage** - Nginx proxies API requests to `invest-alert-api:8080` and SSR requests to the Node server on port 4000

```bash
docker build -t invest-alert-front .
```

The container expects the backend API to be reachable at `invest-alert-api:8080` (configurable via `nginx.conf`).

---

## API Proxy

In production (Docker), Nginx routes:

- `/api/*` - proxied to the backend API (`invest-alert-api:8080`)
- `/*` - proxied to the SSR Node server (`localhost:4000`)

---

## Code Generation

```bash
# Generate a component
ng generate component features/my-feature/presentation/my-component

# List all available schematics
ng generate --help
```
