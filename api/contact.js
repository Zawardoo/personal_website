// ============================================================
// api/contact.js — Vercel Serverless Function for contact form
// Vercel auto-routes POST /api/contact to this file
// ============================================================

const { Resend } = require('resend');

// Simple in-memory rate limiting (per serverless instance)
const submissions = new Map();
const RATE_LIMIT  = 5;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip) {
  const now = Date.now();
  const entry = submissions.get(ip);
  if (!entry || now - entry.first > RATE_WINDOW) {
    submissions.set(ip, { first: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

module.exports = async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many submissions. Try again later.' });
  }

  const { name, email, message, form } = req.body || {};

  // Validate
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ ok: false, error: 'Name is required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'Valid email is required.' });
  }
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ ok: false, error: 'Message is required.' });
  }

  // Check API key
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ ok: false, error: 'Server misconfigured.' });
  }

  const resend    = new Resend(process.env.RESEND_API_KEY);
  const formType  = form === 'webdev' ? 'Web Dev Inquiry' : 'Testing / QA Inquiry';
  const timestamp = new Date().toISOString();
  const recipient = process.env.CONTACT_EMAIL || 'hello@anyalai.dev';
  const sender    = process.env.FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

  try {
    await resend.emails.send({
      from: sender,
      to: [recipient],
      replyTo: email.trim(),
      subject: `[Portfolio] ${formType} from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#8B5CF6">${formType}</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
          <p style="white-space:pre-wrap">${message}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to send. Try again.' });
  }
};
