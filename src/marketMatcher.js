// Market Matching Logic - Keyword-based algorithm

const MATCHER_CONFIG = {
    DEBUG: true,
    MIN_KEYWORD_LENGTH: 3,  // Ignore keywords shorter than this
    MIN_MATCH_SCORE: 0.15     // Minimum score to consider a match (0-1)
};

function log(...args) {
    if (MATCHER_CONFIG.DEBUG) {
        console.log('[Market Matcher]', ...args);
    }
}

/**
 * Extract meaningful keywords from text
 * @param {string} text - Input text to extract keywords from
 * @returns {Array<string>} Array of normalized keywords
 */
function extractKeywords(text) {
    if (!text) return [];

    // Common stop words to ignore
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
        'who', 'when', 'where', 'why', 'how', 'just', 'now', 'get', 'got',
        'like', 'going', 'need', 'want', 'make', 'know', 'think', 'see'
    ]);

    // Normalize text
    const normalized = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Remove punctuation
        .replace(/https?:\/\/\S+/g, '')  // Remove URLs
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();

    // Extract words
    const words = normalized.split(' ')
        .filter(word =>
            word.length >= MATCHER_CONFIG.MIN_KEYWORD_LENGTH &&
            !stopWords.has(word)
        );

    // Also extract bigrams (two-word phrases) for better matching
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]} ${words[i + 1]}`);
    }

    // Also extract trigrams (three-word phrases) for even better matching
    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
        trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    const allKeywords = [...trigrams, ...bigrams, ...words];

    log('Extracted keywords:', allKeywords.slice(0, 10), allKeywords.length > 10 ? `... (${allKeywords.length} total)` : '');
    return allKeywords;
}

/**
 * Calculate match score between tweet keywords and market
 * @param {Array<string>} tweetKeywords - Keywords from tweet
 * @param {Object} market - Kalshi market object
 * @returns {number} Match score (0-1)
 */
function calculateMatchScore(tweetKeywords, market) {
    if (!tweetKeywords.length || !market.title) return 0;

    const marketText = (market.title + ' ' + (market.subtitle || '')).toLowerCase();

    let matchCount = 0;
    let totalWeight = 0;

    for (const keyword of tweetKeywords) {
        // Weight longer phrases higher
        // Trigrams (3 words) = weight 3
        // Bigrams (2 words) = weight 2
        // Single words = weight 1
        const wordCount = keyword.split(' ').length;
        const weight = wordCount;
        totalWeight += weight;

        if (marketText.includes(keyword)) {
            matchCount += weight;
        }
    }

    const score = totalWeight > 0 ? matchCount / totalWeight : 0;

    if (score > 0.1) {  // Only log if there's some match
        log(`  "${market.ticker}": ${(score * 100).toFixed(0)}%`);
    }

    return score;
}

/**
 * Detect likely category from tweet content
 * @param {string} text - Tweet text
 * @returns {string|null} Detected category or null
 */
function detectCategory(text) {
    const lowerText = text.toLowerCase();

    const categoryKeywords = {
        'Politics': ['election', 'vote', 'voting', 'congress', 'senate', 'house', 'president', 'biden', 'trump',
            'policy', 'legislation', 'approval', 'democrat', 'republican', 'campaign', 'poll', 'governor',
            'senator', 'representative', 'political', 'government'],
        'Economics': ['inflation', 'gdp', 'economy', 'economic', 'fed', 'federal reserve', 'interest rate',
            'market', 'stock', 'unemployment', 'jobs', 'recession', 'growth', 'deficit', 'trade',
            'dollar', 'treasury', 'bonds', 'retail', 'consumer'],
        'Climate': ['climate', 'temperature', 'weather', 'emissions', 'carbon', 'warming', 'hurricane',
            'drought', 'flooding', 'wildfire'],
        'Sports': ['game', 'team', 'player', 'championship', 'score', 'win', 'playoff', 'season', 'league',
            'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball']
    };

    let bestCategory = null;
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matches = keywords.filter(kw => lowerText.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestCategory = category;
        }
    }

    if (maxMatches > 0) {
        log('Detected category:', bestCategory, `(${maxMatches} keyword matches)`);
        return bestCategory;
    }

    return null;
}

/**
 * Find best matching market for tweet text
 * @param {string} tweetText - Combined text from tweet (main + quote + images)
 * @param {Array<Object>} markets - Array of Kalshi markets
 * @param {string} category - Optional category hint
 * @returns {Object|null} Best matching market with score, or null if no good match
 */
function findBestMatch(tweetText, markets, category = null) {
    if (!tweetText || !markets || markets.length === 0) {
        log('No text or markets provided');
        return null;
    }

    log('Finding match for tweet text:', tweetText.substring(0, 100) + (tweetText.length > 100 ? '...' : ''));

    // Detect category if not provided
    if (!category) {
        category = detectCategory(tweetText);
    }

    // Filter markets by category if detected
    let filteredMarkets = markets;
    if (category) {
        log('Filtering by category:', category);
        filteredMarkets = markets.filter(m =>
            m.category === category ||
            (m.title && m.title.toLowerCase().includes(category.toLowerCase()))
        );

        // Fallback to all markets if no category matches
        if (filteredMarkets.length === 0) {
            log('No markets in category, using all', markets.length, 'markets');
            filteredMarkets = markets;
        } else {
            log('Filtered to', filteredMarkets.length, 'markets in category');
        }
    }

    const keywords = extractKeywords(tweetText);

    if (keywords.length === 0) {
        log('No keywords extracted from tweet');
        return null;
    }

    log('Calculating match scores...');

    // Calculate scores for filtered markets
    const scoredMarkets = filteredMarkets.map(market => ({
        market,
        score: calculateMatchScore(keywords, market)
    }));

    // Sort by score (highest first)
    scoredMarkets.sort((a, b) => b.score - a.score);

    const bestMatch = scoredMarkets[0];

    if (bestMatch.score < MATCHER_CONFIG.MIN_MATCH_SCORE) {
        log('No match above threshold. Best score:', (bestMatch.score * 100).toFixed(0) + '%',
            'Threshold:', (MATCHER_CONFIG.MIN_MATCH_SCORE * 100) + '%');
        return null;
    }

    log('✅ Found match:', bestMatch.market.ticker, 'with score:', (bestMatch.score * 100).toFixed(0) + '%');

    return {
        market: bestMatch.market,
        score: bestMatch.score,
        keywords: keywords,
        category: category
    };
}

/**
 * Find multiple matching markets (for cases where several markets might be relevant)
 * @param {string} tweetText - Combined text from tweet
 * @param {Array<Object>} markets - Array of Kalshi markets
 * @param {number} maxResults - Maximum number of matches to return
 * @returns {Array<Object>} Array of matching markets with scores
 */
function findTopMatches(tweetText, markets, maxResults = 3) {
    if (!tweetText || !markets || markets.length === 0) {
        return [];
    }

    const keywords = extractKeywords(tweetText);

    if (keywords.length === 0) {
        return [];
    }

    const scoredMarkets = markets
        .map(market => ({
            market,
            score: calculateMatchScore(keywords, market)
        }))
        .filter(item => item.score >= MATCHER_CONFIG.MIN_MATCH_SCORE)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    log(`Found ${scoredMarkets.length} matches above threshold`);

    return scoredMarkets;
}