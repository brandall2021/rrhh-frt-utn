"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { FileText, Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LeaveRequest } from "@/types";
import { useRouter } from "next/navigation";
import { getNovedadBadgeStyles, getNovedadShortCode } from "@/components/DashboardView";

export default function SolicitudesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("TODOS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "TODOS") params.set("state", filter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("skip", String(page * perPage));
      params.set("take", String(perPage));
      const res = await fetch(`/api/requests?${params}`);
      const json = await res.json();
      setRequests(json.items ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, dateFrom, dateTo, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / perPage) || 1;

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
            onClick={() => { setFilter(s); setPage(0); }}
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

      <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Desde:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hasta:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); setPage(0); }}
            className="p-1.5 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                  Cargando...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                  No hay solicitudes{filter !== "TODOS" ? ` con estado ${filter.toLowerCase()}` : ""}.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
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

      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-3xl border border-slate-800 text-xs">
        <p className="text-slate-400">
          Mostrando {total === 0 ? 0 : page * perPage + 1} a{" "}
          {Math.min((page + 1) * perPage, total)} de {total} solicitudes
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => (
            <button
               key={i}
               onClick={() => setPage(i)}
               className={`w-6 h-6 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                 page === i
                   ? "bg-brand text-white border-transparent"
                   : "border-slate-800 text-slate-400 hover:bg-slate-800"
               }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
