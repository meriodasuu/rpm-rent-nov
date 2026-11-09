#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script as root" >&2
  exit 1
fi

. /etc/os-release
if [[ "${ID}" != "ubuntu" ]]; then
  echo "Ubuntu is required; found ${ID}" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
authorized_key_path="${1:-/tmp/rpm-rent-authorized-key}"

if [[ ! -s "${authorized_key_path}" ]]; then
  echo "Public key file is required: ${authorized_key_path}" >&2
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl fail2ban git gnupg jq sudo ufw

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

architecture="$(dpkg --print-architecture)"
cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${VERSION_CODENAME}
Components: stable
Architectures: ${architecture}
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

if ! id deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash deploy
fi
usermod -aG sudo,docker deploy
cat > /etc/sudoers.d/90-rpm-rent-deploy <<'EOF'
deploy ALL=(ALL) NOPASSWD:ALL
EOF
chmod 0440 /etc/sudoers.d/90-rpm-rent-deploy

install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
install -m 0600 -o deploy -g deploy "${authorized_key_path}" /home/deploy/.ssh/authorized_keys
install -d -m 0750 -o deploy -g deploy /opt/rpm-rent

if [[ -f "${script_dir}/sshd-rpm-rent.conf" ]]; then
  install -m 0644 -o root -g root "${script_dir}/sshd-rpm-rent.conf" /etc/ssh/sshd_config.d/00-rpm-rent.conf
  rm -f /etc/ssh/sshd_config.d/99-rpm-rent.conf
  sshd -t
  systemctl reload ssh
fi

if ! swapon --show=NAME --noheadings | grep -q '^/swapfile$'; then
  fallocate -l 2G /swapfile
  chmod 0600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

cat > /etc/sysctl.d/99-rpm-rent.conf <<'EOF'
vm.swappiness=10
EOF
sysctl --system

install -d -m 0755 /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

cat > /etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
port = ssh
maxretry = 5
findtime = 10m
bantime = 1h
EOF

systemctl enable --now docker fail2ban
systemctl restart docker fail2ban

ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

docker --version
docker compose version
ufw status verbose
