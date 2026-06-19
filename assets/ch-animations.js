/**
 * Chad Hawkins Tributes — 2026 Premium Animation Engine
 * Modern sketch-studio aesthetic with buttery scroll interactions
 */

(function () {
  'use strict';

  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  /* ------------------------------------------------------------------ */
  /* 0. Boot                                                             */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    splitKineticText();
    createObservers();
    initParallax();
    initStickyNav();
    initTimelineProgress();
    initHeroKenBurns();
    initSmoothAnchorScroll();
  });

  /* ------------------------------------------------------------------ */
  /* 1. Kinetic split-text                                               */
  /* ------------------------------------------------------------------ */
  function splitKineticText() {
    document.querySelectorAll('.ch-text-reveal-kinetic').forEach(el => {
      const raw = el.textContent.trim();
      if (!raw) return;
      el.textContent = '';
      raw.split(/\s+/).forEach(word => {
        const outer = document.createElement('span');
        outer.className = 'ch-word-outer';
        const inner = document.createElement('span');
        inner.className = 'ch-word-inner';
        inner.textContent = word;
        outer.appendChild(inner);
        el.appendChild(outer);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Intersection Observer – single observer, many behaviours         */
  /* ------------------------------------------------------------------ */
  function createObservers() {
    const map = new Map(); // element → callback

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');

          // Kinetic words
          if (el.classList.contains('ch-text-reveal-kinetic')) {
            el.querySelectorAll('.ch-word-inner').forEach((w, i) => {
              w.style.transitionDelay = `${i * 0.045}s`;
              w.classList.add('is-visible');
            });
          }

          // Staggered children
          if (el.classList.contains('ch-reveal-group')) {
            el.querySelectorAll('.ch-reveal-item').forEach((item, i) => {
              item.style.transitionDelay = `${i * 0.12}s`;
              requestAnimationFrame(() => item.classList.add('is-visible'));
            });
          }

          // Counter animation
          if (el.classList.contains('ch-counter')) {
            animateCounter(el);
          }

          obs.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(
      [
        '.ch-reveal',
        '.ch-reveal-group',
        '.ch-mask-reveal',
        '.ch-mask-reveal-center',
        '.ch-mask-reveal-up',
        '.ch-text-reveal-kinetic',
        '.ch-counter',
      ].join(',')
    ).forEach(el => obs.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* 3. Parallax – GPU-friendly rAF loop                                 */
  /* ------------------------------------------------------------------ */
  function initParallax() {
    const imgs = document.querySelectorAll('.ch-parallax-img');
    if (!imgs.length) return;
    let ticking = false;

    function tick() {
      const vh = window.innerHeight;
      imgs.forEach(img => {
        const r = (img.closest('.ch-parallax-wrap') || img.parentElement).getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const center = r.top + r.height / 2;
        const pct = (center - vh / 2) / (vh / 2);
        img.style.transform = `translate3d(0,${pct * 30}px,0) scale(1.12)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(tick); ticking = true; }
    }, { passive: true });

    tick(); // initial position
  }

  /* ------------------------------------------------------------------ */
  /* 4. Sticky section navigation scrollspy                              */
  /* ------------------------------------------------------------------ */
  function initStickyNav() {
    const nav = document.querySelector('.ch-sticky-section-nav');
    if (!nav) return;

    const anchors = [...nav.querySelectorAll('a[href^="#"]')];
    const sectionIds = anchors.map(a => a.getAttribute('href').slice(1));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-sticky', window.scrollY > 120);

      let activeId = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top <= 200) {
          activeId = sections[i].id;
          break;
        }
      }
      anchors.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${activeId}`);
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Process timeline progress line                                   */
  /* ------------------------------------------------------------------ */
  function initTimelineProgress() {
    const section = document.querySelector('.chp-process-section');
    if (!section) return;
    const fill = section.querySelector('.ch-process-progress-line-fill');
    if (!fill) return;

    window.addEventListener('scroll', () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top >= vh || r.bottom <= 0) return;
      const pct = Math.min(Math.max((vh - r.top) / (r.height + vh), 0), 1);
      fill.style.height = `${pct * 100}%`;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Hero ken-burns slow zoom on background image                     */
  /* ------------------------------------------------------------------ */
  function initHeroKenBurns() {
    const bg = document.querySelector('.ch-hero-bg-img');
    if (!bg) return;
    // The CSS animation handles the zoom, JS adds the loaded class
    bg.addEventListener('load', () => bg.classList.add('is-loaded'));
    if (bg.complete) bg.classList.add('is-loaded');
  }

  /* ------------------------------------------------------------------ */
  /* 7. Smooth anchor scroll (for sticky nav & any #hash links)          */
  /* ------------------------------------------------------------------ */
  function initSmoothAnchorScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 130;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  function animateCounter(el) {
    const end = parseInt(el.dataset.count || el.textContent, 10);
    if (isNaN(end)) return;
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const pct = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      el.textContent = Math.round(eased * end);
      if (pct < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
