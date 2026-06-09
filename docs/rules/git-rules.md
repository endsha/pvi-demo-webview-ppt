# Git Workflow Guide

<!-- last-reviewed: 2026-02-26 -->

Quick reference for common Git workflows in this project.

## Preparing Feature Branch for Merge Request

### Standard Workflow (Rebase)

```bash
# 1. Check current status
git status

# 2. Handle uncommitted changes
# Option A: Commit them
git add .
git commit -m "feat: your message"

# Option B: Stash them (keep local, don't commit)
git stash push -m "local changes - keep uncommitted" src/path/to/file.ts

# Option C: Ignore them (for cache files)
echo "*.cache" >> .gitignore
git add .gitignore
git commit -m "chore: add cache files to .gitignore"

# 3. Fetch latest changes
git fetch origin

# 4. Rebase onto develop
git pull origin develop --rebase

# 5. Resolve conflicts (if any)
# Edit conflicted files, then:
git add <resolved-file>
git rebase --continue

# 6. Force push (safely)
# --force-with-lease checks if remote branch has changed since your last fetch
# If someone else pushed to the branch, it will reject the push
git push origin your-branch --force-with-lease

# If above fails with "stale info" error:
# Someone else pushed to your branch - fetch and rebase first
git fetch origin
git rebase origin/your-branch  # Rebase your commits on top of remote
git push origin your-branch --force-with-lease

# 7. Create MR via GitLab UI
```

### Shared Branch Safety

**`--force-with-lease` behavior:**
- Checks if remote changed since your last fetch
- Rejects push if teammate pushed (prevents overwriting their work)
- Safer than `--force` which blindly overwrites

**If force-with-lease fails:**
```bash
git fetch origin
git rebase origin/your-branch  # Rebase on teammate's changes
git push origin your-branch --force-with-lease
```

## Worktrees

### Creating Worktrees
```bash
# Create worktree in .worktrees (ignored by .gitignore)
git worktree add .worktrees/feature/new-feature feature/new-feature

# Copy .env file to worktree
cp .env .worktrees/feature/new-feature/

# Initialize docs folder (automatically creates in target worktree)
docs/guideline/scripts/init-doc-for-worktree.sh feature/new-feature

# List worktrees
git worktree list

# Remove worktree
git worktree remove .worktrees/feature/new-feature
```

**Worktree Organization:**
- All worktrees stored in `.worktrees/` directory
- Use subfolders matching branch prefix: `feature/` → `.worktrees/feature/`, `bug/` → `.worktrees/bug/`
- `.worktrees/` is gitignored

## Common Operations

### Stash Management
```bash
git stash push -m "description" src/path/to/file.ts  # Stash specific file
git stash list                           # View stashes
git stash pop                            # Apply and remove latest stash
git stash apply stash@{0}                # Apply specific stash
```

### Viewing Changes
```bash
git status                    # See what changed
git diff                      # See actual changes
git log --oneline -10         # View recent commits
```

### Undoing Changes
```bash
git restore src/path/to/file.ts  # Discard changes in file
git reset --soft HEAD~1       # Undo last commit (keep changes)
```

## Rebase vs Merge

**Use Rebase** (recommended for feature branches):
- Clean, linear history
- Before creating MR
- Command: `git pull origin develop --rebase`

**Use Merge** (for team branches):
- Safer, preserves history
- When in doubt
- Command: `git pull origin develop --no-rebase`

## Commit Message Format

```
<type>: <description>

Types: feat, fix, docs, chore, refactor, test
```

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve null pointer in API"
git commit -m "chore: update dependencies"
```

## After Squash Merge to Develop

When your MR is squash-merged to develop and you want to add more commits:

### Quick Decision

**Option A: Clean history** (like deleting/recreating branch with same name)
```bash
# 1. Identify new commits (not yet in develop)
git log origin/develop..HEAD --oneline

# 2. Reset to develop and cherry-pick new commits
git reset --hard origin/develop
git cherry-pick <new-commit-hash>  # Or multiple hashes

# 3. Force push
git push origin <branch-name> --force-with-lease
```

**Option B: Keep history** (new branch, no force push)
```bash
# Create new branch from develop with only new commits
git checkout -b <branch-name>-v2
git cherry-pick <new-commit-hash>
git push origin <branch-name>-v2
```

**When to use:**
- **Option A**: You own the branch, want clean history
- **Option B**: Shared branch or want to preserve history

## Best Practices

1. **Always check status first**: `git status`
2. **Commit often**: Small, logical commits
3. **Sync regularly**: Don't let branch get too far behind
4. **Never force push** to `develop` or `main`
5. **Use `--force-with-lease`** instead of `--force`

## Troubleshooting

### Abort Rebase
```bash
git rebase --abort
```

### Recover from Mistakes
```bash
git reflog                    # Find lost commits
git reset --hard HEAD@{1}     # Go back to previous state
```

### Clean Working Directory
```bash
git stash                     # Stash all changes
git clean -fd                 # Remove untracked files
```
