"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PersonalListView from "@/components/PersonalListView";
import type { Employee } from "@/types";

export default function PersonalPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      const { data } = await res.json();
      setEmployees(data ?? []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (newEmp: Partial<Employee>) => {
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmp),
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
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
    <PersonalListView
      employees={employees}
      onEmployeeClick={(id) => router.push(`/personal/${id}`)}
      onAddEmployee={handleAddEmployee}
      searchTerm={searchTerm}
    />
  );
}
