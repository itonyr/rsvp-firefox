/**
 * Overlay injection utilities for RSVP reader
 */

const OVERLAY_CONTAINER_ID = 'rsvp-reader-overlay';
const OVERLAY_ROOT_ID = 'rsvp-reader-root';

/**
 * Create and inject the overlay container into the page
 */
export function injectOverlayContainer(): HTMLElement {
  // Remove any existing overlay
  removeOverlay();
  
  // Create overlay container
  const container = document.createElement('div');
  container.id = OVERLAY_CONTAINER_ID;
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: auto;
  `;
  
  // Create root div for React app
  const root = document.createElement('div');
  root.id = OVERLAY_ROOT_ID;
  root.style.cssText = `
    width: 100%;
    height: 100%;
  `;
  
  container.appendChild(root);
  document.body.appendChild(container);
  
  // Prevent background scrolling
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  
  // Store original overflow for cleanup
  (container as any)._originalOverflow = originalOverflow;
  
  return root;
}

/**
 * Remove the overlay container and restore page state
 */
export function removeOverlay() {
  const container = document.getElementById(OVERLAY_CONTAINER_ID);
  if (container) {
    // Restore body overflow
    const originalOverflow = (container as any)._originalOverflow;
    if (originalOverflow !== undefined) {
      document.body.style.overflow = originalOverflow;
    } else {
      document.body.style.overflow = '';
    }
    
    container.remove();
  }
}

/**
 * Inject CSS stylesheet link into the page
 */
export function injectStylesheet(href: string): void {
  // Check if already injected
  const existing = document.getElementById('rsvp-reader-stylesheet');
  if (existing) {
    return;
  }
  
  const link = document.createElement('link');
  link.id = 'rsvp-reader-stylesheet';
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
