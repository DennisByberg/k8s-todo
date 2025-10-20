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

### 4. Setup CI/CD

See [CI/CD Setup Guide](./ci-cd-setup.md) to configure GitHub Actions.

### 5. Install ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
# Username: admin
# Password: (from above command)
```

### 6. Create ArgoCD Application

```bash
# Apply Application manifest
kubectl apply -f infrastructure/argocd/todo-app-application.yaml

# Verify
kubectl get application -n argocd
```

### 7. Push Images to ACR

```bash
az acr login --name acrk8stododev

docker tag todo-backend:latest acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-backend:latest

docker tag todo-frontend:latest acrk8stododev.azurecr.io/todo-frontend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# Verify
az acr repository list --name acrk8stododev --output table
```

ArgoCD will automatically sync and deploy the application from Git.

### 8. Install NGINX Ingress Controller (Optional)

For public access without port-forwarding:

```bash
# Add Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX Ingress Controller
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux

# Wait for Ingress Controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Get Public IP (takes 2-3 minutes)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Example output:
# NAME                       TYPE           EXTERNAL-IP    PORT(S)
# ingress-nginx-controller   LoadBalancer   4.165.9.111    80:31049/TCP,443:31659/TCP
```

**Save the EXTERNAL-IP!** You'll need it for accessing your app.

**Cost:** ~$22/month extra (Load Balancer $18 + Public IP $4) = **Total ~$87/month**

### 9. Install cert-manager (For HTTPS)

**Optional but recommended** for production-like HTTPS setup.

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

# Verify installation
kubectl get pods -n cert-manager
```

```bash
# Create Let's Encrypt issuer
kubectl apply -f infrastructure/k8s/letsencrypt-issuer.yaml

# Verify issuer is ready
kubectl get clusterissuer
# NAME                READY   AGE
# letsencrypt-prod    True    10s
```

**Note:** Make sure you've updated `infrastructure/k8s/letsencrypt-issuer.yaml` with your email address.

### 10. Setup Custom Domain (For HTTPS)

**Choose a free domain service:**

1. Go to https://www.duckdns.org/
2. Login with GitHub/Google
3. Create subdomain (e.g., `yourname.duckdns.org`)
4. Get Public IP: `kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'`
5. Update DuckDNS with your IP
6. Update [`infrastructure/helm/todo-app/values.yaml`](infrastructure/helm/todo-app/values.yaml):

```yaml
ingress:
  enabled: true
  host: yourname.duckdns.org # Change this
```

7. Commit and push changes (ArgoCD will auto-sync)
8. Wait ~2 minutes for certificate issuance

**Verify HTTPS:**

```bash
# Check certificate status
kubectl get certificate -n todo-app
# NAME           READY   SECRET         AGE
# todo-app-tls   True    todo-app-tls   2m

# Access your app
echo "https://yourname.duckdns.org"
```

Green lock = SUCCESS! 🎉

### 11. Test AKS Deployment

```bash
# Wait for pods
kubectl get pods -n todo-app -w

# Option A: Port-forward (free)
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80

# Option B: Public IP (if Ingress installed)
export INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend: http://$INGRESS_IP"
curl http://$INGRESS_IP/api/todos
```

Open http://localhost:3000 (port-forward) or http://4.165.9.111 (Ingress)

## ✅ Setup Complete

You're ready for daily development! See [Daily Startup Guide](./daily-startup.md).

**End of day?** Use [Daily Cleanup Guide](./daily-cleanup.md) to free resources.
