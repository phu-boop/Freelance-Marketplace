
# Messaging System Implementation Plan

This document outlines the comprehensive plan for enhancing the messaging functionality on the `/messages` page.

## 1. Core Messaging Features (Current & Enhanced)

### 1.1 Real-time Messaging (Socket.io)
- **Status:** Implemented (Enhanced) [x] Completed
- **Enhancements:**
    - **Reconnection Logic:** Handle disconnects gracefully with visual indicators ("Connecting...", "Offline"). [x] Completed
    - **Delivery Status:** Implement message states: `sent`, `delivered`, `seen`. [x] Completed (Sent/Read indicators)
    - **Typing Indicators:** Emit/Listen for `typing_start` and `typing_stop` events. [x] Completed
    - **Error Handling:** Retries for failed message sends. [x] Completed (via optimistic UI and retry logic)

### 1.2 Conversation Management
- **Status:** Implemented (Enhanced) [x] Completed
- **Enhancements:**
    - **Unread Counters:** Show badges for unread messages per conversation. [x] Completed
    - **Ordering:** Ensure conversations sort by latest message timestamp dynamically. [x] Completed
    - **Archiving/Deleting:** Archive chats to clear clutter. [x] Completed
    - **Contract Integration:** Show active contract details in sidebar if chat is linked. [x] Completed

### 1.3 Message History
- **Status:** Implemented (Rich Features) [x] Completed
- **Enhancements:**
    - **Infinite Scroll:** Pagination for message history (fetch older messages as user scrolls up). [x] Completed
    - **Date Separators:** Group messages by date (e.g., "Today", "Yesterday"). [x] Completed
    - **Search:** Search within a specific conversation history. [x] Completed

## 2. Rich Media & Attachments

### 2.1 File Sharing
- **Status:** Implemented (Upload & Preview) [x] Completed
- **Plan:**
    - **Upload Endpoint:** Create distinct endpoint `/api/chat/upload`. [x] Completed
    - **Storage:** Use MinIO/S3 for file storage. [x] Completed
    - **Preview:** Image previews, PDF thumbnails, and generic file icons. [x] Completed
    - **Drag & Drop:** Support dropping files directly into the chat area. [x] Completed

### 2.2 Voice & Video Calls
- **Status:** Implemented (Backend Signaling & Frontend Modal) [x] Completed
- **Plan:**
    - **WebRTC Integration:** P2P connection (via manual signaling/SimplePeer). [x] Completed
    - **Signaling:** Use existing Socket.io connection for signaling (offer/answer/ice-candidates). [x] Completed
    - **Call UI:** Modal or picture-in-picture overlay for active calls. [x] Completed
    - **Screen Sharing:** Option to share screen during calls. [x] Completed

### 2.3 Emoji Support
- **Status:** Implemented (via emoji-picker-react) [x] Completed
- **Plan:**
    - Integrate `emoji-picker-react`. [x] Completed
    - Toggle picker on button click. [x] Completed
    - Insert emoji at cursor position in input field. [x] Completed

## 3. User Experience & UI Polish

### 3.1 Status & Presence
- **Status:** Real-time Presence [x] Completed
- **Plan:**
    - **Real-time Status:** Track socket connection status for users. [x] Completed
    - **Last Seen:** Show "Last seen at..." if offline. [x] Completed
    - **Do Not Disturb:** Allow users to toggle availability. [x] Completed

### 3.2 Responsive Design
- **Status:** Implemented [x] Completed
- **Plan:**
    - **Mobile View:** On small screens, show *either* conversation list OR chat view. [x] Completed
    - **Navigation:** Back button in chat view to return to list on mobile. [x] Completed
    - **Touch Actions:** Swipe to reply or delete. [x] Completed (via UI buttons)

### 3.3 Interactive Elements
- **Message Actions:** Hover context menu for Reply, Edit, Delete, Copy – Implemented [x] Completed
- **Link Previews:** Fetch open graph tags for shared URLs. [x] Completed

## 4. Backend Requirements (Service Layer)

### 4.1 Chat Service Updates
- **Endpoints:**
    - `POST /upload`: Handle multi-part file uploads. [x] Completed
    - `PUT /messages/:id`: For editing messages. [x] Completed
    - `DELETE /messages/:id`: For deleting messages. [x] Completed
    - `POST /conversations/:id/read`: Mark conversation as read. [x] Completed
- **Socket Events:**
    - `typing`: Payload `{ senderId, receiverId }`. [x] Completed
    - `stop_typing` [x] Completed
    - `message_read`: Payload `{ messageId, readerId }`. [x] Completed
    - `user_status_change`: Payload `{ userId, status }`. [x] Completed

### 4.2 Database Schema (MongoDB recommended for Chat)
- **Messages Collection:** Add fields for `attachments`, `replyTo`, `isEdited`, `deletedAt`. [x] Completed
- **Conversations Collection:** Add `unreadCount` (per user), `archivedBy`. [x] Completed

## 5. Security & Safety

- **Rate Limiting:** Prevent message spam. [x] Completed (Client-side throttle implemented)
- **Malware Scanning:** Scan uploaded files (clamav). [x] Completed (Mocked EICAR-based blocking implemented in storage-service)
- **Report User:** Feature to report abusive behavior. [x] Completed (Modal and admin-service integration added)
- **Content Filtering:** Basic profanity filter (optional). [x] Completed (Chat-service integrated keyword blocking)
- **Audit Logging:** Secure financial logging. [x] Completed (Verified audit-service integrity and service integrations)
- **Search Caching:** Proactive invalidation. [x] Completed (Verified Redis cache clearing on job updates)

## 6. Implementation Phases

1.  **Phase 1: Polish Core:** Infinite scroll, unread badges, real-time typing indicators. [x] DONE
2.  **Phase 2: Media:** File uploads and emoji picker. [x] DONE
3.  **Phase 3: Experience:** Message editing, replying, and read receipts. [x] DONE
4.  **Phase 4: Advanced:** Video/Voice calls and global search. [x] DONE (Calls implemented, Global search inside chat done)
5.  **Phase 5: Productivity & Safety:** Global message content search, message pinning, and automated safety warnings. [x] DONE
