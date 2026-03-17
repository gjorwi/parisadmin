"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

const PRIMARY = "#eb478b";

export default function ConfiguracionPage() {
  const [form, setForm] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "USD",
    taxRate: 0,
    lowStockThreshold: 5,
    logoUrl: "",
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.settings();
        setForm({
          storeName: data.storeName || "",
          storeEmail: data.storeEmail || "",
          storePhone: data.storePhone || "",
          storeAddress: data.storeAddress || "",
          currency: data.currency || "USD",
          taxRate: data.taxRate || 0,
          lowStockThreshold: data.lowStockThreshold || 5,
          logoUrl: data.logoUrl || "",
        });
      } catch (err) {
        setError(err.message || "No fue posible cargar la configuración");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "logoUrl") {
          body.append(key, value);
        }
      });
      if (logo) {
        body.append("logo", logo);
      }

      const data = await api.updateSettings(body);
      setForm((current) => ({ ...current, logoUrl: data.logoUrl || current.logoUrl }));
      setMessage("Configuración guardada correctamente");
    } catch (err) {
      setError(err.message || "No fue posible guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Ajustes generales del negocio, branding, impuestos y umbrales del sistema.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 md:p-6 space-y-5" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["storeName", "Nombre de la tienda", "text"],
            ["storeEmail", "Correo", "email"],
            ["storePhone", "Teléfono", "text"],
            ["currency", "Moneda", "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: "1px solid rgba(235,71,139,0.18)", backgroundColor: "#f8f6f7" }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Impuesto (%)</label>
            <input
              type="number"
              value={form.taxRate}
              onChange={(e) => updateField("taxRate", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1px solid rgba(235,71,139,0.18)", backgroundColor: "#f8f6f7" }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Umbral de stock bajo</label>
            <input
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) => updateField("lowStockThreshold", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1px solid rgba(235,71,139,0.18)", backgroundColor: "#f8f6f7" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
          <textarea
            value={form.storeAddress}
            onChange={(e) => updateField("storeAddress", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ border: "1px solid rgba(235,71,139,0.18)", backgroundColor: "#f8f6f7" }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-start">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Logo</p>
            <div className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: "rgba(235,71,139,0.08)", border: "1px solid rgba(235,71,139,0.15)" }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined" style={{ color: PRIMARY, fontSize: "36px" }}>image</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Actualizar logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-600" />
            <p className="text-xs text-slate-400 mt-2">Las imágenes se almacenan en Cloudinary.</p>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="px-5 py-3 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: saving ? "#f3a7c7" : PRIMARY }}>
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
