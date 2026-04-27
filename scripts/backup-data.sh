#!/bin/bash
# ═══════════════════════════════════════════
# backup-data.sh
# Creates a timestamped backup of all data files.
#
# Usage: bash scripts/backup-data.sh
# ═══════════════════════════════════════════

BACKUP_DIR="backups/$(date +%Y-%m-%d_%H%M%S)"
DATA_DIR="data"

echo "Creating backup in $BACKUP_DIR ..."

mkdir -p "$BACKUP_DIR"
cp -r "$DATA_DIR"/* "$BACKUP_DIR/"

echo "Backup complete!"
echo "Files backed up:"
ls -la "$BACKUP_DIR"
