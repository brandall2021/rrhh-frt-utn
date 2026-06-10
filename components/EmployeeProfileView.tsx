"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  UploadCloud,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Briefcase,
  Phone,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  History,
  Info,
} from "lucide-react";
import {
  Employee,
  DocumentRecord,
  PaySlip,
  VersionHistoryRecord,
  LeaveRequest,
  RequestState,
} from "@/types";

import { getNovedadBadgeStyles } from "./DashboardView";

// NOTE: employeeDocuments, paySlipsData, versionHistoryData were previously imported
// from src/data.ts (Vite). In Next.js these will come from API routes (Tasks 7-9).
// Using empty defaults here as stubs until API layer is wired in.
const employeeDocuments: Record<string, DocumentRecord[]> = {};
const paySlipsData: Record<string, PaySlip[]> = {};
const versionHistoryData: Record<string, VersionHistoryRecord[]> = {};

interface EmployeeProfileViewProps {
  employee: Employee;
  onBackClick: () => void;
  allLeaveRequests: LeaveRequest[];
}

export default function EmployeeProfileView({
  employee,
  onBackClick,
  allLeaveRequests,
}: EmployeeProfileViewProps) {
  // Tabs: "personal" | "contacto" | "laboral" | "documentos"
  const [activeTab, setActiveTab] = useState<"personal" | "contacto" | "laboral" | "documentos">(
    "documentos"
  );

  // States
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    employeeDocuments[employee.id] || []
  );
  const [paySlips, setPaySlips] = useState<PaySlip[]>(paySlipsData[employee.id] || []);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryRecord[]>(
    versionHistoryData[employee.id] || []
  );

  // Document action uploading
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sign state simulation
  const [selectedPaySlipToSign, setSelectedPaySlipToSign] = useState<PaySlip | null>(null);
  const [signingPin, setSigningPin] = useState("");
  const [isSigningInProcess, setIsSigningInProcess] = useState(false);

  // Filter employee leaves from global state
  const employeeLeaves = allLeaveRequests.filter((r) => r.employeeId === employee.id);

  // Document categories summary
  const totalFiles = documents.length;
  const vigentes = documents.filter((d) => d.status === "VIGENTE").length;
  const expiradosorVencer = documents.filter(
    (d) => d.status === "POR VENCER" || d.status === "EXPIRADO"
  ).length;
  const rechazados = documents.filter((d) => d.status === "RECHAZADO").length;

  const handleDownloadFullZip = () => {
    alert("Compilando legajo digital en un archivo comprimido .ZIP...\n\nContiene:\n- Información laboral de " + employee.firstName + " " + employee.lastName + "\n- 14 archivos firmados adjuntos\n- Últimos 3 recibos de sueldo verificados.");
  };

  const handleSimulatedFileUpload = (category: DocumentRecord["category"]) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: DocumentRecord = {
              id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
              name: `Documento de ${category} Adicional`,
              fileName: `Subido_${category.toLowerCase()}_${Date.now().toString().slice(-4)}.pdf`,
              category,
              status: "VIGENTE",
              updatedDate: "Hoy mismo",
            };

            setDocuments((prev) => [newDoc, ...prev]);
            setVersionHistory((prev) => [
              {
                id: `VH-${Date.now()}`,
                title: `Subida de documento: ${newDoc.name}`,
                detail: `Cargado por ${employee.firstName} ${employee.lastName}`,
                date: "Hoy",
              },
              ...prev,
            ]);

            setIsUploading(false);
            setUploadProgress(0);
            alert("Documento subido y validado exitosamente en Legajo.");
          }, 350);
          return 100;
        }
        return p + 20;
      });
    }, 100);
  };

  const handleSignPaySlip = (ps: PaySlip) => {
    if (ps.signed) return;
    setSelectedPaySlipToSign(ps);
  };

  const submitSignPaySlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (signingPin.length < 4) {
      alert("Ingrese un PIN válido de 4 dígitos.");
      return;
    }

    setIsSigningInProcess(true);
    setTimeout(() => {
      setPaySlips((prev) =>
        prev.map((p) => (p.id === selectedPaySlipToSign?.id ? { ...p, signed: true } : p))
      );
      setVersionHistory((prev) => [
        {
          id: `VH-${Date.now()}`,
          title: `Firma Digital de Recibo - Período ${selectedPaySlipToSign?.period}`,
          detail: "Firmado con token criptográfico por " + employee.firstName + " " + employee.lastName,
          date: "Hoy",
        },
        ...prev,
      ]);
      setIsSigningInProcess(false);
      setSelectedPaySlipToSign(null);
      setSigningPin("");
      alert("Recibo firmado digitalmente con éxito.");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back Header Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackClick}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Legajo Digital / Ficha de Empleado
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-slate-800 text-slate-200 border border-slate-705 rounded-2xl flex items-center justify-center font-bold text-lg select-none">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold text-white leading-none">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded border ${
                    employee.status === "ACTIVO"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {employee.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {employee.role} • <strong className="text-indigo-400">{employee.department}</strong>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-tight">
                Legajo: #{employee.id} | CUIL: {employee.cuil}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 w-full md:w-auto self-stretch md:self-center">
            <button
              onClick={() => handleSimulatedFileUpload("Contractual")}
              className="flex-1 md:flex-initial bg-slate-950 border border-slate-800 text-indigo-400 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Subir Documento
            </button>
            <button
              onClick={handleDownloadFullZip}
              className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-505 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Legajo completo
            </button>
          </div>
        </div>

        {/* Statistical progress row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-850 select-none text-left">
          <div className="border-r border-slate-850 pr-2">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total de Archivos</p>
            <p className="text-xl font-extrabold text-slate-200 mt-0.5 mt-1">{totalFiles}</p>
          </div>
          <div className="border-r border-slate-850 pr-2">
            <p className="text-[10px] uppercase font-bold text-emerald-400">Documentos Vigentes</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5 mt-1">{vigentes}</p>
          </div>
          <div className="border-r border-slate-850 pr-2">
            <p className="text-[10px] uppercase font-bold text-amber-400">Por Vencer / Vencidos</p>
            <p className="text-xl font-extrabold text-amber-400 mt-0.5 mt-1">{expiradosorVencer}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-rose-450 text-rose-400">Rechazados</p>
            <p className="text-xl font-extrabold text-rose-400 mt-0.5 mt-1">{rechazados}</p>
          </div>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="border-b border-slate-805 border-slate-800 flex overflow-x-auto space-x-1.5 scrollbar-thin select-none">
        <button
          onClick={() => setActiveTab("documentos")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-4 py-2 ${
            activeTab === "documentos"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Expediente & Documentos
        </button>

        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-4 py-2 ${
            activeTab === "personal"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Información Personal
        </button>

        <button
          onClick={() => setActiveTab("contacto")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-4 py-2 ${
            activeTab === "contacto"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Contacto Emergencia
        </button>

        <button
          onClick={() => setActiveTab("laboral")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-4 py-2 ${
            activeTab === "laboral"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Datos Laborales
        </button>
      </div>

      {/* Main Tab Panels Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            {/* DOCUMENTS TAB */}
            {activeTab === "documentos" && (
              <motion.div
                key="documentos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Simulated upload progress loader bar */}
                {isUploading && (
                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-xs text-left animate-pulse">
                    <p className="font-semibold text-indigo-400">Subiendo y encriptando archivo...</p>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Documents Table Checklist Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-transparent flex-row">
                    <h3 className="text-xs font-bold text-white">Historial y Carpetas del Legajo</h3>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      Fuerza de ley / Oficial
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                          <th className="px-4 py-2.5">Documento</th>
                          <th className="px-4 py-2.5">Categoría</th>
                          <th className="px-4 py-2.5">Última Modif.</th>
                          <th className="px-4 py-2.5">Estado</th>
                          <th className="px-4 py-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-850/40 transition-colors text-xs text-left text-slate-200">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5 text-left">
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                <div>
                                  <p className="font-bold text-slate-200">{doc.name}</p>
                                  <p className="text-[10px] text-slate-550 text-slate-500 font-mono mt-0.5">
                                    {doc.fileName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 leading-none">{doc.category}</td>
                            <td className="px-4 py-3.5 leading-none font-mono text-[11px] text-slate-455 text-slate-400">
                              {doc.updatedDate}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  doc.status === "VIGENTE"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                    : doc.status === "POR VENCER"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                    : "bg-rose-500/10 text-rose-455 text-rose-450 text-rose-400 border border-rose-400/25"
                                }`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => alert(`Previsualizando archivo: ${doc.fileName}`)}
                                  className="text-[10px] font-bold text-indigo-400 hover:underline px-2 py-1 hover:bg-slate-800 rounded cursor-pointer"
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => alert(`Descargando copia local de ${doc.fileName}...`)}
                                  className="text-[10px] font-bold text-slate-300 hover:underline px-2 py-1 hover:bg-slate-800 rounded cursor-pointer"
                                >
                                  Descargar
                                </button>
                                {doc.status === "RECHAZADO" && (
                                  <button
                                    onClick={() => handleSimulatedFileUpload(doc.category)}
                                    className="text-[10px] font-bold text-rose-400 hover:underline px-2 py-1 hover:bg-rose-950/20 rounded cursor-pointer animate-pulse"
                                  >
                                    Re-subir
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recibos de Sueldo / Signed pay slips Carousel Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-sm text-left">
                  <div className="flex justify-between items-center border-b border-slate-820 border-slate-800 pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-xs text-white tracking-wide">
                        Recibos de Sueldo Digitales
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Firma criptográfica conforme ley 25.506.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {paySlips.map((ps) => (
                      <div
                        key={ps.id}
                        className="p-3.5 border border-slate-800 bg-slate-950/50 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-slate-700/60 transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-200">
                              {ps.period}
                            </span>
                            {ps.signed ? (
                              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                                Firmado
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase animate-pulse">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                            Generado: {ps.generatedDate}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                          <button
                            onClick={() => alert(`Previsualizando planilla de haberes de ${ps.period}...`)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white hover:underline cursor-pointer"
                          >
                            Ver Recibo
                          </button>
                          {ps.signed ? (
                            <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              Firmado Crypt
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSignPaySlip(ps)}
                              className="bg-indigo-600 hover:bg-indigo-505 shadow-[0_4px_10px_rgba(99,102,241,0.25)] text-white text-[10px] font-bold py-1 px-3 rounded cursor-pointer transition-colors"
                            >
                              Firmar Digital
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PERSONAL DETAILS PANEL */}
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 font-sans text-xs"
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre Completo
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.firstName} {employee.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    CUIL / CUIT
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">
                    {employee.cuil}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.birthDate}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Estado Civil
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.maritalStatus}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Domicilio Fiscal / Real
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.address}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Personal
                  </p>
                  <p className="text-sm font-semibold text-indigo-400 mt-0.5 hover:underline cursor-pointer">
                    {employee.email}
                  </p>
                </div>
              </motion.div>
            )}

            {/* CONTACT TAB */}
            {activeTab === "contacto" && (
              <motion.div
                key="contacto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-5 text-xs"
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre del Contacto
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Parentesco / Relación
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Teléfono de Urgencia
                  </p>
                  <p className="text-sm font-semibold text-indigo-400 font-mono mt-0.5">
                    {employee.emergencyContact.phone}
                  </p>
                </div>
              </motion.div>
            )}

            {/* LABORAL DETAILS PANEL */}
            {activeTab === "laboral" && (
              <motion.div
                key="laboral"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs"
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Puesto Actual
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.role}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Área Operativa
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.department}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fecha de Contratación
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {employee.hireDate}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Supervisor Directo
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    Andrés Martínez (IT Director)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Convenio Aplicable
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    CCT Empleados de Comercio / Fuera de Convenio
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Evaluación de Desempeño
                  </p>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                    9.2 / 10 (Excelente)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historial de Novedades del empleado (leaves table) */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between pb-3 mb-1 flex-row">
              <h3 className="font-bold text-xs text-white tracking-wide text-left">
                Historial de Solicitudes y Novedades de Asistencia
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                Asistencia
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                    <th className="px-4 py-2.5">Novedad Especial</th>
                    <th className="px-4 py-2.5">Desde</th>
                    <th className="px-4 py-2.5">Hasta</th>
                    <th className="px-4 py-2.5">Duración</th>
                    <th className="px-4 py-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {employeeLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-550 italic">
                        No se registran novedades transitorias para este legajo.
                      </td>
                    </tr>
                  ) : (
                    employeeLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-850/30 transition-colors text-xs text-left">
                        <td className="px-4 py-3 align-middle font-semibold text-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${getNovedadBadgeStyles(
                              leave.type
                            )}`}
                          >
                            {leave.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">{leave.startDate}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">{leave.endDate}</td>
                        <td className="px-4 py-3 text-slate-200">
                          {leave.days} {leave.days > 1 ? "días" : "día"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                              leave.state === RequestState.APROBADO || leave.state === RequestState.PROCESADO
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : leave.state === RequestState.RECHAZADO
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            }`}
                          >
                            {leave.state}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar panels for Document Versioning audits */}
        <aside className="col-span-12 lg:col-span-4 space-y-4 text-left">
          {/* Doc Version logs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-white tracking-wide border-b border-slate-800 pb-2 mb-3">
              Historial de Versiones Recientes
            </h3>
            <div className="space-y-4">
              {versionHistory.map((v) => (
                <div key={v.id} className="flex gap-2 text-xs leading-normal">
                  <div className="h-6 w-1 rounded-full bg-indigo-505 bg-indigo-500 mt-1 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-200 leading-snug">{v.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{v.detail}</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono">{v.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secure vault advisory */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-3xl space-y-2">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-1.5 leading-none">
              <Lock className="w-3.5 h-3.5" />
              Bóveda Digital Encriptada
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal antialiased">
              Toda la documentación está cifrada en reposo con AES-256 e integrada al sistema de firma digital.
            </p>
          </div>
        </aside>
      </div>

      {/* Recibo Signing Modal Simulation screen */}
      {selectedPaySlipToSign && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl shadow-3xl border border-slate-800 max-w-sm w-full p-6 text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Firmar Recibo - {selectedPaySlipToSign.period}
              </h3>
              <button
                onClick={() => setSelectedPaySlipToSign(null)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Está a punto de firmar digitalmente su recibo de haberes correspondiente a{" "}
              <strong>{selectedPaySlipToSign.period}</strong>. Esto equivale a una firma hológrafa.
            </p>

            <form onSubmit={submitSignPaySlip} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ingrese su clave/PIN de firma (4 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={signingPin}
                  onChange={(e) => setSigningPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.5em] bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2 flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedPaySlipToSign(null)}
                  className="flex-1 bg-transparent border border-slate-800 hover:bg-slate-800 rounded-xl py-2 text-xs font-semibold text-slate-400 cursor-pointer hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSigningInProcess}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  {isSigningInProcess ? "Firmando..." : "Confirmar Firma"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
