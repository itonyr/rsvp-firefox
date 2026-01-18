import { injectOverlayContainer, removeOverlay, injectStylesheet } from './overlay-injector';
import { tokenizeText } from '../overlay/tokenizer';
import { mountOverlay } from '../overlay/App';

const DEFAULT_WPM = 450;

// Track if overlay is currently active
let overlayActive = false;
let overlayRoot: HTMLElement | null = null;

/**
 * Extract selected text from the page
 */
function extractSelection(): string | null {
  const selection = window.getSelection();
  if (!selection) {
    return null;
  }
  
  const text = selection.toString().trim();
  if (text.length === 0) {
    return null;
  }
  
  return text;
}

/**
 * Start RSVP reading with selected text
 */
async function startRSVP() {
  if (overlayActive) {
    console.warn('RSVP Reader: Overlay already active');
    return;
  }
  
  const text = extractSelection();
  if (!text) {
    // Show non-blocking message (could use a toast, but for v1 just log)
    console.log('RSVP Reader: Select text to read.');
    return;
  }
  
  // Tokenize the text
  const tokens = tokenizeText(text, DEFAULT_WPM);
  
  if (tokens.length === 0) {
    console.log('RSVP Reader: No tokens to display');
    return;
  }
  
  // Inject stylesheet
  const cssUrl = browser.runtime.getURL('styles/overlay.css');
  injectStylesheet(cssUrl);
  
  // Inject overlay container
  overlayRoot = injectOverlayContainer();
  overlayActive = true;
  
  // Notify background script
  try {
    await browser.runtime.sendMessage({
      type: 'CREATE_SESSION',
      text,
      tokens,
      wpm: DEFAULT_WPM,
    });
  } catch (error) {
    console.error('RSVP Reader: Failed to create session', error);
  }
  
  // Load and mount React app
  await loadAndMountOverlay(tokens, DEFAULT_WPM);
}

/**
 * Load and mount the React overlay app
 */
function loadAndMountOverlay(tokens: any[], initialWpm: number) {
  if (!overlayRoot) {
    return;
  }
  
  // Mount React app directly (bundled into content script)
  mountOverlay(overlayRoot, tokens, initialWpm);
}

/**
 * Exit RSVP overlay
 */
function exitRSVP() {
  if (!overlayActive) {
    return;
  }
  
  // Unmount React app (if mounted)
  // React will handle cleanup when root element is removed
  overlayRoot = null;
  
  // Remove overlay
  removeOverlay();
  overlayActive = false;
  
  // Notify background script
  browser.runtime.sendMessage({
    type: 'CLEAR_SESSION',
  }).catch(err => console.error('RSVP Reader: Failed to clear session', err));
}

/**
 * Handle messages from background script
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RSVP') {
    startRSVP().catch(err => {
      console.error('RSVP Reader: Failed to start RSVP', err);
    });
    sendResponse({ success: true });
  } else if (message.type === 'EXIT_RSVP') {
    exitRSVP();
    sendResponse({ success: true });
  }
  
  return true;
});

// Export exit function for overlay to call
(window as any).rsvpExit = exitRSVP;

console.log('RSVP Reader: Content script loaded');
