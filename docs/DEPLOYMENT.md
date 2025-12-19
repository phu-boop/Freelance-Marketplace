# Deployment Guide: Freelance Marketplace

This guide provides instructions for deploying the Freelance Marketplace platform to a Kubernetes cluster.

## Prerequisites
- A Kubernetes cluster (Minikube, GKE, EKS, etc.)
- `kubectl` installed and configured
- Docker images pushed to a registry (e.g., Docker Hub)

## 1. Initial Setup
Create the namespace:
```bash
kubectl create namespace freelance-marketplace
```

Apply base configurations (Secrets and ConfigMaps):
```bash
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/secrets.yaml
```

## 2. Database Migrations
Run the migration jobs for each service using Prisma:
```bash
kubectl apply -f k8s/base/migration-job.yaml
```
*(Note: You should update the job name and env for each service: user, job, proposal, contract, review, admin, payment)*

## 3. Deploy Microservices
Apply all service manifests:
```bash
kubectl apply -f k8s/
```

## 4. Deploy Ingress
Ensure you have an Ingress Controller (like NGINX) installed, then apply the ingress manifest:
```bash
kubectl apply -f k8s/ingress.yaml
```

## 5. Monitoring
Deploy Prometheus and Grafana:
```bash
kubectl apply -f k8s/monitoring.yaml
```

## 6. Verification
Check the status of all pods:
```bash
kubectl get pods -n freelance-marketplace
```

Access the frontend via the Ingress host defined in `k8s/ingress.yaml`.
