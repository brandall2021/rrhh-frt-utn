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

export async function sendBirthdayEmail(
  to: string,
  employeeName: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: "🎉 Feliz Cumpleaños",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D60000;">¡Feliz Cumpleaños, ${employeeName}!</h1>
          <p>Queremos desearte un muy feliz día lleno de alegría y éxito.</p>
          <p>Que este nuevo año de vida esté lleno de grandes logros y momentos inolvidables.</p>
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
