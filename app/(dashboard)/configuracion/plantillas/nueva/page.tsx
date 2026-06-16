"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import TemplateEditor from "@/components/TemplateEditor";

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSave = async (data: { name: string; subject: string; body: string }) => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Error al crear plantilla");
    }
    router.push("/configuracion/plantillas");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <TemplateEditor
        onSave={handleSave}
        onBack={() => router.push("/configuracion/plantillas")}
      />
    </motion.div>
  );
}
