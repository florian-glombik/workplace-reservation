#!/bin/bash

GITHUB_USERNAME="florian-glombik"
GITHUB_TOKEN="${GITHUB_TOKEN}"
REPOSITORY_NAME="workplace-reservation"
VERSION="v1.0.0"
DOCKER_REGISTRY="ghcr.io"

login_to_docker_registry() {
  echo "Authenticating with GitHub Docker Registry..."
  echo "$GITHUB_TOKEN" | docker login $DOCKER_REGISTRY -u $GITHUB_USERNAME --password-stdin
}

build_image() {
  local SERVICE_NAME=$1

  echo "Building $SERVICE_NAME Docker image..."
  docker-compose build --no-cache "$SERVICE_NAME"
}

tag_image() {
  local SERVICE_NAME=$1

  echo "Tagging Docker image..."
  docker tag "$REPOSITORY_NAME-$SERVICE_NAME" $DOCKER_REGISTRY/$GITHUB_USERNAME/$REPOSITORY_NAME/"$SERVICE_NAME":$VERSION
}

push_image() {
  local SERVICE_NAME=$1

  echo "Pushing $SERVICE_NAME Docker image to GitHub Container Registry..."
  docker push $DOCKER_REGISTRY/$GITHUB_USERNAME/$REPOSITORY_NAME/"$SERVICE_NAME":$VERSION

  # Check the exit code of the docker push command
  if [ $? -ne 0 ]; then
    # Error message in red color
    echo -e "\033[0;31mError: Failed to push $SERVICE_NAME Docker image to GitHub Container Registry.\033[0m"
    exit 1  # Exit the script with a non-zero status
  fi

  echo "$SERVICE_NAME Docker image pushed successfully to GitHub Container Registry."
}

build_and_push_image() {
    local SERVICE_NAME=$1

    build_image "$SERVICE_NAME"
    tag_image "$SERVICE_NAME"
    push_image "$SERVICE_NAME"
}

login_to_docker_registry
build_and_push_image server
build_and_push_image client