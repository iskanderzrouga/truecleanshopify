/**
 * TrueClean Bundle Selector
 * Simple variant selection without subscription logic
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.tcBundleSelectorInitialized) return;
  window.tcBundleSelectorInitialized = true;

  const SELECTORS = {
    variantInput: '.new-lp-variant--input',
    variantContent: '.new-lp-variant-content',
    radioCircle: '.new-lp-variant-radio__circle'
  };

  /**
   * Update visual state of variant options
   */
  function updateVariantVisuals() {
    const inputs = document.querySelectorAll(SELECTORS.variantInput);

    inputs.forEach(input => {
      const label = input.nextElementSibling;
      if (!label) return;

      const content = label.querySelector(SELECTORS.variantContent);
      const circle = label.querySelector(SELECTORS.radioCircle);

      if (input.checked) {
        if (content) {
          content.style.borderColor = '#00B7A2';
          content.style.backgroundColor = '#F5FFFE';
        }
        if (circle) {
          circle.style.display = 'block';
        }
      } else {
        if (content) {
          content.style.borderColor = '#D9DDE0';
          content.style.backgroundColor = '#FAFAFA';
        }
        if (circle) {
          circle.style.display = 'none';
        }
      }
    });
  }

  /**
   * Handle variant selection change
   */
  function handleVariantChange() {
    updateVariantVisuals();
  }

  /**
   * Initialize
   */
  function init() {
    // Listen for changes on variant inputs
    document.addEventListener('change', function(e) {
      if (e.target.matches(SELECTORS.variantInput)) {
        handleVariantChange();
      }
    });

    // Initial update
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateVariantVisuals);
    } else {
      updateVariantVisuals();
    }
  }

  init();
})();
