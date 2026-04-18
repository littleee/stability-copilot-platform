import Database from "better-sqlite3";

import type {
  DevPilotAnnotationRecord,
  DevPilotAnnotationReply,
  DevPilotAnnotationStatus,
  DevPilotSessionRecord,
} from "../types.js";
import { createId, rowToAnnotation as mapAnnotationRow, rowToReply, serializeAnnotation } from "./mappers.js";
import type { AnnotationRow, ReplyRow } from "./row-types.js";

type AnnotationRepositoryDeps = {
  getSessionById: (id: string) => DevPilotSessionRecord | null;
  touchSession: (sessionId: string) => void;
};

export function createAnnotationRepository(
  db: Database.Database,
  deps: AnnotationRepositoryDeps,
) {
  const statements = {
    getAnnotationById: db.prepare("SELECT * FROM annotations WHERE id = ?"),
    getAnnotationsBySession: db.prepare(`
      SELECT * FROM annotations
      WHERE session_id = ? AND deleted_at IS NULL
      ORDER BY updated_at DESC, created_at DESC
    `),
    getPendingBySession: db.prepare(`
      SELECT * FROM annotations
      WHERE session_id = ? AND status IN ('pending', 'acknowledged') AND deleted_at IS NULL
      ORDER BY updated_at DESC, created_at DESC
    `),
    getPendingAll: db.prepare(`
      SELECT * FROM annotations
      WHERE status IN ('pending', 'acknowledged') AND deleted_at IS NULL
      ORDER BY updated_at DESC, created_at DESC
    `),
    insertAnnotation: db.prepare(`
      INSERT INTO annotations (
        id, session_id, pathname, created_at, updated_at, kind, status, comment,
        element_name, element_path, match_count, selected_text, nearby_text,
        related_elements, page_x, page_y, rect_json, context_json, resolved_at, resolved_by
      ) VALUES (
        @id, @sessionId, @pathname, @createdAt, @updatedAt, @kind, @status, @comment,
        @elementName, @elementPath, @matchCount, @selectedText, @nearbyText,
        @relatedElements, @pageX, @pageY, @rectJson, @contextJson, @resolvedAt, @resolvedBy
      )
    `),
    updateAnnotation: db.prepare(`
      UPDATE annotations SET
        pathname = @pathname,
        updated_at = @updatedAt,
        kind = @kind,
        status = @status,
        comment = @comment,
        element_name = @elementName,
        element_path = @elementPath,
        match_count = @matchCount,
        selected_text = @selectedText,
        nearby_text = @nearbyText,
        related_elements = @relatedElements,
        page_x = @pageX,
        page_y = @pageY,
        rect_json = @rectJson,
        context_json = @contextJson,
        resolved_at = @resolvedAt,
        resolved_by = @resolvedBy
      WHERE id = @id
    `),
    deleteAnnotation: db.prepare("DELETE FROM annotations WHERE id = ?"),
    deleteRepliesByAnnotation: db.prepare("DELETE FROM annotation_replies WHERE annotation_id = ?"),
    getRepliesByAnnotation: db.prepare(`
      SELECT * FROM annotation_replies
      WHERE annotation_id = ?
      ORDER BY created_at ASC
    `),
    insertReply: db.prepare(`
      INSERT INTO annotation_replies (id, annotation_id, role, content, created_at)
      VALUES (@id, @annotationId, @role, @content, @createdAt)
    `),
  };

  function rowToAnnotation(row: AnnotationRow): DevPilotAnnotationRecord {
    return mapAnnotationRow(
      row,
      (statements.getRepliesByAnnotation.all(row.id) as ReplyRow[]).map(rowToReply),
    );
  }

  function getAnnotationById(id: string): DevPilotAnnotationRecord | null {
    const row = statements.getAnnotationById.get(id) as AnnotationRow | undefined;
    return row ? rowToAnnotation(row) : null;
  }

  function listSessionAnnotations(sessionId: string): DevPilotAnnotationRecord[] {
    return (statements.getAnnotationsBySession.all(sessionId) as AnnotationRow[]).map(
      rowToAnnotation,
    );
  }

  function getPendingAnnotations(sessionId: string): DevPilotAnnotationRecord[] {
    return (statements.getPendingBySession.all(sessionId) as AnnotationRow[]).map(
      rowToAnnotation,
    );
  }

  function getAllPendingAnnotations(): DevPilotAnnotationRecord[] {
    return (statements.getPendingAll.all() as AnnotationRow[]).map(rowToAnnotation);
  }

  function updateAnnotationRecord(
    id: string,
    input: Partial<Omit<DevPilotAnnotationRecord, "id" | "sessionId" | "replies">>,
  ): DevPilotAnnotationRecord | null {
    const existing = getAnnotationById(id);
    if (!existing) {
      return null;
    }

    const nextStatus = input.status ?? existing.status;
    const isClosed = nextStatus === "resolved" || nextStatus === "dismissed";
    const next: DevPilotAnnotationRecord = {
      ...existing,
      ...input,
      id,
      sessionId: existing.sessionId,
      pathname: input.pathname ?? existing.pathname,
      status: nextStatus,
      updatedAt: input.updatedAt ?? Date.now(),
      resolvedAt:
        input.resolvedAt !== undefined
          ? input.resolvedAt
          : isClosed
            ? existing.resolvedAt ?? Date.now()
            : undefined,
      resolvedBy:
        input.resolvedBy !== undefined
          ? input.resolvedBy
          : isClosed
            ? existing.resolvedBy
            : undefined,
      replies: existing.replies,
    };

    statements.updateAnnotation.run(serializeAnnotation(next));
    deps.touchSession(existing.sessionId);
    return getAnnotationById(id);
  }

  function addAnnotation(
    sessionId: string,
    input: Omit<DevPilotAnnotationRecord, "sessionId" | "replies">,
  ): DevPilotAnnotationRecord | null {
    const session = deps.getSessionById(sessionId);
    if (!session) {
      return null;
    }

    const annotation: DevPilotAnnotationRecord = {
      ...input,
      sessionId,
      status: input.status ?? "pending",
      replies: [],
    };

    statements.insertAnnotation.run(serializeAnnotation(annotation));
    deps.touchSession(sessionId);
    return getAnnotationById(annotation.id);
  }

  function updateAnnotation(
    id: string,
    input: Partial<Omit<DevPilotAnnotationRecord, "id" | "sessionId" | "replies">>,
  ): DevPilotAnnotationRecord | null {
    return updateAnnotationRecord(id, input);
  }

  function updateAnnotationStatus(
    id: string,
    status: DevPilotAnnotationStatus,
    resolvedBy?: "human" | "agent",
  ): DevPilotAnnotationRecord | null {
    return updateAnnotationRecord(id, {
      status,
      updatedAt: Date.now(),
      resolvedAt:
        status === "resolved" || status === "dismissed" ? Date.now() : undefined,
      resolvedBy:
        status === "resolved" || status === "dismissed"
          ? resolvedBy || "agent"
          : undefined,
    });
  }

  function deleteAnnotation(
    id: string,
    deletedBy: "human" | "agent" = "human",
  ): DevPilotAnnotationRecord | null {
    const existing = getAnnotationById(id);
    if (!existing) {
      return null;
    }

    db.prepare(`
      UPDATE annotations SET deleted_at = ?, deleted_by = ? WHERE id = ?
    `).run(Date.now(), deletedBy, id);
    deps.touchSession(existing.sessionId);
    return existing;
  }

  function hardDeleteAnnotation(id: string): DevPilotAnnotationRecord | null {
    const existing = getAnnotationById(id);
    if (!existing) {
      return null;
    }

    statements.deleteRepliesByAnnotation.run(id);
    statements.deleteAnnotation.run(id);
    deps.touchSession(existing.sessionId);
    return existing;
  }

  function addReply(
    annotationId: string,
    role: DevPilotAnnotationReply["role"],
    content: string,
  ): DevPilotAnnotationRecord | null {
    const annotation = getAnnotationById(annotationId);
    if (!annotation) {
      return null;
    }

    statements.insertReply.run({
      id: createId("reply"),
      annotationId,
      role,
      content,
      createdAt: Date.now(),
    });
    deps.touchSession(annotation.sessionId);
    return getAnnotationById(annotationId);
  }

  return {
    addAnnotation,
    addReply,
    deleteAnnotation,
    hardDeleteAnnotation,
    getAllPendingAnnotations,
    getAnnotationById,
    getPendingAnnotations,
    listSessionAnnotations,
    updateAnnotation,
    updateAnnotationStatus,
  };
}
