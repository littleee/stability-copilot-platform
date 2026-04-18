import type {
  DevPilotAnnotation,
  DevPilotRepairRequestRecord,
  DevPilotStabilityItem,
} from "../types";
import { getDevPilotClientId, readJsonResponse } from "./shared";

function clientHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-DevPilot-Client-Id": getDevPilotClientId(),
  };
}

export interface DevPilotRemoteSession {
  id: string;
  pageKey: string;
  pathname: string;
  url: string;
  title: string;
  status: "active" | "closed";
  createdAt: number;
  updatedAt: number;
}

export interface DevPilotRemoteSessionWithAnnotations
  extends DevPilotRemoteSession {
  annotations: DevPilotAnnotation[];
  stabilityItems: DevPilotStabilityItem[];
  repairRequests: DevPilotRepairRequestRecord[];
}

export interface DevPilotEnsureRemoteSessionInput {
  pageKey: string;
  pathname: string;
  url: string;
  title: string;
}

export async function ensureRemoteSession(
  endpoint: string,
  input: DevPilotEnsureRemoteSessionInput,
): Promise<DevPilotRemoteSession> {
  const response = await fetch(`${endpoint}/sessions/ensure`, {
    method: "POST",
    headers: clientHeaders(),
    body: JSON.stringify(input),
  });

  return readJsonResponse<DevPilotRemoteSession>(response, "ensure session");
}

export async function getRemoteSession(
  endpoint: string,
  sessionId: string,
): Promise<DevPilotRemoteSessionWithAnnotations> {
  const response = await fetch(`${endpoint}/sessions/${sessionId}`, {
    headers: {
      "X-DevPilot-Client-Id": getDevPilotClientId(),
    },
  });
  return readJsonResponse<DevPilotRemoteSessionWithAnnotations>(
    response,
    "load session",
  );
}
