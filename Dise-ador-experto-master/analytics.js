/**
 * Vercel Web Analytics Initialization
 * This script initializes Vercel Web Analytics for the FEISS platform
 */

// Vercel Analytics - Simple initialization for static HTML sites
// The analytics endpoint is automatically available when deployed on Vercel
if (typeof window !== 'undefined') {
  // Load the Vercel Analytics script dynamically
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  script.setAttribute('data-mode', 'auto');
  document.head.appendChild(script);
}
