"use client";

const monthlySales = [
  { month: "Oct", value: 38500, pct: 57 },
  { month: "Nov", value: 52300, pct: 77 },
  { month: "Dic", value: 68000, pct: 100 },
  { month: "Ene", value: 41200, pct: 61 },
  { month: "Feb", value: 47800, pct: 70 },
  { month: "Mar", value: 53600, pct: 79 },
];

const categoryRevenue = [
  { category: "Ropa", revenue: 58400, pct: 41, color: "#3b82f6" },
  { category: "Calzado", revenue: 34200, pct: 24, color: "#eb478b" },
  { category: "Accesorios", revenue: 28900, pct: 20, color: "#10b981" },
  { category: "Joyería", revenue: 21000, pct: 15, color: "#f59e0b" },
];

const topProducts = [
  { name: "Silk Garden Maxi Dress", category: "Ropa", units: 142, revenue: "$70,290", growth: "+18%" },
  { name: "Parisian Night Heels", category: "Calzado", units: 98, revenue: "$31,360", growth: "+12%" },
  { name: "Midnight Velvet Clutch", category: "Accesorios", units: 87, revenue: "$24,795", growth: "+9%" },
  { name: "Golden Hour Bracelet", category: "Joyería", units: 134, revenue: "$19,430", growth: "+22%" },
  { name: "L'Amour Silk Scarf", category: "Accesorios", units: 110, revenue: "$13,750", growth: "+5%" },
];

const kpis = [
  { label: "Ingresos del Mes", value: "$53,600", change: "+12%", up: true, icon: "payments" },
  { label: "Ticket Promedio", value: "$342", change: "+8%", up: true, icon: "receipt_long" },
  { label: "Unidades Vendidas", value: "892", change: "+15%", up: true, icon: "sell" },
  { label: "Tasa de Devolución", value: "2.4%", change: "-0.5%", up: false, icon: "assignment_return" },
];

export default function ReportesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes y Analíticas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Resumen de rendimiento — Marzo 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ border: "1px solid rgba(235,71,139,0.2)", color: "#64748b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              calendar_month
            </span>
            Mar 2026
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#eb478b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              download
            </span>
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white p-5 rounded-xl"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 text-sm font-medium">{k.label}</p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(235,71,139,0.1)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: "#eb478b" }}
                >
                  {k.icon}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{k.value}</h3>
            <div
              className="mt-1 text-xs font-semibold flex items-center gap-1"
              style={{ color: k.up ? "#10b981" : "#ef4444" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                {k.up ? "trending_up" : "trending_down"}
              </span>
              {k.change} vs mes anterior
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Bar chart – monthly sales */}
        <div
          className="xl:col-span-2 bg-white p-6 rounded-xl"
          style={{ border: "1px solid rgba(235,71,139,0.1)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-900">Ventas Mensuales</h2>
              <p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p>
            </div>
            <div
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "#10b981" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                trending_up
              </span>
              +12% vs período anterior
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlySales.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  ${(m.value / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full rounded-t-lg transition-all relative overflow-hidden"
                  style={{
                    height: `${m.pct * 1.7}px`,
                    backgroundColor: m.month === "Mar" ? "#eb478b" : "rgba(235,71,139,0.2)",
                  }}
                >
                  {m.month === "Mar" && (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
                      }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut-style category breakdown */}
        <div
          className="bg-white p-6 rounded-xl"
          style={{ border: "1px solid rgba(235,71,139,0.1)" }}
        >
          <h2 className="font-bold text-slate-900 mb-1">Ventas por Categoría</h2>
          <p className="text-xs text-slate-500 mb-5">Distribución de ingresos</p>

          {/* Visual bars */}
          <div className="space-y-4">
            {categoryRevenue.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{c.category}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{c.pct}%</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ${c.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            className="mt-5 pt-4 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
          >
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-sm font-bold" style={{ color: "#eb478b" }}>
              $142,500
            </span>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
        <div
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          <h2 className="font-bold text-slate-900">Productos Más Vendidos</h2>
          <button
            className="text-xs font-medium"
            style={{ color: "#eb478b" }}
          >
            Ver todo el catálogo →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ backgroundColor: "#f8f6f7" }}>
                {["#", "Producto", "Categoría", "Unidades Vendidas", "Ingresos", "Crecimiento"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr
                  key={p.name}
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
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={
                        i === 0
                          ? { backgroundColor: "#eb478b", color: "#fff" }
                          : { backgroundColor: "#f1f5f9", color: "#64748b" }
                      }
                    >
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-sm text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">
                    {p.units}
                  </td>
                  <td
                    className="px-5 py-4 font-bold text-sm"
                    style={{ color: "#eb478b" }}
                  >
                    {p.revenue}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "#10b981" }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px" }}
                      >
                        trending_up
                      </span>
                      {p.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
