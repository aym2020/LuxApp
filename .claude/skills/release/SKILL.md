---
name: release
description: Prepare LuxApp releases with environment checks, regression validation and rollback planning.
disable-model-invocation: true
---
# Release readiness
1. Confirm source branch, destination branch, target environment and exact commit SHA.
2. Inspect changes to configuration, dependencies, offline assets, service worker and Firebase synchronization.
3. Check recette separation: RECETTE=1 uses dedicated authentication and disables Firebase; LUX_TESTS=1 is for browser testing, not production.
4. Run pre-push validation in isolation. tools/critique.sh uses port 3456 and may reuse an existing server; never run baseline and candidate concurrently on the same port.
5. Distinguish existing baseline failures from introduced regressions.
6. Document checks, smoke tests, rollback approach, unresolved blockers and GO/NO-GO.
7. Never merge, push or deploy without explicit authorization.
