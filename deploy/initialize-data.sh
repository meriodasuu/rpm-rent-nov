#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --env-file .env.production -f compose.production.yml)

cd "${project_dir}"

if [[ ! -s import/db.json ]]; then
  echo "import/db.json is required for the production data migration" >&2
  exit 1
fi

"${compose[@]}" run --rm tools pnpm import:file-db /import/db.json

echo "Initial production data import completed"
