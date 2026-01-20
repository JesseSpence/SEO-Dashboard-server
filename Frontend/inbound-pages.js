// Inbound Pages Management Dashboard
class InboundPagesDashboard {
    constructor() {
        this.pages = this.initializePages();
        this.currentModal = {
            pageIndex: null,
            column: null,
            data: null
        };
        this.columnWidths = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadColumnWidths();
        this.renderTable();
        this.setupColumnResizing();
    }

    loadColumnWidths() {
        const saved = localStorage.getItem('inboundTableColumnWidths');
        if (saved) {
            try {
                this.columnWidths = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading column widths:', e);
                this.columnWidths = {};
            }
        } else {
            this.columnWidths = {};
        }
    }

    saveColumnWidths() {
        localStorage.setItem('inboundTableColumnWidths', JSON.stringify(this.columnWidths));
    }

    setupColumnResizing() {
        const table = document.getElementById('inboundTable');
        if (!table) return;

        const headers = table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            // Skip the first column (expand button + URL)
            if (index === 0) {
                // Make first column wider by default
                if (!this.columnWidths[index]) {
                    this.columnWidths[index] = 300;
                }
                header.style.minWidth = this.columnWidths[index] + 'px';
                header.style.width = this.columnWidths[index] + 'px';
                return;
            }

            // Add resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            header.classList.add('resizable');
            header.appendChild(resizeHandle);

            // Set initial width if saved
            if (this.columnWidths[index]) {
                header.style.minWidth = this.columnWidths[index] + 'px';
                header.style.width = this.columnWidths[index] + 'px';
            }

            let startX, startWidth, startIndex;

            const onMouseDown = (e) => {
                e.preventDefault();
                startX = e.pageX;
                startWidth = header.offsetWidth;
                startIndex = index;
                resizeHandle.classList.add('active');
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e) => {
                const diff = e.pageX - startX;
                const newWidth = Math.max(100, startWidth + diff); // Minimum width of 100px
                
                header.style.width = newWidth + 'px';
                header.style.minWidth = newWidth + 'px';
                
                // Update all cells in this column
                const cells = table.querySelectorAll(`tbody td:nth-child(${index + 1})`);
                cells.forEach(cell => {
                    cell.style.width = newWidth + 'px';
                    cell.style.minWidth = newWidth + 'px';
                });
            };

            const onMouseUp = () => {
                resizeHandle.classList.remove('active');
                
                // Save the width
                const finalWidth = header.offsetWidth;
                this.columnWidths[startIndex] = finalWidth;
                this.saveColumnWidths();
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            resizeHandle.addEventListener('mousedown', onMouseDown);
        });

        // Apply saved widths to all cells
        this.applyColumnWidths();
    }

    applyColumnWidths() {
        const table = document.getElementById('inboundTable');
        if (!table) return;

        const headers = table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            if (this.columnWidths[index]) {
                const width = this.columnWidths[index] + 'px';
                header.style.width = width;
                header.style.minWidth = width;
                
                const cells = table.querySelectorAll(`tbody td:nth-child(${index + 1})`);
                cells.forEach(cell => {
                    cell.style.width = width;
                    cell.style.minWidth = width;
                });
            }
        });
    }

    initializePages() {
        // Anchor phrases for each page
        const anchorData = {
            '/calculator/business-loan-calculator': [
                'business loan repayment calculator',
                'estimate monthly business loan costs',
                'UK business loan calculator',
                'calculate business loan payments',
                'loan cost estimator tool'
            ],
            '/financing-options/business-debt-consolidation-loans': [
                'UK business debt consolidation loans',
                'consolidate multiple business debts',
                'simplify debt repayment for SMEs',
                'reduce business loan interest with consolidation',
                'merge business debt into one loan'
            ],
            '/financing-options/business-line-of-credit-for-care-homes-and-home-care-providers': [
                'business line of credit for care homes',
                'working capital for home care providers',
                'flexible credit line financing in healthcare',
                'care provider business credit facilities',
                'revolving credit for care sector SMEs'
            ],
            '/financing-options/mca-loans': [
                'merchant cash advance loans',
                'MCA funding solutions',
                'fast working capital via MCA',
                'merchant cash advance for UK businesses',
                'flexible repayment merchant cash advance'
            ],
            '/financing-options/same-day-business-loans': [
                'same-day business loans UK',
                'fast business funding options',
                'quick approval business loans',
                'urgent business loan solutions',
                'business loans with rapid decisions'
            ],
            '/financing-options/same-day-business-loans-for-e-commerce': [
                'same-day e-commerce business loans',
                'rapid funding for online sellers',
                'e-commerce finance with quick approval',
                'urgent capital for e-commerce growth',
                'quick business loans for online stores'
            ],
            '/financing-options/startup-loans': [
                'UK startup loans',
                'business funding for new ventures',
                'early-stage business loan options',
                'startup financing solutions',
                'government backed startup loans'
            ],
            '/financing-options/stock-and-inventory-finance-for-e-commerce': [
                'inventory finance for e-commerce',
                'stock funding solutions',
                'finance for online store inventory',
                'e-commerce stock financing',
                'flexible inventory funding options'
            ],
            '/post/best-unsecured-business-loans-for-uk-smes': [
                'best unsecured business loans UK SMEs',
                'top unsecured loan options for SMEs',
                'UK unsecured funding sources',
                'unsecured finance comparison for SMEs',
                'high-approval unsecured business loans'
            ],
            '/post/lombard-asset-finance-vs-close-brothers-asset-finance': [
                'Lombard vs Close Brothers asset finance',
                'asset finance comparison UK',
                'choosing asset finance providers',
                'asset finance lenders evaluated',
                'UK business asset finance options'
            ],
            '/post/outfund-vs-uncapped': [
                'Outfund vs Uncapped comparison',
                'revenue-based finance options',
                'Outfund and Uncapped review',
                'compare alternative finance providers',
                'growth finance comparison UK'
            ],
            '/post/top-10-bad-credit-business-loan-lenders-in-the-uk': [
                'bad credit business loan lenders UK',
                'top lenders for bad credit business loans',
                'business funding with poor credit',
                'UK loan options for bad business credit',
                'lenders accepting low credit scores'
            ],
            '/post/top-10-business-loan-lenders-using-ai-uk': [
                'top AI-powered business loan lenders UK',
                'business loan lenders using tech',
                'UK AI loan platforms comparison',
                'tech-enhanced business finance providers',
                'best AI lending platforms for SMEs'
            ],
            '/post/top-asset-finance-lenders-for-it-support-companies-uk': [
                'asset finance lenders for IT support firms',
                'top UK asset finance options for IT businesses',
                'IT support asset financing',
                'business equipment finance for tech companies',
                'finance solutions for IT service providers'
            ],
            '/post/wayflyer-alternatives': [
                'Wayflyer alternatives',
                'alternative revenue-based finance options',
                'similar funding platforms to Wayflyer',
                'review of Wayflyer competitors',
                'compare Wayflyer to other finance solutions'
            ],
            '/post/what-is-funding-agent': [
                'what is Funding Agent',
                'how Funding Agent works',
                'Funding Agent explained',
                'business finance broker overview',
                'UK funding platform introduction'
            ]
        };

        // Initialize with the provided list of pages
        const pageUrls = [
            '/calculator/business-loan-calculator',
            '/financing-options/business-debt-consolidation-loans',
            '/financing-options/business-line-of-credit-for-care-homes-and-home-care-providers',
            '/financing-options/mca-loans',
            '/financing-options/same-day-business-loans',
            '/financing-options/same-day-business-loans-for-e-commerce',
            '/financing-options/startup-loans',
            '/financing-options/stock-and-inventory-finance-for-e-commerce',
            '/post/best-unsecured-business-loans-for-uk-smes',
            '/post/lombard-asset-finance-vs-close-brothers-asset-finance',
            '/post/outfund-vs-uncapped',
            '/post/top-10-bad-credit-business-loan-lenders-in-the-uk',
            '/post/top-10-business-loan-lenders-using-ai-uk',
            '/post/top-asset-finance-lenders-for-it-support-companies-uk',
            '/post/wayflyer-alternatives',
            '/post/what-is-funding-agent'
        ];

        // Load from localStorage if available, otherwise initialize with defaults
        const saved = localStorage.getItem('inboundPages');
        if (saved) {
            try {
                const savedPages = JSON.parse(saved);
                // Merge saved data with anchor data (preserve live status if exists)
                return savedPages.map(page => {
                    const defaultAnchors = anchorData[page.url] || [];
                    // If anchors exist in saved data, merge with defaults, otherwise use defaults
                    if (page.anchors && page.anchors.length > 0) {
                        // Check if anchors have live status, if not, add it
                        const mergedAnchors = defaultAnchors.map(anchor => {
                            const existing = page.anchors.find(a => 
                                (typeof a === 'string' ? a : a.text) === anchor
                            );
                            if (existing) {
                                return typeof existing === 'string' 
                                    ? { text: existing, live: true }
                                    : existing;
                            }
                            return { text: anchor, live: true };
                        });
                        return { ...page, anchors: mergedAnchors };
                    }
                    return {
                        ...page,
                        anchors: defaultAnchors.map(text => ({ text, live: true }))
                    };
                });
            } catch (e) {
                console.error('Error loading saved pages:', e);
            }
        }

        // Initialize with default structure including anchors
        return pageUrls.map(url => ({
            url: url,
            date: new Date().toISOString().split('T')[0],
            inbounds: [],
            keywords: [],
            anchors: (anchorData[url] || []).map(text => ({ text, live: true })),
            customCTA: '',
            technicalSEOScore: '',
            mobileOptimization: '',
            internalLinks: [],
            externalBackLinks: [],
            serpFeaturesTargeted: [],
            complimentaryContent: [],
            updatesAddContent: '',
            medium: []
        }));
    }

    savePages() {
        localStorage.setItem('inboundPages', JSON.stringify(this.pages));
    }

    setupEventListeners() {
        // Modal close events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelModal').addEventListener('click', () => this.closeModal());
        document.getElementById('saveModal').addEventListener('click', () => this.saveModalData());

        // Close modal on background click
        document.getElementById('cellModal').addEventListener('click', (e) => {
            if (e.target.id === 'cellModal') {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cellModal').classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    renderTable() {
        const tbody = document.getElementById('inboundTableBody');
        tbody.innerHTML = '';

        this.pages.forEach((page, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.05}s`;
            row.dataset.pageIndex = index;
            
            // Page URL with expand button - make this column wider
            const firstColWidth = this.columnWidths[0] || 300;
            row.innerHTML = `
                <td style="width: ${firstColWidth}px; min-width: ${firstColWidth}px;">
                    <button class="row-expand-btn" data-index="${index}" title="Expand row">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <span class="page-url" title="${page.url}">${page.url}</span>
                </td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="date">${page.date || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="inbounds">${this.formatArray(page.inbounds) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="keywords">${this.formatArray(page.keywords) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="anchors">${this.formatArray(page.anchors) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="customCTA">${page.customCTA || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="technicalSEOScore">${page.technicalSEOScore || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="mobileOptimization">${page.mobileOptimization || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="internalLinks">${this.formatArray(page.internalLinks) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="externalBackLinks">${this.formatArray(page.externalBackLinks) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="serpFeaturesTargeted">${this.formatArray(page.serpFeaturesTargeted) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="complimentaryContent">${this.formatArray(page.complimentaryContent) || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="updatesAddContent">${page.updatesAddContent || '<span class="empty">Click to add</span>'}</span></td>
                <td><span class="cell-content expandable" data-index="${index}" data-column="medium">${this.formatArray(page.medium) || '<span class="empty">Click to add</span>'}</span></td>
            `;

            // Apply column widths to cells
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                if (this.columnWidths[cellIndex]) {
                    const width = this.columnWidths[cellIndex] + 'px';
                    cell.style.width = width;
                    cell.style.minWidth = width;
                }
            });

            // Add expandable row content
            const expandedContent = document.createElement('tr');
            expandedContent.className = 'expanded-row';
            expandedContent.innerHTML = `
                <td colspan="14">
                    <div class="expanded-row-content" id="expandedContent-${index}">
                        <div class="expanded-cell-grid">
                            ${this.generateExpandedView(page, index)}
                        </div>
                    </div>
                </td>
            `;
            expandedContent.style.display = 'none';

            // Add click listeners to expandable cells
            row.querySelectorAll('.expandable').forEach(cell => {
                cell.addEventListener('click', () => {
                    const index = parseInt(cell.dataset.index);
                    const column = cell.dataset.column;
                    this.openModal(index, column);
                });
            });

            // Add expand button listener
            const expandBtn = row.querySelector('.row-expand-btn');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleRowExpand(index, expandBtn, expandedContent);
            });

            tbody.appendChild(row);
            tbody.appendChild(expandedContent);
        });

        // Re-apply column widths after rendering
        setTimeout(() => {
            this.applyColumnWidths();
        }, 100);
    }

    generateExpandedView(page, index) {
        const columns = [
            { key: 'date', label: 'Date', value: page.date || 'Not set' },
            { key: 'inbounds', label: 'Inbounds', value: this.formatArrayForExpanded(page.inbounds) },
            { key: 'keywords', label: 'Keywords', value: this.formatArrayForExpanded(page.keywords) },
            { key: 'anchors', label: 'Anchors', value: this.formatAnchorsForExpanded(page.anchors) },
            { key: 'customCTA', label: 'Custom CTA', value: page.customCTA || 'Not set' },
            { key: 'technicalSEOScore', label: 'Technical SEO Score', value: page.technicalSEOScore || 'Not set' },
            { key: 'mobileOptimization', label: 'Mobile Optimization', value: page.mobileOptimization || 'Not set' },
            { key: 'internalLinks', label: 'Internal Links', value: this.formatArrayForExpanded(page.internalLinks) },
            { key: 'externalBackLinks', label: 'External BackLinks', value: this.formatArrayForExpanded(page.externalBackLinks) },
            { key: 'serpFeaturesTargeted', label: 'SERP Features', value: this.formatArrayForExpanded(page.serpFeaturesTargeted) },
            { key: 'complimentaryContent', label: 'Complimentary Content', value: this.formatArrayForExpanded(page.complimentaryContent) },
            { key: 'updatesAddContent', label: 'Updates/Add Content', value: page.updatesAddContent || 'Not set' },
            { key: 'medium', label: 'Medium', value: this.formatArrayForExpanded(page.medium) }
        ];

        return columns.map(col => `
            <div class="expanded-cell-item" data-column="${col.key}" data-index="${index}">
                <h4>${col.label}</h4>
                <p>${col.value}</p>
            </div>
        `).join('');
    }

    formatArrayForExpanded(arr) {
        if (!arr || arr.length === 0) return 'None';
        
        // Handle complimentary content (objects with url and type)
        if (arr.length > 0 && typeof arr[0] === 'object' && ('url' in arr[0] || 'type' in arr[0]) && !('text' in arr[0])) {
            return arr.map(item => {
                const url = item.url || '';
                const type = item.type || '';
                if (url && type) {
                    return `<strong>${type}:</strong> <span style="color: #4a9eff;">${url}</span>`;
                } else if (type) {
                    return type;
                }
                return '';
            }).filter(Boolean).join('<br>') || 'None';
        }
        
        if (typeof arr[0] === 'object' && 'text' in arr[0]) {
            return arr.map(a => a.text || a).join(', ');
        }
        return arr.join(', ');
    }

    formatAnchorsForExpanded(anchors) {
        if (!anchors || anchors.length === 0) return 'None';
        const normalized = anchors.map(a => typeof a === 'string' ? { text: a, live: true } : a);
        const live = normalized.filter(a => a.live).map(a => a.text);
        const inactive = normalized.filter(a => !a.live).map(a => a.text);
        let result = live.length > 0 ? `Live: ${live.join(', ')}` : '';
        if (inactive.length > 0) {
            result += (result ? '<br>' : '') + `Inactive: <span style="text-decoration: line-through; opacity: 0.6;">${inactive.join(', ')}</span>`;
        }
        return result || 'None';
    }

    toggleRowExpand(index, btn, expandedRow) {
        const expandedContent = expandedRow.querySelector('.expanded-row-content');
        const isExpanded = expandedContent.classList.contains('active');
        
        if (isExpanded) {
            expandedContent.classList.remove('active');
            btn.classList.remove('expanded');
            expandedRow.style.display = 'none';
            btn.closest('tr').classList.remove('expanded');
        } else {
            expandedContent.classList.add('active');
            btn.classList.add('expanded');
            expandedRow.style.display = 'table-row';
            btn.closest('tr').classList.add('expanded');
        }
    }

    formatArray(arr) {
        if (!arr || arr.length === 0) return '';
        
        // Special handling for complimentary content (objects with url and type)
        const isComplimentaryArray = arr.length > 0 && 
            typeof arr[0] === 'object' && 
            ('url' in arr[0] || 'type' in arr[0]) &&
            !('text' in arr[0]) && !('live' in arr[0]);
        
        if (isComplimentaryArray) {
            const displayItems = arr.slice(0, 3).map(item => {
                const url = item.url || '';
                const type = item.type || '';
                if (url && type) {
                    return `<span class="complimentary-display">${type}: <span class="page-url">${url}</span></span>`;
                } else if (type) {
                    return `<span class="complimentary-display">${type}</span>`;
                }
                return '';
            }).filter(Boolean).join(', ');
            
            if (arr.length <= 3) {
                return displayItems || '<span class="empty">Click to add</span>';
            }
            return displayItems + ` (+${arr.length - 3} more)`;
        }
        
        // Handle anchor objects with live status
        const isAnchorArray = arr.length > 0 && typeof arr[0] === 'object' && 'text' in arr[0];
        
        if (isAnchorArray) {
            const liveCount = arr.filter(a => a.live).length;
            const displayItems = arr.slice(0, 3).map(a => {
                const text = a.text || a;
                const live = a.live !== false;
                return live ? `<span class="anchor-live">${text}</span>` : `<span class="anchor-inactive">${text}</span>`;
            }).join(', ');
            
            if (arr.length <= 3) {
                return displayItems + (liveCount < arr.length ? ` <span style="color: #999;">(${liveCount}/${arr.length} live)</span>` : '');
            }
            return displayItems + ` (+${arr.length - 3} more)` + (liveCount < arr.length ? ` <span style="color: #999;">(${liveCount}/${arr.length} live)</span>` : '');
        }
        
        // Regular array formatting
        if (arr.length <= 3) return arr.join(', ');
        return arr.slice(0, 3).join(', ') + ` (+${arr.length - 3} more)`;
    }

    openModal(pageIndex, column) {
        this.currentModal.pageIndex = pageIndex;
        this.currentModal.column = column;
        this.currentModal.data = { ...this.pages[pageIndex] };

        const modal = document.getElementById('cellModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        // Set modal title
        const columnNames = {
            date: 'Date',
            inbounds: 'Inbounds',
            keywords: 'Keywords',
            anchors: 'Anchors',
            customCTA: 'Custom CTA',
            technicalSEOScore: 'Technical SEO Score',
            mobileOptimization: 'Mobile Optimization',
            internalLinks: 'Internal Links',
            externalBackLinks: 'External BackLinks',
            serpFeaturesTargeted: 'SERP Features Targeted',
            complimentaryContent: 'Complimentary Content',
            updatesAddContent: 'Updates/Add Content',
            medium: 'Medium'
        };

        modalTitle.textContent = `${columnNames[column]} - ${this.pages[pageIndex].url}`;

        // Generate modal content based on column type
        modalBody.innerHTML = this.generateModalContent(column, this.currentModal.data);

        // Attach event listeners for complimentary content if needed
        if (column === 'complimentaryContent') {
            this.attachComplimentaryEventListeners();
        }

        modal.classList.add('active');
    }

    attachComplimentaryEventListeners() {
        const addBtn = document.getElementById('addComplimentaryBtn');
        if (addBtn) {
            // Remove any existing listeners
            const newBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newBtn, addBtn);
            
            // Attach new listener
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const urlInput = document.getElementById('newComplimentaryUrl');
                const typeSelect = document.getElementById('newComplimentaryType');
                const tagValues = document.getElementById('tagValues');
                
                if (!urlInput || !typeSelect || !tagValues) {
                    console.error('Missing elements for complimentary content');
                    return;
                }
                
                const url = urlInput.value.trim();
                const type = typeSelect.value.trim();
                
                if (!type) {
                    alert('Please select a content type');
                    return;
                }
                
                try {
                    const items = JSON.parse(tagValues.textContent);
                    items.push({ url: url, type: type });
                    tagValues.textContent = JSON.stringify(items);
                    
                    // Re-render the list
                    const modalBody = document.getElementById('modalBody');
                    modalBody.innerHTML = this.generateComplimentaryContentField(items);
                    
                    // Re-attach listeners after re-render
                    this.attachComplimentaryEventListeners();
                    
                    urlInput.value = '';
                    typeSelect.value = '';
                } catch (error) {
                    console.error('Error adding complimentary content:', error);
                    alert('Error adding content. Please try again.');
                }
            });
        }
    }

    generateModalContent(column, data) {
        const page = this.pages[this.currentModal.pageIndex];

        switch (column) {
            case 'date':
                return `
                    <div class="cell-modal-field">
                        <label>Date</label>
                        <input type="date" id="modalInput" value="${data.date || ''}">
                    </div>
                `;

            case 'inbounds':
            case 'keywords':
            case 'internalLinks':
            case 'externalBackLinks':
            case 'serpFeaturesTargeted':
            case 'medium':
                return this.generateArrayField(column, data[column] || []);
            
            case 'anchors':
                return this.generateAnchorsField(data.anchors || []);
            
            case 'complimentaryContent':
                // Ensure we have an array
                const compContent = Array.isArray(data.complimentaryContent) ? data.complimentaryContent : [];
                return this.generateComplimentaryContentField(compContent);
            
            case 'customCTA':
            case 'updatesAddContent':
                return `
                    <div class="cell-modal-field">
                        <label>${column === 'customCTA' ? 'Custom CTA' : 'Updates/Add Content'}</label>
                        <textarea id="modalInput" placeholder="Enter details...">${data[column] || ''}</textarea>
                    </div>
                `;
            
            case 'technicalSEOScore':
                return `
                    <div class="cell-modal-field">
                        <label>Technical SEO Score</label>
                        <input type="text" id="modalInput" placeholder="e.g., 85/100" value="${data.technicalSEOScore || ''}">
                    </div>
                `;
            
            case 'mobileOptimization':
                return `
                    <div class="cell-modal-field">
                        <label>Mobile Optimization</label>
                        <select id="modalInput">
                            <option value="">Select status</option>
                            <option value="Optimized" ${data.mobileOptimization === 'Optimized' ? 'selected' : ''}>Optimized</option>
                            <option value="Needs Work" ${data.mobileOptimization === 'Needs Work' ? 'selected' : ''}>Needs Work</option>
                            <option value="Not Optimized" ${data.mobileOptimization === 'Not Optimized' ? 'selected' : ''}>Not Optimized</option>
                        </select>
                    </div>
                `;
            
            default:
                return '<p>No editor available for this field.</p>';
        }
    }

    generateArrayField(column, values) {
        const fieldNames = {
            inbounds: 'Inbounds',
            keywords: 'Keywords',
            anchors: 'Anchors',
            internalLinks: 'Internal Links',
            externalBackLinks: 'External BackLinks',
            serpFeaturesTargeted: 'SERP Features Targeted',
            medium: 'Medium'
        };

        const mediumOptions = ['Tool', 'Text', 'Voice', 'Video'];
        const serpOptions = ['Featured Snippet', 'People Also Ask', 'Image Pack', 'Video Results', 'Local Pack', 'Knowledge Panel'];
        const complimentaryOptions = ['Data Blog', 'What is', 'Who is', 'How to', 'Pro and Cons'];

        let options = [];
        if (column === 'medium') options = mediumOptions;
        if (column === 'serpFeaturesTargeted') options = serpOptions;
        if (column === 'complimentaryContent') options = complimentaryOptions;

        const tagsHtml = values.map((val, idx) => `
            <span class="tag">
                ${val}
                <span class="remove-tag" data-index="${idx}">×</span>
            </span>
        `).join('');

        let inputHtml = '';
        if (options.length > 0) {
            inputHtml = `
                <select id="newTagInput" style="width: auto; display: inline-block; margin-right: 8px;">
                    <option value="">Select option</option>
                    ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
        } else {
            inputHtml = `<input type="text" id="newTagInput" placeholder="Add new ${fieldNames[column].toLowerCase()}" style="width: auto; display: inline-block; margin-right: 8px;">`;
        }

        return `
            <div class="cell-modal-field">
                <label>${fieldNames[column]}</label>
                <div class="tag-list" id="tagList">
                    ${tagsHtml}
                </div>
                <div class="tag-input">
                    ${inputHtml}
                    <button class="add-tag-btn" id="addTagBtn">Add</button>
                </div>
            </div>
            <div id="tagValues" style="display: none;">${JSON.stringify(values)}</div>
        `;
    }

    generateComplimentaryContentField(values) {
        // Normalize values to object format {url, type}
        const normalized = values.map(v => {
            if (typeof v === 'string') {
                // Legacy format - just type, no URL
                return { url: '', type: v };
            }
            return { url: v.url || '', type: v.type || v };
        });

        const options = ['Data Blog', 'What is', 'Who is', 'How to', 'Pro and Cons'];
        
        const itemsHtml = normalized.map((item, idx) => `
            <div class="complimentary-item" data-index="${idx}" style="margin-bottom: 12px; padding: 12px; background: rgba(26, 26, 26, 0.5); border-radius: 8px; border-left: 3px solid #ff6b35;">
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="text" class="complimentary-url" data-index="${idx}" 
                        placeholder="Page URL (e.g., /post/example)" 
                        value="${item.url || ''}" 
                        style="flex: 2; min-width: 200px; padding: 10px; background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.9rem; font-family: inherit; width: 100%; box-sizing: border-box;">
                    <select class="complimentary-type" data-index="${idx}" 
                        style="flex: 1; min-width: 150px; padding: 10px; background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.9rem; font-family: inherit; cursor: pointer;">
                        <option value="">Select type</option>
                        ${options.map(opt => `<option value="${opt}" ${item.type === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                    <button class="remove-tag" data-index="${idx}" style="flex-shrink: 0; background: #ff6b35; color: white; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; line-height: 1;">×</button>
                </div>
            </div>
        `).join('');

        return `
            <div class="cell-modal-field">
                <label>Complimentary Content</label>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 15px;">Add page URLs with their content types (Data Blog, What is, Who is, How to, Pro and Cons)</p>
                <div id="complimentaryList">
                    ${itemsHtml}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #3a3a3a;">
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <input type="text" id="newComplimentaryUrl" 
                            placeholder="Page URL (e.g., /post/example)" 
                            style="flex: 2; min-width: 200px; padding: 12px; background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 8px; color: #fff; font-size: 0.9rem; font-family: inherit; width: 100%; box-sizing: border-box;">
                        <select id="newComplimentaryType" 
                            style="flex: 1; min-width: 150px; padding: 12px; background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 8px; color: #fff; font-size: 0.9rem; font-family: inherit; cursor: pointer;">
                            <option value="">Select type</option>
                            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                        <button class="add-tag-btn" id="addComplimentaryBtn" style="flex-shrink: 0;">Add</button>
                    </div>
                </div>
            </div>
            <div id="tagValues" style="display: none;">${JSON.stringify(normalized)}</div>
        `;
    }

    generateAnchorsField(anchors) {
        // Normalize anchors to object format
        const normalizedAnchors = anchors.map(a => {
            if (typeof a === 'string') {
                return { text: a, live: true };
            }
            return { text: a.text || a, live: a.live !== false };
        });

        const anchorsHtml = normalizedAnchors.map((anchor, idx) => `
            <div class="anchor-item" data-index="${idx}">
                <label class="anchor-toggle">
                    <input type="checkbox" ${anchor.live ? 'checked' : ''} class="anchor-live-checkbox" data-index="${idx}">
                    <span class="anchor-text ${anchor.live ? 'live' : 'inactive'}">${anchor.text}</span>
                </label>
            </div>
        `).join('');

        return `
            <div class="cell-modal-field">
                <label>Anchors</label>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 10px;">Toggle anchors to mark them as live (active) or inactive</p>
                <div class="anchors-list" id="anchorsList">
                    ${anchorsHtml}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #3a3a3a;">
                    <input type="text" id="newAnchorInput" placeholder="Add new anchor phrase" style="width: 70%; margin-right: 8px;">
                    <button class="add-tag-btn" id="addAnchorBtn">Add Anchor</button>
                </div>
            </div>
            <div id="tagValues" style="display: none;">${JSON.stringify(normalizedAnchors)}</div>
        `;
    }

    closeModal() {
        document.getElementById('cellModal').classList.remove('active');
        this.currentModal = {
            pageIndex: null,
            column: null,
            data: null
        };
    }

    saveModalData() {
        const pageIndex = this.currentModal.pageIndex;
        const column = this.currentModal.column;
        
        if (pageIndex === null || column === null) return;

        const input = document.getElementById('modalInput');
        const tagValues = document.getElementById('tagValues');

        if (tagValues) {
            // Array field (including anchors)
            const values = JSON.parse(tagValues.textContent);
            this.pages[pageIndex][column] = values;
        } else if (input) {
            // Single value field
            const value = input.type === 'date' ? input.value : input.value.trim();
            this.pages[pageIndex][column] = value;
        }

        this.savePages();
        this.renderTable();
        this.closeModal();
    }

    // Expose method for tag management
    updateTagValues(values) {
        const tagValues = document.getElementById('tagValues');
        if (tagValues) {
            tagValues.textContent = JSON.stringify(values);
        }
    }
}

// Helper function to render tags
function renderTags(tagList, values) {
    const tagValues = document.getElementById('tagValues');
    if (tagValues) {
        tagValues.textContent = JSON.stringify(values);
    }
    
    const tagsHtml = values.map((val, idx) => `
        <span class="tag">
            ${val}
            <span class="remove-tag" data-index="${idx}">×</span>
        </span>
    `).join('');
    tagList.innerHTML = tagsHtml;
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new InboundPagesDashboard();
    window.inboundDashboard = dashboard; // Store globally for event handlers
    
    // Setup tag management for array fields using event delegation
    document.addEventListener('click', (e) => {
        if (e.target.id === 'addComplimentaryBtn' || e.target.closest('#addComplimentaryBtn')) {
            e.preventDefault();
            e.stopPropagation();
            
            const urlInput = document.getElementById('newComplimentaryUrl');
            const typeSelect = document.getElementById('newComplimentaryType');
            const tagValues = document.getElementById('tagValues');
            const list = document.getElementById('complimentaryList');
            
            if (!urlInput || !typeSelect || !tagValues || !list) {
                console.error('Missing elements:', { urlInput, typeSelect, tagValues, list });
                return;
            }
            
            const url = urlInput.value.trim();
            const type = typeSelect.value.trim();
            
            if (!type) {
                alert('Please select a content type');
                return;
            }
            
            try {
                const items = JSON.parse(tagValues.textContent);
                items.push({ url: url, type: type });
                tagValues.textContent = JSON.stringify(items);
                
                // Re-render the list
                const pageIndex = dashboard.currentModal.pageIndex;
                if (pageIndex !== null) {
                    const modalBody = document.getElementById('modalBody');
                    modalBody.innerHTML = dashboard.generateComplimentaryContentField(items);
                }
                
                urlInput.value = '';
                typeSelect.value = '';
            } catch (error) {
                console.error('Error adding complimentary content:', error);
                alert('Error adding content. Please try again.');
            }
            return;
        }
        
        if (e.target.id === 'addTagBtn') {
            const input = document.getElementById('newTagInput');
            const tagList = document.getElementById('tagList');
            const tagValues = document.getElementById('tagValues');
            
            if (!input || !tagList || !tagValues) return;
            
            const newValue = input.value.trim();
            if (!newValue) return;
            
            const values = JSON.parse(tagValues.textContent);
            if (values.includes(newValue)) {
                alert('This value already exists');
                return;
            }
            
            values.push(newValue);
            renderTags(tagList, values);
            input.value = '';
        }
        
        if (e.target.id === 'addAnchorBtn') {
            const input = document.getElementById('newAnchorInput');
            const anchorsList = document.getElementById('anchorsList');
            const tagValues = document.getElementById('tagValues');
            
            if (!input || !anchorsList || !tagValues) return;
            
            const newAnchor = input.value.trim();
            if (!newAnchor) return;
            
            const anchors = JSON.parse(tagValues.textContent);
            if (anchors.some(a => (a.text || a) === newAnchor)) {
                alert('This anchor already exists');
                return;
            }
            
            anchors.push({ text: newAnchor, live: true });
            tagValues.textContent = JSON.stringify(anchors);
            
            const anchorHtml = `
                <div class="anchor-item" data-index="${anchors.length - 1}">
                    <label class="anchor-toggle">
                        <input type="checkbox" checked class="anchor-live-checkbox" data-index="${anchors.length - 1}">
                        <span class="anchor-text live">${newAnchor}</span>
                    </label>
                </div>
            `;
            anchorsList.insertAdjacentHTML('beforeend', anchorHtml);
            input.value = '';
        }
        
        if (e.target.classList.contains('remove-tag')) {
            const idx = parseInt(e.target.dataset.index);
            const tagValues = document.getElementById('tagValues');
            const tagList = document.getElementById('tagList');
            const complimentaryList = document.getElementById('complimentaryList');
            
            if (complimentaryList) {
                // Handle complimentary content removal
                if (!tagValues) return;
                const items = JSON.parse(tagValues.textContent);
                items.splice(idx, 1);
                tagValues.textContent = JSON.stringify(items);
                
                // Re-render the list
                const pageIndex = dashboard.currentModal.pageIndex;
                if (pageIndex !== null) {
                    const modalBody = document.getElementById('modalBody');
                    modalBody.innerHTML = dashboard.generateComplimentaryContentField(items);
                }
                return;
            }
            
            if (!tagValues || !tagList) return;
            
            const values = JSON.parse(tagValues.textContent);
            values.splice(idx, 1);
            renderTags(tagList, values);
        }
    });

    // Handle updating existing complimentary items
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('complimentary-url') || e.target.classList.contains('complimentary-type')) {
            const idx = parseInt(e.target.dataset.index);
            const tagValues = document.getElementById('tagValues');
            if (!tagValues) return;
            
            const items = JSON.parse(tagValues.textContent);
            if (e.target.classList.contains('complimentary-url')) {
                items[idx].url = e.target.value;
            } else {
                items[idx].type = e.target.value;
            }
            tagValues.textContent = JSON.stringify(items);
        }
    });

    // Handle anchor live toggle
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('anchor-live-checkbox')) {
            const idx = parseInt(e.target.dataset.index);
            const tagValues = document.getElementById('tagValues');
            const anchorText = e.target.nextElementSibling;
            
            if (!tagValues) return;
            
            const anchors = JSON.parse(tagValues.textContent);
            anchors[idx].live = e.target.checked;
            tagValues.textContent = JSON.stringify(anchors);
            
            // Update visual state
            if (e.target.checked) {
                anchorText.classList.remove('inactive');
                anchorText.classList.add('live');
            } else {
                anchorText.classList.remove('live');
                anchorText.classList.add('inactive');
            }
        }
    });
});

