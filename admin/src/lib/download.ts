import { BASE_URL } from "@/lib/api-client";

/**
 * Downloads a file the API answers with (a CSV export). A plain link cannot carry the
 * Authorization header, so the request is made here and the result saved as a file.
 */
export async function downloadFile(endpoint: string, fallbackName: string): Promise<void> {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("support_token");
  const response = await fetch(`${BASE_URL}${endpoint}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Download failed");
  }
  const disposition = response.headers.get("content-disposition") || "";
  const name = /filename="?([^";]+)"?/i.exec(disposition)?.[1] || fallbackName;
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
