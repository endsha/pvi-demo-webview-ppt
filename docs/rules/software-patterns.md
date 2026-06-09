<!-- last-reviewed: 2026-02-26 -->

## Design Principles (MUST FOLLOW STRICTLY)

### Core Principles
1. **DRY (Don't Repeat Yourself)**:
   - Extract duplicate logic into functions/classes/hooks
   - Example: Unified `getUserConfig()` instead of scattered inline config access

2. **SOLID - Single Responsibility**:
   - Each class/function has ONE reason to change
   - `UserService`: user domain logic only
   - `UserRepository`: data access only
   - `UserController`: HTTP handling only

3. **Separation of Concerns**:
   - Business logic (`services/`) ≠ Infrastructure (`repositories/`) ≠ HTTP (`controllers/`)
   - Don't mix database queries with business rules
   - Keep React components separate from data-fetching logic (use hooks or service layer)

4. **Fail Fast**:
   - Validate inputs at the boundary (DTOs with class-validator, Zod schemas)
   - Throw `BadRequestException` / `NotFoundException` early in NestJS services
   - Don't propagate invalid state through the system

5. **KISS (Keep It Simple)**:
   - Favor straightforward solutions over clever ones
   - Complex logic should be broken into simple, named steps
   - If you can't explain it simply, refactor it

6. **YAGNI (You Aren't Gonna Need It)**:
   - Don't implement features for hypothetical future needs
   - Build what's needed NOW based on current schema
   - Refactor when requirements actually change

7. **Composition Over Inheritance**:
   - Prefer composing services/hooks over deep class hierarchies
   - Prefer "has-a" over "is-a" relationships
   - Keep inheritance hierarchies shallow (max 2 levels)

## Code Quality Standards

### Structure & Complexity
- **Cyclomatic Complexity**: Keep under 10 per function
- **Nesting**: Maximum 3-4 levels deep

### Safe Operations
- **Optional chaining**: Use `?.` and `??` for safe property access
  ```typescript
  // ❌ Bad: throws if config is undefined
  const value = tool.config.callbackMapping;

  // ✅ Good: safely handles undefined
  const value = tool?.config?.callbackMapping ?? defaultValue;
  ```

- **Singleton in NestJS**: Use `@Injectable()` with module scope (NestJS handles DI lifecycle)
  ```typescript
  @Injectable()
  export class AppConfigService {
    // NestJS injects as singleton by default
  }
  ```

  For non-DI singletons (rare), follow [Thread-Safe Singleton Implementation Plan](./singleton-thread-safe-pattern.md)

### NestJS Patterns
- Use `@Injectable()` services for all business logic
- Use `PrismaService` for data access — inject it into services or repository classes
  ```typescript
  @Injectable()
  export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    findById(id: string) {
      return this.prisma.user.findUniqueOrThrow({ where: { id } });
    }

    create(data: Prisma.UserCreateInput) {
      return this.prisma.user.create({ data });
    }
  }
  ```
- Validate all incoming data with DTOs + `class-validator`
  ```typescript
  export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;
  }
  ```

### React Patterns
- Use functional components with hooks (no class components)
- Custom hooks for reusable stateful logic (prefix with `use`)
- Keep components focused: extract logic to hooks, extract markup to sub-components
  ```typescript
  // ✅ Good: logic in hook, component stays clean
  function UserProfile({ userId }: { userId: string }) {
    const { user, isLoading } = useUser(userId);
    if (isLoading) return <Spinner />;
    return <div>{user.name}</div>;
  }
  ```
