# DevPilot

`@littleee/devpilot` is a page-native frontend copilot for turning what happens in the browser into actionable engineering work.

The long-term goal is a single workflow that can:

- annotate real UI directly on the page
- capture JavaScript and stability issues with page context
- connect browser observations to local code through MCP
- hand structured tasks to AI tools for assisted or automated fixes

Today, the repository ships the first practical foundation of that workflow: a browser-native toolbar called `DevPilot`.

## What Exists Today

Current `v0.1.x` capabilities:

- floating in-page toolbar mounted through a Shadow DOM host
- element, text, and area annotations created directly on the live page
- local annotation state with lightweight status tracking
- one-click AI handoff through structured task-packet export
- optional Stability Copilot for runtime issues and failed requests
- optional MCP-backed sync when an endpoint is provided

The current product shape is intentionally simple:

```text
Annotate -> Copy to AI -> Diagnose / Fix
```

This makes DevPilot useful today as a lightweight page feedback and AI handoff layer, even before the broader connected repair workflow is fully complete.

## Where It Is Going

DevPilot is being built toward a broader frontend incident and repair workflow:

- MCP-backed workspace linking from browser context to local source files
- stability observation for runtime errors, request failures, and incident grouping
- richer connected workflow history that can include AI replies and code actions
- AI-assisted and eventually automated fix loops for selected classes of issues

## Package

The published npm package is:

```bash
npm install @littleee/devpilot
```

Right now the package exports the `DevPilot` mounting API and UI components.

## Product Modes

DevPilot is one product with two usage modes:

- `Local mode`
  - annotate directly on the page
  - capture structured browser context
  - copy a task packet into Claude, Codex, Cursor, or similar tools
- `Connected mode`
  - connect the browser session to local engineering workflows through MCP
  - optionally sync runtime issues and repair requests
  - support collaborative or agent-assisted repair loops

Most users should be able to start in local mode without any backend setup.

## Quick Start

Zero-config mount:

```ts
import { mountDevPilot } from "@littleee/devpilot";

mountDevPilot();
```

React:

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

## Workspace

Current workspace contents:

- `packages/devpilot`: the published browser toolbar package behind `@littleee/devpilot`

## Development

- Node.js 20 or newer is required.
- Install dependencies with `npm install`.
- Build with `npm run build`.
- Type-check with `npm run check`.

## License

MIT. See [LICENSE](/Users/littleee/project/stability-copilot-platform/LICENSE).
