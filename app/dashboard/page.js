"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const PRIMARY = "#eb478b";

const stats = [
  {
    label: "Ventas del Día",
    value: "$4,820",
    trend: "+18% vs. ayer",
    trendIcon: "trending_up",
    trendColor: "#10b981",
  },
  {
    label: "Clientes con Deuda",
    value: "7",
    trend: "Saldo total: $3,940",
    trendIcon: "account_balance_wallet",
    trendColor: "#eb478b",
    valueColor: "#eb478b",
  },
  {
    label: "Pedidos Pendientes",
    value: "12",
    trend: "4 urgentes",
    trendIcon: "schedule",
    trendColor: "#f59e0b",
  },
  {
    label: "Ingresos del Mes",
    value: "$52,300",
    trend: "+22% vs. mes anterior",
    trendIcon: "trending_up",
    trendColor: "#10b981",
  },
];

const deudores = [
  { nombre: "María González",    cedula: "V-12.345.678", saldo: 785,  facturas: 2, initials: "MG" },
  { nombre: "Valentina Torres",  cedula: "V-20.111.222", saldo: 940,  facturas: 3, initials: "VT" },
  { nombre: "Isabella Martínez", cedula: "V-15.432.100", saldo: 620,  facturas: 1, initials: "IM" },
  { nombre: "Sofía López",       cedula: "V-22.876.543", saldo: 455,  facturas: 2, initials: "SL" },
  { nombre: "Ana Herrera",       cedula: "V-19.234.567", saldo: 310,  facturas: 1, initials: "AH" },
  { nombre: "Gabriela Sánchez",  cedula: "V-25.001.002", saldo: 530,  facturas: 2, initials: "GS" },
  { nombre: "Daniela Castro",    cedula: "V-17.654.321", saldo: 300,  facturas: 1, initials: "DC" },
];

const ventasMensuales = [
  { mes: "Oct", valor: 38500, pct: 74 },
  { mes: "Nov", valor: 44200, pct: 85 },
  { mes: "Dic", valor: 52100, pct: 100 },
  { mes: "Ene", valor: 41300, pct: 79 },
  { mes: "Feb", valor: 47800, pct: 92 },
  { mes: "Mar", valor: 52300, pct: 100 },
];

const actividadReciente = [
  { tipo: "venta",    icon: "point_of_sale",       color: "#10b981", bg: "rgba(16,185,129,0.1)",  texto: "Venta al contado — Camila Rodríguez",  monto: "+$495.00",   tiempo: "hace 8 min" },
  { tipo: "abono",    icon: "add_card",             color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  texto: "Abono recibido — María González",        monto: "+$200.00",   tiempo: "hace 22 min" },
  { tipo: "pedido",   icon: "shopping_cart",        color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  texto: "Nuevo pedido #PB-2026-1085",              monto: "$1,280.00",  tiempo: "hace 45 min" },
  { tipo: "credito",  icon: "receipt_long",         color: "#eb478b", bg: "rgba(235,71,139,0.1)",  texto: "Factura a crédito — Valentina Torres",    monto: "-$320.00",   tiempo: "hace 1 h" },
  { tipo: "venta",    icon: "point_of_sale",        color: "#10b981", bg: "rgba(16,185,129,0.1)",  texto: "Venta al contado — Lucía Fernández",      monto: "+$940.00",   tiempo: "hace 1 h 20 min" },
  { tipo: "stock",    icon: "warning",              color: "#ef4444", bg: "rgba(239,68,68,0.1)",   texto: "Stock bajo — Parisian Night Heels",        monto: "3 uds.",     tiempo: "hace 2 h" },
];

const alertas = [
  { icon: "inventory_2",    color: "#ef4444", bg: "rgba(239,68,68,0.08)",  texto: "14 productos con stock bajo o agotado", accion: "Ver inventario",  href: "/dashboard/inventario" },
  { icon: "local_shipping", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", texto: "4 pedidos llevan más de 48 h sin enviar", accion: "Ver pedidos",    href: "/dashboard/pedidos" },
  { icon: "account_balance_wallet", color: "#eb478b", bg: "rgba(235,71,139,0.08)", texto: "3 facturas vencen esta semana", accion: "Ver clientes",  href: "/dashboard/clientes" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await api.dashboardSummary();
        setSummary(data);
      } catch (error) {
        setSummary(null);
      }
    }

    loadSummary();
  }, []);

  const dashboardStats = useMemo(() => {
    if (!summary?.stats) {
      return stats;
    }

    return [
      {
        label: "Ventas Registradas",
        value: `$${summary.stats.totalSales.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: "Total acumulado en sistema",
        trendIcon: "payments",
        trendColor: "#10b981",
      },
      {
        label: "Clientes con Deuda",
        value: String(summary.stats.customersWithDebt),
        trend: "Con saldo pendiente",
        trendIcon: "account_balance_wallet",
        trendColor: "#eb478b",
        valueColor: "#eb478b",
      },
      {
        label: "Pedidos Pendientes",
        value: String(summary.stats.pendingOrders),
        trend: "Por procesar",
        trendIcon: "schedule",
        trendColor: "#f59e0b",
      },
      {
        label: "Notificaciones",
        value: String(summary.stats.notifications),
        trend: "Alertas del sistema",
        trendIcon: "notifications",
        trendColor: "#3b82f6",
      },
    ];
  }, [summary]);

  const dashboardDebtors = useMemo(() => {
    if (!summary?.debtors?.length) {
      return deudores;
    }

    return summary.debtors.map((customer) => {
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
              <h2 className="font-bold text-slate-900">Ventas por Mes</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Últimos 6 meses</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-end gap-2 h-36">
              {ventasMensuales.map((v) => (
                <div key={v.mes} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${v.pct}%`,
                      backgroundColor: v.mes === "Mar" ? PRIMARY : "rgba(235,71,139,0.2)",
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-xs text-slate-500 font-medium">{v.mes}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(235,71,139,0.08)" }}>
              <div>
                <p className="text-xs text-slate-400">Mejor mes</p>
                <p className="text-sm font-bold text-slate-900">Mar — $52,300</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Promedio</p>
                <p className="text-sm font-bold text-slate-900">$46,033</p>
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
            {actividadReciente.map((a, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: a.bg }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: a.color }}>{a.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{a.texto}</p>
                  <p className="text-xs text-slate-400">{a.tiempo}</p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: a.monto.startsWith("+") ? "#10b981" : a.color }}>
                  {a.monto}
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
              {alertas.map((al, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: al.bg }}>
                  <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: "18px", color: al.color }}>{al.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{al.texto}</p>
                    <a href={al.href} className="text-xs font-semibold mt-1 inline-block" style={{ color: al.color }}>{al.accion} →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Accesos Rápidos</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Nueva Venta",    icon: "point_of_sale",   href: "/dashboard/ventas" },
                { label: "Ver Pedidos",    icon: "shopping_cart",   href: "/dashboard/pedidos" },
                { label: "Clientes",       icon: "manage_accounts", href: "/dashboard/clientes" },
                { label: "Reportes",       icon: "analytics",       href: "/dashboard/reportes" },
              ].map((q) => (
                <a
                  key={q.label}
                  href={q.href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center"
                  style={{ backgroundColor: "rgba(235,71,139,0.06)", border: "1px solid rgba(235,71,139,0.12)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "22px", color: PRIMARY }}>{q.icon}</span>
                  <span className="text-xs font-semibold text-slate-700">{q.label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
