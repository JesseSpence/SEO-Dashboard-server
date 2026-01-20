# Frontend Mock Mode Guide

## Overview

Mock mode allows you to work on frontend UI/UX features without needing a working backend API. When enabled, the frontend uses realistic mock data instead of making real API calls.

## How to Enable/Disable Mock Mode

### Quick Toggle

Edit `Frontend/mock-config.js`:

```javascript
const MOCK_CONFIG = {
    enabled: true,  // Set to false to use real API calls
    backendUrl: 'https://api.themetastack.com',
    delay: 500  // Simulated API delay in milliseconds
};
```

- **`enabled: true`** - Uses mock data (no backend needed)
- **`enabled: false`** - Uses real API calls (requires backend)

### Configuration Options

- **`enabled`**: Boolean - Enable/disable mock mode
- **`backendUrl`**: String - Backend URL (only used when mock mode is disabled)
- **`delay`**: Number - Simulated API response delay in milliseconds (for realistic testing)

## What Gets Mocked

When mock mode is enabled, the following API endpoints return mock data:

- `/api/health` - Health check endpoint
- `/api/gsc/top` - Google Search Console top pages
- `/api/gsc/daily` - Google Search Console daily metrics
- `/api/gsc/queries` - Google Search Console queries for a page
- `/api/scoreboard` - Scoreboard/priority pages data

## Mock Data Features

The mock data generator provides:

- **Realistic data structures** matching real API responses
- **Configurable delays** to simulate network latency
- **Varied data** with some randomization for testing
- **Multiple pages/queries** to test pagination and filtering

## Files Modified

The following files support mock mode:

- `Frontend/script.js` - Main dashboard
- `Frontend/queries.js` - Queries page
- `Frontend/signal-pages.js` - Signal pages dashboard

## How It Works

1. Each dashboard class checks `window.MOCK_CONFIG.enabled` on initialization
2. If mock mode is enabled, API calls are routed to `mockDataGenerator` instead of `fetch()`
3. Mock data generator returns data matching the expected API response format
4. All existing UI code works the same way - no changes needed to display logic

## Example Usage

### Working on Frontend Only (Mock Mode ON)

```javascript
// In mock-config.js
enabled: true
```

- Start frontend: `npm run dev` (in Frontend directory)
- Open `http://localhost:3000`
- All data will be mock data
- No backend server needed

### Testing with Real API (Mock Mode OFF)

```javascript
// In mock-config.js
enabled: false
```

- Start backend server: `npm run dev` (in server directory)
- Start frontend: `npm run dev` (in Frontend directory)
- Open `http://localhost:3000`
- All data will come from real Google APIs

## Console Messages

When mock mode is enabled, you'll see:
- `🎭 Mock mode enabled - using mock data instead of API calls`
- `🎭 Mock mode: Skipping backend connection check`
- `🎭 Loading key metrics from mock data...`
- `🎭 Mock GSC data received:`

When mock mode is disabled, you'll see normal API call messages.

## Customizing Mock Data

To customize mock data, edit `Frontend/mock-data.js`:

- Modify `getGSCTopPages()` to change page data
- Modify `getGSCDaily()` to change daily metrics
- Modify `getGSCQueries()` to change query data
- Modify `getScoreboard()` to change scoreboard items

## Troubleshooting

**Mock data not loading:**
- Check that `mock-config.js` and `mock-data.js` are loaded before other scripts
- Check browser console for errors
- Verify `window.MOCK_CONFIG` and `window.mockDataGenerator` are defined

**Switching between modes:**
- After changing `enabled` in `mock-config.js`, refresh the page
- No server restart needed for frontend-only changes

## Benefits

- ✅ Work on frontend without backend setup
- ✅ Test UI/UX features independently
- ✅ No API rate limits or authentication issues
- ✅ Consistent test data for development
- ✅ Easy to switch back to real API calls

