import { headers } from "next/headers";

const API_URL = (process.env.ABUUR_API_URL ?? "http://localhost:3000/api").replace(/\/+$/, "");

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  businessId?: string;
};

/** Nest error bodies carry `message` as a string or a list of validation messages. */
function errorMessage(body: unknown, status: number): string {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(". ");
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
}

/**
 * The Express API wraps results as `{ success, statusCode, data, meta? }`; callers get `data`
 * (lists stay plain arrays, which is what the pages expect).
 */
function unwrap(body: unknown): unknown {
  if (!body || typeof body !== "object" || !("success" in body) || !("data" in body)) return body;
  return (body as { data: unknown }).data;
}

/** The visitor's IP, so backend rate limits apply per visitor, not per Next server. */
async function visitorIp(): Promise<string | undefined> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").pop()?.trim();
  return h.get("x-real-ip") ?? undefined;
}

/**
 * Server-side call to the ABUUR API (Server Components and Server Actions only;
 * the browser never sees the API URL or the session token).
 * Never throws on HTTP or network errors.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
  const requestHeaders: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (options.token) requestHeaders.Authorization = `Bearer ${options.token}`;
  if (options.businessId) requestHeaders["X-Business-Id"] = options.businessId;
  const ip = await visitorIp();
  if (ip) requestHeaders["X-Forwarded-For"] = ip;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: requestHeaders,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!response.ok) {
      return { ok: false, status: response.status, message: errorMessage(body, response.status) };
    }
    return { ok: true, status: response.status, data: unwrap(body) as T };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "We can't reach the ABUUR service right now. Please try again shortly.",
    };
  }
}
