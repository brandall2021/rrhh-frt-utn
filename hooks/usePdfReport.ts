"use client";

import { useState, useCallback } from "react";
import { getHtml2canvasOptions } from "@/lib/pdf";

export interface PdfColumn<T> {
  header: string;
  accessor: ((row: T) => string | number) | keyof T;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface PdfReportConfig<T> {
  title: string;
  subtitle?: string;
  columns: PdfColumn<T>[];
  data: T[];
  footer?: string;
  filename?: string;
  margins?: number;
  rowsPerPage?: number;
}

interface UsePdfReportReturn {
  generatePdf: <T>(config: PdfReportConfig<T>) => Promise<boolean>;
  isGenerating: boolean;
}

function buildPdfHtml<T>(config: PdfReportConfig<T>, chunk: T[], pageNum: number, totalPages: number): string {
  const { title, subtitle, columns, footer } = config;

  const headerRow = columns
    .map((col) => {
      const align = col.align || "center";
      return `<th style="padding:5px 7px;text-align:${align};font-size:9px;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #334155;">${col.header}</th>`;
    })
    .join("");

  const bodyRows = chunk
    .map((row) => {
      const cells = columns
        .map((col) => {
          const val = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
          const align = col.align || "center";
          return `<td style="padding:4px 7px;text-align:${align};font-size:10px;color:#cbd5e1;">${val}</td>`;
        })
        .join("");
      return `<tr style="border-bottom:1px solid #1e293b;">${cells}</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Courier New',monospace;color:#e2e8f0;">
<div style="padding:16px 18px;">
  <div style="text-align:center;margin-bottom:10px;">
    ${title ? `<div style="color:#38bdf8;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1px;">${title}</div>` : ""}
    ${subtitle ? `<div style="color:#f8fafc;font-size:15px;font-weight:800;">${subtitle}</div>` : ""}
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:10px;">
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  ${totalPages > 1 ? `<div style="text-align:right;font-size:8px;color:#475569;margin-top:6px;">Pág. ${pageNum} de ${totalPages}</div>` : ""}
  ${footer ? `<div style="margin-top:10px;text-align:right;font-size:9px;color:#64748b;border-top:1px solid #1e293b;padding-top:6px;">${footer}</div>` : ""}
</div>
</body>
</html>`;
}

export function usePdfReport(): UsePdfReportReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async <T>(config: PdfReportConfig<T>): Promise<boolean> => {
    setIsGenerating(true);
    const container = document.createElement("div");

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const { data, margins = 10, rowsPerPage = 35, filename = "reporte.pdf" } = config;
      const pageWidthPx = Math.round((210 - margins * 2) * 3.78);

      const chunks: T[][] = [];
      for (let i = 0; i < data.length; i += rowsPerPage) {
        chunks.push(data.slice(i, i + rowsPerPage));
      }

      const pdf = new jsPDF("p", "mm", "a4");
      container.style.cssText = `position:fixed;left:-9999px;top:0;width:${pageWidthPx}px;`;

      for (let idx = 0; idx < chunks.length; idx++) {
        container.innerHTML = buildPdfHtml(config, chunks[idx], idx + 1, chunks.length);
        document.body.appendChild(container);

        const canvas = await html2canvas(container, getHtml2canvasOptions("#0f172a"));
        document.body.removeChild(container);

        if (idx > 0) pdf.addPage();

        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const iw = pw - margins * 2;
        const maxIh = ph - margins * 2;
        const canvasRatio = canvas.height / canvas.width;
        let ih = iw * canvasRatio;
        if (ih > maxIh) ih = maxIh;

        pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", margins, margins, iw, ih);
      }

      pdf.save(filename);
      return true;
    } catch (err) {
      console.error("Error generating PDF:", err);
      return false;
    } finally {
      if (container.parentNode) container.parentNode.removeChild(container);
      setIsGenerating(false);
    }
  }, []);

  return { generatePdf, isGenerating };
}
