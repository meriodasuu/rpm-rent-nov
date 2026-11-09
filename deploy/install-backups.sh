#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${project_dir}"

chmod 0750 deploy/backup-db.sh
sudo install -m 0644 deploy/rpm-rent-backup.service /etc/systemd/system/rpm-rent-backup.service
sudo install -m 0644 deploy/rpm-rent-backup.timer /etc/systemd/system/rpm-rent-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now rpm-rent-backup.timer
sudo systemctl start rpm-rent-backup.service

echo "Local backup timer installed and initial backup completed"
