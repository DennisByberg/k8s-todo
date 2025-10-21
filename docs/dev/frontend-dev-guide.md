# Frontend Development Guide

**For frontend developers** - Work with hot reload, backend runs in Kubernetes.

---

## Prerequisites

- Docker Desktop running with Kubernetes enabled
- Node.js 20+

---

## Quick Start

### 1. Start Backend Stack

```bash
# From project root
cd ~/dev/k8s-todo

# Switch to local K8s
kubectl config use-context docker-desktop

# Build images
docker build -t todo-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker build -t todo-frontend:latest -f infrastructure/docker/frontend/Dockerfile .

# Deploy
helm upgrade --install todo-app infrastructure/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set imageRegistry="" \
  --set backend.image.pullPolicy=IfNotPresent \
  --set frontend.image.pullPolicy=IfNotPresent

# Wait until all pods are Running (1/1)
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` when ready.

### 2. Port-Forward Backend (New Terminal)

```bash
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000
```

Keep this running!

### 3. Start Frontend Dev Server (New Terminal)

```bash
cd frontend
npm install  # First time only
npm run dev
```

**Open:** http://localhost:3000

---

## Development

### Make Changes

Edit files in `frontend/` → Browser auto-reloads! 🔥

## Deploy to Production

```bash
git add .
git commit -m "feat: add header"
git push origin main
```
