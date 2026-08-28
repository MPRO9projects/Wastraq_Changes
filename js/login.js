// login.js — page-specific behavior for login.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: client-side validation and the "request
// access" form submit handler.)
//
// login.html is NOT a real authentication system — there is no user
// database, no password hashing, and no session/login backend anywhere
// in this project. Submitting this form records the email as an access
// request for the team to follow up on manually (see
// backend/routers/forms.py POST /api/forms/login).
//
// The password field exists purely for a client-side minimum-length UX
// check below. It is READ ONLY to validate its length — it is never
// included in the request body, matching backend/routers/forms.py's
// LoginInterestRequest model, which has no password field at all.

function handleLogin(e) {
  e.preventDefault();

  var emailEl    = document.getElementById('email');
  var passwordEl = document.getElementById('password');
  var emailErr   = document.getElementById('emailError');
  var passErr    = document.getElementById('passwordError');
  var valid      = true;

  emailErr.innerText = '';
  passErr.innerText  = '';

  if (!emailEl.value.includes('@')) {
    emailErr.innerText = 'Please enter a valid email address.';
    valid = false;
  }
  if (passwordEl.value.length < 6) {
    passErr.innerText = 'Password must be at least 6 characters.';
    valid = false;
  }
  if (!valid) return;

  var btn = document.getElementById('login-btn');
  btn.disabled    = true;
  btn.textContent = 'Submitting…';

  var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

  // Only the email is sent — the password is never read into the payload.
  fetch(WASTRAQ_API + '/api/forms/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailEl.value.trim()
    })
  })
  .then(function(res) {
    if (!res.ok) throw new Error('Server error ' + res.status);
    return res.json();
  })
  .then(function(json) {
    if (json.success) {
      document.getElementById('login-form-state').style.display    = 'none';
      document.getElementById('login-success-state').style.display = 'block';
    } else {
      throw new Error(json.message || 'Submission failed');
    }
  })
  .catch(function(err) {
    btn.disabled    = false;
    btn.textContent = 'Sign In →';
    alert('Something went wrong. Please email us at info@wastraq.com');
    console.error('Login form error:', err);
  });
}
