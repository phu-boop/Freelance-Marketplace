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

class Event(BaseModel):
    event_type: str
    user_id: str
    job_id: Optional[str] = ""
    metadata: Optional[str] = "{}"

@app.get("/analytics")
async def root():
    return {"message": "Analytics Service is running"}

@app.post("/analytics/events")
async def create_event(event: Event):
    import uuid
    from datetime import datetime
    
    event_id = uuid.uuid4()
    timestamp = datetime.utcnow()
    
    data = [[event_id, event.event_type, event.user_id, event.job_id, event.metadata, timestamp]]
    client.insert('events', data, column_names=['event_id', 'event_type', 'user_id', 'job_id', 'metadata', 'timestamp'])
    
    return {"status": "success", "event_id": str(event_id)}

@app.get("/analytics/stats")
async def get_stats():
    result = client.query("SELECT event_type, count() as count FROM events GROUP BY event_type")
    return [{"event_type": row[0], "count": row[1]} for row in result.result_rows]

@app.get("/analytics/jobs/{job_id}")
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
