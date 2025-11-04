// Domain Ranking Tracker
class DRTracker {
    constructor() {
        this.companies = [];
        this.draggedElement = null;
        this.dragOverElement = null;
        this.init();
    }

    init() {
        this.loadCompanies();
        this.setupEventListeners();
        this.renderDRScale();
        this.renderRankings();
    }

    setupEventListeners() {
        // Add company button
        document.getElementById('addCompanyBtn').addEventListener('click', () => {
            this.addCompany();
        });

        // Enter key support for form
        document.getElementById('companyUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCompany();
            }
        });
        document.getElementById('companyDR').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCompany();
            }
        });

        // Reset rankings button
        document.getElementById('resetRankingsBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all rankings to default values? This cannot be undone.')) {
                this.resetToDefault();
            }
        });

        // Export rankings button
        document.getElementById('exportRankingsBtn').addEventListener('click', () => {
            this.exportRankings();
        });
    }

    getDefaultCompanies() {
        return [
            { url: 'https://www.fundingagent.co.uk/', dr: 0, name: 'Funding Agent' },
            { url: 'fundingbay.co.uk', dr: 21, name: 'Funding Bay' },
            { url: 'https://maffinancegroup.co.uk/', dr: 27, name: 'MAF Finance Group' },
            { url: 'https://www.fundonion.com/', dr: 28, name: 'Fundonion' },
            { url: 'https://www.capalona.co.uk/', dr: 30, name: 'Capalona' },
            { url: 'https://www.lovefinance.co.uk/', dr: 33, name: 'Love Finance' },
            { url: 'https://whiteoakuk.com/', dr: 38, name: 'White Oak UK' },
            { url: 'https://www.365finance.co.uk/', dr: 39, name: '365 Finance' },
            { url: 'https://portmanfinancegroup.co.uk/', dr: 41, name: 'Portman Finance Group' },
            { url: 'https://www.smeloans.co.uk/', dr: 44, name: 'SME Loans' },
            { url: 'https://timefinance.com/', dr: 45, name: 'Time Finance' },
            { url: 'https://www.cliftonpf.co.uk/', dr: 50, name: 'Clifton PF' },
            { url: 'https://www.liberis.com/', dr: 60, name: 'Liberis' },
            { url: 'https://www.shawbrook.co.uk/', dr: 63, name: 'Shawbrook' },
            { url: 'https://www.novuna.co.uk/', dr: 65, name: 'Novuna' },
            { url: 'https://swoopfunding.com/', dr: 68, name: 'Swoop Funding' },
            { url: 'https://youlend.com/', dr: 70, name: 'YouLend' }
        ];
    }

    loadCompanies() {
        const saved = localStorage.getItem('drRankings');
        if (saved) {
            try {
                this.companies = JSON.parse(saved);
                // Ensure Funding Agent is always first
                this.ensureFundingAgentFirst();
            } catch (e) {
                console.error('Error loading saved rankings:', e);
                this.companies = this.getDefaultCompanies();
            }
        } else {
            this.companies = this.getDefaultCompanies();
        }
        
        // Sort by DR (highest first)
        this.companies.sort((a, b) => b.dr - a.dr);
    }

    ensureFundingAgentFirst() {
        const fundingAgent = this.companies.find(c => 
            c.url.includes('fundingagent.co.uk') || c.name === 'Funding Agent'
        );
        if (fundingAgent) {
            this.companies = this.companies.filter(c => c !== fundingAgent);
            this.companies.unshift(fundingAgent);
        }
    }

    saveCompanies() {
        try {
            localStorage.setItem('drRankings', JSON.stringify(this.companies));
            console.log('✅ Rankings saved to localStorage');
        } catch (e) {
            console.error('❌ Error saving rankings:', e);
            alert('Error saving rankings. Please check your browser settings.');
        }
    }

    addCompany() {
        const urlInput = document.getElementById('companyUrl');
        const drInput = document.getElementById('companyDR');
        
        const url = urlInput.value.trim();
        const dr = parseInt(drInput.value);
        
        if (!url) {
            alert('Please enter a website URL');
            return;
        }
        
        if (isNaN(dr) || dr < 0 || dr > 100) {
            alert('Please enter a valid DR value between 0 and 100');
            return;
        }
        
        // Extract domain name
        const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const name = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        
        // Check if company already exists
        const exists = this.companies.find(c => 
            c.url === url || c.url === domain || c.url.includes(domain) || domain.includes(c.url.replace(/^https?:\/\//, ''))
        );
        
        if (exists) {
            alert('This company is already in the list');
            return;
        }
        
        const newCompany = {
            url: url.startsWith('http') ? url : `https://${url}`,
            dr: dr,
            name: name
        };
        
        this.companies.push(newCompany);
        this.saveCompanies();
        this.renderRankings();
        
        // Clear form
        urlInput.value = '';
        drInput.value = '';
        urlInput.focus();
    }

    resetToDefault() {
        this.companies = this.getDefaultCompanies();
        this.companies.sort((a, b) => b.dr - a.dr);
        this.saveCompanies();
        this.renderRankings();
    }

    exportRankings() {
        const data = this.companies.map((c, index) => ({
            rank: index + 1,
            name: c.name,
            url: c.url,
            dr: c.dr
        }));
        
        const csv = [
            'Rank,Name,URL,DR',
            ...data.map(c => `${c.rank},"${c.name}",${c.url},${c.dr}`)
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dr-rankings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    renderDRScale() {
        const scale = document.getElementById('drScale');
        scale.innerHTML = '';
        
        // Create DR value indicator tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'dr-tooltip';
        tooltip.id = 'drTooltip';
        tooltip.style.display = 'none';
        scale.appendChild(tooltip);
        
        // Create 101 dots (0-100)
        for (let i = 0; i <= 100; i++) {
            const dot = document.createElement('div');
            dot.className = 'dr-scale-dot';
            dot.dataset.dr = i;
            dot.title = `DR: ${i}`;
            
            // Mark every 10th dot more prominently
            if (i % 10 === 0) {
                dot.classList.add('dr-scale-dot-major');
            }
            
            // Add drop zone functionality
            dot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove hover from other dots
                document.querySelectorAll('.dr-scale-dot-hover').forEach(d => {
                    if (d !== dot) d.classList.remove('dr-scale-dot-hover');
                });
                
                dot.classList.add('dr-scale-dot-hover');
                
                // Show tooltip with DR value
                if (this.draggedElement) {
                    const tooltipEl = document.getElementById('drTooltip');
                    tooltipEl.textContent = `DR: ${i}`;
                    tooltipEl.style.display = 'block';
                    
                    // Position tooltip above the dot
                    const rect = dot.getBoundingClientRect();
                    const scaleRect = scale.getBoundingClientRect();
                    tooltipEl.style.left = `${rect.left - scaleRect.left + rect.width / 2}px`;
                    tooltipEl.style.top = `${rect.top - scaleRect.top - 40}px`;
                }
            });
            
            dot.addEventListener('dragleave', (e) => {
                // Only remove hover if we're actually leaving this dot (not entering a child)
                if (!dot.contains(e.relatedTarget)) {
                    dot.classList.remove('dr-scale-dot-hover');
                }
            });
            
            dot.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dot.classList.remove('dr-scale-dot-hover');
                
                // Hide tooltip
                const tooltipEl = document.getElementById('drTooltip');
                tooltipEl.style.display = 'none';
                
                if (this.draggedElement) {
                    const index = parseInt(this.draggedElement.dataset.index);
                    this.setCompanyDR(index, i);
                }
            });
            
            // Also handle mouse enter/leave for better UX
            dot.addEventListener('mouseenter', () => {
                if (this.draggedElement) {
                    dot.classList.add('dr-scale-dot-hover');
                }
            });
            
            scale.appendChild(dot);
        }
        
        // Update company positions on scale
        this.updateCompanyPositionsOnScale();
    }

    updateCompanyPositionsOnScale() {
        // Remove existing position indicators
        document.querySelectorAll('.company-position-marker').forEach(marker => marker.remove());
        
        // Add position indicators for each company
        this.companies.forEach((company, index) => {
            const dot = document.querySelector(`.dr-scale-dot[data-dr="${company.dr}"]`);
            if (dot) {
                const marker = document.createElement('div');
                marker.className = 'company-position-marker';
                marker.title = `${company.name} - DR: ${company.dr}`;
                marker.style.setProperty('--company-index', index);
                
                const isFundingAgent = company.url.includes('fundingagent.co.uk') || company.name === 'Funding Agent';
                if (isFundingAgent) {
                    marker.classList.add('funding-agent-marker');
                }
                
                dot.appendChild(marker);
            }
        });
    }

    renderRankings() {
        const list = document.getElementById('rankingList');
        list.innerHTML = '';
        
        if (this.companies.length === 0) {
            list.innerHTML = '<li class="no-companies">No companies in ranking list</li>';
            return;
        }
        
        // Sort by DR (highest first) before rendering
        const sortedCompanies = [...this.companies].sort((a, b) => b.dr - a.dr);
        this.ensureFundingAgentFirst();
        
        this.companies.forEach((company, index) => {
            const li = this.createRankingItem(company, index);
            list.appendChild(li);
        });
        
        // Update scale positions after rendering
        this.updateCompanyPositionsOnScale();
    }

    createRankingItem(company, index) {
        const li = document.createElement('li');
        li.className = 'ranking-item';
        li.draggable = true;
        li.dataset.index = index;
        
        const isFundingAgent = company.url.includes('fundingagent.co.uk') || company.name === 'Funding Agent';
        
        li.innerHTML = `
            <div class="ranking-item-content">
                <div class="ranking-number">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${company.name} ${isFundingAgent ? '<span class="funding-agent-badge">(Your Site)</span>' : ''}</div>
                    <div class="ranking-url">${company.url}</div>
                </div>
                <div class="ranking-dr">
                    <span class="dr-label">DR</span>
                    <span class="dr-value">${company.dr}</span>
                </div>
                <div class="ranking-actions">
                    <button class="btn-icon" onclick="drTracker.editCompany(${index})" title="Edit DR">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="drTracker.deleteCompany(${index})" title="Delete" ${isFundingAgent ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Drag and drop handlers
        li.addEventListener('dragstart', (e) => {
            this.draggedElement = li;
            li.classList.add('dragging');
            document.body.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            // Store company data
            e.dataTransfer.setData('text/plain', index.toString());
            
            // Create a custom drag image
            const dragImage = li.cloneNode(true);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '0.8';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
            setTimeout(() => document.body.removeChild(dragImage), 0);
        });
        
        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            document.body.classList.remove('dragging');
            // Remove all hover states from scale dots
            document.querySelectorAll('.dr-scale-dot-hover').forEach(dot => {
                dot.classList.remove('dr-scale-dot-hover');
            });
            // Hide tooltip
            const tooltip = document.getElementById('drTooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
            this.draggedElement = null;
        });
        
        return li;
    }

    setCompanyDR(index, newDR) {
        const company = this.companies[index];
        const isFundingAgent = company.url.includes('fundingagent.co.uk') || company.name === 'Funding Agent';
        
        // Ensure DR is within valid range
        newDR = Math.max(0, Math.min(100, Math.round(newDR)));
        
        // Update the DR
        company.dr = newDR;
        
        // Save and re-render
        this.saveCompanies();
        this.renderRankings();
    }

    editCompany(index) {
        const company = this.companies[index];
        const newDR = prompt(`Enter new DR value for ${company.name}:`, company.dr);
        
        if (newDR !== null) {
            const dr = parseInt(newDR);
            if (!isNaN(dr) && dr >= 0 && dr <= 100) {
                this.setCompanyDR(index, dr);
            } else {
                alert('Please enter a valid DR value between 0 and 100');
            }
        }
    }

    deleteCompany(index) {
        const company = this.companies[index];
        const isFundingAgent = company.url.includes('fundingagent.co.uk') || company.name === 'Funding Agent';
        
        if (isFundingAgent) {
            alert('Cannot delete Funding Agent from the list');
            return;
        }
        
        if (confirm(`Are you sure you want to remove ${company.name} from the ranking?`)) {
            this.companies.splice(index, 1);
            this.saveCompanies();
            this.renderRankings();
            this.updateCompanyPositionsOnScale();
        }
    }
}

// Initialize tracker
let drTracker;
document.addEventListener('DOMContentLoaded', () => {
    drTracker = new DRTracker();
});

