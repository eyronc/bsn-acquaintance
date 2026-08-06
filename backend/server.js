import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;

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

    if (!RESEND_API_KEY) {
      console.warn('Resend API key not configured');
      return res.json({
        success: false,
        message: 'Email service not configured - check VITE_RESEND_API_KEY',
        email_would_send: true,
      });
    }

    const emailHtml = `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FDE8F0 0%, #FDF2F7 45%, #FFFFFF 100%);">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #3b1427; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">BSN Acquaintance Party 2026</h1>
          <p style="color: #ec4899; font-size: 14px; margin: 8px 0 0 0; font-weight: 500;">UCLM College of Nursing</p>
        </div>

        <div style="background: #f9eaf1; border-radius: 16px; padding: 40px; margin: 30px 0; box-shadow: 8px 8px 18px rgba(220, 174, 196, 0.3), -8px -8px 18px rgba(255, 255, 255, 0.8);">
          <p style="color: #3b1427; font-size: 14px; margin: 0 0 16px 0; font-weight: 500; text-align: center;">Welcome,</p>
          <h2 style="color: #3b1427; font-size: 28px; margin: 0 0 30px 0; text-align: center; font-weight: 700;">${fullname}</h2>
          <p style="color: #3b1427; font-size: 14px; margin: 0 0 20px 0; text-align: center; font-weight: 500;">Your Access Code:</p>
          <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; text-align: center; box-shadow: inset 3px 3px 6px rgba(220, 174, 196, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.6);">
            <code style="font-size: 36px; font-weight: 700; color: #ec4899; letter-spacing: 2px; font-family: 'Courier New', monospace;">${unique_code}</code>
          </div>
        </div>

        <div style="background: #f9eaf1; border-radius: 16px; padding: 32px; margin: 20px 0; box-shadow: 8px 8px 18px rgba(220, 174, 196, 0.3), -8px -8px 18px rgba(255, 255, 255, 0.8);">
          <h3 style="color: #3b1427; margin: 0 0 20px 0; font-size: 16px; font-weight: 700;">How to Login:</h3>
          <ol style="color: #3b1427; margin: 0; padding-left: 24px; font-size: 14px; line-height: 1.8;">
            <li style="margin-bottom: 12px;">Visit your event URL: <a href="${eventUrl}" style="color: #ec4899; text-decoration: none; font-weight: 600;">${eventUrl}</a></li>
            <li style="margin-bottom: 12px;">Email: <code style="background: rgba(236, 72, 153, 0.1); padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #3b1427;">${email}</code></li>
            <li style="margin-bottom: 12px;">Access Code: <code style="background: rgba(236, 72, 153, 0.1); padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #3b1427;">${unique_code}</code></li>
            <li>Select your seat at the enchanted table</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(220, 174, 196, 0.2);">
          <p style="color: #3b1427; font-size: 14px; margin: 0; font-weight: 500;">See you at the party</p>
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
        from: 'BSN Party <noreply@resend.dev>',
        to: email,
        subject: 'Your Access Code - BSN Acquaintance Party 2026',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to send email via Resend',
        error: error.message,
      });
    }

    const data = await response.json();
    console.log('Access code email sent:', data.id);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
      email_id: data.id,
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

    if (!RESEND_API_KEY) {
      console.warn('Resend API key not configured');
      return res.json({
        success: false,
        message: 'Email service not configured',
      });
    }

    const emailHtml = `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FDE8F0 0%, #FDF2F7 45%, #FFFFFF 100%);">
        
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #3b1427; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">BSN Acquaintance Party 2026</h1>
          <p style="color: #ec4899; font-size: 14px; margin: 8px 0 0 0; font-weight: 500;">UCLM College of Nursing</p>
        </div>

        <div style="background: #f9eaf1; border-radius: 16px; padding: 40px; margin: 30px 0; box-shadow: 8px 8px 18px rgba(220, 174, 196, 0.3), -8px -8px 18px rgba(255, 255, 255, 0.8);">
          
          <p style="color: #3b1427; font-size: 14px; margin: 0 0 16px 0; font-weight: 500; text-align: center;">Your Seat is Confirmed!</p>
          <h2 style="color: #3b1427; font-size: 28px; margin: 0 0 30px 0; text-align: center; font-weight: 700;">${fullname}</h2>
          
          <p style="color: #3b1427; font-size: 14px; margin: 0 0 20px 0; text-align: center; font-weight: 500;">Your Reserved Seat:</p>
          
          <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; text-align: center; box-shadow: inset 3px 3px 6px rgba(220, 174, 196, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.6);">
            <p style="color: #3b1427; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">Table ${table_number} • Seat ${seat_number}</p>
            <p style="color: #ec4899; font-size: 28px; margin: 0; font-weight: 700;">T${table_number} • S${seat_number}</p>
          </div>
        </div>

        <div style="background: #f9eaf1; border-radius: 16px; padding: 32px; margin: 20px 0; box-shadow: 8px 8px 18px rgba(220, 174, 196, 0.3), -8px -8px 18px rgba(255, 255, 255, 0.8);">
          <h3 style="color: #3b1427; margin: 0 0 16px 0; font-size: 16px; font-weight: 700;">See You Soon!</h3>
          <p style="color: #3b1427; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">Your seat is now confirmed and reserved. We look forward to seeing you at the BSN Acquaintance Party 2026!</p>
          <p style="color: #3b1427; font-size: 13px; margin: 0;">
            Event URL: <a href="${eventUrl}" style="color: #ec4899; text-decoration: none; font-weight: 600;">${eventUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(220, 174, 196, 0.2);">
          <p style="color: #3b1427; font-size: 14px; margin: 0; font-weight: 500;">See you at the enchanted table!</p>
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
        from: 'BSN Party <noreply@resend.dev>',
        to: email,
        subject: 'Your Seat is Confirmed - BSN Acquaintance Party 2026',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to send email via Resend',
      });
    }

    const data = await response.json();
    console.log('Seat confirmation email sent:', data.id);

    return res.status(200).json({
      success: true,
      message: 'Seat confirmation email sent successfully!',
      email_id: data.id,
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