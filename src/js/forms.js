// ============================================================
// forms.js — Contact form validation & submission
// ============================================================

function initForm(formId, fieldDefs, submitTextId, successId, formType) {
  const form = document.getElementById(formId);
  if (!form) return;

  const fields = {};
  Object.entries(fieldDefs).forEach(([key, def]) => {
    const el  = document.getElementById(def.id);
    const err = document.getElementById(def.errId);
    if (!el || !err) return;
    fields[key] = { el, err, validate: def.validate };
  });

  // Clear errors on input
  Object.values(fields).forEach(f => {
    f.el.addEventListener('input', () => {
      if (f.el.classList.contains('invalid') && f.validate(f.el.value) === true) {
        f.el.classList.remove('invalid');
        f.err.classList.remove('show');
      }
    });
  });

  // Submit handler
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;

    Object.values(fields).forEach(f => {
      const r = f.validate(f.el.value);
      if (r !== true) {
        f.el.classList.add('invalid');
        f.err.textContent = r;
        f.err.classList.add('show');
        ok = false;
      } else {
        f.el.classList.remove('invalid');
        f.err.classList.remove('show');
      }
    });
    if (!ok) return;

    const submitBtn = document.getElementById(submitTextId);
    const successEl = document.getElementById(successId);

    // Disable button while sending
    if (submitBtn) submitBtn.textContent = 'Sending…';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    fields.name.el.value.trim(),
          email:   fields.email.el.value.trim(),
          message: fields.message.el.value.trim(),
          form:    formType,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        if (successEl) successEl.classList.add('show');
        form.reset();
        setTimeout(() => { if (successEl) successEl.classList.remove('show'); }, 4000);
      } else {
        // Server validation error
        if (successEl) {
          successEl.textContent = data.error || 'Something went wrong. Try again.';
          successEl.classList.add('show', 'error');
          setTimeout(() => { successEl.classList.remove('show', 'error'); }, 4000);
        }
      }
    } catch (err) {
      // Network error — show friendly message
      if (successEl) {
        successEl.textContent = 'Network error. Please try again.';
        successEl.classList.add('show', 'error');
        setTimeout(() => { successEl.classList.remove('show', 'error'); }, 4000);
      }
    } finally {
      if (submitBtn) submitBtn.textContent = 'Send message';
      if (btn) btn.disabled = false;
    }
  });
}

export function initForms() {
  // Testing contact form
  initForm('contactForm', {
    name:    { id: 'name',    errId: 'err-name',    validate: v => v.trim().length >= 2 || 'Please enter your name' },
    email:   { id: 'email',   errId: 'err-email',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email' },
    message: { id: 'message', errId: 'err-message',  validate: v => v.trim().length >= 5 || "Message can't be empty" },
  }, 'submitText', 'formSuccess', 'testing');

  // Web dev contact form
  initForm('contactFormWd', {
    name:    { id: 'name-wd',    errId: 'err-name-wd',    validate: v => v.trim().length >= 2 || 'Please enter your name' },
    email:   { id: 'email-wd',   errId: 'err-email-wd',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email' },
    message: { id: 'message-wd', errId: 'err-message-wd', validate: v => v.trim().length >= 5 || 'Please describe your project' },
  }, 'submitTextWd', 'formSuccessWd', 'webdev');
}
