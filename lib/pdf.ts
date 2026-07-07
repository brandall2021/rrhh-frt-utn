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
  ["--color-white", "#ffffff"],
  ["--color-slate-50", "#f8fafc"],
  ["--color-slate-100", "#f1f5f9"],
  ["--color-slate-200", "#e2e8f0"],
  ["--color-slate-300", "#cbd5e1"],
  ["--color-slate-400", "#94a3b8"],
  ["--color-slate-500", "#64748b"],
  ["--color-slate-600", "#475569"],
  ["--color-slate-700", "#334155"],
  ["--color-slate-800", "#1e293b"],
  ["--color-slate-900", "#0f172a"],
  ["--color-slate-950", "#020617"],
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

const UNSUPPORTED_COLOR = /^(oklab|oklch|lab|lch|color-mix|color)\b/i;
const COLOR_PROPS = [
  "background-color", "color",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "outline-color",
];

function fixColors(doc: Document) {
  for (const el of doc.querySelectorAll("style")) {
    const css = el.textContent || "";
    const out: string[] = [];
    let i = 0;
    while (i < css.length) {
      const m = css.slice(i).match(
        /^@supports\s*\(\s*color\s*:\s*color-mix\(in lab,\s*red,\s*red\)\s*\)\s*\{/
      );
      if (m) {
        i += m[0].length;
        let d = 1;
        while (i < css.length && d > 0) {
          if (css[i] === "{") d++;
          else if (css[i] === "}") d--;
          i++;
        }
      } else {
        out.push(css[i]);
        i++;
      }
    }
    el.textContent = out.join("");
  }

  for (const el of doc.querySelectorAll("*")) {
    const s = (el as HTMLElement).style;
    for (const prop of COLOR_PROPS) {
      const val = s.getPropertyValue(prop);
      if (val && UNSUPPORTED_COLOR.test(val.trim())) {
        s.removeProperty(prop);
      }
    }
  }
}

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
      fixColors(doc);
    },
  };
}
