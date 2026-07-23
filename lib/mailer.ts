import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ── Singleton transport ───────────────────────────────────────────────────────

let _transport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (_transport) return _transport;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  _transport = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "465", 10),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
  });

  return _transport;
}

const FROM = process.env.SMTP_FROM ?? "Quran Learning <noreply@quranlearning.org>";
const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// ── Base HTML layout ──────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#2a4a3a;padding:28px 36px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;line-height:36px;">📖</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="font-size:18px;font-weight:700;color:#f0f8f0;letter-spacing:0.3px;">Quran Learning</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7faf7;padding:20px 36px;border-top:1px solid #e8ede8;">
              <p style="margin:0;font-size:12px;color:#8a9e8a;line-height:1.6;">
                This email was sent by <strong>Quran Learning</strong> — free Quranic education for everyone.<br/>
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1e3528;line-height:1.3;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#3d5244;line-height:1.7;">${text}</p>`;
}

function btn(href: string, label: string) {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr>
      <td style="background:#2a4a3a;border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f0f8f0;text-decoration:none;letter-spacing:0.2px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e8ede8;margin:24px 0;" />`;
}

function small(text: string) {
  return `<p style="margin:0 0 8px;font-size:12px;color:#8a9e8a;line-height:1.6;">${text}</p>`;
}

// ── Core send helper ──────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  const transport = getTransport();

  if (!transport) {
    console.log(`[mailer] SMTP not configured — email NOT sent to ${to}: "${subject}"`);
    return;
  }

  try {
    await transport.sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    // Never crash the action over a failed email
    console.error("[mailer] Failed to send email:", err);
  }
}

// ── Named email functions ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const subject = "Reset your Quran Learning password";
  const html = layout(
    subject,
    h1("Reset your password") +
    p("We received a request to reset the password for your account. Click the button below — this link expires in <strong>1 hour</strong>.") +
    btn(resetUrl, "Reset Password") +
    divider() +
    small("If you didn't request a password reset, you can ignore this email — your password won't change.") +
    small(`Or copy this link into your browser: <a href="${resetUrl}" style="color:#2a4a3a;">${resetUrl}</a>`)
  );
  const text = `Reset your Quran Learning password\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;
  await send(to, subject, html, text);
}

export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
  const roleLabel: Record<string, string> = {
    STUDENT: "Student",
    TEACHER: "Teacher",
    PARENT: "Parent",
    SUPER_ADMIN: "Administrator",
  };
  const dashboardPath: Record<string, string> = {
    STUDENT: "/student",
    TEACHER: "/teacher",
    PARENT: "/parent",
    SUPER_ADMIN: "/admin",
  };
  const subject = `Welcome to Quran Learning, ${name}!`;
  const html = layout(
    subject,
    h1(`Assalamu Alaikum, ${name}! 👋`) +
    p(`Your <strong>${roleLabel[role] ?? role}</strong> account has been created. You can now sign in and start using the platform.`) +
    (role === "TEACHER"
      ? p("Your teacher account is pending verification by an administrator. You'll receive another email once it's approved.")
      : "") +
    btn(`${BASE}${dashboardPath[role] ?? "/"}`, "Go to my dashboard") +
    divider() +
    small("If you did not create this account, please contact us immediately.")
  );
  const text = `Welcome to Quran Learning, ${name}!\n\nYour ${roleLabel[role] ?? role} account is ready.\nSign in at: ${BASE}/login`;
  await send(to, subject, html, text);
}

export async function sendAnnouncementEmail(to: string, name: string, message: string): Promise<void> {
  const subject = "New Announcement — Quran Learning";
  const html = layout(
    subject,
    h1("Platform Announcement 📢") +
    p(`Hi ${name},`) +
    `<div style="background:#f2f7f2;border-left:4px solid #2a4a3a;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;color:#1e3528;line-height:1.7;">${message}</p>
    </div>` +
    btn(`${BASE}/student`, "View in dashboard") +
    divider() +
    small("You received this because you are a registered user of Quran Learning.")
  );
  const text = `Quran Learning Announcement\n\nHi ${name},\n\n${message}\n\nLog in at: ${BASE}/login`;
  await send(to, subject, html, text);
}

export async function sendTeacherApprovedEmail(to: string, name: string): Promise<void> {
  const subject = "Your teacher account has been approved! ✅";
  const html = layout(
    subject,
    h1("You're approved, " + name + "! 🎉") +
    p("Your teacher application has been reviewed and <strong>approved</strong> by our administrators. You can now access your full teacher dashboard, set your availability, and start teaching.") +
    btn(`${BASE}/teacher`, "Go to my teacher dashboard") +
    divider() +
    small("JazakAllahu Khairan for volunteering your time to teach the Quran.")
  );
  const text = `Congratulations ${name}! Your teacher account on Quran Learning has been approved.\n\nAccess your dashboard at: ${BASE}/teacher`;
  await send(to, subject, html, text);
}

export async function sendTeacherRejectedEmail(to: string, name: string): Promise<void> {
  const subject = "Update on your teacher application";
  const html = layout(
    subject,
    h1("Application Update") +
    p(`Hi ${name}, thank you for applying to teach on Quran Learning.`) +
    p("After review, we are unable to approve your teacher application at this time. If you believe this is an error or would like more information, please contact an administrator.") +
    btn(`${BASE}/login`, "Sign in") +
    divider() +
    small("You may still use the platform as a student or parent.")
  );
  const text = `Hi ${name},\n\nWe've reviewed your teacher application on Quran Learning and are unable to approve it at this time. Please contact an administrator for more information.`;
  await send(to, subject, html, text);
}

export async function sendCertificateIssuedEmail(
  to: string,
  name: string,
  courseName: string,
  level: string
): Promise<void> {
  const subject = `Certificate issued — ${courseName}`;
  const html = layout(
    subject,
    h1("Congratulations, " + name + "! 🏆") +
    p(`You have been awarded a <strong>${level}</strong> certificate for completing <strong>${courseName}</strong>. MashaAllah — this is a wonderful achievement!`) +
    btn(`${BASE}/student/certificates`, "View my certificate") +
    divider() +
    small("Keep up the great work on your Quranic journey.")
  );
  const text = `Congratulations ${name}!\n\nYou've been awarded a ${level} certificate for ${courseName} on Quran Learning.\n\nView it at: ${BASE}/student/certificates`;
  await send(to, subject, html, text);
}

export async function sendHomeworkAssignedEmail(
  to: string,
  name: string,
  title: string,
  courseName: string,
  dueDate: Date
): Promise<void> {
  const due = dueDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const subject = `New assignment: ${title}`;
  const html = layout(
    subject,
    h1("New Homework Assigned 📝") +
    p(`Hi ${name}, you have a new assignment in <strong>${courseName}</strong>:`) +
    `<div style="background:#f2f7f2;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1e3528;">${title}</p>
      <p style="margin:0;font-size:13px;color:#5a7a64;">Due: ${due}</p>
    </div>` +
    btn(`${BASE}/student/assignments`, "View assignment") +
    divider() +
    small("Submit your work before the due date to stay on track.")
  );
  const text = `New assignment in ${courseName}: "${title}"\nDue: ${due}\n\nView at: ${BASE}/student/assignments`;
  await send(to, subject, html, text);
}

export async function sendHomeworkGradedEmail(
  to: string,
  name: string,
  title: string,
  grade: string | null,
  feedback: string | null
): Promise<void> {
  const subject = `Your assignment has been reviewed: ${title}`;
  const html = layout(
    subject,
    h1("Assignment Reviewed ✅") +
    p(`Hi ${name}, your submission for <strong>"${title}"</strong> has been reviewed.`) +
    (grade
      ? `<div style="background:#f2f7f2;border-radius:10px;padding:16px 20px;margin:0 0 16px;">
           <p style="margin:0 0 4px;font-size:13px;color:#5a7a64;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Grade</p>
           <p style="margin:0;font-size:20px;font-weight:700;color:#1e3528;">${grade}</p>
         </div>`
      : "") +
    (feedback
      ? `<div style="background:#f2f7f2;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
           <p style="margin:0 0 6px;font-size:13px;color:#5a7a64;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Feedback</p>
           <p style="margin:0;font-size:15px;color:#1e3528;line-height:1.7;">${feedback}</p>
         </div>`
      : "") +
    btn(`${BASE}/student/assignments`, "View submission") +
    divider() +
    small("Keep up the great work!")
  );
  const text = `Your assignment "${title}" has been reviewed.\n${grade ? `Grade: ${grade}\n` : ""}${feedback ? `Feedback: ${feedback}\n` : ""}\nView at: ${BASE}/student/assignments`;
  await send(to, subject, html, text);
}

export async function sendClassReminderEmail(
  to: string,
  name: string,
  courseName: string,
  startTime: Date,
  joinUrl?: string | null
): Promise<void> {
  const time = startTime.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const subject = `Class reminder: ${courseName}`;
  const html = layout(
    subject,
    h1("Class Reminder 📅") +
    p(`Hi ${name}, you have an upcoming class in <strong>${courseName}</strong>:`) +
    `<div style="background:#f2f7f2;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;color:#1e3528;font-weight:600;">${time}</p>
    </div>` +
    (joinUrl ? btn(joinUrl, "Join Class") : btn(`${BASE}/student/schedule`, "View schedule")) +
    divider() +
    small("Make sure you're in a quiet place with a stable connection before the class starts.")
  );
  const text = `Class reminder: ${courseName}\nTime: ${time}\n${joinUrl ? `Join: ${joinUrl}` : `Schedule: ${BASE}/student/schedule`}`;
  await send(to, subject, html, text);
}

export async function sendParticipantAddedEmail(
  to: string,
  name: string,
  courseName: string,
  startTime: Date,
  joinUrl?: string | null
): Promise<void> {
  const time = startTime.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const subject = `You've been added to a class: ${courseName}`;
  const html = layout(
    subject,
    h1("You've been added to a class 🗓️") +
    p(`Hi ${name}, you have been added as a participant in a <strong>${courseName}</strong> class:`) +
    `<div style="background:#f2f7f2;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;color:#1e3528;font-weight:600;">${time}</p>
    </div>` +
    (joinUrl ? btn(joinUrl, "Join Class") : btn(`${BASE}/student/schedule`, "View my schedule")) +
    divider() +
    small("If you have any questions, contact your teacher or an administrator.")
  );
  const text = `You've been added to ${courseName} on ${time}.\n${joinUrl ? `Join: ${joinUrl}` : `Schedule: ${BASE}/student/schedule`}`;
  await send(to, subject, html, text);
}
