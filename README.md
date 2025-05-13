# Online Voting System

A secure, transparent, and decentralized platform for online elections—leveraging blockchain, modern web technologies, and robust authentication.

---

## 🚀 Project Objective

- Enable secure, transparent, and accessible online voting for organizations and communities.
- Ensure tamper-proof, auditable elections using blockchain (Polygon/Ethereum).
- Provide a modern, user-friendly experience for voters, admins, and election officers.
- Support real-time analytics, robust authentication, and scalable architecture.

---

## 🏗️ Monorepo Structure

```
apps/
  frontend/   # Next.js (App Router) – user-facing web app
  backend/    # NestJS – API, business logic, integrations
packages/
  contracts/  # Solidity smart contracts, Hardhat, deployment scripts
  database/   # Prisma schema, migrations, database utilities
```

- **frontend/**: Voter/admin portal, dashboards, ballot casting, results (Next.js, Tailwind, Shadcn UI, Clerk, wagmi, ethers.js)
- **backend/**: APIs, authentication, election logic, analytics, blockchain integration (NestJS, Prisma, Redis, Clerk)
- **contracts/**: Ethereum/Polygon smart contracts for elections and ballots (Solidity, Hardhat, TypeChain)
- **database/**: Prisma schema, migrations, DB utilities (PostgreSQL)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (TypeScript), Tailwind CSS, Shadcn UI, Clerk, wagmi, ethers.js, TanStack Query
- **Backend:** NestJS (TypeScript), Prisma ORM, Clerk, Redis, ethers.js
- **Blockchain:** Solidity, Hardhat, TypeChain, Ethers.js, Polygon/Ethereum
- **Database:** PostgreSQL (via Prisma)
- **Auth:** Clerk (multi-role: voter, admin, election_officer)
- **Dev Tools:** ESLint, Prettier, pnpm, Docker Compose

---

## ⚡ Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/jhenbertgit/online-voting-system.git
cd online-voting-system
pnpm install
```

### 2. Environment Setup

- Copy `.env.example` files in each package/app to `.env` and fill in required values (see individual READMEs for details).

### 3. Database & Contracts

- Run Prisma migrations: `pnpm --filter database exec prisma migrate dev`
- Compile contracts: `pnpm --filter contracts hardhat compile`

### 4. Start Services

- Frontend: `pnpm --filter frontend dev`
- Backend: `pnpm --filter backend start:dev`

---

## 📂 Further Documentation

- See individual READMEs in `apps/frontend`, `apps/backend`, `packages/contracts`, and `packages/database` for detailed onboarding, scripts, and architecture.

---

For questions about architecture or onboarding, please contact project maintainers or consult the `/docs` folder if available.

## Structure

- `apps/frontend` – Next.js frontend
- `apps/backend` – Nest.js backend API
- `packages/contracts` – Smart contracts (Solidity/Polygon)
- `packages/database` – Prisma schema and migrations
- `packages/utils` – Shared utilities

---

For setup and contribution guidelines, see the respective `README.md` files in each package/app.
