import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { startHttpServer } from "../packages/devpilot-mcp/dist/http.js";
import { createStore } from "../packages/devpilot-mcp/dist/store.js";

function createTempDbPath() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "devpilot-mcp-start-"));
  return path.join(tempDir, "devpilot-mcp.sqlite");
}

test("startHttpServer falls back to the next port when the default port is occupied", async () => {
  const blocker = createServer(() => {});

  await new Promise((resolve) => {
    blocker.listen(0, resolve);
  });

  const blockerAddress = blocker.address();
  const occupiedPort =
    typeof blockerAddress === "object" && blockerAddress ? blockerAddress.port : 0;

  const store = createStore(createTempDbPath());
  const started = await startHttpServer(occupiedPort, store, { allowPortFallback: true });

  try {
    assert.notEqual(started.port, occupiedPort);
    assert.equal(started.didFallback, true);
    assert.equal(started.url, `http://localhost:${started.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      started.server.close((error) => (error ? reject(error) : resolve(undefined)));
    });
    store.close();
    await new Promise((resolve, reject) => {
      blocker.close((error) => (error ? reject(error) : resolve(undefined)));
    });
  }
});

test("startHttpServer throws a helpful error when fallback is disabled and the port is occupied", async () => {
  const blocker = createServer(() => {});

  await new Promise((resolve) => {
    blocker.listen(0, resolve);
  });

  const blockerAddress = blocker.address();
  const occupiedPort =
    typeof blockerAddress === "object" && blockerAddress ? blockerAddress.port : 0;

  const store = createStore(createTempDbPath());

  try {
    await assert.rejects(
      () => startHttpServer(occupiedPort, store, { allowPortFallback: false }),
      /Port .* is already in use/,
    );
  } finally {
    store.close();
    await new Promise((resolve, reject) => {
      blocker.close((error) => (error ? reject(error) : resolve(undefined)));
    });
  }
});
