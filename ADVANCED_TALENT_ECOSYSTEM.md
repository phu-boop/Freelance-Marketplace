# 💎 Advanced Talent Ecosystem Plan

Inspired by Upwork's agency model and specialized profiles, this plan focuses on how freelancers present themselves and how they organize into teams.

## 1. Specialized Profiles (The Multi-Identity)
Currently, a user has one set of skills/bio. We will implement "Sub-profiles".
### 🎯 Features
- **Profile Versions:** A freelancer can create up to 3 specialized profiles (e.g., "React Native Expert" vs "Python Data Scientist").
- **Targeted Portfolio:** Map portfolio items to specific specialized profiles.
- **Specific Rates:** Different hourly rates for different specializations.
### 🛠️ Sub-tasks
- [ ] **Backend (User Service):**
    - Create `SpecializedProfile` model linked to `User`.
    - Update `PortfolioItem` to include `specializedProfileId`.
- [ ] **Frontend:**
    - New "Profile Switcher" in the Freelancer Profile view.
    - Specialized Edit flow for each sub-profile.

## 2. Agency 3.0: Collaborative Work
The current `Team` model is basic. We need to turn it into a revenue-generating Agency.
### 🎯 Features
- **Agency Manager Role:** Can bid on jobs on behalf of agency members.
- **Shared Financials:** Agency-wide wallet vs individual member earnings.
- **Agency Portfolio:** Aggregate portfolio items from all members to show collective power.
### 🛠️ Sub-tasks
- [ ] **Backend (User/Contract Service):**
    - Implement `agencyId` tracking across all `Proposals` and `Contracts`.
    - Add `revenueSplit` logic to automatically distribute funds.
- [ ] **Frontend:**
    - Agency Dashboard showing team performance and active contracts.

## 3. Verified Talent Clouds (Enterprise)
Private marketplaces for high-end clients.
### 🎯 Features
- **Invitation-Only Membership:** Clients "vett" freelancers into their private cloud.
- **Cloud-Specific Roles:** Different permissions within the cloud (e.g., "Lead Freelancer", "Contributor").
- **Cloud Budgeting:** Clients allocate budgets specifically for work within the cloud.
### 🛠️ Sub-tasks
- [ ] **Backend (Talent Cloud Service):**
    - Implement `TalentCloudBudget` and `Policy` models.
    - Integration with `Job Service` to restrict job postings to specific clouds.

---
> [!IMPORTANT]
> This requires a careful UI/UX balance to ensure users don't get confused by multiple profile IDs.
