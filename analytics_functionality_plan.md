---
description: Analytics Service Enhancement Plan
---

# Analytics Service Enhancement Plan

This plan outlines the steps to upgrade the `analytics-service` to provide comprehensive financial and user engagement metrics for the Freelance Marketplace.

## 1. Objectives

- **Financial Analytics:** Provide Freelancers with "Earnings" dashboards and Clients with "Spend" reports.
- **Engagement Metrics:** Track profile views, job views, and proposal conversion rates.
- **Performance Tracking:** Calculate "Job Success Score" (JSS) based on feedback and contract outcomes.

## 2. Architecture

The service uses **ClickHouse** for high-performance OLAP (Online Analytical Processing) queries.

### 2.1 Data Ingestion Patterns
- **Direct HTTP:** Services (`payment-service`, `job-service`) call `POST /api/analytics/events` to log significant actions.
- **Async Pattern (Future):** Ideally, we would use RabbitMQ/Kafka, but for now, we will use robust HTTP calls with retry logic or "fire-and-forget" for non-critical metrics.

## 3. Database Schema (ClickHouse)

### 3.1 `financial_events` Table
Optimized for financial aggregations.
```sql
CREATE TABLE financial_events (
    event_id UUID,
    user_id String,          -- Who is this regarding (e.g., Freelancer receiving money)
    counterparty_id String,  -- Who is the other party (e.g., Client paying)
    amount Float64,          -- Value in USD
    currency String,         -- Original currency
    category String,         -- 'Earnings', 'Refund', 'Escrow', 'Fee'
    job_id String,
    transaction_id String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, category, user_id)
```

### 3.2 `user_stats` Table (Derived/Aggregated)
Can use ClickHouse `MaterializedView` or on-the-fly aggregation for:
- Total Earnings per Month
- Average Project Size

## 4. Implementation Steps

### Phase 1: Financial Analytics (Priority) [COMPLETED]
1.  **Schema Update:** Add `financial_events` table in `main.py`. [x]
2.  **Ingestion Endpoint:** Add `POST /api/analytics/financials` (or use generic events with specific types). [x]
3.  **Aggregation Endpoints:** 
    - `GET /api/analytics/freelancer/earnings?userId=...&range=...` [x]
    - `GET /api/analytics/client/spend?userId=...` [x]
4.  **Integration:** Update `payment-service` to call this endpoint on transaction completion. [x]

### Phase 2: Job Success & Engagement
1.  **Job Views:** Already partially implemented. Ensure `job-service` calls it on every `GET /jobs/:id`. [x]
2.  **Proposal Tracking:** Log `proposal_sent`, `proposal_viewed`, `proposal_accepted`. [x] (Implemented in proposal-service)
3.  **JSS Calculation:** Implement a complex query involving: [x]
    - `feedback_score` (from `review-service` events)
    - `contract_value`
    - `long_term_clients`
    - Returns a score 0-100%.

## 5. API Definition

### Freelancer Endpoints
- `GET /analytics/freelancer/overview`: Returns { totalEarnings, jobsCompleted, jss, activeProposals }
- `GET /analytics/freelancer/earnings-chart`: Returns daily/monthly earnings for charting.

### Client Endpoints
- `GET /analytics/client/spend-analysis`: Spend breakdown by Category or Job Type.

## 6. Frontend Integration [COMPLETED]
- Create `AnalyticsDashboard` component. [x]
- Visualize data using `recharts` or `chart.js`. [x]

