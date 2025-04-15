// DOM Elements
const projectsGrid = document.getElementById('projectsGrid');
const projectsList = document.getElementById('projectsList');
const projectsMap = document.getElementById('projectsMap');
const searchInput = document.querySelector('.search-bar input');
const sortSelect = document.getElementById('sortProjects');
const viewButtons = document.querySelectorAll('.view-btn');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const carbonRange = document.getElementById('carbonRange');
const carbonValue = document.getElementById('carbonValue');
const applyFiltersBtn = document.querySelector('.apply-filters');
const resetFiltersBtn = document.querySelector('.reset-filters');

// State
let currentView = 'grid';
let currentPage = 1;
let projectsPerPage = 12;
let projects = [];
let filteredProjects = [];
let map = null;
let markers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
    initializeMap();
});

// Event Listeners
function setupEventListeners() {
    // View toggle
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Sort
    sortSelect.addEventListener('change', handleSort);

    // Filters
    priceRange.addEventListener('input', () => {
        priceValue.textContent = `$${priceRange.value}`;
    });

    carbonRange.addEventListener('input', () => {
        carbonValue.textContent = formatNumber(carbonRange.value);
    });

    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);

    // Pagination
    document.querySelectorAll('.pagination-number').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.textContent);
            updatePagination();
            displayProjects();
        });
    });

    document.querySelector('.pagination-btn:first-child').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            displayProjects();
        }
    });

    document.querySelector('.pagination-btn:last-child').addEventListener('click', () => {
        const maxPage = Math.ceil(filteredProjects.length / projectsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            updatePagination();
            displayProjects();
        }
    });
}

// Load Projects
async function loadProjects() {
    try {
        // Simulated API call
        projects = await fetchProjects();
        filteredProjects = [...projects];
        displayProjects();
        updatePagination();
    } catch (error) {
        handleError(error);
    }
}

// Display Projects
function displayProjects() {
    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    const projectsToShow = filteredProjects.slice(start, end);

    if (currentView === 'grid') {
        displayGridView(projectsToShow);
    } else if (currentView === 'list') {
        displayListView(projectsToShow);
    } else if (currentView === 'map') {
        updateMapMarkers(projectsToShow);
    }
}

function displayGridView(projects) {
    projectsGrid.innerHTML = '';
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

function displayListView(projects) {
    projectsList.innerHTML = '';
    projects.forEach(project => {
        const item = createProjectListItem(project);
        projectsList.appendChild(item);
    });
}

// Create Project Elements
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-image">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${project.location}</span>
            </div>
            <div class="project-stats">
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(project.carbonReduction)}</div>
                    <div class="stat-label">tCO2e</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${project.price}</div>
                    <div class="stat-label">per credit</div>
                </div>
            </div>
            <div class="project-actions">
                <button class="btn btn-primary" onclick="viewProject('${project.id}')">View Details</button>
                <button class="btn btn-secondary" onclick="addToWatchlist('${project.id}')">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function createProjectListItem(project) {
    const item = document.createElement('div');
    item.className = 'project-list-item';
    item.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-list-image">
        <div class="project-list-content">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${project.location}</span>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-stats">
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(project.carbonReduction)}</div>
                    <div class="stat-label">tCO2e</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${project.price}</div>
                    <div class="stat-label">per credit</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${project.type}</div>
                    <div class="stat-label">Type</div>
                </div>
            </div>
        </div>
        <div class="project-list-actions">
            <button class="btn btn-primary" onclick="viewProject('${project.id}')">View Details</button>
            <button class="btn btn-secondary" onclick="addToWatchlist('${project.id}')">
                <i class="far fa-bookmark"></i>
            </button>
        </div>
    `;
    return item;
}

// View Switching
function switchView(view) {
    currentView = view;
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    [projectsGrid, projectsList, projectsMap].forEach(el => {
        el.classList.add('hidden');
    });

    if (view === 'grid') {
        projectsGrid.classList.remove('hidden');
    } else if (view === 'list') {
        projectsList.classList.remove('hidden');
    } else if (view === 'map') {
        projectsMap.classList.remove('hidden');
        if (!map) {
            initializeMap();
        }
    }

    displayProjects();
}

// Map Functions
function initializeMap() {
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // Replace with actual token
    map = new mapboxgl.Map({
        container: 'projectsMap',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [0, 0],
        zoom: 1
    });

    map.on('load', () => {
        displayProjects();
    });
}

function updateMapMarkers(projects) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Add new markers
    projects.forEach(project => {
        const marker = new mapboxgl.Marker()
            .setLngLat([project.longitude, project.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <h3>${project.title}</h3>
                <p>${project.location}</p>
                <p>Carbon Reduction: ${formatNumber(project.carbonReduction)} tCO2e</p>
                <button onclick="viewProject('${project.id}')">View Details</button>
            `))
            .addTo(map);
        markers.push(marker);
    });

    // Fit map to markers if there are any
    if (markers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => bounds.extend(marker.getLngLat()));
        map.fitBounds(bounds, { padding: 50 });
    }
}

// Filter Functions
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredProjects = projects.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.location.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    updatePagination();
    displayProjects();
}

function handleSort(event) {
    const sortBy = event.target.value;
    filteredProjects.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'carbon-high':
                return b.carbonReduction - a.carbonReduction;
            case 'carbon-low':
                return a.carbonReduction - b.carbonReduction;
            default:
                return 0;
        }
    });
    displayProjects();
}

function applyFilters() {
    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'))
        .map(input => input.value);
    const selectedStandards = Array.from(document.querySelectorAll('input[name="standard"]:checked'))
        .map(input => input.value);
    const maxPrice = parseFloat(priceRange.value);
    const maxCarbon = parseFloat(carbonRange.value);

    filteredProjects = projects.filter(project => {
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(project.type);
        const standardMatch = selectedStandards.length === 0 || selectedStandards.includes(project.standard);
        const priceMatch = project.price <= maxPrice;
        const carbonMatch = project.carbonReduction <= maxCarbon;
        return typeMatch && standardMatch && priceMatch && carbonMatch;
    });

    currentPage = 1;
    updatePagination();
    displayProjects();
}

function resetFilters() {
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });

    // Reset ranges
    priceRange.value = 50;
    priceValue.textContent = '$50';
    carbonRange.value = 100000;
    carbonValue.textContent = '100,000';

    // Reset search and sort
    searchInput.value = '';
    sortSelect.value = 'newest';

    // Reset filtered projects
    filteredProjects = [...projects];
    currentPage = 1;
    updatePagination();
    displayProjects();
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    const paginationNumbers = document.querySelector('.pagination-numbers');
    const prevBtn = document.querySelector('.pagination-btn:first-child');
    const nextBtn = document.querySelector('.pagination-btn:last-child');

    // Update prev/next buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Update page numbers
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            const button = document.createElement('button');
            button.className = `pagination-number${i === currentPage ? ' active' : ''}`;
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                updatePagination();
                displayProjects();
            });
            paginationNumbers.appendChild(button);
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            const span = document.createElement('span');
            span.textContent = '...';
            paginationNumbers.appendChild(span);
        }
    }
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// API Functions
async function fetchProjects() {
    // Simulated API response
    return [
        {
            id: '1',
            title: 'Amazon Rainforest Conservation',
            location: 'Brazil',
            type: 'forest',
            standard: 'vcs',
            description: 'Protecting 50,000 hectares of rainforest from deforestation.',
            carbonReduction: 250000,
            price: 15,
            image: 'assets/images/projects/amazon.jpg',
            latitude: -3.4653,
            longitude: -62.2159,
            date: '2024-01-15'
        },
        // Add more project examples here
    ];
}

// Project Actions
function viewProject(id) {
    window.location.href = `/project/${id}`;
}

function addToWatchlist(id) {
    // Implement watchlist functionality
    console.log('Added to watchlist:', id);
}

// Error Handling
function handleError(error) {
    console.error('Error:', error);
    // Implement proper error handling UI
} 