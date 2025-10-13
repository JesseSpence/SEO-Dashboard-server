# Analytics Dashboard Frontend

A modern web dashboard for displaying GA4 and Google Search Console analytics data.

## Features

- Interactive data visualization
- Real-time analytics from GA4 and GSC
- Responsive design
- Modern UI/UX

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Set your API base URL to point to your backend server

3. **Start the development server:**
   ```bash
   npm start
   ```

## Project Structure

- `index.html` - Main dashboard page
- `queries.html` - Query analysis page
- `signal-pages.html` - Signal pages analysis
- `styles.css` - Main stylesheet
- `script.js` - Main dashboard JavaScript
- `queries.js` - Query analysis functionality
- `signal-pages.js` - Signal pages functionality
- `config.js` - API configuration
- `gsc-api.js` - Google Search Console API integration

## API Integration

The frontend connects to the backend API for data retrieval. Make sure your backend server is running and accessible.

## Development

- Development server: `npm start`
- Build for production: `npm run build`

## Environment Variables

See `env.example` for configuration options.