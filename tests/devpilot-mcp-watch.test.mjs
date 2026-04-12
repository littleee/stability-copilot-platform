import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";

import { createHttpHandler } from "../packages/devpilot-mcp/dist/http.js";
import { setHttpBaseUrl } from "../packages/devpilot-mcp/dist/mcp/http-client.js";
import { watchForAnnotations } from "../packages/devpilot-mcp/dist/mcp/watch.js";
import { createStore } from "../packages/devpilot-mcp/dist/store.js";

test("watchForAnnotations receives new pending annotations from SSE", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devpilot-watch-"));
  const dbPath = path.join(dir, "watch.sqlite");
  const store = createStore(dbPath);
  const server = createServer(createHttpHandler(store));

  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}`;

    setHttpBaseUrl(baseUrl);

    const sessionResponse = await fetch(`${baseUrl}/sessions/ensure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: "http://example.com/page",
        pathname: "/page",
        url: "http://example.com/page",
        title: "Example Page",
      }),
    });
    assert.equal(sessionResponse.status, 200);
    const session = await sessionResponse.json();

    const watchPromise = watchForAnnotations(session.id, 50, 2000);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const annotationResponse = await fetch(
      `${baseUrl}/sessions/${session.id}/annotations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "ann-watch-1",
          pathname: "/page",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "pending",
          comment: "Watch me",
          elementName: "Button",
          elementPath: "button.primary",
          pageX: 20,
          pageY: 20,
          rect: { left: 0, top: 0, width: 12, height: 12 },
        }),
      },
    );
    assert.equal(annotationResponse.status, 201);

    const result = await watchPromise;
    assert.equal(result.type, "annotations");
    assert.equal(result.annotations.length, 1);
    assert.equal(result.annotations[0].id, "ann-watch-1");
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    store.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
