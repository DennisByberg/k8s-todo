# Project Deployment Flow

Complete checklist for K8s Todo application deployment.

## Infrastructure Setup

- ✅ Docker Desktop with Kubernetes enabled
- ✅ Azure CLI installed and configured
- ✅ Terraform installed
- ✅ Helm installed
- ✅ kubectl configured

## Local Development

- ✅ Docker images build successfully
- ✅ Local Kubernetes cluster running
- ✅ Application deployed locally with Helm
- ✅ Port-forwarding working (frontend + backend)
- ✅ Database persistence working

## Azure Infrastructure

- ✅ Terraform configuration created
- ✅ Azure Resource Group deployed
- ✅ Azure Container Registry (ACR) created
- ✅ AKS cluster deployed (2x Standard_B2s nodes)
- ✅ AKS connected to ACR
- ✅ kubectl connected to AKS

## Container Images

- ✅ Backend image built locally
- ✅ Frontend image built locally
- ✅ Images pushed to ACR
- ✅ Image tags versioned

## Kubernetes Deployment

- ✅ Helm charts created
- ✅ Backend deployment configured
- ✅ Frontend deployment configured
- ✅ PostgreSQL deployment configured
- ✅ Services configured (ClusterIP)
- ✅ ConfigMaps for environment variables
- ✅ PersistentVolumeClaim for database
- ✅ Resource requests/limits defined
- ✅ Health checks (liveness/readiness) configured

## Application Running

- ✅ Application deployed to AKS
- ✅ All pods running (2 replicas each)
- ✅ Database initialized
- ✅ Backend API accessible
- ✅ Frontend accessible
- ✅ Backend ↔ Database connection working
- ✅ Frontend ↔ Backend communication working

## CI/CD Pipeline

- ✅ GitHub Actions workflow created
- ✅ Build job (Docker images)
- ✅ Push to ACR job
- ✅ Automatic deployment on push to main
- ✅ Version tagging strategy (Git SHA + latest)

## GitOps (ArgoCD)

- ✅ ArgoCD installed in AKS
- ✅ ArgoCD Application manifest created
- ✅ Git repository as source of truth (main branch)
- ✅ Auto-sync enabled (3 min polling)
- ✅ Self-heal enabled (reverts manual changes)
- ✅ Prune enabled (removes resources not in Git)

## Networking & Ingress

- ✅ NGINX Ingress Controller installed
- ✅ Azure Load Balancer created (Public IP assigned)
- ✅ Ingress rules configured (`/healthz`, `/health`, `/api`, `/`)
- ✅ CORS configured in Ingress
- ✅ Health probes working (Load Balancer gets 200 OK)
- ✅ Public URL accessible (HTTP only)

## Database

- ⬜ Azure Database for PostgreSQL deployed
- ⬜ Connection from AKS to Azure DB working
- ⬜ Database backups configured
- ⬜ Migration from in-cluster Postgres complete

## Documentation

- ✅ Initial setup guide
- ✅ Daily startup guide
- ✅ Daily cleanup guide
- ✅ CI/CD pipeline documentation
- ✅ ArgoCD setup documented
- ✅ Ingress setup documented
- ✅ Ingress routing documented (`/healthz`, `/health`, `/api`, `/`)
- ⬜ Architecture diagrams
- ⬜ API documentation published

## Testing

- ✅ Syntax linting (flake8 + ESLint)
- ✅ Code formatting (black + Prettier via ESLint)
- ✅ Type checking (TypeScript)

---

## Current Status

**Environment:** AKS (Azure Kubernetes Service)  
**Nodes:** 2x Standard_B2s (2 vCPU, 8GB RAM each)  
**Replicas:** 2x Backend, 2x Frontend, 1x Postgres  
**CI/CD:** GitHub Actions (build images on push to main)  
**GitOps:** ArgoCD (auto-sync from main branch)  
**Ingress:** NGINX Ingress Controller with Azure Load Balancer  
**Security:** Development mode (HTTP only, hardcoded credentials)  
**Public Access:** http://<EXTERNAL-IP>  
**Cost:** ~$87/month (~$22 for Load Balancer + IP, use `terraform destroy` when not in use)

**Note:** Public IP changes on `terraform destroy/apply`.
