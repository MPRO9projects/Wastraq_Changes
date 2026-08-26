/**
 * chatbot.js — the WASTRAQ chatbot widget (index.html only).
 * Drop-in floating chat assistant. Integrates with the FastAPI
 * backend at /api/chatbot/message.
 *
 * Requires css/chatbot.css to be linked on the page (styles used
 * to be injected at runtime from here; they're now a real stylesheet).
 *
 * Usage: add  <link rel="stylesheet" href="css/chatbot.css">
 *        and  <script src="js/chatbot.js" data-api-base="..."></script>  before </body>
 * or call  initWastraqChat({ apiBase: '...' })  manually.
 */

(function (global) {
  'use strict';

  /* ── Configuration defaults ─────────────────────────────── */
  var DEFAULT_CONFIG = {
    apiBase:       'https://backend.wastraq.com',   
    position:      'bottom-right',
    accentColor:   '#16a34a',
    darkColor:     '#0a2016',
    lightBg:       '#f0fdf4',
    borderColor:   '#e2ead0',
    fontFamily:    "'Plus Jakarta Sans', Helvetica Neue, Arial, sans-serif",
    greeting:      "Hello! 👋 I'm the WASTRAQ assistant. How can I help you today?",
    placeholder:   "Ask about products, pricing, demos…",
    botName:       'WASTRAQ Assistant',
    openDelay:     0,          // ms before auto-open (0 = don't auto-open)
  };

  /* ── Internal state ─────────────────────────────────────── */
  var cfg        = {};
  var isOpen     = false;
  var isTyping   = false;
  var buttonLinks = {};
  var initialized = false;

  /* ══════════════════════════════════════════════════════════
     STYLES (injected once into <head>)
  ══════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════
     DOM BUILDER
  ══════════════════════════════════════════════════════════ */
  function buildWidget() {
    /* ── Launcher button ── */
    var launcher = document.createElement('button');
    launcher.className  = 'wq-chat-launcher';
    launcher.id         = 'wq-chat-launcher';
    launcher.setAttribute('aria-label', 'Open WASTRAQ chat assistant');
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML  = [
      '<svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
        '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
      '</svg>',
      '<svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      '</svg>',
      '<span class="wq-chat-dot" id="wq-chat-dot" aria-hidden="true"></span>',
    ].join('');
    launcher.addEventListener('click', toggleChat);

    /* ── Widget window ── */
    var win = document.createElement('div');
    win.className = 'wq-chat-window';
    win.id        = 'wq-chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'WASTRAQ chat assistant');
    win.setAttribute('aria-modal', 'false');

    /* Header */
    var header = document.createElement('div');
    header.className = 'wq-chat-header';
    header.innerHTML = [
      '<div class="wq-chat-header-avatar" aria-hidden="true">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
          '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
        '</svg>',
      '</div>',
      '<div class="wq-chat-header-info">',
        '<div class="wq-chat-header-name">', cfg.botName, '</div>',
        '<div class="wq-chat-header-status">',
          '<span class="wq-chat-status-dot" aria-hidden="true"></span>',
          'Online — usually replies instantly',
        '</div>',
      '</div>',
      '<button class="wq-chat-close-btn" id="wq-chat-close-btn" aria-label="Close chat" onclick="document.getElementById(\'wq-chat-launcher\').click()">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
        '</svg>',
      '</button>',
    ].join('');

    /* Messages area */
    var msgs = document.createElement('div');
    msgs.className  = 'wq-chat-messages';
    msgs.id         = 'wq-chat-messages';
    msgs.setAttribute('role', 'log');
    msgs.setAttribute('aria-live', 'polite');
    msgs.setAttribute('aria-label', 'Chat messages');

    /* Input bar */
    var inputBar = document.createElement('div');
    inputBar.className = 'wq-chat-input-bar';
    inputBar.innerHTML = [
      '<textarea class="wq-chat-input" id="wq-chat-input"',
        ' placeholder="', cfg.placeholder, '"',
        ' rows="1"',
        ' aria-label="Type your message"',
        ' aria-multiline="true"',
      '></textarea>',
      '<button class="wq-chat-send" id="wq-chat-send" aria-label="Send message">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<line x1="22" y1="2" x2="11" y2="13"/>',
          '<polygon points="22 2 15 22 11 13 2 9 22 2"/>',
        '</svg>',
      '</button>',
    ].join('');

    /* Powered-by */
    var powered = document.createElement('div');
    powered.className   = 'wq-chat-powered';
    powered.textContent = 'Powered by WASTRAQ';

    win.appendChild(header);
    win.appendChild(msgs);
    win.appendChild(powered);
    win.appendChild(inputBar);

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    /* Wire up input events */
    var input    = document.getElementById('wq-chat-input');
    var sendBtn  = document.getElementById('wq-chat-send');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    sendBtn.addEventListener('click', sendUserMessage);

    /* Show greeting after short delay */
    setTimeout(function () {
      appendBotMessage(cfg.greeting, ['Products', 'Book a Demo', 'Pricing', 'Support']);
      /* Remove notification dot once opened */
    }, 600);
  }

  /* ══════════════════════════════════════════════════════════
     CHAT LOGIC
  ══════════════════════════════════════════════════════════ */

  function toggleChat() {
    isOpen = !isOpen;
    var win      = document.getElementById('wq-chat-window');
    var launcher = document.getElementById('wq-chat-launcher');
    var dot      = document.getElementById('wq-chat-dot');
    if (isOpen) {
      win.classList.add('visible');
      launcher.classList.add('open');
      launcher.setAttribute('aria-expanded', 'true');
      if (dot) dot.style.display = 'none';
      var input = document.getElementById('wq-chat-input');
      if (input) setTimeout(function () { input.focus(); }, 300);
    } else {
      win.classList.remove('visible');
      launcher.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
    }
  }

  function appendBotMessage(text, buttons, link, linkText) {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;

    var row = document.createElement('div');
    row.className = 'wq-msg bot';
    row.innerHTML = [
      '<div class="wq-msg-avatar" aria-hidden="true">',
        '<img src="assets/images/index_wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '</div>',
      '<div class="wq-bubble">', escHtml(text), '</div>',
    ].join('');
    msgs.appendChild(row);

    /* Buttons */
    if (buttons && buttons.length) {
      var btnRow = document.createElement('div');
      btnRow.className = 'wq-chat-buttons';
      buttons.forEach(function (label) {
        var btn = document.createElement('button');
        btn.className   = 'wq-chat-btn';
        btn.textContent = label;
        btn.addEventListener('click', function () {
          var url = buttonLinks[label];
          if (url) {
            window.location.href = url;
          } else {
            sendAsUser(label);
          }
        });
        btnRow.appendChild(btn);
      });
      msgs.appendChild(btnRow);
    }

    /* Link chip */
    if (link && linkText) {
      var chip = document.createElement('a');
      chip.className   = 'wq-chat-link-chip';
      chip.href        = link;
      chip.innerHTML   = [
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="M5 12h14M12 5l7 7-7 7"/>',
        '</svg>',
        escHtml(linkText),
      ].join('');
      msgs.appendChild(chip);
    }

    scrollBottom(msgs);
  }

  function appendUserMessage(text) {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;
    var row = document.createElement('div');
    row.className = 'wq-msg user';
    row.innerHTML = '<div class="wq-bubble">' + escHtml(text) + '</div>';
    msgs.appendChild(row);
    scrollBottom(msgs);
  }

  function showTyping() {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;
    var el = document.createElement('div');
    el.className = 'wq-msg bot';
    el.id        = 'wq-typing-indicator';
    el.innerHTML = [
      '<div class="wq-msg-avatar" aria-hidden="true">',
        '<img src="assets/images/index_wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '</div>',
      '<div class="wq-typing" aria-label="WASTRAQ is typing" role="status">',
        '<span></span><span></span><span></span>',
      '</div>',
    ].join('');
    msgs.appendChild(el);
    scrollBottom(msgs);
  }

  function hideTyping() {
    var el = document.getElementById('wq-typing-indicator');
    if (el) el.remove();
  }

  function sendAsUser(text) {
    appendUserMessage(text);
    callAPI(text);
  }

  function sendUserMessage() {
    if (isTyping) return;
    var input = document.getElementById('wq-chat-input');
    var text  = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendAsUser(text);
  }

  function callAPI(message) {
    isTyping = true;
    var sendBtn = document.getElementById('wq-chat-send');
    if (sendBtn) sendBtn.disabled = true;
    showTyping();

    fetch(cfg.apiBase + '/api/chatbot/message', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: message }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        hideTyping();
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        appendBotMessage(
          data.reply || 'Something went wrong. Please try again.',
          data.buttons || [],
          data.link,
          data.link_text
        );
      })
      .catch(function () {
        hideTyping();
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        appendBotMessage(
          "I'm having trouble connecting right now. Please try refreshing or contact us directly at support@wastraq.com",
          ['Contact Support', 'Help Center']
        );
      });
  }

  /* ══════════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════════ */

  function scrollBottom(el) {
    setTimeout(function () { el.scrollTop = el.scrollHeight; }, 50);
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  }

  function fetchButtonLinks() {
    fetch(cfg.apiBase + '/api/chatbot/buttons')
      .then(function (r) { return r.json(); })
      .then(function (data) { buttonLinks = data; })
      .catch(function () { /* use empty mapping */ });
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC INIT
  ══════════════════════════════════════════════════════════ */

  function initWastraqChat(options) {
    if (initialized) return;
    initialized = true;

    cfg = Object.assign({}, DEFAULT_CONFIG, options || {});

    // Read from global WASTRAQ_CHAT_CONFIG if set in page
    if (global.WASTRAQ_CHAT_CONFIG) {
      cfg = Object.assign(cfg, global.WASTRAQ_CHAT_CONFIG);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        buildWidget();
        fetchButtonLinks();
      });
    } else {
      buildWidget();
      fetchButtonLinks();
    }

    if (cfg.openDelay > 0) {
      setTimeout(function () {
        if (!isOpen) toggleChat();
      }, cfg.openDelay);
    }
  }

  /* Auto-init using script tag data attributes */
  (function autoInit() {
    var script = document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })();
    var apiBase = (script && script.getAttribute('data-api-base')) || DEFAULT_CONFIG.apiBase;
    initWastraqChat({ apiBase: apiBase });
  })();

  /* Expose for manual init */
  global.initWastraqChat = initWastraqChat;

})(window);
