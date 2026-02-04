/* ============================================
   CybersecurityZen - Main JavaScript
   ============================================ */

// ============================================
// DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTypingEffect();
    initScrollEffects();
    initBackToTop();
    initCurrentYear();
    loadArticles();
});

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ============================================
// Typing Effect
// ============================================
function initTypingEffect() {
    const typingElement = document.getElementById('hero-typing');
    if (!typingElement) return;
    
    const commands = [
        'whoami',
        'cat /etc/security/zen.conf',
        'nmap -sV localhost',
        './explore_projects.sh',
        'echo "Welcome to CybersecurityZen"'
    ];
    
    let commandIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    function type() {
        const currentCommand = commands[commandIndex];
        
        if (isPaused) {
            setTimeout(type, 1500);
            isPaused = false;
            isDeleting = true;
            return;
        }
        
        if (isDeleting) {
            typingElement.textContent = currentCommand.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                commandIndex = (commandIndex + 1) % commands.length;
            }
            
            setTimeout(type, 30);
        } else {
            typingElement.textContent = currentCommand.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentCommand.length) {
                isPaused = true;
            }
            
            setTimeout(type, 80);
        }
    }
    
    setTimeout(type, 1000);
}

// ============================================
// Scroll Effects
// ============================================
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        // Navbar scroll effect
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// Back to Top Button
// ============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Current Year
// ============================================
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ============================================
// Articles Management
// ============================================
const articlesData = [
    // Aggiungi qui i tuoi articoli quando li crei
    // Esempio:
    // {
    //     id: 'introduzione-cybersecurity',
    //     title: 'Introduzione alla Cybersecurity',
    //     description: 'Una guida completa per iniziare nel mondo della sicurezza informatica',
    //     category: 'Fundamentals',
    //     date: '2026-02-04',
    //     readTime: '10 min',
    //     image: 'assets/images/intro-cyber.jpg',
    //     url: 'articles/introduzione-cybersecurity.html'
    // }
];

function loadArticles() {
    const container = document.getElementById('articles-container');
    const emptyState = document.getElementById('articles-empty');
    const footer = document.getElementById('articles-footer');
    
    if (!container) return;
    
    // Clear loading state
    container.innerHTML = '';
    
    if (articlesData.length === 0) {
        // Show empty state
        if (emptyState) emptyState.style.display = 'block';
        if (footer) footer.style.display = 'none';
        return;
    }
    
    // Hide empty state, show footer
    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';
    
    // Show only latest 3 articles on homepage
    const latestArticles = articlesData.slice(0, 3);
    
    latestArticles.forEach(article => {
        const card = createArticleCard(article);
        container.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    
    const formattedDate = formatDate(article.date);
    
    card.innerHTML = `
        <div class="article-image">
            ${article.image 
                ? `<img src="${article.image}" alt="${article.title}" loading="lazy">`
                : `<i class="fas fa-shield-alt"></i>`
            }
        </div>
        <div class="article-content">
            <span class="article-category">${article.category}</span>
            <a href="${article.url}" class="article-title">${article.title}</a>
            <p class="article-excerpt">${article.description}</p>
            <div class="article-meta">
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                <span><i class="fas fa-clock"></i> ${article.readTime}</span>
            </div>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Quick Copy Function
// ============================================
function quickCopy(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !element.textContent) {
        showToast('Niente da copiare', 'error');
        return;
    }
    
    navigator.clipboard.writeText(element.textContent)
        .then(() => showToast('Copiato negli appunti!'))
        .catch(() => showToast('Errore durante la copia', 'error'));
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80; // Navbar height
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Export functions for global use
// ============================================
window.showToast = showToast;
window.quickCopy = quickCopy;
