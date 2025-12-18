# Freelance Marketplace System

A comprehensive, microservices-based freelance marketplace platform built with modern technologies.

## 🚀 Overview

This project is a full-featured freelance marketplace allowing clients to post jobs and freelancers to submit proposals. It features real-time chat, notifications, secure authentication, and a premium user interface.

### Key Features
- **User Management**: Secure authentication with Keycloak (SSO), user profiles, and role-based access.
- **Job Marketplace**: Advanced job search with Elasticsearch, job posting, and management.
- **Proposals & Contracts**: Full lifecycle from proposal submission to contract creation and payment simulation.
- **Real-time Communication**: Instant messaging and notifications using Socket.io.
- **Microservices Architecture**: Scalable and modular design with 11+ specialized services.
- **API Gateway**: Centralized entry point using Kong for routing, authentication, and rate limiting.

## 🏗 Architecture

The system is built using a microservices architecture:

| Service | Tech Stack | Port | Description |
|---------|------------|------|-------------|
| **Frontend** | Next.js 14, Tailwind CSS | 3000 | Premium user interface and dashboard. |
| **API Gateway** | Kong | 8000 | Centralized API entry point. |
| **Auth Service** | Keycloak | 8080 | Identity and Access Management. |
| **User Service** | NestJS, PostgreSQL | 3001 | User profiles and management. |
| **Job Service** | NestJS, PostgreSQL | 3002 | Job postings and management. |
| **Proposal Service** | NestJS, PostgreSQL | 3003 | Proposal submission and tracking. |
| **Contract Service** | NestJS, PostgreSQL | 3004 | Contract management. |
| **Payment Service** | Spring Boot, PostgreSQL | 3005 | Payment processing (simulated). |
| **Chat Service** | Node.js, MongoDB | 3006 | Real-time messaging. |
| **Notification Service** | NestJS, MongoDB | 3007 | Real-time notifications. |
| **Review Service** | NestJS, PostgreSQL | 3008 | User reviews and ratings. |
| **Admin Service** | NestJS, PostgreSQL | 3009 | Administrative functions. |
| **Search Service** | NestJS, Elasticsearch | 3010 | Advanced search capabilities. |
| **Analytics Service** | Python, ClickHouse | 3011 | Data analytics and reporting. |

## 🛠 Prerequisites

- **Docker** and **Docker Compose** (Required for running infrastructure and services).
- **Node.js** (v18+) (For local frontend development).
- **npm** or **yarn**.

## 🏁 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Freelance-Marketplace
```

### 2. Start Infrastructure & Services
The entire backend system is containerized. You can start everything using Docker Compose.

```bash
# Start shared infrastructure (Databases, Keycloak, Kong, etc.)
docker-compose up -d

# NOTE: In a production environment, you would also start the application services here.
# For development, you might run services individually or use a dev-specific compose file.
```

### 3. Configure Keycloak
1. Access Keycloak at `http://localhost:8080`.
2. Login with admin credentials (default: `admin`/`admin`).
3. Import the `realm-export.json` (if provided) or set up a new realm `freelance-marketplace`.
4. Create a client `freelance-frontend` with valid redirect URIs (e.g., `http://localhost:3000/*`).

### 4. Configure Kong Gateway
Ensure Kong is configured to route traffic to the appropriate services. (Scripts for this are typically in `scripts/kong-config.sh`).

### 5. Run Frontend (Local Development)
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🧪 Usage

1.  **Sign Up/Login**: Use the "Sign In" button to authenticate via Keycloak.
2.  **Dashboard**: View your overview and recent activity.
3.  **Find Jobs**: Browse and search for jobs.
4.  **Post a Job**: (Client) Create a new job listing.
5.  **Submit Proposal**: (Freelancer) Apply for jobs.
6.  **Messages**: Chat with other users in real-time.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
