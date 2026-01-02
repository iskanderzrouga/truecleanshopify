/**
 * TrueClean Bundle Selector
 *
 * Clean, single-source JavaScript for bundle selection with subscription toggle.
 * Works WITH Shopify's variant system, not against it.
 *
 * Architecture:
 * - Liquid renders all price data as data attributes
 * - CSS classes control visibility (.show-subscription / .show-onetime)
 * - This JS only handles: toggle state, selling_plan input, calculated displays
 */

(function() {
  'use strict';

  // Prevent multiple initializations (in case script tag is re-inserted on re-render)
  if (window.tcBundleSelectorInitialized) return;
  window.tcBundleSelectorInitialized = true;

  // State
  const state = {
    isSubscription: true  // Default to subscription mode
  };

  // Selectors (centralized for easy maintenance)
  const SELECTORS = {
    toggle: '.sub-onetime-toggle',
    productsVariants: '#productsVariants',
    variantInput: '.new-lp-variant--inut-sub',
    variantLabel: '.new-lp-variant--label-sub',
    sellingPlanInput: 'input[re-sub-widget__selling-plan-input]',
    totalPrice: '.tc-total-price',
    monthlyPrice: '.tc-monthly-price',
    subOnlyContent: '.sub-only-content'
  };

  /**
   * Apply the current subscription/one-time state to the UI
   */
  function applyToggleState() {
    const toggle = document.querySelector(SELECTORS.toggle);
    const productsVariants = document.querySelector(SELECTORS.productsVariants);
    const subOnlyElements = document.querySelectorAll(SELECTORS.subOnlyContent);

    if (!toggle) return;

    if (state.isSubscription) {
      toggle.classList.add('active');
      if (productsVariants) {
        productsVariants.classList.remove('show-onetime');
        productsVariants.classList.add('show-subscription');
      }
      subOnlyElements.forEach(el => el.style.display = '');
    } else {
      toggle.classList.remove('active');
      if (productsVariants) {
        productsVariants.classList.remove('show-subscription');
        productsVariants.classList.add('show-onetime');
      }
      subOnlyElements.forEach(el => el.style.display = 'none');
    }
  }

  /**
   * Update the selling plan input based on current state and selected variant
   */
  function updateSellingPlanInput() {
    const input = document.querySelector(SELECTORS.sellingPlanInput);
    if (!input) return;

    if (state.isSubscription) {
      const checkedInput = document.querySelector(`${SELECTORS.variantInput}:checked`);
      if (checkedInput) {
        const label = checkedInput.nextElementSibling;
        if (label) {
          const subId = label.getAttribute('data-subscription-id');
          input.value = subId || '';
        }
      }
    } else {
      input.value = '';
    }
  }

  /**
   * Update the calculated price displays (total and monthly)
   */
  function updatePriceDisplays() {
    const totalDisplay = document.querySelector(SELECTORS.totalPrice);
    const monthlyDisplay = document.querySelector(SELECTORS.monthlyPrice);
    const checkedInput = document.querySelector(`${SELECTORS.variantInput}:checked`);

    if (!checkedInput) return;

    const label = checkedInput.nextElementSibling;
    if (!label || !label.dataset) return;

    // Update total price
    if (totalDisplay) {
      const price = state.isSubscription
        ? label.dataset.totalPrice
        : label.dataset.totalPriceOnetime;
      if (price) totalDisplay.textContent = price;
    }

    // Update monthly price in header
    if (monthlyDisplay && label.dataset.monthlyPrice) {
      monthlyDisplay.textContent = label.dataset.monthlyPrice + '/month';
    }
  }

  /**
   * Handle toggle click
   */
  function handleToggleClick(e) {
    const toggle = e.target.closest(SELECTORS.toggle);
    if (!toggle) return;

    state.isSubscription = !state.isSubscription;
    applyToggleState();
    updateSellingPlanInput();
    updatePriceDisplays();
  }

  /**
   * Handle variant change (called after Shopify re-renders the HTML)
   */
  function handleVariantChange() {
    // Re-apply toggle state (the toggle HTML was re-rendered)
    applyToggleState();
    // Update selling plan for the newly selected variant
    updateSellingPlanInput();
    // Update price displays
    updatePriceDisplays();
  }

  /**
   * Set default selection to "1 toilet" on initial page load
   */
  function setDefaultSelection() {
    const variantInputs = document.querySelectorAll(SELECTORS.variantInput);
    const oneToiletInput = Array.from(variantInputs).find(input =>
      input.value.toLowerCase().includes('1 toilet')
    );

    if (oneToiletInput && !oneToiletInput.checked) {
      // Uncheck all, then check the 1 toilet option
      variantInputs.forEach(input => input.checked = false);
      oneToiletInput.checked = true;

      // Trigger Shopify's variant change to sync everything
      oneToiletInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Initialize the bundle selector
   */
  function init() {
    // Use event delegation for toggle clicks (survives DOM re-renders)
    document.addEventListener('click', handleToggleClick);

    // Subscribe to Shopify's variant change event
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.variantChange, handleVariantChange);
    }

    // Initial setup when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        applyToggleState();
        setDefaultSelection();
        updatePriceDisplays();
      });
    } else {
      // DOM already loaded
      applyToggleState();
      setDefaultSelection();
      updatePriceDisplays();
    }
  }

  // Initialize once
  init();

})();
