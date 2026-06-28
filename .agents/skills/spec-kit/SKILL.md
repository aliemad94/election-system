---
name: spec-kit
description: Guides the agent to perform Spec-Driven Development (SDD) by structuring specifications, implementation plans, and tasks for robust AI-assisted coding.
---

# Spec Kit (Spec-Driven Development) Skill

This skill guides the agent to follow the Spec-Driven Development (SDD) workflow to avoid vibe-coding and ensure high-fidelity software engineering.

## Instructions for the Agent

When this skill is triggered (either explicitly by the user asking to "use spec-kit", "apply spec-driven development", "استخدم spec-kit", or implicitly when starting a complex feature):

### Step 1: Initialize Specification
Before writing code, create or update a spec document detailing the feature goals, non-goals, user requirements, and technical boundaries.

### Step 2: Create Implementation Plan
Write a detailed design in `implementation_plan.md` addressing:
1. Proposed changes grouped by components.
2. File paths to create, modify, or delete.
3. Automated and manual verification methods.

### Step 3: Track Tasks via `task.md`
Break down the implementation plan into granular, checkable tasks in `task.md`. Mark them as `[ ]`, `[/]`, or `[x]`.

### Step 4: Execute & Verify
Run the implementation loop, ticking off tasks as you go. Verify that unit tests pass and build succeeds.

### Step 5: Document Walkthrough
At completion, summarize findings, changes, and verification results in `walkthrough.md`. Include visual proofs if relevant.
