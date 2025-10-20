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

### Stop Kubernetes Cluster

```
Docker Desktop → Kubernetes → Stop
```

### Clean Docker Resources (Optional)

If you want to free up disk space:

```bash
# Stop and remove all running containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -aq) -f

# Remove all volumes
docker volume rm $(docker volume ls -q) -f

# TODO: Remove builds
```

### Stop Docker Desktop

You can now quit Docker Desktop to free up system resources.

---

## ☁️ Azure (AKS)

### Destroy Infrastructure

```bash
cd infrastructure/terraform

# Review what will be deleted
terraform plan -destroy

# Destroy all Azure resources
terraform destroy
```

Type `yes` to confirm. This takes ~5 minutes.

**Verify in Azure Portal:**

After terraform destroy completes, double-check that resources are actually gone.
