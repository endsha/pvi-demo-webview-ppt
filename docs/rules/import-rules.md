# TypeScript Import Guidelines

<!-- last-reviewed: 2026-02-26 -->

## Import Order
1. Node built-in modules (e.g., `path`, `fs`)
2. External/third-party packages (e.g., `react`, `@nestjs/common`)
3. Internal aliases / absolute imports (e.g., `@/modules/user`)
4. Relative imports (e.g., `./user.service`)
5. Type-only imports (`import type { ... }`)
6. Blank line between each group

```typescript
// Node built-in
import * as path from 'path';

// External packages
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Internal absolute (path alias)
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateUserDto } from '@/dto/create-user.dto';

// Relative
import { hashPassword } from './utils/hash';

// Type-only
import type { UserResponse } from './types';
```

## Named Exports vs Default Exports

### Prefer Named Exports
- Easier to refactor (IDEs track named exports)
- Avoids accidental aliasing
- Consistent across files

```typescript
// ✅ Good: Named export
export class UserService {}
export const MAX_USERS = 100;

// ❌ Avoid: Default export for services/utilities
export default UserService;
```

### Default Exports: React Components Only
```typescript
// ✅ Acceptable for React components (framework convention)
export default function UserProfile() { ... }
```

## Barrel Files (index.ts)

Use barrel files to group related exports from a module:

```typescript
// modules/user/index.ts
export { UserModule } from './user.module';
export { UserService } from './user.service';
export type { CreateUserDto } from './dto/create-user.dto';
```

**Avoid deep barrel chains** — they slow down bundlers and create circular dependency risks.

## Path Aliases (tsconfig.json)

Always use absolute path aliases for cross-module imports:

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

```typescript
// ✅ Correct: absolute alias
import { UserService } from '@/modules/user/user.service';

// ❌ Wrong: deep relative traversal
import { UserService } from '../../../modules/user/user.service';
```

## Type-Only Imports

Use `import type` for imports used only as type annotations — not emitted at runtime:

```typescript
import type { Prisma } from '@prisma/client';

function createUserArgs(args: Prisma.UserCreateArgs) { ... }
```

## Common Mistakes

### ❌ Don't: Re-import the same module in multiple places
```typescript
// file-a.ts
import { UserService } from './user.service';

// file-b.ts
import { UserService } from './user.service'; // fine, but avoid circular imports
```

### ✅ Do: Import once per file and reuse
```typescript
import { UserService } from '@/modules/user/user.service';
// Use UserService throughout the file
```

### ❌ Don't: Mix import styles inconsistently
```typescript
import UserService from './user.service';  // default
import { UserRepository } from './user.service';  // named — confusing
```

### ✅ Do: Use named exports consistently
```typescript
import { UserService, UserRepository } from './user.service';
```

## NestJS-Specific

Always import NestJS decorators and utilities from `@nestjs/*`:
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
```

## React-Specific

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';

// Component imports: folder-per-component with index.ts (see react-component-patterns.md)
import UserProfile from '@/components/UserProfile';
import { Button } from 'antd';
```
