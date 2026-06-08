# Media Toolkit

A full-stack media processing SaaS for image compression, video compression, file format conversion, and media optimization. Built for freelancers, drone operators, and agencies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | NestJS 11, TypeScript, REST API |
| Database | PostgreSQL 16 + Prisma ORM |
| Queue | Redis 7 + BullMQ |
| Processing | Sharp (images), FFmpeg (video — Phase B) |
| Storage | Local filesystem (dev), S3-compatible (production) |

## Architecture

```
Frontend (Next.js :3000)
   ↓
Backend API (NestJS :3001)
   ↓
Queue System (BullMQ + Redis :6379)
   ↓
Worker Service (Sharp / FFmpeg)
   ↓
Storage (local → cloud)
   ↓
PostgreSQL (metadata :5432)
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally on port 5432)
- Redis (running locally on port 6379)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

Backend runs on http://localhost:3001

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/profile` — Get current user profile

### Files
- `POST /api/files/upload` — Upload a media file (multipart)
- `GET /api/files/:id` — Get file details
- `GET /api/files/user/me` — Get all files for current user

### Jobs
- `POST /api/jobs/create` — Create a processing job
- `GET /api/jobs/:id` — Get job details
- `GET /api/jobs/status/:id` — Get job status

## Database Models

- **User** — id, email, password, name, createdAt
- **File** — id, userId, originalName, fileType, mimeType, size, path
- **Job** — id, fileId, status, operation, outputPath, outputSize, error

## MVP Scope (Phase A)

- [x] Image upload
- [x] Image compression (Sharp)
- [x] Basic dashboard with stats
- [x] Job queue (BullMQ + Redis)
- [ ] Video compression (Phase B — FFmpeg)
- [ ] Format conversion (Phase B)
