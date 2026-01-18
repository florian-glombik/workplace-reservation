#!/bin/bash

registryUrl="ghcr.io/florian-glombik/workplace-reservation"

handle_error() {
  if [[ "$1" == *"403 Forbidden"* ]]; then
    echo "Error: Authorization failed while trying to push the image."
    echo "This is likely due to missing or insufficient permissions for the Personal Access Token (PAT)."
    echo "To resolve this issue, follow these steps:"
    echo "1. Go to https://github.com/settings/tokens to create a new Personal Access Token."
    echo "2. Select the following scopes:"
    echo "   - write:packages (to push packages)"
    echo "   - read:packages (to pull packages)"
    echo "   - repo (if the repository is private)"
    echo "3. Copy the generated token."
    echo "4. Authenticate Docker with the new token by running:"
    echo "   echo <YOUR_PERSONAL_ACCESS_TOKEN> | docker login ghcr.io -u <YOUR_GITHUB_USERNAME> --password-stdin"
    echo "5. Retry the build and push process."
  else
    echo "Error: $1"
  fi
  keep_shell_alive
  exit 1
}

keep_shell_alive() {
  # Check if running on Windows and keep the shell alive (would otherwise close immediately)
  if [[ "$OSTYPE" == "msys" ]]; then
    bash
  fi
}

build_and_push_image() {
  local directory="$1"
  local image_name="$2"

  cd "$directory" || {
    handle_error "Could not change directory to '$directory'"
  }

  docker build --platform=linux/amd64 -t "$image_name" . || {
    handle_error "Could not build image '$image_name'"
  }
  docker push "$image_name" || {
    handle_error "$(docker push "$image_name" 2>&1)"
  }

  cd ..
}

enter_version() {
  while true; do
    read -p "Enter the current version (e.g. '1.0.4'): " current_version
    read -p "You entered '$current_version'. Is this correct? (y/n): " confirm
    case $confirm in
      [Yy]* ) break;;
      [Nn]* ) echo "Please enter the version again.";;
      * ) echo "Please answer yes or no.";;
    esac
  done
  echo "Current version: $current_version"
}

enter_version

# -z ensures that if only release.sh is executed webapp and server images are built and uploaded
if [ "$1" = "webapp" ] || [ -z "$1" ]; then
  echo "Building and pushing webapp image..."
  build_and_push_image "webapp" "$registryUrl/client:$current_version"
fi

if [ "$1" = "server" ] || [ -z "$1" ]; then
  echo "Building and pushing server image..."
  build_and_push_image "server" "$registryUrl/server:$current_version"
fi

echo "Applying release completed at $(date)"