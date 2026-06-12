"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ClipboardCheck,
  Users,
  FileBarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNewRequestClick: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onNewRequestClick,
}: SidebarProps) {
  return (
    <aside className="w-64 h-[calc(100vh-3.5rem)] bg-[#020617]/50 border-r border-slate-900 flex flex-col py-5 shrink-0 select-none text-slate-200">
      {/* Admin Panel Profile */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-500/20">
            HR
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-100 leading-tight">
              Gestión Operativa
            </p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              Administrador
            </p>
          </div>
        </div>

        {/* Global Action Button */}
        <button
          onClick={onNewRequestClick}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-400/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Novedad
        </button>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <button
          onClick={() => onViewChange("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "dashboard"
              ? "bg-indigo-600 text-white border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
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
              ? "bg-indigo-600 text-white border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Lista de Personal</span>
        </button>

        <button
          onClick={() => onViewChange("reports")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "reports"
              ? "bg-indigo-600 text-white border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <FileBarChart2 className="w-4 h-4" />
          <span>Reportes & Estadísticas</span>
        </button>

        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "settings"
              ? "bg-indigo-600 text-white border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>
      </nav>

      {/* Footer Support/Operations */}
      <div className="px-3 pt-4 border-t border-slate-900 space-y-1">
        <button
          onClick={() => alert("Soporte Técnico de Precision HR - Central de Ayuda activa.")}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-900/50 text-slate-400 hover:text-indigo-400 rounded-xl text-xs font-medium transition-all cursor-pointer"
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
    </aside>
  );
}
