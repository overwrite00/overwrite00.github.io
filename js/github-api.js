/* ============================================
   CybersecurityZen - GitHub API Integration
   ============================================ */

// Configuration
const GITHUB_USERNAME = 'overwrite00';
const REPOS_TO_SHOW = 6;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Language colors mapping
const languageColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Bash': '#89e051',
    'Ruby': '#701516',
    'Java': '#b07219',
    'C': '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'Vue': '#41b883',
    'SCSS': '#c6538c',
    'PowerShell': '#012456',
    'Dockerfile': '#384d54',
    'Makefile': '#427819',
    'Jupyter Notebook': '#DA5B0B',
    'HCL': '#844FBA',
    'Nix': '#7e7eff'
};

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadGitHubProjects();
});

// ============================================
// Load GitHub Projects
// ============================================
async function loadGitHubProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    // Check cache first
    const cached = getCachedProjects();
    if (cached) {
        renderProjects(cached, container);
        return;
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${REPOS_TO_SHOW}&type=owner`
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // Filter out forked repos and sort by stars then updated
        const filteredRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => {
                // First sort by stars, then by updated date
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, REPOS_TO_SHOW);
        
        // Cache the results
        cacheProjects(filteredRepos);
        
        // Render projects
        renderProjects(filteredRepos, container);
        
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        renderError(container);
    }
}

// ============================================
// Render Projects
// ============================================
function renderProjects(repos, container) {
    container.innerHTML = '';
    
    if (repos.length === 0) {
        container.innerHTML = `
            <div class="articles-empty">
                <div class="empty-icon">
                    <i class="fab fa-github"></i>
                </div>
                <h3>Nessun progetto pubblico</h3>
                <p>I progetti appariranno qui quando saranno disponibili.</p>
            </div>
        `;
        return;
    }
    
    repos.forEach((repo, index) => {
        const card = createProjectCard(repo);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

// ============================================
// Create Project Card
// ============================================
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card fade-in';
    
    const languageColor = languageColors[repo.language] || '#8b8b8b';
    const description = repo.description || 'Nessuna descrizione disponibile';
    const updatedAt = formatRelativeTime(repo.updated_at);
    
    card.innerHTML = `
        <div class="project-header">
            <i class="fas fa-folder-open project-icon"></i>
            <div class="project-links">
                ${repo.homepage ? `
                    <a href="${repo.homepage}" target="_blank" class="project-link" title="Live Demo">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
                <a href="${repo.html_url}" target="_blank" class="project-link" title="View on GitHub">
                    <i class="fab fa-github"></i>
                </a>
            </div>
        </div>
        
        <a href="${repo.html_url}" target="_blank" class="project-name">${repo.name}</a>
        <p class="project-description">${truncateText(description, 120)}</p>
        
        <div class="project-meta">
            ${repo.language ? `
                <div class="project-language">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    <span>${repo.language}</span>
                </div>
            ` : ''}
            
            <div class="project-stats">
                <span title="Stars">
                    <i class="fas fa-star"></i> ${formatNumber(repo.stargazers_count)}
                </span>
                <span title="Forks">
                    <i class="fas fa-code-branch"></i> ${formatNumber(repo.forks_count)}
                </span>
            </div>
        </div>
        
        ${repo.topics && repo.topics.length > 0 ? `
            <div class="project-topics">
                ${repo.topics.slice(0, 4).map(topic => `
                    <span class="topic-tag">${topic}</span>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    return card;
}

// ============================================
// Render Error State
// ============================================
function renderError(container) {
    container.innerHTML = `
        <div class="articles-empty" style="grid-column: 1 / -1;">
            <div class="empty-icon" style="background: rgba(239, 68, 68, 0.1);">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
            </div>
            <h3>Impossibile caricare i progetti</h3>
            <p>Si è verificato un errore durante il caricamento. Riprova più tardi.</p>
            <button onclick="loadGitHubProjects()" class="btn btn-outline" style="margin-top: 1rem;">
                <i class="fas fa-sync-alt"></i> Riprova
            </button>
        </div>
    `;
}

// ============================================
// Cache Management
// ============================================
function cacheProjects(repos) {
    const cacheData = {
        timestamp: Date.now(),
        repos: repos
    };
    localStorage.setItem('github_projects_cache', JSON.stringify(cacheData));
}

function getCachedProjects() {
    try {
        const cached = localStorage.getItem('github_projects_cache');
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
        
        if (isExpired) {
            localStorage.removeItem('github_projects_cache');
            return null;
        }
        
        return cacheData.repos;
    } catch (e) {
        return null;
    }
}

// ============================================
// Utility Functions
// ============================================
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'oggi';
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
    return `${Math.floor(diffDays / 365)} anni fa`;
}

// ============================================
// Export for global use
// ============================================
window.loadGitHubProjects = loadGitHubProjects;
