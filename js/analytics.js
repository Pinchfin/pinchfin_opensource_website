/* ==========================================================================
   PINCHFIN — analytics.js
   Event tracking stubs with GA4 gtag integration and console fallback
   Version: 1.0.0
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Configuration
     -------------------------------------------------------------------------- */
  const ANALYTICS_CONFIG = {
    // Set to your GA4 Measurement ID when ready (e.g., 'G-XXXXXXXXXX')
    measurementId: null,

    // Enable console logging of events (useful for development)
    debugMode: true,

    // Prefix for all event names sent to GA4
    eventPrefix: 'pf_',

    // Queue events if GA not yet loaded (replayed once GA initializes)
    queueEnabled: true
  };

  /* --------------------------------------------------------------------------
     Event Queue — stores events fired before GA loads
     -------------------------------------------------------------------------- */
  let eventQueue = [];

  /* --------------------------------------------------------------------------
     Core: trackEvent
     Sends an event to GA4 if available, otherwise logs to console.
     All other tracking functions funnel through this.

     @param {string} category - Event category (e.g., 'demo', 'navigation')
     @param {string} action   - Event action (e.g., 'demo_start', 'tab_switch')
     @param {string} [label]  - Optional event label (e.g., tab name, phase number)
     @param {object} [extra]  - Optional additional parameters for GA4
     -------------------------------------------------------------------------- */
  function trackEvent(category, action, label, extra) {
    const eventName = ANALYTICS_CONFIG.eventPrefix + action;
    const eventParams = {
      event_category: category,
      event_label: label || '',
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };

    // Merge any extra parameters
    if (extra && typeof extra === 'object') {
      Object.assign(eventParams, extra);
    }

    // Attempt to send via GA4 gtag
    if (isGtagAvailable()) {
      try {
        window.gtag('event', eventName, eventParams);
      } catch (err) {
        logEvent(eventName, eventParams, 'GA4 error: ' + err.message);
      }
    } else if (ANALYTICS_CONFIG.queueEnabled) {
      // Queue the event for later replay
      eventQueue.push({ name: eventName, params: eventParams });
      logEvent(eventName, eventParams, 'queued');
    } else {
      logEvent(eventName, eventParams, 'no GA');
    }

    // Always log in debug mode
    if (ANALYTICS_CONFIG.debugMode) {
      logEvent(eventName, eventParams);
    }
  }

  /* --------------------------------------------------------------------------
     GA4 Availability Check
     -------------------------------------------------------------------------- */
  function isGtagAvailable() {
    return typeof window.gtag === 'function';
  }

  /* --------------------------------------------------------------------------
     Console Logger — Fallback when GA is not loaded
     -------------------------------------------------------------------------- */
  function logEvent(eventName, params, note) {
    const prefix = '[Pinchfin Analytics]';
    const noteStr = note ? ' (' + note + ')' : '';
    console.log(
      '%c' + prefix + '%c ' + eventName + noteStr,
      'color: #B85A30; font-weight: 600;',
      'color: inherit;',
      params
    );
  }

  /* --------------------------------------------------------------------------
     Replay Queued Events
     Called after GA4 initializes to send any events that fired early.
     -------------------------------------------------------------------------- */
  function replayQueue() {
    if (!isGtagAvailable() || eventQueue.length === 0) return;

    const queueLength = eventQueue.length;
    eventQueue.forEach((evt) => {
      try {
        window.gtag('event', evt.name, evt.params);
      } catch (err) {
        // Silently skip failed replays
      }
    });

    if (ANALYTICS_CONFIG.debugMode) {
      console.log('[Pinchfin Analytics] Replayed ' + queueLength + ' queued events');
    }

    eventQueue = [];
  }

  /* --------------------------------------------------------------------------
     GA4 Initialization Stub
     Call this to initialize GA4 with a measurement ID. Typically invoked
     after the gtag.js script loads, or can be called manually.

     @param {string} measurementId - GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
     -------------------------------------------------------------------------- */
  function initGA4(measurementId) {
    if (!measurementId) {
      if (ANALYTICS_CONFIG.debugMode) {
        console.warn('[Pinchfin Analytics] No measurement ID provided');
      }
      return;
    }

    ANALYTICS_CONFIG.measurementId = measurementId;

    // If gtag is not yet on the page, inject the script
    if (!isGtagAvailable()) {
      // Create the dataLayer if it does not exist
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: true
      });

      // Inject the gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      script.onload = () => {
        if (ANALYTICS_CONFIG.debugMode) {
          console.log('[Pinchfin Analytics] GA4 script loaded: ' + measurementId);
        }
        replayQueue();
      };
      document.head.appendChild(script);
    } else {
      // gtag already exists, just configure the new ID
      window.gtag('config', measurementId, {
        send_page_view: true
      });
      replayQueue();
    }
  }

  /* --------------------------------------------------------------------------
     Pre-Built Event Trackers
     Convenience functions for each tracked interaction.
     -------------------------------------------------------------------------- */

  /** Demo started */
  function trackDemoStart() {
    trackEvent('demo', 'demo_start', 'workflow_demo');
  }

  /** Demo completed */
  function trackDemoComplete() {
    trackEvent('demo', 'demo_complete', 'workflow_demo');
  }

  /**
   * Tab switched
   * @param {string} tabName - The name/id of the tab switched to
   */
  function trackTabSwitch(tabName) {
    trackEvent('navigation', 'tab_switch', tabName);
  }

  /**
   * Card expanded
   * @param {string} cardName - The name/title of the expanded card
   */
  function trackCardExpand(cardName) {
    trackEvent('interaction', 'card_expand', cardName);
  }

  /**
   * Skill search performed
   * @param {string} query - The search query
   */
  function trackSkillSearch(query) {
    trackEvent('interaction', 'skill_search', query);
  }

  /** White paper download initiated */
  function trackWhitePaperDownload() {
    trackEvent('conversion', 'white_paper_download');
  }

  /** GitHub link clicked */
  function trackGithubClick() {
    trackEvent('navigation', 'github_click');
  }

  /** Lead capture form submitted */
  function trackLeadCaptureSubmit() {
    trackEvent('conversion', 'lead_capture_submit');
  }

  /**
   * Phase card clicked (in docs or demo)
   * @param {number|string} phaseNumber - The phase number
   */
  function trackPhaseClick(phaseNumber) {
    trackEvent('interaction', 'phase_click', String(phaseNumber));
  }

  /**
   * Policy cascade demo run
   * @param {string} [policyText] - The policy change text applied
   */
  function trackPolicyCascadeRun(policyText) {
    trackEvent('interaction', 'policy_demo_run', policyText || '');
  }

  /* --------------------------------------------------------------------------
     Auto-Track: Data Attributes & Outbound Links
     Automatically tracks clicks on elements with data-track attributes
     and specific outbound link patterns.
     -------------------------------------------------------------------------- */
  function initAutoTracking() {
    // Track clicks on elements with data-track attribute
    // Usage: <a data-track="github_click" data-track-label="header-cta" href="...">
    document.addEventListener('click', (e) => {
      const tracked = e.target.closest('[data-track]');
      if (tracked) {
        const action = tracked.getAttribute('data-track');
        const label = tracked.getAttribute('data-track-label') ||
                      tracked.textContent.trim().substring(0, 50);
        const category = tracked.getAttribute('data-track-category') || 'interaction';
        trackEvent(category, action, label);
      }
    });

    // Track white paper download links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="white-paper"], a[href*="whitepaper"], .white-paper-download');
      if (link) {
        trackWhitePaperDownload();
      }
    });

    // Track GitHub clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="github.com"]');
      if (link) {
        trackGithubClick();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Page View Tracking
     Tracks the initial page view. Can also be called for SPA-style
     navigation when content changes without a full page load.

     @param {string} [path]  - Override page path
     @param {string} [title] - Override page title
     -------------------------------------------------------------------------- */
  function trackPageView(path, title) {
    const pagePath = path || window.location.pathname;
    const pageTitle = title || document.title;

    if (isGtagAvailable()) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }

    if (ANALYTICS_CONFIG.debugMode) {
      console.log(
        '%c[Pinchfin Analytics]%c page_view: ' + pagePath,
        'color: #B85A30; font-weight: 600;',
        'color: inherit;'
      );
    }
  }

  /* --------------------------------------------------------------------------
     Initialize
     -------------------------------------------------------------------------- */
  function init() {
    initAutoTracking();

    // Track initial page view
    trackPageView();

    // If a measurement ID is already configured, initialize GA4
    if (ANALYTICS_CONFIG.measurementId) {
      initGA4(ANALYTICS_CONFIG.measurementId);
    }

    if (ANALYTICS_CONFIG.debugMode) {
      console.log(
        '%c[Pinchfin Analytics]%c Initialized (debug mode ON)',
        'color: #B85A30; font-weight: 600;',
        'color: inherit;'
      );
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     Public API — Exposed globally as window.PinchfinAnalytics
     Other scripts (navigation.js, interactions.js, demo.js) reference
     this object to fire analytics events.
     -------------------------------------------------------------------------- */
  window.PinchfinAnalytics = {
    // Core
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    initGA4: initGA4,

    // Pre-built event trackers
    trackDemoStart: trackDemoStart,
    trackDemoComplete: trackDemoComplete,
    trackTabSwitch: trackTabSwitch,
    trackCardExpand: trackCardExpand,
    trackSkillSearch: trackSkillSearch,
    trackWhitePaperDownload: trackWhitePaperDownload,
    trackGithubClick: trackGithubClick,
    trackLeadCaptureSubmit: trackLeadCaptureSubmit,
    trackPhaseClick: trackPhaseClick,
    trackPolicyCascadeRun: trackPolicyCascadeRun,

    // Utilities
    replayQueue: replayQueue,

    // Config access (returns a copy)
    getConfig: () => Object.assign({}, ANALYTICS_CONFIG),

    // Toggle debug mode at runtime
    setDebug: (enabled) => { ANALYTICS_CONFIG.debugMode = !!enabled; }
  };

})();
