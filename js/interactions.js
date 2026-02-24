/* ==========================================================================
   PINCHFIN — interactions.js
   Expandable cards, phase cards, skills search/filter, policy cascade demo,
   lead capture form, lazy loading for illustrations
   Version: 1.0.0
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Expandable Cards — Accordion Behavior
     Click .card[data-expandable] to toggle .expanded class.
     Only one card expanded at a time within each group.
     Chevron icon rotates via CSS when .expanded is applied.
     -------------------------------------------------------------------------- */
  function initExpandableCards() {
    const expandableCards = document.querySelectorAll('.card[data-expandable]');
    if (expandableCards.length === 0) return;

    expandableCards.forEach((card) => {
      // Determine the clickable trigger (card header or the card itself)
      const trigger = card.querySelector('.card-header, .card-trigger') || card;
      const detail = card.querySelector('.card-detail');

      if (!detail) return;

      // Set initial collapsed state
      detail.style.maxHeight = '0';
      detail.style.overflow = 'hidden';
      detail.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
      detail.style.opacity = '0';

      // Set ARIA attributes
      const detailId = detail.id || 'card-detail-' + Math.random().toString(36).substring(2, 9);
      detail.id = detailId;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', detailId);
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');

      // Click handler
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard(card, expandableCards);
      });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard(card, expandableCards);
        }
      });
    });
  }

  /**
   * Toggles a card's expanded state and collapses siblings.
   * @param {HTMLElement} card - The card to toggle
   * @param {NodeList} allCards - All expandable cards (for accordion collapse)
   */
  function toggleCard(card, allCards) {
    const isExpanded = card.classList.contains('expanded');
    const detail = card.querySelector('.card-detail');
    const trigger = card.querySelector('.card-header, .card-trigger') || card;

    // Determine the card group: cards sharing a common parent container
    const group = card.closest('.card-group, .card-grid, .cards-container, section');

    // Collapse all cards in the same group
    if (group) {
      const groupCards = group.querySelectorAll('.card[data-expandable]');
      groupCards.forEach((sibling) => {
        if (sibling !== card) {
          collapseCard(sibling);
        }
      });
    } else {
      // Fallback: collapse all cards on the page
      allCards.forEach((sibling) => {
        if (sibling !== card) {
          collapseCard(sibling);
        }
      });
    }

    // Toggle the clicked card
    if (isExpanded) {
      collapseCard(card);
    } else {
      expandCard(card);

      // Fire analytics event
      const cardName = card.getAttribute('data-card-name') ||
                       card.querySelector('h3, h4, .card-title')?.textContent?.trim() || 'unknown';
      if (typeof window.PinchfinAnalytics !== 'undefined') {
        window.PinchfinAnalytics.trackEvent('interaction', 'card_expand', cardName);
      }
    }
  }

  /**
   * Expands a card with smooth height animation.
   * @param {HTMLElement} card
   */
  function expandCard(card) {
    const detail = card.querySelector('.card-detail');
    const trigger = card.querySelector('.card-header, .card-trigger') || card;

    card.classList.add('expanded');
    trigger.setAttribute('aria-expanded', 'true');

    // Measure natural height
    detail.style.maxHeight = detail.scrollHeight + 'px';
    detail.style.opacity = '1';

    // After transition, remove max-height to handle dynamic content
    const onTransitionEnd = () => {
      detail.style.maxHeight = 'none';
      detail.removeEventListener('transitionend', onTransitionEnd);
    };
    detail.addEventListener('transitionend', onTransitionEnd);
  }

  /**
   * Collapses a card with smooth height animation.
   * @param {HTMLElement} card
   */
  function collapseCard(card) {
    const detail = card.querySelector('.card-detail');
    const trigger = card.querySelector('.card-header, .card-trigger') || card;

    if (!detail || !card.classList.contains('expanded')) return;

    // Set explicit height before collapsing (needed for transition)
    detail.style.maxHeight = detail.scrollHeight + 'px';

    // Force reflow so the browser registers the explicit height
    void detail.offsetHeight;

    // Now animate to 0
    detail.style.maxHeight = '0';
    detail.style.opacity = '0';
    card.classList.remove('expanded');
    trigger.setAttribute('aria-expanded', 'false');
  }

  /* --------------------------------------------------------------------------
     2. Phase Cards — Expandable with Skills List
     Same accordion behavior as expandable cards but specific to .phase-card
     elements that show skills, governing nodes, and dependencies.
     -------------------------------------------------------------------------- */
  function initPhaseCards() {
    const phaseCards = document.querySelectorAll('.phase-card');
    if (phaseCards.length === 0) return;

    phaseCards.forEach((card) => {
      const header = card.querySelector('.phase-card-header, .phase-header');
      const body = card.querySelector('.phase-card-body, .phase-detail, .phase-content');

      if (!header || !body) return;

      // Set initial collapsed state
      body.style.maxHeight = '0';
      body.style.overflow = 'hidden';
      body.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
      body.style.opacity = '0';

      // ARIA
      const bodyId = body.id || 'phase-body-' + Math.random().toString(36).substring(2, 9);
      body.id = bodyId;
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', bodyId);
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.style.cursor = 'pointer';

      // Click handler
      header.addEventListener('click', () => {
        togglePhaseCard(card, phaseCards);
      });

      // Keyboard
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePhaseCard(card, phaseCards);
        }
      });
    });
  }

  /**
   * Toggles a phase card open/closed with accordion behavior.
   * @param {HTMLElement} card
   * @param {NodeList} allPhaseCards
   */
  function togglePhaseCard(card, allPhaseCards) {
    const isExpanded = card.classList.contains('expanded');
    const body = card.querySelector('.phase-card-body, .phase-detail, .phase-content');
    const header = card.querySelector('.phase-card-header, .phase-header');

    // Collapse all other phase cards
    allPhaseCards.forEach((sibling) => {
      if (sibling !== card && sibling.classList.contains('expanded')) {
        const sibBody = sibling.querySelector('.phase-card-body, .phase-detail, .phase-content');
        const sibHeader = sibling.querySelector('.phase-card-header, .phase-header');
        if (sibBody) {
          sibBody.style.maxHeight = sibBody.scrollHeight + 'px';
          void sibBody.offsetHeight;
          sibBody.style.maxHeight = '0';
          sibBody.style.opacity = '0';
        }
        sibling.classList.remove('expanded');
        if (sibHeader) sibHeader.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current
    if (isExpanded) {
      body.style.maxHeight = body.scrollHeight + 'px';
      void body.offsetHeight;
      body.style.maxHeight = '0';
      body.style.opacity = '0';
      card.classList.remove('expanded');
      header.setAttribute('aria-expanded', 'false');
    } else {
      card.classList.add('expanded');
      header.setAttribute('aria-expanded', 'true');
      body.style.maxHeight = body.scrollHeight + 'px';
      body.style.opacity = '1';

      const onTransitionEnd = () => {
        body.style.maxHeight = 'none';
        body.removeEventListener('transitionend', onTransitionEnd);
      };
      body.addEventListener('transitionend', onTransitionEnd);

      // Analytics
      const phaseNumber = card.getAttribute('data-phase') || '';
      if (typeof window.PinchfinAnalytics !== 'undefined') {
        window.PinchfinAnalytics.trackEvent('interaction', 'phase_click', phaseNumber);
      }
    }
  }

  /* --------------------------------------------------------------------------
     3. Skills Catalog Search & Filter
     - Text search filters by name or description (case-insensitive)
     - Module dropdown filter
     - Phase dropdown filter
     - Multiple filters combine with AND logic
     - Debounced search input (300ms)
     - Shows count of visible results
     -------------------------------------------------------------------------- */
  let searchTimeout = null;

  function initSkillsFilter() {
    const searchInput = document.querySelector('.search-filter, .skills-search, [data-skills-search]');
    const moduleFilter = document.querySelector('[data-filter="module"], .skills-filter-module, [data-filter-module]');
    const phaseFilter = document.querySelector('[data-filter="phase"], .skills-filter-phase, [data-filter-phase]');
    const resultCount = document.querySelector('.skills-count, [data-skills-count]');
    const skillItems = document.querySelectorAll('.skill-table tr[data-category], .skill-item, [data-skill]');

    if (skillItems.length === 0) return;

    /**
     * Applies all active filters and updates visibility + count.
     */
    const applyFilters = () => {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const selectedModule = moduleFilter ? moduleFilter.value : '';
      const selectedPhase = phaseFilter ? phaseFilter.value : '';
      let visibleCount = 0;

      skillItems.forEach((item) => {
        const name = (item.getAttribute('data-skill-name') || item.textContent || '').toLowerCase();
        const description = (item.getAttribute('data-skill-desc') || '').toLowerCase();
        const module = item.getAttribute('data-module') || item.getAttribute('data-skill-module') || '';
        const phase = item.getAttribute('data-phase') || item.getAttribute('data-skill-phase') || '';

        // Text search: matches name or description
        const matchesSearch = !query || name.includes(query) || description.includes(query);

        // Module filter
        const matchesModule = !selectedModule || module === selectedModule;

        // Phase filter
        const matchesPhase = !selectedPhase || phase === selectedPhase;

        // AND logic: all filters must match
        const isVisible = matchesSearch && matchesModule && matchesPhase;

        item.style.display = isVisible ? '' : 'none';
        item.setAttribute('aria-hidden', isVisible ? 'false' : 'true');

        if (isVisible) visibleCount++;
      });

      // Update count display
      if (resultCount) {
        resultCount.textContent = visibleCount + ' skill' + (visibleCount !== 1 ? 's' : '') + ' found';
      }

      // Fire analytics for search queries
      if (query && typeof window.PinchfinAnalytics !== 'undefined') {
        window.PinchfinAnalytics.trackEvent('interaction', 'skill_search', query);
      }
    };

    // Debounced search input handler (300ms)
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
      });
    }

    // Dropdown filter handlers (immediate)
    if (moduleFilter) {
      moduleFilter.addEventListener('change', applyFilters);
    }

    if (phaseFilter) {
      phaseFilter.addEventListener('change', applyFilters);
    }

    // Initial count
    applyFilters();
  }

  /* --------------------------------------------------------------------------
     4. Policy Cascade Demo (Industry > Executive Control)
     Interactive demonstration of how a policy change cascades through
     the system: config update -> sizing recalculation -> notifications.
     -------------------------------------------------------------------------- */
  function initPolicyCascade() {
    const cascadeForm = document.querySelector('.policy-cascade, [data-policy-cascade]');
    if (!cascadeForm) return;

    const inputField = cascadeForm.querySelector('.cascade-input, [data-cascade-input]');
    const applyBtn = cascadeForm.querySelector('.cascade-apply, [data-cascade-apply]');
    const configBlock = cascadeForm.querySelector('.cascade-config, [data-cascade-config]');
    const sizingBlock = cascadeForm.querySelector('.cascade-sizing, [data-cascade-sizing]');
    const notificationArea = cascadeForm.querySelector('.cascade-notifications, [data-cascade-notifications]');

    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
      const policyText = inputField ? inputField.value.trim() : 'DSCR threshold updated to 1.05x';
      if (!policyText && inputField) {
        inputField.focus();
        return;
      }

      // Disable button during animation
      applyBtn.disabled = true;
      applyBtn.textContent = 'Applying...';

      // Step 1: Config update — highlight the JSON block (400ms delay)
      setTimeout(() => {
        if (configBlock) {
          configBlock.classList.add('cascade-highlight');

          // Update config display with the policy text
          const configDisplay = configBlock.querySelector('code, .config-value');
          if (configDisplay) {
            configDisplay.textContent = policyText;
          }
        }
      }, 400);

      // Step 2: Sizing recalculates — animate numbers (1200ms delay)
      setTimeout(() => {
        if (configBlock) configBlock.classList.remove('cascade-highlight');

        if (sizingBlock) {
          sizingBlock.classList.add('cascade-highlight');

          // Animate number changes
          const numberEls = sizingBlock.querySelectorAll('[data-animate-value]');
          numberEls.forEach((el) => {
            const targetValue = parseFloat(el.getAttribute('data-animate-value')) || 0;
            animateNumber(el, 0, targetValue, 800);
          });
        }
      }, 1200);

      // Step 3: Notifications fire — show toast notifications (2200ms delay)
      setTimeout(() => {
        if (sizingBlock) sizingBlock.classList.remove('cascade-highlight');

        // Show toast notifications
        showCascadeToast('Config updated successfully', 'positive');

        setTimeout(() => {
          showCascadeToast('Sizing recalculated — new constraint binding', 'info');
        }, 400);

        setTimeout(() => {
          showCascadeToast('Cascade complete — 3 downstream systems notified', 'positive');
        }, 800);

        // Re-enable button
        setTimeout(() => {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Apply';
        }, 1200);

        // Fire analytics
        if (typeof window.PinchfinAnalytics !== 'undefined') {
          window.PinchfinAnalytics.trackEvent('interaction', 'policy_demo_run', policyText);
        }
      }, 2200);
    });
  }

  /**
   * Animates a number from start to end value within an element.
   * @param {HTMLElement} el - The element to update
   * @param {number} start - Starting value
   * @param {number} end - Target value
   * @param {number} duration - Animation duration in ms
   */
  function animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      el.textContent = isDecimal ? current.toFixed(2) : Math.round(current).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * Shows a toast notification for the cascade demo.
   * @param {string} message - Toast message
   * @param {string} type - 'positive', 'negative', or 'info'
   */
  function showCascadeToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'cascade-toast cascade-toast--' + type;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    // Inline styles for positioning and appearance
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      borderRadius: '8px',
      fontFamily: 'var(--font-primary, "DM Sans", sans-serif)',
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff',
      backgroundColor: type === 'positive' ? '#2D8C4F' : type === 'negative' ? '#C4392D' : '#0D1229',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      zIndex: '1100',
      opacity: '0',
      transform: 'translateY(16px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    });

    document.body.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /* --------------------------------------------------------------------------
     5. Lead Capture Form (White Paper Page)
     - Email validation (HTML5 + basic regex)
     - Submit handler stores in localStorage and shows success message
     -------------------------------------------------------------------------- */
  function initLeadCapture() {
    const form = document.querySelector('.lead-capture-form, [data-lead-form]');
    if (!form) return;

    const emailInput = form.querySelector('input[type="email"], [data-lead-email]');
    const submitBtn = form.querySelector('button[type="submit"], .lead-submit');
    const messageArea = form.querySelector('.lead-message, [data-lead-message]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!emailInput) return;

      const email = emailInput.value.trim();

      // Validate email
      if (!isValidEmail(email)) {
        showLeadMessage(messageArea || form, 'Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      // Store in localStorage
      const leads = JSON.parse(localStorage.getItem('pinchfin_leads') || '[]');
      leads.push({
        email: email,
        timestamp: new Date().toISOString(),
        source: window.location.pathname
      });
      localStorage.setItem('pinchfin_leads', JSON.stringify(leads));

      // Show success
      showLeadMessage(messageArea || form, 'Thank you! Check your email for the white paper.', 'success');
      emailInput.value = '';

      // Disable submit briefly to prevent double submission
      if (submitBtn) {
        submitBtn.disabled = true;
        setTimeout(() => { submitBtn.disabled = false; }, 3000);
      }

      // Fire analytics
      if (typeof window.PinchfinAnalytics !== 'undefined') {
        window.PinchfinAnalytics.trackEvent('conversion', 'lead_capture_submit', email.split('@')[1]);
      }
    });
  }

  /**
   * Validates an email address.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    if (!email) return false;
    // RFC 5322 simplified pattern
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Shows a message near the lead capture form.
   * @param {HTMLElement} container - Where to show the message
   * @param {string} text - Message text
   * @param {string} type - 'success' or 'error'
   */
  function showLeadMessage(container, text, type) {
    // Remove any existing messages
    const existing = container.querySelector('.lead-msg-inline');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'lead-msg-inline';
    msg.setAttribute('role', 'alert');

    Object.assign(msg.style, {
      marginTop: '12px',
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: type === 'success' ? '#2D8C4F' : '#C4392D',
      backgroundColor: type === 'success' ? 'rgba(45,140,79,0.08)' : 'rgba(196,57,45,0.08)',
      border: '1px solid ' + (type === 'success' ? 'rgba(45,140,79,0.2)' : 'rgba(196,57,45,0.2)')
    });

    msg.textContent = text;
    container.appendChild(msg);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (msg.parentNode) {
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { if (msg.parentNode) msg.remove(); }, 300);
      }
    }, 5000);
  }

  /* --------------------------------------------------------------------------
     6. Lazy Loading for Illustrations
     Uses IntersectionObserver to swap data-src → src when images enter
     the viewport. Applies a fade-in animation on load.
     -------------------------------------------------------------------------- */
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.illustration-frame img[data-src]');
    if (lazyImages.length === 0) return;

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      lazyImages.forEach((img) => {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
      return;
    }

    const observerOptions = {
      root: null,           // viewport
      rootMargin: '100px',  // load 100px before entering viewport
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');

          if (src) {
            // Set initial state for fade-in
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';

            img.onload = () => {
              img.style.opacity = '1';
              img.classList.add('loaded');
            };

            img.onerror = () => {
              // Graceful fallback on error
              img.style.opacity = '1';
              img.classList.add('load-error');
            };

            img.src = src;
            img.removeAttribute('data-src');
          }

          observer.unobserve(img);
        }
      });
    }, observerOptions);

    lazyImages.forEach((img) => {
      observer.observe(img);
    });
  }

  /* --------------------------------------------------------------------------
     Initialize All Interactions
     -------------------------------------------------------------------------- */
  function init() {
    initExpandableCards();
    initPhaseCards();
    initSkillsFilter();
    initPolicyCascade();
    initLeadCapture();
    initLazyLoading();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     Public API
     -------------------------------------------------------------------------- */
  window.PinchfinInteractions = {
    expandCard: expandCard,
    collapseCard: collapseCard,
    applySkillsFilter: function () {
      // Re-trigger filter (useful after dynamic content injection)
      initSkillsFilter();
    },
    showToast: showCascadeToast
  };

})();
