(function() {
  const STORAGE_KEY = 'ch_wishlist';

  // Read wishlist from localStorage
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  // Save wishlist to localStorage
  function saveWishlist(wishlist) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch(e) {
      console.error('Failed to save wishlist', e);
    }
    updateBadges();
  }

  // Toggle product in wishlist
  function toggleWishlist(handle) {
    if (!handle) return false;
    let wishlist = getWishlist();
    const index = wishlist.indexOf(handle);
    let added = false;
    
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(handle);
      added = true;
    }
    
    saveWishlist(wishlist);
    return added;
  }

  // Update count badges on header and drawer icons
  function updateBadges() {
    const wishlist = getWishlist();
    const count = wishlist.length;
    const badges = document.querySelectorAll('.chp-wishlist-count');
    
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // Update active state of wishlist toggle buttons on the page
  function updateToggleStates() {
    const wishlist = getWishlist();
    const buttons = document.querySelectorAll('[data-wishlist-toggle]');
    
    buttons.forEach(btn => {
      const handle = btn.getAttribute('data-product-handle');
      if (wishlist.includes(handle)) {
        btn.classList.add('is-active');
        const textSpan = btn.querySelector('.chp-wishlist-btn-text');
        if (textSpan) textSpan.textContent = 'In Wishlist';
      } else {
        btn.classList.remove('is-active');
        const textSpan = btn.querySelector('.chp-wishlist-btn-text');
        if (textSpan) textSpan.textContent = 'Add to Wishlist';
      }
    });
  }

  // Automatically inject wishlist overlay buttons into standard product cards
  function injectProductCardButtons() {
    const cards = document.querySelectorAll('product-card.product-card:not([data-wishlist-injected])');
    
    cards.forEach(card => {
      // Find the link to extract the product handle
      const link = card.querySelector('a.product-card__link');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      const match = href.match(/\/products\/([^?\/]+)/);
      if (!match || !match[1]) return;
      
      const handle = match[1];
      card.setAttribute('data-wishlist-injected', 'true');
      
      // We want to append the overlay button inside the product-card__content wrapper
      const content = card.querySelector('.product-card__content');
      if (!content) return;
      
      // Create wishlist overlay button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chp-card-wishlist-btn';
      btn.setAttribute('data-wishlist-toggle', 'true');
      btn.setAttribute('data-product-handle', handle);
      btn.setAttribute('aria-label', 'Toggle Wishlist');
      btn.innerHTML = `
        <svg class="chp-card-wishlist-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      
      // Style positioning context
      content.style.position = 'relative';
      content.appendChild(btn);
      
      // Click event
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(handle);
        updateToggleStates();
      });
    });
  }

  // Bind clicks to standard product page wishlist toggle button
  function setupProductPageToggle() {
    document.body.addEventListener('click', function(e) {
      const toggleBtn = e.target.closest('.chp-wishlist-toggle-btn');
      if (!toggleBtn) return;
      
      e.preventDefault();
      const handle = toggleBtn.getAttribute('data-product-handle');
      if (handle) {
        toggleWishlist(handle);
        updateToggleStates();
      }
    });
  }

  // Initialize wishlist actions
  function init() {
    updateBadges();
    updateToggleStates();
    injectProductCardButtons();
    setupProductPageToggle();
    
    // Periodically scan for dynamically added product cards (infinite scroll/ajax filtering)
    const observer = new MutationObserver(() => {
      injectProductCardButtons();
      updateToggleStates();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global API
  window.CH_Wishlist = {
    get: getWishlist,
    toggle: toggleWishlist,
    update: updateBadges
  };
})();
