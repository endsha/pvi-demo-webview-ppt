# Naming Convention

<!-- last-reviewed: 2026-02-26 -->

## Variables & Functions
- Use `camelCase` for variable and function names
- Use `_` prefix for private class members (e.g., `_privateField`)

## Classes, Interfaces & Types
- Use `PascalCase` for class, interface, type alias, and enum names
- Prefix interfaces with `I` only if the codebase convention requires it (e.g., `IUserService`)

## Generic Type Parameters
- Use `T` as a single generic parameter (e.g., `function identity<T>(value: T): T`)
- Use descriptive `T`-prefixed names when multiple or domain-specific generics are needed (e.g., `TEntity`, `TResult`, `TKey`)
- Avoid single-letter generics beyond `T` (e.g., prefer `TValue` over `V`)

## Constants
- Use `UPPER_SNAKE_CASE` for module-level constants (e.g., `MAX_RETRY_COUNT`)

## Enum Members
- Use `PascalCase` for enum members (e.g., `UserRole.AdminUser`, `Status.NotFound`)

## React Components
- Use `PascalCase` for component names and their files (e.g., `UserProfile.tsx`)

## Files & Directories
- Use `kebab-case` for file and directory names (e.g., `user-profile.service.ts`)
- Exception: React component files use `PascalCase` (e.g., `UserProfile.tsx`)

## Test Files
- Mirror the source file name with a `.spec.ts` suffix (e.g., `user.service.spec.ts`, `UserProfile.spec.tsx`)
- Place test files alongside the source file they test (co-location) or under a `__tests__` directory at the same level
- E2E test files use `.e2e-spec.ts` suffix (e.g., `auth.e2e-spec.ts`)

## NestJS Conventions
- Services: `user.service.ts` → class `UserService`
- Controllers: `user.controller.ts` → class `UserController`
- Modules: `user.module.ts` → class `UserModule`
- DTOs: `create-user.dto.ts` → class `CreateUserDto`
- Entities: `user.entity.ts` → class `User`

## General Guideline
- When changing scope/purpose from private to public or vice versa, rename accordingly (remove or add `_` prefix)
- Avoid abbreviations unless widely understood (e.g., `dto`, `id`, `url`)
