# Guide: Creating Plan Documents

<!-- last-reviewed: 2026-02-26 -->

## Purpose
Plan documents propose solutions for complex architectural changes, refactoring, or feature implementations that span multiple components.

**IMPORTANT**: Always follow general guidelines in `./CLAUDE.md` before creating plan documents.

## When to Create Plan Docs
- Unifying divergent implementations (e.g., different patterns for same concern)
- Major architectural changes affecting multiple modules
- Cross-cutting concern implementations (logging, approval, caching, etc.)
- Database schema migrations
- Configuration standardization

## Document Structure

### 1. Executive Summary (1 paragraph)
- Problem being solved
- Proposed approach (1-2 sentences)
- Key benefits

### 2. Problem Statement
- **Current Pain Points**: Table comparing current approaches/issues
- **Impact on Development**: Numbered list of concrete impacts
- **Opportunity**: What existing code/patterns can be leveraged

### 3. Current State Analysis
For each existing implementation:
- **Location**: File paths with line numbers
- **Configuration**: Schema examples (JSON)
- **Implementation**: Code snippets showing key logic
- **Flow**: How it works step-by-step
- **Strengths**: ✅ What works well
- **Weaknesses**: ❌ What's problematic

Include comparison table showing differences between approaches.

### 4. Proposed Solution
- **Design Principles**: 3-5 core principles guiding the solution
- **Architecture Overview**: Diagram using ASCII/text boxes showing data flow
- **Key Changes**: For each major change:
  - **Before**: Current code snippet
  - **After**: Proposed code snippet
  - **Rationale**: Why this change improves things

### 5. Implementation Plan
4-phase breakdown (adjust timeline as needed):
- **Phase 1: Foundation** - Add new code without breaking existing
- **Phase 2: Simplification** - Remove old code, keep backward compat
- **Phase 3: Migration** - Migrate configs/data to new schema
- **Phase 4: Observability** - Add metrics, logging, monitoring

For each phase:
- **Goal**: One sentence objective
- **Tasks**: Numbered list with code examples where relevant
- **Deliverables**: Checklist of concrete outputs

### 6. Migration Strategy
- **Backward Compatibility Approach**: Code example showing dual-schema support
- **Migration Timeline**: Table with phases, duration, compat status, impact
- **Rollback Plan**: Per-phase rollback steps

### 7. Testing Strategy
- **Unit Tests**: List key test scenarios with skeleton code
- **Integration Tests**: E2E test descriptions
- **Manual Testing Checklist**: Checkbox list of manual test cases

### 8. Success Metrics
- **Functional Metrics**: Backward compat, bug count, coverage
- **Code Quality Metrics**: LOC reduction, single source of truth
- **Observability Metrics**: What gets tracked
- **Performance Metrics**: Response time, memory usage

### 9. Appendix
- **Related Documentation**: Links to relevant docs
- **Configuration Examples**: Before/after examples
- **Code References**: File paths with line numbers for key changes

## Formatting Guidelines
- Use tables for comparisons
- Use code blocks with language tags (```typescript, ```json, ```sql)
- Use ✅/❌ for pros/cons
- Use checkboxes [ ] for actionable items
- Include file paths with line numbers (e.g., `src/modules/user/user.service.ts:123-456`)
- Keep sections focused and scannable

## Analysis Approach
1. Use Task tool with Explore agent to analyze codebase thoroughly
2. Search for all implementations of the pattern being unified
3. Compare configurations, mechanisms, and timing
4. Identify pain points and opportunities
5. Propose solution leveraging existing infrastructure

## Example Request Format
```
analyze code base to propose solution that unified [CONCERN] in [TARGET_FILE]
instead of diverse way currently for [IMPL_A] and [IMPL_B],
create doc name docs/[CATEGORY]/[FEATURE_NAME]-plan.md
```

## Template Checklist
- [ ] Executive summary under 200 words
- [ ] Problem statement with comparison table
- [ ] Current state with code examples and line numbers
- [ ] Proposed solution with before/after comparisons
- [ ] 4-phase implementation plan with concrete tasks
- [ ] Migration strategy with backward compat code
- [ ] Testing strategy with test scenarios
- [ ] Success metrics (functional, quality, observability, performance)
- [ ] Appendix with references and examples
