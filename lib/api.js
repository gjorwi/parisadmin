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
  deactivateNotification: (id) => request(`/notifications/${id}/deactivate`, { method: "PATCH" }),
  settings: () => request("/settings"),
  updateSettings: (body) => request("/settings", { method: "PUT", body }),
  products: () => request("/products"),
  productById: (id) => request(`/products/${id}`),
  createProduct: (body) => request("/products", { method: "POST", body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: "PUT", body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  customers: () => request("/customers"),
  createCustomer: (payload) => request("/customers", { method: "POST", body: JSON.stringify(payload) }),
  addCustomerInvoicePayment: (customerId, facturaId, payload) => request(`/customers/${customerId}/facturas/${facturaId}/abono`, { method: "PATCH", body: JSON.stringify(payload) }),
  cancelCustomerInvoice: (customerId, facturaId) => request(`/customers/${customerId}/facturas/${facturaId}/cancelar`, { method: "PATCH" }),
  orders: () => request("/orders"),
  createOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  updateOrder: (id, payload) => request(`/orders/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  suppliers: () => request("/suppliers"),
  createSupplier: (payload) => request("/suppliers", { method: "POST", body: JSON.stringify(payload) }),
  updateSupplier: (id, payload) => request(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
  sales: () => request("/sales"),
  createSale: (payload) => request("/sales", { method: "POST", body: JSON.stringify(payload) }),
  reports: () => request("/reports"),
  reportsSummary: () => request("/reports/summary"),
};

export default api;
