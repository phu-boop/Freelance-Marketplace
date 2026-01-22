# 🦅 Advanced Talent Ecosystem Plan

This phase transforms the platform from an individualistic marketplace to a multi-layered talent hub, supporting specialized professional identities and agency-scale operations.

## 1. Specialized Profiles (Professional Identity 2.0)
Allow freelancers to maintain up to 3 distinct professional identities (e.g., "React Specialist" and "Node.js Architect").

### 🎯 Key Features
- **Profile Context Switching:** UI for freelancers to toggle between specialized views.
- **Isolated Reputations:** Track success scores and earnings per specialized profile (optional/configurable).
- **Proposal Linking:** When bidding, freelancers MUST select which profile to present to the client.

### 🛠️ Sub-tasks
- [ ] **Frontend Profile Hub:**
    - Create `ProfileSelector` component.
    - Build `SpecializedProfileBuilder` wizard (Skills/Portfolio selection).
- [ ] **Cross-Service Integration:**
    - Update `proposal-service` to store `specializedProfileId`.
    - Update `search-service` to index specialized profiles separately for better matching.

## 2. Agency Mode 2.0 (The Firm Workspace)
Moving beyond simple "Teams" to professional firms that can hire, manage, and bill as a single entity.

### 🎯 Key Features
- **Agency Branding:** Dedicated company profiles with shared portfolios.
- **Hierarchical Permissions:** 
    - *Owner:* Full control, financial oversight.
    - *Manager:* Can post jobs, hire, and review work.
    - *Associate:* Purely execution, can be assigned to agency contracts.
- **Commission Management:** Automated revenue distribution based on the `revenueSplitPercent` defined in the Team schema.

### 🛠️ Sub-tasks
- [ ] **Agency Workspace UI:**
    - Build `AgencyDashboard` showing aggregate metrics (Total Team Earnings, Active Member Contracts).
    - Implement `MemberInvite` flow with role selection.
- [ ] **Financial Integration:**
    - Link `payment-service` to Agency accounts for automated split-payouts.

## 3. Vetted Talent Clouds
Private, curated pools of freelancers for enterprise clients.

### 🎯 Key Features
- **By-Appointment Entry:** Clients can "Invite" talent to their private cloud.
- **Custom Rates:** Pre-negotiated hourly rates for cloud members.

---
> [!IMPORTANT]
> A specialized profile is NOT a separate user account. It shares the same login and core wallet but presents different professional credentials and history.
