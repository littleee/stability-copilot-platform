async function readJson<T>(response: Response, action: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`Failed to ${action}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function readJsonResponse<T>(
  response: Response,
  action: string,
): Promise<T> {
  return readJson<T>(response, action);
}

const CLIENT_ID_KEY = "devpilot.clientId";

export function getDevPilotClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) {
      return existing;
    }
    const id = `cli_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return `cli_${Date.now().toString(36)}`;
  }
}
