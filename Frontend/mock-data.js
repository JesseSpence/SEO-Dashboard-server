// Mock Data Generator for Frontend Development
// Provides realistic mock data matching API response formats

class MockDataGenerator {
    constructor() {
        this.baseDate = new Date();
    }

    // Simulate API delay
    async delay(ms = MOCK_CONFIG.delay) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate mock health response
    async getHealth() {
        await this.delay(100);
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Mock backend is running'
        };
    }

    // Generate mock GSC top pages data
    async getGSCTopPages(startDate, endDate, limit = 100) {
        await this.delay();
        const pages = [
            { page: 'https://www.fundingagent.co.uk/', clicks: 1250, impressions: 15200, ctr: 0.082, position: 3.2, pageTitle: 'Homepage' },
            { page: 'https://www.fundingagent.co.uk/business-loans', clicks: 890, impressions: 11200, ctr: 0.079, position: 4.1, pageTitle: 'Business Loans' },
            { page: 'https://www.fundingagent.co.uk/invoice-financing', clicks: 720, impressions: 9800, ctr: 0.073, position: 5.3, pageTitle: 'Invoice Financing' },
            { page: 'https://www.fundingagent.co.uk/asset-finance', clicks: 650, impressions: 8500, ctr: 0.076, position: 4.8, pageTitle: 'Asset Finance' },
            { page: 'https://www.fundingagent.co.uk/startup-funding', clicks: 580, impressions: 7200, ctr: 0.081, position: 3.9, pageTitle: 'Startup Funding' },
            { page: 'https://www.fundingagent.co.uk/merchant-cash-advance', clicks: 520, impressions: 6800, ctr: 0.076, position: 5.1, pageTitle: 'Merchant Cash Advance' },
            { page: 'https://www.fundingagent.co.uk/equipment-finance', clicks: 480, impressions: 6200, ctr: 0.077, position: 4.5, pageTitle: 'Equipment Finance' },
            { page: 'https://www.fundingagent.co.uk/property-finance', clicks: 420, impressions: 5500, ctr: 0.076, position: 5.8, pageTitle: 'Property Finance' },
            { page: 'https://www.fundingagent.co.uk/bridging-loans', clicks: 380, impressions: 4900, ctr: 0.078, position: 6.2, pageTitle: 'Bridging Loans' },
            { page: 'https://www.fundingagent.co.uk/working-capital', clicks: 350, impressions: 4500, ctr: 0.078, position: 5.5, pageTitle: 'Working Capital' }
        ];

        // Generate additional pages if limit is higher
        for (let i = pages.length; i < Math.min(limit, 50); i++) {
            pages.push({
                page: `https://www.fundingagent.co.uk/page-${i + 1}`,
                clicks: Math.floor(Math.random() * 300) + 50,
                impressions: Math.floor(Math.random() * 4000) + 500,
                ctr: Math.random() * 0.1 + 0.03,
                position: Math.random() * 10 + 3,
                pageTitle: `Page ${i + 1}`
            });
        }

        return pages.slice(0, limit);
    }

    // Generate mock GSC daily data
    async getGSCDaily(startDate, endDate) {
        await this.delay();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const dailyData = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Add some variation to make it realistic
            const baseImpressions = 400 + Math.random() * 200;
            const baseClicks = baseImpressions * (0.06 + Math.random() * 0.02);
            
            dailyData.push({
                date: dateStr,
                clicks: Math.floor(baseClicks),
                impressions: Math.floor(baseImpressions),
                ctr: baseClicks / baseImpressions,
                position: 4.5 + Math.random() * 2
            });
        }

        return dailyData;
    }

    // Generate mock GSC queries for a page
    async getGSCQueries(pageUrl, startDate, endDate, limit = 100) {
        await this.delay();
        const queries = [
            { query: 'business loans uk', clicks: 120, impressions: 1800, ctr: 0.067, position: 3.5 },
            { query: 'invoice financing', clicks: 95, impressions: 1400, ctr: 0.068, position: 4.2 },
            { query: 'asset finance', clicks: 78, impressions: 1100, ctr: 0.071, position: 3.8 },
            { query: 'startup funding', clicks: 65, impressions: 950, ctr: 0.068, position: 4.5 },
            { query: 'merchant cash advance', clicks: 58, impressions: 820, ctr: 0.071, position: 5.1 },
            { query: 'equipment finance uk', clicks: 52, impressions: 750, ctr: 0.069, position: 4.8 },
            { query: 'property finance', clicks: 48, impressions: 680, ctr: 0.071, position: 5.3 },
            { query: 'bridging loans', clicks: 42, impressions: 620, ctr: 0.068, position: 5.8 },
            { query: 'working capital finance', clicks: 38, impressions: 560, ctr: 0.068, position: 5.5 },
            { query: 'business funding', clicks: 35, impressions: 520, ctr: 0.067, position: 6.1 }
        ];

        // Generate additional queries if needed
        const queryTemplates = [
            'small business loans', 'commercial finance', 'trade finance', 'export finance',
            'construction finance', 'development finance', 'refinancing', 'debt consolidation',
            'cash flow finance', 'revenue based financing', 'peer to peer lending', 'crowdfunding'
        ];

        for (let i = queries.length; i < Math.min(limit, 30); i++) {
            const template = queryTemplates[i % queryTemplates.length];
            queries.push({
                query: `${template}${i > queryTemplates.length ? ' ' + (i + 1) : ''}`,
                clicks: Math.floor(Math.random() * 30) + 10,
                impressions: Math.floor(Math.random() * 400) + 200,
                ctr: Math.random() * 0.05 + 0.05,
                position: Math.random() * 8 + 4
            });
        }

        return queries.slice(0, limit);
    }

    // Generate mock scoreboard data
    async getScoreboard(startDate, endDate) {
        await this.delay();
        return [
            {
                pagePath: '/business-loans',
                priority: 85,
                reasons: [
                    'Low CTR (4.2%) despite high impressions (11,200) - meta description optimization needed',
                    'Keywords ranking in positions 7-12 with 500+ impressions - easy ranking opportunity'
                ],
                metrics: {
                    current: 'CTR: 4.2%, Position: 7.5',
                    previous: 'CTR: 5.1%, Position: 6.8',
                    delta: '-0.9% CTR, +0.7 position'
                }
            },
            {
                pagePath: '/invoice-financing',
                priority: 78,
                reasons: [
                    'Position drop from 4.1 to 5.3 - content freshness needed',
                    'High impressions (9,800) but low engagement - intent mismatch possible'
                ],
                metrics: {
                    current: 'Position: 5.3, Impressions: 9,800',
                    previous: 'Position: 4.1, Impressions: 10,200',
                    delta: '+1.2 position, -400 impressions'
                }
            },
            {
                pagePath: '/asset-finance',
                priority: 72,
                reasons: [
                    'Keywords in positions 11-15 with 600+ impressions - optimization opportunity',
                    'CTR below average (3.8%) - title tag optimization needed'
                ],
                metrics: {
                    current: 'Position: 12.3, CTR: 3.8%',
                    previous: 'Position: 11.8, CTR: 4.1%',
                    delta: '+0.5 position, -0.3% CTR'
                }
            },
            {
                pagePath: '/startup-funding',
                priority: 68,
                reasons: [
                    'Good position (3.9) but CTR could be improved',
                    'High impression volume suggests strong keyword targeting'
                ],
                metrics: {
                    current: 'Position: 3.9, CTR: 5.2%',
                    previous: 'Position: 4.2, CTR: 5.0%',
                    delta: '-0.3 position, +0.2% CTR'
                }
            },
            {
                pagePath: '/merchant-cash-advance',
                priority: 65,
                reasons: [
                    'Position 5.1 with decent traffic - content update could improve rankings',
                    'CTR slightly below average for position'
                ],
                metrics: {
                    current: 'Position: 5.1, CTR: 4.8%',
                    previous: 'Position: 5.3, CTR: 4.6%',
                    delta: '-0.2 position, +0.2% CTR'
                }
            }
        ];
    }
}

// Export singleton instance
window.MockDataGenerator = MockDataGenerator;
window.mockDataGenerator = new MockDataGenerator();

