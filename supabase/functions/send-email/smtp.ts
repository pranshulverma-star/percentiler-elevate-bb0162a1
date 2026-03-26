/**
 * Deno-compatible SMTP client wrapper using nodemailer (via npm specifier).
 * Reads all config from Supabase Edge Function secrets.
 *
 * Secrets required:
 *   SMTP_HOST        e.g. smtp.hostinger.com
 *   SMTP_PORT        e.g. 465 (TLS) or 587 (STARTTLS)
 *   SMTP_USER        your Hostinger email address
 *   SMTP_PASS        your Hostinger email password
 *   SMTP_FROM_NAME   e.g. "Percentilers"
 *   SMTP_FROM_EMAIL  same as SMTP_USER
 */

// deno-lint-ignore-file no-explicit-any
import nodemailer from "npm:nodemailer@6.9.9";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

function createTransporter() {
  const port = parseInt(Deno.env.get("SMTP_PORT") ?? "465", 10);
  const host = Deno.env.get("SMTP_HOST") ?? "smtp.hostinger.com";
  const user = Deno.env.get("SMTP_USER") ?? "";
  const pass = Deno.env.get("SMTP_PASS") ?? "";

  return nodemailer.createTransport({
    host,
    port,
    // Port 465 uses implicit TLS. Port 587 uses STARTTLS (secure: false).
    secure: port === 465,
    auth: { user, pass },
    tls: {
      // Allow self-signed certs in dev — remove in production if not needed
      rejectUnauthorized: false,
    },
  } as any);
}

/**
 * Send a single email. Throws on failure so callers can catch and count errors.
 */
export async function sendEmail(opts: EmailOptions): Promise<void> {
  const fromName = Deno.env.get("SMTP_FROM_NAME") ?? "Percentilers";
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") ?? Deno.env.get("SMTP_USER") ?? "";

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
