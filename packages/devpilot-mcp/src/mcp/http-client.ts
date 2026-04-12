let httpBaseUrl = "http://localhost:5213";

export function setHttpBaseUrl(nextUrl: string): void {
  httpBaseUrl = nextUrl;
}

export function getHttpBaseUrl(): string {
  return httpBaseUrl;
}

async function assertOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
}

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${httpBaseUrl}${path}`);
  await assertOk(response);
  return response.json() as Promise<T>;
}

export async function httpPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${httpBaseUrl}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertOk(response);
  return response.json() as Promise<T>;
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${httpBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertOk(response);
  return response.json() as Promise<T>;
}
