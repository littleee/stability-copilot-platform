import type {
  DevPilotAnnotationRecord,
  DevPilotRepairRequestRecord,
  DevPilotStabilityItemRecord,
  OpenRepairRequestsResponse,
  OpenStabilityItemsResponse,
  PendingAnnotationsResponse,
} from "../types.js";
import { getHttpBaseUrl, httpGet } from "./http-client.js";

type TimeoutOrError =
  | { type: "timeout" }
  | { type: "error"; message: string };

export type DevPilotWatchResult =
  | { type: "annotations"; annotations: DevPilotAnnotationRecord[] }
  | TimeoutOrError;

export type DevPilotStabilityWatchResult =
  | { type: "items"; items: DevPilotStabilityItemRecord[] }
  | TimeoutOrError;

export type DevPilotRepairWatchResult =
  | { type: "requests"; requests: DevPilotRepairRequestRecord[] }
  | TimeoutOrError;

type WatchEventResult<T, TResult> = {
  eventTypes: string[];
  acceptPayload: (payload: T) => boolean;
  resultType: TResult;
};

async function watchForStreamItems<T extends { id: string }, TResult extends string>(
  sessionId: string | undefined,
  batchWindowMs: number,
  timeoutMs: number,
  config: WatchEventResult<T, TResult>,
): Promise<{ type: TResult; items: T[] } | TimeoutOrError> {
  return new Promise((resolve) => {
    let aborted = false;
    const controller = new AbortController();
    let batchTimer: ReturnType<typeof setTimeout> | null = null;
    const collected = new Map<string, T>();

    const cleanup = () => {
      aborted = true;
      controller.abort();
      if (batchTimer) {
        clearTimeout(batchTimer);
      }
      clearTimeout(timeoutId);
    };

    const finishWithItems = () => {
      cleanup();
      resolve({
        type: config.resultType,
        items: Array.from(collected.values()),
      });
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({ type: "timeout" });
    }, timeoutMs);

    const baseUrl = getHttpBaseUrl();
    const sseUrl = sessionId
      ? `${baseUrl}/sessions/${sessionId}/events?agent=true`
      : `${baseUrl}/events?agent=true`;

    fetch(sseUrl, {
      signal: controller.signal,
      headers: {
        Accept: "text/event-stream",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          cleanup();
          resolve({
            type: "error",
            message: `HTTP server returned ${response.status}: ${response.statusText}`,
          });
          return;
        }

        if (!response.body) {
          cleanup();
          resolve({ type: "error", message: "No response body from SSE endpoint" });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) {
            if (!aborted) {
              if (collected.size > 0) {
                finishWithItems();
              } else {
                cleanup();
                resolve({
                  type: "error",
                  message:
                    "SSE connection closed unexpectedly. The devpilot-mcp server may have restarted.",
                });
              }
            }
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const lines = chunk
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);

            const dataLine = lines.find((line) => line.startsWith("data: "));
            if (!dataLine) {
              continue;
            }

            try {
              const event = JSON.parse(dataLine.slice(6)) as {
                type: string;
                sequence?: number;
                payload?: T;
              };

              if (!config.eventTypes.includes(event.type)) {
                continue;
              }

              if (event.sequence === 0 || !event.payload) {
                continue;
              }

              if (!config.acceptPayload(event.payload)) {
                continue;
              }

              collected.set(event.payload.id, event.payload);

              if (!batchTimer) {
                batchTimer = setTimeout(() => {
                  finishWithItems();
                }, batchWindowMs);
              }
            } catch {
              // Ignore malformed SSE events.
            }
          }
        }
      })
      .catch((error) => {
        if (aborted) {
          return;
        }

        cleanup();
        const message =
          error instanceof Error ? error.message : "Unknown connection error";
        if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
          resolve({
            type: "error",
            message: `Cannot connect to HTTP server at ${baseUrl}. Is devpilot-mcp running?`,
          });
          return;
        }

        if (message.toLowerCase().includes("abort")) {
          resolve({ type: "timeout" });
          return;
        }

        resolve({ type: "error", message: `Connection error: ${message}` });
      });
  });
}

export async function drainPending(
  sessionId: string | undefined,
): Promise<PendingAnnotationsResponse> {
  return sessionId
    ? httpGet<PendingAnnotationsResponse>(`/sessions/${sessionId}/pending`)
    : httpGet<PendingAnnotationsResponse>("/pending");
}

export async function drainOpenStabilityItems(
  sessionId: string | undefined,
): Promise<OpenStabilityItemsResponse> {
  return sessionId
    ? httpGet<OpenStabilityItemsResponse>(`/sessions/${sessionId}/stability/open`)
    : httpGet<OpenStabilityItemsResponse>("/stability/open");
}

export async function drainOpenRepairRequests(
  sessionId: string | undefined,
): Promise<OpenRepairRequestsResponse> {
  return sessionId
    ? httpGet<OpenRepairRequestsResponse>(`/sessions/${sessionId}/repair-requests/open`)
    : httpGet<OpenRepairRequestsResponse>("/repair-requests/open");
}

export function watchForAnnotations(
  sessionId: string | undefined,
  batchWindowMs: number,
  timeoutMs: number,
): Promise<DevPilotWatchResult> {
  return watchForStreamItems<DevPilotAnnotationRecord, "annotations">(
    sessionId,
    batchWindowMs,
    timeoutMs,
    {
    eventTypes: ["annotation.created"],
    acceptPayload(payload) {
      return payload.status === "pending" || payload.status === "acknowledged";
    },
    resultType: "annotations",
    },
  ).then((result) => {
    if (result.type === "annotations") {
      return { type: "annotations", annotations: result.items };
    }
    return result;
  });
}

export function watchForStabilityItems(
  sessionId: string | undefined,
  batchWindowMs: number,
  timeoutMs: number,
): Promise<DevPilotStabilityWatchResult> {
  return watchForStreamItems<DevPilotStabilityItemRecord, "items">(
    sessionId,
    batchWindowMs,
    timeoutMs,
    {
      eventTypes: ["stability.created", "stability.updated"],
      acceptPayload(payload) {
        return payload.status === "open" || payload.status === "diagnosing";
      },
      resultType: "items",
    },
  ).then((result) => {
    if (result.type === "items") {
      return { type: "items", items: result.items };
    }
    return result;
  });
}

export function watchForRepairRequests(
  sessionId: string | undefined,
  batchWindowMs: number,
  timeoutMs: number,
): Promise<DevPilotRepairWatchResult> {
  return watchForStreamItems<DevPilotRepairRequestRecord, "requests">(
    sessionId,
    batchWindowMs,
    timeoutMs,
    {
      eventTypes: ["repair-request.created", "repair-request.updated"],
      acceptPayload(payload) {
        return payload.status === "requested" || payload.status === "accepted";
      },
      resultType: "requests",
    },
  ).then((result) => {
    if (result.type === "requests") {
      return { type: "requests", requests: result.items };
    }
    return result;
  });
}
