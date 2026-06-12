"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Check, X, Building2 } from "lucide-react";
import type { Department } from "@/types";

interface SettingsViewProps {
  departments: Department[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}

export default function SettingsView({ departments, onCreate, onUpdate, onToggleActive }: SettingsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
      setIsModalOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Configuración</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de departamentos y catálogos</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-light" />
            <h2 className="text-xs font-bold text-white">Departamentos</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
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

      <AnimatePresence>
        {isModalOpen && (
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
                    onClick={() => { setIsModalOpen(false); setNewName(""); }}
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
    </div>
  );
}
