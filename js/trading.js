// Trading Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const priceChart = document.getElementById('priceChart');
    const projectSelect = document.getElementById('projectSelect');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price');
    const orderTotal = document.getElementById('orderTotal');
    const orderForm = document.getElementById('orderForm');
    const buyOrders = document.getElementById('buyOrders');
    const sellOrders = document.getElementById('sellOrders');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const portfolioValue = document.getElementById('portfolioValue');
    const cctOwned = document.getElementById('cctOwned');
    const environmentalImpact = document.getElementById('environmentalImpact');
    const holdingsTableBody = document.getElementById('holdingsTableBody');
    
    // Blockchain Elements
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletStatus = document.getElementById('walletStatus');
    const tokenBalance = document.getElementById('tokenBalance');
    const transferForm = document.getElementById('transferForm');
    const retireForm = document.getElementById('retireForm');
    const retireProject = document.getElementById('retireProject');
    
    // State
    let currentView = 'grid';
    let currentPage = 1;
    let projectsPerPage = 9;
    let allProjects = [];
    let filteredProjects = [];
    let blockchain = null;
    let userHoldings = [];
    
    // Initialize
    initializePriceChart();
    loadProjects();
    setupOrderForm();
    setupOrderBook();
    loadPortfolio();
    setupOrderBookTabs();
    setupBlockchainIntegration();
    
    // Initialize Price Chart
    function initializePriceChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(46, 204, 113, 0.2)');
        gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price per Credit',
                    data: [],
                    borderColor: '#2ECC71',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#2ECC71',
                    pointHoverBorderColor: '#fff',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            color: '#888'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        // Initialize with 24H data
        updateChartData('24H');

        // Add event listeners for timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                selectedTimeframe = button.textContent;
                updateChartData(selectedTimeframe);
            });
        });
    }

    function updateChartData(timeframe) {
        const now = new Date();
        const data = [];
        const labels = [];
        let points;
        let interval;

        switch(timeframe) {
            case '24H':
                points = 24;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '7D':
                points = 7;
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            case '30D':
                points = 30;
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
        }

        for (let i = points - 1; i >= 0; i--) {
            const time = new Date(now - (i * interval));
            labels.push(formatTimeLabel(time, timeframe));
            
            // Generate realistic-looking price data
            const basePrice = 25; // Base price of $25
            const volatility = 0.1; // 10% volatility
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            const price = basePrice * (1 + randomChange);
            data.push(price);
        }

        priceChart.data.labels = labels;
        priceChart.data.datasets[0].data = data;
        priceChart.update();
    }

    function formatTimeLabel(date, timeframe) {
        switch(timeframe) {
            case '24H':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '7D':
                return date.toLocaleDateString([], { weekday: 'short' });
            case '30D':
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    // Update chart data every minute for real-time effect
    setInterval(() => {
        if (priceChart) {
            updateChartData(selectedTimeframe);
        }
    }, 60000);

    // Load Projects
    async function loadProjects() {
        try {
            // First try to load from blockchain if connected
            if (blockchain && blockchain.isConnected) {
                try {
                    const blockchainProjects = await blockchain.getAllProjects();
                    if (blockchainProjects && blockchainProjects.length > 0) {
                        allProjects = blockchainProjects.map(project => ({
                            id: project.id,
                            title: project.name,
                            location: project.location,
                            type: project.projectType,
                            standard: project.certificationStandard,
                            carbonReduction: project.carbonReduction,
                            price: generateRandomPrice(),
                            image: getProjectImage(project.projectType),
                            verified: project.verified,
                            tokenAmount: project.tokenAmount
                        }));
                    } else {
                        // Fallback to simulated data if no blockchain projects
                        allProjects = await fetchProjects();
                    }
                } catch (error) {
                    console.error('Error loading blockchain projects:', error);
                    // Fallback to simulated data
                    allProjects = await fetchProjects();
                }
            } else {
                // Use simulated data if blockchain not connected
                allProjects = await fetchProjects();
            }
            
            filteredProjects = [...allProjects];
            
            // Populate project select dropdown
            populateProjectSelect();
            
            // Populate retire project dropdown
            populateRetireProjectSelect();
            
            // Display projects
            displayProjects();
        } catch (error) {
            handleError(error);
        }
    }

    // Populate project select dropdown
    function populateProjectSelect() {
        projectSelect.innerHTML = '<option value="">Select a project</option>';
        
        allProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.title} (${project.type})`;
            projectSelect.appendChild(option);
        });
    }

    // Populate retire project dropdown
    function populateRetireProjectSelect() {
        retireProject.innerHTML = '<option value="">Select a project</option>';
        
        allProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.title} (${project.type})`;
            retireProject.appendChild(option);
        });
    }

    // Setup Order Form
    function setupOrderForm() {
        // Calculate total when quantity or price changes
        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
        
        // Handle form submission
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const orderType = document.getElementById('orderType').value;
            const projectId = projectSelect.value;
            const quantity = parseInt(quantityInput.value);
            const price = parseFloat(priceInput.value);
            
            if (!projectId) {
                showAlert('Please select a project', 'error');
                return;
            }
            
            try {
                // If blockchain is connected, handle the order through the blockchain
                if (blockchain && blockchain.isConnected) {
                    if (orderType === 'buy') {
                        // For buy orders, we need to check if there are enough tokens available
                        const project = allProjects.find(p => p.id.toString() === projectId);
                        if (!project) {
                            showAlert('Project not found', 'error');
                            return;
                        }
                        
                        // Check if the project has enough tokens
                        if (parseInt(project.tokenAmount) < quantity) {
                            showAlert('Not enough tokens available for this project', 'error');
                            return;
                        }
                        
                        // In a real implementation, this would create a buy order on the blockchain
                        // For now, we'll simulate it
                        showAlert(`Buy order placed for ${quantity} CCT from ${project.title}`, 'success');
                    } else {
                        // For sell orders, we need to check if the user has enough tokens
                        const userBalance = await blockchain.getBalance();
                        if (parseInt(userBalance) < quantity) {
                            showAlert('You do not have enough CCT tokens to sell', 'error');
                            return;
                        }
                        
                        // In a real implementation, this would create a sell order on the blockchain
                        // For now, we'll simulate it
                        showAlert(`Sell order placed for ${quantity} CCT`, 'success');
                    }
                } else {
                    // Simulate order placement without blockchain
                    showAlert(`${orderType.charAt(0).toUpperCase() + orderType.slice(1)} order placed for ${quantity} credits`, 'success');
                }
                
                // Reset form
                orderForm.reset();
                calculateTotal();
                
                // Refresh order book
                loadOrderBook();
            } catch (error) {
                handleError(error);
            }
        });
    }
    
    // Calculate total order value
    function calculateTotal() {
        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;
        orderTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Setup Order Book
    function setupOrderBook() {
        loadOrderBook();
        
        // Refresh order book every 30 seconds
        setInterval(loadOrderBook, 30000);
    }

    // Load Order Book
    async function loadOrderBook() {
        try {
            // In a real implementation, this would fetch orders from the blockchain
            // For now, we'll use simulated data
            const orders = await fetchOrders();
            
            // Clear existing orders
            buyOrders.innerHTML = '';
            sellOrders.innerHTML = '';
            
            // Add buy orders
            orders.buy.forEach(order => {
                buyOrders.appendChild(createOrderRow(order));
            });
            
            // Add sell orders
            orders.sell.forEach(order => {
                sellOrders.appendChild(createOrderRow(order));
            });
        } catch (error) {
            handleError(error);
        }
    }

    // Create Order Row
    function createOrderRow(order) {
        const row = document.createElement('div');
        row.classList.add('order-row');
        
        row.innerHTML = `
            <div class="order-project">${order.project}</div>
            <div class="order-quantity">${order.quantity}</div>
            <div class="order-price">$${order.price.toFixed(2)}</div>
            <div class="order-total">$${(order.quantity * order.price).toFixed(2)}</div>
            <div class="order-actions">
                <button class="btn btn-sm btn-primary fill-order" data-order-id="${order.id}">Fill</button>
            </div>
        `;
        
        // Add event listener to fill button
        const fillButton = row.querySelector('.fill-order');
        fillButton.addEventListener('click', () => fillOrder(order.id));
        
        return row;
    }

    // Setup Order Book Tabs
    function setupOrderBookTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding order list
                const tab = button.getAttribute('data-tab');
                if (tab === 'buy') {
                    buyOrders.style.display = 'block';
                    sellOrders.style.display = 'none';
                } else {
                    buyOrders.style.display = 'none';
                    sellOrders.style.display = 'block';
                }
            });
        });
    }

    // Load Portfolio
    async function loadPortfolio() {
        try {
            // If blockchain is connected, load real holdings
            if (blockchain && blockchain.isConnected) {
                try {
                    const balance = await blockchain.getBalance();
                    cctOwned.textContent = balance;
                    
                    // Calculate portfolio value (assuming $25 per token)
                    const value = parseFloat(balance) * 25;
                    portfolioValue.textContent = `$${value.toFixed(2)}`;
                    
                    // Calculate environmental impact (1 token = 1 ton CO2e)
                    environmentalImpact.textContent = `${balance} tons CO2e`;
                    
                    // For a real implementation, we would track which projects the tokens came from
                    // For now, we'll simulate holdings
                    userHoldings = [
                        {
                            project: 'Amazon Rainforest Conservation',
                            type: 'Forest',
                            credits: Math.min(parseInt(balance), 10000),
                            value: Math.min(parseInt(balance), 10000) * 25
                        },
                        {
                            project: 'Solar Farm Development',
                            type: 'Renewable',
                            credits: Math.min(parseInt(balance) - 10000, 5000),
                            value: Math.min(parseInt(balance) - 10000, 5000) * 25
                        }
                    ].filter(holding => holding.credits > 0);
                    
                    // Display holdings
                    displayHoldings();
                } catch (error) {
                    console.error('Error loading blockchain portfolio:', error);
                    // Fallback to simulated data
                    userHoldings = await fetchHoldings();
                    displayHoldings();
                }
            } else {
                // Use simulated data if blockchain not connected
                userHoldings = await fetchHoldings();
                displayHoldings();
            }
        } catch (error) {
            handleError(error);
        }
    }
    
    // Display Holdings
    function displayHoldings() {
        // Clear existing holdings
        holdingsTableBody.innerHTML = '';
        
        // Calculate total credits and value
        let totalCredits = 0;
        let totalValue = 0;
        
        // Add holdings to table
        userHoldings.forEach(holding => {
            totalCredits += holding.credits;
            totalValue += holding.value;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${holding.project}</td>
                <td>${holding.type}</td>
                <td>${holding.credits.toLocaleString()}</td>
                <td>$${holding.value.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary sell-holding" data-project="${holding.project}">Sell</button>
                </td>
            `;
            
            // Add event listener to sell button
            const sellButton = row.querySelector('.sell-holding');
            sellButton.addEventListener('click', () => sellHolding(holding));
            
            holdingsTableBody.appendChild(row);
        });
        
        // Update portfolio summary
        cctOwned.textContent = totalCredits.toLocaleString();
        portfolioValue.textContent = `$${totalValue.toLocaleString()}`;
        environmentalImpact.textContent = `${totalCredits.toLocaleString()} tons CO2e`;
    }

    // Setup Blockchain Integration
    function setupBlockchainIntegration() {
        // Connect wallet button
        connectWalletBtn.addEventListener('click', async () => {
            try {
                if (!blockchain) {
                    blockchain = await initializeBlockchain();
                }
                
                if (blockchain.isConnected) {
                    walletStatus.textContent = 'Connected';
                    walletStatus.classList.add('connected');
                    
                    // Update token balance
                    const balance = await blockchain.getBalance();
                    tokenBalance.textContent = balance;
                    
                    // Refresh portfolio
                    loadPortfolio();
                    
                    // Refresh projects
                    loadProjects();
                } else {
                    walletStatus.textContent = 'Not Connected';
                    walletStatus.classList.remove('connected');
                }
            } catch (error) {
                console.error('Error connecting to blockchain:', error);
                showAlert('Failed to connect to blockchain: ' + error.message, 'error');
            }
        });
        
        // Transfer form
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const recipient = document.getElementById('recipientAddress').value;
            const amount = document.getElementById('transferAmount').value;
            
            try {
                if (!blockchain || !blockchain.isConnected) {
                    showAlert('Please connect your wallet first', 'error');
                    return;
                }
                
                // Validate recipient address
                if (!ethers.utils.isAddress(recipient)) {
                    showAlert('Invalid recipient address', 'error');
                    return;
                }
                
                // Transfer tokens
                const tx = await blockchain.transfer(recipient, amount);
                
                showAlert(`Transfer successful! Transaction hash: ${tx.transactionHash}`, 'success');
                
                // Reset form
                transferForm.reset();
                
                // Update balance
                const balance = await blockchain.getBalance();
                tokenBalance.textContent = balance;
                
                // Refresh portfolio
                loadPortfolio();
            } catch (error) {
                console.error('Error transferring tokens:', error);
                showAlert('Failed to transfer tokens: ' + error.message, 'error');
            }
        });
        
        // Retire form
        retireForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const projectId = retireProject.value;
            const amount = document.getElementById('retireAmount').value;
            const reason = document.getElementById('retireReason').value;
            
            try {
                if (!blockchain || !blockchain.isConnected) {
                    showAlert('Please connect your wallet first', 'error');
                    return;
                }
                
                // Retire tokens
                const tx = await blockchain.retireTokens(projectId, amount, reason);
                
                showAlert(`Tokens retired successfully! Transaction hash: ${tx.transactionHash}`, 'success');
                
                // Reset form
                retireForm.reset();
                
                // Update balance
                const balance = await blockchain.getBalance();
                tokenBalance.textContent = balance;
                
                // Refresh portfolio
                loadPortfolio();
            } catch (error) {
                console.error('Error retiring tokens:', error);
                showAlert('Failed to retire tokens: ' + error.message, 'error');
            }
        });
    }
    
    // Fill Order
    function fillOrder(orderId) {
        // In a real implementation, this would execute the order on the blockchain
        // For now, we'll simulate it
        showAlert(`Order ${orderId} filled successfully`, 'success');
        
        // Refresh order book
        loadOrderBook();
        
        // Refresh portfolio
        loadPortfolio();
    }
    
    // Sell Holding
    function sellHolding(holding) {
        // In a real implementation, this would create a sell order on the blockchain
        // For now, we'll simulate it
        showAlert(`Sell order placed for ${holding.credits} credits from ${holding.project}`, 'success');
        
        // Refresh portfolio
        loadPortfolio();
    }
    
    // Show Alert
    function showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.classList.add('alert', `alert-${type}`);
        alert.textContent = message;
        
        // Add to page
        document.body.appendChild(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 500);
        }, 5000);
    }
    
    // Fetch Projects (simulated)
    async function fetchProjects() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return [
            {
                id: 1,
                title: 'Amazon Rainforest Conservation',
                location: 'Brazil',
                type: 'Forest',
                standard: 'VCS',
                carbonReduction: '50,000',
                price: 25.50,
                image: 'assets/images/projects/forest.jpg',
                verified: true,
                tokenAmount: '50000'
            },
            {
                id: 2,
                title: 'Solar Farm Development',
                location: 'India',
                type: 'Renewable',
                standard: 'Gold Standard',
                carbonReduction: '30,000',
                price: 22.75,
                image: 'assets/images/projects/solar.jpg',
                verified: true,
                tokenAmount: '30000'
            },
            {
                id: 3,
                title: 'Industrial Efficiency Upgrade',
                location: 'Germany',
                type: 'Industrial',
                standard: 'ACR',
                carbonReduction: '25,000',
                price: 20.00,
                image: 'assets/images/projects/industrial.jpg',
                verified: true,
                tokenAmount: '25000'
            },
            {
                id: 4,
                title: 'Sustainable Agriculture',
                location: 'Kenya',
                type: 'Agriculture',
                standard: 'CAR',
                carbonReduction: '15,000',
                price: 18.25,
                image: 'assets/images/projects/agriculture.jpg',
                verified: true,
                tokenAmount: '15000'
            }
        ];
    }
    
    // Fetch Orders (simulated)
    async function fetchOrders() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            buy: [
                { id: 1, project: 'Amazon Rainforest Conservation', quantity: 1000, price: 24.50 },
                { id: 2, project: 'Solar Farm Development', quantity: 500, price: 22.00 },
                { id: 3, project: 'Industrial Efficiency Upgrade', quantity: 2000, price: 19.75 },
                { id: 4, project: 'Sustainable Agriculture', quantity: 750, price: 17.50 }
            ],
            sell: [
                { id: 5, project: 'Amazon Rainforest Conservation', quantity: 2000, price: 26.50 },
                { id: 6, project: 'Solar Farm Development', quantity: 1000, price: 23.50 },
                { id: 7, project: 'Industrial Efficiency Upgrade', quantity: 1500, price: 20.25 },
                { id: 8, project: 'Sustainable Agriculture', quantity: 500, price: 19.00 }
            ]
        };
    }
    
    // Fetch Holdings (simulated)
    async function fetchHoldings() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return [
            {
                project: 'Amazon Rainforest Conservation',
                type: 'Forest',
                credits: 10000,
                value: 250000
            },
            {
                project: 'Solar Farm Development',
                type: 'Renewable',
                credits: 5000,
                value: 113750
            }
        ];
    }
    
    // Generate Random Price
    function generateRandomPrice() {
        return (Math.random() * 10 + 15).toFixed(2);
    }
    
    // Get Project Image
    function getProjectImage(type) {
        const images = {
            'Forest': 'assets/images/projects/forest.jpg',
            'Renewable': 'assets/images/projects/solar.jpg',
            'Industrial': 'assets/images/projects/industrial.jpg',
            'Agriculture': 'assets/images/projects/agriculture.jpg'
        };
        
        return images[type] || 'assets/images/projects/default.jpg';
    }
    
    // Handle Error
    function handleError(error) {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again later.', 'error');
    }
}); 