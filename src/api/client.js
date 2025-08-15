const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchJson(path, options = {}) {
  const headers = options.headers || {};
  const isJson = options.body && typeof options.body === "object";
  const finalHeaders = {
    "Accept": "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: finalHeaders,
    body: isJson ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

