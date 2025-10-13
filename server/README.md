# Analytics Dashboard Backend

A secure backend API for GA4 and Google Search Console analytics dashboard.

## Features

- Google Analytics 4 (GA4) data retrieval
- Google Search Console (GSC) data integration
- Secure authentication with Google service accounts
- CORS-enabled API endpoints
- TypeScript support

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Fill in your Google Cloud service account credentials
   - Set your CORS origin for frontend integration

3. **Google Cloud Setup:**
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Add the service account email to your GA4 and GSC properties
   - Copy the credentials to your `.env` file

4. **Run the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

See `env.example` for all required environment variables.

## API Endpoints

- `GET /api/ga4/data` - Retrieve GA4 analytics data
- `GET /api/gsc/data` - Retrieve Google Search Console data
- `GET /api/health` - Health check endpoint

## Security

- Service account credentials are stored in environment variables
- CORS is configured for specific origins
- All sensitive data is excluded from version control

## Development

- TypeScript compilation: `npm run build`
- Development server: `npm run dev`
- Production server: `npm start`
