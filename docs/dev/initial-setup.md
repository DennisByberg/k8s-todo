# Initial Setup Guide

**🎯 Purpose:** First-time setup only. Run once to install tools and create infrastructure.

**After this:** Use [Daily Startup Guide](./daily-startup.md) for everyday work.

---

First-time installation and configuration.

## 📋 Prerequisites

Install the following tools:

- **Docker Desktop** - https://www.docker.com/products/docker-desktop
- **Azure CLI** - `brew install azure-cli` (macOS) or https://aka.ms/InstallAzureCLIDeb (Linux)
- **Terraform** - `brew install terraform` (macOS) or https://developer.hashicorp.com/terraform/install
- **Helm** - `brew install helm` (macOS) or https://helm.sh/docs/intro/install/
- **kubectl** - Included with Docker Desktop

### Verify Installation

```bash
docker version
kubectl version --client
az version
terraform version
helm version
```

## 🔧 Docker Desktop Setup

1. Start Docker Desktop
2. Open Settings → Kubernetes
3. Enable "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for both Docker and Kubernetes icons to be green

```bash
# Verify
kubectl config use-context docker-desktop
kubectl cluster-info
```

## 🏗️ Build Images

```bash
# Build backend image
docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .

# Build frontend image
docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .

# Verify
docker images | grep todo
```

## 🧪 Test Locally

```bash
# Deploy to local Kubernetes
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="" \
  --set backend.image.pullPolicy=IfNotPresent \
  --set frontend.image.pullPolicy=IfNotPresent

# Wait for pods
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` when all pods show `Running`.

### Access Application

```bash
# Terminal 1
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80

# Terminal 2
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```

Open http://localhost:3000 and test creating a todo.

## ☁️ Azure Setup (Optional)

### 1. Login to Azure

```bash
az login

# If multiple subscriptions, set the correct one:
az account list --output table
az account set --subscription "<subscription-id>"
```

### 2. Deploy Infrastructure

```bash
cd infrastructure/terraform

terraform init
terraform plan
terraform apply
```

Type `yes` to confirm. This takes ~5-10 minutes.

### 3. Connect to AKS

```bash
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

chmod 600 ~/.kube/config

kubectl config use-context aks-k8s-todo-dev
kubectl get nodes
```

### 4. Push Images to ACR

```bash
az acr login --name acrk8stododev

docker tag todo-backend:latest acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-backend:latest

docker tag todo-frontend:latest acrk8stododev.azurecr.io/todo-frontend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# Verify
az acr repository list --name acrk8stododev --output table
```

### 5. Deploy to AKS

```bash
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="acrk8stododev.azurecr.io" \
  --set backend.replicaCount=2 \
  --set frontend.replicaCount=2 \
  --set backend.image.pullPolicy=Always \
  --set frontend.image.pullPolicy=Always

kubectl get pods -n todo-app -w
```

### 6. Test AKS Deployment

```bash
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80
```

Open http://localhost:3000

## ✅ Setup Complete

You're ready for daily development! See [Daily Startup Guide](./daily-startup.md).

**End of day?** Use [Daily Cleanup Guide](./daily-cleanup.md) to free resources.
