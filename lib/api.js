import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error de conexión con el servidor");
  }

  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  dashboardSummary: () => request("/dashboard/summary"),
  notifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  settings: () => request("/settings"),
  updateSettings: (body) => request("/settings", { method: "PUT", body }),
  products: () => request("/products"),
  customers: () => request("/customers"),
  orders: () => request("/orders"),
  suppliers: () => request("/suppliers"),
  sales: () => request("/sales"),
  reports: () => request("/reports"),
};

export default api;
