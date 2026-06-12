"use client";

import { useState, useEffect, useCallback } from "react";
import SettingsView from "@/components/SettingsView";
import type { Department, AbsenceType } from "@/types";

export default function SettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [deptRes, typesRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/absence-types"),
      ]);
      const { data: deptData } = await deptRes.json();
      setDepartments(deptData ?? []);
      if (typesRes.ok) {
        const { data: typesData } = await typesRes.json();
        setAbsenceTypes(typesData ?? []);
      }
    } catch (err) {
      console.error("Error fetching settings data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (name: string) => {
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    await fetchData();
  };

  const handleUpdate = async (id: string, name: string) => {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    await fetchData();
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error);
      return;
    }
    await fetchData();
  };

  const handleSaveAbsenceTypes = async (types: AbsenceType[]) => {
    const res = await fetch("/api/absence-types", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ types }),
    });
    if (!res.ok) throw new Error("Error al guardar tipos de ausencia");
    setAbsenceTypes(types);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <SettingsView
      departments={departments}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onToggleActive={handleToggleActive}
      absenceTypes={absenceTypes}
      onSaveAbsenceTypes={handleSaveAbsenceTypes}
    />
  );
}
