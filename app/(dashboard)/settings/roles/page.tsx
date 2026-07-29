"use client";

import { motion } from "motion/react";
import { Shield, UserCog, Eye, Check } from "lucide-react";

const ROLES = [
  {
    name: "Superadmin",
    value: "SUPERADMIN",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    permissions: [
      "Acceso completo al sistema",
      "Gestionar usuarios y roles",
      "Aprobar/rechazar solicitudes",
      "Configurar departamentos",
      "Ver reportes y estadísticas",
      "Auditoría del sistema",
    ],
  },
  {
    name: "Admin",
    value: "ADMIN",
    color: "text-brand-light",
    border: "border-brand/30",
    bg: "bg-brand/10",
    permissions: [
      "Aprobar/rechazar solicitudes",
      "Gestionar empleados",
      "Configurar departamentos",
      "Ver reportes y estadísticas",
      "No puede gestionar usuarios",
    ],
  },
  {
    name: "Operador",
    value: "OPERADOR",
    color: "text-slate-300",
    border: "border-slate-700",
    bg: "bg-slate-800",
    permissions: [
      "Registrar solicitudes de ausencia",
      "Ver listado de personal",
      "Consultar vacaciones",
      "Visualizar reportes",
      "No puede aprobar/rechazar solicitudes",
    ],
  },
];

export default function RolesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-light" />
          Roles y Permisos
        </h1>
        <p className="text-xs text-slate-400 mt-1">Gestión de roles y permisos del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div
            key={role.value}
            className={`${role.bg} ${role.border} border rounded-3xl p-5 space-y-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${role.bg} ${role.border} border flex items-center justify-center`}>
                <Shield className={`w-5 h-5 ${role.color}`} />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${role.color}`}>{role.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{role.value}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {role.permissions.map((perm, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check className={`w-3.5 h-3.5 ${role.color} shrink-0 mt-0.5`} />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-white">Cambiar rol de usuario</h3>
        </div>
        <p className="text-xs text-slate-400">
          Para cambiar el rol de un usuario, andá a{" "}
          <a href="/settings/usuarios" className="text-brand-light hover:underline font-bold">
            Usuarios
          </a>{" "}
          y seleccioná el nuevo rol desde el menú desplegable en la columna &quot;Rol&quot;.
        </p>
      </div>
    </motion.div>
  );
}
