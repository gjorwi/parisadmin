"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const PRIMARY = "#eb478b";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const data = await api.dashboardSummary();
        setSummary(data);
      } catch (error) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  const dashboardStats = useMemo(() => {
    return [
      {
        label: "Ventas Registradas",
        value: `$${Number(summary?.stats?.totalSales || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: "Total acumulado en sistema",
        trendIcon: "payments",
        trendColor: "#10b981",
      },
      {
        label: "Clientes con Deuda",
        value: String(summary?.stats?.customersWithDebt || 0),
        trend: "Con saldo pendiente",
        trendIcon: "account_balance_wallet",
        trendColor: "#eb478b",
        valueColor: "#eb478b",
      },
      {
        label: "Pedidos Pendientes",
        value: String(summary?.stats?.pendingOrders || 0),
        trend: "Por procesar",
        trendIcon: "schedule",
        trendColor: "#f59e0b",
      },
      {
        label: "Notificaciones",
        value: String(summary?.stats?.notifications || 0),
        trend: "Alertas del sistema",
        trendIcon: "notifications",
        trendColor: "#3b82f6",
      },
    ];
  }, [summary]);

  const dashboardDebtors = useMemo(() => {
    return (summary?.debtors || []).map((customer) => {
      const saldo = customer.facturas.reduce((acc, invoice) => acc + (invoice.total - invoice.pagado), 0);
      return {
        nombre: customer.nombre,
        cedula: customer.cedula,
        saldo,
        facturas: customer.facturas.length,
        initials: customer.nombre.slice(0, 2).toUpperCase(),
      };
    });
  }, [summary]);

  const latestActivity = useMemo(() => {
    const sales = (summary?.latestSales || []).map((sale) => ({
      id: sale._id,
      icon: "point_of_sale",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      text: `Venta ${sale.code || ""} — ${sale.customerName || "Consumidor Final"}`,
      amount: `+$${Number(sale.total || 0).toFixed(2)}`,
      time: new Date(sale.createdAt).toLocaleString("es-VE"),
      createdAt: sale.createdAt,
    }));

    const orders = (summary?.latestOrders || []).map((order) => ({
      id: order._id,
      icon: "shopping_cart",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      text: `Pedido ${order.code || ""} — ${order.customerName || "Sin cliente"}`,
      amount: `$${Number(order.total || 0).toFixed(2)}`,
      time: new Date(order.createdAt).toLocaleString("es-VE"),
      createdAt: order.createdAt,
    }));

    const notifications = (summary?.notifications || []).map((notification) => ({
      id: notification._id,
      icon: "notifications",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      text: notification.title || notification.message || "Notificación",
      amount: notification.type || "sistema",
      time: new Date(notification.createdAt).toLocaleString("es-VE"),
      createdAt: notification.createdAt,
    }));

    return [...sales, ...orders, ...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [summary]);

  const lowStockCount = useMemo(() => {
    return (summary?.notifications || []).filter((notification) =>
      `${notification.title || ""} ${notification.message || ""}`.toLowerCase().includes("stock")
    ).length;
  }, [summary]);

  const alerts = useMemo(() => {
    const items = [];

    if ((summary?.stats?.pendingOrders || 0) > 0) {
      items.push({ icon: "local_shipping", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", text: `${summary.stats.pendingOrders} pedidos pendientes por procesar`, action: "Ver pedidos", href: "/dashboard/pedidos" });
    }

    if ((summary?.stats?.customersWithDebt || 0) > 0) {
      items.push({ icon: "account_balance_wallet", color: "#eb478b", bg: "rgba(235,71,139,0.08)", text: `${summary.stats.customersWithDebt} clientes con saldo pendiente`, action: "Ver clientes", href: "/dashboard/clientes" });
    }

    if (lowStockCount > 0) {
      items.push({ icon: "inventory_2", color: "#ef4444", bg: "rgba(239,68,68,0.08)", text: `${lowStockCount} alertas relacionadas con stock`, action: "Ver inventario", href: "/dashboard/inventario" });
    }

    return items;
  }, [lowStockCount, summary]);

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {dashboardStats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-3 md:p-5 rounded-xl"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}
          >
            <p className="text-slate-500 text-xs md:text-sm font-medium truncate">{s.label}</p>
            <h3
              className="text-xl md:text-2xl lg:text-3xl font-bold mt-1"
              style={{ color: s.valueColor || "#0f172a" }}
            >
              {s.value}
            </h3>
            <div className="mt-1 md:mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: s.trendColor }}>
              <span className="material-symbols-outlined hidden md:inline" style={{ fontSize: "14px" }}>{s.trendIcon}</span>
              <span className="truncate">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Deudores + Gráfico ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">

        {/* Clientes con deuda */}
        <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: PRIMARY }}>account_balance_wallet</span>
              <h2 className="font-bold text-slate-900">Clientes con Saldo Pendiente</h2>
            </div>
            <a href="/dashboard/clientes" className="text-xs font-semibold" style={{ color: PRIMARY }}>Ver todos →</a>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(235,71,139,0.06)" }}>
            {dashboardDebtors.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No hay clientes con saldo pendiente.
              </div>
            )}
            {dashboardDebtors.map((d) => (
              <div key={d.cedula} className="px-5 py-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: "rgba(235,71,139,0.12)", color: PRIMARY }}
                >
                  {d.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{d.nombre}</p>
                  <p className="text-xs text-slate-400">{d.cedula} · {d.facturas} {d.facturas === 1 ? "factura" : "facturas"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: PRIMARY }}>${d.saldo.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">pendiente</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico ventas mensuales */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: PRIMARY }}>bar_chart</span>
              <h2 className="font-bold text-slate-900">Resumen de Ventas</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Datos consolidados del backend</p>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f6f7" }}>
                <p className="text-xs text-slate-400">Ventas registradas</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{dashboardStats[0].value}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f6f7" }}>
                <p className="text-xs text-slate-400">Pedidos pendientes</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{dashboardStats[2].value}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f6f7" }}>
                <p className="text-xs text-slate-400">Clientes con deuda</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{dashboardStats[1].value}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f6f7" }}>
                <p className="text-xs text-slate-400">Notificaciones</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{dashboardStats[3].value}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Actividad reciente + Alertas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">

        {/* Actividad reciente */}
        <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: PRIMARY }}>history</span>
              <h2 className="font-bold text-slate-900">Actividad Reciente</h2>
            </div>
            <a href="/dashboard/ventas" className="text-xs font-semibold" style={{ color: PRIMARY }}>Ver ventas →</a>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(235,71,139,0.06)" }}>
            {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Cargando actividad...</div>}
            {!loading && latestActivity.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">No hay actividad reciente registrada.</div>}
            {latestActivity.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: a.bg }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: a.color }}>{a.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{a.text}</p>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: `${a.amount}`.startsWith("+") ? "#10b981" : a.color }}>
                  {a.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas + Accesos rápidos */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Alertas */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#ef4444" }}>notifications_active</span>
                <h2 className="font-bold text-slate-900">Alertas</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {alerts.length === 0 && <div className="p-3 text-sm text-slate-400">No hay alertas activas.</div>}
              {alerts.map((al, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: al.bg }}>
                  <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: "18px", color: al.color }}>{al.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{al.text}</p>
                    <a href={al.href} className="text-xs font-semibold mt-1 inline-block" style={{ color: al.color }}>{al.action} →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
