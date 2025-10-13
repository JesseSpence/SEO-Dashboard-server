# Google Search Console API Setup Instructions

## 🔧 **What You Need to Build Real GSC API Calls:**

### **1. Google Cloud Project Setup**

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your **Project ID** (you'll need this for config.js)

#### Step 2: Enable Search Console API
1. Go to **APIs & Services > Library**
2. Search for "Search Console API"
3. Click on it and press **"Enable"**

### **2. Authentication Setup (Choose One Method)**

#### **Method A: Service Account (Recommended for Production)**

1. **Create Service Account:**
   - Go to **APIs & Services > Credentials**
   - Click **"Create Credentials" > "Service Account"**
   - Name: `gsc-dashboard-service`
   - Description: `Service account for GSC dashboard`

2. **Download JSON Key:**
   - Click on the created service account
   - Go to **"Keys"** tab
   - Click **"Add Key" > "Create new key"**
   - Choose **JSON** format
   - Download the file

3. **Update config.js:**
   ```javascript
   // Replace the serviceAccount object in config.js with your downloaded JSON content
   serviceAccount: {
       // Paste the entire contents of your downloaded JSON file here
   }
   ```

4. **Grant Access in Search Console:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your service account email as a user
   - Grant "Full" access

#### **Method B: OAuth2 (For User Authentication)**

1. **Create OAuth2 Credentials:**
   - Go to **APIs & Services > Credentials**
   - Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
   - Application type: **Web application**
   - Name: `GSC Dashboard`
   - Authorized redirect URIs: `http://localhost:3000/oauth-callback.html`

2. **Update config.js:**
   ```javascript
   const OAUTH_CONFIG = {
       clientId: "your-oauth-client-id-from-step-1",
       redirectUri: "http://localhost:3000/oauth-callback.html",
       // ... rest of config
   };
   ```

### **3. Domain Verification**

1. **Add Property to Search Console:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Click **"Add Property"**
   - Enter your website URL
   - Verify ownership using one of the methods:
     - HTML file upload
     - HTML meta tag
     - Google Analytics
     - Google Tag Manager

2. **Update config.js:**
   ```javascript
   siteUrl: "https://your-domain.com", // Must match exactly
   ```

### **4. Required API Scopes**

The following scopes are automatically included:
- `https://www.googleapis.com/auth/webmasters.readonly`

### **5. Testing Your Setup**

1. **Open the dashboard** in your browser
2. **Check browser console** for authentication messages
3. **Look for "GSC API initialized successfully"** message
4. **Verify data loads** in the GSC section

### **6. Common Issues & Solutions**

#### **"Not authenticated with GSC API"**
- Check if service account JSON is correctly pasted in config.js
- Verify the service account has access in Search Console
- Ensure the site URL matches exactly

#### **"API request failed: 403"**
- Verify Search Console API is enabled
- Check if the service account has proper permissions
- Ensure the domain is verified in Search Console

#### **"API request failed: 404"**
- Verify the site URL format (include https://)
- Check if the property exists in Search Console
- Ensure the property is verified

### **7. Security Best Practices**

1. **Never commit credentials to version control**
2. **Use environment variables for production**
3. **Rotate service account keys regularly**
4. **Limit service account permissions to minimum required**

### **8. Production Deployment**

For production, consider:
- Using environment variables instead of hardcoded credentials
- Implementing proper error handling
- Adding rate limiting
- Setting up monitoring and logging

## 🚀 **Quick Start Checklist:**

- [ ] Google Cloud Project created
- [ ] Search Console API enabled
- [ ] Service account created and JSON downloaded
- [ ] config.js updated with credentials
- [ ] Domain verified in Search Console
- [ ] Service account added to Search Console
- [ ] Dashboard tested with real data

## 📞 **Need Help?**

If you encounter issues:
1. Check browser console for error messages
2. Verify all credentials are correct
3. Ensure domain verification is complete
4. Test with a simple API call first

The dashboard will automatically fall back to mock data if the API setup fails, so you can still use it for development and testing.

