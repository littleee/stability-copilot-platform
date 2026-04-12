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
