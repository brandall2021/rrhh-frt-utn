const DARK_VARS = [
  ["--c-white", "#ffffff"],
  ["--c-slate-50", "#f8fafc"],
  ["--c-slate-100", "#f1f5f9"],
  ["--c-slate-200", "#e2e8f0"],
  ["--c-slate-300", "#cbd5e1"],
  ["--c-slate-400", "#94a3b8"],
  ["--c-slate-500", "#64748b"],
  ["--c-slate-600", "#475569"],
  ["--c-slate-700", "#334155"],
  ["--c-slate-800", "#1e293b"],
  ["--c-slate-900", "#0f172a"],
  ["--c-slate-950", "#020617"],
  ["--bg-primary", "#020617"],
  ["--bg-secondary", "#0f172a"],
  ["--bg-card", "rgba(15,23,42,0.5)"],
  ["--bg-surface", "#020617"],
  ["--bg-elevated", "#0f172a"],
  ["--text-primary", "#f8fafc"],
  ["--text-secondary", "#e2e8f0"],
  ["--text-muted", "#94a3b8"],
  ["--border", "#1e293b"],
  ["--scrollbar-track", "#020617"],
  ["--scrollbar-thumb", "#334155"],
];

export function getHtml2canvasOptions(bgColor = "#020617") {
  return {
    backgroundColor: bgColor,
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (doc: Document) => {
      const root = doc.documentElement;
      root.classList.remove("light");
      for (const [name, value] of DARK_VARS) {
        root.style.setProperty(name, value);
      }
    },
  };
}
