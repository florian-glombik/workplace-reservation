#!/bin/bash

# Variables
# Read variables from environment
GITHUB_USERNAME="florian-glombik"
GITHUB_TOKEN="${GITHUB_TOKEN}"
REPOSITORY_NAME="workplace-reservation"
SERVER_IMAGE_NAME="server"
CLIENT_IMAGE_NAME="client"
VERSION="v1.0.0"

# Authenticate with GitHub Docker Registry
echo "Authenticating with GitHub Docker Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Build the Docker image
echo "Building server Docker image..."
docker build -t $SERVER_IMAGE_NAME:$VERSION ./server

# Tag the Docker image
echo "Tagging Docker image..."
docker tag $SERVER_IMAGE_NAME:$VERSION ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$SERVER_IMAGE_NAME:$VERSION

# Push the Docker image to GitHub Container Registry
echo "Pushing server Docker image to GitHub Container Registry..."
docker push ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$SERVER_IMAGE_NAME:$VERSION

echo "Server Docker image pushed successfully to GitHub Container Registry."

# Build the Docker image
echo "Building client Docker image..."
docker build -t $CLIENT_IMAGE_NAME:$VERSION ./webapp

# Tag the Docker image
echo "Tagging Docker image..."
docker tag $CLIENT_IMAGE_NAME:$VERSION ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$CLIENT_IMAGE_NAME:$VERSION

# Push the Docker image to GitHub Container Registry
echo "Pushing client Docker image to GitHub Container Registry..."
docker push ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$CLIENT_IMAGE_NAME:$VERSION

echo "Client Docker image pushed successfully to GitHub Container Registry."