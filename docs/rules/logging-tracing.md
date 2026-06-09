# Logging & Tracing

<!-- last-reviewed: 2026-02-26 -->

## Log-Level Decision Guide

| Condition | Level | Example |
|---|---|---|
| Normal operational flow | `log` | User logged in, record fetched |
| Recoverable / unexpected but non-fatal | `warn` | Retry attempt, deprecated usage, missing optional config |
| Thrown / unrecoverable error | `error` | Exception caught, DB connection failed, assertion violated |
| Verbose detail for debugging | `debug` | Payload contents, internal state (dev only) |

## Logging (NestJS Backend)
- Use NestJS built-in `Logger` for application logging
  ```typescript
  import { Logger } from '@nestjs/common';

  @Injectable()
  export class UserService {
    private readonly logger = new Logger(UserService.name);

    findAll() {
      this.logger.log('Fetching all users');
      this.logger.warn('Something might be wrong');
      this.logger.error('Something failed', error.stack);
    }
  }
  ```
- For structured/production logging, use **Winston** or **Pino** via `nestjs-pino`

## Tracing
- Use **OpenTelemetry** for distributed tracing
- Use **Sentry** for error tracking and performance monitoring
  ```typescript
  import * as Sentry from '@sentry/node';
  Sentry.captureException(error);
  ```

## Frontend (React)
- Use **Sentry** for error boundary reporting
- Use browser `console` only in development; strip with build tool in production
