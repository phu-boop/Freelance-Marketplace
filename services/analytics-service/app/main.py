import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import clickhouse_connect
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Analytics Service")

# Security
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    try:
        client.command("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# ClickHouse Client
client = clickhouse_connect.get_client(
    host=os.getenv("CLICKHOUSE_HOST", "clickhouse"),
    port=int(os.getenv("CLICKHOUSE_PORT", 8123)),
    username=os.getenv("CLICKHOUSE_USER", "admin"),
    password=os.getenv("CLICKHOUSE_PASSWORD", "password"),
    database=os.getenv("CLICKHOUSE_DB", "freelance_analytics")
)

# Initialize Database
client.command("""
CREATE TABLE IF NOT EXISTS events (
    event_id UUID,
    event_type String,
    user_id String,
    job_id String DEFAULT '',
    metadata String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, event_type, job_id)
""")

client.command("""
CREATE TABLE IF NOT EXISTS system_metrics (
    service String,
    endpoint String,
    status_code UInt16,
    latency_ms Float64,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, service, endpoint)
""")

client.command("""
CREATE TABLE IF NOT EXISTS financial_events (
    event_id UUID,
    user_id String,
    counterparty_id String,
    amount Float64,
    currency String,
    category String,
    job_id String,
    transaction_id String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, category, user_id)
""")

class Metric(BaseModel):
    service: str
    endpoint: str
    status_code: int
    latency_ms: float

class FinancialEvent(BaseModel):
    user_id: str
    counterparty_id: str
    amount: float
    currency: str
    category: str
    job_id: str
    transaction_id: str

class Event(BaseModel):
    event_type: str
    user_id: str
    job_id: Optional[str] = ""
    metadata: Optional[str] = "{}"

@app.get("/api/analytics")
async def root():
    return {"message": "Analytics Service is running"}

@app.post("/api/analytics/events")
async def create_event(event: Event):
    import uuid
    from datetime import datetime
    
    event_id = uuid.uuid4()
    timestamp = datetime.utcnow()
    
    data = [[event_id, event.event_type, event.user_id, event.job_id, event.metadata, timestamp]]
    client.insert('events', data, column_names=['event_id', 'event_type', 'user_id', 'job_id', 'metadata', 'timestamp'])
    
    return {"status": "success", "event_id": str(event_id)}

@app.post("/api/analytics/financials")
async def create_financial_event(event: FinancialEvent):
    import uuid
    from datetime import datetime
    
    event_id = uuid.uuid4()
    timestamp = datetime.utcnow()
    
    data = [[
        event_id, 
        event.user_id, 
        event.counterparty_id, 
        event.amount, 
        event.currency, 
        event.category, 
        event.job_id, 
        event.transaction_id, 
        timestamp
    ]]
    
    client.insert('financial_events', data, column_names=[
        'event_id', 
        'user_id', 
        'counterparty_id', 
        'amount', 
        'currency', 
        'category', 
        'job_id', 
        'transaction_id', 
        'timestamp'
    ])
    
    return {"status": "success", "event_id": str(event_id)}

@app.get("/api/analytics/stats")
async def get_stats():
    result = client.query("SELECT event_type, count() as count FROM events GROUP BY event_type")
    return [{"event_type": row[0], "count": row[1]} for row in result.result_rows]

@app.get("/api/analytics/jobs/{job_id}")
async def get_job_stats(job_id: str):
    # Get views by day for the last 7 days
    views_query = f"""
    SELECT toDate(timestamp) as date, count() as count 
    FROM events 
    WHERE job_id = '{job_id}' AND event_type = 'job_view'
    GROUP BY date 
    ORDER BY date DESC 
    LIMIT 7
    """
    views_result = client.query(views_query)
    
    # Get total stats
    total_query = f"""
    SELECT event_type, count() as count 
    FROM events 
    WHERE job_id = '{job_id}'
    GROUP BY event_type
    """
    total_result = client.query(total_query)
    
    return {
        "job_id": job_id,
        "daily_views": [{"date": str(row[0]), "count": row[1]} for row in views_result.result_rows],
        "total_events": {row[0]: row[1] for row in total_result.result_rows}
    }

@app.get("/api/analytics/freelancer/earnings")
async def get_freelancer_earnings(user_id: str):
    # Get total earnings
    total_query = f"SELECT sum(amount) FROM financial_events WHERE user_id = '{user_id}' AND category = 'Earnings'"
    total_res = client.query(total_query)
    total_earnings = total_res.result_rows[0][0] or 0.0

    # Get monthly earnings
    monthly_query = f"""
    SELECT formatDateTime(toStartOfMonth(timestamp), '%Y-%m') as month, sum(amount) 
    FROM financial_events 
    WHERE user_id = '{user_id}' AND category = 'Earnings'
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12
    """
    monthly_res = client.query(monthly_query)

    return {
        "user_id": user_id,
        "total_earnings": total_earnings,
        "monthly_earnings": [{"month": row[0], "amount": row[1]} for row in monthly_res.result_rows]
    }

@app.get("/api/analytics/client/spend")
async def get_client_spend(user_id: str):
    # Get total spend
    total_query = f"SELECT sum(amount) FROM financial_events WHERE counterparty_id = '{user_id}' AND category = 'Earnings'"
    total_res = client.query(total_query)
    total_spend = total_res.result_rows[0][0] or 0.0
    
    # Get spend by category/job
    job_query = f"""
    SELECT job_id, sum(amount) as total 
    FROM financial_events 
    WHERE counterparty_id = '{user_id}'
    GROUP BY job_id
    ORDER BY total DESC
    LIMIT 10
    """
    job_res = client.query(job_query)

    return {
        "user_id": user_id,
        "total_spend": total_spend,
        "spend_by_job": [{"job_id": row[0], "amount": row[1]} for row in job_res.result_rows]
    }

@app.get("/api/analytics/retention")
async def get_retention():
    # Cohort Analysis:
    # 1. Identify "Cohort Month" (First month user was seen)
    # 2. Track activity in subsequent months
    
    query = """
    SELECT 
        formatDateTime(toStartOfMonth(first_seen), '%Y-%m') as cohort_month,
        dateDiff('month', toStartOfMonth(first_seen), toStartOfMonth(timestamp)) as month_number,
        uniq(user_id) as users,
        any(cohort_size) as cohort_total
    FROM events e
    JOIN (
        SELECT user_id, min(timestamp) as first_seen, uniq(user_id) as users -- uniq here is per user, need total count per cohort
        FROM events
        GROUP BY user_id
    ) first_events ON e.user_id = first_events.user_id
    JOIN (
       SELECT toStartOfMonth(min(timestamp)) as cohort_start, uniq(user_id) as cohort_size
       FROM events 
       GROUP BY cohort_start 
       -- Only considers users whose FIRST event was in this month
    ) cohort_sizes ON toStartOfMonth(first_events.first_seen) = cohort_sizes.cohort_start
    GROUP BY cohort_month, month_number
    ORDER BY cohort_month, month_number
    LIMIT 100
    """
    
    # ClickHouse SQL can be tricky for complex cohort logic in one go without window functions or subqueries.
    # Simplified approach:
    
    # 1. Get Cohort Sizes
    cohort_query = """
    SELECT 
        formatDateTime(toStartOfMonth(first_seen), '%Y-%m') as cohort,
        uniq(user_id) as size
    FROM (
        SELECT user_id, min(timestamp) as first_seen 
        FROM events 
        GROUP BY user_id
    )
    GROUP BY cohort
    ORDER BY cohort DESC
    LIMIT 12
    """
    cohorts_res = client.query(cohort_query)
    cohorts = {row[0]: row[1] for row in cohorts_res.result_rows}
    
    # 2. Get Activity by Cohort and Month Offset
    activity_query = """
    SELECT 
        formatDateTime(toStartOfMonth(first_seen), '%Y-%m') as cohort,
        dateDiff('month', toStartOfMonth(first_seen), toStartOfMonth(timestamp)) as month_offset,
        uniq(user_id) as active_users
    FROM events e
    JOIN (
        SELECT user_id, min(timestamp) as first_seen 
        FROM events 
        GROUP BY user_id
    ) first_events ON e.user_id = first_events.user_id
    GROUP BY cohort, month_offset
    HAVING month_offset >= 0
    ORDER BY cohort, month_offset
    """
    activity_res = client.query(activity_query)
    
    data = []
    
    # Structure the data
    for row in activity_res.result_rows:
        cohort = row[0]
        offset = row[1]
        active = row[2]
        total = cohorts.get(cohort, 0)
        
        if total > 0:
             data.append({
                 "cohort": cohort,
                 "month_offset": offset,
                 "active_users": active,
                 "cohort_size": total,
                 "retention_rate": round((active / total) * 100, 2)
             })
             
    return data

@app.get("/analytics/churn")
async def get_churn():
    # Simple Churn Rate calculation for last month vs this month
    # Churn = (Users Active Last Month AND NOT Active This Month) / Users Active Last Month
    
    # For simplicity in this demo, we calculate a monthly churn trend
    
    query = """
    SELECT 
        formatDateTime(toStartOfMonth(timestamp), '%Y-%m') as month,
        uniq(user_id) as active_users
    FROM events
    GROUP BY month
    ORDER BY month ASC
    """
    
    # Calculating purely in SQL is hard for "who left". 
    # Let's fetch monthly active users (MAU) and compute a proxy or 
    # try to identify users who were present in M-1 but not in M.
    
    churn_query = """
    WITH 
        toStartOfMonth(timestamp) as month,
        user_id as user
    SELECT 
        formatDateTime(month, '%Y-%m') as current_month,
        uniq(user) as current_users,
        uniqIf(user, user IN (
             SELECT DISTINCT user_id FROM events WHERE toStartOfMonth(timestamp) = addMonths(month, -1)
        )) as retained_from_prev,
        (
             SELECT uniq(user_id) FROM events WHERE toStartOfMonth(timestamp) = addMonths(month, -1)
        ) as prev_month_users
    FROM events
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
    """
    
    # The subqueries inside aggregate function might be heavy/not supported in older CH. 
    # Let's use a simpler Python-side calculation for "Mock" churn if needed, but let's try a robust SQL.
    
    # Alternative: Active counts
    res = client.query(query)
    rows = res.result_rows
    
    # We will simulate the Churn calculation for the demo based on MAU drops if we can't do deeper user-level diffs easily in this context.
    # Ideally, churn is: Users(M-1) - Intersection(Users(M-1), Users(M)).
    
    # Let's do the "Lost Users" query properly
    
    lost_users_query = """
    SELECT 
        formatDateTime(prev_month, '%Y-%m') as month,
        uniq(user_id) as lost_users
    FROM (
        SELECT 
             user_id, 
             addMonths(toStartOfMonth(timestamp), 1) as next_targets,
             toStartOfMonth(timestamp) as prev_month
        FROM events
        GROUP BY user_id, prev_month
    ) prev
    WHERE user_id NOT IN (
        SELECT user_id FROM events WHERE toStartOfMonth(timestamp) = prev.next_targets
    )
    GROUP BY prev_month
    ORDER BY prev_month DESC
    LIMIT 12
    """
    
    # Note: This logic finds users active in M who were NOT active in M+1. 
    # So the churn reported against '2023-01' is users lost in '2023-02'.
    
    try:
        lost_res = client.query(lost_users_query)
        mau_res = client.query(query)
        
        mau_map = {row[0]: row[1] for row in mau_res.result_rows}
        
        churn_data = []
        for row in lost_res.result_rows:
            month = row[0] # e.g. 2024-01
            lost = row[1]
            total_active_that_month = mau_map.get(month, 0)
            
            if total_active_that_month > 0:
                churn_rate = (lost / total_active_that_month) * 100
                churn_data.append({
                    "month": month,
                    "active_users": total_active_that_month,
                    "lost_users": lost,
                    "churn_rate": round(churn_rate, 2)
                })
        
        return churn_data
    except Exception as e:
        # Fallback if query fails
        return {"error": str(e)}

@app.post("/analytics/metrics")
async def create_metric(metric: Metric):
    from datetime import datetime
    timestamp = datetime.utcnow()
    
    data = [[metric.service, metric.endpoint, metric.status_code, metric.latency_ms, timestamp]]
    client.insert('system_metrics', data, column_names=['service', 'endpoint', 'status_code', 'latency_ms', 'timestamp'])
    return {"status": "success"}

@app.get("/analytics/performance")
async def get_performance():
    # Calculate Avg Latency and Error Rate (Status >= 400) per service in last 24h
    query = """
    SELECT 
        service,
        avg(latency_ms) as avg_latency,
        quantile(0.95)(latency_ms) as p95_latency,
        count() as total_requests,
        countIf(status_code >= 400) as error_count
    FROM system_metrics
    WHERE timestamp >= now() - INTERVAL 24 HOUR
    GROUP BY service
    ORDER BY avg_latency DESC
    """
    
    res = client.query(query)
    data = []
    
    for row in res.result_rows:
        service = row[0]
        avg_lat = row[1]
        p95_lat = row[2]
        total = row[3]
        errors = row[4]
        error_rate = (errors / total * 100) if total > 0 else 0
        
        data.append({
            "service": service,
            "avg_latency": round(avg_lat, 2),
            "p95_latency": round(p95_lat, 2),
            "request_count": total,
            "error_rate": round(error_rate, 2)
        })
        
    return data

@app.get("/api/analytics/freelancer/overview")
async def get_freelancer_overview(user_id: str):
    # Earnings
    earnings_res = client.query(f"SELECT sum(amount) FROM financial_events WHERE user_id = '{user_id}' AND category = 'Earnings'")
    total_earnings = earnings_res.result_rows[0][0] or 0.0
    
    # Jobs Completed (Approximation: Unique jobs with earnings)
    jobs_res = client.query(f"SELECT uniq(job_id) FROM financial_events WHERE user_id = '{user_id}' AND category = 'Earnings'")
    jobs_completed = jobs_res.result_rows[0][0] or 0
    
    # JSS Calculation
    # Formula: Percentage of positive reviews (>= 4.0)
    jss_query = f"""
    SELECT 
        count() as total,
        countIf(JSONExtractFloat(metadata, 'rating') >= 4.0) as positive
    FROM events 
    WHERE user_id = '{user_id}' AND event_type = 'review_received'
    """
    jss_res = client.query(jss_query)
    
    jss = 100
    if jss_res.result_rows:
        total_reviews = jss_res.result_rows[0][0]
        positive_reviews = jss_res.result_rows[0][1]
        
        if total_reviews > 0:
            jss = round((positive_reviews / total_reviews) * 100)
    
    # Profile Views
    views_res = client.query(f"SELECT count() FROM events WHERE user_id = '{user_id}' AND event_type = 'profile_view'")
    profile_views = views_res.result_rows[0][0] or 0

    return {
        "userId": user_id,
        "totalEarnings": total_earnings,
        "jobsCompleted": jobs_completed,
        "jss": jss,
        "profileViews": profile_views,
        "activeProposals": 0  # TODO: Fetch from proposal-service or track
    }
