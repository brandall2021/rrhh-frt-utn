"use client";

import { motion } from "motion/react";
import { Shield, Lock } from "lucide-react";

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

      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Lock className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Próximamente</p>
        <p className="text-xs mt-1">La gestión de roles estará disponible en una próxima actualización</p>
      </div>
    </motion.div>
  );
}
