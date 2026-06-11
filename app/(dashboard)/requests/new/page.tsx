"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NewRequestView from "@/components/NewRequestView";
import type { Employee, LeaveRequest } from "@/types";

export default function NewRequestPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(({ data }) => {
        setEmployees((data ?? []).filter((e: Employee) => e.status === "ACTIVO"));
        setLoading(false);
      });
  }, []);

  const handleSubmitRequest = async (newReq: Partial<LeaveRequest>) => {
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <NewRequestView
      employees={employees}
      onBackClick={() => router.back()}
      onSubmitRequest={handleSubmitRequest}
    />
  );
}
