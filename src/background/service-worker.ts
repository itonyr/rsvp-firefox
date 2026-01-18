import type { Session } from '../types/session';

// In-memory session store (ephemeral, not persisted)
let currentSession: Session | null = null;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Register the context menu item
 */
async function registerContextMenu() {
  try {
    await browser.contextMenus.create({
      id: 'rsvp-read-selection',
      title: 'Read selection with RSVP',
      contexts: ['selection'],
    });
    console.log('RSVP Reader: Context menu registered');
  } catch (error) {
    console.error('RSVP Reader: Failed to register context menu', error);
  }
}

/**
 * Handle context menu click
 */
async function handleContextMenuClick(
  info: browser.contextMenus.OnClickData,
  tab?: browser.tabs.Tab
) {
  if (!tab || !tab.id) {
    console.error('RSVP Reader: No active tab');
    return;
  }

  try {
    // Inject content script and start RSVP
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content-script.js'],
    });

    // Send message to content script to start RSVP
    await browser.tabs.sendMessage(tab.id, {
      type: 'START_RSVP',
    });
  } catch (error) {
    console.error('RSVP Reader: Failed to start RSVP', error);
  }
}

/**
 * Handle keyboard shortcut command
 */
async function handleCommand(command: string, tab?: browser.tabs.Tab) {
  if (command === 'start-rsvp') {
    if (!tab || !tab.id) {
      console.error('RSVP Reader: No active tab');
      return;
    }

    try {
      // Inject content script
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content-script.js'],
      });

      // Send message to content script to start RSVP
      await browser.tabs.sendMessage(tab.id, {
        type: 'START_RSVP',
      });
    } catch (error) {
      console.error('RSVP Reader: Failed to start RSVP', error);
    }
  }
}

/**
 * Handle messages from content script
 */
function handleMessage(
  message: any,
  sender: browser.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  if (message.type === 'CREATE_SESSION') {
    const session: Session = {
      sessionId: generateSessionId(),
      sourceUrl: sender.tab?.url || '',
      createdAt: Date.now(),
      rawText: message.text,
      tokens: message.tokens,
      currentIndex: 0,
      wpm: message.wpm || 450,
      isPlaying: true,
    };
    
    currentSession = session;
    sendResponse({ success: true, sessionId: session.sessionId });
  } else if (message.type === 'GET_SESSION') {
    sendResponse({ session: currentSession });
  } else if (message.type === 'UPDATE_SESSION') {
    if (currentSession && message.sessionId === currentSession.sessionId) {
      Object.assign(currentSession, message.updates);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false });
    }
  } else if (message.type === 'CLEAR_SESSION') {
    currentSession = null;
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
}

// Initialize on install
browser.runtime.onInstalled.addListener(() => {
  registerContextMenu();
});

// Register event listeners
browser.contextMenus.onClicked.addListener(handleContextMenuClick);
browser.commands.onCommand.addListener(handleCommand);
browser.runtime.onMessage.addListener(handleMessage);

console.log('RSVP Reader: Background service worker loaded');
