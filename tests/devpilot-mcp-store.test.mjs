import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createStore } from "../packages/devpilot-mcp/dist/store.js";

function withTempStore(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devpilot-store-"));
  const dbPath = path.join(dir, "store.sqlite");
  const store = createStore(dbPath);

  try {
    return run(store);
  } finally {
    store.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("store keeps sessions, annotations, stability items, and repair requests linked", () =>
  withTempStore((store) => {
    const session = store.ensureSession({
      pageKey: "http://example.com/page",
      pathname: "/page",
      url: "http://example.com/page",
      title: "Example Page",
    });

    const annotation = store.addAnnotation(session.id, {
      id: "ann-1",
      pathname: "/page",
      createdAt: 1,
      updatedAt: 1,
      status: "pending",
      comment: "Fix this button",
      elementName: "Button",
      elementPath: "button.primary",
      pageX: 12,
      pageY: 24,
      rect: { left: 0, top: 0, width: 10, height: 10 },
      context: {
        cssClasses: ["primary", "cta"],
        selectorCandidates: ["button.primary", "[data-testid=submit]"],
        nearbyElements: ["form checkout", "label Confirm"],
        computedStyleSnapshot: {
          display: "inline-flex",
          color: "rgb(255, 255, 255)",
        },
        componentHints: ["CheckoutButton"],
        sourceHints: ["src/components/CheckoutButton.tsx"],
        dataAttributes: {
          "data-testid": "submit",
        },
      },
    });
    assert.ok(annotation);
    assert.deepEqual(annotation.context?.componentHints, ["CheckoutButton"]);

    const replied = store.addReply("ann-1", "agent", "Looking into it");
    assert.ok(replied);
    assert.equal(replied.replies.length, 1);

    const stabilityItem = store.addStabilityItem(session.id, {
      id: "sti-1",
      pathname: "/page",
      createdAt: 2,
      updatedAt: 2,
      status: "open",
      severity: "high",
      title: "Search fails",
      symptom: "Search request returns 500",
      context: {
        capturedAt: 2,
        title: "Example Page",
        url: "http://example.com/page",
        pathname: "/page",
        viewport: { width: 1280, height: 800 },
        openAnnotationCount: 1,
        openAnnotationComments: ["Button: Fix this button"],
      },
    });
    assert.ok(stabilityItem);

    const repairRequest = store.addRepairRequest(session.id, {
      id: "req-1",
      pathname: "/page",
      createdAt: 3,
      updatedAt: 3,
      status: "requested",
      title: "Repair search flow",
      prompt: "Please fix the failing search request",
      requestedBy: "human",
      stabilityItemId: "sti-1",
    });
    assert.ok(repairRequest);

    const fullSession = store.getSessionWithAnnotations(session.id);
    assert.ok(fullSession);
    assert.equal(fullSession.annotations.length, 1);
    assert.equal(fullSession.stabilityItems.length, 1);
    assert.equal(fullSession.repairRequests.length, 1);
    assert.equal(fullSession.annotations[0].replies.length, 1);
    assert.deepEqual(fullSession.annotations[0].context?.sourceHints, [
      "src/components/CheckoutButton.tsx",
    ]);
  }));
