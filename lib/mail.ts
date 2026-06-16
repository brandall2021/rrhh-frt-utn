import nodemailer from "nodemailer";
import { getTemplateByName, renderTemplate } from "./templates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildDailyReportHtml(
  report: { date: string; totalEmployees: number; presentCount: number; absentCount: number; entries: { employeeName: string; department: string; type: string; typeCode: string; notes?: string; source: string }[] }
): string {
  const rows = report.entries.map((e) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${escapeHtml(e.employeeName)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">${escapeHtml(e.department)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;">
          ${escapeHtml(e.type)}
        </span>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; font-style: italic;">
        ${e.source === "licencia" ? "Licencia" : "Inasistencia"}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
        ${e.notes ? escapeHtml(e.notes) : "—"}
      </td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 20px;">
      <div style="background: #D60000; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Reporte Diario de Asistencias</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">${report.date}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        <div style="display: flex; gap: 16px; margin-bottom: 24px;">
          <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Empleados</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #0f172a;">${report.totalEmployees}</p>
          </div>
          <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Presentes</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #16a34a;">${report.presentCount}</p>
          </div>
          <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Ausentes</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #dc2626;">${report.absentCount}</p>
          </div>
        </div>

        ${report.entries.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Empleado</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Departamento</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Tipo</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Origen</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Observaciones</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        ` : `<p style="text-align: center; color: #64748b; font-size: 14px; padding: 24px;">No se registran ausencias para esta fecha.</p>`}

        <p style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center;">
          Generado automáticamente por el sistema de Gestión Operativa.
        </p>
      </div>
    </div>
  `;
}

export async function sendDailyReportEmail(
  to: string,
  report: { date: string; totalEmployees: number; presentCount: number; absentCount: number; entries: any[] }
): Promise<boolean> {
  try {
    const html = buildDailyReportHtml(report);
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: `Reporte Diario de Asistencias - ${report.date}`,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

const FALLBACK_SUBJECT = "Feliz Cumpleaños";
const FALLBACK_BODY = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #D60000;">Feliz Cumplea&ntilde;os, {{employeeName}}!</h1>
    <p>Queremos desearte un muy feliz d&iacute;a lleno de alegr&iacute;a y &eacute;xito.</p>
    <p>Que este nuevo a&ntilde;o de vida est&eacute; lleno de grandes logros y momentos inolvidables.</p>
    <br>
    <p style="color: #666;">Atentamente,</p>
    <p style="color: #D60000; font-weight: bold;">FACE UNT - Recursos Humanos</p>
  </div>
`;

export async function sendBirthdayEmail(
  to: string,
  employeeName: string,
  extraVars?: Record<string, string>
): Promise<boolean> {
  try {
    const template = await getTemplateByName("birthday");
    const safeName = escapeHtml(employeeName);

    const vars: Record<string, string> = {
      employeeName: safeName,
      firstName: safeName.split(" ")[0],
      birthDate: "",
      age: "",
      department: "",
      currentYear: String(new Date().getFullYear()),
      companyName: "FACE UNT",
      ...extraVars,
    };

    let subject = FALLBACK_SUBJECT;
    let body = FALLBACK_BODY;

    if (template) {
      const rendered = renderTemplate(template, vars);
      subject = rendered.subject;
      body = rendered.body;
    } else {
      subject = subject.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
      body = body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: body,
    });
    return true;
  } catch {
    return false;
  }
}
