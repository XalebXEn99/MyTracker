#!/bin/bash
set -e

REPO_URL="git@github.com:XalebXen99/MyTracker.git"

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial MyTracker commit"
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

if command -v gh >/dev/null 2>&1; then
  echo "gh CLI found. Attempting to create repo on GitHub..."
  gh repo create XalebXen99/MyTracker --public --source=. --remote=origin --push || true
else
  echo "gh CLI is not available. Run these commands manually:"
  echo "  git remote add origin $REPO_URL"
  echo "  git push -u origin main"
fi

echo "Visit https://github.com/XalebXen99/MyTracker/actions to monitor the iOS build."