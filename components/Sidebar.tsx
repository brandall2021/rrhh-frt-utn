"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  FileBarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  X,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Umbrella,
  AlertTriangle,
  BarChart3,
  Calendar,
  UserCog,
  Shield,
  UserSquare2,
  Sliders,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNewRequestClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const PERSONAL_SUB_ITEMS = [
  { id: "personal", label: "Lista de personal", path: "/personal", icon: Users },
  { id: "personal-ficha", label: "Ficha del empleado", path: "/personal/:id", icon: UserSquare2 },
];

const AUSENCIAS_SUB_ITEMS = [
  { id: "dashboard", label: "Consola", path: "/", icon: ClipboardCheck },
  { id: "solicitudes", label: "Solicitudes", path: "/solicitudes", icon: FileText },
  { id: "vacaciones", label: "Vacaciones", path: "/vacaciones", icon: Umbrella },
  { id: "conflictos", label: "Conflictos", path: "/conflictos", icon: AlertTriangle },
];

const REPORTES_SUB_ITEMS = [
  { id: "reports", label: "Personal", path: "/reports", icon: Users },
  { id: "reports-diario", label: "Ausencias", path: "/reports/diario", icon: Calendar },
  { id: "reports-estadisticas", label: "Estadísticas", path: "/reports/estadisticas", icon: BarChart3 },
];

const ADMIN_SUB_ITEMS = [
  { id: "settings-usuarios", label: "Usuarios", path: "/settings/usuarios", icon: UserCog },
  { id: "settings-roles", label: "Roles", path: "/settings/roles", icon: Shield },
  { id: "settings", label: "Parámetros", path: "/settings", icon: Sliders },
  { id: "auditoria", label: "Auditoría", path: "/auditoria", icon: Shield },
];

export default function Sidebar({
  currentView,
  onViewChange,
  onNewRequestClick,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: currentView.startsWith("personal"),
    ausencias: currentView.startsWith("dashboard") || currentView === "solicitudes" || currentView === "vacaciones" || currentView === "conflictos",
    reportes: currentView.startsWith("reports"),
    admin: currentView.startsWith("settings") || currentView === "auditoria" || currentView === "settings-usuarios" || currentView === "settings-roles",
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderNavItem = (item: { id: string; label: string; path: string; icon: any }, depth = 0) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          onViewChange(item.id);
          if (item.id === "personal-ficha") {
            // Navigate to first employee or show a prompt
            onViewChange("personal");
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
          isActive
            ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
            : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderSubItems = (items: typeof AUSENCIAS_SUB_ITEMS, sectionKey: string) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[11px] font-medium tracking-wide transition-all cursor-pointer border ${
              isActive
                ? "bg-brand/20 text-white border-brand/20 font-semibold"
                : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderSection = (
    title: string,
    icon: any,
    sectionKey: string,
    items: typeof AUSENCIAS_SUB_ITEMS,
  ) => {
    const Icon = icon;
    const isActive = items.some((i) => currentView === i.id);

    return (
      <div className="space-y-0.5">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            isActive
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 shrink-0" />
            <span>{title}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              expandedSections[sectionKey] ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>

        {expandedSections[sectionKey] && (
          <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
            {renderSubItems(items, sectionKey)}
          </div>
        )}
      </div>
    );
  };

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
          Registrar Ausencia Programada
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {/* 🏠 Dashboard */}
        <button
          onClick={() => onViewChange("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
            currentView === "dashboard"
              ? "bg-brand text-white border-brand/30 font-bold shadow-[0_0_10px_rgba(214, 0, 0,0.2)]"
              : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* 👥 Personal */}
        {renderSection("Personal", Users, "personal", PERSONAL_SUB_ITEMS)}

        {/* 📅 Gestión de Ausencias */}
        {renderSection("Gestión de Ausencias", CalendarRange, "ausencias", AUSENCIAS_SUB_ITEMS)}

        {/* 📊 Reportes */}
        {renderSection("Reportes", FileBarChart2, "reportes", REPORTES_SUB_ITEMS)}

        {/* ⚙️ Administración */}
        {renderSection("Administración", Settings, "admin", ADMIN_SUB_ITEMS)}
      </nav>

      <div className="px-3 pt-4 border-t border-slate-900 space-y-1">
        <button
          onClick={() => window.open('mailto:soporte@face.unt.edu.ar', '_blank')}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-900/50 text-slate-400 hover:text-brand-light rounded-xl text-xs font-medium transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ayuda</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
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
      <aside
        className={`md:hidden fixed top-14 left-0 bottom-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border)] flex flex-col py-5 z-40 select-none text-[var(--text-secondary)] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <aside className="hidden md:flex w-64 h-[calc(100vh-3.5rem)] bg-[var(--bg-primary)]/50 border-r border-[var(--border)] flex-col py-5 shrink-0 select-none text-[var(--text-secondary)]">
        {sidebarContent}
      </aside>
    </>
  );
}
