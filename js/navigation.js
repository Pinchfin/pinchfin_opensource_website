/* ==========================================================================
   PINCHFIN — navigation.js
   Fixed nav, sub-tab navigation, mobile hamburger, smooth scroll
   Version: 2.0.0 — Unified selectors for components.css convention
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Constants
     -------------------------------------------------------------------------- */
  const SCROLL_THRESHOLD = 40;
  const MOBILE_BREAKPOINT = 768;
  const SCROLL_OFFSET = 80;

  /* --------------------------------------------------------------------------
     DOM Cache
     -------------------------------------------------------------------------- */
  let navEl = null;
  let hamburgerBtn = null;
  let mobilePanel = null;
  let tabButtons = [];
  let tabPanels = [];

  /* --------------------------------------------------------------------------
     1. Fixed Top Nav — Scroll Behavior
     -------------------------------------------------------------------------- */
  function initScrollBehavior() {
    navEl = document.querySelector('.nav-fixed, .site-nav, nav[role="navigation"]');
    if (!navEl) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > SCROLL_THRESHOLD) {
            navEl.classList.add('nav-fixed--scrolled', 'scrolled');
          } else {
            navEl.classList.remove('nav-fixed--scrolled', 'scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------------------
     2. Main Nav Active State
     -------------------------------------------------------------------------- */
  function initActiveNavState() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll(
      '.nav-links__item, .nav-link, .site-nav a:not(.nav-brand)'
    );

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      const linkFile = href.split('/').pop().split('#')[0] || 'index.html';

      if (linkFile === currentFile) {
        link.classList.add('nav-links__item--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('nav-links__item--active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. Sub-Tab Navigation
     -------------------------------------------------------------------------- */
  function initSubTabs() {
    tabButtons = Array.from(document.querySelectorAll('[data-tab]'));
    tabPanels = Array.from(document.querySelectorAll('[data-panel]'));

    if (tabButtons.length === 0 || tabPanels.length === 0) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(btn.getAttribute('data-tab'), true);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab(btn.getAttribute('data-tab'), true);
        }
      });
    });

    const hash = window.location.hash.replace('#', '');
    if (hash && tabButtons.some((b) => b.getAttribute('data-tab') === hash)) {
      activateTab(hash, false);
    } else if (tabButtons.length > 0) {
      activateTab(tabButtons[0].getAttribute('data-tab'), false);
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && tabButtons.some((b) => b.getAttribute('data-tab') === h)) {
        activateTab(h, false);
      }
    });
  }

  function activateTab(tabId, updateHash) {
    tabButtons.forEach((btn) => {
      btn.classList.remove('nav-sub__item--active', 'active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });

    tabPanels.forEach((panel) => {
      panel.classList.remove('tab-panel--active', 'active');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.display = 'none';
    });

    const activeBtn = tabButtons.find((b) => b.getAttribute('data-tab') === tabId);
    if (activeBtn) {
      activeBtn.classList.add('nav-sub__item--active', 'active');
      activeBtn.setAttribute('aria-selected', 'true');
      activeBtn.setAttribute('tabindex', '0');
    }

    const activePanel = tabPanels.find((p) => p.getAttribute('data-panel') === tabId);
    if (activePanel) {
      activePanel.classList.add('tab-panel--active', 'active');
      activePanel.setAttribute('aria-hidden', 'false');
      activePanel.style.display = '';
    }

    if (updateHash) {
      history.pushState(null, '', '#' + tabId);
      if (typeof window.PinchfinAnalytics !== 'undefined') {
        window.PinchfinAnalytics.trackEvent('navigation', 'tab_switch', tabId);
      }
    }
  }

  /* --------------------------------------------------------------------------
     4. Mobile Hamburger Menu
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    hamburgerBtn = document.querySelector(
      '.nav-hamburger, .hamburger, .mobile-toggle, [data-mobile-toggle]'
    );
    mobilePanel = document.querySelector(
      '.nav-mobile, .mobile-nav, [data-mobile-nav]'
    );

    if (!hamburgerBtn || !mobilePanel) return;

    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
    mobilePanel.setAttribute('aria-hidden', 'true');

    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    document.addEventListener('click', (e) => {
      if (
        isMobileOpen() &&
        !mobilePanel.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileOpen()) {
        closeMobileMenu();
        hamburgerBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_BREAKPOINT && isMobileOpen()) {
        closeMobileMenu();
      }
    });
  }

  function isMobileOpen() {
    return (
      mobilePanel &&
      (mobilePanel.classList.contains('nav-mobile--open') ||
        mobilePanel.classList.contains('open'))
    );
  }

  function toggleMobileMenu() {
    if (isMobileOpen()) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    hamburgerBtn.classList.add('nav-hamburger--open', 'open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');
    mobilePanel.classList.add('nav-mobile--open', 'open');
    mobilePanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburgerBtn.classList.remove('nav-hamburger--open', 'open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
    mobilePanel.classList.remove('nav-mobile--open', 'open');
    mobilePanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* --------------------------------------------------------------------------
     5. Smooth Scroll to Anchor Targets
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || link.hasAttribute('data-tab')) return;

        const target = document.getElementById(href.substring(1));
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top:
              target.getBoundingClientRect().top +
              window.scrollY -
              SCROLL_OFFSET,
            behavior: 'smooth',
          });
          history.pushState(null, '', href);
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Initialize
     -------------------------------------------------------------------------- */
  function init() {
    initScrollBehavior();
    initActiveNavState();
    initSubTabs();
    initMobileMenu();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     Public API
     -------------------------------------------------------------------------- */
  window.PinchfinNav = {
    activateTab: activateTab,
    openMobileMenu: openMobileMenu,
    closeMobileMenu: closeMobileMenu,
  };
})();
