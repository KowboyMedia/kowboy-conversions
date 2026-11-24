/*!
 * Kowboy conversions: counts each form's open, start and submit in Microsoft Clarity.
 * The site sets window.kowboyConversions before this script (README.md).
 */
(function () {
  'use strict';

  var settings = window.kowboyConversions;
  if (!settings || !Array.isArray(settings.forms)) {
    if (window.console) {
      console.warn('kowboy-conversions: window.kowboyConversions.forms is missing, so nothing is counted.');
    }
    return;
  }

  // Clarity's own queue: calls made before Clarity loads (here or by the site) wait for it.
  window.clarity =
    window.clarity ||
    function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  function clarity() {
    window.clarity.apply(window, arguments);
  }

  /** One step of one form, with the page it happened on. */
  function track(name, step) {
    clarity('set', name + '_form_page', location.pathname);
    clarity('event', name + '_form_' + step);
  }

  function consent(granted) {
    clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: granted ? 'granted' : 'denied' });
  }

  // Clarity itself, when the site does not load it: no cookies until the banner says yes.
  if (settings.clarity) {
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.clarity.ms/tag/' + settings.clarity;
    document.head.appendChild(tag);
    consent(false);
  }

  // The site's cookie banner: its statistics or analytics answer becomes Clarity's consent.
  var banners = {
    cookiebot: function () {
      function read() {
        consent(!!(window.Cookiebot && window.Cookiebot.consent && window.Cookiebot.consent.statistics));
      }
      ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'].forEach(function (name) {
        window.addEventListener(name, read);
      });
      if (window.Cookiebot && window.Cookiebot.hasResponse) read();
    },
    cookieyes: function () {
      document.addEventListener('cookieyes_consent_update', function (event) {
        var accepted = (event.detail && event.detail.accepted) || [];
        consent(accepted.indexOf('analytics') > -1);
      });
      if (typeof window.getCkyConsent === 'function') {
        var given = window.getCkyConsent() || {};
        consent(!!(given.categories && given.categories.analytics));
      }
    },
  };
  if (settings.consent && !banners[settings.consent]) {
    console.warn('kowboy-conversions: consent "' + settings.consent + '" is unknown; use cookiebot or cookieyes.');
  } else if (settings.consent) {
    banners[settings.consent]();
  }

  /** Whether the event passed through an element the selector names, open shadow roots included. */
  function within(event, selector) {
    return event.composedPath().some(function (node) {
      return node instanceof Element && node.matches(selector);
    });
  }

  /** Whether a selector is valid CSS; a wrong one is named in the console and its form skipped. */
  function valid(selector) {
    try {
      document.createDocumentFragment().querySelector(selector);
      return true;
    } catch (error) {
      console.warn('kowboy-conversions: "' + selector + '" is not a valid CSS selector; that form is not counted.');
      return false;
    }
  }

  settings.forms.forEach(function (form) {
    var selectors = [form.form, form.open, form.submit && form.submit.shown].filter(Boolean);
    if (!selectors.every(valid)) return;
    var started = false;
    if (form.open) {
      window.addEventListener('click', function (event) {
        if (within(event, form.open)) track(form.name, 'open');
      }, true);
    }
    // The first thing typed or ticked; counted again after a submit, for the next one.
    window.addEventListener('input', function (event) {
      if (started || !within(event, form.form)) return;
      started = true;
      track(form.name, 'start');
    }, true);
    function submitted() {
      started = false;
      track(form.name, 'submit');
    }
    if (form.submit && form.submit.event) {
      window.addEventListener(form.submit.event, function (event) {
        if (within(event, form.form)) submitted();
      }, true);
    }
    if (form.submit && form.submit.shown) {
      // A confirmation the site shows: counted each time it becomes visible.
      var shown = false;
      new MutationObserver(function () {
        var element = document.querySelector(form.submit.shown);
        var now = !!(element && element.getClientRects().length);
        if (now && !shown) submitted();
        shown = now;
      }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden'],
      });
    }
  });
})();
