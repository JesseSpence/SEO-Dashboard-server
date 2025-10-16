class QueriesDashboard {
    constructor() {
        this.backendUrl = 'https://api.themetastack.com/api';
        this.pageUrl = this.getPageUrlFromUrl();
        this.queries = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadQueries();
    }

    getPageUrlFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('page') || '';
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.close();
        });

        // Refresh button
        document.getElementById('refreshQueries').addEventListener('click', () => {
            this.loadQueries();
        });

        // Copy queries button
        document.getElementById('copyQueries').addEventListener('click', () => {
            this.copyQueries();
        });

        // Send webhook button
        document.getElementById('sendWebhook').addEventListener('click', () => {
            this.sendToWebhook();
        });

        // Sort by dropdown
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortQueries(e.target.value);
        });

        // Search input
        document.getElementById('searchQuery').addEventListener('input', (e) => {
            this.filterQueries(e.target.value);
        });
    }

    async loadQueries() {
        this.showLoading();
        
        try {
            const queries = await this.getQueriesForPage(this.pageUrl);
            this.queries = queries;
            
            this.updatePageInfo(queries);
            this.displayQueries(queries);
            
        } catch (error) {
            console.error('Error loading queries:', error);
            this.showError('Failed to load queries: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getQueriesForPage(pageUrl) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const response = await fetch(`${this.backendUrl}/api/gsc/queries?page=${encodeURIComponent(pageUrl)}&start=${startDateStr}&end=${endDateStr}&limit=100`);
            
            if (!response.ok) {
                throw new Error('GSC queries request failed');
            }
            
            const queries = await response.json();
            console.log('📊 GSC queries received:', queries);
            
            return queries;
            
        } catch (error) {
            console.error('Error fetching queries for page:', error);
            return [];
        }
    }

    updatePageInfo(queries) {
        document.getElementById('pageUrl').textContent = this.pageUrl;
        
        const totalQueries = queries.length;
        const totalImpressions = queries.reduce((sum, q) => sum + (q.impressions || 0), 0);
        const totalClicks = queries.reduce((sum, q) => sum + (q.clicks || 0), 0);
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
        
        document.getElementById('totalQueries').textContent = totalQueries.toLocaleString();
        document.getElementById('totalImpressions').textContent = totalImpressions.toLocaleString();
        document.getElementById('totalClicks').textContent = totalClicks.toLocaleString();
        document.getElementById('avgCTR').textContent = avgCTR + '%';
    }

    displayQueries(queries) {
        const container = document.getElementById('queriesList');
        
        if (queries.length === 0) {
            container.innerHTML = `
                <div class="no-queries">
                    <i class="fas fa-info-circle"></i>
                    <h3>No queries found</h3>
                    <p>No search queries found for this page in the last 30 days.</p>
                </div>
            `;
            return;
        }

        const queriesHtml = queries.map((query, index) => `
            <div class="query-item">
                <div class="query-header">
                    <div class="query-number">${index + 1}</div>
                    <div class="query-text">${query.query}</div>
                </div>
                
                <div class="query-metrics">
                    <div class="query-metric">
                        <span class="metric-label">Impressions</span>
                        <span class="metric-value">${(query.impressions || 0).toLocaleString()}</span>
                    </div>
                    <div class="query-metric">
                        <span class="metric-label">Clicks</span>
                        <span class="metric-value">${(query.clicks || 0).toLocaleString()}</span>
                    </div>
                    <div class="query-metric">
                        <span class="metric-label">CTR</span>
                        <span class="metric-value">${((query.ctr || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="query-metric">
                        <span class="metric-label">Position</span>
                        <span class="metric-value">${(query.position || 0).toFixed(1)}</span>
                    </div>
                </div>
                
                <div class="query-actions">
                    <button class="action-btn primary" onclick="queriesDashboard.copyQuery('${query.query}')">
                        <i class="fas fa-copy"></i> Copy Query
                    </button>
                    <button class="action-btn secondary" onclick="queriesDashboard.searchGoogle('${query.query}')">
                        <i class="fas fa-search"></i> Search Google
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = queriesHtml;
    }

    sortQueries(sortBy) {
        const sortedQueries = [...this.queries].sort((a, b) => {
            switch (sortBy) {
                case 'impressions':
                    return (b.impressions || 0) - (a.impressions || 0);
                case 'clicks':
                    return (b.clicks || 0) - (a.clicks || 0);
                case 'ctr':
                    return (b.ctr || 0) - (a.ctr || 0);
                case 'position':
                    return (a.position || 0) - (b.position || 0);
                default:
                    return 0;
            }
        });
        
        this.displayQueries(sortedQueries);
    }

    filterQueries(searchTerm) {
        const filteredQueries = this.queries.filter(query => 
            query.query.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.displayQueries(filteredQueries);
    }

    copyQuery(query) {
        navigator.clipboard.writeText(query).then(() => {
            this.showNotification('Query copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy query:', err);
            this.showNotification('Failed to copy query', 'error');
        });
    }

    copyQueries() {
        const queriesText = this.queries.map(q => q.query).join('\n');
        navigator.clipboard.writeText(queriesText).then(() => {
            this.showNotification(`Copied ${this.queries.length} queries to clipboard!`, 'success');
        }).catch(err => {
            console.error('Failed to copy queries:', err);
            this.showNotification('Failed to copy queries', 'error');
        });
    }

    searchGoogle(query) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_blank');
    }

    async sendToWebhook() {
        try {
            this.showNotification('Sending data to webhook...', 'info');
            
            // Prepare the data to send
            const webhookData = {
                pageUrl: this.pageUrl,
                timestamp: new Date().toISOString(),
                totalQueries: this.queries.length,
                queries: this.queries.map(query => ({
                    query: query.query,
                    impressions: query.impressions || 0,
                    clicks: query.clicks || 0,
                    ctr: query.ctr || 0,
                    position: query.position || 0
                })),
                summary: {
                    totalImpressions: this.queries.reduce((sum, q) => sum + (q.impressions || 0), 0),
                    totalClicks: this.queries.reduce((sum, q) => sum + (q.clicks || 0), 0),
                    averageCTR: this.queries.length > 0 ? 
                        (this.queries.reduce((sum, q) => sum + (q.ctr || 0), 0) / this.queries.length * 100).toFixed(2) : 0,
                    averagePosition: this.queries.length > 0 ? 
                        (this.queries.reduce((sum, q) => sum + (q.position || 0), 0) / this.queries.length).toFixed(1) : 0
                }
            };

            console.log('📤 Sending webhook data:', webhookData);

            // Send to webhook with additional headers for CORS
            const response = await fetch('https://ttagz.app.n8n.cloud/webhook/0d36dfb0-a0ce-402f-92d6-8ed06975e1e2', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });

            console.log('📡 Webhook response status:', response.status);
            console.log('📡 Webhook response headers:', response.headers);

            if (response.ok) {
                const responseData = await response.text();
                console.log('✅ Webhook response data:', responseData);
                this.showNotification('Data sent to webhook successfully!', 'success');
            } else {
                const errorText = await response.text();
                console.error('❌ Webhook error response:', errorText);
                throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

        } catch (error) {
            console.error('❌ Error sending to webhook:', error);
            
            // Check if it's a CORS error
            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                this.showNotification('CORS error: Webhook blocked by browser. Try using a CORS proxy or server-side request.', 'error');
            } else {
                this.showNotification(`Failed to send to webhook: ${error.message}`, 'error');
            }
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        const container = document.getElementById('queriesList');
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the dashboard
const queriesDashboard = new QueriesDashboard();
