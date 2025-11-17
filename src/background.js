/**
 * Kalshi Twitter Extension - Background Service Worker
 * 
 * This script runs in the background and handles:
 * - Extension lifecycle events (install, update)
 * - Message passing between content scripts
 * - Future: API calls and caching (if needed)
 */

console.log('Kalshi Twitter Extension - Background service worker initialized');

/**
 * Runs when the extension is first installed or updated
 */
chrome.runtime.onInstalled.addListener((details) => {
  const { reason, previousVersion } = details;

  if (reason === 'install') {
    console.log('✓ Extension installed for the first time');

    // Optional: You could open a welcome page here
    // chrome.tabs.create({ url: 'https://yourwebsite.com/welcome' });

  } else if (reason === 'update') {
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`✓ Extension updated from version ${previousVersion} to ${currentVersion}`);

    // Optional: Show update notification or changelog

  } else if (reason === 'chrome_update') {
    console.log('✓ Chrome browser was updated');
  }
});

/**
 * Receives messages from other parts of the extension (like content scripts)
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received in background:', request);
  console.log('📍 From tab:', sender.tab?.id, sender.url);

  // Handle different types of messages
  if (request.type === 'TWEET_DETECTED') {
    console.log('🐦 Tweet detected:', request.data);
    // In Phase 2, we might trigger API calls here
    sendResponse({ success: true, message: 'Tweet received by background' });

  } else if (request.type === 'API_CALL') {
    // In Phase 2, we'll handle Kalshi API calls here
    console.log('🔌 API call requested');
    sendResponse({ success: true, message: 'API call handler ready' });

  } else if (request.type === 'ERROR') {
    console.error('❌ Error reported from content script:', request.error);
    sendResponse({ success: true, message: 'Error logged' });

  } else {
    console.warn('⚠️  Unknown message type:', request.type);
    sendResponse({ success: false, message: 'Unknown message type' });
  }

  // Return true to indicate we'll send a response asynchronously
  return true;
});

/**
 * Runs when user clicks the extension icon in the toolbar
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('🖱️  Extension icon clicked in tab:', tab.id);

  // Optional: Could open settings, toggle features, etc.
  // For now, we'll just send a message to the content script

  chrome.tabs.sendMessage(tab.id, {
    type: 'ICON_CLICKED',
    timestamp: Date.now()
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('⚠️  Could not send message to content script:', chrome.runtime.lastError.message);
    } else {
      console.log('✓ Content script responded:', response);
    }
  });
});

/**
 * Runs when the browser starts up
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Browser started, extension service worker activated');

  // Future: Could initialize cache, fetch initial data, etc.
});

console.log('✅ Background script setup complete');