# Configuration Architecture: Two-Tier System

<!-- last-reviewed: 2026-02-26 -->

## Overview

The application uses a two-tier configuration system to separate infrastructure concerns from business logic configuration.

## Tier 1: Static Configuration (`ConfigModule` / `.env`)

**Purpose**: Infrastructure and deployment configuration

**Source**: Environment variables (`.env` file)

**Location**: `src/config/app.config.ts` (or via `@nestjs/config` `ConfigService`)

**Characteristics**:
- Loaded once at application startup
- Immutable (requires restart to change)
- Version controlled (`.env.example` committed, `.env` gitignored)
- Deployment/environment specific

**Typical Use Cases**:
- API credentials and keys
- Service URLs and endpoints
- Database connection strings
- Port configurations
- Log levels

**Setup (NestJS)**:
```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

**Example**:
```typescript
// any.service.ts
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getApiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY');
  }
}
```

**Typed Config (preferred)**:
```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  name: process.env.DB_NAME,
}));

// Usage
const dbHost = this.configService.get<string>('database.host');
```

## Tier 2: Dynamic Configuration (Database-backed)

**Purpose**: Business logic and runtime configuration

**Source**: PostgreSQL database (`configs` table)

**Location**: `src/config/config-manager.service.ts`

**Characteristics**:
- Loaded at runtime (lazy loading)
- Mutable (can change without restart)
- Cached in-memory with TTL
- Stored in database (admin UI editable)

**Typical Use Cases**:
- Business limits and thresholds
- Feature flags
- Timeouts and intervals
- Message processing configuration

**Example**:
```typescript
// config/config-manager.service.ts
@Injectable()
export class ConfigManagerService {
  constructor(private prisma: PrismaService) {}

  async get<T>(name: string, defaultValue: T): Promise<T> {
    const config = await this.prisma.config.findFirst({ where: { name } });
    return (config?.value as T) ?? defaultValue;
  }
}
```

## Configuration Flow

```
Application Request
    ↓
Check in-memory cache (TTL-based)
    ↓ (cache miss)
Check PostgreSQL `configs` table
    ↓ (not found or error)
Use .env default (Tier 1 fallback)
    ↓
Return value
```

## Configs Table Structure (PostgreSQL)

```sql
CREATE TABLE configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  number_value INTEGER,
  decimal_value DECIMAL,
  json_value JSONB,
  text_value TEXT,
  simple_text_value VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Prisma Schema**:
```prisma
model Config {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  numberValue     Int?
  decimalValue    Decimal?
  jsonValue       Json?
  textValue       String?
  simpleTextValue String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("configs")
}
```

## Decision Matrix: Which Tier?

| Config Type | Tier | Storage | Change Method |
|-------------|------|---------|---------------|
| API credentials | Tier 1 | .env | Redeploy |
| Service URLs | Tier 1 | .env | Redeploy |
| DB connection | Tier 1 | .env | Redeploy |
| Log level | Tier 1 | .env | Redeploy |
| Business limits | Tier 2 | DB | Admin UI / cache reset |
| Feature flags | Tier 2 | DB | Admin UI / cache reset |
| Timeouts | Tier 2 | DB | Admin UI / cache reset |

**Rule**:
- Tier 1: Infrastructure config that rarely changes (requires deployment)
- Tier 2: Business config that changes frequently (runtime updates)

## Cache Invalidation

**Endpoint**: `POST /admin/config/reload` (or similar admin route)

**Flow**:
1. Request hits admin endpoint
2. `ConfigManagerService` clears in-memory cache
3. Next config access reloads from PostgreSQL
4. New values cached with TTL

**Implementation**:
```typescript
@Injectable()
export class ConfigManagerService {
  private cache = new Map<string, { value: unknown; expiresAt: number }>();

  invalidateCache(): void {
    this.cache.clear();
  }
}
```

## Usage Patterns

### Pattern 1: Business Config with Static Fallback
```typescript
const maxMessages = await this.configManagerService.get<number>(
  'MAX_CONVERSATION_MESSAGES',
  this.configService.get<number>('MAX_CONVERSATION_MESSAGES') ?? 10,
);
```

### Pattern 2: Static Infrastructure Config
```typescript
const openAiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
```

### Pattern 3: Typed Namespace Config
```typescript
const dbConfig = this.configService.get('database');
const host = dbConfig.host;
```

## Related Files

- `src/config/app.config.ts` — Tier 1 typed config registration
- `src/config/config-manager.service.ts` — Tier 2 dynamic config service
- `prisma/schema.prisma` — Prisma schema containing the `Config` model
- `src/app.module.ts` — ConfigModule registration
