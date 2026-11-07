# Prescripto — Telemedicine Platform (Monorepo)

Production-deployed full-stack telemedicine marketplace with **3 separate frontend panels** sharing a common component library.

## Architecture

```
prescripto-monorepo/
├── packages/
│   ├── shared/           # Shared components, context, utils (published as @prescripto/shared)
│   ├── patient/          # Patient portal (React + Vite) → frontend-three-blond-79.vercel.app
│   ├── admin/            # Admin + Doctor panel (React + Vite) → admin-swart-mu.vercel.app
│   └── pharmacist/       # Pharmacist panel (React + Vite) → pharmacist-pied.vercel.app
├── backend/              # Spring Boot 3 REST API (separate repo: prescripto-sem2-backend)
```

## Quick Start

```bash
# Install all dependencies
npm install --workspaces

# Development (run in separate terminals)
npm run dev:patient     # http://localhost:5173
npm run dev:admin       # http://localhost:5174
npm run dev:pharmacist  # http://localhost:5175

# Build all packages
npm run build:all

# Build individual packages
npm run build:patient
npm run build:admin
npm run build:pharmacist
```

## Environment Setup

```bash
# Copy root env example to each package
cp .env.example packages/patient/.env.local
cp .env.example packages/admin/.env.local
cp .env.example packages/pharmacist/.env.local
```

Each package uses `VITE_BACKEND_URL` pointing to the Spring Boot API.

## Live Deployments

| Panel | URL | Repo |
|-------|-----|------|
| Patient | https://frontend-three-blond-79.vercel.app | `packages/patient` |
| Admin | https://admin-swart-mu.vercel.app | `packages/admin` |
| Pharmacist | https://pharmacist-pied.vercel.app | `packages/pharmacist` |
| Backend API | https://prescripto-sem2-backend.onrender.com | `prescripto-sem2-backend` |

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router 6, Axios
- **State**: React Context + localStorage caching
- **Shared**: `@prescripto/shared` (components, context, utils)
- **Backend**: Spring Boot 3.2, Spring Security 6, JWT, MySQL 8.4 (Aiven)
- **Deploy**: Vercel (frontend), Render (backend), Docker-ready
- **Payments**: Razorpay + Stripe
- **Images**: Cloudinary

## Key Features

- 🏥 Patient portal: Browse 16+ doctors, book appointments, view health records
- 🔐 Three-role auth: Patient / Admin+Doctor / Pharmacist (JWT + HttpOnly cookies)
- 💳 Payments: Razorpay (India) + Stripe (global)
- ⚡ Cold-start resilience: 3-retry + localStorage cache for logged-out visitors
- 🐳 Dockerized backend with health checks
- 🧪 Automated smoke tests (Playwright)

## Backend Repository

https://github.com/Hareesh-Reddy-9126/prescripto-sem2-backend