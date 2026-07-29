"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { UserCog, Shield } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <UserCog className="w-5 h-5 text-brand-light" />
          Usuarios
        </h1>
        <p className="text-xs text-slate-400 mt-1">Administración de usuarios del sistema</p>
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
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/30">
                  <td className="px-4 py-3 text-xs text-slate-200">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString("es-AR")}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center text-xs text-slate-500 italic">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
