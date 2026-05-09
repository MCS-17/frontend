export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let data: unknown = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const detail =
      typeof data === 'object' && data !== null && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`

    throw new ApiError(response.status, detail)
  }

  return data as T
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null

  const headers = new Headers(options.headers)

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  return parseResponse<T>(response)
}