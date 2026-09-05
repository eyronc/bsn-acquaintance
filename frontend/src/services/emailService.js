/**
 * Email Service - Calls backend endpoint
 * Works for both local dev and production
 */

// Determine API endpoint based on environment
const getApiEndpoint = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development
    return 'http://localhost:3001/api';
  }
  // Production
  return '/api';
};

// Get event URL
const getEventUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5173';
  }
  return window.location.origin;
};

export async function sendAccessCodeEmail(attendee) {
  try {
    const endpoint = getApiEndpoint();
    const eventUrl = getEventUrl();

    console.log(`Sending access code email via ${endpoint}/send-access-code`);

    const response = await fetch(`${endpoint}/send-access-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: attendee.email,
        fullname: attendee.fullname,
        unique_code: attendee.unique_code,
        society: attendee.society || 'Society A',
        year_level: attendee.year || attendee.year_level,
        section: attendee.section,
        eventUrl: eventUrl,
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

    console.log('Access code email sent successfully:', data.email_id);
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Email service error:', error);
    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const message = isLocal && error.name === 'TypeError'
      ? 'Backend email service is not running on http://localhost:3001. Run "npm --prefix backend dev" to start it.'
      : (error.message || 'Network error sending email');
    return {
      success: false,
      message,
    };
  }
}