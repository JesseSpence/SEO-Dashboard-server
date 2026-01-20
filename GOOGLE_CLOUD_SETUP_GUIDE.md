# Google Cloud Console Setup Guide

This guide provides step-by-step instructions for setting up Google Cloud credentials from scratch with a new Google account for the Funding Agent Dashboard.

## Required Services

- Google Search Console API
- Google Analytics 4 (GA4) API
- Service Account (recommended) or OAuth2 credentials

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your new Google account
3. Click "Select a project" → "New Project"
4. Enter project name (e.g., "Funding Agent Dashboard")
5. Note your **Project ID** (you'll need this later)
6. Click "Create"
7. Wait for the project to be created (may take a few seconds)

### 2. Enable Required APIs

1. Navigate to **APIs & Services** → **Library** (or use the search bar)
2. Enable these APIs one by one:

   **Google Search Console API:**
   - Search for "Search Console API"
   - Click on "Google Search Console API"
   - Click **"Enable"** button
   - Wait for it to enable

   **Google Analytics Data API:**
   - Search for "Google Analytics Data API"
   - Click on "Google Analytics Data API"
   - Click **"Enable"** button
   - Wait for it to enable

3. Verify both APIs are enabled by going to **APIs & Services** → **Enabled APIs**

### 3. Create Service Account (Recommended Method)

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in the service account details:
   - **Service account name**: `funding-agent-dashboard-service`
   - **Service account ID**: (auto-generated, you can change it)
   - **Description**: `Service account for Funding Agent Dashboard`
4. Click **"Create and Continue"**
5. Skip role assignment (click **"Continue"** - roles are not needed for API access)
6. Click **"Done"**

### 4. Create Service Account Key

1. In the **Credentials** page, find your service account in the list
2. Click on the service account email to open it
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Choose **JSON** format
6. Click **"Create"**
7. The JSON file will automatically download
8. **IMPORTANT**: Save this file securely in your project:
   - Recommended location: `server/your-project-id-service-account-key.json`
   - **DO NOT commit this file to version control** (it should be in `.gitignore`)
   - Keep a secure backup of this file

### 5. Grant Service Account Access

#### For Google Search Console:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (e.g., `https://www.fundingagent.co.uk/`)
   - If you don't have a property yet, add and verify your website first
3. Go to **Settings** (gear icon) → **Users and permissions**
4. Click **"Add user"** button
5. Enter the service account email address
   - You can find this in the downloaded JSON file: look for the `client_email` field
   - It will look like: `funding-agent-dashboard-service@your-project-id.iam.gserviceaccount.com`
6. Select **"Full"** access level
7. Click **"Add"**
8. The service account should now appear in the users list

#### For Google Analytics 4:

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your GA4 property
   - If you don't have a GA4 property, create one first
3. Click **Admin** (gear icon in bottom left)
4. Under **Property**, click **"Property Access Management"**
5. Click **"Add users"** button (or the **"+"** icon)
6. Enter the service account email address (same as above)
7. Select **"Viewer"** role (read-only access is sufficient)
8. Click **"Add"**
9. The service account should now appear in the access list

### 6. Find Your GA4 Property ID

1. In Google Analytics, go to **Admin** → **Property Settings**
2. Look for **Property ID** (it's a numeric value, e.g., `123456789`)
3. Copy this value - you'll need it for the backend configuration

### 7. Update Backend Configuration

1. Navigate to the `server` directory in your project
2. Create or update the `.env` file with the following:

```env
# Service Account Credentials
GOOGLE_APPLICATION_CREDENTIALS=./your-project-id-service-account-key.json

# Google Search Console Configuration
GSC_SITE_URL=https://www.fundingagent.co.uk/

# Google Analytics 4 Configuration
GA4_PROPERTY_ID=your-ga4-property-id

# Server Configuration
PORT=3001
CACHE_TTL_SECONDS=900
```

3. Replace the values:
   - `your-project-id-service-account-key.json` with the actual filename of your downloaded JSON key
   - `https://www.fundingagent.co.uk/` with your actual website URL (must match exactly as it appears in Search Console)
   - `your-ga4-property-id` with your numeric GA4 Property ID

### 8. Verify the Setup

1. Start your backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Check the console output - you should see:
   - `Service account authentication successful`
   - No authentication errors

3. Test the health endpoint:
   ```bash
   curl http://localhost:3001/api/health
   ```

4. If you see errors, check:
   - The JSON key file path is correct
   - The service account email has been added to both Search Console and Analytics
   - The GSC_SITE_URL matches exactly (including trailing slash)
   - The GA4_PROPERTY_ID is correct

## Troubleshooting

### Common Issues

**"Service account authentication failed"**
- Verify the JSON key file path is correct
- Check that the file exists and is readable
- Ensure the JSON file is valid (not corrupted)

**"GSC API request failed: 403"**
- Verify the service account email has been added to Search Console
- Check that "Full" access was granted
- Ensure the GSC_SITE_URL matches exactly (case-sensitive, trailing slash matters)

**"GA4 API request failed: 403"**
- Verify the service account email has been added to Google Analytics
- Check that at least "Viewer" role was granted
- Ensure the GA4_PROPERTY_ID is correct (numeric value)

**"API not enabled"**
- Go to APIs & Services → Enabled APIs
- Verify both "Google Search Console API" and "Google Analytics Data API" are enabled
- If not, enable them following Step 2

## Security Best Practices

1. **Never commit service account keys to version control**
   - Add `*.json` (or specific key filename) to `.gitignore`
   - Use environment variables for production deployments

2. **Limit service account permissions**
   - Only grant the minimum required access (Full for GSC, Viewer for GA4)
   - Don't grant unnecessary IAM roles in Google Cloud Console

3. **Rotate keys periodically**
   - Create new keys and update your configuration
   - Delete old keys from Google Cloud Console

4. **Use different service accounts for different environments**
   - Development, staging, and production should have separate service accounts

## Next Steps

Once your credentials are set up:
1. Your backend should be able to authenticate with Google APIs
2. Test the API endpoints to ensure data is flowing correctly
3. Update your frontend to connect to the backend
4. Consider setting up environment-specific configurations

## Additional Resources

- [Google Cloud Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
- [Google Search Console API Documentation](https://developers.google.com/webmaster-tools)
- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)

