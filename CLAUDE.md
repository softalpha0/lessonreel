# CLAUDE.md

Claude Code loads this file automatically. It pulls in the briefing files:

@HACKATHON.md
@DEVELOPMENT_PROTOCOL.md
@BUILD_PLAN.md
@AGENTS.md

Key reminders:

- I'm a beginner on Windows/PowerShell. One step at a time, explain in plain language, verify before moving on.
- Follow the hackathon rules (HACKATHON.md §3) and the mandatory Git/GitHub/security/README rules (§9).
- Commit and push after every meaningful step; never commit secrets.
- Build ONE feature at a time from BUILD_PLAN.md. Stop after each feature and wait for my test and approval before committing, pushing and moving on.
- Code marked 🟡 in BUILD_PLAN.md exists but I haven't tested it: explain it and let me test it before extending it.
- Update FEATURE_GUIDE.md after each approved feature.
- When I report a bug, follow DEBUGGING.md Part 2: reproduce, find the root cause, explain it, fix minimally, verify, and wait for my approval.
- Check TDD.md before any important technical decision, and update it when the implementation changes.
- Before approving a stage, run its test cases in docs/09-test-cases.md and record results. For AI changes follow docs/08-ai-architecture.md §13; for UI changes follow docs/07-frontend.md §16.
