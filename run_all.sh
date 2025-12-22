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
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh update realms/freelance-marketplace -s registrationAllowed=true -s resetPasswordAllowed=true -s verifyEmail=true -s rememberMe=true -s loginTheme=freelance || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create clients -r freelance-marketplace -s clientId=freelance-client -s enabled=true -s publicClient=true -s 'redirectUris=["http://localhost:3000/*"]' -s 'webOrigins=["*"]' -s 'directAccessGrantsEnabled=true' || true

# Create Roles
echo "👥 Creating roles..."
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=ADMIN || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=FREELANCER || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=CLIENT || true

# Create Test Users
echo "👤 Creating test users..."
# Admin User
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create users -r freelance-marketplace -s username=admin@test.com -s email=admin@test.com -s enabled=true -s firstName=Admin -s lastName=User || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh set-password -r freelance-marketplace --username admin@test.com --new-password password || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh add-roles -r freelance-marketplace --uusername admin@test.com --rolename ADMIN || true

# Freelancer User
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create users -r freelance-marketplace -s username=freelancer@test.com -s email=freelancer@test.com -s enabled=true -s firstName=Freelancer -s lastName=User || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh set-password -r freelance-marketplace --username freelancer@test.com --new-password password || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh add-roles -r freelance-marketplace --uusername freelancer@test.com --rolename FREELANCER || true

# Client User
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create users -r freelance-marketplace -s username=client@test.com -s email=client@test.com -s enabled=true -s firstName=Client -s lastName=User || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh set-password -r freelance-marketplace --username client@test.com --new-password password || true
docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh add-roles -r freelance-marketplace --uusername client@test.com --rolename CLIENT || true

# OAuth2 Identity Providers (Optional - Requires Client ID/Secret)
# echo "🌐 Configuring Social Logins..."
# docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create identity-provider/instances -r freelance-marketplace -s alias=google -s providerId=google -s enabled=true -s 'config={"clientId":"YOUR_GOOGLE_ID", "clientSecret":"YOUR_GOOGLE_SECRET"}' || true
# docker exec freelance_keycloak /opt/keycloak/bin/kcadm.sh create identity-provider/instances -r freelance-marketplace -s alias=github -s providerId=github -s enabled=true -s 'config={"clientId":"YOUR_GITHUB_ID", "clientSecret":"YOUR_GITHUB_SECRET"}' || true

echo "🆙 Starting all remaining services in Docker..."
docker compose up -d

echo "📊 Service Status:"
docker compose ps

echo "✨ All services are running in Docker (including frontend and backends)."
echo "   Kong Gateway: http://localhost:8000"
echo "   Frontend UI: http://localhost:3000"
