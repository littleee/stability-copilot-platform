import Database from "better-sqlite3";

import type {
  DevPilotSessionRecord,
  DevPilotStabilityItemRecord,
  DevPilotStabilityStatus,
} from "../types.js";
import { rowToStabilityItem, serializeStabilityItem } from "./mappers.js";
import type { StabilityRow } from "./row-types.js";

type StabilityRepositoryDeps = {
  getSessionById: (id: string) => DevPilotSessionRecord | null;
  touchSession: (sessionId: string) => void;
};

export function createStabilityRepository(
  db: Database.Database,
  deps: StabilityRepositoryDeps,
) {
  const statements = {
    getStabilityById: db.prepare("SELECT * FROM stability_items WHERE id = ?"),
    getStabilityBySession: db.prepare(`
      SELECT * FROM stability_items
      WHERE session_id = ?
      ORDER BY updated_at DESC, created_at DESC
    `),
    getOpenStabilityBySession: db.prepare(`
      SELECT * FROM stability_items
      WHERE session_id = ? AND status IN ('open', 'diagnosing')
      ORDER BY updated_at DESC, created_at DESC
    `),
    getOpenStabilityAll: db.prepare(`
      SELECT * FROM stability_items
      WHERE status IN ('open', 'diagnosing')
      ORDER BY updated_at DESC, created_at DESC
    `),
    insertStability: db.prepare(`
      INSERT INTO stability_items (
        id, session_id, pathname, created_at, updated_at, status, severity, title,
        symptom, repro_steps, impact, signals, fix_goal, context_json
      ) VALUES (
        @id, @sessionId, @pathname, @createdAt, @updatedAt, @status, @severity, @title,
        @symptom, @reproSteps, @impact, @signals, @fixGoal, @contextJson
      )
    `),
    updateStability: db.prepare(`
      UPDATE stability_items SET
        pathname = @pathname,
        updated_at = @updatedAt,
        status = @status,
        severity = @severity,
        title = @title,
        symptom = @symptom,
        repro_steps = @reproSteps,
        impact = @impact,
        signals = @signals,
        fix_goal = @fixGoal,
        context_json = @contextJson
      WHERE id = @id
    `),
    deleteStability: db.prepare("DELETE FROM stability_items WHERE id = ?"),
  };

  function getStabilityItemById(id: string): DevPilotStabilityItemRecord | null {
    const row = statements.getStabilityById.get(id) as StabilityRow | undefined;
    return row ? rowToStabilityItem(row) : null;
  }

  function listSessionStabilityItems(sessionId: string): DevPilotStabilityItemRecord[] {
    return (statements.getStabilityBySession.all(sessionId) as StabilityRow[]).map(
      rowToStabilityItem,
    );
  }

  function getOpenSessionStabilityItems(sessionId: string): DevPilotStabilityItemRecord[] {
    return (statements.getOpenStabilityBySession.all(sessionId) as StabilityRow[]).map(
      rowToStabilityItem,
    );
  }

  function getAllOpenStabilityItems(): DevPilotStabilityItemRecord[] {
    return (statements.getOpenStabilityAll.all() as StabilityRow[]).map(rowToStabilityItem);
  }

  function updateStabilityRecord(
    id: string,
    input: Partial<Omit<DevPilotStabilityItemRecord, "id" | "sessionId">>,
  ): DevPilotStabilityItemRecord | null {
    const existing = getStabilityItemById(id);
    if (!existing) {
      return null;
    }

    const next: DevPilotStabilityItemRecord = {
      ...existing,
      ...input,
      id,
      sessionId: existing.sessionId,
      pathname: input.pathname ?? existing.pathname,
      updatedAt: input.updatedAt ?? Date.now(),
    };

    statements.updateStability.run(serializeStabilityItem(next));
    deps.touchSession(existing.sessionId);
    return getStabilityItemById(id);
  }

  function addStabilityItem(
    sessionId: string,
    input: Omit<DevPilotStabilityItemRecord, "sessionId">,
  ): DevPilotStabilityItemRecord | null {
    const session = deps.getSessionById(sessionId);
    if (!session) {
      return null;
    }

    const now = Date.now();
    const item: DevPilotStabilityItemRecord = {
      ...input,
      sessionId,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      status: input.status ?? "open",
      severity: input.severity ?? "high",
      context: {
        ...input.context,
        capturedAt: input.context.capturedAt ?? now,
      },
    };

    statements.insertStability.run(serializeStabilityItem(item));
    deps.touchSession(sessionId);
    return getStabilityItemById(item.id);
  }

  function updateStabilityItem(
    id: string,
    input: Partial<Omit<DevPilotStabilityItemRecord, "id" | "sessionId">>,
  ): DevPilotStabilityItemRecord | null {
    return updateStabilityRecord(id, input);
  }

  function updateStabilityStatus(
    id: string,
    status: DevPilotStabilityStatus,
  ): DevPilotStabilityItemRecord | null {
    return updateStabilityRecord(id, {
      status,
      updatedAt: Date.now(),
    });
  }

  function deleteStabilityItem(id: string): DevPilotStabilityItemRecord | null {
    const existing = getStabilityItemById(id);
    if (!existing) {
      return null;
    }

    statements.deleteStability.run(id);
    deps.touchSession(existing.sessionId);
    return existing;
  }

  return {
    addStabilityItem,
    deleteStabilityItem,
    getAllOpenStabilityItems,
    getOpenSessionStabilityItems,
    getStabilityItemById,
    listSessionStabilityItems,
    updateStabilityItem,
    updateStabilityStatus,
  };
}
