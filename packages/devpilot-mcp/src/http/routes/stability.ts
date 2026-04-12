import type { DevPilotStabilityItemRecord } from "../../types.js";
import type { HttpRouteHandler } from "../context.js";
import { parseBody, sendError, sendJson } from "../shared.js";

export const handleStabilityRoutes: HttpRouteHandler = async ({
  req,
  res,
  pathname,
  store,
  events,
}) => {
  const sessionStabilityMatch = pathname.match(/^\/sessions\/([^/]+)\/stability$/);
  if (req.method === "GET" && sessionStabilityMatch) {
    const items = store.getSessionStabilityItems(sessionStabilityMatch[1]);
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  const sessionOpenStabilityMatch = pathname.match(
    /^\/sessions\/([^/]+)\/stability\/open$/,
  );
  if (req.method === "GET" && sessionOpenStabilityMatch) {
    const items = store.getOpenSessionStabilityItems(sessionOpenStabilityMatch[1]);
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  if (req.method === "GET" && pathname === "/stability/open") {
    const items = store.getAllOpenStabilityItems();
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  if (req.method === "POST" && sessionStabilityMatch) {
    const body = await parseBody<Omit<DevPilotStabilityItemRecord, "sessionId">>(req);
    if (!body.id || !body.title || !body.symptom || !body.context) {
      sendError(res, 400, "stability item id, title, symptom, and context are required");
      return true;
    }

    const item = store.addStabilityItem(sessionStabilityMatch[1], body);
    if (!item) {
      sendError(res, 404, "Session not found");
      return true;
    }

    events.emitEvent("stability.created", item.sessionId, item);
    sendJson(res, 201, item);
    return true;
  }

  const stabilityMatch = pathname.match(/^\/stability\/([^/]+)$/);
  if (stabilityMatch && req.method === "GET") {
    const item = store.getStabilityItem(stabilityMatch[1]);
    if (!item) {
      sendError(res, 404, "Stability item not found");
      return true;
    }
    sendJson(res, 200, item);
    return true;
  }

  if (stabilityMatch && req.method === "PATCH") {
    const body = await parseBody<Partial<DevPilotStabilityItemRecord>>(req);
    const item = store.updateStabilityItem(stabilityMatch[1], body);
    if (!item) {
      sendError(res, 404, "Stability item not found");
      return true;
    }
    events.emitEvent("stability.updated", item.sessionId, item);
    sendJson(res, 200, item);
    return true;
  }

  if (stabilityMatch && req.method === "DELETE") {
    const deleted = store.deleteStabilityItem(stabilityMatch[1]);
    if (!deleted) {
      sendError(res, 404, "Stability item not found");
      return true;
    }
    events.emitEvent("stability.deleted", deleted.sessionId, deleted);
    sendJson(res, 200, { deleted: true, stabilityItemId: stabilityMatch[1] });
    return true;
  }

  return false;
};
