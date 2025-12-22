#!/bin/bash

# Freelance Marketplace - Full Docker Startup Script
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

echo "🚀 Stopping existing containers..."
docker compose down -v --remove-orphans

echo "🔨 Building all services..."
docker compose build

echo "🆙 Starting infrastructure services for database setup..."
docker compose up -d postgres keycloak redis mongo elasticsearch clickhouse minio kong mailhog

echo "⏳ Waiting for databases to be ready..."
sleep 15

# Create Keycloak database if it doesn't exist
echo "🔑 Preparing Keycloak database..."
docker exec freelance_postgres psql -U admin -d freelance_db -c "CREATE DATABASE keycloak;" || true

echo "⏳ Waiting for Keycloak to start..."
sleep 20

# Initialize Keycloak Realm and Client
echo "🔑 Initializing Keycloak configuration..."
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create realms -s realm=freelance-marketplace -s enabled=true || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create clients -r freelance-marketplace -s clientId=freelance-client -s enabled=true -s publicClient=true -s 'redirectUris=["http://localhost:3000/*"]' -s 'webOrigins=["*"]' -s 'directAccessGrantsEnabled=true' || true

echo "🆙 Starting all remaining services in Docker..."
docker compose up -d

echo "📊 Service Status:"
docker compose ps

echo "✨ All services are running in Docker (including frontend and backends)."
echo "   Kong Gateway: http://localhost:8000"
echo "   Frontend UI: http://localhost:3000"
