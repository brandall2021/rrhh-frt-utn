import nodemailer from "nodemailer";

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

export async function sendBirthdayEmail(
  to: string,
  employeeName: string
): Promise<boolean> {
  try {
    const safeName = escapeHtml(employeeName);
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: "Feliz Cumpleaños",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D60000;">Feliz Cumplea&ntilde;os, ${safeName}!</h1>
          <p>Queremos desearte un muy feliz d&iacute;a lleno de alegr&iacute;a y &eacute;xito.</p>
          <p>Que este nuevo a&ntilde;o de vida est&eacute; lleno de grandes logros y momentos inolvidables.</p>
          <br>
          <p style="color: #666;">Atentamente,</p>
          <p style="color: #D60000; font-weight: bold;">FACE UNT - Recursos Humanos</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}
