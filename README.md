# Kalshi Market Insights for Twitter

A Chrome extension that displays Kalshi prediction market data alongside relevant tweets in real-time.

## 🎯 Project Status

**Current Phase:** Phase 2 Complete ✅  
**Next Phase:** Phase 3 - UI Integration

### Completed Phases

**Phase 1: Foundation ✅**
- Chrome extension structure (Manifest V3)
- Tweet detection with scoring algorithm
- Quote tweet extraction
- Image alt text extraction
- Deep thread navigation support

**Phase 2: API Integration ✅**
- Kalshi API connection via background script
- 740+ non-sports markets fetched from /events endpoint
- Keyword-based matching algorithm (trigrams, bigrams, words)
- Category detection (Politics, Economics, Climate, etc.)
- Market caching (5-minute TTL)
- Quote tweet prioritization in matching

### Phase 3: UI Integration 🔄
- Design market data overlay panel
- Style to match Twitter's interface
- Add Kalshi trading links
- Handle "no match" states gracefully

## 🚀 Features

### Current Functionality
- **Smart Tweet Detection**: Accurately identifies tweets in complex thread structures
- **Comprehensive Text Extraction**: Main tweets, quote tweets, and image alt text
- **Market Matching**: Finds relevant Kalshi prediction markets for tweet content
- **Category Filtering**: Focuses on Politics, Economics, Climate, and other non-sports markets
- **Intelligent Caching**: Reduces API calls with 5-minute market cache
- **Debug Logging**: Detailed console output for development

### Coming Soon (Phase 3)
- Visual market data panel on Twitter
- Real-time probability display
- One-click trading links
- Professional styling

## 📦 Installation (Development Mode)

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/nikolaisalazar/kalshi-twitter-extension.git
cd kalshi-twitter-extension
```

2. **Load in Chrome:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `kalshi-twitter-extension` folder

3. **Verify installation:**
   - Visit any tweet on Twitter/X
   - Open DevTools Console (F12)
   - Look for: `Kalshi Twitter Extension - Content script loaded`

## 🛠️ Project Structure
```
kalshi-twitter-extension/
├── icons/                  # Extension icons (16x16, 48x48, 128x128)
├── src/
│   ├── background.js      # Background service worker (API calls)
│   ├── contentScript.js   # Main content script (tweet detection)
│   ├── kalshiAPI.js       # API communication layer
│   ├── marketMatcher.js   # Matching algorithm
│   └── displayFormatter.js # Data formatting utilities
├── manifest.json          # Extension configuration (Manifest V3)
└── README.md
```

## 🧪 Testing

### Current Testing Method

1. Navigate to Twitter/X
2. Click on any tweet
3. Open DevTools Console (F12)
4. Look for extraction and matching output:
```
======================================================================
🐦 TWEET EXTRACTED
======================================================================
[... tweet data ...]
======================================================================
[Kalshi Extension] Attempting to match with Kalshi markets...
[Kalshi Extension] Cached 740 markets
[Kalshi Extension] Searching 740 markets for match...
```

### Test Cases
- ✅ Regular tweets
- ✅ Quote tweets (prioritized in matching)
- ✅ Deep threads (3+ reply levels)
- ✅ Tweets with images
- ✅ Political tweets → Politics markets
- ✅ Climate tweets → Climate markets
- ✅ Elon Musk/Mars tweets → matched successfully

## 💻 Development

### Tech Stack
- **JavaScript ES6+**: Core logic
- **Chrome Extension Manifest V3**: Modern extension architecture
- **Kalshi API**: Real-time prediction market data
- **Twitter/X DOM**: Content extraction

### Key Components

**`contentScript.js`**: Tweet detection and extraction
- Sophisticated scoring system for tweet identification
- Quote tweet and image text extraction
- Market matching integration

**`background.js`**: API request handler
- Fetches markets via /events endpoint
- Handles CORS restrictions
- Implements retry logic and rate limiting

**`kalshiAPI.js`**: Message passing to background script

**`marketMatcher.js`**: Matching algorithm
- Keyword extraction (trigrams, bigrams, single words)
- Category detection
- Configurable match threshold (currently 15%)

### Debug Mode

Enable detailed logging in `contentScript.js`:
```javascript
const CONFIG = {
  DEBUG: true,  // Set to false to disable
};
```

## 📝 Development Timeline

- ✅ **Phase 1** (Complete): Project setup & tweet extraction
- ✅ **Phase 2** (Complete): Kalshi API integration & matching
- 🔄 **Phase 3** (Current): UI integration
- ⏳ **Phase 4** (Planned): Testing & Chrome Web Store submission

## ⚙️ Configuration

### Match Threshold
Adjust in `src/marketMatcher.js`:
```javascript
const MATCHER_CONFIG = {
  MIN_MATCH_SCORE: 0.15  // 15% minimum match (0-1 scale)
};
```

### Cache Duration
Adjust in `src/contentScript.js`:
```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Market Limit
Adjust in `src/background.js`:
```javascript
limit: 200  // Number of events to fetch
```

## 🔗 Links

- **GitHub**: [nikolaisalazar/kalshi-twitter-extension](https://github.com/nikolaisalazar/kalshi-twitter-extension)
- **Kalshi API Docs**: [docs.kalshi.com](https://docs.kalshi.com/)
- **Chrome Extensions**: [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions/)

## 📄 License

TBD - License will be added before public release

---

**Phase 2 Complete** ✅ | **Built for prediction market enthusiasts** 🎯