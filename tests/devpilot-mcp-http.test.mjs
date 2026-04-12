import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";

import { createHttpHandler } from "../packages/devpilot-mcp/dist/http.js";
import { createStore } from "../packages/devpilot-mcp/dist/store.js";

test("HTTP routes persist stability items and repair requests through a session", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devpilot-http-"));
  const dbPath = path.join(dir, "http.sqlite");
  const store = createStore(dbPath);
  const server = createServer(createHttpHandler(store));

  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}`;

    const sessionResponse = await fetch(`${baseUrl}/sessions/ensure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: "http://example.com/dashboard",
        pathname: "/dashboard",
        url: "http://example.com/dashboard",
        title: "Dashboard",
      }),
    });
    assert.equal(sessionResponse.status, 200);
    const session = await sessionResponse.json();

    const stabilityResponse = await fetch(`${baseUrl}/sessions/${session.id}/stability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "sti-http-1",
        pathname: "/dashboard",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "open",
        severity: "critical",
        title: "Dashboard crashes",
        symptom: "The page crashes after load",
        context: {
          capturedAt: Date.now(),
          pathname: "/dashboard",
          title: "Dashboard",
          url: "http://example.com/dashboard",
          viewport: { width: 1440, height: 900 },
          openAnnotationCount: 0,
          openAnnotationComments: [],
        },
      }),
    });
    assert.equal(stabilityResponse.status, 201);
    const stabilityItem = await stabilityResponse.json();
    assert.equal(stabilityItem.id, "sti-http-1");

    const repairResponse = await fetch(
      `${baseUrl}/sessions/${session.id}/repair-requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "req-http-1",
          stabilityItemId: stabilityItem.id,
          pathname: "/dashboard",
          title: "Fix dashboard crash",
          severity: "critical",
          prompt: "Please fix the crash.",
          requestedBy: "human",
        }),
      },
    );
    assert.equal(repairResponse.status, 201);
    const repairRequest = await repairResponse.json();
    assert.equal(repairRequest.id, "req-http-1");
    assert.equal(repairRequest.status, "requested");

    const repairPatchResponse = await fetch(`${baseUrl}/repair-requests/${repairRequest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        completedBy: "agent",
        resultSummary: "Patched the crash path.",
      }),
    });
    assert.equal(repairPatchResponse.status, 200);
    const updatedRequest = await repairPatchResponse.json();
    assert.equal(updatedRequest.status, "completed");
    assert.equal(updatedRequest.completedBy, "agent");
    assert.equal(updatedRequest.resultSummary, "Patched the crash path.");

    const sessionDetailResponse = await fetch(`${baseUrl}/sessions/${session.id}`);
    assert.equal(sessionDetailResponse.status, 200);
    const sessionDetail = await sessionDetailResponse.json();
    assert.equal(sessionDetail.stabilityItems.length, 1);
    assert.equal(sessionDetail.repairRequests.length, 1);
    assert.equal(sessionDetail.repairRequests[0].status, "completed");
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    store.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
