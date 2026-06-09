## Fast Path (skip dev-master.md scan)
If the task matches one of these categories, act immediately — do NOT load `./rules/dev-master.md`:
- **Typo / spelling / grammar fix**: fix the text, nothing else.
- **Simple rename**: rename an identifier in-place; load `./rules/naming-convention.md` only if the target name is ambiguous.
- **Formatting / whitespace**: fix indentation, trailing spaces, line endings — no guide needed.

## Full Path
For all other tasks:
- ALWAYS follows guide in `./rules/dev-master.md`.
- Identify if the task matching any topic in the document.
- Make sure to read the referencing md files deep at every levels that mentions a markdown file for guidance for underlying task before proceeding with the task.
- While working on the task, if new task arises, ensure to follow the corresponding guide in `./rules/dev-master.md` and load corresponding markdown file if specified down any levels (so when it says follow ./task-a-guide.md, load task-a-guide.md, inside ./task-a-guide.md if it mentions load ./task-b-guide.md then make sure to load task-b-guide.md before proceeding with task b).

## API Rules (CRITICAL)
- **KHÔNG tự ý thay đổi endpoint URL** (e.g., `/policies` → `/orders`). Chỉ sửa endpoint khi user yêu cầu rõ ràng hoặc BE confirm.
- Khi user bảo "map data vào UI": chỉ được sửa kiểu TypeScript (interface) và adapter logic — KHÔNG đổi URL.
- Endpoint hiện tại: `POST /api/v1/policies` (create), `GET /api/v1/policies` (list + detail).

## Project Status & UI/UX (READ FIRST)
- **[`./STATUS.md`](./STATUS.md)** — Pending products / settings, checklist khi làm cái mới, list page DONE / Pending.
- **[`./rules/ui-ux-strict.md`](./rules/ui-ux-strict.md)** — Tuân thủ Figma / screenshot tuyệt đối. BẮT BUỘC đọc khi user gửi hình/mockup.

Bất kỳ task nào liên quan tới:
- Thêm 1 product page mới → đọc `STATUS.md` (checklist) + `ui-ux-strict.md`
- Thêm 1 settings page mới → đọc `STATUS.md` (checklist)
- User gửi screenshot/Figma → đọc `ui-ux-strict.md` TRƯỚC KHI code
