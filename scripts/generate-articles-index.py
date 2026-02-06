#!/usr/bin/env python3
"""
Script per generare articles.json dai file Markdown nella cartella articles/
Legge il frontmatter YAML di ogni file .md e crea un indice JSON.

Uso: python scripts/generate-articles-index.py
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

# Configurazione
ARTICLES_DIR = Path("articles")
OUTPUT_FILE = Path("data/articles.json")

def parse_frontmatter(content: str) -> tuple[dict, str]:
    """
    Estrae il frontmatter YAML dal contenuto Markdown.
    Ritorna (metadata_dict, body_content)
    """
    frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(frontmatter_pattern, content, re.DOTALL)
    
    if not match:
        return {}, content
    
    yaml_content = match.group(1)
    body = match.group(2)
    
    # Parse YAML semplice (senza dipendenza esterna per casi base)
    metadata = {}
    current_key = None
    current_list = None
    
    for line in yaml_content.split('\n'):
        line = line.rstrip()
        if not line or line.startswith('#'):
            continue
            
        # Gestione liste YAML
        if line.startswith('  - ') and current_key:
            if current_list is None:
                current_list = []
            current_list.append(line[4:].strip().strip('"').strip("'"))
            metadata[current_key] = current_list
            continue
        
        # Reset lista
        if not line.startswith('  '):
            current_list = None
        
        # Parse key: value
        if ':' in line:
            key, _, value = line.partition(':')
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            if value == '' or value == '[]':
                current_key = key
                metadata[key] = []
            elif value.startswith('[') and value.endswith(']'):
                # Inline list: tags: [tag1, tag2]
                items = value[1:-1].split(',')
                metadata[key] = [item.strip().strip('"').strip("'") for item in items if item.strip()]
                current_key = None
            else:
                metadata[key] = value
                current_key = key
    
    return metadata, body


def estimate_read_time(content: str) -> str:
    """Stima il tempo di lettura basato sul numero di parole (200 wpm)."""
    words = len(content.split())
    minutes = max(1, round(words / 200))
    return f"{minutes} min"


def extract_description(body: str, max_length: int = 160) -> str:
    """Estrae una descrizione dal corpo dell'articolo se non specificata."""
    # Rimuovi markdown headers, links, code blocks
    clean = re.sub(r'^#+\s+.*$', '', body, flags=re.MULTILINE)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
    clean = re.sub(r'```[\s\S]*?```', '', clean)
    clean = re.sub(r'`[^`]+`', '', clean)
    clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean)
    clean = re.sub(r'\*([^*]+)\*', r'\1', clean)
    clean = re.sub(r'\n+', ' ', clean)
    clean = clean.strip()
    
    if len(clean) > max_length:
        clean = clean[:max_length-3] + '...'
    
    return clean


def process_article(filepath: Path) -> dict | None:
    """Processa un singolo file Markdown e ritorna i metadati."""
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f"  ⚠️  Errore lettura {filepath}: {e}")
        return None
    
    metadata, body = parse_frontmatter(content)
    
    # Campi obbligatori
    if 'title' not in metadata:
        print(f"  ⚠️  {filepath.name}: manca 'title' nel frontmatter, skip")
        return None
    
    # Genera ID dal nome file
    article_id = filepath.stem  # nome-articolo da nome-articolo.md
    
    # Costruisci oggetto articolo
    article = {
        'id': article_id,
        'title': metadata.get('title', ''),
        'description': metadata.get('description', extract_description(body)),
        'category': metadata.get('category', 'Uncategorized'),
        'date': metadata.get('date', datetime.now().strftime('%Y-%m-%d')),
        'readTime': metadata.get('readTime', estimate_read_time(body)),
        'author': metadata.get('author', 'CybersecurityZen'),
        'image': metadata.get('image', ''),
        'tags': metadata.get('tags', []),
        'url': f"articles/{article_id}.md",
        'draft': metadata.get('draft', 'false').lower() == 'true'
    }
    
    return article


def main():
    print("🔍 Scanning articles directory...")
    
    # Crea cartella data se non esiste
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Trova tutti i file .md
    if not ARTICLES_DIR.exists():
        print(f"  📁 Creazione cartella {ARTICLES_DIR}")
        ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
    
    md_files = list(ARTICLES_DIR.glob("*.md"))
    print(f"  📄 Trovati {len(md_files)} file Markdown")
    
    articles = []
    categories = set()
    
    for filepath in md_files:
        print(f"  → Processando: {filepath.name}")
        article = process_article(filepath)
        
        if article and not article['draft']:
            articles.append(article)
            categories.add(article['category'])
            print(f"    ✅ {article['title']}")
        elif article and article['draft']:
            print(f"    ⏸️  Draft, ignorato")
    
    # Ordina per data (più recenti prima)
    articles.sort(key=lambda x: x['date'], reverse=True)
    
    # Costruisci output JSON
    output = {
        'lastUpdated': datetime.now().isoformat(),
        'totalArticles': len(articles),
        'categories': sorted(list(categories)),
        'articles': articles
    }
    
    # Scrivi JSON
    OUTPUT_FILE.write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding='utf-8'
    )
    
    print(f"\n✅ Generato {OUTPUT_FILE}")
    print(f"   📊 {len(articles)} articoli in {len(categories)} categorie")


if __name__ == "__main__":
    main()
