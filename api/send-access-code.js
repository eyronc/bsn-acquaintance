import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: Send Access Code Email
 * Production endpoint: /api/send-access-code
 * Matches frontend design with Plus Jakarta Sans font and pink luxury theme
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
    const { email, fullname, unique_code, eventUrl } = req.body;

    // Validate input
    if (!email || !fullname || !unique_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, unique_code',
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

    // Build luxury email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Access Code - BSN Acquaintance Party 2026</title>
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
                  <td style="background: linear-gradient(135deg, #3b1427 0%, #581c37 50%, #831843 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
                    <!-- UCLM NSBO Sender Profile Emblem (SVG) -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <img src="https://bsn-acquaintance.vercel.app/uclmnsbo.jpg" width="70" height="70" alt="UCLM NSBO Logo" style="display: inline-block; width: 70px; height: 70px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2px solid #fbcfe8;" />
                    </div>
                    <div style="display: inline-block; background: rgba(244, 114, 182, 0.2); border: 1px solid rgba(244, 114, 182, 0.4); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="color: #fbcfe8; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">Official Event Pass</span>
                    </div>
                    <h1 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #f472b6; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      UCLM College of Nursing
                    </p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 36px 30px 20px 30px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <p style="margin: 0 0 6px 0; color: #9f1239; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Welcome Guest</p>
                      <h2 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; color: #3b1427; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${fullname}</h2>
                    </div>

                    <!-- Ticket Code Container -->
                    <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 2px dashed #f472b6; border-radius: 20px; padding: 28px 20px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 10px 0; color: #831843; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Your Unique Access Code</p>
                      
                      <div style="background: #ffffff; border-radius: 14px; padding: 14px 24px; display: inline-block; box-shadow: inset 0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(244, 114, 182, 0.15); margin-bottom: 16px;">
                        <code style="font-family: 'Plus Jakarta Sans', 'Inter', monospace; font-size: 28px; font-weight: 700; color: #db2777; letter-spacing: 1px; display: block;">${unique_code}</code>
                      </div>

                      <div>
                        <a href="${eventUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; box-shadow: 0 6px 18px rgba(236, 72, 153, 0.35);">
                          Access Portal & Choose Seat
                        </a>
                      </div>
                    </div>

                    <!-- Login Instructions Card -->
                    <div style="background: #fdf2f7; border-radius: 18px; padding: 24px; border: 1px solid #fbcfe8; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; color: #3b1427; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: 600;">
                        How to Complete Registration:
                      </h3>
                      
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">1</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5;">
                            Go to event portal: <a href="${eventUrl}" style="color: #db2777; font-weight: 700; text-decoration: underline;">${eventUrl}</a>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">2</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5;">
                            Enter email: <code style="background: #ffffff; border: 1px solid #fbcfe8; padding: 2px 8px; border-radius: 6px; color: #be185d; font-weight: 700;">${email}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">3</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5;">
                            Enter Access Code: <code style="background: #ffffff; border: 1px solid #fbcfe8; padding: 2px 8px; border-radius: 6px; color: #be185d; font-weight: 700;">${unique_code}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">4</span>
                          </td>
                          <td style="color: #4c0519; font-size: 13px; line-height: 1.5;">
                            Select your preferred seat at the event table map!
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fdf2f7; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
                    <p style="margin: 0 0 6px 0; color: #831843; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600;">See You at the Event!</p>
                    <p style="margin: 0; color: #9f1239; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 500;">UCLM College of Nursing • BSN Acquaintance Party 2026</p>
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
      subject: 'Your Access Code - BSN Acquaintance Party 2026',
      text: `Hello ${fullname},\n\nYour Access Code for the BSN Acquaintance Party 2026 is: ${unique_code}\n\nAccess the portal to reserve your seat: ${eventUrl}\n\nThank you,\nUCLM College of Nursing`,
      html: emailHtml,
    });

    console.log('Email sent via Nodemailer:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
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
