# CI/CD Pipeline Setup

Automatic deployment with GitHub Actions.

## 🚀 How it works

When you push to `main` or `dev`:

1. **Build** - Builds Docker images
2. **Push** - Pushes to ACR (tagged with Git SHA + latest)
3. **Deploy** - Restarts pods in AKS with new images

## 🔐 Setup (One-time)

### 1. Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name "github-actions-k8s-todo" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv) \
  --sdk-auth
```

### 2. Copy entire JSON output

### 3. Add to GitHub

- GitHub repo → Settings → Secrets and variables → Actions
- New repository secret
- Name: `AZURE_CREDENTIALS`
- Value: Paste JSON
- Add secret

## 📊 Monitor Deployment

### GitHub Actions

```bash
# Open in browser
https://github.com/YOUR_USERNAME/k8s-todo/actions
```

### Kubernetes

```bash
# Watch pods restart
kubectl get pods -n todo-app -w

# Check logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50
```

## ✅ Verify

```bash
# Pods should show "Running"
kubectl get pods -n todo-app

# Test app
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:80
# Open http://localhost:3000
```
