import type { IncomingMessage, ServerResponse } from "node:http";

import type { DevPilotStore } from "../store.js";

export type DevPilotStreamEventType =
  | "session.created"
  | "session.updated"
  | "annotation.created"
  | "annotation.updated"
  | "annotation.deleted"
  | "stability.created"
  | "stability.updated"
  | "stability.deleted"
  | "repair-request.created"
  | "repair-request.updated"
  | "thread.message";

export type DevPilotStreamEvent = {
  type: DevPilotStreamEventType;
  timestamp: string;
  sessionId: string;
  sequence: number;
  payload: unknown;
};

export interface DevPilotEventStreamHub {
  emitEvent: (
    type: DevPilotStreamEventType,
    sessionId: string,
    payload: unknown,
  ) => void;
  handleEventsRequest: (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    sessionId?: string,
  ) => boolean;
}

export function createEventStreamHub(
  store: DevPilotStore,
): DevPilotEventStreamHub {
  let nextSequence = 1;
  const eventHistory: DevPilotStreamEvent[] = [];
  const globalSubscribers = new Set<ServerResponse>();
  const sessionSubscribers = new Map<string, Set<ServerResponse>>();

  const sendSseEvent = (
    res: ServerResponse,
    event: DevPilotStreamEvent,
  ): void => {
    res.write(`event: ${event.type}\n`);
    res.write(`id: ${event.sequence}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const registerSubscriber = (res: ServerResponse, sessionId?: string): void => {
    if (sessionId) {
      const scoped = sessionSubscribers.get(sessionId) || new Set<ServerResponse>();
      scoped.add(res);
      sessionSubscribers.set(sessionId, scoped);
      return;
    }

    globalSubscribers.add(res);
  };

  const unregisterSubscriber = (
    res: ServerResponse,
    sessionId?: string,
  ): void => {
    if (sessionId) {
      const scoped = sessionSubscribers.get(sessionId);
      if (!scoped) {
        return;
      }
      scoped.delete(res);
      if (scoped.size === 0) {
        sessionSubscribers.delete(sessionId);
      }
      return;
    }

    globalSubscribers.delete(res);
  };

  const replayEvents = (
    res: ServerResponse,
    lastEventId: string | string[] | undefined,
    sessionId?: string,
  ): void => {
    const lastSequence = Number.parseInt(
      Array.isArray(lastEventId) ? lastEventId[0] : lastEventId || "",
      10,
    );
    if (Number.isNaN(lastSequence)) {
      return;
    }

    eventHistory
      .filter((event) => event.sequence > lastSequence)
      .filter((event) => (sessionId ? event.sessionId === sessionId : true))
      .forEach((event) => sendSseEvent(res, event));
  };

  const sendInitialPendingEvents = (
    res: ServerResponse,
    sessionId?: string,
  ): void => {
    const pendingAnnotations = sessionId
      ? store.getPendingAnnotations(sessionId)
      : store.getAllPendingAnnotations();

    pendingAnnotations.forEach((annotation) => {
      sendSseEvent(res, {
        type: "annotation.created",
        sessionId: annotation.sessionId,
        timestamp: new Date(annotation.createdAt).toISOString(),
        sequence: 0,
        payload: annotation,
      });
    });

    res.write(
      `event: sync.complete\ndata: ${JSON.stringify({
        sessionId: sessionId || "all",
        count: pendingAnnotations.length,
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );
  };

  return {
    emitEvent(type, sessionId, payload) {
      const event: DevPilotStreamEvent = {
        type,
        sessionId,
        payload,
        timestamp: new Date().toISOString(),
        sequence: nextSequence,
      };
      nextSequence += 1;
      eventHistory.push(event);
      if (eventHistory.length > 500) {
        eventHistory.shift();
      }

      const targets = new Set<ServerResponse>(globalSubscribers);
      const scoped = sessionSubscribers.get(sessionId);
      if (scoped) {
        scoped.forEach((subscriber) => targets.add(subscriber));
      }

      targets.forEach((subscriber) => sendSseEvent(subscriber, event));
    },
    handleEventsRequest(req, res, url, sessionId) {
      const isAgent = url.searchParams.get("agent") === "true";

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");

      replayEvents(res, req.headers["last-event-id"], sessionId);
      if (isAgent) {
        sendInitialPendingEvents(res, sessionId);
      }

      registerSubscriber(res, sessionId);
      const keepAlive = setInterval(() => {
        res.write(": ping\n\n");
      }, 30000);

      req.on("close", () => {
        clearInterval(keepAlive);
        unregisterSubscriber(res, sessionId);
      });

      return true;
    },
  };
}
