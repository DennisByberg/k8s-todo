# Development Setup Guide

Quick reference documentation for daily development workflow.

## 📚 Documentation

| Document                              | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| [Project Status](./project-status.md) | Current status and next steps             |
| [Initial Setup](./initial-setup.md)   | First-time installation and configuration |
| [Daily Startup](./daily-startup.md)   | Quick commands to start working           |
| [Daily Cleanup](./daily-cleanup.md)   | End of day cleanup                        |
| [CI/CD Setup](./ci-cd-setup.md)       | GitHub Actions pipeline documentation     |

## 🎯 Quick Start

**Already set up?** → [Daily Startup Guide](./daily-startup.md)

**First time?** → [Initial Setup Guide](./initial-setup.md)

**Setup CI/CD?** → [CI/CD Setup Guide](./ci-cd-setup.md)

## 🏗️ Architecture

```
Local Development (Docker Desktop K8s)
    ↓
Azure Infrastructure (Terraform)
    ├── Resource Group
    ├── Azure Container Registry (ACR)
    └── Azure Kubernetes Service (AKS)
    ↓
CI/CD (GitHub Actions)
    ├── Build Docker images
    ├── Push to ACR
    └── Deploy to AKS
    ↓
Application (Helm)
    ├── Backend (FastAPI + PostgreSQL)
    └── Frontend (Next.js)
```

## 🔄 Workflow

### Development Workflow (Automated)

1. Make code changes locally
2. Test with Docker Desktop K8s
3. Commit and push to GitHub
4. **GitHub Actions automatically:**
   - Builds Docker images
   - Pushes to ACR
   - Deploys to AKS
5. Verify deployment in AKS

### Manual Workflow (When Needed)

1. Develop and test locally with Docker Desktop
2. Build Docker images
3. Push images to ACR
4. Deploy to AKS with Helm

---
