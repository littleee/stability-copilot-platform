import test from "node:test";
import assert from "node:assert/strict";

import { mergeRemoteAnnotations } from "../packages/devpilot/dist/annotation/state.js";
import { mergeRemoteRepairRequests } from "../packages/devpilot/dist/repair/state.js";
import { mergeRemoteStabilityItems } from "../packages/devpilot/dist/stability/state.js";

test("mergeRemoteAnnotations keeps newer local items and sorts by updatedAt", () => {
  const remote = [
    {
      id: "ann-1",
      pathname: "/page",
      createdAt: 10,
      updatedAt: 20,
      status: "pending",
      comment: "remote old",
      elementName: "Button",
      elementPath: "button.primary",
      pageX: 10,
      pageY: 10,
      rect: { left: 0, top: 0, width: 10, height: 10 },
    },
  ];
  const local = [
    {
      id: "ann-1",
      pathname: "/page",
      createdAt: 10,
      updatedAt: 30,
      status: "acknowledged",
      comment: "local newer",
      elementName: "Button",
      elementPath: "button.primary",
      pageX: 10,
      pageY: 10,
      rect: { left: 0, top: 0, width: 10, height: 10 },
    },
    {
      id: "ann-2",
      pathname: "/page",
      createdAt: 15,
      updatedAt: 25,
      status: "pending",
      comment: "another",
      elementName: "Input",
      elementPath: "input.search",
      pageX: 20,
      pageY: 20,
      rect: { left: 0, top: 0, width: 10, height: 10 },
    },
  ];

  const merged = mergeRemoteAnnotations(local, remote);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, "ann-1");
  assert.equal(merged[0].comment, "local newer");
  assert.equal(merged[1].id, "ann-2");
});

test("mergeRemoteStabilityItems and mergeRemoteRepairRequests prefer newer timestamps", () => {
  const mergedItems = mergeRemoteStabilityItems(
    [
      {
        id: "sti-1",
        sessionId: "session-1",
        pathname: "/page",
        createdAt: 1,
        updatedAt: 8,
        status: "diagnosing",
        severity: "high",
        title: "Local",
        symptom: "local newer",
        context: {
          capturedAt: 1,
          title: "Page",
          url: "http://example.com/page",
          pathname: "/page",
          viewport: { width: 1280, height: 800 },
          openAnnotationCount: 0,
          openAnnotationComments: [],
        },
      },
    ],
    [
      {
        id: "sti-1",
        sessionId: "session-1",
        pathname: "/page",
        createdAt: 1,
        updatedAt: 5,
        status: "open",
        severity: "medium",
        title: "Remote",
        symptom: "remote older",
        context: {
          capturedAt: 1,
          title: "Page",
          url: "http://example.com/page",
          pathname: "/page",
          viewport: { width: 1280, height: 800 },
          openAnnotationCount: 0,
          openAnnotationComments: [],
        },
      },
    ],
  );

  assert.equal(mergedItems[0].status, "diagnosing");
  assert.equal(mergedItems[0].symptom, "local newer");

  const mergedRequests = mergeRemoteRepairRequests(
    [
      {
        id: "req-1",
        sessionId: "session-1",
        pathname: "/page",
        createdAt: 1,
        updatedAt: 9,
        status: "accepted",
        title: "Fix it",
        prompt: "newer request",
        requestedBy: "human",
      },
    ],
    [
      {
        id: "req-1",
        sessionId: "session-1",
        pathname: "/page",
        createdAt: 1,
        updatedAt: 4,
        status: "requested",
        title: "Fix it",
        prompt: "older request",
        requestedBy: "human",
      },
    ],
  );

  assert.equal(mergedRequests[0].status, "accepted");
  assert.equal(mergedRequests[0].prompt, "newer request");
});
