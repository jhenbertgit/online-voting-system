/**
 * Utility to build API URLs using the base URL from environment variables.
 * Ensures consistent, maintainable, and safe API endpoint construction.
 */
export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
