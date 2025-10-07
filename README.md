# K8s Todo - Cloud-Native Todo Application

## 📋 Project Overview

A modern todo application built with focus on:

- Containerization with Docker
- Orchestration with Kubernetes
- Cloud deployment on Azure
- Modern frontend and backend frameworks
- GitOps continuous deployment

## 🏗️ Architecture

### Frontend

- **Framework**: Next.js 15+ with React 19+
- **Language**: TypeScript
- **UI Library**: Mantine
- **State Management**: Tanstack Query (for server state)
- **Validation**: Zod
- **Styling**: CSS Modules / Mantine Theme

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **API Documentation**: OpenAPI/Swagger (automatic via FastAPI)

### Database

- **Primary Database**: PostgreSQL

### Infrastructure & DevOps

- **Infrastructure as Code**: Terraform
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (AKS)
- **Package Management**: Helm Charts
- **GitOps**: ArgoCD (continuous deployment)
- **Ingress Controller**: NGINX Ingress
- **Cloud Provider**: Microsoft Azure
  - Azure Kubernetes Service (AKS)
  - Azure Container Registry (ACR)
  - Azure Database for PostgreSQL
  - Azure Virtual Network
- **CI/CD**: GitHub Actions

## 📦 Project Structure

```
k8s-todo/
├── frontend/              # Next.js application
├── backend/               # FastAPI application
├── infrastructure/        # All infrastructure code
│   ├── terraform/         # Infrastructure as Code
│   │   ├── modules/       # Reusable Terraform modules
│   │   ├── environments/  # Environment-specific configs
│   │   └── main.tf        # Main configuration
│   ├── k8s/               # Kubernetes manifests
│   │   ├── base/          # Base configurations
│   │   └── overlays/      # Environment-specific overlays
│   ├── helm/              # Helm charts
│   ├── argocd/            # ArgoCD application definitions
│   └── docker/            # Dockerfiles
├── .github/               # GitHub Actions workflows
└── docs/                  # Project documentation
```

## 🚀 Deployment Strategy

1. **Infrastructure Setup**: Terraform

   - Provision AKS cluster
   - Setup ACR
   - Configure networking
   - Create Azure Database for PostgreSQL

2. **Local Development**: Docker Compose

3. **CI/CD Pipeline**: GitHub Actions

   - Build and push Docker images to ACR
   - Update Helm chart versions

4. **GitOps Deployment**: ArgoCD

   - Automated sync from Git repository
   - Rollback capabilities
   - Multi-environment management

5. **Production**: Azure Kubernetes Service (AKS)
   - NGINX Ingress for external access
   - Horizontal Pod Autoscaling
   - Azure Database for PostgreSQL

_Last updated: 2025-10-07_
