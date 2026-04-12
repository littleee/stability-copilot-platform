import type { DevPilotEnsureSessionInput } from "../../types.js";
import type { HttpRouteHandler } from "../context.js";
import { parseBody, sendError, sendJson } from "../shared.js";

export const handleSessionRoutes: HttpRouteHandler = async ({
  req,
  res,
  url,
  pathname,
  store,
  events,
}) => {
  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, dbPath: store.getDbPath() });
    return true;
  }

  if (req.method === "GET" && pathname === "/events") {
    return events.handleEventsRequest(req, res, url);
  }

  if (req.method === "POST" && pathname === "/sessions/ensure") {
    const body = await parseBody<DevPilotEnsureSessionInput>(req);
    if (!body.pageKey || !body.pathname || !body.url) {
      sendError(res, 400, "pageKey, pathname, and url are required");
      return true;
    }

    const session = store.ensureSession({
      pageKey: body.pageKey,
      pathname: body.pathname,
      url: body.url,
      title: body.title || body.pathname,
    });
    events.emitEvent("session.updated", session.id, session);
    sendJson(res, 200, session);
    return true;
  }

  if (req.method === "GET" && pathname === "/sessions") {
    sendJson(res, 200, store.listSessions());
    return true;
  }

  const sessionMatch = pathname.match(/^\/sessions\/([^/]+)$/);
  if (req.method === "GET" && sessionMatch) {
    const session = store.getSessionWithAnnotations(sessionMatch[1]);
    if (!session) {
      sendError(res, 404, "Session not found");
      return true;
    }
    sendJson(res, 200, session);
    return true;
  }

  const sessionEventsMatch = pathname.match(/^\/sessions\/([^/]+)\/events$/);
  if (req.method === "GET" && sessionEventsMatch) {
    const sessionId = sessionEventsMatch[1];
    const session = store.getSession(sessionId);
    if (!session) {
      sendError(res, 404, "Session not found");
      return true;
    }

    return events.handleEventsRequest(req, res, url, sessionId);
  }

  return false;
};
