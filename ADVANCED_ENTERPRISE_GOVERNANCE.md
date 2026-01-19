# 🏢 Enterprise Governance & Hierarchy Plan

Enabling billion-dollar companies to use the platform safely and at scale.

## 1. Company Hierarchy & Sub-Roles
Currently, a Client is just one user. We need "Organization" accounts.
### 🎯 Features
- **Company Admin:** Full control over billing, team members, and all activities.
- **Hiring Manager:** Can post jobs and hire, but cannot change billing methods.
- **Staffing Partner:** Can shortlist freelancers but cannot sign contracts.
- **Finance/Accounts:** Can only view invoices and pull reports.
### 🛠️ Sub-tasks
- [ ] **Data Model (User Service):**
    - Extend `TeamMember` model with specific `PermissionSet`.
- [ ] **Frontend:**
    - Team Management dashboard for Organization accounts.

## 2. Approval Workflows (The Check and Balance)
Ensuring no single employee can spend company money without oversight.
### 🎯 Features
- **Contract Sign-off:** "Contracts over $5,000 require Approval from a Company Admin".
- **Milestone Release Limits:** "Hiring managers can only release up to $1,000/week without secondary approval".
- **Payment Method Lockdown:** Restricted use of company credit cards to specific departments.
### 🛠️ Sub-tasks
- [ ] **Backend (Contract/Payment Service):**
    - Implement an `ApprovalRequest` system (already started in some schemas, needs full logic).

## 3. Compliance & Custom Onboarding
- **Internal Reference IDs:** Require a "PO Number" or "Cost Center Code" for every job post/contract.
- **Custom NDAs:** Every hired freelancer must sign the Company's specific legal agreement before seeing the project files.
- **SSO Integration (SAML):** (Mentioned in Roadmap) Mandatory for enterprises to manage employee access via Okta/Azure AD.

---
> [!IMPORTANT]
> Enterprise clients care about "CONTROL" as much as they care about "TALENT".
