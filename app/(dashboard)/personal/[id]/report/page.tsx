"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import EmployeeReportView from "@/components/EmployeeReportView";
import type { Employee, AbsenceType, Absence } from "@/types";

export default function EmployeeReportPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const absencesRef = useRef(absences);
  absencesRef.current = absences;
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [empRes, absencesRes, typesRes] = await Promise.all([
        fetch(`/api/employees/${params.id}`),
        fetch(`/api/employees/${params.id}/absences`),
        fetch("/api/absence-types"),
      ]);

      if (!empRes.ok) {
        setEmployee(null);
        setLoading(false);
        return;
      }

      const { data: empData } = await empRes.json();
      setEmployee(empData);

      if (absencesRes.ok) {
        const { data: absencesData } = await absencesRes.json();
        setAbsences(absencesData ?? []);
      }

      if (typesRes.ok) {
        const { data: typesData } = await typesRes.json();
        setAbsenceTypes(typesData ?? []);
      }
    } catch (error) {
      console.error("Error fetching employee report data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const syncAbsences: React.Dispatch<React.SetStateAction<Absence[]>> = useCallback((value) => {
    const updated = typeof value === "function" ? value(absencesRef.current) : value;
    setAbsences(updated);
    absencesRef.current = updated;
    fetch(`/api/employees/${params.id}/absences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ absences: updated }),
    }).catch((error) => console.error("Error syncing absences:", error));
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    <EmployeeReportView
      onBack={() => router.push(`/personal/${params.id}`)}
      selectedEmployee={employee}
      absenceTypes={absenceTypes}
      absences={absences}
      setAbsences={syncAbsences}
    />
  );
}
