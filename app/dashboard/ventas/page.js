"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const PRODUCTS = [
  { sku: "PB-ACC-001", name: "Midnight Velvet Clutch", category: "Accesorios", price: 285, stock: 42 },
  { sku: "PB-APP-104", name: "Silk Garden Maxi Dress", category: "Ropa", price: 495, stock: 5 },
  { sku: "PB-FTW-022", name: "Parisian Night Heels", category: "Calzado", price: 320, stock: 18 },
  { sku: "PB-ACC-045", name: "L'Amour Silk Scarf", category: "Accesorios", price: 125, stock: 120 },
  { sku: "PB-APP-210", name: "Rose Petal Blouse", category: "Ropa", price: 210, stock: 14 },
  { sku: "PB-FTW-089", name: "Chanel Inspired Flats", category: "Calzado", price: 180, stock: 33 },
  { sku: "PB-JWL-012", name: "Pearl Drop Earrings", category: "Joyería", price: 95, stock: 7 },
  { sku: "PB-APP-305", name: "Bordeaux Wrap Coat", category: "Ropa", price: 680, stock: 11 },
  { sku: "PB-JWL-034", name: "Golden Hour Bracelet", category: "Joyería", price: 145, stock: 58 },
  { sku: "PB-ACC-078", name: "Satin Evening Bag", category: "Accesorios", price: 340, stock: 3 },
  { sku: "PB-APP-198", name: "Ivory Lace Blouse", category: "Ropa", price: 175, stock: 22 },
  { sku: "PB-FTW-156", name: "Suede Ankle Boots", category: "Calzado", price: 420, stock: 24 },
  { sku: "PB-JWL-056", name: "Diamond Stud Set", category: "Joyería", price: 320, stock: 9 },
  { sku: "PB-ACC-099", name: "Leather Belt Cincher", category: "Accesorios", price: 85, stock: 45 },
  { sku: "PB-APP-412", name: "Floral Midi Skirt", category: "Ropa", price: 245, stock: 18 },
  { sku: "PB-FTW-201", name: "Kitten Heel Mules", category: "Calzado", price: 195, stock: 27 },
];

const CUSTOMERS = [
  { id: "C001", name: "María González", cedula: "V-12.345.678", email: "maria@email.com", phone: "+58 412-1234567" },
  { id: "C002", name: "Camila Rodríguez", cedula: "V-18.765.432", email: "camila@email.com", phone: "+58 414-7654321" },
  { id: "C003", name: "Valentina Torres", cedula: "V-20.111.222", email: "vale@email.com", phone: "+58 416-1112222" },
  { id: "C004", name: "Lucía Fernández", cedula: "V-15.333.444", email: "lucia@email.com", phone: "+58 424-3334444" },
  { id: "C005", name: "Isabella Martínez", cedula: "V-22.555.666", email: "isa@email.com", phone: "+58 426-5556666" },
  { id: "C006", name: "Sofía López", cedula: "V-19.777.888", email: "sofia@email.com", phone: "+58 412-7778888" },
];

const CATEGORIES = ["Todos", "Accesorios", "Ropa", "Calzado", "Joyería"];
const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo", icon: "payments" },
  { value: "tarjeta", label: "Tarjeta", icon: "credit_card" },
  { value: "transferencia", label: "Transferencia", icon: "account_balance" },
  { value: "pago_movil", label: "Pago móvil", icon: "smartphone" },
];

const PAYMENT_CURRENCIES = [
  { value: "USD", label: "Dólares", symbol: "$" },
  { value: "VES", label: "Bolívares", symbol: "Bs." },
];

const PRIMARY = "#eb478b";

export default function VentasPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    nombre: "",
    cedula: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [saleType, setSaleType] = useState("contado"); // contado | credito | mixto
  const [successMsg, setSuccessMsg] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [abonoAmount, setAbonoAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentNote, setPaymentNote] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [settings, setSettings] = useState({ taxRate: 0 });
  const [exchangeRate, setExchangeRate] = useState(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [products, customers, currentSettings] = await Promise.all([
        api.products(),
        api.customers(),
        api.settings(),
      ]);

      setProductsData(products);
      setCustomersData(
        customers.map((customer) => ({
          id: customer._id,
          name: customer.nombre,
          cedula: customer.cedula,
          email: customer.email,
          phone: customer.telefono,
        }))
      );
      setSettings(currentSettings || { taxRate: 0 });

      const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", { cache: "no-store" });
      const rateData = await response.json();
      setExchangeRate(rateData?.promedio || null);
    } catch (err) {
      setError(err.message || "No fue posible cargar ventas");
    }
  }

  const filtered = productsData.filter((p) => {
    const s = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)) &&
      (category === "Todos" || p.category === category)
    );
  });

  const filteredCustomers = customersData.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.cedula.includes(customerSearch)
  );

  const resetCustomerForm = () => {
    setCustomerForm({
      nombre: "",
      cedula: "",
      email: "",
      telefono: "",
      direccion: "",
    });
  };

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.sku === product.sku);
      if (ex) {
        return prev.map((i) =>
          i.sku === product.sku
            ? { ...i, qty: Math.min(i.qty + 1, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (sku, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.sku === sku ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (sku) => setCart((prev) => prev.filter((i) => i.sku !== sku));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = Number(settings?.taxRate || 0);
  const iva = subtotal * (taxRate / 100);
  const total = subtotal + iva;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const abonoInputAmount = parseFloat(abonoAmount) || 0;
  const abonoUsd =
    paymentCurrency === "VES"
      ? exchangeRate && exchangeRate > 0
        ? abonoInputAmount / exchangeRate
        : 0
      : abonoInputAmount;
  const abonoVes = paymentCurrency === "VES" ? abonoInputAmount : abonoUsd * Number(exchangeRate || 0);
  const creditoRestante = Math.max(total - abonoUsd, 0);

  const formatUsd = useMemo(
    () => (value) => `$${Number(value || 0).toFixed(2)}`,
    []
  );

  const formatVes = useMemo(
    () => (value) =>
      exchangeRate
        ? `Bs. ${(Number(value || 0) * exchangeRate).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "Bs. --",
    [exchangeRate]
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if ((saleType === "credito" || saleType === "mixto") && !selectedCustomer) return;

    try {
      setProcessing(true);
      setError("");

      const abono = abonoUsd;
      const contadoUsd = paymentCurrency === "VES" ? total : total;
      const contadoVes = total * Number(exchangeRate || 0);
      await api.createSale({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        paymentMethod,
        paymentCurrency,
        exchangeRate: Number(exchangeRate || 0),
        paymentAmount: saleType === "contado" ? contadoUsd : paymentCurrency === "USD" ? abonoInputAmount : abonoUsd,
        paymentAmountVes: saleType === "contado" ? (paymentCurrency === "VES" ? contadoVes : contadoUsd * Number(exchangeRate || 0)) : paymentCurrency === "VES" ? abonoInputAmount : abonoUsd * Number(exchangeRate || 0),
        paymentNote,
        saleType,
        abono,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          qty: item.qty,
        })),
      });

      await loadInitialData();

      let label = "";
      if (saleType === "contado") {
        label = "Venta al contado procesada correctamente";
      } else if (saleType === "credito") {
        label = `Factura a crédito generada para ${selectedCustomer.name}`;
      } else if (saleType === "mixto") {
        const credito = total - abono;
        label = `Abono: ${formatUsd(abono)} | Crédito: ${formatUsd(credito)} - ${selectedCustomer.name}`;
      }

      setSuccessMsg(label);
      clearCart();
      setSelectedCustomer(null);
      setCustomerSearch("");
      setAbonoAmount("");
      setPaymentCurrency("USD");
      setPaymentMethod("efectivo");
      setPaymentNote("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "No fue posible procesar la venta");
    } finally {
      setProcessing(false);
    }
  };

  const cartInProduct = (sku) => cart.find((i) => i.sku === sku);

  const openGallery = (product, index = 0) => {
    const images = Array.isArray(product.images) ? product.images.filter((image) => image?.url) : [];
    if (images.length === 0) {
      return;
    }

    setGalleryProduct({ ...product, images });
    setGalleryIndex(index);
  };

  const closeGallery = () => {
    setGalleryProduct(null);
    setGalleryIndex(0);
  };

  const showPrevImage = () => {
    if (!galleryProduct?.images?.length) {
      return;
    }

    setGalleryIndex((current) =>
      current === 0 ? galleryProduct.images.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    if (!galleryProduct?.images?.length) {
      return;
    }

    setGalleryIndex((current) =>
      current === galleryProduct.images.length - 1 ? 0 : current + 1
    );
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateCustomer = async () => {
    if (!customerForm.nombre.trim() || !customerForm.cedula.trim()) {
      setError("Debes ingresar al menos nombre y cédula del cliente");
      return;
    }

    try {
      setCustomerSaving(true);
      setError("");

      const created = await api.createCustomer({
        nombre: customerForm.nombre.trim(),
        cedula: customerForm.cedula.trim(),
        email: customerForm.email.trim(),
        telefono: customerForm.telefono.trim(),
        direccion: customerForm.direccion.trim(),
      });

      const mappedCustomer = {
        id: created._id,
        name: created.nombre,
        cedula: created.cedula,
        email: created.email,
        phone: created.telefono,
      };

      setCustomersData((current) => [mappedCustomer, ...current]);
      setSelectedCustomer(mappedCustomer);
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setShowCustomerForm(false);
      resetCustomerForm();
    } catch (err) {
      setError(err.message || "No fue posible registrar el cliente");
    } finally {
      setCustomerSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5" style={{ height: "calc(100vh - 9rem)" }}>
      {/* ── LEFT: Product catalog ────────────── */}
      <div
        className={`flex-1 flex-col bg-white rounded-xl overflow-hidden lg:!flex ${
          showCart ? "hidden" : "flex"
        }`}
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}
        {/* Toolbar */}
        <div
          className="p-4 flex flex-wrap items-center gap-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          <div className="relative flex-1 min-w-40">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: "18px" }}
            >
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "#f8f6f7",
                border: "1px solid rgba(235,71,139,0.15)",
              }}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={
                  category === cat
                    ? { backgroundColor: PRIMARY, color: "#fff" }
                    : { backgroundColor: "#f8f6f7", color: "#64748b" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto px-3 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.08)", color: PRIMARY }}>
            Dólar oficial: {exchangeRate ? `Bs. ${Number(exchangeRate).toLocaleString("es-VE", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}` : "cargando..."}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filtered.map((p) => {
              const inCart = cartInProduct(p.sku);
              const outOfStock = p.stock === 0;
              const images = Array.isArray(p.images) ? p.images.filter((image) => image?.url) : [];
              const primaryImage = images[0]?.url || "";
              return (
                <div
                  key={p.sku}
                  className="rounded-xl p-4 flex flex-col gap-2 transition-all"
                  style={{
                    border: inCart
                      ? `2px solid ${PRIMARY}`
                      : "1px solid rgba(235,71,139,0.12)",
                    backgroundColor: inCart
                      ? "rgba(235,71,139,0.04)"
                      : "#fafafa",
                    opacity: outOfStock ? 0.5 : 1,
                  }}
                >
                  {/* Image area - portrait */}
                  <div
                    className="w-full rounded-lg flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: "rgba(235,71,139,0.08)", aspectRatio: "3/4" }}
                  >
                    {primaryImage ? (
                      <button type="button" onClick={() => openGallery(p, 0)} className="w-full h-full block">
                        <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "48px", color: PRIMARY, opacity: 0.5 }}
                      >
                        {p.category === "Calzado"
                          ? "footprint"
                          : p.category === "Ropa"
                          ? "apparel"
                          : p.category === "Joyería"
                          ? "diamond"
                          : "shopping_bag"}
                      </span>
                    )}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openGallery(p, 0)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[11px] font-semibold text-white"
                        style={{ backgroundColor: "rgba(15,23,42,0.72)" }}
                      >
                        +{images.length - 1} fotos
                      </button>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.slice(1).map((image, index) => (
                        <button
                          key={`${p.sku}-image-${index + 1}`}
                          type="button"
                          onClick={() => openGallery(p, index + 1)}
                          className="w-14 h-14 rounded-lg overflow-hidden shrink-0"
                          style={{ border: "1px solid rgba(235,71,139,0.18)" }}
                        >
                          <img src={image.url} alt={`${p.name} ${index + 2}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.sku}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: PRIMARY }}
                      >
                        {formatUsd(p.price)}
                      </span>
                      <p className="text-[11px] text-slate-400">{formatVes(p.price)}</p>
                    </div>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          p.stock === 0
                            ? "rgba(239,68,68,0.1)"
                            : p.stock < 8
                            ? "rgba(245,158,11,0.1)"
                            : "rgba(16,185,129,0.1)",
                        color:
                          p.stock === 0
                            ? "#dc2626"
                            : p.stock < 8
                            ? "#d97706"
                            : "#059669",
                      }}
                    >
                      {p.stock === 0 ? "Agotado" : `${p.stock} uds`}
                    </span>
                  </div>

                  {inCart ? (
                    <div className="flex items-center justify-between mt-1">
                      <button
                        onClick={() => changeQty(p.sku, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                        style={{
                          backgroundColor: "rgba(235,71,139,0.15)",
                          color: PRIMARY,
                        }}
                      >
                        −
                      </button>
                      <span className="font-bold text-slate-900 text-sm">
                        {inCart.qty}
                      </span>
                      <button
                        onClick={() => changeQty(p.sku, 1)}
                        disabled={inCart.qty >= p.stock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                        style={{
                          backgroundColor: "rgba(235,71,139,0.15)",
                          color: PRIMARY,
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p)}
                      disabled={outOfStock}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      style={{
                        backgroundColor: outOfStock
                          ? "#f1f5f9"
                          : "rgba(235,71,139,0.1)",
                        color: outOfStock ? "#94a3b8" : PRIMARY,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px" }}
                      >
                        add_shopping_cart
                      </span>
                      Agregar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <span
                className="material-symbols-outlined mb-2"
                style={{ fontSize: "40px" }}
              >
                search_off
              </span>
              <p className="text-sm">Sin resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile cart toggle button */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-30"
        style={{ backgroundColor: "#eb478b" }}
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: "24px" }}>
          {showCart ? "close" : "shopping_cart"}
        </span>
        {totalItems > 0 && !showCart && (
          <span
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            {totalItems}
          </span>
        )}
      </button>

      {/* ── RIGHT: Cart ────────────────────── */}
      <div
        className={`w-full lg:w-96 flex-col bg-white rounded-xl overflow-hidden shrink-0 fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-0 lg:!flex ${
          showCart ? "flex" : "hidden"
        }`}
        style={{ border: "1px solid rgba(235,71,139,0.1)" }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(235,71,139,0.1)" }}
        >
          <button
            onClick={() => setShowCart(false)}
            className="lg:hidden p-2 -ml-2 rounded-lg"
            style={{ color: "#eb478b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              arrow_back
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", color: PRIMARY }}
            >
              shopping_cart
            </span>
            <h2 className="font-bold text-slate-900">Carrito</h2>
            {totalItems > 0 && (
              <span
                className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                {totalItems}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                delete_sweep
              </span>
              Limpiar
            </button>
          )}
        </div>

        {/* Success message */}
        {successMsg && (
          <div
            className="mx-4 mt-3 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"
            style={{
              backgroundColor: "rgba(16,185,129,0.1)",
              color: "#059669",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              check_circle
            </span>
            {successMsg}
          </div>
        )}

        {/* Sale type toggle */}
        <div className="px-4 pt-3 shrink-0">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(235,71,139,0.2)" }}
          >
            {[
              { v: "contado", label: "Al Contado", icon: "payments" },
              { v: "credito", label: "A Crédito", icon: "credit_score" },
              { v: "mixto", label: "Mixto", icon: "account_balance" },
            ].map(({ v, label, icon }) => (
              <button
                key={v}
                onClick={() => setSaleType(v)}
                className="flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                style={
                  saleType === v
                    ? { backgroundColor: PRIMARY, color: "#fff" }
                    : { color: "#64748b" }
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "15px" }}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer selector */}
        <div className="px-4 pt-3 shrink-0 relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            {saleType === "credito" ? (
              <span style={{ color: PRIMARY }}>* Cliente (requerido para crédito)</span>
            ) : (
              "Cliente (opcional)"
            )}
          </label>
          {selectedCustomer ? (
            <div
              className="flex items-center justify-between p-2.5 rounded-xl"
              style={{
                backgroundColor: "rgba(235,71,139,0.06)",
                border: "1px solid rgba(235,71,139,0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: "rgba(235,71,139,0.15)",
                    color: PRIMARY,
                  }}
                >
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-xs text-slate-500">{selectedCustomer.cedula}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  close
                </span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    style={{ fontSize: "18px", lineHeight: 1 }}
                  >
                    search
                  </span>
                  <input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    placeholder="Buscar cliente por nombre o cédula..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "#f8f6f7",
                      border: "1px solid rgba(235,71,139,0.2)",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowCustomerForm((current) => !current);
                    setShowCustomerDropdown(false);
                    setError("");
                  }}
                  className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: showCustomerForm ? PRIMARY : "rgba(235,71,139,0.08)",
                    color: showCustomerForm ? "#fff" : PRIMARY,
                    border: "1px solid rgba(235,71,139,0.18)",
                  }}
                  title="Registrar nuevo cliente"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>person_add</span>
                </button>
              </div>

              {showCustomerForm && (
                <div
                  className="mt-2 p-3 rounded-xl space-y-3"
                  style={{ backgroundColor: "#fff", border: "1px solid rgba(235,71,139,0.15)" }}
                >
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      value={customerForm.nombre}
                      onChange={(e) => handleCustomerFormChange("nombre", e.target.value)}
                      placeholder="Nombre completo *"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.2)" }}
                    />
                    <input
                      value={customerForm.cedula}
                      onChange={(e) => handleCustomerFormChange("cedula", e.target.value)}
                      placeholder="Cédula *"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.2)" }}
                    />
                    <input
                      value={customerForm.telefono}
                      onChange={(e) => handleCustomerFormChange("telefono", e.target.value)}
                      placeholder="Teléfono"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.2)" }}
                    />
                    <input
                      value={customerForm.email}
                      onChange={(e) => handleCustomerFormChange("email", e.target.value)}
                      placeholder="Correo electrónico"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.2)" }}
                    />
                    <textarea
                      value={customerForm.direccion}
                      onChange={(e) => handleCustomerFormChange("direccion", e.target.value)}
                      placeholder="Dirección"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                      style={{ backgroundColor: "#f8f6f7", border: "1px solid rgba(235,71,139,0.2)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreateCustomer}
                      disabled={customerSaving}
                      className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: customerSaving ? "#cbd5e1" : PRIMARY }}
                    >
                      {customerSaving ? "Guardando..." : "Guardar y seleccionar"}
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowCustomerForm(false);
                        resetCustomerForm();
                      }}
                      className="px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {showCustomerDropdown && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl overflow-hidden shadow-lg z-20"
                  style={{ border: "1px solid rgba(235,71,139,0.15)" }}
                >
                  {filteredCustomers.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch("");
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(235,71,139,0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: "rgba(235,71,139,0.12)",
                          color: PRIMARY,
                        }}
                      >
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.cedula}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="p-3 text-xs text-slate-400 text-center">
                      Sin resultados
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <span
                className="material-symbols-outlined mb-2"
                style={{ fontSize: "48px" }}
              >
                remove_shopping_cart
              </span>
              <p className="text-sm text-slate-400">El carrito está vacío</p>
              <p className="text-xs text-slate-400 mt-1">
                Selecciona productos del catálogo
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: "#f8f6f7",
                    border: "1px solid rgba(235,71,139,0.08)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatUsd(item.price)} c/u</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatVes(item.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => changeQty(item.sku, -1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: "rgba(235,71,139,0.12)",
                        color: PRIMARY,
                      }}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-slate-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.sku, 1)}
                      disabled={item.qty >= item.stock}
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: "rgba(235,71,139,0.12)",
                        color: PRIMARY,
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                      {formatUsd(item.price * item.qty)}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatVes(item.price * item.qty)}</p>
                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + checkout */}
        <div
          className="p-4 shrink-0"
          style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}
        >
          {/* Summary */}
          <div className="space-y-1.5 mb-3">
            {[
              { label: "Subtotal", usd: formatUsd(subtotal), ves: formatVes(subtotal) },
              { label: `IVA (${taxRate}%)`, usd: formatUsd(iva), ves: formatVes(iva) },
            ].map(({ label, usd, ves }) => (
              <div key={label} className="flex justify-between text-sm text-slate-600">
                <span>{label}</span>
                <div className="text-right">
                  <div>{usd}</div>
                  <div className="text-[11px] text-slate-400">{ves}</div>
                </div>
              </div>
            ))}
            <div
              className="flex justify-between font-bold pt-2"
              style={{
                borderTop: "1px solid rgba(235,71,139,0.12)",
                color: "#0f172a",
              }}
            >
              <span>Total</span>
              <div className="text-right">
                <div style={{ color: PRIMARY }}>{formatUsd(total)}</div>
                <div className="text-[11px] text-slate-400">{formatVes(total)}</div>
              </div>
            </div>
          </div>

          {/* Abono input for mixto */}
          {saleType === "mixto" && (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Abono inicial
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {PAYMENT_METHODS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className="py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    style={
                      paymentMethod === value
                        ? { backgroundColor: "rgba(235,71,139,0.12)", color: PRIMARY, border: `1px solid ${PRIMARY}` }
                        : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                    }
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                {PAYMENT_CURRENCIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentCurrency(value)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                    style={
                      paymentCurrency === value
                        ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.35)" }
                        : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{paymentCurrency === "VES" ? "Bs." : "$"}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={paymentCurrency === "VES" ? total * Number(exchangeRate || 0) : total}
                  value={abonoAmount}
                  onChange={(e) => setAbonoAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    backgroundColor: "#f8f6f7",
                    border: "1px solid rgba(235,71,139,0.2)",
                    color: PRIMARY,
                  }}
                />
              </div>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Referencia, banco, nota del abono..."
                className="w-full mt-2 px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                rows={2}
                style={{
                  backgroundColor: "#f8f6f7",
                  border: "1px solid rgba(235,71,139,0.2)",
                }}
              />
              {abonoAmount && abonoInputAmount > 0 && (
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: "rgba(235,71,139,0.08)" }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Abono registrado:</span>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: "#10b981" }}>{formatUsd(abonoUsd)}</div>
                      <div className="text-[11px] text-slate-400">{paymentCurrency === "VES" ? `Pagado: Bs. ${Number(abonoInputAmount).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatVes(abonoUsd)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-600">Queda a crédito:</span>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: PRIMARY }}>{formatUsd(creditoRestante)}</div>
                      <div className="text-[11px] text-slate-400">{formatVes(creditoRestante)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment method (contado only) */}
          {saleType === "contado" && (
            <>
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {PAYMENT_METHODS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-colors min-w-[5.5rem]"
                    style={
                      paymentMethod === value
                        ? { backgroundColor: "rgba(235,71,139,0.12)", color: PRIMARY, border: `1px solid ${PRIMARY}` }
                        : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                    }
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                {PAYMENT_CURRENCIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentCurrency(value)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                    style={
                      paymentCurrency === value
                        ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.35)" }
                        : { backgroundColor: "#f8f6f7", color: "#64748b", border: "1px solid transparent" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Referencia, banco o nota del cobro..."
                className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                rows={2}
                style={{
                  backgroundColor: "#f8f6f7",
                  border: "1px solid rgba(235,71,139,0.2)",
                }}
              />
            </>
          )}

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={
              processing ||
              cart.length === 0 ||
              ((saleType === "credito" || saleType === "mixto") && !selectedCustomer) ||
              (saleType === "mixto" && (!abonoAmount || abonoUsd <= 0 || abonoUsd >= total || (paymentCurrency === "VES" && !exchangeRate)))
            }
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor:
                processing ||
                cart.length === 0 ||
                ((saleType === "credito" || saleType === "mixto") && !selectedCustomer) ||
                (saleType === "mixto" && (!abonoAmount || abonoUsd <= 0 || abonoUsd >= total || (paymentCurrency === "VES" && !exchangeRate)))
                  ? "#e2e8f0"
                  : PRIMARY,
              color:
                processing ||
                cart.length === 0 ||
                ((saleType === "credito" || saleType === "mixto") && !selectedCustomer) ||
                (saleType === "mixto" && (!abonoAmount || abonoUsd <= 0 || abonoUsd >= total || (paymentCurrency === "VES" && !exchangeRate)))
                  ? "#94a3b8"
                  : "#fff",
              boxShadow:
                cart.length > 0
                  ? "0 4px 12px rgba(235,71,139,0.3)"
                  : "none",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              {saleType === "credito" ? "credit_score" : saleType === "mixto" ? "payments" : "point_of_sale"}
            </span>
            {processing
              ? "Procesando..."
              : saleType === "credito"
              ? "Generar Factura a Crédito"
              : saleType === "mixto"
              ? "Procesar Pago Mixto"
              : "Cobrar"}
            {total > 0 && saleType !== "mixto" && !processing && (
              <span className="ml-1 opacity-80 text-sm">{formatUsd(total)}</span>
            )}
          </button>
          {total > 0 && (
            <p className="text-xs text-center mt-2 text-slate-400">
              {formatUsd(total)} · {formatVes(total)}
            </p>
          )}

          {(saleType === "credito" || saleType === "mixto") && !selectedCustomer && (
            <p className="text-xs text-center mt-2" style={{ color: PRIMARY }}>
              Selecciona un cliente para {saleType === "credito" ? "factura a crédito" : "pago mixto"}
            </p>
          )}
          {saleType === "mixto" && selectedCustomer && (!abonoAmount || parseFloat(abonoAmount) <= 0) && (
            <p className="text-xs text-center mt-2" style={{ color: PRIMARY }}>
              Ingresa el monto del abono
            </p>
          )}
          {saleType === "mixto" && paymentCurrency === "VES" && !exchangeRate && (
            <p className="text-xs text-center mt-2" style={{ color: PRIMARY }}>
              No se pudo calcular el abono en bolívares porque la tasa oficial no está disponible
            </p>
          )}
          {saleType === "mixto" && abonoAmount && abonoUsd >= total && (
            <p className="text-xs text-center mt-2" style={{ color: PRIMARY }}>
              El abono debe ser menor al total (usa "Contado" para pago completo)
            </p>
          )}
        </div>
      </div>

      </div>

      {galleryProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={closeGallery}>
          <div
            className="w-full max-w-5xl rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <h3 className="text-white font-semibold">{galleryProduct.name}</h3>
                <p className="text-xs text-slate-300">{galleryIndex + 1} de {galleryProduct.images.length}</p>
              </div>
              <button type="button" onClick={closeGallery} className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <div className="relative p-4 md:p-6 flex items-center justify-center" style={{ minHeight: "60vh" }}>
              {galleryProduct.images.length > 1 && (
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: "rgba(15,23,42,0.65)" }}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              )}

              <img
                src={galleryProduct.images[galleryIndex]?.url}
                alt={`${galleryProduct.name} ${galleryIndex + 1}`}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />

              {galleryProduct.images.length > 1 && (
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: "rgba(15,23,42,0.65)" }}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              )}
            </div>

            {galleryProduct.images.length > 1 && (
              <div className="px-4 pb-4 md:px-6 md:pb-6 flex gap-2 overflow-x-auto">
                {galleryProduct.images.map((image, index) => (
                  <button
                    key={`${galleryProduct._id || galleryProduct.sku}-gallery-${index}`}
                    type="button"
                    onClick={() => setGalleryIndex(index)}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0"
                    style={{ border: index === galleryIndex ? `2px solid ${PRIMARY}` : "1px solid rgba(255,255,255,0.16)" }}
                  >
                    <img src={image.url} alt={`${galleryProduct.name} miniatura ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
