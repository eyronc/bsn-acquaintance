import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config(); // loads backend/.env
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER || 'nsbouclm@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Send access code email endpoint
app.post('/api/send-access-code', async (req, res) => {
  try {
    const { email, fullname, unique_code, eventUrl } = req.body;

    if (!email || !fullname || !unique_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, unique_code',
      });
    }

    if (!EMAIL_PASS || EMAIL_PASS === 'your_gmail_app_password_here') {
      console.warn('Nodemailer EMAIL_PASS not configured in environment');
      return res.json({
        success: false,
        message: 'Email service not configured - please set EMAIL_PASS in backend/.env',
        email_would_send: true,
      });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Access Code - BSN Acquaintance Party 2026</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fdf2f7; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf2f7; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(219, 39, 119, 0.12); border: 1px solid #fbcfe8;">
                
                <!-- Logo & Hero Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b1427 0%, #581c37 50%, #831843 100%); padding: 32px 30px 24px 30px; text-align: center; color: #ffffff;">
                    <img src="http://localhost:5173/uclmnsbo.jpg" alt="UCLM NSBO Logo" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(244, 114, 182, 0.3); margin-bottom: 12px; display: inline-block;">
                    
                    <div style="display: inline-block; background: rgba(244, 114, 182, 0.2); border: 1px solid rgba(244, 114, 182, 0.4); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="color: #fbcfe8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Official Event Pass</span>
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #f472b6; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                      UCLM College of Nursing
                    </p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 36px 30px 20px 30px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <p style="margin: 0 0 6px 0; color: #9f1239; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Welcome Guest</p>
                      <h2 style="margin: 0; color: #3b1427; font-size: 24px; font-weight: 800; font-family: 'Inter', system-ui, -apple-system, sans-serif;">${fullname}</h2>
                    </div>

                    <!-- Ticket Code Container -->
                    <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 2px dashed #f472b6; border-radius: 20px; padding: 28px 20px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 10px 0; color: #831843; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Your Unique Access Code</p>
                      
                      <div style="background: #ffffff; border-radius: 14px; padding: 16px 20px; display: inline-block; box-shadow: inset 0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(244, 114, 182, 0.15); margin-bottom: 16px;">
                        <code style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #db2777; letter-spacing: 4px; display: block;">${unique_code}</code>
                      </div>

                      <div>
                        <a href="${eventUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 6px 18px rgba(236, 72, 153, 0.35); font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                          Access Portal & Choose Seat →
                        </a>
                      </div>
                    </div>

                    <!-- Login Instructions Card -->
                    <div style="background: #fdf2f7; border-radius: 18px; padding: 24px; border: 1px solid #fbcfe8; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; color: #3b1427; font-size: 15px; font-weight: 800; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                        How to Complete Registration:
                      </h3>
                      
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">1</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                            Go to event portal: <a href="${eventUrl}" style="color: #db2777; font-weight: 700; text-decoration: underline;">${eventUrl}</a>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">2</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                            Enter email: <code style="background: #ffffff; border: 1px solid #fbcfe8; padding: 2px 8px; border-radius: 6px; color: #be185d; font-weight: 700;">${email}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">3</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #4c0519; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                            Enter Access Code: <code style="background: #ffffff; border: 1px solid #fbcfe8; padding: 2px 8px; border-radius: 6px; color: #be185d; font-weight: 700;">${unique_code}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top">
                            <span style="background: #ec4899; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">4</span>
                          </td>
                          <td style="color: #4c0519; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                            Select your preferred seat at the enchanted table map!
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fdf2f7; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
                    <p style="margin: 0 0 6px 0; color: #831843; font-size: 13px; font-weight: 700; font-family: 'Inter', system-ui, -apple-system, sans-serif;">We look forward to seeing you!</p>
                    <p style="margin: 0; color: #9f1239; font-size: 11px; font-weight: 500; font-family: 'Inter', system-ui, -apple-system, sans-serif;">UCLM College of Nursing • BSN Acquaintance Party 2026</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"BSN Party" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your Access Code - BSN Acquaintance Party 2026',
      html: emailHtml,
    });

    console.log('Access code email sent via Nodemailer:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
      email_id: info.messageId,
    });
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// Send seat confirmation email endpoint
app.post('/api/send-seat-confirmation', async (req, res) => {
  try {
    const { email, fullname, table_number, seat_number, eventUrl } = req.body;

    if (!email || !fullname || !table_number || !seat_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, table_number, seat_number',
      });
    }

    if (!EMAIL_PASS || EMAIL_PASS === 'your_gmail_app_password_here') {
      console.warn('Nodemailer EMAIL_PASS not configured in environment');
      return res.json({
        success: false,
        message: 'Email service not configured - please set EMAIL_PASS in backend/.env',
      });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seat Confirmed - BSN Acquaintance Party 2026</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fdf2f7; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf2f7; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(219, 39, 119, 0.12); border: 1px solid #fbcfe8;">
                
                <!-- Logo & Hero Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #065f46 0%, #047857 50%, #3b1427 100%); padding: 32px 30px 24px 30px; text-align: center; color: #ffffff;">
                    <img src="http://localhost:5173/uclmnsbo.jpg" alt="UCLM NSBO Logo" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(52, 211, 153, 0.3); margin-bottom: 12px; display: inline-block;">
                    
                    <div style="display: inline-block; background: rgba(52, 211, 153, 0.25); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="color: #a7f3d0; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Seat Reservation Confirmed</span>
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #6ee7b7; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                      UCLM College of Nursing
                    </p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 36px 30px 20px 30px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <p style="margin: 0 0 6px 0; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Seat Reserved For</p>
                      <h2 style="margin: 0; color: #3b1427; font-size: 24px; font-weight: 800; font-family: 'Inter', system-ui, -apple-system, sans-serif;">${fullname}</h2>
                    </div>

                    <!-- Ticket Stub Container -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 20px; padding: 28px 20px; text-align: center; margin-bottom: 30px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.12);">
                      <p style="margin: 0 0 12px 0; color: #065f46; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Your Reserved Seat Location</p>
                      
                      <!-- Seat Badge Grid -->
                      <div style="display: inline-block; background: #ffffff; border-radius: 16px; padding: 18px 28px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); border: 1px solid #a7f3d0; margin-bottom: 16px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800; color: #047857; letter-spacing: 2px;">
                          TABLE ${table_number} &bull; SEAT ${seat_number}
                        </span>
                      </div>

                      <div>
                        <a href="${eventUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35); font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                          View Seat Map →
                        </a>
                      </div>
                    </div>

                    <!-- Details Card -->
                    <div style="background: #fdf2f7; border-radius: 18px; padding: 24px; border: 1px solid #fbcfe8; margin-bottom: 24px; text-align: center;">
                      <h3 style="margin: 0 0 8px 0; color: #3b1427; font-size: 16px; font-weight: 800; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                        See You at the Enchanted Table!
                      </h3>
                      <p style="margin: 0 0 12px 0; color: #831843; font-size: 13px; line-height: 1.6; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                        Your seat is officially locked in. Please keep this email as your digital pass for entry at the event.
                      </p>
                      <p style="margin: 0; color: #be185d; font-size: 12px; font-weight: 700; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                        Event URL: <a href="${eventUrl}" style="color: #db2777; text-decoration: underline;">${eventUrl}</a>
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fdf2f7; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
                    <p style="margin: 0 0 6px 0; color: #047857; font-size: 13px; font-weight: 700; font-family: 'Inter', system-ui, -apple-system, sans-serif;">Get ready for an unforgettable night!</p>
                    <p style="margin: 0; color: #831843; font-size: 11px; font-weight: 500; font-family: 'Inter', system-ui, -apple-system, sans-serif;">UCLM College of Nursing • BSN Acquaintance Party 2026</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"BSN Party" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your Seat is Confirmed - BSN Acquaintance Party 2026',
      html: emailHtml,
    });

    console.log('Seat confirmation email sent via Nodemailer:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Seat confirmation email sent successfully!',
      email_id: info.messageId,
    });
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Email endpoints: POST http://localhost:${PORT}/api/send-access-code`);
  console.log(`                 POST http://localhost:${PORT}/api/send-seat-confirmation`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
});