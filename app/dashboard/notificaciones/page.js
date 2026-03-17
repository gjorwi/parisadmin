"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

const PRIMARY = "#eb478b";

export default function NotificacionesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.notifications();
        setItems(data);
      } catch (err) {
        setError(err.message || "No fue posible cargar las notificaciones");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const markRead = async (id) => {
    try {
      const updated = await api.markNotificationRead(id);
      setItems((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      setError(err.message || "No fue posible actualizar la notificación");
    }
  };

  const deactivate = async (id) => {
    try {
      await api.deactivateNotification(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "No fue posible desactivar la notificación");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Avisos del sistema, stock, pedidos y eventos del administrador.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(235,71,139,0.1)" }}>
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Cargando notificaciones...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>notifications_off</span>
            <p className="mt-2 text-sm">No hay notificaciones registradas</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(235,71,139,0.06)" }}>
            {items.map((item) => {
              const colorMap = {
                info: "#3b82f6",
                warning: "#f59e0b",
                success: "#10b981",
                error: "#ef4444",
              };
              const color = colorMap[item.type] || PRIMARY;

              return (
                <div key={item._id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <span className="material-symbols-outlined" style={{ color, fontSize: "20px" }}>
                        {item.read ? "drafts" : "notifications_active"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-slate-900">{item.title}</h2>
                        {!item.read && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.12)", color: PRIMARY }}>
                            Nueva
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(item.createdAt).toLocaleString("es-VE")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.link && (
                      <a href={item.link} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "rgba(235,71,139,0.08)", color: PRIMARY }}>
                        Ir al módulo
                      </a>
                    )}
                    {!item.read && (
                      <button onClick={() => markRead(item._id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: PRIMARY }}>
                        Marcar leída
                      </button>
                    )}
                    <button onClick={() => deactivate(item._id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#64748b" }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
