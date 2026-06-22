#!/usr/bin/env bash
#
# setup-vps.sh — one-time idempotent VPS provisioning for itityl.ru.
#
# What it sets up (in order):
#   1. PostgreSQL 16 (via apt) — local instance, ident auth disabled
#      for our user, password auth via /etc/itityl-api.env DATABASE_URL.
#   2. Database `itityl` + role `itityl_api` with a randomly generated
#      password (only generated on first run; rerun won't rotate it).
#   3. /etc/itityl-api.env — root-readable env file consumed by the
#      api-server systemd unit. Pre-populated with DATABASE_URL +
#      PORT; admin must hand-fill TELEGRAM_*, SMTP_*, LEAD_EMAIL_*.
#   4. systemd unit `itityl-api.service` — runs the built api-server
#      under the same SSH user that pulls the repo.
#   5. nginx — adds an `/api/` → http://127.0.0.1:3000/api/ proxy block
#      to the existing itityl.ru server block. Idempotent: re-running
#      patches the same marker comment, doesn't append twice.
#   6. drizzle-kit push — applies the current schema to the DB.
#
# Re-run safe: every step checks current state before mutating. You can
# rerun after pulling new code; it will only touch what changed.
#
# Required env on invocation:
#   APP_DIR    — absolute path to the repo on the VPS (e.g. ~/ittool).
#                Defaults to /home/$SUDO_USER/ittool when run via sudo.
#   APP_USER   — Unix user that owns the repo and runs the api-server.
#                Defaults to $SUDO_USER.
#   NGINX_VHOST — path to the nginx server-block file to patch.
#                Defaults to /etc/nginx/sites-enabled/itityl.ru.
#
# Run as root (or via sudo).

set -euo pipefail

# ── 0. Sanity ────────────────────────────────────────────────────────

if [[ "${EUID}" -ne 0 ]]; then
  echo "setup-vps.sh must run as root (use sudo)" >&2
  exit 1
fi

APP_USER="${APP_USER:-${SUDO_USER:-root}}"
APP_DIR="${APP_DIR:-/home/${APP_USER}/ittool}"
NGINX_VHOST="${NGINX_VHOST:-/etc/nginx/sites-enabled/itityl.ru}"
ENV_FILE="/etc/itityl-api.env"
SERVICE_FILE="/etc/systemd/system/itityl-api.service"
DB_NAME="itityl"
DB_USER="itityl_api"
API_PORT="3000"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "APP_DIR (${APP_DIR}) does not exist — checkout the repo there first." >&2
  exit 1
fi

echo "==> Using APP_DIR=${APP_DIR}, APP_USER=${APP_USER}, NGINX_VHOST=${NGINX_VHOST}"

# ── 1. PostgreSQL ────────────────────────────────────────────────────

if ! command -v psql >/dev/null 2>&1; then
  echo "==> Installing PostgreSQL 16"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-16
fi
systemctl enable --now postgresql

# ── 2. DB + role ─────────────────────────────────────────────────────

DB_PASSWORD=""
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  echo "==> DB role ${DB_USER} already exists; reusing existing credentials"
  # If env file exists, reuse the password from it (don't rotate).
  if [[ -f "${ENV_FILE}" ]]; then
    DB_PASSWORD="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | sed -n 's#.*://[^:]*:\([^@]*\)@.*#\1#p' || true)"
  fi
else
  DB_PASSWORD="$(openssl rand -hex 24)"
  echo "==> Creating DB role ${DB_USER}"
  sudo -u postgres psql <<SQL
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
SQL
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  echo "==> Creating DB ${DB_NAME}"
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

# Always ensure schema-level privileges (cheap, idempotent).
sudo -u postgres psql -d "${DB_NAME}" <<SQL >/dev/null
GRANT ALL ON SCHEMA public TO ${DB_USER};
SQL

# ── 3. /etc/itityl-api.env ───────────────────────────────────────────

if [[ ! -f "${ENV_FILE}" ]]; then
  if [[ -z "${DB_PASSWORD}" ]]; then
    echo "DB password unknown and ${ENV_FILE} doesn't exist — cannot proceed." >&2
    echo "Either drop the role with: DROP USER ${DB_USER}; and rerun, or hand-write the env." >&2
    exit 1
  fi
  echo "==> Writing ${ENV_FILE} (chmod 600, root-only). Fill in placeholders before starting the service."
  install -m 600 -o root -g root /dev/null "${ENV_FILE}"
  cat > "${ENV_FILE}" <<ENV
# itityl-api.service environment — DO NOT commit. chmod 600.
PORT=${API_PORT}
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}

# Telegram lead delivery (required to actually receive leads in chat).
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Email fallback (Yandex 360 SMTP for pochta@i-tityl.ru).
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=pochta@i-tityl.ru
SMTP_PASS=
LEAD_EMAIL_TO=pochta@i-tityl.ru
LEAD_EMAIL_FROM=pochta@i-tityl.ru

# CORS origin for the public site (no trailing slash).
ALLOWED_ORIGIN=https://itityl.ru
ENV
else
  echo "==> ${ENV_FILE} already present; leaving in place. Edit by hand to update keys."
fi

# ── 4. systemd unit ──────────────────────────────────────────────────

API_SERVER_DIR="${APP_DIR}/artifacts/api-server"
NODE_BIN="$(command -v node || echo /usr/bin/node)"

cat > "${SERVICE_FILE}" <<UNIT
[Unit]
Description=Itityl API (Express)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${API_SERVER_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=${NODE_BIN} --enable-source-maps ./dist/index.mjs
Restart=on-failure
RestartSec=3
# Limit log spam in journalctl — pino-pretty writes plenty.
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable itityl-api.service >/dev/null

# ── 5. nginx /api/ proxy ─────────────────────────────────────────────

if [[ ! -f "${NGINX_VHOST}" ]]; then
  echo "WARNING: ${NGINX_VHOST} not found — skipping nginx patch. Add the /api/ proxy block manually." >&2
else
  MARKER="# >>> itityl-api proxy (managed by setup-vps.sh) >>>"
  if ! grep -qF "${MARKER}" "${NGINX_VHOST}"; then
    echo "==> Patching ${NGINX_VHOST} with /api/ proxy block"
    # Insert proxy block just before the closing `}` of the LAST
    # server block. sed magic: append before the final `}` line.
    PROXY_BLOCK=$(cat <<NGINX

    ${MARKER}
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        client_max_body_size 1m;
    }
    # <<< itityl-api proxy <<<

NGINX
)
    # Use python for safe, deterministic in-place insertion before the
    # last `}` — sed-based attempts are fragile on multi-server-block files.
    python3 - "$NGINX_VHOST" <<PY
import pathlib, sys
p = pathlib.Path(sys.argv[1])
text = p.read_text()
block = '''${PROXY_BLOCK//$'\n'/\\n}'''
# Find last closing brace and insert block before it.
idx = text.rstrip().rfind('}')
if idx < 0:
    sys.exit("No '}' found in nginx vhost — refusing to patch")
new = text[:idx] + block + text[idx:]
p.write_text(new)
print(f"Patched {p}")
PY
    nginx -t
    systemctl reload nginx
  else
    echo "==> ${NGINX_VHOST} already has the proxy block; skipping"
  fi
fi

# ── 6. drizzle schema push ───────────────────────────────────────────

echo "==> Pushing DB schema via drizzle-kit"
DATABASE_URL="postgresql://${DB_USER}:$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | sed -n 's#.*://[^:]*:\([^@]*\)@.*#\1#p')@127.0.0.1:5432/${DB_NAME}" \
  sudo -u "${APP_USER}" --preserve-env=DATABASE_URL bash -c "cd ${APP_DIR} && pnpm -C lib/db run push-force"

# ── 7. Build + start api-server ──────────────────────────────────────

echo "==> Building api-server"
sudo -u "${APP_USER}" bash -c "cd ${APP_DIR} && pnpm install --frozen-lockfile && pnpm -C artifacts/api-server run build"

echo "==> (Re)starting itityl-api.service"
systemctl restart itityl-api.service
systemctl --no-pager status itityl-api.service | head -12 || true

cat <<DONE

==========================================================================
Setup complete.

Next steps:
  1. Edit ${ENV_FILE} and fill in TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
     SMTP_PASS. Save, then:  systemctl restart itityl-api.service
  2. Test with:  curl -sS https://itityl.ru/api/healthz
  3. Submit a real form on https://itityl.ru — lead should land in
     Telegram + email within ~2s.
==========================================================================
DONE
