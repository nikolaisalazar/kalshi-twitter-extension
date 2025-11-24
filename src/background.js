// Background Service Worker - Handles API calls to avoid CORS issues

console.log('[Background] Kalshi Extension background script loaded');

// Kalshi API Configuration
const KALSHI_CONFIG = {
  BASE_URL: 'https://api.elections.kalshi.com/trade-api/v2',
  ENDPOINTS: {
    MARKETS: '/markets',
    EVENTS: '/events',
    SERIES: '/series'
  }
};

const KALSHI_DEBUG = true;

function log(...args) {
  if (KALSHI_DEBUG) {
    console.log('[Background/Kalshi API]', ...args);
  }
}

/**
 * Fetch with retry logic
 * @param {string} url - URL to fetch
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      // If rate limited (429), wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        log(`Rate limited. Retrying after ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        log(`Fetch failed, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch all open markets from Kalshi, optionally filtered by category
 * Uses the /events endpoint to access category filtering
 */
async function fetchOpenMarkets(options = {}) {
  try {
    // Use /events endpoint with nested markets to get category filtering
    const params = new URLSearchParams({
      status: 'open',  // Only open events
      with_nested_markets: 'true',  // Include markets in the response
      limit: options.limit || 200,
      ...options
    });

    const url = `${KALSHI_CONFIG.BASE_URL}${KALSHI_CONFIG.ENDPOINTS.EVENTS}?${params}`;

    log('Fetching events (with markets) from:', url);

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract markets from events
    let markets = [];
    const events = data.events || [];

    for (const event of events) {
      if (event.markets && event.markets.length > 0) {
        // Add category to each market (from parent event)
        const marketsWithCategory = event.markets.map(market => ({
          ...market,
          category: event.category,  // Add category from event
          event_category: event.category  // Backup field
        }));
        markets.push(...marketsWithCategory);
      }
    }

    log(`Received ${events.length} events with ${markets.length} total markets`);

    // Now filter out sports if needed
    const originalCount = markets.length;
    markets = markets.filter(market => {
      const title = (market.title || '').toLowerCase();
      const ticker = (market.ticker || '').toLowerCase();
      const category = (market.category || '').toLowerCase();

      // Filter out sports betting markets
      const isSports =
        category === 'sports' ||
        title.includes('nba') ||
        title.includes('points') ||
        title.includes('assists') ||
        title.includes('rebounds') ||
        ticker.includes('nbasinglegame') ||
        ticker.includes('venba') ||
        ticker.includes('mentions') ||  // NFL commentator mentions
        // Player names patterns
        /\d\+/.test(title) && (title.includes('yes ') || title.includes('stephen') || title.includes('draymond'));

      return !isSports;
    });

    log(`Filtered: ${originalCount} total → ${markets.length} non-sports markets`);

    return markets;
  } catch (error) {
    console.error('[Background/Kalshi API] Error fetching markets:', error);
    return [];
  }
}

/**
 * Fetch a specific market by ticker
 */
async function fetchMarketByTicker(ticker) {
  try {
    const url = `${KALSHI_CONFIG.BASE_URL}${KALSHI_CONFIG.ENDPOINTS.MARKETS}/${ticker}`;

    log('Fetching market:', ticker);

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Market not found: ${ticker}`);
    }

    const data = await response.json();
    log('Market data received');

    return data.market || null;
  } catch (error) {
    console.error('[Background/Kalshi API] Error fetching market:', error);
    return null;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('Received message:', request.action);

  if (request.action === 'fetchOpenMarkets') {
    fetchOpenMarkets(request.options || {})
      .then(markets => {
        sendResponse({ success: true, markets });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (request.action === 'fetchMarketByTicker') {
    fetchMarketByTicker(request.ticker)
      .then(market => {
        sendResponse({ success: true, market });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

console.log('[Background] Message listener registered');