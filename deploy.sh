#!/bin/bash

echo "======================"
echo "🚀 Starting Full Deployment"
echo "======================"

# Create Namespaces
echo "Creating namespaces..."
kubectl apply -f manifests/namespace.yaml

# Deploy DEV
echo "Deploying DEV environment..."
kubectl apply -f manifests/dev/cloudsql-proxy-deployment.yaml
kubectl apply -f manifests/dev/cloudsql-proxy-service.yaml
kubectl apply -f manifests/dev/web-deployment.yaml
kubectl apply -f manifests/dev/web-service.yaml

# Deploy PROD
echo "Deploying PROD environment..."
kubectl apply -f manifests/prod/cloudsql-proxy-production.yaml
kubectl apply -f manifests/prod/cloudsql-proxy-production-service.yaml
kubectl apply -f manifests/prod/prod-web-app-deployment.yaml
kubectl apply -f manifests/prod/prod-web-service.yaml

# Show Result
echo "======================"
echo "✅ Deployment Finished"
echo "======================"
echo ""
echo "Dev Environment Resources:"
kubectl get all -n dev

echo ""
echo "Prod Environment Resources:"
kubectl get all -n prod
