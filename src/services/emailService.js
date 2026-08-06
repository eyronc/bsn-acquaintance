/**
 * Email Service using Resend
 * Sends access codes to attendees
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_EMAIL = 'noreply@resend.dev';

export async function sendAccessCodeEmail(attendee) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️  Resend API key not configured. Email not sent.');
    console.log(`Console: Code would be sent to ${attendee.email}: ${attendee.unique_code}`);
    return { success: false, message: 'Email service not configured - check .env.local' };
  }

  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4A3F5C; font-size: 28px; margin: 0;">✨ BSN Acquaintance Party 2026</h1>
          <p style="color: #FFB6D9; font-size: 14px; margin: 5px 0;">UCLM College of Nursing</p>
        </div>

        <div style="background: linear-gradient(135deg, #FFB6D9 0%, #E6D4F7 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
          <p style="color: white; margin: 0 0 10px 0; font-size: 14px;">Welcome,</p>
          <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px;">${attendee.fullname}</h2>
          
          <p style="color: white; margin: 0 0 15px 0; font-size: 14px;">Your Access Code:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <code style="font-size: 32px; font-weight: bold; color: #FFB6D9; letter-spacing: 4px;">
              ${attendee.unique_code}
            </code>
          </div>
        </div>

        <div style="background: #FEF9F3; border-left: 4px solid #4A3F5C; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #4A3F5C; margin: 0 0 10px 0; font-size: 16px;">How to Login:</h3>
          <ol style="color: #4A3F5C; margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Visit your event URL</li>
            <li>Email: <code>${attendee.email}</code></li>
            <li>Access Code: <code>${attendee.unique_code}</code></li>
            <li>Select your seat at the enchanted table!</li>
          </ol>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p style="margin: 0;">See you at the party! ✨</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `BSN Party <${RESEND_EMAIL}>`,
        to: attendee.email,
        subject: '🎉 Your Access Code - BSN Acquaintance Party 2026',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return { success: false, message: 'Failed to send email' };
    }

    const data = await response.json();
    console.log('✅ Email sent:', data.id);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, message: error.message };
  }
}