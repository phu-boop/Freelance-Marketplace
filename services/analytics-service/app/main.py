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
    metadata String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, event_type)
""")

class Event(BaseModel):
    event_type: str
    user_id: str
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
    
    data = [[event_id, event.event_type, event.user_id, event.metadata, timestamp]]
    client.insert('events', data, column_names=['event_id', 'event_type', 'user_id', 'metadata', 'timestamp'])
    
    return {"status": "success", "event_id": str(event_id)}

@app.get("/analytics/stats")
async def get_stats():
    result = client.query("SELECT event_type, count() as count FROM events GROUP BY event_type")
    return [{"event_type": row[0], "count": row[1]} for row in result.result_rows]
