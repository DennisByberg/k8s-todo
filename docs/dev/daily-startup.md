# Daily Startup Guide

**🎯 Purpose:** Daily workflow after initial setup is complete.

**First time?** See [Initial Setup Guide](./initial-setup.md) to install tools and create infrastructure.

**End of day?** See [Daily Cleanup Guide](./daily-cleanup.md) to free resources.

---

Quick commands to get started each day.

## 🚀 Local Development

### 1. Start Docker Desktop

Start the Docker Desktop application and wait for Kubernetes to be ready.

### 2. Switch Context

```bash
kubectl config use-context docker-desktop
kubectl get nodes
```

### 3. Build Local Images

**Important:** Build images before deploying locally.

```bash
# Make sure you're in project root
cd ~/dev/k8s-todo

# Build images
docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .

# Verify images exist
docker images | grep todo
```

### 4. Deploy Application

```bash
# Check if app is already running
kubectl get pods -n todo-app

# If empty or if you rebuilt images, deploy:
helm upgrade --install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="" \
  --set backend.image.pullPolicy=IfNotPresent \
  --set frontend.image.pullPolicy=IfNotPresent

# Monitor deployment
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` when all pods show `Running`.

### 5. Access Application

```bash
# Terminal 1: Frontend
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80

# Terminal 2: Backend
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```

**URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

---

## ☁️ Azure (AKS)

### 1. Start Infrastructure

```bash
cd infrastructure/terraform

# Check status
terraform show

# If empty, deploy:
terraform apply
```

### 2. Connect to AKS

```bash
# Check if logged in, otherwise login
az account show || az login

# Get AKS credentials and configure kubectl
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

# Switch context
kubectl config use-context aks-k8s-todo-dev

# Verify connection
kubectl get nodes
```

### 3. Build and Push Images

**Important:** Always build and push fresh images before deploying to AKS.

```bash
# Make sure you're in project root
cd ~/dev/k8s-todo

# Login to ACR
az acr login --name acrk8stododev

# Build images
docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .

# Tag for ACR
docker tag todo-backend:latest acrk8stododev.azurecr.io/todo-backend:latest
docker tag todo-frontend:latest acrk8stododev.azurecr.io/todo-frontend:latest

# Push to ACR
docker push acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# Verify images in ACR
az acr repository list --name acrk8stododev --output table
```

### 4. Deploy Application

```bash
# Check if deployed
helm list -n todo-app

# Deploy or upgrade
helm upgrade --install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="acrk8stododev.azurecr.io" \
  --set backend.replicaCount=2 \
  --set frontend.replicaCount=2 \
  --set backend.image.pullPolicy=Always \
  --set frontend.image.pullPolicy=Always

# Monitor deployment
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` when all pods show `Running`.

---

## 🔄 Update Code (Automated CI/CD)

**Nu är detta automatiserat!** GitHub Actions gör allt när du pushar kod:

```bash
# 1. Make your code changes
# 2. Commit and push
git add .
git commit -m "Your change description"
git push origin main

# 3. GitHub Actions automatically:
#    - Builds Docker images
#    - Pushes to ACR (tagged with Git SHA + latest)
#    - Restarts deployments in AKS
#    - Verifies deployment

# 4. Monitor GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/k8s-todo/actions

# 5. Monitor deployment in AKS (optional)
kubectl get pods -n todo-app -w
```

**Manuellt deployment (om GitHub Actions inte används):**

```bash
cd ~/dev/k8s-todo
az acr login --name acrk8stododev

docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-backend:latest

docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-frontend:latest

kubectl rollout restart deployment/todo-app-backend -n todo-app
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl get pods -n todo-app -w
```

---

## 🔧 Quick Commands

```bash
# Switch contexts
kubectl config use-context docker-desktop
kubectl config use-context aks-k8s-todo-dev

# Check status
kubectl get pods -n todo-app
kubectl get services -n todo-app

# View logs
kubectl logs -n todo-app deployment/todo-app-backend
kubectl logs -n todo-app deployment/todo-app-frontend

# Restart deployment
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Check images in ACR
az acr repository list --name acrk8stododev --output table
az acr repository show-tags --name acrk8stododev --repository todo-backend --output table

# View GitHub Actions workflow runs
# https://github.com/YOUR_USERNAME/k8s-todo/actions
```

---

_End of day: [Daily Cleanup Guide](./daily-cleanup.md)_
