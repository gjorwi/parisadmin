"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../../lib/api";

const allProducts = [
  { name: "Midnight Velvet Clutch", sku: "PB-ACC-001", category: "Accesorios", stock: 42, price: 285, status: "En Stock" },
  { name: "Silk Garden Maxi Dress", sku: "PB-APP-104", category: "Ropa", stock: 5, price: 495, status: "Stock Bajo" },
  { name: "Parisian Night Heels", sku: "PB-FTW-022", category: "Calzado", stock: 18, price: 320, status: "Normal" },
  { name: "L'Amour Silk Scarf", sku: "PB-ACC-045", category: "Accesorios", stock: 120, price: 125, status: "En Stock" },
  { name: "Rose Petal Blouse", sku: "PB-APP-210", category: "Ropa", stock: 0, price: 210, status: "Agotado" },
  { name: "Chanel Inspired Flats", sku: "PB-FTW-089", category: "Calzado", stock: 33, price: 180, status: "En Stock" },
  { name: "Pearl Drop Earrings", sku: "PB-JWL-012", category: "Joyería", stock: 7, price: 95, status: "Stock Bajo" },
  { name: "Bordeaux Wrap Coat", sku: "PB-APP-305", category: "Ropa", stock: 11, price: 680, status: "Normal" },
  { name: "Golden Hour Bracelet", sku: "PB-JWL-034", category: "Joyería", stock: 58, price: 145, status: "En Stock" },
  { name: "Satin Evening Bag", sku: "PB-ACC-078", category: "Accesorios", stock: 3, price: 340, status: "Stock Bajo" },
  { name: "Ivory Lace Blouse", sku: "PB-APP-198", category: "Ropa", stock: 0, price: 175, status: "Agotado" },
  { name: "Suede Ankle Boots", sku: "PB-FTW-156", category: "Calzado", stock: 24, price: 420, status: "En Stock" },
];

const categories = ["Todos", "Accesorios", "Ropa", "Calzado", "Joyería"];
const statusOptions = ["Todos", "En Stock", "Stock Bajo", "Normal", "Agotado", "Inactivo"];

const statusStyle = {
  "En Stock": { bg: "rgba(16,185,129,0.1)", color: "#059669" },
  "Stock Bajo": { bg: "rgba(235,71,139,0.1)", color: "#eb478b" },
  "Normal": { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  "Agotado": { bg: "rgba(239,68,68,0.1)", color: "#dc2626" },
  "Inactivo": { bg: "rgba(148,163,184,0.14)", color: "#475569" },
};

export default function InventarioPage() {
  const emptyForm = {
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  };

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [view, setView] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [skuMode, setSkuMode] = useState("manual");
  const [skuValue, setSkuValue] = useState("");
  const [productImages, setProductImages] = useState([null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [existingImages, setExistingImages] = useState([null, null, null]);
  const [imageErrors, setImageErrors] = useState([null, null, null]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [settings, setSettings] = useState({ lowStockThreshold: 5 });
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const stopScanner = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setScanError("");
    if (typeof window === "undefined") return;

    if (!("BarcodeDetector" in window)) {
      setScanError("Tu navegador no soporta el escáner. Usa Chrome en Android.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setScanning(true);

      await new Promise((r) => setTimeout(r, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "qr_code"] });

      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            setSkuValue(barcodes[0].rawValue);
            stopScanner();
          }
        } catch {}
      }, 300);
    } catch (err) {
      setScanError("No se pudo acceder a la cámara. Verifica los permisos.");
      setScanning(false);
    }
  }, [stopScanner]);

  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const [data, currentSettings] = await Promise.all([
        api.products(),
        api.settings(),
      ]);
      setProductsData(data);
      if (currentSettings) setSettings(currentSettings);
      setError("");
    } catch (err) {
      setError(err.message || "No fue posible cargar productos");
    } finally {
      setLoading(false);
    }
  }

  const generateSku = (category) => {
    const prefix = category ? category.substring(0, 3).toUpperCase() : "PB";
    const num = Math.floor(Math.random() * 900) + 100;
    return `PB-${prefix}-${num}`;
  };

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageChange = (idx, file) => {
    const updatedErrors = [...imageErrors];
    if (file && file.size > MAX_IMAGE_SIZE) {
      updatedErrors[idx] = `Máx. ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB`;
      setImageErrors(updatedErrors);
      return;
    }
    updatedErrors[idx] = null;
    setImageErrors(updatedErrors);

    const updated = [...productImages];
    const updatedFiles = [...imageFiles];
    const updatedExisting = [...existingImages];
    updated[idx] = file ? URL.createObjectURL(file) : null;
    updatedFiles[idx] = file || null;
    if (file) {
      updatedExisting[idx] = null;
    }
    setProductImages(updated);
    setImageFiles(updatedFiles);
    setExistingImages(updatedExisting);
  };

  const handleImageRemove = (idx) => {
    const updated = [...productImages];
    const updatedFiles = [...imageFiles];
    const updatedExisting = [...existingImages];
    updated[idx] = null;
    updatedFiles[idx] = null;
    updatedExisting[idx] = null;
    setProductImages(updated);
    setImageFiles(updatedFiles);
    setExistingImages(updatedExisting);
  };

  const handleCloseModal = () => {
    stopScanner();
    setScanError("");
    setShowModal(false);
    setSkuMode("manual");
    setSkuValue("");
    setProductImages([null, null, null]);
    setImageFiles([null, null, null]);
    setExistingImages([null, null, null]);
    setImageErrors([null, null, null]);
    setEditingId(null);
    setForm(emptyForm);
  };

  function getDisplayStatus(product) {
    const threshold = Number(settings.lowStockThreshold || 5);
    if (product.stock <= 0) return "Agotado";
    if (product.stock <= threshold) return "Stock Bajo";
    return "En Stock";
  }

  const filtered = productsData.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Todos" || p.category === categoryFilter;
    const matchStatus = statusFilter === "Todos" || getDisplayStatus(p) === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const counts = useMemo(() => ({
    total: productsData.length,
    enStock: productsData.filter((p) => {
      const status = getDisplayStatus(p);
      return status === "En Stock" || status === "Normal";
    }).length,
    stockBajo: productsData.filter((p) => getDisplayStatus(p) === "Stock Bajo").length,
    agotados: productsData.filter((p) => getDisplayStatus(p) === "Agotado").length,
  }), [productsData]);

  function openCreate() {
    handleCloseModal();
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      description: product.description || "",
    });
    setSkuMode("manual");
    setSkuValue(product.sku || "");
    const normalizedImages = [0, 1, 2].map((idx) => product.images?.[idx] || null);
    setProductImages([
      normalizedImages[0]?.url || null,
      normalizedImages[1]?.url || null,
      normalizedImages[2]?.url || null,
    ]);
    setExistingImages(normalizedImages);
    setImageFiles([null, null, null]);
    setShowModal(true);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("¿Deseas eliminar este producto?");
    if (!confirmed) return;

    try {
      await api.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.message || "No fue posible eliminar el producto");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      if (editingId) {
        const body = new FormData();
        body.append("name", form.name);
        body.append("category", form.category);
        body.append("price", String(Number(form.price)));
        body.append("stock", String(Number(form.stock)));
        body.append("description", form.description);
        body.append(
          "images",
          JSON.stringify(
            existingImages
              .filter(Boolean)
              .map((image) => ({ url: image.url, publicId: image.publicId }))
          )
        );
        imageFiles.filter(Boolean).forEach((file) => body.append("images", file));
        await api.updateProduct(editingId, body);
      } else {
        const body = new FormData();
        body.append("name", form.name);
        body.append("sku", skuValue);
        body.append("category", form.category);
        body.append("price", String(Number(form.price)));
        body.append("stock", String(Number(form.stock)));
        body.append("description", form.description);
        imageFiles.filter(Boolean).forEach((file) => body.append("images", file));
        await api.createProduct(body);
      }
      await loadProducts();
      handleCloseModal();
    } catch (err) {
      setError(err.message || "No fue posible guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra y controla todos los productos de la tienda.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shrink-0"
          style={{ backgroundColor: "#eb478b", boxShadow: "0 4px 12px rgba(235,71,139,0.3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63d7a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eb478b")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
          <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total SKUs", value: counts.total, icon: "inventory_2", color: "#eb478b" },
          { label: "En Stock", value: counts.enStock, icon: "check_circle", color: "#10b981" },
          { label: "Stock Bajo", value: counts.stockBajo, icon: "warning", color: "#eb478b" },
          { label: "Agotados", value: counts.agotados, icon: "remove_shopping_cart", color: "#ef4444" },
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

      {/* Filters */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
        <div
          className="p-4 flex flex-wrap items-center gap-3"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          {/* Search */}
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
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.15)" }}
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={
                  categoryFilter === cat
                    ? { backgroundColor: "#eb478b", color: "#fff" }
                    : { backgroundColor: "#f8f6f7", color: "#64748b" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
            style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.15)", color: "#64748b" }}
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* View toggle */}
          <div
            className="flex rounded-lg overflow-hidden ml-auto"
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
        </div>

        {/* Grid view */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando productos...</div>
        ) : view === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const displayStatus = getDisplayStatus(p);
              const st = statusStyle[displayStatus];
              return (
                <div
                  key={p.sku}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ border: "1px solid rgba(235,71,139,0.12)", backgroundColor: "#fdfcfd" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 leading-tight">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{p.sku}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                    >
                      {p.category}
                    </span>
                    <span className="text-lg font-bold" style={{ color: "#eb478b" }}>
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(235,71,139,0.08)" }}>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "14px" }}>inventory_2</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: p.stock === 0 ? "#ef4444" : p.stock < 8 ? "#eb478b" : "#0f172a" }}
                      >
                        {p.stock} uds.
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.1)"; e.currentTarget.style.color = "#eb478b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg text-slate-400 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                No se encontraron productos con los filtros seleccionados.
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f6f7" }}>
                {["Producto", "SKU", "Categoría", "Stock", "Precio", "Estado", "Acciones"].map(
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
              {filtered.map((p) => {
                const displayStatus = getDisplayStatus(p);
                const st = statusStyle[displayStatus];
                return (
                  <tr
                    key={p.sku}
                    className="transition-colors"
                    style={{ borderTop: "1px solid rgba(235,71,139,0.05)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(235,71,139,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-5 py-3.5 font-semibold text-sm text-slate-900">
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{p.sku}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: p.stock === 0 ? "#ef4444" : p.stock < 8 ? "#eb478b" : "#0f172a" }}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: "#eb478b" }}>
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
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
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
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
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        <div
          className="p-4 flex items-center justify-between text-sm text-slate-500"
          style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
        >
          <p>Mostrando {filtered.length} de {productsData.length} productos</p>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg opacity-50 cursor-not-allowed"
              style={{ border: "1px solid rgba(235,71,139,0.2)" }}
              disabled
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                chevron_left
              </span>
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
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Nuevo Producto Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6 flex items-center justify-between sticky top-0 bg-white z-10"
              style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
            >
              <h2 className="text-xl font-bold text-slate-900">{editingId ? "Editar Producto" : "Nuevo Producto"}</h2>
              <button onClick={handleCloseModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(235,71,139,0.1)" }}>
                <span className="material-symbols-outlined" style={{ color: "#eb478b", fontSize: "20px" }}>close</span>
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>

              {/* Images upload — 1 to 3 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Imágenes del Producto <span className="text-slate-400 font-normal">(máx. 3)</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <label
                        className="relative flex flex-col items-center justify-center rounded-xl cursor-pointer overflow-hidden transition-all"
                        style={{
                          border: imageErrors[idx] ? "2px dashed #ef4444" : productImages[idx] ? "2px solid #eb478b" : "2px dashed rgba(235,71,139,0.3)",
                          backgroundColor: imageErrors[idx] ? "rgba(239,68,68,0.04)" : productImages[idx] ? "transparent" : "rgba(235,71,139,0.04)",
                          aspectRatio: "3/4",
                        }}
                      >
                        {productImages[idx] ? (
                          <>
                            <img src={productImages[idx]} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleImageRemove(idx); }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                              <span className="material-symbols-outlined text-white" style={{ fontSize: "14px" }}>close</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 p-2 text-center">
                            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: imageErrors[idx] ? "#ef4444" : "rgba(235,71,139,0.5)" }}>
                              {imageErrors[idx] ? "error" : "add_photo_alternate"}
                            </span>
                            <span className="text-xs text-slate-400">{idx === 0 ? "Principal" : `Foto ${idx + 1}`}</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onClick={(e) => { e.target.value = ""; }}
                          onChange={(e) => handleImageChange(idx, e.target.files?.[0])}
                        />
                      </label>
                      {imageErrors[idx] && (
                        <p className="text-[11px] font-semibold text-center" style={{ color: "#ef4444" }}>{imageErrors[idx]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto *</label>
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400" placeholder="Ej: Vestido Elegante" />
              </div>

              {/* SKU con 3 modos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">SKU *</label>
                {!editingId && (
                  <div className="flex rounded-xl overflow-hidden mb-2" style={{ border: "1px solid rgba(235,71,139,0.2)" }}>
                    {[
                      { v: "auto", icon: "auto_awesome", label: "Auto" },
                      { v: "scan", icon: "qr_code_scanner", label: "Escanear" },
                      { v: "manual", icon: "edit", label: "Manual" },
                    ].map(({ v, icon, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setSkuMode(v);
                          if (v === "auto") { stopScanner(); setSkuValue(generateSku("")); }
                          else if (v === "scan") { setSkuValue(""); startScanner(); }
                          else { stopScanner(); setSkuValue(""); }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors"
                        style={skuMode === v ? { backgroundColor: "#eb478b", color: "#fff" } : { backgroundColor: "transparent", color: "#64748b" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={skuValue}
                    onChange={(e) => setSkuValue(e.target.value)}
                    readOnly={editingId || skuMode === "scan"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 font-mono text-sm"
                    placeholder={editingId ? "SKU no editable" : skuMode === "auto" ? "Generado automáticamente" : skuMode === "scan" ? "Esperando escaneo..." : "Ej: PB-APP-001"}
                  />
                  {skuMode === "auto" && !editingId && (
                    <button
                      type="button"
                      onClick={() => setSkuValue(generateSku(""))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "#eb478b" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>refresh</span>
                      Regenerar
                    </button>
                  )}
                </div>
                {skuMode === "scan" && !editingId && (
                  <div className="mt-2">
                    {scanning ? (
                      <div className="relative rounded-xl overflow-hidden" style={{ border: "2px solid #eb478b" }}>
                        <video ref={videoRef} className="w-full rounded-xl" style={{ maxHeight: "200px", objectFit: "cover" }} playsInline muted />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-3/4 h-1/2 border-2 border-white/60 rounded-lg" />
                        </div>
                        <button
                          type="button"
                          onClick={stopScanner}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                        >
                          <span className="material-symbols-outlined text-white" style={{ fontSize: "16px" }}>close</span>
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-xs font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                            Apunta al código de barras
                          </span>
                        </div>
                      </div>
                    ) : skuValue ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#059669" }}>check_circle</span>
                        <span className="text-sm font-semibold" style={{ color: "#059669" }}>Código escaneado</span>
                        <button type="button" onClick={startScanner} className="ml-auto text-xs font-semibold" style={{ color: "#eb478b" }}>Re-escanear</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startScanner}
                        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        style={{ backgroundColor: "rgba(235,71,139,0.08)", color: "#eb478b", border: "1px dashed rgba(235,71,139,0.3)" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>photo_camera</span>
                        Abrir cámara para escanear
                      </button>
                    )}
                    {scanError && (
                      <p className="text-xs font-medium mt-1.5" style={{ color: "#ef4444" }}>{scanError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Precio / Stock / Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Precio *</label>
                  <input value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} type="number" required step="0.01" min="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Stock *</label>
                  <input value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} type="number" required min="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => { setForm((current) => ({ ...current, category: e.target.value })); if (skuMode === "auto") setSkuValue(generateSku(e.target.value)); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                  >
                    <option value="">Seleccionar</option>
                    {categories.filter(c => c !== "Todos").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 resize-none" placeholder="Descripción del producto..." />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "rgba(235,71,139,0.1)", color: "#eb478b" }}>Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: saving ? "#f3a7c7" : "#eb478b" }}>{saving ? "Guardando..." : editingId ? "Actualizar Producto" : "Guardar Producto"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
