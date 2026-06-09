# Compile-Time Error Checking Guide for AI Agents

<!-- last-reviewed: 2026-02-26 -->

## Overview

This guide provides a systematic approach for AI agents to verify code changes before committing, helping catch import errors, type errors, and build issues that would otherwise only appear at runtime.

## Why This Matters

Type errors and import mistakes in TypeScript can cause build failures or runtime crashes. Catch them early using the TypeScript compiler and linter.

## When to Run These Checks

**ALWAYS run these checks after**:
1. Creating new TypeScript/TSX files
2. Modifying imports in existing files
3. Adding new dependencies
4. Refactoring module structure
5. Changing types, interfaces, or function signatures

---

## Check 1: TypeScript Type Checking (No Emit)

Run the TypeScript compiler in type-check mode without emitting output:

```bash
# For NestJS backend
npx tsc --noEmit -p tsconfig.json

# For React frontend
npx tsc --noEmit -p tsconfig.json
```

**Expected Output**: No output (silence = success)

**If it fails**: You'll see type errors with file, line, and description.

---

## Check 2: ESLint

Run ESLint on modified files:

```bash
# Check specific files
npx eslint src/modules/user/user.service.ts src/modules/user/user.controller.ts

# Check entire src directory
npx eslint src/ --ext .ts,.tsx
```

**Expected Output**: No output (silence = success)

**If it fails**: You'll see lint errors with rule names and locations.

---

## Check 3: Build Check

Verify the project builds successfully:

```bash
# NestJS backend
npm run build

# React frontend
npm run build
```

**Expected Output**: Build success message with no errors.

---

## Check 4: Test Run (Affected Tests)

Run tests related to modified files:

```bash
# NestJS: run affected tests
npx jest --testPathPattern="user"

# React: run affected tests
npx jest --testPathPattern="UserProfile" --watchAll=false
```

**Expected Output**: All tests pass (`PASS`), no failures.

---

## Complete Verification Script

```bash
#!/bin/bash
# Save as: scripts/verify-changes.sh

set -e  # Exit on first error

echo "=== TypeScript Compile-Time Verification ==="
echo ""

echo "Step 1: TypeScript type checking..."
npx tsc --noEmit -p tsconfig.json
echo "✓ Type checking passed"

echo ""
echo "Step 2: ESLint..."
npx eslint src/ --ext .ts,.tsx
echo "✓ ESLint passed"

echo ""
echo "Step 3: Build..."
npm run build
echo "✓ Build successful"

echo ""
echo "=== ✓ All verification checks passed! ==="
```

---

## Common Errors and Solutions

### Error: `Cannot find module '@/modules/user/user.service' or its corresponding type declarations`

**Cause**: Path alias not configured or wrong path.

**Solution**:
1. Check `tsconfig.json` `paths` configuration
2. Verify the file exists at the expected path
3. Ensure the module is exported correctly

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Error: `Type 'string | undefined' is not assignable to type 'string'`

**Cause**: Strict null checks — optional value used where non-null is expected.

**Solution**:
```typescript
// ❌ Wrong
const name: string = user?.name;

// ✅ Good: provide fallback
const name: string = user?.name ?? 'Unknown';

// ✅ Good: assert non-null when safe
const name: string = user!.name;
```

### Error: `Property 'X' does not exist on type 'Y'`

**Cause**: Accessing a property that doesn't exist on the type.

**Solution**:
1. Check the type definition
2. Add the property to the interface/type
3. Use optional chaining if it may not exist

### Error: `Argument of type 'X' is not assignable to parameter of type 'Y'`

**Cause**: Type mismatch between argument and parameter.

**Solution**:
```typescript
// ❌ Wrong: passing plain object to typed parameter
createUser({ name: 'Alice' });

// ✅ Good: ensure DTO matches expected shape
const dto: CreateUserDto = { name: 'Alice', email: 'alice@example.com' };
createUser(dto);
```

### Error: ESLint `@typescript-eslint/no-unused-vars`

**Cause**: Variable declared but never used.

**Solution**: Remove the unused variable, or prefix with `_` if intentionally unused:
```typescript
// ✅ Intentionally unused parameter
function handler(_event: Event, response: Response) { ... }
```

---

## Pre-Commit Hook

Add to `.git/hooks/pre-commit` or use `husky`:

```bash
#!/bin/bash
echo "Running pre-commit checks..."
npx tsc --noEmit && npx eslint src/ --ext .ts,.tsx
echo "✓ Pre-commit checks passed"
```

**With Husky + lint-staged (recommended)**:
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "tsc --noEmit"]
  }
}
```

---

## CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: npx tsc --noEmit

- name: Lint
  run: npx eslint src/ --ext .ts,.tsx

- name: Build
  run: npm run build

- name: Test
  run: npm test -- --watchAll=false
```

---

## Checklist for AI Agents

After making code changes, verify:

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] ESLint passes with no errors
- [ ] Project builds successfully
- [ ] Affected tests pass
- [ ] All new imports resolve correctly
- [ ] No `any` type used without justification
- [ ] No unused variables or imports

---

## Best Practices

1. **Run type check first** — it catches the most critical errors
2. **Fix type errors before ESLint** — type safety is more important than style
3. **Never suppress errors with `// @ts-ignore` without a comment explaining why**
4. **Avoid `as any`** — use proper types or `unknown` with type guards
5. **Use `--noEmit`** for type checking — don't generate output files during checks
