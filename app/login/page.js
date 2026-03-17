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
    <div className="min-h-screen flex relative overflow-hidden lg:overflow-visible" style={{ backgroundColor: "#eb478b" }}>
      <div className="absolute inset-0 opacity-10 lg:hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 lg:hidden pointer-events-none"
        style={{ backgroundColor: "#fff" }}
      />
      <div
        className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full opacity-15 lg:hidden pointer-events-none"
        style={{ backgroundColor: "#fff" }}
      />
      <div
        className="absolute top-1/2 right-4 w-40 h-40 rounded-full opacity-10 lg:hidden pointer-events-none"
        style={{ backgroundColor: "#fff" }}
      />
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
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8 sm:py-12 pt-6 relative z-10 lg:bg-white login-surface">
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

        <div className="w-full max-w-md lg:rounded-none lg:p-0">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 lg:text-slate-900 text-white">
              Bienvenido de vuelta
            </h2>
            <p className="lg:text-slate-500 text-white/80">
              Ingresa tus credenciales para acceder al sistema de gestión.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2 lg:text-slate-700 text-white"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-0 rounded-xl lg:hidden bg-white/12 border border-white/20 backdrop-blur-sm pointer-events-none" />
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 lg:text-slate-400 text-white/70 z-10 pointer-events-none"
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
                  className="relative z-20 w-full pl-11 pr-4 py-3 rounded-xl border lg:border-slate-200 border-white/20 lg:bg-white bg-transparent lg:text-slate-900 text-white lg:placeholder-slate-400 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:border-transparent transition-all login-input"
                  style={{ "--tw-ring-color": "#eb478b" }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(235,71,139,0.3)";
                    e.target.style.borderColor = "#eb478b";
                    e.target.style.backgroundColor = window.innerWidth >= 1024 ? "#fff" : "transparent";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "";
                    e.target.style.borderColor = window.innerWidth >= 1024 ? "#e2e8f0" : "rgba(255,255,255,0.2)";
                    e.target.style.backgroundColor = window.innerWidth >= 1024 ? "#f8fafc" : "transparent";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold lg:text-slate-700 text-white"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-sm font-medium transition-colors lg:text-[#eb478b] text-white"
                  onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-xl lg:hidden bg-white/12 border border-white/20 backdrop-blur-sm pointer-events-none" />
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 lg:text-slate-400 text-white/70 z-10 pointer-events-none"
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
                  className="relative z-20 w-full pl-11 pr-12 py-3 rounded-xl border lg:border-slate-200 border-white/20 lg:bg-white bg-transparent lg:text-slate-900 text-white lg:placeholder-slate-400 placeholder:text-white/60 focus:outline-none transition-all login-input"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(235,71,139,0.3)";
                    e.target.style.borderColor = "#eb478b";
                    e.target.style.backgroundColor = window.innerWidth >= 1024 ? "#fff" : "transparent";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "";
                    e.target.style.borderColor = window.innerWidth >= 1024 ? "#e2e8f0" : "rgba(255,255,255,0.2)";
                    e.target.style.backgroundColor = window.innerWidth >= 1024 ? "#f8fafc" : "transparent";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 lg:text-slate-400 text-white/80 lg:hover:text-slate-600 hover:text-white transition-colors z-10"
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
                className="w-4 h-4 rounded border-white/40"
                style={{ accentColor: "#eb478b" }}
              />
              <label htmlFor="remember" className="text-sm lg:text-slate-600 text-white/85">
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
              className="login-submit w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2"
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor =
                    window.innerWidth >= 1024 ? "#d63d7a" : "rgba(255,255,255,0.22)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "";
                }
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
            <div className="flex-1 h-px lg:bg-slate-200 bg-white/25" />
            <span className="text-xs lg:text-slate-400 text-white/70 font-medium uppercase tracking-wider">
              Acceso seguro
            </span>
            <div className="flex-1 h-px lg:bg-slate-200 bg-white/25" />
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 p-4 rounded-xl lg:bg-slate-50 bg-white/10 lg:border-slate-100 border-white/15 backdrop-blur-sm border">
            <span
              className="material-symbols-outlined mt-0.5"
              style={{ fontSize: "18px", color: "#ffffff" }}
            >
              shield
            </span>
            <p className="text-xs lg:text-slate-500 text-white/80 leading-relaxed">
              Este sistema está protegido. Todos los accesos son monitoreados y
              registrados. Solo personal autorizado de Paris Boutique puede
              ingresar.
            </p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .login-submit {
          background-color: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (min-width: 1024px) {
          .login-submit {
            background-color: #eb478b !important;
            border: 1px solid transparent !important;
            box-shadow: 0 8px 22px rgba(235, 71, 139, 0.34) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .login-submit:hover {
            background-color: #d63d7a !important;
          }
          .login-submit:disabled {
            background-color: #f0a0c0 !important;
          }
        }

        @media (max-width: 1023px) {
          .login-surface .login-input:-webkit-autofill,
          .login-surface .login-input:-webkit-autofill:hover,
          .login-surface .login-input:-webkit-autofill:focus,
          .login-surface .login-input:-webkit-autofill:active {
            -webkit-text-fill-color: #ffffff !important;
            -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
            box-shadow: 0 0 0 1000px transparent inset !important;
            background-color: transparent !important;
            background-image: none !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            transition: background-color 9999s ease-in-out 0s, color 9999s ease-in-out 0s;
            caret-color: #ffffff !important;
            color: #ffffff !important;
            -webkit-background-clip: text !important;
            font-size: inherit !important;
          }
        }

        @media (min-width: 1024px) {
          .login-surface .login-input:-webkit-autofill,
          .login-surface .login-input:-webkit-autofill:hover,
          .login-surface .login-input:-webkit-autofill:focus,
          .login-surface .login-input:-webkit-autofill:active {
            -webkit-text-fill-color: #0f172a;
            -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
            box-shadow: 0 0 0px 1000px #ffffff inset !important;
            caret-color: #0f172a;
          }
        }
      `}</style>
    </div>
  );
}
