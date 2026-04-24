const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  error?: { message?: string };
};

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const maybe = payload as { data?: unknown };
    if (maybe.data !== undefined) return maybe.data as T;
  }
  return payload as T;
}

function extractErrorMessage(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as { error?: { message?: unknown }; message?: unknown };
  if (typeof obj.error?.message === 'string' && obj.error.message.trim()) return obj.error.message;
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  return fallback;
}

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    token?: string;
    signal?: AbortSignal;
  } = {}
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    const text = await response.text().catch(() => '');
    if (!text) throw new Error(fallback);
    try {
      const parsed = JSON.parse(text) as unknown;
      const message = extractErrorMessage(parsed, fallback);
      throw new Error(message);
    } catch (error) {
      if (error instanceof Error && error.message !== text) throw error;
      throw new Error(text || fallback);
    }
  }

  const body = (await response.json().catch(() => ({}))) as TResponse & {
    success?: boolean;
    error?: { message?: string };
  };
  if (body && typeof body === 'object' && body.success === false && body.error?.message) {
    throw new Error(body.error.message);
  }
  return body as TResponse;
}

