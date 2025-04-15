// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        updateThemeIcon(savedTheme === 'dark');
    } else if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            document.body.classList.toggle('dark-mode', isDark);
            updateThemeIcon(isDark);
        }
    });
});

// Update theme icon
function updateThemeIcon(isDark) {
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Apply dark mode styles to dynamically added elements
function applyDarkMode(element) {
    if (document.body.classList.contains('dark-mode')) {
        element.classList.add('dark-mode');
    }
} 