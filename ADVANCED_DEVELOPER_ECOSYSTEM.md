# 🔌 Developer Ecosystem 2.0 (API & Webhooks)

Turning the "Freelance Marketplace" into a "Development Platform".

## 1. Public API & Personal Access Tokens
Enable users to build their own tools.
### 🎯 Features
- **OAuth 2.0 Scopes:** `jobs:read`, `messages:send`, `contracts:manage`.
- **API Key Management:** Allow developers to generate and revoke keys.
- **Rate Limiting & Tiers:** Free tier vs Paid Developer tier (Higher limits).
### 🛠️ Sub-tasks
- [ ] **Backend (Developer Service):**
    - Integration with `Kong` for dynamic API key validation and rate limiting.

## 2. Webhooks Engine (The Push Strategy)
Don't poll us, we'll call you.
### 🎯 Features
- **Event Catalog:** `proposal.created`, `contract.funded`, `message.received`, `milestone.completed`.
- **Retry Logic:** Exponential backoff if the developer's server is down.
- **Webhook Security:** Signing payloads with a secret to ensure they come from our platform.
### 🛠️ Sub-tasks
- [ ] **Backend (Developer Service):**
    - Build a `WebhookDispatcher` that listens to the internal `EventBus`.

## 3. The 3rd Party App Marketplace
Allow integrations like Slack, Trello, Jira, and GitHub.
### 🎯 Features
- **Slack Integration:** "New proposal received" notification in a Slack channel.
- **Jira/Trello Sync:** Map milestones to tickets.
- **GitHub Auth Integration:** Automatically grant/revoke access to repos on contract start/end.
### 🛠️ Sub-tasks
- [ ] **Frontend:**
    - An "Integrations" library where users can connect their external accounts.

---
> [!TIP]
> A strong API ecosystem attracts agencies who want to build their own CRM on top of your data.
