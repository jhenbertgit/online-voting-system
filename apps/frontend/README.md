# Online Voting System Frontend

Welcome to the **Online Voting System Frontend**! This project provides a secure, scalable, and user-friendly interface for blockchain-based online elections. It is designed to empower voters, admins, and election organizers with robust features and a modern UX.

---

## 🚀 Project Objective

- **Enable secure, transparent, and accessible online voting** leveraging blockchain and modern web technologies.
- **Support multiple user roles** (voter, admin, election_officer) with tailored experiences.
- **Integrate with Ethereum smart contracts** for verifiable elections and results.
- **Provide real-time analytics and result dashboards**.
- **Ensure accessibility, reliability, and privacy** for all users.

---

## 🏗️ Project Structure

- `app/` – Next.js App Router structure: pages, layouts, and route handlers (including `api/` endpoints for SSR or proxying to backend).
  - `(auth)/` – Authentication flows (Clerk integration)
  - `admin/` – Admin dashboard and management
  - `ballot/` – Ballot casting and voting flows
  - `results/` – Election result displays
  - `api/` – API routes for frontend-specific logic
  - `globals.css` – Global styles (TailwindCSS)
  - `layout.tsx` & `page.tsx` – Root layout and entry page
- `components/`
  - `shared/` – High-level app components (e.g., Dashboard, Analytics, Navbar, WalletConnect)
  - `ui/` – Shadcn UI primitives (Button, Dialog, Table, etc.)
- `contexts/` – React Contexts for app-wide state (elections, contracts)
- `lib/` – Utilities (API, Merkle tree, role helpers, wagmi/web3 utils)
- `types/` – TypeScript type definitions
- `abis/` – Ethereum contract ABIs
- `public/` – Static assets (SVGs, icons)

---

## 🛠️ Tech Stack

- **Framework:** [Next.js App Router](https://nextjs.org/docs/app) (TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State/Data:** React Context, [TanStack Query](https://tanstack.com/query/latest), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Auth:** [Clerk](https://clerk.com/)
- **Blockchain:** [ethers.js](https://docs.ethers.org/), [wagmi](https://wagmi.sh/), [merkletreejs](https://github.com/miguelmota/merkletreejs)
- **Lint/Format:** ESLint, Prettier
- **Package Manager:** pnpm

---

## 🧑‍💻 Onboarding & Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

- Copy `.env.example` to `.env` and fill in required values (see comments in `.env.example`).
- Ensure you have Clerk, Ethereum node, and backend API endpoints configured.

### 3. Run the Dev Server

```bash
pnpm dev
```

App will be available at [http://localhost:3000](http://localhost:3000).

### 4. Project Scripts

- `pnpm dev` – Start development server
- `pnpm build` – Build for production
- `pnpm lint` – Lint codebase

### 5. Code Quality

- Use TypeScript for all code.
- Follow project conventions (see `.eslintrc` and Prettier config).
- UI: Use Tailwind and Shadcn UI primitives.
- Data fetching: Use TanStack Query for all async data.
- Forms: Use React Hook Form + Zod for validation.

---

## 🤝 Contributing

- Branch from `main` and use descriptive branch names.
- Write clear PR descriptions and reference related issues.
- Add/Update documentation for new features.
- Test your changes locally before submitting PRs.

---

## 📂 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn UI Docs](https://ui.shadcn.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Clerk Docs](https://clerk.com/docs)
- [wagmi Docs](https://wagmi.sh/docs/)
- [ethers.js Docs](https://docs.ethers.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

For architecture, code, or onboarding questions, please ask the project maintainers or check the `/docs` folder if available.
