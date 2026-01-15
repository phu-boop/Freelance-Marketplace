
# Messaging System Implementation Plan

This document outlines the comprehensive plan for enhancing the messaging functionality on the `/messages` page.

## 1. Core Messaging Features (Current & Enhanced)

### 1.1 Real-time Messaging (Socket.io)
- **Status:** Implemented (Basic)
- **Enhancements:**
    - **Reconnection Logic:** Handle disconnects gracefully with visual indicators ("Connecting...", "Offline").
    - **Delivery Status:** Implement message states: `sent`, `delivered`, `seen`.
    - **Typing Indicators:** Emit/Listen for `typing_start` and `typing_stop` events. [x] Completed
    - **Error Handling:** Retries for failed message sends.

### 1.2 Conversation Management
- **Status:** Implemented (Basic)
- **Enhancements:**
    - **Unread Counters:** Show badges for unread messages per conversation. [x] Completed
    - **Ordering:** Ensure conversations sort by latest message timestamp dynamically.
    - **Archiving/Deleting:** Allow users to archive or delete entire conversations.
    - **Contract Integration:** Show active contract details (if any) in the sidebar for context.

### 1.3 Message History
- **Status:** Implemented (Basic)
- **Enhancements:**
    - **Infinite Scroll:** Pagination for message history (fetch older messages as user scrolls up). [x] Completed
    - **Date Separators:** Group messages by date (e.g., "Today", "Yesterday").
    - **Search:** Search within a specific conversation history.

## 2. Rich Media & Attachments

### 2.1 File Sharing
- **Status:** Implemented (Upload & Preview) [x] Completed
- **Plan:**
    - **Upload Endpoint:** Create distinct endpoint `/api/chat/upload`.
    - **Storage:** Use MinIO/S3 for file storage.
    - **Preview:** Image previews, PDF thumbnails, and generic file icons.
    - **Drag & Drop:** Support dropping files directly into the chat area.

### 2.2 Voice & Video Calls
- **Status:** UI Only (Phone/Video Icons)
- **Plan:**
    - **WebRTC Integration:** Use `simple-peer` or a similar library for P2P connection.
    - **Signaling:** Use existing Socket.io connection for signaling (offer/answer/ice-candidates).
    - **Call UI:** Modal or picture-in-picture overlay for active calls.
    - **Screen Sharing:** Option to share screen during calls.

### 2.3 Emoji Support
- **Status:** Implemented (via emoji-picker-react) [x] Completed
- **Plan:**
    - Integrate `emoji-picker-react`.
    - Toggle picker on button click.
    - Insert emoji at cursor position in input field.

## 3. User Experience & UI Polish

### 3.1 Status & Presence
- **Status:** Static "Online" Indicator
- **Plan:**
    - **Real-time Status:** Track socket connection status for users.
    - **Last Seen:** Show "Last seen at..." if offline.
    - **Do Not Disturb:** Allow users to toggle availability.

### 3.2 Responsive Design
- **Status:** Basic Flex Layout
- **Plan:**
    - **Mobile View:** On small screens, show *either* conversation list OR chat view.
    - **Navigation:** Back button in chat view to return to list on mobile.
    - **Touch Actions:** Swipe to reply or delete.

### 3.3 Interactive Elements
- **Message Actions:** Hover context menu for Reply, Edit, Delete, Copy – Implemented [x] Completed
- **Link Previews:** Fetch open graph tags for shared URLs.

## 4. Backend Requirements (Service Layer)

### 4.1 Chat Service Updates
- **Endpoints:**
    - `POST /upload`: Handle multi-part file uploads.
    - `PUT /messages/:id`: For editing messages.
    - `DELETE /messages/:id`: For deleting messages.
    - `POST /conversations/:id/read`: Mark conversation as read.
- **Socket Events:**
    - `typing`: Payload `{ senderId, receiverId }`.
    - `stop_typing`
    - `message_read`: Payload `{ messageId, readerId }`.
    - `user_status_change`: Payload `{ userId, status }`.

### 4.2 Database Schema (MongoDB recommended for Chat)
- **Messages Collection:** Add fields for `attachments`, `replyTo`, `isEdited`, `deletedAt`.
- **Conversations Collection:** Add `unreadCount` (per user), `archivedBy`.

## 5. Security & Safety

- **Rate Limiting:** Prevent message spam.
- **Malware Scanning:** Scan uploaded files (clamav).
- **Report User:** Feature to report abusive behavior.
- **Content Filtering:** Basic profanity filter (optional).

## 6. Implementation Phases

1.  **Phase 1: Polish Core:** Infinite scroll, unread badges, real-time typing indicators.
2.  **Phase 2: Media:** File uploads and emoji picker.
3.  **Phase 3: Experience:** Message editing, replying, and read receipts.
4.  **Phase 4: Advanced:** Video/Voice calls and global search.
