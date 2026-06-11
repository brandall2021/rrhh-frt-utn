"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import type { LeaveRequest, Conflict } from "@/types";

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [reqRes, confRes] = await Promise.all([
      fetch("/api/requests"),
      fetch("/api/conflicts"),
    ]);
    const { data: reqData } = await reqRes.json();
    const { data: confData } = await confRes.json();
    setRequests(reqData ?? []);
    setConflicts(confData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "APROBADO" }),
    });
    await fetchData();
  };

  const handleRejectRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "RECHAZADO" }),
    });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <DashboardView
      requests={requests}
      conflicts={conflicts}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onNewRequestClick={() => router.push("/requests/new")}
      onEmployeeClick={(id) => router.push(`/personal/${id}`)}
    />
  );
}
