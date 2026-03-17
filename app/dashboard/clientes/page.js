"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const PRIMARY = "#eb478b";

const PAYMENT_METHOD_LABELS = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  pago_movil: "Pago móvil",
};

/* ─── Helpers ────────────────────────────────────────── */
const calcSaldo = (f) => f.total - f.pagado;

const clienteDeuda = (c) =>
  c.facturas
    .filter((f) => f.status !== "pagada" && f.status !== "cancelada")
    .reduce((s, f) => s + calcSaldo(f), 0);

const statusStyle = {
  pagada: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Pagada" },
  parcial: { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Parcial" },
  pendiente: { bg: "rgba(235,71,139,0.1)", color: "#eb478b", label: "Pendiente" },
  cancelada: { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Cancelada" },
};

const fmt = (n) => `$${Number(n).toFixed(2)}`;

/* ─── Modal: Agregar Abono ───────────────────────────── */
function AbonoModal({ factura, onClose, onSave }) {
  const saldo = calcSaldo(factura);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");
  const [moneda, setMoneda] = useState("USD");
  const [tasa, setTasa] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [obs, setObs] = useState("");

  const montoNum = parseFloat(monto) || 0;
  const tasaNum = parseFloat(tasa) || 0;
  const montoUsd = moneda === "VES" ? (tasaNum > 0 ? montoNum / tasaNum : 0) : montoNum;
  const montoVes = moneda === "VES" ? montoNum : montoUsd * tasaNum;
  const valid = montoUsd > 0 && montoUsd <= saldo && (moneda === "USD" || tasaNum > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl z-10">
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          <div>
            <h3 className="font-bold text-slate-900">Agregar Abono</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Factura {factura.id} · Saldo pendiente:{" "}
              <span className="font-semibold" style={{ color: PRIMARY }}>
                {fmt(saldo)}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monto del Abono *
            </label>
            <div className="flex gap-2 mb-2">
              {[
                { v: "USD", label: "Dólares" },
                { v: "VES", label: "Bolívares" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setMoneda(v)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={
                    moneda === v
                      ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.35)" }
                      : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                {moneda === "VES" ? "Bs." : "$"}
              </span>
              <input
                type="number"
                min="0.01"
                max={moneda === "VES" && tasaNum > 0 ? saldo * tasaNum : saldo}
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder={moneda === "VES" && tasaNum > 0 ? `Máx. ${(saldo * tasaNum).toFixed(2)}` : `Máx. ${saldo.toFixed(2)}`}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  borderColor: !valid && monto ? "#ef4444" : "rgba(235,71,139,0.2)",
                  backgroundColor: "#f8f6f7",
                }}
              />
            </div>
            {moneda === "VES" && (
              <div className="mt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tasa USD a VES *
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={tasa}
                  onChange={(e) => setTasa(e.target.value)}
                  placeholder="Ej. 108.2500"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                  style={{
                    borderColor: moneda === "VES" && !tasaNum && tasa ? "#ef4444" : "rgba(235,71,139,0.2)",
                    backgroundColor: "#f8f6f7",
                  }}
                />
              </div>
            )}
            {monto && montoUsd > saldo && (
              <p className="text-xs text-red-500 mt-1">
                El monto excede el saldo de {fmt(saldo)}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              {[saldo / 2, saldo].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setMonto((moneda === "VES" && tasaNum > 0 ? v * tasaNum : v).toFixed(2))}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    backgroundColor: "rgba(235,71,139,0.08)",
                    color: PRIMARY,
                  }}
                >
                  {i === 0 ? "50%" : "Cancelar todo"} ({fmt(v)})
                </button>
              ))}
            </div>
            {montoUsd > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Equivale a <span className="font-semibold">{fmt(montoUsd)}</span>
                {moneda === "VES" ? ` con tasa ${tasaNum || 0}` : ""}
              </p>
            )}
          </div>

          {/* Método */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Método de Pago
            </label>
            <div className="flex gap-2">
              {[
                { v: "efectivo", label: "Efectivo", icon: "payments" },
                { v: "tarjeta", label: "Tarjeta", icon: "credit_card" },
                { v: "transferencia", label: "Transferencia", icon: "account_balance" },
                { v: "pago_movil", label: "Pago móvil", icon: "smartphone" },
              ].map(({ v, label, icon }) => (
                <button
                  key={v}
                  onClick={() => setMetodo(v)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-colors"
                  style={
                    metodo === v
                      ? { backgroundColor: "rgba(235,71,139,0.1)", color: PRIMARY, border: `1px solid ${PRIMARY}` }
                      : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fecha del Abono
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                border: "1px solid rgba(235,71,139,0.2)",
                backgroundColor: "#f8f6f7",
              }}
            />
          </div>

          {/* Observación */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Observación (opcional)
            </label>
            <input
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Referencia de pago, nota..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                border: "1px solid rgba(235,71,139,0.2)",
                backgroundColor: "#f8f6f7",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5"
          style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => valid && onSave({ monto: montoUsd, metodo, moneda, montoVes, tasa: tasaNum, fecha, obs })}
            disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              backgroundColor: valid ? PRIMARY : "#e2e8f0",
              color: valid ? "#fff" : "#94a3b8",
            }}
          >
            Registrar Abono
          </button>
        </div>
      </div>
    </div>
  );
}

function FacturaDetalleModal({ factura, onClose }) {
  const saldo = calcSaldo(factura);
  const pagos = factura.pagos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
          <div>
            <h3 className="font-bold text-slate-900">Detalle de factura</h3>
            <p className="text-xs text-slate-500 mt-0.5">{factura.id} · {factura.fecha}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: "#f8f6f7" }}>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">{fmt(factura.total)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
              <p className="text-xs text-slate-500">Pagado</p>
              <p className="text-lg font-bold" style={{ color: "#10b981" }}>{fmt(factura.pagado)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: saldo > 0 ? "rgba(235,71,139,0.08)" : "rgba(16,185,129,0.08)" }}>
              <p className="text-xs text-slate-500">Saldo</p>
              <p className="text-lg font-bold" style={{ color: saldo > 0 ? PRIMARY : "#10b981" }}>{fmt(saldo)}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Productos facturados</h4>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: "#f8f6f7" }}>
                    {["Producto", "Cantidad", "Precio", "Total"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factura.items.map((it, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}>
                      <td className="px-4 py-3 text-sm text-slate-700">{it.nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{it.qty}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(it.precio)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{fmt(it.qty * it.precio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900">Historial de pagos</h4>
              <span className="text-xs text-slate-500">{pagos.length} {pagos.length === 1 ? "parte" : "partes"}</span>
            </div>
            {pagos.length === 0 ? (
              <div className="rounded-xl p-4 text-sm text-slate-400 text-center" style={{ backgroundColor: "#f8f6f7" }}>
                Esta factura aún no registra pagos parciales.
              </div>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago, index) => (
                  <div key={`${factura.id}-pago-${index}`} className="rounded-xl p-4" style={{ border: "1px solid rgba(235,71,139,0.1)", backgroundColor: "#fff" }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Pago #{index + 1}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{pago.fecha}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.1)", color: PRIMARY }}>
                          {PAYMENT_METHOD_LABELS[pago.metodo] || pago.metodo}
                        </span>
                        <span className="px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#059669" }}>
                          {pago.moneda}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="rounded-lg p-3" style={{ backgroundColor: "#f8f6f7" }}>
                        <p className="text-xs text-slate-500">Monto USD</p>
                        <p className="text-sm font-bold text-slate-900">{fmt(pago.montoUsd)}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ backgroundColor: "#f8f6f7" }}>
                        <p className="text-xs text-slate-500">Monto VES</p>
                        <p className="text-sm font-bold text-slate-900">Bs. {Number(pago.montoVes || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ backgroundColor: "#f8f6f7" }}>
                        <p className="text-xs text-slate-500">Tasa usada</p>
                        <p className="text-sm font-bold text-slate-900">{Number(pago.tasa || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                      </div>
                    </div>
                    {pago.observacion && (
                      <p className="text-xs text-slate-500 mt-3">{pago.observacion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Cancelar Factura ────────────────────────── */
function CancelarModal({ factura, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl z-10 p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
        >
          <span
            className="material-symbols-outlined text-red-500"
            style={{ fontSize: "32px" }}
          >
            cancel
          </span>
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">
          ¿Cancelar Factura?
        </h3>
        <p className="text-slate-500 text-sm mb-1">
          Factura{" "}
          <span className="font-semibold text-slate-800">{factura.id}</span>
        </p>
        <p className="text-slate-500 text-sm mb-5">
          Total:{" "}
          <span className="font-bold" style={{ color: PRIMARY }}>
            {fmt(factura.total)}
          </span>{" "}
          · Saldo:{" "}
          <span className="font-bold text-red-500">{fmt(calcSaldo(factura))}</span>
        </p>
        <p className="text-xs text-slate-400 mb-5">
          Esta acción marcará la factura como cancelada y saldará el balance
          pendiente. No se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500"
          >
            Cancelar Factura
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [facturasView, setFacturasView] = useState("grid");
  const [filterDeuda, setFilterDeuda] = useState("todos"); // todos | con-deuda | sin-deuda
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [abonoFactura, setAbonoFactura] = useState(null);
  const [cancelFactura, setCancelFactura] = useState(null);
  const [detailFactura, setDetailFactura] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await api.customers();
      const normalized = data.map((customer) => ({
        id: customer._id,
        nombre: customer.nombre || "",
        cedula: customer.cedula || "",
        email: customer.email || "",
        telefono: customer.telefono || "",
        direccion: customer.direccion || "",
        facturas: (customer.facturas || []).map((factura) => ({
          id: factura.id,
          fecha: factura.fecha,
          items: (factura.items || []).map((item) => ({
            nombre: item.nombre,
            qty: Number(item.qty || 0),
            precio: Number(item.precio || 0),
          })),
          total: Number(factura.total || 0),
          pagado: Number(factura.pagado || 0),
          pagos: (factura.pagos || []).map((pago) => ({
            fecha: pago.fecha,
            metodo: pago.metodo,
            moneda: pago.moneda || "USD",
            montoUsd: Number(pago.montoUsd || 0),
            montoVes: Number(pago.montoVes || 0),
            tasa: Number(pago.tasa || 0),
            observacion: pago.observacion || "",
          })),
          status: factura.status || "pendiente",
        })),
      }));
      setClientes(normalized);
      setSelected((current) => normalized.find((c) => c.id === current?.id) || null);
      setError("");
    } catch (err) {
      setClientes([]);
      setSelected(null);
      setError(err.message || "No fue posible cargar los clientes");
    } finally {
      setLoading(false);
    }
  }

  /* Filtered list */
  const filteredClientes = useMemo(() => clientes.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.cedula.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const deuda = clienteDeuda(c);
    if (filterDeuda === "con-deuda") return matchSearch && deuda > 0;
    if (filterDeuda === "sin-deuda") return matchSearch && deuda === 0;
    return matchSearch;
  }), [clientes, filterDeuda, search]);

  /* Ledger movements from facturas */
  const buildMovimientos = (cliente) => {
    const movs = [];
    let saldo = 0;
    cliente.facturas
      .slice()
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach((f) => {
        saldo += f.total;
        movs.push({
          fecha: f.fecha,
          descripcion: `Factura ${f.id}`,
          debe: f.total,
          haber: 0,
          saldo,
          tipo: "cargo",
        });
        if (f.pagado > 0) {
          saldo -= f.pagado;
          movs.push({
            fecha: f.fecha,
            descripcion: `Abono — ${f.id}`,
            debe: 0,
            haber: f.pagado,
            saldo,
            tipo: "abono",
          });
        }
      });
    return movs;
  };

  /* ── Render ── */
  const totalFacturado = selected
    ? selected.facturas.reduce((s, f) => s + f.total, 0)
    : 0;
  const totalPagado = selected
    ? selected.facturas.reduce((s, f) => s + f.pagado, 0)
    : 0;
  const totalSaldo = totalFacturado - totalPagado;
  const movimientos = selected ? buildMovimientos(selected) : [];

  const handleAbonoSave = async ({ monto, metodo, moneda, montoVes, tasa, fecha, obs }) => {
    if (!selected || !abonoFactura) {
      return;
    }

    try {
      setError("");
      await api.addCustomerInvoicePayment(selected.id, abonoFactura.id, { amount: monto, metodo, moneda, montoVes, tasa, fecha, obs });
      setAbonoFactura(null);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "No fue posible registrar el abono");
    }
  };

  const handleCancelarFactura = async () => {
    if (!selected || !cancelFactura) {
      return;
    }

    try {
      setError("");
      await api.cancelCustomerInvoice(selected.id, cancelFactura.id);
      setCancelFactura(null);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "No fue posible cancelar la factura");
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {/* ── LEFT: Customer List ─────────────────── */}
        <div
          className={`w-full lg:w-72 flex-col bg-white rounded-xl overflow-hidden shrink-0 lg:!flex lg:h-[calc(100vh-9rem)] ${
            selected ? "hidden" : "flex"
          }`}
          style={{ border: "1px solid rgba(235,71,139,0.1)" }}
        >
          {/* Search */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
          >
            <div className="relative mb-2">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                style={{ fontSize: "17px" }}
              >
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, cédula, email..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  backgroundColor: "#f8f6f7",
                  border: "1px solid rgba(235,71,139,0.15)",
                }}
              />
            </div>
            <div className="flex gap-1">
              {[
                { v: "todos", label: "Todos" },
                { v: "con-deuda", label: "Con deuda" },
                { v: "sin-deuda", label: "Al día" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setFilterDeuda(v)}
                  className="flex-1 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={
                    filterDeuda === v
                      ? { backgroundColor: PRIMARY, color: "#fff" }
                      : { backgroundColor: "#f8f6f7", color: "#64748b" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-3 mt-3 p-3 rounded-xl text-xs" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>
                  progress_activity
                </span>
                <p className="text-sm mt-2">Cargando clientes...</p>
              </div>
            )}
            {!loading && filteredClientes.map((c) => {
              const deuda = clienteDeuda(c);
              const isSelected = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="w-full text-left px-3 py-3 flex items-center gap-3 transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(235,71,139,0.08)"
                      : "transparent",
                    borderLeft: isSelected
                      ? `3px solid ${PRIMARY}`
                      : "3px solid transparent",
                    borderBottom: "1px solid rgba(235,71,139,0.05)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(235,71,139,0.2)"
                        : "rgba(235,71,139,0.1)",
                      color: PRIMARY,
                    }}
                  >
                    {c.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{c.cedula}</p>
                  </div>
                  {deuda > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-lg shrink-0"
                      style={{
                        backgroundColor: "rgba(235,71,139,0.1)",
                        color: PRIMARY,
                      }}
                    >
                      {fmt(deuda)}
                    </span>
                  )}
                  {deuda === 0 && (
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{ fontSize: "16px", color: "#10b981" }}
                    >
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
            {!loading && filteredClientes.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "36px" }}
                >
                  person_off
                </span>
                <p className="text-sm mt-2">{clientes.length === 0 ? "No hay clientes registrados" : "Sin resultados"}</p>
              </div>
            )}
          </div>

          {/* Footer count */}
          <div
            className="p-3 text-xs text-slate-500 text-center"
            style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
          >
            {loading ? "Cargando..." : `${filteredClientes.length} clientes encontrados`}
          </div>
        </div>

        {/* ── RIGHT: Detail Panel ─────────────────── */}
        {!selected ? (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-slate-400 bg-white rounded-xl"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
            <span className="material-symbols-outlined mb-3" style={{ fontSize: "56px" }}>
              manage_accounts
            </span>
            <p className="font-semibold text-slate-500">{clientes.length === 0 ? "No hay clientes registrados" : "Selecciona un cliente"}</p>
            <p className="text-sm text-slate-400 mt-1">
              {clientes.length === 0 ? "Los clientes aparecerán aquí cuando existan en la base de datos" : "para ver sus facturas y estado de cuenta"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Back button for mobile */}
            <button
              onClick={() => setSelected(null)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold transition-colors"
              style={{ border: "1px solid rgba(235,71,139,0.2)", color: PRIMARY }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              Volver a la lista
            </button>
            {/* ── Info header ── */}
            <div
              className="bg-white rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start gap-4 md:justify-between"
              style={{ border: "1px solid rgba(235,71,139,0.1)" }}
            >
              <div className="flex items-start gap-3 md:gap-4 w-full md:w-auto">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold shrink-0"
                  style={{
                    backgroundColor: "rgba(235,71,139,0.12)",
                    color: PRIMARY,
                  }}
                >
                  {selected.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">
                    {selected.nombre}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-2">
                    {[
                      { icon: "badge", text: selected.cedula },
                      { icon: "mail", text: selected.email },
                      { icon: "phone", text: selected.telefono },
                    ].map(({ icon, text }) => (
                      <span
                        key={icon}
                        className="flex items-center gap-1 text-xs text-slate-500"
                      >
                        <span
                          className="material-symbols-outlined shrink-0"
                          style={{ fontSize: "14px", color: PRIMARY }}
                        >
                          {icon}
                        </span>
                        <span className="truncate">{text}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-start gap-1">
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{ fontSize: "13px" }}
                    >
                      location_on
                    </span>
                    <span className="line-clamp-2">{selected.direccion}</span>
                  </p>
                </div>
              </div>
              {totalSaldo > 0 && (
                <div
                  className="px-4 py-2 rounded-xl text-center shrink-0 w-full md:w-auto"
                  style={{
                    backgroundColor: "rgba(235,71,139,0.08)",
                    border: "1px solid rgba(235,71,139,0.2)",
                  }}
                >
                  <p className="text-xs text-slate-500">Saldo pendiente</p>
                  <p className="text-xl font-bold" style={{ color: PRIMARY }}>
                    {fmt(totalSaldo)}
                  </p>
                </div>
              )}
            </div>

            {/* ── Balance summary cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Facturado", value: fmt(totalFacturado), icon: "receipt_long", color: "#3b82f6" },
                { label: "Total Pagado (Haber)", value: fmt(totalPagado), icon: "payments", color: "#10b981" },
                { label: "Saldo Pendiente (Debe)", value: fmt(totalSaldo), icon: "account_balance_wallet", color: totalSaldo > 0 ? PRIMARY : "#10b981" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white p-4 rounded-xl flex items-center gap-3"
                  style={{ border: "1px solid rgba(235,71,139,0.1)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${card.color}18` }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px", color: card.color }}
                    >
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Facturas ── */}
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(235,71,139,0.1)" }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
              >
                <h3 className="font-bold text-slate-900">Facturas ({selected.facturas.length})</h3>
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
                      onClick={() => setFacturasView(v)}
                      className="p-2 transition-colors"
                      style={
                        facturasView === v
                          ? { backgroundColor: PRIMARY, color: "#fff" }
                          : { backgroundColor: "transparent", color: "#64748b" }
                      }
                      title={v === "grid" ? "Vista tarjetas" : "Vista lista"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selected.facturas.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>receipt_long</span>
                  <p className="text-sm mt-2">No hay facturas registradas</p>
                </div>
              ) : facturasView === "grid" ? (
                  <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[34rem] overflow-y-auto">
                    {selected.facturas.map((f) => {
                      const st = statusStyle[f.status];
                      const saldo = calcSaldo(f);
                      const activa = f.status !== "pagada" && f.status !== "cancelada";
                      return (
                        <div
                          key={f.id}
                          className="p-4 space-y-3 rounded-xl w-full xl:max-w-none"
                          style={{ backgroundColor: "#fff", border: "1px solid rgba(235,71,139,0.1)" }}
                        >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-sm font-bold" style={{ color: PRIMARY }}>{f.id}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{f.fecha}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      {/* Items */}
                      <div className="rounded-lg p-2.5 space-y-1" style={{ backgroundColor: "#f8f6f7" }}>
                        {f.items.map((it, idx) => (
                          <p key={idx} className="text-xs text-slate-700">
                            <span className="font-semibold">{it.qty}×</span> {it.nombre}
                            <span className="text-slate-500 ml-1">(${it.precio.toFixed(2)} c/u)</span>
                          </p>
                        ))}
                      </div>
                      {/* Amounts */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center rounded-lg p-2" style={{ backgroundColor: "#f1f5f9" }}>
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-sm font-bold text-slate-900">{fmt(f.total)}</p>
                        </div>
                        <div className="text-center rounded-lg p-2" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
                          <p className="text-xs text-slate-500">Pagado</p>
                          <p className="text-sm font-bold" style={{ color: "#10b981" }}>{fmt(f.pagado)}</p>
                        </div>
                        <div className="text-center rounded-lg p-2" style={{ backgroundColor: saldo > 0 ? "rgba(235,71,139,0.08)" : "rgba(16,185,129,0.08)" }}>
                          <p className="text-xs text-slate-500">Saldo</p>
                          <p className="text-sm font-bold" style={{ color: saldo > 0 ? PRIMARY : "#10b981" }}>{fmt(saldo)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetailFactura(f)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                        >
                          Detalle
                        </button>
                        <button
                          onClick={() => setAbonoFactura(f)}
                          disabled={!activa}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor: activa ? "rgba(16,185,129,0.12)" : "#f1f5f9",
                            color: activa ? "#059669" : "#94a3b8",
                          }}
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => setCancelFactura(f)}
                          disabled={!activa}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor: activa ? "rgba(239,68,68,0.1)" : "#f1f5f9",
                            color: activa ? "#dc2626" : "#94a3b8",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                      );
                    })}
                  </div>
              ) : (
              <div className="overflow-auto max-h-[34rem]">
                <table className="w-full text-left" style={{ minWidth: "900px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f6f7" }}>
                      {["N° Factura", "Fecha", "Detalle", "Total", "Pagado (Haber)", "Saldo (Debe)", "Estado", "Acciones"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.facturas.map((f) => {
                      const st = statusStyle[f.status];
                      const saldo = calcSaldo(f);
                      const activa =
                        f.status !== "pagada" && f.status !== "cancelada";
                      return (
                        <tr
                          key={f.id}
                          style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}
                        >
                          <td className="px-4 py-3">
                            <span
                              className="font-mono text-sm font-semibold"
                              style={{ color: PRIMARY }}
                            >
                              {f.id}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {f.fecha}
                          </td>
                          <td className="px-4 py-3" style={{ maxWidth: "200px" }}>
                            <div className="space-y-0.5">
                              {f.items.map((it, idx) => (
                                <p key={idx} className="text-xs text-slate-600 leading-tight">
                                  {it.qty}× {it.nombre}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-sm text-slate-900">
                            {fmt(f.total)}
                          </td>
                          <td
                            className="px-4 py-3 font-semibold text-sm"
                            style={{ color: "#10b981" }}
                          >
                            {fmt(f.pagado)}
                          </td>
                          <td
                            className="px-4 py-3 font-bold text-sm"
                            style={{ color: saldo > 0 ? PRIMARY : "#10b981" }}
                          >
                            {fmt(saldo)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: st.bg, color: st.color }}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ minWidth: "180px" }}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDetailFactura(f)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                              >
                                Detalle
                              </button>
                              <button
                                onClick={() => setAbonoFactura(f)}
                                disabled={!activa}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                  backgroundColor: activa ? "rgba(16,185,129,0.12)" : "#f1f5f9",
                                  color: activa ? "#059669" : "#94a3b8",
                                }}
                              >
                                Abonar
                              </button>
                              <button
                                onClick={() => setCancelFactura(f)}
                                disabled={!activa}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                  backgroundColor: activa ? "rgba(239,68,68,0.1)" : "#f1f5f9",
                                  color: activa ? "#dc2626" : "#94a3b8",
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {/* ── Ledger / Movimientos ── */}
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(235,71,139,0.1)" }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", color: PRIMARY }}
                  >
                    menu_book
                  </span>
                  <h3 className="font-bold text-slate-900">
                    Estado de Cuenta (Debe / Haber)
                  </h3>
                </div>
              </div>
              <div className="overflow-auto max-h-[30rem]">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ backgroundColor: "#f8f6f7" }}>
                      {["Fecha", "Descripción", "Debe", "Haber", "Saldo"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m, i) => (
                      <tr
                        key={i}
                        style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}
                      >
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {m.fecha}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="flex items-center gap-2 text-sm font-medium text-slate-800"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  m.tipo === "cargo" ? PRIMARY : "#10b981",
                              }}
                            />
                            {m.descripcion}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-semibold"
                          style={{ color: m.debe > 0 ? PRIMARY : "#94a3b8" }}
                        >
                          {m.debe > 0 ? fmt(m.debe) : "—"}
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-semibold"
                          style={{ color: m.haber > 0 ? "#10b981" : "#94a3b8" }}
                        >
                          {m.haber > 0 ? fmt(m.haber) : "—"}
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-bold"
                          style={{ color: m.saldo > 0 ? "#f59e0b" : "#10b981" }}
                        >
                          {fmt(m.saldo)}
                        </td>
                      </tr>
                    ))}
                    {/* Balance row */}
                    <tr
                      style={{
                        borderTop: `2px solid rgba(235,71,139,0.15)`,
                        backgroundColor: "rgba(235,71,139,0.03)",
                      }}
                    >
                      <td className="px-5 py-3" />
                      <td
                        className="px-5 py-3 text-sm font-bold text-slate-900"
                      >
                        TOTALES
                      </td>
                      <td
                        className="px-5 py-3 text-sm font-bold"
                        style={{ color: PRIMARY }}
                      >
                        {fmt(totalFacturado)}
                      </td>
                      <td
                        className="px-5 py-3 text-sm font-bold"
                        style={{ color: "#10b981" }}
                      >
                        {fmt(totalPagado)}
                      </td>
                      <td
                        className="px-5 py-3 text-sm font-bold"
                        style={{ color: totalSaldo > 0 ? PRIMARY : "#10b981" }}
                      >
                        {fmt(totalSaldo)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {abonoFactura && (
        <AbonoModal factura={abonoFactura} onClose={() => setAbonoFactura(null)} onSave={handleAbonoSave} />
      )}

      {cancelFactura && (
        <CancelarModal factura={cancelFactura} onClose={() => setCancelFactura(null)} onConfirm={handleCancelarFactura} />
      )}

      {detailFactura && (
        <FacturaDetalleModal factura={detailFactura} onClose={() => setDetailFactura(null)} />
      )}
    </>
  );
}
