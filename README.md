# Kalshi Twitter Extension

A Chrome extension that enriches Twitter/X with real-time Kalshi prediction market data. The extension analyzes tweet content and displays relevant prediction market information alongside tweets.

## 🎯 Project Status

**Current Phase:** Phase 1 Complete ✅  
**Next Phase:** Phase 2 - Kalshi API Integration (In Progress)

### Phase 1: Project Setup & Foundation ✅
- [x] Chrome extension structure (Manifest V3)
- [x] Tweet detection and text extraction
- [x] Deep thread navigation support
- [x] Quote tweet detection and extraction
- [x] Image alt text extraction
- [x] Intelligent content prioritization for market matching

### Phase 2: Kalshi API Integration 🔄
- [ ] Kalshi API connection setup
- [ ] Market data fetching
- [ ] Keyword-based market matching algorithm
- [ ] Tweet-to-market correlation logic

### Phase 3: UI & Display ⏳
- [ ] Design UI overlay for market data
- [ ] Inject market information into Twitter interface
- [ ] Add direct links to Kalshi for trading
- [ ] Styling and responsive design

## 🚀 Features

### Current Features (Phase 1)
- **Smart Tweet Detection**: Accurately identifies the focused tweet even in complex thread structures
- **Quote Tweet Support**: Extracts text from both main tweets and quoted tweets
- **Image Alt Text**: Reads accessibility descriptions from images
- **Thread Navigation**: Works correctly with replies, threads, and nested conversations
- **Comprehensive Logging**: Detailed debug output for development and troubleshooting

### Planned Features (Phase 2+)
- Real-time Kalshi market data integration
- Automatic market matching based on tweet content
- One-click access to relevant prediction markets
- Live probability updates
- OCR for text in images (optional)

## 📦 Installation (Development Mode)

### Prerequisites
- Google Chrome browser
- Git (for cloning the repository)

### Steps

1. **Clone the repository:**
```bash
   git clone https://github.com/YOUR_USERNAME/kalshi-twitter-extension.git
   cd kalshi-twitter-extension
```

2. **Open Chrome and navigate to extensions:**
   - Type `chrome://extensions/` in the address bar
   - Or: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension:**
   - Click "Load unpacked"
   - Select the `kalshi-twitter-extension` folder
   - The extension should now appear in your extensions list

5. **Verify installation:**
   - The extension icon should appear in your Chrome toolbar
   - Visit any tweet on Twitter/X and open DevTools Console (F12)
   - You should see: `[Kalshi Extension] Content script loaded`

## 🛠️ Project Structure
```
kalshi-twitter-extension/
├── icons/                      # Extension icons
│   ├── icon16.png             # 16x16 toolbar icon
│   ├── icon48.png             # 48x48 extension management
│   └── icon128.png            # 128x128 Chrome Web Store
├── src/                        # Source code
│   ├── background.js          # Background service worker
│   └── contentScript.js       # Main content script (runs on Twitter)
├── manifest.json              # Extension configuration (Manifest V3)
├── README.md                  # This file
└── .gitignore                 # Git ignore rules
```

## 🧪 Testing

### Manual Testing

1. **Navigate to Twitter/X** (twitter.com or x.com)
2. **Click on any tweet** to view its detail page
3. **Open Chrome DevTools** (F12 or Right-click → Inspect)
4. **Go to the Console tab**
5. **Look for extraction output:**
```
======================================================================
🐦 TWEET EXTRACTED
======================================================================
ID: 1234567890
Username: someuser
URL: https://twitter.com/someuser/status/1234567890
----------------------------------------------------------------------
📝 Main Text: Tweet content here
----------------------------------------------------------------------
🔍 Search Text (for Kalshi matching): Tweet content here
======================================================================
```

### Test Scenarios

- ✅ Regular text tweets
- ✅ Tweets in deep threads (3+ levels)
- ✅ Quote tweets
- ✅ Tweets with images (with alt text)
- ✅ Combination: Quote tweet + image

## 💻 Development

### Tech Stack
- **JavaScript (ES6+)**: Core extension logic
- **Chrome Extension API**: Manifest V3
- **Twitter/X DOM**: Content extraction via selectors
- **Kalshi API**: Market data (Phase 2)

### Key Files

**`manifest.json`**: Defines extension configuration, permissions, and scripts
- Declares content scripts for Twitter/X domains
- Sets permissions for Kalshi API access
- Configures background service worker

**`src/contentScript.js`**: Main logic that runs on Twitter pages
- Tweet detection using scoring system
- Text extraction from tweets, quotes, and images
- URL change detection for SPA navigation
- Comprehensive debug logging

**`src/background.js`**: Background service worker
- Handles extension lifecycle events
- Message passing between components
- Future: API call management and caching

### Debug Mode

Debug logging is enabled by default in `contentScript.js`:
```javascript
const CONFIG = {
  DEBUG: true,  // Set to false to disable debug logs
  // ...
};
```

To see debug messages, open DevTools Console on any Twitter page.

## 📝 Development Timeline

### Phase 1 (✅ Complete)
- Week 1: Project setup and basic tweet detection
- Week 2: Thread navigation and quote tweet support
- Week 3: Image alt text extraction and testing

### Phase 2 (🔄 Current - Estimated 2-3 weeks)
- Kalshi API integration
- Market matching algorithm
- Testing and refinement

### Phase 3 (⏳ Planned - Estimated 2 weeks)
- UI design and implementation
- Integration testing
- Performance optimization

### Phase 4 (⏳ Planned - Estimated 1 week)
- Chrome Web Store preparation
- Documentation finalization
- Public release

## 🤝 Contributing

This is currently a personal development project. Contributions, issues, and feature requests are welcome once the MVP is complete.

## 📄 License

TBD - License will be added before public release

## 🔗 Links

- [Kalshi API Documentation](https://docs.kalshi.com/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Twitter/X](https://twitter.com)

## ⚙️ Configuration

### Permissions

The extension requests the following permissions:
- `storage`: For caching market data (future)
- `twitter.com` and `x.com`: To run content script on Twitter
- `api.elections.kalshi.com`: To fetch Kalshi market data
- `pbs.twimg.com`: To access Twitter image CDN (for OCR, future)

### Browser Compatibility

- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Chromium-based)
- ❌ Firefox (Manifest V2/V3 differences - future consideration)
- ❌ Safari (Different extension system - not planned)

## 📞 Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Built with ❤️ for prediction market enthusiasts**