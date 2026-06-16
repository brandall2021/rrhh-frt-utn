"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Users,
  UserCheck,
  UserX,
  Download,
  Send,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { DailyReport, DailyReportEntry } from "@/lib/reports";

const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function ReportsDailyView() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sent" | "error">("idle");

  const fetchReport = useCallback(async (date: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/diario?date=${date}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setReport(json.data);
    } catch (err: any) {
      setError(err.message || "Error al cargar reporte");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate, fetchReport]);

  const handleDownloadPdf = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById("report-daily-content");
      if (!el) return;

      const canvas = await html2canvas(el, {
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

      pdf.save(`reporte_diario_${selectedDate}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error al generar el PDF. Algunos estilos de la página no son compatibles con la exportación.");
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) return;
    setSending(true);
    setSendStatus("idle");
    try {
      const res = await fetch("/api/reports/diario/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, to: emailTo.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSendStatus("sent");
    } catch {
      setSendStatus("error");
    } finally {
      setSending(false);
    }
  };

  function getEntryBadge(entry: DailyReportEntry) {
    const base = COLOR_MAP[entry.typeColor] || COLOR_MAP.red;
    return `${base} text-[9px] font-bold px-2 py-0.5 rounded border uppercase`;
  }

  const absentCount = report?.absentCount ?? 0;
  const presentCount = report?.presentCount ?? 0;
  const totalCount = report?.totalEmployees ?? 0;

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
            Reporte Diario
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualizá el estado de asistencias por fecha, descargá PDF o enviá por email.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 p-2 rounded-xl focus:outline-none focus:border-brand/50"
            />
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Cargando reporte...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 font-semibold">{error}</p>
        </div>
      ) : report ? (
        <>
          <div id="report-daily-content" className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center hover:border-slate-700/60 transition-colors">
                <Users className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Total</p>
                <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center hover:border-slate-700/60 transition-colors">
                <UserCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wide">Presentes</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{presentCount}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center hover:border-slate-700/60 transition-colors">
                <UserX className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wide">Ausentes</p>
                <p className="text-2xl font-black text-rose-400 mt-1">{absentCount}</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Detalle de Ausencias
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {report.entries.length} registro{report.entries.length !== 1 ? "s" : ""}
                </span>
              </div>

              {report.entries.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">No se registran ausencias para esta fecha.</p>
                  <p className="text-xs text-slate-500 mt-1">Todos los empleados están presentes.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                        <th className="px-4 py-2.5">Empleado</th>
                        <th className="px-4 py-2.5">Departamento</th>
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5">Origen</th>
                        <th className="px-4 py-2.5">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {report.entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors text-xs text-left">
                          <td className="px-4 py-3 font-semibold text-slate-200">
                            {entry.employeeName}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {entry.department}
                          </td>
                          <td className="px-4 py-3">
                            <span className={getEntryBadge(entry)}>{entry.type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              entry.source === "licencia"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {entry.source === "licencia" ? "Licencia" : "Inasistencia"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                            {entry.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 text-right border-t border-slate-800 pt-3">
              Generado: {new Date().toLocaleString("es-AR")}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide">
              Exportar / Enviar Reporte
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
              >
                <Download size={14} />
                Descargar PDF
              </button>

              <div className="flex-1 flex gap-2 items-center">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => { setEmailTo(e.target.value); setSendStatus("idle"); }}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-brand/50 placeholder:text-slate-600"
                  />
                </div>
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !emailTo.trim()}
                  className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 border border-brand/20"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Enviar
                </button>
              </div>
            </div>

            {sendStatus === "sent" && (
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Reporte enviado exitosamente a {emailTo}
              </div>
            )}
            {sendStatus === "error" && (
              <div className="flex items-center gap-2 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Error al enviar. Verificá la configuración SMTP.
              </div>
            )}
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
