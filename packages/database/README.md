# Online Voting System Database

Welcome to the **Online Voting System Database** package! This package manages the data layer for the entire platform, providing a robust, type-safe, and scalable foundation for elections, users, ballots, and results.

---

## 🚀 Project Objective

- **Define and manage the database schema** for elections, users, ballots, candidates, positions, and results.
- **Enable seamless integration** with backend services using Prisma ORM.
- **Support migrations, type safety, and efficient data access** for all application components.

---

## 🏗️ Project Structure

- `prisma/`
  - `schema.prisma` – Main Prisma schema (models, relations, enums)
- `src/`
  - `client/` – Prisma Client auto-generated code (do not edit manually)
- `.env.example` – Example environment variables for database connection
- `package.json` – Project dependencies and scripts
- `tsconfig.json` – TypeScript configuration

---

## 🛠️ Tech Stack

- **Prisma ORM** ([docs](https://www.prisma.io/docs/)) for type-safe database access
- **PostgreSQL** (or supported DB engines)
- **TypeScript** for type safety
- **pnpm** for package management

---

## 🧑‍💻 Onboarding & Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

- Copy `.env.example` to `.env` and fill in your database connection string and other required variables.

### 3. Database Migration

- Run migrations and generate Prisma Client:

```bash
pnpm prisma migrate dev
```

### 4. Prisma Studio (optional)

- Launch a visual database browser:

```bash
pnpm prisma studio
```

---

## 🤝 Contributing

- Update `schema.prisma` for any model changes. Run migrations and generate new client code after edits.
- Add/Update documentation for new models or schema changes.
- Test your changes locally before submitting PRs.

---

## 📂 Useful Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

For architecture, schema, or onboarding questions, please ask the project maintainers or check the `/docs` folder if available.
