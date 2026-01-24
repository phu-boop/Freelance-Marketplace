
- [x] **Account Deletion / Deactivation**
    - [x] Logic to handle user data deletion across multiple microservices.

## 👤 2. User Profile & Onboarding()
- [x] **Detailed Multi-step Onboarding**
    - Tailored questions based on Role (Freelancer vs. Client).
    - Collect: Bio, Skills, Portfolio, and Experience.




    
- [x] **Premium Profile Dashboard**
    - Visual representation of user stats (Jobs completed, earnings, rating).
    - Public vs. Private view of the profile.
- [x] **Storage Service Integration (MinIO)**
    - Implement file upload component for Profile Pictures.
    - Handle secure file hosting for Portfolio assets.

## 🛡️ 3. Access Control & RBAC
- [x] **Middleware Route Protection**
    - [x] Ensure `CLIENT` role cannot access `FREELANCER` dashboards.
    - [x] Implement a centralized `AuthGuard` using Keycloak roles.
- [x] **Admin Dashboard**(chưa xong còn lỗi)
    - [x] User Management: Ban/Unban, manual role override.
    - [x] Activity logs/Audit trail viewing.

## 📡 4. Data Synchronization & Events
- [x] **Keycloak Webhook / Event Listener**
    - [x] Automatically sync profile updates (Name, Email change) from Keycloak to the `user-service` database.
- [x] **Real-time Status**
    - [x] Implement "Online/Offline" status using Redis and Socket.io.

## 🎨 5. Keycloak Theme Enhancements (UX)
- [x] **Custom Error Pages**
    - [x] Style the default Keycloak error screens to match the platform's Dark Mode.
- [x] **Custom Logout Screen**
    - [x] A premium "You have been logged out" screen instead of a blank redirect.
- [x] **Terms & Conditions / Privacy Policy Steps**
    - [x] Integration of "Terms of Service" acceptance during the first login.

---
> [!TIP]
> **Suggested Next Priority:** Start with **Detailed Onboarding** to ensure every user has a complete profile for matching.
