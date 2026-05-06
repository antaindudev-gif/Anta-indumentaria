import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY configured. Mocking email delivery to:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: 'Anta Indumentaria <pedidos@antaindumentaria.cl>', // Esto debe ser un dominio verificado en Resend
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
