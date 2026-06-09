#!/bin/bash
# Initialize documentation folder for new worktree
# Usage: ./init-doc-for-worktree.sh feature/improve-context

if [ -z "$1" ]; then
    echo "Usage: $0 <branch-name>"
    exit 1
fi

BRANCH_NAME=$1
PREFIX=$(echo "$BRANCH_NAME" | cut -d'/' -f1)    # feature, bug, etc
SUFFIX=$(echo "$BRANCH_NAME" | cut -d'/' -f2-)   # improve-context, fix-context, etc

# Find worktree path for the branch
WORKTREE_PATH=$(git worktree list --porcelain | awk "/^worktree /{path=\$2} /^branch refs\\/heads\\/${BRANCH_NAME//\//\\/}\$/{print path}")

# Determine base directory (worktree path if exists, otherwise current directory)
if [ -n "$WORKTREE_PATH" ]; then
    BASE_DIR="$WORKTREE_PATH"
else
    BASE_DIR="."
fi

# Use prefix if it's feature or bug, otherwise use 'others'
if [[ "$PREFIX" == "feature" || "$PREFIX" == "bug" ]]; then
    DOC_DIR="${BASE_DIR}/docs/${PREFIX}/${SUFFIX}"
else
    DOC_DIR="${BASE_DIR}/docs/others/${SUFFIX}"
fi

# Find template directory relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="${SCRIPT_DIR}/../templates"

mkdir -p "$DOC_DIR"
cp "$TEMPLATE_DIR/checklist.md" "$DOC_DIR/"
cp "$TEMPLATE_DIR/later.md" "$DOC_DIR/"
cp "$TEMPLATE_DIR/code-smells.md" "$DOC_DIR/"

echo "✅ Initialized $DOC_DIR"
