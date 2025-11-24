// Kalshi API - Content Script Side (sends messages to background script)

const KALSHI_DEBUG = true;

function log(...args) {
    if (KALSHI_DEBUG) {
        console.log('[Kalshi API]', ...args);
    }
}

/**
 * Fetch all open markets from Kalshi (via background script)
 * @param {Object} options - Optional filters (status, limit, series_ticker, etc.)
 * @returns {Promise<Array>} Array of market objects
 */
async function fetchOpenMarkets(options = {}) {
    try {
        log('Requesting markets from background script...');

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'fetchOpenMarkets', options },
                response => {
                    if (chrome.runtime.lastError) {
                        console.error('[Kalshi API] Runtime error:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    if (response.success) {
                        log('Received', response.markets.length, 'markets from background');
                        resolve(response.markets);
                    } else {
                        console.error('[Kalshi API] Error:', response.error);
                        resolve([]); // Return empty array on error
                    }
                }
            );
        });
    } catch (error) {
        console.error('[Kalshi API] Error fetching markets:', error);
        return [];
    }
}

/**
 * Fetch a specific market by ticker (via background script)
 * @param {string} ticker - Market ticker (e.g., "SHUTDOWN-25JAN15")
 * @returns {Promise<Object|null>} Market object or null if not found
 */
async function fetchMarketByTicker(ticker) {
    try {
        log('Requesting market', ticker, 'from background script...');

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'fetchMarketByTicker', ticker },
                response => {
                    if (chrome.runtime.lastError) {
                        console.error('[Kalshi API] Runtime error:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    if (response.success) {
                        log('Received market data from background');
                        resolve(response.market);
                    } else {
                        console.error('[Kalshi API] Error:', response.error);
                        resolve(null);
                    }
                }
            );
        });
    } catch (error) {
        console.error('[Kalshi API] Error fetching market:', error);
        return null;
    }
}