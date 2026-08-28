// register.js — page-specific behavior for register.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: geolocation auto-fill and the "request
// access" form submit handler.)
//
// register.html is NOT a real account-creation system — there is no user
// database, no password hashing, and no session/login backend anywhere
// in this project. Submitting this form records the applicant's details
// as an access request for the team to follow up on manually (see
// backend/routers/forms.py POST /api/forms/register).
//
// The password field exists purely for a client-side minimum-length UX
// check below. It is READ ONLY to validate its length — it is never
// included in the request payload, matching backend/routers/forms.py's
// RegisterRequest model, which has no password field at all.

/* Auto-detect location on page load */
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      document.getElementById('location').value = pos.coords.latitude + ', ' + pos.coords.longitude;
    },
    function() {}
  );
}

/* Manual location button */
document.getElementById('getLocationBtn').addEventListener('click', function() {
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      document.getElementById('location').value = pos.coords.latitude + ', ' + pos.coords.longitude;
    },
    function() {
      document.getElementById('location').value = 'Location access denied';
    }
  );
});

/* Form submission — sends to WASTRAQ backend; password is never read into the payload */
function handleRegister(e) {
  e.preventDefault();

  var password = document.getElementById('password').value;
  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  var btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

  var payload = {
    fname:    document.getElementById('fname').value.trim(),
    lname:    document.getElementById('lname').value.trim(),
    email:    document.getElementById('email').value.trim(),
    phone:    document.getElementById('phone').value.trim(),
    location: document.getElementById('location').value.trim()
  };

  fetch(WASTRAQ_API + '/api/forms/register', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload)
  })
  .then(function(res) {
    if (!res.ok) throw new Error('Server error ' + res.status);
    return res.json();
  })
  .then(function(json) {
    if (json.success) {
      document.getElementById('register-form-state').style.display   = 'none';
      document.getElementById('register-success-state').style.display = 'block';
    } else {
      throw new Error(json.message || 'Submission failed');
    }
  })
  .catch(function(err) {
    btn.disabled    = false;
    btn.textContent = 'Create Account →';
    alert('Something went wrong. Please try again or email us at info@wastraq.com');
    console.error('Register form error:', err);
  });
}
