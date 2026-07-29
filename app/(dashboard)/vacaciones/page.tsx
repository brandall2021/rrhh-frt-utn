"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Umbrella, Sun, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Vacation } from "@/types";
import { useRouter } from "next/navigation";

export default function VacacionesPage() {
  const router = useRouter();
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchVacations = useCallback(async () => {
    try {
      const res = await fetch(`/api/vacations?year=${year}`);
      const { data } = await res.json();
      setVacations(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchVacations(); }, [fetchVacations]);

  const totalAllocated = vacations.reduce((s, v) => s + v.totalDays, 0);
  const totalUsed = vacations.reduce((s, v) => s + v.usedDays, 0);
  const totalAvailable = vacations.reduce((s, v) => s + v.availableDays, 0);

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
            <Umbrella className="w-5 h-5 text-brand-light" />
            Vacaciones
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión de saldos y solicitudes de vacaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-xl">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="p-2 hover:bg-slate-800 rounded-l-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-bold text-white">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="p-2 hover:bg-slate-800 rounded-r-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
          <p className="text-xs font-semibold text-slate-400">Días Asignados</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalAllocated}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
          <p className="text-xs font-semibold text-slate-400">Días Utilizados</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{totalUsed}</p>
        </div>
        <div className="bg-brand rounded-3xl p-4 text-white shadow-[0_0_20px_rgba(214,0,0,0.35)] border border-brand-light/20">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-85">Días Disponibles</p>
          <p className="text-3xl font-extrabold mt-1">{totalAvailable}</p>
        </div>
      </div>

      {vacations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Sun className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin registros</p>
          <p className="text-xs mt-1">No hay datos de vacaciones para {year}</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empleado</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departamento</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Asignados</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Usados</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Pendientes</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Disponibles</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vacations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/personal/${v.employeeId}`)}
                      className="text-xs font-bold text-slate-200 hover:text-brand-light hover:underline text-left cursor-pointer"
                    >
                      {v.employeeName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{v.department}</td>
                  <td className="px-4 py-3 text-xs text-slate-200 text-center font-semibold">{v.totalDays}</td>
                  <td className="px-4 py-3 text-xs text-amber-400 text-center font-semibold">{v.usedDays}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-center">{v.pendingPrev > 0 ? `+${v.pendingPrev}` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-center">
                    <span className={`font-extrabold ${v.availableDays > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {v.availableDays}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {/* TODO: edit vacation balance */}}
                      className="text-[10px] font-bold text-brand-light hover:underline px-2 py-1 rounded cursor-pointer"
                    >
                      Editar
                    </button>
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
