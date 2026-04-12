# DevPilot

`@littleee/devpilot` is the published package for the DevPilot browser workflow.

Today, the package primarily exposes `DevPilot`: a page-native annotation toolbar for collecting UI feedback and exporting it as structured context for AI-assisted code changes.

Over time, DevPilot is intended to grow beyond annotation into MCP-powered code navigation, stability observation, and AI-assisted repair loops.

## Install

```bash
npm install @littleee/devpilot
```

`react` and `react-dom` are required peer dependencies.

## What You Get Today

- floating in-page toolbar
- element, text, and area annotations
- local session panel with annotation status tracking
- structured export for AI coding workflows
- optional stability workflow with manual issue capture
- optional auto observation for runtime errors and failed requests
- explicit repair request flow instead of automatic code modification
- optional MCP sync when an `endpoint` is provided

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
- stability module: opt-in
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

`@littleee/devpilot` is designed as a composable surface:

- `Core`: page annotation and export
- `Core + Stability`: issue capture, observation, and explicit repair requests
- `Core + MCP`: remote session sync for agents
- `Core + Stability + MCP`: collaborative repair loops with Claude / Cursor

DevPilot does not automatically modify code after annotation or observation. Repairs are created only when the user explicitly clicks `修复`.
