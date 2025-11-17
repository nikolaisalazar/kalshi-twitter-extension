/**
 * Kalshi Twitter Extension - Content Script
 * Detects and extracts text from tweets (ENHANCED for deep threads)
 */

console.log('Kalshi Twitter Extension - Content script loaded');

// Configuration
const CONFIG = {
  SELECTORS: {
    TWEET_TEXT: '[data-testid="tweetText"]',
    TWEET_ARTICLE: 'article[data-testid="tweet"]',
    TWEET_CONTAINER: '[data-testid="cellInnerDiv"]',
  },
  DEBUG: true, // Set to false in production
};

/**
 * Utility: Log debug messages
 */
function debugLog(message, data = null) {
  if (CONFIG.DEBUG) {
    console.log(`[Kalshi Extension] ${message}`, data || '');
  }
}

/**
 * Utility: Check if current page is a tweet detail page
 */
function isTweetDetailPage() {
  // Pattern: twitter.com/username/status/tweetid
  const pattern = /\/(status|statuses)\/\d+/;
  const isDetailPage = pattern.test(window.location.pathname);
  debugLog('Is tweet detail page:', isDetailPage);
  return isDetailPage;
}

/**
 * Utility: Extract tweet ID from URL
 */
function getTweetIdFromUrl() {
  const match = window.location.pathname.match(/\/status(?:es)?\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Utility: Extract username from URL
 */
function getUsernameFromUrl() {
  const match = window.location.pathname.match(/^\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Extract text from a tweet element
 * @param {HTMLElement} tweetElement - The tweet article element
 * @returns {string} - Extracted tweet text
 */
function extractTweetText(tweetElement) {
  if (!tweetElement) {
    debugLog('No tweet element provided');
    return '';
  }

  // Find the tweet text element
  const textElement = tweetElement.querySelector(CONFIG.SELECTORS.TWEET_TEXT);

  if (!textElement) {
    debugLog('Tweet text element not found');
    return '';
  }

  // Get the inner text
  const text = textElement.innerText || textElement.textContent || '';
  debugLog('Extracted tweet text:', text);

  return text.trim();
}

/**
 * Check if a tweet element contains a quoted tweet
 * @param {HTMLElement} tweetElement - The main tweet element
 * @returns {boolean}
 */
function hasQuoteTweet(tweetElement) {
  if (!tweetElement) {
    debugLog('hasQuoteTweet: No tweet element provided');
    return false;
  }

  debugLog('=== CHECKING FOR QUOTE TWEET ===');

  // Strategy 1: Check for multiple tweetText elements (most reliable)
  const allTweetTexts = tweetElement.querySelectorAll('[data-testid="tweetText"]');
  debugLog(`  Found ${allTweetTexts.length} tweetText elements`);
  if (allTweetTexts.length > 1) {
    debugLog('  ✓ Quote tweet detected: Multiple tweetText elements found');
    return true;
  }

  // Strategy 2: Look for nested articles
  const allArticles = tweetElement.querySelectorAll('article');
  debugLog(`  Found ${allArticles.length} articles`);
  if (allArticles.length > 1) {
    debugLog('  ✓ Quote tweet detected: Nested article found');
    return true;
  }

  // Strategy 3: Look for specific quote tweet containers
  const quoteIndicators = [
    '[data-testid="card.layoutLarge.media"]',
    '[data-testid="card.layoutSmall.media"]',
    '[data-testid="quoteTweet"]',
    // New: Look for any div that contains both a user link and tweet text (quote pattern)
    'div[role="link"]',
  ];

  for (const selector of quoteIndicators) {
    const element = tweetElement.querySelector(selector);
    debugLog(`  Checking selector: ${selector}`);
    if (element) {
      debugLog(`  ✓ Quote tweet indicator FOUND: ${selector}`);
      return true;
    }
  }

  debugLog('  ✗ No quote tweet indicators found');
  return false;
}

/**
 * Extract text from a quoted tweet
 * @param {HTMLElement} tweetElement - The main tweet element
 * @returns {string} - Extracted quote tweet text
 */
function extractQuoteTweetText(tweetElement) {
  if (!tweetElement) {
    debugLog('extractQuoteTweetText: No tweet element provided');
    return '';
  }

  debugLog('=== EXTRACTING QUOTE TWEET TEXT ===');

  // Strategy 1: Multiple tweetText elements (most common)
  const allTweetTexts = tweetElement.querySelectorAll('[data-testid="tweetText"]');
  debugLog(`Strategy 1: Found ${allTweetTexts.length} total tweetText elements`);

  if (allTweetTexts.length > 1) {
    // First element is main tweet, second is quote
    const quotedText = allTweetTexts[1].innerText.trim();
    if (quotedText) {
      debugLog(`  ✓ SUCCESS: Extracted from second tweetText element:`, quotedText);
      return quotedText;
    }
  }

  // Strategy 2: Look for nested article
  const nestedArticles = tweetElement.querySelectorAll('article');
  debugLog(`Strategy 2: Found ${nestedArticles.length} total articles`);

  if (nestedArticles.length > 1) {
    for (let i = 1; i < nestedArticles.length; i++) {
      const quotedArticle = nestedArticles[i];
      const quotedText = extractTweetText(quotedArticle);
      if (quotedText) {
        debugLog(`  ✓ SUCCESS: Extracted from nested article ${i}:`, quotedText);
        return quotedText;
      }
    }
  }

  // Strategy 3: Look for quote tweet within card layout
  const cardSelectors = [
    '[data-testid="card.layoutLarge.media"]',
    '[data-testid="card.layoutSmall.media"]',
    '[data-testid="quoteTweet"]',
  ];

  debugLog('Strategy 3: Checking card layouts...');
  for (const selector of cardSelectors) {
    const card = tweetElement.querySelector(selector);
    if (card) {
      debugLog(`  ✓ Found card: ${selector}`);
      const textElements = card.querySelectorAll('[data-testid="tweetText"]');
      if (textElements.length > 0) {
        const quotedText = textElements[0].innerText.trim();
        if (quotedText) {
          debugLog(`  ✓ SUCCESS: Extracted from card:`, quotedText);
          return quotedText;
        }
      }
    }
  }

  debugLog('✗ FAILED: No quote tweet text found');
  return '';
}

/**
 * Extract comprehensive tweet data including quotes and images (UPDATED)
 * @param {HTMLElement} tweetElement - The tweet element
 * @returns {Object} - Complete tweet data
 */
function extractCompleteTweetData(tweetElement) {
  if (!tweetElement) {
    return null;
  }

  const mainText = extractTweetText(tweetElement);
  const hasQuote = hasQuoteTweet(tweetElement);
  const quoteText = hasQuote ? extractQuoteTweetText(tweetElement) : '';

  // Extract image data
  const images = extractImageAltTexts(tweetElement);
  const imageAltText = combineAltTexts(images);
  const hasImageText = images.length > 0;

  // Build search text including ALL available context:
  // Main tweet + Quote tweet + Image alt text
  // This gives us the fullest context for matching Kalshi markets
  const textParts = [];

  if (mainText) {
    textParts.push(mainText);
  }

  if (quoteText) {
    textParts.push(quoteText);
  }

  if (imageAltText) {
    textParts.push(imageAltText);
  }

  const searchText = textParts.join(' ');

  return {
    mainText,
    quoteText,
    hasQuote,
    images,
    imageAltText,
    hasImageText,
    searchText, // Now includes ALL context
    // Full context with all information (for display/debugging)
    fullText: [
      mainText,
      quoteText ? `[Quoted: ${quoteText}]` : '',
      imageAltText ? `[Image text: ${imageAltText}]` : '',
    ].filter(Boolean).join('\n'),
  };
}

/**
 * Check if an article's timestamp link matches the target tweet ID exactly
 * @param {HTMLElement} article - The article element
 * @param {string} targetTweetId - The tweet ID we're looking for
 * @returns {boolean}
 */

/**
 * Check if tweet contains images
 * @param {HTMLElement} tweetElement
 * @returns {boolean}
 */
function hasImages(tweetElement) {
  if (!tweetElement) {
    return false;
  }

  // Look for images from Twitter's CDN
  const images = tweetElement.querySelectorAll('img[src*="pbs.twimg.com"]');
  const hasImg = images.length > 0;  // Fixed: was "hasimgs" and return was "hasImg"

  debugLog('Has images:', hasImg, `(${images.length} found)`);
  return hasImg;
}

/**
 * Extract alt text from all images in a tweet
 * @param {HTMLElement} tweetElement
 * @returns {Array} - Array of objects with image src and alt text
 */
function extractImageAltTexts(tweetElement) {
  if (!tweetElement) {
    return [];
  }

  // Find all images (excluding profile pictures and icons)
  // Twitter media images are hosted on pbs.twimg.com/media/
  const images = tweetElement.querySelectorAll('img[src*="pbs.twimg.com/media"]');

  debugLog(`Found ${images.length} media images`);

  const imageData = [];

  images.forEach((img, index) => {
    const altText = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || '';

    debugLog(`  Image ${index + 1}: alt="${altText}"`);

    // Only include if there's meaningful alt text
    // Twitter sometimes uses "Image" as default, which isn't helpful
    if (altText && altText !== 'Image' && altText.trim().length > 0) {
      imageData.push({
        index: index + 1,
        src,
        alt: altText.trim(),
      });

      debugLog(`  ✓ Image ${index + 1} has meaningful alt text:`, altText);
    } else {
      debugLog(`  ⊘ Image ${index + 1} has no meaningful alt text`);
    }
  });

  return imageData;
}

/**
 * Combine all alt texts into a single string
 * @param {Array} imageData
 * @returns {string}
 */
function combineAltTexts(imageData) {
  if (!imageData || imageData.length === 0) {
    return '';
  }

  // Join all alt texts with a space
  const combined = imageData.map(img => img.alt).join(' ');
  debugLog('Combined alt texts:', combined);

  return combined;
}

function hasExactTimestampMatch(article, targetTweetId) {
  // Find time elements (timestamps)
  const timeElements = article.querySelectorAll('time');

  for (const time of timeElements) {
    // The parent of <time> is usually the <a> tag with the link
    let link = time.parentElement;

    // Sometimes time might be wrapped differently, check up to 2 levels
    if (link && link.tagName !== 'A') {
      link = link.parentElement;
    }

    if (link && link.tagName === 'A') {
      const href = link.getAttribute('href') || '';

      // Extract the tweet ID from the href
      // Format: /username/status/TWEETID or /username/status/TWEETID/...
      const match = href.match(/\/status\/(\d+)/);

      if (match && match[1] === targetTweetId) {
        debugLog(`  ✓ Found exact timestamp match for tweet ${targetTweetId}`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the position/index of an article among all articles
 * @param {HTMLElement} article - The article element
 * @param {NodeList} allArticles - All article elements
 * @returns {number}
 */
function getArticleIndex(article, allArticles) {
  return Array.from(allArticles).indexOf(article);
}

/**
 * Find the main tweet element on the page (ENHANCED for threads)
 * @returns {HTMLElement|null} - The main tweet article element
 */
function findMainTweetElement() {
  const tweetId = getTweetIdFromUrl();
  const username = getUsernameFromUrl();

  if (!tweetId) {
    debugLog('No tweet ID in URL');
    return null;
  }

  debugLog('Looking for tweet with ID:', tweetId);
  debugLog('Username from URL:', username);

  // Get all article elements
  const articles = document.querySelectorAll('article');
  debugLog('Found articles on page:', articles.length);

  // Score each article based on multiple criteria
  const articleScores = [];

  articles.forEach((article, index) => {
    let score = 0;
    const reasons = [];

    // Criterion 1: Exact timestamp match (HIGHEST priority)
    if (hasExactTimestampMatch(article, tweetId)) {
      score += 1000;
      reasons.push('exact timestamp match');
    }

    // Criterion 2: Check if username in article matches URL username
    const userLinks = article.querySelectorAll('a[href^="/"]');
    for (const link of userLinks) {
      const href = link.getAttribute('href') || '';
      if (href === `/${username}` || href.startsWith(`/${username}/`)) {
        score += 100;
        reasons.push('username match');
        break;
      }
    }

    // Criterion 3: Has substantial tweet text (not just a retweet indicator)
    const textElement = article.querySelector(CONFIG.SELECTORS.TWEET_TEXT);
    if (textElement) {
      const textLength = textElement.innerText.trim().length;
      if (textLength > 10) {
        score += textLength / 10; // More text = slightly higher score
        reasons.push(`has text (${textLength} chars)`);
      }
    }

    // Criterion 4: Position in DOM (slight preference for earlier articles in threads)
    // But this is a weak signal
    score += (articles.length - index) * 0.1;

    // Criterion 5: Check if article contains a link to the exact tweet
    const allLinks = article.querySelectorAll('a[href*="/status/"]');
    for (const link of allLinks) {
      const href = link.getAttribute('href') || '';
      if (href.includes(`/status/${tweetId}`)) {
        score += 50;
        reasons.push('contains link to tweet');
        break;
      }
    }

    articleScores.push({
      article,
      score,
      index,
      reasons: reasons.join(', '),
    });

    debugLog(`  Article ${index}: score=${score.toFixed(1)} (${reasons.join(', ')})`);
  });

  // Sort by score (highest first)
  articleScores.sort((a, b) => b.score - a.score);

  // Return the highest scoring article
  if (articleScores.length > 0 && articleScores[0].score > 0) {
    const winner = articleScores[0];
    debugLog(`✓ Selected article ${winner.index} with score ${winner.score.toFixed(1)}`);
    debugLog(`  Reasons: ${winner.reasons}`);
    return winner.article;
  }

  debugLog('❌ Could not find tweet element with confidence');
  return null;
}

/**
 * Extract tweet data from the current page (UPDATED for quotes)
 * @returns {Object} - Object containing tweet text and metadata
 */
function extractTweetData() {
  const tweetElement = findMainTweetElement();

  if (!tweetElement) {
    debugLog('No tweet element found on page');
    return null;
  }

  const tweetTexts = extractCompleteTweetData(tweetElement);
  const tweetId = getTweetIdFromUrl();
  const username = getUsernameFromUrl();

  const tweetData = {
    id: tweetId,
    username: username,
    ...tweetTexts, // Spread operator includes mainText, quoteText, hasQuote, searchText, fullText
    element: tweetElement,
    url: window.location.href,
    extractedAt: new Date().toISOString(),
  };

  debugLog('Extracted complete tweet data:', tweetData);
  return tweetData;
}

/**
 * Process the current tweet (FINAL - Phase 1 Complete)
 */
function processTweet() {
  debugLog('Processing tweet...');

  if (!isTweetDetailPage()) {
    debugLog('Not on a tweet detail page, skipping');
    return;
  }

  const tweetData = extractTweetData();

  if (tweetData && (tweetData.mainText || tweetData.quoteText || tweetData.imageAltText)) {
    console.log('='.repeat(70));
    console.log('🐦 TWEET EXTRACTED');
    console.log('='.repeat(70));
    console.log('ID:', tweetData.id);
    console.log('Username:', tweetData.username);
    console.log('URL:', tweetData.url);
    console.log('-'.repeat(70));

    console.log('📝 Main Text:', tweetData.mainText || '(none)');

    if (tweetData.hasQuote) {
      console.log('-'.repeat(70));
      console.log('💬 Quote Tweet:', tweetData.quoteText);
    }

    if (tweetData.hasImageText) {
      console.log('-'.repeat(70));
      console.log(`🖼️  Images (${tweetData.images.length}):`);
      tweetData.images.forEach(img => {
        console.log(`   ${img.index}. ${img.alt}`);
      });
    }

    console.log('-'.repeat(70));
    console.log('🔍 Search Text (for Kalshi matching):', tweetData.searchText);
    console.log('='.repeat(70));

    // TODO Phase 2: Match with Kalshi markets and display UI
  } else {
    debugLog('No tweet content extracted');
  }
}

/**
 * Initialize the extension
 */
function init() {
  debugLog('Initializing extension...');

  // Check if we're on a tweet page and process immediately
  if (isTweetDetailPage()) {
    // Wait a bit for Twitter to fully load the content
    setTimeout(processTweet, 1500);
  }

  // Watch for URL changes (Twitter is a Single Page App)
  let lastUrl = window.location.href;

  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      debugLog('URL changed:', { from: lastUrl, to: currentUrl });
      lastUrl = currentUrl;

      // Wait for content to load after navigation
      setTimeout(processTweet, 1500);
    }
  });

  // Observe the entire document for changes
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  debugLog('Extension initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}