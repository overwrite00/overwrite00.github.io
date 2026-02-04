/* ============================================
   CybersecurityZen - Full Tools JavaScript
   ============================================ */

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initTimestamp();
    handleHashFromURL();
});

// Handle direct links to tools (e.g., tools.html#base64)
function handleHashFromURL() {
    const hash = window.location.hash;
    if (hash) {
        const element = document.querySelector(hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

// ============================================
// Utility Functions
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
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyOutput(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !element.textContent.trim()) {
        showToast('Niente da copiare', 'error');
        return;
    }
    
    navigator.clipboard.writeText(element.textContent)
        .then(() => showToast('Copiato negli appunti!'))
        .catch(() => showToast('Errore durante la copia', 'error'));
}

function copyThis(element) {
    if (!element.textContent.trim()) {
        showToast('Niente da copiare', 'error');
        return;
    }
    
    navigator.clipboard.writeText(element.textContent)
        .then(() => showToast('Copiato negli appunti!'))
        .catch(() => showToast('Errore durante la copia', 'error'));
}

function clearTool(toolName) {
    const input = document.getElementById(`${toolName}-input`);
    const output = document.getElementById(`${toolName}-output`);
    
    if (input) input.value = '';
    if (output) output.textContent = '';
    
    // Special cases
    if (toolName === 'jwt') {
        document.getElementById('jwt-header').textContent = '';
        document.getElementById('jwt-payload').textContent = '';
        document.getElementById('jwt-signature').textContent = '';
    }
    if (toolName === 'hash') {
        document.getElementById('hash-md5').textContent = '';
        document.getElementById('hash-sha1').textContent = '';
        document.getElementById('hash-sha256').textContent = '';
        document.getElementById('hash-sha512').textContent = '';
    }
}

// ============================================
// BASE64 ENCODER/DECODER
// ============================================
function base64Encode() {
    const input = document.getElementById('base64-input').value;
    const output = document.getElementById('base64-output');
    
    if (!input.trim()) {
        showToast('Inserisci del testo da codificare', 'error');
        return;
    }
    
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        output.textContent = encoded;
        output.classList.remove('error');
        showToast('Base64 encoded!');
    } catch (e) {
        output.textContent = 'Errore durante l\'encoding';
        output.classList.add('error');
        showToast('Errore durante l\'encoding', 'error');
    }
}

function base64Decode() {
    const input = document.getElementById('base64-input').value.trim();
    const output = document.getElementById('base64-output');
    
    if (!input) {
        showToast('Inserisci una stringa Base64 da decodificare', 'error');
        return;
    }
    
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        output.textContent = decoded;
        output.classList.remove('error');
        showToast('Base64 decoded!');
    } catch (e) {
        output.textContent = 'Input Base64 non valido';
        output.classList.add('error');
        showToast('Input Base64 non valido', 'error');
    }
}

// ============================================
// URL ENCODER/DECODER
// ============================================
function urlEncode() {
    const input = document.getElementById('url-input').value;
    const output = document.getElementById('url-output');
    
    if (!input.trim()) {
        showToast('Inserisci del testo da codificare', 'error');
        return;
    }
    
    output.textContent = encodeURIComponent(input);
    showToast('URL encoded!');
}

function urlDecode() {
    const input = document.getElementById('url-input').value;
    const output = document.getElementById('url-output');
    
    if (!input.trim()) {
        showToast('Inserisci una stringa URL-encoded da decodificare', 'error');
        return;
    }
    
    try {
        output.textContent = decodeURIComponent(input);
        showToast('URL decoded!');
    } catch (e) {
        output.textContent = 'Input non valido';
        output.classList.add('error');
        showToast('Input non valido', 'error');
    }
}

// ============================================
// HTML ENTITIES ENCODER/DECODER
// ============================================
function htmlEncode() {
    const input = document.getElementById('html-input').value;
    const output = document.getElementById('html-output');
    
    if (!input.trim()) {
        showToast('Inserisci del testo da codificare', 'error');
        return;
    }
    
    const encoded = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    output.textContent = encoded;
    showToast('HTML encoded!');
}

function htmlDecode() {
    const input = document.getElementById('html-input').value;
    const output = document.getElementById('html-output');
    
    if (!input.trim()) {
        showToast('Inserisci HTML entities da decodificare', 'error');
        return;
    }
    
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    output.textContent = textarea.value;
    showToast('HTML decoded!');
}

// ============================================
// HEX / BINARY / DECIMAL CONVERTER
// ============================================
function convertFromDecimal() {
    const decimal = document.getElementById('hex-decimal').value.trim();
    if (!decimal || isNaN(decimal)) return;
    
    const num = parseInt(decimal, 10);
    document.getElementById('hex-hex').value = num.toString(16).toUpperCase();
    document.getElementById('hex-binary').value = num.toString(2);
}

function convertFromHex() {
    const hex = document.getElementById('hex-hex').value.trim();
    if (!hex || !/^[0-9A-Fa-f]+$/.test(hex)) return;
    
    const num = parseInt(hex, 16);
    document.getElementById('hex-decimal').value = num;
    document.getElementById('hex-binary').value = num.toString(2);
}

function convertFromBinary() {
    const binary = document.getElementById('hex-binary').value.trim();
    if (!binary || !/^[01]+$/.test(binary)) return;
    
    const num = parseInt(binary, 2);
    document.getElementById('hex-decimal').value = num;
    document.getElementById('hex-hex').value = num.toString(16).toUpperCase();
}

function textToHex() {
    const text = document.getElementById('hex-text').value;
    const output = document.getElementById('hex-output');
    
    if (!text) {
        showToast('Inserisci del testo', 'error');
        return;
    }
    
    const hex = Array.from(text)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    
    output.textContent = hex.toUpperCase();
    showToast('Convertito in Hex!');
}

function hexToText() {
    const input = document.getElementById('hex-text').value.trim();
    const output = document.getElementById('hex-output');
    
    if (!input) {
        showToast('Inserisci una stringa hex', 'error');
        return;
    }
    
    try {
        const hex = input.replace(/\s+/g, '');
        const text = hex.match(/.{1,2}/g)
            .map(byte => String.fromCharCode(parseInt(byte, 16)))
            .join('');
        
        output.textContent = text;
        showToast('Convertito in Text!');
    } catch (e) {
        output.textContent = 'Input hex non valido';
        output.classList.add('error');
        showToast('Input hex non valido', 'error');
    }
}

function clearHexTool() {
    document.getElementById('hex-decimal').value = '';
    document.getElementById('hex-hex').value = '';
    document.getElementById('hex-binary').value = '';
    document.getElementById('hex-text').value = '';
    document.getElementById('hex-output').textContent = '';
}

// ============================================
// JWT DECODER
// ============================================
function decodeJWT() {
    const input = document.getElementById('jwt-input').value.trim();
    const headerOut = document.getElementById('jwt-header');
    const payloadOut = document.getElementById('jwt-payload');
    const signatureOut = document.getElementById('jwt-signature');
    
    if (!input) {
        showToast('Inserisci un token JWT', 'error');
        return;
    }
    
    const parts = input.split('.');
    
    if (parts.length !== 3) {
        showToast('Token JWT non valido (deve avere 3 parti)', 'error');
        return;
    }
    
    try {
        const header = JSON.parse(atob(parts[0]));
        headerOut.textContent = JSON.stringify(header, null, 2);
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Format dates if present
        if (payload.exp) {
            payload.exp_readable = new Date(payload.exp * 1000).toLocaleString();
        }
        if (payload.iat) {
            payload.iat_readable = new Date(payload.iat * 1000).toLocaleString();
        }
        if (payload.nbf) {
            payload.nbf_readable = new Date(payload.nbf * 1000).toLocaleString();
        }
        
        payloadOut.textContent = JSON.stringify(payload, null, 2);
        signatureOut.textContent = parts[2];
        
        showToast('JWT decodificato!');
    } catch (e) {
        showToast('Errore durante la decodifica del JWT', 'error');
    }
}

// ============================================
// HASH GENERATOR
// ============================================
async function generateAllHashes() {
    const input = document.getElementById('hash-input').value;
    
    if (!input) {
        showToast('Inserisci del testo da hashare', 'error');
        return;
    }
    
    // MD5 using CryptoJS
    document.getElementById('hash-md5').textContent = CryptoJS.MD5(input).toString();
    
    // SHA hashes using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    const sha1 = await crypto.subtle.digest('SHA-1', data);
    document.getElementById('hash-sha1').textContent = arrayBufferToHex(sha1);
    
    const sha256 = await crypto.subtle.digest('SHA-256', data);
    document.getElementById('hash-sha256').textContent = arrayBufferToHex(sha256);
    
    const sha512 = await crypto.subtle.digest('SHA-512', data);
    document.getElementById('hash-sha512').textContent = arrayBufferToHex(sha512);
    
    showToast('Hash generati!');
}

function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ============================================
// PASSWORD GENERATOR
// ============================================
function updatePwdLength() {
    const length = document.getElementById('pwd-length').value;
    document.getElementById('pwd-len-display').textContent = length;
}

function generatePassword() {
    const length = parseInt(document.getElementById('pwd-length').value);
    const useUpper = document.getElementById('pwd-uppercase').checked;
    const useLower = document.getElementById('pwd-lowercase').checked;
    const useNumbers = document.getElementById('pwd-numbers').checked;
    const useSymbols = document.getElementById('pwd-symbols').checked;
    const excludeSimilar = document.getElementById('pwd-exclude-similar').checked;
    
    const output = document.getElementById('pwd-output');
    
    let charset = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    
    if (excludeSimilar) {
        upper = upper.replace(/[O]/g, '');
        lower = lower.replace(/[l]/g, '');
        numbers = numbers.replace(/[01]/g, '');
    }
    
    if (useUpper) charset += upper;
    if (useLower) charset += lower;
    if (useNumbers) charset += numbers;
    if (useSymbols) charset += symbols;
    
    if (charset.length === 0) {
        showToast('Seleziona almeno un tipo di carattere', 'error');
        return '';
    }
    
    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    output.textContent = password;
    updatePasswordStrength(password);
    
    // Clear multiple passwords
    document.getElementById('pwd-multiple').innerHTML = '';
    
    showToast('Password generata!');
    return password;
}

function generateMultiplePasswords() {
    const container = document.getElementById('pwd-multiple');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const pwd = generatePasswordSilent();
        if (pwd) {
            const item = document.createElement('div');
            item.className = 'pwd-item';
            item.innerHTML = `
                <span>${pwd}</span>
                <button onclick="copyThis(this.previousElementSibling); showToast('Copiato!');">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            container.appendChild(item);
        }
    }
    
    showToast('5 password generate!');
}

function generatePasswordSilent() {
    const length = parseInt(document.getElementById('pwd-length').value);
    const useUpper = document.getElementById('pwd-uppercase').checked;
    const useLower = document.getElementById('pwd-lowercase').checked;
    const useNumbers = document.getElementById('pwd-numbers').checked;
    const useSymbols = document.getElementById('pwd-symbols').checked;
    const excludeSimilar = document.getElementById('pwd-exclude-similar').checked;
    
    let charset = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    
    if (excludeSimilar) {
        upper = upper.replace(/[O]/g, '');
        lower = lower.replace(/[l]/g, '');
        numbers = numbers.replace(/[01]/g, '');
    }
    
    if (useUpper) charset += upper;
    if (useLower) charset += lower;
    if (useNumbers) charset += numbers;
    if (useSymbols) charset += symbols;
    
    if (charset.length === 0) return '';
    
    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    return password;
}

function updatePasswordStrength(password) {
    const fill = document.querySelector('.strength-fill');
    const text = document.getElementById('pwd-strength-text');
    
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 24) score += 1;
    
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    
    fill.className = 'strength-fill';
    text.className = 'strength-text';
    
    if (score <= 3) {
        fill.classList.add('weak');
        text.classList.add('weak');
        text.textContent = '⚠️ Debole';
    } else if (score <= 6) {
        fill.classList.add('medium');
        text.classList.add('medium');
        text.textContent = '⚡ Media';
    } else {
        fill.classList.add('strong');
        text.classList.add('strong');
        text.textContent = '🔒 Forte';
    }
}

// ============================================
// IP LOOKUP
// ============================================
async function lookupIP() {
    const input = document.getElementById('ip-input').value.trim();
    const output = document.getElementById('ip-output');
    
    output.innerHTML = '<p style="color: var(--text-muted);">Caricamento...</p>';
    
    const ip = input || '';
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            output.innerHTML = `<p style="color: #ef4444;">Errore: ${data.reason}</p>`;
            showToast('IP non trovato', 'error');
            return;
        }
        
        output.innerHTML = `
            <div class="ip-info-item">
                <div class="label">IP Address</div>
                <div class="value">${data.ip}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Città</div>
                <div class="value">${data.city || 'N/A'}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Regione</div>
                <div class="value">${data.region || 'N/A'}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Paese</div>
                <div class="value">${data.country_name || 'N/A'} (${data.country_code || ''})</div>
            </div>
            <div class="ip-info-item">
                <div class="label">ISP</div>
                <div class="value">${data.org || 'N/A'}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Timezone</div>
                <div class="value">${data.timezone || 'N/A'}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Latitudine</div>
                <div class="value">${data.latitude || 'N/A'}</div>
            </div>
            <div class="ip-info-item">
                <div class="label">Longitudine</div>
                <div class="value">${data.longitude || 'N/A'}</div>
            </div>
        `;
        
        showToast('IP lookup completato!');
    } catch (e) {
        output.innerHTML = '<p style="color: #ef4444;">Errore durante il lookup</p>';
        showToast('Errore durante il lookup', 'error');
    }
}

function getMyIP() {
    document.getElementById('ip-input').value = '';
    lookupIP();
}

// ============================================
// DNS LOOKUP
// ============================================
async function dnsLookup() {
    const domain = document.getElementById('dns-input').value.trim();
    const output = document.getElementById('dns-output');
    
    if (!domain) {
        showToast('Inserisci un dominio', 'error');
        return;
    }
    
    output.textContent = 'Caricamento...';
    
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
        const data = await response.json();
        
        let result = `Domain: ${domain}\n`;
        result += `Status: ${data.Status === 0 ? 'OK' : 'Error'}\n\n`;
        
        if (data.Answer) {
            result += 'Records:\n';
            data.Answer.forEach(record => {
                result += `  ${record.name} → ${record.data} (TTL: ${record.TTL}s)\n`;
            });
        } else {
            result += 'Nessun record trovato';
        }
        
        output.textContent = result;
        showToast('DNS lookup completato!');
    } catch (e) {
        output.textContent = 'Errore durante il DNS lookup';
        showToast('Errore durante il lookup', 'error');
    }
}

// ============================================
// SUBNET CALCULATOR
// ============================================
function calculateSubnet() {
    const ip = document.getElementById('subnet-ip').value.trim();
    const cidrInput = document.getElementById('subnet-cidr').value.trim();
    const output = document.getElementById('subnet-output');
    
    if (!ip) {
        showToast('Inserisci un indirizzo IP', 'error');
        return;
    }
    
    // Parse CIDR or subnet mask
    let cidr;
    if (cidrInput.includes('.')) {
        // Convert subnet mask to CIDR
        cidr = subnetMaskToCIDR(cidrInput);
    } else {
        cidr = parseInt(cidrInput) || 24;
    }
    
    if (cidr < 0 || cidr > 32) {
        showToast('CIDR deve essere tra 0 e 32', 'error');
        return;
    }
    
    try {
        const ipParts = ip.split('.').map(Number);
        if (ipParts.length !== 4 || ipParts.some(p => p < 0 || p > 255)) {
            throw new Error('IP non valido');
        }
        
        const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
        const network = (ipInt & mask) >>> 0;
        const broadcast = (network | ~mask) >>> 0;
        const firstHost = cidr === 32 ? network : (network + 1) >>> 0;
        const lastHost = cidr === 32 ? network : (broadcast - 1) >>> 0;
        const totalHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
        
        output.innerHTML = `
            <div class="subnet-info-item">
                <div class="label">Network Address</div>
                <div class="value">${intToIP(network)}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">Broadcast Address</div>
                <div class="value">${intToIP(broadcast)}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">Subnet Mask</div>
                <div class="value">${intToIP(mask)}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">CIDR Notation</div>
                <div class="value">/${cidr}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">First Host</div>
                <div class="value">${intToIP(firstHost)}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">Last Host</div>
                <div class="value">${intToIP(lastHost)}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">Total Hosts</div>
                <div class="value">${totalHosts.toLocaleString()}</div>
            </div>
            <div class="subnet-info-item">
                <div class="label">Wildcard Mask</div>
                <div class="value">${intToIP(~mask >>> 0)}</div>
            </div>
        `;
        
        showToast('Subnet calcolata!');
    } catch (e) {
        output.innerHTML = '<p style="color: #ef4444;">Errore: IP o CIDR non valido</p>';
        showToast('Input non valido', 'error');
    }
}

function subnetMaskToCIDR(mask) {
    const parts = mask.split('.').map(Number);
    let cidr = 0;
    for (const part of parts) {
        cidr += (part >>> 0).toString(2).split('1').length - 1;
    }
    return cidr;
}

function intToIP(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join('.');
}

// ============================================
// HTTP HEADERS CHECKER
// ============================================
async function checkHeaders() {
    const url = document.getElementById('headers-input').value.trim();
    const output = document.getElementById('headers-output');
    
    if (!url) {
        showToast('Inserisci un URL', 'error');
        return;
    }
    
    output.textContent = 'Caricamento...';
    
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
        
        let result = `URL: ${url}\nStatus: ${response.status} ${response.statusText}\n\nHeaders:\n`;
        
        response.headers.forEach((value, key) => {
            result += `  ${key}: ${value}\n`;
        });
        
        output.textContent = result;
        showToast('Headers recuperati!');
    } catch (e) {
        output.textContent = `Errore: Impossibile recuperare gli headers.\nCausa probabile: CORS policy o URL non raggiungibile.`;
        showToast('Errore nel recupero headers', 'error');
    }
}

// ============================================
// TIMESTAMP CONVERTER
// ============================================
function initTimestamp() {
    updateCurrentTimestamp();
    setInterval(updateCurrentTimestamp, 1000);
    
    // Set current datetime in the datetime-local input
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.getElementById('ts-human').value = localDateTime;
}

function updateCurrentTimestamp() {
    const el = document.getElementById('current-timestamp');
    if (el) {
        el.textContent = Math.floor(Date.now() / 1000);
    }
}

function convertFromUnix() {
    const unix = document.getElementById('ts-unix').value.trim();
    const output = document.getElementById('timestamp-output');
    
    if (!unix) {
        showToast('Inserisci un timestamp Unix', 'error');
        return;
    }
    
    const timestamp = parseInt(unix);
    const date = new Date(timestamp * 1000);
    
    if (isNaN(date.getTime())) {
        output.textContent = 'Timestamp non valido';
        showToast('Timestamp non valido', 'error');
        return;
    }
    
    output.innerHTML = `
        <strong>Local:</strong> ${date.toLocaleString()}<br>
        <strong>UTC:</strong> ${date.toUTCString()}<br>
        <strong>ISO:</strong> ${date.toISOString()}
    `;
    
    showToast('Timestamp convertito!');
}

function convertToUnix() {
    const human = document.getElementById('ts-human').value;
    const output = document.getElementById('timestamp-output');
    
    if (!human) {
        showToast('Seleziona una data', 'error');
        return;
    }
    
    const date = new Date(human);
    const unix = Math.floor(date.getTime() / 1000);
    
    output.innerHTML = `
        <strong>Unix Timestamp:</strong> ${unix}<br>
        <strong>Milliseconds:</strong> ${date.getTime()}
    `;
    
    document.getElementById('ts-unix').value = unix;
    showToast('Convertito in Unix timestamp!');
}

// ============================================
// REGEX TESTER
// ============================================
function testRegex() {
    const pattern = document.getElementById('regex-pattern').value;
    const flags = document.getElementById('regex-flags').value;
    const input = document.getElementById('regex-input').value;
    const output = document.getElementById('regex-output');
    const highlighted = document.getElementById('regex-highlighted');
    
    if (!pattern) {
        showToast('Inserisci un pattern regex', 'error');
        return;
    }
    
    try {
        const regex = new RegExp(pattern, flags);
        const matches = input.match(regex);
        
        if (matches) {
            output.innerHTML = `<strong>Matches trovati: ${matches.length}</strong><br><br>` + 
                matches.map((m, i) => `[${i}]: "${m}"`).join('<br>');
            
            // Highlight matches
            let highlightedText = input;
            if (!flags.includes('g')) {
                highlightedText = input.replace(regex, '<span class="match">$&</span>');
            } else {
                highlightedText = input.replace(regex, '<span class="match">$&</span>');
            }
            highlighted.innerHTML = highlightedText;
            
            showToast(`${matches.length} match trovati!`);
        } else {
            output.textContent = 'Nessun match trovato';
            highlighted.textContent = input;
            showToast('Nessun match', 'error');
        }
    } catch (e) {
        output.textContent = `Errore: ${e.message}`;
        highlighted.textContent = input;
        showToast('Regex non valida', 'error');
    }
}

// ============================================
// URL PARSER
// ============================================
function parseURL() {
    const input = document.getElementById('urlparser-input').value.trim();
    const output = document.getElementById('urlparser-output');
    
    if (!input) {
        showToast('Inserisci un URL', 'error');
        return;
    }
    
    try {
        const url = new URL(input);
        
        let paramsHTML = '';
        url.searchParams.forEach((value, key) => {
            paramsHTML += `<div class="url-part"><span class="label">  ${key}</span><span class="value">${value}</span></div>`;
        });
        
        output.innerHTML = `
            <div class="url-part"><span class="label">Protocol</span><span class="value">${url.protocol}</span></div>
            <div class="url-part"><span class="label">Username</span><span class="value">${url.username || '—'}</span></div>
            <div class="url-part"><span class="label">Password</span><span class="value">${url.password || '—'}</span></div>
            <div class="url-part"><span class="label">Hostname</span><span class="value">${url.hostname}</span></div>
            <div class="url-part"><span class="label">Port</span><span class="value">${url.port || '(default)'}</span></div>
            <div class="url-part"><span class="label">Pathname</span><span class="value">${url.pathname}</span></div>
            <div class="url-part"><span class="label">Search</span><span class="value">${url.search || '—'}</span></div>
            ${paramsHTML ? '<div class="url-part"><span class="label">Params:</span><span class="value"></span></div>' + paramsHTML : ''}
            <div class="url-part"><span class="label">Hash</span><span class="value">${url.hash || '—'}</span></div>
            <div class="url-part"><span class="label">Origin</span><span class="value">${url.origin}</span></div>
        `;
        
        showToast('URL parsed!');
    } catch (e) {
        output.innerHTML = '<p style="color: #ef4444;">URL non valido</p>';
        showToast('URL non valido', 'error');
    }
}

// ============================================
// STRING UTILITIES
// ============================================
function updateStringStats() {
    const input = document.getElementById('string-input').value;
    const stats = document.getElementById('string-stats');
    
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const bytes = new Blob([input]).size;
    
    stats.innerHTML = `
        <span>Caratteri: <strong>${chars}</strong></span>
        <span>Parole: <strong>${words}</strong></span>
        <span>Righe: <strong>${lines}</strong></span>
        <span>Bytes: <strong>${bytes}</strong></span>
    `;
}

function stringUppercase() {
    const input = document.getElementById('string-input').value;
    document.getElementById('string-output').textContent = input.toUpperCase();
    showToast('Convertito in UPPERCASE!');
}

function stringLowercase() {
    const input = document.getElementById('string-input').value;
    document.getElementById('string-output').textContent = input.toLowerCase();
    showToast('Convertito in lowercase!');
}

function stringCapitalize() {
    const input = document.getElementById('string-input').value;
    const result = input.replace(/\b\w/g, char => char.toUpperCase());
    document.getElementById('string-output').textContent = result;
    showToast('Capitalize applicato!');
}

function stringReverse() {
    const input = document.getElementById('string-input').value;
    document.getElementById('string-output').textContent = input.split('').reverse().join('');
    showToast('Stringa invertita!');
}

function stringTrim() {
    const input = document.getElementById('string-input').value;
    document.getElementById('string-output').textContent = input.trim();
    showToast('Trim applicato!');
}

function stringRemoveSpaces() {
    const input = document.getElementById('string-input').value;
    document.getElementById('string-output').textContent = input.replace(/\s+/g, '');
    showToast('Spazi rimossi!');
}
