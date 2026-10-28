---
name: feature
description: Implement LuxApp features consistently with existing architecture, reusable components, access controls, UI patterns, and regression tests; use when adding or extending product behavior.
---
# LuxApp feature implementation

1. Translate the request into observable acceptance criteria, including failure cases and permissions.
2. Inspect existing routes, server/client structure, components, data flow, authentication, and tests. Reuse established patterns rather than introducing a parallel architecture.
3. Identify impacted interfaces, persistence, migrations, configuration, and potential regressions. Explicitly separate test/recette behavior from production.
4. Propose a compact implementation plan when the change spans multiple areas; otherwise implement directly.
5. Keep the change focused and backward-compatible unless breaking changes were requested. Do not hardcode credentials or expose private environments.
6. Add meaningful tests for the happy path, important edge cases, and access restrictions. Follow the actual repository test commands.
7. Validate in isolated environments; do not share or kill unrelated servers. Check responsive UI and keyboard behavior when relevant.
8. Summarize delivered behavior, affected files, executed checks, remaining gaps, and manual verification steps.
9. Do not push, merge, or deploy without explicit user authorization.
