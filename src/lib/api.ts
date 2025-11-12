const BASE_URL = import.meta.env.VITE_BASE_URL || "https://7dce2f497999.ngrok-free.app";

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set("ngrok-skip-browser-warning", "69420");
  headers.set("Accept", "application/json");
  
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

export { BASE_URL };
