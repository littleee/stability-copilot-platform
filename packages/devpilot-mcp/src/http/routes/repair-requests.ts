import type { DevPilotRepairRequestRecord } from "../../types.js";
import type { HttpRouteHandler } from "../context.js";
import { parseBody, sendError, sendJson } from "../shared.js";

export const handleRepairRequestRoutes: HttpRouteHandler = async ({
  req,
  res,
  pathname,
  store,
  events,
}) => {
  if (req.method === "GET" && pathname === "/repair-requests/open") {
    const items = store.getAllOpenRepairRequests();
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  const sessionRepairRequestsMatch = pathname.match(/^\/sessions\/([^/]+)\/repair-requests$/);
  if (req.method === "GET" && sessionRepairRequestsMatch) {
    const items = store.getSessionRepairRequests(sessionRepairRequestsMatch[1]);
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  const sessionOpenRepairRequestsMatch = pathname.match(
    /^\/sessions\/([^/]+)\/repair-requests\/open$/,
  );
  if (req.method === "GET" && sessionOpenRepairRequestsMatch) {
    const items = store.getOpenSessionRepairRequests(sessionOpenRepairRequestsMatch[1]);
    sendJson(res, 200, { count: items.length, items });
    return true;
  }

  if (req.method === "POST" && sessionRepairRequestsMatch) {
    const body = await parseBody<Omit<DevPilotRepairRequestRecord, "sessionId">>(req);
    if (!body.title || !body.prompt || !body.pathname) {
      sendError(res, 400, "repair request title, prompt, and pathname are required");
      return true;
    }

    const request = store.addRepairRequest(sessionRepairRequestsMatch[1], {
      ...body,
      id: body.id || `req_${Date.now().toString(36)}`,
    });
    if (!request) {
      sendError(res, 404, "Session not found");
      return true;
    }

    events.emitEvent("repair-request.created", request.sessionId, request);
    sendJson(res, 201, request);
    return true;
  }

  const repairRequestMatch = pathname.match(/^\/repair-requests\/([^/]+)$/);
  if (repairRequestMatch && req.method === "GET") {
    const request = store.getRepairRequest(repairRequestMatch[1]);
    if (!request) {
      sendError(res, 404, "Repair request not found");
      return true;
    }
    sendJson(res, 200, request);
    return true;
  }

  if (repairRequestMatch && req.method === "PATCH") {
    const body = await parseBody<Partial<DevPilotRepairRequestRecord>>(req);
    const request = store.updateRepairRequest(repairRequestMatch[1], body);
    if (!request) {
      sendError(res, 404, "Repair request not found");
      return true;
    }
    events.emitEvent("repair-request.updated", request.sessionId, request);
    sendJson(res, 200, request);
    return true;
  }

  return false;
};
