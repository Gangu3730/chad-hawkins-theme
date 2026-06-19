/**
 * Chad Hawkins Tributes — Premium 2026 Animation Engine
 * Editions-inspired scroll interactions
 */
(function () {
  'use strict';

  function initAll() {
    splitKineticText();
    createObservers();
    initParallax();
    initStickyNav();
    initTimelineProgress();
    initHeroKenBurns();
    initSmoothScroll();
    initScrollytelling();
    initGalleryFilter();
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initAll();
  } else {
    document.addEventListener('DOMContentLoaded', initAll);
  }

  // Re-initialize when sections load in Shopify Theme Customizer
  document.addEventListener('shopify:section:load', (event) => {
    initAll();
  });

  /* 1. Kinetic split-text */
  function splitKineticText() {
    document.querySelectorAll('.chp-text-reveal').forEach(el => {
      if (el.dataset.splitDone) return;
      const raw = el.textContent.trim();
      if (!raw) return;
      el.textContent = '';
      raw.split(/\s+/).forEach(word => {
        const outer = document.createElement('span');
        outer.className = 'chp-word-outer';
        const inner = document.createElement('span');
        inner.className = 'chp-word-inner';
        inner.textContent = word;
        outer.appendChild(inner);
        el.appendChild(outer);
      });
      el.dataset.splitDone = 'true';
    });
  }

  /* 2. Intersection Observer */
  function createObservers() {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');
          if (el.classList.contains('chp-text-reveal')) {
            el.querySelectorAll('.chp-word-inner').forEach((w, i) => {
              w.style.transitionDelay = `${i * 0.045}s`;
              w.classList.add('is-visible');
            });
          }
          if (el.classList.contains('chp-stagger') || el.classList.contains('chp-reveal-group')) {
            el.querySelectorAll('.chp-stagger-item').forEach((item, i) => {
              item.style.transitionDelay = `${i * 0.1}s`;
              requestAnimationFrame(() => item.classList.add('is-visible'));
            });
          }
          if (el.classList.contains('chp-counter')) {
            animateCounter(el);
          }
          obs.unobserve(el);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll(
      '.chp-reveal, .chp-stagger, .chp-reveal-group, .chp-mask, .chp-mask-up, .chp-mask-center, .chp-text-reveal, .chp-counter'
    ).forEach(el => obs.observe(el));
  }

  /* 3. Parallax */
  function initParallax() {
    const imgs = document.querySelectorAll('.chp-parallax-img');
    if (!imgs.length) return;
    let ticking = false;
    function tick() {
      const vh = window.innerHeight;
      imgs.forEach(img => {
        const wrap = img.closest('.chp-parallax-wrap') || img.parentElement;
        if (!wrap) return;
        const r = wrap.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const pct = ((r.top + r.height / 2) - vh / 2) / (vh / 2);
        img.style.transform = `translate3d(0,${pct * 28}px,0) scale(1.1)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(tick); ticking = true; }
    }, { passive: true });
    tick();
  }

  /* 4. Sticky Nav Scrollspy */
  function initStickyNav() {
    const nav = document.querySelector('.chp-sticky-nav');
    if (!nav) return;
    const anchors = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = anchors.map(a => {
      const href = a.getAttribute('href');
      if (href === '#' || !href) return null;
      try {
        return document.getElementById(href.slice(1));
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-sticky', window.scrollY > 120);
      let activeId = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top <= 200) { activeId = sections[i].id; break; }
      }
      anchors.forEach(a => {
        const href = a.getAttribute('href');
        a.classList.toggle('is-active', href === '#' + activeId);
      });
    }, { passive: true });
  }

  /* 5. Timeline Progress */
  function initTimelineProgress() {
    const section = document.querySelector('.chp-timeline-section');
    if (!section) return;
    const fill = section.querySelector('.chp-timeline-fill');
    if (!fill) return;
    window.addEventListener('scroll', () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top >= vh || r.bottom <= 0) return;
      fill.style.height = Math.min(Math.max((vh - r.top) / (r.height + vh), 0), 1) * 100 + '%';
    }, { passive: true });
  }

  /* 6. Hero Ken Burns */
  function initHeroKenBurns() {
    const bg = document.querySelector('.chp-hero-bg-img');
    if (!bg) return;
    if (bg.complete) bg.classList.add('is-loaded');
    else bg.addEventListener('load', () => bg.classList.add('is-loaded'));
  }

  /* 7. Smooth Anchor Scroll */
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href === '#' || !href) return;
      try {
        const t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
      } catch (err) {
        // Ignore invalid queries
      }
    });
  }

  /* 8. Scrollytelling */
  function initScrollytelling() {
    const wrap = document.querySelector('.chp-scrolly');
    if (!wrap) return;
    const cards = wrap.querySelectorAll('.chp-scrolly-card');
    const sticky = wrap.querySelector('.chp-scrolly-sticky');
    if (!cards.length) return;

    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          const idx = entry.target.dataset.index;
          if (sticky) {
            sticky.querySelectorAll('.chp-scrolly-dot').forEach((d, i) => {
              d.classList.toggle('is-active', i === parseInt(idx));
            });
          }
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    }, { threshold: 0.15, rootMargin: '-10% 0px -10% 0px' });

    cards.forEach(c => cardObs.observe(c));
  }

  /* 9. Gallery Filter */
  function initGalleryFilter() {
    const wrap = document.querySelector('.chp-gallery-filter-wrap');
    if (!wrap) return;
    const btns = wrap.querySelectorAll('.chp-filter-btn');
    const items = wrap.querySelectorAll('.chp-gallery-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        btns.forEach(b => b.classList.toggle('is-active', b === btn));
        items.forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.style.display = show ? '' : 'none';
          if (show) {
            item.classList.remove('is-visible');
            requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('is-visible')));
          }
        });
      });
    });
  }

  /* Helper: Counter */
  function animateCounter(el) {
    const end = parseInt(el.dataset.count || el.textContent, 10);
    if (isNaN(end)) return;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * end);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
})();
