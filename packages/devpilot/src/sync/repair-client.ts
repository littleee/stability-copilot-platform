import type { DevPilotRepairRequestRecord } from "../types";
import { getDevPilotClientId, readJsonResponse } from "./shared";

function clientHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-DevPilot-Client-Id": getDevPilotClientId(),
  };
}

export async function createRemoteRepairRequest(
  endpoint: string,
  sessionId: string,
  request: Omit<
    DevPilotRepairRequestRecord,
    "sessionId" | "createdAt" | "updatedAt" | "status"
  > & {
    status?: DevPilotRepairRequestRecord["status"];
  },
): Promise<DevPilotRepairRequestRecord> {
  const response = await fetch(`${endpoint}/sessions/${sessionId}/repair-requests`, {
    method: "POST",
    headers: clientHeaders(),
    body: JSON.stringify(request),
  });

  return readJsonResponse<DevPilotRepairRequestRecord>(
    response,
    "create repair request",
  );
}
