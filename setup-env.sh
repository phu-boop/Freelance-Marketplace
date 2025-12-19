#!/bin/bash

# Frontend
echo "Generating frontend/.env.local..."
cat > frontend/.env.local <<EOL
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=freelance-marketplace
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=freelance-client
EOL

# User Service
echo "Generating services/user-service/.env..."
cat > services/user-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=users"
PORT=3001
JWT_SECRET=supersecretkey
EOL

# Job Service
echo "Generating services/job-service/.env..."
cat > services/job-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=jobs"
PORT=3002
USER_SERVICE_URL=http://localhost:3001
EOL

# Proposal Service
echo "Generating services/proposal-service/.env..."
cat > services/proposal-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=proposals"
PORT=3003
USER_SERVICE_URL=http://localhost:3001
JOB_SERVICE_URL=http://localhost:3002
EOL

# Contract Service
echo "Generating services/contract-service/.env..."
cat > services/contract-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=contracts"
PORT=3004
PAYMENT_SERVICE_URL=http://localhost:3005
EOL

# Payment Service
echo "Generating services/payment-service/.env..."
cat > services/payment-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=payments"
PORT=3005
EOL

# Chat Service
echo "Generating services/chat-service/.env..."
cat > services/chat-service/.env <<EOL
MONGO_URI="mongodb://admin:password@localhost:27017/chat_db?authSource=admin"
PORT=3006
USER_SERVICE_URL=http://localhost:3001
EOL

# Admin Service
echo "Generating services/admin-service/.env..."
cat > services/admin-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=admin"
PORT=3009
USER_SERVICE_URL=http://localhost:3001
JOB_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3005
EOL

# Search Service
echo "Generating services/search-service/.env..."
cat > services/search-service/.env <<EOL
ELASTICSEARCH_NODE=http://localhost:9200
PORT=3010
JOB_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3001
EOL

# Review Service
echo "Generating services/review-service/.env..."
cat > services/review-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=reviews"
PORT=3008
EOL

# Notification Service
echo "Generating services/notification-service/.env..."
cat > services/notification-service/.env <<EOL
MONGODB_URI="mongodb://admin:password@localhost:27017/freelance_notifications?authSource=admin"
PORT=3007
EOL

# Email Service
echo "Generating services/email-service/.env..."
cat > services/email-service/.env <<EOL
PORT=3012
EMAIL_USER=user@example.com
EMAIL_PASS=password
EOL

# Storage Service
echo "Generating services/storage-service/.env..."
cat > services/storage-service/.env <<EOL
PORT=3011
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password
EOL

# Common Service
echo "Generating services/common-service/.env..."
cat > services/common-service/.env <<EOL
DATABASE_URL="postgresql://admin:password@localhost:5432/freelance_db?schema=common"
PORT=3013
EOL

# Analytics Service
echo "Generating services/analytics-service/.env..."
cat > services/analytics-service/.env <<EOL
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=admin
CLICKHOUSE_PASSWORD=password
CLICKHOUSE_DB=freelance_analytics
PORT=3014
EOL

echo "All .env files generated successfully!"
