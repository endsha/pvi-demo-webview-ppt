# Error Handling — Patterns & Deep Reference

<!-- last-reviewed: 2026-02-26 -->

Detailed patterns for NestJS + React error handling. For the quick reference, see `./error-handling-quick.md`.

## Logging Levels (NestJS Logger)

Use appropriate log levels based on severity:

```typescript
const logger = new Logger(MyService.name);

// Verbose: Detailed diagnostic information
logger.verbose(`Processing message: ${messageId}`);

// Debug: Development-only diagnostic info
logger.debug(`Agent ${agentCode} initialized`);

// Log (Info): General information about system operation
logger.log(`Agent ${agentCode} initialized successfully`);

// Warn: Something unexpected but recoverable
logger.warn(`Tool ${toolName} returned partial results`);

// Error: Operation failed but system continues
logger.error(`Failed to load agent ${agentId}`, error.stack);
```

### Log Context

Always include relevant context:

```typescript
logger.error('Tool execution failed', error.stack, {
  toolName,
  agentCode,
  conversationId,
  // NEVER log sensitive data (passwords, tokens, PII)
});
```

## Sentry Integration

### Setup (NestJS)

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Automatic Capture

Sentry automatically captures:
- Uncaught exceptions in NestJS controllers/services
- React error boundaries (frontend)
- Custom exceptions using Sentry interceptors

### Manual Capture

```typescript
import * as Sentry from '@sentry/node';

// Capture exception with context
try {
  const result = await processUserQuery(query);
  return result;
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'processing_failure');
    scope.setTag('severity', 'high');
    scope.setExtra('query', query.substring(0, 500));
    scope.setExtra('agentCode', agentCode);
    scope.setExtra('conversationId', conversationId);
    Sentry.captureException(error);
  });
  throw error;
}

// Capture informational message
Sentry.captureMessage('Rate limit approaching threshold', {
  level: 'warning',
  extra: { currentRate: rate, limit },
});
```

### Sensitive Data Protection

**Never log raw user input or credentials!**

Use Sentry's `beforeSend` hook to scrub PII:
```typescript
Sentry.init({
  beforeSend(event) {
    // Remove sensitive fields from event data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    return event;
  },
});
```

## Custom Exceptions (NestJS)

Create custom exceptions in `src/common/exceptions/`:

```typescript
// src/common/exceptions/tool-execution.exception.ts
import { InternalServerErrorException } from '@nestjs/common';

export class ToolExecutionException extends InternalServerErrorException {
  constructor(toolName: string, error: string, parameters?: Record<string, unknown>) {
    super({
      code: 'TOOL_EXECUTION_FAILED',
      message: `Tool "${toolName}" failed: ${error}`,
      toolName,
      parameters,
    });
  }
}

// Other custom exceptions
export class AgentNotFoundException extends NotFoundException {
  constructor(agentId: string | number) {
    super({ code: 'AGENT_NOT_FOUND', message: `Agent ${agentId} not found`, agentId });
  }
}

export class ValidationException extends BadRequestException {
  constructor(field: string, reason: string) {
    super({ code: 'VALIDATION_ERROR', message: reason, field });
  }
}
```

## Error Handling Patterns

### 1. NestJS Service Errors

```typescript
// src/agents/agent.service.ts
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  async processQuery(query: string, context: QueryContext): Promise<string> {
    try {
      const result = await this.llmService.generate(query, context);
      return result;
    } catch (error) {
      this.logger.error('Agent execution failed', error.stack, {
        agentCode: context.agentCode,
        conversationId: context.conversationId,
        queryPreview: query.substring(0, 100),
      });

      Sentry.withScope((scope) => {
        scope.setExtra('agentCode', context.agentCode);
        scope.setExtra('conversationId', context.conversationId);
        Sentry.captureException(error);
      });

      throw new InternalServerErrorException(
        'I encountered an issue processing your request. Please try again.',
      );
    }
  }
}
```

### 2. Tool Execution Errors

```typescript
// src/tools/tool-executor.service.ts
async executeToolWithErrorHandling<T>(
  toolName: string,
  toolFn: () => Promise<T>,
  parameters: Record<string, unknown>,
): Promise<T> {
  try {
    const result = await toolFn();
    this.logger.log(`Tool ${toolName} executed successfully`);
    return result;
  } catch (error) {
    if (error instanceof ToolExecutionException) throw error;

    this.logger.error(`Tool ${toolName} failed`, error.stack, {
      toolName,
      parameters: this.sanitizeParams(parameters),
    });

    throw new ToolExecutionException(toolName, error.message, parameters);
  }
}
```

### 3. Controller / HTTP Errors

```typescript
// src/webhook/webhook.controller.ts
@Controller('webhook')
export class WebhookController {
  @Post('events')
  async handleWebhook(@Body() payload: WebhookPayloadDto): Promise<{ status: string }> {
    try {
      await this.webhookService.process(payload);
      return { status: 'success' };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Unexpected webhook error', error.stack, {
        webhookType: payload.type,
      });

      throw new InternalServerErrorException('Webhook processing failed');
    }
  }
}
```

### 4. Database Errors

```typescript
// src/common/utils/retry.util.ts
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      logger.warn(`Connection error on attempt ${attempt + 1}/${maxRetries}`, {
        operation: operationName,
        attempt: attempt + 1,
      });

      if (isLastAttempt) {
        Sentry.captureException(error, { extra: { operationName, attempts: maxRetries } });
        throw new ServiceUnavailableException(`${operationName} failed after ${maxRetries} retries`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }
}
```

### 5. LLM API Errors

```typescript
async callLlmWithErrorHandling(prompt: string, model: string): Promise<string> {
  try {
    return await this.llmClient.generate(prompt, model);
  } catch (error) {
    if (error.status === 429) {
      this.logger.warn('LLM rate limit hit', { model });
      throw new TooManyRequestsException('Rate limit exceeded. Please try again later.');
    }

    if (error.code === 'ETIMEDOUT') {
      this.logger.error('LLM timeout', error.stack, { model });
      throw new GatewayTimeoutException('LLM request timed out');
    }

    this.logger.error('LLM call failed', error.stack, { model });
    Sentry.captureException(error);
    throw new InternalServerErrorException('AI service unavailable');
  }
}
```

## Global Exception Filter (NestJS)

```typescript
// src/common/filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    if (status >= 500) {
      this.logger.error('Unhandled exception', (exception as Error).stack);
      Sentry.captureException(exception);
    }

    response.status(status).json({
      status: 'error',
      error: {
        code: status,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

Register in `main.ts`:
```typescript
app.useGlobalFilters(new GlobalExceptionFilter());
```

## Error Response Structure

```typescript
{
  "status": "error",
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent configuration not found",
    "timestamp": "2025-01-03T10:30:00Z"
  }
}
```

## React Frontend Error Handling

```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

export const ErrorBoundary = Sentry.ErrorBoundary;

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// API call error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('User not found');
    }
    Sentry.captureException(error);
    throw new Error('Failed to load user. Please try again.');
  }
}
```

## References

- Global filter: `src/common/filters/global-exception.filter.ts`
- Custom exceptions: `src/common/exceptions/`
- Sentry setup: `src/main.ts`
- Logger: NestJS built-in `Logger` from `@nestjs/common`
