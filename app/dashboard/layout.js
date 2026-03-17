"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { clearSession, getStoredUser, getToken } from "../../lib/auth";
import api from "../../lib/api";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Panel de Control", shortLabel: "Panel" },
  { href: "/dashboard/inventario", icon: "inventory_2", label: "Inventario", shortLabel: "Inventario" },
  { href: "/dashboard/ventas", icon: "point_of_sale", label: "Ventas / Caja", shortLabel: "Ventas" },
  { href: "/dashboard/clientes", icon: "manage_accounts", label: "Clientes / Deudas", shortLabel: "Clientes" },
  { href: "/dashboard/pedidos", icon: "shopping_cart", label: "Pedidos", shortLabel: "Pedidos" },
  { href: "/dashboard/proveedores", icon: "group", label: "Proveedores", shortLabel: "Proveedores" },
  { href: "/dashboard/reportes", icon: "analytics", label: "Reportes", shortLabel: "Reportes" },
  // { href: "/dashboard/notificaciones", icon: "notifications", label: "Notificaciones", shortLabel: "Avisos" },
  // { href: "/dashboard/configuracion", icon: "settings", label: "Configuración", shortLabel: "Config" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    let active = true;

    async function loadNotifications() {
      try {
        const data = await api.notifications();
        if (!active) {
          return;
        }
        setUnreadNotifications((data || []).filter((item) => !item.read).length);
      } catch (error) {
        if (active) {
          setUnreadNotifications(0);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const currentPage = navItems.find((item) => 
    item.href === "/dashboard" 
      ? pathname === "/dashboard" 
      : pathname.startsWith(item.href)
  ) || navItems[0];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8f6f7" }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 flex flex-col shrink-0 fixed lg:relative inset-y-0 left-0 z-50 transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          borderRight: "1px solid rgba(235,71,139,0.1)",
          backgroundColor: "#fff",
        }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Paris Boutique"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "#eb478b" }}
            >
              PARIS
            </h1>
            <span className="text-xs text-slate-500">Shop Boutique</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map(({ href, icon, label }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{
                  backgroundColor: isActive
                    ? "rgba(235,71,139,0.1)"
                    : "transparent",
                  color: isActive ? "#eb478b" : "#64748b",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "rgba(235,71,139,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "22px" }}
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(235,71,139,0.1)" }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: "#f8f6f7" }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <Image
                src="/logo.png"
                alt="Usuario"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || "Administrador"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || "admin@paris.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-4"
          style={{
            borderBottom: "1px solid rgba(235,71,139,0.1)",
            backgroundColor: "#fff",
          }}
        >
          {/* Mobile menu button + page title */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              style={{ color: "#eb478b" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                menu
              </span>
            </button>
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ color: "#eb478b", fontSize: "20px" }}
              >
                {currentPage.icon}
              </span>
              <h2 className="font-bold text-slate-900 text-sm">
                {currentPage.shortLabel}
              </h2>
            </div>
          </div>
          <div className="flex-1 hidden lg:block" />
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative"
              style={{ backgroundColor: "rgba(235,71,139,0.08)" }}
              onClick={() => router.push("/dashboard/notificaciones")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(235,71,139,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(235,71,139,0.08)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#eb478b", fontSize: "20px" }}
              >
                notifications
              </span>
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(235,71,139,0.08)" }}
              onClick={() => router.push("/dashboard/configuracion")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(235,71,139,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(235,71,139,0.08)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#eb478b", fontSize: "20px" }}
              >
                settings
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          style={{ backgroundColor: "#f8f6f7" }}
        >
          {children}
        </div>
      </main>

    </div>
  );
}
