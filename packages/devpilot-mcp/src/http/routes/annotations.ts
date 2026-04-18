import type { DevPilotAnnotationRecord } from "../../types.js";
import type { HttpRouteHandler } from "../context.js";
import { parseBody, sendError, sendJson } from "../shared.js";

export const handleAnnotationRoutes: HttpRouteHandler = async ({
  req,
  res,
  pathname,
  store,
  events,
}) => {
  const sessionPendingMatch = pathname.match(/^\/sessions\/([^/]+)\/pending$/);
  if (req.method === "GET" && sessionPendingMatch) {
    const annotations = store.getPendingAnnotations(sessionPendingMatch[1]);
    sendJson(res, 200, { count: annotations.length, annotations });
    return true;
  }

  if (req.method === "GET" && pathname === "/pending") {
    const annotations = store.getAllPendingAnnotations();
    sendJson(res, 200, { count: annotations.length, annotations });
    return true;
  }

  const addAnnotationMatch = pathname.match(/^\/sessions\/([^/]+)\/annotations$/);
  if (req.method === "POST" && addAnnotationMatch) {
    const body = await parseBody<Omit<DevPilotAnnotationRecord, "sessionId" | "replies">>(req);
    if (!body.id || !body.comment || !body.elementName || !body.elementPath || !body.rect) {
      sendError(
        res,
        400,
        "annotation id, comment, elementName, elementPath, and rect are required",
      );
      return true;
    }

    const annotation = store.addAnnotation(addAnnotationMatch[1], body);
    if (!annotation) {
      sendError(res, 404, "Session not found");
      return true;
    }

    events.emitEvent("annotation.created", annotation.sessionId, annotation);
    sendJson(res, 201, annotation);
    return true;
  }

  const annotationMatch = pathname.match(/^\/annotations\/([^/]+)$/);
  if (annotationMatch && req.method === "GET") {
    const annotation = store.getAnnotation(annotationMatch[1]);
    if (!annotation) {
      sendError(res, 404, "Annotation not found");
      return true;
    }
    sendJson(res, 200, annotation);
    return true;
  }

  if (annotationMatch && req.method === "PATCH") {
    const body = await parseBody<Partial<DevPilotAnnotationRecord>>(req);
    const annotation = store.updateAnnotation(annotationMatch[1], body);
    if (!annotation) {
      sendError(res, 404, "Annotation not found");
      return true;
    }
    events.emitEvent("annotation.updated", annotation.sessionId, annotation);
    sendJson(res, 200, annotation);
    return true;
  }

  if (annotationMatch && req.method === "DELETE") {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const hard = url.searchParams.get("hard") === "true";
    const actor = (req.headers["x-devpilot-actor"] as string) || "human";
    let deleted;
    if (hard) {
      deleted = store.hardDeleteAnnotation(annotationMatch[1]);
    } else {
      deleted = store.deleteAnnotation(annotationMatch[1], actor as "human" | "agent");
    }
    if (!deleted) {
      sendError(res, 404, "Annotation not found");
      return true;
    }
    events.emitEvent("annotation.deleted", deleted.sessionId, { ...deleted, deletedBy: actor });
    sendJson(res, 200, { deleted: true, annotationId: annotationMatch[1] });
    return true;
  }

  const threadMatch = pathname.match(/^\/annotations\/([^/]+)\/thread$/);
  if (threadMatch && req.method === "POST") {
    const body = await parseBody<{ role: "human" | "agent"; content: string }>(req);
    if (!body.role || !body.content) {
      sendError(res, 400, "role and content are required");
      return true;
    }
    const annotation = store.addReply(threadMatch[1], body.role, body.content);
    if (!annotation) {
      sendError(res, 404, "Annotation not found");
      return true;
    }
    events.emitEvent("thread.message", annotation.sessionId, annotation);
    sendJson(res, 201, annotation);
    return true;
  }

  return false;
};
