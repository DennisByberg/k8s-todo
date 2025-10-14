#!/bin/bash

set -e

echo "🚀 Installing ArgoCD in AKS..."

# Create namespace for ArgoCD
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD (using official manifests)
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "⏳ Waiting for ArgoCD pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

echo "✅ ArgoCD installed successfully!"
echo ""
echo "📊 Get initial admin password:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "🌐 Access ArgoCD UI:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "Then open: https://localhost:8080"
echo "Username: admin"