import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: Send Seat Confirmation Email
 * Production endpoint: /api/send-seat-confirmation
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, fullname, table_number, seat_number, eventUrl } = req.body;

    // Validate input
    if (!email || !fullname || !table_number || !seat_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, table_number, seat_number',
      });
    }

    // Get email credentials from environment
    const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER || 'nsbouclm@gmail.com';
    const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (!EMAIL_PASS || EMAIL_PASS === 'your_gmail_app_password_here') {
      console.warn('Nodemailer EMAIL_PASS not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured - please set EMAIL_PASS in environment',
      });
    }

    // Build luxury seat confirmation email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seat Confirmed - BSN Acquaintance Party 2026</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fdf2f7; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf2f7; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(219, 39, 119, 0.12); border: 1px solid #fbcfe8;">
                
                <!-- Hero Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #065f46 0%, #047857 50%, #3b1427 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
                    <!-- UCLM NSBO Sender Profile Emblem (SVG) -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <img src="https://bsn-acquaintance.vercel.app/uclmnsbo.jpg" width="70" height="70" alt="UCLM NSBO Logo" style="display: inline-block; width: 70px; height: 70px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2px solid #a7f3d0;" />
                    </div>
                    <div style="display: inline-block; background: rgba(52, 211, 153, 0.25); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="color: #a7f3d0; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">SEAT RESERVATION CONFIRMED</span>
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #6ee7b7; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      UCLM College of Nursing
                    </p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 36px 30px 20px 30px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <p style="margin: 0 0 6px 0; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Seat Reserved For</p>
                      <h2 style="margin: 0; color: #3b1427; font-size: 24px; font-weight: 800;">${fullname}</h2>
                    </div>

                    <!-- Ticket Stub Container -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 20px; padding: 28px 20px; text-align: center; margin-bottom: 30px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.12);">
                      <p style="margin: 0 0 12px 0; color: #065f46; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Your Reserved Seat Location</p>
                      
                      <!-- Seat Badge Grid -->
                      <div style="display: inline-block; background: #ffffff; border-radius: 16px; padding: 18px 28px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); border: 1px solid #a7f3d0; margin-bottom: 16px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800; color: #047857; letter-spacing: 2px;">
                          TABLE ${table_number} &bull; SEAT ${seat_number}
                        </span>
                      </div>

                      <div>
                        <a href="${eventUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);">
                          View Seat Map
                        </a>
                      </div>
                    </div>

                    <!-- Details Card -->
                    <div style="background: #fdf2f7; border-radius: 18px; padding: 24px; border: 1px solid #fbcfe8; margin-bottom: 24px; text-align: center;">
                      <h3 style="margin: 0 0 8px 0; color: #3b1427; font-size: 16px; font-weight: 800;">
                        See You at the Event!
                      </h3>
                      <p style="margin: 0 0 12px 0; color: #831843; font-size: 13px; line-height: 1.6;">
                        Your seat is officially locked in. Please keep this email as your digital pass for entry at the event.
                      </p>
                      <p style="margin: 0; color: #be185d; font-size: 12px; font-weight: 700;">
                        Event URL: <a href="${eventUrl}" style="color: #db2777; text-decoration: underline;">${eventUrl}</a>
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fdf2f7; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
                    <p style="margin: 0 0 6px 0; color: #047857; font-size: 13px; font-weight: 700;">Get ready for an unforgettable night!</p>
                    <p style="margin: 0; color: #831843; font-size: 11px; font-weight: 500;">UCLM College of Nursing • BSN Acquaintance Party 2026</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send via Nodemailer
    const transporter = process.env.SMTP_HOST
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

    const info = await transporter.sendMail({
      from: `"BSN Acquaintance Party" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your Seat is Confirmed - BSN Acquaintance Party 2026',
      text: `Hello ${fullname},\n\nYour seat reservation for the BSN Acquaintance Party 2026 is confirmed!\nTable: ${table_number}\nSeat: ${seat_number}\n\nView the seat map here: ${eventUrl}\n\nThank you,\nUCLM College of Nursing`,
      html: emailHtml,
    });

    console.log('Seat confirmation email sent via Nodemailer:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Seat confirmation email sent successfully!',
      email_id: info.messageId,
    });
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
}
