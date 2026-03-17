"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const orders = [
  { id: "#PB-2026-1084", customer: "María González", email: "maria@email.com", date: "16 Mar 2026", items: 3, total: "$1,100.00", status: "Completado" },
  { id: "#PB-2026-1083", customer: "Camila Rodríguez", email: "camila@email.com", date: "15 Mar 2026", items: 1, total: "$495.00", status: "Enviado" },
  { id: "#PB-2026-1082", customer: "Valentina Torres", email: "vale@email.com", date: "15 Mar 2026", items: 2, total: "$465.00", status: "Procesando" },
  { id: "#PB-2026-1081", customer: "Lucía Fernández", email: "lucia@email.com", date: "14 Mar 2026", items: 4, total: "$1,280.00", status: "Completado" },
  { id: "#PB-2026-1080", customer: "Isabella Martínez", email: "isa@email.com", date: "14 Mar 2026", items: 1, total: "$285.00", status: "Cancelado" },
  { id: "#PB-2026-1079", customer: "Sofía López", email: "sofia@email.com", date: "13 Mar 2026", items: 2, total: "$560.00", status: "Enviado" },
  { id: "#PB-2026-1078", customer: "Gabriela Sánchez", email: "gaby@email.com", date: "13 Mar 2026", items: 5, total: "$2,145.00", status: "Completado" },
  { id: "#PB-2026-1077", customer: "Ana Herrera", email: "ana@email.com", date: "12 Mar 2026", items: 1, total: "$125.00", status: "Procesando" },
  { id: "#PB-2026-1076", customer: "Daniela Castro", email: "dani@email.com", date: "12 Mar 2026", items: 3, total: "$960.00", status: "Completado" },
  { id: "#PB-2026-1075", customer: "Paula Ramírez", email: "paula@email.com", date: "11 Mar 2026", items: 2, total: "$740.00", status: "Cancelado" },
];

const statusStyle = {
  Pendiente: { bg: "rgba(235,71,139,0.1)", color: "#eb478b", icon: "hourglass_top" },
  Completado: { bg: "rgba(16,185,129,0.1)", color: "#059669", icon: "check_circle" },
  Enviado: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", icon: "local_shipping" },
  Procesando: { bg: "rgba(245,158,11,0.1)", color: "#d97706", icon: "schedule" },
  Cancelado: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", icon: "cancel" },
};

const allStatuses = ["Todos", "Pendiente", "Procesando", "Enviado", "Entregado", "Cancelado"];

const nextStatusMap = {
  Pendiente: ["Procesando", "Cancelado"],
  Procesando: ["Enviado", "Cancelado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export default function PedidosPage() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await api.orders();
      setOrdersData(data);
      setError("");
    } catch (err) {
      setError(err.message || "No fue posible cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(order, status) {
    try {
      await api.updateOrderStatus(order._id, status);
      await loadOrders();
    } catch (err) {
      setError(err.message || "No fue posible actualizar el pedido");
    }
  }

  const normalizedOrders = useMemo(
    () =>
      ordersData.map((o) => ({
        _id: o._id,
        id: o.code,
        customer: o.customerName,
        email: o.paymentStatus || "",
        date: new Date(o.createdAt).toLocaleDateString("es-VE"),
        items: o.items?.length || 0,
        total: `$${Number(o.total || 0).toFixed(2)}`,
        status: o.status === "Entregado" ? "Completado" : o.status,
        rawStatus: o.status,
      })),
    [ordersData]
  );

  const filtered = normalizedOrders.filter((o) => {
    const matchFilter = filter === "Todos" || o.status === filter || o.rawStatus === filter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total: normalizedOrders.length,
    pendiente: normalizedOrders.filter((o) => o.rawStatus === "Pendiente").length,
    completado: normalizedOrders.filter((o) => o.rawStatus === "Entregado").length,
    enviado: normalizedOrders.filter((o) => o.rawStatus === "Enviado").length,
    procesando: normalizedOrders.filter((o) => o.rawStatus === "Procesando").length,
    cancelado: normalizedOrders.filter((o) => o.rawStatus === "Cancelado").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitorea y gestiona todos los pedidos de la tienda.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pedidos", value: counts.total, icon: "shopping_bag", color: "#eb478b" },
          { label: "Pendientes", value: counts.pendiente, icon: "hourglass_top", color: "#eb478b" },
          { label: "Procesando", value: counts.procesando, icon: "schedule", color: "#f59e0b" },
          { label: "En Tránsito", value: counts.enviado, icon: "local_shipping", color: "#3b82f6" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white p-4 rounded-xl flex items-center gap-4"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${c.color}18` }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px", color: c.color }}>
                {c.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
        {error && (
          <div className="mx-4 mt-4 p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}
        {/* Toolbar */}
        <div
          className="p-4 flex flex-wrap items-center gap-3"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          <div className="relative flex-1 min-w-48">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: "18px" }}
            >
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedido o cliente..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.15)" }}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {allStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={
                  filter === s
                    ? { backgroundColor: "#eb478b", color: "#fff" }
                    : { backgroundColor: "#f8f6f7", color: "#64748b" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(235,71,139,0.2)" }}
          >
            {[
              { v: "grid", icon: "grid_view" },
              { v: "list", icon: "view_list" },
            ].map(({ v, icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="p-2 transition-colors"
                style={
                  view === v
                    ? { backgroundColor: "#eb478b", color: "#fff" }
                    : { backgroundColor: "transparent", color: "#64748b" }
                }
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {icon}
                </span>
              </button>
            ))}
          </div>

          <button
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ border: "1px solid rgba(235,71,139,0.2)", color: "#64748b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              download
            </span>
            Exportar
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando pedidos...</div>
        ) : view === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((o) => {
              const st = statusStyle[o.status];
              const nextStatuses = nextStatusMap[o.rawStatus] || [];
              return (
                <div
                  key={o.id}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ border: "1px solid rgba(235,71,139,0.12)", backgroundColor: "#fdfcfd" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold" style={{ color: "#eb478b" }}>{o.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.date}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{st.icon}</span>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(235,71,139,0.08)", paddingTop: "8px" }}>
                    <p className="text-sm font-semibold text-slate-900">{o.customer}</p>
                    <p className="text-xs text-slate-500">{o.email}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                      {o.items} {o.items === 1 ? "producto" : "productos"}
                    </span>
                    <span className="text-lg font-bold text-slate-900">{o.total}</span>
                  </div>
                  {nextStatuses.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid rgba(235,71,139,0.08)" }}>
                      {nextStatuses.map((status) => (
                        <button key={status} onClick={() => changeStatus(o, status)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.1)", color: "#eb478b" }}>
                          Pasar a {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                No se encontraron pedidos con los filtros seleccionados.
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f6f7" }}>
                {["N° Pedido", "Cliente", "Fecha", "Productos", "Total", "Estado", "Acciones"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 6 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const st = statusStyle[o.status];
                return (
                  <tr
                    key={o.id}
                    className="transition-colors"
                    style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-semibold" style={{ color: "#eb478b" }}>
                        {o.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{o.customer}</p>
                        <p className="text-xs text-slate-500">{o.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{o.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                      >
                        {o.items} {o.items === 1 ? "producto" : "productos"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-sm" style={{ color: "#0f172a" }}>
                      {o.total}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                          {st.icon}
                        </span>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(nextStatusMap[o.rawStatus] || []).map((status) => (
                          <button key={status} onClick={() => changeStatus(o, status)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.1)", color: "#eb478b" }}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No se encontraron pedidos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        <div
          className="p-4 flex items-center justify-between text-sm text-slate-500"
          style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
        >
          <p>Mostrando {filtered.length} de {normalizedOrders.length} pedidos</p>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg opacity-50 cursor-not-allowed"
              style={{ border: "1px solid rgba(235,71,139,0.2)" }}
              disabled
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
            </button>
            <button
              className="w-9 h-9 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#eb478b", color: "#fff" }}
            >
              1
            </button>
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ border: "1px solid rgba(235,71,139,0.2)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
