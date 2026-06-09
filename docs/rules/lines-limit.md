<!-- last-reviewed: 2026-02-26 -->

Optimal Lines of Code for Readability and Maintainability

### For Markdown Files:

- **Line width**: 80-100 characters per line (for version control diffs)
- **Document length**: No strict limit, but consider splitting when:
  - Single document exceeds 1,000-1,500 lines
  - Multiple distinct topics exist (use separate files)
  - Table of contents becomes unwieldy (>20 sections)
- **Approach**: Use semantic line breaks (break at sentences, not character count) for better git diffs
- **Structure**:
  - Title and introduction: 5-10 lines
  - Each section: 50-200 lines maximum
  - Use subsections and hierarchy (H2, H3, H4)

### For Code Files:

- **File length**: 200-500 lines ideal, refactor when:
  - Exceeds 500 lines (warning threshold)
  - Exceeds 1,000 lines (critical - must refactor)
  - Multiple unrelated classes/functions exist
- **Line width**: 100-120 characters (Prettier default is 80-100, team can configure)
- **Refactoring indicators**:
  - File has >3 distinct responsibilities
  - Difficult to name the file meaningfully
  - Hard to locate specific functionality

### For Functions:

- **Ideal length**: 5-20 lines
- **Maximum acceptable**: 50 lines
- **Critical threshold**: 100+ lines (requires immediate refactoring)
- **The "One Screen Rule"**: Function should be visible without scrolling (25-40 lines on modern displays)
- **Best practice guidelines**:
  - **2-10 lines**: Excellent ✅
  - **11-20 lines**: Good ✅ (acceptable for most functions)
  - **21-50 lines**: Acceptable ⚠️ (consider refactoring if complex)
  - **51-100 lines**: Poor ❌ (should refactor)
  - **100+ lines**: Unacceptable 🚫 (must refactor immediately)

### Additional Metrics:

- **Cyclomatic complexity**:
  - 1-10: Simple, low risk ✅
  - 11-20: Moderate complexity ⚠️
  - 21-50: Complex, high risk ❌
  - 50+: Untestable 🚫

- **Nesting depth**: Optimal 1-2, maximum 3-4 levels deep
- **Function parameters**: Maximum 3-4 parameters (use objects/interfaces for more)
- **Class methods**: 10-15 methods maximum per class

### TypeScript-Specific:

- **Line width**: 80-100 characters (Prettier default; configure in `.prettierrc`)
- **Indentation**: 2 spaces (standard for TypeScript/JavaScript)
- **Blank lines**:
  - 1 blank line between methods in a class
  - 1 blank line between logical sections inside a function
- **Semicolons**: Follow project Prettier config (typically enforced)
- **String quotes**: Follow Prettier config (single or double, consistent)
- **Trailing commas**: Enable `"trailingComma": "all"` in Prettier for cleaner diffs
