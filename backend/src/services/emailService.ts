import nodemailer, { Transporter } from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dns from 'node:dns/promises';
import { config } from '../config/config.js';

let transporter: Transporter | null = null;

// Path to assets/email.txt at the project root — resolves correctly whether the
// server runs from backend/src (dev) or backend/dist (production build).
const WELCOME_EMAIL_TEMPLATE = fileURLToPath(
  new URL('../../../assets/email.txt', import.meta.url)
);

/**
 * Hosting providers like Render have no IPv6 egress. Even with ipv4first DNS
 * ordering, an SMTP host can still resolve to IPv6 and the connection dies
 * with "connect ENETUNREACH <ipv6>:465". So resolve the IPv4 address ourselves
 * and connect to the IP directly (keeping the hostname for TLS verification).
 */
async function resolveSmtpHost(): Promise<{ host: string; tls?: { servername: string } }> {
  const host = config.smtpHost;
  try {
    const { address } = await dns.lookup(host, { family: 4 });
    console.log(`📧 ${host} resolved to IPv4: ${address}`);
    return { host: address, tls: { servername: host } };
  } catch (error) {
    console.warn(`⚠️ Could not resolve ${host} to IPv4, using hostname directly:`, error);
    return { host };
  }
}

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const { host, tls } = await resolveSmtpHost();

  transporter = nodemailer.createTransport({
    host,
    port: config.smtpPort,
    secure: config.smtpSecure,
    tls,
    auth: {
      user: config.emailUser,
      pass: config.emailAppPassword,
    },
    // Fail fast: nodemailer's defaults wait up to 2 minutes per socket, which
    // makes "send code" hang forever when the SMTP server is slow. 10s cap per phase.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  return transporter;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends via the Brevo HTTP API (port 443).
 *
 * This is the ONLY path that works on Render free tier: since Sept 2025 Render
 * blocks outbound traffic to SMTP ports 25/465/587 on free services.
 * Requires BREVO_API_KEY (Settings → SMTP & API → API keys, starts with
 * "xkeysib-") and a sender verified in Brevo (Settings → Senders).
 */
async function sendViaBrevoApi(payload: MailPayload): Promise<{ messageId?: string | undefined }> {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': config.brevoApiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'English Bridge', email: config.emailFrom },
      to: [{ email: payload.to }],
      subject: payload.subject,
      textContent: payload.text,
      htmlContent: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as { messageId?: string };
  return { messageId: data.messageId };
}

async function sendViaSmtp(payload: MailPayload): Promise<{ messageId?: string | undefined }> {
  const info = await (await getTransporter()).sendMail({
    from: `"English Bridge" <${config.emailFrom}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
  return { messageId: info.messageId };
}

async function deliver(payload: MailPayload): Promise<{ messageId?: string | undefined }> {
  return config.brevoApiKey ? sendViaBrevoApi(payload) : sendViaSmtp(payload);
}

/**
 * Sends with up to 2 attempts (delivery is the #1 failure point, so a single
 * retry meaningfully raises the success rate). Never throws.
 */
async function deliverWithRetry(payload: MailPayload, label: string): Promise<SendOtpResult> {
  const provider = config.brevoApiKey ? 'Brevo' : 'SMTP';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { messageId } = await deliver(payload);
      console.log(
        `📧 ${label} email accepted by ${provider} → ${payload.to} messageId: ${messageId}`
      );
      return { sent: true, message: `${label} email sent.` };
    } catch (error) {
      if (attempt === 1) {
        console.warn(`⚠️ ${label} email send failed, retrying once...`, (error as Error).message);
        await new Promise((r) => setTimeout(r, 500));
      } else {
        console.error(`❌ Failed to send ${label.toLowerCase()} email (2 attempts):`, error);
      }
    }
  }
  return { sent: false, message: `Failed to send ${label.toLowerCase()} email.` };
}

export interface SendOtpResult {
  sent: boolean;
  devCode?: string; // present only in dev mode, surfaced back to the client
  message: string;
}

/**
 * Sends a 6-digit OTP email.
 *
 * Behaviour:
 *  - REAL mode (BREVO_API_KEY or EMAIL_APP_PASSWORD set): sends via Brevo HTTP
 *    API (default, works on Render free tier) or SMTP fallback.
 *  - DEV mode (no credentials): logs the code to the server console AND returns
 *    it in the result so the frontend can display it during localhost testing.
 *
 * Never throws — failures return { sent: false } so callers can give the user
 * a generic message without leaking transport errors.
 */
export async function sendOtpEmail(to: string, code: string, purpose: 'verify' | 'reset'): Promise<SendOtpResult> {
  const subject = purpose === 'verify'
    ? 'English Bridge — Verify your email'
    : 'English Bridge — Reset your password';

  const textBody = [
    `Your English Bridge verification code is: ${code}`,
    '',
    'It expires in 10 minutes.',
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

  const htmlBody = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #051650; margin-bottom: 8px;">English Bridge</h2>
      <p style="color: #475569; margin-top: 0;">Use the code below to ${purpose === 'verify' ? 'verify your email' : 'reset your password'}.</p>
      <div style="margin: 24px 0; text-align: center;">
        <span style="display:inline-block; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #051650; background: #e6eaf2; padding: 16px 24px; border-radius: 12px;">${code}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  `;

  // DEV mode — don't attempt a real send.
  if (!config.isEmailReal) {
    console.log('\n────────────────────────────────────────');
    console.log('📧 [DEV MODE] OTP email (no SMTP configured)');
    console.log(`   To:      ${to}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   Code:    ${code}`);
    console.log('────────────────────────────────────────\n');
    return {
      sent: true,
      devCode: code,
      message: 'DEV MODE: OTP code generated (no SMTP configured). Check server console.',
    };
  }

  // REAL mode — send (up to 2 attempts).
  return deliverWithRetry(
    { to, subject, text: textBody, html: htmlBody },
    'OTP'
  );
}

/**
 * Reads the welcome-email body from assets/email.txt.
 * Falls back to a default message if the file is missing/unreadable.
 */
function getWelcomeBody(): string {
  try {
    const content = readFileSync(WELCOME_EMAIL_TEMPLATE, 'utf8').trim();
    if (content) return content;
  } catch (error) {
    console.error('⚠️ Could not read assets/email.txt:', error);
  }
  return 'Welcome to English Bridge!';
}

/**
 * Sends the automatic welcome email to a newly created account.
 * Body is loaded from assets/email.txt; sent from config.emailFrom.
 *
 * Same dev/real behaviour as OTP emails — never throws.
 */
export async function sendNewUserEmail(to: string): Promise<SendOtpResult> {
  const body = getWelcomeBody();
  const subject = 'Welcome to English Bridge!';

  const htmlBody = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #051650; margin-bottom: 8px;">English Bridge</h2>
      <p style="color: #475569; margin-top: 0; white-space: pre-line;">${body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</p>
    </div>
  `;

  if (!config.isEmailReal) {
    console.log('\n────────────────────────────────────────');
    console.log('📧 [DEV MODE] Welcome email (no SMTP configured)');
    console.log(`   To:      ${to}`);
    console.log(`   Body:    ${body}`);
    console.log('────────────────────────────────────────\n');
    return {
      sent: true,
      message: 'DEV MODE: welcome email logged (no SMTP configured).',
    };
  }

  // REAL mode — send (up to 2 attempts).
  return deliverWithRetry(
    { to, subject, text: body, html: htmlBody },
    'Welcome'
  );
}
