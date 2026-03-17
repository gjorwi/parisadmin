"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../lib/api";
import { setSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setSession(data.token, data.user);
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      setError(error.message || "No fue posible iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – decorative brand side */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#eb478b" }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: "#fff" }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-15"
          style={{ backgroundColor: "#fff" }}
        />
        <div
          className="absolute top-1/2 right-10 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: "#fff" }}
        />

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8 p-3">
            <div className="w-full h-full rounded-full overflow-hidden bg-white/95 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Paris Boutique"
                width={104}
                height={104}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestión de Inventario
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            Administra tu tienda con elegancia. Control total sobre productos,
            pedidos y proveedores en un solo lugar.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: "dashboard", text: "Panel de control centralizado" },
              { icon: "analytics", text: "Reportes y estadísticas en tiempo real" },
              { icon: "group", text: "Gestión de proveedores integrada" },
            ].map(({ icon, text }) => (
              <div
                key={icon}
                className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3"
              >
                <span className="material-symbols-outlined text-white text-xl">
                  {icon}
                </span>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-white/60 text-sm text-center">
          © 2026 Paris Boutique · Todos los derechos reservados
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 pt-6 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-white shadow-sm">
            <Image
              src="/logo.png"
              alt="Paris Boutique"
              width={104}
              height={104}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-slate-500">
              Ingresa tus credenciales para acceder al sistema de gestión.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: "20px" }}
                >
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@parisboutique.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ "--tw-ring-color": "#eb478b" }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(235,71,139,0.3)";
                    e.target.style.borderColor = "#eb478b";
                    e.target.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.backgroundColor = "#f8fafc";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#eb478b" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: "20px" }}
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(235,71,139,0.3)";
                    e.target.style.borderColor = "#eb478b";
                    e.target.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.backgroundColor = "#f8fafc";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300"
                style={{ accentColor: "#eb478b" }}
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Recordar mi sesión por 30 días
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <span
                  className="material-symbols-outlined text-red-500"
                  style={{ fontSize: "18px" }}
                >
                  error
                </span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? "#f0a0c0" : "#eb478b",
                boxShadow: "0 4px 14px rgba(235,71,139,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = "#d63d7a";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = "#eb478b";
              }}
            >
              {loading ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin"
                    style={{ fontSize: "20px" }}
                  >
                    progress_activity
                  </span>
                  Verificando...
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    login
                  </span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8 mb-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Acceso seguro
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span
              className="material-symbols-outlined mt-0.5"
              style={{ fontSize: "18px", color: "#eb478b" }}
            >
              shield
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Este sistema está protegido. Todos los accesos son monitoreados y
              registrados. Solo personal autorizado de Paris Boutique puede
              ingresar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
