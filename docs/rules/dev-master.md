## How to use this file
- This file can be used for human and AI Agent to work with this code base. It acts as entry points for all guidelines to help with development and code understanding.
- **CRITICAL**: When asked to perform any task related to guidelines below, ALWAYS read the referenced guideline file FIRST before proceeding with the task.

## Keyword Index
> Quick-reference: match your task keyword to the guide file. Load ONLY the matched file — do not scan further sections unless the task is ambiguous.

| Keywords | File |
|---|---|
| escalate, delegate, hand-off, sub-agent, agent limit | [agent-escalation.md](./agent-escalation.md) |
| lines, line limit, file size, code structure, length | [lines-limit.md](./lines-limit.md) |
| pattern, paradigm, design pattern, singleton, thread-safe, concurrency | [software-patterns.md](./software-patterns.md) |
| naming, name, variable, function, method, class, constant, identifier | [naming-convention.md](./naming-convention.md) |
| import, imports, dependency, module, package, require | [import-rules.md](./import-rules.md) |
| git, commit, branch, PR, pull request, merge, rebase | [git-rules.md](./git-rules.md) |
| database, model, column, migration, schema, field, table | [add-column-to-model.md](./add-column-to-model.md) |
| config, configuration, settings, env, environment variable (app/runtime config, not tsconfig or build config) | [config-setting-architecture.md](./config-setting-architecture.md) |
| compile, type check, static analysis, type error, build error | [compile-check.md](./compile-check.md) |
| error, exception, panic, recover, error handling, failure (application errors, not git errors) | [error-handling-quick.md](./error-handling-quick.md) (deep patterns: [error-handling-patterns.md](./error-handling-patterns.md)) |
| log, logging, trace, tracing, span, observability (application log, not git log) | [logging-tracing.md](./logging-tracing.md) |
| plan, planning, plan doc, spec, proposal | [create-plan-doc.md](./create-plan-doc.md) |
| update plan, revise plan, amend doc | [update-plan-doc.md](./update-plan-doc.md) |
| architecture, project structure, layout, folder structure | [project-architect.md](./project-architect.md) |
| test, spec, unit test, integration test, E2E, jest, coverage, mock, stub | [testing-guide.md](./testing-guide.md) |
| security, authentication, authorization, JWT, OWASP, XSS, injection, input sanitization | [security-guide.md](./security-guide.md) |
| api, REST, endpoint, API route, versioning, DTO, contract, status code, HTTP method | [api-design.md](./api-design.md) |
| i18n, locale, translation, hardcoded string, aria-label, placeholder, t(), useTranslation | [i18n-guide.md](./i18n-guide.md) |
| component, react component, hooks, props, composition, colocation | [react-component-patterns.md](./react-component-patterns.md) |
| state, store, zustand, global state, local state, auth state, current user | [state-management.md](./state-management.md) |
| data fetching, query, tanstack query, mutation, cache, invalidation | [data-fetching.md](./data-fetching.md) |
| mock, mock data, api stub, fake data, swap api, mock-first | [mock-api-pattern.md](./mock-api-pattern.md) |
| style, styling, tailwind, antd, theme, design token, ConfigProvider | [styling-tailwind-antd.md](./styling-tailwind-antd.md) |
| form, form validation, zod, AntD Form, schema, field error | [forms-validation.md](./forms-validation.md) |
| route, router, navigation, tanstack router, loader, search params | [routing.md](./routing.md) |
| a11y, accessibility, aria, keyboard, screen reader, WCAG, focus | [accessibility.md](./accessibility.md) |
| performance, bundle, code-split, memo, virtualization, web vitals | [performance.md](./performance.md) |
| Figma, screenshot, mockup, UI design, UX, pixel, layout, toggle reveal, conditional render, label exact | [ui-ux-strict.md](./ui-ux-strict.md) |
| status, pending, todo, roadmap, what's left, what's done, product list, settings list | [../STATUS.md](../STATUS.md) |
| orders, order action, order status, confirm payment, cancel order, edit order, prefillOrder, createdPolicy, duplicate order, thông tin đơn, đã xác nhận, đã cấp, confirmed vs issued, initialStep | [orders-page.md](./orders-page.md) |
| new product, add product, product conventions, ProductFormLayout, product layout, product shell, shared components, product file structure | [new-product-conventions.md](./new-product-conventions.md) |
| product page, create policy, B0/B1/B2/B3, step flow, update status, payment method, updatePolicyStatus, confirm payment step, paymentMethod CARD, useProductOrderFlow, useProductFormSteps, fee-from-prefill, license plate validation, biển kiểm soát, plateValid, initialStep | [product-page-flow.md](./product-page-flow.md) |
| premium rate, tính phí, tỷ lệ phí, standardRate, rate map, bracket, duration factor, risk rate, BRD rate, FAMILY_LIABILITY_RATE, PA_RATE_MAP, MONEY_RATE_MAP, getDurationFactor, getPassengerRate, getHomeInsuranceStandardRate | [premium-rates.md](./premium-rates.md) |
| phone normalize, normalizePhone, identity rules, phoneRule, emailRule, cccdRule, passportRule, taxCodeRule, validateIdNumber, PHONE_RE, CCCD_RE, formatTaxCode, license plate hook, useLicensePlateValidation | [forms-validation.md](./forms-validation.md) |

## General guide
- Avoid create new files, new functions, new variables. Instead always check first if current context already has the required resource. If not, create a new one. In case not sure, ask for confirmation before creating new one.

## Agent Escalation Protocol
- Follow [agent-escalation.md](./agent-escalation.md)

## Code Structure Rules
- Follow [lines-limit.md](./lines-limit.md)

## Software patterns & paradigms
- Follow [software-patterns.md](./software-patterns.md)

## Naming convention
- Follow [naming-convention.md](./naming-convention.md)

## Import rules
- Follow [import-rules.md](./import-rules.md)

## Git rules
- Follow [git-rules.md](./git-rules.md)

## Project specific guide

### Project Architecture
- For tasks needed to dive deep into project's architecture, please follow the document at [README.md](../README.md)

### Database & Backend
- For adding columns to existing models, follow [add-column-to-model.md](./add-column-to-model.md)

### PostgreSQL & Caching

### Configuration & Settings
- Follow [config-setting-architecture.md](./config-setting-architecture.md)

### Compile-Time Error Checking Guide
- Follow [compile-check.md](./compile-check.md)

### Error Handling Guide
- Follow [error-handling-quick.md](./error-handling-quick.md) for most tasks
- Load [error-handling-patterns.md](./error-handling-patterns.md) when deep patterns are needed (Sentry setup, custom exceptions, service/tool/controller/DB/LLM patterns, global filter, React)

### Logging & Tracing
- Follow [logging-tracing.md](./logging-tracing.md)

### Testing
- Follow [testing-guide.md](./testing-guide.md) for unit, integration, and E2E tests (NestJS + React)

### Security
- Follow [security-guide.md](./security-guide.md) for input validation, auth guards, and OWASP mitigations

### API Design
- Follow [api-design.md](./api-design.md) for REST naming, versioning, and DTO contract standards

## Working with doc
- When create plan doc, use rules in [create-plan-doc.md](./create-plan-doc.md)
- When update plan doc, use rules in [update-plan-doc.md](./update-plan-doc.md)
