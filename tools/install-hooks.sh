#!/bin/sh
# Point git at the versioned hooks directory so the pre-commit drift guard runs.
# Run once per clone, from the repo root:  sh tools/install-hooks.sh
git config core.hooksPath tools/git-hooks
chmod +x tools/git-hooks/pre-commit 2>/dev/null || true
echo "Installed: core.hooksPath -> tools/git-hooks (pre-commit drift guard active)."
