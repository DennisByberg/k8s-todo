# Deploy to Azure Kubernetes Service

Complete guide for deploying to AKS.

## 📋 Prerequisites

- Azure CLI installed and logged in
- Terraform installed
- Docker images built locally
- kubectl and Helm installed

## 🚀 Deployment Steps

### 1. Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Deploy infrastructure
terraform apply
```

Type `yes` to confirm. Wait ~5-10 minutes.

**Resources created:**

- Resource Group: `rg-k8s-todo-dev`
- Azure Container Registry: `acrk8stododev`
- AKS Cluster: `aks-k8s-todo-dev` (2 nodes, Standard_B2s)

### 2. Connect to AKS Cluster

```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

# Fix kubeconfig permissions
chmod 600 ~/.kube/config

# Verify connection
kubectl config current-context
kubectl get nodes
```

### 3. Push Docker Images to ACR

```bash
# Login to Azure Container Registry
az acr login --name acrk8stododev

# Tag and push backend
docker tag todo-backend:latest acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-backend:latest

# Tag and push frontend
docker tag todo-frontend:latest acrk8stododev.azurecr.io/todo-frontend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# Verify images in ACR
az acr repository list --name acrk8stododev --output table
```

### 4. Deploy Application with Helm

```bash
# Create namespace
kubectl create namespace todo-app

# Deploy with Helm
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --set imageRegistry="acrk8stododev.azurecr.io" \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --set backend.image.pullPolicy=Always \
  --set frontend.image.pullPolicy=Always

# Monitor deployment
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` when all pods show `Running`.

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n todo-app

# Check services
kubectl get services -n todo-app

# Check ingress
kubectl get ingress -n todo-app
```

### 6. Access Application

```bash
# Port-forward frontend
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80

# In new terminal: Port-forward backend
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

## 🔄 Update Deployment

### Update Code and Rebuild Images

```bash
# 1. Make code changes

# 2. Rebuild images
docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .

# 3. Push to ACR
az acr login --name acrk8stododev
docker push acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest

# 4. Restart deployments
kubectl rollout restart deployment/todo-app-backend -n todo-app
kubectl rollout restart deployment/todo-app-frontend -n todo-app

# 5. Monitor rollout
kubectl rollout status deployment/todo-app-backend -n todo-app
kubectl rollout status deployment/todo-app-frontend -n todo-app
```

### Update Helm Configuration

```bash
# Edit values or upgrade
helm upgrade todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --set imageRegistry="acrk8stododev.azurecr.io" \
  --set backend.replicaCount=2 \
  --reuse-values

# Check status
kubectl get pods -n todo-app
```

## 🗑️ Cleanup

### Remove Application Only

```bash
# Uninstall Helm release
helm uninstall todo-app -n todo-app

# Delete namespace
kubectl delete namespace todo-app
```

### Remove Everything (Infrastructure)

```bash
cd infrastructure/terraform

# Destroy all Azure resources
terraform destroy
```

Type `yes` to confirm. This removes:

- AKS cluster
- ACR and all images
- Resource group
- All networking resources

**Note:** This will delete all data. Make backups if needed.

## 🔍 Monitoring

```bash
# View logs
kubectl logs -n todo-app deployment/todo-app-backend
kubectl logs -n todo-app deployment/todo-app-frontend
kubectl logs -n todo-app deployment/todo-app-postgres

# Follow logs in real-time
kubectl logs -f -n todo-app deployment/todo-app-backend

# View events
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods -n todo-app
```

## 💰 Cost Management

**Estimated monthly costs (Sweden Central):**

- 2x Standard_B2s nodes: ~$60/month
- ACR Basic: ~$5/month
- **Total: ~$65/month**

**To minimize costs:**

- Destroy infrastructure when not in use: `terraform destroy`
- Use 1 node instead of 2 for development
- Scale down to 1 replica during off-hours

---

_For issues, see [Troubleshooting Guide](./troubleshooting.md)._
