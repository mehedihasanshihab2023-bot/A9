export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000"

export const API_URL = `${SERVER_URL}/api/v1`

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type ApiInit = Omit<RequestInit, "body"> & { body?: unknown }

/**
 * The Express API layer is protected by an httpOnly JWT cookie that is
 * issued by exchanging the Better Auth session. If a page loads before that
 * exchange has happened we transparently exchange and retry once, so a
 * hard refresh on a private route never fails.
 */
let tokenRequest: Promise<boolean> | null = null

function exchangeSession(): Promise<boolean> {
  if (!tokenRequest) {
    tokenRequest = fetch(`${API_URL}/auth/token`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        tokenRequest = null
      })
  }
  return tokenRequest
}

async function request<T>(
  path: string,
  init: ApiInit,
  retried: boolean
): Promise<T> {
  const { body, headers, ...rest } = init
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !retried) {
    const exchanged = await exchangeSession()
    if (exchanged) return request<T>(path, init, true)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (typeof data?.message === "string" && data.message.trim()) {
        message = data.message
      } else if (typeof data?.error === "string" && data.error.trim()) {
        message = data.error
      }
    } catch {
      /* keep the default message */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Small typed fetch wrapper for the SalonBook REST API. */
export function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  return request<T>(path, init, false)
}

/** Uploads a file to the server, which forwards it to ImgBB. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("image", file)

  const send = () =>
    fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      credentials: "include",
      body: form,
    })

  let res = await send()
  if (res.status === 401 && (await exchangeSession())) {
    res = await send()
  }

  if (!res.ok) {
    let message = "Image upload failed. Please try another file."
    try {
      const data = await res.json()
      if (typeof data?.message === "string") message = data.message
    } catch {
      /* noop */
    }
    throw new ApiError(message, res.status)
  }

  const data = (await res.json()) as { url?: string }
  if (!data.url) {
    throw new ApiError("Image upload failed. Please try again.", 500)
  }
  return data.url
}
