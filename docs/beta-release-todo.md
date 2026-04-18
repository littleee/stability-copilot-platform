# DevPilot Beta Release TODO

This checklist translates the current product conclusions into a practical release plan.

Current product judgment:

- DevPilot is ready for `Beta / Preview` distribution to real users.
- DevPilot is not yet ready to be positioned as a fully mature `v1` product.
- The main product path is now:

```text
Annotate -> Copy to AI -> Diagnose / Fix
```

- `Stability Copilot` is an optional enhancement layer, not the default path for every user.
- `MCP` remains an enhancement layer for connected workflows, not the primary concept users need to understand first.

## Release Goal

Ship a Beta that feels intentional, understandable, and useful on day one for:

- single-user page annotation
- structured AI handoff
- optional stability observation
- optional connected workflow through MCP

## P0: Required Before Beta Release

### Product Narrative

- [ ] Update [README.md](/Users/littleee/project/stability-copilot-platform/README.md) to match the current product shape.
  - Remove outdated emphasis on the old `session panel` workflow.
  - Describe DevPilot as one product with a simple local flow and optional connected enhancements.
- [ ] Update [packages/devpilot/README.md](/Users/littleee/project/stability-copilot-platform/packages/devpilot/README.md) so npm consumers see the current behavior, not an older architecture snapshot.
  - Align terminology around `annotate`, `copy to AI`, `stability copilot`, and `connected mode`.

### UX Consistency

- [ ] Rename the current `设置` surface to `诊断` or `连接诊断` in [packages/devpilot/src/ui/settings-panel.tsx](/Users/littleee/project/stability-copilot-platform/packages/devpilot/src/ui/settings-panel.tsx).
  - The current panel is primarily for connection state and feature diagnostics, not user preferences.
- [ ] Verify the toolbar labels, button states, and empty states are fully aligned with the simplified flow.
  - The user should always understand the next step after creating an annotation.
- [ ] Add a lightweight first-use hint for the local flow.
  - Explain only:
    - click to annotate
    - copy to AI
    - enable stability copilot from diagnostics if needed

### AI Handoff Quality

- [ ] Add screenshot evidence support for annotations.
  - First target: generate a screenshot for element and area annotations.
  - Do not block Beta on perfect multi-asset export.
- [ ] Add a `copy screenshot` action alongside the current task-packet copy flow.
  - Keep the text handoff and image handoff explicit and reliable.
- [ ] Run a real end-to-end AI handoff check.
  - Create a page issue in the demo.
  - Copy the task packet into Claude or Codex.
  - Verify that the model can locate the likely file and suggest a plausible safe fix.

### Beta Readiness Checks

- [ ] Verify `npm run build` passes from a clean state.
- [ ] Verify `npm test` passes from a clean state.
- [ ] Verify the published package still mounts cleanly in the demo.
- [ ] Verify the local mode works without MCP configured.
- [ ] Verify the connected mode works when MCP is configured.

## P1: High-Value Improvements After Beta Starts

### Copy / Export System

- [ ] Ensure every remaining copy entry point uses the same task-packet semantics.
  - Avoid mixed export formats in different panels.
- [ ] Improve task packet output further with stronger source hints.
  - Favor selector candidates, component hints, and source file hints that are directly useful for code search.
- [ ] Add screenshot persistence through `IndexedDB`.
  - Survive refreshes without relying on `localStorage`.

### Diagnostics

- [ ] Expand diagnostics to show recent sync and observation health.
  - Last SSE event
  - Last sync time
  - Last runtime issue capture time
  - Clear disconnected / reconnecting feedback

### UI Polish

- [ ] Run another toolbar and panel polish pass on narrow widths.
- [ ] Check badge counts, hover states, copied states, and disabled states.
- [ ] Check that the stability panel remains secondary and does not overload first-time users.

## P2: Required Before a Stronger Public v1 Story

### Connected Workflow Maturity

- [ ] Build a true connected timeline instead of isolated surfaces.
  - recorded
  - sent to AI
  - in progress
  - completed
  - validated
- [ ] Move repair-request conflict protection further into the service layer.
  - idempotency
  - ownership
  - multi-page consistency

### Browser-to-Code Accuracy

- [ ] Improve source hit accuracy beyond heuristic file guesses.
- [ ] Strengthen component-to-file mapping where available.
- [ ] Add better evidence bundling so the AI sees:
  - what element
  - where on screen
  - which surrounding text
  - which likely component or file

### Validation Loop

- [ ] Add a clearer post-fix verification step.
- [ ] Make it easy to distinguish:
  - issue recorded
  - issue diagnosed
  - code changed
  - fix verified

## Not Now

- [ ] Do not chase design-tool features such as `wireframe`, `placement`, or `rearrange` unless they directly improve code repair workflows.
- [ ] Do not expand settings into a large preference center before the core diagnosis model is stable.
- [ ] Do not compete with annotation products feature-for-feature on visual markup breadth alone.

## Suggested Release Framing

For the next release, position DevPilot as:

> A page-native frontend copilot for turning browser issues into structured AI-ready engineering tasks.

Suggested release tier:

- `Beta` for real users
- not yet `v1 stable`

## Exit Criteria

DevPilot is ready for Beta release when all of the following are true:

- [ ] the docs match the product users will actually see
- [ ] the main local flow is obvious: annotate -> copy to AI
- [ ] stability copilot is optional and understandable
- [ ] copied task packets help AI locate the likely fix target
- [ ] screenshot evidence is available or clearly queued next
- [ ] build and tests are green
- [ ] the product can be demoed end-to-end without explanation gaps
