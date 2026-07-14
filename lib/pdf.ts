/**
 * PDF Generation utilities for Precision HR
 * Handles html2canvas + jsPDF with oklab/lab/color-mix compatibility
 */

const DARK_VARS: [string, string][] = [
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

/**
 * Remove all @supports blocks containing color-mix (generates oklab)
 * and strip oklab/oklch/lab/lch from CSS text
 */
function sanitizeCssText(css: string): string {
  let result = "";
  let i = 0;

  while (i < css.length) {
    // Match @supports blocks with color-mix
    const supportsMatch = css.slice(i).match(
      /^@supports\s*\([^)]*color-mix[^)]*\)\s*\{/
    );
    if (supportsMatch) {
      i += supportsMatch[0].length;
      let depth = 1;
      while (i < css.length && depth > 0) {
        if (css[i] === "{") depth++;
        else if (css[i] === "}") depth--;
        i++;
      }
      continue;
    }

    // Match and replace oklab/oklch/lab/lch function calls
    const colorFnMatch = css.slice(i).match(/^(oklab|oklch|lab|lch)\s*\([^)]*\)/i);
    if (colorFnMatch) {
      result += "#888888"; // Fallback gray
      i += colorFnMatch[0].length;
      continue;
    }

    // Match color-mix function
    const colorMixMatch = css.slice(i).match(/^color-mix\s*\([^)]*\)/i);
    if (colorMixMatch) {
      result += "#888888"; // Fallback gray
      i += colorMixMatch[0].length;
      continue;
    }

    result += css[i];
    i++;
  }

  return result;
}

/**
 * Aggressively fix all colors in the cloned document
 */
function fixColors(doc: Document) {
  // 1. Remove @supports color-mix blocks from <style> tags and sanitize CSS text
  for (const el of doc.querySelectorAll("style")) {
    const css = el.textContent || "";
    el.textContent = sanitizeCssText(css);
  }

  // 2. Remove oklab/oklch/lab/lch from inline styles
  for (const el of doc.querySelectorAll("*")) {
    const s = (el as HTMLElement).style;
    for (const prop of COLOR_PROPS) {
      const val = s.getPropertyValue(prop);
      if (val && UNSUPPORTED_COLOR.test(val.trim())) {
        s.removeProperty(prop);
      }
    }
  }

  // 3. Scan all stylesheet rules and remove unsupported colors
  try {
    for (const sheet of doc.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        const toRemove: CSSRule[] = [];
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (rule instanceof CSSStyleRule) {
            const text = rule.cssText;
            if (UNSUPPORTED_COLOR.test(text) || /color-mix/i.test(text)) {
              // Replace oklab values in the rule text
              let fixed = text
                .replace(/oklab\s*\([^)]*\)/gi, "#888888")
                .replace(/oklch\s*\([^)]*\)/gi, "#888888")
                .replace(/lab\s*\([^)]*\)/gi, "#888888")
                .replace(/lch\s*\([^)]*\)/gi, "#888888")
                .replace(/color-mix\s*\([^)]*\)/gi, "#888888");
              try {
                rule.parentStyleSheet?.deleteRule(i);
                rule.parentStyleSheet?.insertRule(fixed, i);
              } catch {
                // Skip rules that can't be modified
              }
            }
          } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
            // Check nested rules
            try {
              const nestedRules = rule.cssRules || [];
              for (let j = nestedRules.length - 1; j >= 0; j--) {
                const nested = nestedRules[j];
                if (nested instanceof CSSStyleRule) {
                  if (UNSUPPORTED_COLOR.test(nested.cssText) || /color-mix/i.test(nested.cssText)) {
                    try {
                      rule.deleteRule(j);
                    } catch {
                      // Skip
                    }
                  }
                }
              }
            } catch {
              // Skip
            }
          }
        }
      } catch {
        // Cross-origin stylesheet, skip
      }
    }
  } catch {
    // Error accessing stylesheets, skip
  }
}

export function getHtml2canvasOptions(bgColor = "#020617") {
  return {
    backgroundColor: bgColor,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    removeContainer: true,
    imageTimeout: 15000,
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

/**
 * Generate PDF from an HTML element
 * Wraps html2canvas + jsPDF with proper error handling
 */
export async function generatePdfFromElement(
  elementId: string,
  filename: string,
  options?: {
    bgColor?: string;
    onError?: (error: Error) => void;
  }
): Promise<boolean> {
  try {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`Elemento #${elementId} no encontrado en el DOM`);
    }

    // Dynamically import to ensure client-side only
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const canvas = await html2canvas(el, getHtml2canvasOptions(options?.bgColor));
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error al generar PDF:", error);
    options?.onError?.(error);
    return false;
  }
}

/**
 * Check if PDF generation is supported in the current environment
 */
export function isPdfSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.getContext("2d") !== null;
}
