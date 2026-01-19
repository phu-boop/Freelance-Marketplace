# ⏲️ Advanced Work Diary & Evidence of Work Plan

Moving beyond simple decimal hours to a verifiable "Work Diary" that builds deep trust between Clients and Freelancers.

## 1. The Time Tracker Engine (Client-side)
A native or web-based tracker that provides verifiable proof of work.
### 🎯 Features
- **Snapshot Capture:** Take a screenshot of the freelancer's main monitor every 10 minutes (randomized within the segment).
- **Activity Tracking:** Log mouse clicks and keystrokes count (not the actual keys, for privacy) to calculate an "Activity Score" (0-100).
- **Memo Injection:** Force the freelancer to describe what they are doing in the current 10-minute block.
### 🛠️ Sub-tasks
- [ ] **Data Model (Contract Service):**
    - Create `WorkDiarySegment` (10-min block).
    - Fields: `screenshotUrl`, `activityScore`, `memo`, `keystrokes`, `clicks`.
- [ ] **Infrastructure:**
    - Integration with `storage-service` for high-frequency image uploads.

## 2. The Verification Workflow
How clients review and dispute hours.
### 🎯 Features
- **Weekly Review Period:** Clients have from Monday to Friday of the following week to review the "Work Diary".
- **Segment-Level Disputes:** Clients can "Delete" a specific 10-minute block if they see the freelancer was on social media or inactive.
- **Auto-Approval:** If the client doesn't review by the deadline, hours are automatically approved and sent to `payment-service`.
### 🛠️ Sub-tasks
- [ ] **Frontend:**
    - A "Calendar View" or "Timeline View" of screenshots for the client.
    - Bulk "Approve/Dispute" actions.

## 3. Privacy & Compliance
Protecting the freelancer while maintaining transparency.
### 🎯 Features
- **Self-Deletion:** Freelancers can delete any segment themselves (but they lose the pay for it) to hide sensitive information.
- **Blurring AI:** (Optional) Automatically blur potential passwords or sensitive UI elements in screenshots.
- **Manual Time:** Allow clients to toggle "Manual Time" on/off for a contract.

---
> [!IMPORTANT]
> Verifiable proof of work is the #1 requirement for high-budget hourly contracts on platforms like Upwork.
