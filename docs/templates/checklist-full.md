# Checklist (Full)

<!-- last-reviewed: 2026-02-26 -->

## Definition of Done (DoD)

- [ ] Code implemented and tested locally
- [ ] Unit tests written and passing
- [ ] Code follows project guidelines (dev-master.md)
- [ ] No critical linting errors (`ruff check src/`)
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Backward compatibility maintained

## Pre-Deployment

### Testing
- [ ] All tests pass (`uv run pytest tests/ -v`)
- [ ] Manual testing completed
- [ ] Edge cases tested

### Code Quality
- [ ] No unused imports or undefined variables
- [ ] Functions under 50 lines
- [ ] No code duplication (DRY)

### Infrastructure
- [ ] .env.template updated
- [ ] Dependencies in pyproject.toml
- [ ] Cache invalidation tested (`/resetdb`)

### Documentation
- [ ] CLAUDE.md updated
- [ ] Configuration examples added

## Post-Deployment

- [ ] Health check passes
- [ ] Logs show no errors
- [ ] Monitoring checked (Sentry, Langfuse)
