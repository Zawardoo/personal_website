// ============================================================
// server.js — Express server for static site + contact form
// Uses Resend for email delivery
// ============================================================

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Resend client ──
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  console.warn('  RESEND_API_KEY not set — form submissions will log to console only.');
}

// ── Security ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Rate limiting ──
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { ok: false, error: 'Too many submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Contact endpoint ──
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message, form } = req.body;

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

  const formType  = form === 'webdev' ? 'Web Dev Inquiry' : 'Testing / QA Inquiry';
  const timestamp = new Date().toISOString();
  const recipient = process.env.CONTACT_EMAIL || 'hello@anyalai.dev';

  console.log(`\n  New ${formType} from ${name} <${email}> at ${timestamp}`);

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
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
      console.log('  Email sent via Resend.');
    } catch (err) {
      console.error('  Resend error:', err.message);
    }
  }

  res.json({ ok: true });
});

// ── Static files ──
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html',
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n  Server running on http://localhost:${PORT}`);
  console.log(`  Resend: ${resend ? 'configured' : 'not configured (console only)'}\n`);
});
