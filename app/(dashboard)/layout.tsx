"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PATH_TO_VIEW: Record<string, string> = {
  "/": "dashboard",
  "/personal": "personal",
  "/solicitudes": "solicitudes",
  "/solicitudes/nueva": "solicitudes-nueva",
  "/vacaciones": "vacaciones",
  "/conflictos": "conflictos",
  "/requests": "requests",
  "/requests/new": "requests-new",
  "/reports": "reports",
  "/reports/diario": "reports-diario",
  "/reports/estadisticas": "reports-estadisticas",
  "/reports/calendario": "reports-calendario",
  "/birthdays": "birthdays",
  "/settings": "settings",
  "/settings/usuarios": "settings-usuarios",
  "/settings/roles": "settings-roles",
  "/configuracion/plantillas": "plantillas",
  "/configuracion/plantillas/nueva": "plantillas-nueva",
  "/auditoria": "auditoria",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/",
  personal: "/personal",
  "personal-ficha": "/personal",
  solicitudes: "/solicitudes",
  "solicitudes-nueva": "/solicitudes/nueva",
  vacaciones: "/vacaciones",
  conflictos: "/conflictos",
  requests: "/requests",
  "requests-new": "/requests/new",
  reports: "/reports",
  "reports-diario": "/reports/diario",
  "reports-estadisticas": "/reports/estadisticas",
  "reports-calendario": "/reports/calendario",
  birthdays: "/birthdays",
  settings: "/settings",
  "settings-usuarios": "/settings/usuarios",
  "settings-roles": "/settings/roles",
  plantillas: "/configuracion/plantillas",
  "plantillas-nueva": "/configuracion/plantillas/nueva",
  auditoria: "/auditoria",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentView = PATH_TO_VIEW[pathname] ?? (
    pathname.startsWith("/configuracion/plantillas/") ? "plantillas"
    : pathname.startsWith("/personal/") ? "personal"
    : "dashboard"
  );

  const handleViewChange = (view: string) => {
    const path = VIEW_TO_PATH[view] ?? "/";
    router.push(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans antialiased text-[var(--text-primary)]">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        searchTerm={searchTerm}
        onSearchChange={(t: string) => setSearchTerm(t)}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewRequestClick={() => {
            router.push("/requests/new");
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 min-w-0">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
