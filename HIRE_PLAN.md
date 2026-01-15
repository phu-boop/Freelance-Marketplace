# Hire Freelancer & Invitation Plan

## Objective
Implement the functionality for Clients to hire or invite Freelancers directly from their profile page.

## Phase 1: Backend (API Support)
- [x] **Create Invitation Endpoint**
  - Implement `POST /api/invitations` (likely in `job-service`).
  - **Payload**:
    - `freelancerId`: string (Target freelancer)
    - `jobId`: string (Selected job)
    - `message`: string (Optional invitation message)
  - **Logic**:
    - Validate Client ownership of Job.
    - Check if Freelancer is already invited or hired.
    - Create `Invitation` record (or `Proposal` with status `INVITED`).
    - Send notification to Freelancer.

- [x] **List Client Jobs Endpoint**
  - Existing `GET /api/jobs/my-jobs?status=OPEN` should be sufficient.
  - Verify it returns necessary details (id, title).

## Phase 2: Frontend (UI/UX)
- [x] **Hire Modal Component**
  - Create `HireModal.tsx` using `shadcn/ui` dialog.
  - **State**:
    - `loading`: boolean (fetching jobs)
    - `jobs`: Job[]
    - `selectedJobId`: string
    - `message`: string
  - **Flow**:
    - When "Hire Freelancer" is clicked, open Modal.
    - Fetch Client's open jobs (`/api/jobs/my-jobs?status=OPEN`).
    - If no open jobs, show button to "Create New Job".
    - If jobs exist, allow selection and message input.
    - Submit -> Call `POST /api/invitations`.
    - Show success toast.

- [x] **Integration**
  - Connect `HireModal` to the "Hire Freelancer" button in `ProfileView.tsx`.
  - Handle authentication state (redirect to login if not logged in).

## Phase 3: Notifications (Optional/Later)
- [ ] **Freelancer Notification**
  - Receive real-time notification or email about the invitation.
  - Link to "My Proposals" or "Invitations" page.
