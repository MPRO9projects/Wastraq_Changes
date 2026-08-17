/**
 * WASTRAQ Smart Chatbot Widget
 * ─────────────────────────────
 * Drop-in floating chat assistant. Zero dependencies.
 * Integrates with FastAPI backend at /api/chatbot/message.
 *
 * Usage: add  <script src="wastraq-chatbot.js"></script>  before </body>
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
  function injectStyles() {
    if (document.getElementById('wq-chat-styles')) return;
    var style = document.createElement('style');
    style.id  = 'wq-chat-styles';
    style.textContent = [
      /* ── Launcher button ── */
      '.wq-chat-launcher{',
        'position:fixed;bottom:24px;right:24px;z-index:9998;',
        'width:56px;height:56px;border-radius:50%;',
        'background:linear-gradient(90deg, #6FBB59 0%, #159D91 45%, #0750AD 100%) !important;',
        'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 4px 20px rgba(21,157,145,.4);',
        'transition:transform .2s,box-shadow .2s;',
        'outline:none;',
      '}',
      '.wq-chat-launcher:hover{transform:scale(1.06);box-shadow:0 6px 28px rgba(7,80,173,.5);}',
      '.wq-chat-launcher:focus-visible{outline:3px solid #22c55e;outline-offset:3px;}',
      '.wq-chat-launcher svg{transition:transform .3s;}',
      '.wq-chat-launcher.open svg.icon-chat{display:none}',
      '.wq-chat-launcher.open svg.icon-close{display:block!important}',
      '.wq-chat-launcher svg.icon-close{display:none}',

      /* Notification dot */
      '.wq-chat-dot{',
        'position:absolute;top:3px;right:3px;width:11px;height:11px;',
        'border-radius:50%;background:#f59e0b;',
        'border:2px solid #fff;',
        'animation:wqPulse 2s ease infinite;',
      '}',
      '@keyframes wqPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 5px rgba(245,158,11,0)}}',

      /* ── Widget window ── */
      '.wq-chat-window{',
        'position:fixed;bottom:90px;right:24px;z-index:9999;',
        'width:360px;max-width:calc(100vw - 32px);',
        'height:520px;max-height:calc(100vh - 120px);',
        'background:#fff;border-radius:18px;',
        'box-shadow:0 16px 56px rgba(10,32,22,.18),0 2px 8px rgba(10,32,22,.1);',
        'display:flex;flex-direction:column;overflow:hidden;',
        'transform:translateY(16px) scale(.96);opacity:0;pointer-events:none;',
        'transition:transform .3s cubic-bezier(.22,.68,0,1.2),opacity .25s ease;',
      '}',
      '.wq-chat-window.visible{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}',

      /* ── Header ── */
      '.wq-chat-header{',
        'background:linear-gradient(135deg,#0a2016,#14502e);',
        'padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;',
      '}',
      '.wq-chat-header-avatar{',
        'width:38px;height:38px;border-radius:50%;',
        'background:rgba(34,197,94,.18);border:2px solid rgba(34,197,94,.35);',
        'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
      '}',
      '.wq-chat-header-info{flex:1;min-width:0;}',
      '.wq-chat-header-name{font-size:.9rem;font-weight:800;color:#fff;line-height:1.2;}',
      '.wq-chat-header-status{font-size:.72rem;color:rgba(255,255,255,.6);display:flex;align-items:center;gap:5px;margin-top:2px;}',
      '.wq-chat-status-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;}',
      '.wq-chat-close-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.6);padding:4px;border-radius:6px;display:flex;align-items:center;transition:color .15s;}',
      '.wq-chat-close-btn:hover{color:#fff;}',

      /* ── Messages ── */
      '.wq-chat-messages{',
        'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;',
        'scroll-behavior:smooth;',
      '}',
      '.wq-chat-messages::-webkit-scrollbar{width:4px;}',
      '.wq-chat-messages::-webkit-scrollbar-track{background:transparent;}',
      '.wq-chat-messages::-webkit-scrollbar-thumb{background:#e2ead0;border-radius:4px;}',

      /* Bubble rows */
      '.wq-msg{display:flex;gap:8px;align-items:flex-end;max-width:88%;}',
      '.wq-msg.bot{align-self:flex-start;}',
      '.wq-msg.user{align-self:flex-end;flex-direction:row-reverse;}',

      /* Bubble */
      '.wq-bubble{',
        'padding:10px 13px;border-radius:14px;font-size:.875rem;line-height:1.6;word-break:break-word;white-space:pre-wrap;',
      '}',
      '.wq-msg.bot .wq-bubble{background:#f0fdf4;color:#0d1f0b;border-bottom-left-radius:4px;}',
      '.wq-msg.user .wq-bubble{background:#16a34a;color:#fff;border-bottom-right-radius:4px;}',

      /* Bot avatar in message */
      '.wq-msg-avatar{',
        '<img src="screenshots/wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '}',

      /* Typing indicator */
      '.wq-typing{display:flex;align-items:center;gap:4px;padding:10px 13px;background:#f0fdf4;border-radius:14px;border-bottom-left-radius:4px;}',
      '.wq-typing span{width:7px;height:7px;border-radius:50%;background:#7c9177;animation:wqDot 1.2s ease infinite;}',
      '.wq-typing span:nth-child(2){animation-delay:.2s;}',
      '.wq-typing span:nth-child(3){animation-delay:.4s;}',
      '@keyframes wqDot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',

      /* ── Buttons strip ── */
      '.wq-chat-buttons{',
        'padding:4px 16px 10px;display:flex;flex-wrap:wrap;gap:6px;',
      '}',
      '.wq-chat-btn{',
        'display:inline-flex;align-items:center;gap:5px;',
        'padding:6px 12px;border-radius:100px;border:1.5px solid #e2ead0;',
        'background:#fff;color:#14502e;font-size:.77rem;font-weight:700;',
        'cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;',
      '}',
      '.wq-chat-btn:hover{background:#f0fdf4;border-color:#22c55e;color:#14502e;}',

      /* ── Link chip ── */
      '.wq-chat-link-chip{',
        'margin:4px 16px 8px;padding:8px 12px;',
        'background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;',
        'display:flex;align-items:center;gap:7px;text-decoration:none;',
        'font-size:.78rem;font-weight:700;color:#14502e;',
        'transition:background .18s;',
      '}',
      '.wq-chat-link-chip:hover{background:#dcfce7;}',

      /* ── Input bar ── */
      '.wq-chat-input-bar{',
        'padding:10px 12px;border-top:1px solid #e2ead0;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;',
      '}',
      '.wq-chat-input{',
        'flex:1;resize:none;border:1.5px solid #e2ead0;border-radius:10px;',
        'padding:9px 12px;font-family:inherit;font-size:.88rem;color:#0d1f0b;',
        'background:#f8faf7;outline:none;line-height:1.5;max-height:100px;',
        'transition:border-color .18s,box-shadow .18s;',
      '}',
      '.wq-chat-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.12);background:#fff;}',
      '.wq-chat-send{',
        'width:38px;height:38px;border-radius:10px;background:linear-gradient(90deg, #6FBB59 0%, #159D91 45%, #0750AD 100%) !important;',
        'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'flex-shrink:0;transition:transform .12s,filter .18s;',
      '}',
      '.wq-chat-send:hover{filter:brightness(1.1);transform:scale(1.04);}',
      '.wq-chat-send:disabled{opacity:.5;cursor:not-allowed;transform:none;}',

      /* ── Powered-by strip ── */
      '.wq-chat-powered{',
        'padding:6px 12px;text-align:center;font-size:.68rem;color:#7c9177;border-top:1px solid #f0fdf4;flex-shrink:0;',
      '}',

      /* ── Mobile overrides ── */
      '@media(max-width:480px){',
        '.wq-chat-window{right:12px;bottom:80px;width:calc(100vw - 24px);height:calc(100vh - 100px);}',
        '.wq-chat-launcher{bottom:16px;right:16px;}',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

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
        '<img src="screenshots/wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
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
        '<img src="screenshots/wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
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

    injectStyles();

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
