// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Initialize trading volume chart
    initializeTradingVolumeChart();
    
    // Load featured projects
    loadFeaturedProjects();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Update user profile
    updateUserProfile();
});

// Trading Volume Chart
function initializeTradingVolumeChart() {
    const ctx = document.getElementById('tradingVolumeChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(),
            datasets: [{
                label: 'Trading Volume (tCO2e)',
                data: generateRandomData(),
                borderColor: '#2ECC71',
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

    // Update chart every 5 seconds
    setInterval(() => {
        chart.data.labels = generateTimeLabels();
        chart.data.datasets[0].data = generateRandomData();
        chart.update('none');
    }, 5000);
}

// Helper function to generate time labels
function generateTimeLabels() {
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now - i * 5000);
        labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        }));
    }
    return labels;
}

// Helper function to generate random data
function generateRandomData() {
    return Array.from({ length: 12 }, () => 
        Math.floor(Math.random() * 1000) + 500
    );
}

// Format currency in Indian Rupees
function formatIndianCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format large numbers in Indian format
function formatIndianNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
}

// User Profile Data
const userProfile = {
    name: 'Pratik Karde',
    email: 'pratik.karde@example.com',
    role: 'Trader',
    joinDate: 'January 2024'
};

// Load Featured Projects
async function loadFeaturedProjects() {
    try {
        const projects = await fetchProjects();
        const featuredProjects = projects.slice(0, 3);
        const projectsGrid = document.getElementById('featuredProjects');
        
        featuredProjects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    } catch (error) {
        handleError(error);
    }
}

// Create Project Card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <div class="project-meta">
                <span class="location"><i class="fas fa-map-marker-alt"></i> ${project.location}</span>
                <span class="type"><i class="fas fa-${getProjectIcon(project.type)}"></i> ${project.type}</span>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-stats">
                <div class="stat">
                    <span class="label">Credits Available</span>
                    <span class="value">${formatIndianNumber(project.credits)}</span>
                </div>
                <div class="stat">
                    <span class="label">Price per Credit</span>
                    <span class="value">${formatIndianCurrency(project.price)}</span>
                </div>
            </div>
            <a href="/project/${project.id}" class="btn btn-secondary">View Details</a>
        </div>
    `;
    return card;
}

// Get Project Icon
function getProjectIcon(type) {
    const icons = {
        'Forest Conservation': 'tree',
        'Renewable Energy': 'solar-panel',
        'Industrial': 'industry',
        'Agriculture': 'seedling'
    };
    return icons[type] || 'leaf';
}

// Fetch Projects (Simulated API Call)
async function fetchProjects() {
    // Simulated project data
    return [
        {
            id: 1,
            title: 'Gujarat Solar Farm',
            location: 'Gujarat, India',
            type: 'Renewable Energy',
            description: 'Large-scale solar power plant generating clean energy and reducing carbon emissions through advanced photovoltaic technology.',
            credits: 150000,
            price: 1100,
            image: 'assets/images/projects/solar-farm.jpg',
            impact: {
                co2Reduction: '75,000 tonnes/year',
                households: '100,000 homes powered',
                jobs: '500 local jobs'
            }
        },
        {
            id: 2,
            title: 'Tamil Nadu Wind Farm',
            location: 'Tamil Nadu, India',
            type: 'Renewable Energy',
            description: 'Cutting-edge wind energy project harnessing coastal winds to generate sustainable power and support local communities.',
            credits: 200000,
            price: 1250,
            image: 'assets/images/projects/wind-farm.jpg',
            impact: {
                co2Reduction: '100,000 tonnes/year',
                households: '150,000 homes powered',
                jobs: '300 local jobs'
            }
        },
        {
            id: 3,
            title: 'Western Ghats Conservation',
            location: 'Karnataka, India',
            type: 'Forest Conservation',
            description: 'Protecting and restoring vital forest ecosystems in the Western Ghats biodiversity hotspot.',
            credits: 300000,
            price: 1350,
            image: 'assets/images/projects/forest.jpg',
            impact: {
                co2Reduction: '150,000 tonnes/year',
                biodiversity: '1000+ species protected',
                communities: '50 local communities supported'
            }
        }
    ];
}

// Error Handling
function handleError(error) {
    console.error('An error occurred:', error);
    // Implement proper error handling UI
}

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// API Calls (placeholder functions)
async function fetchProjects(filters = {}) {
    try {
        // Implement actual API call
        return [];
    } catch (error) {
        handleError(error);
        return [];
    }
}

async function fetchProjectDetails(projectId) {
    try {
        // Implement actual API call
        return null;
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Update User Profile
function updateUserProfile() {
    const profileElements = document.querySelectorAll('.user-name');
    profileElements.forEach(element => {
        element.textContent = userProfile.name;
    });
} 