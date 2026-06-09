# Error Handling — Quick Reference

<!-- last-reviewed: 2026-02-26 -->

Critical guide for consistent error handling across the system (NestJS backend + React frontend).

> For detailed patterns (Sentry setup, custom exceptions, service/tool/controller/DB/LLM patterns, global filter, React), see `./error-handling-patterns.md`.

## Quick Reference

```typescript
import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';

const logger = new Logger('ServiceName');

// Basic NestJS service pattern
try {
  const result = await someOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', error.stack, { context: { id } });
  Sentry.captureException(error);
  throw new InternalServerErrorException('Operation failed');
}
```

## Best Practices

1. **Always log with `error.stack`** for full stack traces in NestJS
2. **Use custom exceptions** for domain-specific errors with meaningful codes
3. **Never log sensitive data** — use sanitization helpers
4. **Include `conversationId`** in all error contexts for tracing
5. **Return user-friendly messages** — never expose internal details
6. **Use Sentry scope** for adding context to captured exceptions
7. **Test error scenarios** — verify Sentry capture and logging
8. **Monitor error rates** — set up Sentry dashboards

## Common Pitfalls

**Don't:**
```typescript
// Swallowing exceptions
try {
  await operation();
} catch {
  // Silent failure — NEVER DO THIS
}

// Logging sensitive data
logger.error(`Failed login: password=${password}`);

// Returning raw error to client
throw error; // may expose stack traces / internal details
```

**Do:**
```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error.stack, { operationId });
  Sentry.captureException(error);
  throw new InternalServerErrorException('Operation failed. Please try again.');
}
```
