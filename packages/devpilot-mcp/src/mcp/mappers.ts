import type {
  DevPilotAnnotationRecord,
  DevPilotRepairRequestRecord,
  DevPilotSessionRecord,
  DevPilotStabilityItemRecord,
} from "../types.js";

export function mapAnnotation(annotation: DevPilotAnnotationRecord) {
  return {
    id: annotation.id,
    sessionId: annotation.sessionId,
    pathname: annotation.pathname,
    kind: annotation.kind || "element",
    status: annotation.status,
    comment: annotation.comment,
    elementName: annotation.elementName,
    elementPath: annotation.elementPath,
    matchCount: annotation.matchCount,
    selectedText: annotation.selectedText,
    nearbyText: annotation.nearbyText,
    relatedElements: annotation.relatedElements || [],
    rect: annotation.rect,
    pageX: annotation.pageX,
    pageY: annotation.pageY,
    createdAt: annotation.createdAt,
    updatedAt: annotation.updatedAt,
    resolvedAt: annotation.resolvedAt,
    resolvedBy: annotation.resolvedBy,
    replies: annotation.replies || [],
  };
}

export function mapSession(session: DevPilotSessionRecord) {
  return {
    id: session.id,
    pageKey: session.pageKey,
    pathname: session.pathname,
    title: session.title,
    url: session.url,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function mapStabilityItem(item: DevPilotStabilityItemRecord) {
  return {
    id: item.id,
    sessionId: item.sessionId,
    pathname: item.pathname,
    status: item.status,
    severity: item.severity,
    title: item.title,
    symptom: item.symptom,
    reproSteps: item.reproSteps,
    impact: item.impact,
    signals: item.signals,
    fixGoal: item.fixGoal,
    context: item.context,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function mapRepairRequest(request: DevPilotRepairRequestRecord) {
  return {
    id: request.id,
    sessionId: request.sessionId,
    stabilityItemId: request.stabilityItemId,
    pathname: request.pathname,
    status: request.status,
    title: request.title,
    severity: request.severity,
    prompt: request.prompt,
    requestedBy: request.requestedBy,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt,
    completedBy: request.completedBy,
    resultSummary: request.resultSummary,
  };
}
