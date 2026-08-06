/**
 * Email Service - Calls backend endpoint
 * Works for both local dev and production
 */

// Determine API endpoint based on environment
const getApiEndpoint = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development
    return 'http://localhost:3001/api/send-access-code';
  }
  // Production
  return '/api/send-access-code';
};

export async function sendAccessCodeEmail(attendee) {
  try {
    const endpoint = getApiEndpoint();

    console.log(`📧 Sending email via ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: attendee.email,
        fullname: attendee.fullname,
        unique_code: attendee.unique_code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Email service error:', data.message);
      return {
        success: false,
        message: data.message || 'Failed to send email',
      };
    }

    console.log('✅ Email sent successfully:', data.email_id);
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      message: error.message || 'Network error sending email',
    };
  }
}