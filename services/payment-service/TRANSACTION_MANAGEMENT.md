# Transaction Management Features

This service provides robust transaction tracking and management for the Freelance Marketplace platform.

## Endpoints

### 1. List Transactions
- **Path**: `GET /api/payments/transactions`
- **Roles**: `FREELANCER`, `CLIENT`
- **Query Parameters**:
  - `limit` (number, default: 20): Number of records to return.
  - `offset` (number, default: 0): Records to skip.
  - `type` (string): Filter by transaction type (e.g., `PAYMENT`, `WITHDRAWAL`).
  - `status` (string): Filter by status (e.g., `COMPLETED`, `PENDING_APPROVAL`, `REFUNDED`).
- **Description**: Returns a paginated list of transactions where the authenticated user is the wallet owner.

### 2. Get Transaction Detail
- **Path**: `GET /api/payments/transactions/:id`
- **Roles**: `FREELANCER`, `CLIENT`
- **Description**: Returns detailed information about a specific transaction, including associated wallet and invoice data.

### 3. Update Transaction Status
- **Path**: `PATCH /api/payments/transactions/:id`
- **Roles**: `ADMIN`
- **Body**: `{ "status": "COMPLETED" | "REFUNDED" | "DISPUTED" }`
- **Description**: Allows administrators to override the status of a transaction. Each update triggers a financial audit log.

## Audit Logging

All transaction status changes are recorded via the `AuditService`. These logs include:
- `service`: `payment-service`
- `eventType`: `TRANSACTION_STATUS_UPDATED`
- `actorId`: The ID of the administrator performing the action.
- `metadata`: Contains both the previous and new status for traceability.
