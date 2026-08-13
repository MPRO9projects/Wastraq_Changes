(function () {
  const CONSENT_KEY = "wastraq_cookie_consent";
  const REJECT_TIME_KEY = "wastraq_cookie_rejected_at";
  const REJECT_DURATION = 24 * 60 * 60 * 1000; // 1 day

  function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
  }

  function saveConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
  }

  function createCookieBanner() {

    const consent = getConsent();

    if (consent === "accepted") {
        return;
    }

    if (consent === "rejected") {

        const rejectedAt = localStorage.getItem(REJECT_TIME_KEY);

        if (
            rejectedAt &&
            (Date.now() - Number(rejectedAt)) < REJECT_DURATION
        ) {
            return;
        }

        // More than 1 day has passed
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(REJECT_TIME_KEY);
    }

    const banner = document.createElement("div");
    banner.id = "wastraq-cookie-banner";

    banner.innerHTML = `
      <div class="wastraq-cookie-box">
        <div>
          <h3>We use cookies</h3>
          <p>
            WASTRAQ uses cookies to improve your browsing experience,
            remember your preferences, analyze website performance, and support
            better platform functionality.
            <a href="cookies.html">Read Cookie Policy</a>
          </p>
        </div>

        <div class="wastraq-cookie-actions">
          <button id="wastraq-reject-cookies" type="button">Reject</button>
          <button id="wastraq-accept-cookies" type="button">Accept</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    banner.style.display = "block";

    document
      .getElementById("wastraq-accept-cookies")
      .addEventListener("click", function () {
        saveConsent("accepted");
        banner.remove();
        loadTrackingScripts();

        /*
          Later, if you add Google Analytics, Meta Pixel,
          LinkedIn Pixel, etc., load them here only after accept.
        */
      });

    document
  .getElementById("wastraq-reject-cookies")
  .addEventListener("click", function () {

      saveConsent("rejected");

      localStorage.setItem(
          REJECT_TIME_KEY,
          Date.now()
      );

      banner.remove();

  });
  }

  document.addEventListener("DOMContentLoaded", createCookieBanner);
})();