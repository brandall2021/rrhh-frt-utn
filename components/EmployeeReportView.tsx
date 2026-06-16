"use client";

import React, { useState } from "react";
import { Employee, AbsenceType, Absence } from "@/types";
import {
  getCalendarDays,
  MONTH_NAMES_SPANISH,
  MONTH_SHORT_NAMES_SPANISH,
  WEEKDAYS_SPANISH,
  COLOR_CONFIGS,
  formatDateToISO,
} from "@/lib/calendar";
import { Calendar, Edit, ChevronLeft, ChevronRight, Trash2, X, Info, Download } from "lucide-react";

interface EmployeeReportViewProps {
  onBack: () => void;
  selectedEmployee: Employee;
  absenceTypes: AbsenceType[];
  absences: Absence[];
  setAbsences: React.Dispatch<React.SetStateAction<Absence[]>>;
}

export default function EmployeeReportView({
  onBack,
  selectedEmployee,
  absenceTypes,
  absences,
  setAbsences,
}: EmployeeReportViewProps) {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthTab, setSelectedMonthTab] = useState<string>("Todos");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  const [formAbsenceTypeId, setFormAbsenceTypeId] = useState<string>(absenceTypes[0]?.id || "");
  const [formStartDate, setFormStartDate] = useState<string>(`${currentYear}-03-26`);
  const [formEndDate, setFormEndDate] = useState<string>(`${currentYear}-04-04`);
  const [formNotes, setFormNotes] = useState<string>("");

  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    dayNum: number;
    monthIndex: number;
    absence?: Absence;
    absenceType?: AbsenceType;
  } | null>(null);

  const employeeAbsences = absences.filter(
    (a) => a.employeeId === selectedEmployee.id && a.date.startsWith(String(currentYear))
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

  const handleSaveAbsenceRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAbsenceTypeId || !formStartDate || !formEndDate) return;

    const start = new Date(formStartDate + "T00:00:00");
    const end = new Date(formEndDate + "T00:00:00");
    if (end < start) { alert("La fecha de fin no puede ser menor a la fecha de inicio"); return; }

    const newAbsences: Absence[] = [];
    const temp = new Date(start);
    while (temp <= end) {
      const dateStr = formatDateToISO(temp.getFullYear(), temp.getMonth(), temp.getDate());
      newAbsences.push({
        id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        employeeId: selectedEmployee.id,
        absenceTypeId: formAbsenceTypeId,
        date: dateStr,
        notes: formNotes || undefined,
      });
      temp.setDate(temp.getDate() + 1);
    }

    const datesToOverwrite = new Set(newAbsences.map((n) => n.date));
    setAbsences((prev) => [
      ...prev.filter((a) => !(a.employeeId === selectedEmployee.id && datesToOverwrite.has(a.date))),
      ...newAbsences,
    ]);

    setShowEditModal(false);
    setFormNotes("");
  };

  const handleQuickAddAbsence = (dateStr: string, typeId: string) => {
    const withoutExisting = absences.filter(
      (a) => !(a.employeeId === selectedEmployee.id && a.date === dateStr)
    );
    const newAbsence: Absence = {
      id: `abs_${Date.now()}`,
      employeeId: selectedEmployee.id,
      absenceTypeId: typeId,
      date: dateStr,
      notes: "Registro rápido",
    };
    setAbsences([...withoutExisting, newAbsence]);
    setShowDayModal(false);
  };

  const handleDeleteAbsence = (dateStr: string) => {
    setAbsences((prev) => prev.filter((a) => !(a.employeeId === selectedEmployee.id && a.date === dateStr)));
    setShowDayModal(false);
  };

  const getInitials = () => {
    const first = selectedEmployee.firstName?.[0] || "";
    const last = selectedEmployee.lastName?.[0] || "";
    return `${last}${first}`.toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-3 py-2 md:px-6 md:py-3 flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0"
            >
              <ChevronRight size={13} className="text-brand-light rotate-180" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-900 text-brand-light font-bold flex items-center justify-center border border-brand/20 text-xs md:text-sm shrink-0">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] md:text-[9px] text-brand-light uppercase tracking-widest font-semibold block leading-tight">
                  Reporte de Asistencias
                </span>
                <h1 className="text-sm md:text-lg font-extrabold text-white leading-tight truncate">
                  {selectedEmployee.lastName}, {selectedEmployee.firstName}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <button
                onClick={() => { setCurrentYear((p) => p - 1); setShowDayModal(false); }}
                className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-2 md:px-3 font-bold text-brand-light text-xs md:text-sm">{currentYear}</span>
              <button
                onClick={() => { setCurrentYear((p) => p + 1); setShowDayModal(false); }}
                className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            <button
              onClick={() => {
                setFormStartDate(`${currentYear}-03-26`);
                setFormEndDate(`${currentYear}-04-04`);
                setShowEditModal(true);
              }}
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all cursor-pointer border border-brand-light/20"
            >
              <Edit size={12} />
              <span className="hidden xs:inline">Editar</span>
              novedades
            </button>

            <button
              onClick={async () => {
                try {
                  const { default: jsPDF } = await import("jspdf");
                  const html2canvas = (await import("html2canvas")).default;
                  const { getHtml2canvasOptions } = await import("@/lib/pdf");
                  const reportEl = document.getElementById("employee-report-content");
                  if (!reportEl) return;
                  const canvas = await html2canvas(reportEl, getHtml2canvasOptions());
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
                  pdf.save(`asistencias_${selectedEmployee.lastName}_${selectedEmployee.firstName}_${currentYear}.pdf`);
                } catch (err) {
                  console.error("Error al generar PDF:", err);
                  alert("Error al generar el PDF. Algunos estilos de la página no son compatibles con la exportación.");
                }
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              <Download size={12} />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div id="employee-report-content" className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">
        {/* Quick Badges Counters */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 bg-slate-900/50 border border-slate-800 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
          <span className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-semibold mr-0.5 md:mr-2">
            Resumen:
          </span>
          {absenceTypes.map((type) => {
            const count = statsByType[type.id] || 0;
            const config = COLOR_CONFIGS[type.color as keyof typeof COLOR_CONFIGS] || COLOR_CONFIGS.red;
            return (
              <div key={type.id} className={`flex items-center gap-1 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-lg border text-[10px] md:text-xs font-semibold ${config.badgeColor}`}>
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current" />
                <span className="text-white text-[10px] md:text-xs">{count}</span>
                <span className="text-slate-400 font-normal hidden xs:inline text-[10px] md:text-xs">{type.name}</span>
              </div>
            );
          })}
        </div>

        {/* Month Filter Tabs */}
        <div className="flex gap-1 border-b border-slate-800 pb-3 md:pb-4 overflow-x-auto scrollbar-none -mx-3 px-3 md:mx-0 md:px-0">
          <button
            onClick={() => setSelectedMonthTab("Todos")}
            className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border cursor-pointer shrink-0 ${
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
              className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                selectedMonthTab === shortName
                  ? "bg-transparent text-brand-light border-brand/40"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
              }`}
            >
              {shortName}
            </button>
          ))}
        </div>

        {/* Info Bar */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl md:rounded-2xl p-2.5 md:p-3 text-[10px] md:text-xs text-slate-400 flex items-center gap-2 md:gap-3">
          <Info size={13} className="text-brand-light shrink-0" />
          <span>
            <strong className="text-white uppercase text-[9px] md:text-[10px] tracking-wider mr-1">Atajo:</strong>
            Tocá un día para registrar ausencias rápidas o eliminar registros.
          </span>
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {MONTH_NAMES_SPANISH.map((monthName, monthIdx) => {
            const shortName = MONTH_SHORT_NAMES_SPANISH[monthIdx];
            if (selectedMonthTab !== "Todos" && selectedMonthTab !== shortName) return null;

            const days = getCalendarDays(currentYear, monthIdx);

            return (
              <div key={monthName} className="bg-slate-900/30 border border-slate-800 rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col hover:border-slate-700/60 transition-colors">
                <h3 className="text-center text-xs md:text-sm font-bold text-white pb-1.5 md:pb-2 border-b border-slate-800 mb-1.5 md:mb-2">
                  {monthName}
                </h3>

                <div className="grid grid-cols-7 gap-px md:gap-0.5 text-center text-[8px] md:text-[10px] font-bold text-slate-500 mb-0.5 md:mb-1 uppercase tracking-wider">
                  {WEEKDAYS_SPANISH.map((wd, wdIdx) => (
                    <div key={wdIdx} className={`py-0.5 ${wd === "D" || wd === "S" ? "text-red-400/60" : ""}`}>{wd}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px md:gap-0.5">
                  {days.map((dayNum, dayIdx) => {
                    if (dayNum === null) return <div key={`e-${dayIdx}`} className="aspect-square" />;

                    const dateStr = formatDateToISO(currentYear, monthIdx, dayNum);
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
                        className={`relative min-h-[28px] md:min-h-[36px] rounded flex flex-col items-center justify-center text-[9px] md:text-xs select-none hover:ring-1 hover:ring-brand-light/50 transition-all cursor-pointer ${
                          absence
                            ? `${colorConfig.calendarCell} ring-1 ring-current/30`
                            : isWeekend
                              ? "bg-slate-950/40 text-slate-600"
                              : "bg-slate-950/60 text-slate-400 border border-slate-800/50"
                        }`}
                      >
                        <span className="font-semibold leading-none">{dayNum}</span>
                        {absence && absenceType && (
                          <span className={`text-[7px] md:text-[9px] font-bold leading-none mt-px ${colorConfig.accentText}`}>
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
      </div>

      {/* Range Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit size={15} className="text-brand-light" />
                Registrar Novedades
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-white rounded p-1 hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAbsenceRange} className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-light mb-1 font-bold">
                  Tipo de Ausencia
                </label>
                <select
                  value={formAbsenceTypeId}
                  onChange={(e) => setFormAbsenceTypeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-sm p-2.5 text-slate-200 rounded-xl focus:outline-none focus:border-brand/50"
                  required
                >
                  {absenceTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-light mb-1 font-bold">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-sm p-2.5 text-white rounded-xl focus:outline-none focus:border-brand/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-light mb-1 font-bold">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-sm p-2.5 text-white rounded-xl focus:outline-none focus:border-brand/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-light mb-1 font-bold">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles de justificación..."
                  className="w-full bg-slate-950 border border-slate-700 text-sm p-2.5 text-white h-20 resize-none rounded-xl focus:outline-none focus:border-brand/50"
                />
              </div>

              <div className="text-slate-500 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                Se registrará la ausencia por cada día dentro del rango. Las novedades previas en esos días serán reescritas automáticamente.
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-transparent text-slate-400 hover:text-white border border-slate-700 py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-hover text-white py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayModal && selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800">
              <span className="text-[10px] uppercase tracking-widest text-brand-light font-bold">
                {selectedDayDetail.dayNum} {MONTH_SHORT_NAMES_SPANISH[selectedDayDetail.monthIndex]} {currentYear}
              </span>
              <button
                onClick={() => setShowDayModal(false)}
                className="text-slate-500 hover:text-white rounded p-0.5 hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
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
    </div>
  );
}
