# 🚀 Freelance Marketplace - Pending Features Checklist

This document tracks the missing features and technical improvements needed to make the platform production-ready and "premium".

## 🔐 1. Authentication & Security Improvements
- [ ] **Custom Email Verification UI**
    - Redirect users from Keycloak's email link back to a premium Next.js page (`/auth/verify-email`).
    - Show success/error animations.
- [ ] **Two-Factor Authentication (2FA) Management**
    - Create a Security Settings page in the Frontend.
    - Allow users to enable/disable OTP (Google Authenticator) via Keycloak's APIs.
- [ ] **Account Deletion / Deactivation**
    - Logic to handle user data deletion across multiple microservices.

## 👤 2. User Profile & Onboarding
- [ ] **Detailed Multi-step Onboarding**
    - Tailored questions based on Role (Freelancer vs. Client).
    - Collect: Bio, Skills, Portfolio, and Experience.
- [ ] **Premium Profile Dashboard**
    - Visual representation of user stats (Jobs completed, earnings, rating).
    - Public vs. Private view of the profile.
- [ ] **Storage Service Integration (MinIO)**
    - Implement file upload component for Profile Pictures.
    - Handle secure file hosting for Portfolio assets.

## 🛡️ 3. Access Control & RBAC
- [ ] **Middleware Route Protection**
    - Ensure `CLIENT` role cannot access `FREELANCER` dashboards.
    - Implement a centralized `AuthGuard` using Keycloak roles.
- [ ] **Admin Dashboard**
    - User Management: Ban/Unban, manual role override.
    - Activity logs/Audit trail viewing.

## 📡 4. Data Synchronization & Events
- [ ] **Keycloak Webhook / Event Listener**
    - Automatically sync profile updates (Name, Email change) from Keycloak to the `user-service` database.
- [ ] **Real-time Status**
    - Implement "Online/Offline" status using Redis and Socket.io.

## 🎨 5. Keycloak Theme Enhancements (UX)
- [ ] **Custom Error Pages**
    - Style the default Keycloak error screens to match the platform's Dark Mode.
- [ ] **Custom Logout Screen**
    - A premium "You have been logged out" screen instead of a blank redirect.
- [ ] **Terms & Conditions / Privacy Policy Steps**
    - Integration of "Terms of Service" acceptance during the first login.

---
> [!TIP]
> **Suggested Next Priority:** Start with **Detailed Onboarding** to ensure every user has a complete profile for matching.
