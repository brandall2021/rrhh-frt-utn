"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
  X,
  Download,
} from "lucide-react";
import { Employee, AbsenceType, Absence, LeaveRequest, NovedadType } from "@/types";
import {
  getCalendarDays,
  MONTH_NAMES_SPANISH,
  MONTH_SHORT_NAMES_SPANISH,
  WEEKDAYS_SPANISH,
  COLOR_CONFIGS,
  formatDateToISO,
} from "@/lib/calendar";

export default function ReportsCalendarView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedMonthTab, setSelectedMonthTab] = useState<string>("Todos");
  const [showDayModal, setShowDayModal] = useState(false);
  const [newAbsenceNotes, setNewAbsenceNotes] = useState("");
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string; dayNum: number; monthIndex: number; absence?: Absence; absenceType?: AbsenceType; leaveRequest?: LeaveRequest;
  } | null>(null);

  useEffect(() => {
    fetch("/api/employees").then(r => r.json()).then(({ data }) => setEmployees(data ?? [])).catch(() => {});
    fetch("/api/absence-types").then(r => r.json()).then(({ data }) => setAbsenceTypes(data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setAbsences([]);
      setLeaveRequests([]);
      return;
    }
    fetch(`/api/employees/${selectedEmployeeId}/absences`)
      .then(r => r.json())
      .then(({ data }) => setAbsences(data ?? []))
      .catch(() => setAbsences([]));

    fetch(`/api/requests?employeeId=${selectedEmployeeId}`)
      .then(r => r.json())
      .then(({ data }) => {
        const approved = (data ?? []).filter(
          (r: LeaveRequest) => r.state === "APROBADO" || r.state === "PROCESADO"
        );
        setLeaveRequests(approved);
      })
      .catch(() => setLeaveRequests([]));
  }, [selectedEmployeeId]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) ?? null;

  const NOVEDAD_COLOR_MAP: Record<string, keyof typeof COLOR_CONFIGS> = {
    ENFERMEDAD: "red",
    AUSENCIA: "orange",
    PARTICULAR: "amber",
    ESTUDIO: "blue",
    COMPENSATORIO: "emerald",
    MEDICA: "purple",
    MATERNIDAD: "pink",
    OTROS: "slate",
  };

  const NOVEDAD_LABEL_MAP: Record<string, string> = {
    ENFERMEDAD: "ENF",
    AUSENCIA: "AUS",
    PARTICULAR: "PAR",
    ESTUDIO: "EST",
    COMPENSATORIO: "COM",
    MEDICA: "MED",
    MATERNIDAD: "MAT",
    OTROS: "OTR",
  };

  const employeeAbsences = absences.filter(
    (a) => a.employeeId === selectedEmployeeId && a.date.startsWith(String(calendarYear))
  );

  const combinedDayMap = React.useMemo(() => {
    const map = new Map<string, { absence?: Absence; leaveRequest?: LeaveRequest }>();

    employeeAbsences.forEach((a) => map.set(a.date, { absence: a }));

    leaveRequests.forEach((lr) => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDateToISO(d.getFullYear(), d.getMonth(), d.getDate());
        if (d.getFullYear() === calendarYear) {
          const existing = map.get(dateStr) || {};
          map.set(dateStr, { ...existing, leaveRequest: lr });
        }
      }
    });

    return map;
  }, [employeeAbsences, leaveRequests, calendarYear]);

  const statsByType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    absenceTypes.forEach((t) => { counts[t.id] = 0; });

    employeeAbsences.forEach((a) => {
      if (counts[a.absenceTypeId] !== undefined) counts[a.absenceTypeId]++;
      else counts[a.absenceTypeId] = 1;
    });

    leaveRequests.forEach((lr) => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      const typeKey = lr.type.toLowerCase();
      if (counts[typeKey] !== undefined) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === calendarYear) counts[typeKey]++;
        }
      }
    });

    return counts;
  }, [employeeAbsences, absenceTypes, leaveRequests, calendarYear]);

  const handleQuickAddAbsence = async (dateStr: string, typeId: string, notes: string) => {
    const withoutExisting = absences.filter(
      (a) => !(a.employeeId === selectedEmployeeId && a.date === dateStr)
    );
    const newAbsence: Absence = {
      id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      employeeId: selectedEmployeeId,
      absenceTypeId: typeId,
      date: dateStr,
      notes: notes.trim() || "Registro rápido",
    };
    const updated = [...withoutExisting, newAbsence];
    setAbsences(updated);
    setShowDayModal(false);
    setNewAbsenceNotes("");
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
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Calendario de Asistencias
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Visualizá y gestioná las inasistencias por empleado.
        </p>
      </div>

      <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-light" />
            <h3 className="text-xs font-extrabold text-white tracking-wide">
              Calendario de Asistencias
            </h3>
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
              <div className="flex items-center gap-2">
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
                <button
                  onClick={async () => {
                    try {
                      const { default: jsPDF } = await import("jspdf");
                      const html2canvas = (await import("html2canvas")).default;
                      const reportEl = document.getElementById("report-attendance-calendar");
                      if (!reportEl) return;
                      const canvas = await html2canvas(reportEl, {
                        backgroundColor: "#020617",
                        scale: 2,
                        useCORS: true,
                        logging: false,
                      });
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF("p", "mm", "a4");
                      const pageWidth = pdf.internal.pageSize.getWidth();
                      const pageHeight = pdf.internal.pageSize.getHeight();
                      const imgWidth = pageWidth - 20;
                      const imgHeight = (canvas.height * imgWidth) / canvas.width;
                      let heightLeft = imgHeight;
                      let position = 10;
                      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                      heightLeft -= pageHeight - 20;
                      while (heightLeft > 0) {
                        position = heightLeft - imgHeight + 10;
                        pdf.addPage();
                        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight - 20;
                      }
                      pdf.save(`asistencias_${selectedEmployee.lastName}_${selectedEmployee.firstName}_${calendarYear}.pdf`);
                    } catch (err) {
                      console.error("Error al generar PDF:", err);
                      alert("Error al generar el PDF. Algunos estilos de la página no son compatibles con la exportación.");
                    }
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-slate-700"
                >
                  <Download size={12} />
                  PDF
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
          <div id="report-attendance-calendar">
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
                        const dayInfo = combinedDayMap.get(dateStr);
                        const absence = dayInfo?.absence;
                        const leaveRequest = dayInfo?.leaveRequest;
                        const isWeekend = dayIdx % 7 === 0 || dayIdx % 7 === 6;
                        const hasMark = !!absence || !!leaveRequest;

                        let absenceType: AbsenceType | undefined;
                        let colorConfig = COLOR_CONFIGS.red;
                        let label = "STS";

                        if (absence) {
                          absenceType = absenceTypes.find((t) => t.id === absence.absenceTypeId);
                          if (absenceType) {
                            colorConfig = COLOR_CONFIGS[absenceType.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
                            label = absenceType.code;
                          }
                        } else if (leaveRequest) {
                          const novColor = NOVEDAD_COLOR_MAP[leaveRequest.type] || "slate";
                          colorConfig = COLOR_CONFIGS[novColor];
                          label = NOVEDAD_LABEL_MAP[leaveRequest.type] || leaveRequest.type.slice(0, 3);
                        }

                        return (
                          <button
                            key={`d-${dayNum}`}
                            onClick={() => {
                              setSelectedDayDetail({ dateStr, dayNum, monthIndex: monthIdx, absence, absenceType, leaveRequest });
                              setNewAbsenceNotes("");
                              setShowDayModal(true);
                            }}
                            className={`relative min-h-[28px] rounded flex flex-col items-center justify-center text-[9px] select-none hover:ring-1 hover:ring-brand-light/50 transition-all cursor-pointer ${
                              hasMark
                                ? `${colorConfig.calendarCell} ring-1 ring-current/30`
                                : isWeekend
                                  ? "bg-slate-950/40 text-slate-600"
                                  : "bg-slate-950/60 text-slate-400 border border-slate-800/50"
                            }`}
                          >
                            <span className="font-semibold leading-none">{dayNum}</span>
                            {hasMark && (
                              <span className={`text-[7px] font-bold leading-none mt-px ${colorConfig.accentText}`}>
                                {label}
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

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>{selectedEmployee.lastName}, {selectedEmployee.firstName} — {selectedEmployee.department}</span>
              <span>Generado: {new Date().toLocaleDateString("es-AR")}</span>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showDayModal && selectedDayDetail && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDayModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-widest text-brand-light font-bold">
                    {selectedDayDetail.dayNum} {MONTH_SHORT_NAMES_SPANISH[selectedDayDetail.monthIndex]} {calendarYear}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {selectedEmployee.lastName}, {selectedEmployee.firstName}
                    <span className="text-slate-600 mx-1">·</span>
                    {selectedEmployee.department}
                  </span>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="text-slate-500 hover:text-white rounded p-0.5 hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto">
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

                    <div className="text-[9px] bg-slate-950/20 border border-slate-700/50 p-2 rounded-lg text-slate-400">
                      <span className="text-[8px] text-brand-light uppercase font-bold tracking-wider mr-1">Origen:</span>
                      Registro manual
                    </div>

                    <button
                      onClick={() => handleDeleteAbsence(selectedDayDetail.dateStr)}
                      className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Eliminar Registro
                    </button>
                  </div>
                ) : selectedDayDetail.leaveRequest ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-widest mb-0.5 font-bold">Licencia Aprobada</span>
                        <strong className="text-sm text-white">{selectedDayDetail.leaveRequest.type}</strong>
                      </div>
                      <div className={`px-2 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        NOVEDAD_COLOR_MAP[selectedDayDetail.leaveRequest.type]
                          ? COLOR_CONFIGS[NOVEDAD_COLOR_MAP[selectedDayDetail.leaveRequest.type]]?.calendarCell || COLOR_CONFIGS.red.calendarCell
                          : COLOR_CONFIGS.red.calendarCell
                      }`}>
                        {NOVEDAD_LABEL_MAP[selectedDayDetail.leaveRequest.type] || selectedDayDetail.leaveRequest.type.slice(0, 3)}
                      </div>
                    </div>

                    <div className="text-xs bg-slate-950/40 border border-slate-800 p-3 rounded-xl text-slate-300 space-y-1">
                      <p>
                        <span className="text-[9px] text-brand-light uppercase font-bold tracking-wider mr-1">Período:</span>
                        {selectedDayDetail.leaveRequest.startDate} → {selectedDayDetail.leaveRequest.endDate}
                      </p>
                      {selectedDayDetail.leaveRequest.observations && (
                        <p>
                          <span className="text-[9px] text-brand-light uppercase font-bold tracking-wider mr-1">Obs:</span>
                          {selectedDayDetail.leaveRequest.observations}
                        </p>
                      )}
                    </div>

                    <div className="text-[9px] bg-slate-950/20 border border-slate-700/50 p-2 rounded-lg text-slate-400">
                      <span className="text-[8px] text-brand-light uppercase font-bold tracking-wider mr-1">Origen:</span>
                      Solicitud aprobada — {selectedDayDetail.leaveRequest.state}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-brand-light block uppercase tracking-wider">
                      Registrar inasistencia:
                    </span>

                    <textarea
                      value={newAbsenceNotes}
                      onChange={(e) => setNewAbsenceNotes(e.target.value)}
                      placeholder="Opcional — motivo o comentario..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-brand/50 placeholder:text-slate-600 resize-none"
                    />

                    <div className="grid grid-cols-1 gap-2">
                      {absenceTypes.map((t) => {
                        const conf = COLOR_CONFIGS[t.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleQuickAddAbsence(selectedDayDetail.dateStr, t.id, newAbsenceNotes)}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
