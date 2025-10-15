# Daily Cleanup Guide

**🎯 Purpose:** End of day cleanup to save costs and free resources.

**Starting fresh tomorrow?** See [Daily Startup Guide](./daily-startup.md).

---

Quick commands to cleanup after a day's work.

## 🧹 Local Development

### Stop Application

```bash
# Switch to local context
kubectl config use-context docker-desktop

# Uninstall Helm release
helm uninstall todo-app -n todo-app

# Delete namespace (removes all resources)
kubectl delete namespace todo-app

# Verify everything is gone
kubectl get all -n todo-app
```

**Note:** If namespace is stuck in "Terminating":

```bash
kubectl delete namespace todo-app --force --grace-period=0
```

### Stop Docker Desktop

You can now quit Docker Desktop to free up system resources.

---

## ☁️ Azure (AKS)

### Option 1: Keep Running (~$87/month)

If you're actively working on the project:

```bash
# Just close your terminals
# AKS keeps running, data persists
```

**Pros:**

- Instant startup tomorrow
- All data persists
- No re-deployment needed
- Public IP stays the same

**Cons:**

- Costs ~$87/month even when idle
  - $65 AKS cluster
  - $22 Load Balancer + Public IP

### Option 2: Destroy Infrastructure (Recommended)

If you won't work on this for a while:

```bash
cd infrastructure/terraform

# Review what will be deleted
terraform plan -destroy

# Destroy all Azure resources
terraform destroy
```

Type `yes` to confirm. This takes ~5 minutes.

**What gets deleted:**

- AKS cluster
- Load Balancer
- Public IP
- ArgoCD (runs in AKS)
- NGINX Ingress (runs in AKS)
- All data (database, persistent volumes)

**What stays:**

- ACR (Container Registry with images)
- Resource Group

**Pros:**

- No ongoing costs
- Clean slate

**Cons:**

- Takes 5-10 min to recreate tomorrow
- All data is lost (database, persistent volumes)
- Public IP will change (need to update DNS if configured)
- Must reinstall ArgoCD and NGINX Ingress
