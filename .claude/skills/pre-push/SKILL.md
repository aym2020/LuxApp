---
name: pre-push
description: Review LuxApp changes before committing or pushing; inspect diffs, isolate tests, compare failures against the untouched baseline, and report a go/no-go decision.
disable-model-invocation: true
---
# LuxApp pre-push gate

Use this skill when explicitly asked to run /pre-push or to validate a change before push.

1. Confirm repository, current branch, status, upstream, and target branch. Never assume main or 2.1 is the deployment target.
2. Read actual test commands. LuxApp uses `bash tools/critique.sh rapide` and `bash tools/critique.sh`; `package.json` defines only `npm start`. Do not invent npm test scripts.
3. Inspect staged and unstaged diffs, unexpected files, secrets, configuration changes, and dependencies. Do not overwrite user changes.
4. Run checks in isolation. WARNING: `tools/critique.sh` hardcodes port 3456, may reuse an existing server, and can fetch `main`. Verify exclusive access to that port and correct `LUX_TESTS=1` server configuration before running. Do not run candidate and baseline suites concurrently on shared resources. Use distinct worktrees and sequential execution or safely isolated ports with a verified test harness. Track and terminate only processes started by this session; never use generic `pkill`.
5. If checks fail, compare with an untouched baseline using a separate worktree or independent checkout, with no shared servers or ports. Record which failures are pre-existing versus introduced.
6. Validate the intended functionality and relevant regression paths. Report skipped checks and environmental limitations.
7. Output: changed files, tests and outcomes, baseline comparison, residual risks, and explicit GO / NO-GO.
8. Never push, merge, deploy, force-push, or change protected branches without explicit user authorization. A passing test suite alone does not authorize push.
