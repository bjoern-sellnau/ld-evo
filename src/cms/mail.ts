import 'server-only';
import { createTransport } from 'nodemailer';

/**
 * E-Mail-Versand für LD Flow (bisher nur „Passwort vergessen“). Konfiguration über Umgebungsvariablen:
 *   LDFLOW_SMTP_URL   smtps://nutzer:passwort@mail.example.com:465  (TLS von Anfang an)
 *                     smtp://nutzer:passwort@mail.example.com:587   (STARTTLS wird erzwungen)
 *   LDFLOW_MAIL_FROM  "LD Flow <flow@loona-designs.de>"
 *   LDFLOW_PUBLIC_URL https://loona-designs.de — Basis für Links in Mails. Bewusst nicht aus dem Host-Header
 *                     abgeleitet: sonst könnte ein Angreifer Reset-Links auf seine eigene Domain umbiegen.
 * Ohne diese Werte verschickt LD Flow keine Mails; Admins erzeugen Reset-Links dann in der Nutzerverwaltung.
 */
export function mailConfigured(): boolean {
  return !!(process.env.LDFLOW_SMTP_URL && process.env.LDFLOW_MAIL_FROM && process.env.LDFLOW_PUBLIC_URL);
}

export function publicUrl(path: string): string {
  return new URL(path, process.env.LDFLOW_PUBLIC_URL).toString();
}

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const u = new URL(process.env.LDFLOW_SMTP_URL!);
  const secure = u.protocol === 'smtps:';
  if (!secure && u.protocol !== 'smtp:') throw new Error('LDFLOW_SMTP_URL: nur smtp:// oder smtps://');
  const transport = createTransport({
    host: u.hostname,
    port: Number(u.port) || (secure ? 465 : 587),
    secure,
    requireTLS: !secure, // nie Zugangsdaten im Klartext
    auth: u.username ? { user: decodeURIComponent(u.username), pass: decodeURIComponent(u.password) } : undefined,
  });
  await transport.sendMail({ from: process.env.LDFLOW_MAIL_FROM, to, subject, text });
}
