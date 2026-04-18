# DevPilot

`@littleee/devpilot` is the published package for the DevPilot browser workflow.

Today, the package exposes `DevPilot`: a page-native toolbar for collecting UI feedback in the browser and exporting it as structured context for AI-assisted code changes.

Over time, DevPilot is intended to grow beyond annotation into MCP-powered code navigation, stability observation, and AI-assisted repair loops.

## Install

```bash
npm install @littleee/devpilot
```

`react` and `react-dom` are required peer dependencies.

## What You Get Today

- floating in-page toolbar
- element, text, and area annotations
- structured task-packet export for AI coding workflows
- optional Stability Copilot for runtime errors and failed requests
- explicit repair request flow instead of automatic code modification
- optional MCP sync when an `endpoint` is provided

## Main Flow

The current local-first flow is intentionally simple:

```text
Annotate -> Copy to AI -> Diagnose / Fix
```

You do not need MCP to get value from the package. In local mode, DevPilot can already:

- record issues directly on the page
- package page context into an AI-friendly task packet
- support copy-and-paste handoff into Claude, Codex, Cursor, and similar tools

## Zero-config Mount

```ts
import { mountDevPilot } from "@littleee/devpilot";

mountDevPilot();
```

## Optional Mount Options

```ts
mountDevPilot({
  defaultOpen: false,
});
```

## Feature Flags

`DevPilot` is designed as a composable product surface:

- core annotation: enabled by default
- stability copilot: opt-in
- MCP sync: opt-in, or enabled when `endpoint` is provided

```ts
mountDevPilot({
  features: {
    stability: true,
    mcp: true,
  },
  endpoint: "http://127.0.0.1:4748",
});
```

If you want the stability module without remote sync:

```ts
mountDevPilot({
  features: {
    stability: true,
  },
});
```

When `stability` and `mcp` are both enabled, clicking the `修复` action in the stability panel creates an explicit repair request for AI agents. DevPilot does not automatically modify code after annotation.

## Product Modes

`@littleee/devpilot` supports two practical modes:

- `Local mode`
  - annotation and AI handoff only
  - no remote sync required
- `Connected mode`
  - MCP-backed sync for collaborative or agent-driven workflows
  - optional runtime issue capture and repair-request flow

## React

```tsx
import { DevPilot } from "@littleee/devpilot";

export function App() {
  return (
    <>
      <YourApp />
      <DevPilot />
    </>
  );
}
```

## Vue

```ts
import { createApp } from "vue";
import { mountDevPilot } from "@littleee/devpilot";
import App from "./App.vue";

createApp(App).mount("#app");
mountDevPilot();
```

## Current Scope

`@littleee/devpilot` is meant to stay useful even before the full connected workflow is enabled:

- `Core`: page annotation and AI handoff
- `Core + Stability`: issue capture, observation, and explicit repair requests
- `Core + MCP`: remote session sync for connected workflows
- `Core + Stability + MCP`: collaborative repair loops with Claude / Cursor

DevPilot does not automatically modify code after annotation or observation. Repairs are created only when the user explicitly clicks `修复`.
