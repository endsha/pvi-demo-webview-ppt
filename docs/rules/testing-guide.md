# Testing Guide — NestJS + React

Covers unit, integration, and E2E testing patterns for the stack.

<!-- last-reviewed: 2026-02-26 -->

## Test Type Decision Table

| Scope | Tool | When to Write |
|---|---|---|
| Single class / function | Jest (unit) | Always — pure logic, services, utilities |
| Module wired together | Jest + `@nestjs/testing` (integration) | Service + DB / external dependencies |
| Full HTTP flow | Jest + Supertest (E2E) | Controller endpoints, auth, middleware |
| React component | Jest + React Testing Library | UI logic, user interactions, rendering |

---

## NestJS — Unit Tests

Test a service in isolation. Mock all dependencies.

```typescript
// user.service.spec.ts
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(UserService);
    jest.clearAllMocks();
  });

  it('returns user when found', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });
    const result = await service.findById(1);
    expect(result.email).toBe('a@b.com');
  });

  it('throws NotFoundException when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toThrow('Not found');
  });
});
```

**Rules:**
- One `describe` per class; group related cases with nested `describe`.
- Always `jest.clearAllMocks()` in `beforeEach` to avoid state leakage.
- Test both happy path and every thrown exception.

---

## NestJS — Integration Tests

Spin up a real module; use an in-memory / test DB connection.

```typescript
// user.integration.spec.ts
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService (integration)', () => {
  let service: UserService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ type: 'sqlite', database: ':memory:', entities: [User], synchronize: true }),
        UserModule,
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('persists and retrieves a user', async () => {
    const created = await service.create({ email: 'a@b.com' });
    const found = await service.findById(created.id);
    expect(found.email).toBe('a@b.com');
  });
});
```

**Rules:**
- Use `beforeAll` / `afterAll` (not `beforeEach`) for module setup — it is slow.
- Use SQLite `:memory:` or a dedicated test schema; never the production DB.

---

## NestJS — E2E Tests

Test HTTP behavior via Supertest against a real NestJS app instance.

```typescript
// test/user.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /users/:id → 200', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(1);
      });
  });

  it('GET /users/:id → 404 when missing', () => {
    return request(app.getHttpServer()).get('/users/9999').expect(404);
  });
});
```

**Rules:**
- Place E2E specs under `/test/` (not `src/`).
- Always close the app in `afterAll` to avoid open handles.
- Seed minimal fixture data in `beforeAll`; clean up in `afterAll`.

---

## React — Unit & Component Tests

Use **React Testing Library** (RTL). Test behaviour, not implementation.

```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard name="Alice" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('calls onDelete when button clicked', () => {
    const onDelete = jest.fn();
    render(<UserCard name="Alice" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
```

**Rules:**
- Query by role / label / text — never by class name or test IDs unless unavoidable.
- For async UI, use `waitFor` / `findBy*` queries; never arbitrary `setTimeout`.
- Mock external hooks (`useQuery`, `useRouter`) at the module level with `jest.mock`.

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Mocking implementation details (private methods) | Test via public API only |
| Tests sharing mutable state | `clearAllMocks()` + isolated module per test |
| Snapshot tests for large components | Prefer explicit assertions on key elements |
| Hitting real network / DB in unit tests | Mock at service / repository boundary |
| No error-path coverage | Add a test for every `throw` / rejection |

---

## Coverage Targets

| Layer | Minimum |
|---|---|
| Service (unit) | 80% |
| Controller (E2E) | Key routes: 200, 400, 404, 401 |
| React components | Core interactions + render states |
