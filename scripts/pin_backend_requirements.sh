#!/usr/bin/env bash
set -euo pipefail

# Pins backend dependencies to exact versions from the backend container runtime.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

docker compose run --rm backend python -m pip freeze | sort > backend/requirements.txt

echo "Pinned backend requirements written to backend/requirements.txt"
