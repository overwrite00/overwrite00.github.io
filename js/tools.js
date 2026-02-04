/* ============================================
   CybersecurityZen - Quick Tools (Homepage)
   ============================================ */

// ============================================
// Base64 Encoder/Decoder
// ============================================
function quickBase64Encode() {
    const input = document.getElementById('quick-base64-input');
    const output = document.getElementById('quick-base64-output');
    
    if (!input.value.trim()) {
        showToast('Inserisci del testo da codificare', 'error');
        return;
    }
    
    try {
        // Handle Unicode characters properly
        const encoded = btoa(unescape(encodeURIComponent(input.value)));
        output.textContent = encoded;
        output.style.color = 'var(--accent-green)';
        showToast('Base64 encoded!');
    } catch (e) {
        output.textContent = 'Errore durante l\'encoding';
        output.style.color = '#ef4444';
        showToast('Errore durante l\'encoding', 'error');
    }
}

function quickBase64Decode() {
    const input = document.getElementById('quick-base64-input');
    const output = document.getElementById('quick-base64-output');
    
    if (!input.value.trim()) {
        showToast('Inserisci Base64 da decodificare', 'error');
        return;
    }
    
    try {
        // Handle Unicode characters properly
        const decoded = decodeURIComponent(escape(atob(input.value.trim())));
        output.textContent = decoded;
        output.style.color = 'var(--accent-green)';
        showToast('Base64 decoded!');
    } catch (e) {
        output.textContent = 'Input Base64 non valido';
        output.style.color = '#ef4444';
        showToast('Input Base64 non valido', 'error');
    }
}

// ============================================
// Hash Generator
// ============================================
async function quickHash() {
    const input = document.getElementById('quick-hash-input');
    const output = document.getElementById('quick-hash-output');
    const hashType = document.getElementById('quick-hash-type').value;
    
    if (!input.value) {
        showToast('Inserisci del testo da hashare', 'error');
        return;
    }
    
    try {
        let hash;
        
        if (hashType === 'MD5') {
            // Use CryptoJS for MD5
            hash = CryptoJS.MD5(input.value).toString();
        } else {
            // Use Web Crypto API for SHA
            const encoder = new TextEncoder();
            const data = encoder.encode(input.value);
            const hashBuffer = await crypto.subtle.digest(hashType, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        output.textContent = hash;
        output.style.color = 'var(--accent-green)';
        showToast(`${hashType} hash generato!`);
    } catch (e) {
        output.textContent = 'Errore durante la generazione dell\'hash';
        output.style.color = '#ef4444';
        showToast('Errore durante la generazione', 'error');
    }
}

// ============================================
// Password Generator
// ============================================
function quickGeneratePassword() {
    const length = parseInt(document.getElementById('quick-pwd-length').value);
    const useUpper = document.getElementById('pwd-upper').checked;
    const useLower = document.getElementById('pwd-lower').checked;
    const useNumbers = document.getElementById('pwd-numbers').checked;
    const useSymbols = document.getElementById('pwd-symbols').checked;
    
    const output = document.getElementById('quick-pwd-output');
    const strengthEl = document.getElementById('pwd-strength');
    
    // Build character set
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset.length === 0) {
        showToast('Seleziona almeno un tipo di carattere', 'error');
        return;
    }
    
    // Generate password using crypto-secure random
    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    output.textContent = password;
    output.style.color = 'var(--accent-green)';
    
    // Calculate and display strength
    const strength = calculatePasswordStrength(password);
    strengthEl.textContent = strength.label;
    strengthEl.className = `password-strength ${strength.class}`;
    
    showToast('Password generata!');
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length score
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 24) score += 1;
    
    // Character variety score
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    
    // Determine strength level
    if (score <= 3) {
        return { label: '⚠️ Debole', class: 'weak' };
    } else if (score <= 6) {
        return { label: '⚡ Media', class: 'medium' };
    } else {
        return { label: '🔒 Forte', class: 'strong' };
    }
}

// ============================================
// Export for global use
// ============================================
window.quickBase64Encode = quickBase64Encode;
window.quickBase64Decode = quickBase64Decode;
window.quickHash = quickHash;
window.quickGeneratePassword = quickGeneratePassword;
