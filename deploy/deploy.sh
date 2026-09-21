#!/bin/bash
# ============================================================
# DJMAudio Frontend v2 - VPS Deploy Script
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
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/opt/djm-frontend-v2}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  DJMAudio Frontend v2 - Deployment${NC}"
echo -e "${GREEN}============================================${NC}"

# ── Validation ─────────────────────────────────────────────
if [ "$VPS_HOST" = "YOUR_VPS_IP" ]; then
    echo -e "${RED}ERROR: Set VPS_HOST environment variable first!${NC}"
    echo "  export VPS_HOST=123.456.789.0"
    echo "  bash deploy/deploy.sh"
    exit 1
fi

echo -e "${YELLOW}[1/5] Stopping old Streamlit app to free up the routing...${NC}"
# The old app was running under /opt/djmaudio-inventory
ssh "${VPS_USER}@${VPS_HOST}" "
    if [ -d /opt/djmaudio-inventory ]; then
        cd /opt/djmaudio-inventory
        docker compose stop djm-web || true
        docker compose rm -f djm-web || true
    fi
"

echo -e "${YELLOW}[2/5] Syncing project to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${REMOTE_DIR}"

rsync -avz --delete \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'node_modules' \
    --exclude '.env.local' \
    --exclude '.DS_Store' \
    "$PROJECT_DIR/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo -e "${YELLOW}[3/5] Checking for .env.local on server...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    if [ ! -f ${REMOTE_DIR}/.env.local ]; then
        echo '⚠️  No .env.local file found on server!'
        echo '   Creating a blank one...'
        touch ${REMOTE_DIR}/.env.local
    fi
"

echo -e "${YELLOW}[4/5] Building Next.js Docker image...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${REMOTE_DIR}
    docker compose build
"

echo -e "${YELLOW}[5/5] Starting Next.js services...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${REMOTE_DIR}
    docker compose up -d
"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ DJMAudio Frontend v2 Deployment complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Monitor logs:  ssh ${VPS_USER}@${VPS_HOST} 'cd ${REMOTE_DIR} && docker compose logs -f'"
echo "  Stop services: ssh ${VPS_USER}@${VPS_HOST} 'cd ${REMOTE_DIR} && docker compose down'"
echo ""
