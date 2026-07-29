"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { UserCog, Shield, Plus, X, Check, ToggleLeft, ToggleRight } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "SUPERADMIN", label: "Superadmin" },
  { value: "ADMIN", label: "Admin" },
  { value: "OPERADOR", label: "Operador" },
];

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  ADMIN: "bg-brand/10 text-brand-light border-brand/30",
  OPERADOR: "bg-slate-800 text-slate-300 border-slate-700",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin-users");
      if (res.ok) {
        const { data } = await res.json();
        setUsers(data ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (u: AdminUser) => {
    const next = u.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await fetch("/api/admin-users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, status: next }),
    });
    if (res.ok) await fetchUsers();
  };

  const handleChangeRole = async (u: AdminUser, role: string) => {
    const res = await fetch("/api/admin-users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, role }),
    });
    if (res.ok) await fetchUsers();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() || undefined }),
    });
    if (res.ok) {
      setShowAdd(false);
      setNewEmail("");
      setNewName("");
      await fetchUsers();
    } else {
      const { error } = await res.json();
      alert(error ?? "Error al agregar usuario");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-brand-light" />
            Usuarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">Administración de usuarios y roles del sistema</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-brand-light/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Nombre</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Rol</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 text-xs text-slate-200">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border uppercase cursor-pointer outline-none ${ROLE_BADGE[u.role] ?? ROLE_BADGE.OPERADOR}`}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      u.status === "ACTIVO"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                        u.status === "ACTIVO"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                      title={u.status === "ACTIVO" ? "Desactivar" : "Activar"}
                    >
                      {u.status === "ACTIVO" ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      {u.status === "ACTIVO" ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-light" />
                Agregar Usuario
              </h3>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="correo@dominio.com"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand placeholder-slate-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del usuario"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand placeholder-slate-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-xl cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
