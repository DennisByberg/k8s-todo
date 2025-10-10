# Development Setup Guide

Quick reference documentation for daily development workflow.

## 📚 Documentation

| Document                                | Purpose                                   |
| --------------------------------------- | ----------------------------------------- |
| [Project Status](./deployment-flow.md)  | Current status and next steps             |
| [Daily Startup](./daily-startup.md)     | Quick commands to start working           |
| [Initial Setup](./initial-setup.md)     | First-time installation and configuration |
| [Deploy to AKS](./deploy-aks.md)        | Azure Kubernetes Service deployment       |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions               |

## 🎯 Quick Start

**Already set up?** → [Daily Startup Guide](./daily-startup.md)

**First time?** → [Initial Setup Guide](./initial-setup.md)

**Problems?** → [Troubleshooting Guide](./troubleshooting.md)

## 🏗️ Architecture

```
Local Development (Docker Desktop K8s)
    ↓
Azure Infrastructure (Terraform)
    ├── Resource Group
    ├── Azure Container Registry (ACR)
    └── Azure Kubernetes Service (AKS)
    ↓
Application (Helm)
    ├── Backend (FastAPI + PostgreSQL)
    └── Frontend (Next.js)
```

## 🔄 Workflow

1. Develop and test locally with Docker Desktop
2. Build Docker images
3. Push images to ACR
4. Deploy to AKS with Helm

---

_Last updated: 2025-10-10_
