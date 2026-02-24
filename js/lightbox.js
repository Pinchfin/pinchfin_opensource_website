/* ==========================================================================
   PINCHFIN — lightbox.js
   Click-to-expand modal overlay for illustration SVGs
   Version: 1.0.0
   ========================================================================== */

(function () {
  'use strict';

  let overlay = null;

  function init() {
    // Tag all illustration SVGs as lightbox-enabled
    var images = document.querySelectorAll('.illustration-frame__svg, .figure img');
    images.forEach(function (img) {
      img.setAttribute('data-lightbox', '');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', openLightbox);
    });
  }

  function openLightbox(e) {
    var src = e.currentTarget.getAttribute('src');
    var alt = e.currentTarget.getAttribute('alt') || '';

    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', alt || 'Expanded illustration');

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-overlay__close';
    closeBtn.setAttribute('aria-label', 'Close lightbox');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeLightbox);

    // Image
    var img = document.createElement('img');
    img.className = 'lightbox-overlay__img';
    img.src = src;
    img.alt = alt;

    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(function () {
      overlay.classList.add('lightbox-overlay--visible');
    });

    // Click overlay background to close
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) closeLightbox();
    });

    // Escape key to close
    document.addEventListener('keydown', onEscape);
  }

  function closeLightbox() {
    if (!overlay) return;

    overlay.classList.remove('lightbox-overlay--visible');

    overlay.addEventListener('transitionend', function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
      document.body.style.overflow = '';
    }, { once: true });

    document.removeEventListener('keydown', onEscape);
  }

  function onEscape(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
