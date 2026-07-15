#!/bin/bash
# ============================================================
# DJMAudio Inventory & Bot - VPS Deploy Script
# ============================================================
# Run from your LOCAL machine (Mac) to push code to VPS:
#   bash deploy/deploy.sh
#
# Prerequisites:
#   1. VPS setup complete (Docker + Docker Compose installed)
#   2. SSH key configured for VPS
#   3. export VPS_HOST="your_vps_ip"
# ============================================================

set -euo pipefail

# ── Configuration ──────────────────────────────────────────
VPS_HOST="${VPS_HOST:-YOUR_VPS_IP}"
VPS_USER="${VPS_USER:-deploy}"
REMOTE_DIR="${REMOTE_DIR:-/opt/djmaudio-inventory}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  DJMAudio Inventory - Deployment${NC}"
echo -e "${GREEN}============================================${NC}"

# ── Validation ─────────────────────────────────────────────
if [ "$VPS_HOST" = "YOUR_VPS_IP" ]; then
    echo -e "${RED}ERROR: Set VPS_HOST environment variable first!${NC}"
    echo "  export VPS_HOST=123.456.789.0"
    echo "  bash deploy/deploy.sh"
    exit 1
fi

echo -e "${YELLOW}[1/4] Syncing project to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${REMOTE_DIR}"

rsync -avz --delete \
    --exclude '.venv' \
    --exclude '.git' \
    --exclude '.streamlit/secrets.toml' \
    --exclude 'bot_memory.db' \
    --exclude 'cloudflare.log' \
    --exclude 'server.log' \
    --exclude 'run.log' \
    --exclude '__pycache__' \
    --exclude '.DS_Store' \
    "$PROJECT_DIR/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo -e "${YELLOW}[2/4] Checking for secrets.toml on server...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    if [ ! -f ${REMOTE_DIR}/.streamlit/secrets.toml ]; then
        echo '⚠️  No secrets.toml file found on server!'
        echo '   Creating directory and copying template...'
        mkdir -p ${REMOTE_DIR}/.streamlit
        echo 'Please upload your secrets.toml file to: ${REMOTE_DIR}/.streamlit/secrets.toml'
        exit 1
    fi
    echo '  ✅ secrets.toml file exists'
"

echo -e "${YELLOW}[3/4] Building Docker images...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${REMOTE_DIR}
    docker compose build --no-cache
"

echo -e "${YELLOW}[4/4] Starting services...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${REMOTE_DIR}
    docker compose up -d
"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ DJMAudio Deployment complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Monitor logs:  ssh ${VPS_USER}@${VPS_HOST} 'cd ${REMOTE_DIR} && docker compose logs -f'"
echo "  Stop services: ssh ${VPS_USER}@${VPS_HOST} 'cd ${REMOTE_DIR} && docker compose down'"
echo ""
