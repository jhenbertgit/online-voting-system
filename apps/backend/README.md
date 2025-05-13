# Online Voting System Backend

Welcome to the **Online Voting System Backend**! This service powers the core logic, APIs, and data management for secure, scalable, and transparent online elections.

---

## 🚀 Project Objective

- **Provide robust, secure, and scalable backend APIs** for online voting and election management.
- **Integrate with Ethereum smart contracts** for verifiable and auditable election results.
- **Support user roles:** voter, admin, election_officer, and more.
- **Enable real-time analytics, ballot processing, and result aggregation.**
- **Ensure data privacy, reliability, and extensibility.**

---

## 🏗️ Project Structure

- `src/`
  - `app.module.ts` – Root NestJS module
  - `main.ts` – Application entry point
  - `auth/` – Authentication logic (Clerk integration, guards, decorators)
  - `ballot/` – Ballot casting, validation, and services
  - `candidate/` – Candidate management
  - `election/` – Election creation, management, and logic
  - `position/` – Election positions/offices
  - `cache/` – Caching logic (Redis integration)
  - `prisma/` – Database access (Prisma ORM)
  - `redis/` – Redis module and services
  - `services/` – Shared services (logger, sessionCache, etc.)
  - `middleware/` – Custom NestJS middleware
  - `types/` – TypeScript types and interfaces
  - `util/` – Utility helpers
  - `webhook/` – Webhook handling (if any)
- `test/` – Unit and e2e tests
- `.env.example` – Example environment variables

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database:** [Prisma ORM](https://www.prisma.io/) (PostgreSQL or other supported DB)
- **Auth:** [Clerk](https://clerk.com/) (JWT, session, role-based access)
- **Cache:** [Redis](https://redis.io/) (for fast lookups, session, and analytics)
- **Blockchain:** [ethers.js](https://docs.ethers.org/) (Ethereum smart contract integration)
- **Lint/Format:** ESLint, Prettier
- **Package Manager:** pnpm

---

## 🧑‍💻 Onboarding & Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

- Copy `.env.example` to `.env` and fill in all required variables (database, Clerk, Redis, etc.)
- Ensure your database and Redis are running and accessible.

### 3. Database Migration (if using Prisma)

```bash
pnpm prisma migrate dev
```

### 4. Run the Development Server

```bash
pnpm run start:dev
```

### 5. Project Scripts

- `pnpm run start` – Start server (prod)
- `pnpm run start:dev` – Start server in watch mode (dev)
- `pnpm run test` – Run unit tests
- `pnpm run test:e2e` – Run end-to-end tests
- `pnpm run test:cov` – Test coverage
- `pnpm run lint` – Lint codebase

---

## 🤝 Contributing

- Branch from `main` and use descriptive branch names.
- Write clear PR descriptions and reference related issues.
- Add/Update documentation for new features or endpoints.
- Test your changes locally before submitting PRs.

---

## 📂 Useful Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Redis Docs](https://redis.io/docs)
- [ethers.js Docs](https://docs.ethers.org/)

---

For architecture, code, or onboarding questions, please ask the project maintainers or check the `/docs` folder if available.
