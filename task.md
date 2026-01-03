Project Roadmap: Freelance Marketplace
Infrastructure
 Align infrastructure with DEV Requirements
 Remove hardcoded IDs (Keycloak Hostname)
 Verify internal service communication via service names
 Confirm Kong Admin API restricted to localhost
 Standardize restart policies and logging
 Fix network ERR_CONNECTION_REFUSED (Kong/Keycloak)
 Fix Keycloak Realm 404 (Init script)
 Fix Database Migrations (Schema missing)
 Fix Persistent 401/403 Errors
 Standardize KEYCLOAK_CLIENT_ID in docker-compose.yml
 Fix hardcoded Keycloak config in job-service
 Audit and protect other backend services (Contract, Payment, etc.)
 Improve frontend role detection and loading states
 Fix TypeError in OfferDetails.tsx
 Add role-based Dashboard navigation to LandingPage
 Fix Job Approval 404 Error
 Update AdminsController prefix to /api/admins
 Fix internal API calls in AdminsService (missing /api)
 Update Kong admins route and strip_path setting
 Fix 401 Unauthorized on moderation calls
 Add Keycloak protection to admin-service
 Implement token propagation in AdminsService
 Final verification of all protected endpoints
 Seed job data for search testing
 Update seed.ts with job & skill data
 Implement search sync in seed script
 Run seed and verify in search results
 Fix 401 Unauthorized on profile draft endpoint
 Enable offline token validation in user-service
 Verify routing and controller access
 Fix 404 on Profile Page (Reviews endpoint)
 Standardize review-service routing
 Add reviewee endpoint to ReviewController
 Secure review-service with Keycloak
 Standardize user-service routing
 Story G-013: OAuth2 Registration (Google/Github)
 Add githubId/facebookId to User schema
 Implement getUserById in KeycloakService
 Update UsersService for real auto-provisioning
 Add Facebook login button to frontend
 Sync Avatar URL from social providers
 Add isEmailVerified to User schema
 Enable Keycloak Email Verification trigger
True Dev Mode (Hot Reloading)
 Configure hot-reloading for all microservices
 Mount source code volumes in docker-compose.yml
 Override commands to use npm run dev
 Ensure node_modules persistence and isolation
 Verify instant reload on code changes
I. GUEST (UNAUTHENTICATED)
1. General Information
 Story G-001: Home page with banner, stats, and trending jobs
 Story G-002: Hierarchical categories (category > sub-category)
 Story G-003: Public job list with pagination
 Story G-004: Advanced job search (keyword, location, budget)
 Story G-005: Public job details
 Story G-006: Public freelancer list with ratings
 Story G-007: Public freelancer profile
 Story G-008: Pricing and platform fees page
 Story G-009: Terms of Service & Privacy Policy
 Story G-010: FAQ & Help Center
2. Registration / Login
 Story G-011: Email/password registration with validation
 Story G-012: Role selection (Freelancer/Client) during signup
 Story G-013: Google/Github OAuth2 registration
 Story G-014: Email/password login (Keycloak integrated)
 Story G-015: Social login (Google/Github)
 Implement Social Onboarding endpoint in user-service
 Sync social roles to Keycloak via Admin API
 Handle pending_role in KeycloakProvider
 Automatic role-based redirection after social login
 Story G-016: Password reset via email
 Story G-017: Email verification
 Story G-018: Welcome email
 Story G-019: Clear error messages for auth failures (Fixed race condition in Keycloak initialization)
 Story G-020: Dashboard redirection after login (Handled in KeycloakProvider)
 Fix Persistent 401 Errors (Implemented loading state in KeycloakProvider)
II. FREELANCER STORIES
A. Account Management
 Story F-001: Update personal info (name, phone, bio)
 Story F-002: Avatar upload with crop tool
 Story F-003: Change password
 Story F-004: 2FA setup (Google Authenticator)
 Story F-005: Identity verification (KYC)
 Story F-006: Notification preferences
 Story F-007: Data download (GDPR)
 Add "Account Archive" section to Security Settings
 Implement JSON export download in frontend
 Verify data completeness in exportData
B. Professional Profile (Core)
 Story F-008: Profile creation wizard
 Story F-009: Edit headline
 Story F-010: Rich text bio/description
 Story F-011: Skills management with autocomplete
 Story F-012: Hourly/Fixed-price rates
 Story F-013: Work experience management
 Story F-014: Education management
 Story F-015: Portfolio management (images/files/URLs)
 Story F-016: Primary industry selection
 Story F-017: "Available for work" toggle
 Story F-018: Profile preview (as client)
 Story F-019: Public profile sharing
 Story F-020: Profile completion percentage & suggestions
C. Search & Apply
 Story F-021: Job list with advanced filters
 Story F-022: Filter by skills, budget, type, level
 Story F-023: Filter by location, duration, client history
 Story F-024: Save/Bookmark jobs
 Story F-025: Job alerts (email)
 Story F-026: Job details with attachments & client info
 Story F-027: Submit proposal with cover letter
 Story F-028: Attach portfolio to proposal
 Story F-029: Propose price and timeline
 Story F-030: Proposal history with status
 Story F-031: Withdraw proposal
 Story F-032: Duplicate proposal
 Story F-033: Proposal limits/quota
D. Contracts & Work
 Story F-034: Job offer notifications
 Story F-035: View job offer details
 Story F-036: Accept/Decline offer
 Story F-037: Negotiate terms (counter-offer)
 Story F-038: Active contracts list
 Story F-039: Contract details (milestones, deadlines)
 Story F-040: File upload in workspace
 Story F-041: Real-time chat in workspace
 Story F-042: File attachments in chat
 Story F-043: Progress reporting (% completion)
 Story F-044: Submit deliverables for review
 Story F-045: Request milestone payment
 Story F-046: Request contract extension
 Story F-047: Terminate contract
 Story F-048: Completed contracts history
E. Time & Payment
 Story F-049: Time tracker for hourly contracts
 Story F-050: Timesheet management (manual edit)
 Story F-051: Time summary reports
 Story F-052: Wallet balance & transaction history
 Story F-053: Pending vs Available earnings
 Story F-054: Withdrawal requests
 Story F-055: Withdrawal history & status
 Story F-056: Invoices for payments received
 Story F-057: Download invoice PDF
 Story F-058: Earnings dashboard with charts
 Story F-059: Automatic withdrawal schedule
 Story F-060: Platform fee breakdown
 Backend: Calculate and store fee in transaction/invoice
 Backend: Verification of logic
 Frontend: Show breakdown in transactions table
 Dynamic: Fetch fee from admin-service configuration
F. Reviews & Reputation
 Story F-061: View client reviews
 Story F-062: Rating breakdown
 Story F-063: Reply to reviews
 Backend: Add reply and repliedAt fields to Review model
 Backend: Implement addReply logic in service and controller
 Backend: Unit test for addReply service logic
 Frontend: Implement reply button and form on profile page
 Verification: Final UI check as freelancer
 Story F-064: Job Success Score (JSS)
 Story F-065: Earned badges
 Story F-066: Report inappropriate reviews
 Story F-067: Public profile stats
 Story F-068: Request client review
G. Advanced Features
 Story F-069: Service packages (Bronze/Silver/Gold)
 Story F-070: Availability calendar
 Story F-071: Smart job recommendations
 Story F-072: Video call integration
 Story F-073: AI proposal writer
 Story F-074: Community forum
 Story F-075: Referral program
III. CLIENT STORIES
A. Account Management
 Story C-001: Update company info
 Story C-002: Company logo upload
 Story C-003: Payment method verification
 Story C-004: Team management & permissions
 Story C-005: Notification preferences
 Story C-006: Billing information
B. Job Posting & Management
 Story C-007: Job posting form
 Story C-008: Category selection
 Story C-009: Rich text job description
 Story C-010: Attach files to job post
 Story C-011: Set budget (Fixed/Hourly)
 Story C-012: Set duration & deadlines
 Story C-013: Required skills selection
 Story C-014: Experience level required
 Story C-015: Location preference
 Story C-016: Preview job post
 Story C-017: Save job as draft
 Story C-018: Duplicate job
 Story C-019: My Jobs list with status filter
 Story C-020: Edit active job
 Story C-021: Pause/Resume job
 Story C-022: Close job with reason
 Story C-023: Extend job duration
 Story C-024: Promote job
 Story C-025: Job analytics
C. Hiring
 Story C-026: View proposals for my job
 Story C-027: Filter proposals
 Story C-028: Sort proposals
 Story C-029: View proposal details
 Story C-030: Shortlist proposals
 Story C-031: Archive/Reject proposals
 Story C-032: Invite freelancer to job
 Story C-033: Pre-hire chat
 Story C-034: Schedule interviews
 Story C-035: Send job offer
 Story C-036: Negotiate terms
 Story C-037: Create contract
 Story C-038: Milestone & payment schedule
 Story C-039: Custom contract templates (NDA)
 Story C-040: View freelancer history
D. Project Management
 Story C-041: Active contracts dashboard
 Story C-042: Contract details & progress
 Story C-043: Track progress via updates
 Story C-044: Deliverable notifications
 Story C-045: Review deliverables
 Story C-046: Request revisions
 Story C-047: Approve milestone & release payment
 Story C-048: Pause contract
 Story C-049: Terminate contract
 Story C-050: Extend contract budget/duration
 Story C-051: Add new milestones
 Story C-052: Project chat
 Story C-053: Schedule check-ins
 Story C-054: View timesheets (Hourly)
 Story C-055: Dispute timesheet entries
 Story C-056: End contract & leave review
E. Payments
 Story C-057: Deposit funds (Escrow)
 Story C-058: Auto-deposit
 Story C-059: Escrow balance & history
 Story C-060: Manual milestone release
 Story C-061: Auto-release rules
 Story C-062: Invoices & receipts
 Story C-063: Tax documents
 Story C-064: Spending reports
 Story C-065: Manage payment methods
 Story C-066: Request refund
F. Reviews & Management
 Story C-067: Review freelancer
 Story C-068: Multi-criteria rating
 Story C-069: Talent pool management
 Story C-070: Work history with freelancer
 Story C-071: Report freelancer
 Story C-072: Client dashboard stats
 Story C-073: Referral program
 Story C-074: Support & Dispute access
IV. ADMIN STORIES
A. User Management
 Story A-001: User list with filters
 Story A-002: View user profile details
 Story A-003: Search users
 Story A-004: Lock/Unlock accounts
 Story A-005: Admin roles & permissions
 Story A-006: Manual KYC verification
 Story A-007: Send warnings
 Story A-008: Activity logs
 Story A-009: Bulk actions
 Story A-010: Export user list
B. Job & Contract Management
 Story A-011: Job moderation (Approve/Reject)
 Story A-012: Job list with status
 Story A-013: Edit job postings
 Story A-014: Delete violating jobs
 Story A-015: View all active contracts
 Story A-016: Dispute intervention
 Story A-017: View dispute evidence
 Story A-018: Final dispute decision
 Story A-019: Refund/Release in disputes
 Story A-020: Contract statistics
C. Payments & Finance
 Story A-021: System-wide transaction list
 Story A-022: Filter transactions
 Story A-023: Revenue & fee tracking
 Story A-024: Withdrawal approval
 Story A-025: Escrow monitoring
 Story A-026: Financial reports
 Story A-027: Export financial data
 Story A-028: Payment gateway management
 Story A-029: Fraud & Chargeback cases
 Story A-030: Tax & VAT management
D. Reporting & Analytics
 Story A-031: KPI Dashboard
 Story A-032: User growth charts
 Story A-033: Job statistics
 Story A-034: Revenue trends
 Story A-035: Top performers
 Story A-036: Geographic distribution
 Story A-037: Category & Skill trends
 Story A-038: Churn & Retention
 Story A-039: System performance
 Story A-040: Scheduled reports
E. System & Configuration
 Story A-041: Category management
 Story A-042: Skill database management
 Story A-043: Fee & Pricing configuration
 Story A-044: Escrow & Release rules
 Story A-045: Static content management (FAQ, ToS)
 Story A-046: Email templates
 Story A-047: System logs
 Story A-048: Feature flags
 Story A-049: Backup & Restore
 Story A-050: API keys & Integrations
F. Content Moderation
 Story A-051: Flagged content view
 Story A-052: Moderation actions
 Story A-053: Moderation queue
 Story A-054: Automated filters
 Story A-055: User trust scores
Testing Accounts
Role	Email	Password
Freelancer	freelancer@example.com	Password123!
Client	client@example.com	Password123!
Admin	admin@example.com	Password123!
