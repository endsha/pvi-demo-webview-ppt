# Guide: Updating Plan Documentation to Reflect Actual Implementation

<!-- last-reviewed: 2026-02-26 -->

## Purpose
When implementation differs from original plan, update the plan document IN PLACE so readers see what was actually built, not what was originally planned.

## Critical Rule: Clean Self-Explanatory Docs

**THE PLAN MUST READ CLEANLY FOR NEW READERS WHO DIDN'T SEE ITERATIONS**

When AI iterates through multiple versions, it tends to add:
- ❌ Verbose explanations about what changed
- ❌ "Note: this differs from..." commentary
- ❌ Historical context about decisions
- ❌ References to previous versions

**Instead, the updated plan should:**
- ✅ Read as if it was written once, correctly
- ✅ Be self-explanatory with minimal comments
- ✅ Show only essential implementation details
- ✅ Be clear to someone reading it for the first time

## Principles

1. **Replace, Don't Add**: Update original sections directly, don't create "actual implementation" sections
2. **Keep It Brief**: Show code changes with minimal explanation
3. **Self-Explanatory**: Write so a new reader understands without version history
4. **Preserve Structure**: Keep original section headers and flow
5. **Update Code Examples**: Replace planned code with actual implementation code

## Process

### 1. Read Actual Implementation
```bash
# Find the actual files
Read src/tools/tool-hook.service.ts
Read src/agents/tool-loader.service.ts
Read src/integrations/mcp/mcp-manager.service.ts
```

### 2. Update Plan Sections In Place

**Replace original code blocks with actual implementation:**

```typescript
// BEFORE (original plan)
class ToolCallHook {
  constructor(private wrappedToolset: Toolset, private history: ToolCallHistory) {}
}

// AFTER (update to actual)
@Injectable()
export class ToolCallHookService {
  constructor(
    private readonly toolCallHistory: ToolCallHistoryService,
    @Optional() private readonly mcpServerId?: number,
  ) {}

  async callTool(name: string, toolArgs: Record<string, unknown>, ctx: RunContext): Promise<unknown> {
    const userId = ctx.deps?.userId;
    // ...
  }
}
```

### 3. Add Brief Notes for Key Differences

Use **inline comments** ONLY for non-obvious technical requirements:

```typescript
// Required: NestJS DI manages singleton lifecycle
@Injectable()
export class ToolCallHookService { ... }

for (const [mcpId, mcpToolset] of mcpToolsetEntries) { ... }
```

**Keep comments minimal** - code should be self-explanatory.

### 4. What NOT to Do

❌ Don't create separate "Actual Implementation" sections
❌ Don't write long explanations in the plan
❌ Don't add "Note: this differs from original..." commentary
❌ Don't leave old code examples when updating
❌ Don't create comparison tables in the plan
❌ Don't add version history or iteration notes

## Example Update

**Before (Original Plan)**:
```typescript
const toolCallHook = new ToolCallHookService(baseToolset, toolHistory);
```

**After (Updated to Actual)**:
```typescript
// NestJS DI injects ToolCallHistoryService automatically
@Injectable()
export class ToolCallHookService {
  constructor(
    private readonly toolCallHistory: ToolCallHistoryService,
  ) {}
}
```

**Goal**: New reader sees clean implementation, not change history.

## For Detailed Analysis

Create a **separate** analysis document (e.g., `IMPLEMENTATION_ANALYSIS.md`) for:
- Detailed comparison of plan vs actual
- Breaking changes and migration guides
- Testing status and gaps
- Risks and recommendations

Keep the plan document **clean and implementation-focused**.

---

## Summary Checklist

Before finalizing updated plan, ask:
- [ ] Would a new reader understand this without seeing previous versions?
- [ ] Did I remove all "this changed from..." commentary?
- [ ] Are inline comments minimal and only for non-obvious requirements?
- [ ] Does the plan read as if it was written once, correctly?
- [ ] Is the most important information immediately clear?

**Remember**: The plan is for FUTURE readers, not a changelog for past readers.
