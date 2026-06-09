# Agent Escalation Protocol

<!-- last-reviewed: 2026-02-26 -->

Rules for when Claude must **stop and ask** before proceeding. When uncertain, asking is always safer than guessing.

## Core Principle

> If the action is hard to reverse, affects shared state, or the intent is unclear — stop and confirm.

---

## Always Ask Before Proceeding

### Destructive Database / Schema Changes

Stop if the change could cause data loss or an outage:

| Situation | Example | Why it needs confirmation |
|---|---|---|
| Dropping a table or column | `DROP TABLE users` | Irreversible data loss |
| Truncating a table | `TRUNCATE conversations` | Irreversible data wipe |
| Removing a non-nullable column without a default | Deleting `accountId` from `contacts` | Migration will fail on non-empty tables |
| Changing a column type that truncates data | `VARCHAR(255)` → `VARCHAR(50)` | Silent data truncation |
| Squashing or deleting existing migration files | Removing `20240101_AddStatus` | Breaks deploy history and `migrate status` |
| Adding a unique constraint to an existing column | `@@unique([email])` | Will fail if duplicates already exist |

### Ambiguous Migrations

Stop if the migration intent cannot be inferred safely:

- The schema change affects a table with no clear owner service.
- The task says "update the schema" but does not specify which columns or types to change.
- The migration would need a data backfill and no backfill logic is provided.
- The migration file already exists but its content differs from what the task implies.
- Two migration approaches are viable and they have meaningfully different trade-offs (e.g., zero-downtime split vs. single deployment).

### Unclear Ownership

Stop when it is not clear who is responsible for the code or data being changed:

- A module, service, or table is referenced but no owner is evident from the codebase.
- The task touches shared infrastructure (auth, billing, multi-tenant isolation).
- The change would affect another team's API contract or event schema.
- There is an active plan doc or MR for the same area — confirm there is no conflict before proceeding.

### Ambiguous or Conflicting Requirements

Stop when the task itself is underspecified:

- The instruction says "clean up" or "remove old code" without specifying what qualifies as old.
- Two equally valid interpretations exist and they produce different outputs.
- The task contradicts an existing guideline (e.g., asks to skip a migration step that `add-column-to-model.md` requires).
- The task scope is unclear — it may touch one file or ten, and the distinction matters.

---

## Proceed Without Asking

These are safe to handle autonomously:

- ✅ Adding a **new nullable column** with a default value to an existing table
- ✅ Creating a **new migration** for a net-new table or index
- ✅ Renaming a symbol that is only used internally within the current file or module
- ✅ Fixing a typo, formatting, or import ordering
- ✅ Adding a new optional field to a request/response DTO
- ✅ Writing or updating tests that do not change production code
- ✅ Adding logging or Sentry context that does not alter behaviour

---

## How to Escalate

When escalation is needed, follow this structure:

1. **State what you are about to do** — describe the specific action concisely.
2. **Explain the risk** — why this requires confirmation (data loss, ambiguity, ownership, etc.).
3. **Offer concrete options** — give 2–3 numbered choices, including a "do nothing / ask the team" option.
4. **Wait for an explicit answer** — do not proceed on a best guess or assume silence is approval.

**Example:**
```
I need clarification before proceeding.

Action: Remove the `legacyToken` column from the `users` table.
Risk: This is a non-nullable column. The migration will fail on any environment
      where existing rows have a value in this column unless a default or backfill
      is provided first.

Options:
  1. Add a default value (`''`) to the column, then remove it in a follow-up migration.
  2. Provide a data backfill script to clear the column before dropping it.
  3. Skip this change and flag it for manual review.

Which option should I use?
```

---

## Quick Reference

| Trigger | Action |
|---|---|
| `DROP`, `TRUNCATE`, `DELETE` with no `WHERE` | Always ask |
| Removing a non-nullable column | Always ask |
| Migration file already exists with different content | Always ask |
| Shared table / multi-tenant data | Always ask |
| Task says "clean up" without specifics | Always ask |
| Conflicting interpretation of requirements | Always ask |
| Adding a nullable column with a default | Proceed |
| New table / new migration | Proceed |
| Test-only changes | Proceed |
| Logging / tracing additions | Proceed |
