# Troubleshooting Guide

Common issues and solutions.

## 🔍 General Debugging

```bash
# Check pod status
kubectl get pods -n todo-app

# Describe pod for details
kubectl describe pod <pod-name> -n todo-app

# View logs
kubectl logs <pod-name> -n todo-app

# View recent events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

---

## Common Issues

### Pods Stuck in "Pending"

**Symptom:**

```
NAME                       READY   STATUS    RESTARTS   AGE
todo-app-backend-xxx-yyy   0/1     Pending   0          5m
```

**Cause:** Insufficient CPU/Memory

**Solution:**

```bash
# Check node resources
kubectl top nodes

# Reduce replicas
helm upgrade todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --reuse-values
```

---

### Pods in "CrashLoopBackOff"

**Symptom:**

```
NAME                       READY   STATUS             RESTARTS   AGE
todo-app-backend-xxx-yyy   0/1     CrashLoopBackOff   5          3m
```

**Solution:**

```bash
# Check logs for error
kubectl logs todo-app-backend-xxx-yyy -n todo-app

# Common causes:
# 1. Backend can't connect to Postgres
# 2. Environment variable missing
# 3. Database not ready

# Verify postgres is running
kubectl get pods -n todo-app | grep postgres
```

---

### Postgres Init Error

**Symptom:**

```
initdb: error: directory exists but is not empty
```

**Solution:**

```bash
# Delete PVC and reinstall
helm uninstall todo-app -n todo-app
kubectl delete pvc -n todo-app --all

# Reinstall
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  <...args>
```

---

### "Insufficient CPU" Error

**Symptom:**

```
Events:
  Warning  FailedScheduling  0/1 nodes: Insufficient cpu
```

**Solution:**

```bash
# Option 1: Reduce replicas
helm upgrade todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --reuse-values

# Option 2: Upgrade node size
# Edit infrastructure/terraform/variables.tf
# Change node_size to "Standard_B2ms"
cd infrastructure/terraform
terraform apply
```

---

### Can't Connect to AKS

**Symptom:**

```
Error: dial tcp: lookup k8stododev-xxx: no such host
```

**Solution:**

```bash
# Verify infrastructure exists
cd infrastructure/terraform
terraform show

# If empty, deploy infrastructure
terraform apply

# Get fresh credentials
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

chmod 600 ~/.kube/config
```

---

### Images Not Found in ACR

**Symptom:**

```
Failed to pull image: rpc error: NotFound
```

**Solution:**

```bash
# Check images in ACR
az acr repository list --name acrk8stododev

# If empty, push images
az acr login --name acrk8stododev

docker push acrk8stododev.azurecr.io/todo-backend:latest
docker push acrk8stododev.azurecr.io/todo-frontend:latest
```

---

### Wrong Kubernetes Context

**Symptom:**

```
Error: namespace "todo-app" not found
```

**Solution:**

```bash
# Check current context
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context
kubectl config use-context docker-desktop     # Local
kubectl config use-context aks-k8s-todo-dev   # Azure
```

---

### Port-Forward Connection Refused

**Symptom:**

```
Error: unable to forward port: connection refused
```

**Solution:**

```bash
# Verify service exists
kubectl get services -n todo-app

# Check pod status
kubectl get pods -n todo-app

# If not Running, check logs
kubectl logs -n todo-app deployment/todo-app-frontend
```

---

## 🔄 Complete Reset

### Local (Docker Desktop)

```bash
helm uninstall todo-app -n todo-app
kubectl delete namespace todo-app

# Restart Docker Desktop

kubectl create namespace todo-app
helm install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --set imageRegistry="" \
  --set backend.image.pullPolicy=IfNotPresent \
  --set frontend.image.pullPolicy=IfNotPresent
```

### Azure (AKS)

```bash
# Delete deployment
helm uninstall todo-app -n todo-app
kubectl delete namespace todo-app

# Destroy infrastructure
cd infrastructure/terraform
terraform destroy

# Redeploy
terraform apply

# Reconnect and deploy
az aks get-credentials \
  --resource-group rg-k8s-todo-dev \
  --name aks-k8s-todo-dev \
  --overwrite-existing

# Push images and deploy
# (See Deploy to AKS guide)
```

---

## 📞 Debug Commands

```bash
# Pod details
kubectl describe pod <pod-name> -n todo-app

# Logs
kubectl logs <pod-name> -n todo-app
kubectl logs -f <pod-name> -n todo-app  # Follow

# Events
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Resource usage
kubectl top nodes
kubectl top pods -n todo-app

# Service endpoints
kubectl get endpoints -n todo-app

# Port-forward for testing
kubectl port-forward <pod-name> -n todo-app 8000:8000
```

---

_For setup guides, see [README](./README.md)._
