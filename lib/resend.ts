import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY configured. Mocking email delivery to:", opts.to);
    console.log("Subject:", opts.subject);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: 'ANTA Indumentaria <contacto@antaindumentaria.cl>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
