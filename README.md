# K8s Todo - Cloud-Native Todo Application

## 📋 Projektöversikt

En modern todo-applikation byggd med fokus på:

- Containerisering med Docker
- Orchestrering med Kubernetes
- Cloud deployment på Azure
- Moderna frontend- och backend-ramverk
- GitOps continuous deployment

## 🏗️ Arkitektur

### Frontend

- **Framework**: Next.js 15+ med React 19+
- **Språk**: TypeScript
- **UI-bibliotek**: Mantine
- **State Management**: Tanstack Query (för server state)
- **Validering**: Zod
- **Styling**: CSS Modules / Mantine Theme

### Backend

- **Framework**: FastAPI
- **Språk**: Python 3.11+
- **ORM**: SQLAlchemy
- **API-dokumentation**: OpenAPI/Swagger (automatiskt via FastAPI)

### Databas

- **Primär databas**: PostgreSQL

### Infrastructure & DevOps

- **Containerisering**: Docker & Docker Compose
- **Orchestrering**: Kubernetes (AKS)
- **Package Management**: Helm Charts
- **GitOps**: ArgoCD (continuous deployment)
- **Ingress Controller**: NGINX Ingress
- **Cloud Provider**: Microsoft Azure
  - Azure Kubernetes Service (AKS)
  - Azure Container Registry (ACR)
  - Azure Database for PostgreSQL
- **CI/CD**: GitHub Actions

## 📦 Projektstruktur

```
k8s-todo/
├── frontend/          # Next.js applikation
├── backend/           # FastAPI applikation
├── k8s/               # Kubernetes manifests
│   ├── base/          # Base configurations
│   └── overlays/      # Environment-specific overlays (dev, prod)
├── helm/              # Helm charts
├── argocd/            # ArgoCD application definitions
├── docker/            # Dockerfiles
└── docs/              # Projektdokumentation
```

## 🚀 Deployment-strategi

1. **Lokal utveckling**: Docker Compose
2. **CI/CD Pipeline**: GitHub Actions
   - Build och push Docker images till ACR
   - Update Helm chart versions
3. **GitOps Deployment**: ArgoCD
   - Automated sync från Git repository
   - Rollback capabilities
   - Multi-environment management
4. **Production**: Azure Kubernetes Service (AKS)
   - NGINX Ingress för external access
   - Horizontal Pod Autoscaling
   - Azure Database for PostgreSQL
