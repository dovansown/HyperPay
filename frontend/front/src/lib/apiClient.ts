const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
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
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json().catch(() => ({}))) as TResponse
}

