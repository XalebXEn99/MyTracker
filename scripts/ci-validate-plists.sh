#!/bin/bash
# ci-validate-plists.sh - Minimal CI validation wrapper
# 
# This script is intended for use in GitHub Actions or other CI environments.
# It runs the plist validation and fails the job if any issues are found.
#
# Usage in GitHub Actions:
#   - name: Validate plists
#     run: bash scripts/ci-validate-plists.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "::group::Plist Validation"
if bash "$SCRIPT_DIR/fix_plists.sh"; then
    echo "✅ Plist validation passed"
    echo "::endgroup::"
    exit 0
else
    EXIT_CODE=$?
    echo "❌ Plist validation failed (exit code: $EXIT_CODE)"
    echo "::endgroup::"
    exit $EXIT_CODE
fi
