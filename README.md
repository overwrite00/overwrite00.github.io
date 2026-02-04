# 🛡️ CybersecurityZen

Un sito personale dedicato alla cybersecurity con blog, tools interattivi e integrazione GitHub.

## 📂 Struttura del Progetto

```
site/
├── index.html          # Homepage
├── blog.html           # Pagina lista articoli
├── tools.html          # Pagina strumenti cybersecurity
├── css/
│   ├── style.css       # Stili principali
│   └── tools.css       # Stili specifici per i tools
├── js/
│   ├── main.js         # JavaScript principale
│   ├── github-api.js   # Integrazione GitHub API
│   ├── tools.js        # Quick tools homepage
│   └── tools-full.js   # Tools completi
├── articles/
│   └── TEMPLATE.html   # Template per nuovi articoli
└── assets/
    └── images/         # Immagini (da creare)
```

## 🚀 Deployment su GitHub Pages

### 1. Crea il Repository

1. Vai su [github.com](https://github.com) e accedi con l'account **overwrite00**
2. Clicca su **New repository**
3. Nome repository: `overwrite00.github.io`
4. Seleziona **Public**
5. Clicca **Create repository**

### 2. Carica i File

**Metodo 1: Upload diretto (più semplice)**
1. Nel repository appena creato, clicca su **uploading an existing file**
2. Trascina TUTTI i file e cartelle di questo progetto
3. Scrivi un commit message: "Initial commit"
4. Clicca **Commit changes**

**Metodo 2: Git da terminale**
```bash
git clone https://github.com/overwrite00/overwrite00.github.io.git
# Copia tutti i file nella cartella
cd overwrite00.github.io
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Attiva GitHub Pages

1. Vai in **Settings** → **Pages**
2. Source: seleziona **main** branch
3. Folder: **/ (root)**
4. Clicca **Save**

### 4. Verifica

Dopo qualche minuto, il sito sarà online su:
**https://overwrite00.github.io**

---

## 📝 Come Aggiungere un Nuovo Articolo

### 1. Crea il file HTML

1. Copia `articles/TEMPLATE.html`
2. Rinomina in `articles/nome-articolo.html`
3. Modifica:
   - Titolo nella `<title>`
   - Meta description e keywords
   - Contenuto dell'articolo

### 2. Aggiungi l'articolo alla lista

In `blog.html`, trova l'array `allArticles` e aggiungi:

```javascript
const allArticles = [
    {
        id: 'nome-articolo',
        title: 'Titolo del tuo articolo',
        description: 'Descrizione breve dell\'articolo...',
        category: 'Tutorial',  // o altra categoria
        date: '2026-02-04',
        readTime: '5 min',
        image: 'assets/images/nome-articolo.jpg',  // opzionale
        url: 'articles/nome-articolo.html',
        tags: ['tag1', 'tag2']
    },
    // ... altri articoli
];
```

### 3. Mostra in Homepage

In `js/main.js`, trova l'array `articlesData` e aggiungi lo stesso oggetto per visualizzarlo in homepage.

---

## 🔧 Tools Disponibili

### Encoding/Decoding
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- HTML Entities Encoder/Decoder
- Hex/Binary/Decimal Converter
- JWT Decoder

### Hash & Crypto
- Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- Password Generator

### Network
- IP Address Lookup
- DNS Lookup
- Subnet Calculator
- HTTP Headers Checker

### Utilities
- Timestamp Converter
- Regex Tester
- URL Parser
- String Utilities

---

## 🎨 Personalizzazione

### Colori (in `css/style.css`)

```css
:root {
    --primary: #00f0ff;           /* Colore principale (cyan) */
    --secondary: #7b2dff;         /* Colore secondario (viola) */
    --accent-green: #00ff88;      /* Accento verde */
    --bg-primary: #030308;        /* Sfondo principale */
    --text-primary: #e8e8f0;      /* Testo principale */
}
```

### Altre Palette Suggerite

**Matrix Green:**
```css
--primary: #00ff00;
--secondary: #39ff14;
```

**Red Team:**
```css
--primary: #ff0040;
--secondary: #ff4444;
```

---

## 📱 Responsive

Il sito è completamente responsive:
- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (<768px)

---

## 🔗 Link Utili

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [Google Fonts](https://fonts.google.com)

---

## 📄 Licenza

Questo progetto è rilasciato per uso personale. Sentiti libero di modificarlo e personalizzarlo!

---

**Creato con 💻 da CybersecurityZen**
