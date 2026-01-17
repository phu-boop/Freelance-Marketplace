---
description: Payment Service Feature – Transaction Management Enhancements
---

# Objective
Implement a robust Transaction Management API for the **payment-service** that provides:
- Retrieval of a single transaction by ID.
- Paginated & filterable list of transactions for a user.
- Ability to update transaction status (e.g., mark as *refunded* or *disputed*).
- Automatic audit logging for every mutation.
- Comprehensive unit‑tests and OpenAPI documentation.

# High‑Level Steps
1. **Design API contract** – define DTOs and OpenAPI specs for the new endpoints.
2. **Update PaymentsController** – add routes:
   - `GET /api/payments/transactions/:id`
   - `GET /api/payments/transactions` (query: `limit`, `offset`, `type`, `status`)
   - `PATCH /api/payments/transactions/:id`
3. **Extend PaymentsService** – implement methods:
   - `getTransactionById(id: string)`
   - `listTransactions(userId: string, opts: ListOpts)`
   - `updateTransactionStatus(id: string, status: TransactionStatus)`
4. **Add Prisma schema** (if needed) – ensure `Transaction` model contains `status` field and indexes for filtering.
5. **Integrate audit logging** – reuse existing `logFinancialEvent` to record status changes.
6. **Write unit tests** – cover controller & service logic, including edge cases (not‑found, unauthorized).
7. **Update OpenAPI docs** – expose new endpoints with proper request/response schemas.
8. **Run end‑to‑end verification** – spin up the service locally, hit the new routes, verify DB changes and audit entries.
9. **Documentation & README** – add usage examples and migration notes.

# Detailed Tasks
- **DTOs** (`src/payments/dto/`):
  - `GetTransactionDto` – `{ id: string }`
  - `ListTransactionsDto` – `{ limit?: number; offset?: number; type?: string; status?: string }`
  - `UpdateTransactionStatusDto` – `{ status: 'COMPLETED' | 'REFUNDED' | 'DISPUTED' }`
- **Controller** (`payments.controller.ts`):
  - Add methods with appropriate `@Roles`/`@Public` decorators.
  - Validate input using class‑validator.
- **Service** (`payments.service.ts`):
  - Use Prisma `$transaction` for atomic status updates + audit log.
  - Implement pagination with `take` / `skip`.
- **Prisma migration**:
  - Ensure `status` column exists (`String @default('PENDING')`).
  - Add composite index on `(userId, status)` for efficient queries.
- **Testing** (`payments.service.spec.ts`, `payments.controller.spec.ts`):
  - Mock Prisma & HttpService.
  - Test happy path, permission errors, and audit failures.
- **CI** – add script to run `npm run test` and `npx prisma generate`.

# Acceptance Criteria
- All new endpoints return `200` with correct payloads.
- Unauthorized access returns `403`.
- Updating a transaction logs an audit event.
- Pagination works (`limit` defaults to 20, `offset` defaults to 0).
- Documentation is generated without errors.

# Timeline (approx.)
| Day | Activity |
|-----|----------|
| 1   | API design & DTO creation |
| 2   | Controller & Service implementation |
| 3   | Prisma migration & audit integration |
| 4   | Unit & integration tests |
| 5   | Documentation, CI updates, final QA |

---

*This workflow file can be executed with the `// turbo-all` annotation if you wish to auto‑run the associated `run_command` steps (e.g., `npx prisma migrate dev`).*
