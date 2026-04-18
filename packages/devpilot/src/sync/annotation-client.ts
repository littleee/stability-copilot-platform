import type { DevPilotAnnotation } from "../types";
import { getDevPilotClientId, readJsonResponse } from "./shared";

function clientHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-DevPilot-Client-Id": getDevPilotClientId(),
  };
}

export async function syncRemoteAnnotation(
  endpoint: string,
  sessionId: string,
  annotation: DevPilotAnnotation,
): Promise<DevPilotAnnotation> {
  const response = await fetch(`${endpoint}/sessions/${sessionId}/annotations`, {
    method: "POST",
    headers: clientHeaders(),
    body: JSON.stringify(annotation),
  });

  return readJsonResponse<DevPilotAnnotation>(response, "create annotation");
}

export async function updateRemoteAnnotation(
  endpoint: string,
  annotationId: string,
  data: Partial<DevPilotAnnotation> & { status?: string },
): Promise<DevPilotAnnotation> {
  const response = await fetch(`${endpoint}/annotations/${annotationId}`, {
    method: "PATCH",
    headers: clientHeaders(),
    body: JSON.stringify(data),
  });

  return readJsonResponse<DevPilotAnnotation>(response, "update annotation");
}

export async function deleteRemoteAnnotation(
  endpoint: string,
  annotationId: string,
): Promise<void> {
  const response = await fetch(`${endpoint}/annotations/${annotationId}`, {
    method: "DELETE",
    headers: {
      "X-DevPilot-Client-Id": getDevPilotClientId(),
    },
  });

  await readJsonResponse<{ deleted: boolean }>(response, "delete annotation");
}
