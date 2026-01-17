# Contract & Escrow Management Implementation Plan

## Objective
Implement a robust Contract Management system that handles the lifecycle of work engagements between Clients and Freelancers. This includes managing Fixed-Price (Milestone-based) and Hourly contracts, facilitating work submissions, approvals, and integrating with the Escrow/Payment system.

## 1. Backend: Contract Service Enhancements

### 1.1 Contract Lifecycle Management
- **Status:** Basic Implementation Exists (Needs Polish)
- **Enhancements:**
    - **Contract States:** Enforce state transitions: `OFFER` -> `ACTIVE` -> `PAUSED` -> `COMPLETED` / `TERMINATED` / `DISPUTED`.
    - **Pause/Resume:** Allow Clients to pause contracts (stops hourly tracking/milestone activation).
    - **End Contract:** Logic to calculate final payments, release escrow, and trigger feedback (Reviews).

### 1.2 Milestone Management (Fixed-Price)
- **Status:** Pending/Basic
- **Features:**
    - `POST /contracts/:id/milestones`: Add new milestones to active contracts.
    - `PUT /contracts/milestones/:id`: Edit milestone details (requires Freelancer approval if active).
    - `POST /contracts/milestones/:id/activate`: Fund/Activate a milestone via Payment Service.

### 1.3 Work Submission & Approval
- **Status:** Pending
- **Endpoints:**
    - `POST /contracts/milestones/:id/submit`: Freelancer submits work (message, attachments).
    - `POST /contracts/milestones/:id/approve`: Client approves work -> Triggers Fund Release.
    - `POST /contracts/milestones/:id/reject`: Client requests changes.

### 1.4 Integration Points
- **Payment Service:** Trigger Escrow Funding and Release events.
- **Notification Service:** Alerts for Offers, Milestones Funded, Work Submitted, Payment Released.
- **Chat Service:** Link contracts to chat rooms (Context Sidebar).

## 2. Frontend: Contract UI/UX

### 2.1 Contract List ("My Contracts")
- **Enhancements:**
    - **Tabs:** Active, Pending (Offers), Ended.
    - **Summary Card:** Client Name, Contract Title, Status, Earnings/Spend.
    - **Action Buttons:** "View Room", "Submit Work", "Give Bonus".

### 2.2 Contract Detail Page (`/contracts/[id]`)
- **Header:** Key stats (Total Paid, Remaining, Status).
- **Tabs Layout:**
    - **Overview:** Contract terms, description.
    - **Milestones/Time:** List of milestones with status (Active, Funded, Completed). Button to "Submit Work" or "Approve".
    - **Messages:** Embedded Contract-specific chat (optional) or link to Messages.
    - **Terms & Settings:** Pause/End Contract button, Original Proposal link.

### 2.3 Work Submission Modal
- **Upload:** File attachment support (Reuse Chat Upload logic).
- **Message:** Description of work done.
- **Confirmation:** Warning that changes are final until reviewed.

### 2.4 Offer Management (Accept/Decline)
- UI for Freelancers to review incoming offers.
- "Accept Offer" flow triggers contract activation.

## 3. Integration with Messaging (The "Missing Link")

### 3.1 Chat Sidebar Integration
- **Feature:** When viewing a chat with a Client/Freelancer, fetch "Active Contract" details.
- **Display:**
    - Current Milestone details.
    - "Submit" action directly in chat?
    - Link to Contract Room.

## 4. Implementation Phases

1.  **Phase 1: Structure & Lifecycle: [COMPLETED]**
    - [x] Backend states refined (`ACTIVE`, `PAUSED`, `COMPLETED`, `TERMINATED`).
    - [x] Frontend List/Detail pages updated to use `contract-service`.
    - [x] Pause/Resume support for Clients.
    - [x] Contract Bridge: `job-service` -> `contract-service` on offer acceptance.
2.  **Phase 2: Milestone Work Flow: [COMPLETED]**
    - [x] Implement the core Submit -> Approve -> Release loop.
    - [x] Escrow funding logic integrated with `payment-service`.
    - [x] Delegate Authorization tokens from `contract-service` to `payment-service`.
    - [x] Frontend visual feedback for funded escrow.
3.  **Phase 3: Integration: [COMPLETED]**
    - [x] Connect Chat Context (Sidebar in messages).
    - [x] Real-time Notifications for contract events.
4.  **Phase 4: Dispute & Resolution: [COMPLETED]**
    - [x] `POST /contracts/:id/dispute`: Open a dispute case.
    - [x] Resolution logic: Investigator assignment and decision making.
    - [x] Refund handling in `payment-service`.
