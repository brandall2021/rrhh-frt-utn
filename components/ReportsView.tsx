"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

const reportSections = [
  {
    id: "estadisticas",
    title: "Estadísticas Generales",
    description: "KPIs, gráficos mensuales y ranking de ausentismo consolidado.",
    icon: BarChart3,
    color: "text-brand-light",
    borderColor: "border-brand/20",
    bgColor: "bg-brand/5",
  },
  {
    id: "calendario",
    title: "Calendario de Asistencias",
    description: "Visualizá y gestioná las inasistencias por empleado con vista mensual.",
    icon: Calendar,
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
];

export default function ReportsView() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 text-left"
    >
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Reportes & Estadísticas
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Seleccioná una sección para ver los reportes detallados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => router.push(`/reports/${section.id}`)}
              className={`bg-slate-900/50 border ${section.borderColor} rounded-3xl p-6 hover:border-slate-700/60 transition-all text-left cursor-pointer group`}
            >
              <div className={`w-12 h-12 rounded-2xl ${section.bgColor} border ${section.borderColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight mb-1">
                {section.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {section.description}
              </p>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${section.color} group-hover:gap-2.5 transition-all`}>
                Ingresar
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
