# DevLens Workspace

This repository is the main workspace for the new DevLens frontend package.

Current focus:

- `devlens`: a page-native development toolbar
- annotation-first interaction
- page overlays, markers, popups, and session panels
- separate annotation and stability modes

The old stability-copilot drawer path has been removed from the mainline of this repo.

## Current Scope

At the moment this workspace contains:

- `packages/devlens`: the browser toolbar package
- roadmap and product docs for the next `devlens-mcp` phase

The local MCP bridge is planned next, but is not the current implementation focus.

See the roadmap:

- [DEVLENS_ROADMAP.md](/Users/didi/project/stability-copilot-platform/DEVLENS_ROADMAP.md)

## Development

- Node.js 20 or newer is currently required.
- Install dependencies with `npm install`.
- Run type checks with `npm run check`.
- Run a build with `npm run build`.
