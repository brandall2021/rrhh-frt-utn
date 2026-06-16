"use client";

import { useState } from "react";
import { Save, ArrowLeft, Info } from "lucide-react";
import { getAvailableVariables } from "@/lib/templates";

interface TemplateEditorProps {
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
  onSave: (data: { name?: string; subject: string; body: string }) => Promise<void>;
  onBack: () => void;
}

const DEFAULT_BODY = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #D60000;">Feliz Cumplea&ntilde;os, {{employeeName}}!</h1>
  <p>Queremos desearte un muy feliz d&iacute;a lleno de alegr&iacute;a y &eacute;xito.</p>
  <p>Que este nuevo a&ntilde;o de vida est&eacute; lleno de grandes logros y momentos inolvidables.</p>
  <br>
  <p style="color: #666;">Atentamente,</p>
  <p style="color: #D60000; font-weight: bold;">FACE UNT - Recursos Humanos</p>
</div>`;

export default function TemplateEditor({
  initialName,
  initialSubject = "Feliz Cumpleaños",
  initialBody = DEFAULT_BODY,
  onSave,
  onBack,
}: TemplateEditorProps) {
  const [name, setName] = useState(initialName ?? "");
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const variables = getAvailableVariables();

  const insertVar = (key: string) => {
    setBody((prev) => prev + `{{${key}}}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError("Subject y body son requeridos");
      return;
    }
    if (!initialName && !name.trim()) {
      setError("El nombre de la plantilla es requerido");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(initialName ? { subject, body } : { name, subject, body });
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const renderedBody = body.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => `<strong style="color:#D60000;">{{${key}}}</strong>`
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {initialName ? "Editar Plantilla" : "Nueva Plantilla"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {initialName ? `Editando: ${initialName}` : "Crear plantilla de email"}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-brand/40 shadow-[0_0_10px_rgba(214,0,0,0.2)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {!initialName && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre interno
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="birthday"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Identificador único (ej: birthday, daily-report)
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Asunto del email
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Feliz Cumpleaños, {{employeeName}}!"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Cuerpo del email (HTML)
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-[10px] text-brand-light hover:text-brand transition-all cursor-pointer"
              >
                {preview ? "Editar" : "Vista previa"}
              </button>
            </div>
            {preview ? (
              <div
                className="bg-white rounded-lg p-6 min-h-[300px] border border-slate-700"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 font-mono leading-relaxed resize-y"
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
              <Info className="w-3.5 h-3.5 text-brand-light" />
              Variables disponibles
            </h3>
            <div className="space-y-1.5">
              {variables.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVar(v.key)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/50"
                >
                  <code className="text-brand-light font-mono text-[11px]">
                    {`{{${v.key}}}`}
                  </code>
                  <span className="text-[10px] text-slate-500">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              HTML rendereado
            </h3>
            <div
              className="text-[11px] text-slate-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedBody.slice(0, 300) }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
