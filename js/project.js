// DOM Elements
const mainImage = document.getElementById('mainImage');
const thumbnails = document.querySelectorAll('.thumbnail');
const creditAmount = document.getElementById('creditAmount');
const totalCost = document.querySelector('.total-cost');
const buyCreditsBtn = document.getElementById('buyCredits');
const addToWatchlistBtn = document.getElementById('addToWatchlist');
const projectMap = document.getElementById('projectMap');

// Charts
let impactChart, socialChart, priceChart;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupGallery();
    setupCharts();
    setupMap();
    setupTrading();
    setupEventListeners();
});

// Gallery Functions
function setupGallery() {
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Update main image
            mainImage.src = thumbnail.src;
            
            // Update active state
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });
}

// Chart Functions
function setupCharts() {
    setupImpactChart();
    setupSocialChart();
    setupPriceChart();
}

function setupImpactChart() {
    const ctx = document.getElementById('impactChart').getContext('2d');
    impactChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
            datasets: [{
                label: 'Carbon Reduction (tCO2e)',
                data: [25000, 35000, 45000, 55000, 65000, 75000, 85000],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgb(46, 204, 113)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupSocialChart() {
    const ctx = document.getElementById('socialChart').getContext('2d');
    socialChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Employment', 'Education', 'Infrastructure', 'Healthcare'],
            datasets: [{
                data: [40, 25, 20, 15],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function setupPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const dates = generateDates(30);
    const prices = generatePrices(30, 14.25, 18.50);

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Price per Credit ($)',
                data: prices,
                borderColor: 'rgb(46, 204, 113)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
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
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Map Functions
function setupMap() {
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // Replace with actual token
    const map = new mapboxgl.Map({
        container: 'projectMap',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-62.2159, -3.4653], // Project location
        zoom: 8
    });

    // Add marker
    new mapboxgl.Marker()
        .setLngLat([-62.2159, -3.4653])
        .setPopup(new mapboxgl.Popup().setHTML(`
            <h3>Amazon Rainforest Conservation</h3>
            <p>Project Location</p>
        `))
        .addTo(map);

    // Add controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
}

// Trading Functions
function setupTrading() {
    // Update total cost when amount changes
    creditAmount.addEventListener('input', () => {
        const amount = parseInt(creditAmount.value) || 0;
        const price = 15; // Price per credit
        const total = amount * price;
        totalCost.textContent = `$${total.toLocaleString()}`;
    });

    // Validate minimum purchase
    creditAmount.addEventListener('change', () => {
        const amount = parseInt(creditAmount.value);
        if (amount < 100) {
            creditAmount.value = 100;
            const total = 100 * 15;
            totalCost.textContent = `$${total.toLocaleString()}`;
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Buy Credits
    buyCreditsBtn.addEventListener('click', () => {
        const amount = parseInt(creditAmount.value);
        handlePurchase(amount);
    });

    // Add to Watchlist
    addToWatchlistBtn.addEventListener('click', () => {
        handleWatchlist();
    });

    // Document Downloads
    document.querySelectorAll('.document-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleDocumentDownload(item);
        });
    });

    // Similar Projects
    document.querySelectorAll('.similar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleSimilarProject(item);
        });
    });
}

// Utility Functions
function generateDates(days) {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
}

function generatePrices(days, min, max) {
    const prices = [];
    let currentPrice = (min + max) / 2;
    
    for (let i = 0; i < days; i++) {
        // Add some randomness to price movement
        const change = (Math.random() - 0.5) * 0.5;
        currentPrice = Math.max(min, Math.min(max, currentPrice + change));
        prices.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    return prices;
}

// Action Handlers
function handlePurchase(amount) {
    // Implement purchase logic
    console.log('Purchasing credits:', amount);
    showAlert('Purchase successful!', 'success');
}

function handleWatchlist() {
    // Implement watchlist logic
    console.log('Adding to watchlist');
    showAlert('Added to watchlist!', 'success');
}

function handleDocumentDownload(item) {
    const documentName = item.querySelector('span').textContent;
    // Implement document download logic
    console.log('Downloading document:', documentName);
    showAlert('Download started!', 'info');
}

function handleSimilarProject(item) {
    const projectName = item.querySelector('h4').textContent;
    // Implement navigation to similar project
    console.log('Navigating to project:', projectName);
    window.location.href = `/project/${projectName.toLowerCase().replace(/\s+/g, '-')}`;
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Add to page
    document.body.appendChild(alert);

    // Remove after delay
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Error Handling
function handleError(error) {
    console.error('Error:', error);
    showAlert('An error occurred. Please try again.', 'error');
} 