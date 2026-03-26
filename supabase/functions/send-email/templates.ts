/**
 * Branded HTML email templates for Percentilers.
 *
 * Design system:
 *   Background : #ffffff
 *   Text       : #141414
 *   Accent     : #FF6600
 *   Font       : DM Sans (Google Fonts)
 *   Footer     : Percentilers | percentilers.in | Unsubscribe
 *
 * Variable syntax: {{ variable_name }}
 */

export type TemplateName = "welcome" | "reminder" | "announcement" | "otp";

/** Subject lines per template */
export const SUBJECTS: Record<TemplateName, string> = {
  welcome: "Welcome to Percentilers 🎯 Your CAT journey starts now",
  reminder: "Your study streak needs you today 🔥",
  announcement: "{{ subject }}", // replaced at render time
  otp: "Your Percentilers verification code",
};

// ─── Shared layout shell ────────────────────────────────────────────────────

function shell(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Percentilers</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'DM Sans', Arial, sans-serif; color: #141414; }
    a { color: #FF6600; text-decoration: none; }
    .wrapper { background: #f5f5f5; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #141414; padding: 24px 32px; text-align: center; }
    .logo { font-size: 22px; font-weight: 700; color: #FF6600; letter-spacing: -0.5px; }
    .logo span { color: #ffffff; }
    .body { padding: 36px 32px 28px; }
    h1 { font-size: 24px; font-weight: 700; color: #141414; margin: 0 0 12px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.65; color: #444444; margin: 0 0 16px; }
    .cta-wrap { text-align: center; margin: 28px 0 8px; }
    .cta { display: inline-block; background: #FF6600; color: #ffffff !important; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.2px; }
    .cta:hover { background: #e55a00; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: 24px 0; }
    .stat-row { display: flex; gap: 16px; margin: 20px 0; }
    .stat-box { flex: 1; background: #fff7f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-num { font-size: 28px; font-weight: 700; color: #FF6600; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .otp-box { background: #fff7f0; border: 2px dashed #FF6600; border-radius: 10px; text-align: center; padding: 28px; margin: 20px 0; }
    .otp-code { font-size: 42px; font-weight: 700; color: #FF6600; letter-spacing: 10px; font-family: monospace; }
    .streak-badge { display: inline-block; background: #FF6600; color: #fff; font-weight: 700; font-size: 18px; padding: 6px 20px; border-radius: 20px; }
    .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; border-top: 1px solid #f0f0f0; }
    .footer p { font-size: 12px; color: #999; margin: 0; line-height: 1.8; }
    .footer a { color: #999; text-decoration: underline; }
    @media (max-width: 480px) {
      .body { padding: 24px 20px 20px; }
      .header { padding: 20px; }
      h1 { font-size: 20px; }
      .otp-code { font-size: 32px; letter-spacing: 6px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">Percentilers<span>.</span></div>
      </div>
      ${bodyContent}
      <div class="footer">
        <p>
          <strong style="color:#141414">Percentilers</strong> &nbsp;|&nbsp;
          <a href="https://percentilers.in">percentilers.in</a> &nbsp;|&nbsp;
          <a href="https://percentilers.in/unsubscribe">Unsubscribe</a>
        </p>
        <p style="margin-top:6px">CAT 2026 Preparation &bull; 15% placement rate vs 3.5% industry average</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Template: welcome ───────────────────────────────────────────────────────
// Variables: {{ name }}, {{ dashboard_url }}

const welcomeBody = `
<div class="body">
  <h1>Welcome aboard, {{ name }}! 🎯</h1>
  <p>
    You've just joined <strong>500+ students</strong> preparing for CAT 2026 with Percentilers.
    We're glad you're here — and we're going to make every hour of prep count.
  </p>

  <div class="stat-row">
    <div class="stat-box">
      <div class="stat-num">15%</div>
      <div class="stat-label">Our placement rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">3.5%</div>
      <div class="stat-label">Industry average</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">500+</div>
      <div class="stat-label">Active students</div>
    </div>
  </div>

  <hr class="divider" />

  <p><strong>Here's what to do first:</strong></p>
  <p>
    ✅ &nbsp;Complete your diagnostic test<br />
    ✅ &nbsp;Set your target percentile<br />
    ✅ &nbsp;Join the WhatsApp study group<br />
    ✅ &nbsp;Schedule your first mentor call
  </p>

  <div class="cta-wrap">
    <a href="{{ dashboard_url }}" class="cta">Go to My Dashboard →</a>
  </div>

  <hr class="divider" />

  <p style="font-size:13px;color:#888">
    Questions? Reply to this email — we read every one. Or DM us on Instagram
    <a href="https://instagram.com/percentilers_mbaprep">@percentilers_mbaprep</a>.
  </p>
</div>`;

// ─── Template: reminder ──────────────────────────────────────────────────────
// Variables: {{ name }}, {{ streak }}, {{ task }}, {{ dashboard_url }}

const reminderBody = `
<div class="body">
  <h1>Don't break your streak, {{ name }} 🔥</h1>
  <p>
    You've been consistent — keep it going today.
    Every day of focused prep compounds into percentile gains.
  </p>

  <div style="text-align:center;margin:24px 0">
    <div style="font-size:13px;color:#666;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Current streak</div>
    <span class="streak-badge">{{ streak }} days</span>
  </div>

  <hr class="divider" />

  <p><strong>Today's priority:</strong></p>
  <p style="background:#fff7f0;border-left:3px solid #FF6600;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 20px">
    {{ task }}
  </p>

  <div class="cta-wrap">
    <a href="{{ dashboard_url }}" class="cta">Continue Today's Plan →</a>
  </div>

  <hr class="divider" />

  <p style="font-size:13px;color:#888">
    Consistent daily practice is the single biggest predictor of a 95+ percentile.
    Even 45 minutes today matters more than 4 hours tomorrow.
  </p>
</div>`;

// ─── Template: announcement ──────────────────────────────────────────────────
// Variables: {{ name }}, {{ subject }}, {{ message }}, {{ cta_text }}, {{ cta_url }}

const announcementBody = `
<div class="body">
  <h1>{{ subject }}</h1>
  <p>Hi {{ name }},</p>
  <p style="white-space:pre-line">{{ message }}</p>

  <div class="cta-wrap" style="display:{{ cta_text }}">
    <a href="{{ cta_url }}" class="cta">{{ cta_text }} →</a>
  </div>

  <hr class="divider" />

  <p style="font-size:13px;color:#888">
    This is an announcement from the Percentilers team.
    Reply to this email if you have any questions.
  </p>
</div>`;

// ─── Template: otp ───────────────────────────────────────────────────────────
// Variables: {{ name }}, {{ otp }}, {{ expiry_minutes }}

const otpBody = `
<div class="body">
  <h1>Your verification code</h1>
  <p>Hi {{ name }}, use the code below to verify your account. Do not share this with anyone.</p>

  <div class="otp-box">
    <div style="font-size:13px;color:#666;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Your one-time code</div>
    <div class="otp-code">{{ otp }}</div>
    <div style="font-size:13px;color:#888;margin-top:12px">
      Expires in <strong>{{ expiry_minutes }} minutes</strong>
    </div>
  </div>

  <hr class="divider" />

  <p style="font-size:13px;color:#888">
    If you didn't request this code, please ignore this email.
    Your account is safe — no action needed.
  </p>
</div>`;

// ─── Template registry ───────────────────────────────────────────────────────

const TEMPLATE_BODIES: Record<TemplateName, string> = {
  welcome: welcomeBody,
  reminder: reminderBody,
  announcement: announcementBody,
  otp: otpBody,
};

/** Replace {{ variable }} placeholders with values from data map */
function interpolate(str: string, data: Record<string, string>): string {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? "");
}

export interface RenderResult {
  subject: string;
  html: string;
}

/**
 * Render a named template with the provided data variables.
 * Returns the interpolated subject line and full HTML string.
 */
export function renderTemplate(
  name: TemplateName,
  data: Record<string, string>
): RenderResult {
  const rawBody = TEMPLATE_BODIES[name];
  if (!rawBody) throw new Error(`Unknown template: ${name}`);

  const rawSubject = SUBJECTS[name];
  const subject = interpolate(rawSubject, data);
  const html = shell(interpolate(rawBody, data));

  return { subject, html };
}
