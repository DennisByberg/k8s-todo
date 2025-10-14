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

### 3. Push Images to ACR (If Missing)

```bash
# Check if images exist in ACR
az acr repository list --name acrk8stododev --output table

# If empty or missing todo-backend/todo-frontend, build and push:
cd ~/dev/k8s-todo

# Login to ACR
az acr login --name acrk8stododev

# Build and push backend
docker build -t acrk8stododev.azurecr.io/todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-backend:latest

# Build and push frontend
docker build -t acrk8stododev.azurecr.io/todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# Verify
az acr repository list --name acrk8stododev --output table
az acr repository show-tags --name acrk8stododev --repository todo-backend --output table
```

### 4. Install ArgoCD (If First Time After Terraform Apply)

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Create Application
kubectl apply -f infrastructure/argocd/todo-app-application.yaml
```

### 5. Access ArgoCD UI (Optional)

```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d

# Port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open https://localhost:8080
# Username: admin
# Password: (from above)
```

### 6. Check Application Status

```bash
# Check ArgoCD application
kubectl get application -n argocd

# Check pods
kubectl get pods -n todo-app

# View logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50
```

---

## 🔄 Update Code (GitOps with ArgoCD)

**Workflow:** Push to main → GitHub Actions builds images → ArgoCD syncs from Git

```bash
# 1. Make your code changes

# 2. Update Helm values if needed
# Edit infrastructure/helm/todo-app/values.yaml

# 3. Commit and push to main
git add .
git commit -m "Your change description"
git push origin main

# 4. GitHub Actions automatically:
#    - Builds Docker images
#    - Pushes to ACR (tagged with Git SHA + latest)

# 5. ArgoCD automatically (within 3 min):
#    - Detects Git changes
#    - Syncs Kubernetes resources
#    - Restarts pods with new images

# 6. Monitor in ArgoCD UI or:
kubectl get pods -n todo-app -w
```

**Manual sync (if you don't want to wait 3 min):**

```bash
# Option 1: ArgoCD UI
# Click SYNC button in https://localhost:8080

# Option 2: kubectl
kubectl patch application todo-app -n argocd --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

---

## 🔧 Quick Commands

```bash
# Switch contexts
kubectl config use-context docker-desktop
kubectl config use-context aks-k8s-todo-dev

# Check status
kubectl get pods -n todo-app
kubectl get application -n argocd

# View logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50
kubectl logs -n argocd deployment/argocd-server --tail=50

# Check images in ACR
az acr repository list --name acrk8stododev --output table
az acr repository show-tags --name acrk8stododev --repository todo-backend --output table

# ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

---

_End of day: [Daily Cleanup Guide](./daily-cleanup.md)_
