# Security Guide — NestJS + React

Covers input validation, auth middleware, and OWASP top-10 mitigations for the stack.

<!-- last-reviewed: 2026-02-26 -->

---

## Input Validation

**Always enable `ValidationPipe` globally** in `main.ts`. Never trust incoming data.

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,       // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,       // auto-cast primitives (string → number)
  }),
);
```

**Define DTOs with `class-validator` decorators:**

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)          // bcrypt silently truncates beyond 72 chars
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;
}
```

**Rules:**
- Use `whitelist: true` — removes extra fields before they reach the service layer.
- Always set `MaxLength` on free-text fields to prevent oversized payloads.
- Validate at the DTO layer, not inside service logic.

---

## Auth Middleware — JWT Guards

Apply guards at the route or controller level. Never rely on client-side role checks alone.

```typescript
// Protected controller
import { UseGuards, Controller, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  listUsers() { ... }
}
```

**JWT configuration rules:**
- Set a short `expiresIn` (`15m`–`1h`); use refresh tokens for long sessions.
- Store `JWT_SECRET` in env only — never hard-code or log it.
- Use `httpOnly`, `secure`, `sameSite: 'strict'` cookie flags when storing tokens in cookies.
- Verify `aud` and `iss` claims when accepting tokens from external issuers.

**Rate-limit auth endpoints** to prevent brute force:

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController { ... }
```

Configure in `AppModule`: `{ ttl: 60, limit: 10 }` (10 attempts per 60 s is a reasonable starting point for login).

---

## OWASP Top-10 Quick Reference

| OWASP Category | Risk | NestJS + React Mitigation |
|---|---|---|
| A01 Broken Access Control | Accessing resources without permission | `JwtAuthGuard` + `RolesGuard` on every route; no client-side-only checks |
| A02 Cryptographic Failures | Plaintext passwords, weak hashes | `bcrypt` (rounds ≥ 12); HTTPS in all envs; never log credentials |
| A03 Injection | SQL / NoSQL / command injection | Use TypeORM query builder / parameterized queries; never string-interpolate into raw SQL |
| A05 Security Misconfiguration | Verbose errors, open CORS, missing headers | `helmet()`, strict CORS origins, disable stack traces in prod |
| A07 Identification & Auth Failures | Credential stuffing, weak tokens | Rate-limit auth routes; `expiresIn` on JWT; lock accounts after N failures |
| A09 Security Logging Failures | No audit trail; leaking PII in logs | Log auth events (login, fail, token refresh); never log passwords or tokens |
| A10 SSRF | Fetching attacker-controlled URLs | Whitelist allowed external hosts; reject private-range IPs in any user-supplied URL |

**Apply `helmet` globally in `main.ts`:**

```typescript
import helmet from 'helmet';
app.use(helmet());
```

**Restrict CORS to known origins:**

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
});
```

**Disable verbose error details in production:**

```typescript
// NestJS global exception filter — never forward error.message in prod
const isProd = process.env.NODE_ENV === 'production';
throw new InternalServerErrorException(isProd ? 'Internal server error' : error.message);
```

---

## React — Client-Side Security

| Rule | Rationale |
|---|---|
| Never store JWT in `localStorage` | Vulnerable to XSS; prefer `httpOnly` cookies |
| Use `dangerouslySetInnerHTML` only with sanitised content (`DOMPurify`) | Prevents stored XSS |
| Do not make auth decisions based on decoded JWT claims alone | Server must re-validate on every request |
| Validate redirect URLs after login | Prevents open redirect attacks |

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| `ValidationPipe` not set globally | Add to `main.ts`; controller-level pipes miss global filters |
| Raw SQL with string interpolation | Use TypeORM `.createQueryBuilder()` with parameters |
| `@Public()` decorator on sensitive routes by mistake | Audit all `@Public` usages before each release |
| JWT secret shared across environments | Use distinct secrets per environment in `.env` files |
| Logging `req.body` at debug level in auth routes | Explicitly exclude auth routes from body logging |

---

## Pre-Release Security Checklist

- [ ] `ValidationPipe` with `whitelist: true` enabled globally
- [ ] All routes behind `JwtAuthGuard` unless explicitly marked `@Public()`
- [ ] `helmet()` applied in `main.ts`
- [ ] CORS restricted to known `ALLOWED_ORIGINS`
- [ ] Auth endpoints rate-limited via `ThrottlerGuard`
- [ ] JWT `expiresIn` ≤ 1 h; refresh token flow implemented
- [ ] No secrets, passwords, or tokens written to logs
- [ ] Raw SQL queries audited — parameterized only
- [ ] `npm audit` run; no high/critical advisories unresolved
