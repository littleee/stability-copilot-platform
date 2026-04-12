import type { DevPilotStabilityItem } from "../types";
import { readJsonResponse } from "./shared";

export async function syncRemoteStabilityItem(
  endpoint: string,
  sessionId: string,
  item: DevPilotStabilityItem,
): Promise<DevPilotStabilityItem> {
  const response = await fetch(`${endpoint}/sessions/${sessionId}/stability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  return readJsonResponse<DevPilotStabilityItem>(
    response,
    "create stability item",
  );
}

export async function updateRemoteStabilityItem(
  endpoint: string,
  stabilityItemId: string,
  data: Partial<DevPilotStabilityItem> & { status?: string },
): Promise<DevPilotStabilityItem> {
  const response = await fetch(`${endpoint}/stability/${stabilityItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return readJsonResponse<DevPilotStabilityItem>(
    response,
    "update stability item",
  );
}

export async function deleteRemoteStabilityItem(
  endpoint: string,
  stabilityItemId: string,
): Promise<void> {
  const response = await fetch(`${endpoint}/stability/${stabilityItemId}`, {
    method: "DELETE",
  });

  await readJsonResponse<{ deleted: boolean }>(
    response,
    "delete stability item",
  );
}
