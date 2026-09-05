import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { getSocietyEmailTheme } from '../api/society-email-theme.js';

dotenv.config(); // loads backend/.env
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend running with multi-tier email failover',
    hasResendKey: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')),
    hasBrevoKey: Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.startsWith('xkeysib-')),
    hasGmailPass: Boolean(process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password_here'),
  });
});

function formatStudentClass(year, section) {
  if (!year && !section) return '';
  const numYear = year ? String(year).replace(/\D/g, '') : '';
  const sec = section ? String(section).replace(/^Section\s*/i, '').trim().toUpperCase() : '';
  return numYear || sec ? `BSN - ${numYear}${sec}` : '';
}

// Access Code endpoint with 3-tier failover
app.post('/api/send-access-code', async (req, res) => {
  try {
    const { email, fullname, unique_code, society, year_level, section, eventUrl: providedUrl } = req.body;

    if (!email || !fullname || !unique_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, unique_code',
      });
    }

    const eventUrl = providedUrl || process.env.EVENT_URL || 'https://bsn-acquaintance.online';
    const socTheme = getSocietyEmailTheme(society);
    const classBadge = formatStudentClass(year_level, section);
    const subject = `Your Access Code - BSN Acquaintance Party 2026 (${socTheme.name})`;

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
      <body style="margin: 0; padding: 0; background-color: ${socTheme.bodyBg}; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${socTheme.bodyBg}; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08); border: 1px solid ${socTheme.cardBorder};">
                <tr>
                  <td style="background: ${socTheme.headerBg}; padding: 40px 30px; text-align: center; color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 16px;">
                      <img src="https://bsn-acquaintance.online/uclmnsbo.jpg" width="70" height="70" alt="UCLM NSBO Logo" style="display: inline-block; width: 70px; height: 70px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2px solid ${socTheme.logoBorder};" />
                    </div>
                    <div style="display: inline-block; background: ${socTheme.badgeBg}; border: 1px solid ${socTheme.badgeBorder}; border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="color: ${socTheme.badgeText}; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">OFFICIAL EVENT PASS • ${socTheme.name}</span>
                    </div>
                    <h1 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; color: ${socTheme.subtext}; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      UCLM College of Nursing
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 30px 20px 30px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <p style="margin: 0 0 6px 0; color: ${socTheme.accentDark}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Welcome Registered Attendee</p>
                      <h2 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; color: ${socTheme.highlightText}; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${fullname}</h2>
                      ${classBadge ? `<p style="margin: 6px 0 0 0; color: #475569; font-size: 13px; font-weight: 700;">${classBadge}</p>` : ''}
                    </div>

                    <div style="background: ${socTheme.ticketCardBg}; border: 2px dashed ${socTheme.ticketBorder}; border-radius: 20px; padding: 28px 20px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 10px 0; color: ${socTheme.highlightText}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Your Unique Access Code (${socTheme.name})</p>
                      <div style="background: #ffffff; border-radius: 14px; padding: 14px 24px; display: inline-block; box-shadow: 0 4px 14px ${socTheme.accentShadow}; border: 1px solid ${socTheme.cardBorder}; margin-bottom: 16px;">
                        <code style="font-family: 'Plus Jakarta Sans', 'Inter', monospace; font-size: 28px; font-weight: 800; color: ${socTheme.accentDark}; letter-spacing: 2px; display: block;">${unique_code}</code>
                      </div>
                      <div>
                        <a href="${eventUrl}" target="_blank" style="display: inline-block; background: ${socTheme.accentColor}; color: #ffffff; text-decoration: none; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 6px 18px ${socTheme.accentShadow};">
                          Access Portal & Choose Seat
                        </a>
                      </div>
                    </div>

                    <div style="background: ${socTheme.bodyBg}; border-radius: 18px; padding: 24px; border: 1px solid ${socTheme.cardBorder}; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; color: ${socTheme.highlightText}; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: 700;">
                        How to Complete Registration:
                      </h3>
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: ${socTheme.accentColor}; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">1</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #334155; font-size: 13px; line-height: 1.5;">
                            Go to event portal: <a href="${eventUrl}" style="color: ${socTheme.accentDark}; font-weight: 700; text-decoration: underline;">${eventUrl}</a>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: ${socTheme.accentColor}; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">2</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #334155; font-size: 13px; line-height: 1.5;">
                            Enter your email: <code style="background: #ffffff; border: 1px solid ${socTheme.cardBorder}; padding: 2px 8px; border-radius: 6px; color: ${socTheme.highlightText}; font-weight: 700;">${email}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top" style="padding-bottom: 12px;">
                            <span style="background: ${socTheme.accentColor}; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">3</span>
                          </td>
                          <td style="padding-bottom: 12px; color: #334155; font-size: 13px; line-height: 1.5;">
                            Enter Access Code: <code style="background: #ffffff; border: 1px solid ${socTheme.cardBorder}; padding: 2px 8px; border-radius: 6px; color: ${socTheme.highlightText}; font-weight: 700;">${unique_code}</code>
                          </td>
                        </tr>
                        <tr>
                          <td width="28" valign="top">
                            <span style="background: ${socTheme.accentColor}; color: #ffffff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; line-height: 20px;">4</span>
                          </td>
                          <td style="color: #334155; font-size: 13px; line-height: 1.5;">
                            Select your reserved seat in <strong>${socTheme.name} (Row ${socTheme.row})</strong>!
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="background: #ffffff; border-radius: 16px; padding: 18px 20px; border: 1px solid ${socTheme.cardBorder}; margin-bottom: 20px;">
                      <p style="margin: 0 0 6px 0; color: #0f172a; font-size: 12px; font-weight: 700;">
                        Venue: Mactan Expo Center &bull; Date: September 26, 2026 (Saturday)
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 11.5px; font-weight: 500;">
                        Time: 5:00 PM – 10:00 PM &bull; Theme: Celestial Garden: A night of Wonder and Grace
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: ${socTheme.bodyBg}; padding: 24px 30px; text-align: center; border-top: 1px solid ${socTheme.cardBorder};">
                    <p style="margin: 0 0 6px 0; color: ${socTheme.highlightText}; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 700;">See You at the Event!</p>
                    <p style="margin: 0; color: #64748b; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 500;">UCLM College of Nursing • BSN Acquaintance Party 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Tier 1: Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const resend = new Resend(resendApiKey);
        const resendResponse = await resend.emails.send({
          from: 'UCLM NSBO <access-code@bsn-acquaintance.online>',
          to: [email],
          reply_to: 'nsbouclm@gmail.com',
          subject: subject,
          html: emailHtml,
        });

        if (resendResponse.error) throw new Error(resendResponse.error.message);

        console.log('Access code sent via Tier 1 (Resend):', resendResponse.data?.id);
        return res.status(200).json({
          success: true,
          message: 'Access code sent successfully!',
          email_id: resendResponse.data?.id,
          provider: 'resend',
        });
      } catch (err) {
        console.warn('Tier 1 (Resend) failed or exhausted:', err.message, '-> Trying Tier 2 (Brevo / Gmail)...');
      }
    }

    // Tier 2: Brevo
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'UCLM NSBO', email: 'access-code@bsn-acquaintance.online' },
            to: [{ email: email, name: fullname }],
            replyTo: { email: 'nsbouclm@gmail.com', name: 'UCLM NSBO' },
            subject: subject,
            htmlContent: emailHtml,
          }),
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok && brevoData.messageId) {
          console.log('Access code sent via Tier 2 (Brevo):', brevoData.messageId);
          return res.status(200).json({
            success: true,
            message: 'Access code sent successfully!',
            email_id: brevoData.messageId,
            provider: 'brevo',
          });
        }
        throw new Error(brevoData.message || 'Brevo sending failed');
      } catch (err) {
        console.warn('Tier 2 (Brevo) failed:', err.message, '-> Trying Tier 3 (Gmail Nodemailer)...');
      }
    }

    // Tier 3: Gmail Nodemailer
    const EMAIL_USER = process.env.EMAIL_USER || 'nsbouclm@gmail.com';
    const EMAIL_PASS = process.env.EMAIL_PASS;
    if (EMAIL_PASS && EMAIL_PASS !== 'your_gmail_app_password_here') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      const info = await transporter.sendMail({
        from: `"UCLM NSBO" <${EMAIL_USER}>`,
        to: email,
        replyTo: 'nsbouclm@gmail.com',
        subject: subject,
        html: emailHtml,
      });

      console.log('Access code sent via Tier 3 (Gmail Nodemailer):', info.messageId);
      return res.status(200).json({
        success: true,
        message: 'Access code sent successfully!',
        email_id: info.messageId,
        provider: 'nodemailer',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email service could not send message. Please configure RESEND_API_KEY, BREVO_API_KEY, or EMAIL_PASS.',
    });
  } catch (error) {
    console.error('Backend error sending access code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// Seat confirmation endpoint with 3-tier failover
app.post('/api/send-seat-confirmation', async (req, res) => {
  try {
    const { email, fullname, table_number, seat_number, society, unique_code, year_level, section, eventUrl: providedUrl } = req.body;

    if (!email || !fullname || !table_number || !seat_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, table_number, seat_number',
      });
    }

    const eventUrl = providedUrl || process.env.EVENT_URL || 'https://bsn-acquaintance.online';
    const socTheme = getSocietyEmailTheme(society);
    const classBadge = formatStudentClass(year_level, section);
    const subject = `Your Seat is Confirmed - BSN Acquaintance Party 2026 (${socTheme.name})`;

    const tableDisplay = String(table_number).includes('-') ? table_number : `${socTheme.row}-${String(table_number).padStart(2, '0')}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BSN Acquaintance Party 2026 - Official Ticket</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${socTheme.bodyBg}; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${socTheme.bodyBg}; padding: 36px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: ${socTheme.cardBg}; border-radius: 28px; overflow: hidden; border: 2.5px solid ${socTheme.accentColor}; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);">
                
                <!-- Ticket Header Banner (Solid vibrant society color) -->
                <tr>
                  <td style="background-color: ${socTheme.accentColor}; padding: 24px 20px; text-align: center; color: #ffffff;">
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.22); border-radius: 50px; padding: 4px 14px; margin-bottom: 8px;">
                      <span style="color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                        &#10003; OFFICIAL EVENT PASS
                      </span>
                    </div>
                    <h1 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      BSN Acquaintance Party 2026
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 11px; font-weight: 600; opacity: 0.95; font-style: italic;">
                      Theme: Celestial Garden: A night of Wonder and Grace
                    </p>
                  </td>
                </tr>

                <!-- Ticket Card Body -->
                <tr>
                  <td style="padding: 24px 22px;">
                    
                    <!-- Attendee Name & Access Code Row -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid rgba(0, 0, 0, 0.08); padding-bottom: 18px; margin-bottom: 20px;">
                      <tr>
                        <td valign="top" align="left">
                          <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                            ATTENDEE NAME
                          </p>
                          <h2 style="margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2;">
                            ${fullname}
                          </h2>
                          <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 13px; font-weight: 800; color: #334155;">
                            ${classBadge}
                          </p>
                        </td>
                        <td valign="top" align="right">
                          <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                            ACCESS CODE
                          </p>
                          <div style="display: inline-block; background-color: #0f172a; border-radius: 10px; padding: 6px 12px;">
                            <span style="font-family: monospace; font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">
                              ${unique_code || 'CONFIRMED'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- 3 Badge Grid: Society Zone | Table Number | Seat Number -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <!-- Society Zone Badge -->
                        <td width="33%" align="center" style="padding-right: 4px;">
                          <div style="background-color: #ffffff; border: 1.5px solid ${socTheme.border}; border-radius: 14px; padding: 12px 6px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <span style="display: block; font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">
                              SOCIETY ZONE
                            </span>
                            <span style="display: block; font-size: 14px; font-weight: 900; color: ${socTheme.accentColor};">
                              ${socTheme.name}
                            </span>
                          </div>
                        </td>
                        
                        <!-- Table Number Badge -->
                        <td width="33%" align="center" style="padding: 0 2px;">
                          <div style="background-color: #ffffff; border: 1.5px solid #a7f3d0; border-radius: 14px; padding: 12px 6px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <span style="display: block; font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #065f46; margin-bottom: 2px;">
                              TABLE NUMBER
                            </span>
                            <span style="display: block; font-size: 19px; font-weight: 900; color: #064e3b; letter-spacing: -0.5px;">
                              ${tableDisplay}
                            </span>
                          </div>
                        </td>

                        <!-- Seat Number Badge -->
                        <td width="33%" align="center" style="padding-left: 4px;">
                          <div style="background-color: #ffffff; border: 1.5px solid #a7f3d0; border-radius: 14px; padding: 12px 6px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <span style="display: block; font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #065f46; margin-bottom: 2px;">
                              SEAT NUMBER
                            </span>
                            <span style="display: block; font-size: 17px; font-weight: 900; color: #064e3b; letter-spacing: -0.5px;">
                              Seat ${seat_number}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Official Event Information Pill Box -->
                    <div style="background-color: rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; padding: 14px 16px; margin-bottom: 20px;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-bottom: 6px; font-size: 11.5px; color: #334155;">
                            &#128205; <strong>Venue: Mactan Expo Center</strong>
                          </td>
                          <td style="padding-bottom: 6px; font-size: 11.5px; color: #334155; text-align: right;">
                            &#128197; <strong>September 26, 2026 (Saturday)</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 8px; font-size: 11.5px; color: #334155;">
                            &#128337; <strong>Time: 5:00 PM &ndash; 10:00 PM</strong>
                          </td>
                          <td style="padding-bottom: 8px; font-size: 11.5px; color: #047857; text-align: right; font-weight: 800;">
                            &#9989; <strong>Status: Confirmed &amp; Valid</strong>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 6px 0 0 0; padding-top: 6px; border-top: 1px solid rgba(0, 0, 0, 0.06); font-size: 10px; color: #64748b; line-height: 1.4; text-align: center;">
                        Please present this official pass upon entering Mactan Expo Center. Your seat reservation is verified and final.
                      </p>
                    </div>

                    <!-- Direct Pass Button -->
                    <div style="text-align: center;">
                      <a href="${eventUrl}/pass" target="_blank" style="display: inline-block; background-color: ${socTheme.accentColor}; color: #ffffff; text-decoration: none; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
                        View &amp; Save Ticket on Web
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- Clean Footer -->
                <tr>
                  <td style="background-color: rgba(0, 0, 0, 0.03); padding: 14px 20px; text-align: center; border-top: 1px solid rgba(0, 0, 0, 0.06);">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b;">
                      UCLM College of Nursing &bull; BSN Acquaintance Party 2026
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Tier 1: Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const resend = new Resend(resendApiKey);
        const resendResponse = await resend.emails.send({
          from: 'UCLM BSN Acquaintance 2026 <tickets@bsn-acquaintance.online>',
          to: [email],
          reply_to: 'nsbouclm@gmail.com',
          subject: subject,
          html: emailHtml,
        });

        if (resendResponse.error) throw new Error(resendResponse.error.message);

        console.log('Seat confirmation sent via Tier 1 (Resend):', resendResponse.data?.id);
        return res.status(200).json({
          success: true,
          message: 'Seat confirmation email sent successfully!',
          email_id: resendResponse.data?.id,
          provider: 'resend',
        });
      } catch (err) {
        console.warn('Tier 1 (Resend) failed or exhausted:', err.message, '-> Trying Tier 2 (Brevo / Gmail)...');
      }
    }

    // Tier 2: Brevo
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'UCLM BSN Acquaintance 2026', email: 'tickets@bsn-acquaintance.online' },
            to: [{ email: email, name: fullname }],
            replyTo: { email: 'nsbouclm@gmail.com', name: 'UCLM NSBO' },
            subject: subject,
            htmlContent: emailHtml,
          }),
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok && brevoData.messageId) {
          console.log('Seat confirmation sent via Tier 2 (Brevo):', brevoData.messageId);
          return res.status(200).json({
            success: true,
            message: 'Seat confirmation email sent successfully!',
            email_id: brevoData.messageId,
            provider: 'brevo',
          });
        }
        throw new Error(brevoData.message || 'Brevo sending failed');
      } catch (err) {
        console.warn('Tier 2 (Brevo) failed:', err.message, '-> Trying Tier 3 (Gmail Nodemailer)...');
      }
    }

    // Tier 3: Gmail Nodemailer
    const EMAIL_USER = process.env.EMAIL_USER || 'nsbouclm@gmail.com';
    const EMAIL_PASS = process.env.EMAIL_PASS;
    if (EMAIL_PASS && EMAIL_PASS !== 'your_gmail_app_password_here') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      const info = await transporter.sendMail({
        from: `"UCLM BSN Acquaintance 2026" <${EMAIL_USER}>`,
        to: email,
        replyTo: 'nsbouclm@gmail.com',
        subject: subject,
        html: emailHtml,
      });

      console.log('Seat confirmation sent via Tier 3 (Gmail Nodemailer):', info.messageId);
      return res.status(200).json({
        success: true,
        message: 'Seat confirmation email sent successfully!',
        email_id: info.messageId,
        provider: 'nodemailer',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email service could not send message. Please configure RESEND_API_KEY, BREVO_API_KEY, or EMAIL_PASS.',
    });
  } catch (error) {
    console.error('Backend error sending seat confirmation:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Email system: Multi-Tier Failover (Resend -> Brevo -> Gmail Nodemailer)`);
});