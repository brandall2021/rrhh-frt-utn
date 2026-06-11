"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeProfileView from "@/components/EmployeeProfileView";
import type { Employee, LeaveRequest } from "@/types";

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, leavesRes] = await Promise.all([
          fetch(`/api/employees/${params.id}`),
          fetch("/api/leave-requests"),
        ]);

        const { data: empData } = await empRes.json();
        const { data: leavesData } = await leavesRes.json();

        setEmployee(empData);
        setAllLeaveRequests(leavesData ?? []);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

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
    />
  );
}
