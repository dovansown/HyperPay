const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  meta?: Record<string, unknown>
  requestId?: string
}

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const maybeEnvelope = payload as { data?: unknown }
    if (maybeEnvelope.data !== undefined) return maybeEnvelope.data as T
  }
  return payload as T
}

function extractErrorMessage(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== 'object') return fallback
  const errorObj = raw as { error?: { message?: unknown }; message?: unknown }
  if (typeof errorObj.error?.message === 'string' && errorObj.error.message.trim()) {
    return errorObj.error.message
  }
  if (typeof errorObj.message === 'string' && errorObj.message.trim()) {
    return errorObj.message
  }
  return fallback
}

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: TBody
    token?: string
  } = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`
    const errorText = await response.text().catch(() => '')
    if (!errorText) {
      throw new Error(fallback)
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(errorText) as unknown
    } catch {
      throw new Error(errorText || fallback)
    }
    throw new Error(extractErrorMessage(parsed, fallback))
  }

  const body = (await response.json().catch(() => ({}))) as TResponse & { success?: boolean; error?: { message?: string } }
  if (body && typeof body === 'object' && body.success === false && body.error?.message) {
    throw new Error(body.error.message)
  }
  return body as TResponse
}

