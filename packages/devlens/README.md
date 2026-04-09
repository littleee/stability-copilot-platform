# DevLens

`devlens` is a page-native annotation toolbar for collecting UI feedback and exporting it as structured context for AI-assisted code changes.

## Install

```bash
npm install @littleee/devpilot
```

`react` and `react-dom` are required peer dependencies.

## Zero-config Mount

```ts
import { mountDevLens } from "@littleee/devpilot";

mountDevLens();
```

## React

```tsx
import { DevLens } from "@littleee/devpilot";

export function App() {
  return (
    <>
      <YourApp />
      <DevLens />
    </>
  );
}
```

## Vue

```ts
import { createApp } from "vue";
import { mountDevLens } from "@littleee/devpilot";
import App from "./App.vue";

createApp(App).mount("#app");
mountDevLens();
```

## Optional Mount Options

```ts
mountDevLens({
  defaultOpen: false,
});
```
