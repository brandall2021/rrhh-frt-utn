"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import TemplateEditor from "@/components/TemplateEditor";

interface TemplateData {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    if (!id) { setLoading(false); return; }
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setTemplate(data ?? null))
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async (data: { subject: string; body: string }) => {
    const res = await fetch(`/api/templates/${template!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Error al guardar");
    }
    router.push("/configuracion/plantillas");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400">
        Plantilla no encontrada
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <TemplateEditor
        initialName={template.name}
        initialSubject={template.subject}
        initialBody={template.body}
        onSave={handleSave}
        onBack={() => router.push("/configuracion/plantillas")}
      />
    </motion.div>
  );
}
