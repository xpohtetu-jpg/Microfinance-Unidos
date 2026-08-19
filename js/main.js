/* ==========================================================================
   Microfinance Unidos — site behaviour
   Vanilla JS, no dependencies. All features degrade gracefully.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav__toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     Header shadow on scroll
     ---------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     Mark the active nav link
     ---------------------------------------------------------------------- */
  function initActiveLink() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (href === path) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ------------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Count-up figures
     Usage: <span data-count-to="96" data-suffix="%">96%</span>
     ---------------------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = null;

      function frame(now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = (target * eased).toFixed(decimals);
        el.textContent = prefix + Number(value).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
        if (progress < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Accordions (FAQ)
     ---------------------------------------------------------------------- */
  function initAccordions() {
    var triggers = document.querySelectorAll('.accordion__trigger');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));

        if (isOpen) {
          panel.style.height = panel.scrollHeight + 'px';
          window.requestAnimationFrame(function () { panel.style.height = '0px'; });
        } else {
          panel.style.height = panel.scrollHeight + 'px';
          panel.addEventListener('transitionend', function once() {
            panel.style.height = 'auto';
            panel.removeEventListener('transitionend', once);
          });
        }
      });
    });

    // Keep open panels correct after a resize
    window.addEventListener('resize', function () {
      triggers.forEach(function (trigger) {
        var panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if (panel && trigger.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
      });
    });
  }

  /* ------------------------------------------------------------------------
     Forms
     Posts to the endpoint in the form's `action` when one is configured
     (e.g. Formspree). Otherwise falls back to opening the visitor's email
     client with the message pre-filled, so the form is never a dead end.
     ---------------------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll('form[data-form]').forEach(function (form) {
      var status = form.querySelector('.form__status');
      var submit = form.querySelector('[type="submit"]');

      function say(message, kind) {
        if (!status) return;
        status.textContent = message;
        status.className = 'form__status is-visible form__status--' + kind;
      }

      form.addEventListener('submit', function (e) {
        // Honeypot: silently drop bot submissions.
        var trap = form.querySelector('.hp-field input');
        if (trap && trap.value) { e.preventDefault(); return; }

        var action = form.getAttribute('action') || '';
        var configured = action && action.indexOf('REPLACE') === -1 && action.charAt(0) !== '#';

        if (!configured) {
          e.preventDefault();
          mailtoFallback(form, say);
          return;
        }

        // Configured endpoint: submit over fetch so the visitor stays on the page.
        e.preventDefault();
        if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
        say('Sending your message…', 'ok');

        fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          say('Thank you — your message is on its way. We reply to every enquiry, usually within two business days.', 'ok');
        }).catch(function () {
          say('Something went wrong sending the form. Please email us directly and we will pick it up from there.', 'err');
        }).finally(function () {
          if (submit) { submit.disabled = false; submit.textContent = submit.getAttribute('data-label') || 'Send'; }
        });
      });
    });
  }

  function mailtoFallback(form, say) {
    var to = form.getAttribute('data-mailto');
    if (!to) {
      say('This form is not connected yet. Please email us directly.', 'err');
      return;
    }
    var data = new FormData(form);
    var lines = [];
    data.forEach(function (value, key) {
      if (key.charAt(0) === '_' || key === 'website') return;
      var label = key.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      lines.push(label + ': ' + value);
    });
    var subject = form.getAttribute('data-subject') || 'Website enquiry';
    var href = 'mailto:' + to +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n\n'));
    window.location.href = href;
    say('Your email client should open with this message ready to send. If it does not, please email us directly.', 'ok');
  }

  /* ------------------------------------------------------------------------
     Current year in the footer
     ---------------------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    initNav();
    initHeader();
    initActiveLink();
    initReveal();
    initCounters();
    initAccordions();
    initForms();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
