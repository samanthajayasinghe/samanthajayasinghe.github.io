---
title: "Testing AI Agents: An Eval Harness That Gives You Permission to Change"
date: 2026-10-11
description: "Agents are stochastic, so a single passing run proves nothing. A proper test harness turns that uncertainty into evidence you can act on — including the confidence to switch models."
tags: ["ai", "agents", "testing", "evals"]
---

A new model drops every few weeks — cheaper, faster, supposedly better. And every
time, the safe move is to do nothing. Not because the old one is better, but
because you can't *prove* the new one won't quietly break something that works. The
same paralysis shows up with any change to an agent: a refactor, a new tool, a
prompt tweak. It works today, so don't touch it.

The way out of that is a test harness built for agents. Done well, it doesn't just
catch regressions — it gives you permission to change.

## A single passing run is a coin flip

Traditional tests are deterministic: same input, same output, green or red. Agents
aren't. Give one the same prompt twice and you can get two different answers, both
reasonable, one subtly wrong. Run it once, watch it pass, and you haven't got a
green build — you've got one lucky sample.

Quality engineering for agents means **statistics, not assertions.** You fix a set
of representative cases, run them repeatedly, and score the outcomes. One run is one
data point; the signal lives in the distribution.

## Match each check to the cheapest judge that catches it

The core discipline of a good harness is how it scores an answer. For each thing
you care about, use the cheapest check that can reliably catch a failure:

- **Is a required command, flag, or format present?** A string or pattern check.
  Free, instant, and it can't lie to you.
- **Did it stay inside a safety or budget limit?** A deterministic guard. Also free.
- **Did it get the *meaning* right?** This is the only place you reach for an
  LLM-as-judge — when no pattern can express the thing you're checking.

"Cheapest" means cheapest in two currencies: dollars *and* flakiness. An LLM judge
costs money and is itself a stochastic system, so you spend it only where you must.
In practice the deterministic checks end up being the ones you trust most, precisely
because they can't surprise you.

## Evals say *yes*, not just *no*

We think of tests as the thing that stops a bad change. The real power of an agent
eval is the opposite: with a dataset and judges in place, you can run the candidate
model — or the refactor, or the upgrade — against the exact same bar as the current
one and compare. Same quality at a fraction of the cost? Switch, on evidence instead
of a hunch. Tests usually say *no*; a good eval is what finally lets you say *yes*.

## Be honest about what "passing" means

Two caveats keep this rigorous rather than magical:

- **Passing means it passed the failure modes you encoded.** That's a strength — it's
  transparent — but it's not a guarantee of correctness in general.
- **One run each is one data point.** The real rigor is running it several times and
  using a statistical test to show a difference is signal, not noise. "Indistinguishable"
  should be a result you measured, not a vibe.

## A failing judge is a work order

When a check does go red, it isn't a dead end — it's a to-do list:

1. **See what broke.** Read the failing judge's rationale alongside the actual answer.
2. **Close the gap.** Edit the agent — its instructions, its tools — to fix the
   specific failure.
3. **Prove it's real.** Re-run against the old version so you know the fix is a genuine
   improvement and not luck.
4. **Lock it in.** Turn the miss into a permanent regression case so it can't silently
   come back.

That loop is the whole point. A production miss becomes a test case; the test case
drives a fix; the fix is proven and retained. Every time a new model drops, you just
re-run it.

## Stop shipping on vibes

Agents are probabilistic, high-stakes, and changing under you constantly. The answer
isn't to freeze them in place out of fear — it's to build the loop that lets you
change them with confidence. Evals don't just catch regressions. They give you
permission to move.
