#!/bin/bash

GITHUB_USERNAME="florian-glombik"
GITHUB_TOKEN="${GITHUB_TOKEN}"
REPOSITORY_NAME="workplace-reservation"
SERVER_IMAGE_NAME="server"
CLIENT_IMAGE_NAME="client"
VERSION="v1.0.0"

login_to_docker_registry() {
  echo "Authenticating with GitHub Docker Registry..."
  echo "$GITHUB_TOKEN" | docker login $DOCKER_REGISTRY -u $GITHUB_USERNAME --password-stdin
}

build_and_push_image() {
  local IMAGE_NAME=$1
  local IMAGE_DIR=$2

  echo "Building $IMAGE_NAME Docker image..."
  docker build -t "$IMAGE_NAME":$VERSION $IMAGE_DIR

  echo "Tagging Docker image..."
  docker tag "$IMAGE_NAME":$VERSION ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$IMAGE_NAME:$VERSION

  echo "Pushing $IMAGE_NAME Docker image to GitHub Container Registry..."
  docker push ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME/$IMAGE_NAME:$VERSION

  echo "$IMAGE_NAME Docker image pushed successfully to GitHub Container Registry."
}

login_to_docker_registry
build_and_push_image $SERVER_IMAGE_NAME ./server
build_and_push_image $CLIENT_IMAGE_NAME ./webapp