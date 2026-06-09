# Adding Columns to Existing Models (Prisma + PostgreSQL)

<!-- last-reviewed: 2026-02-26 -->

## Quick Reference
```bash
# Generate migration after updating schema
npx prisma migrate dev --name AddColumnNameToTableName

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Development Stage

### 1. Update the Schema
Location: `prisma/schema.prisma`

**Basic column:**
```prisma
model Contact {
  id      Int     @id @default(autoincrement())
  blocked Boolean @default(false)
}
```

**Column with index:**
```prisma
model Notification {
  id             Int      @id @default(autoincrement())
  lastActivityAt DateTime @default(now())

  @@index([lastActivityAt])
}
```

**Composite index:**
```prisma
model Contact {
  id             Int      @id @default(autoincrement())
  accountId      Int
  lastActivityAt DateTime?

  @@index([accountId, lastActivityAt])
}
```

### 2. Generate Migration
```bash
# After updating schema.prisma, generate the migration
npx prisma migrate dev --name AddBlockedToContacts
```

Location: `prisma/migrations/TIMESTAMP_AddBlockedToContacts/migration.sql`

**Review the generated migration:**
```sql
-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "blocked" BOOLEAN NOT NULL DEFAULT false;
```

### 3. Run Migration
```bash
# Development (generates + applies migration)
npx prisma migrate dev --name AddBlockedToContacts

# Check migration status
npx prisma migrate status
```

## When to Add Indexes

### ADD Index when:
- ✅ Column used in WHERE clauses frequently
- ✅ Foreign key columns (accountId, userId, etc.)
- ✅ Columns used for sorting (ORDER BY)
- ✅ Columns used in JOIN conditions
- ✅ Boolean flags queried often (status, blocked, etc.)
- ✅ Timestamp columns for filtering (createdAt, updatedAt)

### DON'T Add Index when:
- ❌ Column has high cardinality (unique values)
- ❌ Column rarely queried
- ❌ Small tables (< 1,000 rows)
- ❌ Columns frequently updated (index overhead > query benefit)
- ❌ Table has many writes, few reads

## Deployment Stage

### 1. Production-Safe Migrations
Prisma generates SQL migration files you can edit before applying. For large tables, manually replace the generated index with a concurrent one:

```sql
-- Add column first (no lock issue)
ALTER TABLE "contacts" ADD COLUMN "email" VARCHAR;

-- Replace generated CREATE INDEX with concurrent variant (non-blocking)
CREATE INDEX CONCURRENTLY "contacts_email_idx" ON "contacts" ("email") WHERE "email" <> '';
```

### 2. Zero-Downtime Pattern
For high-traffic tables, split into 2 deployments:

**Deploy 1: Add column only**
```sql
-- migration.sql
ALTER TABLE "users" ADD COLUMN "email" VARCHAR;
```

**Deploy 2: Add index concurrently**
```sql
-- migration.sql
CREATE INDEX CONCURRENTLY "users_email_idx" ON "users" ("email");
```

> Note: `CREATE INDEX CONCURRENTLY` cannot run inside a transaction. Add `SET LOCAL lock_timeout = 0;` or remove the transaction wrapper Prisma adds by editing the migration file directly.

## Common Column Types (Prisma + PostgreSQL)

```prisma
email     String    @db.VarChar(255)   // VARCHAR(255)
bio       String                        // TEXT
count     Int                           // INT
bigNum    BigInt                        // BIGINT
active    Boolean   @default(false)     // BOOLEAN
createdAt DateTime  @default(now())     // TIMESTAMP
birthDate DateTime  @db.Date            // DATE
price     Decimal   @db.Decimal(10, 2)  // DECIMAL
meta      Json                          // JSONB (default in PostgreSQL)
id        String    @id @default(uuid()) // UUID
```

## Best Practices
1. **Name migrations descriptively:** `AddBlockedToContacts` not `UpdateContacts`
2. **Set defaults in schema:** Avoid `NULL` for booleans/strings where possible
3. **Use non-nullable fields** when column is required (omit `?`)
4. **Keep migrations in version control:** Never delete migration files
5. **One concern per migration:** Don't mix unrelated changes
6. **Use concurrent indexes in production:** Prevent table locks by editing the generated SQL
7. **Review generated SQL:** Always inspect the migration file before applying

## Example: Complete Workflow
```bash
# 1. Update schema: add `status` field to Conversation model in prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name AddStatusToConversations

# 3. Review generated migration file in prisma/migrations/

# 4. Test via application or Prisma Studio
npx prisma studio

# 5. Commit
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add status column to conversations"
```

## Troubleshooting
```bash
# Show all migrations and their status
npx prisma migrate status

# Reset database and re-apply all migrations (development only — NEVER in production)
npx prisma migrate reset

# Push schema changes without creating a migration (development prototyping only)
npx prisma db push

# Regenerate Prisma Client after schema changes
npx prisma generate
```
