import { Resend } from "resend";

export async function sendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("Missing RESEND_API_KEY in server/.env");
  }

  const resend = new Resend(key);

  const from = process.env.RESEND_FROM || "Artelix <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Email sending failed");
  }

  return data;
}
