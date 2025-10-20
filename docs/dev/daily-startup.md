# Daily Startup Guide

_Quick commands to get started each day._

## 🚀 Local Development

### 1. Start Docker Desktop

Start the Docker Desktop application and start the K8s cluster. Wait for it to be ready.

### 2. Switch Context

```bash
# Switch to Docker Desktop context
kubectl config use-context docker-desktop
```

```bash
# Verify connection
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
```

```bash
# Terminal 2: Backend
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```

**URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs

---

## ☁️ Azure (AKS)

### 1. Start Infrastructure

```bash
# Navigate to Terraform directory
cd infrastructure/terraform
```

```bash
# Check status
terraform show
```

```bash
# Deploy if not running
terraform apply
```

### 2. Connect to AKS

```bash
# Check if logged in, otherwise login
az account show || az login
```

```bash
# Get AKS credentials and configure kubectl
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing
```

```bash
# Switch context
kubectl config use-context aks-k8s-todo-dev
```

```bash
# Verify connection
kubectl get nodes
```

### 3. Push Images to ACR (If Missing)

```bash
# Check if images exist in ACR
az acr repository list --name acrk8stododev --output table
```

```bash
# If empty or missing todo-backend/todo-frontend, build and push:
cd ~/dev/k8s-todo
```

```bash
# Login to ACR
az acr login --name acrk8stododev
```

```bash
# Build and push backend
docker build -t acrk8stododev.azurecr.io/todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-backend:latest

# Build and push frontend
docker build -t acrk8stododev.azurecr.io/todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .
docker push acrk8stododev.azurecr.io/todo-frontend:latest
```

```bash
# Verify
az acr repository list --name acrk8stododev --output table
az acr repository show-tags --name acrk8stododev --repository todo-backend --output table
```

### 4. Install ArgoCD (If First Time After Terraform Apply)

```bash
# Create namespace
kubectl create namespace argocd
```

```bash
# Install ArgoCD and wait for pods to be ready
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

```bash
# Create Application
kubectl apply -f infrastructure/argocd/todo-app-application.yaml
```

### 5. Access ArgoCD UI (Optional)

```bash
# Terminal #1 - Get initial password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```

```bash
# Terminal #2 - Port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

**Open**: https://localhost:8080  
**Username**: admin  
**Password**: (from above)

**note:** todo-app-ingress will show as `Progressing` until NGINX Ingress is installed.

### 6. Install NGINX Ingress (If First Time After Terraform Apply)

For public access without port-forwarding:

```bash
# Check if already installed
kubectl get namespace ingress-nginx
```

```bash
# If not found, install:
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

```bash
# Install NGINX Ingress Controller with Azure-specific settings
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux

# Wait for controller pods to be ready before proceeding
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Verify Ingress Controller service and get the External IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

**Important:** After `terraform destroy/apply`, the Public IP changes. Update DuckDNS:

```bash
# Get new Public IP
export NEW_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "New IP: $NEW_IP"

# Update DuckDNS manually:
1. Go to https://www.duckdns.org/
2. Update your domain with the new IP
3. Verify: nslookup dennisbybergtodo.duckdns.org
```

**Note:** DNS propagation takes ~1-2 minutes. Certificate will auto-renew once DNS is updated.

### 7. Install cert-manager (If First Time After Terraform Apply)

**For HTTPS with Let's Encrypt:**

```bash
# Check if already installed
kubectl get namespace cert-manager
```

```bash
# If not found, install:
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

# Apply Let's Encrypt issuer
kubectl apply -f infrastructure/k8s/letsencrypt-issuer.yaml

# Verify
kubectl get clusterissuer
kubectl get certificate -n todo-app
```

**Note:** Certificate issuance takes ~2 minutes after first deployment.

### 8. Access Application

**HTTPS (via custom domain):**

```bash
# Get your domain from values.yaml
echo "https://$(grep 'host:' infrastructure/helm/todo-app/values.yaml | awk '{print $2}')"
```

Open in browser with HTTPS! 🔒

**HTTP (via Public IP - fallback):**

```bash
# Get Public IP
export INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test backend
curl http://$INGRESS_IP/api/todos

# Access frontend in browser
echo "Frontend: http://$INGRESS_IP"
```

### 9. Check Application Status

Verify that ArgoCD has deployed the application correctly and pods are running healthy.

```bash
# Check if ArgoCD successfully synced the application
kubectl get application -n argocd

# Verify all pods are running (not CrashLoopBackOff or Pending)
kubectl get pods -n todo-app

# Check backend logs for errors or startup issues
kubectl logs -n todo-app deployment/todo-app-backend --tail=50
```

**Expected output:**

- ArgoCD application shows `Synced` and `Healthy`
- All pods show `Running` with `1/1` ready
- Logs show successful database connection and server start

---

## 🔄 Update Code (GitOps with ArgoCD)

**Workflow:** Push to main → GitHub Actions builds images → ArgoCD syncs from Git

### Standard Flow (Automated)

```bash
# Make your code changes
# Edit backend/frontend code as needed

# Commit and push to main
git add .
git commit -m "feat: your change description"
git push origin main
```

**What happens automatically:**

1. GitHub Actions builds Docker images
2. Images pushed to ACR (tagged with Git SHA + `latest`)
3. ArgoCD detects Git changes (within 3 min)
4. Kubernetes resources synced
5. Pods restarted with new images

**Monitor deployment:**

```bash
# Watch pods restart with new images
kubectl get pods -n todo-app -w

# Or check ArgoCD UI
# https://localhost:8080 (if port-forwarded)
```

### Manual Sync (Skip 3-minute wait)

```bash
# Force immediate sync via ArgoCD API
kubectl patch application todo-app -n argocd \
  --type merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

**Or use ArgoCD UI:**  
Click **SYNC** button at https://localhost:8080

---

## 🔧 Quick Reference

### Context Switching

```bash
# Local development
kubectl config use-context docker-desktop

# Azure AKS
kubectl config use-context aks-k8s-todo-dev
```

### Status Checks

```bash
# Application pods
kubectl get pods -n todo-app

# ArgoCD sync status
kubectl get application -n argocd

# NGINX Ingress public IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### Logs & Debugging

```bash
# Backend application logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50 -f

# Frontend application logs
kubectl logs -n todo-app deployment/todo-app-frontend --tail=50 -f

# ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server --tail=50
```

### Azure Container Registry

```bash
# List all repositories
az acr repository list --name acrk8stododev --output table

# Show tags for specific image
az acr repository show-tags --name acrk8stododev --repository todo-backend --output table
az acr repository show-tags --name acrk8stododev --repository todo-frontend --output table
```

### Port Forwarding

```bash
# ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Local app access (if not using Ingress)
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```
