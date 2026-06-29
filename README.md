# GOCus - ERP & POS System

A professional, scalable, and modular ERP/POS system for multi-company and multi-branch management.

## Author

Developed by [JuniDev](https://beltranhc.github.io/portafolio/)

## Technology Stack

### Backend
- Node.js (v20+ LTS)
- TypeScript (Strict Mode)
- NestJS v11
- Prisma ORM v7
- PostgreSQL 16
- JWT + Passport (Authentication)
- bcrypt (Password Hashing)
- Swagger (API Documentation)
- Helmet & Rate Limiter (Security & Throttling)

### Frontend
- React 19
- TypeScript
- Vite 6
- TailwindCSS v4
- React Router v7
- TanStack Query v5
- Zustand (Global State)
- Axios (HTTP Client)
- React Hook Form + Zod (Forms & Validation)
- Lucide Icons

### Infrastructure
- Docker & Docker Compose
- ESLint & Prettier

## Prerequisites

- Docker Desktop
- Node.js v20+ (for local development)
- npm v10+

## Getting Started

### Running with Docker Compose

1. Clone the repository and navigate to the root directory.
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start all services:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000/api`
   - Swagger Docs: `http://localhost:3000/api/docs`

### Local Development

#### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## System Hierarchy

The application follows a hierarchical data model to support large-scale operations:
`System -> Company -> Branch -> Warehouse -> Cash Register -> Sales`

## Default Credentials

For development and testing purposes, use the following credentials:
- **Email:** `admin@gocus.com`
- **Password:** `Admin123!`
- **Role:** Super Administrator

## License

Copyright (c) 2026 JuniDev - All Rights Reserved.
