# Backend Setup Instructions

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd server
npm install
```

### **2. Configure Environment**
1. Copy `env.example` to `.env`:
   ```bash
   copy env.example .env
   ```

2. Edit `.env` file with your values:
   ```env
   # Your service account JSON file is already in place
   GOOGLE_APPLICATION_CREDENTIALS=./aqueous-walker-455614-m3-2ab00feb749f.json
   
   # Update these with your actual values
   GSC_SITE_URL=https://www.fundingagent.co.uk/
   GA4_PROPERTY_ID=123456789
   ```

### **3. Grant Access to Service Account**

#### **Google Search Console:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to **Settings → Users and permissions**
4. Click **Add user**
5. Add email: `fundingagent-dashboard@aqueous-walker-455614-m3.iam.gserviceaccount.com`
6. Grant **Full** access

#### **Google Analytics 4:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Admin → Property Access Management**
4. Click **Add users**
5. Add email: `fundingagent-dashboard@aqueous-walker-455614-m3.iam.gserviceaccount.com`
6. Grant **Viewer** role

### **4. Start the Backend**
```bash
# Development mode
npm run dev

# Or build and run production
npm run build
npm start
```

The backend will start on `http://localhost:3001`

### **5. Test the Setup**
```bash
# Health check
curl http://localhost:3001/health

# Test GSC data
curl "http://localhost:3001/api/gsc/top?limit=10"

# Test GA4 data
curl "http://localhost:3001/api/ga4/pages?start=2024-01-01&end=2024-01-31"
```

## 🔧 **Configuration Details**

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | `./aqueous-walker-455614-m3-2ab00feb749f.json` |
| `GSC_SITE_URL` | Your GSC property URL (exact match) | `https://www.fundingagent.co.uk/` |
| `GA4_PROPERTY_ID` | Your GA4 property ID (numbers only) | `123456789` |
| `PORT` | Backend port | `3001` |
| `CACHE_TTL_SECONDS` | Cache duration | `900` (15 minutes) |

### **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/gsc/top` | GET | Top pages from GSC |
| `/api/gsc/queries` | GET | Top queries for a page |
| `/api/gsc/daily` | GET | Daily search data |
| `/api/ga4/pages` | GET | GA4 pages aggregate |
| `/api/ga4/metrics` | GET | GA4 site metrics |
| `/api/scoreboard` | GET | Update priority scoreboard |
| `/api/cache/clear` | POST | Clear cache |
| `/api/cache/stats` | GET | Cache statistics |

### **Query Parameters**

#### **GSC Endpoints:**
- `start` - Start date (YYYY-MM-DD)
- `end` - End date (YYYY-MM-DD)
- `limit` - Number of results (max 5000)
- `page` - Page URL for queries endpoint

#### **GA4 Endpoints:**
- `start` - Start date (YYYY-MM-DD)
- `end` - End date (YYYY-MM-DD)

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **403 Forbidden Error:**
- Verify service account has access to both GSC and GA4
- Check that GSC_SITE_URL matches exactly (including trailing slash)
- Ensure property is verified in Search Console

#### **404 Not Found Error:**
- Verify GA4_PROPERTY_ID is correct (numbers only)
- Check that the property exists and is accessible

#### **Authentication Errors:**
- Verify service account JSON file is in the correct location
- Check that the service account email is added to both GSC and GA4

#### **CORS Errors:**
- The backend is configured to allow requests from localhost
- If using a different domain, update the CORS configuration in `app.ts`

### **Debug Mode:**
Set `NODE_ENV=development` to see detailed error logs.

## 📊 **Data Flow**

1. **Frontend** makes requests to backend endpoints
2. **Backend** authenticates with Google APIs using service account
3. **Backend** fetches data from GSC and GA4 APIs
4. **Backend** processes and caches the data
5. **Backend** returns JSON responses to frontend
6. **Frontend** displays the data in charts and tables

## 🔒 **Security Notes**

- Never commit `.env` file or service account JSON to version control
- Service account has minimal required permissions (read-only)
- Backend includes rate limiting and caching to prevent API quota issues
- All API responses are validated and sanitized

## 📈 **Performance**

- Built-in caching reduces API calls
- Configurable cache TTL (default 15 minutes)
- Automatic retry logic for failed requests
- Efficient data processing and transformation

## 🚀 **Production Deployment**

For production deployment:

1. Set up environment variables on your server
2. Use a process manager like PM2
3. Set up monitoring and logging
4. Configure reverse proxy (nginx)
5. Use HTTPS for secure communication
6. Set up automated backups of configuration

The backend is production-ready with proper error handling, caching, and security measures.

