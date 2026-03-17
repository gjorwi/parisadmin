"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const suppliers = [
  {
    id: 1,
    name: "Maison Élégance",
    contact: "Pierre Dubois",
    email: "pierre@maison-elegance.fr",
    phone: "+33 1 42 68 53 00",
    country: "Francia",
    categories: ["Ropa", "Accesorios"],
    products: 48,
    status: "Activo",
    lastOrder: "10 Mar 2026",
    rating: 5,
  },
  {
    id: 2,
    name: "Milano Couture",
    contact: "Giulia Rossi",
    email: "giulia@milanocouture.it",
    phone: "+39 02 8738 4400",
    country: "Italia",
    categories: ["Calzado", "Bolsos"],
    products: 35,
    status: "Activo",
    lastOrder: "8 Mar 2026",
    rating: 4,
  },
  {
    id: 3,
    name: "Bijoux de Paris",
    contact: "Sophie Martin",
    email: "sophie@bijoux-paris.com",
    phone: "+33 1 53 29 90 00",
    country: "Francia",
    categories: ["Joyería"],
    products: 22,
    status: "Activo",
    lastOrder: "5 Mar 2026",
    rating: 5,
  },
  {
    id: 4,
    name: "Seda Ibérica",
    contact: "Carlos Vega",
    email: "cvega@sedaiberica.es",
    phone: "+34 93 412 5500",
    country: "España",
    categories: ["Ropa", "Accesorios"],
    products: 29,
    status: "Inactivo",
    lastOrder: "15 Ene 2026",
    rating: 3,
  },
  {
    id: 5,
    name: "Luxe Fabrics Co.",
    contact: "Emma Thompson",
    email: "emma@luxefabrics.co.uk",
    phone: "+44 20 7946 0958",
    country: "Reino Unido",
    categories: ["Ropa"],
    products: 17,
    status: "Activo",
    lastOrder: "12 Mar 2026",
    rating: 4,
  },
  {
    id: 6,
    name: "Buenos Aires Leather",
    contact: "Alejandro Ríos",
    email: "arios@baleather.com.ar",
    phone: "+54 11 4321 7890",
    country: "Argentina",
    categories: ["Calzado", "Bolsos"],
    products: 41,
    status: "Activo",
    lastOrder: "9 Mar 2026",
    rating: 4,
  },
];

const categoryColors = {
  Ropa: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
  Accesorios: { bg: "rgba(235,71,139,0.1)", color: "#eb478b" },
  Calzado: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  Bolsos: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed" },
  Joyería: { bg: "rgba(16,185,129,0.1)", color: "#059669" },
};

export default function ProveedoresPage() {
  const emptyForm = {
    name: "",
    contact: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    notes: "",
    isActive: true,
  };

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await api.suppliers();
      setSuppliersData(data);
      setError("");
    } catch (err) {
      setError(err.message || "No fue posible cargar proveedores");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return suppliersData.filter((s) => {
      const term = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(term) ||
        s.contact?.toLowerCase().includes(term) ||
        s.country?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
      );
    });
  }, [search, suppliersData]);

  const counts = useMemo(() => ({
    total: suppliersData.length,
    active: suppliersData.filter((s) => s.isActive).length,
    inactive: suppliersData.filter((s) => !s.isActive).length,
    countries: new Set(suppliersData.map((s) => s.country).filter(Boolean)).size,
  }), [suppliersData]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(false);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(item) {
    setForm({
      name: item.name || "",
      contact: item.contact || "",
      email: item.email || "",
      phone: item.phone || "",
      country: item.country || "",
      address: item.address || "",
      notes: item.notes || "",
      isActive: Boolean(item.isActive),
    });
    setEditingId(item._id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      if (editingId) {
        await api.updateSupplier(editingId, form);
      } else {
        await api.createSupplier(form);
      }
      await loadSuppliers();
      resetForm();
    } catch (err) {
      setError(err.message || "No fue posible guardar el proveedor");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("¿Deseas eliminar este proveedor?");
    if (!confirmed) return;

    try {
      await api.deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      setError(err.message || "No fue posible eliminar el proveedor");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h1>
        <p className="text-slate-500 text-sm mt-1">
          Administra las relaciones con tus proveedores y fabricantes.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Proveedores", value: counts.total, icon: "group", color: "#eb478b" },
          { label: "Activos", value: counts.active, icon: "verified", color: "#10b981" },
          { label: "Inactivos", value: counts.inactive, icon: "pause_circle", color: "#f59e0b" },
          { label: "Países", value: counts.countries, icon: "public", color: "#3b82f6" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white p-4 rounded-xl flex items-center gap-4"
            style={{ border: "1px solid rgba(235,71,139,0.1)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px", color: c.color }}>{c.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl mb-0 overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
        <div className="p-4 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
          <div className="relative flex-1 min-w-48">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: "18px" }}>
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proveedor, contacto o país..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.15)" }}
            />
          </div>

          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.2)" }}>
            {[
              { v: "grid", icon: "grid_view" },
              { v: "list", icon: "view_list" },
            ].map(({ v, icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="p-2 transition-colors"
                style={view === v ? { backgroundColor: "#eb478b", color: "#fff" } : { backgroundColor: "transparent", color: "#64748b" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
              </button>
            ))}
          </div>

          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#eb478b" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
            Nuevo Proveedor
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando proveedores...</div>
        ) : view === "grid" ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s._id} className="p-5 rounded-xl transition-all" style={{ border: "1px solid rgba(235,71,139,0.1)", backgroundColor: "#fafafa" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: "rgba(235,71,139,0.12)", color: "#eb478b" }}>
                      {s.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.country || "Sin país"}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={s.isActive ? { backgroundColor: "rgba(16,185,129,0.1)", color: "#059669" } : { backgroundColor: "rgba(245,158,11,0.1)", color: "#d97706" }}>
                    {s.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>person</span>{s.contact || "Sin contacto"}</div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>mail</span>{s.email || "Sin correo"}</div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>phone</span>{s.phone || "Sin teléfono"}</div>
                </div>

                <div className="text-xs text-slate-500 mb-4 min-h-10">{s.address || s.notes || "Sin observaciones"}</div>

                <div className="flex items-center justify-end gap-1 pt-3" style={{ borderTop: "1px solid rgba(235,71,139,0.08)" }}>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 transition-colors" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.1)"; e.currentTarget.style.color = "#eb478b"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg text-slate-400 transition-colors" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: "#f8f6f7" }}>
                  {["Proveedor", "Contacto", "País", "Teléfono", "Estado", "Acciones"].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 5 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}>
                    <td className="px-5 py-3.5 font-semibold text-sm text-slate-900">{s.name}</td>
                    <td className="px-5 py-3.5"><p className="text-sm text-slate-700">{s.contact || "-"}</p><p className="text-xs text-slate-500">{s.email || "-"}</p></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.country || "-"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.phone || "-"}</td>
                    <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={s.isActive ? { backgroundColor: "rgba(16,185,129,0.1)", color: "#059669" } : { backgroundColor: "rgba(245,158,11,0.1)", color: "#d97706" }}>{s.isActive ? "Activo" : "Inactivo"}</span></td>
                    <td className="px-5 py-3.5 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 transition-colors"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span></button><button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg text-slate-400 transition-colors"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No se encontraron proveedores con los criterios de búsqueda.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}>
              <h2 className="text-xl font-bold text-slate-900">{editingId ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(235,71,139,0.1)" }}>
                <span className="material-symbols-outlined" style={{ color: "#eb478b", fontSize: "20px" }}>close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["name", "Proveedor"],
                  ["contact", "Contacto"],
                  ["email", "Correo"],
                  ["phone", "Teléfono"],
                  ["country", "País"],
                  ["address", "Dirección"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
                    <input value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} required={key === "name"} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas</label>
                <textarea rows="3" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))} />
                Proveedor activo
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "rgba(235,71,139,0.1)", color: "#eb478b" }}>Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: saving ? "#f3a7c7" : "#eb478b" }}>{saving ? "Guardando..." : editingId ? "Actualizar Proveedor" : "Guardar Proveedor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
