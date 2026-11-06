#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --env-file .env.production -f compose.production.yml)

cd "${project_dir}"

if [[ ! -s .env.production ]]; then
  echo ".env.production is required" >&2
  exit 1
fi

"${compose[@]}" config --quiet

if "${compose[@]}" ps --services --status running | grep -qx db; then
  deploy/backup-db.sh
fi

"${compose[@]}" build tools app
"${compose[@]}" run --rm --no-deps --user root --entrypoint sh app -c 'chown -R nextjs:nodejs /app/media'
"${compose[@]}" up -d db
"${compose[@]}" run --rm tools pnpm prisma:deploy
"${compose[@]}" up -d app telegram caddy
"${compose[@]}" ps

echo "Application deployment completed"
