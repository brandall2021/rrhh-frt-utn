"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Shield, Trash2, Plus, Monitor } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  employeeId: string | null;
  employeeName: string | null;
  description: string;
  performedBy: string;
  adminName: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/audit-log");
      const { data, total: t } = await res.json();
      setEntries(data ?? []);
      setTotal(t ?? 0);
    } catch (err) {
      console.error("Error fetching audit log:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-light" />
          Auditoría
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {total} registro{total !== 1 ? "s" : ""} — quién creó o eliminó ausencias
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Shield className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin registros</p>
          <p className="text-xs mt-1">Aún no hay actividad registrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">Fecha</th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">Acción</th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">Empleado</th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">Descripción</th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">Admin</th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString("es-AR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.action === "CREATE"
                        ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/30"
                        : "bg-rose-950/30 text-rose-400 border border-rose-900/30"
                    }`}>
                      {e.action === "CREATE" ? <Plus className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                      {e.action === "CREATE" ? "CREÓ" : "ELIMINÓ"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {e.employeeName ?? e.employeeId ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {e.description}
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {e.adminName || e.performedBy}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Monitor className="w-3 h-3" />
                      {e.ipAddress ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
