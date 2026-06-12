"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  UploadCloud,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
} from "lucide-react";
import { Employee, LeaveRequest, NovedadType, RequestState } from "@/types";

interface NewRequestViewProps {
  employees: Employee[];
  onSubmitRequest: (request: Partial<LeaveRequest>) => void;
  onBackClick: () => void;
}

export default function NewRequestView({
  employees,
  onSubmitRequest,
  onBackClick,
}: NewRequestViewProps) {
  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || "");
  const [selectedType, setSelectedType] = useState<NovedadType>(NovedadType.PARTICULAR);
  const [startDate, setStartDate] = useState("2025-10-20");
  const [endDate, setEndDate] = useState("2025-10-22");
  const [observations, setObservations] = useState("");

  // File drag & drop simulator states
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeSelected = employees.find((emp) => emp.id === selectedEmployeeId);
    if (!employeeSelected) {
      alert("Seleccione un empleado válido.");
      return;
    }

    // Calculate days count
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;

    const requestRecord: Partial<LeaveRequest> = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: employeeSelected.id,
      employeeName: `${employeeSelected.firstName} ${employeeSelected.lastName}`,
      department: employeeSelected.department,
      type: selectedType,
      startDate,
      endDate,
      days: daysCount,
      state: RequestState.PENDIENTE,
      observations,
      attachedFile: uploadedFileName || undefined,
      submissionDate: "2025-10-10",
    };

    onSubmitRequest(requestRecord);
    alert(
      `Solicitud de ${requestRecord.type} cargada exitosamente para ${requestRecord.employeeName}.\nTendrá un conteo de ${daysCount} días corridos.`
    );
    onBackClick(); // Redirect to dashboard
  };

  // Novedades available options with descriptive icon labels
  const noveltyTypesData = [
    { type: NovedadType.PARTICULAR, label: "Particular", desc: "Trámites, mudanzas, eventos personales." },
    { type: NovedadType.ESTUDIO, label: "Licencia de Estudio", desc: "Exámenes universitarios o terciarios oficiales." },
    { type: NovedadType.COMPENSATORIO, label: "Compensatorio", desc: "Devolución de francos u horas extra trabajadas." },
    { type: NovedadType.MEDICA, label: "Licencia Médica", desc: "Enfermedades transitorias o rehabilitación." },
    { type: NovedadType.OTROS, label: "Otros Motivos", desc: "Cualquier otra causa de fuerza mayor." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 text-left"
    >
      {/* Back to dashboard */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackClick}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-light transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Consola / Registrar Nueva Ausencia
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Nueva Solicitud de Ausencia
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Registre o emita licencias programadas o de improvisto en el legajo de su equipo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Core Form Element */}
        <div className="col-span-12 lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Input Selection: Employee */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Empleado Solicitante *
              </label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-brand focus:outline-none appearance-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-100">
                      {emp.lastName}, {emp.firstName} — Legajo #{emp.id} ({emp.department})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Grid selection Card of custom license types */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tipo de Novedad de Ausencia *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {noveltyTypesData.map((opt) => (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-all ${
                      selectedType === opt.type
                       ? "border-brand bg-brand/5 ring-1 ring-brand"
                       : "border-slate-800 bg-slate-950 hover:border-slate-705 hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{opt.label}</span>
                      {selectedType === opt.type && (
                         <div className="w-4 h-4 bg-brand text-white rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fecha Desde *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-brand focus:outline-none"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                   Fecha Hasta *
                 </label>
                 <div className="relative">
                   <input
                     type="date"
                     required
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-brand focus:outline-none"
                   />
                 </div>
                </div>
              </div>

              {/* Drag and Drop Zone file upload */}
              <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Adjuntar Comprobante (Certificados, constancias u orden de citación)
              </label>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center select-none transition-colors relative ${
                  isDragActive
                    ? "border-brand bg-brand/5"
                    : "border-slate-800 hover:border-brand bg-slate-950"
                }`}
              >
                <input
                  type="file"
                  id="request-file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-100">
                    Arraste y suelta tu archivo o{" "}
                    <label
                      htmlFor="request-file-input"
                       className="text-brand-light hover:underline cursor-pointer font-bold inline"
                    >
                      haz clic aquí para explorar en tu equipo
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Soporta: PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>

                {uploadedFileName && (
                  <div className="mt-4 p-2 bg-emerald-550 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between max-w-sm mx-auto">
                    <span className="text-[10px] text-emerald-400 font-mono truncate mr-2 block">
                      📎 {uploadedFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName(null)}
                      className="text-xs text-rose-400 hover:font-bold cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Observations text area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Observaciones y Justificación Adicional
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Detalle el motivo específico de su solicitud aquí..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-brand focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            {/* Sticky Actions form buttons */}
            <div className="flex gap-3 pt-5 border-t border-slate-800 flex-row">
              <button
                type="button"
                onClick={onBackClick}
                className="flex-1 bg-transparent border border-slate-800 hover:bg-slate-800 rounded-xl py-2.5 text-xs font-semibold text-slate-400 text-center transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                 className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-xl py-2.5 text-xs font-semibold text-center transition-opacity cursor-pointer shadow-[0_0_15px_rgba(214,0,0,0.2)]"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        </div>

        {/* Form Quick advice info sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl space-y-2">
            <h4 className="text-amber-400 font-bold text-xs flex items-center gap-1.5 leading-none">
              <AlertTriangle className="w-3.5 h-3.5" />
              Verificación de Superposición Obligatoria
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal antialiased">
              El sistema contrastará automáticamente las fechas con las licencias vigentes del mismo departamento para alertar conflictos.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl space-y-3">
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5 leading-none">
               <Info className="w-3.5 h-3.5 text-brand-light" />
               Políticas del Sistema
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-350 list-disc list-inside text-slate-300">
              <li>El certificado médico debe cargarse en un lapso no mayor a 48 hs de iniciada la solicitud.</li>
              <li>Las solicitudes de estudio deben contar con materias registradas en CONEAU o entes oficiales.</li>
            </ul>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
