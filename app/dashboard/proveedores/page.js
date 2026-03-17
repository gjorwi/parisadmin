"use client";

import { useState } from "react";

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
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // 'grid' | 'list'

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className="material-symbols-outlined"
        style={{ fontSize: "14px", color: i < rating ? "#f59e0b" : "#e2e8f0" }}
      >
        star
      </span>
    ));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h1>
        <p className="text-slate-500 text-sm mt-1">
          Administra las relaciones con tus proveedores y fabricantes.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Proveedores", value: suppliers.length, icon: "group", color: "#eb478b" },
          { label: "Activos", value: suppliers.filter((s) => s.status === "Activo").length, icon: "verified", color: "#10b981" },
          { label: "Inactivos", value: suppliers.filter((s) => s.status === "Inactivo").length, icon: "pause_circle", color: "#f59e0b" },
          { label: "Países", value: new Set(suppliers.map((s) => s.country)).size, icon: "public", color: "#3b82f6" },
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

      {/* Toolbar */}
      <div
        className="bg-white rounded-xl mb-0 overflow-hidden"
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
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
              placeholder="Buscar proveedor, contacto o país..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.15)" }}
            />
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#eb478b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              add
            </span>
            Nuevo Proveedor
          </button>
        </div>

        {/* Grid view */}
        {view === "grid" ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-xl transition-all cursor-pointer"
                style={{ border: "1px solid rgba(235,71,139,0.1)", backgroundColor: "#fafafa" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(235,71,139,0.3)";
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(235,71,139,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(235,71,139,0.1)";
                  e.currentTarget.style.backgroundColor = "#fafafa";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{
                        backgroundColor: "rgba(235,71,139,0.12)",
                        color: "#eb478b",
                      }}
                    >
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.country}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={
                      s.status === "Activo"
                        ? { backgroundColor: "rgba(16,185,129,0.1)", color: "#059669" }
                        : { backgroundColor: "rgba(245,158,11,0.1)", color: "#d97706" }
                    }
                  >
                    {s.status}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>
                      person
                    </span>
                    {s.contact}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>
                      mail
                    </span>
                    {s.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#eb478b" }}>
                      phone
                    </span>
                    {s.phone}
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.categories.map((cat) => {
                    const cs = categoryColors[cat] || { bg: "#f1f5f9", color: "#475569" };
                    return (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: cs.bg, color: cs.color }}
                      >
                        {cat}
                      </span>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid rgba(235,71,139,0.08)" }}
                >
                  <div>
                    <p className="text-xs text-slate-500">Productos</p>
                    <p className="text-sm font-bold text-slate-900">{s.products}</p>
                  </div>
                  <div className="flex">{renderStars(s.rating)}</div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-lg text-slate-400 transition-colors"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.1)";
                        e.currentTarget.style.color = "#eb478b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#94a3b8";
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        edit
                      </span>
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-slate-400 transition-colors"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#94a3b8";
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: "#f8f6f7" }}>
                  {["Proveedor", "Contacto", "País", "Categorías", "Productos", "Valoración", "Estado", "Acciones"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 7 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors"
                    style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: "rgba(235,71,139,0.12)", color: "#eb478b" }}
                        >
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700">{s.contact}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.country}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {s.categories.map((cat) => {
                          const cs = categoryColors[cat] || { bg: "#f1f5f9", color: "#475569" };
                          return (
                            <span
                              key={cat}
                              className="px-1.5 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: cs.bg, color: cs.color }}
                            >
                              {cat}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900">{s.products}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex">{renderStars(s.rating)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          s.status === "Activo"
                            ? { backgroundColor: "rgba(16,185,129,0.1)", color: "#059669" }
                            : { backgroundColor: "rgba(245,158,11,0.1)", color: "#d97706" }
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.1)";
                            e.currentTarget.style.color = "#eb478b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No se encontraron proveedores con los criterios de búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
