# 📱 Mobile First & Sync Protocol Plan

A professional freelancer is always on the go. This plan details how to build a world-class mobile experience that works offline.

## 1. The Mobile UX Strategy
More than just a "responsive web view".
### 🎯 Features
- **Native-Like Gestures:** Swipe-to-archive in chat, pull-to-refresh on job feeds.
- **Quick Actions:** Biometric login (FaceID/Fingerprint) and Instant Notifications for new messages.
- **Low-Bandwidth Mode:** Optimize image loading for users on 3G/4G connections.
### 🛠️ Sub-tasks
- [ ] **Frontend (PWA/Mobile):**
    - Implement a `ServiceWorker` for aggressive caching.
    - Set up `WebPush` for mobile notifications.

## 2. The Advanced Sync Protocol
Ensuring data consistency between Web and Mobile when offline.
### 🎯 Features
- **Delta-Syncing:** Only transfer the *changes* since the last sync, not the whole database.
- **Conflict Resolution (CRDTs):** If a user edits a job on mobile while offline and then on web, merge the changes intelligently.
- **Optimistic UI:** Update the mobile screen instantly, then sync to the backend in the background.
### 🛠️ Sub-tasks
- [ ] **Backend (Common):**
    - Implement `change_sequence` (versioning) on all core models (User, Message, Job).
- [ ] **Frontend:**
    - Use `React Query` or `SWR` with persistence for local caching.

## 3. Real-time Collaboration (Mobile)
- **Mobile Chat Enhancements:** Voice messages, real-time location sharing (if relevant), and camera integration for immediate work uploads.
- **Desktop/Mobile Handoff:** Start a call on desktop and "hand it off" to mobile with one click.

---
> [!TIP]
> Prioritize "Chat" and "Job Search" for the initial mobile focus, as these are the most mobile-vital activities.
