import { z } from "zod";

export const GetSessionSchema = z.object({
  sessionId: z.string().describe("The session ID to inspect"),
});

export const GetPendingSchema = z.object({
  sessionId: z.string().describe("The session ID to get pending annotations for"),
});

export const GetSessionStabilitySchema = z.object({
  sessionId: z.string().describe("The session ID to inspect stability items for"),
});

export const AnnotationIdSchema = z.object({
  annotationId: z.string().describe("The annotation ID to update"),
});

export const StabilityItemIdSchema = z.object({
  stabilityItemId: z.string().describe("The stability item ID to update"),
});

export const RepairRequestIdSchema = z.object({
  repairRequestId: z.string().describe("The repair request ID to update"),
});

export const ResolveSchema = z.object({
  annotationId: z.string().describe("The annotation ID to resolve"),
  summary: z.string().optional().describe("Optional summary of what was changed"),
});

export const DismissSchema = z.object({
  annotationId: z.string().describe("The annotation ID to dismiss"),
  reason: z.string().describe("Reason for dismissing the annotation"),
});

export const ReplySchema = z.object({
  annotationId: z.string().describe("The annotation ID to reply to"),
  message: z.string().describe("Reply content for the annotation thread"),
});

export const ResolveStabilitySchema = z.object({
  stabilityItemId: z.string().describe("The stability item ID to resolve"),
});

export const CompleteRepairRequestSchema = z.object({
  repairRequestId: z.string().describe("The repair request ID to complete"),
  summary: z.string().optional().describe("Optional summary of what was changed"),
});

export const DismissRepairRequestSchema = z.object({
  repairRequestId: z.string().describe("The repair request ID to dismiss"),
  reason: z.string().describe("Reason for dismissing the repair request"),
});

export const WatchSchema = z.object({
  sessionId: z.string().optional().describe("Optional session ID to scope the watch"),
  batchWindowSeconds: z.number().min(1).max(60).optional().default(10),
  timeoutSeconds: z.number().min(1).max(300).optional().default(120),
});

export const TOOLS = [
  {
    name: "devpilot_list_sessions",
    description: "List all DevPilot sessions currently stored in the local bridge",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "devpilot_get_session",
    description: "Get a session with all annotations and replies",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "The session ID to inspect" },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "devpilot_get_pending",
    description: "Get all open annotations for a session",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "The session ID to inspect" },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "devpilot_get_all_pending",
    description: "Get all open annotations across all sessions",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "devpilot_list_stability_items",
    description: "List all open stability items across all sessions",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "devpilot_get_session_stability_items",
    description: "Get all stability items for a session",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "The session ID to inspect" },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "devpilot_get_stability_item",
    description: "Get a single stability item",
    inputSchema: {
      type: "object" as const,
      properties: {
        stabilityItemId: { type: "string", description: "The stability item ID to inspect" },
      },
      required: ["stabilityItemId"],
    },
  },
  {
    name: "devpilot_list_repair_requests",
    description: "List all open repair requests across all sessions",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "devpilot_get_repair_request",
    description: "Get a single repair request",
    inputSchema: {
      type: "object" as const,
      properties: {
        repairRequestId: { type: "string", description: "The repair request ID to inspect" },
      },
      required: ["repairRequestId"],
    },
  },
  {
    name: "devpilot_acknowledge",
    description: "Mark an annotation as acknowledged",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: { type: "string", description: "The annotation ID to acknowledge" },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "devpilot_resolve",
    description: "Mark an annotation as resolved and optionally add a summary reply",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: { type: "string", description: "The annotation ID to resolve" },
        summary: { type: "string", description: "Optional summary of what was fixed" },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "devpilot_dismiss",
    description: "Dismiss an annotation with a reason",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: { type: "string", description: "The annotation ID to dismiss" },
        reason: { type: "string", description: "Why the annotation is being dismissed" },
      },
      required: ["annotationId", "reason"],
    },
  },
  {
    name: "devpilot_reply",
    description: "Add a thread reply to an annotation",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: { type: "string", description: "The annotation ID to reply to" },
        message: { type: "string", description: "Reply content" },
      },
      required: ["annotationId", "message"],
    },
  },
  {
    name: "devpilot_diagnose_stability_item",
    description: "Mark a stability item as diagnosing",
    inputSchema: {
      type: "object" as const,
      properties: {
        stabilityItemId: { type: "string", description: "The stability item ID to mark as diagnosing" },
      },
      required: ["stabilityItemId"],
    },
  },
  {
    name: "devpilot_resolve_stability_item",
    description: "Mark a stability item as resolved",
    inputSchema: {
      type: "object" as const,
      properties: {
        stabilityItemId: { type: "string", description: "The stability item ID to resolve" },
      },
      required: ["stabilityItemId"],
    },
  },
  {
    name: "devpilot_accept_repair_request",
    description: "Mark a repair request as accepted for execution",
    inputSchema: {
      type: "object" as const,
      properties: {
        repairRequestId: { type: "string", description: "The repair request ID to accept" },
      },
      required: ["repairRequestId"],
    },
  },
  {
    name: "devpilot_complete_repair_request",
    description: "Mark a repair request as completed and optionally attach a summary",
    inputSchema: {
      type: "object" as const,
      properties: {
        repairRequestId: { type: "string", description: "The repair request ID to complete" },
        summary: { type: "string", description: "Optional summary of what was changed" },
      },
      required: ["repairRequestId"],
    },
  },
  {
    name: "devpilot_dismiss_repair_request",
    description: "Dismiss a repair request with a reason",
    inputSchema: {
      type: "object" as const,
      properties: {
        repairRequestId: { type: "string", description: "The repair request ID to dismiss" },
        reason: { type: "string", description: "Why the repair request is being dismissed" },
      },
      required: ["repairRequestId", "reason"],
    },
  },
  {
    name: "devpilot_watch_annotations",
    description: "Wait for new open annotations via SSE, then return them as a batch",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "Optional session ID to scope the watch" },
        batchWindowSeconds: { type: "number", description: "Seconds to keep batching after the first new annotation" },
        timeoutSeconds: { type: "number", description: "How long to wait before timing out" },
      },
      required: [],
    },
  },
  {
    name: "devpilot_watch_stability_items",
    description: "Wait for new open stability items via SSE, then return them as a batch",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "Optional session ID to scope the watch" },
        batchWindowSeconds: { type: "number", description: "Seconds to keep batching after the first new stability item" },
        timeoutSeconds: { type: "number", description: "How long to wait before timing out" },
      },
      required: [],
    },
  },
  {
    name: "devpilot_watch_repair_requests",
    description: "Wait for new open repair requests via SSE, then return them as a batch",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: { type: "string", description: "Optional session ID to scope the watch" },
        batchWindowSeconds: { type: "number", description: "Seconds to keep batching after the first new repair request" },
        timeoutSeconds: { type: "number", description: "How long to wait before timing out" },
      },
      required: [],
    },
  },
];
