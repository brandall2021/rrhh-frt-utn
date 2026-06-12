"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardCheck,
  AlertTriangle,
  History,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
  TrendingDown,
  Clock,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { LeaveRequest, Conflict, NovedadType, RequestState } from "@/types";

// Absolute helper to get novelty styling configuration
export function getNovedadBadgeStyles(type: NovedadType) {
  switch (type) {
    case NovedadType.ESTUDIO:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case NovedadType.PARTICULAR:
      return "bg-brand/10 text-brand-light border-brand/30";
    case NovedadType.ENFERMEDAD:
    case NovedadType.MEDICA:
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case NovedadType.MATERNIDAD:
      return "bg-pink-500/10 text-pink-400 border-pink-500/30";
    case NovedadType.COMPENSATORIO:
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    case NovedadType.AUSENCIA:
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}

export function getNovedadShortCode(type: NovedadType) {
  switch (type) {
    case NovedadType.ESTUDIO:
      return "ES";
    case NovedadType.PARTICULAR:
      return "PA";
    case NovedadType.ENFERMEDAD:
    case NovedadType.MEDICA:
      return "MD";
    case NovedadType.MATERNIDAD:
      return "MA";
    case NovedadType.COMPENSATORIO:
      return "CO";
    case NovedadType.AUSENCIA:
      return "AU";
    default:
      return "OT";
  }
}

interface DashboardViewProps {
  requests: LeaveRequest[];
  conflicts: Conflict[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onNewRequestClick: () => void;
  onEmployeeClick: (employeeId: string) => void;
}

export default function DashboardView({
  requests,
  conflicts,
  onApproveRequest,
  onRejectRequest,
  onNewRequestClick,
  onEmployeeClick,
}: DashboardViewProps) {
  // Pending request pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const pendingRequests = requests.filter((r) => r.state === RequestState.PENDIENTE);
  const approvedCount = requests.filter(
    (r) => r.state === RequestState.APROBADO || r.state === RequestState.PROCESADO
  ).length + 142; // Add mockup baseline count
  const rejectedCount = requests.filter((r) => r.state === RequestState.RECHAZADO).length + 8; // Baseline count

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPending = pendingRequests.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(pendingRequests.length / itemsPerPage) || 1;

  // Selected date on the Calendar widget
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState("Octubre 2025");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  // Quick Calendar Event highlights mapping (e.g. October 2025)
  // Day 15, 16, 17: ES (Estudio - Martina). Day 18: MD (Médica - Sofia). Day 20: PA (Particular - Javier)
  const calendarEvents: Record<number, { type: NovedadType; code: string; name: string }> = {
    15: { type: NovedadType.ESTUDIO, code: "ES", name: "Martina Rodriguez" },
    16: { type: NovedadType.ESTUDIO, code: "ES", name: "Martina Rodriguez" },
    17: { type: NovedadType.ESTUDIO, code: "ES", name: "Martina Rodriguez" },
    18: { type: NovedadType.ENFERMEDAD, code: "MD", name: "Sofia Mendez" },
    20: { type: NovedadType.PARTICULAR, code: "PA", name: "Javier Casal" },
  };

  const handleDayClick = (dayNum: number) => {
    setSelectedCalendarDay(dayNum);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header Panel banner */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight antialiased">
            Consola de Ausencias
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo y aprobación automatizada de licencias, inasistencias y permisos del personal.
          </p>
        </div>
        <button
          onClick={onNewRequestClick}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(214, 0, 0,0.3)] border border-brand-light/20 transition-all active:scale-95 cursor-pointer"
        >
          <span className="text-[15px] font-bold">+</span>
          Nueva Novedad
        </button>
      </div>

      {/* KPI Key Statistics Bento Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-transparent">
        {/* Metric 1 */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Pendientes</span>
            <Clock className="w-4 h-4 text-brand-light" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">
              {pendingRequests.length}
            </span>
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[10px] font-bold tracking-tight">
                Requiere acción pronto
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Aprobadas</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">
              {approvedCount}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-400/60">
              <History className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold tracking-tight">
                Últimos 30 días
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Rechazadas</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">
              {rejectedCount}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-400/65">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-semibold tracking-tight">
                Inconsistencias de legajo
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 - Outstanding Bento Hero Block */}
        <div className="bg-brand rounded-3xl p-5 text-white shadow-[0_0_20px_rgba(214, 0, 0,0.35)] flex flex-col justify-between border border-brand-light/20 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-85">Este Mes</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold">28 Activas</span>
            <div className="flex items-center gap-1 mt-1 font-semibold text-emerald-200">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-tight">
                -4% vs mes anterior
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Requests Table Box */}
        <section className="col-span-12 lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col min-h-[480px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-transparent">
            <h2 className="text-white font-bold text-sm tracking-wide">
              Solicitudes en Espera
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => alert("Función de filtrado avanzado de novedades.")}
                className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-light transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert("Reporte de asistencia (.CSV) preparado para descarga.")}
                className="p-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-light transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-left">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {paginatedPending.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                        No hay solicitudes pendientes en espera de revisión.
                      </td>
                    </tr>
                  ) : (
                    paginatedPending.map((req) => (
                      <motion.tr
                        key={req.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onEmployeeClick(req.employeeId)}
                              className="w-9 h-9 bg-slate-800 text-slate-200 border border-slate-705 flex items-center justify-center rounded-xl font-bold text-xs shrink-0 cursor-pointer hover:bg-brand hover:text-white transition-all hover:border-transparent"
                            >
                              {req.employeeName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </button>
                            <div className="text-left">
                              <p
                                onClick={() => onEmployeeClick(req.employeeId)}
                                className="text-xs font-bold text-slate-200 leading-none hover:underline cursor-pointer hover:text-brand-light"
                              >
                                {req.employeeName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                                {req.department} • Legajo: {req.employeeId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-middle">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${getNovedadBadgeStyles(
                              req.type
                            )}`}
                          >
                            {req.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 pr-2">
                          <p className="text-xs font-semibold text-slate-200 leading-none">
                            {req.startDate.split("-").reverse().slice(0, 2).join("/")} al{" "}
                            {req.endDate.split("-").reverse().slice(0, 2).join("/")}
                          </p>
                          <p className="text-[10px] text-slate-450 mt-1 font-mono">
                            {req.days} {req.days > 1 ? "días" : "día"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle">
                          <div className="flex justify-end gap-1.5 self-center">
                            <button
                              onClick={() => onRejectRequest(req.id)}
                              className="bg-transparent hover:bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => {
                                onApproveRequest(req.id);
                                if (paginatedPending.length === 1 && currentPage > 1) {
                                  setCurrentPage((p) => p - 1);
                                }
                              }}
                              className="bg-brand hover:bg-brand-hover text-white px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border border-brand/40 active:scale-95 shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
                            >
                              Aprobar
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Bar */}
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Mostrando {pendingRequests.length === 0 ? 0 : startIndex + 1} a{" "}
              {Math.min(startIndex + itemsPerPage, pendingRequests.length)} de{" "}
              {pendingRequests.length} solicitudes pendientes
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-brand text-white border-transparent"
                      : "border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </section>

        {/* Potential Conflicts & Calendar Widgets Box */}
        <aside className="col-span-12 lg:col-span-4 space-y-4 font-sans">
          {/* Conflicts Container Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-rose-950/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="font-bold text-sm tracking-wide">
                Conflictos Potenciales
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {conflicts.map((conf) => (
                <div
                  key={conf.id}
                  className="p-3 border border-slate-800 rounded-2xl bg-slate-950/40 hover:border-rose-400/30 transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Equipo: {conf.team}
                    </span>
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25 uppercase">
                      {conf.statusText}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mb-3">
                    {conf.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {conf.relatedRequests.map((child, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={`w-1 h-8 rounded-full ${
                            child.type === NovedadType.ESTUDIO
                              ? "bg-emerald-500"
                              : child.type === NovedadType.PARTICULAR
                              ? "bg-brand"
                              : "bg-purple-500"
                          }`}
                        ></div>
                        <div className="flex-1 leading-tight">
                          <p className="text-[11px] font-bold text-slate-200">
                            {child.employeeName} ({child.state})
                          </p>
                          <p className="text-[10px] text-slate-400">{child.range}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 text-center border-t border-slate-800/60">
                    <button
                      onClick={() => alert("Correlación de superposición proyectada en calendario de equipo.")}
                      className="text-brand-light hover:text-brand-lighter text-[10px] font-bold tracking-tight hover:underline cursor-pointer"
                    >
                      Superposición de calendario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Calendar Quick View */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 text-center select-none">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white tracking-wide">
                {currentCalendarMonth}
              </h3>
              <div className="flex gap-1.5">
                <ChevronLeft
                  onClick={() => setCurrentCalendarMonth("Septiembre 2025")}
                  className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
                />
                <ChevronRight
                  onClick={() => setCurrentCalendarMonth("Noviembre 2025")}
                  className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 text-center font-mono">
              {["D", "L", "M", "X", "J", "V", "S"].map((dayName, idx) => (
                <span
                  key={idx}
                  className={`text-[9px] font-bold ${
                    dayName === "D" ? "text-rose-450 text-rose-400" : "text-slate-500"
                  }`}
                >
                  {dayName}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 font-sans">
              {/* Spacer offset for Tuesday start (October 2025 starts on Tuesday, Wed = 1) */}
              <div className="h-8 flex items-center justify-center text-[10px] opacity-10 text-slate-500">28</div>
              <div className="h-8 flex items-center justify-center text-[10px] opacity-10 text-slate-500">29</div>
              <div className="h-8 flex items-center justify-center text-[10px] opacity-10 text-slate-500">30</div>
              <div className="h-8 flex items-center justify-center text-[10px] text-slate-400">1</div>
              <div className="h-8 flex items-center justify-center text-[10px] text-slate-400">2</div>
              <div className="h-8 flex items-center justify-center text-[10px] text-slate-400">3</div>
              <div className="h-8 flex items-center justify-center text-[10px] text-slate-400">4</div>

              {/* Render dynamic days */}
              {Array.from({ length: 27 }, (_, idx) => {
                const dayNum = idx + 5;
                const hasEvent = calendarEvents[dayNum];

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(dayNum)}
                    className={`h-8 flex flex-col items-center justify-center border rounded-lg text-[10px] font-semibold transition-all relative cursor-pointer ${
                      hasEvent
                        ? hasEvent.type === NovedadType.ESTUDIO
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : hasEvent.type === NovedadType.PARTICULAR
                          ? "bg-brand/10 border-brand/30 text-brand-light"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "border-transparent text-slate-300 hover:bg-slate-800/60"
                    } ${selectedCalendarDay === dayNum ? "ring-2 ring-brand" : ""}`}
                  >
                    <span>{dayNum}</span>
                    {hasEvent && (
                      <span className="text-[7px] font-black leading-none uppercase select-none mt-0.5 font-mono">
                        {hasEvent.code}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected day explanation details */}
            {selectedCalendarDay && calendarEvents[selectedCalendarDay] ? (
              <div className="mt-3 p-2.5 bg-slate-950/60 rounded-2xl text-left text-[11px] leading-tight text-slate-300 border border-slate-800 antialiased animate-fade-in">
                <p className="font-bold text-white">
                  Día {selectedCalendarDay} de Octubre:
                </p>
                <div className="mt-1 text-slate-400">
                  Novedad: <span className="font-semibold text-white">{calendarEvents[selectedCalendarDay].type}</span>
                  <br />
                  Solicitante: <span className="font-semibold text-white">{calendarEvents[selectedCalendarDay].name}</span>
                </div>
              </div>
            ) : selectedCalendarDay ? (
              <div className="mt-3 p-2 bg-slate-950/30 border border-slate-900 rounded-2xl text-left text-[10px] text-slate-500 italic">
                Día {selectedCalendarDay} sin novedades de asistencia registradas.
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
