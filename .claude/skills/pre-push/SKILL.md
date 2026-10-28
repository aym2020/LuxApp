---
name: pre-push
description: Review LuxApp changes before committing or pushing; inspect diffs, isolate tests, compare failures against the untouched baseline, and report a go/no-go decision.
disable-model-invocation: true
---
# LuxApp pre-push gate

Use this skill when explicitly asked to run /pre-push or to validate a change before push.

1. Confirm repository, current branch, status, upstream, and target branch. Never assume main or 2.1 is the deployment target.
2. Read the actual project test commands and configuration. Do not invent npm scripts. Identify which tests are critical and what they cover.
3. Inspect staged and unstaged diffs, unexpected files, secrets, configuration changes, and dependencies. Do not overwrite user changes.
4. Run applicable checks in an isolated environment. Use distinct ports, process groups, temp directories, and test data. Never use broad process-killing commands such as pkill on shared names.
5. If checks fail, compare with an untouched baseline using a separate worktree or independent checkout, with no shared servers or ports. Record which failures are pre-existing versus introduced.
6. Validate the intended functionality and relevant regression paths. Report skipped checks and environmental limitations.
7. Output: changed files, tests and outcomes, baseline comparison, residual risks, and explicit GO / NO-GO.
8. Never push, merge, deploy, force-push, or change protected branches without explicit user authorization. A passing test suite alone does not authorize push.
