// Twilio WhatsApp Business API helper
// Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env
// TWILIO_WHATSAPP_FROM format: "whatsapp:+14155238886"

const SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const FROM = process.env.TWILIO_WHATSAPP_FROM ?? "";

export function whatsappEnabled(): boolean {
  return Boolean(SID && TOKEN && FROM);
}

export async function sendWhatsAppMessage(
  toPhone: string,
  body: string
): Promise<void> {
  if (!whatsappEnabled()) return;

  const to = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`;

  const params = new URLSearchParams({ From: FROM, To: to, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[WhatsApp] Twilio error:", text);
  }
}

export function classReminderMessage(
  studentName: string,
  courseName: string,
  scheduledStart: Date,
  joinUrl?: string | null
): string {
  const time = scheduledStart.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  let msg = `Assalamu Alaykum ${studentName}! Your ${courseName} class starts at ${time} UTC.`;
  if (joinUrl) msg += ` Join here: ${joinUrl}`;
  return msg;
}
