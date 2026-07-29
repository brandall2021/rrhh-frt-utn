"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Users } from "lucide-react";
import type { Conflict, NovedadType } from "@/types";

export default function ConflictosPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConflicts = useCallback(async () => {
    try {
      const res = await fetch("/api/conflicts");
      const { data } = await res.json();
      setConflicts(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConflicts(); }, [fetchConflicts]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          Conflictos de Cobertura
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Solicitudes superpuestas que requieren atención
        </p>
      </div>

      {conflicts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Users className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin conflictos</p>
          <p className="text-xs mt-1">No hay solicitudes superpuestas actualmente</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conflicts.map((conf) => (
            <div
              key={conf.id}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-rose-400/30 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Equipo: {conf.team}
                  </span>
                  <p className="text-sm text-slate-200 mt-1">{conf.description}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                  conf.severity === "CRITICAL"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {conf.statusText}
                </span>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                {conf.relatedRequests.map((child, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${
                      child.type === ("ESTUDIO" as NovedadType) ? "bg-emerald-500"
                      : child.type === ("PARTICULAR" as NovedadType) ? "bg-brand"
                      : "bg-purple-500"
                    }`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-200">{child.employeeName}</p>
                      <p className="text-[10px] text-slate-400">{child.range} · {child.state}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{child.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
