"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileBarChart2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { MonthlyAbsenceStat } from "@/types";

const monthlyAbsenceStats: MonthlyAbsenceStat[] = [
  { month: "Ene", particular: 40, enfermedad: 20, compensatorio: 10, estudio: 12 },
  { month: "Feb", particular: 30, enfermedad: 45, compensatorio: 8, estudio: 5 },
  { month: "Mar", particular: 60, enfermedad: 15, compensatorio: 30, estudio: 25 },
  { month: "Abr", particular: 20, enfermedad: 10, compensatorio: 12, estudio: 15 },
  { month: "May", particular: 50, enfermedad: 30, compensatorio: 18, estudio: 10 },
  { month: "Jun", particular: 40, enfermedad: 40, compensatorio: 15, estudio: 22 },
  { month: "Jul", particular: 10, enfermedad: 5, compensatorio: 20, estudio: 4 },
  { month: "Ago", particular: 45, enfermedad: 25, compensatorio: 24, estudio: 12 },
];

export default function ReportsStatsView() {
  const [activeReportYear, setActiveReportYear] = useState(String(new Date().getFullYear()));
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const kpis = [
    { label: "Particular", days: 142, pct: "+8% vs año anterior", color: "bg-[#eff6ff]", border: "border-[#3b82f6]/20", text: "text-[#3b82f6]" },
    { label: "Médica / Enfermedad", days: 87, pct: "-2% vs año anterior", color: "bg-[#fef2f2]", border: "border-[#ef4444]/20", text: "text-[#ef4444]" },
    { label: "Compensatorio", days: 54, pct: "+15% vs año anterior", color: "bg-[#f5f3ff]", border: "border-[#8b5cf6]/20", text: "text-[#8b5cf6]" },
    { label: "Estudio / Académico", days: 48, pct: "S/C vs año anterior", color: "bg-[#ecfdf5]", border: "border-[#10b981]/20", text: "text-[#10b981]" },
  ];

  const rankings = [
    { name: "Julián Sánchez", id: "EMP-4492", days: 18, dept: "Recursos Humanos", progress: 90 },
    { name: "María López", id: "EMP-3108", days: 15, dept: "Operaciones", progress: 75 },
    { name: "Ricardo Benítez", id: "EMP-5521", days: 12, dept: "IT Support", progress: 60 },
    { name: "Andres Ferrari", id: "EMP-3009", days: 9, dept: "Finanzas", progress: 45 },
    { name: "Sofía Blanco", id: "EMP-7721", days: 5, dept: "Operaciones", progress: 25 },
  ];

  const maxTotalDays = Math.max(
    ...monthlyAbsenceStats.map((s) => s.particular + s.enfermedad + s.compensatorio + s.estudio)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Estadísticas Generales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas unificadas de novedades, licencias y ausentismo para fines estratégicos.
          </p>
        </div>

        <div className="flex gap-2">
          {[String(new Date().getFullYear() - 1), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)].map((y) => (
            <button
              key={y}
              onClick={() => setActiveReportYear(y)}
              className={`px-3 py-1.5 border text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeReportYear === y
                  ? "bg-brand text-white border-transparent shadow-[0_0_10px_rgba(214, 0, 0,0.3)]"
                  : "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Gestión {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const bentoText = i === 0
            ? "text-brand-light"
            : i === 1
            ? "text-rose-400"
            : i === 2
            ? "text-purple-400"
            : "text-emerald-400";

          return (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl hover:border-slate-700/60 transition-all text-left flex flex-col justify-between min-h-[110px]"
            >
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                  Licencia: {k.label}
                </p>
                <p className={`text-2xl font-black mt-2 ${bentoText}`}>{k.days} días</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{k.pct}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="col-span-12 lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-colors">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="text-xs font-extrabold text-white tracking-wide">
                Novedades Registradas por Mes
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Valores consolidados por categoría en días hábiles totales.
              </p>
            </div>

            <div className="hidden sm:flex gap-3 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand"></span>Particular
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>Médica
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>Compensatorios
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>Estudio
              </span>
            </div>
          </div>

          <div className="relative h-64 w-full flex items-end gap-2 md:gap-5 px-2 select-none border-b border-slate-800 pb-2">
            {monthlyAbsenceStats.map((stat, idx) => {
              const totalDays = stat.particular + stat.enfermedad + stat.compensatorio + stat.estudio;
              const heightPercent = (totalDays / maxTotalDays) * 90;

              const partPct = (stat.particular / totalDays) * 100;
              const enfPct = (stat.enfermedad / totalDays) * 100;
              const compPct = (stat.compensatorio / totalDays) * 100;
              const estPct = (stat.estudio / totalDays) * 100;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer group"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <AnimatePresence>
                    {hoveredBarIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: -5, scale: 1 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-2 bg-slate-950 text-white p-3 rounded-2xl text-[10px] w-42 z-35 shadow-2xl border border-slate-800"
                      >
                        <p className="font-bold border-b border-slate-800 pb-1 mb-1 text-slate-300 uppercase">
                          Novedades {stat.month}
                        </p>
                        <div className="space-y-1 text-left">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Particular:</span> <strong>{stat.particular}d</strong>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Médica:</span> <strong>{stat.enfermedad}d</strong>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Compensatorio:</span> <strong>{stat.compensatorio}d</strong>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Estudio:</span> <strong>{stat.estudio}d</strong>
                          </p>
                        </div>
                        <div className="border-t border-slate-800 pt-1 mt-1 text-right text-brand-light font-bold text-[11px]">
                          Total: {totalDays} días
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className="w-full flex flex-col rounded-t-lg overflow-hidden transition-all group-hover:opacity-90 bg-slate-950/70"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div style={{ height: `${partPct}%` }} className="bg-brand w-full" title="Particular"></div>
                    <div style={{ height: `${enfPct}%` }} className="bg-rose-500 w-full" title="Médica"></div>
                    <div style={{ height: `${compPct}%` }} className="bg-purple-500 w-full" title="Compensatorio"></div>
                    <div style={{ height: `${estPct}%` }} className="bg-emerald-500 w-full" title="Estudio"></div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                    {stat.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 bg-brand/10 border border-brand/20 rounded-2xl flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-brand-light mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Dato destacado:</strong> El mes de **Marzo** registró el pico más alto de licencias, superando en un 15% el promedio anual del sistema.
            </p>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-colors space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide">
              Ranking de Asistencia & Licencias
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Empleados con mayor cantidad de días justificados ausentes.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {rankings.map((r, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex gap-2">
                    <span className="font-mono font-bold text-slate-500 w-4">#{i + 1}</span>
                    <span className="font-bold text-slate-200">{r.name}</span>
                  </div>
                  <strong className="text-white">{r.days} días</strong>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      i === 0
                        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                        : i === 1
                        ? "bg-amber-500"
                        : i === 2
                        ? "bg-brand"
                        : "bg-purple-500"
                    }`}
                    style={{ width: `${r.progress}%` }}
                  ></div>
                </div>

                <p className="text-[9px] text-slate-400 pl-6 uppercase tracking-wider font-semibold">
                  {r.dept} • {r.id}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => alert("Mostrando listado unificado de métricas de presentismo anual...")}
              className="text-brand-light text-[11px] font-bold tracking-tight hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer hover:text-brand-lighter"
            >
              Ver reporte unificado completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
