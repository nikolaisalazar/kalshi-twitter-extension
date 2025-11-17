# Kalshi Twitter Extension

Chrome extension that displays Kalshi prediction market data for tweets.

## Features (Planned)

- 🐦 Automatically detects tweets on Twitter/X
- 📊 Shows relevant Kalshi prediction market data
- 💬 Handles quote tweets
- 🖼️ Extracts text from image alt tags
- 🔗 Direct links to trade on Kalshi

## Installation (Development Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `kalshi-twitter-extension` folder
5. The extension should now appear in your extensions list

## Project Structure
```
kalshi-twitter-extension/
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/                # Source code
│   ├── contentScript.js  # Main script running on Twitter
│   └── background.js     # Background service worker
├── manifest.json       # Extension configuration
└── README.md          # This file
```

## Development Status

**Phase 1: Project Setup & Foundation** ✅
- [x] Extension structure created
- [x] Icons generated
- [x] Manifest V3 configuration
- [ ] Tweet detection (in progress)
- [ ] Quote tweet parsing (in progress)
- [ ] Image alt text extraction (in progress)

**Phase 2: Kalshi API Integration** 🔄
- [ ] API connection setup
- [ ] Market data fetching
- [ ] Tweet-to-market matching

**Phase 3: UI & Display** ⏳
- [ ] Design UI overlay
- [ ] Inject market data into Twitter
- [ ] Add Kalshi links

## Testing

Navigate to any tweet on Twitter/X to see the extension in action.
Open Chrome DevTools (F12) → Console to see debug messages.

## Tech Stack

- Manifest V3
- Vanilla JavaScript
- Kalshi API
- Twitter/X DOM manipulation

## License

TBD

## Contributing

This is a development project. More details coming soon.