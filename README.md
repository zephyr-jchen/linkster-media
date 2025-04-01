# Linkster - Cloud Native Social Media Platform
Linkster is a cloud-native social media web application developed for the ECE9016 Cloud Computing project. The system allows users to register, create posts with images, comment, like, and view other users' profiles. It is built using Node.js (Express), PostgreSQL (Cloud SQL), and is deployed on Google Kubernetes Engine (GKE) using Kubernetes.

## Features
- User Registration & Login
- Create Posts with Image Upload
- Comment & Like System
- Profile Page with Avatar Upload
- Fully containerized and scalable deployment on GKE
- Production and Development environments separated

## Deployment Overview
1. Enable required GCP Services

`gcloud services enable container.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com iam.googleapis.com`

2. Build and Push Docker Image
`gcloud builds submit --tag gcr.io/[PROJECT-ID]/web-app`

3. Prepare Secrets
`kubectl create secret generic cloudsql-instance-credentials --from-file=credentials.json=your-service-account.json -n [NAMESPACE]`
`kubectl create secret generic db-credentials --from-literal=password=your-db-password -n [NAMESPACE]`

4. Create Cloud SQL Instance and Database
Use the GCP Console to create a PostgreSQL instance and database.

5. Create Cloud Storage Bucket
Use the GCP Console to create a Cloud Storage bucket and connect it to the server.


6. One-Click Deployment
`bash deploy.sh`

This will automatically deploy both development and production environments using the prepared YAML files.
