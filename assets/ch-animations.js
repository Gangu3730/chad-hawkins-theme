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
function initIntersectionObserver() {
  const options = {
    threshold: 0.05,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
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
        
        obs.unobserve(target); // Animate once
      }
    });
  }, options);

  const elementsToObserve = document.querySelectorAll(
    '.ch-reveal, .ch-reveal-group, .ch-mask-reveal, .ch-text-reveal-kinetic'
  );
  
  elementsToObserve.forEach(el => observer.observe(el));
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

  // Sticky stickiness toggle based on main header height
  window.addEventListener('scroll', () => {
    const stickyTop = stickyNav.getBoundingClientRect().top;
    if (window.scrollY > 150) {
      stickyNav.classList.add('is-sticky');
    } else {
      stickyNav.classList.remove('is-sticky');
    }

    // Scrollspy active anchor update
    let currentActiveId = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      // Section is active if it occupies the top third portion of viewport
      if (rect.top <= 180 && rect.bottom >= 180) {
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
  }, { passive: true });

  // Smooth scroll helper
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const offset = 140; // accounted for header + sticky nav height
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
