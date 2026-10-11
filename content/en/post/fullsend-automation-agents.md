---
title: "FullSend: Automating the Software Lifecycle with Agents"
date: 2026-10-11
description: "How FullSend's first-class agents automate the GitHub development lifecycle — from issue triage to retrospective — inside sandboxed containers."
tags: ["automation", "agents", "ci-cd", "github"]
---

A lot of the software development lifecycle is repetitive: triaging new issues,
checking for duplicates, writing the obvious fix, reviewing a PR against the same
checklist every time, and following up afterwards. [FullSend](https://github.com/fullsend-ai)
is a platform for handing that work to agents — and the
[agents repo](https://github.com/fullsend-ai/agents) is where those agents live.

Each one automates a distinct stage of the lifecycle on GitHub.

## The agents

| Agent | What it does | Trigger |
|-------|--------------|---------|
| **Triage** | Assesses whether an issue has enough detail, searches for duplicates, applies control labels | New issues, `/fs-triage` |
| **Code** | Implements fixes and features following the repo's own conventions | `ready-to-code` label, `/fs-code` |
| **Review** | Fans out parallel sub-agents across six review dimensions | PR events, `/fs-review` |
| **Fix** | Implements targeted fixes from review feedback | Review comments, `/fs-fix` |
| **Prioritize** | Scores issues using the RICE framework | Schedule, `/fs-prioritize` |
| **Retro** | Analyzes completed workflows and proposes improvements | PR close, `/fs-retro` |

Together they cover the loop end to end: an issue comes in, gets triaged and
prioritized, turned into code, reviewed, fixed, and then fed into a retrospective
that proposes how to do it better next time.

## Why the architecture matters

The part I find most interesting is the security model. An agent writing code and
pushing to your repository is a lot of trust to extend. FullSend's answer is that
the agent **never has direct write access**. Every run follows a three-phase
pipeline:

1. **Pre-script** — runs on the GitHub Actions runner to validate inputs and
   prepare the environment.
2. **Sandbox** — runs the agent itself with strict filesystem, network, and
   binary restrictions. It writes code and emits structured JSON output.
3. **Post-script** — runs back on the runner with elevated permissions and
   performs the actual GitHub mutations: pushing branches, opening PRs, posting
   comments, applying labels.

All mutations flow through post-scripts. The agent proposes; the trusted,
reviewable post-script disposes. That separation is what makes it safe to let an
agent operate on a real repository.

## The takeaways

Two things stand out to me from an SRE lens:

- **Capability isolation beats blanket trust.** Giving the agent a sandbox and
  routing every side effect through a small, auditable post-script is the same
  principle we apply to production access — least privilege, with the risky
  operations behind a controlled boundary.
- **Closing the loop with Retro** turns automation from a one-shot tool into a
  system that improves itself, which is exactly the posture you want for anything
  running unattended.

If you want to dig into the details, the
[agents repository](https://github.com/fullsend-ai/agents) documents each agent,
the harness, and the sandbox policies.
