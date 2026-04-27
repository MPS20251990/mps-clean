#!/bin/bash
# ===============================================
# deploy-check.sh
# Pre-deploy validation script.
# Checks for required files and valid JSON.
#
# Usage: bash scripts/deploy-check.sh
# ===============================================

ERRORS=0

echo "Running pre-deploy checks..."
echo "=============================="

# Check required files exist
REQUIRED_FILES=("index.html" "netlify.toml" "data/reviews.json" "data/services.json" "assets/css/style.css" "assets/js/main.js")

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
      echo "MISSING: $file"
          ERRORS=$((ERRORS + 1))
            else
                echo "OK: $file"
                  fi
                  done

                  # Validate JSON files
                  JSON_FILES=("data/reviews.json" "data/reviews-pending.json" "data/services.json" "data/service-areas.json")

                  for file in "${JSON_FILES[@]}"; do
                    if [ -f "$file" ]; then
                        if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
                              echo "VALID JSON: $file"
                                  else
                                        echo "INVALID JSON: $file"
                                              ERRORS=$((ERRORS + 1))
                                                  fi
                                                    fi
                                                    done

                                                    echo ""
                                                    if [ $ERRORS -eq 0 ]; then
                                                      echo "All checks passed. Ready to deploy!"
                                                        exit 0
                                                        else
                                                          echo "$ERRORS error(s) found. Fix before deploying."
                                                            exit 1
                                                            fi
