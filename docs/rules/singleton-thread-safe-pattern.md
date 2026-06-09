<!-- last-reviewed: 2026-02-26 -->

### Singleton Pattern

## Preferred: NestJS Dependency Injection

In NestJS, all `@Injectable()` services are **singletons by default** within their module scope. Prefer this over manual singleton management:

```typescript
// ✅ Preferred: NestJS DI singleton (automatic, safe)
@Injectable()
export class ConfigManagerService {
  private cache = new Map<string, unknown>();

  get(key: string): unknown {
    return this.cache.get(key);
  }
}

// Register in module
@Module({
  providers: [ConfigManagerService],
  exports: [ConfigManagerService],
})
export class ConfigModule {}
```

NestJS ensures the instance is created once and shared across all consumers within the module graph.

## Manual Singleton (Non-DI Context)

Use only when outside NestJS DI context (e.g., utility scripts, standalone processes):

```typescript
let instance: MyService | null = null;

export function getInstance(): MyService {
  if (!instance) {
    instance = new MyService();
  }
  return instance;
}
```

JavaScript is **single-threaded** (Node.js event loop), so no mutex/lock is needed for standard singleton creation unlike Python threading.

**Anti-patterns:**
```typescript
// ❌ Bad: Instantiating inside a function repeatedly
function processData() {
  const service = new HeavyService(); // new instance every call
}

// ❌ Bad: Using module-level `new` outside DI
const service = new HeavyService(); // hard to test, can't mock
```

## When to Add Explicit Initialization

- Only for heavy async initialization (e.g., DB connection, external API handshake)
- Call in `onModuleInit()` lifecycle hook in NestJS:

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit {
  private connection: Connection;

  async onModuleInit(): Promise<void> {
    this.connection = await createConnection(/* ... */);
  }
}
```

## Anti-patterns
```typescript
// ❌ Bad: Static class instance (hard to test)
class MyService {
  static instance = new MyService();
}

// ❌ Bad: Global variable without encapsulation
global.myService = new MyService();

// ✅ Good: NestJS DI handles lifecycle
@Injectable()
export class MyService {}
```
