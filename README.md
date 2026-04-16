# Family Finance

A **Family Financial Management System** for personal household usage.

## Tech Stack

### Monorepo
- **Turborepo** + **pnpm** workspaces

### Frontend (`apps/web`)
- React 19 SPA
- TypeScript
- Vite
- TanStack Router (file-based routing)
- TanStack Query (server state management)
- TanStack Table (data tables)
- shadcn/ui components
- TailwindCSS
- Recharts (charts/analytics)

### Backend (`apps/api`)
- NestJS
- TypeScript
- TypeORM + PostgreSQL
- BullMQ + Redis (job queues)
- JWT authentication (access + refresh tokens)
- bcrypt password hashing
- Swagger/OpenAPI documentation

### Shared Packages
- `@family-finance/types` - Shared TypeScript interfaces and enums
- `@family-finance/utils` - Currency formatting, date utilities
- `@family-finance/ui` - Shared UI components
- `@family-finance/tsconfig` - Shared TypeScript configurations
- `@family-finance/eslint-config` - Shared ESLint configuration

## Features

- **Authentication** - JWT-based with admin/user roles
- **Wallets** - Private and shared wallets with permission system
- **Transactions** - Income, expense, transfer, adjustment tracking
- **Transfer Logic** - Linked debit/credit transactions
- **Split Transactions** - Group multiple categories under one payment
- **Recurring Payments** - Scheduled payments with pay/skip actions
- **Categories & Tags** - Organize transactions with global/private scope
- **Dashboard** - Analytics with income/expense summary, charts, wallet balances
- **Notifications** - BullMQ-powered notification queue (email, telegram, whatsapp ready)
- **Audit Trail** - Transaction revision history
- **Soft Deletes** - No hard deletes, all data preserved
- **File Uploads** - S3-compatible storage for attachments

## Project Structure

```
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React frontend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   ├── ui/           # Shared UI components
│   ├── tsconfig/     # Shared TS configs
│   └── eslint-config/# Shared ESLint config
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- PostgreSQL
- Redis

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp apps/api/.env.example apps/api/.env
# Edit .env with your database/redis credentials

# Run both apps in development
pnpm dev
```

### API Documentation
- Swagger UI: `http://localhost:3000/api/docs`

### Default Admin
- Email: `admin@family.com`
- Password: `admin123`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_USERNAME | PostgreSQL user | postgres |
| DATABASE_PASSWORD | PostgreSQL password | postgres |
| DATABASE_NAME | Database name | family_finance |
| JWT_SECRET | JWT signing secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_EXPIRATION | Access token TTL | 15m |
| JWT_REFRESH_EXPIRATION | Refresh token TTL | 7d |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| S3_ENDPOINT | S3-compatible endpoint | http://localhost:9000 |
| S3_BUCKET | S3 bucket name | family-finance |
| S3_ACCESS_KEY | S3 access key | - |
| S3_SECRET_KEY | S3 secret key | - |

## Money Handling

All monetary values are stored as **integer minor units** (cents):
- `Rp 10,000` → stored as `1000000`
- Never uses floating point for money

## API Modules

| Module | Endpoints |
|--------|-----------|
| Auth | POST /auth/login, /auth/refresh, /auth/logout, GET /auth/me |
| Users | GET /users, POST /users, PATCH /users/:id, DELETE /users/:id |
| Wallets | CRUD + POST /wallets/:id/share, DELETE /wallets/:id/share/:userId |
| Categories | CRUD |
| Tags | CRUD |
| Transactions | CRUD + POST /transactions/transfer, /transactions/split |
| Recurring | CRUD + POST /recurring/:id/pay, /recurring/:id/skip |
| Dashboard | GET /dashboard/summary, /cashflow, /categories, /wallets, /recurring, /recent |
| Uploads | POST /uploads, DELETE /uploads/:key |