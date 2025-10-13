// Google Search Console API Service
class GSCAPIService {
    constructor() {
        this.config = window.GSC_CONFIG;
        this.oauthConfig = window.OAUTH_CONFIG;
        this.accessToken = null;
        this.isAuthenticated = false;
        this.retryCount = 0;
    }

    // Initialize the API service
    async initialize() {
        try {
            // Check if we have stored credentials
            const storedToken = localStorage.getItem('gsc_access_token');
            if (storedToken) {
                this.accessToken = storedToken;
                this.isAuthenticated = true;
                return true;
            }
            
            // Try service account authentication first
            if (await this.authenticateWithServiceAccount()) {
                return true;
            }
            
            // Fallback to OAuth2
            return await this.authenticateWithOAuth();
        } catch (error) {
            console.error('GSC API initialization failed:', error);
            throw new Error('Failed to initialize GSC API: ' + error.message);
        }
    }

    // Service Account Authentication
    async authenticateWithServiceAccount() {
        try {
            if (!this.config.serviceAccount.private_key) {
                throw new Error('Service account credentials not configured');
            }

            // Create JWT token for service account
            const jwt = await this.createJWT();
            
            // Exchange JWT for access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Service account authentication failed');
            }

            const tokenData = await tokenResponse.json();
            this.accessToken = tokenData.access_token;
            this.isAuthenticated = true;
            
            // Store token for future use
            localStorage.setItem('gsc_access_token', this.accessToken);
            
            return true;
        } catch (error) {
            console.warn('Service account authentication failed:', error.message);
            return false;
        }
    }

    // OAuth2 Authentication
    async authenticateWithOAuth() {
        return new Promise((resolve, reject) => {
            // Load Google API client
            if (typeof gapi === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => {
                    gapi.load('client', () => {
                        this.initializeOAuth().then(resolve).catch(reject);
                    });
                };
                document.head.appendChild(script);
            } else {
                this.initializeOAuth().then(resolve).catch(reject);
            }
        });
    }

    async initializeOAuth() {
        try {
            await gapi.client.init({
                clientId: this.oauthConfig.clientId,
                discoveryDocs: this.oauthConfig.discoveryDocs,
                scope: this.oauthConfig.scopes.join(' ')
            });

            // Check if user is already signed in
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                this.accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
                this.isAuthenticated = true;
                return true;
            }

            // Sign in user
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.accessToken = user.getAuthResponse().access_token;
            this.isAuthenticated = true;
            
            // Store token
            localStorage.setItem('gsc_access_token', this.accessToken);
            
            return true;
        } catch (error) {
            console.error('OAuth authentication failed:', error);
            throw error;
        }
    }

    // Create JWT for service account
    async createJWT() {
        const now = Math.floor(Date.now() / 1000);
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        const payload = {
            iss: this.config.serviceAccount.client_email,
            scope: 'https://www.googleapis.com/auth/webmasters.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600
        };

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = await this.signJWT(`${encodedHeader}.${encodedPayload}`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    // Sign JWT with private key
    async signJWT(data) {
        const privateKey = this.config.serviceAccount.private_key;
        const key = await window.crypto.subtle.importKey(
            'pkcs8',
            this.pemToArrayBuffer(privateKey),
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            false,
            ['sign']
        );

        const signature = await window.crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            key,
            new TextEncoder().encode(data)
        );

        return this.base64UrlEncode(signature);
    }

    // Utility functions
    base64UrlEncode(str) {
        if (typeof str === 'string') {
            return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        }
        return btoa(String.fromCharCode(...new Uint8Array(str)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    pemToArrayBuffer(pem) {
        const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '')
                          .replace(/-----END PRIVATE KEY-----/, '')
                          .replace(/\s/g, '');
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Get search analytics data
    async getSearchAnalytics(startDate, endDate, dimensions = ['date'], rowLimit = 1000) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GSC API');
        }

        const requestBody = {
            startDate: startDate,
            endDate: endDate,
            dimensions: dimensions,
            rowLimit: rowLimit,
            startRow: 0
        };

        try {
            const response = await this.makeRequest(
                `sites/${encodeURIComponent(this.config.siteUrl)}/searchAnalytics/query`,
                'POST',
                requestBody
            );

            return this.processSearchAnalyticsData(response);
        } catch (error) {
            console.error('Failed to fetch search analytics:', error);
            throw error;
        }
    }

    // Get site verification status
    async getSiteVerification() {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GSC API');
        }

        try {
            const response = await this.makeRequest(`sites/${encodeURIComponent(this.config.siteUrl)}`);
            return response;
        } catch (error) {
            console.error('Failed to fetch site verification:', error);
            throw error;
        }
    }

    // Get top pages
    async getTopPages(startDate, endDate, limit = 25) {
        const data = await this.getSearchAnalytics(
            startDate, 
            endDate, 
            ['page'], 
            limit
        );
        
        return data.map(item => ({
            page: item.page,
            clicks: item.clicks,
            impressions: item.impressions,
            ctr: item.ctr,
            position: item.position
        }));
    }

    // Get top queries
    async getTopQueries(startDate, endDate, limit = 25) {
        const data = await this.getSearchAnalytics(
            startDate, 
            endDate, 
            ['query'], 
            limit
        );
        
        return data.map(item => ({
            query: item.query,
            clicks: item.clicks,
            impressions: item.impressions,
            ctr: item.ctr,
            position: item.position
        }));
    }

    // Process search analytics data
    processSearchAnalyticsData(response) {
        if (!response.rows) {
            return [];
        }

        return response.rows.map(row => {
            const result = {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            };

            // Add dimension-specific data
            if (row.keys) {
                row.keys.forEach((key, index) => {
                    const dimension = response.dimensionHeaders[index].name;
                    result[dimension] = key;
                });
            }

            return result;
        });
    }

    // Make authenticated API request
    async makeRequest(endpoint, method = 'GET', body = null) {
        const url = `${this.config.baseUrl}/${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            
            if (response.status === 401) {
                // Token expired, try to refresh
                await this.refreshToken();
                return this.makeRequest(endpoint, method, body);
            }
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (this.retryCount < this.config.maxRetries) {
                this.retryCount++;
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this.makeRequest(endpoint, method, body);
            }
            throw error;
        }
    }

    // Refresh access token
    async refreshToken() {
        // For service account, create new JWT
        if (this.config.serviceAccount.private_key) {
            const jwt = await this.createJWT();
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });
            
            const tokenData = await tokenResponse.json();
            this.accessToken = tokenData.access_token;
            localStorage.setItem('gsc_access_token', this.accessToken);
        } else {
            // For OAuth, use gapi to refresh
            const authInstance = gapi.auth2.getAuthInstance();
            const user = authInstance.currentUser.get();
            await user.reloadAuthResponse();
            this.accessToken = user.getAuthResponse().access_token;
            localStorage.setItem('gsc_access_token', this.accessToken);
        }
    }

    // Get date range for API calls
    getDateRange(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    // Logout and clear credentials
    logout() {
        this.accessToken = null;
        this.isAuthenticated = false;
        localStorage.removeItem('gsc_access_token');
        
        if (typeof gapi !== 'undefined' && gapi.auth2) {
            gapi.auth2.getAuthInstance().signOut();
        }
    }
}

// Export for use in other modules
window.GSCAPIService = GSCAPIService;

