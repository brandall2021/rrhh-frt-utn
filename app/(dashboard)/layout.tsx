"use client";

import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PATH_TO_VIEW: Record<string, string> = {
  "/": "dashboard",
  "/personal": "personal",
  "/requests": "requests",
  "/reports": "reports",
  "/settings": "settings",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/",
  personal: "/personal",
  requests: "/requests",
  reports: "/reports",
  settings: "/settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentView = PATH_TO_VIEW[pathname] ?? "dashboard";

  const handleViewChange = (view: string) => {
    router.push(VIEW_TO_PATH[view] ?? "/");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans select-none antialiased text-[#f1f5f9]">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        searchTerm=""
        onSearchChange={() => {}}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewRequestClick={() => router.push("/requests/new")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
