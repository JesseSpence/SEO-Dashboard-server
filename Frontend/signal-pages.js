class SignalPagesDashboard {
    constructor() {
        this.backendUrl = window.MOCK_CONFIG?.backendUrl || 'https://api.themetastack.com';
        this.mockMode = window.MOCK_CONFIG?.enabled || false;
        this.signalType = this.getSignalTypeFromUrl();
        this.pages = [];
        
        if (this.mockMode) {
            console.log('🎭 Mock mode enabled - using mock data instead of API calls');
        }
        
        this.init();
    }

    // Helper method to fetch data (real API or mock)
    async fetchData(endpoint, params = {}) {
        if (this.mockMode) {
            return this.fetchMockData(endpoint, params);
        } else {
            return this.fetchRealData(endpoint, params);
        }
    }

    // Fetch real API data
    async fetchRealData(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.backendUrl}${endpoint}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }

    // Fetch mock data
    async fetchMockData(endpoint, params = {}) {
        if (!window.mockDataGenerator) {
            throw new Error('Mock data generator not loaded');
        }

        const generator = window.mockDataGenerator;

        if (endpoint === '/api/gsc/top') {
            return await generator.getGSCTopPages(params.start, params.end, parseInt(params.limit) || 100);
        } else {
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    }

    init() {
        this.setupEventListeners();
        this.loadPages();
    }

    getSignalTypeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type') || 'ctr-drop';
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.close();
        });

        // Refresh button
        document.getElementById('refreshPages').addEventListener('click', () => {
            this.loadPages();
        });

        // Export button
        document.getElementById('exportPages').addEventListener('click', () => {
            this.exportUrls();
        });

        // Copy all URLs button
        document.getElementById('copyAllUrls').addEventListener('click', () => {
            this.copyAllUrls();
        });

        // Priority filter
        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filterPages(e.target.value);
        });
    }

    async loadPages() {
        this.showLoading();
        
        try {
            const pages = await this.getPagesForSignalType(this.signalType);
            this.pages = pages;
            
            this.updateSummary(pages);
            this.displayPages(pages);
            
        } catch (error) {
            console.error('Error loading pages:', error);
            this.showError('Failed to load pages: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getPagesForSignalType(signalType) {
        try {
            // Get GSC top pages data
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const gscData = await this.fetchData('/api/gsc/top', {
                start: startDateStr,
                end: endDateStr,
                limit: 100
            });
            
            console.log(this.mockMode ? '🎭 Mock GSC data received:' : '📊 GSC data received:', gscData);
            
            // Filter pages based on signal type criteria
            const filteredPages = gscData.filter(page => {
                switch (signalType) {
                    case 'ctr-drop':
                        // Low CTR with decent impressions
                        return page.ctr < 0.05 && page.impressions > 200;
                    case 'keywords-opportunity':
                        // Pages with keywords in positions 7-15 and high impressions
                        return page.position >= 7 && page.position <= 15 && page.impressions > 200;
                    case 'position-drop':
                        // Pages with declining positions (we'll use lower positions as proxy)
                        return page.position > 10 && page.impressions > 100;
                    case 'intent-mismatch':
                        // Pages with low CTR despite good position (potential intent mismatch)
                        return page.position <= 5 && page.ctr < 0.03 && page.impressions > 100;
                    case 'position-11-20':
                        // Pages ranking between positions 11-20
                        return page.position >= 11 && page.position <= 20 && page.impressions > 100;
                    case 'high-impressions-queries':
                        // Pages with 500+ impressions
                        return page.impressions >= 500;
                    default:
                        return false;
                }
            });
            
            // Convert to page format
            return filteredPages.map(page => {
                const pageName = page.page === '/' ? 'Homepage' : page.page.replace('https://www.fundingagent.co.uk', '').replace('/', '') || 'Unknown Page';
                
                let description = '';
                let priority = 'low';
                
                switch (signalType) {
                    case 'ctr-drop':
                        description = `Low CTR of ${(page.ctr * 100).toFixed(2)}% with ${page.impressions.toLocaleString()} impressions suggests meta/title optimization needed`;
                        priority = page.impressions > 2000 ? 'high' : page.impressions > 1000 ? 'medium' : 'low';
                        break;
                    case 'keywords-opportunity':
                        description = `Keywords ranking in positions 7-15 with ${page.impressions.toLocaleString()} impressions - easy optimization opportunity`;
                        priority = page.impressions > 1000 ? 'high' : page.impressions > 500 ? 'medium' : 'low';
                        break;
                    case 'position-drop':
                        description = `Page ranking at position ${page.position.toFixed(1)} with ${page.impressions.toLocaleString()} impressions - needs ranking improvement`;
                        priority = page.impressions > 1000 ? 'high' : page.impressions > 500 ? 'medium' : 'low';
                        break;
                    case 'intent-mismatch':
                        description = `Good position (${page.position.toFixed(1)}) but low CTR (${(page.ctr * 100).toFixed(2)}%) suggests content-intent mismatch`;
                        priority = page.impressions > 1000 ? 'high' : page.impressions > 500 ? 'medium' : 'low';
                        break;
                    case 'position-11-20':
                        description = `Page ranking at position ${page.position.toFixed(1)} with ${page.impressions.toLocaleString()} impressions - opportunity to push into top 10`;
                        priority = page.impressions > 500 ? 'high' : page.impressions > 200 ? 'medium' : 'low';
                        break;
                    case 'high-impressions-queries':
                        description = `Page with ${page.impressions.toLocaleString()} impressions - high visibility optimization opportunity`;
                        priority = page.impressions > 2000 ? 'high' : page.impressions > 1000 ? 'medium' : 'low';
                        break;
                }
                
                return {
                    pageName,
                    url: page.page,
                    description,
                    priority,
                    metrics: {
                        'Impressions': page.impressions.toLocaleString(),
                        'Clicks': page.clicks.toLocaleString(),
                        'CTR': `${(page.ctr * 100).toFixed(2)}%`,
                        'Position': page.position.toFixed(1)
                    }
                };
            });
            
        } catch (error) {
            console.error('Error fetching pages for signal type:', error);
            return [];
        }
    }

    updateSummary(pages) {
        const signalTypeNames = {
            'ctr-drop': 'CTR Issues',
            'keywords-opportunity': 'Keyword Opportunities',
            'position-drop': 'Position Drops',
            'intent-mismatch': 'Intent Mismatches',
            'high-impressions-queries': 'High Impressions Pages',
            'position-11-20': 'Position 11-20 Pages'
        };

        document.getElementById('signalTitle').textContent = signalTypeNames[this.signalType] || 'Signal Pages';
        document.getElementById('summaryTitle').textContent = `Pages with ${signalTypeNames[this.signalType] || 'Issues'}`;
        document.getElementById('summaryDescription').textContent = `Pages identified for ${signalTypeNames[this.signalType]?.toLowerCase() || 'this signal type'}`;
        
        document.getElementById('totalPages').textContent = pages.length;
        
        const highPriority = pages.filter(p => p.priority === 'high').length;
        const mediumPriority = pages.filter(p => p.priority === 'medium').length;
        const lowPriority = pages.filter(p => p.priority === 'low').length;
        
        document.getElementById('highPriorityPages').textContent = highPriority;
        document.getElementById('mediumPriorityPages').textContent = mediumPriority;
        document.getElementById('lowPriorityPages').textContent = lowPriority;
    }

    displayPages(pages) {
        const container = document.getElementById('pagesList');
        
        if (pages.length === 0) {
            container.innerHTML = `
                <div class="no-pages">
                    <i class="fas fa-info-circle"></i>
                    <h3>No pages found</h3>
                    <p>No pages currently need updates for this signal type.</p>
                </div>
            `;
            return;
        }

        const pagesHtml = pages.map((page, index) => `
            <div class="page-item ${page.priority}-priority" data-priority="${page.priority}">
                <div class="page-header">
                    <div class="page-number">${index + 1}</div>
                    <div class="page-info">
                        <h3 class="page-title">${page.pageName}</h3>
                        <div class="page-url">${page.url}</div>
                    </div>
                    <div class="page-priority-badge ${page.priority}">${page.priority.toUpperCase()}</div>
                </div>
                
                <div class="page-description">${page.description}</div>
                
                <div class="page-metrics">
                    ${Object.entries(page.metrics).map(([key, value]) => `
                        <div class="page-metric">
                            <span class="metric-label">${key}</span>
                            <span class="metric-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="page-actions">
                    ${page.isQuery ? `
                        <button class="action-btn primary" onclick="signalPages.copyQuery('${page.queryText}')">
                            <i class="fas fa-copy"></i> Copy Query
                        </button>
                        ${page.url && page.url !== '#' ? `
                            <button class="action-btn secondary" onclick="window.open('${page.url}', '_blank')">
                                <i class="fas fa-external-link-alt"></i> View Source Page
                            </button>
                        ` : ''}
                    ` : `
                        <button class="action-btn primary" onclick="window.open('${page.url}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Visit Page
                        </button>
                        <button class="action-btn secondary" onclick="signalPages.copyUrl('${page.url}')">
                            <i class="fas fa-copy"></i> Copy URL
                        </button>
                        <button class="action-btn secondary" onclick="signalPages.viewQueries('${page.url}')">
                            <i class="fas fa-search"></i> View Queries
                        </button>
                    `}
                </div>
            </div>
        `).join('');

        container.innerHTML = pagesHtml;
    }

    filterPages(priority) {
        const pageItems = document.querySelectorAll('.page-item');
        
        pageItems.forEach(item => {
            const itemPriority = item.dataset.priority;
            const shouldShow = priority === 'all' || itemPriority === priority;
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('URL copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy URL:', err);
            this.showNotification('Failed to copy URL', 'error');
        });
    }

    copyQuery(query) {
        navigator.clipboard.writeText(query).then(() => {
            this.showNotification('Query copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy query:', err);
            this.showNotification('Failed to copy query', 'error');
        });
    }

    copyAllUrls() {
        const urls = this.pages.map(page => page.url).join('\n');
        navigator.clipboard.writeText(urls).then(() => {
            this.showNotification(`Copied ${this.pages.length} URLs to clipboard!`, 'success');
        }).catch(err => {
            console.error('Failed to copy URLs:', err);
            this.showNotification('Failed to copy URLs', 'error');
        });
    }

    exportUrls() {
        const urls = this.pages.map(page => page.url);
        const dataStr = JSON.stringify(urls, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.signalType}-pages.json`;
        link.click();
        
        this.showNotification('URLs exported successfully!', 'success');
    }

    viewQueries(url) {
        // Open queries in a new window/tab
        const queriesUrl = `queries.html?page=${encodeURIComponent(url)}`;
        window.open(queriesUrl, '_blank');
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        const container = document.getElementById('pagesList');
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
const signalPages = new SignalPagesDashboard();
