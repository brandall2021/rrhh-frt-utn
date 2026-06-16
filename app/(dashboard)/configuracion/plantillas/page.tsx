"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FileText, Plus, Pencil, Trash2, Mail } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_NAMES: Record<string, string> = {
  birthday: "Cumpleaños",
  "daily-report": "Reporte Diario",
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates");
      const { data } = await res.json();
      setTemplates(data ?? []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-light" />
            Plantillas de Email
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalizá los emails que se envían desde el sistema
          </p>
        </div>
        <button
          onClick={() => router.push("/configuracion/plantillas/nueva")}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-brand/40 shadow-[0_0_10px_rgba(214,0,0,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Nueva Plantilla
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay plantillas</p>
          <p className="text-xs mt-1">Creá una plantilla para personalizar los emails</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">
                  {TEMPLATE_NAMES[t.name] || t.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {t.subject}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t.name} · Actualizada: {new Date(t.updatedAt).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => router.push(`/configuracion/plantillas/${t.id}`)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
