import Database from "better-sqlite3";

import type { DevPilotEnsureSessionInput, DevPilotSessionRecord } from "../types.js";
import { createId, rowToSession } from "./mappers.js";
import type { SessionRow } from "./row-types.js";

export function createSessionRepository(db: Database.Database) {
  const statements = {
    getSessionById: db.prepare("SELECT * FROM sessions WHERE id = ?"),
    getSessionByPageKey: db.prepare("SELECT * FROM sessions WHERE page_key = ?"),
    listSessions: db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC"),
    insertSession: db.prepare(`
      INSERT INTO sessions (id, page_key, pathname, url, title, status, created_at, updated_at)
      VALUES (@id, @pageKey, @pathname, @url, @title, @status, @createdAt, @updatedAt)
    `),
    updateSession: db.prepare(`
      UPDATE sessions
      SET pathname = @pathname, url = @url, title = @title, updated_at = @updatedAt
      WHERE id = @id
    `),
    touchSession: db.prepare(`
      UPDATE sessions
      SET updated_at = @updatedAt
      WHERE id = @id
    `),
  };

  function getSessionById(id: string): DevPilotSessionRecord | null {
    const row = statements.getSessionById.get(id) as SessionRow | undefined;
    return row ? rowToSession(row) : null;
  }

  function touchSession(sessionId: string): void {
    statements.touchSession.run({
      id: sessionId,
      updatedAt: Date.now(),
    });
  }

  function ensureSession(input: DevPilotEnsureSessionInput): DevPilotSessionRecord {
    const existing = statements.getSessionByPageKey.get(input.pageKey) as SessionRow | undefined;
    const now = Date.now();

    if (existing) {
      statements.updateSession.run({
        id: existing.id,
        pathname: input.pathname,
        url: input.url,
        title: input.title,
        updatedAt: now,
      });
      return getSessionById(existing.id)!;
    }

    const session: DevPilotSessionRecord = {
      id: createId("session"),
      pageKey: input.pageKey,
      pathname: input.pathname,
      url: input.url,
      title: input.title,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    statements.insertSession.run({
      id: session.id,
      pageKey: session.pageKey,
      pathname: session.pathname,
      url: session.url,
      title: session.title,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });

    return session;
  }

  function listSessions(): DevPilotSessionRecord[] {
    return (statements.listSessions.all() as SessionRow[]).map(rowToSession);
  }

  return {
    ensureSession,
    getSessionById,
    listSessions,
    touchSession,
  };
}
