# API Design — REST Naming, Versioning & DTO Contracts

<!-- last-reviewed: 2026-02-26 -->

## Endpoint Naming

- Use **plural nouns** for resource collections: `/users`, `/conversations`, `/messages`
- Use **kebab-case** for multi-word segments: `/conversation-sessions`
- Nest resources only one level deep: `/users/:id/messages` (not `/users/:id/messages/:msgId/attachments`)
- Never use verbs in the URL — use the HTTP method to express the action

| Action | Method | URL |
|---|---|---|
| List | `GET` | `/users` |
| Get one | `GET` | `/users/:id` |
| Create | `POST` | `/users` |
| Replace | `PUT` | `/users/:id` |
| Partial update | `PATCH` | `/users/:id` |
| Delete | `DELETE` | `/users/:id` |

## Versioning

- Prefix all routes with `/v{n}`: `/v1/users`, `/v2/conversations`
- Declare the version prefix at the controller level in NestJS:

```typescript
@Controller({ path: 'users', version: '1' })
export class UserController {}
```

- Enable versioning globally in `main.ts`:

```typescript
app.enableVersioning({ type: VersioningType.URI });
```

- Never break an existing versioned contract — add a new version instead.
- Deprecate old versions with a `Deprecation` response header; remove only after a migration window.

## DTO Contract Standards

**Request DTOs** — file: `create-user.dto.ts`, class: `CreateUserDto`

- Validate every field with `class-validator` decorators (see `./security-guide.md`).
- Use `@ApiProperty()` from `@nestjs/swagger` on every field to keep OpenAPI in sync.
- Separate Create / Update DTOs; `UpdateUserDto` extends `PartialType(CreateUserDto)`.

**Response DTOs** — file: `user-response.dto.ts`, class: `UserResponseDto`

- Never return raw entity objects — always map to a response DTO before sending.
- Omit internal fields (`passwordHash`, `deletedAt`) via explicit property mapping or `@Exclude()`.
- Keep response shapes consistent: single item returns the object; list returns `{ data: T[], total: number }`.

## HTTP Status Codes

| Situation | Code |
|---|---|
| Successful read / update | `200 OK` |
| Resource created | `201 Created` |
| No content (delete) | `204 No Content` |
| Validation failure | `400 Bad Request` |
| Unauthenticated | `401 Unauthorized` |
| Authenticated but forbidden | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Server error | `500 Internal Server Error` |

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Verb in URL (`/getUser`, `/createPost`) | Use noun + correct HTTP method |
| Returning raw entity with sensitive fields | Always map to a response DTO |
| Inconsistent list response shape | Always wrap lists in `{ data, total }` |
| Breaking change in existing version | Bump to a new version; keep old route intact |
