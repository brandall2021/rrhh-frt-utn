"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { FileText, Search, Filter } from "lucide-react";
import type { LeaveRequest } from "@/types";
import { useRouter } from "next/navigation";
import { getNovedadBadgeStyles, getNovedadShortCode } from "@/components/DashboardView";

export default function SolicitudesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("TODOS");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      const { data } = await res.json();
      setRequests(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === "TODOS"
    ? requests
    : requests.filter((r) => r.state === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-light" />
            Solicitudes de Ausencia
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial completo de solicitudes de licencias y permisos
          </p>
        </div>
        <button
          onClick={() => router.push("/solicitudes/nueva")}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(214,0,0,0.3)] border border-brand-light/20 transition-all cursor-pointer"
        >
          Nueva Solicitud
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["TODOS", "PENDIENTE", "APROBADO", "RECHAZADO", "PROCESADO"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              filter === s
                ? "bg-brand text-white border-brand"
                : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            {s === "TODOS" ? "Todas" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-950/40 border-b border-slate-800 text-left">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empleado</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Periodo</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Días</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                  No hay solicitudes{filter !== "TODOS" ? ` con estado ${filter.toLowerCase()}` : ""}.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => router.push(`/personal/${req.employeeId}`)}
                      className="text-xs font-bold text-slate-200 hover:text-brand-light hover:underline text-left cursor-pointer"
                    >
                      {req.employeeName}
                    </button>
                    <p className="text-[10px] text-slate-500">{req.department}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getNovedadBadgeStyles(req.type)}`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300 font-mono">
                    {req.startDate} → {req.endDate}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">
                    {req.days} {req.days > 1 ? "días" : "día"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                      req.state === "APROBADO" || req.state === "PROCESADO"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : req.state === "RECHAZADO"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {req.state}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-500 text-right">
        {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""}
      </p>
    </motion.div>
  );
}
