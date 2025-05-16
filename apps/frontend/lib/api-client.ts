import { toast } from "sonner";
/**
 * Utility API client for POST requests with error extraction and toast integration.
 * @param endpoint - The API endpoint (e.g., '/api/candidates')
 * @param payload - The request body
 * @param token - Bearer token for authentication
 * @param fallbackMessage - Message to show if no error message is returned
 * @param toastId - Optional toast ID to dismiss on error
 * @returns The parsed response JSON
 * @throws Error with extracted message
 */
export async function postApiResource<T = unknown>(
  endpoint: string,
  payload: object,
  token: string,
  fallbackMessage: string,
  toastId?: string | number
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    if (toastId) toast.dismiss(toastId);
    throw new Error("Failed to reach the server. Please try again later.");
  }
  if (!response.ok) {
    if (toastId) toast.dismiss(toastId);
    let errorMessage = fallbackMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || fallbackMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return response.json();
}
