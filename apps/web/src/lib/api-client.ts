/** Minimal typed fetch wrapper for the /api/* routes backed by @vlog/workers. */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  list: <T>(resource: string) => request<{ data: T[] }>(`/${resource}`).then((r) => r.data),
  get: <T>(resource: string, id: string) =>
    request<{ data: T }>(`/${resource}/${id}`).then((r) => r.data),
  create: <T>(resource: string, body: unknown) =>
    request<{ data: T }>(`/${resource}`, { method: "POST", body: JSON.stringify(body) }).then(
      (r) => r.data,
    ),
  update: <T>(resource: string, id: string, body: unknown) =>
    request<{ data: T }>(`/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  remove: (resource: string, id: string) =>
    request<void>(`/${resource}/${id}`, { method: "DELETE" }),
  raw: request,
};
