# API Contracts: Freelance Marketplace

This document defines the core API endpoints and data structures to ensure consistency across microservices and the frontend.

## 1. User Service (`/users`)

### Profile Management
- **GET `/users/profile/:id`**
    - Response: `User` object with `education`, `experience`, `portfolio`.
- **PATCH `/users/profile/:id`**
    - Payload: `Partial<User>`
- **POST `/users/kyc`**
    - Payload: `{ idDocument: string, selfieUrl: string }`

### Team Management
- **POST `/users/teams`**
    - Payload: `{ name: string, description?: string, logoUrl?: string }`
- **POST `/users/teams/:id/members`**
    - Payload: `{ userId: string, role: 'ADMIN' | 'MEMBER' }`

---

## 2. Job Service (`/jobs`)

### Job Posting
- **POST `/jobs`**
    - Payload: `{ title, description, budget, categoryId, skills: string[], type: 'FIXED_PRICE' | 'HOURLY', experienceLevel, locationType, location? }`
- **GET `/jobs`**
    - Query: `page, limit, categoryId, minBudget, maxBudget, experienceLevel, locationType`

### Service Packages (Gigs)
- **POST `/jobs/service-packages`**
    - Payload: `{ title, description, categoryId, bronze: { price, deliveryTime, deliverables }, silver?, gold? }`

---

## 3. Proposal Service (`/proposals`)

### Submitting Proposals
- **POST `/proposals`**
    - Payload: `{ jobId, coverLetter, bidAmount, estimatedDuration, attachments: string[] }`
- **PATCH `/proposals/:id/shortlist`**
    - Payload: `{ isShortlisted: boolean }`
- **POST `/proposals/:id/counter-offer`**
    - Payload: `{ amount, terms }`

---

## 4. Contract Service (`/contracts`)

### Contract Lifecycle
- **POST `/contracts`** (Triggered by accepting a proposal)
    - Payload: `{ proposalId, milestones: [{ description, amount, dueDate }] }`
- **POST `/contracts/:id/dispute`**
    - Payload: `{ reason, evidence: string[] }`

### Milestones & Work
- **POST `/contracts/:id/milestones/:milestoneId/submit`**
    - Payload: `{ content, attachments: string[] }`
- **POST `/contracts/:id/submissions/:submissionId/revision`**
    - Payload: `{ feedback, attachments: string[] }`

---

## 5. Payment Service (`/payments`)

### Wallet & Transactions
- **GET `/payments/wallet`**
- **POST `/payments/withdraw`**
    - Payload: `{ amount, withdrawalMethodId }`
- **POST `/payments/auto-withdrawal/config`**
    - Payload: `{ enabled, threshold, schedule }`

---

## 6. Chat Service (`/chats`)

### Messaging
- **POST `/chats`**
    - Payload: `{ receiverId, content, attachments?: string[], contractId?: string }`
- **GET `/chats/history?user1=...&user2=...`**

---

## 7. Analytics Service (`/analytics`)

### Public Stats
- **GET `/analytics/public/stats`**
    - Response: `{ totalJobs, totalFreelancers, totalPaid }`

---

## 8. Search Service (`/search`)

### Advanced Search
- **GET `/search/jobs?q=...&category=...&skills=...`**
- **GET `/search/users?q=...&skills=...`**

---

## Shared Data Structures (TypeScript)

```typescript
enum JobStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
  DISPUTED = 'DISPUTED'
}

enum EscrowStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED'
}
```
