import type { DevPilotRepairRequestRecord } from "../types";
import { readJsonResponse } from "./shared";

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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return readJsonResponse<DevPilotRepairRequestRecord>(
    response,
    "create repair request",
  );
}
