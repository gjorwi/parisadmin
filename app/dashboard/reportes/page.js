"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const PRIMARY = "#eb478b";

const fmtCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export default function ReportesPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);
      const data = await api.reportsSummary();
      setSummary(data);
      setError("");
    } catch (err) {
      setSummary(null);
      setError(err.message || "No fue posible cargar los reportes");
    } finally {
      setLoading(false);
    }
  }

  const kpis = useMemo(() => {
    const values = summary?.kpis;
    return [
      {
        label: "Ingresos del Mes",
        value: fmtCurrency(values?.currentMonthSales),
        change: fmtPercent(values?.salesGrowth),
        up: Number(values?.salesGrowth || 0) >= 0,
        icon: "payments",
      },
      {
        label: "Ticket Promedio",
        value: fmtCurrency(values?.averageTicket),
        change: `${values?.currentMonthOrders || 0} órdenes`,
        up: true,
        icon: "receipt_long",
      },
      {
        label: "Unidades Vendidas",
        value: Number(values?.currentMonthUnits || 0).toLocaleString("es-VE"),
        change: fmtPercent(values?.unitsGrowth),
        up: Number(values?.unitsGrowth || 0) >= 0,
        icon: "sell",
      },
      {
        label: "Clientes con Deuda",
        value: Number(values?.totalCustomersWithDebt || 0).toLocaleString("es-VE"),
        change: `${values?.totalCustomers || 0} clientes registrados`,
        up: false,
        icon: "account_balance_wallet",
      },
    ];
  }, [summary]);

  const monthlySales = summary?.monthlySales || [];
  const categoryRevenue = summary?.categoryRevenue || [];
  const topProducts = summary?.topProducts || [];
  const maxMonthlyValue = Math.max(...monthlySales.map((item) => Number(item.value || 0)), 0);
  const totalRevenue = Number(summary?.kpis?.totalSalesValue || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes y Analíticas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Resumen de rendimiento — {summary?.periodLabel || "Sin período"}
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white"
            style={{ border: "1px solid rgba(235,71,139,0.2)", color: "#64748b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              calendar_month
            </span>
            {summary?.periodLabel || "Período actual"}
          </div>
          <button
            onClick={loadSummary}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              refresh
            </span>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white p-5 rounded-xl"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 text-sm font-medium">{k.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(235,71,139,0.1)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px", color: PRIMARY }}>
                  {k.icon}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{loading ? "..." : k.value}</h3>
            <div className="mt-1 text-xs font-semibold flex items-center gap-1" style={{ color: k.up ? "#10b981" : "#ef4444" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                {k.up ? "trending_up" : "trending_down"}
              </span>
              {loading ? "Cargando..." : k.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-900">Ventas Mensuales</h2>
              <p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="text-xs font-semibold" style={{ color: PRIMARY }}>
              {fmtCurrency(totalRevenue)} acumulado
            </div>
          </div>
          {monthlySales.length === 0 && !loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined" style={{ fontSize: "42px" }}>bar_chart</span>
              <p className="text-sm mt-2">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlySales.map((m, index) => {
                const value = Number(m.value || 0);
                const height = maxMonthlyValue > 0 ? Math.max((value / maxMonthlyValue) * 160, 8) : 8;
                const isLast = index === monthlySales.length - 1;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{fmtCurrency(value)}</span>
                    <div
                      className="w-full rounded-t-lg transition-all relative overflow-hidden"
                      style={{
                        height: `${height}px`,
                        backgroundColor: isLast ? PRIMARY : "rgba(235,71,139,0.2)",
                      }}
                    />
                    <span className="text-xs font-medium text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
          <h2 className="font-bold text-slate-900 mb-1">Ventas por Categoría</h2>
          <p className="text-xs text-slate-500 mb-5">Distribución real de ingresos</p>
          {categoryRevenue.length === 0 && !loading ? (
            <div className="py-10 text-center text-slate-400">
              <span className="material-symbols-outlined" style={{ fontSize: "42px" }}>category</span>
              <p className="text-sm mt-2">Sin categorías con ventas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryRevenue.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-sm font-medium text-slate-700">{c.category}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{fmtPercent(c.pct)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(Number(c.pct || 0), 0)}%`, backgroundColor: c.color }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{fmtCurrency(c.revenue)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}>
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-sm font-bold" style={{ color: PRIMARY }}>{fmtCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
          <h2 className="font-bold text-slate-900">Productos Más Vendidos</h2>
          <span className="text-xs font-medium" style={{ color: PRIMARY }}>{topProducts.length} productos</span>
        </div>
        {topProducts.length === 0 && !loading ? (
          <div className="p-10 text-center text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: "42px" }}>inventory_2</span>
            <p className="text-sm mt-2">Todavía no hay productos vendidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: "#f8f6f7" }}>
                  {["#", "Producto", "Categoría", "Unidades Vendidas", "Ingresos", "Participación"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={`${p.name}-${i}`} style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}>
                    <td className="px-5 py-4">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={i === 0 ? { backgroundColor: PRIMARY, color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}
                      >
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-sm text-slate-900">{p.name}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{Number(p.units || 0).toLocaleString("es-VE")}</td>
                    <td className="px-5 py-4 font-bold text-sm" style={{ color: PRIMARY }}>{fmtCurrency(p.revenue)}</td>
                    <td className="px-5 py-4 text-xs font-semibold" style={{ color: "#10b981" }}>{fmtPercent(p.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
