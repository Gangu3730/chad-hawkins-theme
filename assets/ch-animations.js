/**
 * Chad Hawkins Tributes - Premium 2026 Interaction & Animation Engine
 * Performance optimized, vanilla JS scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initKineticTypography();
  initIntersectionObserver();
  initParallaxEffects();
  initStickyNavigation();
  initProcessTimelineProgress();
  initFallbackReveal();
});

/**
 * 1. Kinetic Typography (Text Reveal)
 * Wraps words in double span wrappers to animate overflow reveal.
 */
function initKineticTypography() {
  const elements = document.querySelectorAll('.ch-text-reveal-kinetic');
  elements.forEach(el => {
    const text = el.innerText.trim();
    if (!text) return;
    
    el.innerHTML = '';
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      const outerSpan = document.createElement('span');
      outerSpan.className = 'ch-word-outer';
      outerSpan.style.display = 'inline-block';
      outerSpan.style.overflow = 'hidden';
      outerSpan.style.verticalAlign = 'bottom';
      outerSpan.style.marginRight = '0.25em';
      
      const innerSpan = document.createElement('span');
      innerSpan.className = 'ch-word-inner';
      innerSpan.style.display = 'inline-block';
      innerSpan.style.transform = 'translateY(110%)';
      innerSpan.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      innerSpan.innerText = word;
      
      outerSpan.appendChild(innerSpan);
      el.appendChild(outerSpan);
    });
  });
}

/**
 * 2. Viewport entrance reveals & Staggered reveals
 */
function revealElement(target, obs) {
  target.classList.add('is-visible');

  // Handle kinetic text reveal
  if (target.classList.contains('ch-text-reveal-kinetic')) {
    const inners = target.querySelectorAll('.ch-word-inner');
    inners.forEach((inner, idx) => {
      setTimeout(() => {
        inner.style.transform = 'translateY(0)';
      }, idx * 40);
    });
  }

  // Handle staggered groups
  if (target.classList.contains('ch-reveal-group')) {
    const items = target.querySelectorAll('.ch-reveal-item');
    items.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('is-visible');
      }, idx * 100);
    });
  }

  if (obs) obs.unobserve(target); // Animate once
}

function initIntersectionObserver() {
  const options = {
    threshold: 0.01,
    rootMargin: '0px 0px 0px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target, obs);
      }
    });
  }, options);

  const elementsToObserve = document.querySelectorAll(
    '.ch-reveal, .ch-reveal-group, .ch-mask-reveal, .ch-text-reveal-kinetic'
  );

  elementsToObserve.forEach(el => {
    // Immediately reveal elements already in viewport on page load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el, null);
    } else {
      observer.observe(el);
    }
  });
}

/**
 * 3. Parallax Image Motion
 */
function initParallaxEffects() {
  const parallaxImages = document.querySelectorAll('.ch-parallax-img');
  if (parallaxImages.length === 0) return;

  let ticking = false;

  function updatePositions() {
    const viewportHeight = window.innerHeight;
    
    parallaxImages.forEach(img => {
      const parent = img.parentElement;
      const rect = parent.getBoundingClientRect();
      
      // Only calculate if parent is within viewport boundaries
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const parentCenter = rect.top + rect.height / 2;
        const offsetPercent = (parentCenter - viewportHeight / 2) / (viewportHeight / 2);
        // Map scroll deviation to a shift range (e.g. -35px to 35px)
        const shiftY = offsetPercent * 35;
        
        img.style.transform = `translate3d(0, ${shiftY}px, 0) scale(1.15)`;
      }
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updatePositions);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 4. Sticky Section Navigation Scrollspy
 */
function initStickyNavigation() {
  const stickyNav = document.querySelector('.ch-sticky-section-nav');
  if (!stickyNav) return;

  const sections = document.querySelectorAll(
    '#chp-hero, #chp-about, #chp-categories, #chp-process, #chp-gallery, #chp-pricing, #chp-faq'
  );
  const navLinks = stickyNav.querySelectorAll('a');

  // Calculate the sticky offset based on actual header height
  function getStickyOffset() {
    const header = document.querySelector('.header, header, [data-header-sticky]');
    return header ? header.offsetHeight : 0;
  }

  // Apply correct top offset dynamically
  function updateStickyTop() {
    const headerHeight = getStickyOffset();
    stickyNav.style.top = headerHeight + 'px';
  }

  updateStickyTop();
  window.addEventListener('resize', updateStickyTop, { passive: true });

  // Sticky shadow effect based on scroll
  function handleScroll() {
    if (window.scrollY > 100) {
      stickyNav.classList.add('is-sticky');
    } else {
      stickyNav.classList.remove('is-sticky');
    }

    // Scrollspy active anchor update
    const navHeight = stickyNav.offsetHeight + getStickyOffset() + 20;
    let currentActiveId = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navHeight && rect.bottom >= navHeight) {
        currentActiveId = section.getAttribute('id');
      }
    });

    if (currentActiveId) {
      navLinks.forEach(link => {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === `#${currentActiveId}`) {
          link.classList.add('is-active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on init

  // Smooth scroll helper
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const offset = stickyNav.offsetHeight + getStickyOffset() + 20;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 5. Scrollytelling - Process Timeline Progress Line drawing
 */
function initProcessTimelineProgress() {
  const timelineSection = document.querySelector('.chp-process-section');
  if (!timelineSection) return;

  const progressLine = timelineSection.querySelector('.ch-process-progress-line-fill');
  if (!progressLine) return;

  window.addEventListener('scroll', () => {
    const rect = timelineSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate how far down we are scrolling within the process section
    if (rect.top < viewportHeight && rect.bottom > 0) {
      const scrolledIn = viewportHeight - rect.top;
      const totalSectionHeight = rect.height + viewportHeight;
      let percent = (scrolledIn / totalSectionHeight) * 100;
      percent = Math.min(Math.max(percent, 0), 100);

      progressLine.style.height = `${percent}%`;
    }
  }, { passive: true });
}

/**
 * 6. Fallback reveal - ensures all animation elements become visible
 *    after a timeout in case IntersectionObserver doesn't fire
 *    (e.g., Shopify theme editor, preview mode, slow JS)
 */
function initFallbackReveal() {
  setTimeout(() => {
    document.querySelectorAll('.ch-reveal, .ch-mask-reveal, .ch-text-reveal-kinetic, .ch-reveal-group').forEach(el => {
      if (!el.classList.contains('is-visible')) {
        revealElement(el, null);
      }
    });
  }, 2000);
}
