#!/bin/bash
# Google Cloud Run Deployment Script for DGMD Academy (youtubemakemoneyww.com)

set -e

# Configurable GCP variables
PROJECT_ID=${GCP_PROJECT_ID:-"your-gcp-project-id"}
REGION=${GCP_REGION:-"asia-east1"}
SERVICE_NAME=${GCP_SERVICE_NAME:-"youtubemakemoneyww-app"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🚀 Step 1: Submitting build to Google Cloud Build..."
gcloud builds submit --tag ${IMAGE_NAME} --project=${PROJECT_ID}

echo "☁️ Step 2: Deploying container to Google Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --project=${PROJECT_ID}

echo "✅ Step 3: Domain Mapping Instructions for youtubemakemoneyww.com:"
echo "Run the following command to map your custom domain to this Cloud Run service:"
echo "gcloud beta run domain-mappings create --service=${SERVICE_NAME} --domain=youtubemakemoneyww.com --region=${REGION}"
