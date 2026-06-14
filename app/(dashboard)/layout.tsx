"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PATH_TO_VIEW: Record<string, string> = {
  "/": "dashboard",
  "/personal": "personal",
  "/requests": "requests",
  "/reports": "reports",
  "/birthdays": "birthdays",
  "/settings": "settings",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/",
  personal: "/personal",
  requests: "/requests",
  reports: "/reports",
  birthdays: "/birthdays",
  settings: "/settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentView = PATH_TO_VIEW[pathname] ?? "dashboard";

  const handleViewChange = (view: string) => {
    router.push(VIEW_TO_PATH[view] ?? "/");
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans antialiased text-[var(--text-primary)]">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        searchTerm=""
        onSearchChange={() => {}}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay */}
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
