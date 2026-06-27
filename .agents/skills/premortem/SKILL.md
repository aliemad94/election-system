---
name: premortem
description: Runs a premortem analysis on a plan, launch, product, strategy, or decision by assuming it failed 6 months from now and working backward to find every reason why.
---

# Premortem Skill

This skill allows the agent to run a premortem analysis on any plan, launch, product, hire, strategy, or decision. It assumes the project/decision has already failed 6 months from now and works backward to find every reason why, exposing blind spots and producing a revised plan.

## Instructions for the Agent

When this skill is triggered (either explicitly by the user asking to "run a premortem", "premortem this plan", "نفذ تحليل ما قبل الفشل", or implicitly when evaluating a high-risk decision or milestone):

### Step 1: Set the Frame
Explicitly acknowledge the premortem framing:
> "OK, I have enough context. Let's run the premortem. Here's the premise: it's 6 months from now. [The plan/launch/decision] has failed. It's done. We're looking back and trying to understand what went wrong."

### Step 2: Generate Failure Reasons (Raw Premortem)
Generate 3 to 7 genuine, specific failure reasons grounded in the actual details of the project/plan. Do not use generic reasons (like "not enough time").

### Step 3: Deep-Dive Analysis
For each failure reason, analyze:
1. **The Failure Story**: A 2-3 paragraph narrative of how it played out.
2. **The Underlying Assumption**: What was taken for granted.
3. **Early Warning Signs**: Observable signals/metrics to watch for.

### Step 4: Synthesis & Output
Produce a synthesis report containing:
1. **The Most Likely Failure**: The most probable scenario.
2. **The Most Dangerous Failure**: The highest damage scenario.
3. **The Hidden Assumption**: The single biggest unquestioned assumption.
4. **The Revised Plan**: Concrete, specific changes for resilience.
5. **The Pre-Launch Checklist**: 3-5 verifiable actions.

Save the full analysis as an artifact report named `premortem_report.html` (with premium dark aesthetics) and the transcript as `premortem_transcript.md`. Provide a concise summary in the chat.
