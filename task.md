Project Roadmap: Freelance Marketplace
IMPORTANT

HOT RELOADING IS ACTIVE: Do NOT restart services manually for code changes. Only restart if 
package.json
 changes or Prisma Schema updates occur.

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
 Fix 502 error on contract-service due to compilation failure
 Standardize microservice endpoints and Kong routing
 Audit all 16 microservices for routing consistency
 Update Kong to use strip_path: false for all services
 Standardize all controllers to @Controller('api/...')
 Fix compilation and dependency issues in payment-service
 Fix ClickHouse syntax and FastAPI routes in analytics-service
 Map missing Interview, Forum, and Public routes in Kong
 Fix internal 401 Unauthorized when contract-service calls job-service
 Update 
ContractsController
 to propagate auth token
 Update 
ContractsService
 to use auth token in internal calls The microservice architecture had inconsistent routing prefixes and unreachable endpoints.
Root Cause: Inconsistent use of strip_path in Kong and mismatching controller prefixes. Missing Kong routes for Interviews, Forum, and Public configurations.
Fix:
Standardized all 16 services to use the /api/... pattern (e.g., @Controller('api/payments')).
Updated 
kong.yml
 to use strip_path: false for all services, ensuring predictable routing.
Resolved build failures in payment-service by synchronizing Prisma and installing @nestjs/axios.
Fixed syntax errors and standardized routes in analytics-service (FastAPI).
Verified all services are healthy and routes are correctly mapped.
8. Service Communication Fixes
Payment Service: Fixed internal HTTP calls to admin-service to use the new /api/public standardized endpoints.

Job Service: Corrected timesheet route conflicts to ensure reliable tracking. uting mismatch

 Fix 401 Unauthorized on contract-service due to Keycloak misconfiguration
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
 Story G-001: Home page with banner, stats, and trending jobs (Implemented)
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
 Fix 502/404/401/400 errors blocking contract creation
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
 Fix 502 error caused by admin-service compilation failure
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
 Case A-053.1: Automated content filtering (In Progress)
 Story A-054: Automated filters
 Story A-055: User trust scores
V. ADVANCED ECOSYSTEM & POLISH (FUTURE ROADMAP)
1. AI & Intelligence
 Story E-001: AI Scoping Assistant (Auto-milestone generation for clients) (Completed)
 Story E-002: Smart Matchmaking v2 (Behavioral & communication style matching) (Completed)
 Schema & Elasticsearch Integration
 Basic Search Matching Logic
 UI Match Score Badges
 Implement Behavioral Data Pipeline
 Track response times in Chat Service
 Trigger AI style analysis after 10 messages
 Link milestone performance to Reliability Score
 Story E-003: Predictive Revenue Dashboard for Freelancers
 Backend: Predictive revenue endpoint in payment-service
 Backend: Integrate milestone data from contract-service
 Frontend: New Revenue Dashboard page with charts
 Frontend: Revenue prediction visualizations
 Story E-004: Automated Fraud & Spam Detection (Real-time message analysis) (Completed)
 Backend: AI Fraud Detection endpoint in job-service
 Backend: Real-time analysis hook in chat-service
 Backend: Flagged message tracking in chat-service schema
 Frontend: Warning UI for flagged messages
2. Collaboration & Enterprises
 Story E-005: Agency Mode (Groups of freelancers sharing a profile/contracts) (Completed)
 Backend: Teams module in user-service (CRUD + Membership)
 Backend: agencyId support in contract-service
 Frontend: Agency management UI (Create, Invite, Dashboard)
 Frontend: Shared contract visibility for agency members
 Story E-006: Shared Workspace (Real-time collaborative document for requirements) (Completed)
 Backend: Workspace model in contract-service
 Backend: WebSocket gateway for real-time sync
 Frontend: Collaborative editor component
 Frontend: Real-time cursor tracking and presence
 Story E-007: GitHub/Behance/Dribbble Live Integration for Portfolios (Completed)
 Backend: OAuth integration for GitHub/Behance/Dribbble
 Backend: Portfolio sync service with API clients
 Backend: Scheduled sync jobs for automatic updates
 Frontend: Connect/disconnect platform buttons
 Frontend: Live portfolio display with platform badges
 Story E-008: Team/Sub-user management for Client Companies (Completed)
 Backend: Update Teams module for Client support
 Backend: Shared Job/Contract access via teamId
 Frontend: Company Team management UI
3. Financial & System Extensions
 Story E-009: Multi-currency support (Standardized conversion & Crypto wallets) (Completed)
 Backend: Currency conversion service
 Backend: Crypto wallet address support
 Frontend: Global currency selector & display
 Frontend: Crypto wallet management UI
 Story E-010: Escrow Auto-Release Rules (Advanced logic & dispute timers) (Completed)
 Backend: Scheduler for auto-release & dispute timeouts
 Backend: Logic for funds transfer on auto-release
 Frontend: Auto-release countdown display
 Frontend: Dispute timer UI
 Story E-011: Marketplace API Developer Portal (3rd party app integrations) (Completed)
 Backend: Initialize developer-service and Prisma schema
 Backend: Keycloak Client management logic
 Backend: Webhook dispatcher logic
 Frontend: Developer Portal UI (/developer)
 Infrastructure: Docker & Kong configuration
Story E-012: Mobile App (React Native / Flutter) synchronization (In Progress)
 Research: Evaluate sync strategies (Delta vs Full, Offline-first)
 Backend: Implementation of Sync API (Versioned updates)
 Backend: Logic for conflict resolution
 Backend: Verified Sync & Conflict Resolution (Debugging 500/404 errors)
 Frontend: Sync Logic Reference Implementation
 Create SyncManager and LocalStore
 Implement Delta Pull (GET /sync) handling
 Implement Versioned Push (PATCH) with 409 handling
 Verify Sync Flow
 Documentation: Sync protocol for mobile developers
4. Communication & Performance
Story E-013: Web Push Notifications & Slack/Discord Integration
 Infrastructure: Install web-push and configure VAPID keys
 Web Push: Implement Subscription Schema & API
 Web Push: Integrate PushService into notification flow
 External Chat: Implement Integration Schema (Slack/Discord Webhooks)
 External Chat: Create IntegrationService for webhook dispatch
 Verification: Test Push & Webhook delivery
 Story E-014: Global Search Performance (Redis/Elasticsearch deep optimization)
 Dependency: Install ioredis in search-service
 Caching: Implement Redis caching for search & recommendations
 Optimization: optimize Elasticsearch queries (source filtering)
 Verification: Verify cache hit/miss performance
 Story E-015: Cross-service Event Sourcing for Financial Integrity (Audit Trail)
 Infrastructure: Initialize audit-service and add to Docker
 Core Logic: Implement 
AuditLog
 schema and API
 Instrumentation: Integrity logging in payment-service
 Instrumentation: Integrity logging in contract-service
 Verification: Audit trail validation (checksums, flow)
VI. TRUST, SAFETY & COMPLIANCE (PROFESSIONAL GRADE)
 Story T-001: Double-Blind Feedback System (Reviews hidden until both parties submit or 14 days pass)
 Story T-002: Advanced Identity Verification (Live Video KYC vs Document OCR)
 Story T-003: Verified Skill Certifications (Integration with Credly/LinkedIn/HackerRank)
 Schema: Add Certification model to Prisma
 Core Logic: Add/Verify certification methods in UsersService
 Trust Integration: Update Trust Score based on verification
 API: Expose certification endpoints in UsersController
 Verification: Simulation of 3rd party badge verification
 Story T-004: Background Check Integration (Safe-to-Work certification via 3rd party API)
 Schema: Add background check fields to User model
 Core Logic: Implement initiate/verify methods in UsersService
 Trust Integration: Update Trust Score (+25) and award SAFE_TO_WORK badge
 API: Expose background check endpoints in UsersController
 Verification: Simulation script for background check flow
 Story T-005: Digital Tax Compliance (W-8BEN/W-9 collection, encryption, and e-signatures)
 Schema: Add tax form and signature fields to User model
 Core Logic: Implement submitTaxForm in UsersService
 Trust Integration: Update Trust Score (+15) and award TAX_VERIFIED badge
 API: Expose tax submission endpoint in UsersController
 Verification: Simulation script for digital tax compliance flow
 Story T-006: Professional Liability Insurance Marketplace (Offer insurance during contract signing)
 Schema (Contract): Add InsurancePolicy model and link to Contract
 Core Logic (Contract): Implement insurance options and purchase logic
 Core Logic (User): Update Trust Score (+10) and award INSURED_PRO badge
 API: Expose insurance endpoints in ContractsController
 Verification: Simulation script for insurance purchase and trust boost
VII. ENTERPRISE & CORPORATE SOLUTIONS
 Story C-075: Talent Clouds (Private pools of vetted freelancers for Enterprise clients)
 Define Prisma schema for TalentCloud and TalentCloudMember
 Implement TalentCloud service with create, addMember, removeMember, listForUser
 Implement TalentCloud controller endpoints
 Add user-service integration for cloud membership updates
 Write unit/integration tests for service and controller
 Verification: manual API testing and badge/trust score validation
 Story C-076: Multi-stage Approval Workflows (Manager-level sign-off for hires/payments)
 Story C-077: Departmental Budgeting & Expense Allocation (Track spend by cost-center)
 Story C-078: Enterprise SSO Integration (SAML/OIDC for corporate security)
 Story C-079: Custom Contract Clause Library (Standardized NDAs, IP Assignment, etc.)
VIII. ADVANCED FINANCIAL ECOSYSTEM
 Story F-076: Instant Pay (Real-time withdrawal to debit card via Visa Direct/Mastercard Send)
 Story F-077: Platform Subscription Tiers (Freelancer Plus, Client Enterprise)
 Story F-078: Escrow for Complex Fixed-Price Milestones (Multi-currency escrow hold)
 Story F-079: Employer of Record (EOR) Service (Handle payroll, tax, and benefits for long-term hires)
 Story F-080: Dispute Arbitration Panel (Formal mediation workflow with external investigators)
IX. AI-FIRST PRODUCTIVITY (NEXT-GEN)
 Story A-056: AI Auto-Screener (Pre-screen candidates based on job description & profile analysis)
 Story A-057: AI Real-time Portfolio Generator (Smart extraction of work from completed contracts)
 Story A-058: AI Contract Risk Analyzer (Flag unusual or risky clauses in custom contracts)
 Story A-059: AI Smart Hourly Tracking (Detect idle time vs active coding time locally)
X. GLOBAL OPERATIONS & LOCALIZATION
 Story L-001: Regional Payment Gateways (Momo, PromptPay, Pix, M-Pesa integration)
 Story L-002: Dynamic Legal Logic (Auto-adjust contract terms based on jurisdiction)
 Story L-003: Timezone-Aware Meeting Scheduler (Auto-sync with Google/Outlook calendars)
Testing Accounts
Role	Email	Password
Freelancer	freelancer@example.com	Password123!
Client	client@example.com	Password123!
Admin	admin@example.com	Password123!
