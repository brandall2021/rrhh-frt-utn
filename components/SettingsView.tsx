"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Check, X, Building2, CalendarX2 } from "lucide-react";
import type { Department, AbsenceType } from "@/types";

interface SettingsViewProps {
  departments: Department[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  absenceTypes: AbsenceType[];
  onSaveAbsenceTypes: (types: AbsenceType[]) => Promise<void>;
}

const COLOR_OPTIONS = [
  { value: "red", label: "Rojo", bg: "bg-red-500" },
  { value: "amber", label: "Ámbar", bg: "bg-amber-500" },
  { value: "blue", label: "Azul", bg: "bg-blue-500" },
  { value: "emerald", label: "Verde", bg: "bg-emerald-500" },
  { value: "orange", label: "Naranja", bg: "bg-orange-500" },
  { value: "purple", label: "Púrpura", bg: "bg-purple-500" },
  { value: "slate", label: "Gris", bg: "bg-slate-500" },
  { value: "pink", label: "Rosa", bg: "bg-pink-500" },
  { value: "cyan", label: "Cian", bg: "bg-cyan-500" },
  { value: "brand", label: "Institucional", bg: "bg-brand" },
];

export default function SettingsView({
  departments, onCreate, onUpdate, onToggleActive,
  absenceTypes, onSaveAbsenceTypes,
}: SettingsViewProps) {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AbsenceType | null>(null);
  const [typeForm, setTypeForm] = useState({ name: "", code: "", color: "slate" });
  const [savingTypes, setSavingTypes] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
      setIsDeptModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditingName(dept.name);
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await onUpdate(id, editingName.trim());
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openNewType = () => {
    setEditingType(null);
    setTypeForm({ name: "", code: "", color: "slate" });
    setIsTypeModalOpen(true);
  };

  const openEditType = (t: AbsenceType) => {
    setEditingType(t);
    setTypeForm({ name: t.name, code: t.code, color: t.color });
    setIsTypeModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.name.trim() || !typeForm.code.trim()) return;
    setSavingTypes(true);
    try {
      let updated: AbsenceType[];
      if (editingType) {
        updated = absenceTypes.map((t) =>
          t.id === editingType.id
            ? { ...t, name: typeForm.name.trim(), code: typeForm.code.trim(), color: typeForm.color }
            : t
        );
      } else {
        const newType: AbsenceType = {
          id: `type_${Date.now()}`,
          name: typeForm.name.trim(),
          code: typeForm.code.trim().toUpperCase(),
          color: typeForm.color,
        };
        updated = [...absenceTypes, newType];
      }
      await onSaveAbsenceTypes(updated);
      setIsTypeModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingTypes(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    const updated = absenceTypes.filter((t) => t.id !== id);
    await onSaveAbsenceTypes(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Configuración</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de departamentos y catálogos</p>
        </div>
      </div>

      {/* Departments Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-light" />
            <h2 className="text-xs font-bold text-white">Departamentos</h2>
          </div>
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                <th className="px-4 py-2.5">Nombre</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-900/30 transition-colors text-xs">
                  <td className="px-4 py-3.5">
                    {editingId === dept.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs w-48 focus:outline-none focus:border-brand"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-slate-200">{dept.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        dept.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-700/20 text-slate-500 border-slate-700/30"
                      }`}
                    >
                      {dept.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      {editingId === dept.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(dept.id)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(dept)}
                            className="p-1.5 bg-slate-800 hover:bg-brand text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleActive(dept.id, !dept.active)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              dept.active
                                ? "bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {dept.active ? "Dar de baja" : "Reactivar"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absence Types Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarX2 className="w-4 h-4 text-brand-light" />
            <h2 className="text-xs font-bold text-white">Tipos de Ausencia</h2>
          </div>
          <button
            onClick={openNewType}
            className="bg-brand hover:bg-brand-hover text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                <th className="px-4 py-2.5">Nombre</th>
                <th className="px-4 py-2.5">Código</th>
                <th className="px-4 py-2.5">Color</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {absenceTypes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/30 transition-colors text-xs">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-200">{t.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-slate-400">{t.code}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full ${COLOR_OPTIONS.find(c => c.value === t.color)?.bg || "bg-slate-500"}`} />
                      <span className="text-slate-400 text-[10px]">{COLOR_OPTIONS.find(c => c.value === t.color)?.label || t.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditType(t)}
                        className="p-1.5 bg-slate-800 hover:bg-brand text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(t.id)}
                        className="p-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded-lg cursor-pointer transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Department Modal */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4">Nuevo Departamento</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del departamento"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand placeholder-slate-500"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsDeptModalOpen(false); setNewName(""); }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-xl cursor-pointer transition-all disabled:opacity-50"
                  >
                    {creating ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New/Edit Absence Type Modal */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4">
                {editingType ? "Editar Tipo de Ausencia" : "Nuevo Tipo de Ausencia"}
              </h3>
              <form onSubmit={handleSaveType} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre</label>
                  <input
                    value={typeForm.name}
                    onChange={(e) => setTypeForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Vacaciones"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand placeholder-slate-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Código</label>
                  <input
                    value={typeForm.code}
                    onChange={(e) => setTypeForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="Ej: VAC"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand placeholder-slate-500 font-mono uppercase"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setTypeForm((p) => ({ ...p, color: c.value }))}
                        className={`w-7 h-7 rounded-full ${c.bg} ${
                          typeForm.color === c.value ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900" : "opacity-70 hover:opacity-100"
                        } transition-all cursor-pointer`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsTypeModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingTypes || !typeForm.name.trim() || !typeForm.code.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-xl cursor-pointer transition-all disabled:opacity-50"
                  >
                    {savingTypes ? "Guardando..." : editingType ? "Guardar" : "Crear"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
