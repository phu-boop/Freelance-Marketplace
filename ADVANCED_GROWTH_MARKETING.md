# 📈 Growth, SEO & Marketing Plan

Building the best platform is useless if nobody sees it. This plan outlines features designed to acquire and retain users at scale.

## 1. SEO & Public Catalog (The Hook)
Attract "organic" traffic from Google.
### 🎯 Features
- **Programmatic Landing Pages:** Dynamic pages for "Top React Developers in [City]" or "Logo Design Jobs".
- **Public Profile SSR:** Ensure freelancer profiles are server-side rendered with perfect OpenGraph/schema.org metadata.
- **Blog & Resources (Content Marketing):** A CMS-driven blog integrated into the main app to rank for high-intent keywords.
### 🛠️ Sub-tasks
- [ ] **Frontend:**
    - Optimize Next.js for SSR (Metadata API).
    - Implement a sitemap generator that updates daily.

## 2. Referral & Viral Loops (The Engine)
Use existing users to find new ones.
### 🎯 Features
- **Dual-Sided Rewards:** Give "Connects" to the referrer and the referred user.
- **Client Affiliate Program:** Reward clients who bring their existing team onto the platform.
- **Shareable Milestone Badges:** "I just completed my 100th job!" images for LinkedIn/Twitter.
### 🛠️ Sub-tasks
- [ ] **Backend (User Service):**
    - Implement the `Referral` logic (already in schema, needs service logic).

## 3. Retention & CRM Automation
Keep users coming back.
### 🎯 Features
- **Smart Re-engagement Emails:** "You have 5 new jobs matching your skills" (automated via `search-service` + `email-service`).
- **Push Notification Campaigns:** Personalized alerts for saved freelancers or job status changes.
- **NPS & Feedback Loops:** Automatically ask for feedback after a contract ends to improve platform features.

---
> [!IMPORTANT]
> SEO requires `allow-indexing` logic in `robots.txt`, but we must correctly use `noindex` for private dashboard pages.
