# 🏗️ Infrastructure & Horizontal Scaling Plan

As the marketplace grows to thousands of concurrent users, the underlying architecture must move from "Monolithic Microservices" to a truly distributed, resilient system.

## 1. Event-Driven Architecture (EDA)
Moving away from synchronous HTTP calls between services.
### 🎯 Features
- **Message Broker (RabbitMQ/Kafka):** Decouple services. When a `Payment` is made, the `Notification` and `Analytics` services react to the event asynchronously.
- **Idempotency:** Ensure that a message processed twice does not result in double payments or duplicate records.
- **Saga Pattern:** Manage complex distributed transactions (e.g., funding escrow requires success in both Payment and Contract services).
### 🛠️ Sub-tasks
- [ ] **Infrastructure:**
    - Deploy RabbitMQ cluster.
    - Implement a central `EventBus` library in the `common-service`.

## 2. Global Caching & Edge Computing
Minimize latency for a global user base.
### 🎯 Features
- **Multi-layer Redis Caching:**
    - Layer 1: Local node cache (memory).
    - Layer 2: Distributed Redis cache for shared state (sessions, permissions).
- **CDN Strategy:** Serve all profile avatars and portfolio assets from the edge.
- **Read-Replicas:** Use PostgreSQL read-replicas for heavy `GET` operations (Search/Browse).
### 🛠️ Sub-tasks
- [ ] **Backend (Shared):**
    - Implement a `CacheInterceptor` that automatically caches GET requests.

## 3. High-Availability & Disaster Recovery
Zero downtime is the goal.
### 🎯 Features
- **Kubernetes (k8s) Scaling:** Auto-scale service pods based on CPU/RAM and custom metrics (queue depth).
- **Health Checks & Circuit Breakers:** Stop traffic to failing services before they crash the whole system.
- **Database Partitioning:** As the `AuditLog` or `Transaction` tables grow to millions of rows, use partitioning by date.

---
> [!CAUTION]
> EDA introduces complexity. Monitoring (OpenTelemetry) becomes non-negotiable to track "where a request went" across 19+ services.
