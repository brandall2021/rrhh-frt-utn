"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Bell, Settings, ClipboardCheck, Users, FileBarChart2, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleSidebar?: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  searchTerm,
  onSearchChange,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="h-14 w-full bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border)] flex justify-between items-center px-3 md:px-5 sticky top-0 z-50 select-none">
      {/* Brand Logo and Title */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-light font-bold text-xs cursor-pointer" onClick={() => onViewChange("dashboard")}>
          F
        </div>

        {/* Global Toolbar Horizontal Navigation */}
        <nav className="hidden md:flex gap-1.5 items-center h-full">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`font-semibold text-xs tracking-wide px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === "dashboard"
                ? "bg-brand/10 text-brand-light border border-brand/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onViewChange("personal")}
            className={`font-semibold text-xs tracking-wide px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === "personal"
                ? "bg-brand/10 text-brand-light border border-brand/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personal</span>
          </button>

          <button
            onClick={() => onViewChange("reports")}
            className={`font-semibold text-xs tracking-wide px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === "reports"
                ? "bg-brand/10 text-brand-light border border-brand/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <FileBarChart2 className="w-3.5 h-3.5" />
            <span>Reportes</span>
          </button>
        </nav>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Dynamic Search Bar (Only shown on desktop list / dashboard) */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs w-52 md:w-64 focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent transition-all text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggleButton />

        {/* Action Widgets */}
        <button
          onClick={() => alert("Central de novedades: No hay alertas pendientes.")}
          className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-light transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
        </button>

        <button
          onClick={() => alert("Configuraciones del panel de recursos humanos.")}
          className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-light transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Admin Profiler Avatar Card */}
        <div className="flex items-center gap-2 border-l pl-3 border-slate-800">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 bg-slate-800">
            <img
              alt="Manager Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADG35IElFckjFxTmNS_Y921bAr_p7Rzn-VYzdMrtx08ImN51v0u3M0I7iNWDggr7F_i4yN20COjwiQxnLNPwh3MagRzr5C7AzFFQJQm96Z-GSKtxZt1SHrLQYsUFhF438Gq_xZ7HahceIpdY4iz8zKbj0pYC7CqHS9Pbe8EyS7oPVuiQV5RLB155POZ31iigkF7e9oXsbpWbRXF9PHn7gzyJgR8FGRKJPKbmW8rt0hFYpXieba8z2qNZ-rdC82eppRm6ps5zIJrqg"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden lg:block text-left select-none">
            <p className="text-xs font-semibold leading-none text-slate-200">
              Luis Batallan
            </p>
            <p className="text-[10px] text-brand-light mt-0.5 leading-none font-semibold">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-light transition-colors cursor-pointer"
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
