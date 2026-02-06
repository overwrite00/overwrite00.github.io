/* ============================================
   CybersecurityZen - Articles Loader
   Carica articoli da JSON e renderizza Markdown
   ============================================ */

// Configurazione
const CONFIG = {
    articlesJsonPath: 'data/articles.json',
    articlesPerPage: 6,
    cacheKey: 'cyberseczen_articles',
    cacheDuration: 5 * 60 * 1000 // 5 minuti
};

// Cache globale
let articlesCache = null;

// ============================================
// Caricamento Dati
// ============================================

/**
 * Carica articles.json con cache
 */
async function loadArticlesData() {
    // Controlla cache
    const cached = sessionStorage.getItem(CONFIG.cacheKey);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CONFIG.cacheDuration) {
            articlesCache = data;
            return data;
        }
    }
    
    try {
        const response = await fetch(CONFIG.articlesJsonPath);
        if (!response.ok) throw new Error('Errore caricamento articles.json');
        
        const data = await response.json();
        articlesCache = data;
        
        // Salva in cache
        sessionStorage.setItem(CONFIG.cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        return data;
    } catch (error) {
        console.error('Errore caricamento articoli:', error);
        return { articles: [], categories: [], totalArticles: 0 };
    }
}

/**
 * Carica e converte un file Markdown
 */
async function loadMarkdownArticle(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Articolo non trovato');
        
        const markdown = await response.text();
        return parseMarkdownWithFrontmatter(markdown);
    } catch (error) {
        console.error('Errore caricamento articolo:', error);
        return null;
    }
}

/**
 * Separa frontmatter YAML dal contenuto Markdown
 */
function parseMarkdownWithFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        return { metadata: {}, body: content };
    }
    
    const yamlContent = match[1];
    const body = match[2];
    
    // Parse YAML semplice
    const metadata = {};
    let currentKey = null;
    let currentList = null;
    
    yamlContent.split('\n').forEach(line => {
        line = line.trimEnd();
        if (!line || line.startsWith('#')) return;
        
        // Lista YAML
        if (line.match(/^\s+-\s+/) && currentKey) {
            if (!Array.isArray(metadata[currentKey])) {
                metadata[currentKey] = [];
            }
            metadata[currentKey].push(line.replace(/^\s+-\s+/, '').replace(/["']/g, ''));
            return;
        }
        
        // Key: Value
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Rimuovi virgolette
            value = value.replace(/^["']|["']$/g, '');
            
            // Gestione liste inline [a, b, c]
            if (value.startsWith('[') && value.endsWith(']')) {
                metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/["']/g, ''));
            } else if (value === '' || value === '[]') {
                currentKey = key;
                metadata[key] = [];
            } else {
                metadata[key] = value;
                currentKey = key;
            }
        }
    });
    
    return { metadata, body };
}

/**
 * Converte Markdown in HTML usando marked.js
 */
function convertMarkdownToHTML(markdown) {
    if (typeof marked === 'undefined') {
        console.error('marked.js non caricato');
        return markdown;
    }
    
    // Configura marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        },
        breaks: true,
        gfm: true
    });
    
    return marked.parse(markdown);
}

// ============================================
// Renderizzazione Homepage
// ============================================

/**
 * Renderizza gli ultimi articoli nella homepage
 */
async function renderHomeArticles(containerId = 'articles-container', limit = 3) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById('articles-empty');
    const footer = document.getElementById('articles-footer');
    
    if (!container) return;
    
    // Mostra skeleton loading
    container.innerHTML = generateArticleSkeletons(limit);
    
    const data = await loadArticlesData();
    
    if (data.articles.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (footer) footer.style.display = 'none';
        return;
    }
    
    // Nascondi empty state e mostra footer
    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';
    
    const articles = data.articles.slice(0, limit);
    container.innerHTML = articles.map(article => generateArticleCard(article)).join('');
    
    // Animazione fade-in
    container.querySelectorAll('.article-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

/**
 * Renderizza le categorie nella homepage
 */
async function renderHomeCategories(containerId = 'categories-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const data = await loadArticlesData();
    
    if (data.categories.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    // Conta articoli per categoria
    const categoryCounts = {};
    data.articles.forEach(article => {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    // Icone per categoria
    const categoryIcons = {
        'Tutorial': 'fa-graduation-cap',
        'Fundamentals': 'fa-book',
        'Tools': 'fa-wrench',
        'CTF': 'fa-flag',
        'News': 'fa-newspaper',
        'Research': 'fa-microscope',
        'default': 'fa-folder'
    };
    
    container.innerHTML = data.categories.map(category => {
        const icon = categoryIcons[category] || categoryIcons['default'];
        const count = categoryCounts[category] || 0;
        return `
            <a href="category.html?cat=${encodeURIComponent(category)}" class="category-card">
                <i class="fas ${icon}"></i>
                <h4>${category}</h4>
                <span class="category-count">${count} articol${count !== 1 ? 'i' : 'o'}</span>
            </a>
        `;
    }).join('');
}

// ============================================
// Renderizzazione Blog Page
// ============================================

/**
 * Renderizza tutti gli articoli nella pagina blog
 */
async function renderBlogArticles(containerId = 'blog-articles-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = generateArticleSkeletons(6);
    
    const data = await loadArticlesData();
    
    if (data.articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>Nessun articolo trovato</h3>
                <p>Non ci sono ancora articoli pubblicati.</p>
            </div>
        `;
        return;
    }
    
    // Salva globalmente per filtri
    window.allArticles = data.articles;
    window.allCategories = data.categories;
    
    renderFilteredArticles(data.articles, container);
    renderCategoryFilters(data.categories);
}

/**
 * Renderizza i filtri categoria
 */
function renderCategoryFilters(categories) {
    const filtersContainer = document.getElementById('category-filters');
    if (!filtersContainer) return;
    
    const allBtn = `<button class="filter-btn active" data-category="all">Tutti</button>`;
    const categoryBtns = categories.map(cat => 
        `<button class="filter-btn" data-category="${cat}">${cat}</button>`
    ).join('');
    
    filtersContainer.innerHTML = allBtn + categoryBtns;
    
    // Event listeners
    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active
            filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtra
            const category = btn.dataset.category;
            const filtered = category === 'all' 
                ? window.allArticles 
                : window.allArticles.filter(a => a.category === category);
            
            renderFilteredArticles(filtered, document.getElementById('blog-articles-container'));
        });
    });
}

/**
 * Renderizza articoli filtrati
 */
function renderFilteredArticles(articles, container) {
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nessun risultato</h3>
                <p>Nessun articolo trovato con questi filtri.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = articles.map(article => generateArticleCard(article)).join('');
}

/**
 * Cerca articoli
 */
function searchArticles(query) {
    if (!window.allArticles) return;
    
    const container = document.getElementById('blog-articles-container');
    if (!container) return;
    
    query = query.toLowerCase().trim();
    
    if (!query) {
        renderFilteredArticles(window.allArticles, container);
        return;
    }
    
    const filtered = window.allArticles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    renderFilteredArticles(filtered, container);
}

// ============================================
// Renderizzazione Category Page
// ============================================

/**
 * Renderizza articoli per categoria
 */
async function renderCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('cat');
    
    const titleEl = document.getElementById('category-title');
    const container = document.getElementById('category-articles-container');
    
    if (!category) {
        if (titleEl) titleEl.textContent = 'Tutte le Categorie';
        await renderAllCategories(container);
        return;
    }
    
    if (titleEl) titleEl.textContent = category;
    
    const data = await loadArticlesData();
    const filtered = data.articles.filter(a => a.category === category);
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Categoria vuota</h3>
                <p>Non ci sono ancora articoli in "${category}".</p>
                <a href="blog.html" class="btn btn-primary">Vai al Blog</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(article => generateArticleCard(article)).join('');
}

/**
 * Renderizza tutte le categorie come griglia
 */
async function renderAllCategories(container) {
    const data = await loadArticlesData();
    
    const categoryCounts = {};
    data.articles.forEach(article => {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    container.innerHTML = `
        <div class="categories-grid">
            ${data.categories.map(category => `
                <a href="category.html?cat=${encodeURIComponent(category)}" class="category-large-card">
                    <h3>${category}</h3>
                    <span>${categoryCounts[category] || 0} articoli</span>
                </a>
            `).join('')}
        </div>
    `;
}

// ============================================
// Renderizzazione Articolo Singolo
// ============================================

/**
 * Renderizza un singolo articolo dalla URL
 */
async function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (!articleId) {
        window.location.href = 'blog.html';
        return;
    }
    
    const data = await loadArticlesData();
    const article = data.articles.find(a => a.id === articleId);
    
    if (!article) {
        document.getElementById('article-content').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Articolo non trovato</h3>
                <a href="blog.html" class="btn btn-primary">Torna al Blog</a>
            </div>
        `;
        return;
    }
    
    // Il contenuto è già nel JSON, non serve caricare il file .md
    if (!article.content) {
        console.error('Articolo trovato ma senza contenuto:', article);
        document.getElementById('article-header').innerHTML = `
            <span class="article-category-tag">${article.category}</span>
            <h1>${article.title}</h1>
        `;
        document.getElementById('article-content').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Contenuto non disponibile</h3>
                <p>L'articolo esiste ma il contenuto non è stato caricato nel JSON.</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Prova a svuotare la cache del browser (Ctrl+Shift+R) o verifica che data/articles.json contenga il campo "content".</p>
                <a href="blog.html" class="btn btn-primary">Torna al Blog</a>
            </div>
        `;
        return;
    }
    
    // Aggiorna meta pagina
    document.title = `${article.title} | CybersecurityZen`;
    
    // Renderizza header
    const headerEl = document.getElementById('article-header');
    if (headerEl) {
        headerEl.innerHTML = `
            <span class="article-category-tag">${article.category}</span>
            <h1>${article.title}</h1>
            <div class="article-meta-info">
                <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                <span><i class="fas fa-clock"></i> ${article.readTime}</span>
                <span><i class="fas fa-user"></i> ${article.author}</span>
            </div>
        `;
    }
    
    // Renderizza contenuto (converti Markdown in HTML)
    const contentEl = document.getElementById('article-content');
    if (contentEl) {
        contentEl.innerHTML = convertMarkdownToHTML(article.content);
    }
    
    // Renderizza tags
    const tagsEl = document.getElementById('article-tags');
    if (tagsEl && article.tags && article.tags.length > 0) {
        tagsEl.innerHTML = article.tags.map(tag => 
            `<a href="blog.html?search=${encodeURIComponent(tag)}" class="article-tag">#${tag}</a>`
        ).join('');
    }
    
    // Syntax highlighting
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Genera una card articolo
 */
function generateArticleCard(article) {
    // Controlla se image è una stringa non vuota (non array vuoto, non null, non undefined)
    const hasImage = article.image && typeof article.image === 'string' && article.image.trim() !== '';
    
    const imageHtml = hasImage
        ? `<img src="${article.image}" alt="${article.title}" class="article-card-image">`
        : `<div class="article-card-icon"><i class="fas fa-newspaper"></i></div>`;
    
    return `
        <article class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
            ${imageHtml}
            <div class="article-card-content">
                <span class="article-category">${article.category}</span>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.description}</p>
                <div class="article-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                    <span><i class="fas fa-clock"></i> ${article.readTime}</span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Genera skeleton loading
 */
function generateArticleSkeletons(count) {
    return Array(count).fill(`
        <div class="article-card skeleton">
            <div class="skeleton-image"></div>
            <div class="article-card-content">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Formatta data
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// Inizializzazione
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Determina quale pagina stiamo renderizzando
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        // Homepage
        renderHomeArticles('articles-container', 3);
        renderHomeCategories('categories-container');
    } else if (path.endsWith('blog.html')) {
        // Blog page
        renderBlogArticles('blog-articles-container');
        
        // Setup search
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => searchArticles(e.target.value), 300);
            });
        }
    } else if (path.endsWith('category.html')) {
        // Category page
        renderCategoryPage();
    } else if (path.endsWith('article.html')) {
        // Single article
        renderSingleArticle();
    }
});

// Esporta funzioni per uso globale
window.searchArticles = searchArticles;
window.loadArticlesData = loadArticlesData;