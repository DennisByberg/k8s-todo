# Daily Startup Guide

Quick commands to get started each day.

## 🚀 Local Development

### 1. Start Docker Desktop

Start the Docker Desktop application and wait for Kubernetes to be ready.

### 2. Switch Context

```bash
kubectl config use-context docker-desktop
kubectl get nodes
```

### 3. Check Deployment

```bash
# Check if app is already running
kubectl get pods -n todo-app

# If empty, deploy:
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="" \
  --set backend.image.pullPolicy=IfNotPresent \
  --set frontend.image.pullPolicy=IfNotPresent
```

### 4. Access Application

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
az login

az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

kubectl config use-context aks-k8s-todo-dev
kubectl get nodes
```

### 3. Deploy Application

```bash
# Check if deployed
helm list -n todo-app

# Deploy or upgrade
helm upgrade --install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="acrk8stododev.azurecr.io" \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --set backend.image.pullPolicy=Always \
  --set frontend.image.pullPolicy=Always

kubectl get pods -n todo-app
```

### 4. Push New Images (if needed)

```bash
az acr login --name acrk8stododev

docker tag todo-backend:latest acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-backend:latest

docker tag todo-frontend:latest acrk8stododev.azurecr.io/todo-frontend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest
```

---

## 🛑 End of Day

### Local

```bash
# Optional: Stop deployment
helm uninstall todo-app -n todo-app
```

### Azure

```bash
# Option 1: Keep running (costs apply)
# Just close terminals

# Option 2: Destroy infrastructure
cd infrastructure/terraform
terraform destroy
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
```

---

_See [Troubleshooting Guide](./troubleshooting.md) for common issues._
