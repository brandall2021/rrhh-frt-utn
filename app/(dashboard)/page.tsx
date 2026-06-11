"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import type { LeaveRequest, Conflict } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, confRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/conflicts"),
      ]);

      const reqData = await reqRes.json();
      const confData = await confRes.json();

      setRequests(reqData.data ?? []);
      setConflicts(confData.data ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRequests([]);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (id: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "APROBADO" }),
      });
      await fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "RECHAZADO" }),
      });
      await fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
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
