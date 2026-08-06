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

// Send email endpoint
app.post('/api/send-access-code', async (req, res) => {
  try {
    const { email, fullname, unique_code } = req.body;

    // Validate input
    if (!email || !fullname || !unique_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, fullname, unique_code',
      });
    }

    // Check if API key is configured
    if (!RESEND_API_KEY) {
      console.warn('⚠️  Resend API key not configured');
      console.log(`Email would be sent to ${email} with code: ${unique_code}`);
      return res.json({
        success: false,
        message: 'Email service not configured - check VITE_RESEND_API_KEY',
        email_would_send: true,
      });
    }

    // Build email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4A3F5C; font-size: 28px; margin: 0;">✨ BSN Acquaintance Party 2026</h1>
          <p style="color: #FFB6D9; font-size: 14px; margin: 5px 0;">UCLM College of Nursing</p>
        </div>

        <div style="background: linear-gradient(135deg, #FFB6D9 0%, #E6D4F7 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
          <p style="color: white; margin: 0 0 10px 0; font-size: 14px;">Welcome,</p>
          <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px;">${fullname}</h2>
          
          <p style="color: white; margin: 0 0 15px 0; font-size: 14px;">Your Access Code:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <code style="font-size: 32px; font-weight: bold; color: #FFB6D9; letter-spacing: 4px;">
              ${unique_code}
            </code>
          </div>
        </div>

        <div style="background: #FEF9F3; border-left: 4px solid #4A3F5C; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #4A3F5C; margin: 0 0 10px 0; font-size: 16px;">How to Login:</h3>
          <ol style="color: #4A3F5C; margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Visit your event URL</li>
            <li>Email: <code>${email}</code></li>
            <li>Access Code: <code>${unique_code}</code></li>
            <li>Select your seat at the enchanted table!</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p style="margin: 0;">See you at the party! ✨</p>
        </div>
      </div>
    `;

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BSN Party <noreply@resend.dev>',
        to: email,
        subject: '🎉 Your Access Code - BSN Acquaintance Party 2026',
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
    console.log('✅ Email sent:', data.id);

    return res.json({
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: POST http://localhost:${PORT}/api/send-access-code`);
  console.log(`✅ Health check: GET http://localhost:${PORT}/health`);
});