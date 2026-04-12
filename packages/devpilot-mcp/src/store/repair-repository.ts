import Database from "better-sqlite3";

import type {
  DevPilotRepairRequestRecord,
  DevPilotSessionRecord,
} from "../types.js";
import { rowToRepairRequest, serializeRepairRequest } from "./mappers.js";
import type { RepairRequestRow } from "./row-types.js";

type RepairRepositoryDeps = {
  getSessionById: (id: string) => DevPilotSessionRecord | null;
  touchSession: (sessionId: string) => void;
};

export function createRepairRepository(
  db: Database.Database,
  deps: RepairRepositoryDeps,
) {
  const statements = {
    getRepairRequestById: db.prepare("SELECT * FROM repair_requests WHERE id = ?"),
    getRepairRequestsBySession: db.prepare(`
      SELECT * FROM repair_requests
      WHERE session_id = ?
      ORDER BY updated_at DESC, created_at DESC
    `),
    getOpenRepairRequestsBySession: db.prepare(`
      SELECT * FROM repair_requests
      WHERE session_id = ? AND status IN ('requested', 'accepted')
      ORDER BY updated_at DESC, created_at DESC
    `),
    getOpenRepairRequestsAll: db.prepare(`
      SELECT * FROM repair_requests
      WHERE status IN ('requested', 'accepted')
      ORDER BY updated_at DESC, created_at DESC
    `),
    insertRepairRequest: db.prepare(`
      INSERT INTO repair_requests (
        id, session_id, stability_item_id, pathname, created_at, updated_at, status,
        title, severity, prompt, requested_by, completed_at, completed_by, result_summary
      ) VALUES (
        @id, @sessionId, @stabilityItemId, @pathname, @createdAt, @updatedAt, @status,
        @title, @severity, @prompt, @requestedBy, @completedAt, @completedBy, @resultSummary
      )
    `),
    updateRepairRequest: db.prepare(`
      UPDATE repair_requests SET
        stability_item_id = @stabilityItemId,
        pathname = @pathname,
        updated_at = @updatedAt,
        status = @status,
        title = @title,
        severity = @severity,
        prompt = @prompt,
        requested_by = @requestedBy,
        completed_at = @completedAt,
        completed_by = @completedBy,
        result_summary = @resultSummary
      WHERE id = @id
    `),
  };

  function getRepairRequestById(id: string): DevPilotRepairRequestRecord | null {
    const row = statements.getRepairRequestById.get(id) as RepairRequestRow | undefined;
    return row ? rowToRepairRequest(row) : null;
  }

  function listSessionRepairRequests(sessionId: string): DevPilotRepairRequestRecord[] {
    return (statements.getRepairRequestsBySession.all(sessionId) as RepairRequestRow[]).map(
      rowToRepairRequest,
    );
  }

  function getOpenSessionRepairRequests(sessionId: string): DevPilotRepairRequestRecord[] {
    return (statements.getOpenRepairRequestsBySession.all(sessionId) as RepairRequestRow[]).map(
      rowToRepairRequest,
    );
  }

  function getAllOpenRepairRequests(): DevPilotRepairRequestRecord[] {
    return (statements.getOpenRepairRequestsAll.all() as RepairRequestRow[]).map(
      rowToRepairRequest,
    );
  }

  function updateRepairRequestRecord(
    id: string,
    input: Partial<Omit<DevPilotRepairRequestRecord, "id" | "sessionId">>,
  ): DevPilotRepairRequestRecord | null {
    const existing = getRepairRequestById(id);
    if (!existing) {
      return null;
    }

    const nextStatus = input.status ?? existing.status;
    const isClosed = nextStatus === "completed" || nextStatus === "dismissed";
    const next: DevPilotRepairRequestRecord = {
      ...existing,
      ...input,
      id,
      sessionId: existing.sessionId,
      pathname: input.pathname ?? existing.pathname,
      updatedAt: input.updatedAt ?? Date.now(),
      completedAt:
        input.completedAt !== undefined
          ? input.completedAt
          : isClosed
            ? existing.completedAt ?? Date.now()
            : undefined,
      completedBy:
        input.completedBy !== undefined
          ? input.completedBy
          : isClosed
            ? existing.completedBy
            : undefined,
    };

    statements.updateRepairRequest.run(serializeRepairRequest(next));
    deps.touchSession(existing.sessionId);
    return getRepairRequestById(id);
  }

  function addRepairRequest(
    sessionId: string,
    input: Omit<DevPilotRepairRequestRecord, "sessionId">,
  ): DevPilotRepairRequestRecord | null {
    const session = deps.getSessionById(sessionId);
    if (!session) {
      return null;
    }

    const now = Date.now();
    const request: DevPilotRepairRequestRecord = {
      ...input,
      sessionId,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      status: input.status ?? "requested",
      requestedBy: input.requestedBy ?? "human",
    };

    statements.insertRepairRequest.run(serializeRepairRequest(request));
    deps.touchSession(sessionId);
    return getRepairRequestById(request.id);
  }

  function updateRepairRequest(
    id: string,
    input: Partial<Omit<DevPilotRepairRequestRecord, "id" | "sessionId">>,
  ): DevPilotRepairRequestRecord | null {
    return updateRepairRequestRecord(id, input);
  }

  return {
    addRepairRequest,
    getAllOpenRepairRequests,
    getOpenSessionRepairRequests,
    getRepairRequestById,
    listSessionRepairRequests,
    updateRepairRequest,
  };
}
