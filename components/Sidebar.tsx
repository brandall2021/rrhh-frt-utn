"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  Users,
  FileBarChart2,
  Settings,
  Gift,
  HelpCircle,
  LogOut,
  Plus,
  X,
  ChevronDown,
  BarChart3,
  Calendar,
  Clock,
  Mail,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNewRequestClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const REPORT_SUB_ITEMS = [
  { id: "reports", label: "Resumen", path: "/reports" },
  { id: "reports-diario", label: "Reporte Diario", path: "/reports/diario" },
  { id: "reports-estadisticas", label: "Estadísticas", path: "/reports/estadisticas" },
  { id: "reports-calendario", label: "Calendario", path: "/reports/calendario" },
];

export default function Sidebar({
  currentView,
  onViewChange,
  onNewRequestClick,
  isOpen,
  onClose,
}: SidebarProps) {
  const [reportsExpanded, setReportsExpanded] = useState(
    currentView.startsWith("reports")
  );

  const isReportsActive = currentView.startsWith("reports");

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 mb-4 md:hidden">
        <span className="text-sm font-bold text-white">Menú</span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-light font-bold text-xs">
            F
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-100 leading-tight">
              Gestión Operativa
            </p>
            <p className="text-[10px] text-brand-light font-bold uppercase tracking-wider">
              Administrador
            </p>
          </div>
        </div>

        <button
          onClick={onNewRequestClick}
          className="w-full mt-5 bg-brand hover:bg-brand-hover text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(214, 0, 0,0.3)] border border-brand-light/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Novedad
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <button
          onClick={() => onViewChange("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "dashboard"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Consola de Ausencias</span>
        </button>

        <button
          onClick={() => onViewChange("personal")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "personal"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Lista de Personal</span>
        </button>

        <div className="space-y-0.5">
          <button
            onClick={() => {
              setReportsExpanded(!reportsExpanded);
              if (!reportsExpanded) onViewChange("reports");
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
              isReportsActive
                ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
                : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileBarChart2 className="w-4 h-4" />
              <span>Reportes & Estadísticas</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                reportsExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>

          {reportsExpanded && (
            <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
              {REPORT_SUB_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium tracking-wide transition-all cursor-pointer border ${
                    currentView === item.id
                      ? "bg-brand/20 text-white border-brand/20 font-semibold"
                      : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
                  }`}
                >
                  {item.label === "Estadísticas" ? (
                    <BarChart3 className="w-3.5 h-3.5" />
                  ) : item.label === "Calendario" ? (
                    <Calendar className="w-3.5 h-3.5" />
                  ) : item.label === "Reporte Diario" ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-current" />
                    </span>
                  )}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onViewChange("birthdays")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "birthdays"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Cumpleaños</span>
        </button>

        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "settings"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>

        <button
          onClick={() => onViewChange("plantillas")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "plantillas"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Plantillas de Email</span>
        </button>
      </nav>

      <div className="px-3 pt-4 border-t border-slate-900 space-y-1">
        <button
          onClick={() => alert("Soporte Técnico FACE UNT - Central de Ayuda activa.")}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-900/50 text-slate-400 hover:text-brand-light rounded-xl text-xs font-medium transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ayuda</span>
        </button>
        <button
          onClick={() => alert("Sesión finalizada. En un entorno de producción, esto redirigirá al login.")}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-medium transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile sidebar (overlay) */}
      <aside
        className={`md:hidden fixed top-14 left-0 bottom-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border)] flex flex-col py-5 z-40 select-none text-[var(--text-secondary)] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-[calc(100vh-3.5rem)] bg-[var(--bg-primary)]/50 border-r border-[var(--border)] flex-col py-5 shrink-0 select-none text-[var(--text-secondary)]">
        {sidebarContent}
      </aside>
    </>
  );
}
