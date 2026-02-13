import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return NextResponse.json(
        { warning: 'Email not sent - RESEND_API_KEY not configured' },
        { status: 200 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Narrative Terminal <alerts@narrativeterminal.com>',
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
              <h1 style="color: #fff; margin: 0 0 8px 0; font-size: 24px;">
                <span style="color: #fbbf24;">⚡</span> Alert Triggered
              </h1>
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">Narrative Terminal</p>
            </div>

            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #fbbf24;">
              <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">${subject}</h2>
              <p style="color: #475569; margin: 0; font-size: 15px;">${body}</p>
            </div>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This alert was triggered by your configured rules in Narrative Terminal.
                <br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://narrativeterminal.com'}" style="color: #3b82f6;">Open Dashboard</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `${subject}\n\n${body}\n\n---\nThis alert was triggered by your configured rules in Narrative Terminal.`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
