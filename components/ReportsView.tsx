"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileBarChart2,
  Calendar,
  Compass,
  AlertCircle,
  TrendingUp,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cake,
  Edit,
  Info,
  Trash2,
  X,
  Download,
} from "lucide-react";
import { MonthlyAbsenceStat, Employee, AbsenceType, Absence } from "@/types";
import {
  getCalendarDays,
  MONTH_NAMES_SPANISH,
  MONTH_SHORT_NAMES_SPANISH,
  WEEKDAYS_SPANISH,
  COLOR_CONFIGS,
  formatDateToISO,
} from "@/lib/calendar";

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

export default function ReportsView() {
  const [activeReportYear, setActiveReportYear] = useState("2025");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [calendarYear, setCalendarYear] = useState(2025);
  const [selectedMonthTab, setSelectedMonthTab] = useState<string>("Todos");
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string; dayNum: number; monthIndex: number; absence?: Absence; absenceType?: AbsenceType;
  } | null>(null);

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

  useEffect(() => {
    fetch("/api/employees").then(r => r.json()).then(({ data }) => setEmployees(data ?? [])).catch(() => {});
    fetch("/api/absence-types").then(r => r.json()).then(({ data }) => setAbsenceTypes(data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) { setAbsences([]); return; }
    fetch(`/api/employees/${selectedEmployeeId}/absences`)
      .then(r => r.json())
      .then(({ data }) => setAbsences(data ?? []))
      .catch(() => setAbsences([]));
  }, [selectedEmployeeId]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) ?? null;

  const employeeAbsences = absences.filter(
    (a) => a.employeeId === selectedEmployeeId && a.date.startsWith(String(calendarYear))
  );

  const absencesByDateMap = React.useMemo(() => {
    const map = new Map<string, Absence>();
    employeeAbsences.forEach((a) => map.set(a.date, a));
    return map;
  }, [employeeAbsences]);

  const statsByType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    absenceTypes.forEach((t) => { counts[t.id] = 0; });
    employeeAbsences.forEach((a) => {
      if (counts[a.absenceTypeId] !== undefined) counts[a.absenceTypeId]++;
      else counts[a.absenceTypeId] = 1;
    });
    return counts;
  }, [employeeAbsences, absenceTypes]);

  const handleQuickAddAbsence = async (dateStr: string, typeId: string) => {
    const withoutExisting = absences.filter(
      (a) => !(a.employeeId === selectedEmployeeId && a.date === dateStr)
    );
    const newAbsence: Absence = {
      id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      employeeId: selectedEmployeeId,
      absenceTypeId: typeId,
      date: dateStr,
      notes: "Registro rápido",
    };
    const updated = [...withoutExisting, newAbsence];
    setAbsences(updated);
    setShowDayModal(false);
    await fetch(`/api/employees/${selectedEmployeeId}/absences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ absences: updated }),
    }).catch(() => {});
  };

  const handleDeleteAbsence = async (dateStr: string) => {
    const updated = absences.filter(
      (a) => !(a.employeeId === selectedEmployeeId && a.date === dateStr)
    );
    setAbsences(updated);
    setShowDayModal(false);
    await fetch(`/api/employees/${selectedEmployeeId}/absences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ absences: updated }),
    }).catch(() => {});
  };

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
            Estadísticas & Reportes Anuales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas unificadas de novedades, licencias y ausentismo para fines estratégicos.
          </p>
        </div>

        <div className="flex gap-2">
          {["2024", "2025", "2026"].map((y) => (
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

      {/* Attendance Calendar Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-light" />
              Calendario de Asistencias
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Visualizá y gestioná las inasistencias por empleado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 p-2 rounded-xl focus:outline-none focus:border-brand/50 min-w-[200px]"
            >
              <option value="">Seleccionar empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.lastName}, {emp.firstName} — {emp.department}
                </option>
              ))}
            </select>

            {selectedEmployee && (
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCalendarYear((p) => p - 1)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="px-2 font-bold text-brand-light text-xs">{calendarYear}</span>
                <button
                  onClick={() => setCalendarYear((p) => p + 1)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {!selectedEmployee ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <User className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Seleccioná un empleado</p>
            <p className="text-xs mt-1">Elegí un empleado para ver su calendario de asistencias</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-slate-950/30 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mr-1">
                Resumen:
              </span>
              {absenceTypes.map((type) => {
                const count = statsByType[type.id] || 0;
                const config = COLOR_CONFIGS[type.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
                return (
                  <div key={type.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-semibold ${config.badgeColor}`}>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="text-white text-[10px]">{count}</span>
                    <span className="text-slate-400 font-normal hidden xs:inline text-[10px]">{type.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1 border-b border-slate-800 pb-3 mb-4 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedMonthTab("Todos")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer shrink-0 ${
                  selectedMonthTab === "Todos"
                    ? "bg-brand text-white border-brand/40"
                    : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
                }`}
              >
                Todos
              </button>
              {MONTH_SHORT_NAMES_SPANISH.map((shortName, idx) => (
                <button
                  key={shortName}
                  onClick={() => setSelectedMonthTab(shortName)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer shrink-0 ${
                    selectedMonthTab === shortName
                      ? "bg-transparent text-brand-light border-brand/40"
                      : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
                  }`}
                >
                  {shortName}
                </button>
              ))}
            </div>

            <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-2.5 mb-4 text-[10px] text-slate-400 flex items-center gap-2">
              <Info size={13} className="text-brand-light shrink-0" />
              <span>
                <strong className="text-white uppercase text-[9px] tracking-wider mr-1">Atajo:</strong>
                Tocá un día para registrar ausencias rápidas o eliminar registros.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {MONTH_NAMES_SPANISH.map((monthName, monthIdx) => {
                const shortName = MONTH_SHORT_NAMES_SPANISH[monthIdx];
                if (selectedMonthTab !== "Todos" && selectedMonthTab !== shortName) return null;

                const days = getCalendarDays(calendarYear, monthIdx);

                return (
                  <div key={monthName} className="bg-slate-950/30 border border-slate-800 rounded-xl p-2 flex flex-col hover:border-slate-700/60 transition-colors">
                    <h3 className="text-center text-xs font-bold text-white pb-1.5 border-b border-slate-800 mb-1.5">
                      {monthName}
                    </h3>

                    <div className="grid grid-cols-7 gap-px text-center text-[8px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                      {WEEKDAYS_SPANISH.map((wd, wdIdx) => (
                        <div key={wdIdx} className={`py-0.5 ${wd === "D" || wd === "S" ? "text-red-400/60" : ""}`}>{wd}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-px">
                      {days.map((dayNum, dayIdx) => {
                        if (dayNum === null) return <div key={`e-${dayIdx}`} className="aspect-square" />;

                        const dateStr = formatDateToISO(calendarYear, monthIdx, dayNum);
                        const absence = absencesByDateMap.get(dateStr);
                        const isWeekend = dayIdx % 7 === 0 || dayIdx % 7 === 6;

                        let absenceType: AbsenceType | undefined;
                        let colorConfig = COLOR_CONFIGS.red;

                        if (absence) {
                          absenceType = absenceTypes.find((t) => t.id === absence.absenceTypeId);
                          if (absenceType) {
                            colorConfig = COLOR_CONFIGS[absenceType.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
                          }
                        }

                        return (
                          <button
                            key={`d-${dayNum}`}
                            onClick={() => {
                              setSelectedDayDetail({ dateStr, dayNum, monthIndex: monthIdx, absence, absenceType });
                              setShowDayModal(true);
                            }}
                            className={`relative min-h-[28px] rounded flex flex-col items-center justify-center text-[9px] select-none hover:ring-1 hover:ring-brand-light/50 transition-all cursor-pointer ${
                              absence
                                ? `${colorConfig.calendarCell} ring-1 ring-current/30`
                                : isWeekend
                                  ? "bg-slate-950/40 text-slate-600"
                                  : "bg-slate-950/60 text-slate-400 border border-slate-800/50"
                            }`}
                          >
                            <span className="font-semibold leading-none">{dayNum}</span>
                            {absence && absenceType && (
                              <span className={`text-[7px] font-bold leading-none mt-px ${colorConfig.accentText}`}>
                                {absenceType.code}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Day Detail Modal */}
      {showDayModal && selectedDayDetail && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800">
              <span className="text-[10px] uppercase tracking-widest text-brand-light font-bold">
                {selectedDayDetail.dayNum} {MONTH_SHORT_NAMES_SPANISH[selectedDayDetail.monthIndex]} {calendarYear}
              </span>
              <button
                onClick={() => setShowDayModal(false)}
                className="text-slate-500 hover:text-white rounded p-0.5 hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {selectedDayDetail.absence ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-widest mb-0.5 font-bold">Tipo</span>
                      <strong className="text-sm text-white">{selectedDayDetail.absenceType?.name}</strong>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      COLOR_CONFIGS[selectedDayDetail.absenceType?.color as keyof typeof COLOR_CONFIGS]?.calendarCell || COLOR_CONFIGS.red.calendarCell
                    }`}>
                      {selectedDayDetail.absenceType?.code}
                    </div>
                  </div>

                  {selectedDayDetail.absence.notes && (
                    <div className="text-xs bg-slate-950/40 border border-slate-800 p-3 rounded-xl text-slate-300">
                      <span className="text-[9px] text-brand-light block uppercase font-bold tracking-wider mb-1">Observaciones:</span>
                      {selectedDayDetail.absence.notes}
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteAbsence(selectedDayDetail.dateStr)}
                    className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Eliminar Registro
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-brand-light block uppercase tracking-wider">
                    Registrar inasistencia:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {absenceTypes.map((t) => {
                      const conf = COLOR_CONFIGS[t.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleQuickAddAbsence(selectedDayDetail.dateStr, t.id)}
                          className="flex items-center justify-between w-full hover:bg-slate-800/60 border border-slate-800 bg-slate-950/40 p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${conf.accentText} bg-current`} />
                            <span className="text-white font-medium">{t.name}</span>
                          </div>
                          <span className="font-mono text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                            {t.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
