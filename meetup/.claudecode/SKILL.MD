# Full-Stack Engineering Rules (Vue 3 + Node + Postgres)

## Vue 3 Rules
- Use exclusively Vue 3 `<script setup>` with TypeScript.
- Never use Options API or mix `ref` and `reactive` unpredictably. Prefer `ref()` for primitives/arrays, and `reactive()` only for complex state objects.
- All global state must use Pinia (Setup Stores pattern). Components must not fetch data directly; delegate to Pinia stores or composables.

## Node.js & API Rules
- Enforce Layered Architecture: Routes -> Middlewares/Validators -> Controllers -> Services.
- Every API endpoint must have a Zod validation schema for input data.
- Global error handling middleware must catch all async errors and format them safely (no stack traces in production).

## PostgreSQL & Database Rules
- Never use string interpolation for SQL queries; always use parameterized queries or type-safe ORM methods.
- Ensure all foreign keys have appropriate indexes.
- Optimize relationships to prevent N+1 query problems. Use transactions for multi-row mutations.

## Prisma ORM & Database Rules
- Always read `.prisma/schema.prisma` before generating database queries or mutations to ensure absolute type alignment.
- Use explicit Prisma relations and avoid raw SQL query methods (`$queryRaw`) unless strictly necessary for complex aggregations.
- Prevent N+1 query patterns: Never execute Prisma calls inside loops (`.map`, `.forEach`). Use `include`, `select`, or batching via `$transaction`.
- Handle database errors gracefully using Prisma Client known request errors (`Prisma.PrismaClientKnownRequestError`) to return proper HTTP status codes (e.g., P2002 -> 409 Conflict).
- For paginated endpoints, strictly enforce the usage of `take` and `skip` (or cursor-based pagination with `cursor` for large datasets).
- Disallow direct usage of Prisma Client inside Vue components or API controllers. All DB operations must be encapsulated inside specialized Service/Repository layers.
