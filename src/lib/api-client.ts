import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import type { ApiErrorPayload } from "@/types";

/**
 * Thin client-side POST helper shared by every step of the flow so error
 * parsing and messaging stays consistent in one place.
 */
export async function postJson<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(GENERIC_ERROR_MESSAGE);
  }

  if (!response.ok) {
    const message = (payload as ApiErrorPayload)?.error;
    throw new Error(message || GENERIC_ERROR_MESSAGE);
  }

  return payload as TResponse;
}
