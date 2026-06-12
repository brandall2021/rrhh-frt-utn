"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import EmployeeProfileView from "@/components/EmployeeProfileView";
import type { Employee, LeaveRequest, Department } from "@/types";

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [empRes, leavesRes, deptRes] = await Promise.all([
        fetch(`/api/employees/${params.id}`),
        fetch("/api/requests"),
        fetch("/api/departments?active=true"),
      ]);
      const { data: empData } = await empRes.json();
      const { data: leavesData } = await leavesRes.json();
      const { data: deptData } = await deptRes.json();
      setEmployee(empData);
      setAllLeaveRequests(leavesData ?? []);
      setDepartments(deptData ?? []);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEmployeeUpdate = async (data: Partial<Employee>) => {
    const res = await fetch(`/api/employees/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Error al guardar");
    }
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Empleado no encontrado.
      </div>
    );
  }

  return (
    <EmployeeProfileView
      employee={employee}
      onBackClick={() => router.push("/personal")}
      allLeaveRequests={allLeaveRequests}
      departments={departments}
      onEmployeeUpdate={handleEmployeeUpdate}
    />
  );
}
